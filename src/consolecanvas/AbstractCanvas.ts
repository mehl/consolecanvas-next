import { Canvas } from "./Canvas";
import { Color } from "./Color";
import Context from "./Context";

abstract class AbstractCanvas implements Canvas {

    protected _width: number | undefined;
    protected _height: number | undefined;

    protected textContent: Int32Array | undefined;

    blockSize: { x: number, y: number; };

    constructor(blockX: number, blockY: number) {
        this.blockSize = { x: blockX, y: blockY };
    }

    get maxWidth(): number {
        const width = typeof process !== "undefined" ? process?.stdout?.columns : undefined;
        return (width || 40) * this.blockSize.x;
    }

    get maxHeight(): number {
        const height = typeof process !== "undefined" ? process?.stdout?.rows : undefined;
        return (height || 20) * this.blockSize.y;
    }

    get width() {
        return this._width || 0;
    }
    set width(width: number) {
        this._width = Math.floor(width / this.blockSize.x) * this.blockSize.x;
        this.initBuffers();
        this.clear();
    }

    get height() {
        return this._height || 0;
    }
    set height(height: number) {
        this._height = Math.floor(height / 4) * 4;
        this.initBuffers();
        this.clear();
    }

    protected initBuffers() {
        const bufferLength = (this.width * this.height) / this.blockSize.x / this.blockSize.y;
        this.textContent = new Int32Array(bufferLength);
    };

    clear() {
        this.textContent?.fill(0);

    }

    abstract setPixel(x: number, y: number, rgb: Color | undefined): void;
    abstract setBgPixel(x: number, y: number, rgb: Color | undefined): void;
    clearPixel(x: number, y: number) {
        this.setPixel(x, y, undefined);
        this.setBgPixel(x, y, undefined);
    }

    setCharacter(x: number, y: number, character: string, fg: Color | undefined, bg: Color | undefined) {
        try {
            const coord = this.toBlockIndex(x, y);
            if (this.textContent) this.textContent[coord] = character ? character.charCodeAt(0) : 0;
        } catch (e) {
            // Out of bounds
        }
    }

    abstract frame(delimiter: string): string;

    protected toBlockCoord(x: number, y: number): [number, number] {
        if (!(x >= 0 && x < this.width && y >= 0 && y < this.height)) {
            throw new Error("out of bounds");
        }
        return [Math.floor(x / this.blockSize.x), Math.floor(y / this.blockSize.y)];
    }

    protected toBlockIndex(x: number, y: number): number {
        const [nx, ny] = this.toBlockCoord(x, y);
        return nx + ny * this.width / this.blockSize.x;
    }

    toString(): string {
        // Getting system line delimiter would give us a hard dependency on os module. Don't want that.
        const delimiter = "\n";
        return this.frame(delimiter);
    }

    getContext(): Context {
        return new Context(this);
    }
}
export default AbstractCanvas;
