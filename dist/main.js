!function(t){var e={};function i(n){if(e[n])return e[n].exports;var o=e[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,i),o.l=!0,o.exports}i.m=t,i.c=e,i.d=function(t,e,n){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:n})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var n=Object.create(null);if(i.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var o in t)i.d(n,o,function(e){return t[e]}.bind(null,o));return n},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="./dist/",i(i.s=8)}([function(t,e,i){var n=i(1),o=i(2);"string"==typeof(o=o.__esModule?o.default:o)&&(o=[[t.i,o,""]]);var s={insert:"head",singleton:!1};n(o,s);t.exports=o.locals||{}},function(t,e,i){"use strict";var n,o=function(){return void 0===n&&(n=Boolean(window&&document&&document.all&&!window.atob)),n},s=function(){var t={};return function(e){if(void 0===t[e]){var i=document.querySelector(e);if(window.HTMLIFrameElement&&i instanceof window.HTMLIFrameElement)try{i=i.contentDocument.head}catch(t){i=null}t[e]=i}return t[e]}}(),l=[];function h(t){for(var e=-1,i=0;i<l.length;i++)if(l[i].identifier===t){e=i;break}return e}function r(t,e){for(var i={},n=[],o=0;o<t.length;o++){var s=t[o],r=e.base?s[0]+e.base:s[0],a=i[r]||0,c="".concat(r," ").concat(a);i[r]=a+1;var u=h(c),d={css:s[1],media:s[2],sourceMap:s[3]};-1!==u?(l[u].references++,l[u].updater(d)):l.push({identifier:c,updater:p(d,e),references:1}),n.push(c)}return n}function a(t){var e=document.createElement("style"),n=t.attributes||{};if(void 0===n.nonce){var o=i.nc;o&&(n.nonce=o)}if(Object.keys(n).forEach((function(t){e.setAttribute(t,n[t])})),"function"==typeof t.insert)t.insert(e);else{var l=s(t.insert||"head");if(!l)throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");l.appendChild(e)}return e}var c,u=(c=[],function(t,e){return c[t]=e,c.filter(Boolean).join("\n")});function d(t,e,i,n){var o=i?"":n.media?"@media ".concat(n.media," {").concat(n.css,"}"):n.css;if(t.styleSheet)t.styleSheet.cssText=u(e,o);else{var s=document.createTextNode(o),l=t.childNodes;l[e]&&t.removeChild(l[e]),l.length?t.insertBefore(s,l[e]):t.appendChild(s)}}function f(t,e,i){var n=i.css,o=i.media,s=i.sourceMap;if(o?t.setAttribute("media",o):t.removeAttribute("media"),s&&btoa&&(n+="\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(s))))," */")),t.styleSheet)t.styleSheet.cssText=n;else{for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(document.createTextNode(n))}}var g=null,m=0;function p(t,e){var i,n,o;if(e.singleton){var s=m++;i=g||(g=a(e)),n=d.bind(null,i,s,!1),o=d.bind(null,i,s,!0)}else i=a(e),n=f.bind(null,i,e),o=function(){!function(t){if(null===t.parentNode)return!1;t.parentNode.removeChild(t)}(i)};return n(t),function(e){if(e){if(e.css===t.css&&e.media===t.media&&e.sourceMap===t.sourceMap)return;n(t=e)}else o()}}t.exports=function(t,e){(e=e||{}).singleton||"boolean"==typeof e.singleton||(e.singleton=o());var i=r(t=t||[],e);return function(t){if(t=t||[],"[object Array]"===Object.prototype.toString.call(t)){for(var n=0;n<i.length;n++){var o=h(i[n]);l[o].references--}for(var s=r(t,e),a=0;a<i.length;a++){var c=h(i[a]);0===l[c].references&&(l[c].updater(),l.splice(c,1))}i=s}}}},function(t,e,i){var n=i(3),o=i(4),s=i(5),l=i(6),h=i(7);e=n(!1);var r=o(s),a=o(l),c=o(h);e.push([t.i,"@font-face { font-family: pixeboy; src: url("+r+"); } \n@font-face { font-family: ka1; src: url("+a+"); } \nhtml, body {\n    margin: 0 !important;\n    padding: 0 !important;\n}\nbody {\n    background: #000000;\n    /* Prevent the ugly blue highlighting from accidental selection of text */ user-select: none;\n    -webkit-touch-callout: none !important;\n    -webkit-user-select: none !important;\n    -khtml-user-select: none !important; /* Konqueror HTML */\n    -moz-user-select: none !important; /* Old versions of Firefox */\n    -ms-user-select: none !important; /* Internet Explorer/Edge */\n\n    overflow: hidden;\n    top: 0; bottom: 0; left: 0; right: 0;\n    \n}\n@media only screen and (min-width: 800px)\n{\n    #wrapper {\n        position: absolute; \n        top: 0; bottom: 0; left: 0; right: 0;\n        background-image: url("+c+");\n        background-size: 100% 100%;\n    }\n}\n@media only screen and (max-width: 800px)\n{\n    /* 小屏幕背景图 */\n    #wrapper {\n        position: absolute; \n        top: 0; bottom: 0; left: 0; right: 0;\n        background-image: url("+c+");\n        background-size: cover;\n    }\n}",""]),t.exports=e},function(t,e,i){"use strict";t.exports=function(t){var e=[];return e.toString=function(){return this.map((function(e){var i=function(t,e){var i=t[1]||"",n=t[3];if(!n)return i;if(e&&"function"==typeof btoa){var o=(l=n,h=btoa(unescape(encodeURIComponent(JSON.stringify(l)))),r="sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(h),"/*# ".concat(r," */")),s=n.sources.map((function(t){return"/*# sourceURL=".concat(n.sourceRoot||"").concat(t," */")}));return[i].concat(s).concat([o]).join("\n")}var l,h,r;return[i].join("\n")}(e,t);return e[2]?"@media ".concat(e[2]," {").concat(i,"}"):i})).join("")},e.i=function(t,i,n){"string"==typeof t&&(t=[[null,t,""]]);var o={};if(n)for(var s=0;s<this.length;s++){var l=this[s][0];null!=l&&(o[l]=!0)}for(var h=0;h<t.length;h++){var r=[].concat(t[h]);n&&o[r[0]]||(i&&(r[2]?r[2]="".concat(i," and ").concat(r[2]):r[2]=i),e.push(r))}},e}},function(t,e,i){"use strict";t.exports=function(t,e){return e||(e={}),"string"!=typeof(t=t&&t.__esModule?t.default:t)?t:(/^['"].*['"]$/.test(t)&&(t=t.slice(1,-1)),e.hash&&(t+=e.hash),/["'() \t\n]/.test(t)||e.needQuotes?'"'.concat(t.replace(/"/g,'\\"').replace(/\n/g,"\\n"),'"'):t)}},function(t,e,i){"use strict";i.r(e),e.default=i.p+"143c9dc71d2a56d4bc46c33e06440ebc.ttf"},function(t,e,i){"use strict";i.r(e),e.default=i.p+"5df8cd545dcd2db2bf8b3093ddd428e3.ttf"},function(t,e,i){"use strict";i.r(e),e.default=i.p+"c1c53ea6dd632d9b0f1ffb7d371cd86a.jpg"},function(t,e,i){"use strict";i.r(e);var n=i.p+"adabb7de6ea9690077c9facc7da0de0f.wav",o=i.p+"bfb42860c69139288dcfac52dc6d9f60.wav",s=i.p+"6919a781914917848bb778a8174fbb00.wav",l=i.p+"26b8654f97b08c024ba4cf4f34d7b4f7.wav",h=i.p+"b56c7b6aa88cf7dab52b4fc0fd854627.mp3";i(0);class r{constructor(t,e,i){this.shapes=t,this.style=i,this.kickTable=null,"other"==e?this.kickTable={0:{1:[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]],3:[[0,0],[1,0],[1,1],[0,-2],[1,-2]]},1:{2:[[0,0],[1,0],[1,-1],[0,2],[1,2]],0:[[0,0],[1,0],[1,-1],[0,2],[1,2]]},2:{3:[[0,0],[1,0],[1,1],[0,-2],[1,-2]],1:[[0,0],[-1,0],[-1,1],[0,-2],[-1,-2]]},3:{0:[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]],2:[[0,0],[-1,0],[-1,-1],[0,2],[-1,2]]}}:"I"==e&&(this.kickTable={0:{1:[[0,0],[-2,0],[1,0],[-2,-1],[1,2]],3:[[0,0],[-1,0],[2,0],[-1,2],[2,-1]]},1:{2:[[0,0],[-1,0],[2,0],[-1,2],[2,-1]],0:[[0,0],[2,0],[-1,0],[2,1],[-1,-2]]},2:{3:[[0,0],[2,0],[-1,0],[2,1],[-1,-2]],1:[[0,0],[1,0],[-2,0],[1,-2],[-2,1]]},3:{0:[[0,0],[1,0],[-2,0],[1,-2],[-2,1]],2:[[0,0],[-2,0],[1,0],[-2,-1],[1,2]]}}),this.offsets=[],this.boundingBoxWidth=t[0][1].length;for(let e=0;e<t.length;++e){const i=t[e],n=[];for(let t=0;t<i.length;++t)for(let e=0;e<i[t].length;++e)1==i[t][e]&&n.push([t,e]);this.offsets.push(n)}}getRotationNumber(t){let e;return e=t<0?(4- -t%4)%4:t%4,e}positions(t,e,i){let n=this.getRotationNumber(i);const o=this.offsets[n];let s=[];for(let i=0;i<o.length;++i){let n=o[i];s.push([t+n[0],e+n[1]])}return s}collide(t,e,i,n){const o=this.positions(e,i,n);for(let e=0;e<o.length;++e){const i=o[e];if(i[0]<0||i[1]<0||i[0]>=t.length||i[1]>=t[i[0]].length)return!0;if(null!==t[i[0]][i[1]])return!0}return!1}rotate(t,e,i,n,o){const s=this.getRotationNumber(n),l=this.getRotationNumber(n+o);if(null==this.kickTable)return this.collide(t,e,i,l)?[e,i,s]:[e,i,l];const h=this.kickTable[s][l];for(let n in h){const o=h[n];if(!this.collide(t,e-o[1],i+o[0],l))return[e-o[1],i+o[0],l]}return[e,i,s]}move(t,e,i,n,o){let s=e,l=i,h=n;if("clockwise"==o)return this.rotate(t,e,i,n,1);if("counter_clockwise"==o)return this.rotate(t,e,i,n,-1);if("left"==o)l-=1;else if("right"==o)l+=1;else if("down"==o)s+=1;else if("hard_drop"==o){let o=this.positions(e,i,n),l=t.length-1;for(let e=0;e<o.length;++e){let i=o[e][1],n=o[e][0];l=Math.min(l,t.length-n-1);for(let e=n+1;e<t.length;++e)if(null!==t[e][i]){let t=e-n-1;l=Math.min(t,l);break}}s+=l}return this.collide(t,s,l,h)?[e,i,n]:[s,l,h]}}let a=new r([[[1,0,0],[1,1,1],[0,0,0]],[[0,1,1],[0,1,0],[0,1,0]],[[0,0,0],[1,1,1],[0,0,1]],[[0,1,0],[0,1,0],[1,1,0]]],"other","blue"),c=new r([[[1,1,0],[0,1,1],[0,0,0]],[[0,0,1],[0,1,1],[0,1,0]],[[0,0,0],[1,1,0],[0,1,1]],[[0,1,0],[1,1,0],[1,0,0]]],"other","red"),u=new r([[[0,0,1],[1,1,1],[0,0,0]],[[0,1,0],[0,1,0],[0,1,1]],[[0,0,0],[1,1,1],[1,0,0]],[[1,1,0],[0,1,0],[0,1,0]]],"other","orange"),d=new r([[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],[[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],[[0,0,0,0],[0,0,0,0],[1,1,1,1],[0,0,0,0]],[[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]]],"I","cyan"),f=new r([[[0,1,1,0],[0,1,1,0],[0,0,0,0]],[[0,1,1,0],[0,1,1,0],[0,0,0,0]],[[0,1,1,0],[0,1,1,0],[0,0,0,0]],[[0,1,1,0],[0,1,1,0],[0,0,0,0]]],null,"yellow"),g=new r([[[0,1,0],[1,1,1],[0,0,0]],[[0,1,0],[0,1,1],[0,1,0]],[[0,0,0],[1,1,1],[0,1,0]],[[0,1,0],[1,1,0],[0,1,0]]],"other","purple"),m=new r([[[0,1,1],[1,1,0],[0,0,0]],[[0,1,0],[0,1,1],[0,0,1]],[[0,0,0],[0,1,1],[1,1,0]],[[1,0,0],[1,1,0],[0,1,0]]],"other","green");function p(t){let e=null,i=null,n=null,o=null;for(let s of t){const t=s[0],l=s[1];(null==e||t<e)&&(e=t),(null==i||t>i)&&(i=t),(null==n||l<n)&&(n=l),(null==o||l>o)&&(o=l)}return[e,i,n,o]}function b(t){parseInt(t%1e3/100);let e=Math.floor(t/1e3%60),i=Math.floor(t/6e4%60),n=Math.floor(t/36e5%24);return n=n<10?"0"+n:n,i=i<10?"0"+i:i,e=e<10?"0"+e:e,n+":"+i+":"+e}function k(t){let e=1;const i=Math.round(7.2),n=18-i;return function(o){const s=Math.round(.015*o.render.height);let l=8;const h=o.render.getAnimationContext();if(t.length>10&&(l=0),e<18){for(let r in t){const a=t[r];let c=o.render.gameX,u=(a-2)*o.render.blockSizeInPixels+o.render.gameY,d=o.render.blockSizeInPixels,f=o.render.gameWidth;if(e<=i){const t=e/i;h.fillStyle="rgba(255,255,255,"+t+")"}else{if(e==i+1)for(let t=0;t<o.stack[a].length;++t)o.stack[a][t]=null;const t=1-(e-i)/n;h.fillStyle="rgba(255,255,255,"+t+")",f*=1-(e-i)/n,c+=(o.render.gameWidth-f)/2;for(let t=0;t<l;++t){let t=v(w(s),c,u+o.render.blockSizeInPixels/2,90+45*Math.random(),10+5*Math.random(),30,20,40);o.animations.push(t),t=v(w(s),c+f,u+o.render.blockSizeInPixels/2,45+45*Math.random(),10+5*Math.random(),30,20,40),o.animations.push(t)}}h.fillRect(c,u,f,d)}e+=1}else if(18==e)return null!==o.afterPause&&(o.afterPause(),o.afterPause=null),null}}function v(t,e,i,n,o,s,l,h){let r=0;const a=2*Math.PI-n%360/360*(2*Math.PI);let c=Math.cos(a)*o,u=Math.sin(a)*o;return function(n){let o=1-r/h,a=l*r%360/360*(2*Math.PI);return t(e+c*r,i+u*r+.01*s*(r*r),a,o),r==h?null:(r+=1,1)}}function w(t){let e=["rgb(255,29,88)","rgb(24,89,144)","rgb(255,246,133)","rgb(0,221,255)","rgb(0,73,183)"];const i=e[Math.floor(Math.random()*e.length)],n=Math.random()*t,o=game.render.getAnimationContext();return function(t,e,s,l){o.save(),o.fillStyle=i,o.globalAlpha=l,o.fillRect(t,e,n,n),o.restore()}}const T=function(){let t=1;return function(e){const i=e.render.getAnimationContext(),n=e.render.windowHeight,o=e.render.width,s=.5*e.render.height*(t/40),l=t/40*.8,h=Math.round(.12*s),r=(n-s)/2*.8;return i.fillStyle="rgba(50,50,50,"+l+")",i.fillRect(0,r,o,s),t>20&&(i.font=h+"px ka1",i.fillStyle="rgba(251,226,81,"+(t-20)/20+")",i.textAlign="center",i.fillText("GAME  OVER",o/2,1.05*r)),t>10&&function(t,e,i,n,o,s,l,h){const r=h.getScoreRank(),a=Math.round(.08*o);t.font=a+"px pixeboy";const c=Math.round(e+n/2);let u=!1;const d=Math.min(10,r.length),f=Math.round(1.27*i);for(let e=0;e<d;++e){let i=r[e];r[e].score==h.score?(u=!0,t.fillStyle="rgba(200,0,0,"+l/s+")"):t.fillStyle="rgba(255,255,255,"+l/s+")",t.textAlign="right",t.fillText(i.score,c-.35*o,f+a*e),t.textAlign="left",t.fillText(i.clearLine,c-.25*o,f+a*e),t.textAlign="left",t.fillText(i.playedAt,c,f+a*e)}u||(t.fillStyle="rgba(200,0,0,"+l/s+")",t.textAlign="right",t.fillText(h.score,c-.35*o,f+a*d),t.textAlign="left",t.fillText(h.clearCount,c-.25*o,f+a*d),t.textAlign="left",t.fillText(formatDate(new Date),c,f+a*d))}(i,0,r,o,s,30,t-10,e),40==t||(t+=1),1}};var x=i.p+"153c34eacbc748a364e3523688261f90.png";class y{constructor(t,e,i,n,o){this.dpr=window.devicePixelRatio||1,this.animationCanvas=t,this.uiCanvas=e,this.canvas=i,this.gamePadCanvas=n,this.config=o,this.virutalCanvas=document.createElement("canvas")}setUpCanvas(t){let e=+getComputedStyle(t).getPropertyValue("height").slice(0,-2),i=+getComputedStyle(t).getPropertyValue("width").slice(0,-2);t.height=e*this.dpr,t.width=i*this.dpr}recalculate(){var t,e;this.isTouch=(e=" -webkit- -moz- -o- -ms- ".split(" "),!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)||(t=["(",e.join("touch-enabled),("),"heartz",")"].join(""),window.matchMedia(t).matches)),this.animationContext=null,this.gameContext=null,this.width=window.innerWidth*this.dpr,this.windowHeight=window.innerHeight*this.dpr;const i=Math.round(1.4*this.config.columnSize)/this.config.lines;let n=!1;this.windowHeight*i<this.width?this.blockSizeInPixels=Math.round(.95*this.windowHeight/this.config.lines):(this.blockSizeInPixels=Math.round(.95*this.width/i/this.config.lines),n=!0),this.virutalCanvas.height=this.blockSizeInPixels,this.virutalCanvas.width=this.blockSizeInPixels*this.skin.blockTypeNum,this.virutalCanvas.getContext("2d").drawImage(this.skin.image,0,0,this.blockSizeInPixels*this.skin.blockTypeNum,this.blockSizeInPixels),this.gameWidth=this.blockSizeInPixels*this.config.columnSize,this.height=this.blockSizeInPixels*this.config.lines,this.gameX=Math.round((this.width-1.4*this.gameWidth)/2),n&&this.isTouch?this.gameY=Math.round((this.windowHeight-this.height)/7):this.gameY=Math.round((this.windowHeight-this.height)/2),this.setUpCanvas(this.canvas),this.setUpCanvas(this.uiCanvas),this.setUpCanvas(this.animationCanvas),this.setUpCanvas(this.gamePadCanvas),this.titleHeight=Math.round(this.height/30),this.titleX=this.gameX+this.gameWidth,this.titleWidth=Math.round(.4*this.gameWidth),this.previewWindows=[];let o=this.gameY+this.titleHeight,s=Math.round(.11*this.height);for(let t=0;t<3;t++)this.previewWindows.push([this.titleX,o,this.titleWidth,s]),o+=s;this.scoreY=o+this.titleHeight,this.scoreHeight=Math.round(.05*this.height),this.clearLineY=this.scoreY+this.scoreHeight+this.titleHeight,this.clearLineHeight=this.scoreHeight,this.timeY=this.clearLineY+this.scoreHeight+this.titleHeight,this.timeHeight=this.scoreHeight,this.regretY=this.timeY+this.scoreHeight+this.titleHeight,this.regretHeight=this.scoreHeight,this.holdY=this.regretY+this.scoreHeight+this.titleHeight,this.holdHeight=Math.round(1.2*s)}async loadResource(){var t;this.skin={},this.skin.image=await(t=x,new Promise((function(e){const i=new Image;i.src=t,i.onload=function(){e(i)}}))),this.skin.blockTypeNum=7,this.skin.colorPosition={red:0,blue:1,yellow:2,green:3,cyan:4,orange:5,purple:6,gray:7}}getAnimationContext(){return null===this.animationContext&&(this.animationContext=this.animationCanvas.getContext("2d")),this.animationContext}getGameContext(){return null===this.gameContext&&(this.gameContext=this.canvas.getContext("2d")),this.gameContext}clearAnimation(){this.animationCanvas.getContext("2d").clearRect(0,0,this.animationCanvas.width,this.animationCanvas.height)}clearElements(){this.canvas.getContext("2d").clearRect(0,0,this.canvas.width,this.canvas.height)}drawUI(){const t=this.uiCanvas.getContext("2d");t.fillStyle="rgb(0,0,0,0.8)",t.fillRect(this.gameX,this.gameY,this.gameWidth,this.height),t.strokeStyle="rgb(60,60,60)",t.lineWidth=1,t.beginPath();for(let e=1;e<this.config.columnSize;++e)t.moveTo(this.gameX+e*this.blockSizeInPixels,this.gameY),t.lineTo(this.gameX+e*this.blockSizeInPixels,this.height+this.gameY);for(let e=1;e<this.config.lines;++e)t.moveTo(this.gameX,this.gameY+e*this.blockSizeInPixels),t.lineTo(this.gameX+this.gameWidth,this.gameY+e*this.blockSizeInPixels);t.stroke(),t.fillStyle="rgb(0,0,0,0.85)",t.fillRect(this.titleX,this.gameY,this.titleWidth,this.titleHeight),t.fillStyle="white",t.font=this.titleHeight+1+"px pixeboy",t.fillText("next",this.titleX,this.gameY+this.titleHeight),t.fillStyle="rgb(0,0,0,0.6)";for(let e of this.previewWindows)t.fillRect(e[0],e[1],e[2],e[3]);return t.fillStyle="rgb(0,0,0,0.85)",t.fillRect(this.titleX,this.holdY-this.titleHeight,this.titleWidth,this.titleHeight),t.fillStyle="white",t.font=this.titleHeight+1+"px pixeboy",t.fillText("hold",this.titleX,this.holdY),t.fillStyle="rgb(0,0,0,0.6)",t.fillRect(this.titleX,this.holdY,this.titleWidth,this.holdHeight),t.fillStyle="rgb(0,0,0,0.85)",t.fillRect(this.titleX,this.holdY+this.holdHeight,this.titleWidth,this.titleHeight),t.fillStyle="rgb(0,0,0,0.85)",t.fillRect(this.titleX,this.scoreY-this.titleHeight,this.titleWidth,this.titleHeight),t.fillStyle="white",t.font=this.titleHeight+1+"px pixeboy",t.fillText("score",this.titleX,this.scoreY),t.fillStyle="rgb(0,0,0,0.6)",t.fillRect(this.titleX,this.scoreY,this.titleWidth,this.scoreHeight),t.fillStyle="rgb(0,0,0,0.85)",t.fillRect(this.titleX,this.clearLineY-this.titleHeight,this.titleWidth,this.titleHeight),t.fillStyle="white",t.font=this.titleHeight+1+"px pixeboy",t.fillText("lines",this.titleX,this.clearLineY),t.fillStyle="rgb(0,0,0,0.6)",t.fillRect(this.titleX,this.clearLineY,this.titleWidth,this.clearLineHeight),t.fillStyle="rgb(0,0,0,0.85)",t.fillRect(this.titleX,this.timeY-this.titleHeight,this.titleWidth,this.titleHeight),t.fillStyle="white",t.font=this.titleHeight+1+"px pixeboy",t.fillText("time",this.titleX,this.timeY),t.fillStyle="rgb(0,0,0,0.6)",t.fillRect(this.titleX,this.timeY,this.titleWidth,this.timeHeight),t.fillStyle="rgb(0,0,0,0.85)",t.fillRect(this.titleX,this.regretY-this.titleHeight,this.titleWidth,this.titleHeight),t.fillStyle="white",t.font=this.titleHeight+1+"px pixeboy",t.fillText("redo",this.titleX,this.regretY),t.fillStyle="rgb(0,0,0,0.6)",t.fillRect(this.titleX,this.regretY,this.titleWidth,this.regretHeight),this}drawStats(t,e,i,n,o,s,l){const h=this.canvas.getContext("2d");let r=this.titleHeight-3;for(;r>3;){if(h.font=r+"px ka1",h.measureText(i).width+5<this.titleWidth)break;r-=1}h.fillStyle="white",h.fillText(i,this.titleX+2,this.scoreY+this.titleHeight),h.font=this.titleHeight-7+"px ka1",h.fillText(n,this.titleX+2,this.clearLineY+this.titleHeight),h.fillText(o,this.titleX+2,this.timeY+this.titleHeight),h.fillText(s,this.titleX+2,this.regretY+this.titleHeight),h.font=this.titleHeight+1+"px pixeboy",h.fillText("LEVEL "+l,this.titleX,this.holdY+this.holdHeight+this.titleHeight),this.drawHold(t),this.drawNextBlock(e)}drawBlock(t,e,i,n){if(t<2)return;let o=e*this.blockSizeInPixels+this.gameX,s=(t-2)*this.blockSizeInPixels+this.gameY;const l=this.getGameContext(),h=this.skin.colorPosition[i];l.save(),n<1&&(l.globalAlpha=n),l.drawImage(this.virutalCanvas,h*this.blockSizeInPixels,0,this.blockSizeInPixels,this.blockSizeInPixels,o,s,this.blockSizeInPixels,this.blockSizeInPixels),l.restore()}drawHold(t){if(!t)return;let e=t.positions(0,0,0),[i,n,o,s]=p(e),l=Math.round(.21*this.titleWidth),h=(s-o+1)*l,r=(n-i+1)*l,a=Math.round((this.titleWidth-h)/2),c=Math.round((this.holdHeight-r)/2);const u=this.skin.colorPosition[t.style],d=this.canvas.getContext("2d");for(let t=0;t<e.length;++t){let n=(e[t][1]-o)*l+this.titleX+a,s=(e[t][0]-i)*l+this.holdY+c;d.drawImage(this.virutalCanvas,u*this.blockSizeInPixels,0,this.blockSizeInPixels,this.blockSizeInPixels,n,s,l,l)}}drawNextBlock(t){if(t)for(let e=0;e<t.length&&e<this.previewWindows.length;e++){let i=t[e];if(null===i)continue;let n=this.previewWindows[e],o=i.positions(0,0,0),[s,l,h,r]=p(o),a=Math.round(.21*n[2]),c=(r-h+1)*a,u=(l-s+1)*a,d=Math.round((n[2]-c)/2),f=Math.round((n[3]-u)/2);const g=this.skin.colorPosition[i.style],m=this.canvas.getContext("2d");for(let t=0;t<o.length;++t){let e=(o[t][1]-h)*a+n[0]+d,i=(o[t][0]-s)*a+n[1]+f;m.drawImage(this.virutalCanvas,g*this.blockSizeInPixels,0,this.blockSizeInPixels,this.blockSizeInPixels,e,i,a,a)}}}}let S=document.getElementById("ui"),M=document.getElementById("game"),C=document.getElementById("animation"),P=document.getElementById("gamepad");const H=new class{constructor(t,e,i,n,o,s){this.candidates=[a,c,u,d,f,g,m],this.config=o,this.render=new y(t,e,i,n,o),this.state="begin",this.animations=[],this.afterPause=null,this.keyPressed={},this.keyTimer={},this.clearTouch(),this.lastAction=null,this.block=null,this.nextBlocks=[],this.hold=null,this.holdTime=0,this.stack=null,this.score=0,this.levelLineClear=0,this.regretTime=0,this.comboCount=0,this.clearCount=0,this.beginTime=null,this.endTime=null,this.storage=s,window.AudioContext=window.AudioContext||window.webkitAudioContext,this.audioContext=new AudioContext,this.bgmReady=!1}getScoreRank(){let t=this.storage.getItem("score_rank");return null==t?[]:JSON.parse(t)}addToScoreRank(t,e,i){let n=this.getScoreRank(),o=(s=new Date,l=s.getHours(),h=s.getMinutes(),r=l+":"+(h=h<10?"0"+h:h),s.getFullYear()+"/"+(s.getMonth()+1)+"/"+s.getDate()+"  "+r);var s,l,h,r;n.push({score:t,useTime:e,clearLine:i,playedAt:o}),n.sort((t,e)=>t.score>e.score||t.score==e.score&&t.playedAt>e.playedAt?-1:e.score>t.score||t.score==e.score&&e.playedAt>t.playedAt?1:0),n.length>10&&(n=n.slice(0,10)),this.storage.setItem("score_rank",JSON.stringify(n))}initializeUI(){return this.render.recalculate(),this.render.drawUI(),this}indexForOngoingTouch(t){const e=t.identifier;for(let t=0;t<this.ongoingTouches.length;t++)if(this.ongoingTouches[t].identifier==e)return t;return null}createEmptyStack(t){let e=[];for(let t=0;t<this.config.lines+2;t++){let t=[];for(let e=0;e<this.config.columnSize;++e)t.push(null);e.push(t)}return e}run(t){this.level=t,this.beginLevel=t,this.resetFallTimer();const e=this;!function t(){e.drawAllElements(),e.doAnimation(),requestAnimationFrame(t)}()}doAnimation(){this.render.clearAnimation();let t=[];for(let e=0;e<this.animations.length;++e){const i=this.animations[e];null!==i(this)&&t.push(i)}this.animations=t}stopFallTimer(){clearTimeout(this.fallTimerId)}rowSpeedForLevel(t){return 1e3*Math.pow(.8-.007*(t-1),t-1)}resetFallTimer(){this.stopFallTimer(),this.levelTime=this.rowSpeedForLevel(this.level);const t=this;this.fallTimerId=setTimeout((function(){t.stateMachine("fall"),t.resetFallTimer()}),this.levelTime)}newDrop(){this.state="restart",this.block=null;const t=this;setTimeout((function(){t.stateMachine("fall")}),150)}TSpinType(){if(this.block!=g)return null;if("clockwise"!=this.lastAction&&"counter_clockwise"!=this.lastAction)return null;let t=[this.position,[this.position[0]+2,this.position[1]],[this.position[0],this.position[1]+2],[this.position[0]+2,this.position[1]+2]],e=0;for(let i of t)i[0]<0||i[0]>=this.stack.length||i[1]<0||i[1]>=this.config.columnSize||null!=this.stack[i[0]][i[1]]&&(e+=1);return e>=3?1:null}lockBlock(){if(null==this.block)return;this.clearTouch(),this.stopFallTimer();let t=this.block.positions(this.position[0],this.position[1],this.rotation);this.animations.push(function(t){let e=1;return function(i){if(!(e<16))return null;{const n=i.render.getAnimationContext();n.save();for(let o in t){const s=t[o];let l=s[1]*i.render.blockSizeInPixels+i.render.gameX,h=(s[0]-2)*i.render.blockSizeInPixels+i.render.gameY;if(e<=8){const t=e/8*.8;n.fillStyle="rgba(255,255,255,"+t+")"}else{const t=.8-(e-8)/7*.8;n.fillStyle="rgba(255,255,255,"+t+")"}n.fillRect(l,h,i.render.blockSizeInPixels,i.render.blockSizeInPixels)}n.restore(),e+=1}}}(t));const e=this.clearLines(),i=this.TSpinType(),n=this.getClearLineScore(e[0].length,e[2],i);if(e[0].length>0)this.state="pause_game",this.playAudioBuffer(this.audio.clear_line,.2),this.animations.push(k(e[0])),this.afterPause=function(){this.comboCount=n[0],this.score=n[1],this.clearCount=n[2],this.levelClearCount+=e[0].length,this.regretTime+=n[3],this.stack=e[1],this.levelClearCount>=10&&(this.level+=1,this.levelClearCount-=10),this.newDrop()};else{this.comboCount=n[0],this.score=n[1];for(let e=0;e<t.length;++e)this.stack[t[e][0]][t[e][1]]=this.block.style;this.newDrop()}}clearLines(){let t=[],e=this.createEmptyStack(),i=e.length-1,n=this.block.positions(this.position[0],this.position[1],this.rotation);for(let t=0;t<n.length;++t)this.stack[n[t][0]][n[t][1]]=this.block.style;let o=!0;for(let n=this.stack.length-1;n>=0;n--){let s=!1;for(let t=0;t<this.config.columnSize;++t)if(null===this.stack[n][t]){s=!0;break}if(s){for(let t=0;t<this.config.columnSize;++t)null!=this.stack[n][t]&&(e[i][t]=this.stack[n][t],o=!1);i-=1}else t.push(n)}if(0==t.length)for(let t=0;t<n.length;++t)this.stack[n[t][0]][n[t][1]]=null;return[t,e,o]}drawAllElements(){if(this.render.clearElements(),null!==this.block){let t=this.block.positions(this.position[0],this.position[1],this.rotation);for(let e=0;e<t.length;++e)this.render.drawBlock(t[e][0],t[e][1],this.block.style,1)}if("dropping"==this.state&&1==this.config.preview){const t=this.block.move(this.stack,this.position[0],this.position[1],this.rotation,"hard_drop");if(t[0]!=this.position[0]||t[1]!=this.position[1]){let e=this.block.positions(t[0],t[1],t[2]);for(let t=0;t<e.length;++t)this.render.drawBlock(e[t][0],e[t][1],this.block.style,.3)}}if(null!=this.stack)for(let t=0;t<this.stack.length;t++)for(let e=0;e<this.stack[t].length;++e)null!==this.stack[t][e]&&this.render.drawBlock(t,e,this.stack[t][e],1);let t=0;if(null!==this.beginTime&&null==this.endTime){t=Date.now()-this.beginTime}else null!=this.endTime&&(t=this.endTime-this.beginTime);this.render.drawStats(this.hold,this.nextBlocks,this.score,this.clearCount,b(t),this.regretTime,this.level)}resetDelayTimer(){clearTimeout(this.lockDelayTimer);const t=this;this.lockDelayTimer=setTimeout((function(){null!=t.block&&t.block.collide(t.stack,t.position[0]+1,t.position[1],t.rotation)&&t.lockBlock()}),this.config.lockDelay)}pickBlock(){if(0==this.randomBlocks.length){for(let t in this.candidates)this.randomBlocks.push(this.candidates[t]);!function(t){for(let e=t.length-1;e>0;e--){let i=Math.floor(Math.random()*(e+1)),n=t[e];t[e]=t[i],t[i]=n}}(this.randomBlocks)}return this.randomBlocks.shift()}getClearLineScore(t,e,i){let n=0,o=this.score,s=this.clearCount+t,l=0;return t>0||null!=i?(n=this.comboCount+1,1==t?(o+=null!=i?800*this.level:100*this.level,e&&(o+=800*this.level)):2==t?(o+=null!=i?1200*this.level:300*this.level,e&&(o+=1e3*this.level)):3==t?(o+=null!=i?1600*this.level:500*this.level,e&&(o+=1800*this.level)):4==t?(o+=800*this.level,l=1,e&&(o+=2e3*this.level)):o+=400*this.level,n>1&&(o+=this.level*(n-1)*50)):n=0,[n,o,s,l]}updateDropScore(t,e){"soft"==e?this.score+=t:"hard"==e&&(this.score+=2*t)}stateMachine(t){if("begin"==this.state){this.level=this.beginLevel,this.afterPause=null,this.animations=[],this.randomBlocks=[],this.render.clearAnimation(),this.stack=this.createEmptyStack(),this.block=this.pickBlock(),this.nextBlocks=[this.pickBlock(),this.pickBlock(),this.pickBlock()],this.hold=null,this.holdTime=0,this.regretTime=1;const t=Math.floor(this.config.columnSize/2),e=this.block.boundingBoxWidth,i=1,n=t-Math.ceil(e/2);this.resetDelayTimer(),this.position=[i,n],this.rotation=0,this.state="dropping",this.score=0,this.comboCount=0,this.levelClearCount=0,this.clearCount=0,this.beginTime=Date.now(),this.endTime=null}else if("dropping"==this.state&&"hold"!=t&&"regret"!=t){let e=null;"down"==t?e="soft":"hard_drop"==t&&(e="hard"),"fall"==t&&(t="down");const i=this.block.move(this.stack,this.position[0],this.position[1],this.rotation,t);i[0]==this.position[0]&&i[1]==this.position[1]&&i[2]==this.rotation||(this.resetDelayTimer(),this.lastAction=t,t in this.audio&&("down"==t&&null==e||this.block==f&&"clockwise"==t||this.playAudioBuffer(this.audio[t],.1)));const n=i[0]-this.position[0];if(this.updateDropScore(n,e),this.position=[i[0],i[1]],this.rotation=i[2],"hard_drop"==t){let t=this.block.positions(this.position[0],this.position[1],this.rotation);this.animations.push(function(t,e){let i=1,[n,o,s,l]=p(t);const h=e.gameX+s*e.blockSizeInPixels,r=e.gameX+(l+1)*e.blockSizeInPixels,a=e.gameY+(n-2)*e.blockSizeInPixels-5;let c=[];if(n>5)for(let t=h;t<=r;t+=20)for(let e=0;e<2;++e){const e=t+30*(.5-Math.random());e<game.render.gameX+game.render.gameWidth&&e>game.render.gameX&&c.push([e,Math.max(game.render.gameY,a-100-150*Math.random()),6*Math.random(),100*(1-.1*Math.random())])}return function(t){const e=t.render.getAnimationContext();if(!(i<8))return null;for(let t in c){const n=c[t],o=n[1]-i/8*50;let s=e.createLinearGradient(n[0],o,n[0],o+n[3]),l=.7*i/8;s.addColorStop(l,"rgb(80,80,80,0)"),s.addColorStop(.7,"rgb(100,100,100,0.8)"),s.addColorStop(1,"rgb(80,80,80,0)"),e.fillStyle=s,e.fillRect(n[0],o,n[2],n[3])}i+=1}}(t,this.render)),this.lockBlock()}}else if("dropping"==this.state&&"hold"==t)if(0==this.holdTime){if(null==this.hold)this.hold=this.block,this.block=this.nextBlocks.shift(),this.nextBlocks.push(this.pickBlock());else{let t=this.block;this.block=this.hold,this.hold=t}const t=Math.floor(this.config.columnSize/2),e=this.block.boundingBoxWidth,i=1,n=t-Math.ceil(e/2);this.resetDelayTimer(),this.position=[i,n],this.rotation=0,this.holdTime=1}else console.log("cannot hold two times");else if("dropping"==this.state&&"regret"==t)if(this.regretTime>0){const t=Math.floor(this.config.columnSize/2),e=this.block.boundingBoxWidth,i=1,n=t-Math.ceil(e/2);this.resetDelayTimer(),this.position=[i,n],this.rotation=0,this.regretTime-=1}else console.log("cannot regret");else if("restart"==this.state){this.holdTime=0,this.block=this.nextBlocks.shift(),this.nextBlocks.push(this.pickBlock());const e=Math.floor(this.config.columnSize/2),i=this.block.boundingBoxWidth,n=1,o=e-Math.ceil(i/2);this.resetDelayTimer(),this.resetFallTimer(),this.position=[n,o],this.rotation=0,this.lastAction=null,this.block.collide(this.stack,this.position[0],this.position[1],this.rotation)?(this.state="over",this.block=null,this.stateMachine("over")):(this.state="dropping","fall"!=t&&this.stateMachine(t))}else if("over"==this.state)if("over"==t){this.endTime=Date.now();let t=[];for(let e=0;e<this.stack.length;++e)t.push(e);this.addToScoreRank(this.score,b(this.endTime-this.beginTime),this.clearCount),this.state="pause_game",this.animations.push(T()),this.animations.push(k(t)),this.afterPause=function(){this.state="over",this.stack=this.createEmptyStack()}}else"fall"!=t&&(this.animations=[],this.render.clearAnimation(),this.state="begin");else if("pause_game"==this.state)return}clearTouch(){this.ongoingTouches=[],this.touchNoMove=[],this.ongoingTouchesStart=[],this.touchTrace=[],this.ongoingTouchesTime=[]}control(t,e){const i={ArrowLeft:"left",ArrowRight:"right",ArrowDown:"down",ArrowUp:"clockwise",Space:"hard_drop",MetaLeft:"hold",TouchLeft:"left",TouchRight:"right",TouchDrop:"hard_drop",TouchRegret:"regret",TouchDown:"down",TouchHold:"hold",TouchClockwise:"clockwise"};if(!(t in i))return;let n=i[t],o=1;if(n in this.keyPressed&&1==this.keyPressed[n]&&(o=0),"down"==e){if(this.stateMachine(n),!this.render.isTouch&&(this.keyPressed[n]=1,("left"==n||"right"==n||"down"==n)&&o)){const t=this;clearTimeout(this.keyTimer[n]),this.keyTimer[n]=setTimeout((function e(){1==t.keyPressed[n]&&(t.stateMachine(n),setTimeout(e,30))}),250)}}else this.isTouch||(this.keyPressed[n]=0,clearTimeout(this.keyTimer[n]),this.keyTimer[n]=null)}loadSoundBuffer(t){let e=this.audioContext;return new Promise((i,n)=>{var o=new XMLHttpRequest;o.open("GET",t,!0),o.responseType="arraybuffer",o.onload=function(){e.decodeAudioData(o.response,(function(t){i(t)}),(function(){n()}))},o.send()})}playAudioBuffer(t,e,i){var n=this.audioContext.createBufferSource();n.buffer=t;let o=this.audioContext.createGain();o.gain.setValueAtTime(e,this.audioContext.currentTime),n.connect(o),o.connect(this.audioContext.destination),!0===i&&(n.loop=!0),n.start(0)}async loadResource(){await this.render.loadResource(),this.audio={};let t=await Promise.all([this.loadSoundBuffer(n),this.loadSoundBuffer(o),this.loadSoundBuffer(s),this.loadSoundBuffer(l),this.loadSoundBuffer(h)]);this.audio.clockwise=t[0],this.audio.left=t[1],this.audio.right=this.audio.left,this.audio.down=this.audio.left,this.audio.hard_drop=t[2],this.audio.clear_line=t[3],this.audio.bgm=t[4]}}(C,S,M,P,{lines:22,columnSize:10,lockDelay:500,preview:!0},window.localStorage);window.addEventListener("load",(function(){H.loadResource().then((function(){function t(t){var e=t.changedTouches;for(let t=0;t<e.length;t++){let i=e[t];const n=H.indexForOngoingTouch(i);if(null!=n){const t=i.pageY-H.ongoingTouchesStart[n].pageY,e=i.pageX-H.ongoingTouchesStart[n].pageX;if(Math.abs(e)<=18&&Math.abs(t)<=18&&H.touchNoMove[n])H.control("TouchClockwise","down");else{let t=0,e=[0,0],i=[0,0],o=0;for(let s=H.touchTrace[n].length-1;s>=0;s--)if(i[0]+=H.touchTrace[n][s][1][0],i[1]+=H.touchTrace[n][s][1][1],o+=H.touchTrace[n][s][0],o>0){let n=Math.sqrt(i[0]**2+i[1]**2)/o;n>t&&(t=n,e[0]=i[0],e[1]=i[1])}t>1.2&&Math.abs(e[1])>Math.abs(e[0])&&e[1]>1.3*18?H.control("TouchDrop","down"):t>1.2&&e[1]<-36&&Math.abs(e[1])>Math.abs(e[0])&&H.control("TouchRegret","down")}H.ongoingTouches.splice(n),H.touchNoMove.splice(n),H.ongoingTouchesStart.splice(n),H.touchTrace.splice(n),H.ongoingTouchesTime.splice(n)}}}H.initializeUI(),H.run(1),document.addEventListener("keydown",(function(t){H.bgmReady||(H.bgmReady=!0,H.playAudioBuffer(H.audio.bgm,.3,!0)),H.control(t.code,"down")})),document.addEventListener("keyup",(function(t){H.control(t.code,"up")})),document.addEventListener("touchstart",(function(t){H.bgmReady||(H.bgmReady=!0,H.playAudioBuffer(H.audio.bgm,.3,!0));var e=t.changedTouches;for(let t=0;t<e.length;t++){let i=e[t];H.ongoingTouches.push(i),H.ongoingTouchesStart.push(i),H.touchNoMove.push(!0),H.touchTrace.push([]),H.ongoingTouchesTime.push(Date.now())}})),document.addEventListener("touchmove",(function(t){var e=t.changedTouches;for(let t=0;t<e.length;t++){let i=e[t];const n=H.indexForOngoingTouch(i);if(null!=n){const t=i.pageY-H.ongoingTouches[n].pageY,e=i.pageX-H.ongoingTouches[n].pageX;if(Math.abs(e)<=22&&Math.abs(t)<=22)continue;Math.abs(e)>Math.abs(t)&&e<-22?(H.control("TouchLeft","down"),H.ongoingTouches[n]=i,H.touchNoMove[n]=!1):Math.abs(e)>Math.abs(t)&&e>22?(H.control("TouchRight","down"),H.ongoingTouches[n]=i,H.touchNoMove[n]=!1):Math.abs(t)>Math.abs(e)&&t>22&&(H.control("TouchDown","down"),H.ongoingTouches[n]=i,H.touchNoMove[n]=!1);const o=Date.now();H.touchTrace[n].push([o-H.ongoingTouchesTime[n],[e,t]]),H.ongoingTouchesTime[n]=o}}})),document.addEventListener("touchend",t),document.addEventListener("touchcancel",t)})),window.addEventListener("resize",(function(){H.initializeUI()}))}))}]);