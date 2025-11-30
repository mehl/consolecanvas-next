#!/usr/bin/env node
import React, { useEffect, useMemo, useState } from "react";
import { render, Text, Box } from "ink";
import TextInput from "ink-text-input";
import SelectInput from "ink-select-input";
import { execSync } from "node:child_process";
import fs from "node:fs";
import { AnsiColor, InkCanvas } from "../src";
import { globalFontManager } from "../src/consolecanvas/bdf/FontManager";

function getInfo() {
    const result = execSync("npm info --json", { encoding: "utf8" }).trim();
    return JSON.parse(result);
}

function getLocalVersion() {
    const result = execSync("npm version --json", { encoding: "utf8" }).trim();
    return JSON.parse(result);
}

function run(cmd: string) {
    execSync(cmd, { stdio: "inherit" });
}

const Em = ({ children }: { children: React.ReactNode; }) => (
    <Text color="cyanBright">{children}</Text>
);

const Warn = ({ children }: { children: React.ReactNode; }) => (
    <Text color="yellowBright">{children}</Text>
);

const font = await globalFontManager.addFont("./demo/bdf-fonts/spleen-8x16.bdf");

const Layout = ({ children, name }: { children: React.ReactNode; name: string; }) => (
    <Box padding={1} borderStyle="round" borderColor="cyanBright" flexDirection="column" gap={1}>
        <InkCanvas width={30} height={3} adjustToSize>
            {(canvas) => {
                const ctx = canvas.getContext("2d");
                ctx.clear();
                ctx.fillStyle = AnsiColor.BRIGHT_CYAN;
                ctx.font = font;
                ctx.fillText(name, 0, 10);
            }}
        </InkCanvas>
        {children}
    </Box>
);

const Done = () => (
    <InkCanvas width={30} height={3} adjustToSize>
        {(canvas) => {
            const ctx = canvas.getContext("2d");
            ctx.clear();
            ctx.fillStyle = AnsiColor.BRIGHT_GREEN;
            ctx.font = font;
            ctx.fillText("Done!", 0, 10);
        }}
    </InkCanvas>
);

const Section = ({ children }: { children: React.ReactNode; }) => (
    <Box flexDirection="column" gap={0}>
        {children}
    </Box>
);

async function* publish(version: string, bumpVersion: boolean, doTag: boolean) {
    const run = async (cmd: string, ...args: string[]) => {
        return execSync([cmd, ...args].join(" "), { encoding: "utf8" });
    };

    yield { type: "step", msg: `Version: ${version}`, progress: .2 };
    if (bumpVersion) {
        await run("npm", "version", version, "--no-git-tag-version");
    }

    if (doTag) {
        yield { type: "step", msg: "Git commit + tag", progress: .4 };
        await run("git", "add", "package.json");
        await run("git", "commit", "-m", `"Release v${version}"`);
        await run("git", "tag", `v${version}`);
    }

    yield { type: "step", msg: "Build", progress: .5 };
    await run("npm", "run", "build");

    yield { type: "step", msg: "Pack", progress: .7 };
    await run("npm", "pack");

    const tgz = fs.readdirSync(".").find((f) => f.endsWith(".tgz"));
    if (!tgz || tgz.indexOf(version) < 0) throw new Error("No .tgz found");

    yield { type: "step", msg: `Publishing ${tgz}`, progress: 0.8 };
    run("npm", "publish", tgz, "--access", "public");

    yield { type: "step", msg: `Moving ${tgz} to releases/`, progress: 0.9 };
    fs.mkdirSync("releases", { recursive: true });
    fs.renameSync(tgz, `releases/${tgz}`);


    yield { type: "done", tgz, progress: 1.0 };
}

const App = () => {
    const info = useMemo(() => getInfo(), []);
    const localVersion = useMemo(() => getLocalVersion(), []);

    const [step, setStep] = useState<"version" | "tag" | "confirm" | "run" | "done">("version");
    const [events, setEvents] = useState<Array<any>>([]);
    const [version, setVersion] = useState(localVersion[info.name]);
    const [doTag, setDoTag] = useState(false);

    useEffect(() => {
        if (step !== "run") return;
        let canceled = false;
        const bumpVersion = version !== localVersion[info.name];
        (async () => {
            for await (const ev of publish(version, bumpVersion, doTag)) {
                if (canceled) break;
                setEvents((e) => [...e, ev]);
                await new Promise((res) => setTimeout(res, 100));
            }
            setStep("done");

        })();
        return () => { canceled = true; };
    }, [step]);

    const progress = <Section>
        {events.map((ev, i) => {
            if (ev.type === "step") {
                return <Text key={i}>- {ev.msg}</Text>;
            } else if (ev.type === "done") {
                return <Text key={i}>- Published package: <Em>{ev.tgz}</Em></Text>;
            }
        })}
    </Section>;

    return <Layout name={info.name + " " + (version || info.version)}>
        {step === "version" &&
            <>
                <Text>Current Version published:     <Em>{info.version}</Em></Text>
                <Text>Local Version in package.json: <Em>{localVersion[info.name]}</Em></Text>
                <Section>
                    <Text>New version:</Text>
                    <TextInput
                        value={version}
                        onChange={setVersion}
                        onSubmit={() => setStep("tag")}
                    />
                </Section>
            </>
        }

        {step === "tag" &&
            <>
                <Text>Create Git tag?</Text>
                <SelectInput
                    items={[
                        { label: "Yes", value: true },
                        { label: "No", value: false }
                    ]}
                    initialIndex={1}
                    onSelect={(item) => {
                        setDoTag(item.value as boolean);
                        setStep("confirm");
                    }}
                />
            </>
        }

        {step === "confirm" &&
            <>
                <Text>
                    Version currently published: <Em>{info.version}</Em>
                </Text>
                <Text>
                    New version to pack:         <Em>{version}</Em>
                </Text>
                {version === localVersion[info.name] &&
                    <Em>... Same as current local version, no change ...</Em>
                }
                {version == info.version &&
                    <Warn>[[[[ Warning: Same as current published version ]]]]</Warn>
                }
                <Text>
                    Create Git Tag:              <Em>{doTag ? "Yes" : "No"}</Em>
                </Text>
                <Text></Text>
                <Text>Everything ready for release?</Text>
                <SelectInput
                    items={[
                        { label: "Yes", value: true },
                        { label: "No", value: false }
                    ]}
                    onSelect={(item) => {
                        if (item.value) {
                            setStep("run");
                        } else {
                            setStep("version");
                        }
                    }}
                />
            </>
        }

        {step === "run" &&
            <>
                <Text>Publishing...</Text>
                {progress}
            </>
        }

        {step === "done" &&
            <>
                {progress}
                <Done />
            </>
        }
    </Layout>;
};

render(<App />);