import React from "react";
import { render, Text, Box } from "ink";
import { Progress } from "../../src/components/Progress";

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
        <Box>
            <Text>Progress Component Demo</Text>
            <Box {...border}>
                <Progress progress={progress} />
            </Box>
        </Box>
    );
};

render(<App />);