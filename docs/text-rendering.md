# Text rendering with the Context Class

`consolecanvas-next` supports text rendering via bitmap fonts in BDF format. You can use the `Context` class's text methods to render text on the canvas.

> Be sure to install the package `bdfparser` in your project to use text rendering with
> bdf fonts. It's a peer dependency of `consolecanvas-next`.

Without bdf fonts context renders in a fallback-mode using the terminal's native font. In this mode text can only be positioned character-wise, not pixel-wise, and always occupies one character cell. This can also be useful for simple text output that takes not too much space.

## Text Rendering

Text rendering is done via `bdfparser` and supports all bdf bitmap fonts. You can find many free bdf fonts online or in th demo folder of this package.

1. Load a BDF font using the `globalFontManager`. This is necessary so that you can use the font for text rendering.
2. Set the `font` property of the context to the loaded font.
3. Use the `fillText` or `strokeText` methods to render text on the canvas.

> As with HTML canvas, text is drawn starting from the baseline. You may need to adjust the y-coordinate accordingly (see measuring text below). Currently no other settings are supported.

```typescript
import { globalFontManager } from "@consolecanvas-next";
import { SmoothCanvas, ColorMode } from "../src/index";

const canvas = new SmoothCanvas(undefined, undefined, { colorMode: ColorMode.TRUECOLOR });
const ctx = canvas.getContext("2d");

const logoFont = await globalFontManager.addFont("./demo/bdf-fonts/spleen-32x64.bdf");
ctx.font = logoFont;
ctx.fillStyle = "steelblue";
ctx.fillText("consolecanvas-next", 0, 0);
```

The Context supports also transformations on text, but be careful as text rendering is pixel based and may look distorted when rotated or scaled.

> Without bdf fonts, context will render text with the terminal font. This can not be positioned pixelwise, only character wise, and has always the size of one character cell.

## Measure Text

You can measure the width of text using the `measureText` method of the context. This method returns a `TextMetrics` object that contains information about the measured text.

```typescript
const metrics = ctx.measureText("Hello, World!");
console.log(`Text width: ${metrics.width}px`);
```

The `TextMetrics` object can be confusing, as it contains properties that are not relevant for consolecanvas text rendering. Important properties are:

- `width`: The width of the text in pixels.
- `fontBoundingBoxAscent`: The distance from the baseline to the top of the text.
- `fontBoundingBoxDescent`: The distance from the baseline to the bottom of the text.

To correct the baseline position when rendering text, you can use the ascent value:

```typescript
const yPos = 10; // desired top position
ctx.fillText("Hello, World!", 0, yPos + metrics.fontBoundingBoxAscent);
```

TextMetrics does not support height in the HTML5 Canvas spec, so you need to calculate it yourself:

```typescript
const textHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
console.log(`Text height: ${textHeight}px`);
```

## Limitations

- Text rendering with bdf fonts is pixel based. This means that when you apply transformations like scaling or rotation, the text may appear distorted.
- Currently "strokeText" does not really draw the outlines of the characters, but just fills them.
- Not all text metrics are supported well.