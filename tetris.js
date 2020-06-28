'use strict';

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

function loadImage(path) {
    return new Promise(function (resolve) {
        const img = new Image()
        img.src = path
        img.onload = function () {
            resolve(img)
        }
    });
}

function rowSpeedForLevel(level) {
    const levelTime = Math.pow(0.8 - ((level - 1) * 0.007), level - 1)
    return levelTime * 1000
}

// 随机排列组合
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function msToTime(duration) {
    let milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  
    hours = (hours < 10) ? "0" + hours : hours
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds
  
    return hours + " " + minutes + " " + seconds
}

function isTouchDevice() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function (query) {
        return window.matchMedia(query).matches;
    }
    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}

// 单个飞散粒子
function createParticle(renderParticle, x, y, angleInDegree, speed, gravity, rotateSpeed, lifeSpan) {
    let progress = 0
    const angle = 2 * Math.PI - (((angleInDegree % (360)) / 360) * (2 * Math.PI))
    let xInitSpeed = Math.cos(angle) * speed
    let yInitSpeed = Math.sin(angle) * speed
    return function (game) {
        let trans = 1.0 - (progress / lifeSpan)
        let rotate = (((rotateSpeed * progress) % 360) / 360) * (2 * Math.PI)
        let xPosition = x + xInitSpeed * progress
        let yPosition = y + yInitSpeed * progress + 0.01 * gravity * (progress * progress)
        renderParticle(xPosition, yPosition, rotate, trans)
        if (progress == lifeSpan) {
            return null
        }
        progress += 1
        return 1
    }
}

// 随机颜色方块粒子
function randomColorBlockParticle() {
    let candidateColor = ["rgb(255,29,88)", "rgb(24,89,144)", "rgb(255,246,133)", "rgb(0,221,255)", "rgb(0,73,183)"]
    const color = candidateColor[Math.floor(Math.random() * candidateColor.length)]
    const size = Math.random() * 10
    const ctx = game.render.getAnimationContext()
    return function (xPosition, yPosition, rotate, trans) {
        ctx.save()
        ctx.fillStyle = color
        ctx.globalAlpha = trans
        ctx.fillRect(xPosition, yPosition, size, size)
        ctx.restore()
    }
}




class Renderer {

    constructor(animationCanvas, uiCanvas, canvas, gamePadCanvas, config) {
        this.dpr = window.devicePixelRatio || 1
        this.animationCanvas = animationCanvas
        this.uiCanvas = uiCanvas
        this.canvas = canvas
        this.gamePadCanvas = gamePadCanvas
        this.config = config
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
        this.skin.image = await loadImage("lego-4.png")
        this.skin.blockSize = 30
        this.skin.colorPosition = {
            red: [0, 0],
            blue: [30, 0],
            yellow: [60, 0],
            green: [90, 0],
            cyan: [120, 0],
            orange: [150, 0],
            purple: [180, 0],
            gray: [210, 0]
        }
    }

