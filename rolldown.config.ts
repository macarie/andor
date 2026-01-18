import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
	input: "source/index.ts",
	plugins: [dts({ oxc: true })],
	output: {
		cleanDir: true,
		dir: "dist",
		format: "esm",
	},
});
