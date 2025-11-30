# The Context Class

The `Context` class provides a 2D rendering context for the canvas, similar to the HTML5 Canvas API. It includes methods for drawing shapes and text, as well as setting styles and transformations.

```typescript
import { SmoothCanvas, ColorMode } from "consolecanvas-next";

const canvas = new SmoothCanvas(90, 30, { colorMode: ColorMode.TRUECOLOR });
const ctx = canvas.getContext("2d");
```

Currently there is only a 2D context available, but the parameter is for compatibility.


## Choosing Fill and Stroke Styles

You can set the `fillStyle` and `strokeStyle` properties of the context to choose the colors used for filling and stroking shapes.

Currently, only solid colors are supported. Your options are:

- web color string (e.g., `"red"`)
- hex color string (e.g., `"#00FF00"`)
- rgb color string (e.g., `"rgb(0,0,255)"`)
- rgb array (e.g., `[0, 0, 255]`)

Transparency (alpha channel) is not supported.

In FastCanvas you can also use `AnsiColor` values for the first 16 terminal colors:

- AnsiColor.BLACK, ...

```typescript
import { AnsiColor } from "consolecanvas-next";

ctx.fillStyle = "red";
ctx.strokeStyle = "#00FF00";

// Only in FastCanvas
ctx.strokeStyle = AnsiColor.BRIGHT_BLUE;
```

## Special to consolecanvas: Draw Modes

The Context class includes a `drawMode` property that allows you to specify whether drawing operations should affect the foreground, background, or both.

This it not standard in HTML5 Canvas, but is necessary here due to the dual-layer nature of console cells.

```typescript
import { DrawMode } from "consolecanvas-next";
ctx.drawMode = DrawMode.FOREGROUND; // Default, draw pixels to foreground
ctx.drawMode = DrawMode.BACKGROUND; // Draws to the background only
ctx.drawMode = DrawMode.BOTH; // Draws to both foreground and background
ctx.drawMode = DrawMode.FILLBG_STROKEFG // Fills background, strokes foreground
```

The normal mode is to draw to the foreground, as the background only supports one color per cell. However, for certain effects, such as drawing filled shapes with a different background color, you can use the other modes.

The last mode is useful for drawing shapes with a filled background and a stroked outline in the foreground.

## Drawing Methods

The `Context` class provides various methods for drawing shapes, such as `fillRect`, `strokeRect`, `beginPath`, `moveTo`, `lineTo`, `arc`, `fill`, and `stroke`. These methods allow you to create complex drawings on the canvas.

```typescript
ctx.fillStyle = "red";
ctx.fillRect(10, 10, 50, 50);
ctx.strokeStyle = "blue";
ctx.strokeRect(10, 10, 50, 50);
ctx.beginPath();
ctx.moveTo(10, 10);
ctx.lineTo(60, 60);
ctx.stroke();
ctx.arc(30, 30, 20, 0, Math.PI * 2);
ctx.fill();
```

## Text Rendering

See the [Text Rendering](./text-rendering.md) documentation for details on how to render text with the Context class.

## Transformations

The `Context` class supports transformations such as translation, rotation, and scaling. You can use methods like `translate`, `rotate`, and `scale` to modify the current transformation matrix.

```typescript
ctx.translate(10, 10);
ctx.rotate(Math.PI / 4);
ctx.scale(2, 2);
ctx.fillRect(0, 0, 20, 20);
```

## Saving and Restoring State

You can save and restore the state of the transformation using the `save` and `restore` methods. This allows you to temporarily change transformations and then revert back to the previous state. Be aware that only the transformation matrix is saved and restored; other state properties like fillStyle and strokeStyle are not affected.

```typescript
ctx.save();
ctx.translate(10, 10);
ctx.rotate(Math.PI / 4);
ctx.scale(2, 2);
ctx.fillRect(0, 0, 20, 20);
ctx.restore();  
```

## Limitations

Currently not supported features include:

- Gradients and patterns for fillStyle and strokeStyle.
- All image drawing methods.
- Advanced path operations like clipping and complex curves.
- Line styles such as lineWidth, lineCap, lineJoin, and miterLimit.
