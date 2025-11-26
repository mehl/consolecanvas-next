import { $Font, Font, Props } from "bdfparser";
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
        const font = await $Font(readlineIter(fontFile));
        this.fonts[fontFile] = font;
        return fontFile;
    }

    getFont(fontFileName: string): Font | undefined {
        return this.fonts[fontFileName];
    }

    getFontProperties(fontFileName: string): Props | undefined {
        return this.fonts[fontFileName]?.props;
    }
}

export const globalFontManager = new FontManager();