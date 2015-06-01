var SimpleParser = function(spriteSize, frameSize){
  this.numFrames = 0;
  this.frames = [];

  var numFramesX = Math.ceil(spriteSize.width / frameSize.width);
  var numFramesY = Math.ceil(spriteSize.height / frameSize.height);

  for (var i = 0; i < numFramesY; i++) {
    for (var j = 0; j < numFramesX; j++) {
      this.frames.push({
        x: j * frameSize.width,
        y: i * frameSize.height,
        index: this.numFrames,
        width: frameSize.width,
        height: frameSize.height
      });

      this.numFrames++;
    }
  }
};

module.exports = SimpleParser;