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

var callbackId = 0;

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
  var id = callbackId++;

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
    }
  }

  if (this.items.length === 0) this.pause();

  return item;
};

Ticker.prototype.onTick = function(timeStamp) {
  this.tickId = raf(this.tickCb);

  for (var i = 0, n = this.items.length; i < n; i++){
    this.items[i].cb(timeStamp);
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

  var numFramesX = Math.ceil(spriteSize.width / frameSize.width);
  var numFramesY = Math.ceil(spriteSize.height / frameSize.height);

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
  this.removeAllListeners();

  return this;
};

SpriteAnim.prototype.onComplete = function() {
  this.emit('complete');

  if (this.loop) {
    if (this.yoyo) this.reversed = !this.reversed;

    if (!this.reversed) this.gotoAndPlay(0);
    else this.gotoAndPlay(this.lastFrame);
  } else {
    this.pause();
  }

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