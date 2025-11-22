export enum AnsiColor {
    INVISIBLE = -1,
    BLACK = 0,
    RED = 1,
    GREEN = 2,
    YELLOW = 3,
    BLUE = 4,
    MAGENTA = 5,
    CYAN = 6,
    WHITE = 7,
    BRIGHT_BLACK = 8,
    BRIGHT_RED = 9,
    BRIGHT_GREEN = 10,
    BRIGHT_YELLOW = 11,
    BRIGHT_BLUE = 12,
    BRIGHT_MAGENTA = 13,
    BRIGHT_CYAN = 14,
    BRIGHT_WHITE = 15,
};

export enum ColorMode {
    ANSI16 = "ANSI16",
    ANSI256 = "ANSI256",
    TRUECOLOR = "TRUECOLOR"
};

export type RgbTripleColor = [number, number, number];
export type Color = AnsiColor | RgbTripleColor;

export function resetANSIString() {
    return "\x1b[0m";
}

export function color2ANSICode(color: Color | undefined, mode: ColorMode = ColorMode.TRUECOLOR): number {
    switch (mode) {
        case ColorMode.ANSI16:
            return colorToANSI16Code(color) ?? AnsiColor.INVISIBLE;
        case ColorMode.ANSI256:
            return colorToANSI256Code(color) ?? AnsiColor.INVISIBLE;
        case ColorMode.TRUECOLOR:
        default:
            // Truecolor does not use ANSI codes, so we fall back to 256-color codes.
            return colorToANSI256Code(color) ?? AnsiColor.INVISIBLE;
    }
}

export function color2ANSIString(color: Color | undefined, mode: ColorMode = ColorMode.TRUECOLOR, isBackground = false): string {
    switch (mode) {
        case ColorMode.ANSI16:
            const code16 = colorToANSI16Code(color);
            return colorCodeToANSIString(code16 ?? AnsiColor.INVISIBLE, isBackground);
        case ColorMode.ANSI256:
            const code256 = colorToANSI256Code(color);
            return colorCodeToANSIString(code256 ?? AnsiColor.INVISIBLE, isBackground);
        case ColorMode.TRUECOLOR:
        default:
            return rgbToANSITrueColorString(color, isBackground);
    }
}

/** Tries to convert a color to an ANSI 16-color code.
 * If the color is already an ANSI color code, it is returned as is.
 * 
 * @param color The color to convert
 * @returns ANSI 16-color code or undefined
 */
export function colorToANSI16Code(color: Color | undefined): number | undefined {
    if (color === undefined) return undefined;
    // Test if rgb is a AnsiColor
    if (typeof color === "number") {
        return color;
    }
    const isGray = Math.abs(color[0] - color[1]) < 64 && Math.abs(color[1] - color[2]) < 64;
    if (isGray) {
        const s = color[0] + color[1] + color[2];
        if (s < 80) return AnsiColor.BLACK;
        if (s < 150) return AnsiColor.BRIGHT_BLACK;
        if (s < 200) return AnsiColor.WHITE;
        return AnsiColor.BRIGHT_WHITE;
    }
    const bright = color[0] > 160 || color[1] > 160 || color[2] > 160;
    const mid = bright ? 160 : 64;
    const colorCode = (color[0] > mid ? 1 : 0) | (color[1] > mid ? 2 : 0) | (color[2] > mid ? 4 : 0) | (bright ? 8 : 0);
    return colorCode;
}

/**
 * Converts an RGB color to an ANSI 256 color code. These codes are quite special; normally a terminal that supports 256 colors
 * will also support true color.
 * 
 * @param color RGB color to convert
 * @returns ANSI 256 color code or undefined
 */
export function colorToANSI256Code(color: Color | undefined): number | undefined {
    if (color === undefined) return undefined;
    if (typeof color === "number") {
        return color; // Already an ANSI color code
    }
    const colorCode = (Math.floor(color[0] / 50) * 36 + Math.floor(color[1] / 50) * 6 + Math.floor(color[2] / 50)) + 16;
    return colorCode;
}

/**
 * Encodes an ANSI color code to an ANSI escape string. The normal color codes (0-15) and 256 colors are supported.
 * 
 * @param colorCode Number representing the ANSI color code. -1 for invisible (reset).
 * @param isBackground  Whether the color is for background (true) or foreground (false).
 * @returns  ANSI escape string for the color.
 */
export function colorCodeToANSIString(colorCode: number, isBackground = false): string {
    const [pReset, pNormal, pBright, p256] = (isBackground) ? ["49", "4", "10", "48;5;"] : ["39", "3", "9", "38;5;"];
    if (colorCode == AnsiColor.INVISIBLE || colorCode === undefined) return "\x1b[" + pReset + "m";
    if (colorCode < 8) return "\x1b[" + pNormal + colorCode + "m";
    if (colorCode < 16) return "\x1b[" + pBright + (colorCode - 8) + "m";
    // The 256-color range is just an extension of the normal colors.
    return "\x1b[" + p256 + colorCode + "m";
}

/**
 * Converts a color to an ANSI 256 color code.
 *
 * @param color RGB color or ANSI color code to convert
 * @param isBackground Whether the color is for background (true) or foreground (false).
 * @returns ANSI escape string for the color.
 */
export function rgbToANSI256String(color: Color | undefined, isBackground = false): string {
    const colorCode = colorToANSI256Code(color);
    if (colorCode === undefined) return "\x1b[49m"; // Default background
    return colorCodeToANSIString(colorCode, isBackground);
    // if (isBackground) return (color === undefined) ? "\x1b[49m" : "\x1b[48;5;" + color + "m";
    // return (color === undefined) ? "\x1b[39m" : "\x1b[38;5;" + color + "m";
}

/**
 * Converts an RGB color to an ANSI true color escape string.
 * @param color RGB color to convert. Can be also an ANSI color code.
 * @param isBackground Whether the color is for background (true) or foreground (false).
 * @returns ANSI escape string for the color.
 */
export function rgbToANSITrueColorString(color: Color | undefined, isBackground = false): string {
    if (color === undefined) return isBackground ? "\x1b[49m" : "\x1b[39m";
    if (typeof color === "number") return colorCodeToANSIString(color, isBackground);
    if (isBackground) return (color === undefined) ? "\x1b[49m" : "\x1b[48;2;" + color.join(";") + "m";
    return (color === undefined) ? "\x1b[39m" : "\x1b[38;2;" + color.join(";") + "m";
}