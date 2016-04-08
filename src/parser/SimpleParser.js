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