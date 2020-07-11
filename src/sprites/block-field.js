import { constants } from "../constants.js"
import { TBlock } from "../block.js"

// 下坠的block加上stack, 由外部操作
export class BlockField
{
    constructor(x, y, blockSize, context, blockImage) {
        this.colorPosition = { 
            red: 0, 
            blue: 1,
            yellow: 2,
            green: 3,
            cyan: 4,
            orange: 5,
            purple: 6,
            gray: 7
        }
        this.context = context
        this.virtualRows = constants.rows + 2
        this.rows = constants.rows
        this.cols = constants.cols
        this.relocate(x, y, blockSize, blockImage)
        this.clearAll()
    }

    clearAll() {
        this.stack = this.createEmptyStack()
        this.block = null
        this.blockRow = null
        this.blockCol = null
        this.tspin = false
        this.rotation = null
        this.predicted = null
        for (let i = 0; i < this.virtualRows; i++) {
            for (let j = 0; j < this.cols; j++) {
                this.dirtyMap[i][j] = true
            }
        }
    }

    cannotFall() {
        if (this.block != null && 
            this.block.collide(this.stack, this.blockRow + 1, this.blockCol, this.rotation)) {
            return true
        }
        return false
    }

    spawnNewBlock(newBlock) {
        this.markBlockDirty()
        this.markPredictDirty()
        this.block = newBlock
        const center = Math.floor(this.cols / 2)
        const boxWidth = this.block.boundingBoxWidth
        this.blockRow = 1
        this.blockCol = center - Math.ceil(boxWidth / 2)
        this.rotation = 0

        if (this.block.collide(this.stack, this.blockRow, this.blockCol, this.rotation)) {
            this.block = null
            this.predicted = null
            this.blockCol = null
            this.blockRow = null
            this.rotation = null
            return false
        } else {
            this.predicted = this.hardDropPosition()
            this.markBlockDirty()
            this.markPredictDirty()
            return true
        }
    }

    move(action) {
        this.tspin = false
        if (this.block == null) {
            return null
        }
        this.markBlockDirty()
        if (action == "clockwise" || action == "counter_clockwise" || action == "left"|| action == "right") {
            this.markPredictDirty()
        }
        const afterMove = this.block.move(this.stack, this.blockRow, this.blockCol, this.rotation, action) 
        const dropStep = afterMove[0] - this.blockRow
        const newRow = afterMove[0]
        const newCol = afterMove[1]
        const newRotation = afterMove[2]
        let moveType = "normal"
        if (newRow == this.blockRow && newCol == this.blockCol && newRotation == this.rotation) {
            moveType = "stuck"
        } else if ((action == "clockwise" || action == "counter_clockwise") && this.block == TBlock) {
            let corners = [
                [newRow, newCol],
                [newRow + 2, newCol],
                [newRow, newCol + 2],
                [newRow + 2, newCol + 2],
            ]
            let occupyCount = 0
            for (let c of corners) {
                // wall/floor kick 不算
                if (c[0] < 0 || c[0] >= this.virtualRows) {
                    continue
                }
                if (c[1] < 0 || c[1] >= this.cols) {
                    continue
                }
                if (this.stack[c[0]][c[1]] != null) {
                    occupyCount += 1
                } 
            }
            if (occupyCount >= 3) {
                moveType = "tspin"
                this.tspin = true
            }
        }
        this.blockRow = newRow
        this.blockCol = newCol
        this.rotation = newRotation
        if (action == "clockwise" || action == "counter_clockwise" || action == "left"|| action == "right") {
            this.predicted = this.hardDropPosition()
            this.markPredictDirty()
        }
        this.markBlockDirty()
        return {
            newRow: newRow, 
            newCol: newCol, 
            newRotation: newRotation, 
            dropStep: dropStep, 
            moveType: moveType
        }
    }

    TSpin() {
        return this.tspin
    }

    currentBlock() {
        return this.block
    }

    getFullLines() {
        let fullLines = []
        let perfect = true
        for (let i = 0; i < this.virtualRows; i++) {
            if (this.stack[i].every((e) => e !== null)) {
                fullLines.push(i)
            } else {
                perfect = false
            }
        }
        return [fullLines, perfect]
    }

    lockBlock() {
        let positions = this.block.positions(this.blockRow, this.blockCol, this.rotation)
        for (let p of positions) {
            this.stack[p[0]][p[1]] = this.block.style
        }
        this.block = null
        this.predicted = null
        this.blockRow = null
        this.blockCol = null
        this.rotation = null
    }

