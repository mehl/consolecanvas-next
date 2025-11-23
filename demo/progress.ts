import { progressRenderer } from "../src/components/progressRenderer";
import { Context, ColorMode, FastCanvas, AnsiColor, AnimationHelper } from "../src/index";

const canvas = new FastCanvas(36, 36, { colorMode: ColorMode.ANSI16 });
const progress = progressRenderer(canvas, {
    color: AnsiColor.BRIGHT_CYAN,
    thickness: 4,
});
const animator = new AnimationHelper(canvas, { endWithNewline: true });

(async () => {
    for (let i = 1; i <= 100; i++) {
        progress.render({ progressPercent: i });
        animator.renderFrame();
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    animator.clear();
})();
