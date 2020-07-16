'use strict'

import resource from "./resource/resource.js"
import canvas from './canvas.js'

import { ClearLineAnimation } from "./animations/clear-line.js"
import { ComposeAnimation } from "./animations/compose.js"

import { KeyBoardInput, TouchInput } from "./input.js"

import { BlockField } from './sprites/block-field.js'
import { Panel } from './sprites/panel.js'
import { constants } from './constants.js'
import { Board } from './sprites/board.js'
import { BlockPanel } from './sprites/block-panel.js'
import { AnimationManager } from "./animations/animation-manager.js"
import { Tetris } from "./tetris.js"
import { HighLightAnimation } from "./animations/highlight.js"
import { HardDropAnimation } from "./animations/hard-drop.js"

class Game {

    constructor() {
        this.inputs = []
        this.sprites = []
        this.animation = new AnimationManager()
        this.tetris = new Tetris((lockPositions, lines, isPerfect, tspin) => { 
            let animationGroup = lines.map(this.createClearLineAnimation.bind(this))
            this.animation.add(new HighLightAnimation(this.gameX, this.gameY, this.blockSize, lockPositions, 25))
            this.animation.add(new ComposeAnimation(animationGroup, () => {
                // 特殊处理：清空动画播放后，这一行需要重新绘制
                this.blockField.setRedrawLines(lines)
                this.tetris.clearLines(); 
                this.tetris.triggerNextDrop() 
            }))
        }, 
        () => { 
            console.log("gameover") 
        }, (lockPositions) => {
            this.animation.add(new HardDropAnimation(this.gameX, this.gameY, 
                this.blockSize, lockPositions, 40))
        })
    }

    createClearLineAnimation(l) {
        const x = this.gameX
        const y = this.gameY + (l - constants.hiddenRows) * this.blockSize
        const width = this.gameWidth
        const height = this.blockSize
        return new ClearLineAnimation(x, y, width, height, 26)
    }

    installInput(inputMethod) {
        const that = this
        inputMethod.install(function (action) {
            that.control(action) 
        })
        this.inputs.push(inputMethod)
    }

    relocateSprites() {
        const viewport = canvas.refreshViewPort()
        canvas.clearAll()
        const gameRatio = Math.round(constants.cols * 1.4) / constants.rows
        let blockSize
        let verticalScreen = false
        if (viewport.height * gameRatio < viewport.width) {
            blockSize = Math.round(viewport.height * 0.95 / constants.rows)
        } else {
            blockSize = Math.round(0.95 * viewport.width / 1.4 / constants.cols)
            verticalScreen = true
        }
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
        this.board = new Board(gameX, gameY, gameWidth, gameHeight, blockSize)
        if (this.blockField == null) {
            this.blockField = new BlockField(gameX, gameY, blockSize)
        } else {
            this.blockField.relocate(gameX, gameY, blockSize)
        }

        // 预览窗格
        const titleHeight = Math.round(gameHeight / 30)
        const titleX = gameX + gameWidth
        const titleWidth = Math.round(gameWidth * 0.4)
        const previewY = gameY
        const previewHeight = Math.round(viewport.height * 0.33)
        this.previewPanel = new BlockPanel(titleX, previewY, titleWidth, 
            previewHeight + titleHeight, titleHeight, "next", [])

        // // 分数
        const scoreY = previewY + titleHeight + previewHeight
        const statsHeight = Math.round(viewport.height * 0.05) 
        this.scorePanel = new Panel(titleX, scoreY, titleWidth, statsHeight + titleHeight, 
                                    titleHeight, "score", "")
        // // 行数
        const clearLineY = scoreY + titleHeight + statsHeight
        this.clearLinePanel = new Panel(titleX, clearLineY, titleWidth, statsHeight + titleHeight,
                                        titleHeight, "lines", "")
        // // 时间
        const timeY = clearLineY + titleHeight + statsHeight
        this.timePanel = new Panel(titleX, timeY, titleWidth, statsHeight + titleHeight, 
                                   titleHeight, "time", "")
        // 悔棋
        const regretY = timeY + statsHeight + titleHeight
        this.regretPanel = new Panel(titleX, regretY, titleWidth, statsHeight + titleHeight,
                                     titleHeight, "regret", "")
        const holdY = regretY + statsHeight + titleHeight
        const holdHeight = Math.round(viewport.height * 0.15)
        this.holdPanel = new BlockPanel(titleX, holdY, titleWidth, holdHeight + titleHeight, titleHeight, "hold", [])

        this.gameX = gameX
        this.gameY = gameY
        this.gameWidth = gameWidth
        this.gameHeight = gameHeight
        this.blockSize = blockSize

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

    syncStates() {
        // 将游戏的状态同步到所有显示组件
        const t = this.tetris
        this.blockField.setBlockField(t.getBlockPositions(),
                                      t.getPredictedPositions(), 
                                      t.getBlockStyle(), t.getStack())
        this.scorePanel.setContent(t.getScore())
        this.clearLinePanel.setContent(t.getLineCount())
        this.timePanel.setContent(t.getUsedTime())
        this.regretPanel.setContent(t.getRegretCount())
        this.previewPanel.setBlocks(t.getNextBlocks())
        this.holdPanel.setBlocks(t.getHold())
    }

    run() {
        this.tetris.restart()
        const that = this;
        function redraw() {
            that.syncStates()
            that.drawSprites()
            that.animation.play()
            requestAnimationFrame(redraw)
        }
        redraw()
    }

    control(action) {
        let validAction = {
            left: 1, right: 1, down: 1, clockwise: 1, counter_clockwise: 1,
            hard_drop: 1, hold: 1, regret: 1
        }
        resource.sound.playBgmAtFirstTime(1)
        if ((action in validAction)) {
            this.tetris.control(action)
        }
    }
}

window.addEventListener("load", function () {
    resource.load().then(() => {
        let game = new Game()
        game.relocateSprites()
        // 键盘和触控输入
        game.installInput(new KeyBoardInput()) 
        game.installInput(new TouchInput()) 
        window.addEventListener("resize", function() { 
            game.relocateSprites()
        });
        game.run()
    })
})