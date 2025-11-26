import React from "react";
import { Box, Text, measureElement } from "ink";
import FastCanvas from "../consolecanvas/FastCanvas";
import SmoothCanvas from "../consolecanvas/SmoothCanvas";
import { ColorMode } from "../consolecanvas/Color";

const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

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
    const [currentFrame, setCurrentFrame] = React.useState("");

    const canvas = React.useMemo(() => {
        const CanvasClass = smooth ? SmoothCanvas : FastCanvas;
        const mode = smooth ? ColorMode.TRUECOLOR : ColorMode.ANSI256;
        return new CanvasClass(size.width * CanvasClass.BLOCKSIZE.x, size.height * CanvasClass.BLOCKSIZE.y, {
            colorMode: mode
        });
    }, [size]);

    // Some weird race conditions can happen here if the resize events
    // happen too quickly in succession, so we debounce the remeasure function
    const remeasure = debounce(() => {
        if (!boxRef.current) return;
        const measure = measureElement(boxRef?.current);
        // console.log("Remeasuring canvas size...", measure, size);
        if (measure.width != size.width || measure.height != size.height) setSize(measure);
    }, 200);
    // Execute for each new render!
    React.useEffect(remeasure);

    React.useEffect(() => {
        if (children) {
            children(canvas);
            const frame = canvas.toString();
            if (frame != currentFrame) {
                setCurrentFrame(frame);
                // console.log("Frame updated");
            } else {
                // console.log("Frame unchanged");
            }
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
            <Text wrap="truncate">{currentFrame}</Text>
        </Box>
    </Box>;
};