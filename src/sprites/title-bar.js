import canvas from "../canvas.js"

export class TitleBar
{
	constructor(x, y, width, height, title) {
		this.title = title
		this.relocate(x, y, width, height)
	}

	relocate(x, y, width, height) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.textDirty = true
		this.uiDirty = true
	}

	draw() {
        if (this.uiDirty) {
			let ctx = canvas.ui
            ctx.clearRect(this.x, this.y, this.width, this.height)
            ctx.save()
            ctx.fillStyle = 'rgb(0,0,0,0.85)'
            ctx.fillRect(this.x, this.y, this.width, this.height)
            ctx.restore()
            this.uiDirty = false
		}
		if (this.textDirty) {
			let ctx = canvas.sprite
            ctx.save()
            ctx.clearRect(this.x, this.y, this.width, this.height)
            ctx.fillStyle = "white"
			ctx.font = (this.height + 1) + "px pixeboy";
			ctx.fillText(this.title, this.x, this.y + this.height);
            ctx.restore()
			this.textDirty = false
		}
	}
}