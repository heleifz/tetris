import rotateSound from "../assets/sound/rotate.wav"
import moveSound from "../assets/sound/move.wav"
import dropSound from "../assets/sound/drop.wav"
import clearSound from "../assets/sound/clear.wav"
import bgmSound from "../assets/sound/bgm.mp3"

export class GameSound
{
    async load() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext
        this.audioContext = new AudioContext()
        this.bgmReady = false
        this.audio = {}
        let audioBuffers = await Promise.all([this.loadSoundBuffer(rotateSound), this.loadSoundBuffer(moveSound),
                                               this.loadSoundBuffer(dropSound), this.loadSoundBuffer(clearSound),
                                               this.loadSoundBuffer(bgmSound)])
        this.audio["clockwise"] = audioBuffers[0]
        this.audio["left"] = audioBuffers[1]
        this.audio["right"] = this.audio["left"]
        this.audio["down"] = this.audio["left"]
        this.audio["hard_drop"] = audioBuffers[2]
        this.audio["clear_line"] = audioBuffers[3]
        this.audio["bgm"] = audioBuffers[4]
        this.bgm = null
    }
    
    loadSoundBuffer(path) {
        let ctx = this.audioContext
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open('GET', path, true);
            request.responseType = 'arraybuffer';
            request.onload = function () {
                ctx.decodeAudioData(request.response, function (buffer) {
                    resolve(buffer)
                }, function () {
                    reject()
                });
            }
            request.send();
        });
    }

    playAudioBuffer(buffer, vol, loop) {
        this.audioContext.resume()
        var source = this.audioContext.createBufferSource()
        source.buffer = buffer

        let gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(vol, this.audioContext.currentTime)

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination)
        if (loop === true) {
            source.loop = true
        }
        source.start(0)
    }

    // 播放背景音乐
    playBgmAtFirstTime(level) {
        if (this.bgm === null) {
            this.playAudioBuffer(this.audio["bgm"], 0.3, true)
            this.bgm = level
        }
    }

    play(event) {
        if (event in this.audio) {
            this.playAudioBuffer(this.audio[event], 0.2)
        }
    }

}