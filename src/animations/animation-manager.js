export class AnimationManager
{
    constructor() {
        this.animations = []
    }

    add(animation) {
        animation.manager = this
        this.animations.push(animation)
    }

    play() {
        let newAnimation = []
        for (let i = 0; i < this.animations.length; ++i) {
            const animation = this.animations[i]
            animation.play()
            if (!animation.finished()) {
                newAnimation.push(animation)
            }
        }
        this.animations = newAnimation
    }

}