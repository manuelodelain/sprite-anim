'use strict';

var DOMRenderer = function(element, options){
  options = options || {};

  this.element = element;

  this.scaleFactor = options.scaleFactor || 1;

  if (options.sprite){
    var spriteWidth = options.sprite.naturalWidth * this.scaleFactor;
    var spriteHeight = options.sprite.naturalHeight * this.scaleFactor;

    this.element.style.backgroundImage = 'url(' + options.sprite.src + ')';
    this.element.style.backgroundSize = spriteWidth + 'px ' + spriteHeight + 'px';
  }
};

DOMRenderer.prototype.render = function(frame) {
  this.element.style.backgroundPosition = '-' + frame.x + 'px -' + frame.y + 'px';
};

module.exports = DOMRenderer;