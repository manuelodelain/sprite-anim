# sprite-anim

sprite-anim is a simple spritesheet animation engine.

### Installation
`npm install sprite-anim --save`

### Features
- common API (play / pause / stop / gotoAndPlay / gotoAndStop / dispose)
- initialize frames with data (JSONArrayParser), automatically with dimensions (SimpleParser) or your own custom parser
- works with DOM elements (DOMRenderer), canvas element (CanvasRenderer), off-screen canvas (OffScreenCanvasRenderer) or your own custom renderer

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
var animElt = document.getElementById('anim');
var renderer = new SpriteAnim.DOMRenderer(animElt);
var parser = new SpriteAnim.SimpleParser({width: 1410, height: 3960}, {width: 470, height: 120});
var anim = new SpriteAnim(parser, renderer, {frameRate: 25});

anim.play();
```

#### Canvas element with frames data

```
var animElt = document.getElementById('anim');
var renderer = new SpriteAnim.CanvasRenderer(animElt);
var parser = new SpriteAnim.JSONArrayParser(framesData);
var anim = new SpriteAnim(parser, renderer, {frameRate: 25});

anim.play();
```

### Parsers

#### SimpleParser
Initialize frames directly with spritesheet image dimensions and frame dimensions.

##### Params
- `spriteSize`: `Object` `{width: Number, height: Number}`
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

#### CanvasRenderer
Render frame with a `canvas` element (`drawImage`).

##### Params
- `canvas`: canvas element
- `sprite`: `Image` spritesheet image

#### Custom renderer
You can implement your own renderer.

A renderer must have a `render` method with a parameter `frame`.
The `frame` param is an `object` with properties `{x, y, index, width, height}`.

##### Example
```
var CustomRenderer = function(){
};

CustomRenderer.prototype.render = function(frame){
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
`true` if animation currently playing

##### `complete` (`Boolean`)
`true` if animation complete


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

##### `dispose()`
Dispose SpriteAnim instance


#### events

##### `complete`
Dispatched when animation ended

##### `enterFrame`
Dispatched on each frame


