# sprite-anim

sprite-anim is a simple spritesheet animation engine.

### Installation
`npm install sprite-anim --save`

### Features
- common API (play / pause / stop / gotoAndPlay / gotoAndStop / dispose)
- initialize frames with data (JSONArrayParser), automatically with dimensions (SimpleParser) or your own custom parser
- works with DOM elements (DOMRenderer), canvas element (CanvasRenderer), off-screen canvas (OffScreenCanvasRenderer) or your own custom renderer
- optimized for multiple animations (one requestAnimationFrame for all instances)
- single animation with multiple spritesheets support

### Browser compatibility
IE 6+ with DOM element, IE 9+ with DOM and canvas element.
If you need to support IE 8- use [es5-shim](https://github.com/es-shims/es5-shim) for EcmaScript 5 methods compatibility.

## Documentation

### Use
#### Browserify
```
var SpriteAnim = require('sprite-anim');
````

#### AMD
```
require(['sprite-anim.js'], function(SpriteAnim){
});
````

#### Script tag
```
<script src="path/to/file/sprite-anim.js"></script>
<script>
  // global variable SpriteAnim
</script>
````

### Examples

#### DOM element with spritesheet and frame dimensions

```
var element = document.getElementById('anim');
var renderer = new SpriteAnim.DOMRenderer(element);
var parser = new SpriteAnim.SimpleParser({width: 1410, height: 3960}, {width: 470, height: 120});
var anim = new SpriteAnim(parser, renderer, {frameRate: 25});

anim.play();
```

#### Canvas element with frames data

```
var img = new Image();

img.addEventListener('load', function(){
  var element = document.getElementById('anim');
  var renderer = new SpriteAnim.CanvasRenderer(element, img);
  var parser = new SpriteAnim.JSONArrayParser(framesData); // framesData is your JSON data
  var anim = new SpriteAnim(parser, renderer, {frameRate: 25});

  anim.play();
});

img.src = 'images/anim.png';// your spritesheet image
```

### Parsers

#### SimpleParser
Initialize frames directly with spritesheet image dimensions and frame dimensions.

##### Params
- `sprite`: `Object` `{width: Number, height: Number, offsetX` (optional): `Number, offsetY` (optional): `Number}` || `HTMLImageElement` (loaded image) || `Array` Objects with width/height values or loaded images
- `frameSize`: `Object` `{width: Number, height: Number}`

#### JSONArrayParser
Initialize frames with an `Array` of frames data, following the TexturePacker JSONArray output.

##### Params
- `data`: `Object`
- `scaleFactor` (optional): `Number`

#### Custom parser
You can implement your own parser.

A parser must have these properties :
- `numFrames`: number of frames
- `frames`: an array of frames `{x, y, index, width, height}`

##### Example
```
var CustomParser = function(framesData){
  this.numFrames = 0;
  this.frames = [];

  // populate frames and increment numFrames
};
```


### Renderers

#### DOMRenderer
Render frame with a DOM element (`background-position`).

##### Params
- `element`: DOM element
- `options` (optional): `Object`
  - `scaleFactor`: `Number`
  - `sprite`: `HTMLImageElement` loaded image || `Array` loaded images (multiple spritesheets). 
  Auto set background image/size.

#### CanvasRenderer
Render frame with a `canvas` element (`drawImage`).

##### Params
- `canvas`: canvas element
- `sprite`: `HTMLImageElement` loaded spritesheet image || || `Array` loaded spritesheet images (multiple spritesheets)
- `options` (`Object`): 
  - `clearFrame` (`Boolean`): clear frame on render

#### Custom renderer
You can implement your own renderer.

A renderer must have a `render` method with a parameter `frame`.
There is an optionnal parameter `animation` which is the `SpriteAnim` instance.
The `frame` param is an `object` with properties `{x, y, index, width, height}`.

##### Example
```
var CustomRenderer = function(){
};

CustomRenderer.prototype.render = function(frame, animation){
  // draw the frame
};
```

### SpriteAnim


#### create instance
`new SpriteAnim(parser, renderer, options)`

##### `options` (`Object`)
- `frameRate` (`Number`)
Animation frame rate (default: `60`)
- `loop` (`Boolean`)
If `true` loop animation (default: `false`)
- `yoyo` (`Boolean`)
If `true` repeat from end when looping (default: `false`)
- `numFrames` (`Boolean`)
Force total frames
- `manualUpdate` (`Boolean`)
If `true` the animation will not update itself. (default: `false`)
You'll have to update it manually with an explicit `onEnterFrame()` call on a custom render loop.


#### properties

##### `x` (`Number`)
Horizontal position from the top left corner of the container. (default: 0)

##### `y` (`Number`)
Vertical position from the top left corner of the container. (default: 0)

##### `alpha` (`Number`)
Alpha value of the animation. A value between 0 and 1. Currently only supported on canvas mode. (default: 1)

##### `loop` (`Boolean`)
If `true` loop animation (default: `false`)

##### `yoyo` (`Boolean`)
If `true` repeat from end when looping (default: `false`)


##### `frameRate` (`Number`)
Animation frame rate

##### `numFrames` (`Number`)
Total frames

##### `currentFrame` (`Number`)
Current frame index

##### `isPlaying` (`Boolean`)
`true` if the animation is playing

##### `reversed` (`Boolean`)
`true` if the animation is playing reversed

##### `complete` (`Boolean`)
`true` if the animation is complete


#### methods

##### `play()`
Play animation

##### `pause()`
Pause animation

##### `stop()`
Pause and reset animation (frame index = 0)

##### `gotoAndPlay(frameIndex)`
Go to a frame index and play animation

##### `gotoAndStop(frameIndex)`
Go to a frame index and pause animation

##### `onEnterFrame(timeStamp)`
Called internally each frame.
If you add the `manualUpdate` option and call this method directly in a external render loop you have to pass a `timeStamp` argument (from the requestAnimationFrame callback).

##### `renderFrame()`
Render the current frame

##### `dispose()`
Dispose SpriteAnim instance


#### events

##### `complete`
Dispatched when animation ended

##### `enterFrame`
Dispatched on each frame
