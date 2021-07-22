import * as path from "path";
import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const isDev = !!process.env.ROLLUP_WATCH;

function getConfig(input: `src/${string}.ts`, name: string) {
	const baseDir = path.dirname(path.relative("src", input));
	const legacyDir = path.join("build", "legacy", baseDir);
	const modernDir = path.join("build", baseDir);

	return [
		defineConfig({
			input,
			output: { dir: modernDir, format: "es", sourcemap: true },
			plugins: [
				typescript({ target: "ES2020", sourceMap: true }),
				!isDev && terser({ format: { comments: false } }),
			],
		}),
		defineConfig({
			input,
			output: { dir: legacyDir, format: "umd", name },
			plugins: [
				typescript({ target: "ES2015" }),
				!isDev && terser({ format: { comments: false } }),
			],
		}),
	];
}

export default [
	getConfig("src/index.ts", "Monetization"),
	getConfig("src/plugins/webmonetization.ts", "PluginWebMonetization"),
].flat();
