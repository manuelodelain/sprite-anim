# sprite-anim

sprite-anim is a simple spritesheet animation engine.

### Install
`npm install sprite-anim`

### Features
- common API (play / pause / stop / gotoAndPlay / gotoAndStop / dispose)
- ajust frameRate, loop
- initialize frames with data (JSONArrayParser), automaticaly with dimensions (SimpleParser) or your own custom parser
- works with DOM element (DOMRenderer), canvas element (CanvasRenderer) or your own custom renderer

### Browser compatibility
- IE 6+ with DOM element, IE 9+ with DOM and canvas element


## Documentation

### DOM element with spritesheet and frame dimensions

```
var animElt = document.getElementById('anim');
var renderer = new SpriteAnim.DOMRenderer(animElt);
var parser = new SpriteAnim.SimpleParser({width: 1410, height: 3960}, {width: 470, height: 120});
var anim = new SpriteAnim(parser, renderer, {frameRate: 25});

anim.play();
```

### Canvas element with frames data

```
var animElt = document.getElementById('anim');
var renderer = new SpriteAnim.CanvasRenderer(animElt);
var parser = new SpriteAnim.JSONArrayParser(framesData);
var anim = new SpriteAnim(parser, renderer, {frameRate: 25});

anim.play();
```


