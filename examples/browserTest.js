var fs = require('fs');
var domready = require('domready');
var SpriteAnim = require('../src/SpriteAnim');
var raf = require('raf');

domready(function () {

  var body = document.getElementsByTagName("body")[0];

  this.timeStamp = null;
  this.animationData = JSON.parse(fs.readFileSync(__dirname + '/particle_hover.json', 'utf8'));

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
  body.appendChild(this.canvas);

  this.context = this.canvas.getContext('2d');

  this.img = new Image();
  this.img.addEventListener('load', function(){

    this.oneCanvasRenderer = new SpriteAnim.OneCanvasRenderer(this.canvas, this.img);
    //El ,1 es el scale factor
    this.parser = new SpriteAnim.JSONArrayParser(this.animationData, 1);
    this.anim = new SpriteAnim(this.parser, this.oneCanvasRenderer, { frameRate: 60, loop: true, manualUpdate: true });
    this.anim.play();
  }.bind(this));

  this.img.src = './examples/' + this.animationData.meta.image;



  this.onEnterFrame = function() {
    raf(this.enterFrame);
    if(this.anim) {
      this.timeStamp = new Date().getTime();
      this.anim.onEnterFrame(this.timeStamp);
    }
  }

  this.enterFrame = this.onEnterFrame.bind(this);
  raf(this.enterFrame);

});
