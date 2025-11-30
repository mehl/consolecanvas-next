import type { Bitmap } from "bdfparser";
import Context from "../Context";
import { globalFontManager } from "./FontManager";


export class BdfText {

    context: Context;
    fontName: string;

    constructor(context: Context, fontName: string) {
        this.context = context;
        this.fontName = fontName;
    }


    measureText(text: string) {
        const font = globalFontManager.getFont(this.fontName);
        if (!font) return {} as TextMetrics;
        // console.log(font.props);
        const bitmap = font.draw(text);
        const ascent = parseInt(font.props.font_ascent ?? "0");
        const descent = parseInt(font.props.font_descent ?? "0");
        const xHeight = parseInt(font.props.x_height ?? "0");
        return {
            fontBoundingBoxAscent: ascent,
            actualBoundingBoxAscent: ascent,
            emHeightAscent: xHeight,
            fontBoundingBoxDescent: descent,
            actualBoundingBoxDescent: descent,
            actualBoundingBoxLeft: 0,
            actualBoundingBoxRight: 0,
            emHeightDescent: ascent,
            alphabeticBaseline: ascent,
            hangingBaseline: ascent,
            ideographicBaseline: ascent,
            width: bitmap.width(),
            height: bitmap.height()
        } as TextMetrics;
    }
    drawText(text: string, x: number, y: number, align: string, fill: boolean) {
        const font = globalFontManager.getFont(this.fontName);
        if (!font) return;
        const bitmap = font.draw(text);
        if (align == "right") {
            x = x - this.measureText(text)?.width;
        }
        if (align == "center") {
            x = x - this.measureText(text)?.width / 2;
        }
        // Baseline correction
        const ascent = parseInt(font.props.font_ascent ?? "0");
        this.draw2canvas(bitmap, this.context, x, y - ascent, fill);
    }

    draw2canvas(bitmap: Bitmap, context: Context, xStart: number, yStart: number, fill: boolean) {
        bitmap.todata(2).forEach((line, y) => {
            line.forEach((pixel, x) => {
                if (pixel == 1 || pixel == 2) {
                    if (fill) {
                        context.fillRect(xStart + x, yStart + y, 1, 1);
                    } else {
                        context.strokeRect(xStart + x, yStart + y, 1, 1);
                    }
                }
            });
        });
    }
}