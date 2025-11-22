import { defineConfig } from "tsup";

export default defineConfig([
    {
        entry: { index: "src/index.ts" },
        format: ["esm", "cjs"],
        dts: true,
        outDir: "dist",
        clean: true
    },
    {
        entry: {
            "hello_world": "demo/hello_world.ts",
            "drawmodes": "demo/drawmodes.ts"
        },
        format: ["esm"],
        outDir: "dist_demo"
    }
]);
