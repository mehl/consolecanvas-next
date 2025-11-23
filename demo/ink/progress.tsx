import React from "react";
import { render, Text, Box } from "ink";
import { Progress } from "../../src/components/Progress";
import { InkCanvas } from "../../src/components/InkCanvas";

const App = () => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 100);

        return () => clearInterval(interval);
    }, []);

    const border = {
        borderStyle: 'round',
        borderColor: 'cyan',
    };

    return (
        <Box flexDirection="column" padding={1} gap={1}>
            <Text>Progress Component Demo</Text>
            <Box flexDirection="row" gap={2}>
                <Box {...border}>
                    <Progress progress={progress} />
                </Box>
                <Box {...border} flexGrow={1} padding={1} justifyContent="center" alignItems="center">
                    <Text>Testing canvas component for ink.</Text>
                </Box>
                <Box {...border}>
                    <InkCanvas width={10} height={5}>
                        {(canvas) => {
                            const ctx = canvas.getContext("2d");
                            ctx.fillStyle = "magenta";
                            ctx.fillRect(0, 0, ctx.width, ctx.height);
                        }}
                    </InkCanvas>
                </Box>
                <Box {...border}>
                    <InkCanvas width={19} height={5} adjustToSize>
                        {(canvas) => {
                            const ctx = canvas.getContext("2d");
                            ctx.fillStyle = "yellow";
                            ctx.fillRect(0, 0, ctx.width, ctx.height);
                        }}
                    </InkCanvas>
                </Box>
            </Box>
        </Box>
    );
};

render(<App />);