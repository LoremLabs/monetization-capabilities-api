import * as path from "path";
import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";

const isDev = !!process.env.ROLLUP_WATCH;

function getConfig(input: `src/${string}.ts`, name: string) {
	const baseDir = path.dirname(path.relative("src", input));
	const legacyDir = path.join("build", "legacy", baseDir);
	const modernDir = path.join("build", baseDir);

	return [
		defineConfig({
			input,
			output: { dir: modernDir, format: "es", sourcemap: true },
			plugins: [typescript({ target: "ES2020", sourceMap: true })],
		}),
		defineConfig({
			input,
			output: { dir: legacyDir, format: "umd", name, sourcemap: true },
			plugins: [typescript({ target: "ES2015", sourceMap: true })],
		}),
		defineConfig({
			input,
			output: { dir: modernDir, format: "es" },
			plugins: [dts()],
		}),
	];
}

export default [
	getConfig("src/index.ts", "Monetization"),
	getConfig("src/plugins/webmonetization.ts", "PluginWebMonetization"),
].flat();
