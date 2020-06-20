'use strict';

const globalConfig = {
    lines: 22, // 俄罗斯方块行数 
    columnSize: 10,
    blockSizeInPixels: 30,
    lockDelay: 500 // lock delay 毫秒数
}
var canvas = document.getElementById("game");

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

class Renderer {

    constructor(convas, config) {
        this.canvas = canvas
        this.config = config
        this.width = 1024
        this.gameWidth = this.config.blockSizeInPixels * this.config.columnSize
        this.height = this.config.blockSizeInPixels * this.config.lines
    
        this.canvas.width = this.width
        this.canvas.height = this.height + 1
        this.gameX = (this.width - this.gameWidth) / 2
        this.gameY = 0
    }

    async loadResource() {
        this.skin = {} 
        this.skin.image = await loadImage("block.png")
        this.skin.blockSize = 133
        this.skin.colorPosition = {
            blue: [666, 0],
            red: [1333, 399],
            orange: [1463, 0],
            cyan: [0, 133],
            yellow: [1729, 0],
            purple: [798, 532],
            green: [266, 532],
        }
    }

    drawUI() {
        const ctx = this.canvas.getContext('2d')
        ctx.fillStyle = '#404040'
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        ctx.fillStyle = 'black'
        ctx.fillRect(this.gameX, this.gameY, this.gameWidth, this.height)
        // 画网格
        for (var i = 1; i < this.config.columnSize; ++i) {
            ctx.strokeStyle = 'gray'
            ctx.lineWidth = 1
            ctx.beginPath();
            ctx.moveTo(this.gameX + i * this.config.blockSizeInPixels, this.gameY)
            ctx.lineTo(this.gameX + i * this.config.blockSizeInPixels, this.height + this.gameY)
            ctx.stroke(); 
        }
        for (var i = 1; i < this.config.lines; ++i) {
            ctx.strokeStyle = 'gray'
            ctx.lineWidth = 1
            ctx.beginPath();
            ctx.moveTo(this.gameX, this.gameY + i * this.config.blockSizeInPixels)
            ctx.lineTo(this.gameX + this.gameWidth, this.gameY + i * this.config.blockSizeInPixels)
            ctx.stroke(); 
        }
        ctx.strokeStyle = '#18de02'
        ctx.lineWidth = 4
        ctx.strokeRect(this.gameX, this.gameY + 2, this.gameWidth, this.height - 2)
        return this;
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


class Game {

    constructor(canvas, config) {
        this.candidates = [JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock]
        this.config = config
        this.render = new Renderer(canvas, config)
        this.state = "begin"
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
        for (var i = 0; i < positions.length; ++i) {
            this.stack[positions[i][0]][positions[i][1]] = this.block.style
        }
    }

    clearLines() {
        var lineCount = 0
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
                lineCount += 1
            }
        }
        if (lineCount == 0) {
            for (var i = 0; i < positions.length; ++i) {
                newStack[positions[i][0]][positions[i][1]] = null
            }
        }
        this.stack = newStack
        return lineCount
    }

    drawAllBlock() {
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
        if (this.state == "begin" && action == "fall") {
            // 初始化方块
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
                    if (this.clearLines() > 0) {
                        this.state = "restart"
                        this.block = null
                        this.restartFallTimer()
                    }
                }
            } else if (action != "other_key") {
                const nextMove = this.block.move(this.stack, this.position[0], this.position[1], this.rotation, action)
                this.position = [nextMove[0], nextMove[1]]
                this.rotation = nextMove[2]
                if (!this.block.collide(this.stack, this.position[0] + 1, this.position[1], this.rotation)) {
                    this.landing = false
                    if (action == "hard_drop") {
                        this.lockBlock()
                        this.restartFallTimer()
                    }
                } else {
                    this.landing = true
                    if (this.clearLines() > 0) {
                        this.state = "restart"
                        this.block = null
                    } else if (action == "hard_drop") {
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
        } else if (this.state == "over" && action == "over") {
            alert("over!")
            this.state = "begin"
        }
        this.render.drawUI()
        this.drawAllBlock()
    }

    control(key) {
        const keyMap = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowDown: "down",
            ArrowUp: "hard_drop",
            KeyZ: "counter_clockwise",
            KeyX: "clockwise"
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

const game = new Game(canvas, globalConfig)
game.ready().then(function () {

    // game.test()
    game.run(10)
    document.addEventListener('keydown', function (e) {
        game.control(e.code)
    })
    
})


