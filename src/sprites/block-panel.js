import { boundingBox } from "../util.js"
import { Panel } from "./panel.js"

export class BlockPanel
{
    constructor(x, y, width, height, titleHeight, title, blocks, 
                blockImage, imageBlockSize, uiContext, spriteContext) {
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
        this.panel = new Panel(x, y, width, height, titleHeight, 
                               title, "", uiContext, spriteContext)
        this.title = title
        this.uiContext = uiContext
        this.spriteContext = spriteContext
        this.relocate(x, y, width, height, titleHeight, blockImage, imageBlockSize)
        this.setBlocks(blocks)
    } 
    
    setBlocks(blocks) {
        let changed = false
        if (!this.blocks || (blocks.length != this.blocks.length)) {
            changed = true
        } else {
            for (let i = 0; i < this.blocks.length; i++) {
                console.log(blocks[i], this.blocks[i])
                if (blocks[i] != this.blocks[i]) {
                    changed = true
                    break
                }
            }
        }
        if (changed) {
            this.blocks = []
            for (let b of blocks) {
                this.blocks.push(b)
            }
            this.blockDirty = true
        }
    }

    relocate(x, y, width, height, titleHeight, blockImage, imageBlockSize) {
        this.panel.relocate(x, y, width, height, titleHeight)
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.titleHeight = titleHeight
        this.blockImage = blockImage
        this.imageBlockSize = imageBlockSize
        this.blockDirty = true
    }

    draw() {
        this.panel.draw()
        if (this.blockDirty) {
            this.spriteContext.save()
            this.spriteContext.clearRect(this.x, this.y + this.titleHeight, this.width, this.height - this.titleHeight)
            this.drawBlocks()
            this.blockDirty = false
            this.spriteContext.restore()
        }
    }

    drawBlocks() {
        // 方块 rotation=0 的时候，都可以放入 2 * 4 的区域 
        // 1. 尝试 fit 宽度
        const blockSize1 = Math.round((this.width * 0.8) / 4)
        // 2. 尝试 fit 高度
        const blockSize2 = Math.round(((this.height - this.titleHeight) / this.blocks.length) * 0.85 / 2)
        // 选一个最小的，保证能装入
        const blockSize = Math.min(blockSize1, blockSize2)
        const windowHeight = Math.round((this.height - this.titleHeight) / this.blocks.length)
        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i] 
            const positions = block.positions(0, 0, 0)
            const [minRow, maxRow, minCol, maxCol] = boundingBox(positions)
            const width = (maxCol - minCol + 1) * blockSize
            const height = (maxRow - minRow + 1) * blockSize
            const xOffSet = Math.round((this.width - width) / 2)
            const yOffSet = Math.round((windowHeight - height) / 2)

            const offset = this.colorPosition[block.style]

            const originX = this.x
            const originY = this.y + this.titleHeight + i * windowHeight

            for (let i = 0; i < positions.length; ++i) {
                let x = (positions[i][1] - minCol) * blockSize + originX + xOffSet
                let y = (positions[i][0] - minRow) * blockSize + originY + yOffSet
                this.spriteContext.drawImage(this.blockImage, offset * this.imageBlockSize, 0,
                                             this.imageBlockSize, this.imageBlockSize, x, y, blockSize, blockSize)
            }
        }
    }
}