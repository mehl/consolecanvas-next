import { globalFontManager } from "../src/consolecanvas/bdf/FontManager";
import { Context, SmoothCanvas, ColorMode } from "../src/index";

(async () => {
    await globalFontManager.addFontDirectory("./demo/bdf-fonts");

    const allFonts = globalFontManager.listFonts();
    for (var font of allFonts) {
        console.log(font);
        // const font = await globalFontManager.addFont("./demo/bdf-fonts/peep-10x20.bdf");

        const canvas = new SmoothCanvas(180, 30, { colorMode: ColorMode.TRUECOLOR });
        const ctx: Context = canvas.getContext("2d");

        ctx.fillStyle = 'green';
        ctx.font = font;
        const props = globalFontManager.getFontProperties(font);
        const text = props?.font_name || props?.family_name || "Hello!";
        const bounds = ctx.measureText(text);
        const height = ctx.fontSize;
        console.log(height);
        canvas.width = Math.min(Math.floor(bounds.width + 1), canvas.maxWidth);
        canvas.height = Math.min(Math.floor(height + 3), canvas.maxHeight) + 2;
        ctx.fillText(text, (canvas.width - bounds.width) / 2, (canvas.height - height) / 2 + bounds.alphabeticBaseline);
        // ctx.fillRect(0, (canvas.height - height) / 2 + bounds.alphabeticBaseline, 100, 1);
        // ctx.fillRect(0, (canvas.height - height) / 2, 100, 1);
        console.log(canvas.toString());
    }
})();