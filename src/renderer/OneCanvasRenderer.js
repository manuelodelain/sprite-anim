'use strict';

var OneCanvasRenderer = function(canvas, sprite){
  this.canvas = canvas;
  this.sprite = sprite;

  this.context = canvas.getContext('2d');
};

OneCanvasRenderer.prototype.render = function(frame, animation) {

  // this.context.globalAlpha = this.particle.alpha;
  this.context.drawImage(
    this.sprite,
    frame.x,
    frame.y,
    frame.width ,
    frame.height,
    animation.x,
    animation.y,
    frame.width * 1,
    frame.height * 1
   );

};

module.exports = OneCanvasRenderer;
