import { constants } from "../constants.js"

export class Board
{
    constructor(x, y, width, height, blockSize, context) {
        this.context = context
        this.relocate(x, y, width, height, blockSize)
    } 

    relocate(x, y, width, height, blockSize) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.blockSize = blockSize
        this.dirty = true
    }

    draw() {
        if (this.dirty) {
            const ctx = this.context
            ctx.save()
            ctx.fillStyle = 'rgb(0,0,0,0.8)'
            ctx.fillRect(this.x, this.y, this.width, this.height)
            // 画网格
            ctx.strokeStyle = 'rgb(60,60,60)'
            ctx.lineWidth = 2
            ctx.beginPath()
            for (let i = 1; i < constants.cols; ++i) {
                ctx.moveTo(this.x + i * this.blockSize, this.y)
                ctx.lineTo(this.x + i * this.blockSize, this.height + this.y)
            }
            for (let i = 1; i < constants.rows; ++i) {
                ctx.moveTo(this.x, this.y + i * this.blockSize)
                ctx.lineTo(this.x + this.width, this.y + i * this.blockSize)
            }
            ctx.stroke()
            ctx.restore()
            this.dirty = false
        }
    }

}