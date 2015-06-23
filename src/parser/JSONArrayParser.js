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