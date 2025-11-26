import { globalFontManager } from "../src/consolecanvas/bdf/FontManager";
import { Context, SmoothCanvas, ColorMode, DrawMode, AnimationHelper } from "../src/index";

(async () => {
    //    const logoFont = await globalFontManager.addFont("./demo/bdf-fonts/logisoso46.bdf");
    const logoFont = await globalFontManager.addFont("./demo/bdf-fonts/spleen-32x64.bdf");
    const textFont = await globalFontManager.addFont("./demo/bdf-fonts/spleen-16x32.bdf");
    // const textFont = await globalFontManager.addFont("./demo/bdf-fonts/peep-10x20.bdf");
    const canvas = new SmoothCanvas(undefined, undefined, { colorMode: ColorMode.TRUECOLOR });
    const anim = new AnimationHelper(canvas, { endWithNewline: false });
    const ctx: Context = canvas.getContext("2d");
    let y = -50;
    while (true) {
        ctx.drawMode = DrawMode.FILLBG_STROKEFG;
        ctx.clear();
        ctx.font = logoFont;
        ctx.strokeStyle = "steelblue";
        ctx.textAlign = "left";
        ctx.strokeText("console", 0, 30 + y);
        ctx.strokeStyle = "aquamarine";
        ctx.textAlign = "right";
        ctx.strokeText("canvas", canvas.width, 60 + y);
        ctx.font = textFont;
        ctx.strokeStyle = "gold";
        ctx.textAlign = "center";
        ctx.strokeText("next", canvas.width / 2, 80 + y);
        anim.renderFrame();
        await new Promise((a) => setTimeout(a, 20));
        y++;
        if (y > canvas.height - 120) break;
    }
})();