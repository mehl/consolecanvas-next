import React, { useEffect, useState } from "react";
import { Box, Text, measureElement } from "ink";
import FastCanvas from "../consolecanvas/FastCanvas";
import { progressRenderer } from "./progressRenderer";
import BlockCanvas from "../consolecanvas/BlockCanvas";
import SmoothCanvas from "../consolecanvas/SmoothCanvas";
import { ColorMode } from "../consolecanvas/Color";

export const Progress = ({ progress, ...restProps }: {
    progress: number;
    [key: string]: any;
}) => {
    const boxRef = React.useRef(null);
    const [size, setSize] = React.useState({ width: 0, height: 0 });
    const CanvasClass = SmoothCanvas;
    const rendering = React.useMemo(() => {
        const canvas = new CanvasClass(size.width * CanvasClass.BLOCKSIZE.x, size.height * CanvasClass.BLOCKSIZE.y, {
            colorMode: ColorMode.ANSI256
        });
        const progress = progressRenderer(canvas, {
            color: [255, 255, 255],
            inactiveColor: [0, 0, 0],
            textColor: [255, 255, 255],
            thickness: 4,
        });
        return { canvas, progress };
    }, [size]);


    useEffect(() => {
        if (!boxRef.current) return;
        const measure = measureElement(boxRef?.current);
        setSize(measure);
    }, []);

    useEffect(() => {
        rendering.progress.render({ progressPercent: progress });
    }, [progress, rendering]);

    return <Box width={16} height={8} {...restProps} ref={boxRef}>
        <Text>{rendering.canvas.toString()}</Text>
    </Box>;
};