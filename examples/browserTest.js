var fs = require('fs');
var domready = require('domready');
var SpriteAnim = require('../src/SpriteAnim');
var raf = require('raf');

domready(function () {

  var body = document.getElementsByTagName("body")[0];

  this.animationData = JSON.parse(fs.readFileSync(__dirname + '/particle_hover.json', 'utf8'));

  this.container = document.createElement("div");
  this.container.style.position = 'absolute';

  // body.appendChild(this.container);

  this.container.style.width = this.animationData.frames[0].sourceSize.w + 'px';
  this.container.style.height = this.animationData.frames[0].sourceSize.h + 'px';

  this.renderer = new SpriteAnim.DOMRenderer(this.container);
  this.parser = new SpriteAnim.JSONArrayParser(this.animationData, 1);
  this.anim = new SpriteAnim(this.parser, this.renderer, {frameRate: 25, loop: true });

  this.img = new Image();
  this.img.addEventListener('load', function(){
    this.container.style.backgroundImage = 'url(' + this.img.src + ')';
    this.anim.play();
  }.bind(this));

  this.img.src = './examples/' + this.animationData.meta.image;






  this.canvas = document.createElement("canvas");

  this.canvas.style.position = 'absolute';
  this.canvas.style.left = 0;
  this.canvas.style.top = 0;
  this.canvas.style.margin = 0;
  this.canvas.style.padding = 0;
  this.canvas.style.width = window.innerWidth + 'px';
  this.canvas.style.height = window.innerHeight + 'px';
  this.canvas.setAttribute('width', window.innerWidth + 'px');
  this.canvas.setAttribute('height', window.innerHeight + 'px');

  this.context = this.canvas.getContext('2d');

  body.appendChild(this.canvas);






  this.img2 = new Image();
  this.img2.addEventListener('load', function(){

    this.oneCanvasRenderer = new SpriteAnim.OneCanvasRenderer(this.canvas, this.img2);
    this.parser2 = new SpriteAnim.JSONArrayParser(this.animationData, 1);
    this.anim2 = new SpriteAnim(this.parser2, this.oneCanvasRenderer, { frameRate: 25, loop: true, manualUpdate: true });
    this.anim2.play();
  }.bind(this));

  this.img2.src = './examples/' + this.animationData.meta.image;





  this.onEnterFrame = function() {
    if(this.anim2) {
      this.anim2.enterFrame();
    }

    raf(this.enterFrame);
  }

  this.enterFrame = this.onEnterFrame.bind(this);
  this.enterFrame();
})
