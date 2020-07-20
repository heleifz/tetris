import canvas from "../canvas.js"

export class RandomColorParticle
{
    constructor(size) {
        let candidateColor = ["rgb(255,29,88)", "rgb(24,89,144)", "rgb(255,246,133)", "rgb(0,221,255)", "rgb(0,73,183)"]
        this.color = candidateColor[Math.floor(Math.random() * candidateColor.length)]
        this.size = size
        this.progress = 0
        this.duration = 0
    }

    setDuration(dur) {
        this.duration = dur
    }

    finished() {
        return this.progress >= this.duration
    }

    boundingBox(x, y) {
        return [x, y, this.size, this.size]
    }

    draw(x, y) {
        if (this.finished()) {
            return
        }
        const trans = 1.0 - (this.progress / this.duration)
        const ctx = canvas.animation
        ctx.save()
        ctx.fillStyle = this.color
        ctx.globalAlpha = trans
        ctx.fillRect(x, y, this.size, this.size)
        this.progress += 1
        ctx.restore()
    }
}

// 清空一行的动画
export class ParticleSystem
{
    constructor() {
        this.particles = []
    }

    // 将所有粒子的最小外接矩形作为清空重绘区域
    boundingBox() {
        let minX = null
        let maxX = null
        let minY = null
        let maxY = null
        for (let p of this.particles) {
            let xPos = p.x + p.xInitSpeed * p.progress
            let yPos = p.y + p.yInitSpeed * p.progress + 0.01 * p.gravity * (p.progress * p.progress)
            let [x, y, w, h] = p.particle.boundingBox(xPos, yPos)
            if (minX == null || x < minX) {
                minX = x
            } 
            if (maxX == null || x + w > maxX) {
                maxX = x + w
            }
            if (minY == null || y < minY) {
                minY = y
            } 
            if (maxY == null || y + h > maxY) {
                maxY = y + h
            }
        }
        return [minX, minY, maxX - minX + 1, maxY - minY + 1]
    }

    clear() {
        if (this.particles.length > 0) {
            let [x, y, w, h] = this.boundingBox()
            let ctx = canvas.animation
            ctx.clearRect(x, y, w, h)
        }
    }

    play() {
        let newPart = []
        for (let p of this.particles) {
            if (p.progress < p.duration) {
                p.progress += 1
                newPart.push(p)
                let x = p.x + p.xInitSpeed * p.progress
                let y = p.y + p.yInitSpeed * p.progress + 0.01 * p.gravity * (p.progress * p.progress)
                p.particle.draw(x, y)
            }
        }
        this.particles = newPart
    }

    add(particle, x, y, angleInDegree, speed, gravity, duration) {
        const angle = 2 * Math.PI - (((angleInDegree % (360)) / 360) * (2 * Math.PI))
        particle.setDuration(duration)
        this.particles.push({
            particle: particle,
            progress: 0,
            duration: duration,
            gravity: gravity,
            x: x,
            y: y,
            xInitSpeed: Math.cos(angle) * speed,
            yInitSpeed: Math.sin(angle) * speed,
        })
    }

}