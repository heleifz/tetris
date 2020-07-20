import canvas from "../canvas.js"
import { RandomColorParticle } from "./particle-system.js"

// 清空一行的动画
export class ClearLineAnimation
{
    constructor(x, y, width, height, durationInFrames, onFinish) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.duration = durationInFrames
        this.progress = 1
        this.onFinish = onFinish || (() => {})
        this.isFinished = false
        this.manager = null
        this.firstPhase = Math.round(this.duration * 0.4)
        this.secondPhase = this.duration - this.firstPhase

        this.particleSize = Math.round(this.height * 0.25)
    }

    setManager(m) {
        this.manager = m
    }

    finished() {
        return this.isFinished
    }

    clear() {
        const ctx = canvas.animation
        ctx.clearRect(this.x, this.y, this.width, this.height)
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
        const particleNum = 4
        const ctx = canvas.animation
        // 第一阶段：变亮
        if (this.progress <= this.firstPhase) {
            ctx.save()
            const trans = this.progress / this.firstPhase
            ctx.fillStyle = "rgba(255,255,255," + trans + ")";
            ctx.restore()
        // 第二阶段：化作彩色粒子飞散消失
        } else {
            if (this.progress == this.firstPhase + 1) {
                canvas.sprite.clearRect(this.x, this.y, this.width, this.height)
            }
            let ctx = canvas.animation
            ctx.save()
            const trans = 1.0 - ((this.progress - this.firstPhase) / this.secondPhase)
            ctx.fillStyle = "rgba(255,255,255," + trans + ")";
            const drawWidth = this.width * (1.0 - (this.progress - this.firstPhase) / this.secondPhase)
            const drawX = this.x + Math.round((this.width - drawWidth) / 2)
            ctx.fillRect(drawX, this.y, drawWidth, this.height)
            for (let i = 0; i < particleNum; ++i) {
                this.manager.particles.add(new RandomColorParticle(this.particleSize), 
                    drawX, this.y + Math.round(this.height / 2), (90 + (135 - 90) * Math.random()), 10 + 5 * Math.random(), 20, 35)
                this.manager.particles.add(new RandomColorParticle(this.particleSize), 
                    drawX + drawWidth, this.y + Math.round(this.height / 2), 45 + (90 - 45) * Math.random(), 10 + 5 * Math.random(), 20, 35)
            }
            ctx.restore()
        }
        this.progress += 1
    }
}