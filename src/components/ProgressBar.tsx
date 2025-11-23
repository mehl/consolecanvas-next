import { InkCanvas } from "./InkCanvas";
import { Canvas } from "../consolecanvas/Canvas";


export const ProgressBar = ({ progress, ...restProps }: {
    progress: number;
    [key: string]: any;
}) => {
    return <InkCanvas width={18} height={1} adjustToSize smooth {...restProps}>
        {(canvas: Canvas) => {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, ctx.width, ctx.height);
            for (var i = 0; i < ctx.width * progress; i++) {
                ctx.fillStyle = `rgb(60,${Math.floor(i * 255 / (ctx.width))},100)`;
                ctx.fillRect(i, 1, 1, ctx.height - 3);
            }
            const text = `${Math.round(progress * 100)}%`;
            ctx.fillStyle = "white";
            const measure = ctx.measureText(text);
            ctx.fillText(text, Math.max(ctx.width * progress - measure.width - ctx.canvas.blockSize.x * 2, 0), Math.ceil(ctx.height / 2 + .5));
        }}
    </InkCanvas>;
};