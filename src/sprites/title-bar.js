export class TitleBar
{
	constructor(x, y, width, height, title, uiContext, textContext) {
		this.uiContext = uiContext
		this.textContext = textContext
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
            this.uiContext.clearRect(this.x, this.y, this.width, this.height)
            this.uiContext.save()
            this.uiContext.fillStyle = 'rgb(0,0,0,0.85)'
            this.uiContext.fillRect(this.x, this.y, this.width, this.height)
            this.uiContext.restore()
            this.uiDirty = false
		}
		if (this.textDirty) {
            this.textContext.save()
            this.textContext.clearRect(this.x, this.y, this.width, this.height)
            this.textContext.fillStyle = "white"
			this.textContext.font = (this.height + 1) + "px pixeboy";
			this.textContext.fillText(this.title, this.x, this.y + this.height);
            this.textContext.restore()
			this.textDirty = false
		}
	}
}