    getAnimationContext() {
        if (this.animationContext === null) {
            this.animationContext = this.animationCanvas.getContext('2d')
        }
        return this.animationContext
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
        for (let i = 1; i < this.config.columnSize; ++i) {
            ctx.strokeStyle = 'rgb(60,60,60)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(this.gameX + i * this.blockSizeInPixels, this.gameY)
            ctx.lineTo(this.gameX + i * this.blockSizeInPixels, this.height + this.gameY)
            ctx.stroke()
        }
        for (let i = 1; i < this.config.lines; ++i) {
            ctx.strokeStyle = 'rgb(60,60,60)'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(this.gameX, this.gameY + i * this.blockSizeInPixels)
            ctx.lineTo(this.gameX + this.gameWidth, this.gameY + i * this.blockSizeInPixels)
            ctx.stroke()
        }
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

    eraseLine(row) {
        let x = this.gameX
        let y = (row - 2) * this.blockSizeInPixels + this.gameY
        let height = this.blockSizeInPixels
        let width = this.gameWidth
        const ctx = this.canvas.getContext('2d')
        ctx.clearRect(x, y, width, height)
    }

    drawBlock(row, col, style, trans) {
        if (row < 2) {
            return
        }
        let x = col * this.blockSizeInPixels + this.gameX
        let y = (row - 2) * this.blockSizeInPixels + this.gameY
        const ctx = this.canvas.getContext('2d')
        const offset = this.skin.colorPosition[style]
        ctx.save()
        ctx.globalAlpha = trans
        ctx.drawImage(this.skin.image, offset[0], offset[1], this.skin.blockSize, this.skin.blockSize, 
                      x, y, this.blockSizeInPixels, this.blockSizeInPixels)
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
            ctx.drawImage(this.skin.image, offset[0], offset[1], 
                            this.skin.blockSize, this.skin.blockSize, 
                            x, y, blockSize, blockSize)
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
                ctx.drawImage(this.skin.image, offset[0], offset[1], 
                              this.skin.blockSize, this.skin.blockSize, 
                              x, y, blockSize, blockSize)
            }
        }
    }

}

class BlockType {

    // shapes：在 bounding box 中的四种旋转形态
    // kickRule: kick规则
    // style: 在皮肤中的贴图名称
    constructor(shapes, kickRule, style) {

        this.shapes = shapes
        this.style = style
        this.kickTable = null
        if (kickRule == "other") {
            this.kickTable = {
                "0": {
                    "1": [[0, 0], [-1, 0], [-1, 1],	[0,-2], [-1,-2]],
                    "3": [[0, 0], [1, 0], [1, 1], [0,-2], [1, -2]],
                }, 
                "1": {
                    "2": [[0, 0], [1, 0], [1,-1], [0, 2], [1, 2]],
                    "0": [[0, 0], [1, 0], [1,-1], [0, 2], [1, 2]],
                }, 
                "2": {
                    "3": [[0, 0], [1, 0], [1, 1],[0,-2], [1,-2]],
                    "1": [[0, 0], [-1, 0], [-1, 1], [0,-2], [-1,-2]],
                }, 
                "3": {
                    "0": [[0, 0], [-1, 0], [-1,-1], [0, 2], [-1, 2]],
                    "2": [[0, 0], [-1, 0], [-1,-1], [0, 2], [-1, 2]],
                } 
            }
        } else if (kickRule == "I") {
            this.kickTable = {
                "0": {
                    "1": [[0, 0], [-2, 0], [1, 0], [-2,-1], [1, 2]],
                    "3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2,-1]],
                }, 
                "1": {
                    "2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2,-1]],
                    "0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1,-2]],
                }, 
                "2": {
                    "3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1,-2]],
                    "1": [[0, 0], [1, 0], [-2, 0], [1,-2], [-2, 1]],
                }, 
                "3": {
                    "0": [[0, 0], [1, 0], [-2, 0], [1,-2], [-2, 1]],
                    "2": [[0, 0], [-2, 0], [1, 0], [-2,-1], [1, 2]],
                }  
            }
        }

        this.offsets = []
        this.boundingBoxWidth = shapes[0][1].length

        for (let i = 0; i < shapes.length; ++i) {
            const shape = shapes[i]
            const offset = []
            for (let j = 0; j < shape.length; ++j) {
                for (let k = 0; k < shape[j].length; ++k) {
                    if (shape[j][k] == 1) {
                        offset.push([j, k])
                    }
                }
            }
            this.offsets.push(offset)
        }
    }

    getRotationNumber(rotation) {
        let mod
        if (rotation < 0) {
            mod = (4 - (-rotation % 4)) % 4
        } else {
            mod = rotation % 4
        }
        return mod 
    }

    // row, col = bounding box 左上角的坐标
    positions(row, col, rotation) {
        let mod = this.getRotationNumber(rotation)
        const offset = this.offsets[mod]
        let result = [];
        for (let i = 0; i < offset.length; ++i) {
            let p = offset[i];
            result.push([row + p[0], col + p[1]])
        }
        return result
    }

