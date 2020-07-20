import { constants } from "../constants"
import { BlockField } from './block-field.js'
import { Panel } from './panel.js'
import { Board } from './board.js'
import { BlockPanel } from './block-panel.js'

export class GameUI
{
    constructor(viewport) {

        this.board = new Board(0, 0, 0, 0, 0)
        this.blockField = new BlockField(0, 0, 0)
        this.previewPanel = new BlockPanel(0, 0, 0, 0, 0, "next", [])
        this.scorePanel = new Panel(0, 0, 0, 0, 0, "score", "")
        this.clearLinePanel = new Panel(0, 0, 0, 0, 0, "lines", "")
        this.timePanel = new Panel(0, 0, 0, 0, 0, "time", "")
        this.regretPanel = new Panel(0, 0, 0, 0, 0, "regret", "")
        this.holdPanel = new BlockPanel(0, 0, 0, 0, 0, "hold", [])

        this.children = [
            this.blockField, 
            this.board, 
            this.scorePanel,
            this.clearLinePanel,
            this.timePanel,
            this.regretPanel,
            this.previewPanel,
            this.holdPanel,
        ]
        this.relocate(viewport)
    }

    // 重新布局 UI
    relocate(viewport) {
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
        this.board.relocate(gameX, gameY, gameWidth, gameHeight, blockSize)
        this.blockField.relocate(gameX, gameY, blockSize)
        // 预览窗格
        const titleHeight = Math.round(gameHeight / 30)
        const titleX = gameX + gameWidth
        const titleWidth = Math.round(gameWidth * 0.4)
        const previewY = gameY
        const previewHeight = Math.round(viewport.height * 0.33)
        this.previewPanel.relocate(titleX, previewY, titleWidth, previewHeight + titleHeight, titleHeight)

        // // 分数
        const scoreY = previewY + titleHeight + previewHeight
        const statsHeight = Math.round(viewport.height * 0.05) 
        this.scorePanel.relocate(titleX, scoreY, titleWidth, statsHeight + titleHeight, titleHeight)
        // // 行数
        const clearLineY = scoreY + titleHeight + statsHeight
        this.clearLinePanel.relocate(titleX, clearLineY, titleWidth, statsHeight + titleHeight, titleHeight)
        // // 时间
        const timeY = clearLineY + titleHeight + statsHeight
        this.timePanel.relocate(titleX, timeY, titleWidth, statsHeight + titleHeight, titleHeight)
        // 悔棋
        const regretY = timeY + statsHeight + titleHeight
        this.regretPanel.relocate(titleX, regretY, titleWidth, statsHeight + titleHeight, titleHeight)
        const holdY = regretY + statsHeight + titleHeight
        const holdHeight = Math.round(viewport.height * 0.15)
        this.holdPanel.relocate(titleX, holdY, titleWidth, holdHeight + titleHeight, titleHeight)

        this.gameX = gameX
        this.gameY = gameY
        this.gameWidth = gameWidth
        this.gameHeight = gameHeight
        this.blockSize = blockSize
    }

    clear() {
        for (let child of this.children) {
            child.clear()
        }
    }

    draw() {
        for (let child of this.children) {
            child.draw()
        }
    }

    setGameStates(tetris) {
        const t = tetris
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
}