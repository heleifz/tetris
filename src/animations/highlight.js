import canvas from "../canvas.js"
import { constants } from "../constants.js"

// 清空一行的动画
export class HighLightAnimation
{
    constructor(x, y, blockSize, positions, durationInFrames, onFinish) {
        this.x = x
        this.y = y
        this.blockSize = blockSize
        this.positions = positions
        this.duration = durationInFrames
        this.progress = 1
        this.firstPhase = Math.round(this.duration * 0.5)
        this.onFinish = onFinish || (() => {})
        this.isFinished = false
        this.manager = null
    }

    finished() {
        return this.isFinished
    }

    setManager(m) {
        this.manager = m
    }

    clear() {
        const ctx = canvas.animation
        for (let p of this.positions) {
            let x = p[1] * this.blockSize + this.x
            let y = (p[0] - constants.hiddenRows) * this.blockSize + this.y
            ctx.clearRect(x, y, this.blockSize, this.blockSize)
        }
    }

    play() {
        if (this.progress > this.duration) {
            if (!this.isFinished) {
                this.isFinished = true
                if (this.onFinish) {
                    this.onFinish()
                }
            }
            return
        }
        const ctx = canvas.animation
        ctx.save()
        for (let p of this.positions) {
            if (p[0] < constants.hiddenRows) {
                continue
            }
            let x = p[1] * this.blockSize + this.x
            let y = (p[0] - constants.hiddenRows) * this.blockSize + this.y
            if (this.progress <= this.firstPhase) {
                const trans = 0.8 * (this.progress / this.firstPhase)
                ctx.fillStyle = "rgba(255,255,255," + trans + ")";
            } else {
                const trans = 0.8 - 0.8 * ((this.progress - this.firstPhase) / (this.duration - this.firstPhase))
                ctx.fillStyle = "rgba(255,255,255," + trans + ")";
            }
            ctx.fillRect(x, y, this.blockSize, this.blockSize)
        }
        ctx.restore()
        this.progress += 1
    }
}