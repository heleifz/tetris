class BlockType {

    // shapes：在 bounding box 中的四种旋转形态
    // kickRule: kick规则
    // style: 在皮肤中的贴图名称
    constructor(shapes, kickRule, style) {

        this.shapes = shapes
        this.style = style
        this.kickTable = null
        if (kickRule == "other") {
            this.kickTable = {
                "0": {
                    "1": [[0, 0], [-1, 0], [-1, 1],	[0,-2], [-1,-2]],
                    "3": [[0, 0], [1, 0], [1, 1], [0,-2], [1, -2]],
                }, 
                "1": {
                    "2": [[0, 0], [1, 0], [1,-1], [0, 2], [1, 2]],
                    "0": [[0, 0], [1, 0], [1,-1], [0, 2], [1, 2]],
                }, 
                "2": {
                    "3": [[0, 0], [1, 0], [1, 1],[0,-2], [1,-2]],
                    "1": [[0, 0], [-1, 0], [-1, 1], [0,-2], [-1,-2]],
                }, 
                "3": {
                    "0": [[0, 0], [-1, 0], [-1,-1], [0, 2], [-1, 2]],
                    "2": [[0, 0], [-1, 0], [-1,-1], [0, 2], [-1, 2]],
                } 
            }
        } else if (kickRule == "I") {
            this.kickTable = {
                "0": {
                    "1": [[0, 0], [-2, 0], [1, 0], [-2,-1], [1, 2]],
                    "3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2,-1]],
                }, 
                "1": {
                    "2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2,-1]],
                    "0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1,-2]],
                }, 
                "2": {
                    "3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1,-2]],
                    "1": [[0, 0], [1, 0], [-2, 0], [1,-2], [-2, 1]],
                }, 
                "3": {
                    "0": [[0, 0], [1, 0], [-2, 0], [1,-2], [-2, 1]],
                    "2": [[0, 0], [-2, 0], [1, 0], [-2,-1], [1, 2]],
                }  
            }
        }

        this.offsets = []
        this.boundingBoxWidth = shapes[0][1].length

        for (let i = 0; i < shapes.length; ++i) {
            const shape = shapes[i]
            const offset = []
            for (let j = 0; j < shape.length; ++j) {
                for (let k = 0; k < shape[j].length; ++k) {
                    if (shape[j][k] == 1) {
                        offset.push([j, k])
                    }
                }
            }
            this.offsets.push(offset)
        }
    }

    getRotationNumber(rotation) {
        let mod
        if (rotation < 0) {
            mod = (4 - (-rotation % 4)) % 4
        } else {
            mod = rotation % 4
        }
        return mod 
    }

    // row, col = bounding box 左上角的坐标
    positions(row, col, rotation) {
        let mod = this.getRotationNumber(rotation)
        const offset = this.offsets[mod]
        let result = [];
        for (let i = 0; i < offset.length; ++i) {
            let p = offset[i];
            result.push([row + p[0], col + p[1]])
        }
        return result
    }

    collide(stack, row, col, rotation) {
        const newPosition = this.positions(row, col, rotation) 
        for (let i = 0; i < newPosition.length; ++i) {
            const p = newPosition[i]
            if (p[0] < 0 || p[1] < 0 || p[0] >= stack.length || p[1] >= stack[p[0]].length) {
                return true
            }
            if (stack[p[0]][p[1]] !== null) {
                return true
            }
        }
        return false
    }

    rotate(stack, row, col, rotation, direction) {
        const from = this.getRotationNumber(rotation)
        const to = this.getRotationNumber(rotation + direction)

        // 无kick规则情况
        if (this.kickTable == null) {
            if (!this.collide(stack, row, col, to)) {
                return [row, col, to]
            } else {
                return [row, col, from] 
            }
        }
        const seq = this.kickTable[from][to]
        for (let i in seq) {
            const offset = seq[i]
            if (!this.collide(stack, row - offset[1], col + offset[0], to)) {
                return [row - offset[1], col + offset[0], to]
            }
        }
        return [row, col, from] 
    }

    // 方块操作代码
    move(stack, row, col, rotation, action) {
        let newRow = row
        let newCol = col
        let newRotation = rotation
        if (action == "clockwise") {
            return this.rotate(stack, row, col, rotation, 1)
        } else if (action == "counter_clockwise") {
            return this.rotate(stack, row, col, rotation, -1)
        } else if (action == "left") {
            newCol -= 1           
        } else if (action == "right") {
            newCol += 1
        } else if (action == "down") {
            newRow += 1
        } else if (action == "hard_drop") {
            let positions = this.positions(row, col, rotation)
            let minDrop = stack.length - 1
            for (let i = 0; i < positions.length; ++i) {
                let currentCol = positions[i][1]
                let currentRow = positions[i][0]
                minDrop = Math.min(minDrop, stack.length - currentRow - 1)
                for (let r = currentRow + 1; r < stack.length; ++r) {
                    if (stack[r][currentCol] !== null) {
                        let drop = r - currentRow - 1
                        minDrop = Math.min(drop, minDrop)
                        break
                    }
                }
            }
            newRow += minDrop
        }
        if (!this.collide(stack, newRow, newCol, newRotation)) {
            return [newRow, newCol, newRotation]
        } else {
            return [row, col, rotation] 
        }
    }
}

