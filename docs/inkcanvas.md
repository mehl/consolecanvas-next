# The InkCanvas Class

The `InkCanvas` class is JSX component for the `ink` terminal UI framework. It allows you to create and render a `consolecanvas` canvas within an `ink` application.

```typescript
import { InkCanvas } from "consolecanvas-next";

const MyComponent = () => {
    return (
        <InkCanvas>
            {(canvas) => {
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "red";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }}
        </InkCanvas>
    );
};
```

The `InkCanvas` component takes a single child, which is a function that receives the canvas instance as its argument. You can use this canvas instance to get a 2D rendering context and draw on it just like you would with any other `consolecanvas` canvas.

The rendering is updated automatically whenever the component re-renders, so you can use state and props to control what is drawn on the canvas.

You can also pass props to the `InkCanvas` component to customize its behavior:

- `width` and `height`: The width and height of the canvas in **characters**. Please note that these are in characters, not pixels. The actual pixel dimensions will depend on the canvas type used internally (braille or block characters).
- `smooth`: Boolean, use SmoothCanvas (braille) in truecolor mode if true, FastCanvas in 256 color mode otherwise. Default to false.
- `adjustToSize`: Boolean, whether to adjust the canvas size to fit the available space. Default to false.

Especially the last prop is useful, as it lets the canvas automatically adapt to the size of its layout container.

More complex example:


```javascript
import React from 'react';
import { Box, render, Text } from 'ink';
import { InkCanvas } from 'consolecanvas-next';
const HelloWorld = () => {

    return <Box flexDirection="column" borderStyle="round" borderColor="cyan">
        <Text color="white">InkCanvas Hello World.</Text>
        <Box>
            <InkCanvas width={60} height={15} adjustToSize={true}>
                {(canvas) => {
                    const ctx = canvas.getContext("2d");
                    ctx.strokeStyle = "rgb(155,90,100)";
                    ctx.strokeRect(0, 0, canvas.width - 1, canvas.height - 1);
                    ctx.strokeRect(1, 1, canvas.width - 3, canvas.height - 3);
                    ctx.fillStyle = "rgb(10,155,250)";
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 4, 0, Math.PI * 2);
                    ctx.fill();
                }}
            </InkCanvas>
        </Box>
    </Box>;
};

render(<HelloWorld />);
```
