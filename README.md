# consolecanvas-next

A versatile collection of drawing canvases for console and terminal environments. Including a JSX component `<InkCanvas>` for the fantastic `ink` console ui builder.

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/logo.png" style="width: 100%; height: auto; margin: 3em 0" />

Features multiple rendering styles and color modes with web canvas API compatibility. Supports both Unicode block characters and Braille patterns (similar to drawille) for high-resolution terminal graphics.

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/screenshot.png" style="width: 100%; height: auto; margin: 3em 0" />

Heavily inspired and in part derived from [drawille](https://www.npmjs.com/package/drawille).

**Key Features:**
- Web Canvas API compatibility
- Unicode block and Braille rendering modes
- Multiple color schemes
- Cross-platform terminal support
- Enhanced functionality beyond drawille

## Documentation

- [Getting Started](docs/getting-started.md)
- [Canvas Classes](docs/canvas.md)
- [Context Class](docs/context.md)
- [Animations](docs/animations.md)
- [InkCanvas Integration](docs/inkcanvas.md)

## Canvas Classes

* **FastCanvas** - most basic canvas that supports up to 256 colors, drawille style.
* **SmoothCanvas** - Supports truecolor and color mixing, drawille style.
* **BlockCanvas** - Supports truecolor and color mixing, unicode block style.

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/canvas_types.png" style="max-width: 80%; width: 30em; height: auto">

## Example

Example for **DrawMode.FILLBG_STROKEFG**: The fill for the surfaces is a light blue that goes to the background. The edges of thesirfaces are stroked to the foreground with black. Truecolor SmoothCanvas.

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/drawing_smooth_example.png" style="max-width: 80%; width: 30em; height: auto">

## Support for `ink` reactive console components

[ink](https://github.com/vadimdemedes/ink) is a package for creating reactive user interfaces in terminals with react-jsx style reactivity and DOM trees.

**concolevanvas-next** offers an `InkCanvas` react component that can directly be used in ink's JSX component tree. It makes a box that contains a canvas. Parameters are:

Hello World Example:

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/helloworld.png" >


See the [demo pages](https://github.com/mehl/consolecanvas-next/tree/main/demo/ink) for more examples:

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/inkdemo.png" >

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/downloads.png" >

