import canvas from "../canvas.js"
import { constants } from "../constants.js"
import { easeOutQuint } from "../util.js"

// 快速下落的动画
export class HardDropAnimation
{
    constructor(x, y, blockSize, positions, durationInFrames, onFinish) {
        this.x = x
        this.y = y
        this.blockSize = blockSize
        this.positions = positions
        this.duration = durationInFrames
        this.progress = 1
        this.onFinish = onFinish || (() => {})
        this.isFinished = false
        this.manager = null

        this.boundary = this.getBoundary(x, y, blockSize, positions)
        this.clearBox = [this.boundary[1], y, this.boundary[2] - this.boundary[1], this.boundary[3] - y]
    }

    getBoundary(x, y, blockSize, positions) {
        let minRows = {}
        let maxRow = 0
        let minRow = constants.rows + constants.hiddenRows
        for (let p of positions) {
            const row = p[0]
            const col = p[1]
            if (!(col in minRows)) {
                minRows[col] = row
            } else {
                minRows[col] = Math.min(row, minRows[col])
            }
            maxRow = Math.max(row, maxRow)
            minRow = Math.min(row, minRow)
        }
        let res = []
        for (let c in minRows) {
            res.push([y + (minRows[c] - constants.hiddenRows) * blockSize, x + c * blockSize])
        }
        res.sort((a, b) => a[1] - b[1])
        return [res, 
                res[0][1], 
                res[res.length - 1][1] + blockSize,
                y + (maxRow - constants.hiddenRows) * blockSize, 
                y + (minRow - constants.hiddenRows) * blockSize]
    }

    setManager(m) {
        this.manager = m
    }

    finished() {
        return this.isFinished
    }

    clear() {
        const ctx = canvas.animation
        ctx.clearRect(this.clearBox[0], this.clearBox[1], this.clearBox[2], this.clearBox[3])
    }

    play() {
        const ctx = canvas.animation
        if (this.progress > this.duration) {
            if (!this.isFinished) {
                this.isFinished = true
                if (this.onFinish) {
                    this.clear()
                    this.onFinish()
                }
            }
            return
        }
        ctx.save()
        for (let b of this.boundary[0]) {
            const lineHeight = Math.round(this.blockSize * 6)
            let gradient = ctx.createLinearGradient(b[1], this.boundary[4] + Math.round(this.blockSize * 1.2), 
                                                    b[1], this.boundary[4] - lineHeight + Math.round(this.blockSize * 1.2))
            let pos = 0.6 - easeOutQuint(this.progress, 0.1, 0.5, this.duration)
            let trans = 1.0 - this.progress / this.duration
            gradient.addColorStop(pos, "rgb(80,80,80," + trans + ")");
            gradient.addColorStop(1, "rgb(0,0,0,0)");
            ctx.fillStyle = gradient;
            const y = Math.max(this.y, b[0] - lineHeight)
            const h = Math.min(b[0] - y, lineHeight)
            ctx.fillRect(b[1], y, this.blockSize, h)
        }
        this.progress += 1
        ctx.restore()
    }
}