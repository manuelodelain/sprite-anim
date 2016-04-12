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

var isArray = require('../utils/is-array');

var SimpleParser = function(sprite, frameSize, options){
  this.frameSize = frameSize;

  this.options = options || {};
  this.scaleFactor = this.options.scaleFactor || 1;
  this.numFrames = this.options.numFrames;

  this.frames = [];

  if (isArray(sprite)){
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


},{"../utils/is-array":13}],9:[function(require,module,exports){
'use strict';

var defaultValues = require('../utils/default-values');
var isArray = require('../utils/is-array');

var CanvasRenderer = function(canvas, sprite, options){
  options = options || {};

  var defaultOptions = {
    clearFrame: true
  };

  defaultValues(this, defaultOptions, options);

  this.canvas = canvas;

  if (isArray(sprite)){
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

},{"../utils/default-values":12,"../utils/is-array":13}],10:[function(require,module,exports){
'use strict';

var isArray = require('../utils/is-array');

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

  if (isArray(this.sprite)){
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
},{"../utils/is-array":13}],11:[function(require,module,exports){
'use strict';

var defaultValues = require('../utils/default-values');

var OffScreenCanvasRenderer = function(canvas, sprite, options){
  options = options || {};

  this.canvas = canvas;
  this.sprite = sprite;

  var defaultOptions = {
    clearFrame: true
  };

  defaultValues(this, defaultOptions, options);
  
  this.buffer = document.createElement('canvas');
  this.buffer.width = sprite.width;
  this.buffer.height = sprite.height;

  this.bufferContext = this.buffer.getContext('2d');
  this.bufferContext.drawImage(sprite, 0, 0);

  this.context = canvas.getContext('2d');
};

OffScreenCanvasRenderer.prototype.render = function(frame, animation) {
  if (this.clearFrame) this.context.clearRect(0, 0, frame.width, frame.height);

  this.context.globalAlpha = animation.alpha;
  
  this.context.putImageData(
    this.bufferContext.getImageData(frame.x,frame.y,frame.width,frame.height),
    animation.x,
    animation.y,
    0,
    0,
    frame.width,
    frame.height
   );
};

module.exports = OffScreenCanvasRenderer;
},{"../utils/default-values":12}],12:[function(require,module,exports){
module.exports = function(scope, defaultValues, values){
  for (var key in defaultValues){
    scope[key] = typeof values[key] !== 'undefined' ? values[key] : defaultValues[key];
  }
};
},{}],13:[function(require,module,exports){
module.exports = function(obj){
  return Object.prototype.toString.call(obj) === '[object Array]';
};
},{}],14:[function(require,module,exports){
'use strict';

var defaultValues = require('./utils/default-values');

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

  defaultValues(this, defaultOptions, options);

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

    if (this.isPlaying){
      if (!this.reversed) this.nextFrame();
      else this.prevFrame();
    }

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

},{"./Ticker":6,"./parser/JSONArrayParser.js":7,"./parser/SimpleParser.js":8,"./renderer/CanvasRenderer.js":9,"./renderer/DOMRenderer.js":10,"./renderer/OffScreenCanvasRenderer.js":11,"./utils/default-values":12,"inherits":2,"tiny-emitter":5}]},{},[14])(14)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JhZi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utbm93L2xpYi9wZXJmb3JtYW5jZS1ub3cuanMiLCJub2RlX21vZHVsZXMvdGlueS1lbWl0dGVyL2luZGV4LmpzIiwic3JjL1RpY2tlci5qcyIsInNyYy9wYXJzZXIvSlNPTkFycmF5UGFyc2VyLmpzIiwic3JjL3BhcnNlci9TaW1wbGVQYXJzZXIuanMiLCJzcmMvcmVuZGVyZXIvQ2FudmFzUmVuZGVyZXIuanMiLCJzcmMvcmVuZGVyZXIvRE9NUmVuZGVyZXIuanMiLCJzcmMvcmVuZGVyZXIvT2ZmU2NyZWVuQ2FudmFzUmVuZGVyZXIuanMiLCJzcmMvdXRpbHMvZGVmYXVsdC12YWx1ZXMuanMiLCJzcmMvdXRpbHMvaXMtYXJyYXkuanMiLCJzcmMvU3ByaXRlQW5pbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiaWYgKHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nKSB7XG4gIC8vIGltcGxlbWVudGF0aW9uIGZyb20gc3RhbmRhcmQgbm9kZS5qcyAndXRpbCcgbW9kdWxlXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICBjdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDdG9yLnByb3RvdHlwZSwge1xuICAgICAgY29uc3RydWN0b3I6IHtcbiAgICAgICAgdmFsdWU6IGN0b3IsXG4gICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICB9XG4gICAgfSk7XG4gIH07XG59IGVsc2Uge1xuICAvLyBvbGQgc2Nob29sIHNoaW0gZm9yIG9sZCBicm93c2Vyc1xuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgdmFyIFRlbXBDdG9yID0gZnVuY3Rpb24gKCkge31cbiAgICBUZW1wQ3Rvci5wcm90b3R5cGUgPSBzdXBlckN0b3IucHJvdG90eXBlXG4gICAgY3Rvci5wcm90b3R5cGUgPSBuZXcgVGVtcEN0b3IoKVxuICAgIGN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gY3RvclxuICB9XG59XG4iLCJ2YXIgbm93ID0gcmVxdWlyZSgncGVyZm9ybWFuY2Utbm93JylcbiAgLCBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IHt9IDogd2luZG93XG4gICwgdmVuZG9ycyA9IFsnbW96JywgJ3dlYmtpdCddXG4gICwgc3VmZml4ID0gJ0FuaW1hdGlvbkZyYW1lJ1xuICAsIHJhZiA9IGdsb2JhbFsncmVxdWVzdCcgKyBzdWZmaXhdXG4gICwgY2FmID0gZ2xvYmFsWydjYW5jZWwnICsgc3VmZml4XSB8fCBnbG9iYWxbJ2NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXJhZjsgaSsrKSB7XG4gIHJhZiA9IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ1JlcXVlc3QnICsgc3VmZml4XVxuICBjYWYgPSBnbG9iYWxbdmVuZG9yc1tpXSArICdDYW5jZWwnICsgc3VmZml4XVxuICAgICAgfHwgZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnQ2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG59XG5cbi8vIFNvbWUgdmVyc2lvbnMgb2YgRkYgaGF2ZSByQUYgYnV0IG5vdCBjQUZcbmlmKCFyYWYgfHwgIWNhZikge1xuICB2YXIgbGFzdCA9IDBcbiAgICAsIGlkID0gMFxuICAgICwgcXVldWUgPSBbXVxuICAgICwgZnJhbWVEdXJhdGlvbiA9IDEwMDAgLyA2MFxuXG4gIHJhZiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB2YXIgX25vdyA9IG5vdygpXG4gICAgICAgICwgbmV4dCA9IE1hdGgubWF4KDAsIGZyYW1lRHVyYXRpb24gLSAoX25vdyAtIGxhc3QpKVxuICAgICAgbGFzdCA9IG5leHQgKyBfbm93XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3AgPSBxdWV1ZS5zbGljZSgwKVxuICAgICAgICAvLyBDbGVhciBxdWV1ZSBoZXJlIHRvIHByZXZlbnRcbiAgICAgICAgLy8gY2FsbGJhY2tzIGZyb20gYXBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgICAvLyB0byB0aGUgY3VycmVudCBmcmFtZSdzIHF1ZXVlXG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDBcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYoIWNwW2ldLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICBjcFtpXS5jYWxsYmFjayhsYXN0KVxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGUgfSwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIE1hdGgucm91bmQobmV4dCkpXG4gICAgfVxuICAgIHF1ZXVlLnB1c2goe1xuICAgICAgaGFuZGxlOiArK2lkLFxuICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgY2FuY2VsbGVkOiBmYWxzZVxuICAgIH0pXG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICBjYWYgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHF1ZXVlW2ldLmhhbmRsZSA9PT0gaGFuZGxlKSB7XG4gICAgICAgIHF1ZXVlW2ldLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbikge1xuICAvLyBXcmFwIGluIGEgbmV3IGZ1bmN0aW9uIHRvIHByZXZlbnRcbiAgLy8gYGNhbmNlbGAgcG90ZW50aWFsbHkgYmVpbmcgYXNzaWduZWRcbiAgLy8gdG8gdGhlIG5hdGl2ZSByQUYgZnVuY3Rpb25cbiAgcmV0dXJuIHJhZi5jYWxsKGdsb2JhbCwgZm4pXG59XG5tb2R1bGUuZXhwb3J0cy5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgY2FmLmFwcGx5KGdsb2JhbCwgYXJndW1lbnRzKVxufVxuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjYuM1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0TmFub1NlY29uZHMsIGhydGltZSwgbG9hZFRpbWU7XG5cbiAgaWYgKCh0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwpICYmIHBlcmZvcm1hbmNlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCkgJiYgcHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChnZXROYW5vU2Vjb25kcygpIC0gbG9hZFRpbWUpIC8gMWU2O1xuICAgIH07XG4gICAgaHJ0aW1lID0gcHJvY2Vzcy5ocnRpbWU7XG4gICAgZ2V0TmFub1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBocjtcbiAgICAgIGhyID0gaHJ0aW1lKCk7XG4gICAgICByZXR1cm4gaHJbMF0gKiAxZTkgKyBoclsxXTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gZ2V0TmFub1NlY29uZHMoKTtcbiAgfSBlbHNlIGlmIChEYXRlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBEYXRlLm5vdygpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPXBlcmZvcm1hbmNlLW5vdy5tYXBcbiovXG4iLCJmdW5jdGlvbiBFICgpIHtcblx0Ly8gS2VlcCB0aGlzIGVtcHR5IHNvIGl0J3MgZWFzaWVyIHRvIGluaGVyaXQgZnJvbVxuICAvLyAodmlhIGh0dHBzOi8vZ2l0aHViLmNvbS9saXBzbWFjayBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGNvcmdhbi90aW55LWVtaXR0ZXIvaXNzdWVzLzMpXG59XG5cbkUucHJvdG90eXBlID0ge1xuXHRvbjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICB2YXIgZSA9IHRoaXMuZSB8fCAodGhpcy5lID0ge30pO1xuICAgIFxuICAgIChlW25hbWVdIHx8IChlW25hbWVdID0gW10pKS5wdXNoKHtcbiAgICAgIGZuOiBjYWxsYmFjayxcbiAgICAgIGN0eDogY3R4XG4gICAgfSk7XG4gICAgXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG5cbiAgb25jZTogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBjdHgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGZuID0gZnVuY3Rpb24gKCkge1xuICAgICAgc2VsZi5vZmYobmFtZSwgZm4pO1xuICAgICAgY2FsbGJhY2suYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgXG4gICAgcmV0dXJuIHRoaXMub24obmFtZSwgZm4sIGN0eCk7XG4gIH0sXG5cbiAgZW1pdDogZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB2YXIgZGF0YSA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgZXZ0QXJyID0gKCh0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KSlbbmFtZV0gfHwgW10pLnNsaWNlKCk7XG4gICAgdmFyIGkgPSAwO1xuICAgIHZhciBsZW4gPSBldnRBcnIubGVuZ3RoO1xuICAgIFxuICAgIGZvciAoaTsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBldnRBcnJbaV0uZm4uYXBwbHkoZXZ0QXJyW2ldLmN0eCwgZGF0YSk7XG4gICAgfVxuICAgIFxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIG9mZjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcbiAgICB2YXIgZXZ0cyA9IGVbbmFtZV07XG4gICAgdmFyIGxpdmVFdmVudHMgPSBbXTtcbiAgICBcbiAgICBpZiAoZXZ0cyAmJiBjYWxsYmFjaykge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGV2dHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGV2dHNbaV0uZm4gIT09IGNhbGxiYWNrKSBsaXZlRXZlbnRzLnB1c2goZXZ0c1tpXSk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8vIFJlbW92ZSBldmVudCBmcm9tIHF1ZXVlIHRvIHByZXZlbnQgbWVtb3J5IGxlYWtcbiAgICAvLyBTdWdnZXN0ZWQgYnkgaHR0cHM6Ly9naXRodWIuY29tL2xhemRcbiAgICAvLyBSZWY6IGh0dHBzOi8vZ2l0aHViLmNvbS9zY290dGNvcmdhbi90aW55LWVtaXR0ZXIvY29tbWl0L2M2ZWJmYWE5YmM5NzNiMzNkMTEwYTg0YTMwNzc0MmI3Y2Y5NGM5NTMjY29tbWl0Y29tbWVudC01MDI0OTEwXG5cbiAgICAobGl2ZUV2ZW50cy5sZW5ndGgpIFxuICAgICAgPyBlW25hbWVdID0gbGl2ZUV2ZW50c1xuICAgICAgOiBkZWxldGUgZVtuYW1lXTtcbiAgICBcbiAgICByZXR1cm4gdGhpcztcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmFmID0gcmVxdWlyZSgncmFmJyk7XG5cbnZhciBpdGVtSWQgPSAwO1xuXG52YXIgVGlja2VyID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5pdGVtcyA9IFtdO1xuXG4gIHRoaXMuaXNSdW5uaW5nID0gZmFsc2U7XG4gIHRoaXMudGlja0lkID0gLTE7XG4gIHRoaXMudGlja0NiID0gdGhpcy5vblRpY2suYmluZCh0aGlzKTtcbn07XG5cblRpY2tlci5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1J1bm5pbmcgPSB0cnVlO1xuICBcbiAgdGhpcy50aWNrSWQgPSByYWYodGhpcy50aWNrQ2IpO1xufTtcblxuVGlja2VyLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuXG4gIHJhZi5jYW5jZWwodGhpcy50aWNrSWQpO1xufTtcblxuVGlja2VyLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICB2YXIgaWQgPSBpdGVtSWQrKztcblxuICB0aGlzLml0ZW1zLnB1c2goe1xuICAgIGlkOiBpZCxcbiAgICBjYjogY2FsbGJhY2tcbiAgfSk7XG5cbiAgaWYgKCF0aGlzLmlzUnVubmluZykgdGhpcy5zdGFydCgpO1xuXG4gIHJldHVybiBpZDtcbn07XG5cblRpY2tlci5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oaWQpIHtcbiAgdmFyIGl0ZW07XG5cbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IG47IGkrKyl7XG4gICAgaWYgKHRoaXMuaXRlbXNbaV0uaWQgPT09IGlkKXtcbiAgICAgIGl0ZW0gPSB0aGlzLml0ZW1zLnNwbGljZShpLCAxKVswXTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBcbiAgaWYgKHRoaXMuaXRlbXMubGVuZ3RoID09PSAwKSB0aGlzLnBhdXNlKCk7XG5cbiAgcmV0dXJuIGl0ZW07XG59O1xuXG5UaWNrZXIucHJvdG90eXBlLm9uVGljayA9IGZ1bmN0aW9uKHRpbWVTdGFtcCkge1xuICB0aGlzLnRpY2tJZCA9IHJhZih0aGlzLnRpY2tDYik7XG4gIFxuICBmb3IgKHZhciBpID0gMCwgbiA9IHRoaXMuaXRlbXMubGVuZ3RoOyBpIDwgbjsgaSsrKXtcbiAgICBpZiAodGhpcy5pdGVtc1tpXSkgdGhpcy5pdGVtc1tpXS5jYih0aW1lU3RhbXApO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpY2tlcjtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgSlNPTkFycmF5UGFyc2VyID0gZnVuY3Rpb24oZGF0YSwgc2NhbGVGYWN0b3Ipe1xuICBzY2FsZUZhY3RvciA9IHNjYWxlRmFjdG9yIHx8wqAxO1xuXG4gIHRoaXMuZnJhbWVzID0gW107XG4gIHRoaXMubnVtRnJhbWVzID0gZGF0YS5mcmFtZXMubGVuZ3RoO1xuXG4gIHZhciBmcmFtZTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubnVtRnJhbWVzOyBpKyspe1xuICAgIGZyYW1lID0gZGF0YS5mcmFtZXNbaV0uZnJhbWU7XG5cbiAgICB0aGlzLmZyYW1lcy5wdXNoKHtcbiAgICAgIGluZGV4OiBpLFxuICAgICAgeDogZnJhbWUueCAqIHNjYWxlRmFjdG9yLFxuICAgICAgeTogZnJhbWUueSAqIHNjYWxlRmFjdG9yLFxuICAgICAgd2lkdGg6IGZyYW1lLncgKiBzY2FsZUZhY3RvcixcbiAgICAgIGhlaWdodDogZnJhbWUuaCAqIHNjYWxlRmFjdG9yXG4gICAgfSk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSlNPTkFycmF5UGFyc2VyOyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuLi91dGlscy9pcy1hcnJheScpO1xuXG52YXIgU2ltcGxlUGFyc2VyID0gZnVuY3Rpb24oc3ByaXRlLCBmcmFtZVNpemUsIG9wdGlvbnMpe1xuICB0aGlzLmZyYW1lU2l6ZSA9IGZyYW1lU2l6ZTtcblxuICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8wqB7fTtcbiAgdGhpcy5zY2FsZUZhY3RvciA9IHRoaXMub3B0aW9ucy5zY2FsZUZhY3RvciB8fCAxO1xuICB0aGlzLm51bUZyYW1lcyA9IHRoaXMub3B0aW9ucy5udW1GcmFtZXM7XG5cbiAgdGhpcy5mcmFtZXMgPSBbXTtcblxuICBpZiAoaXNBcnJheShzcHJpdGUpKXtcbiAgICBmb3IgKHZhciBpID0gMCwgbiA9IHNwcml0ZS5sZW5ndGg7IGkgPCBuOyBpKyspe1xuICAgICAgdGhpcy5pbml0U3ByaXRlRnJhbWVzKHNwcml0ZVtpXSwgaSk7XG4gICAgfVxuICB9ZWxzZXtcbiAgICB0aGlzLmluaXRTcHJpdGVGcmFtZXMoc3ByaXRlLCAwKTtcbiAgfVxuXG4gIGlmICghdGhpcy5udW1GcmFtZXMpIHRoaXMubnVtRnJhbWVzID0gdGhpcy5mcmFtZXMubGVuZ3RoO1xufTtcblxuU2ltcGxlUGFyc2VyLnByb3RvdHlwZS5pbml0U3ByaXRlRnJhbWVzID0gZnVuY3Rpb24oc3ByaXRlLCBzcHJpdGVJbmRleCl7XG4gIHZhciBzcHJpdGVXaWR0aCA9IHNwcml0ZS5uYXR1cmFsV2lkdGggfHwgc3ByaXRlLndpZHRoO1xuICB2YXIgc3ByaXRlSGVpZ2h0ID0gc3ByaXRlLm5hdHVyYWxIZWlnaHQgfHwgc3ByaXRlLmhlaWdodDtcblxuICBzcHJpdGVXaWR0aCAqPSB0aGlzLnNjYWxlRmFjdG9yO1xuICBzcHJpdGVIZWlnaHQgKj0gdGhpcy5zY2FsZUZhY3RvcjtcblxuICB2YXIgbnVtRnJhbWVzWCA9IE1hdGguY2VpbChzcHJpdGVXaWR0aCAvIHRoaXMuZnJhbWVTaXplLndpZHRoKTtcbiAgdmFyIG51bUZyYW1lc1kgPSBNYXRoLmNlaWwoc3ByaXRlSGVpZ2h0IC8gdGhpcy5mcmFtZVNpemUuaGVpZ2h0KTtcblxuICBsb29wWTogXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtRnJhbWVzWTsgaSsrKSB7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IG51bUZyYW1lc1g7IGorKykge1xuICAgICAgdGhpcy5mcmFtZXMucHVzaCh7XG4gICAgICAgIHg6IGogKiB0aGlzLmZyYW1lU2l6ZS53aWR0aCxcbiAgICAgICAgeTogaSAqIHRoaXMuZnJhbWVTaXplLmhlaWdodCxcbiAgICAgICAgaW5kZXg6IHRoaXMuZnJhbWVzLmxlbmd0aCxcbiAgICAgICAgd2lkdGg6IHRoaXMuZnJhbWVTaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IHRoaXMuZnJhbWVTaXplLmhlaWdodCxcbiAgICAgICAgc3ByaXRlSW5kZXg6IHNwcml0ZUluZGV4XG4gICAgICB9KTtcblxuICAgICAgaWYgKHRoaXMuZnJhbWVzLmxlbmd0aCA9PT0gdGhpcy5udW1GcmFtZXMpIGJyZWFrIGxvb3BZO1xuICAgIH1cbiAgICBcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVQYXJzZXI7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGRlZmF1bHRWYWx1ZXMgPSByZXF1aXJlKCcuLi91dGlscy9kZWZhdWx0LXZhbHVlcycpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuLi91dGlscy9pcy1hcnJheScpO1xuXG52YXIgQ2FudmFzUmVuZGVyZXIgPSBmdW5jdGlvbihjYW52YXMsIHNwcml0ZSwgb3B0aW9ucyl7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBjbGVhckZyYW1lOiB0cnVlXG4gIH07XG5cbiAgZGVmYXVsdFZhbHVlcyh0aGlzLCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG5cbiAgaWYgKGlzQXJyYXkoc3ByaXRlKSl7XG4gICAgdGhpcy5zcHJpdGVzID0gc3ByaXRlO1xuICB9ZWxzZXtcbiAgICB0aGlzLnNwcml0ZXMgPSBbc3ByaXRlXTtcbiAgfVxuXG4gIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xuXG4gIHRoaXMuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xufTtcblxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGZyYW1lLCBhbmltYXRpb24pIHtcbiAgaWYgKHRoaXMuY2xlYXJGcmFtZSkgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBmcmFtZS53aWR0aCwgZnJhbWUuaGVpZ2h0KTtcblxuICB0aGlzLmNvbnRleHQuZ2xvYmFsQWxwaGEgPSBhbmltYXRpb24uYWxwaGE7XG5cbiAgdGhpcy5jb250ZXh0LmRyYXdJbWFnZShcbiAgICB0aGlzLnNwcml0ZXNbZnJhbWUuc3ByaXRlSW5kZXhdLFxuICAgIGZyYW1lLngsXG4gICAgZnJhbWUueSxcbiAgICBmcmFtZS53aWR0aCxcbiAgICBmcmFtZS5oZWlnaHQsXG4gICAgYW5pbWF0aW9uLngsXG4gICAgYW5pbWF0aW9uLnksXG4gICAgZnJhbWUud2lkdGgsXG4gICAgZnJhbWUuaGVpZ2h0XG4gICApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDYW52YXNSZW5kZXJlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuLi91dGlscy9pcy1hcnJheScpO1xuXG52YXIgRE9NUmVuZGVyZXIgPSBmdW5jdGlvbihlbGVtZW50LCBvcHRpb25zKXtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcblxuICB0aGlzLnNjYWxlRmFjdG9yID0gb3B0aW9ucy5zY2FsZUZhY3RvciB8fCAxO1xuICB0aGlzLnNwcml0ZSA9IG9wdGlvbnMuc3ByaXRlO1xuXG4gIHRoaXMuc3ByaXRlSW5kZXggPSAwO1xuICBpZiAodGhpcy5zcHJpdGUpIHRoaXMudXBkYXRlU3ByaXRlKCk7XG59O1xuXG5ET01SZW5kZXJlci5wcm90b3R5cGUudXBkYXRlU3ByaXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzcHJpdGU7XG5cbiAgaWYgKGlzQXJyYXkodGhpcy5zcHJpdGUpKXtcbiAgICBzcHJpdGUgPSB0aGlzLnNwcml0ZVt0aGlzLnNwcml0ZUluZGV4XTtcbiAgfWVsc2V7XG4gICAgc3ByaXRlID0gdGhpcy5zcHJpdGU7XG4gIH1cblxuICB2YXIgc3ByaXRlV2lkdGggPSBzcHJpdGUubmF0dXJhbFdpZHRoICogdGhpcy5zY2FsZUZhY3RvcjtcbiAgdmFyIHNwcml0ZUhlaWdodCA9IHNwcml0ZS5uYXR1cmFsSGVpZ2h0ICogdGhpcy5zY2FsZUZhY3RvcjtcblxuICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgc3ByaXRlLnNyYyArICcpJztcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRTaXplID0gc3ByaXRlV2lkdGggKyAncHggJyArIHNwcml0ZUhlaWdodCArICdweCc7XG59O1xuXG5ET01SZW5kZXJlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24oZnJhbWUpIHtcbiAgaWYgKGZyYW1lLnNwcml0ZUluZGV4ICE9PSB0aGlzLnNwcml0ZUluZGV4KXtcbiAgICB0aGlzLnNwcml0ZUluZGV4ID0gZnJhbWUuc3ByaXRlSW5kZXg7XG5cbiAgICB0aGlzLnVwZGF0ZVNwcml0ZSgpO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRQb3NpdGlvbiA9ICctJyArIGZyYW1lLnggKiB0aGlzLnNjYWxlRmFjdG9yICsgJ3B4IC0nICsgZnJhbWUueSAqIHRoaXMuc2NhbGVGYWN0b3IgKyAncHgnO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBET01SZW5kZXJlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkZWZhdWx0VmFsdWVzID0gcmVxdWlyZSgnLi4vdXRpbHMvZGVmYXVsdC12YWx1ZXMnKTtcblxudmFyIE9mZlNjcmVlbkNhbnZhc1JlbmRlcmVyID0gZnVuY3Rpb24oY2FudmFzLCBzcHJpdGUsIG9wdGlvbnMpe1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0aGlzLmNhbnZhcyA9IGNhbnZhcztcbiAgdGhpcy5zcHJpdGUgPSBzcHJpdGU7XG5cbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIGNsZWFyRnJhbWU6IHRydWVcbiAgfTtcblxuICBkZWZhdWx0VmFsdWVzKHRoaXMsIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcbiAgXG4gIHRoaXMuYnVmZmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIHRoaXMuYnVmZmVyLndpZHRoID0gc3ByaXRlLndpZHRoO1xuICB0aGlzLmJ1ZmZlci5oZWlnaHQgPSBzcHJpdGUuaGVpZ2h0O1xuXG4gIHRoaXMuYnVmZmVyQ29udGV4dCA9IHRoaXMuYnVmZmVyLmdldENvbnRleHQoJzJkJyk7XG4gIHRoaXMuYnVmZmVyQ29udGV4dC5kcmF3SW1hZ2Uoc3ByaXRlLCAwLCAwKTtcblxuICB0aGlzLmNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbn07XG5cbk9mZlNjcmVlbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihmcmFtZSwgYW5pbWF0aW9uKSB7XG4gIGlmICh0aGlzLmNsZWFyRnJhbWUpIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodCk7XG5cbiAgdGhpcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gYW5pbWF0aW9uLmFscGhhO1xuICBcbiAgdGhpcy5jb250ZXh0LnB1dEltYWdlRGF0YShcbiAgICB0aGlzLmJ1ZmZlckNvbnRleHQuZ2V0SW1hZ2VEYXRhKGZyYW1lLngsZnJhbWUueSxmcmFtZS53aWR0aCxmcmFtZS5oZWlnaHQpLFxuICAgIGFuaW1hdGlvbi54LFxuICAgIGFuaW1hdGlvbi55LFxuICAgIDAsXG4gICAgMCxcbiAgICBmcmFtZS53aWR0aCxcbiAgICBmcmFtZS5oZWlnaHRcbiAgICk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9mZlNjcmVlbkNhbnZhc1JlbmRlcmVyOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc2NvcGUsIGRlZmF1bHRWYWx1ZXMsIHZhbHVlcyl7XG4gIGZvciAodmFyIGtleSBpbiBkZWZhdWx0VmFsdWVzKXtcbiAgICBzY29wZVtrZXldID0gdHlwZW9mIHZhbHVlc1trZXldICE9PSAndW5kZWZpbmVkJyA/IHZhbHVlc1trZXldIDogZGVmYXVsdFZhbHVlc1trZXldO1xuICB9XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqKXtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBkZWZhdWx0VmFsdWVzID0gcmVxdWlyZSgnLi91dGlscy9kZWZhdWx0LXZhbHVlcycpO1xuXG52YXIgVGlueUVtaXR0ZXIgPSByZXF1aXJlKCd0aW55LWVtaXR0ZXInKTtcbnZhciBpbmhlcml0cyA9IHJlcXVpcmUoJ2luaGVyaXRzJyk7XG52YXIgVGlja2VyID0gcmVxdWlyZSgnLi9UaWNrZXInKTtcblxudmFyIHRpY2tlciA9IG5ldyBUaWNrZXIoKTtcblxudmFyIFNwcml0ZUFuaW0gPSBmdW5jdGlvbihwYXJzZXIsIHJlbmRlcmVyLCBvcHRpb25zKSB7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHRoaXMucGFyc2VyID0gcGFyc2VyO1xuICB0aGlzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG5cbiAgdmFyIGRlZmF1bHRPcHRpb25zID0ge1xuICAgIG1hbnVhbFVwZGF0ZTogZmFsc2UsXG4gICAgZnJhbWVSYXRlOiA2MCxcbiAgICBsb29wOiBmYWxzZSxcbiAgICB5b3lvOiBmYWxzZSxcbiAgICBudW1GcmFtZXM6IHBhcnNlci5udW1GcmFtZXNcbiAgfTtcblxuICBkZWZhdWx0VmFsdWVzKHRoaXMsIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zKTtcblxuICB0aGlzLmxhc3RGcmFtZSA9IHRoaXMubnVtRnJhbWVzIC0gMTtcblxuICB0aGlzLmVudGVyRnJhbWVJZCA9IC0xO1xuICB0aGlzLmVudGVyRnJhbWVDYiA9IHRoaXMub25FbnRlckZyYW1lLmJpbmQodGhpcyk7XG5cbiAgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xuICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICB0aGlzLnJldmVyc2VkID0gZmFsc2U7XG4gIHRoaXMuY29tcGxldGUgPSBmYWxzZTtcblxuICB0aGlzLmxhc3RGcmFtZVRpbWUgPSAwO1xuICB0aGlzLmludGVydmFsID0gMTAwMCAvIHRoaXMuZnJhbWVSYXRlO1xuXG4gIHRoaXMueCA9IDA7XG4gIHRoaXMueSA9IDA7XG5cbiAgdGhpcy5hbHBoYSA9IDE7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5pbmhlcml0cyhTcHJpdGVBbmltLCBUaW55RW1pdHRlcik7XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICB0aGlzLmNvbXBsZXRlID0gZmFsc2U7XG5cbiAgaWYoIXRoaXMubWFudWFsVXBkYXRlKSB7XG4gICAgdGhpcy5lbnRlckZyYW1lSWQgPSB0aWNrZXIuYWRkKHRoaXMuZW50ZXJGcmFtZUNiKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcblxuICBpZighdGhpcy5tYW51YWxVcGRhdGUpIHtcbiAgICB0aWNrZXIucmVtb3ZlKHRoaXMuZW50ZXJGcmFtZUlkKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhdXNlKCk7XG4gIHRoaXMuY3VycmVudEZyYW1lID0gMDtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLmdvdG9BbmRQbGF5ID0gZnVuY3Rpb24oZnJhbWUpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcbiAgdGhpcy5jb21wbGV0ZSA9IGZhbHNlO1xuXG4gIGlmICghdGhpcy5pc1BsYXlpbmcpIHRoaXMucGxheSgpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUuZ290b0FuZFN0b3AgPSBmdW5jdGlvbihmcmFtZSkge1xuICBpZiAodGhpcy5pc1BsYXlpbmcpIHRoaXMucGF1c2UoKTtcbiAgdGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcblxuICB0aGlzLnJlbmRlckZyYW1lKCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5uZXh0RnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUrKztcbiAgaWYgKHRoaXMuY3VycmVudEZyYW1lID4gdGhpcy5sYXN0RnJhbWUpIHRoaXMuY3VycmVudEZyYW1lID0gdGhpcy5sYXN0RnJhbWU7XG4gIGlmICh0aGlzLmN1cnJlbnRGcmFtZSA+PSB0aGlzLmxhc3RGcmFtZSkgdGhpcy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5wcmV2RnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUtLTtcbiAgaWYgKHRoaXMuY3VycmVudEZyYW1lIDwgMCkgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xuICBpZiAodGhpcy5jdXJyZW50RnJhbWUgPD0gMCkgdGhpcy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5yZW5kZXJGcmFtZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnBhcnNlci5mcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVdLCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLmRpc3Bvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdG9wKCk7XG4gIHRoaXMub2ZmKCdjb21wbGV0ZScpLm9mZignZW50ZXJGcmFtZScpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUub25Db21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5sb29wKSB7XG4gICAgaWYgKHRoaXMueW95bykgdGhpcy5yZXZlcnNlZCA9ICF0aGlzLnJldmVyc2VkO1xuXG4gICAgaWYgKCF0aGlzLnJldmVyc2VkKSB0aGlzLmdvdG9BbmRQbGF5KDApO1xuICAgIGVsc2UgdGhpcy5nb3RvQW5kUGxheSh0aGlzLmxhc3RGcmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXVzZSgpO1xuICB9XG5cbiAgdGhpcy5lbWl0KCdjb21wbGV0ZScpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUub25FbnRlckZyYW1lID0gZnVuY3Rpb24odGltZVN0YW1wKSB7XG4gIGlmICh0aW1lU3RhbXAgLSB0aGlzLmxhc3RGcmFtZVRpbWUgPiB0aGlzLmludGVydmFsIHx8IHRoaXMubGFzdEZyYW1lVGltZSA9PT0gMCkge1xuICAgIHRoaXMubGFzdEZyYW1lVGltZSA9IHRpbWVTdGFtcDtcblxuICAgIGlmICghdGhpcy5tYW51YWxVcGRhdGUpIHRoaXMucmVuZGVyRnJhbWUoKTtcblxuICAgIGlmICh0aGlzLmNvbXBsZXRlKSB7XG4gICAgICB0aGlzLm9uQ29tcGxldGUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pc1BsYXlpbmcpe1xuICAgICAgaWYgKCF0aGlzLnJldmVyc2VkKSB0aGlzLm5leHRGcmFtZSgpO1xuICAgICAgZWxzZSB0aGlzLnByZXZGcmFtZSgpO1xuICAgIH1cblxuICAgIHRoaXMuZW1pdCgnZW50ZXJGcmFtZScpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZUFuaW07XG5cbm1vZHVsZS5leHBvcnRzLkNhbnZhc1JlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9DYW52YXNSZW5kZXJlci5qcycpO1xubW9kdWxlLmV4cG9ydHMuT2ZmU2NyZWVuQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL09mZlNjcmVlbkNhbnZhc1JlbmRlcmVyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5ET01SZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvRE9NUmVuZGVyZXIuanMnKTtcblxubW9kdWxlLmV4cG9ydHMuU2ltcGxlUGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXIvU2ltcGxlUGFyc2VyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5KU09OQXJyYXlQYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlci9KU09OQXJyYXlQYXJzZXIuanMnKTtcbiJdfQ==
