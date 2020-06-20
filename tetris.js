'use strict';

const globalConfig = {
    lines: 22, // 俄罗斯方块行数 
    columnSize: 10,
    blockSizeInPixels: 30,
    lockDelay: 500 // lock delay 毫秒数
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
        ctx.fillStyle = '#404040'
        ctx.fillRect(0, 0, this.uiCanvas.width, this.uiCanvas.height)

        ctx.fillStyle = 'black'
        ctx.fillRect(this.gameX, this.gameY, this.gameWidth, this.height)
        // 画网格
        for (var i = 1; i < this.config.columnSize; ++i) {
            ctx.strokeStyle = 'rgb(40,40,40)'
            ctx.lineWidth = 1
            ctx.beginPath();
            ctx.moveTo(this.gameX + i * this.config.blockSizeInPixels, this.gameY)
            ctx.lineTo(this.gameX + i * this.config.blockSizeInPixels, this.height + this.gameY)
            ctx.stroke(); 
        }
        for (var i = 1; i < this.config.lines; ++i) {
            ctx.strokeStyle = 'rgb(40,40,40)'
            ctx.lineWidth = 1
            ctx.beginPath();
            ctx.moveTo(this.gameX, this.gameY + i * this.config.blockSizeInPixels)
            ctx.lineTo(this.gameX + this.gameWidth, this.gameY + i * this.config.blockSizeInPixels)
            ctx.stroke(); 
        }
        // ctx.strokeStyle = '#18de02'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1
        ctx.strokeRect(this.gameX, this.gameY + 2, this.gameWidth, this.height - 2)
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

    drawBlock(row, col, style) {
        var x = col * this.config.blockSizeInPixels + this.gameX
        var y = (row - 2) * this.config.blockSizeInPixels + this.gameY
        const ctx = this.canvas.getContext('2d')
        const offset = this.skin.colorPosition[style]
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
        this.kickRule = kickRule
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

    // row, col = bounding box 左上角的坐标
    positions(row, col, rotation) {
        var mod = 0
        if (rotation < 0) {
            mod = (4 - (-rotation % 4)) % 4
        } else {
            mod = rotation % 4
        }
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

    // 方块操作代码
    move(stack, row, col, rotation, action) {
        var newRow = row
        var newCol = col
        var newRotation = rotation
        if (action == "clockwise") {
            newRotation += 1
        } else if (action == "counter_clockwise") {
            newRotation -= 1
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

], null, 'blue')

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

], null, 'red')

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

], null, 'orange')

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

], null, 'cyan')

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

], null, 'purple')

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

], null, 'green')

const gameOverAnimation = function () {
    var progress = 0
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
    var progress = 0
    return function (game) {

        const ctx = game.render.getAnimationContext()
        if (progress < 14) {
            for (var i in lines) {
                const row = lines[i]

                var x = game.render.gameX
                var y = (row - 2) * game.config.blockSizeInPixels + game.render.gameY
                var height = game.config.blockSizeInPixels
                var width = game.render.gameWidth
                if (progress <= 7) {
                    const trans = progress / 7.0
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                } else {
                    if (progress == 8) {
                        game.render.eraseLine(row)
                    }
                    const trans = 1.0 - ((progress - 7) / 6.0)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                    height = height * (1.0 - (progress - 7) / 6.0)
                    width = width * (1.0 - (progress - 7) / 6.0)
                    y = y + (game.config.blockSizeInPixels - height) / 2
                    x = x + (game.render.gameWidth - width) / 2
                }
                ctx.fillRect(x, y, width, height)
            }
            progress += 1
        } else if (progress == 14) {
            if (game.afterPause !== null) {
                game.afterPause()
                game.afterPause = null
            }
            return null
        }
    }
}

function highlightAnimation(positions) {
    var progress = 0

    return function (game) {
        if (progress < 16) {
            const ctx = game.render.getAnimationContext()
            for (var i in positions) {
                const p = positions[i]
                var x = p[1] * game.config.blockSizeInPixels + game.render.gameX
                var y = (p[0] - 2) * game.config.blockSizeInPixels + game.render.gameY
                if (progress <= 8) {
                    const trans = 0.8 * (progress / 8)
                    const strokeTrans =  0.8 * (progress / 8)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                    ctx.strokeStyle = "rgba(255,255,255," + strokeTrans + ")";
                } else {
                    const trans = 0.8 - 0.8 * ((progress - 8) / 7.0)
                    const strokeTrans = 0.8 - 0.8 * ((progress - 8) / 7.0)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                    ctx.strokeStyle = "rgba(255,255,255," + strokeTrans + ")";
                }
                ctx.fillRect(x, y, game.config.blockSizeInPixels, game.config.blockSizeInPixels)
                ctx.strokeRect(x, y, game.config.blockSizeInPixels, game.config.blockSizeInPixels)
            }
            progress += 1
        } else {
            return null
        }
    }
}