    collide(stack, row, col, rotation) {
        const newPosition = this.positions(row, col, rotation) 
        for (let i = 0; i < newPosition.length; ++i) {
            const p = newPosition[i]
            if (p[0] < 0 || p[1] < 0 || p[0] >= stack.length || p[1] >= stack[p[0]].length) {
                return true
            }
            if (stack[p[0]][p[1]] !== null) {
                return true
            }
        }
        return false
    }

    rotate(stack, row, col, rotation, direction) {
        const from = this.getRotationNumber(rotation)
        const to = this.getRotationNumber(rotation + direction)

        // 无kick规则情况
        if (this.kickTable == null) {
            if (!this.collide(stack, row, col, to)) {
                return [row, col, to]
            } else {
                return [row, col, from] 
            }
        }
        const seq = this.kickTable[from][to]
        for (let i in seq) {
            const offset = seq[i]
            if (!this.collide(stack, row - offset[1], col + offset[0], to)) {
                return [row - offset[1], col + offset[0], to]
            }
        }
        return [row, col, from] 
    }

    // 方块操作代码
    move(stack, row, col, rotation, action) {
        let newRow = row
        let newCol = col
        let newRotation = rotation
        if (action == "clockwise") {
            return this.rotate(stack, row, col, rotation, 1)
        } else if (action == "counter_clockwise") {
            return this.rotate(stack, row, col, rotation, -1)
        } else if (action == "left") {
            newCol -= 1           
        } else if (action == "right") {
            newCol += 1
        } else if (action == "down") {
            newRow += 1
        } else if (action == "hard_drop") {
            let positions = this.positions(row, col, rotation)
            let minDrop = stack.length - 1
            for (let i = 0; i < positions.length; ++i) {
                let currentCol = positions[i][1]
                let currentRow = positions[i][0]
                minDrop = Math.min(minDrop, stack.length - currentRow - 1)
                for (let r = currentRow + 1; r < stack.length; ++r) {
                    if (stack[r][currentCol] !== null) {
                        let drop = r - currentRow - 1
                        minDrop = Math.min(drop, minDrop)
                        break
                    }
                }
            }
            newRow += minDrop
        }
        if (!this.collide(stack, newRow, newCol, newRotation)) {
            return [newRow, newCol, newRotation]
        } else {
            return [row, col, rotation] 
        }
    }

}

// 几种方块

let JBlock = new BlockType([
    
    [[1,0,0],
     [1,1,1],
     [0,0,0]],

    [[0,1,1],
     [0,1,0],
     [0,1,0]],

    [[0,0,0],
     [1,1,1],
     [0,0,1]],

    [[0,1,0],
     [0,1,0],
     [1,1,0]]

], "other", 'blue')

let ZBlock = new BlockType([ 

    [[1,1,0],
     [0,1,1],
     [0,0,0]],

    [[0,0,1],
     [0,1,1],
     [0,1,0]],

    [[0,0,0],
     [1,1,0],
     [0,1,1]],

    [[0,1,0],
     [1,1,0],
     [1,0,0]]

], "other", 'red')

let LBlock = new BlockType([ 

    [[0,0,1],
     [1,1,1],
     [0,0,0]],

    [[0,1,0],
     [0,1,0],
     [0,1,1]],

    [[0,0,0],
     [1,1,1],
     [1,0,0]],

    [[1,1,0],
     [0,1,0],
     [0,1,0]]

], "other", 'orange')

let IBlock = new BlockType([ 
   
    [[0,0,0,0],
     [1,1,1,1],
     [0,0,0,0],
     [0,0,0,0]],

    [[0,0,1,0],
     [0,0,1,0],
     [0,0,1,0],
     [0,0,1,0]],

    [[0,0,0,0],
     [0,0,0,0],
     [1,1,1,1],
     [0,0,0,0]],

    [[0,1,0,0],
     [0,1,0,0],
     [0,1,0,0],
     [0,1,0,0]]

], "I", 'cyan')

