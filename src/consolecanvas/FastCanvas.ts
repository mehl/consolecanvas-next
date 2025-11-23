import AbstractCanvas from "./AbstractCanvas";
import { Color, colorCodeToANSIString, resetANSIString, ColorMode, color2ANSICode, AnsiColor } from "./Color";

const map = [
    [0x1, 0x8],
    [0x2, 0x10],
    [0x4, 0x20],
    [0x40, 0x80]
];

export type FastCanvasOptions = {
    colorMode?: ColorMode,
    useBackground?: boolean;
};

const DEFAULT_OPTIONS: FastCanvasOptions = {
    colorMode: ColorMode.ANSI16,
    useBackground: true
};

class FastCanvas extends AbstractCanvas {

    static BLOCKSIZE = { x: 2, y: 4 };

    private pixelBuffer?: Buffer;

    // We need 256 colors PLUS a -1 reset value
    private fgBuffer?: Int16Array;
    private bgBuffer?: Int16Array;
    private clearBackgroundColor?: number = AnsiColor.INVISIBLE;

    private options: FastCanvasOptions;

    constructor(width: number | undefined = undefined, height: number | undefined = undefined, options: FastCanvasOptions = DEFAULT_OPTIONS) {
        super(FastCanvas.BLOCKSIZE.x, FastCanvas.BLOCKSIZE.y);
        this.width = width || this.maxWidth;
        this.height = height || this.maxHeight;
        this.options = options;
    }

    setBackground(rgb: Color | undefined) {
        this.clearBackgroundColor = this.color2ANSICode(rgb);
    }

    protected initBuffers() {
        super.initBuffers();
        const bufferLength = (this.width * this.height) / 8;
        this.pixelBuffer = Buffer.alloc(bufferLength);
        this.fgBuffer = new Int16Array(bufferLength);
        this.bgBuffer = new Int16Array(bufferLength);
    }

    clear() {
        super.clear();
        this.pixelBuffer?.fill(0);
        this.fgBuffer?.fill(AnsiColor.INVISIBLE);
        this.bgBuffer?.fill(this.clearBackgroundColor ?? AnsiColor.INVISIBLE);
    }

    setPixel(x: number, y: number, rgb: Color | undefined) {
        if (rgb === undefined || rgb == AnsiColor.INVISIBLE) {
            this.unset(x, y);
        } else {
            this.__setColor(x, y, rgb, this.fgBuffer);
            this.set(x, y);
        }
    }
    setBgPixel(x: number, y: number, rgb: Color | undefined) {
        this.__setColor(x, y, rgb, this.bgBuffer);
    }

    clearPixel(x: number, y: number) {
        this.unset(x, y);
    }

    setCharacter(x: number, y: number, character: string, fg: Color | undefined, bg: Color | undefined) {
        super.setCharacter(x, y, character, fg, bg);
        try {
            const coord = this.toBlockIndex(x, y);
            if (this.fgBuffer && fg !== undefined) this.fgBuffer[coord] = this.color2ANSICode(fg) || 0;
            if (this.bgBuffer && bg !== undefined) this.bgBuffer[coord] = this.color2ANSICode(bg) || 0;
        } catch (e) {
            // out of bounds
        }
    }

    private __setColor(x: number, y: number, rgb: Color | undefined, target?: Int16Array) {
        if (!target) return;
        x = Math.floor(x);
        y = Math.floor(y);
        if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
            return;
        }
        const nx = Math.floor(x / 2);
        const ny = Math.floor(y / 4);
        const coord = nx + (this.width / 2) * ny;
        const color = this.color2ANSICode(rgb);
        target[coord] = color || 0;
    }

    public color2ANSICode(rgb: Color | undefined): number | undefined {
        return color2ANSICode(rgb, this.options.colorMode);
    }

    public set(x: number, y: number) {
        const [coord, mask] = this.mask(x, y);
        if (this.pixelBuffer && coord !== undefined) this.pixelBuffer[coord] |= mask || 0;
    }
    public unset(x: number, y: number) {
        const [coord, mask] = this.mask(x, y);
        if (this.pixelBuffer && coord !== undefined) this.pixelBuffer[coord] &= ~(mask || 0);
    }
    public toggle(x: number, y: number) {
        const [coord, mask] = this.mask(x, y);
        if (this.pixelBuffer && coord !== undefined) this.pixelBuffer[coord] ^= mask || 0;
    }

    private mask(x: number, y: number): [number | undefined, number | undefined] {
        x = Math.floor(x);
        y = Math.floor(y);
        if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
            return [undefined, undefined];
        }
        const nx = Math.floor(x / 2);
        const ny = Math.floor(y / 4);
        const coord = nx + (this.width / 2) * ny;
        const mask = map[y % 4][x % 2];
        return [coord, mask];
    };

    frame(delimiter = '\n'): string {
        const frameWidth = this.width / 2;
        let lastColor = -1;
        let lastBgColor = -1;
        let result = this.pixelBuffer?.reduce((accumulate: string[], currentCharacter: number, index: number) => {
            if (index % frameWidth === 0 && index > 0) {
                if (lastColor != 0 || lastBgColor != 0) {
                    accumulate.push("\x1b[0m");
                    lastColor = -1;
                    lastBgColor = -1;
                }
                accumulate.push(delimiter);
            }
            const color = this.fgBuffer?.[index] || 0;
            if (color != lastColor) {
                lastColor = color || 0;
                accumulate.push(colorCodeToANSIString(color, false));
            }
            if (this.options.useBackground) {
                const bgcolor = this.bgBuffer?.[index] || 0;
                if (bgcolor != lastBgColor) {
                    lastBgColor = bgcolor || 0;
                    console.log(bgcolor);
                    accumulate.push(colorCodeToANSIString(bgcolor, true));
                }
            }
            if (this.textContent && this.textContent[index] > 0) {
                accumulate.push(String.fromCharCode(this.textContent[index]));

            } else {
                accumulate.push(currentCharacter ? String.fromCharCode(0x2800 + currentCharacter) : ' ');
            }
            return accumulate;
        }, []);
        if (lastColor != 0 || lastBgColor != 0) {
            result?.push(resetANSIString());
            lastColor = -1;
            lastBgColor = -1;
        }
        // result.push(delimiter);
        return result?.join('') || "";
    }
}

export default FastCanvas;
