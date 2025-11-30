# Getting started

`consolecanvas-next` is a collection of TypeScript classes to be used to draw pixel graphics into a terminal. It uses unicode braille or
block characters for this.

`consolecanvas-next` is inspired by the HTML5 Canvas API and uses a very similar API that tries to be as compatible as possible.

## Installation

You can install `consolecanvas-next` via npm:

```bash
npm install consolecanvas-next
```

For font usage you also need `bdfparser`, a package that can parse BDF font files:
```bash
npm install bdfparser
```

If you want to use the canvas within  `ink`, you also need to install `ink`:

```bash
npm install ink
```

## Basic usage

Here is a simple example of how to create a canvas, draw some shapes and text, and render it to the console:

```typescript
import { Context, SmoothCanvas, ColorMode } from "consolecanvas-next";

const canvas = new SmoothCanvas(90, 30, { colorMode: ColorMode.TRUECOLOR });
const ctx: Context = canvas.getContext("2d");

for (let x = 0; x < ctx.width; x++) {
    for (let y = 0; y < ctx.height; y++) {
        const r = Math.floor((x / ctx.width) * 255);
        const g = Math.floor((y / ctx.height) * 255);
        const b = 150;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b})`;
        ctx.strokeRect(x, y, 1, 1);
    }
}

ctx.fillStyle = 'white';
const text = 'Hello, World!';
const bounds = ctx.measureText(text);
ctx.fillText(text, (canvas.width - bounds.width) / 2, canvas.height / 2);

console.log(canvas.toString());
```

This will create a 90x30 canvas, draw a gradient background, and write "Hello, World!" in the center.

As you see, the API is very similar to the HTML5 Canvas API, so if you are familiar with that, you should feel right at home.

## Using with Ink

You can also use `consolecanvas-next` with the `ink` library to create interactive terminal applications. Therefor the `InkCanvas` class is provided:

```typescript
import { InkCanvas } from "consolecanvas-next";

export const MyCanvas = () => {
    return (
        <InkCanvas width={19} height={5} adjustToSize>
            {(canvas) => {
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "yellow";
                ctx.fillRect(0, 0, ctx.width, ctx.height);
            }}
        </InkCanvas>
    );
};
```

This will create a yellow canvas that adjusts to the size is has within the ink application. You can use `<Box>` around it to control its size and position.

The canvas is re-rendered automatically when the size changes or when any state in the component changes.
