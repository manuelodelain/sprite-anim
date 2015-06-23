'use strict';

var raf = require('raf');

var callbackId = 0;

var Ticker = function(){
  this.items = [];

  this.isRunning = false;
  this.tickId = -1;
  this.tickCb = this.onTick.bind(this);
};

Ticker.prototype.start = function() {
  this.isRunning = true;
  
  this.tickId = raf(this.tickCb);
};

Ticker.prototype.pause = function() {
  this.isRunning = false;

  raf.cancel(this.tickId);
};

Ticker.prototype.add = function(callback) {
  var id = callbackId++;

  this.items.push({
    id: id,
    cb: callback
  });

  if (!this.isRunning) this.start();

  return id;
};

Ticker.prototype.remove = function(id) {
  var item;

  for (var i = 0, n = this.items.length; i < n; i++){
    if (this.items[i].id === id){
      item = this.items.splice(i, 1)[0];
    }
  }

  if (this.items.length === 0) this.pause();

  return item;
};

Ticker.prototype.onTick = function(timeStamp) {
  this.tickId = raf(this.tickCb);

  for (var i = 0, n = this.items.length; i < n; i++){
    this.items[i].cb(timeStamp);
  }
};

module.exports = Ticker;

