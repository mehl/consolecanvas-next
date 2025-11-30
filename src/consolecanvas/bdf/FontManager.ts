import { type Font, type Props } from "bdfparser";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

function readlineIter(path: string): AsyncIterableIterator<string> {
    const stream = fs.createReadStream(path, "utf8");
    const rl = readline.createInterface({ input: stream });

    return rl[Symbol.asyncIterator]() as AsyncIterableIterator<string>;
}

export class FontManager {

    private fonts: Record<string, Font> = {};


    async addFontDirectory(directory: string) {
        const files = await fs.promises.readdir(directory);
        for (var file of files) {
            if (!file?.endsWith(".bdf")) continue;
            await this.addFont(path.join(directory, file));
        }
    }

    listFonts() {
        return Object.keys(this.fonts).sort();
    }

    async addFont(fontFile: string) {
        let $font: any;
        try {
            $font = await import("bdfparser").then(m => m.$Font);
        } catch (e) {
            console.error("Package \x1b[91mbdfparser\x1b[0m missing. Make sure it is installed if you want to use fonts.");
            return "";
        }
        try {
            const font = await $font(readlineIter(fontFile));
            this.fonts[fontFile] = font;
            return fontFile;
        } catch (e) {
            console.error(`Error loading font ${fontFile}: ${e}`);
            return "";
        }
    }

    getFont(fontFileName: string): Font | undefined {
        return this.fonts[fontFileName];
    }

    getFontProperties(fontFileName: string): Props | undefined {
        return this.fonts[fontFileName]?.props;
    }
}

export const globalFontManager = new FontManager();