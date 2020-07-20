import canvas from "../canvas.js"

export class RankList {

    constructor(x, y, width, height, duration) {
        this.progress = 0
        this.duration = duration
        this.rank = []
        this.relocate(x, y, width, height)
    }

    relocate(x, y, width, height) {
        this.width = width
        this.height = height
        this.x = x
        this.y = y
        this.dirty = true
    }

    setRank(rank) {
        this.rank = rank
        this.dirty = true
    }

    clear() {
        if (this.dirty) {
            const ctx = canvas.sprite
            ctx.clearRect(this.x, this.y, this.width, this.height)
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
            if (rankList[i].score == game.score) {
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
            ctx.fillText(game.score, middle - height * 0.35,  startY + fontSize * rankSize);
            ctx.textAlign = "left";
            ctx.fillText(game.clearCount, middle - height * 0.25,  startY + fontSize * rankSize);
            ctx.textAlign = "left";
            ctx.fillText(formatDate(new Date()), middle, startY + fontSize * rankSize);
        }
    }

    draw() {
        if (this.dirty) {
            const ctx = canvas.sprite
            const bannerHeight = this.height *  (this.progress / this.duration)
            const trans = 0.8 * (this.progress / this.duration)
            const fontSize = Math.round(bannerHeight * 0.12)
            const bannerY = this.y + Math.round(bannerHeight / 2) * 0.8
            ctx.save()
            ctx.fillStyle = "rgba(50,50,50," + trans + ")";
            ctx.fillRect(this.x, bannerY, this.width, bannerHeight)

            if (this.progress > 20) {
                ctx.font = fontSize + "px ka1";
                ctx.fillStyle = "rgba(251,226,81," + ((this.progress - 20)/20) + ")";
                ctx.textAlign = "center";
                ctx.fillText("GAME  OVER", this.width / 2,  bannerY * 1.05);
            }
            // 显示游戏排行榜
            if (progress > 10) {
                drawRankList(ctx, 0, bannerY, this.width, bannerHeight, 30, this.progress - 10)
            }
            if (this.progress < this.duration) {
                progress += 1
            } else {
                this.dirty = false
            }
            ctx.restore()
        }
    }

}