import { Context, SmoothCanvas, ColorMode, AnimationHelper, DrawMode } from "../src/index";


const canvas = new SmoothCanvas(undefined, undefined, { colorMode: ColorMode.TRUECOLOR });
const animate = new AnimationHelper(canvas);
const ctx: Context = canvas.getContext("2d");
ctx.drawMode = DrawMode.FILLBG_STROKEFG;
ctx.strokeStyle = "#ffffff";
ctx.fillStyle = "rgb(50,100,100)";
// Testing transformations
(async () => {
    for (var i = 0; i <= 360; i += 1) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgb(50,100,100)";
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(i / 180 * Math.PI);
        ctx.scale(.5 + i / 180, .5 + i / 180);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        ctx.beginPath();
        ctx.moveTo(10, 10);
        ctx.lineTo(10, canvas.height - 10);
        ctx.lineTo(canvas.width - 10, canvas.height - 10);
        ctx.lineTo(canvas.width - 10, 10);
        ctx.closePath();
        ctx.stroke();

        ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
        ctx.restore();
        animate.renderFrame();
        await new Promise(r => setTimeout(r, 10));
    }
})();