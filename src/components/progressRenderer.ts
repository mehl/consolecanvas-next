import { Canvas } from "../consolecanvas/Canvas";
import { AnsiColor, Color } from "../consolecanvas/Color";
import Context, { DrawMode } from "../consolecanvas/Context";

export type ProgressOptions = {
    color?: Color;
    textColor?: Color;
    inactiveColor?: Color;
    thickness?: number;
};

const defaultOptions: ProgressOptions = {
    color: AnsiColor.BRIGHT_GREEN,
    textColor: AnsiColor.BRIGHT_WHITE,
    inactiveColor: AnsiColor.INVISIBLE,
    thickness: 3,
};
export const progressRenderer = (canvas: Canvas, options?: ProgressOptions) => {
    const ctx: Context = canvas.getContext("2d");
    ctx.drawMode = DrawMode.FOREGROUND;
    const aspectRatio = ctx.aspectRatio;
    const sizeX = canvas.width;
    const sizeY = canvas.height * aspectRatio;
    ctx.scale(1, 1 / aspectRatio);
    const thickness = options?.thickness || defaultOptions.thickness!;
    const color = options?.color || defaultOptions.color!;
    const textColor = options?.textColor || defaultOptions.textColor!;
    const inactiveColor = options?.inactiveColor || defaultOptions.inactiveColor!;
    const radiusX = sizeX / 2 - thickness;
    const radiusY = sizeY / 2 - thickness;
    const radius = Math.max(radiusX, radiusY);

    return {
        render(params: { progressPercent: number; }) {
            ctx.clearRect(0, 0, ctx.width, ctx.height);
            var dth = Math.abs(Math.acos(1 / radius) - Math.acos(2 / radius));
            for (let angle = 0; angle <= Math.PI * 2; angle += dth) {
                const rad = (angle - Math.PI / 2);

                if (angle <= (params.progressPercent / 100) * Math.PI * 2) {
                    ctx.strokeStyle = color;
                } else {
                    ctx.strokeStyle = inactiveColor;
                }
                for (let t = 0; t < thickness; t++) {
                    const x = Math.floor((sizeX - 1) / 2 + (radiusX + t) * Math.cos(rad));
                    const y = Math.floor((sizeY - 1) / 2 + (radiusY + t) * Math.sin(rad));
                    ctx.strokeRect(x, y, 1, 1);
                }
            }
            // ctx.clearRect(0, 0, ctx.width, ctx.height);
            // ctx.beginPath();
            // ctx.arc(sizeX / 2, sizeY / 2, Math.min(radiusX, radiusY) + thickness, -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * (params.progressPercent / 100)), false);
            // ctx.arc(sizeX / 2, sizeY / 2, Math.min(radiusX, radiusY), -Math.PI / 2, (-Math.PI / 2) + (2 * Math.PI * (params.progressPercent / 100)), true);
            // ctx.closePath();
            // ctx.fillStyle = color;
            // ctx.fill();
            ctx.fillStyle = textColor;
            const text = `${Math.round(params.progressPercent)}%`;
            const measure = ctx.measureText(text);
            ctx.fillText(text, Math.ceil((ctx.width - measure.width) / 2), Math.ceil(ctx.height / 2 + .5));
        }
    };
};
