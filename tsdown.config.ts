import { defineConfig } from "tsdown";

export default defineConfig({
	platform: "neutral",
	dts: true,
	exports: true,
	noExternal: ["@xyflow/react/dist/style.css"],
	css: {
		inject: false,
	},
});
