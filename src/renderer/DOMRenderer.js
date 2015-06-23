'use strict';

var DOMRenderer = function(element){
  this.element = element;
};

DOMRenderer.prototype.render = function(frame) {
  this.element.style.backgroundPosition = '-' + frame.x + 'px -' + frame.y + 'px';
};

module.exports = DOMRenderer;