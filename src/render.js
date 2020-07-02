import skinImg from "./assets/img/lego-3.png"
import {boundingBox, loadImage, isTouchDevice} from "./util.js"

export default class Render {

    constructor(animationCanvas, uiCanvas, canvas, gamePadCanvas, config) {
        this.dpr = window.devicePixelRatio || 1
        this.animationCanvas = animationCanvas
        this.uiCanvas = uiCanvas
        this.canvas = canvas
        this.gamePadCanvas = gamePadCanvas
        this.config = config
        this.virutalCanvas = document.createElement('canvas')
    }

    setUpCanvas(canvas) {
        let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
        let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
        canvas.height = style_height * this.dpr
        canvas.width = style_width * this.dpr
    }
    

    recalculate() {

        this.isTouch = isTouchDevice()
        this.animationContext = null
        this.gameContext = null
        this.width = window.innerWidth * this.dpr
        this.windowHeight = window.innerHeight * this.dpr

        const gameRatio = Math.round(this.config.columnSize * 1.4) / this.config.lines
        let mobileScreen = false
        if (this.windowHeight * gameRatio < this.width) {
            this.blockSizeInPixels = Math.round(this.windowHeight * 0.95 / this.config.lines)
        } else {
            this.blockSizeInPixels = Math.round(0.95 * this.width / gameRatio / this.config.lines)
            mobileScreen = true
        }
        this.virutalCanvas.height = this.blockSizeInPixels
        this.virutalCanvas.width = this.blockSizeInPixels * this.skin.blockTypeNum
        let virtualContext = this.virutalCanvas.getContext('2d')
        virtualContext.drawImage(this.skin.image, 0, 0, this.blockSizeInPixels * this.skin.blockTypeNum, this.blockSizeInPixels)

        this.gameWidth = this.blockSizeInPixels * this.config.columnSize
        this.height = this.blockSizeInPixels * this.config.lines
        this.gameX = Math.round((this.width - this.gameWidth * 1.4) / 2)
        if (mobileScreen && this.isTouch) {
            this.gameY = Math.round((this.windowHeight - this.height) / 7)
        } else {
            this.gameY = Math.round((this.windowHeight - this.height) / 2)
        }
        this.setUpCanvas(this.canvas)
        this.setUpCanvas(this.uiCanvas)
        this.setUpCanvas(this.animationCanvas)
        this.setUpCanvas(this.gamePadCanvas)

        // 预览窗格
        this.titleHeight = Math.round(this.height / 30)
        this.titleX = this.gameX + this.gameWidth
        this.titleWidth = Math.round(this.gameWidth * 0.4)
        this.previewWindows = []
        let currentY = this.gameY + this.titleHeight
        let previewHeight = Math.round(this.height * 0.11)
        for (let i = 0; i < 3; i++) {
            this.previewWindows.push([this.titleX, currentY, this.titleWidth, previewHeight])
            currentY += previewHeight
        }
        // 分数
        this.scoreY = currentY + this.titleHeight
        this.scoreHeight = Math.round(this.height * 0.05)
        // 行数
        this.clearLineY = this.scoreY + this.scoreHeight + this.titleHeight
        this.clearLineHeight = this.scoreHeight
        // 时间
        this.timeY = this.clearLineY + this.scoreHeight + this.titleHeight
        this.timeHeight = this.scoreHeight
        // regret
        this.regretY = this.timeY + this.scoreHeight + this.titleHeight
        this.regretHeight = this.scoreHeight
        // hold
        this.holdY = this.regretY + this.scoreHeight + this.titleHeight
        this.holdHeight = Math.round(previewHeight * 1.2)
        
    }

    async loadResource() {

        this.skin = {} 
        // this.skin.image = await loadImage("block.png")
        // this.skin.blockSize = 133
        // this.skin.colorPosition = {
        //     blue: [666, 0],
        //     red: [1333, 399],
        //     orange: [1463, 0],
        //     cyan: [0, 133],
        //     yellow: [1729, 0],
        //     purple: [798, 532],
        //     green: [266, 532],
        // }
        // this.skin.image = await loadImage("lego-1.png")
        // this.skin.blockSize = 133
        // this.skin.colorPosition = {
        //     red: [0, 0],
        //     blue: [133, 1],
        //     yellow: [266, 0],
        //     green: [399, 0],
        //     cyan: [532, 1],
        //     orange: [665, 0],
        //     purple: [797, 0]
        // }
        this.skin.image = await loadImage(skinImg)
        this.skin.blockTypeNum = 7
        this.skin.colorPosition = { 
            red: 0, 
            blue: 1,
            yellow: 2,
            green: 3,
            cyan: 4,
            orange: 5,
            purple: 6,
            gray: 7
        }

    }

