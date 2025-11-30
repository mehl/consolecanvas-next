import BlockCanvas, { type BlockCanvasOptions } from "./consolecanvas/BlockCanvas";
import FastCanvas, { type FastCanvasOptions } from "./consolecanvas/FastCanvas";
import SmoothCanvas, { type SmoothCanvasOptions } from "./consolecanvas/SmoothCanvas";
import { ColorMode, AnsiColor } from "./consolecanvas/Color";
import Context, { DrawMode } from "./consolecanvas/Context";
import { AnimationHelper } from "./consolecanvas/AnimationHelper";
import { InkCanvas } from "./components/InkCanvas";
import { globalFontManager } from "./consolecanvas/bdf/FontManager";

export {
    BlockCanvas,
    BlockCanvasOptions,
    FastCanvas,
    FastCanvasOptions,
    SmoothCanvas,
    SmoothCanvasOptions,
    Context,
    ColorMode,
    DrawMode,
    AnsiColor,
    AnimationHelper,
    InkCanvas,
    globalFontManager
};