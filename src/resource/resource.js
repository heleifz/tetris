import { GameSound } from "./game-sound.js"
import { GameImage } from "./game-image.js"
import css from '../assets/style.css'

export default new Resource()

class Resource
{
    constructor() {
        this.sound = new GameSound()
        this.image = new GameImage()
    }

    load() {
        console.log(this.sound, this.image)
        return Promise.all([this.sound.load(), this.image.load()])
    }
}