// 几种方块

export let JBlock = new BlockType([
    
    [[1,0,0],
     [1,1,1],
     [0,0,0]],

    [[0,1,1],
     [0,1,0],
     [0,1,0]],

    [[0,0,0],
     [1,1,1],
     [0,0,1]],

    [[0,1,0],
     [0,1,0],
     [1,1,0]]

], "other", 'blue')

export let ZBlock = new BlockType([ 

    [[1,1,0],
     [0,1,1],
     [0,0,0]],

    [[0,0,1],
     [0,1,1],
     [0,1,0]],

    [[0,0,0],
     [1,1,0],
     [0,1,1]],

    [[0,1,0],
     [1,1,0],
     [1,0,0]]

], "other", 'red')

export let LBlock = new BlockType([ 

    [[0,0,1],
     [1,1,1],
     [0,0,0]],

    [[0,1,0],
     [0,1,0],
     [0,1,1]],

    [[0,0,0],
     [1,1,1],
     [1,0,0]],

    [[1,1,0],
     [0,1,0],
     [0,1,0]]

], "other", 'orange')

export let IBlock = new BlockType([ 
   
    [[0,0,0,0],
     [1,1,1,1],
     [0,0,0,0],
     [0,0,0,0]],

    [[0,0,1,0],
     [0,0,1,0],
     [0,0,1,0],
     [0,0,1,0]],

    [[0,0,0,0],
     [0,0,0,0],
     [1,1,1,1],
     [0,0,0,0]],

    [[0,1,0,0],
     [0,1,0,0],
     [0,1,0,0],
     [0,1,0,0]]

], "I", 'cyan')

export let OBlock = new BlockType([ 
   
    [[0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]],
     
    [[0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]],
     
    [[0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]],

    [[0,1,1,0],
     [0,1,1,0],
     [0,0,0,0]]

], null, 'yellow')

export let TBlock = new BlockType([ 

    [[0,1,0],
     [1,1,1],
     [0,0,0]],

    [[0,1,0],
     [0,1,1],
     [0,1,0]],

    [[0,0,0],
     [1,1,1],
     [0,1,0]],

    [[0,1,0],
     [1,1,0],
     [0,1,0]]

], "other", 'purple')

export let SBlock = new BlockType([ 

    [[0,1,1],
     [1,1,0],
     [0,0,0]],

    [[0,1,0],
     [0,1,1],
     [0,0,1]],

    [[0,0,0],
     [0,1,1],
     [1,1,0]],

    [[1,0,0],
     [1,1,0],
     [0,1,0]]

], "other", 'green')