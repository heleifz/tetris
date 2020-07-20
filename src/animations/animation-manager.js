import { ParticleSystem } from "./particle-system.js"

export class AnimationManager
{
    constructor() {
        this.animations = []
        this.particles = new ParticleSystem()
    }

    add(animation) {
        animation.setManager(this)
        this.animations.push(animation)
    }

    play() {
        for (let i = 0; i < this.animations.length; ++i) {
            const animation = this.animations[i]
            animation.clear()
        }
        this.particles.clear()
        let newAnimation = []
        for (let i = 0; i < this.animations.length; ++i) {
            const animation = this.animations[i]
            animation.play()
            if (!animation.finished()) {
                newAnimation.push(animation)
            }
        }
        this.animations = newAnimation
        this.particles.play()
    }

}