import { TitleBar } from "./title-bar.js"

export class Panel
{
    constructor(x, y, width, height, titleHeight, title, content, uiContext, textContext) {
        this.titleBar = new TitleBar(x, y, width, titleHeight, title, uiContext, textContext)
        this.content = content
        this.uiContext = uiContext
        this.textContext = textContext
        this.relocate(x, y, width, height, titleHeight)
    } 

    setContent(content) {
        if (content == this.content) {
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
            this.uiContext.clearRect(this.x, this.y + this.titleHeight, 
                this.width, this.height - this.titleHeight)
            this.uiContext.save()
            this.uiContext.fillStyle = 'rgb(0,0,0,0.6)'
            this.uiContext.fillRect(this.x,  this.y + this.titleHeight, this.width, 
                this.height - this.titleHeight)
            this.uiContext.restore()
            this.uiDirty = false
        }
        if (this.contentDirty) {
            this.textContext.save()
            this.textContext.fillStyle = "white"
            this.textContext.clearRect(this.x, this.y + this.titleHeight, this.width, 
                this.height - this.titleHeight)
            this.textContext.font = this.calculateFontSize(this.content) + "px ka1";
            this.textContext.fillText(this.content, this.x + 2, this.y + 2 * this.titleHeight)
            this.contentDirty = false
            this.textContext.restore()
        }
    }

    calculateFontSize(text) {
        const ctx = this.textContext
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