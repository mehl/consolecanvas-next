import React from "react";
import { Box, Text, measureElement } from "ink";
import FastCanvas from "../consolecanvas/FastCanvas";
import SmoothCanvas from "../consolecanvas/SmoothCanvas";
import { ColorMode } from "../consolecanvas/Color";

export const InkCanvas = ({ smooth, adjustToSize, children, width, height, ...restProps }: {
    smooth?: boolean;
    adjustToSize?: boolean;
    width?: number;
    height?: number;
    children?: (canvas: FastCanvas | SmoothCanvas) => void;
    [key: string]: any;
}) => {
    const boxRef = React.useRef(null);
    const [size, setSize] = React.useState({ width: 0, height: 0 });

    const canvas = React.useMemo(() => {
        const CanvasClass = smooth ? SmoothCanvas : FastCanvas;
        const mode = smooth ? ColorMode.TRUECOLOR : ColorMode.ANSI256;
        return new CanvasClass(size.width * CanvasClass.BLOCKSIZE.x, size.height * CanvasClass.BLOCKSIZE.y, {
            colorMode: mode
        });
    }, [size]);

    // Execute for each new render!
    React.useEffect(() => {
        if (!boxRef.current) return;
        const measure = measureElement(boxRef?.current);
        // console.log("Measuring canvas size...", measure, size);
        if (measure.width != size.width || measure.height != size.height) setSize(measure);
    });
    React.useEffect(() => {
        if (children) {
            children(canvas);
        }
    }, [canvas, children]);
    // Standard size is quite small!
    return <Box {...restProps} ref={adjustToSize ? boxRef : null}>
        <Box {...adjustToSize ?
            { minWidth: width || 32, height: height || 12, flexGrow: 1 }
            :
            { width: width || 32, height: height || 12, flexGrow: 0, ref: boxRef }
        }
        >
            <Text>{canvas.toString()}</Text>
        </Box>
    </Box>;
};