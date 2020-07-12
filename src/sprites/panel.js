import { TitleBar } from "./title-bar.js"
import canvas from "../canvas.js"

export class Panel
{
    constructor(x, y, width, height, titleHeight, title, content) {
        this.titleBar = new TitleBar(x, y, width, titleHeight, title)
        this.content = content
        this.relocate(x, y, width, height, titleHeight)
    } 

    setContent(content) {
        if (content === this.content) {
            return
        }
        this.content = content
        this.contentDirty = true
    }

    relocate(x, y, width, height, titleHeight) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.titleHeight = titleHeight
        this.uiDirty = true
        this.contentDirty = true
        this.titleBar.relocate(x, y, width, titleHeight)
    }

    draw() {
        this.titleBar.draw()
        if (this.uiDirty) {
            let ctx = canvas.ui
            ctx.clearRect(this.x, this.y + this.titleHeight, 
                this.width, this.height - this.titleHeight)
            ctx.save()
            ctx.fillStyle = 'rgb(0,0,0,0.6)'
            ctx.fillRect(this.x,  this.y + this.titleHeight, this.width, 
                this.height - this.titleHeight)
            ctx.restore()
            this.uiDirty = false
        }
        if (this.contentDirty) {
            let ctx = canvas.sprite
            ctx.save()
            ctx.fillStyle = "white"
            ctx.clearRect(this.x, this.y + this.titleHeight, this.width, 
                this.height - this.titleHeight)
            ctx.font = this.calculateFontSize(this.content) + "px ka1";
            ctx.fillText(this.content, this.x + 2, this.y + 2 * this.titleHeight)
            this.contentDirty = false
            ctx.restore()
        }
    }

    calculateFontSize(text) {
        const ctx = canvas.sprite
        let fontSize = this.titleHeight - 3
        while (fontSize > 3){
            ctx.font = fontSize + "px ka1";
            let textMetric = ctx.measureText(text);
            if (textMetric.width + 5 < this.width) {
                break
            }
            fontSize -= 1
        }
        return fontSize
    }

}