    getAnimationContext() {
        if (this.animationContext === null) {
            this.animationContext = this.animationCanvas.getContext('2d')
        }
        return this.animationContext
    }

    getGameContext() {
        if (this.gameContext === null) {
            this.gameContext = this.canvas.getContext('2d')
        }
        return this.gameContext
    }

    clearAnimation() {
        const ctx = this.animationCanvas.getContext('2d')
        ctx.clearRect(0, 0, this.animationCanvas.width, this.animationCanvas.height)
    }

    clearElements() {
        const ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    drawUI() {
        const ctx = this.uiCanvas.getContext('2d')
        ctx.fillStyle = 'rgb(0,0,0,0.8)'
        ctx.fillRect(this.gameX, this.gameY, this.gameWidth, this.height)
        // 画网格
        ctx.strokeStyle = 'rgb(60,60,60)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let i = 1; i < this.config.columnSize; ++i) {
            ctx.moveTo(this.gameX + i * this.blockSizeInPixels, this.gameY)
            ctx.lineTo(this.gameX + i * this.blockSizeInPixels, this.height + this.gameY)
        }
        for (let i = 1; i < this.config.lines; ++i) {
            ctx.moveTo(this.gameX, this.gameY + i * this.blockSizeInPixels)
            ctx.lineTo(this.gameX + this.gameWidth, this.gameY + i * this.blockSizeInPixels)
        }
        ctx.stroke()
        // 预览窗格
        ctx.fillStyle = 'rgb(0,0,0,0.85)'
        ctx.fillRect(this.titleX, this.gameY, this.titleWidth, this.titleHeight)
        ctx.fillStyle = "white"
        ctx.font = (this.titleHeight + 1) + "px pixeboy";
        ctx.fillText("next", this.titleX, this.gameY + this.titleHeight);
        ctx.fillStyle = 'rgb(0,0,0,0.6)'
        for (let win of this.previewWindows) {
            ctx.fillRect(win[0], win[1], win[2], win[3])
        }
        // hold
        ctx.fillStyle = 'rgb(0,0,0,0.85)'
        ctx.fillRect(this.titleX, this.holdY - this.titleHeight, this.titleWidth, this.titleHeight)

        ctx.fillStyle = "white"
        ctx.font = (this.titleHeight + 1) + "px pixeboy";
        ctx.fillText("hold", this.titleX, this.holdY);
        
        ctx.fillStyle = 'rgb(0,0,0,0.6)'
        ctx.fillRect(this.titleX, this.holdY, this.titleWidth, this.holdHeight)
        // level
        ctx.fillStyle = 'rgb(0,0,0,0.85)'
        ctx.fillRect(this.titleX, this.holdY + this.holdHeight, this.titleWidth, this.titleHeight)
        // 计分
        ctx.fillStyle = 'rgb(0,0,0,0.85)'
        ctx.fillRect(this.titleX, this.scoreY - this.titleHeight, this.titleWidth, this.titleHeight)
        ctx.fillStyle = "white"
        ctx.font = (this.titleHeight + 1) + "px pixeboy";
        ctx.fillText("score", this.titleX, this.scoreY);
        ctx.fillStyle = 'rgb(0,0,0,0.6)'
        ctx.fillRect(this.titleX,  this.scoreY, this.titleWidth, this.scoreHeight)
        // 记行数
        ctx.fillStyle = 'rgb(0,0,0,0.85)'
        ctx.fillRect(this.titleX, this.clearLineY - this.titleHeight, this.titleWidth, this.titleHeight)
        ctx.fillStyle = "white"
        ctx.font = (this.titleHeight + 1) + "px pixeboy";
        ctx.fillText("lines", this.titleX, this.clearLineY);
        ctx.fillStyle = 'rgb(0,0,0,0.6)'
        ctx.fillRect(this.titleX, this.clearLineY, this.titleWidth, this.clearLineHeight)
        // 计时
        ctx.fillStyle = 'rgb(0,0,0,0.85)'
        ctx.fillRect(this.titleX, this.timeY - this.titleHeight, this.titleWidth, this.titleHeight)
        ctx.fillStyle = "white"
        ctx.font = (this.titleHeight + 1) + "px pixeboy";
        ctx.fillText("time", this.titleX, this.timeY);
        ctx.fillStyle = 'rgb(0,0,0,0.6)'
        ctx.fillRect(this.titleX, this.timeY, this.titleWidth, this.timeHeight)
        // regret
        ctx.fillStyle = 'rgb(0,0,0,0.85)'
        ctx.fillRect(this.titleX, this.regretY - this.titleHeight, this.titleWidth, this.titleHeight)
        ctx.fillStyle = "white"
        ctx.font = (this.titleHeight + 1) + "px pixeboy";
        ctx.fillText("redo", this.titleX, this.regretY);
        ctx.fillStyle = 'rgb(0,0,0,0.6)'
        ctx.fillRect(this.titleX, this.regretY, this.titleWidth, this.regretHeight)

        return this;
    }