let OBlock = new BlockType([ 
   
    [[0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]],
     
    [[0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]],
     
    [[0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]],

    [[0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]]

], null, 'yellow')

let TBlock = new BlockType([ 

    [[0,1,0],
     [1,1,1],
     [0,0,0]],

    [[0,1,0],
     [0,1,1],
     [0,1,0]],

    [[0,0,0],
     [1,1,1],
     [0,1,0]],

    [[0,1,0],
     [1,1,0],
     [0,1,0]]

], "other", 'purple')

let SBlock = new BlockType([ 

    [[0,1,1],
     [1,1,0],
     [0,0,0]],

    [[0,1,0],
     [0,1,1],
     [0,0,1]],

    [[0,0,0],
     [0,1,1],
     [1,1,0]],

    [[1,0,0],
     [1,1,0],
     [0,1,0]]

], "other", 'green')

const gameOverAnimation = function () {
    let progress = 1
    return function (game) {
        const ctx = game.render.getAnimationContext()
        const height = game.render.windowHeight 
        const width = game.render.width
        const bannerHeight = 200 * (progress / 20.0)
        const trans = 0.8 * (progress / 20.0)

        ctx.fillStyle = "rgba(50,50,50," + trans + ")";
        ctx.fillRect(0, (height - bannerHeight) / 2 * 0.8, width, bannerHeight)

        if (progress > 10) {
            ctx.font = "48px pixeboy";
            ctx.fillStyle = "rgba(251,226,81," + ((progress - 10)/10) + ")";
            const textMetric = ctx.measureText("GAME  OVER");
            ctx.fillText("GAME  OVER", (width - textMetric.width) / 2,  bannerHeight / 2 + (height - bannerHeight) / 2 * 0.82);
        }

        if (progress == 20) {
            return 1
        } else {
            progress += 1
            return 1
        }
    }
}

function clearLineAnimation(lines) {
    let toClear = lines
    let progress = 1
    let totalLength = 18
    const firstPhase = Math.round(totalLength * 0.4)
    const secondPhase = totalLength - firstPhase
    return function (game) {
        let particleNum = 5
        const ctx = game.render.getAnimationContext()
        if (lines.length > 10) {
            particleNum = 2
        }
        if (progress < totalLength) {
            for (let i in lines) {
                const row = lines[i]

                let x = game.render.gameX
                let y = (row - 2) * game.render.blockSizeInPixels + game.render.gameY
                let height = game.render.blockSizeInPixels
                let width = game.render.gameWidth
                // 第一阶段：变亮
                if (progress <= firstPhase) {
                    const trans = progress / firstPhase
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                // 第二阶段：化作彩色粒子飞散消失
                } else {
                    if (progress == firstPhase + 1) {
                        game.render.eraseLine(row)
                    }
                    const trans = 1.0 - ((progress - firstPhase) / secondPhase)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                    width = width * (1.0 - (progress - firstPhase) / secondPhase)
                    x = x + (game.render.gameWidth - width) / 2
                    for (let i = 0; i < particleNum; ++i) {
                        let particle = createParticle(randomColorBlockParticle(), 
                            x, y + game.render.blockSizeInPixels / 2, (90 + (135 - 90) * Math.random()), 10 + 5 * Math.random(), 30, 20, 40)
                        game.animations.push(particle)
                        particle = createParticle(randomColorBlockParticle(), 
                            x + width, y + game.render.blockSizeInPixels / 2, 45 + (90 - 45) * Math.random(), 10 + 5 * Math.random(), 30, 20, 40)
                        game.animations.push(particle)
                    }
                }
                ctx.fillRect(x, y, width, height)
            }
            progress += 1
        } else if (progress == totalLength) {
            if (game.afterPause !== null) {
                game.afterPause()
                game.afterPause = null
            }
            return null
        }
    }
}

