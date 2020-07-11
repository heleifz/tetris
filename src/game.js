'use strict'

import css from './assets/style.css'
import skinImg from "./assets/img/lego-3.png"
import {loadImage} from "./util.js"

import {JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock} from "./block.js"
import {formatDate, shuffle, msToTime } from "./util.js"

// import {clearLineAnimation, highlightAnimation, hardDropAnimation, gameOverAnimation} from "./animation.js"

import {KeyBoardInput, TouchInput} from "./input.js"
import { DefaultScoreRule } from "./score-rule.js"
import { DefaultGameSound } from './sound.js'

import { BlockField } from './sprites/block-field.js'
import { Panel } from './sprites/panel.js'
import { Canvas } from './canvas.js'
import { constants } from './constants.js'
import { Board } from './sprites/board.js'
import { BlockPanel } from './sprites/block-panel.js'


// 游戏布局配置
const globalConfig = {
    lockDelay: 500, // lock delay 毫秒数
}

class Game {

    constructor(config) {

        this.candidates = [JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock]
        this.state = "begin"
        // this.animations = []
        this.inputs = []
        // this.afterPause = null

        // this.lastAction = null
        // this.block = null
        this.nextBlocks = []
        this.hold = null
        this.holdTime = 0
        // this.stack = null

        this.scoreRule = new DefaultScoreRule(1)

        this.beginTime = null
        this.endTime = null

        this.config = config
        this.storage = window.localStorage
        this.canvas = new Canvas()
        this.sound = new DefaultGameSound()

        this.sprites = []
        this.blockField = null
    }


    installInput(inputMethod) {
        const that = this
        inputMethod.install(function (action) {
            that.control(action) 
        })
        this.inputs.push(inputMethod)
    }

    getScoreRank() {
        let scores = this.storage.getItem("score_rank")
        if (scores == null) {
            return []
        }
        return JSON.parse(scores)
    }

    addToScoreRank(score, useTime, clearLine) {
        let rank = this.getScoreRank()
        let playedAt = formatDate(new Date())
        rank.push({
            score: score, 
            useTime: useTime,
            clearLine: clearLine,
            playedAt: playedAt
        })
        // 按 score 排序取前 10
        rank.sort((a,b) => (a.score > b.score || (a.score == b.score && a.playedAt > b.playedAt)) ? -1 : 
                            ((b.score > a.score || (a.score == b.score && b.playedAt > a.playedAt)) ? 1 : 0))
        if (rank.length > 10) {
            rank = rank.slice(0, 10)
        }
        this.storage.setItem("score_rank", JSON.stringify(rank))
    }

    relocateSprites() {
        const viewport = this.canvas.getViewPort()
        this.canvas.clearAll()
        const gameRatio = Math.round(constants.cols * 1.4) / constants.rows
        let blockSize
        let verticalScreen = false
        if (viewport.height * gameRatio < viewport.width) {
            blockSize = Math.round(viewport.height * 0.95 / constants.rows)
        } else {
            blockSize = Math.round(0.95 * viewport.width / 1.4 / constants.cols)
            verticalScreen = true
        }
        // 绘制方块到虚拟 canvas 上
        let vcanvas = this.canvas.getVirtualCanvas()
        vcanvas.height = blockSize
        vcanvas.width = blockSize * constants.colors
        vcanvas.getContext('2d').drawImage(this.blockImage, 0, 0, blockSize * constants.colors, blockSize)

        const gameWidth = blockSize * constants.cols
        const gameHeight = blockSize * constants.rows
        const gameX = Math.round((viewport.width - gameWidth * 1.4) / 2)
        let gameY
        if (verticalScreen && viewport.isTouch) {
            gameY = Math.round((viewport.height - gameHeight) / 7)
        } else {
            gameY = Math.round((viewport.height - gameHeight) / 2)
        }

        // 游戏界面
        this.board = new Board(gameX, gameY, gameWidth, gameHeight, blockSize, this.canvas.getUiContext()) 
        if (this.blockField == null) {
            this.blockField = new BlockField(gameX, gameY, blockSize, this.canvas.getSpriteContext(), vcanvas)
        } else {
            this.blockField.relocate(gameX, gameY, blockSize, vcanvas)
        }

        // 预览窗格
        const titleHeight = Math.round(gameHeight / 30)
        const titleX = gameX + gameWidth
        const titleWidth = Math.round(gameWidth * 0.4)
        const previewY = gameY
        const previewHeight = Math.round(viewport.height * 0.33)
        this.previewPanel = new BlockPanel(titleX, previewY, titleWidth, previewHeight + titleHeight, titleHeight, "next",
                                           this.nextBlocks, vcanvas, blockSize, this.canvas.getUiContext(), this.canvas.getSpriteContext())

        // // 分数
        const scoreY = previewY + titleHeight + previewHeight
        const statsHeight = Math.round(viewport.height * 0.05) 
        this.scorePanel = new Panel(titleX, scoreY, titleWidth, statsHeight + titleHeight, titleHeight, "score", this.scoreRule.score, 
                                    this.canvas.getUiContext(), this.canvas.getSpriteContext())
        // // 行数
        const clearLineY = scoreY + titleHeight + statsHeight
        this.clearLinePanel = new Panel(titleX, clearLineY, titleWidth, statsHeight + titleHeight, titleHeight, "lines", this.scoreRule.lineCount, 
                                        this.canvas.getUiContext(), this.canvas.getSpriteContext())
        // // 时间
        const timeY = clearLineY + titleHeight + statsHeight
        this.timePanel = new Panel(titleX, timeY, titleWidth, statsHeight + titleHeight, titleHeight, "time", this.getUsedTime(), 
                                   this.canvas.getUiContext(), this.canvas.getSpriteContext())
        // 悔棋
        const regretY = timeY + statsHeight + titleHeight
        this.regretPanel = new Panel(titleX, regretY, titleWidth, statsHeight + titleHeight, titleHeight, "regret", this.scoreRule.regretCount, 
                                     this.canvas.getUiContext(), this.canvas.getSpriteContext())

        const holdY = regretY + statsHeight + titleHeight
        const holdHeight = Math.round(viewport.height * 0.15)
        this.holdPanel = new BlockPanel(titleX, holdY, titleWidth, holdHeight + titleHeight, titleHeight, "hold",
                                        this.hold == null ? [] : [this.hold], vcanvas, blockSize, 
                                        this.canvas.getUiContext(), this.canvas.getSpriteContext())
        this.sprites = [
            this.blockField, 
            this.board, 
            this.scorePanel,
            this.clearLinePanel,
            this.timePanel,
            this.regretPanel,
            this.previewPanel,
            this.holdPanel,
        ]
    }
    
