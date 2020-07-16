export function easeOutQuint (t, b, c, d) {
    return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
}

export function easeInOutQuint (t, b, c, d) {
    if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
    return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
}

export function easeInQuint (t, b, c, d) {
    return c * (t /= d) * t * t * t * t + b;
}

export function boundingBox(positions) {
    let minRow = null
    let maxRow = null
    let minCol = null
    let maxCol = null
    for (let p of positions) {
        const row = p[0]
        const col = p[1]
        if (minRow == null || row < minRow) {
            minRow = row
        }
        if (maxRow == null || row > maxRow) {
            maxRow = row
        }
        if (minCol == null || col < minCol) {
            minCol = col 
        }
        if (maxCol == null || col > maxCol) {
            maxCol = col 
        }
    }
    return [minRow, maxRow, minCol, maxCol]
}

export function deepCopy(o) {
    return JSON.parse(JSON.stringify(o))
}

export function formatDate(date) {
    var hours = date.getHours()
    var minutes = date.getMinutes()
    minutes = minutes < 10 ? '0' + minutes : minutes
    var strTime = hours + ':' + minutes
    return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate() + "  " + strTime
}

export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

export function msToTime(duration) {
    let milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  
    hours = (hours < 10) ? "0" + hours : hours
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds
  
    return hours + ":" + minutes + ":" + seconds
}

export function isTouchDevice() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function (query) {
        return window.matchMedia(query).matches;
    }
    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}