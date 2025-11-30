# The Canvas Classes

There are currently three different canvas classes provided by the library:

- **FastCanvas** - A fast implementation of braille patterns. It supports up to 256 ANSI terminal colors and can also be configured to used the standard 16 colors.
- **SmoothCanvas** - This canvas also uses braille patterns, but supports truecolor (24-bit color) terminals and tries to mix colors where the limitations of the terminal characters require it.
- **BlockCanvas** - This canvas uses block characters instead of braille patterns. It supports truecolor (24-bit color) terminals and can achieve a more "filled" look than braille patterns, but at the cost of resolution.


### FastCanvas

Most basic canvas that supports up to 256 colors, drawille style.

Supported ColorModes: `ColorMode.ANSI16`, `ColorMode.ANSI256`

**Supports use of native AnsiColors like `AnsiColor.RED`**.

### SmoothCanvas

Supports truecolor and color mixing, drawille style.

Supported ColorModes: `ColorMode.ANSI256`, `ColorMode.TRUECOLOR`

**NO** support for native AnsiColors.

### BlockCanvas

Supports truecolor and color mixing, Unicode block style.

Supported ColorModes: `ColorMode.ANSI256`, `ColorMode.TRUECOLOR`

**NO** support for native AnsiColors.

**Attention**: The canvas renders with a different aspect ratio (depending on screen font). Normally pixels are almost twice as high as they are wide. You can use `Context.scale(1, .5)` to correct this when rendering.

## Using the Canvas Classes

All canvas classes implement the same API, which is inspired by the HTML5 Canvas API. You can create a canvas by instantiating one of the classes and then get a 2D rendering context from it:

```typescript
import { SmoothCanvas, ColorMode } from "consolecanvas-next";

const canvas = new SmoothCanvas(90, 30, { colorMode: ColorMode.TRUECOLOR });
const ctx = canvas.getContext("2d");
```

The first two parameters are the width and height of the canvas in pixels.

> You can also pass `undefined` for width and/or height to use the full terminal size.

The third parameter is an options object where you can specify the color mode (16 colors, 256 colors, or truecolor).

## Color Modes

There are three color modes available:

- **ColorMode.ANSI16** - Uses the standard 16 ANSI terminal colors. This mode is the fastest and has the best compatibility with older terminals.
- **ColorMode.ANSI256** - Uses the extended 256 ANSI terminal colors. This mode provides a good balance between color fidelity and performance.
- **ColorMode.TRUECOLOR** - Uses 24-bit truecolor. This mode provides the best color fidelity, but does not allow to use the standard first 16 terminal colors anymore.

`FastCanvas` supports `ColorMode.ANSI16` and `ColorMode.ANSI256`. This canvas lets you also use the first 16 (user defined) terminal colors.

`SmoothCanvas` and `BlockCanvas` support `ColorMode.TRUECOLOR` and `ColorMode.ANSI256`. Both SmoothCanvas and BlockCanvas do not support `ColorMode.ANSI16`, as the color mixing algorithms used in these canvases require at least 256 colors to work properly. They also do not support user defined terminal colors.

## Pixel Size vs. Character Size

It's important to note that the width and height you specify when creating a canvas are in pixels, not characters. Since braille patterns and block characters represent multiple pixels per character, the actual size of the canvas in characters will be smaller.

This is expressed by the "BLOCKSIZE" static property of each canvas class:

```typescript
import { SmoothCanvas, BlockCanvas } from "consolecanvas-next";

console.log(SmoothCanvas.BLOCKSIZE);
// Outputs: {x: 2, y: 4} for braille patterns

console.log(BlockCanvas.BLOCKSIZE); 
// Outputs: {x: 2, y: 2} for block characters
```

Please note that due to the size of a normal terminal character, a braille canvas has an aspect ratio of almost 1:1, while a block character canvas has an aspect ratio of about 2:1.

This means that when using a block character canvas, circles and squares may appear stretched vertically. You may need to adjust your drawing coordinates accordingly to compensate for this. (You can do this easily with the `scale` method of the context.)

## Rendering the Canvas

Once you have drawn something on the canvas using the 2D context, you can render it to the console by calling the `toString` method of the canvas.

`toString` uses a normal newline (`\n`) as delimiter, while `frame` allows you to specify a custom delimiter.

```typescript
console.log(canvas.toString());
```

```typescript
console.log(canvas.frame("\n"));
```