    drawSprites() {
        for (let s of this.sprites) {
            s.draw()
        }
    }

    getUsedTime() {
        let useTime = 0
        if (this.beginTime !== null && this.endTime == null) {
            let currentTime = Date.now()
            useTime = currentTime - this.beginTime
        } else if (this.endTime != null) {
            useTime = this.endTime - this.beginTime
        }
        return msToTime(useTime)
    }

    run() {
        this.resetFallTimer()
        const that = this;
        function redraw() {
            that.timePanel.setContent(that.getUsedTime())
            that.drawSprites()
            // that.doAnimation()  
            requestAnimationFrame(redraw)
        }
        redraw()
    }

    // doAnimation() {
    //     this.render.clearAnimation()
    //     let newAnimation = []
    //     for (let i = 0; i < this.animations.length; ++i) {
    //         const animation = this.animations[i]
    //         const runResult = animation(this) 
    //         if (runResult !== null) {
    //             newAnimation.push(animation)
    //         }
    //     }
    //     this.animations = newAnimation
    // }

    stopFallTimer() {
        clearTimeout(this.fallTimerId)
    }
    
    resetFallTimer() {
        this.stopFallTimer()
        const speed = this.scoreRule.dropSpeed()
        const that = this;
        this.fallTimerId = setTimeout(function () {
            that.stateMachine("fall")
            that.resetFallTimer()
        }, speed)
    }

    newDrop() {
        this.state = "restart"
        const that = this
        setTimeout(function () {
            that.stateMachine("fall")
        }, 150)
    }

    lockBlock() {
        for (let inp of this.inputs) {
            inp.onGameEvent("lockblock")
        }
        this.stopFallTimer()
        // // 高亮锁定块
        // let positions = this.block.positions(this.position[0], this.position[1], this.rotation)
        // this.animations.push(highlightAnimation(positions))
        // for (let i = 0; i < positions.length; ++i) {
        //     this.stack[positions[i][0]][positions[i][1]] = this.block.style
        // }
        // this.block = null
        this.blockField.lockBlock()
        // 看是否能消除
        const clearResult = this.blockField.getFullLines()
        if (clearResult[0].length > 0) {
            // this.state = "pause_game"
            this.sound.play("clear_line")
            // this.animations.push(clearLineAnimation(clearResult[0]))
            // this.afterPause = function () {
                this.scoreRule.onClearLine(clearResult[0].length, clearResult[1], this.blockField.TSpin())
                this.blockField.clearLines(clearResult[0])
                this.scorePanel.setContent(this.scoreRule.score)
                this.clearLinePanel.setContent(this.scoreRule.lineCount)
                this.regretPanel.setContent(this.scoreRule.regretCount)
                this.newDrop()
            // }
        } else {
            this.scoreRule.onLock(this.blockField.TSpin())
            this.scorePanel.setContent(this.scoreRule.score)
            this.newDrop()
        }
    }

    resetDelayTimer() {
        clearTimeout(this.lockDelayTimer)
        const that = this
        this.lockDelayTimer = setTimeout(function () {
            if (that.blockField.cannotFall()) {
                that.lockBlock()
            }
        }, this.config.lockDelay)
    }

    pickBlock() {
        if (this.randomBlocks.length == 0) {
            for (let i in this.candidates) {
                this.randomBlocks.push(this.candidates[i])
            }
            shuffle(this.randomBlocks)
        }
        return this.randomBlocks.shift()
    }

