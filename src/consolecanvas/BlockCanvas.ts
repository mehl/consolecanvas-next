import AbstractCanvas from "./AbstractCanvas";
import { resetANSIString, Color, ColorMode, RgbTripleColor, color2ANSIString } from "./Color";

const mapBlocks = [
    " ", //0
    "▘",
    "▝",
    "▀",
    "▖", //4
    "▌",
    "▞",
    "▛",
    "▗", //8
    "▚",
    "▐",
    "▜",
    "▄", //12
    "▙",
    "▟",
    "█"
];

const map = [[1, 2], [4, 8]];

export type BlockCanvasOptions = {
    colorMode?: ColorMode,
};

const DEFAULT_OPTIONS: BlockCanvasOptions = {
    colorMode: ColorMode.ANSI16,
};

class BlockCanvas extends AbstractCanvas {

    private foreground: Uint32Array | undefined;
    private background: Uint32Array | undefined;

    private options: BlockCanvasOptions;
    private clearBackgroundColor: number = 0xFF;

    constructor(width: number | undefined = undefined, height: number | undefined = undefined, options: BlockCanvasOptions = DEFAULT_OPTIONS) {
        super(2, 2);
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
    setBackground(rgb: Color | undefined) {
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


    setCharacter(x: number, y: number, character: string, fg: Color, bg: Color) {
        super.setCharacter(x, y, character, fg, bg);
        try {
            const [nx, ny] = this.toBlockCoord(x, y);
            for (var xx = 0; xx < this.blockSize.x; xx++) {
                for (var yy = 0; yy < this.blockSize.y; yy++) {
                    if (fg) this.setBufferColor(nx * this.blockSize.x + xx, ny * this.blockSize.y + yy, fg, this.foreground);
                    if (bg) this.setBufferColor(nx * this.blockSize.x + xx, ny * this.blockSize.y + yy, bg, this.background);
                }
            }
        } catch (e) {
            // Out of bounds
        }
    }

    private setBufferColor(x: number, y: number, rgb: Color | undefined, target: Uint32Array | undefined) {
        if (!target) return;
        x = Math.floor(x);
        y = Math.floor(y);
        if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
            return;
        }
        const coord = x + this.width * y;
        if (Array.isArray(rgb)) {
            target[coord] = rgb ? (rgb[0] << 24 | rgb[1] << 16 | rgb[2] << 8 | 0xFF) : 0;
        } else {
            // No support for ANSI colors here
            target[coord] = 0;
        }
    }

    frame(delimiter: string): string {
        let lastColor: string | undefined = undefined;
        let lastBgColor: string | undefined = undefined;
        const outputLines: string[] = [];
        for (var y = 0; y < this.height; y += 2) {
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
                const char = directText ? String.fromCharCode(directText) : this.encodeBlockCharacter(x, y, this.foreground);
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

    private middleColor(x: number, y: number, b: Uint32Array | undefined): RgbTripleColor | undefined {
        if (!b) return undefined;
        const w = this.width;
        const colors = [b[(y + 0) * w + x], b[(y + 0) * w + x + 1], b[(y + 1) * w + x], b[(y + 1) * w + x + 1]];
        const sum = colors.reduce((p, c) => p + (c & 0xFF), 0) / 0xFF;
        if (sum == 0) return undefined;
        const blue = Math.floor(colors.reduce((p, c) => p + (c >> 8 & 0xFF), 0) / sum);
        const green = Math.floor(colors.reduce((p, c) => p + (c >> 16 & 0xFF), 0) / sum);
        const red = Math.floor(colors.reduce((p, c) => p + (c >> 24 & 0xFF), 0) / sum);
        return [red, green, blue];
    }

    private encodeBlockCharacter(x: number, y: number, b?: Uint32Array): string {
        if (!b) return " ";
        const w = this.width;
        let mapIndex = 0;
        [0, 1].forEach((yy) => {
            [0, 1].forEach((xx) => {
                const v = b[(y + yy) * w + (x + xx)] & 0xFF;
                if (v > 127) mapIndex |= map[yy][xx];
            });
        });
        const char = mapBlocks[mapIndex];
        return char;
    }
}

export default BlockCanvas;
