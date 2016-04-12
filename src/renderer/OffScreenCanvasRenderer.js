'use strict';

var OffScreenCanvasRenderer = function(canvas, sprite, options){
  options = options || {};
  
  this.canvas = canvas;
  this.sprite = sprite;

  var defaultOptions = {
    clearFrame: true
  };

  for (var optionName in defaultOptions){
    this[optionName] = typeof options[optionName] !== 'undefined' ? options[optionName] : defaultOptions[optionName];
  }
  
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