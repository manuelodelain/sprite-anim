(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SpriteAnim = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],3:[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(global, fn)
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":4}],4:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*

*/

}).call(this,require('_process'))

},{"_process":1}],5:[function(require,module,exports){
function E () {
	// Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
	on: function (name, callback, ctx) {
    var e = this.e || (this.e = {});
    
    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });
    
    return this;
  },

  once: function (name, callback, ctx) {
    var self = this;
    var fn = function () {
      self.off(name, fn);
      callback.apply(ctx, arguments);
    };
    
    return this.on(name, fn, ctx);
  },

  emit: function (name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;
    
    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }
    
    return this;
  },

  off: function (name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];
    
    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback) liveEvents.push(evts[i]);
      }
    }
    
    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    (liveEvents.length) 
      ? e[name] = liveEvents
      : delete e[name];
    
    return this;
  }
};

module.exports = E;

},{}],6:[function(require,module,exports){
'use strict';

var raf = require('raf');

var itemId = 0;

var Ticker = function(){
  this.items = [];

  this.isRunning = false;
  this.tickId = -1;
  this.tickCb = this.onTick.bind(this);
};

Ticker.prototype.start = function() {
  this.isRunning = true;
  
  this.tickId = raf(this.tickCb);
};

Ticker.prototype.pause = function() {
  this.isRunning = false;

  raf.cancel(this.tickId);
};

Ticker.prototype.add = function(callback) {
  var id = itemId++;

  this.items.push({
    id: id,
    cb: callback
  });

  if (!this.isRunning) this.start();

  return id;
};

Ticker.prototype.remove = function(id) {
  var item;

  for (var i = 0, n = this.items.length; i < n; i++){
    if (this.items[i].id === id){
      item = this.items.splice(i, 1)[0];
      break;
    }
  }
  
  if (this.items.length === 0) this.pause();

  return item;
};

Ticker.prototype.onTick = function(timeStamp) {
  this.tickId = raf(this.tickCb);
  
  for (var i = 0, n = this.items.length; i < n; i++){
    if (this.items[i]) this.items[i].cb(timeStamp);
  }
};

module.exports = Ticker;


},{"raf":3}],7:[function(require,module,exports){
'use strict';

var JSONArrayParser = function(data, scaleFactor){
  scaleFactor = scaleFactor || 1;

  this.frames = [];
  this.numFrames = data.frames.length;

  var frame;

  for (var i = 0; i < this.numFrames; i++){
    frame = data.frames[i].frame;

    this.frames.push({
      index: i,
      x: frame.x * scaleFactor,
      y: frame.y * scaleFactor,
      width: frame.w * scaleFactor,
      height: frame.h * scaleFactor
    });
  }
};

module.exports = JSONArrayParser;
},{}],8:[function(require,module,exports){
'use strict';

var SimpleParser = function(sprite, frameSize, options){
  this.frameSize = frameSize;

  this.options = options || {};
  this.scaleFactor = this.options.scaleFactor || 1;
  this.numFrames = this.options.numFrames;

  this.frames = [];

  if (Object.prototype.toString.call(sprite) === '[object Array]'){
    for (var i = 0, n = sprite.length; i < n; i++){
      this.initSpriteFrames(sprite[i], i);
    }
  }else{
    this.initSpriteFrames(sprite, 0);
  }

  if (!this.numFrames) this.numFrames = this.frames.length;
};

SimpleParser.prototype.initSpriteFrames = function(sprite, spriteIndex){
  var spriteWidth = sprite.naturalWidth || sprite.width;
  var spriteHeight = sprite.naturalHeight || sprite.height;

  spriteWidth *= this.scaleFactor;
  spriteHeight *= this.scaleFactor;

  var numFramesX = Math.ceil(spriteWidth / this.frameSize.width);
  var numFramesY = Math.ceil(spriteHeight / this.frameSize.height);

  loopY: 
  for (var i = 0; i < numFramesY; i++) {

    for (var j = 0; j < numFramesX; j++) {
      this.frames.push({
        x: j * this.frameSize.width,
        y: i * this.frameSize.height,
        index: this.frames.length,
        width: this.frameSize.width,
        height: this.frameSize.height,
        spriteIndex: spriteIndex
      });

      if (this.frames.length === this.numFrames) break loopY;
    }
    
  }
};

module.exports = SimpleParser;


},{}],9:[function(require,module,exports){
'use strict';

var CanvasRenderer = function(canvas, sprite, options){
  options = options || {};

  var defaultOptions = {
    clearFrame: true
  };

  for (var optionName in defaultOptions){
    this[optionName] = typeof options[optionName] !== 'undefined' ? options[optionName] : defaultOptions[optionName];
  }

  this.canvas = canvas;

  if (Object.prototype.toString.call(sprite) === '[object Array]'){
    this.sprites = sprite;
  }else{
    this.sprites = [sprite];
  }

  this.sprite = sprite;

  this.context = canvas.getContext('2d');
};

CanvasRenderer.prototype.render = function(frame, animation) {
  if (this.clearFrame) this.context.clearRect(0, 0, frame.width, frame.height);

  this.context.globalAlpha = animation.alpha;

  this.context.drawImage(
    this.sprites[frame.spriteIndex],
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    animation.x,
    animation.y,
    frame.width,
    frame.height
   );
};

module.exports = CanvasRenderer;

},{}],10:[function(require,module,exports){
'use strict';

var DOMRenderer = function(element, options){
  options = options || {};

  this.element = element;

  this.scaleFactor = options.scaleFactor || 1;
  this.sprite = options.sprite;

  this.spriteIndex = 0;
  if (this.sprite) this.updateSprite();
};

DOMRenderer.prototype.updateSprite = function() {
  var sprite;

  if (Object.prototype.toString.call(this.sprite) === '[object Array]'){
    sprite = this.sprite[this.spriteIndex];
  }else{
    sprite = this.sprite;
  }

  var spriteWidth = sprite.naturalWidth * this.scaleFactor;
  var spriteHeight = sprite.naturalHeight * this.scaleFactor;

  this.element.style.backgroundImage = 'url(' + sprite.src + ')';
  this.element.style.backgroundSize = spriteWidth + 'px ' + spriteHeight + 'px';
};

DOMRenderer.prototype.render = function(frame) {
  if (frame.spriteIndex !== this.spriteIndex){
    this.spriteIndex = frame.spriteIndex;

    this.updateSprite();
  }

  this.element.style.backgroundPosition = '-' + frame.x * this.scaleFactor + 'px -' + frame.y * this.scaleFactor + 'px';
};

module.exports = DOMRenderer;
},{}],11:[function(require,module,exports){
'use strict';

var OffScreenCanvasRenderer = function(canvas, sprite){
  this.canvas = canvas;
  this.sprite = sprite;
  
  this.buffer = document.createElement('canvas');
  this.buffer.width = sprite.width;
  this.buffer.height = sprite.height;

  this.bufferContext = this.buffer.getContext('2d');
  this.bufferContext.drawImage(sprite, 0, 0);

  this.context = canvas.getContext('2d');
};

OffScreenCanvasRenderer.prototype.render = function(frame) {
  this.context.clearRect(0, 0, frame.width, frame.height);
  
  this.context.putImageData(
    this.bufferContext.getImageData(frame.x,frame.y,frame.width,frame.height),
    0,
    0
   );
};

module.exports = OffScreenCanvasRenderer;
},{}],12:[function(require,module,exports){
'use strict';

var TinyEmitter = require('tiny-emitter');
var inherits = require('inherits');
var Ticker = require('./Ticker');

var ticker = new Ticker();

var SpriteAnim = function(parser, renderer, options) {
  options = options || {};

  this.parser = parser;
  this.renderer = renderer;

  var defaultOptions = {
    manualUpdate: false,
    frameRate: 60,
    loop: false,
    yoyo: false,
    numFrames: parser.numFrames
  };

  for (var optionName in defaultOptions){
    this[optionName] = typeof options[optionName] !== 'undefined' ? options[optionName] : defaultOptions[optionName];
  }

  this.lastFrame = this.numFrames - 1;

  this.enterFrameId = -1;
  this.enterFrameCb = this.onEnterFrame.bind(this);

  this.currentFrame = 0;
  this.isPlaying = false;
  this.reversed = false;
  this.complete = false;

  this.lastFrameTime = 0;
  this.interval = 1000 / this.frameRate;

  this.x = 0;
  this.y = 0;

  this.alpha = 1;

  return this;
};

inherits(SpriteAnim, TinyEmitter);

SpriteAnim.prototype.play = function() {
  this.isPlaying = true;
  this.complete = false;

  if(!this.manualUpdate) {
    this.enterFrameId = ticker.add(this.enterFrameCb);
  }

  return this;
};

SpriteAnim.prototype.pause = function() {
  this.isPlaying = false;

  if(!this.manualUpdate) {
    ticker.remove(this.enterFrameId);
  }

  return this;
};

SpriteAnim.prototype.stop = function() {
  this.pause();
  this.currentFrame = 0;

  return this;
};

SpriteAnim.prototype.gotoAndPlay = function(frame) {
  this.currentFrame = frame;
  this.complete = false;

  if (!this.isPlaying) this.play();

  return this;
};

SpriteAnim.prototype.gotoAndStop = function(frame) {
  if (this.isPlaying) this.pause();
  this.currentFrame = frame;

  this.renderFrame();

  return this;
};

SpriteAnim.prototype.nextFrame = function() {
  this.currentFrame++;
  if (this.currentFrame > this.lastFrame) this.currentFrame = this.lastFrame;
  if (this.currentFrame >= this.lastFrame) this.complete = true;

  return this;
};

SpriteAnim.prototype.prevFrame = function() {
  this.currentFrame--;
  if (this.currentFrame < 0) this.currentFrame = 0;
  if (this.currentFrame <= 0) this.complete = true;

  return this;
};

SpriteAnim.prototype.renderFrame = function() {
  this.renderer.render(this.parser.frames[this.currentFrame], this);

  return this;
};

SpriteAnim.prototype.dispose = function() {
  this.stop();
  this.off('complete').off('enterFrame');

  return this;
};

SpriteAnim.prototype.onComplete = function() {
  if (this.loop) {
    if (this.yoyo) this.reversed = !this.reversed;

    if (!this.reversed) this.gotoAndPlay(0);
    else this.gotoAndPlay(this.lastFrame);
  } else {
    this.pause();
  }

  this.emit('complete');

  return this;
};

SpriteAnim.prototype.onEnterFrame = function(timeStamp) {
  if (timeStamp - this.lastFrameTime > this.interval || this.lastFrameTime === 0) {
    this.lastFrameTime = timeStamp;

    if (!this.manualUpdate) this.renderFrame();

    if (this.complete) {
      this.onComplete();
      return;
    }

    if (!this.reversed) this.nextFrame();
    else this.prevFrame();

    this.emit('enterFrame');
  }

  return this;
};

module.exports = SpriteAnim;

module.exports.CanvasRenderer = require('./renderer/CanvasRenderer.js');
module.exports.OffScreenCanvasRenderer = require('./renderer/OffScreenCanvasRenderer.js');
module.exports.DOMRenderer = require('./renderer/DOMRenderer.js');

module.exports.SimpleParser = require('./parser/SimpleParser.js');
module.exports.JSONArrayParser = require('./parser/JSONArrayParser.js');

},{"./Ticker":6,"./parser/JSONArrayParser.js":7,"./parser/SimpleParser.js":8,"./renderer/CanvasRenderer.js":9,"./renderer/DOMRenderer.js":10,"./renderer/OffScreenCanvasRenderer.js":11,"inherits":2,"tiny-emitter":5}]},{},[12])(12)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JhZi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utbm93L2xpYi9wZXJmb3JtYW5jZS1ub3cuanMiLCJub2RlX21vZHVsZXMvdGlueS1lbWl0dGVyL2luZGV4LmpzIiwic3JjL1RpY2tlci5qcyIsInNyYy9wYXJzZXIvSlNPTkFycmF5UGFyc2VyLmpzIiwic3JjL3BhcnNlci9TaW1wbGVQYXJzZXIuanMiLCJzcmMvcmVuZGVyZXIvQ2FudmFzUmVuZGVyZXIuanMiLCJzcmMvcmVuZGVyZXIvRE9NUmVuZGVyZXIuanMiLCJzcmMvcmVuZGVyZXIvT2ZmU2NyZWVuQ2FudmFzUmVuZGVyZXIuanMiLCJzcmMvU3ByaXRlQW5pbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsInZhciBub3cgPSByZXF1aXJlKCdwZXJmb3JtYW5jZS1ub3cnKVxuICAsIGdsb2JhbCA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8ge30gOiB3aW5kb3dcbiAgLCB2ZW5kb3JzID0gWydtb3onLCAnd2Via2l0J11cbiAgLCBzdWZmaXggPSAnQW5pbWF0aW9uRnJhbWUnXG4gICwgcmFmID0gZ2xvYmFsWydyZXF1ZXN0JyArIHN1ZmZpeF1cbiAgLCBjYWYgPSBnbG9iYWxbJ2NhbmNlbCcgKyBzdWZmaXhdIHx8IGdsb2JhbFsnY2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG5cbmZvcih2YXIgaSA9IDA7IGkgPCB2ZW5kb3JzLmxlbmd0aCAmJiAhcmFmOyBpKyspIHtcbiAgcmFmID0gZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnUmVxdWVzdCcgKyBzdWZmaXhdXG4gIGNhZiA9IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ0NhbmNlbCcgKyBzdWZmaXhdXG4gICAgICB8fCBnbG9iYWxbdmVuZG9yc1tpXSArICdDYW5jZWxSZXF1ZXN0JyArIHN1ZmZpeF1cbn1cblxuLy8gU29tZSB2ZXJzaW9ucyBvZiBGRiBoYXZlIHJBRiBidXQgbm90IGNBRlxuaWYoIXJhZiB8fCAhY2FmKSB7XG4gIHZhciBsYXN0ID0gMFxuICAgICwgaWQgPSAwXG4gICAgLCBxdWV1ZSA9IFtdXG4gICAgLCBmcmFtZUR1cmF0aW9uID0gMTAwMCAvIDYwXG5cbiAgcmFmID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBpZihxdWV1ZS5sZW5ndGggPT09IDApIHtcbiAgICAgIHZhciBfbm93ID0gbm93KClcbiAgICAgICAgLCBuZXh0ID0gTWF0aC5tYXgoMCwgZnJhbWVEdXJhdGlvbiAtIChfbm93IC0gbGFzdCkpXG4gICAgICBsYXN0ID0gbmV4dCArIF9ub3dcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBjcCA9IHF1ZXVlLnNsaWNlKDApXG4gICAgICAgIC8vIENsZWFyIHF1ZXVlIGhlcmUgdG8gcHJldmVudFxuICAgICAgICAvLyBjYWxsYmFja3MgZnJvbSBhcHBlbmRpbmcgbGlzdGVuZXJzXG4gICAgICAgIC8vIHRvIHRoZSBjdXJyZW50IGZyYW1lJ3MgcXVldWVcbiAgICAgICAgcXVldWUubGVuZ3RoID0gMFxuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY3AubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZighY3BbaV0uY2FuY2VsbGVkKSB7XG4gICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgIGNwW2ldLmNhbGxiYWNrKGxhc3QpXG4gICAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgdGhyb3cgZSB9LCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSwgTWF0aC5yb3VuZChuZXh0KSlcbiAgICB9XG4gICAgcXVldWUucHVzaCh7XG4gICAgICBoYW5kbGU6ICsraWQsXG4gICAgICBjYWxsYmFjazogY2FsbGJhY2ssXG4gICAgICBjYW5jZWxsZWQ6IGZhbHNlXG4gICAgfSlcbiAgICByZXR1cm4gaWRcbiAgfVxuXG4gIGNhZiA9IGZ1bmN0aW9uKGhhbmRsZSkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBxdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgaWYocXVldWVbaV0uaGFuZGxlID09PSBoYW5kbGUpIHtcbiAgICAgICAgcXVldWVbaV0uY2FuY2VsbGVkID0gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuKSB7XG4gIC8vIFdyYXAgaW4gYSBuZXcgZnVuY3Rpb24gdG8gcHJldmVudFxuICAvLyBgY2FuY2VsYCBwb3RlbnRpYWxseSBiZWluZyBhc3NpZ25lZFxuICAvLyB0byB0aGUgbmF0aXZlIHJBRiBmdW5jdGlvblxuICByZXR1cm4gcmFmLmNhbGwoZ2xvYmFsLCBmbilcbn1cbm1vZHVsZS5leHBvcnRzLmNhbmNlbCA9IGZ1bmN0aW9uKCkge1xuICBjYWYuYXBwbHkoZ2xvYmFsLCBhcmd1bWVudHMpXG59XG4iLCIvLyBHZW5lcmF0ZWQgYnkgQ29mZmVlU2NyaXB0IDEuNi4zXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBnZXROYW5vU2Vjb25kcywgaHJ0aW1lLCBsb2FkVGltZTtcblxuICBpZiAoKHR5cGVvZiBwZXJmb3JtYW5jZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwZXJmb3JtYW5jZSAhPT0gbnVsbCkgJiYgcGVyZm9ybWFuY2Uubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB9O1xuICB9IGVsc2UgaWYgKCh0eXBlb2YgcHJvY2VzcyAhPT0gXCJ1bmRlZmluZWRcIiAmJiBwcm9jZXNzICE9PSBudWxsKSAmJiBwcm9jZXNzLmhydGltZSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gKGdldE5hbm9TZWNvbmRzKCkgLSBsb2FkVGltZSkgLyAxZTY7XG4gICAgfTtcbiAgICBocnRpbWUgPSBwcm9jZXNzLmhydGltZTtcbiAgICBnZXROYW5vU2Vjb25kcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGhyO1xuICAgICAgaHIgPSBocnRpbWUoKTtcbiAgICAgIHJldHVybiBoclswXSAqIDFlOSArIGhyWzFdO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBnZXROYW5vU2Vjb25kcygpO1xuICB9IGVsc2UgaWYgKERhdGUubm93KSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbG9hZFRpbWU7XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IERhdGUubm93KCk7XG4gIH0gZWxzZSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfVxuXG59KS5jYWxsKHRoaXMpO1xuXG4vKlxuLy9AIHNvdXJjZU1hcHBpbmdVUkw9cGVyZm9ybWFuY2Utbm93Lm1hcFxuKi9cbiIsImZ1bmN0aW9uIEUgKCkge1xuXHQvLyBLZWVwIHRoaXMgZW1wdHkgc28gaXQncyBlYXNpZXIgdG8gaW5oZXJpdCBmcm9tXG4gIC8vICh2aWEgaHR0cHM6Ly9naXRodWIuY29tL2xpcHNtYWNrIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0Y29yZ2FuL3RpbnktZW1pdHRlci9pc3N1ZXMvMylcbn1cblxuRS5wcm90b3R5cGUgPSB7XG5cdG9uOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG4gICAgXG4gICAgKGVbbmFtZV0gfHwgKGVbbmFtZV0gPSBbXSkpLnB1c2goe1xuICAgICAgZm46IGNhbGxiYWNrLFxuICAgICAgY3R4OiBjdHhcbiAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBvbmNlOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGN0eCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgZm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLm9mZihuYW1lLCBmbik7XG4gICAgICBjYWxsYmFjay5hcHBseShjdHgsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgICBcbiAgICByZXR1cm4gdGhpcy5vbihuYW1lLCBmbiwgY3R4KTtcbiAgfSxcblxuICBlbWl0OiBmdW5jdGlvbiAobmFtZSkge1xuICAgIHZhciBkYXRhID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciBldnRBcnIgPSAoKHRoaXMuZSB8fCAodGhpcy5lID0ge30pKVtuYW1lXSB8fCBbXSkuc2xpY2UoKTtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGxlbiA9IGV2dEFyci5sZW5ndGg7XG4gICAgXG4gICAgZm9yIChpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGV2dEFycltpXS5mbi5hcHBseShldnRBcnJbaV0uY3R4LCBkYXRhKTtcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb2ZmOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgZSA9IHRoaXMuZSB8fCAodGhpcy5lID0ge30pO1xuICAgIHZhciBldnRzID0gZVtuYW1lXTtcbiAgICB2YXIgbGl2ZUV2ZW50cyA9IFtdO1xuICAgIFxuICAgIGlmIChldnRzICYmIGNhbGxiYWNrKSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZXZ0cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZXZ0c1tpXS5mbiAhPT0gY2FsbGJhY2spIGxpdmVFdmVudHMucHVzaChldnRzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgLy8gUmVtb3ZlIGV2ZW50IGZyb20gcXVldWUgdG8gcHJldmVudCBtZW1vcnkgbGVha1xuICAgIC8vIFN1Z2dlc3RlZCBieSBodHRwczovL2dpdGh1Yi5jb20vbGF6ZFxuICAgIC8vIFJlZjogaHR0cHM6Ly9naXRodWIuY29tL3Njb3R0Y29yZ2FuL3RpbnktZW1pdHRlci9jb21taXQvYzZlYmZhYTliYzk3M2IzM2QxMTBhODRhMzA3NzQyYjdjZjk0Yzk1MyNjb21taXRjb21tZW50LTUwMjQ5MTBcblxuICAgIChsaXZlRXZlbnRzLmxlbmd0aCkgXG4gICAgICA/IGVbbmFtZV0gPSBsaXZlRXZlbnRzXG4gICAgICA6IGRlbGV0ZSBlW25hbWVdO1xuICAgIFxuICAgIHJldHVybiB0aGlzO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEU7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciByYWYgPSByZXF1aXJlKCdyYWYnKTtcblxudmFyIGl0ZW1JZCA9IDA7XG5cbnZhciBUaWNrZXIgPSBmdW5jdGlvbigpe1xuICB0aGlzLml0ZW1zID0gW107XG5cbiAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcbiAgdGhpcy50aWNrSWQgPSAtMTtcbiAgdGhpcy50aWNrQ2IgPSB0aGlzLm9uVGljay5iaW5kKHRoaXMpO1xufTtcblxuVGlja2VyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzUnVubmluZyA9IHRydWU7XG4gIFxuICB0aGlzLnRpY2tJZCA9IHJhZih0aGlzLnRpY2tDYik7XG59O1xuXG5UaWNrZXIucHJvdG90eXBlLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG5cbiAgcmFmLmNhbmNlbCh0aGlzLnRpY2tJZCk7XG59O1xuXG5UaWNrZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gIHZhciBpZCA9IGl0ZW1JZCsrO1xuXG4gIHRoaXMuaXRlbXMucHVzaCh7XG4gICAgaWQ6IGlkLFxuICAgIGNiOiBjYWxsYmFja1xuICB9KTtcblxuICBpZiAoIXRoaXMuaXNSdW5uaW5nKSB0aGlzLnN0YXJ0KCk7XG5cbiAgcmV0dXJuIGlkO1xufTtcblxuVGlja2VyLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihpZCkge1xuICB2YXIgaXRlbTtcblxuICBmb3IgKHZhciBpID0gMCwgbiA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgbjsgaSsrKXtcbiAgICBpZiAodGhpcy5pdGVtc1tpXS5pZCA9PT0gaWQpe1xuICAgICAgaXRlbSA9IHRoaXMuaXRlbXMuc3BsaWNlKGksIDEpWzBdO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIFxuICBpZiAodGhpcy5pdGVtcy5sZW5ndGggPT09IDApIHRoaXMucGF1c2UoKTtcblxuICByZXR1cm4gaXRlbTtcbn07XG5cblRpY2tlci5wcm90b3R5cGUub25UaWNrID0gZnVuY3Rpb24odGltZVN0YW1wKSB7XG4gIHRoaXMudGlja0lkID0gcmFmKHRoaXMudGlja0NiKTtcbiAgXG4gIGZvciAodmFyIGkgPSAwLCBuID0gdGhpcy5pdGVtcy5sZW5ndGg7IGkgPCBuOyBpKyspe1xuICAgIGlmICh0aGlzLml0ZW1zW2ldKSB0aGlzLml0ZW1zW2ldLmNiKHRpbWVTdGFtcCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVGlja2VyO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBKU09OQXJyYXlQYXJzZXIgPSBmdW5jdGlvbihkYXRhLCBzY2FsZUZhY3Rvcil7XG4gIHNjYWxlRmFjdG9yID0gc2NhbGVGYWN0b3IgfHzCoDE7XG5cbiAgdGhpcy5mcmFtZXMgPSBbXTtcbiAgdGhpcy5udW1GcmFtZXMgPSBkYXRhLmZyYW1lcy5sZW5ndGg7XG5cbiAgdmFyIGZyYW1lO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5udW1GcmFtZXM7IGkrKyl7XG4gICAgZnJhbWUgPSBkYXRhLmZyYW1lc1tpXS5mcmFtZTtcblxuICAgIHRoaXMuZnJhbWVzLnB1c2goe1xuICAgICAgaW5kZXg6IGksXG4gICAgICB4OiBmcmFtZS54ICogc2NhbGVGYWN0b3IsXG4gICAgICB5OiBmcmFtZS55ICogc2NhbGVGYWN0b3IsXG4gICAgICB3aWR0aDogZnJhbWUudyAqIHNjYWxlRmFjdG9yLFxuICAgICAgaGVpZ2h0OiBmcmFtZS5oICogc2NhbGVGYWN0b3JcbiAgICB9KTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBKU09OQXJyYXlQYXJzZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgU2ltcGxlUGFyc2VyID0gZnVuY3Rpb24oc3ByaXRlLCBmcmFtZVNpemUsIG9wdGlvbnMpe1xuICB0aGlzLmZyYW1lU2l6ZSA9IGZyYW1lU2l6ZTtcblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8wqB7fTtcbiAgdGhpcy5zY2FsZUZhY3RvciA9IHRoaXMub3B0aW9ucy5zY2FsZUZhY3RvciB8fCAxO1xuICB0aGlzLm51bUZyYW1lcyA9IHRoaXMub3B0aW9ucy5udW1GcmFtZXM7XG5cbiAgdGhpcy5mcmFtZXMgPSBbXTtcblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHNwcml0ZSkgPT09ICdbb2JqZWN0IEFycmF5XScpe1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gc3ByaXRlLmxlbmd0aDsgaSA8IG47IGkrKyl7XG4gICAgICB0aGlzLmluaXRTcHJpdGVGcmFtZXMoc3ByaXRlW2ldLCBpKTtcbiAgICB9XG4gIH1lbHNle1xuICAgIHRoaXMuaW5pdFNwcml0ZUZyYW1lcyhzcHJpdGUsIDApO1xuICB9XG5cbiAgaWYgKCF0aGlzLm51bUZyYW1lcykgdGhpcy5udW1GcmFtZXMgPSB0aGlzLmZyYW1lcy5sZW5ndGg7XG59O1xuXG5TaW1wbGVQYXJzZXIucHJvdG90eXBlLmluaXRTcHJpdGVGcmFtZXMgPSBmdW5jdGlvbihzcHJpdGUsIHNwcml0ZUluZGV4KXtcbiAgdmFyIHNwcml0ZVdpZHRoID0gc3ByaXRlLm5hdHVyYWxXaWR0aCB8fCBzcHJpdGUud2lkdGg7XG4gIHZhciBzcHJpdGVIZWlnaHQgPSBzcHJpdGUubmF0dXJhbEhlaWdodCB8fCBzcHJpdGUuaGVpZ2h0O1xuXG4gIHNwcml0ZVdpZHRoICo9IHRoaXMuc2NhbGVGYWN0b3I7XG4gIHNwcml0ZUhlaWdodCAqPSB0aGlzLnNjYWxlRmFjdG9yO1xuXG4gIHZhciBudW1GcmFtZXNYID0gTWF0aC5jZWlsKHNwcml0ZVdpZHRoIC8gdGhpcy5mcmFtZVNpemUud2lkdGgpO1xuICB2YXIgbnVtRnJhbWVzWSA9IE1hdGguY2VpbChzcHJpdGVIZWlnaHQgLyB0aGlzLmZyYW1lU2l6ZS5oZWlnaHQpO1xuXG4gIGxvb3BZOiBcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1GcmFtZXNZOyBpKyspIHtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgbnVtRnJhbWVzWDsgaisrKSB7XG4gICAgICB0aGlzLmZyYW1lcy5wdXNoKHtcbiAgICAgICAgeDogaiAqIHRoaXMuZnJhbWVTaXplLndpZHRoLFxuICAgICAgICB5OiBpICogdGhpcy5mcmFtZVNpemUuaGVpZ2h0LFxuICAgICAgICBpbmRleDogdGhpcy5mcmFtZXMubGVuZ3RoLFxuICAgICAgICB3aWR0aDogdGhpcy5mcmFtZVNpemUud2lkdGgsXG4gICAgICAgIGhlaWdodDogdGhpcy5mcmFtZVNpemUuaGVpZ2h0LFxuICAgICAgICBzcHJpdGVJbmRleDogc3ByaXRlSW5kZXhcbiAgICAgIH0pO1xuXG4gICAgICBpZiAodGhpcy5mcmFtZXMubGVuZ3RoID09PSB0aGlzLm51bUZyYW1lcykgYnJlYWsgbG9vcFk7XG4gICAgfVxuICAgIFxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpbXBsZVBhcnNlcjtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FudmFzUmVuZGVyZXIgPSBmdW5jdGlvbihjYW52YXMsIHNwcml0ZSwgb3B0aW9ucyl7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBjbGVhckZyYW1lOiB0cnVlXG4gIH07XG5cbiAgZm9yICh2YXIgb3B0aW9uTmFtZSBpbiBkZWZhdWx0T3B0aW9ucyl7XG4gICAgdGhpc1tvcHRpb25OYW1lXSA9IHR5cGVvZiBvcHRpb25zW29wdGlvbk5hbWVdICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnNbb3B0aW9uTmFtZV0gOiBkZWZhdWx0T3B0aW9uc1tvcHRpb25OYW1lXTtcbiAgfVxuXG4gIHRoaXMuY2FudmFzID0gY2FudmFzO1xuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3ByaXRlKSA9PT0gJ1tvYmplY3QgQXJyYXldJyl7XG4gICAgdGhpcy5zcHJpdGVzID0gc3ByaXRlO1xuICB9ZWxzZXtcbiAgICB0aGlzLnNwcml0ZXMgPSBbc3ByaXRlXTtcbiAgfVxuXG4gIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xuXG4gIHRoaXMuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xufTtcblxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGZyYW1lLCBhbmltYXRpb24pIHtcbiAgaWYgKHRoaXMuY2xlYXJGcmFtZSkgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0KTtcblxuICB0aGlzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhbmltYXRpb24uYWxwaGE7XG5cbiAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZShcbiAgICB0aGlzLnNwcml0ZXNbZnJhbWUuc3ByaXRlSW5kZXhdLFxuICAgIGZyYW1lLngsXG4gICAgZnJhbWUueSxcbiAgICBmcmFtZS53aWR0aCxcbiAgICBmcmFtZS5oZWlnaHQsXG4gICAgYW5pbWF0aW9uLngsXG4gICAgYW5pbWF0aW9uLnksXG4gICAgZnJhbWUud2lkdGgsXG4gICAgZnJhbWUuaGVpZ2h0XG4gICApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNSZW5kZXJlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIERPTVJlbmRlcmVyID0gZnVuY3Rpb24oZWxlbWVudCwgb3B0aW9ucyl7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG5cbiAgdGhpcy5zY2FsZUZhY3RvciA9IG9wdGlvbnMuc2NhbGVGYWN0b3IgfHwgMTtcbiAgdGhpcy5zcHJpdGUgPSBvcHRpb25zLnNwcml0ZTtcblxuICB0aGlzLnNwcml0ZUluZGV4ID0gMDtcbiAgaWYgKHRoaXMuc3ByaXRlKSB0aGlzLnVwZGF0ZVNwcml0ZSgpO1xufTtcblxuRE9NUmVuZGVyZXIucHJvdG90eXBlLnVwZGF0ZVNwcml0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3ByaXRlO1xuXG4gIGlmIChPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodGhpcy5zcHJpdGUpID09PSAnW29iamVjdCBBcnJheV0nKXtcbiAgICBzcHJpdGUgPSB0aGlzLnNwcml0ZVt0aGlzLnNwcml0ZUluZGV4XTtcbiAgfWVsc2V7XG4gICAgc3ByaXRlID0gdGhpcy5zcHJpdGU7XG4gIH1cblxuICB2YXIgc3ByaXRlV2lkdGggPSBzcHJpdGUubmF0dXJhbFdpZHRoICogdGhpcy5zY2FsZUZhY3RvcjtcbiAgdmFyIHNwcml0ZUhlaWdodCA9IHNwcml0ZS5uYXR1cmFsSGVpZ2h0ICogdGhpcy5zY2FsZUZhY3RvcjtcblxuICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgc3ByaXRlLnNyYyArICcpJztcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRTaXplID0gc3ByaXRlV2lkdGggKyAncHggJyArIHNwcml0ZUhlaWdodCArICdweCc7XG59O1xuXG5ET01SZW5kZXJlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZnJhbWUpIHtcbiAgaWYgKGZyYW1lLnNwcml0ZUluZGV4ICE9PSB0aGlzLnNwcml0ZUluZGV4KXtcbiAgICB0aGlzLnNwcml0ZUluZGV4ID0gZnJhbWUuc3ByaXRlSW5kZXg7XG5cbiAgICB0aGlzLnVwZGF0ZVNwcml0ZSgpO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRQb3NpdGlvbiA9ICctJyArIGZyYW1lLnggKiB0aGlzLnNjYWxlRmFjdG9yICsgJ3B4IC0nICsgZnJhbWUueSAqIHRoaXMuc2NhbGVGYWN0b3IgKyAncHgnO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBET01SZW5kZXJlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBPZmZTY3JlZW5DYW52YXNSZW5kZXJlciA9IGZ1bmN0aW9uKGNhbnZhcywgc3ByaXRlKXtcbiAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xuICBcbiAgdGhpcy5idWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgdGhpcy5idWZmZXIud2lkdGggPSBzcHJpdGUud2lkdGg7XG4gIHRoaXMuYnVmZmVyLmhlaWdodCA9IHNwcml0ZS5oZWlnaHQ7XG5cbiAgdGhpcy5idWZmZXJDb250ZXh0ID0gdGhpcy5idWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5idWZmZXJDb250ZXh0LmRyYXdJbWFnZShzcHJpdGUsIDAsIDApO1xuXG4gIHRoaXMuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xufTtcblxuT2ZmU2NyZWVuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGZyYW1lKSB7XG4gIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodCk7XG4gIFxuICB0aGlzLmNvbnRleHQucHV0SW1hZ2VEYXRhKFxuICAgIHRoaXMuYnVmZmVyQ29udGV4dC5nZXRJbWFnZURhdGEoZnJhbWUueCxmcmFtZS55LGZyYW1lLndpZHRoLGZyYW1lLmhlaWdodCksXG4gICAgMCxcbiAgICAwXG4gICApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPZmZTY3JlZW5DYW52YXNSZW5kZXJlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBUaW55RW1pdHRlciA9IHJlcXVpcmUoJ3RpbnktZW1pdHRlcicpO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbnZhciBUaWNrZXIgPSByZXF1aXJlKCcuL1RpY2tlcicpO1xuXG52YXIgdGlja2VyID0gbmV3IFRpY2tlcigpO1xuXG52YXIgU3ByaXRlQW5pbSA9IGZ1bmN0aW9uKHBhcnNlciwgcmVuZGVyZXIsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdGhpcy5wYXJzZXIgPSBwYXJzZXI7XG4gIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcblxuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgbWFudWFsVXBkYXRlOiBmYWxzZSxcbiAgICBmcmFtZVJhdGU6IDYwLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIHlveW86IGZhbHNlLFxuICAgIG51bUZyYW1lczogcGFyc2VyLm51bUZyYW1lc1xuICB9O1xuXG4gIGZvciAodmFyIG9wdGlvbk5hbWUgaW4gZGVmYXVsdE9wdGlvbnMpe1xuICAgIHRoaXNbb3B0aW9uTmFtZV0gPSB0eXBlb2Ygb3B0aW9uc1tvcHRpb25OYW1lXSAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zW29wdGlvbk5hbWVdIDogZGVmYXVsdE9wdGlvbnNbb3B0aW9uTmFtZV07XG4gIH1cblxuICB0aGlzLmxhc3RGcmFtZSA9IHRoaXMubnVtRnJhbWVzIC0gMTtcblxuICB0aGlzLmVudGVyRnJhbWVJZCA9IC0xO1xuICB0aGlzLmVudGVyRnJhbWVDYiA9IHRoaXMub25FbnRlckZyYW1lLmJpbmQodGhpcyk7XG5cbiAgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xuICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICB0aGlzLnJldmVyc2VkID0gZmFsc2U7XG4gIHRoaXMuY29tcGxldGUgPSBmYWxzZTtcblxuICB0aGlzLmxhc3RGcmFtZVRpbWUgPSAwO1xuICB0aGlzLmludGVydmFsID0gMTAwMCAvIHRoaXMuZnJhbWVSYXRlO1xuXG4gIHRoaXMueCA9IDA7XG4gIHRoaXMueSA9IDA7XG5cbiAgdGhpcy5hbHBoYSA9IDE7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5pbmhlcml0cyhTcHJpdGVBbmltLCBUaW55RW1pdHRlcik7XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICB0aGlzLmNvbXBsZXRlID0gZmFsc2U7XG5cbiAgaWYoIXRoaXMubWFudWFsVXBkYXRlKSB7XG4gICAgdGhpcy5lbnRlckZyYW1lSWQgPSB0aWNrZXIuYWRkKHRoaXMuZW50ZXJGcmFtZUNiKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcblxuICBpZighdGhpcy5tYW51YWxVcGRhdGUpIHtcbiAgICB0aWNrZXIucmVtb3ZlKHRoaXMuZW50ZXJGcmFtZUlkKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhdXNlKCk7XG4gIHRoaXMuY3VycmVudEZyYW1lID0gMDtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLmdvdG9BbmRQbGF5ID0gZnVuY3Rpb24oZnJhbWUpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcbiAgdGhpcy5jb21wbGV0ZSA9IGZhbHNlO1xuXG4gIGlmICghdGhpcy5pc1BsYXlpbmcpIHRoaXMucGxheSgpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUuZ290b0FuZFN0b3AgPSBmdW5jdGlvbihmcmFtZSkge1xuICBpZiAodGhpcy5pc1BsYXlpbmcpIHRoaXMucGF1c2UoKTtcbiAgdGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcblxuICB0aGlzLnJlbmRlckZyYW1lKCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5uZXh0RnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUrKztcbiAgaWYgKHRoaXMuY3VycmVudEZyYW1lID4gdGhpcy5sYXN0RnJhbWUpIHRoaXMuY3VycmVudEZyYW1lID0gdGhpcy5sYXN0RnJhbWU7XG4gIGlmICh0aGlzLmN1cnJlbnRGcmFtZSA+PSB0aGlzLmxhc3RGcmFtZSkgdGhpcy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5wcmV2RnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUtLTtcbiAgaWYgKHRoaXMuY3VycmVudEZyYW1lIDwgMCkgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xuICBpZiAodGhpcy5jdXJyZW50RnJhbWUgPD0gMCkgdGhpcy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5yZW5kZXJGcmFtZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnBhcnNlci5mcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVdLCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLmRpc3Bvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdG9wKCk7XG4gIHRoaXMub2ZmKCdjb21wbGV0ZScpLm9mZignZW50ZXJGcmFtZScpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUub25Db21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5sb29wKSB7XG4gICAgaWYgKHRoaXMueW95bykgdGhpcy5yZXZlcnNlZCA9ICF0aGlzLnJldmVyc2VkO1xuXG4gICAgaWYgKCF0aGlzLnJldmVyc2VkKSB0aGlzLmdvdG9BbmRQbGF5KDApO1xuICAgIGVsc2UgdGhpcy5nb3RvQW5kUGxheSh0aGlzLmxhc3RGcmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXVzZSgpO1xuICB9XG5cbiAgdGhpcy5lbWl0KCdjb21wbGV0ZScpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUub25FbnRlckZyYW1lID0gZnVuY3Rpb24odGltZVN0YW1wKSB7XG4gIGlmICh0aW1lU3RhbXAgLSB0aGlzLmxhc3RGcmFtZVRpbWUgPiB0aGlzLmludGVydmFsIHx8IHRoaXMubGFzdEZyYW1lVGltZSA9PT0gMCkge1xuICAgIHRoaXMubGFzdEZyYW1lVGltZSA9IHRpbWVTdGFtcDtcblxuICAgIGlmICghdGhpcy5tYW51YWxVcGRhdGUpIHRoaXMucmVuZGVyRnJhbWUoKTtcblxuICAgIGlmICh0aGlzLmNvbXBsZXRlKSB7XG4gICAgICB0aGlzLm9uQ29tcGxldGUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucmV2ZXJzZWQpIHRoaXMubmV4dEZyYW1lKCk7XG4gICAgZWxzZSB0aGlzLnByZXZGcmFtZSgpO1xuXG4gICAgdGhpcy5lbWl0KCdlbnRlckZyYW1lJyk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlQW5pbTtcblxubW9kdWxlLmV4cG9ydHMuQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL0NhbnZhc1JlbmRlcmVyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5PZmZTY3JlZW5DYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvT2ZmU2NyZWVuQ2FudmFzUmVuZGVyZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkRPTVJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9ET01SZW5kZXJlci5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cy5TaW1wbGVQYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlci9TaW1wbGVQYXJzZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkpTT05BcnJheVBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyL0pTT05BcnJheVBhcnNlci5qcycpO1xuIl19
