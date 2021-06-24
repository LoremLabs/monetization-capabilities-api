// @ts-check
import path from "path";
import { defineConfig } from "rollup";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const isDev = !!process.env.ROLLUP_WATCH;

/**
 * @param {`src/${string}`} input
 * @param {string} name
 */
function getConfig(input, name) {
	const baseDir = path.dirname(path.relative("src", input));
	const legacyDir = path.join("build", "legacy", baseDir);
	const modernDir = path.join("build", baseDir);

	const configs = [
		defineConfig({
			input,
			output: { dir: modernDir, format: "es", sourcemap: true },
			plugins: [
				typescript({ target: "ES2020", sourceMap: true }),
				!isDev && terser({ format: { comments: false } }),
			],
		}),
	];

	if (!isDev) {
		configs.push(
			defineConfig({
				input,
				output: { dir: legacyDir, format: "iife", name },
				plugins: [
					typescript({ target: "ES2015" }),
					!isDev && terser({ format: { comments: false } }),
				],
			}),
		);
	}

	return configs;
}

export default [
	getConfig("src/index.ts", "Monetization"),
	getConfig("src/plugins/webmonetization.ts", "PluginWebMonetization"),
].flat();
