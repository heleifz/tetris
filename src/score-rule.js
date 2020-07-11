// 游戏计分规则
export class DefaultScoreRule
{
    constructor(startLevel) {
        this.startLevel = startLevel
        this.onLevelUp = null
        this.reset()
    }

    reset() {
        this.score = 0
        this.combo = 0
        this.regretCount = 0
        this.lineCount = 0
        this.level = this.startLevel
        this.levelClearCount = 0
    }
    
    dropSpeed() {
        const levelTime = Math.pow(0.8 - ((this.level - 1) * 0.007), this.level - 1)
        return levelTime * 1000
    }

    onLevelUp(callback) {
        this.onLevelUp = callback
    }

    regret() {
        if (this.regretCount > 0) {
            this.regretCount -= 1
            return true
        } else {
            return false
        }
    }

    onDrop(dropCell, type) {
        if (type == 'soft') {
            this.score += dropCell
        } else if (type == 'hard') {
            this.score += 2 * dropCell
        }
    }

    onLock(tspin) {
        if (tspin) {
            this.score += 400 * this.level
        }
        this.combo = 0
    }

    onClearLine(clearLine, isPerfect, tspin) {
        if (clearLine == 0) {
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
            if (this.onLevelUp !== null) {
                this.onLevelUp(this.level)
            }
        }
    }
}