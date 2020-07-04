'use strict'

import rotateSound from "./assets/sound/rotate.wav"
import moveSound from "./assets/sound/move.wav"
import dropSound from "./assets/sound/drop.wav"
import clearSound from "./assets/sound/clear.wav"
import bgmSound from "./assets/sound/bgm.mp3"
import css from './assets/style.css'

import {JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock} from "./block.js"
import {formatDate, shuffle, msToTime } from "./util.js"
import {clearLineAnimation, highlightAnimation, hardDropAnimation, gameOverAnimation} from "./animation.js"
import Render from "./render.js"
import {KeyBoardInput, TouchInput} from "./input.js"
import { DefaultScoreRule } from "./score-rule.js"

// 游戏布局配置
const globalConfig = {
    lines: 22, // 俄罗斯方块行数 
    columnSize: 10,
    lockDelay: 500, // lock delay 毫秒数
    preview: true // 下坠预览
}
let uiCanvas = document.getElementById("ui");
let canvas = document.getElementById("game");
let animationCanvas = document.getElementById("animation");
let gamePadCanvas = document.getElementById("gamepad");

class Game {

    constructor(animationCanvas, uiCanvas, canvas, gamePadCanvas, config, storage) {
        this.candidates = [JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock]
        this.config = config
        this.render = new Render(animationCanvas, uiCanvas, canvas, gamePadCanvas, config)
        this.state = "begin"
        this.animations = []
        this.inputs = []
        this.afterPause = null

        this.lastAction = null
        this.block = null
        this.nextBlocks = []
        this.hold = null
        this.holdTime = 0
        this.stack = null

        this.scoreRule = null

        this.beginTime = null
        this.endTime = null
        this.storage = storage

        window.AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext()
        this.bgmReady = false
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

    initializeUI() {
        this.render.recalculate() 
        this.render.drawUI()
        return this
    }
    
    createEmptyStack(showLines) {
        let stack = []
        for (let i = 0; i < this.config.lines + 2; i++) {
            let current = []
            for (let j = 0; j < this.config.columnSize; ++j) {
                current.push(null);
            }
            stack.push(current);
        }
        return stack
    }

    setRule(scoreRule) {
        this.scoreRule = scoreRule
    }

    run() {
        this.resetFallTimer()
        const that = this;
        function redraw() {
            that.drawAllElements()
            that.doAnimation()  
            requestAnimationFrame(redraw)
        }
        redraw()
    }

    doAnimation() {
        this.render.clearAnimation()
        let newAnimation = []
        for (let i = 0; i < this.animations.length; ++i) {
            const animation = this.animations[i]
            const runResult = animation(this) 
            if (runResult !== null) {
                newAnimation.push(animation)
            }
        }
        this.animations = newAnimation
    }

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
        this.block = null
        const that = this
        setTimeout(function () {
            that.stateMachine("fall")
        }, 150)
    }

    TSpinType() {
        if (this.block != TBlock) {
            return null
        }
        if (this.lastAction != "clockwise" && this.lastAction != "counter_clockwise") {
            return null
        }
        let corners = [
            this.position,
            [this.position[0] + 2, this.position[1]],
            [this.position[0], this.position[1] + 2],
            [this.position[0] + 2, this.position[1] + 2],
        ]
        let occupyCount = 0
        for (let c of corners) {
            // wall kick 不算
            if (c[0] < 0 || c[0] >= this.stack.length) {
                continue
            }
            if (c[1] < 0 || c[1] >= this.config.columnSize) {
                continue
            }
            if (this.stack[c[0]][c[1]] != null) {
                occupyCount += 1
            } 
        }
        if (occupyCount >= 3) {
            return 1
        }
        return null
    }

    lockBlock() {
        if (this.block == null) {
            return
        }
        for (let inp of this.inputs) {
            inp.onGameEvent("lockblock")
        }
        this.stopFallTimer()
        // 高亮锁定块
        let positions = this.block.positions(this.position[0], this.position[1], this.rotation)
        this.animations.push(highlightAnimation(positions))
        for (let i = 0; i < positions.length; ++i) {
            this.stack[positions[i][0]][positions[i][1]] = this.block.style
        }
        this.block = null
        // 看是否能消除
        const clearResult = this.clearLines()
        const tspin = this.TSpinType()
        if (clearResult[0].length > 0) {
            this.state = "pause_game"
            this.playAudioBuffer(this.audio["clear_line"], 0.2)
            this.animations.push(clearLineAnimation(clearResult[0]))
            this.afterPause = function () {
                this.scoreRule.onClearLine(clearResult[0].length, clearResult[2], tspin)
                this.stack = clearResult[1]
                this.newDrop()
            }
        } else {
            this.scoreRule.onLock(tspin)
            this.newDrop()
        }
    }

