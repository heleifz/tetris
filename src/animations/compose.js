
export class ComposeAnimation {

    constructor(animations, onFinish) {
        this.animations = []
        for (let a of animations) {
            this.animations.push(a)
        }
        this.onFinish = onFinish || (() => {})
        this.isFinished = false
    }

    finished() {
        return this.isFinished
    }

    play() {
        const current = this.isFinished
        if (!current) {
            this.isFinished = true
            for (let a of this.animations) {
                a.play()
                if (!a.finished()) {
                    this.isFinished = false
                }
            }
            if (this.isFinished && current != this.isFinished) {
                this.onFinish()
            }
        }
    }

}