function highlightAnimation(positions) {
    let progress = 1

    return function (game) {
        if (progress < 16) {
            const ctx = game.render.getAnimationContext()
            for (let i in positions) {
                const p = positions[i]
                let x = p[1] * game.render.blockSizeInPixels + game.render.gameX
                let y = (p[0] - 2) * game.render.blockSizeInPixels + game.render.gameY
                if (progress <= 8) {
                    const trans = 0.8 * (progress / 8)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                } else {
                    const trans = 0.8 - 0.8 * ((progress - 8) / 7.0)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                }
                ctx.fillRect(x, y, game.render.blockSizeInPixels, game.render.blockSizeInPixels)
            }
            progress += 1
        } else {
            return null
        }
    }
}

function boundingBox(positions) {
    let minRow = null
    let maxRow = null
    let minCol = null
    let maxCol = null
    for (let p of positions) {
        const row = p[0]
        const col = p[1]
        if (minRow == null || row < minRow) {
            minRow = row
        }
        if (maxRow == null || row > maxRow) {
            maxRow = row
        }
        if (minCol == null || col < minCol) {
            minCol = col 
        }
        if (maxCol == null || col > maxCol) {
            maxCol = col 
        }
    }
    return [minRow, maxRow, minCol, maxCol]
}

function hardDropAnimation(positions, render) {
    let progress = 1 

    let [minRow, maxRow, minCol, maxCol] = boundingBox(positions)

    const minX = render.gameX + minCol * render.blockSizeInPixels
    const maxX = render.gameX + (maxCol + 1) * render.blockSizeInPixels
    const endY = render.gameY + (minRow - 2) * render.blockSizeInPixels - 5

    let dropLines = []
    const lineHeight = 100
    if (minRow > 5) {
        for (let x = minX; x <= maxX; x += 20) {
            for (let i = 0; i < 2; ++i) {
                const realX = x + 30 * (0.5 - Math.random())
                if (realX < (game.render.gameX + game.render.gameWidth) && realX > game.render.gameX) {
                    dropLines.push([realX, Math.max(game.render.gameY, endY - lineHeight - Math.random() * 150), 6 * Math.random(), lineHeight * (1 - 0.1 * Math.random())])
                }
            }
        }
    }
    return function (game) {
        const ctx = game.render.getAnimationContext()
        if (progress < 8) {
            for (let i in dropLines) {
                const line = dropLines[i]
                const lineY = line[1] - 0.5 * lineHeight * (progress / 8.0)
                let gradient = ctx.createLinearGradient(line[0], lineY, line[0], lineY + line[3])
                let pos = 0.7 * progress / 8
                gradient.addColorStop(pos, "rgb(80,80,80,0)")
                gradient.addColorStop(0.7, "rgb(100,100,100,0.8)");
                gradient.addColorStop(1, "rgb(80,80,80,0)");
                ctx.fillStyle = gradient;
                ctx.fillRect(line[0], lineY, line[2], line[3])
            }
            progress += 1
        } else {
            return null
        }
    }
}


class Game {

    constructor(animationCanvas, uiCanvas, canvas, gamePadCanvas, config) {
        this.candidates = [JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock]
        this.config = config
        this.render = new Renderer(animationCanvas, uiCanvas, canvas, gamePadCanvas, config)
        this.state = "begin"
        this.animations = []
        this.afterPause = null
        this.keyPressed = {}
        this.keyTimer = {}

        this.clearTouch()
        this.lastAction = null
        this.block = null
        this.nextBlocks = []
        this.hold = null
        this.holdTime = 0
        this.stack = null
        this.score = 0
        this.levelLineClear = 0
        this.regretTime = 0
        this.comboCount = 0
        this.clearCount = 0
        this.beginTime = null
        this.endTime = null
    }

    initializeUI() {
        this.render.recalculate() 
        this.render.drawUI()
        return this
    }
    
