import { constants } from "./constants.js"
import {JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock} from "./block.js"
import { msToTime, shuffle, formatDate, deepCopy } from "./util.js"

// 游戏核心逻辑, 在每轮下坠结束后暂停，等待用户下一次触发
export class Tetris
{
    constructor(onLockBlock, onGameOver, onHarddrop) {
        // 新增两行虚拟 block
        this.rows = constants.rows + constants.hiddenRows
        this.cols = constants.cols
        this.candidates = [JBlock, ZBlock, LBlock, IBlock, OBlock, TBlock, SBlock]
        this.startLevel = 1
        this.onLockBlock = onLockBlock || (() => {})
        this.onGameOver = onGameOver || (() => {})
        this.onHarddrop = onHarddrop || (() => {})
        this.storage = window.localStorage
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

        this.randomBlocks = []
        this.history = []

        // 各项分数
        this.score = 0
        this.combo = 0
        this.regretCount = 5
        this.lineCount = 0
        this.level = this.startLevel
        this.levelClearCount = 0
    }

    // 支持悔棋功能，每一轮下坠时创建一个当前状态的 snapshot，悔棋只要将历史 snapshot 覆盖当前状态即可
    addSnapshot() {
        let snapshot = {
            stack: deepCopy(this.stack),
            block: this.block,
            blockRow: this.blockRow,
            blockCol: this.blockCol,
            tspin: this.tspin,
            rotation: this.rotation,
            nextBlocks: this.nextBlocks.slice(),
            hold: this.hold,
            holdTime: this.holdTime,
            randomBlocks: this.randomBlocks.slice(),
            score: this.score,
            combo: this.combo,
            lineCount: this.lineCount,
            level: this.level,
            levelClearCount: this.levelClearCount
        }
        this.history.push(snapshot)
        if (this.history.length > 10) {
            this.history.shift()
        }
    }

    rewind() {
        if (this.history.length == 0) {
            return false
        }
        let snapshot = this.history.pop()
        for (let k in snapshot) {
            this[k] = snapshot[k]
        }
        this.resetDelayTimer()
        this.resetFallTimer()
        return true
    }

    restart() {
        this.reset()
        this.beginTime = Date.now()
        this.endTime = null
        this.nextBlocks = [this.pickBlock(), this.pickBlock(), this.pickBlock()]
        this.triggerNextDrop()
    }

    getScore() {
        return this.score
    }

    getHold() {
        return this.hold === null ? [] : [this.hold]
    }

    getNextBlocks() {
        return this.nextBlocks
    }

    getLineCount() {
        return this.lineCount
    }

    getRegretCount() {
        return this.regretCount
    }

    getEndTime() {
        if (this.endTime) {
            return formatDate(new Date(this.endTime))
        } else {
            return null
        }
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
            this.updateScoreRank()
            this.onGameOver()
        } else {
            this.addSnapshot()
        }
    }

    isOver() {
        return this.state == "over"
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
        this.updateClearLineScore(lines.length, isPerfect, tspin)
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

    dropSpeed() {
        const levelTime = Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1)
        return levelTime * 1000
    }
    
    resetFallTimer() {
        this.stopFallTimer()
        const speed = this.dropSpeed()
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
            this.updateDropScore(moveResult.dropStep, dropType)
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
            if (!this.regret()) {
                console.log("cannot regret")
            }
        } 
    }
    
    regret() {
        if (this.regretCount > 0) {
            if (this.rewind()) {
                this.regretCount -= 1
                return true
            } else {
                return false
            }
        } else {
            return false
        }
    }

    updateDropScore(dropCell, type) {
        if (type == 'soft') {
            this.score += dropCell
        } else if (type == 'hard') {
            this.score += 2 * dropCell
        }
    }

    updateClearLineScore(clearLine, isPerfect, tspin) {
        if (clearLine == 0) {
            this.combo = 0
            if (tspin) {
                this.score += 400 * this.level
            }
            return
        }
        this.combo += 1
        this.lineCount += clearLine
        this.levelClearCount += clearLine
        let base = [null, 100, 300, 500, 800] 
        let tspinBase = [null, 800, 1200, 1600, null] 
        let perfect = [null, 800, 1000, 1800, 200]
        let score = 0
        if (tspin) {
            score = tspinBase[clearLine] 
        } else {
            score = base[clearLine] 
        }
        if (isPerfect) {
            score += perfect[clearLine]
        }
        score *= this.level
        if (this.combo > 1) {
            score += this.level * (this.combo - 1) * 50
        }
        if (clearLine == 4) {
            this.regretCount += 1
        }
        if (this.levelClearCount > 10) {
            this.level += 1
            this.levelClearCount -= 10
        }
    }

    getScoreRank() {
        let scores = this.storage.getItem("score_rank")
        if (scores == null) {
            return []
        }
        return JSON.parse(scores)
    }

    updateScoreRank() {
        const score = this.getScore()
        const useTime = this.getUsedTime()
        const clearLine = this.getLineCount()
        let rank = this.getScoreRank()
        const playedAt = this.getEndTime()
        rank.push({
            score: score, 
            useTime: useTime,
            clearLine: clearLine,
            playedAt: playedAt
        })
        // 按 score 排序取前 10
        rank.sort((a,b) => (a.score > b.score || (a.score == b.score && a.playedAt > b.playedAt)) ? -1 : 
                            ((b.score > a.score || (a.score == b.score && b.playedAt > a.playedAt)) ? 1 : 0))
        if (rank.length > 10) {
            rank = rank.slice(0, 10)
        }
        this.storage.setItem("score_rank", JSON.stringify(rank))
    }

}