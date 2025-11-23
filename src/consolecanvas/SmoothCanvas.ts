import AbstractCanvas from "./AbstractCanvas";
import { AnsiColor, Color, color2ANSIString, ColorMode, resetANSIString, rgbToANSITrueColorString, RgbTripleColor } from "./Color";

const map = [
    [0x1, 0x8],
    [0x2, 0x10],
    [0x4, 0x20],
    [0x40, 0x80]
];

export type SmoothCanvasOptions = {
    colorMode?: ColorMode,
};

const DEFAULT_OPTIONS: SmoothCanvasOptions = {
    colorMode: ColorMode.ANSI16,
};

class SmoothCanvas extends AbstractCanvas {

    static BLOCKSIZE = { x: 2, y: 4 };

    protected foreground?: Uint32Array;
    protected background?: Uint32Array;

    private options: SmoothCanvasOptions;
    private clearBackgroundColor: number = 0xFF;

    constructor(width: number | undefined = undefined, height: number | undefined = undefined, options: SmoothCanvasOptions = DEFAULT_OPTIONS) {
        super(SmoothCanvas.BLOCKSIZE.x, SmoothCanvas.BLOCKSIZE.y);
        this.width = width || this.maxWidth;
        this.height = height || this.maxHeight;
        this.options = options;
    }

    protected initBuffers() {
        super.initBuffers();
        const bufferLength = (this.width * this.height);
        this.foreground = new Uint32Array(bufferLength);
        this.background = new Uint32Array(bufferLength);

    }

    clear() {
        super.clear();
        this.foreground?.fill(0);
        this.background?.fill(this.clearBackgroundColor);
    }

    setBackground(rgb: Color) {
        if (Array.isArray(rgb)) {
            this.clearBackgroundColor = rgb ? ((rgb[0] << 24) | (rgb[1] << 16) | (rgb[2] << 8) | 0xFF) : 0xFF;
        } else {
            // No support for ANSI colors here
            this.clearBackgroundColor = 0xFF;
        }
    }

    setPixel(x: number, y: number, rgb: Color | undefined) {
        this.setBufferColor(x, y, rgb, this.foreground);
    }
    setBgPixel(x: number, y: number, rgb: Color | undefined) {
        this.setBufferColor(x, y, rgb, this.background);
    }

    setCharacter(x: number, y: number, character: string, fg: Color | undefined, bg: Color | undefined) {
        super.setCharacter(x, y, character, fg, bg);
        try {
            const [nx, ny] = this.toBlockCoord(x, y);
            for (var xx = 0; xx < this.blockSize.x; xx++) {
                for (var yy = 0; yy < this.blockSize.y; yy++) {
                    if (fg) this.setBufferColor(nx * 2 + xx, ny * 4 + yy, fg, this.foreground);
                    if (bg) this.setBufferColor(nx * 2 + xx, ny * 4 + yy, bg, this.background);
                }
            }
        } catch (e) {
            // Out of bounds
        }
    }

    private setBufferColor(x: number, y: number, rgb: Color | undefined, target?: Uint32Array) {
        if (!target) return;
        x = Math.floor(x);
        y = Math.floor(y);
        if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
            return;
        }
        const coord = x + this.width * y;
        if (rgb === undefined || rgb == AnsiColor.INVISIBLE) {
            target[coord] = 0; // Fully transparent
        } else if (Array.isArray(rgb)) {
            target[coord] = rgb ? (rgb[0] << 24 | rgb[1] << 16 | rgb[2] << 8 | 0xFF) : 0;
        } else {
            // No support for ANSI colors here
            target[coord] = 0;
        }
    }

    frame(delimiter: string = '\n'): string {
        let lastColor: string | undefined = undefined;
        let lastBgColor: string | undefined = undefined;
        const outputLines: string[] = [];
        for (var y = 0; y < this.height; y += 4) {
            const currentLine: string[] = [];
            for (var x = 0; x < this.width; x += 2) {
                const color = color2ANSIString(this.middleColor(x, y, this.foreground), this.options.colorMode, false);
                const bgColor = color2ANSIString(this.middleColor(x, y, this.background), this.options.colorMode, true);
                if (color != lastColor) {
                    currentLine.push(color);
                    lastColor = color;
                }
                if (bgColor != lastBgColor) {
                    currentLine.push(bgColor);
                    lastBgColor = bgColor;
                }
                const directText = this.textContent?.[this.toBlockIndex(x, y)];
                const char = directText ? String.fromCharCode(directText) : this.encodeBrailleCharacter(x, y, this.foreground);
                currentLine.push(char);
            }
            if (lastColor !== undefined || lastBgColor != undefined) {
                currentLine.push(resetANSIString());
                lastColor = undefined;
                lastBgColor = undefined;
            }
            outputLines.push(currentLine.join(""));
        }
        return outputLines.join(delimiter);
    }

    private middleColor(x: number, y: number, b?: Uint32Array): RgbTripleColor | undefined {
        if (!b) return undefined;
        const w = this.width;
        // Collect colors of the 8 pixels of a character
        const colors = [b[(y + 0) * w + x], b[(y + 0) * w + x + 1], b[(y + 1) * w + x], b[(y + 1) * w + x + 1], b[(y + 2) * w + x], b[(y + 2) * w + x + 1], b[(y + 3) * w + x], b[(y + 3) * w + x + 1]];
        // Compute the amount of visible alpha channel in sum
        const alphaSum = colors.reduce((prev, color) => prev + (color & 0xFF), 0) / 0xFF;
        if (alphaSum == 0) return undefined;
        // Add according to alpha channel
        const blue = Math.floor(colors.reduce((prev, color) => prev + (color >> 8 & 0xFF), 0) / alphaSum);
        const green = Math.floor(colors.reduce((prev, color) => prev + (color >> 16 & 0xFF), 0) / alphaSum);
        const red = Math.floor(colors.reduce((prev, color) => prev + (color >> 24 & 0xFF), 0) / alphaSum);
        return [red, green, blue];
    }

    private encodeBrailleCharacter(x: number, y: number, b?: Uint32Array): string {
        if (!b) return " ";
        const w = this.width;
        let char = 0;
        [0, 1, 2, 3].forEach((yy) => {
            [0, 1].forEach((xx) => {
                const v = b[(y + yy) * w + (x + xx)] & 0xFF;
                if (v > 127) char |= map[yy][xx];
            });
        });
        return char ? String.fromCharCode(0x2800 + char) : " ";
    }
}

export default SmoothCanvas;
