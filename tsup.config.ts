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
            "drawmodes": "demo/drawmodes.ts",
            "progress": "demo/progress.ts",
            "shapes": "demo/shapes.ts",
            "bdf_fonts": "demo/bdf_fonts.ts",
            "combined": "demo/combined.ts",
            "ink/progress": "demo/ink/progress.tsx",
            "ink/downloads": "demo/ink/downloads.tsx"
        },
        format: ["esm"],
        outDir: "dist_demo"
    }
]);