    indexForOngoingTouch(touch) {
        const id = touch.identifier
        for (let i = 0; i < this.ongoingTouches.length; i++) {
            if (this.ongoingTouches[i].identifier == id) {
                return i
            }
        }
        return null
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

    run(level) {
        this.level = level
        this.beginLevel = level
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
        this.levelTime = rowSpeedForLevel(this.level)
        const that = this;
        this.fallTimerId = setTimeout(function () {
            that.stateMachine("fall")
            that.resetFallTimer()
        }, this.levelTime);
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
        this.clearTouch()
        this.stopFallTimer()
        
        // 高亮锁定块
        let positions = this.block.positions(this.position[0], this.position[1], this.rotation)
        this.animations.push(highlightAnimation(positions))
        // 看是否能消除
        const clearResult = this.clearLines()
        const tspin = this.TSpinType()
        const updatedScore = this.getClearLineScore(clearResult[0].length, clearResult[2], tspin)
        if (clearResult[0].length > 0) {
            this.state = "pause_game"
            this.animations.push(clearLineAnimation(clearResult[0]))
            this.afterPause = function () {
                this.comboCount = updatedScore[0]
                this.score = updatedScore[1]
                this.clearCount = updatedScore[2]
                this.levelClearCount += clearResult[0].length
                this.regretTime += updatedScore[3]
                this.stack = clearResult[1]
                if (this.levelClearCount >= 10) {
                    this.level += 1
                    this.levelClearCount -= 10
                }
                this.newDrop()
            }
        } else {
            this.comboCount = updatedScore[0]
            this.score = updatedScore[1]
            for (let i = 0; i < positions.length; ++i) {
                this.stack[positions[i][0]][positions[i][1]] = this.block.style
            }
            this.newDrop()
        }
    }

    clearLines() {
        let cleared = []
        let newStack = this.createEmptyStack()
        let realLine = newStack.length - 1
        let positions = this.block.positions(this.position[0], this.position[1], this.rotation)
        for (let i = 0; i < positions.length; ++i) {
            this.stack[positions[i][0]][positions[i][1]] = this.block.style
        }
        let perfect = true
        for (let i = this.stack.length - 1; i >= 0; i--) {
            let good = false
            for (let j = 0; j < this.config.columnSize; ++j) {
                if (this.stack[i][j] === null) {
                    good = true
                    break
                }
            }
            if (good) {
                for (let j = 0; j < this.config.columnSize; ++j) {
                    if (this.stack[i][j] != null) {
                        newStack[realLine][j] = this.stack[i][j]
                        perfect = false
                    }
                }
                realLine -= 1
            } else {
                cleared.push(i)
            }
        }
        if (cleared.length == 0) {
            for (let i = 0; i < positions.length; ++i) {
                this.stack[positions[i][0]][positions[i][1]] = null
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
        this.render.drawStats(this.hold, this.nextBlocks, this.score, this.clearCount, 
                              msToTime(useTime), this.regretTime, this.level)
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

    getClearLineScore(clearLineCount, isPerfect, tspin) {
        let newCombo = 0
        let newScore = this.score
        let newClearCount = this.clearCount + clearLineCount
        let newRegret = 0
        if (clearLineCount > 0 || tspin != null) {
            newCombo = this.comboCount + 1
            if (clearLineCount == 1) {
                if (tspin != null) {
                    newScore += 800 * this.level
                } else {
                    newScore += 100 * this.level
                }
                if (isPerfect) {
                    newScore += 800 * this.level
                }
            } else if (clearLineCount == 2) {
                if (tspin != null) {
                    newScore += 1200 * this.level
                } else {
                    newScore += 300 * this.level
                }
                if (isPerfect) {
                    newScore += 1000 * this.level
                }
            } else if (clearLineCount == 3) {
                if (tspin != null) {
                    newScore += 1600 * this.level
                } else {
                    newScore += 500 * this.level
                }
                if (isPerfect) {
                    newScore += 1800 * this.level
                }
            } else if (clearLineCount == 4) {
                newScore += 800 * this.level
                newRegret = 1
                if (isPerfect) {
                    newScore += 2000 * this.level
                }
            } else {
                // t-spin
                newScore += 400 * this.level
            }

            if (newCombo > 1) {
                newScore += this.level * (newCombo - 1) * 50
            }
        } else {
            newCombo = 0
        }
        return [newCombo, newScore, newClearCount, newRegret]
    }

    updateDropScore(dropCell, type) {
        if (type == 'soft') {
            this.score += dropCell
        } else if (type == 'hard') {
            this.score += 2 * dropCell
        }
    }

    stateMachine(action) {
        if (this.state == "begin") {
            this.level = this.beginLevel
            this.afterPause = null
            this.animations = []
            this.randomBlocks = []
            this.render.clearAnimation()
            this.stack = this.createEmptyStack()
            this.block = this.pickBlock()
            this.nextBlocks = [this.pickBlock(), this.pickBlock(), this.pickBlock()]
            this.hold = null
            this.holdTime = 0
            this.regretTime = 1
            const center = Math.floor(this.config.columnSize / 2)
            const boxWidth = this.block.boundingBoxWidth
            const x = 1
            const y = center - Math.ceil(boxWidth / 2)
            this.resetDelayTimer()
            this.position = [x, y]
            this.rotation = 0
            this.state = "dropping"
            this.score = 0
            this.comboCount = 0
            this.levelClearCount = 0
            this.clearCount = 0
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
            }
            const dropCell = nextMove[0] - this.position[0]
            this.updateDropScore(dropCell, dropType)
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
            if (this.regretTime > 0) {
                const center = Math.floor(this.config.columnSize / 2)
                const boxWidth = this.block.boundingBoxWidth
                const x = 1
                const y = center - Math.ceil(boxWidth / 2)
                this.resetDelayTimer()
                this.position = [x, y]
                this.rotation = 0
                this.regretTime -= 1
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

    clearTouch() {
        this.ongoingTouches = []
        this.touchNoMove = []
        this.ongoingTouchesStart = []
        this.touchTrace = []
        this.ongoingTouchesTime = []
    }

    control(key, type) {
        const keyMap = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowDown: "down",
            ArrowUp: "clockwise",
            Space: "hard_drop",
            MetaLeft: "hold",
            TouchLeft: "left",
            TouchRight: "right",
            TouchDrop: "hard_drop",
            TouchRegret: "regret",
            TouchDown: "down",
            TouchHold: "hold",
            TouchClockwise: "clockwise",
        }
        if (!(key in keyMap)) {
            return
        }
        let action = keyMap[key]
        let noPress = 1
        if (action in this.keyPressed && this.keyPressed[action] == 1) {
            noPress = 0
        }
        if (type == "down") {
            this.stateMachine(action)
            if (!this.render.isTouch) {
                this.keyPressed[action] = 1
                if (action == "left" || action == "right" || action == "down") {
                    if (noPress) {
                        const that = this
                        function pressFunc() {
                            if (that.keyPressed[action] == 1) {
                                that.stateMachine(action)
                                setTimeout(pressFunc, 30)
                            }
                        }
                        clearTimeout(this.keyTimer[action])
                        this.keyTimer[action] = setTimeout(pressFunc, 250)
                    }
                }
            }
        } else {
            if (!this.isTouch) {
                this.keyPressed[action] = 0
                clearTimeout(this.keyTimer[action])
                this.keyTimer[action] = null
            }
        }
    }

    async loadResource() {
        await this.render.loadResource()
    }
}


const game = new Game(animationCanvas, uiCanvas, canvas, gamePadCanvas, globalConfig)
window.addEventListener("load", function () {
    // 初始化 UI
    game.initializeUI().loadResource().then(function () {
        game.run(1)
        document.addEventListener('keydown', function (e) {
            game.control(e.code, 'down')
        })
        document.addEventListener('keyup', function (e) {
            game.control(e.code, 'up')
        })
        function onTouchStart(e) {
            var touches = e.changedTouches;
            for (let i = 0; i < touches.length; i++) {
                let t = touches[i] 
                game.ongoingTouches.push(t)
                game.ongoingTouchesStart.push(t)
                game.touchNoMove.push(true)
                game.touchTrace.push([])
                game.ongoingTouchesTime.push(Date.now())
            }
        }
        function onTouchMove(e) {
            var touches = e.changedTouches;
            const radius = 25
            for (let i = 0; i < touches.length; i++) {
                let t = touches[i]
                const idx = game.indexForOngoingTouch(t)
                if (idx != null) {
                    const yDiff = t.pageY - game.ongoingTouches[idx].pageY
                    const xDiff = t.pageX - game.ongoingTouches[idx].pageX
                    if (Math.abs(xDiff) <= radius && Math.abs(yDiff) <= radius) {
                        continue
                        /// swipe left
                    } else if (Math.abs(xDiff) > Math.abs(yDiff) && xDiff < -radius) {
                        game.control("TouchLeft", "down")
                        game.ongoingTouches[idx] = t
                        game.touchNoMove[idx] = false
                        // swipe right
                    } else if (Math.abs(xDiff) > Math.abs(yDiff) && xDiff > radius) {
                        game.control("TouchRight", "down")
                        game.ongoingTouches[idx] = t
                        game.touchNoMove[idx] = false
                    } else if (Math.abs(yDiff) > Math.abs(xDiff) && yDiff > radius) {
                        game.control("TouchDown", "down")
                        game.ongoingTouches[idx] = t
                        game.touchNoMove[idx] = false
                    }
                    const now = Date.now()
                    game.touchTrace[idx].push([now - game.ongoingTouchesTime[idx], [xDiff, yDiff]])
                    game.ongoingTouchesTime[idx] = now
                }
            }
        }
        function onTouchEnd(e) {
            var touches = e.changedTouches;
            const radius = 18
            for (let i = 0; i < touches.length; i++) {
                let t = touches[i] 
                const idx = game.indexForOngoingTouch(t)
                if (idx != null) {
                    const yDiff = t.pageY - game.ongoingTouchesStart[idx].pageY
                    const xDiff = t.pageX - game.ongoingTouchesStart[idx].pageX
                    if (Math.abs(xDiff) <= radius && Math.abs(yDiff) <= radius && game.touchNoMove[idx]) {
                        game.control("TouchClockwise", "down")
                    } else {
                        let lastSpeed = 0
                        let lastVec = [0, 0]
                        let distAccu = [0, 0]
                        let timeAccu = 0
                        for (let i = game.touchTrace[idx].length - 1; i >= 0; i--) {
                            distAccu[0] += game.touchTrace[idx][i][1][0]
                            distAccu[1] += game.touchTrace[idx][i][1][1]
                            timeAccu += game.touchTrace[idx][i][0]
                            if (timeAccu > 0) {
                                let s = Math.sqrt((distAccu[0] ** 2 + distAccu[1] ** 2)) / timeAccu
                                if (s > lastSpeed) {
                                    lastSpeed = s
                                    lastVec[0] = distAccu[0]
                                    lastVec[1] = distAccu[1]
                                }
                            }
                        }
                        if (lastSpeed > 1.2 && Math.abs(lastVec[1]) > Math.abs(lastVec[0]) && lastVec[1] > 1.3 * radius) {
                            game.control("TouchDrop", 'down')
                        } else if (lastSpeed > 1.2 && lastVec[1] < -2 * radius && 
                                   Math.abs(lastVec[1]) > Math.abs(lastVec[0])) {
                            game.control("TouchRegret", 'down')
                        }
                    }
                    game.ongoingTouches.splice(idx)
                    game.touchNoMove.splice(idx)
                    game.ongoingTouchesStart.splice(idx)
                    game.touchTrace.splice(idx)
                    game.ongoingTouchesTime.splice(idx)
                }
            }
        }
        // 触控事件
        document.addEventListener("touchstart", onTouchStart)
        document.addEventListener("touchmove", onTouchMove)
        document.addEventListener("touchend", onTouchEnd)
        document.addEventListener("touchcancel", onTouchEnd)
    })
    window.addEventListener("resize", function() { 
        game.initializeUI()
    });
})


