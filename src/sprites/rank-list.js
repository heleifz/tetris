import canvas from "../canvas.js"

export class RankList {

    constructor(x, y, width, height, duration) {
        this.progress = 0
        this.duration = duration
        this.rank = []
        this.score = 0
        this.clearCount = 0
        this.endTime = ""
        this.visible = false
        this.dirty = true
        this.relocate(x, y, width, height)
    }

    relocate(x, y, width, height) {
        this.width = width
        this.height = height
        this.x = x
        this.y = y
        this.dirty = true
    }

    setVisible(v) {
        // 藏起后动画进度归零
        if (!v && this.visible) {
            this.progress = 0
        }
        this.visible = v
        this.dirty = true
    } 

    setRank(rank, score, clearCount, endTime) {
        this.rank = rank
        this.score = score
        this.clearCount = clearCount
        this.endTime = endTime
    }

    clear() {
        if (this.dirty) {
            const ctx = canvas.overlay
            ctx.clearRect(this.x, Math.round(this.y * 0.8), this.width, Math.round(this.height * 1.2))
            if (!this.visible) {
                this.dirty = false
            }
        }
    }

    drawRankList(ctx, x, y, width, height, totalProgress, progress) {
        const rankList = this.rank
        const fontSize = Math.round(height * 0.08)
        ctx.font = fontSize + "px pixeboy";
        const middle = Math.round(x + (width / 2))
        let inRank = false
        const rankSize = Math.min(10, rankList.length)
        const startY = Math.round(y * 1.27)
        for (let i = 0; i < rankSize; ++i) {
            let item = rankList[i]
            if (rankList[i].score == this.score) {
                inRank = true
                ctx.fillStyle = "rgba(200,0,0," + ((progress)/totalProgress) + ")";
            } else {
                ctx.fillStyle = "rgba(255,255,255," + ((progress)/totalProgress) + ")";
            }
            ctx.textAlign = "right";
            ctx.fillText(item.score, middle - height * 0.35, startY + fontSize * i);
            ctx.textAlign = "left";
            ctx.fillText(item.clearLine, middle - height * 0.25, startY + fontSize * i);
            ctx.textAlign = "left";
            ctx.fillText(item.playedAt, middle,  startY + fontSize * i);
        }
        if (!inRank) {
            ctx.fillStyle = "rgba(200,0,0," + ((progress)/totalProgress) + ")";
            ctx.textAlign = "right";
            ctx.fillText(this.score, middle - height * 0.35,  startY + fontSize * rankSize);
            ctx.textAlign = "left";
            ctx.fillText(this.clearCount, middle - height * 0.25,  startY + fontSize * rankSize);
            ctx.textAlign = "left";
            ctx.fillText(this.endTime, middle, startY + fontSize * rankSize);
        }
    }

    draw() {
        if (this.visible && this.dirty) {
            const ctx = canvas.overlay
            const bannerHeight = this.height *  (this.progress / this.duration)
            const trans = 0.8 * (this.progress / this.duration)
            const fontSize = Math.round(bannerHeight * 0.12)
            const bannerY = this.y + Math.round((this.height - bannerHeight) / 2)
            ctx.save()
            ctx.fillStyle = "rgba(50,50,50," + trans + ")";
            ctx.fillRect(this.x, bannerY, this.width, bannerHeight)

            if (this.progress > 20) {
                ctx.font = fontSize + "px ka1";
                ctx.fillStyle = "rgba(251,226,81," + ((this.progress - 20)/(this.duration - 20)) + ")";
                ctx.textAlign = "center";
                ctx.fillText("GAME OVER", Math.round(this.width / 2),  Math.round(bannerY * 1.05));
            }
            // 显示游戏排行榜
            if (this.progress > 10) {
                this.drawRankList(ctx, 0, bannerY, this.width, bannerHeight, this.duration - 10, this.progress - 10)
            }
            if (this.progress < this.duration) {
                this.progress += 1
            } else {
                this.dirty = false
            }
            ctx.restore()
        }
    }

}