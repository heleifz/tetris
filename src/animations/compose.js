
export class ComposeAnimation {

    constructor(animations, onFinish) {
        this.animations = []
        for (let a of animations) {
            this.animations.push(a)
        }
        this.onFinish = onFinish || (() => {})
        this.isFinished = false
    }

    setManager(m) {
        for (let a of this.animations) {
            a.setManager(m)
        }
    }

    finished() {
        return this.isFinished
    }

    clear() {
        for (let a of this.animations) {
            a.clear()
        }
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