    hardDropPosition() {
        if (this.block == null) {
            return null
        }
        const hardDropPosition = this.block.move(this.stack, this.blockRow, this.blockCol, this.rotation, "hard_drop")
        return this.block.positions(hardDropPosition[0], hardDropPosition[1], hardDropPosition[2])
    }

    markStackAreaDirty() {
        let minRow = 0
        outer:
        for (let i = 0; i < this.virtualRows; i++) {
            for (let j = 0; j < this.cols; ++j) {
                if (this.stack[i][j] !== null) {
                    minRow = i
                    break outer
                }
            }
        }
        for (let i = minRow; i < this.virtualRows; i++) {
            for (let j = 0; j < this.cols; ++j) {
                this.dirtyMap[i][j] = true
            }
        }
    }

    clearLines(lines) {
        this.markStackAreaDirty()
        lines.sort()
        for (let i = lines.length - 1; i >= 0; i--) {
            this.stack.splice(lines[i], 1)
        }
        for (let i = 0; i < lines.length; i++) {
            let emptyLine = new Array(this.cols)
            for (let j = 0; j < this.cols; ++j) {
                emptyLine[j] = null
            }
            this.stack.unshift(emptyLine)
        }
    }

    markPredictDirty() {
        if (this.block === null) {
            return
        }
        for (let p of this.predicted) {
            this.dirtyMap[p[0]][p[1]] = true
        }
    }

    markBlockDirty() {
        if (this.block === null) {
            return
        }
        const positions = this.block.positions(this.blockRow, this.blockCol, this.rotation)
        for (let p of positions) {
            this.dirtyMap[p[0]][p[1]] = true
        }
    }

    createEmptyStack() {
        let stack = []
        for (let i = 0; i < this.virtualRows; i++) {
            let current = new Array(this.cols)
            for (let j = 0; j < this.cols; ++j) {
                current[j] = null
            }
            stack.push(current);
        }
        return stack
    }

    relocate(x, y, blockSize, blockImage) {
        this.x = x
        this.y = y
        this.blockSize = blockSize
        this.blockImage = blockImage
        this.dirtyMap = []
        for (let i = 0; i < this.virtualRows; i++) {
            let line = new Array(this.cols)
            for (let j = 0; j < this.cols; j++) {
                line[j] = true
            }
            this.dirtyMap.push(line)
        }
    }

    draw() {
        // draw block
        if (this.block != null) {
            for (let p of this.predicted) {
                if (this.dirtyMap[p[0]][p[1]]) {
                    this.clearBlock(p[0], p[1])
                    this.drawBlock(p[0], p[1], this.block.style, 0.3)
                }
            }
            const positions = this.block.positions(this.blockRow, this.blockCol, this.rotation)
            for (let p of positions) {
                if (this.dirtyMap[p[0]][p[1]]) {
                    this.drawBlock(p[0], p[1], this.block.style, 1.0)
                    this.dirtyMap[p[0]][p[1]] = false
                }
            }
            for (let p of this.predicted) {
                if (this.dirtyMap[p[0]][p[1]]) {
                    this.dirtyMap[p[0]][p[1]] = false
                }
            }
        }
        // draw stack
        for (let i = 0; i < this.virtualRows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.dirtyMap[i][j]) {
                    this.clearBlock(i, j)
                    if (this.stack[i][j] != null) {
                        this.drawBlock(i, j, this.stack[i][j], 1.0)
                    }
                    this.dirtyMap[i][j] = false
                }
            }
        }
    }

    clearBlock(row, col) {
        if (row < 2) {
            return
        }
        const x = col * this.blockSize + this.x
        const y = (row - 2) * this.blockSize + this.y
        this.context.clearRect(x, y, this.blockSize, this.blockSize)
    }

    drawBlock(row, col, style, trans) {
        if (row < 2) {
            return
        }
        const x = col * this.blockSize + this.x
        const y = (row - 2) * this.blockSize + this.y
        const offset = this.colorPosition[style]
        this.context.save()
        if (trans < 1.0) {
            this.context.globalAlpha = trans
        }
        this.context.drawImage(this.blockImage, offset * this.blockSize, 0,
                               this.blockSize, this.blockSize, x, y, this.blockSize, this.blockSize)
        this.context.restore()
    }
}