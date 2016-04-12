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
