export class KeyBoardInput
{
    onGameEvent(e) {
    }

    keyControl(keyCode, type) {
        if (!(keyCode in this.keyMap)) {
            return
        }
        const action = this.keyMap[keyCode]
        if (type == "down") {
            let noPress = 1
            if (action in this.keyPressed && this.keyPressed[action] == 1) {
                noPress = 0
            }
            this.callback(action)
            this.keyPressed[action] = 1
            if (action == "left" || action == "right" || action == "down") {
                if (noPress) {
                    const that = this
                    function pressFunc() {
                        if (that.keyPressed[action] == 1) {
                            that.callback(action)
                            setTimeout(pressFunc, 30)
                        }
                    }
                    clearTimeout(this.keyTimer[action])
                    this.keyTimer[action] = setTimeout(pressFunc, 250)
                }
            }
        } else {
            this.keyPressed[action] = 0
            clearTimeout(this.keyTimer[action])
            this.keyTimer[action] = null
        }
    }

    install(callback) {
        this.keyPressed = {}
        this.keyTimer = {}
        this.callback = callback
        this.keyMap = {
            ArrowLeft: "left",
            ArrowRight: "right",
            ArrowDown: "down",
            ArrowUp: "clockwise",
            Space: "hard_drop",
            MetaLeft: "hold",
            KeyX: "regret"
        }
        let that = this
        document.addEventListener('keydown', (e) => {
            that.keyControl(e.code, 'down')
        })
        document.addEventListener('keyup', (e) => {
            that.keyControl(e.code, 'up')
        })
    }
}

export class TouchInput
{
    onGameEvent(e) {
        if (e == "lockblock") {
            this.clearTouch()
        }
    }

    clearTouch() {
        this.ongoingTouches = []
        this.touchNoMove = []
        this.ongoingTouchesStart = []
        this.touchTrace = []
        this.ongoingTouchesTime = []
    }

    indexForOngoingTouch(touch) {
        const id = touch.identifier
        for (let i = 0; i < this.ongoingTouches.length; i++) {
            if (this.ongoingTouches[i].identifier == id) {
                return i
            }
        }
        return null
    }
    
    onTouchStart(e, callback) {
        callback("touch")
        var touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            let t = touches[i] 
            this.ongoingTouches.push(t)
            this.ongoingTouchesStart.push(t)
            this.touchNoMove.push(true)
            this.touchTrace.push([])
            this.ongoingTouchesTime.push(Date.now())
        }
    }

    onTouchMove(e, callback) {
        var touches = e.changedTouches;
        const radius = 18
        for (let i = 0; i < touches.length; i++) {
            let t = touches[i]
            const idx = this.indexForOngoingTouch(t)
            if (idx != null) {
                const yDiff = t.pageY - this.ongoingTouches[idx].pageY
                const xDiff = t.pageX - this.ongoingTouches[idx].pageX
                let action = null
                if (Math.abs(xDiff) > Math.abs(yDiff) && xDiff < -radius) {
                    action = "left"
                } else if (Math.abs(xDiff) > Math.abs(yDiff) && xDiff > radius) {
                    action = "right"
                } else if (Math.abs(yDiff) > Math.abs(xDiff) && yDiff > radius) {
                    action = "down"
                }
                if (action !== null) {
                    this.ongoingTouches[idx] = t
                    this.touchNoMove[idx] = false
                    callback(action)
                }
                const now = Date.now()
                this.touchTrace[idx].push([now - this.ongoingTouchesTime[idx], [xDiff, yDiff]])
                this.ongoingTouchesTime[idx] = now
            }
        }
    }

    onTouchEnd(e, callback) {
        var touches = e.changedTouches;
        const radius = 18
        for (let i = 0; i < touches.length; i++) {
            let t = touches[i] 
            const idx = this.indexForOngoingTouch(t)
            if (idx != null) {
                const yDiff = t.pageY - this.ongoingTouchesStart[idx].pageY
                const xDiff = t.pageX - this.ongoingTouchesStart[idx].pageX
                if (Math.abs(xDiff) <= radius && Math.abs(yDiff) <= radius && this.touchNoMove[idx]) {
                    callback("clockwise")
                } else {
                    let lastSpeed = 0
                    let lastVec = [0, 0]
                    let distAccu = [0, 0]
                    let timeAccu = 0
                    for (let i = this.touchTrace[idx].length - 1; i >= 0; i--) {
                        distAccu[0] += this.touchTrace[idx][i][1][0]
                        distAccu[1] += this.touchTrace[idx][i][1][1]
                        timeAccu += this.touchTrace[idx][i][0]
                        if (timeAccu > 0) {
                            let s = Math.sqrt((distAccu[0] ** 2 + distAccu[1] ** 2)) / timeAccu
                            if (s > lastSpeed) {
                                lastSpeed = s
                                lastVec[0] = distAccu[0]
                                lastVec[1] = distAccu[1]
                            }
                        }
                    }
                    if (lastSpeed > 1.2 && Math.abs(lastVec[1]) > Math.abs(lastVec[0]) && lastVec[1] > 1.3 * radius) {
                        callback("hard_drop")
                    } else if (lastSpeed > 1.2 && lastVec[1] < -2 * radius && 
                                Math.abs(lastVec[1]) > Math.abs(lastVec[0])) {
                        callback("regret")
                    }
                }
                this.ongoingTouches.splice(idx)
                this.touchNoMove.splice(idx)
                this.ongoingTouchesStart.splice(idx)
                this.touchTrace.splice(idx)
                this.ongoingTouchesTime.splice(idx)
            }
        }
    }

    install(callback) {
        this.clearTouch()
        const that = this
        // 触控事件
        document.addEventListener("touchstart", (e) => {
            that.onTouchStart(e, callback)
        })
        document.addEventListener("touchmove", (e) => {
            that.onTouchMove(e, callback)
        })
        document.addEventListener("touchend", (e) => {
            that.onTouchEnd(e, callback)
        })
        document.addEventListener("touchcancel", (e) => {
            that.onTouchEnd(e, callback)
        })
    }
}