    clearLines() {
        let cleared = []
        let newStack = this.createEmptyStack()
        let perfect = true
        let realLine = this.stack.length - 1 
        for (let i = this.stack.length - 1; i >= 0; i--) {
            let needClear = this.stack[i].every((e) => e !== null)
            if (!needClear) {
                newStack[realLine] = this.stack[i]
                perfect = false
                realLine -= 1
            } else {
                cleared.push(i)
            }
        }
        return [cleared, newStack, perfect]
    }
      
    drawAllElements() {
        this.render.clearElements()
        if (this.block !== null) {
            let positions = this.block.positions(this.position[0], this.position[1], this.rotation)
            for (let i = 0; i < positions.length; ++i) {
                this.render.drawBlock(positions[i][0], positions[i][1], 
                                      this.block.style, 1.0)
            }
        }
        if (this.state == "dropping" && this.config.preview == true) {
            const hardDropPosition = this.block.move(this.stack, this.position[0], this.position[1], this.rotation, "hard_drop")
            if (hardDropPosition[0] != this.position[0] || hardDropPosition[1] != this.position[1]) {
                let predicted = this.block.positions(hardDropPosition[0], hardDropPosition[1], hardDropPosition[2])
                for (let i = 0; i < predicted.length; ++i) {
                    this.render.drawBlock(predicted[i][0], predicted[i][1], this.block.style, 0.3)
                }
            }
        }
        if (this.stack != null) {
            for (let i = 0; i < this.stack.length; i++) {
                for (let j = 0; j < this.stack[i].length; ++j) {
                    if (this.stack[i][j] !== null) {
                        this.render.drawBlock(i, j, this.stack[i][j], 1.0)
                    }
                }
            }
        }
        // 显示分数板
        let useTime = 0
        if (this.beginTime !== null && this.endTime == null) {
            let currentTime = Date.now()
            useTime = currentTime - this.beginTime
        } else if (this.endTime != null) {
            useTime = this.endTime - this.beginTime
        }
        this.render.drawStats(this.hold, this.nextBlocks, 
                              this.scoreRule.score, this.scoreRule.lineCount, 
                              msToTime(useTime), this.scoreRule.regret, this.scoreRule.level)
    }

