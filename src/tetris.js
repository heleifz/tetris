import { constants } from "./constants.js"
import { DefaultScoreRule } from "./score-rule.js"
import {JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock} from "./block.js"
import { msToTime, shuffle } from "./util.js"

// 游戏核心逻辑, 在每轮下坠结束后暂停，等待用户下一次触发
export class Tetris
{
    constructor(onLockBlock, onGameOver, onHarddrop) {
        // 新增两行虚拟 block
        this.rows = constants.rows + constants.hiddenRows
        this.cols = constants.cols
        this.candidates = [JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock]
        this.scoreRule = new DefaultScoreRule(1)
        this.onLockBlock = onLockBlock || (() => {})
        this.onGameOver = onGameOver || (() => {})
        this.onHarddrop = onHarddrop || (() => {})
        this.reset()
    }

    createEmptyStack() {
        let stack = []
        for (let i = 0; i < this.rows; i++) {
            let current = new Array(this.cols)
            for (let j = 0; j < this.cols; ++j) {
                current[j] = null
            }
            stack.push(current);
        }
        return stack
    }

    reset() {
        this.stack = this.createEmptyStack()
        this.block = null
        this.blockRow = null
        this.blockCol = null
        this.tspin = false
        this.rotation = null

        this.nextBlocks = []
        this.hold = null
        this.holdTime = 0

        this.beginTime = null
        this.endTime = null
        this.scoreRule.reset()

        this.randomBlocks = []
    }

    restart() {
        this.reset()
        this.beginTime = Date.now()
        this.endTime = null
        this.nextBlocks = [this.pickBlock(), this.pickBlock(), this.pickBlock()]
        this.triggerNextDrop()
    }

    getUsedTime() {
        if (this.beginTime == null) {
            return ""
        }
        let endTime
        if (this.endTime) {
            endTime = this.endTime
        } else {
            endTime = Date.now()
        }
        return msToTime(endTime - this.beginTime)
    }

    // 触发游戏的下一轮下落
    triggerNextDrop() {
        this.state = "dropping"
        this.tspin = false
        this.isPerfect = false
        this.fullLines = []
        this.holdTime = 0
        this.nextBlocks.push(this.pickBlock())
        this.resetDelayTimer()
        this.resetFallTimer()
        if (!this.spawnNewBlock(this.nextBlocks.shift())) {
            this.state = "over"
            this.endTime = Date.now()
            this.stopFallTimer()
            this.onGameOver()
        }
    }

    cannotFall() {
        if (this.block != null && 
            this.block.collide(this.stack, this.blockRow + 1,
            this.blockCol, this.rotation)) {
            return true
        }
        return false
    }

    spawnNewBlock(newBlock) {
        this.block = newBlock
        const center = Math.floor(this.cols / 2)
        const boxWidth = this.block.boundingBoxWidth
        this.blockRow = 1
        this.blockCol = center - Math.ceil(boxWidth / 2)
        this.rotation = 0
        if (this.block.collide(this.stack, this.blockRow, this.blockCol, this.rotation)) {
            this.block = null
            this.blockCol = null
            this.blockRow = null
            this.rotation = null
            return false
        } else {
            return true
        }
    }

    move(action) {
        this.tspin = false
        if (this.block == null) {
            return null
        }
        const afterMove = this.block.move(this.stack, this.blockRow, this.blockCol, this.rotation, action) 
        const dropStep = afterMove[0] - this.blockRow
        const newRow = afterMove[0]
        const newCol = afterMove[1]
        const newRotation = afterMove[2]
        let moveType = "normal"
        if (newRow == this.blockRow && newCol == this.blockCol && newRotation == this.rotation) {
            moveType = "stuck"
        } else if ((action == "clockwise" || action == "counter_clockwise") && this.block == TBlock) {
            let corners = [
                [newRow, newCol],
                [newRow + 2, newCol],
                [newRow, newCol + 2],
                [newRow + 2, newCol + 2],
            ]
            let occupyCount = 0
            for (let c of corners) {
                // wall/floor kick 不算
                if (c[0] < 0 || c[0] >= this.rows) {
                    continue
                }
                if (c[1] < 0 || c[1] >= this.cols) {
                    continue
                }
                if (this.stack[c[0]][c[1]] != null) {
                    occupyCount += 1
                } 
            }
            if (occupyCount >= 3) {
                moveType = "tspin"
                this.tspin = true
            }
        }
        this.blockRow = newRow
        this.blockCol = newCol
        this.rotation = newRotation
        return {
            newRow: newRow, 
            newCol: newCol, 
            newRotation: newRotation, 
            dropStep: dropStep, 
            moveType: moveType
        }
    }

