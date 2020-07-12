import { isTouchDevice } from "./util.js"

export default new Canvas()

// 管理所有canvas，并处理高清屏的情况
class Canvas
{
    constructor() {
        this.dpr = window.devicePixelRatio || 1
        this.uiCanvas = document.getElementById("ui")
        this.spriteCanvas = document.getElementById("game")
        this.animationCanvas = document.getElementById("animation");
        this.ui = this.uiCanvas.getContext('2d')
        this.sprite = this.spriteCanvas.getContext('2d')
        this.animation = this.animationCanvas.getContext('2d')
    }

    refreshViewPort() {
        this.setUpAllCanvas()
        const isTouch = isTouchDevice()
        return {
            width: this.uiCanvas.width,
            height: this.uiCanvas.height,
            isTouch: isTouch,
            dpr: this.dpr
        }
        
    }
    
    clearAll() {
        const w = this.spriteCanvas.width
        const h = this.spriteCanvas.height
        this.sprite.clearRect(0, 0, w, h)
        this.ui.clearRect(0, 0, w, h)
        this.animation.clearRect(0, 0, w, h)
    }

    setUpAllCanvas() {
        this.setUpCanvas(this.uiCanvas)
        this.setUpCanvas(this.spriteCanvas)
        this.setUpCanvas(this.animationCanvas)
    }

    setUpCanvas(canvas) {
        let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
        let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
        canvas.height = style_height * this.dpr
        canvas.width = style_width * this.dpr
    }
}