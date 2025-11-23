import { Canvas } from "./Canvas";

export class AnimationHelper {
    private canvas: Canvas;

    private lastFrameLineCount: number = 0;

    // Set to false for fullscreen animations, to avoid flickering.
    private endWithNewline: boolean = false;

    constructor(canvas: Canvas, { endWithNewline }: { endWithNewline?: boolean; } = {}) {
        this.canvas = canvas;
        this.endWithNewline = endWithNewline || false;
    }

    clear(): void {
        process.stdout.write(`\x1b[G\x1b[${this.lastFrameLineCount - 1}A`); // Move cursor to the top-left of the last frame
        process.stdout.write("\x1b[J");
        this.lastFrameLineCount = 0;
    }
    renderFrame(): void {
        let frame = this.canvas.frame("\n");
        process.stdout.write("\x1b[?25l"); // Hide cursor
        if (this.lastFrameLineCount > 0) {
            process.stdout.write(`\x1b[G\x1b[${this.lastFrameLineCount - 1}A`); // Move cursor to the top-left of the last frame
        }
        process.stdout.write(frame);
        process.stdout.write(`\x1b[G`); // Move cursor to the beginning of the line
        if (this.endWithNewline) {
            process.stdout.write("\n");
        }
        process.stdout.write("\x1b[?25h"); // Show cursor
        const lineCount = frame.split("\n").length;
        this.lastFrameLineCount = lineCount + (this.endWithNewline ? 1 : 0);
    }

}