function hardDropAnimation(positions, render) {
    var progress = 0 

    var minRow = null
    var minCol = null
    var maxCol = null

    // 计算下坠线所处的位置
    for (var i in positions) {
        const p = positions[i]
        const row = p[0]
        const col = p[1]
        console.log("row", row)
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
    console.log(minRow)

    const minX = render.gameX + minCol * render.config.blockSizeInPixels
    const maxX = render.gameX + (maxCol + 1) * render.config.blockSizeInPixels
    const endY = render.gameY + (minRow - 2) * render.config.blockSizeInPixels - 5

    console.log(minX, maxX, minCol, maxCol)

    var dropLines = []
    const lineHeight = 100
    for (var x = minX; x <= maxX; x += (maxX - minX) / 3) {
        dropLines.push([x + 20 * (0.5 - Math.random()), endY - lineHeight - Math.random() * 5, 3, lineHeight * (1 - 0.1 * Math.random())])
    }
    return function (game) {
        const ctx = game.render.getAnimationContext()
        if (progress < 8) {
            for (var i in dropLines) {
                const line = dropLines[i]
                var gradient = ctx.createLinearGradient(line[0], line[1], line[0], line[1] + lineHeight)
                var pos = 0.7 * progress / 8
                gradient.addColorStop(pos, "rgb(80,80,80,0)")
                gradient.addColorStop(0.7, "rgb(80,80,80,1.0)");
                gradient.addColorStop(1, "rgb(80,80,80,0)");
                ctx.fillStyle = gradient;
                ctx.fillRect(line[0], line[1], line[2], line[3])
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
        this.restartFallTimer()
        const that = this;
        setInterval(function () {
            that.lockDelay()  
        }, 50)
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

    restartFallTimer() {
        clearTimeout(this.fallTimerId)
        this.levelTime = rowSpeedForLevel(this.level)
        const that = this;
        this.fallTimerId = setTimeout(function () {
            that.stateMachine("fall")
            that.restartFallTimer()
        }, this.levelTime);
    }

    lockDelay() {
        if (this.landing === true && this.state == "dropping") {
            this.delayCounter += 1
            if (this.delayCounter >= this.maxDelayCounter) {
                this.lockBlock()
            }
        }
    }

    lockBlock() {
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
                                      this.block.style)
            }
        }
        for (var i = 0; i < this.stack.length; i++) {
            for (var j = 0; j < this.stack[i].length; ++j) {
                if (this.stack[i][j] !== null) {
                    this.render.drawBlock(i, j, this.stack[i][j])
                }
            }
        }
    }

    stateMachine(action) {
        if (this.state == "begin") {
            // 初始化方块
            this.afterPause = null
            this.animations = []
            this.render.clearAnimation()
            this.stack = this.createEmptyStack()
            this.block = this.candidates[Math.floor(Math.random() * this.candidates.length)];
            const center = Math.floor(this.config.columnSize / 2)
            const boxWidth = this.block.boundingBoxWidth
            const x = 0
            const y = center - Math.ceil(boxWidth / 2)
            this.delayCounter = 0
            this.maxDelayCounter = Math.round(this.config.lockDelay / 50)
            this.position = [x, y]
            this.rotation = 0
            this.landing = false
            this.state = "dropping"
        } else if (this.state == "dropping") {
            if (action == "fall")  {
                if (!this.block.collide(this.stack, this.position[0] + 1, this.position[1], this.rotation)) {
                    this.position[0] += 1
                }
                if (!this.block.collide(this.stack, this.position[0] + 1, this.position[1], this.rotation)) {
                    this.landing = false
                } else {
                    this.landing = true
                    const clearResult = this.clearLines()
                    if (clearResult[0].length > 0) {
                        this.state = "pause_game"
                        this.animations.push(clearLineAnimation(clearResult[0]))
                        this.restartFallTimer()
                        this.afterPause = function () {
                            this.state = "restart"
                            this.block = null
                            this.stack = clearResult[1]
                        }
                    }
                }
            } else if (action != "other_key") {
                const nextMove = this.block.move(this.stack, this.position[0], this.position[1], this.rotation, action)
                this.position = [nextMove[0], nextMove[1]]
                this.rotation = nextMove[2]
                if (!this.block.collide(this.stack, this.position[0] + 1, this.position[1], this.rotation)) {
                    this.landing = false
                    if (action == "hard_drop") {
                        var positions = this.block.positions(this.position[0], this.position[1], this.rotation)
                        this.animations.push(hardDropAnimation(positions, this.render))
                        this.lockBlock()
                        this.restartFallTimer()
                    }
                } else {
                    this.landing = true
                    const clearResult = this.clearLines()
                    if (clearResult[0].length > 0) {
                        this.state = "pause_game"
                        this.animations.push(clearLineAnimation(clearResult[0]))
                        this.restartFallTimer()
                        this.afterPause = function () {
                            this.state = "restart"
                            this.block = null
                            this.stack = clearResult[1]
                        }
                    } else if (action == "hard_drop") {
                        var positions = this.block.positions(this.position[0], this.position[1], this.rotation)
                        this.animations.push(hardDropAnimation(positions, this.render))
                        this.lockBlock()
                    }
                    this.restartFallTimer()
                }
            }
        } else if (this.state == "restart" && action == "fall") {
            // 初始化方块
            this.block = this.candidates[Math.floor(Math.random() * this.candidates.length)];
            const center = Math.floor(this.config.columnSize / 2)
            const boxWidth = this.block.boundingBoxWidth
            const x = 1
            const y = center - Math.ceil(boxWidth / 2)
            this.delayCounter = 0
            this.maxDelayCounter = Math.round(this.config.lockDelay / 50)
            this.position = [x, y]
            this.rotation = 0
            this.landing = false

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

    control(key) {
        const keyMap = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowDown: "down",
            ArrowUp: "clockwise",
            Space: "hard_drop"
        }
        if (key in keyMap) {
            this.stateMachine(keyMap[key])
        } else {
            this.stateMachine("other_key")
        }
            
    }

    async ready() {
        await this.render.loadResource()
    }
}

const game = new Game(animationCanvas, uiCanvas, canvas, globalConfig)
game.ready().then(function () {

    // game.test()
    game.run(5)
    document.addEventListener('keydown', function (e) {
        console.log(e.code)
        game.control(e.code)
    })
    
})


