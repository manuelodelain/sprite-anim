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