    stateMachine(action) {
        if (this.state == "begin") {
            this.scoreRule.reset()
            this.randomBlocks = []
            this.hold = null
            this.holdTime = 0
            this.state = "dropping"
            this.beginTime = Date.now()
            this.endTime = null

            this.blockField.spawnNewBlock(this.pickBlock())
            this.nextBlocks = [this.pickBlock(), this.pickBlock(), this.pickBlock()]

            this.previewPanel.setBlocks(this.nextBlocks)
            this.holdPanel.setBlocks([])
            this.resetDelayTimer()

        } else if (this.state == "dropping" && action != 'hold' && action != 'regret') {
            let dropType = null
            if (action == "down") {
                dropType = 'soft'
            } else if (action == "hard_drop") {
                dropType = "hard"
            }
            if (action == "fall") {
                action = "down" 
            }
            const moveResult = this.blockField.move(action)
            if (moveResult.moveType != 'stuck') {
                this.resetDelayTimer()
                // this.lastAction = action
                if ((action == "down" && dropType == null) || (this.blockField.currentBlock() == OBlock && action == "clockwise")) {
                    
                } else {
                    this.sound.play(action)
                }
            }
            this.scoreRule.onDrop(moveResult.dropStep, dropType)
            this.scorePanel.setContent(this.scoreRule.score)
            if (action == "hard_drop") {
                // let positions = this.block.positions(this.position[0], this.position[1], this.rotation)
                // this.animations.push(hardDropAnimation(positions, this.render))
                this.lockBlock()
            }
        } else if (this.state == "dropping" && action == 'hold') {
            if (this.holdTime == 0) {
                let swapBlock
                if (this.hold == null) {
                    this.hold = this.blockField.currentBlock()
                    swapBlock = this.nextBlocks.shift()
                    this.nextBlocks.push(this.pickBlock())
                    this.previewPanel.setBlocks(this.nextBlocks)
                    this.holdPanel.setBlocks([this.hold])
                } else {
                    let tmp = this.blockField.currentBlock()
                    swapBlock = this.hold
                    this.hold = tmp
                    this.holdPanel.setBlocks([this.hold])
                }
                this.blockField.spawnNewBlock(swapBlock)
                this.resetDelayTimer()
                this.holdTime = 1
            } else {
                console.log("cannot hold two times")
            }
        } else if (this.state == "dropping" && action == 'regret') {
            if (this.scoreRule.regret()) {
                this.blockField.spawnNewBlock(this.blockField.currentBlock())
                this.resetDelayTimer()
                this.regretPanel.setContent(this.scoreRule.regretCount)
            } else {
                console.log("cannot regret")
            }
        } else if (this.state == "restart") {
            // 初始化方块
            this.resetDelayTimer()
            this.resetFallTimer()
            this.holdTime = 0
            this.nextBlocks.push(this.pickBlock())
            if (!this.blockField.spawnNewBlock(this.nextBlocks.shift())) {
                this.state = "over"
                this.stateMachine("over")
            } else {
                this.previewPanel.setBlocks(this.nextBlocks)
                // 在游戏 restart 时，如果发生移动按键，马上产生效果，保证操作感够灵敏
                this.state = "dropping"
                if (action != "fall") {
                    this.stateMachine(action)
                }
            }
        } else if (this.state == "over") {
            if (action == "over") {
                this.blockField.clearAll()
                // this.endTime = Date.now()
                // let allLines = []
                // for (let i = 0; i < this.stack.length; ++i) {
                //     allLines.push(i)
                // }
                // this.addToScoreRank(this.scoreRule.score, msToTime(this.endTime - this.beginTime), this.scoreRule.lineCount)
                // this.state = "pause_game"
                // this.animations.push(gameOverAnimation())
                // this.animations.push(clearLineAnimation(allLines))
                // this.afterPause = function() {
                //     this.state = "over"
                //     this.stack = this.createEmptyStack()
                // }
            } else if (action != "fall") {
                // this.animations = []
                // this.render.clearAnimation()
                this.state = "begin"
            } 
        } else if (this.state == "pause_game") {
            return
        }
    }

    control(action) {
        let validAction = {
            left: 1, right: 1, down: 1, clockwise: 1, counter_clockwise: 1,
            hard_drop: 1, hold: 1, regret: 1
        }
        this.sound.playBgmAtFirstTime(this.scoreRule.level)
        if ((action in validAction)) {
            this.stateMachine(action)
        }
    }

    async loadImages() {
        this.blockImage = await loadImage(skinImg)
    }

    async loadResource() {
        return Promise.all([this.loadImages(), this.sound.loadResource()])
    }
}


window.addEventListener("load", function () {
    let game = new Game(globalConfig)
    // 初始化 UI
    game.loadResource().then(function () {
        game.relocateSprites()
        // 键盘和触控输入
        game.installInput(new KeyBoardInput()) 
        game.installInput(new TouchInput()) 
        game.run()
    })
    window.addEventListener("resize", function() { 
        game.relocateSprites()
    });
})