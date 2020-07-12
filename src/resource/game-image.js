import skin from "../assets/img/lego-3.png"

export class GameImage
{
    constructor() {
        this.virutalCanvas = {}
        this.colors = 7
        this.colorPosition = { 
            red: 0, 
            blue: 1,
            yellow: 2,
            green: 3,
            cyan: 4,
            orange: 5,
            purple: 6,
            gray: 7
        }
    }

    async load() {
        this.blockImage = await this.loadImage(skin)
    }

    loadImage(path) {
        return new Promise(function (resolve) {
            const img = new Image()
            img.src = path
            img.onload = function () {
                resolve(img)
            }
        });
    }

    prerenderSkin(blockSize) {
        let virutalCanvas = document.createElement('canvas')
        virutalCanvas.height = blockSize
        virutalCanvas.width = blockSize * this.colors
        virutalCanvas.getContext('2d').drawImage(this.blockImage, 0, 0, 
            blockSize * this.colors, blockSize)
        this.virutalCanvas[blockSize] = virutalCanvas
    }

    drawBlock(context, x, y, blockSize, style, trans) {
        if (!(blockSize in this.virutalCanvas)) {
            this.prerenderSkin(blockSize)
        }
        const image = this.virutalCanvas[blockSize]
        const offset = this.colorPosition[style]
        context.save()
        if (trans < 1.0) {
            context.globalAlpha = trans
        }
        context.drawImage(image, offset * blockSize, 0,
                          blockSize, blockSize, x, y, blockSize, blockSize)
        context.restore()
    }

}