    resetDelayTimer() {
        clearTimeout(this.lockDelayTimer)
        const that = this
        this.lockDelayTimer = setTimeout(function () {
            if (that.block != null && 
                that.block.collide(that.stack, that.position[0] + 1, that.position[1], that.rotation)) {
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
            this.afterPause = null
            this.animations = []
            this.randomBlocks = []
            this.render.clearAnimation()
            this.stack = this.createEmptyStack()
            this.block = this.pickBlock()
            this.nextBlocks = [this.pickBlock(), this.pickBlock(), this.pickBlock()]
            this.hold = null
            this.holdTime = 0
            const center = Math.floor(this.config.columnSize / 2)
            const boxWidth = this.block.boundingBoxWidth
            const x = 1
            const y = center - Math.ceil(boxWidth / 2)
            this.resetDelayTimer()
            this.position = [x, y]
            this.rotation = 0
            this.state = "dropping"
            this.beginTime = Date.now()
            this.endTime = null

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
            const nextMove = this.block.move(this.stack, this.position[0], this.position[1], this.rotation, action)
            if (nextMove[0] != this.position[0] || nextMove[1] != this.position[1] || nextMove[2] != this.rotation) {
                this.resetDelayTimer()
                this.lastAction = action
                if (action in this.audio) {
                    if ((action == "down" && dropType == null) || (this.block == OBlock && action == "clockwise")) {
                        
                    } else {
                        this.playAudioBuffer(this.audio[action], 0.1)
                    }
                }
            }
            const dropCell = nextMove[0] - this.position[0]
            this.scoreRule.onDrop(dropCell, dropType)
            this.position = [nextMove[0], nextMove[1]]
            this.rotation = nextMove[2]
            if (action == "hard_drop") {
                let positions = this.block.positions(this.position[0], this.position[1], this.rotation)
                this.animations.push(hardDropAnimation(positions, this.render))
                this.lockBlock()
            }
        } else if (this.state == "dropping" && action == 'hold') {
            if (this.holdTime == 0) {
                if (this.hold == null) {
                    this.hold = this.block 
                    this.block = this.nextBlocks.shift()
                    this.nextBlocks.push(this.pickBlock())
                } else {
                    let tmp = this.block
                    this.block = this.hold
                    this.hold = tmp
                }
                const center = Math.floor(this.config.columnSize / 2)
                const boxWidth = this.block.boundingBoxWidth
                const x = 1
                const y = center - Math.ceil(boxWidth / 2)
                this.resetDelayTimer()
                this.position = [x, y]
                this.rotation = 0
                this.holdTime = 1
            } else {
                console.log("cannot hold two times")
            }
        } else if (this.state == "dropping" && action == 'regret') {
            if (this.scoreRule.regret()) {
                const center = Math.floor(this.config.columnSize / 2)
                const boxWidth = this.block.boundingBoxWidth
                const x = 1
                const y = center - Math.ceil(boxWidth / 2)
                this.resetDelayTimer()
                this.position = [x, y]
                this.rotation = 0
            } else {
                console.log("cannot regret")
            }
        } else if (this.state == "restart") {
            // 初始化方块
            this.holdTime = 0
            this.block = this.nextBlocks.shift()
            this.nextBlocks.push(this.pickBlock())
            const center = Math.floor(this.config.columnSize / 2)
            const boxWidth = this.block.boundingBoxWidth
            const x = 1
            const y = center - Math.ceil(boxWidth / 2)
            this.resetDelayTimer()
            this.resetFallTimer()
            this.position = [x, y]
            this.rotation = 0
            this.lastAction = null
            if (this.block.collide(this.stack, this.position[0], this.position[1], this.rotation)) {
                this.state = "over"
                this.block = null
                this.stateMachine("over")
            } else {
                // 在游戏 restart 时，如果发生移动按键，马上产生效果，保证操作感够灵敏
                this.state = "dropping"
                if (action != "fall") {
                    this.stateMachine(action)
                }
            }
        } else if (this.state == "over") {
            if (action == "over") {
                this.endTime = Date.now()
                let allLines = []
                for (let i = 0; i < this.stack.length; ++i) {
                    allLines.push(i)
                }
                this.addToScoreRank(this.score, msToTime(this.endTime - this.beginTime), this.clearCount)
                this.state = "pause_game"
                this.animations.push(gameOverAnimation())
                this.animations.push(clearLineAnimation(allLines))
                this.afterPause = function() {
                    this.state = "over"
                    this.stack = this.createEmptyStack()
                }
            } else if (action != "fall") {
                this.animations = []
                this.render.clearAnimation()
                this.state = "begin"
            } 
        } else if (this.state == "pause_game") {
            return
        }
    }

    control(action) {
        let validAction = {
            left: 1, right: 1, down: 1, clockwise: 1, counter_clockwise: 1,
            hard_drop: 1
        }
        if (!game.bgmReady) {
            game.bgmReady = true
            game.playAudioBuffer(game.audio["bgm"], 0.3, true)
        }
        if ((action in validAction)) {
            this.stateMachine(action)
        }
    }

    loadSoundBuffer(path) {
        let that = this;
        let ctx = this.audioContext
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open('GET', path, true);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                ctx.decodeAudioData(request.response, function (buffer) {
                    resolve(buffer)
                }, function () {
                    reject()
                });
            }
            request.send();
        });
    }

    playAudioBuffer(buffer, vol, loop) {
        var source = this.audioContext.createBufferSource()
        source.buffer = buffer

        let gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime)

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination)
        if (loop === true) {
            source.loop = true
        }
        source.start(0)
    }

    async loadResource() {
        await this.render.loadResource()
        this.audio = {}
        let audioBuffers =  await Promise.all([this.loadSoundBuffer(rotateSound), this.loadSoundBuffer(moveSound),
                                               this.loadSoundBuffer(dropSound), this.loadSoundBuffer(clearSound),
                                               this.loadSoundBuffer(bgmSound)])
        this.audio["clockwise"] = audioBuffers[0]
        this.audio["left"] = audioBuffers[1]
        this.audio["right"] = this.audio["left"]
        this.audio["down"] = this.audio["left"]
        this.audio["hard_drop"] = audioBuffers[2]
        this.audio["clear_line"] = audioBuffers[3]
        this.audio["bgm"] = audioBuffers[4]
    }
}

const game = new Game(animationCanvas, uiCanvas, canvas, gamePadCanvas, globalConfig, window.localStorage)
window.addEventListener("load", function () {
    // 初始化 UI
    game.loadResource().then(function () {
        game.initializeUI()
        // 游戏计分规则
        game.setRule(new DefaultScoreRule(1))
        // 键盘和触控输入
        game.installInput(new KeyBoardInput()) 
        game.installInput(new TouchInput()) 
        game.run(1)
    })
    window.addEventListener("resize", function() { 
        game.initializeUI()
    });
})