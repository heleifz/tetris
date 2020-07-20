'use strict'

import resource from "./resource/resource.js"
import canvas from './canvas.js'
import { constants } from './constants.js'

import { KeyBoardInput, TouchInput } from "./input.js"

import { GameUI } from './sprites/game-ui.js'

import { Tetris } from "./tetris.js"

import { AnimationManager } from "./animations/animation-manager.js"
import { HighLightAnimation } from "./animations/highlight.js"
import { HardDropAnimation } from "./animations/hard-drop.js"
import { ClearLineAnimation } from "./animations/clear-line.js"
import { ComposeAnimation } from "./animations/compose.js"


class Game {

    constructor() {
        this.inputs = []
        this.gameUI = null
        this.animation = new AnimationManager()
        this.tetris = new Tetris((lockPositions, lines, isPerfect, tspin) => { 
            let animationGroup = lines.map(this.createClearLineAnimation.bind(this))
            this.animation.add(new HighLightAnimation(this.gameUI.gameX, this.gameUI.gameY, this.gameUI.blockSize, lockPositions, 25))
            this.animation.add(new ComposeAnimation(animationGroup, () => {
                // 特殊处理：清空动画播放后，这一行需要重新绘制
                this.gameUI.blockField.setRedrawLines(lines)
                this.tetris.clearLines(); 
                this.tetris.triggerNextDrop() 
            }))
        }, 
        () => { 
            console.log("gameover") 
        }, (lockPositions) => {
            this.animation.add(new HardDropAnimation(this.gameUI.gameX, this.gameUI.gameY, 
                this.gameUI.blockSize, lockPositions, 40))
        })
    }

    createClearLineAnimation(l) {
        const x = this.gameUI.gameX
        const y = this.gameUI.gameY + (l - constants.hiddenRows) * this.gameUI.blockSize
        const width = this.gameUI.gameWidth
        const height = this.gameUI.blockSize
        return new ClearLineAnimation(x, y, width, height, 26)
    }

    installInput(inputMethod) {
        const that = this
        inputMethod.install(function (action) {
            that.control(action) 
        })
        this.inputs.push(inputMethod)
    }

    // 暴力 layout
    relocate(setupCanvas) {
        const viewport = canvas.refreshViewPort(setupCanvas)
        if (setupCanvas) {
            canvas.clearAll()
        }
        if (this.gameUI === null) {
            this.gameUI = new GameUI(viewport)
        } else {
            this.gameUI.relocate(viewport)
        }
    }

    draw() {
        this.gameUI.clear()
        this.gameUI.draw()
    }

    run() {
        this.tetris.restart()
        const that = this;
        function redraw() {
            that.gameUI.setGameStates(that.tetris)
            that.draw()
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
        game.relocate(true)
        // 键盘和触控输入
        game.installInput(new KeyBoardInput()) 
        game.installInput(new TouchInput()) 
        window.addEventListener("resize", function() { 
            game.relocate(true)
        });
        game.run()
    })
})