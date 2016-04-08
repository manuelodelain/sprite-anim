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

var SimpleParser = function(spriteSize, frameSize){
  this.numFrames = 0;
  this.frames = [];

  var spriteWidth = spriteSize.naturalWidth ? spriteSize.naturalWidth : spriteSize.width;
  var spriteHeight = spriteSize.naturalHeight ? spriteSize.naturalHeight : spriteSize.height;

  var numFramesX = Math.ceil(spriteWidth / frameSize.width);
  var numFramesY = Math.ceil(spriteHeight / frameSize.height);

  for (var i = 0; i < numFramesY; i++) {
    for (var j = 0; j < numFramesX; j++) {
      this.frames.push({
        x: j * frameSize.width,
        y: i * frameSize.height,
        index: this.numFrames,
        width: frameSize.width,
        height: frameSize.height
      });

      this.numFrames++;
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
  this.sprite = sprite;

  this.context = canvas.getContext('2d');
};

CanvasRenderer.prototype.render = function(frame, animation) {
  if (this.clearFrame) this.context.clearRect(0, 0, frame.width, frame.height);

  this.context.globalAlpha = animation.alpha;

  this.context.drawImage(
    this.sprite,
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

var DOMRenderer = function(element){
  this.element = element;
};

DOMRenderer.prototype.render = function(frame) {
  this.element.style.backgroundPosition = '-' + frame.x + 'px -' + frame.y + 'px';
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCJub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JhZi9ub2RlX21vZHVsZXMvcGVyZm9ybWFuY2Utbm93L2xpYi9wZXJmb3JtYW5jZS1ub3cuanMiLCJub2RlX21vZHVsZXMvdGlueS1lbWl0dGVyL2luZGV4LmpzIiwic3JjL1RpY2tlci5qcyIsInNyYy9wYXJzZXIvSlNPTkFycmF5UGFyc2VyLmpzIiwic3JjL3BhcnNlci9TaW1wbGVQYXJzZXIuanMiLCJzcmMvcmVuZGVyZXIvQ2FudmFzUmVuZGVyZXIuanMiLCJzcmMvcmVuZGVyZXIvRE9NUmVuZGVyZXIuanMiLCJzcmMvcmVuZGVyZXIvT2ZmU2NyZWVuQ2FudmFzUmVuZGVyZXIuanMiLCJzcmMvU3ByaXRlQW5pbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsImlmICh0eXBlb2YgT2JqZWN0LmNyZWF0ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAvLyBpbXBsZW1lbnRhdGlvbiBmcm9tIHN0YW5kYXJkIG5vZGUuanMgJ3V0aWwnIG1vZHVsZVxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGluaGVyaXRzKGN0b3IsIHN1cGVyQ3Rvcikge1xuICAgIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yXG4gICAgY3Rvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ3Rvci5wcm90b3R5cGUsIHtcbiAgICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xufSBlbHNlIHtcbiAgLy8gb2xkIHNjaG9vbCBzaGltIGZvciBvbGQgYnJvd3NlcnNcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIHZhciBUZW1wQ3RvciA9IGZ1bmN0aW9uICgpIHt9XG4gICAgVGVtcEN0b3IucHJvdG90eXBlID0gc3VwZXJDdG9yLnByb3RvdHlwZVxuICAgIGN0b3IucHJvdG90eXBlID0gbmV3IFRlbXBDdG9yKClcbiAgICBjdG9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGN0b3JcbiAgfVxufVxuIiwidmFyIG5vdyA9IHJlcXVpcmUoJ3BlcmZvcm1hbmNlLW5vdycpXG4gICwgZ2xvYmFsID0gdHlwZW9mIHdpbmRvdyA9PT0gJ3VuZGVmaW5lZCcgPyB7fSA6IHdpbmRvd1xuICAsIHZlbmRvcnMgPSBbJ21veicsICd3ZWJraXQnXVxuICAsIHN1ZmZpeCA9ICdBbmltYXRpb25GcmFtZSdcbiAgLCByYWYgPSBnbG9iYWxbJ3JlcXVlc3QnICsgc3VmZml4XVxuICAsIGNhZiA9IGdsb2JhbFsnY2FuY2VsJyArIHN1ZmZpeF0gfHwgZ2xvYmFsWydjYW5jZWxSZXF1ZXN0JyArIHN1ZmZpeF1cblxuZm9yKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICFyYWY7IGkrKykge1xuICByYWYgPSBnbG9iYWxbdmVuZG9yc1tpXSArICdSZXF1ZXN0JyArIHN1ZmZpeF1cbiAgY2FmID0gZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnQ2FuY2VsJyArIHN1ZmZpeF1cbiAgICAgIHx8IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ0NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxufVxuXG4vLyBTb21lIHZlcnNpb25zIG9mIEZGIGhhdmUgckFGIGJ1dCBub3QgY0FGXG5pZighcmFmIHx8ICFjYWYpIHtcbiAgdmFyIGxhc3QgPSAwXG4gICAgLCBpZCA9IDBcbiAgICAsIHF1ZXVlID0gW11cbiAgICAsIGZyYW1lRHVyYXRpb24gPSAxMDAwIC8gNjBcblxuICByYWYgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGlmKHF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdmFyIF9ub3cgPSBub3coKVxuICAgICAgICAsIG5leHQgPSBNYXRoLm1heCgwLCBmcmFtZUR1cmF0aW9uIC0gKF9ub3cgLSBsYXN0KSlcbiAgICAgIGxhc3QgPSBuZXh0ICsgX25vd1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNwID0gcXVldWUuc2xpY2UoMClcbiAgICAgICAgLy8gQ2xlYXIgcXVldWUgaGVyZSB0byBwcmV2ZW50XG4gICAgICAgIC8vIGNhbGxiYWNrcyBmcm9tIGFwcGVuZGluZyBsaXN0ZW5lcnNcbiAgICAgICAgLy8gdG8gdGhlIGN1cnJlbnQgZnJhbWUncyBxdWV1ZVxuICAgICAgICBxdWV1ZS5sZW5ndGggPSAwXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmKCFjcFtpXS5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgY3BbaV0uY2FsbGJhY2sobGFzdClcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0aHJvdyBlIH0sIDApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBNYXRoLnJvdW5kKG5leHQpKVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKHtcbiAgICAgIGhhbmRsZTogKytpZCxcbiAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgIGNhbmNlbGxlZDogZmFsc2VcbiAgICB9KVxuICAgIHJldHVybiBpZFxuICB9XG5cbiAgY2FmID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZihxdWV1ZVtpXS5oYW5kbGUgPT09IGhhbmRsZSkge1xuICAgICAgICBxdWV1ZVtpXS5jYW5jZWxsZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4pIHtcbiAgLy8gV3JhcCBpbiBhIG5ldyBmdW5jdGlvbiB0byBwcmV2ZW50XG4gIC8vIGBjYW5jZWxgIHBvdGVudGlhbGx5IGJlaW5nIGFzc2lnbmVkXG4gIC8vIHRvIHRoZSBuYXRpdmUgckFGIGZ1bmN0aW9uXG4gIHJldHVybiByYWYuY2FsbChnbG9iYWwsIGZuKVxufVxubW9kdWxlLmV4cG9ydHMuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gIGNhZi5hcHBseShnbG9iYWwsIGFyZ3VtZW50cylcbn1cbiIsIi8vIEdlbmVyYXRlZCBieSBDb2ZmZWVTY3JpcHQgMS42LjNcbihmdW5jdGlvbigpIHtcbiAgdmFyIGdldE5hbm9TZWNvbmRzLCBocnRpbWUsIGxvYWRUaW1lO1xuXG4gIGlmICgodHlwZW9mIHBlcmZvcm1hbmNlICE9PSBcInVuZGVmaW5lZFwiICYmIHBlcmZvcm1hbmNlICE9PSBudWxsKSAmJiBwZXJmb3JtYW5jZS5ub3cpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHBlcmZvcm1hbmNlLm5vdygpO1xuICAgIH07XG4gIH0gZWxzZSBpZiAoKHR5cGVvZiBwcm9jZXNzICE9PSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MgIT09IG51bGwpICYmIHByb2Nlc3MuaHJ0aW1lKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAoZ2V0TmFub1NlY29uZHMoKSAtIGxvYWRUaW1lKSAvIDFlNjtcbiAgICB9O1xuICAgIGhydGltZSA9IHByb2Nlc3MuaHJ0aW1lO1xuICAgIGdldE5hbm9TZWNvbmRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaHI7XG4gICAgICBociA9IGhydGltZSgpO1xuICAgICAgcmV0dXJuIGhyWzBdICogMWU5ICsgaHJbMV07XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IGdldE5hbm9TZWNvbmRzKCk7XG4gIH0gZWxzZSBpZiAoRGF0ZS5ub3cpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgfSBlbHNlIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gbG9hZFRpbWU7XG4gICAgfTtcbiAgICBsb2FkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9XG5cbn0pLmNhbGwodGhpcyk7XG5cbi8qXG4vL0Agc291cmNlTWFwcGluZ1VSTD1wZXJmb3JtYW5jZS1ub3cubWFwXG4qL1xuIiwiZnVuY3Rpb24gRSAoKSB7XG5cdC8vIEtlZXAgdGhpcyBlbXB0eSBzbyBpdCdzIGVhc2llciB0byBpbmhlcml0IGZyb21cbiAgLy8gKHZpYSBodHRwczovL2dpdGh1Yi5jb20vbGlwc21hY2sgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRjb3JnYW4vdGlueS1lbWl0dGVyL2lzc3Vlcy8zKVxufVxuXG5FLnByb3RvdHlwZSA9IHtcblx0b246IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgdmFyIGUgPSB0aGlzLmUgfHwgKHRoaXMuZSA9IHt9KTtcbiAgICBcbiAgICAoZVtuYW1lXSB8fCAoZVtuYW1lXSA9IFtdKSkucHVzaCh7XG4gICAgICBmbjogY2FsbGJhY2ssXG4gICAgICBjdHg6IGN0eFxuICAgIH0pO1xuICAgIFxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuXG4gIG9uY2U6IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaywgY3R4KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBmbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYub2ZmKG5hbWUsIGZuKTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGN0eCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICAgIFxuICAgIHJldHVybiB0aGlzLm9uKG5hbWUsIGZuLCBjdHgpO1xuICB9LFxuXG4gIGVtaXQ6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdmFyIGRhdGEgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGV2dEFyciA9ICgodGhpcy5lIHx8ICh0aGlzLmUgPSB7fSkpW25hbWVdIHx8IFtdKS5zbGljZSgpO1xuICAgIHZhciBpID0gMDtcbiAgICB2YXIgbGVuID0gZXZ0QXJyLmxlbmd0aDtcbiAgICBcbiAgICBmb3IgKGk7IGkgPCBsZW47IGkrKykge1xuICAgICAgZXZ0QXJyW2ldLmZuLmFwcGx5KGV2dEFycltpXS5jdHgsIGRhdGEpO1xuICAgIH1cbiAgICBcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcblxuICBvZmY6IGZ1bmN0aW9uIChuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBlID0gdGhpcy5lIHx8ICh0aGlzLmUgPSB7fSk7XG4gICAgdmFyIGV2dHMgPSBlW25hbWVdO1xuICAgIHZhciBsaXZlRXZlbnRzID0gW107XG4gICAgXG4gICAgaWYgKGV2dHMgJiYgY2FsbGJhY2spIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBldnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIGlmIChldnRzW2ldLmZuICE9PSBjYWxsYmFjaykgbGl2ZUV2ZW50cy5wdXNoKGV2dHNbaV0pO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvLyBSZW1vdmUgZXZlbnQgZnJvbSBxdWV1ZSB0byBwcmV2ZW50IG1lbW9yeSBsZWFrXG4gICAgLy8gU3VnZ2VzdGVkIGJ5IGh0dHBzOi8vZ2l0aHViLmNvbS9sYXpkXG4gICAgLy8gUmVmOiBodHRwczovL2dpdGh1Yi5jb20vc2NvdHRjb3JnYW4vdGlueS1lbWl0dGVyL2NvbW1pdC9jNmViZmFhOWJjOTczYjMzZDExMGE4NGEzMDc3NDJiN2NmOTRjOTUzI2NvbW1pdGNvbW1lbnQtNTAyNDkxMFxuXG4gICAgKGxpdmVFdmVudHMubGVuZ3RoKSBcbiAgICAgID8gZVtuYW1lXSA9IGxpdmVFdmVudHNcbiAgICAgIDogZGVsZXRlIGVbbmFtZV07XG4gICAgXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHJhZiA9IHJlcXVpcmUoJ3JhZicpO1xuXG52YXIgaXRlbUlkID0gMDtcblxudmFyIFRpY2tlciA9IGZ1bmN0aW9uKCl7XG4gIHRoaXMuaXRlbXMgPSBbXTtcblxuICB0aGlzLmlzUnVubmluZyA9IGZhbHNlO1xuICB0aGlzLnRpY2tJZCA9IC0xO1xuICB0aGlzLnRpY2tDYiA9IHRoaXMub25UaWNrLmJpbmQodGhpcyk7XG59O1xuXG5UaWNrZXIucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNSdW5uaW5nID0gdHJ1ZTtcbiAgXG4gIHRoaXMudGlja0lkID0gcmFmKHRoaXMudGlja0NiKTtcbn07XG5cblRpY2tlci5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1J1bm5pbmcgPSBmYWxzZTtcblxuICByYWYuY2FuY2VsKHRoaXMudGlja0lkKTtcbn07XG5cblRpY2tlci5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgdmFyIGlkID0gaXRlbUlkKys7XG5cbiAgdGhpcy5pdGVtcy5wdXNoKHtcbiAgICBpZDogaWQsXG4gICAgY2I6IGNhbGxiYWNrXG4gIH0pO1xuXG4gIGlmICghdGhpcy5pc1J1bm5pbmcpIHRoaXMuc3RhcnQoKTtcblxuICByZXR1cm4gaWQ7XG59O1xuXG5UaWNrZXIucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGlkKSB7XG4gIHZhciBpdGVtO1xuXG4gIGZvciAodmFyIGkgPSAwLCBuID0gdGhpcy5pdGVtcy5sZW5ndGg7IGkgPCBuOyBpKyspe1xuICAgIGlmICh0aGlzLml0ZW1zW2ldLmlkID09PSBpZCl7XG4gICAgICBpdGVtID0gdGhpcy5pdGVtcy5zcGxpY2UoaSwgMSlbMF07XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgXG4gIGlmICh0aGlzLml0ZW1zLmxlbmd0aCA9PT0gMCkgdGhpcy5wYXVzZSgpO1xuXG4gIHJldHVybiBpdGVtO1xufTtcblxuVGlja2VyLnByb3RvdHlwZS5vblRpY2sgPSBmdW5jdGlvbih0aW1lU3RhbXApIHtcbiAgdGhpcy50aWNrSWQgPSByYWYodGhpcy50aWNrQ2IpO1xuICBcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0aGlzLml0ZW1zLmxlbmd0aDsgaSA8IG47IGkrKyl7XG4gICAgaWYgKHRoaXMuaXRlbXNbaV0pIHRoaXMuaXRlbXNbaV0uY2IodGltZVN0YW1wKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWNrZXI7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEpTT05BcnJheVBhcnNlciA9IGZ1bmN0aW9uKGRhdGEsIHNjYWxlRmFjdG9yKXtcbiAgc2NhbGVGYWN0b3IgPSBzY2FsZUZhY3RvciB8fMKgMTtcblxuICB0aGlzLmZyYW1lcyA9IFtdO1xuICB0aGlzLm51bUZyYW1lcyA9IGRhdGEuZnJhbWVzLmxlbmd0aDtcblxuICB2YXIgZnJhbWU7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm51bUZyYW1lczsgaSsrKXtcbiAgICBmcmFtZSA9IGRhdGEuZnJhbWVzW2ldLmZyYW1lO1xuXG4gICAgdGhpcy5mcmFtZXMucHVzaCh7XG4gICAgICBpbmRleDogaSxcbiAgICAgIHg6IGZyYW1lLnggKiBzY2FsZUZhY3RvcixcbiAgICAgIHk6IGZyYW1lLnkgKiBzY2FsZUZhY3RvcixcbiAgICAgIHdpZHRoOiBmcmFtZS53ICogc2NhbGVGYWN0b3IsXG4gICAgICBoZWlnaHQ6IGZyYW1lLmggKiBzY2FsZUZhY3RvclxuICAgIH0pO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEpTT05BcnJheVBhcnNlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBTaW1wbGVQYXJzZXIgPSBmdW5jdGlvbihzcHJpdGVTaXplLCBmcmFtZVNpemUpe1xuICB0aGlzLm51bUZyYW1lcyA9IDA7XG4gIHRoaXMuZnJhbWVzID0gW107XG5cbiAgdmFyIHNwcml0ZVdpZHRoID0gc3ByaXRlU2l6ZS5uYXR1cmFsV2lkdGggPyBzcHJpdGVTaXplLm5hdHVyYWxXaWR0aCA6IHNwcml0ZVNpemUud2lkdGg7XG4gIHZhciBzcHJpdGVIZWlnaHQgPSBzcHJpdGVTaXplLm5hdHVyYWxIZWlnaHQgPyBzcHJpdGVTaXplLm5hdHVyYWxIZWlnaHQgOiBzcHJpdGVTaXplLmhlaWdodDtcblxuICB2YXIgbnVtRnJhbWVzWCA9IE1hdGguY2VpbChzcHJpdGVXaWR0aCAvIGZyYW1lU2l6ZS53aWR0aCk7XG4gIHZhciBudW1GcmFtZXNZID0gTWF0aC5jZWlsKHNwcml0ZUhlaWdodCAvIGZyYW1lU2l6ZS5oZWlnaHQpO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtRnJhbWVzWTsgaSsrKSB7XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBudW1GcmFtZXNYOyBqKyspIHtcbiAgICAgIHRoaXMuZnJhbWVzLnB1c2goe1xuICAgICAgICB4OiBqICogZnJhbWVTaXplLndpZHRoLFxuICAgICAgICB5OiBpICogZnJhbWVTaXplLmhlaWdodCxcbiAgICAgICAgaW5kZXg6IHRoaXMubnVtRnJhbWVzLFxuICAgICAgICB3aWR0aDogZnJhbWVTaXplLndpZHRoLFxuICAgICAgICBoZWlnaHQ6IGZyYW1lU2l6ZS5oZWlnaHRcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLm51bUZyYW1lcysrO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTaW1wbGVQYXJzZXI7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQ2FudmFzUmVuZGVyZXIgPSBmdW5jdGlvbihjYW52YXMsIHNwcml0ZSwgb3B0aW9ucyl7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIHZhciBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICBjbGVhckZyYW1lOiB0cnVlXG4gIH07XG5cbiAgZm9yICh2YXIgb3B0aW9uTmFtZSBpbiBkZWZhdWx0T3B0aW9ucyl7XG4gICAgdGhpc1tvcHRpb25OYW1lXSA9IHR5cGVvZiBvcHRpb25zW29wdGlvbk5hbWVdICE9PSAndW5kZWZpbmVkJyA/IG9wdGlvbnNbb3B0aW9uTmFtZV0gOiBkZWZhdWx0T3B0aW9uc1tvcHRpb25OYW1lXTtcbiAgfVxuXG4gIHRoaXMuY2FudmFzID0gY2FudmFzO1xuICB0aGlzLnNwcml0ZSA9IHNwcml0ZTtcblxuICB0aGlzLmNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbn07XG5cbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihmcmFtZSwgYW5pbWF0aW9uKSB7XG4gIGlmICh0aGlzLmNsZWFyRnJhbWUpIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodCk7XG5cbiAgdGhpcy5jb250ZXh0Lmdsb2JhbEFscGhhID0gYW5pbWF0aW9uLmFscGhhO1xuXG4gIHRoaXMuY29udGV4dC5kcmF3SW1hZ2UoXG4gICAgdGhpcy5zcHJpdGUsXG4gICAgZnJhbWUueCxcbiAgICBmcmFtZS55LFxuICAgIGZyYW1lLndpZHRoLFxuICAgIGZyYW1lLmhlaWdodCxcbiAgICBhbmltYXRpb24ueCxcbiAgICBhbmltYXRpb24ueSxcbiAgICBmcmFtZS53aWR0aCxcbiAgICBmcmFtZS5oZWlnaHRcbiAgICk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc1JlbmRlcmVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgRE9NUmVuZGVyZXIgPSBmdW5jdGlvbihlbGVtZW50KXtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbn07XG5cbkRPTVJlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbihmcmFtZSkge1xuICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gJy0nICsgZnJhbWUueCArICdweCAtJyArIGZyYW1lLnkgKyAncHgnO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBET01SZW5kZXJlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBPZmZTY3JlZW5DYW52YXNSZW5kZXJlciA9IGZ1bmN0aW9uKGNhbnZhcywgc3ByaXRlKXtcbiAgdGhpcy5jYW52YXMgPSBjYW52YXM7XG4gIHRoaXMuc3ByaXRlID0gc3ByaXRlO1xuICBcbiAgdGhpcy5idWZmZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgdGhpcy5idWZmZXIud2lkdGggPSBzcHJpdGUud2lkdGg7XG4gIHRoaXMuYnVmZmVyLmhlaWdodCA9IHNwcml0ZS5oZWlnaHQ7XG5cbiAgdGhpcy5idWZmZXJDb250ZXh0ID0gdGhpcy5idWZmZXIuZ2V0Q29udGV4dCgnMmQnKTtcbiAgdGhpcy5idWZmZXJDb250ZXh0LmRyYXdJbWFnZShzcHJpdGUsIDAsIDApO1xuXG4gIHRoaXMuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xufTtcblxuT2ZmU2NyZWVuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uKGZyYW1lKSB7XG4gIHRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwgMCwgZnJhbWUud2lkdGgsIGZyYW1lLmhlaWdodCk7XG4gIFxuICB0aGlzLmNvbnRleHQucHV0SW1hZ2VEYXRhKFxuICAgIHRoaXMuYnVmZmVyQ29udGV4dC5nZXRJbWFnZURhdGEoZnJhbWUueCxmcmFtZS55LGZyYW1lLndpZHRoLGZyYW1lLmhlaWdodCksXG4gICAgMCxcbiAgICAwXG4gICApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPZmZTY3JlZW5DYW52YXNSZW5kZXJlcjsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBUaW55RW1pdHRlciA9IHJlcXVpcmUoJ3RpbnktZW1pdHRlcicpO1xudmFyIGluaGVyaXRzID0gcmVxdWlyZSgnaW5oZXJpdHMnKTtcbnZhciBUaWNrZXIgPSByZXF1aXJlKCcuL1RpY2tlcicpO1xuXG52YXIgdGlja2VyID0gbmV3IFRpY2tlcigpO1xuXG52YXIgU3ByaXRlQW5pbSA9IGZ1bmN0aW9uKHBhcnNlciwgcmVuZGVyZXIsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdGhpcy5wYXJzZXIgPSBwYXJzZXI7XG4gIHRoaXMucmVuZGVyZXIgPSByZW5kZXJlcjtcblxuICB2YXIgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgbWFudWFsVXBkYXRlOiBmYWxzZSxcbiAgICBmcmFtZVJhdGU6IDYwLFxuICAgIGxvb3A6IGZhbHNlLFxuICAgIHlveW86IGZhbHNlLFxuICAgIG51bUZyYW1lczogcGFyc2VyLm51bUZyYW1lc1xuICB9O1xuXG4gIGZvciAodmFyIG9wdGlvbk5hbWUgaW4gZGVmYXVsdE9wdGlvbnMpe1xuICAgIHRoaXNbb3B0aW9uTmFtZV0gPSB0eXBlb2Ygb3B0aW9uc1tvcHRpb25OYW1lXSAhPT0gJ3VuZGVmaW5lZCcgPyBvcHRpb25zW29wdGlvbk5hbWVdIDogZGVmYXVsdE9wdGlvbnNbb3B0aW9uTmFtZV07XG4gIH1cblxuICB0aGlzLmxhc3RGcmFtZSA9IHRoaXMubnVtRnJhbWVzIC0gMTtcblxuICB0aGlzLmVudGVyRnJhbWVJZCA9IC0xO1xuICB0aGlzLmVudGVyRnJhbWVDYiA9IHRoaXMub25FbnRlckZyYW1lLmJpbmQodGhpcyk7XG5cbiAgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xuICB0aGlzLmlzUGxheWluZyA9IGZhbHNlO1xuICB0aGlzLnJldmVyc2VkID0gZmFsc2U7XG4gIHRoaXMuY29tcGxldGUgPSBmYWxzZTtcblxuICB0aGlzLmxhc3RGcmFtZVRpbWUgPSAwO1xuICB0aGlzLmludGVydmFsID0gMTAwMCAvIHRoaXMuZnJhbWVSYXRlO1xuXG4gIHRoaXMueCA9IDA7XG4gIHRoaXMueSA9IDA7XG5cbiAgdGhpcy5hbHBoYSA9IDE7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5pbmhlcml0cyhTcHJpdGVBbmltLCBUaW55RW1pdHRlcik7XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1BsYXlpbmcgPSB0cnVlO1xuICB0aGlzLmNvbXBsZXRlID0gZmFsc2U7XG5cbiAgaWYoIXRoaXMubWFudWFsVXBkYXRlKSB7XG4gICAgdGhpcy5lbnRlckZyYW1lSWQgPSB0aWNrZXIuYWRkKHRoaXMuZW50ZXJGcmFtZUNiKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1BsYXlpbmcgPSBmYWxzZTtcblxuICBpZighdGhpcy5tYW51YWxVcGRhdGUpIHtcbiAgICB0aWNrZXIucmVtb3ZlKHRoaXMuZW50ZXJGcmFtZUlkKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhdXNlKCk7XG4gIHRoaXMuY3VycmVudEZyYW1lID0gMDtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLmdvdG9BbmRQbGF5ID0gZnVuY3Rpb24oZnJhbWUpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcbiAgdGhpcy5jb21wbGV0ZSA9IGZhbHNlO1xuXG4gIGlmICghdGhpcy5pc1BsYXlpbmcpIHRoaXMucGxheSgpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUuZ290b0FuZFN0b3AgPSBmdW5jdGlvbihmcmFtZSkge1xuICBpZiAodGhpcy5pc1BsYXlpbmcpIHRoaXMucGF1c2UoKTtcbiAgdGhpcy5jdXJyZW50RnJhbWUgPSBmcmFtZTtcblxuICB0aGlzLnJlbmRlckZyYW1lKCk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5uZXh0RnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUrKztcbiAgaWYgKHRoaXMuY3VycmVudEZyYW1lID4gdGhpcy5sYXN0RnJhbWUpIHRoaXMuY3VycmVudEZyYW1lID0gdGhpcy5sYXN0RnJhbWU7XG4gIGlmICh0aGlzLmN1cnJlbnRGcmFtZSA+PSB0aGlzLmxhc3RGcmFtZSkgdGhpcy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5wcmV2RnJhbWUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jdXJyZW50RnJhbWUtLTtcbiAgaWYgKHRoaXMuY3VycmVudEZyYW1lIDwgMCkgdGhpcy5jdXJyZW50RnJhbWUgPSAwO1xuICBpZiAodGhpcy5jdXJyZW50RnJhbWUgPD0gMCkgdGhpcy5jb21wbGV0ZSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5TcHJpdGVBbmltLnByb3RvdHlwZS5yZW5kZXJGcmFtZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnBhcnNlci5mcmFtZXNbdGhpcy5jdXJyZW50RnJhbWVdLCB0aGlzKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cblNwcml0ZUFuaW0ucHJvdG90eXBlLmRpc3Bvc2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdG9wKCk7XG4gIHRoaXMub2ZmKCdjb21wbGV0ZScpLm9mZignZW50ZXJGcmFtZScpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUub25Db21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAodGhpcy5sb29wKSB7XG4gICAgaWYgKHRoaXMueW95bykgdGhpcy5yZXZlcnNlZCA9ICF0aGlzLnJldmVyc2VkO1xuXG4gICAgaWYgKCF0aGlzLnJldmVyc2VkKSB0aGlzLmdvdG9BbmRQbGF5KDApO1xuICAgIGVsc2UgdGhpcy5nb3RvQW5kUGxheSh0aGlzLmxhc3RGcmFtZSk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5wYXVzZSgpO1xuICB9XG5cbiAgdGhpcy5lbWl0KCdjb21wbGV0ZScpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuU3ByaXRlQW5pbS5wcm90b3R5cGUub25FbnRlckZyYW1lID0gZnVuY3Rpb24odGltZVN0YW1wKSB7XG4gIGlmICh0aW1lU3RhbXAgLSB0aGlzLmxhc3RGcmFtZVRpbWUgPiB0aGlzLmludGVydmFsIHx8IHRoaXMubGFzdEZyYW1lVGltZSA9PT0gMCkge1xuICAgIHRoaXMubGFzdEZyYW1lVGltZSA9IHRpbWVTdGFtcDtcblxuICAgIGlmICghdGhpcy5tYW51YWxVcGRhdGUpIHRoaXMucmVuZGVyRnJhbWUoKTtcblxuICAgIGlmICh0aGlzLmNvbXBsZXRlKSB7XG4gICAgICB0aGlzLm9uQ29tcGxldGUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucmV2ZXJzZWQpIHRoaXMubmV4dEZyYW1lKCk7XG4gICAgZWxzZSB0aGlzLnByZXZGcmFtZSgpO1xuXG4gICAgdGhpcy5lbWl0KCdlbnRlckZyYW1lJyk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlQW5pbTtcblxubW9kdWxlLmV4cG9ydHMuQ2FudmFzUmVuZGVyZXIgPSByZXF1aXJlKCcuL3JlbmRlcmVyL0NhbnZhc1JlbmRlcmVyLmpzJyk7XG5tb2R1bGUuZXhwb3J0cy5PZmZTY3JlZW5DYW52YXNSZW5kZXJlciA9IHJlcXVpcmUoJy4vcmVuZGVyZXIvT2ZmU2NyZWVuQ2FudmFzUmVuZGVyZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkRPTVJlbmRlcmVyID0gcmVxdWlyZSgnLi9yZW5kZXJlci9ET01SZW5kZXJlci5qcycpO1xuXG5tb2R1bGUuZXhwb3J0cy5TaW1wbGVQYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlci9TaW1wbGVQYXJzZXIuanMnKTtcbm1vZHVsZS5leHBvcnRzLkpTT05BcnJheVBhcnNlciA9IHJlcXVpcmUoJy4vcGFyc2VyL0pTT05BcnJheVBhcnNlci5qcycpO1xuIl19
