var CanvasRenderer = function(canvas, sprite){
  this.canvas = canvas;
  this.sprite = sprite;
  
  this.context = canvas.getContext('2d');
};

CanvasRenderer.prototype.render = function(frame) {
  this.context.clearRect(0, 0, frame.width, frame.height);
  
  this.context.drawImage(
    this.sprite,
    frame.x,
    frame.y,
    frame.width,
    frame.height,
    0,
    0,
    frame.width,
    frame.height
   );
};

module.exports = CanvasRenderer;