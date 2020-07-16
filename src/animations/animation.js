// 单个飞散粒子
function createParticle(renderParticle, x, y, angleInDegree, speed, gravity, rotateSpeed, lifeSpan) {
    let progress = 0
    const angle = 2 * Math.PI - (((angleInDegree % (360)) / 360) * (2 * Math.PI))
    let xInitSpeed = Math.cos(angle) * speed
    let yInitSpeed = Math.sin(angle) * speed
    return function (game) {
        let trans = 1.0 - (progress / lifeSpan)
        let rotate = (((rotateSpeed * progress) % 360) / 360) * (2 * Math.PI)
        let xPosition = x + xInitSpeed * progress
        let yPosition = y + yInitSpeed * progress + 0.01 * gravity * (progress * progress)
        renderParticle(xPosition, yPosition, rotate, trans)
        if (progress == lifeSpan) {
            return null
        }
        progress += 1
        return 1
    }
}

// 随机颜色方块粒子
function randomColorBlockParticle(baseSize, render) {
    let candidateColor = ["rgb(255,29,88)", "rgb(24,89,144)", "rgb(255,246,133)", "rgb(0,221,255)", "rgb(0,73,183)"]
    const color = candidateColor[Math.floor(Math.random() * candidateColor.length)]
    const size = Math.random() * baseSize
    return function (xPosition, yPosition, rotate, trans) {
        const ctx = render.getAnimationContext()
        ctx.save()
        ctx.fillStyle = color
        ctx.globalAlpha = trans
        ctx.fillRect(xPosition, yPosition, size, size)
        ctx.restore()
    }
}


function drawRankList(ctx, x, y, width, height, totalProgress, progress, game) {
    const rankList = game.getScoreRank()
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

export const gameOverAnimation = function () {
    let progress = 1
    return function (game) {
        const ctx = game.render.getAnimationContext()
        const height = game.render.windowHeight 
        const width = game.render.width
        const bannerHeight = game.render.height * 0.5 * (progress / 40.0)
        const trans = 0.8 * (progress / 40.0)
        const fontSize = Math.round(bannerHeight * 0.12)
        const bannerY = (height - bannerHeight) / 2 * 0.8

        ctx.fillStyle = "rgba(50,50,50," + trans + ")";
        ctx.fillRect(0, bannerY, width, bannerHeight)

        if (progress > 20) {
            ctx.font = fontSize + "px ka1";
            ctx.fillStyle = "rgba(251,226,81," + ((progress - 20)/20) + ")";
            ctx.textAlign = "center";
            ctx.fillText("GAME  OVER", width / 2,  bannerY * 1.05);
        }
        // 显示游戏排行榜
        if (progress > 10) {
            drawRankList(ctx, 0, bannerY, width, bannerHeight, 30, progress - 10, game)
        }
        if (progress == 40) {
            return 1
        } else {
            progress += 1
            return 1
        }
    }
}
