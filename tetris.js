'use strict';

const globalConfig = {
    lines: 22, // 俄罗斯方块行数 
    columnSize: 10,
    blockSizeInPixels: 30,
    lockDelay: 500, // lock delay 毫秒数
    preview: true // 下坠预览
}
var uiCanvas = document.getElementById("ui");
var canvas = document.getElementById("game");
var animationCanvas = document.getElementById("animation");

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
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

// 彩色纸片飞散效果
class Particle {
}

class Renderer {

    constructor(animationCanvas, uiCanvas, canvas, config) {
        this.animationCanvas = animationCanvas
        this.uiCanvas = uiCanvas
        this.canvas = canvas
        this.config = config
        this.width = 1024
        this.gameWidth = this.config.blockSizeInPixels * this.config.columnSize
        this.height = this.config.blockSizeInPixels * this.config.lines
    
        this.canvas.width = this.width
        this.canvas.height = this.height + 1
        this.uiCanvas.width = this.width
        this.uiCanvas.height = this.height + 1
        this.animationCanvas.width = this.width
        this.animationCanvas.height = this.height + 1
        
        this.gameX = (this.width - this.gameWidth) / 2
        this.gameY = 0
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
        return this.animationCanvas.getContext('2d')
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
        for (var i = 1; i < this.config.columnSize; ++i) {
            ctx.strokeStyle = 'rgb(60,60,60)'
            ctx.lineWidth = 1
            ctx.beginPath();
            ctx.moveTo(this.gameX + i * this.config.blockSizeInPixels, this.gameY)
            ctx.lineTo(this.gameX + i * this.config.blockSizeInPixels, this.height + this.gameY)
            ctx.stroke(); 
        }
        for (var i = 1; i < this.config.lines; ++i) {
            ctx.strokeStyle = 'rgb(60,60,60)'
            ctx.lineWidth = 1
            ctx.beginPath();
            ctx.moveTo(this.gameX, this.gameY + i * this.config.blockSizeInPixels)
            ctx.lineTo(this.gameX + this.gameWidth, this.gameY + i * this.config.blockSizeInPixels)
            ctx.stroke(); 
        }
        return this;
    }

    eraseLine(row) {
        var x = this.gameX
        var y = (row - 2) * this.config.blockSizeInPixels + this.gameY
        var height = this.config.blockSizeInPixels
        var width = this.gameWidth
        const ctx = this.canvas.getContext('2d')
        ctx.clearRect(x, y, width, height)
    }

    drawBlock(row, col, style, trans) {
        var x = col * this.config.blockSizeInPixels + this.gameX
        var y = (row - 2) * this.config.blockSizeInPixels + this.gameY
        const ctx = this.canvas.getContext('2d')
        const offset = this.skin.colorPosition[style]
        ctx.globalAlpha = trans
        ctx.drawImage(this.skin.image, offset[0], offset[1], this.skin.blockSize, this.skin.blockSize, 
                      x, y, this.config.blockSizeInPixels, this.config.blockSizeInPixels)
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

        for (var i = 0; i < shapes.length; ++i) {
            const shape = shapes[i]
            const offset = []
            for (var j = 0; j < shape.length; ++j) {
                for (var k = 0; k < shape[j].length; ++k) {
                    if (shape[j][k] == 1) {
                        offset.push([j, k])
                    }
                }
            }
            this.offsets.push(offset)
        }
    }

    getRotationNumber(rotation) {
        var mod
        if (rotation < 0) {
            mod = (4 - (-rotation % 4)) % 4
        } else {
            mod = rotation % 4
        }
        return mod 
    }

    // row, col = bounding box 左上角的坐标
    positions(row, col, rotation) {
        var mod = this.getRotationNumber(rotation)
        const offset = this.offsets[mod]
        var result = [];
        for (var i = 0; i < offset.length; ++i) {
            var p = offset[i];
            result.push([row + p[0], col + p[1]])
        }
        return result
    }

