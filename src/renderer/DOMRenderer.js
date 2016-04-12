'use strict';

var DOMRenderer = function(element, options){
  options = options || {};

  this.element = element;

  this.scaleFactor = options.scaleFactor || 1;
  this.sprite = options.sprite;

  this.spriteIndex = 0;
  if (this.sprite) this.updateSprite();
};

DOMRenderer.prototype.updateSprite = function() {
  var sprite;

  if (Object.prototype.toString.call(this.sprite) === '[object Array]'){
    sprite = this.sprite[this.spriteIndex];
  }else{
    sprite = this.sprite;
  }

  var spriteWidth = sprite.naturalWidth * this.scaleFactor;
  var spriteHeight = sprite.naturalHeight * this.scaleFactor;

  this.element.style.backgroundImage = 'url(' + sprite.src + ')';
  this.element.style.backgroundSize = spriteWidth + 'px ' + spriteHeight + 'px';
};

DOMRenderer.prototype.render = function(frame) {
  if (frame.spriteIndex !== this.spriteIndex){
    this.spriteIndex = frame.spriteIndex;

    this.updateSprite();
  }

  this.element.style.backgroundPosition = '-' + frame.x * this.scaleFactor + 'px -' + frame.y * this.scaleFactor + 'px';
};

module.exports = DOMRenderer;