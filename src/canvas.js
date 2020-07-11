import { isTouchDevice } from "./util.js"

// 管理所有canvas，并处理高清屏的情况
export class Canvas
{
    constructor() {
        this.dpr = window.devicePixelRatio || 1
        this.uiCanvas = document.getElementById("ui")
        this.spriteCanvas = document.getElementById("game")
        this.animationCanvas = document.getElementById("animation");
        this.virutalCanvas = document.createElement('canvas')
    }

    getUiContext() {
        return this.uiCanvas.getContext('2d')
    }

    getSpriteContext() {
        return this.spriteCanvas.getContext('2d')
    }

    getAnimationContext() {
        return this.animationCanvas.getContext('2d')
    }

    getVirtualCanvas() {
        return this.virutalCanvas
    }

    getViewPort() {
        this.setUpAllCanvas()
        const canvasWidth = window.innerWidth * this.dpr
        const canvasHeight = window.innerHeight * this.dpr
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
        this.getSpriteContext().clearRect(0, 0, w, h)
        this.getUiContext().clearRect(0, 0, w, h)
        this.getAnimationContext().clearRect(0, 0, w, h)
    }

    setUpAllCanvas() {
        this.uiCanvas = this.setUpCanvas(this.uiCanvas)
        this.spriteCanvas = this.setUpCanvas(this.spriteCanvas)
        this.animationCanvas = this.setUpCanvas(this.animationCanvas)
    }

    setUpCanvas(canvas) {
        let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
        let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
        canvas.height = style_height * this.dpr
        canvas.width = style_width * this.dpr
        return canvas
    }
}