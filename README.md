# sprite-anim

sprite-anim is a simple spritesheet animation engine.

### Installation
`npm install sprite-anim`

### Features
- common API (play / pause / stop / gotoAndPlay / gotoAndStop / dispose)
- options: frameRate, loop
- initialize frames with data (JSONArrayParser), automatically with dimensions (SimpleParser) or your own custom parser
- works with DOM elements (DOMRenderer), canvas element (CanvasRenderer) or your own custom renderer

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


#### JSONArrayParser

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

#### CanvasRenderer

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







