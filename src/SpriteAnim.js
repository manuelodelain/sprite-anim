var raf = require('raf');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

var SpriteAnim = function(parser, renderer, options) {
  this.parser = parser;
  this.renderer = renderer;
  
  this.frameRate = 60;
  this.loop = false;
  this.totalFrames = 0;

  if (options) {
    if (options.frameRate) this.frameRate = options.frameRate;
    if (options.loop) this.loop = options.loop;
    if (options.totalFrames) this.totalFrames = options.totalFrames;
  }
  
  this.onCompleteCallback = null;
  this.enterFrameId = -1;
  this.enterFrame = this.onEnterFrame.bind(this);

  this.currentFrame = 0;
  this.lastFrame = 0;
  this.isPlaying = false;
  this.reversed = false;
  this.complete = false;
	
  this.now;
  this.then = Date.now();
  this.delta;
  this.interval = 1000 / this.frameRate;

  if (this.totalFrames === 0) this.totalFrames = parser.numFrames;
  this.lastFrame = this.totalFrames - 1;
};

inherits(SpriteAnim, EventEmitter);

SpriteAnim.prototype.play = function() {
  this.isPlaying = true;
  this.complete = false;

  this.onEnterFrame();
};

SpriteAnim.prototype.pause = function() {
  this.isPlaying = false;

  raf.cancel(this.enterFrameId);
};  

SpriteAnim.prototype.stop = function() {
  this.pause();
  this.currentFrame = 0;
};
  
SpriteAnim.prototype.gotoAndPlay = function(frame) {
  this.currentFrame = frame;
  this.complete = false;

  if (!this.isPlaying) this.play();
};

SpriteAnim.prototype.gotoAndStop = function(frame) {
  if (this.isPlaying) this.pause();
  this.currentFrame = frame;

  this.renderFrame();
};

SpriteAnim.prototype.nextFrame = function() {
  this.currentFrame++;
  if (this.currentFrame > this.lastFrame) this.currentFrame = this.lastFrame;
  if (this.currentFrame >= this.lastFrame) this.complete = true;
};

SpriteAnim.prototype.prevFrame = function() {
  this.currentFrame--;
  if (this.currentFrame < 0) this.currentFrame = 0;
  if (this.currentFrame <= 0) this.complete = true;
};

SpriteAnim.prototype.renderFrame = function() {
  this.renderer.render(this.parser.frames[this.currentFrame]);
};

SpriteAnim.prototype.onComplete = function() {
  this.emit('complete');
  
  if (this.loop) {
    if (!this.reversed) this.gotoAndPlay(0);
    else gotoAndPlay(this.totalFrames);
  } else {
    this.pause();
  }
};

SpriteAnim.prototype.dispose = function() {
  this.stop();
  this.removeAllListeners();
};

SpriteAnim.prototype.onEnterFrame = function() {
  this.now = Date.now();
  this.delta = this.now - this.then;

  this.enterFrameId = raf(this.enterFrame);

  if (this.delta > this.interval) {
    this.then = this.now - (this.delta % this.interval);

    this.renderFrame();

    if (this.complete) {
      this.onComplete();
      return;
    }

    if (!this.reversed) this.nextFrame();
    else this.prevFrame();

    this.emit('enterFrame');
  }
};

module.exports = SpriteAnim;

module.exports.CanvasRenderer = require('./renderer/CanvasRenderer.js');
module.exports.DOMRenderer = require('./renderer/DOMRenderer.js');

module.exports.SimpleParser = require('./parser/SimpleParser.js');
module.exports.JSONArrayParser = require('./parser/JSONArrayParser.js');