    getFullLines() {
        let fullLines = []
        let perfect = true
        for (let i = 0; i < this.rows; i++) {
            if (this.stack[i].every((e) => e !== null)) {
                fullLines.push(i)
            } else {
                perfect = false
            }
        }
        return [fullLines, perfect]
    }

    getPredictedPositions() {
        if (this.block == null) {
            return []
        }
        const hardDropPosition = this.block.move(this.stack, this.blockRow, this.blockCol, this.rotation, "hard_drop")
        return this.block.positions(hardDropPosition[0], hardDropPosition[1], hardDropPosition[2])
    }

    clearLines() {
        const lines = this.fullLines
        const isPerfect = this.isPerfect
        const tspin = this.tspin
        this.scoreRule.onClearLine(lines.length, isPerfect, tspin)
        lines.sort()
        for (let i = lines.length - 1; i >= 0; i--) {
            this.stack.splice(lines[i], 1)
        }
        for (let i = 0; i < lines.length; i++) {
            let emptyLine = new Array(this.cols)
            for (let j = 0; j < this.cols; ++j) {
                emptyLine[j] = null
            }
            this.stack.unshift(emptyLine)
        }
        this.fullLines = []
        this.isPerfect = false
        this.tspin = false
    }

    stopFallTimer() {
        clearTimeout(this.fallTimerId)
    }
    
    resetFallTimer() {
        this.stopFallTimer()
        const speed = this.scoreRule.dropSpeed()
        const that = this;
        this.fallTimerId = setTimeout(function () {
            that.control("fall")
            that.resetFallTimer()
        }, speed)
    }

    lockBlock() {
        this.stopFallTimer()
        let positions = this.block.positions(this.blockRow, this.blockCol, this.rotation)
        for (let p of positions) {
            this.stack[p[0]][p[1]] = this.block.style
        }
        this.block = null
        this.blockRow = null
        this.blockCol = null
        this.rotation = null
        const clearResult = this.getFullLines()
        this.isPerfect = clearResult[1]
        this.fullLines = clearResult[0]
        this.state = "locked"
        this.onLockBlock(positions, this.fullLines, this.isPerfect, this.tspin)
    }

    resetDelayTimer() {
        clearTimeout(this.lockDelayTimer)
        const that = this
        this.lockDelayTimer = setTimeout(function () {
            if (that.cannotFall()) {
                that.lockBlock()
            }
        }, constants.lockDelay)
    }

    pickBlock() {
        if (this.randomBlocks.length == 0) {
            for (let i in this.candidates) {
                this.randomBlocks.push(this.candidates[i])
            }
            shuffle(this.randomBlocks)
        }
        return this.randomBlocks.shift()
    }
    
    getBlockStyle() {
        if (this.block) {
            return this.block.style
        } else {
            return null
        }
    }

    getStack() {
        return this.stack
    }

    getBlock() {
        return this.block
    }

    getBlockPositions() {
        if (this.block) {
            return this.block.positions(this.blockRow, this.blockCol, this.rotation)
        } else {
            return []
        }
    }

    control(action) {
        if (this.state == "dropping" && action != 'hold' && action != 'regret') {
            let dropType = null
            if (action == "down") {
                dropType = 'soft'
            } else if (action == "hard_drop") {
                dropType = "hard"
            }
            if (action == "fall") {
                action = "down" 
            }
            const moveResult = this.move(action)
            if (moveResult.moveType != 'stuck') {
                this.resetDelayTimer()
            }
            this.scoreRule.onDrop(moveResult.dropStep, dropType)
            if (action == "hard_drop") {
                this.onHarddrop(this.getBlockPositions())
                this.lockBlock()
            }
        } else if (this.state == "dropping" && action == 'hold') {
            if (this.holdTime == 0) {
                let swapBlock
                if (this.hold == null) {
                    this.hold = this.block
                    swapBlock = this.nextBlocks.shift()
                    this.nextBlocks.push(this.pickBlock())
                } else {
                    let tmp = this.block
                    swapBlock = this.hold
                    this.hold = tmp
                }
                this.spawnNewBlock(swapBlock)
                this.resetDelayTimer()
                this.holdTime = 1
            } else {
                console.log("cannot hold two times")
            }
        } else if (this.state == "dropping" && action == 'regret') {
            if (this.scoreRule.regret()) {
                this.spawnNewBlock(this.block)
                this.resetDelayTimer()
            } else {
                console.log("cannot regret")
            }
        } 
    }
}