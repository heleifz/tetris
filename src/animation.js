import {boundingBox} from "./util.js"

export function clearLineAnimation(lines) {
    let toClear = lines
    let progress = 1
    let totalLength = 18
    const firstPhase = Math.round(totalLength * 0.4)
    const secondPhase = totalLength - firstPhase
    return function (game) {
        const particleSize = Math.round(game.render.height * 0.015)
        let particleNum = 8
        const ctx = game.render.getAnimationContext()
        if (lines.length > 10) {
            particleNum = 0
        }
        if (progress < totalLength) {
            for (let i in lines) {
                const row = lines[i]
                let x = game.render.gameX
                let y = (row - 2) * game.render.blockSizeInPixels + game.render.gameY
                let height = game.render.blockSizeInPixels
                let width = game.render.gameWidth
                // 第一阶段：变亮
                if (progress <= firstPhase) {
                    const trans = progress / firstPhase
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                // 第二阶段：化作彩色粒子飞散消失
                } else {
                    if (progress == firstPhase + 1) {
                        for (let j = 0;  j < game.stack[row].length; ++j) {
                            game.stack[row][j] = null
                        }
                    }
                    const trans = 1.0 - ((progress - firstPhase) / secondPhase)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                    width = width * (1.0 - (progress - firstPhase) / secondPhase)
                    x = x + (game.render.gameWidth - width) / 2
                    for (let i = 0; i < particleNum; ++i) {
                        let particle = createParticle(randomColorBlockParticle(particleSize), 
                            x, y + game.render.blockSizeInPixels / 2, (90 + (135 - 90) * Math.random()), 10 + 5 * Math.random(), 30, 20, 40)
                        game.animations.push(particle)
                        particle = createParticle(randomColorBlockParticle(particleSize), 
                            x + width, y + game.render.blockSizeInPixels / 2, 45 + (90 - 45) * Math.random(), 10 + 5 * Math.random(), 30, 20, 40)
                        game.animations.push(particle)
                    }
                }
                ctx.fillRect(x, y, width, height)
            }
            progress += 1
        } else if (progress == totalLength) {
            if (game.afterPause !== null) {
                game.afterPause()
                game.afterPause = null
            }
            return null
        }
    }
}

export function highlightAnimation(positions) {
    let progress = 1

    return function (game) {
        if (progress < 16) {
            const ctx = game.render.getAnimationContext()
            ctx.save()
            for (let i in positions) {
                const p = positions[i]
                let x = p[1] * game.render.blockSizeInPixels + game.render.gameX
                let y = (p[0] - 2) * game.render.blockSizeInPixels + game.render.gameY
                if (progress <= 8) {
                    const trans = 0.8 * (progress / 8)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                    // ctx.shadowColor = "white";
                    // ctx.shadowBlur = (progress / 8) * 20
                } else {
                    const trans = 0.8 - 0.8 * ((progress - 8) / 7.0)
                    ctx.fillStyle = "rgba(255,255,255," + trans + ")";
                    // ctx.shadowColor = "white";
                    // ctx.shadowBlur = (1.0 - ((progress - 8) / 7.0)) * 29
                }
                ctx.fillRect(x, y, game.render.blockSizeInPixels, game.render.blockSizeInPixels)
            }
            ctx.restore()
            progress += 1
        } else {
            return null
        }
    }
}

export function hardDropAnimation(positions, render) {
    let progress = 1 

    let [minRow, maxRow, minCol, maxCol] = boundingBox(positions)

    const minX = render.gameX + minCol * render.blockSizeInPixels
    const maxX = render.gameX + (maxCol + 1) * render.blockSizeInPixels
    const endY = render.gameY + (minRow - 2) * render.blockSizeInPixels - 5

    let dropLines = []
    const lineHeight = 100
    if (minRow > 5) {
        for (let x = minX; x <= maxX; x += 20) {
            for (let i = 0; i < 2; ++i) {
                const realX = x + 30 * (0.5 - Math.random())
                if (realX < (render.gameX + render.gameWidth) && realX > render.gameX) {
                    dropLines.push([realX, Math.max(render.gameY, endY - lineHeight - Math.random() * 150), 6 * Math.random(), lineHeight * (1 - 0.1 * Math.random())])
                }
            }
        }
    }
    return function (game) {
        const ctx = game.render.getAnimationContext()
        if (progress < 8) {
            for (let i in dropLines) {
                const line = dropLines[i]
                const lineY = line[1] - 0.5 * lineHeight * (progress / 8.0)
                let gradient = ctx.createLinearGradient(line[0], lineY, line[0], lineY + line[3])
                let pos = 0.7 * progress / 8
                gradient.addColorStop(pos, "rgb(80,80,80,0)")
                gradient.addColorStop(0.7, "rgb(100,100,100,0.8)");
                gradient.addColorStop(1, "rgb(80,80,80,0)");
                ctx.fillStyle = gradient;
                ctx.fillRect(line[0], lineY, line[2], line[3])
            }
            progress += 1
        } else {
            return null
        }
    }
}

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
function randomColorBlockParticle(baseSize) {
    let candidateColor = ["rgb(255,29,88)", "rgb(24,89,144)", "rgb(255,246,133)", "rgb(0,221,255)", "rgb(0,73,183)"]
    const color = candidateColor[Math.floor(Math.random() * candidateColor.length)]
    const size = Math.random() * baseSize
    const ctx = game.render.getAnimationContext()
    return function (xPosition, yPosition, rotate, trans) {
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
