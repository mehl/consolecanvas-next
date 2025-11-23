# consolecanvas-next

A versatile collection of drawing canvases for console and terminal environments. Features multiple rendering styles and color modes with web canvas API compatibility. Supports both Unicode block characters and Braille patterns (similar to drawille) for high-resolution terminal graphics.

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/screenshot.png" style="width: 100%; height: auto; margin: 3em 0" />

Heavily inspired and in part derived from [drawille](https://www.npmjs.com/package/drawille).

**Key Features:**
- Web Canvas API compatibility
- Unicode block and Braille rendering modes
- Multiple color schemes
- Cross-platform terminal support
- Enhanced functionality beyond drawille

## Usage

```bash
yarn install # 1 Install dependencies
yarn build   # 2 Build package and demos
yarn demo    # 3 Show demo
```

## Canvas Classes

* **FastCanvas** - most basic canvas that supports up to 256 colors, drawille style.
* **SmoothCanvas** - Supports truecolor and color mixing, drawille style.
* **BlockCanvas** - Supports truecolor and color mixing, unicode block style.

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/canvas_types.png" style="max-width: 80%; width: 30em; height: auto">

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


## Color Modes

* **ColorMode.ANSI16** - restricted to the first 16 ANSI colors. If you use rgb while drawing, tries to fit to these colors, but don't expect too good results (esp. when you manually changed your terminal colors).
* **ColorMode.ANSI256** - uses truecolor emulation in 256 ANSI colors.
* **ColorMode.TRUECOLOR** - full truecolor mode.

## Drawing modes

The foreground and background are handled differently in the console, and therefore there are different modes for drawing in the foreground or background of the canvas.

* **DrawMode.FOREGROUND** - Draws only in the foreground for stroke and fill. (**default**)
* **DrawMode.BACKGROUND** - Draws only in the background for stroke and fill.
* **DrawMode.BOTH** - Draw in the forground and background with both stroke and fill.
* **DrawMode.FILLBG_STROKEFG** - Draw strokes in the foreground and fills in the background. Additionally filling will also remove foreground pixels.

## Example

Example for **DrawMode.FILLBG_STROKEFG**: The fill for the surfaces is a light blue that goes to the background. The edges of thesirfaces are stroked to the foreground with black. Truecolor SmoothCanvas.

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/drawing_smooth_example.png" style="max-width: 80%; width: 30em; height: auto">

## Support for `ink` reactive console components

[ink](https://github.com/vadimdemedes/ink) is a package for creating reactive user interfaces in terminals with react-jsx style reactivity and DOM trees.

**concolevanvas-next** offers an `InkCanvas` react component that can directly be used in ink's JSX component tree. It makes a box that contains a canvas. Parameters are:

* **width** (number) - width in **characters** (pixel will be width * 2)
* **height** (number) - height in **characters** (pixel will be height *2)
* **smooth** (boolean) - if true, uses `SmoothCanvas` in TRUECOLOR mode, otherwise uses `FastCanvas` in ANSI256 mode.
* **adjustToSize** (boolean) - if true, the canvas tries to adjust to the screen space available. If false it stays at the given width/height.

See the demo page for an example:

<img src="https://raw.githubusercontent.com/mehl/consolecanvas-next/main/docs/inkdemo.png" >

