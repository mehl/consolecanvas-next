import { Color } from "./Color";
import Context from "./Context";

export interface Canvas {
    width: number;
    height: number;

    blockSize: { x: number, y: number; };

    clear(): void;
    setPixel(x: number, y: number, rgb: Color | undefined): void;
    setBgPixel(x: number, y: number, rgb: Color | undefined): void;
    clearPixel(x: number, y: number): void;
    setCharacter(x: number, y: number, character: string, fg: Color | undefined, bg: Color | undefined): void;
    frame(delimiter: string): string;

    getContext(mode: "2d"): Context;
}

