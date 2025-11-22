import { Context, SmoothCanvas, ColorMode } from "../src/index";

const canvas = new SmoothCanvas(90, 30, { colorMode: ColorMode.TRUECOLOR });
const ctx: Context = canvas.getContext("2d");

for (let x = 0; x < ctx.width; x++) {
    for (let y = 0; y < ctx.height; y++) {
        const r = Math.floor((x / ctx.width) * 255);
        const g = Math.floor((y / ctx.height) * 255);
        const b = 150;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b})`;
        ctx.strokeRect(x, y, 1, 1);
    }
}

ctx.fillStyle = 'white';
const text = 'Hello, World!';
const bounds = ctx.measureText(text);
ctx.fillText(text, (canvas.width - bounds.width) / 2, canvas.height / 2);

console.log(canvas.toString());
