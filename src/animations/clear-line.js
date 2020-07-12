import canvas from "../canvas.js"

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

        this.particleSize = Math.round(this.height * 0.2)
    }

    finished() {
        return this.isFinished
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
        const particleNum = 8
        const ctx = canvas.animation
        // 第一阶段：变亮
        if (this.progress <= this.firstPhase) {
            ctx.save()
            ctx.clearRect(this.x, this.y, this.width, this.height)
            const trans = this.progress / this.firstPhase
            ctx.fillStyle = "rgba(255,255,255," + trans + ")";
            ctx.fillRect(this.x, this.y, this.width, this.height)
            ctx.restore()
        // 第二阶段：化作彩色粒子飞散消失
        } else {
            if (this.progress == this.firstPhase + 1) {
                canvas.sprite.clearRect(this.x, this.y, this.width, this.height)
            }
            let ctx = canvas.animation
            ctx.save()
            ctx.clearRect(this.x, this.y, this.width, this.height)
            const trans = 1.0 - ((this.progress - this.firstPhase) / this.secondPhase)
            ctx.fillStyle = "rgba(255,255,255," + trans + ")";
            const drawWidth = this.width * (1.0 - (this.progress - this.firstPhase) / this.secondPhase)
            const drawX = this.x + Math.round((this.width - drawWidth) / 2)
            ctx.fillRect(drawX, this.y, drawWidth, this.height)
            // for (let i = 0; i < particleNum; ++i) {
            //     let particle = createParticle(randomColorBlockParticle(particleSize, game.render), 
            //         x, y + game.render.blockSizeInPixels / 2, (90 + (135 - 90) * Math.random()), 10 + 5 * Math.random(), 30, 20, 40)
            //     game.animations.push(particle)
            //     particle = createParticle(randomColorBlockParticle(particleSize, game.render), 
            //         x + width, y + game.render.blockSizeInPixels / 2, 45 + (90 - 45) * Math.random(), 10 + 5 * Math.random(), 30, 20, 40)
            //     game.animations.push(particle)
            // }
            ctx.restore()
        }
        this.progress += 1
    }
}