    collide(stack, row, col, rotation) {
        const newPosition = this.positions(row, col, rotation) 
        for (var i = 0; i < newPosition.length; ++i) {
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
        for (var i in seq) {
            const offset = seq[i]
            if (!this.collide(stack, row - offset[1], col + offset[0], to)) {
                return [row - offset[1], col + offset[0], to]
            }
        }
        console.log("fail..")
        return [row, col, from] 
    }

    // 方块操作代码
    move(stack, row, col, rotation, action) {
        var newRow = row
        var newCol = col
        var newRotation = rotation
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
            var positions = this.positions(row, col, rotation)
            var minDrop = stack.length - 1
            for (var i = 0; i < positions.length; ++i) {
                var currentCol = positions[i][1]
                var currentRow = positions[i][0]
                minDrop = Math.min(minDrop, stack.length - currentRow - 1)
                for (var r = currentRow + 1; r < stack.length; ++r) {
                    if (stack[r][currentCol] !== null) {
                        var drop = r - currentRow - 1
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

var JBlock = new BlockType([
    
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

var ZBlock = new BlockType([ 

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

var LBlock = new BlockType([ 

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

var IBlock = new BlockType([ 
   
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

var OBlock = new BlockType([ 
   
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

var TBlock = new BlockType([ 

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

var SBlock = new BlockType([ 

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
    var progress = 1
    return function (game) {
        const ctx = game.render.getAnimationContext()
        const height = game.render.height 
        const width = game.render.width
        const bannerHeight = 200 * (progress / 20.0)
        const trans = 0.8 * (progress / 20.0)

        ctx.fillStyle = "rgba(50,50,50," + trans + ")";
        ctx.fillRect(0, (height - bannerHeight) / 2, width, bannerHeight)

        if (progress > 10) {
            ctx.font = "48px courier";
            ctx.fillStyle = "rgba(251,226,81," + ((progress - 10)/10) + ")";
            const textMetric = ctx.measureText("GAME OVER");
            ctx.fillText("GAME OVER", (width - textMetric.width) / 2, (height + 18) / 2);
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
    var toClear = lines
    var progress = 1
    return function (game) {

        const ctx = game.render.getAnimationContext()
        if (progress < 18) {
            for (var i in lines) {
                const row = lines[i]

                var x = game.render.gameX
                var y = (row - 2) * game.config.blockSizeInPixels + game.render.gameY
                var height = game.config.blockSizeInPixels
                var width = game.render.gameWidth
                if (progress <= 9) {
                    const trans = progress / 9.0
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                } else {
                    if (progress == 10) {
                        game.render.eraseLine(row)
                    }
                    const trans = 1.0 - ((progress - 9) / 8.0)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                    height = height * (1.0 - (progress - 9) / 8.0)
                    width = width * (1.0 - (progress - 9) / 8.0)
                    y = y + (game.config.blockSizeInPixels - height) / 2
                    x = x + (game.render.gameWidth - width) / 2
                }
                ctx.fillRect(x, y, width, height)
            }
            progress += 1
        } else if (progress == 18) {
            if (game.afterPause !== null) {
                game.afterPause()
                game.afterPause = null
            }
            return null
        }
    }
}

function highlightAnimation(positions) {
    var progress = 1

    return function (game) {
        if (progress < 16) {
            const ctx = game.render.getAnimationContext()
            for (var i in positions) {
                const p = positions[i]
                var x = p[1] * game.config.blockSizeInPixels + game.render.gameX
                var y = (p[0] - 2) * game.config.blockSizeInPixels + game.render.gameY
                if (progress <= 8) {
                    const trans = 0.8 * (progress / 8)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                } else {
                    const trans = 0.8 - 0.8 * ((progress - 8) / 7.0)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                }
                ctx.fillRect(x, y, game.config.blockSizeInPixels, game.config.blockSizeInPixels)
            }
            progress += 1
        } else {
            return null
        }
    }
}

function hardDropAnimation(positions, render) {
    var progress = 1 

    var minRow = null
    var minCol = null
    var maxCol = null

    // 计算下坠线所处的位置
    for (var i in positions) {
        const p = positions[i]
        const row = p[0]
        const col = p[1]
        if (minRow == null || row < minRow) {
            minRow = row
        }
        if (minCol == null || col < minCol) {
            minCol = col 
        }
        if (maxCol == null || col > maxCol) {
           maxCol = col 
        }
    }

    const minX = render.gameX + minCol * render.config.blockSizeInPixels
    const maxX = render.gameX + (maxCol + 1) * render.config.blockSizeInPixels
    const endY = render.gameY + (minRow - 2) * render.config.blockSizeInPixels - 5

    var dropLines = []
    const lineHeight = 100
    for (var x = minX; x <= maxX; x += 20) {
        for (var i = 0; i < 2; ++i) {
            const realX = x + 30 * (0.5 - Math.random())
            if (realX < (game.render.gameX + game.render.gameWidth) && realX > game.render.gameX) {
                dropLines.push([realX, endY - lineHeight - Math.random() * 150, 6 * Math.random(), lineHeight * (1 - 0.1 * Math.random())])
            }
        }
    }
    return function (game) {
        const ctx = game.render.getAnimationContext()
        if (progress < 8) {
            for (var i in dropLines) {
                const line = dropLines[i]
                const lineY = line[1] - 0.5 * lineHeight * (progress / 8.0)
                var gradient = ctx.createLinearGradient(line[0], lineY, line[0], lineY + line[3])
                var pos = 0.7 * progress / 8
                gradient.addColorStop(pos, "rgb(80,80,80,0)")
                gradient.addColorStop(0.7, "rgb(100,100,100,0.5)");
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

    constructor(animationCanvas, uiCanvas, canvas, config) {
        this.candidates = [JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock]
        this.config = config
        this.render = new Renderer(animationCanvas, uiCanvas, canvas, config)
        this.state = "begin"
        this.animations = []
        this.render.drawUI()
        this.afterPause = null
        this.keyPressed = {}
        this.keyTimer = {}
    }

    createEmptyStack(showLines) {
        var stack = []
        for (var i = 0; i < this.config.lines + 2; i++) {
            var current = []
            for (var j = 0; j < this.config.columnSize; ++j) {
                current.push(null);
            }
            stack.push(current);
        }
        return stack
    }

    run(level) {
        this.level = level
        this.resetFallTimer()
        const that = this;
        // 全局动画处理
        setInterval(function () {
            that.doAnimation()  
        }, 16)
    }

    doAnimation() {
        this.render.clearAnimation()
        if (this.animations.length == 0) {
            return
        }
        var newAnimation = []
        for (var i = 0; i < this.animations.length; ++i) {
            const animation = this.animations[i]
            const runResult = animation(this) 
            if (runResult !== null) {
                newAnimation.push(animation)
            }
        }
        this.animations = newAnimation
    }

    resetFallTimer() {
        clearTimeout(this.fallTimerId)
        this.levelTime = rowSpeedForLevel(this.level)
        const that = this;
        this.fallTimerId = setTimeout(function () {
            that.stateMachine("fall")
            that.resetFallTimer()
        }, this.levelTime);
    }

    lockBlock() {
        if (this.block == null) {
            return
        }
        this.state = "restart"
        var positions = this.block.positions(this.position[0], this.position[1], this.rotation)
        this.animations.push(highlightAnimation(positions))
        for (var i = 0; i < positions.length; ++i) {
            this.stack[positions[i][0]][positions[i][1]] = this.block.style
        }
    }

    clearLines() {
        var cleared = []
        var newStack = this.createEmptyStack()
        var realLine = newStack.length - 1
        var positions = this.block.positions(this.position[0], this.position[1], this.rotation)
        for (var i = 0; i < positions.length; ++i) {
            this.stack[positions[i][0]][positions[i][1]] = this.block.style
        }
        for (var i = this.stack.length - 1; i >= 0; i--) {
            var good = false
            for (var j = 0; j < this.config.columnSize; ++j) {
                if (this.stack[i][j] === null) {
                    good = true
                    break
                }
            }
            if (good) {
                for (var j = 0; j < this.config.columnSize; ++j) {
                    newStack[realLine][j] = this.stack[i][j]
                }
                realLine -= 1
            } else {
                cleared.push(i)
            }
        }
        if (cleared.length == 0) {
            for (var i = 0; i < positions.length; ++i) {
                this.stack[positions[i][0]][positions[i][1]] = null
            }
        }
        return [cleared, newStack]
    }
      
    drawAllElements() {
        this.render.clearElements()
        if (this.block !== null) {
            var positions = this.block.positions(this.position[0], this.position[1], this.rotation)
            for (var i = 0; i < positions.length; ++i) {
                this.render.drawBlock(positions[i][0], positions[i][1], 
                                      this.block.style, 1.0)
            }
        }
        if (this.state == "dropping" && this.config.preview == true) {
            const hardDropPosition = this.block.move(this.stack, this.position[0], this.position[1], this.rotation, "hard_drop")
            if (hardDropPosition[0] != this.position[0] || hardDropPosition[1] != this.position[1]) {
                var predicted = this.block.positions(hardDropPosition[0], hardDropPosition[1], hardDropPosition[2])
                for (var i = 0; i < predicted.length; ++i) {
                    this.render.drawBlock(predicted[i][0], predicted[i][1], this.block.style, 0.3)
                }
            }
        }
        for (var i = 0; i < this.stack.length; i++) {
            for (var j = 0; j < this.stack[i].length; ++j) {
                if (this.stack[i][j] !== null) {
                    this.render.drawBlock(i, j, this.stack[i][j], 1.0)
                }
            }
        }
    }

    resetDelayTimer() {
        clearTimeout(this.lockDelayTimer)
        const that = this
        this.lockDelayTimer = setTimeout(function () {
            that.lockBlock()
        }, this.config.lockDelay)
    }

    pickBlock() {
        if (this.randomBlocks.length == 0) {
            for (var i in this.candidates) {
                this.randomBlocks.push(this.candidates[i])
            }
            shuffle(this.randomBlocks)
        }
        return this.randomBlocks.shift()
    }

    stateMachine(action) {
        if (this.state == "begin") {
            this.afterPause = null
            this.animations = []
            this.randomBlocks = []
            this.render.clearAnimation()
            this.stack = this.createEmptyStack()
            this.block = this.pickBlock()
            const center = Math.floor(this.config.columnSize / 2)
            const boxWidth = this.block.boundingBoxWidth
            const x = 0
            const y = center - Math.ceil(boxWidth / 2)
            this.resetDelayTimer()
            this.position = [x, y]
            this.rotation = 0
            this.state = "dropping"
        } else if (this.state == "dropping") {
            if (action == "fall")  {
                if (!this.block.collide(this.stack, this.position[0] + 1, this.position[1], this.rotation)) {
                    this.position[0] += 1
                    this.resetDelayTimer()
                }
                const clearResult = this.clearLines()
                if (clearResult[0].length > 0) {
                    this.state = "pause_game"
                    this.animations.push(clearLineAnimation(clearResult[0]))
                    this.resetFallTimer()
                    this.afterPause = function () {
                        this.state = "restart"
                        this.block = null
                        this.stack = clearResult[1]
                    }
                }
            } else {
                const nextMove = this.block.move(this.stack, this.position[0], this.position[1], this.rotation, action)
                if (nextMove[0] != this.position[0] || nextMove[1] != this.position[1] || nextMove[2] != this.rotation) {
                    this.resetDelayTimer()
                }
                this.position = [nextMove[0], nextMove[1]]
                this.rotation = nextMove[2]
                if (action == "hard_drop") {
                    var positions = this.block.positions(this.position[0], this.position[1], this.rotation)
                    this.animations.push(hardDropAnimation(positions, this.render))
                }
                if (!this.block.collide(this.stack, this.position[0] + 1, this.position[1], this.rotation)) {
                    if (action == "hard_drop") {
                        this.lockBlock()
                        this.resetFallTimer()
                    }
                } else {
                    const clearResult = this.clearLines()
                    if (clearResult[0].length > 0) {
                        this.state = "pause_game"
                        this.animations.push(clearLineAnimation(clearResult[0]))
                        this.afterPause = function () {
                            this.state = "restart"
                            this.block = null
                            this.stack = clearResult[1]
                        }
                    } else if (action == "hard_drop") {
                        this.lockBlock()
                    }
                    this.resetFallTimer()
                }
            }
        } else if (this.state == "restart" && action == "fall") {
            // 初始化方块
            this.block = this.pickBlock()
            const center = Math.floor(this.config.columnSize / 2)
            const boxWidth = this.block.boundingBoxWidth
            const x = 1
            const y = center - Math.ceil(boxWidth / 2)
            this.resetDelayTimer()
            
            this.position = [x, y]
            this.rotation = 0

            if (this.block.collide(this.stack, this.position[0], this.position[1], this.rotation)) {
                this.state = "over"
                this.block = null
                this.stateMachine("over")
            } else {
                this.state = "dropping"
            }
        } else if (this.state == "over") {
            if (action == "over") {
                var allLines = []
                for (var i = 0; i < this.stack.length; ++i) {
                    allLines.push(i)
                }
                this.animations.push(gameOverAnimation())
                this.animations.push(clearLineAnimation(allLines))
                this.afterPause = function() {
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
        this.drawAllElements()
    }

    control(key, type) {
        const keyMap = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowDown: "down",
            ArrowUp: "clockwise",
            Space: "hard_drop"
        }
        if (!(key in keyMap)) {
            return
        }
        var action = keyMap[key]
        var noPress = 1
        if (action in this.keyPressed && this.keyPressed[action] == 1) {
            noPress = 0
        }
        if (type == "down") {
            this.keyPressed[action] = 1
            this.stateMachine(action)
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
                    this.keyTimer[action] = setTimeout(pressFunc, 150)
                }
            }
        } else {
            this.keyPressed[action] = 0
            clearTimeout(this.keyTimer[action])
            this.keyTimer[action] = null
        }
    }

    async ready() {
        await this.render.loadResource()
    }
}

const game = new Game(animationCanvas, uiCanvas, canvas, globalConfig)
game.ready().then(function () {

    game.run(5)
    document.addEventListener('keydown', function (e) {
        game.control(e.code, 'down')
    })
    document.addEventListener('keyup', function (e) {
        game.control(e.code, 'up')
    })
    
})


