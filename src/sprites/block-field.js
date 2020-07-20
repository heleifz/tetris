import { constants } from "../constants.js"
import resource from "../resource/resource.js"
import canvas from "../canvas.js"

// 下坠的block加上stack, 由外部操作
export class BlockField
{
    constructor(x, y, blockSize) {
        this.rows = constants.rows + constants.hiddenRows
        this.cols = constants.cols
        this.newState = this.createEmptyField()
        this.relocate(x, y, blockSize)
    }

    createEmptyField() {
        let newState = []
        for (let i = 0; i < this.rows; i++) {
            let line = new Array(this.cols)
            for (let j = 0; j < this.cols; j++) {
                line[j] = null
            }
            newState.push(line)
        }
        return newState
    }

    setBlockField(blockPositions, predictedPositions, blockStyle, stack) {
        this.newState = this.createEmptyField()
        for (let p of predictedPositions) {
            this.newState[p[0]][p[1]] = [blockStyle, 0.2]
        }
        for (let p of blockPositions) {
            this.newState[p[0]][p[1]] = [blockStyle, 1]
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (stack[i][j] !== null) {
                    this.newState[i][j] = [stack[i][j], 1]
                }
            }
        }
    }

    relocate(x, y, blockSize) {
        this.x = x
        this.y = y
        this.blockSize = blockSize
        this.lastState = this.createEmptyField()
    }

    setRedrawLines(lines) {
        for (let l of lines) {
            for (let i = 0; i < this.cols; ++i) {
                this.lastState[l][i] = null
            }
        }
    }

    clear() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const s0 = this.lastState[i][j]
                const s1 = this.newState[i][j]
                if (s0 == null && s1 == null || 
                    (s0 != null && s1 != null && s0[0] == s1[0] && s0[1] == s1[1])) 
                {
                } else {
                    this.clearBlock(i, j)
                }
            }
        }
    }

    draw() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const s0 = this.lastState[i][j]
                const s1 = this.newState[i][j]
                // 只重绘有 diff 的部分
                if (s0 == null && s1 == null || 
                    (s0 != null && s1 != null && s0[0] == s1[0] && s0[1] == s1[1])) 
                {  // do nothing
                } else {
                    if (s1 != null) {
                        this.drawBlock(i, j, s1[0], s1[1])
                    }
                }
            }
        }
        this.lastState = this.newState  
    }

    clearBlock(row, col) {
        if (row < 2) {
            return
        }
        const x = col * this.blockSize + this.x
        const y = (row - 2) * this.blockSize + this.y
        canvas.sprite.clearRect(x, y, this.blockSize, this.blockSize)
    }

    drawBlock(row, col, style, trans) {
        if (row < 2) {
            return
        }
        const x = col * this.blockSize + this.x
        const y = (row - 2) * this.blockSize + this.y
        resource.image.drawBlock(canvas.sprite, x, y, this.blockSize, style, trans)
    }
}