    drawStats(hold, nextBlocks, score, lines, time, regret, level) {
        const ctx = this.canvas.getContext('2d')
        // 分数字体大小自适应
        let scoreSize = this.titleHeight - 3
        while (scoreSize > 3){
            ctx.font = scoreSize + "px ka1";
            let textMetric = ctx.measureText(score);
            if (textMetric.width + 5 < this.titleWidth) {
                break
            }
            scoreSize -= 1
        }
        ctx.fillStyle = "white";
        ctx.fillText(score, this.titleX + 2, this.scoreY + this.titleHeight)
        ctx.font = (this.titleHeight - 7) + "px ka1";
        ctx.fillText(lines, this.titleX + 2, this.clearLineY + this.titleHeight)
        ctx.fillText(time, this.titleX + 2, this.timeY + this.titleHeight)
        ctx.fillText(regret, this.titleX + 2, this.regretY + this.titleHeight)
        
        ctx.font = (this.titleHeight + 1) + "px pixeboy";
        ctx.fillText("LEVEL " + level, this.titleX, this.holdY + this.holdHeight + this.titleHeight)

        this.drawHold(hold)
        this.drawNextBlock(nextBlocks)
    }

    drawBlock(row, col, style, trans) {
        if (row < 2) {
            return
        }
        let x = col * this.blockSizeInPixels + this.gameX
        let y = (row - 2) * this.blockSizeInPixels + this.gameY
        const ctx = this.getGameContext()
        const offset = this.skin.colorPosition[style]
        ctx.save()
        if (trans < 1.0) {
            ctx.globalAlpha = trans
        }
        ctx.drawImage(this.virutalCanvas, offset * this.blockSizeInPixels, 0,
                      this.blockSizeInPixels, this.blockSizeInPixels, x, y, this.blockSizeInPixels, this.blockSizeInPixels)
        ctx.restore()
    }
    
    drawHold(hold) {
        if (!hold) {
            return
        }
        let positions = hold.positions(0, 0, 0)
        let [minRow, maxRow, minCol, maxCol] = boundingBox(positions)
        let blockSize = Math.round(this.titleWidth * 0.21)
        let width = (maxCol - minCol + 1) * blockSize
        let height = (maxRow - minRow + 1) * blockSize
        let xOffSet = Math.round((this.titleWidth - width) / 2)
        let yOffSet = Math.round((this.holdHeight - height) / 2)
        const offset = this.skin.colorPosition[hold.style]
        const ctx = this.canvas.getContext('2d')
        for (let i = 0; i < positions.length; ++i) {
            let x = (positions[i][1] - minCol) * blockSize + this.titleX + xOffSet
            let y = (positions[i][0] - minRow) * blockSize + this.holdY + yOffSet
            ctx.drawImage(this.virutalCanvas, offset * this.blockSizeInPixels, 0,
                          this.blockSizeInPixels, this.blockSizeInPixels, x, y, blockSize, blockSize)
        }
    }

    drawNextBlock(nextBlocks) {
        if (!nextBlocks) {
            return
        }
        for (let i = 0; i < nextBlocks.length && i < this.previewWindows.length; i++) {
            let block = nextBlocks[i] 
            if (block === null) {
                continue
            }
            let window = this.previewWindows[i]
            let positions = block.positions(0, 0, 0)
            let [minRow, maxRow, minCol, maxCol] = boundingBox(positions)
            let blockSize = Math.round(window[2] * 0.21)
            let width = (maxCol - minCol + 1) * blockSize
            let height = (maxRow - minRow + 1) * blockSize
            let xOffSet = Math.round((window[2] - width) / 2)
            let yOffSet = Math.round((window[3] - height) / 2)
            const offset = this.skin.colorPosition[block.style]
            const ctx = this.canvas.getContext('2d')
            for (let i = 0; i < positions.length; ++i) {
                let x = (positions[i][1] - minCol) * blockSize + window[0] + xOffSet
                let y = (positions[i][0] - minRow) * blockSize + window[1] + yOffSet
                ctx.drawImage(this.virutalCanvas, offset * this.blockSizeInPixels, 0,
                              this.blockSizeInPixels, this.blockSizeInPixels, x, y, blockSize, blockSize)
            }
        }
    }

}