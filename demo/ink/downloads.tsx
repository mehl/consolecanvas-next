import React, { useState, useEffect } from 'react';
import { Box, render, Text } from 'ink';
import { InkCanvas } from '../../src/components/InkCanvas';

const baseUrl = "https://api.npmjs.org/downloads/range/{from}:{to}/{package}";
const fromDate = "2023-01-01";
const toDate = new Date().toISOString().slice(0, 10);

const Counter = () => {
    const [data, setData] = useState(null);
    const [packageName, setPackageName] = useState("ink");

    useEffect(() => {
        (async () => {
            const data = await fetch(baseUrl.replace("{from}", fromDate).replace("{to}", toDate).replace("{package}", packageName));
            const json = await data.json();
            // console.log(json);
            setData(json);
        })();
    }, [packageName]);

    const maxDownloads = React.useMemo(() => {
        if (!data) return 0;
        return Math.max(...data.downloads.map(d => d.downloads));
    }, [data]);

    return <Box flexDirection="column" borderStyle="round" borderColor="cyan">
        <Text color="white">{packageName} downloads over time - {maxDownloads} max. per day</Text>
        <Box>
            {data &&
                <InkCanvas width={60} height={15} adjustToSize={true} smooth>
                    {(canvas) => {
                        const ctx = canvas.getContext("2d");
                        for (var x = 0; x < canvas.width; x++) {
                            const index = Math.floor((x / canvas.width) * (data ? data.downloads.length : 1));
                            const downloadCount = data ? data.downloads[index].downloads : 0;
                            const y = canvas.height - Math.floor((downloadCount / maxDownloads) * canvas.height); // assuming max 1000 downloads for scaling
                            const intensity = Math.floor((downloadCount / maxDownloads) * 255);
                            ctx.fillStyle = [255, intensity, 0];
                            ctx.fillRect(x, y, 1, canvas.height - y);
                        }
                    }}
                </InkCanvas>
            }
        </Box>
    </Box>;
};

render(<Counter />);
