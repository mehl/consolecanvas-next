# The AnimationHelper Class

The `AnimationHelper` class provides a simple way to create animations on a `consolecanvas` canvas. It manages the ANSI codes to go back to the start of the canvas for each frame, allowing for smooth animations in the console.

```typescript
import { SmoothCanvas, ColorMode, AnimationHelper } from "consolecanvas-next";

// Undefined width and height will use the whole terminal size
const canvas = new SmoothCanvas(undefined, undefined, { colorMode: ColorMode.TRUECOLOR });
const ctx = canvas.getContext("2d");

const anim = new AnimationHelper(canvas, { endWithNewline: false });

while (true) {
    // Fast helper method to clear your canvas
    ctx.clear();

    // Draw your frame here
    // ...

    // Render next frame. This will handle moving the cursor back to the start.
    anim.renderFrame();

    await new Promise((a) => setTimeout(a, 100)); // Control frame rate
}
```