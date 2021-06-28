import UserPreferences from "./UserPreferences.js";
import MonetizationCapabilities from "./MonetizationCapabilities.js";
import type { Capability, DetectOptions } from "./MonetizationCapabilities.js";

export default class Monetization {
	#userPreferences = new UserPreferences();
	#capabilities = new MonetizationCapabilities();

	get userPreferences() {
		return this.#userPreferences;
	}

	get capabilities() {
		return this.#capabilities;
	}

	/**
	 * Find matches between user preferences, user's capabilities and the
	 * capabilities defined by site (i.e., site preferences).
	 */
	async match(
		options: DetectOptions = {},
	): Promise<{ capability: Capability; details?: unknown }[]> {
		const capabilities = this.getUserAcceptableCapabilites();
		const detectedCapabilities = await Promise.all(
			capabilities.map(async capability => {
				try {
					const result = await this.detect(capability, options);
					if (result?.isSupported) {
						return result;
					}
				} catch (error) {
					console.error(error);
				}
			}),
		);
		return detectedCapabilities
			.filter(<T>(res: T | null | undefined): res is T => !!res)
			.map((res, i) => ({
				capability: capabilities[i],
				details: res.details,
			}));
	}

	getUserAcceptableCapabilites() {
		const siteCapabilities = this.#capabilities.list();
		return siteCapabilities.filter(cap => !this.#userPreferences.denies(cap));
	}

	clearCache() {
		return this.#capabilities.clearCache();
	}

	detect(capability: Capability, options: DetectOptions = {}) {
		if (!capability) {
			throw new TypeError(
				`Failed to execute 'get' on 'Monetization': 1 argument required, but only 0 present.`,
			);
		}
		if (!this.#capabilities.has(capability)) {
			throw new Error(`Unrecognized capability: ${capability}`);
		}

		return this.#capabilities.detect(capability, options);
	}
}
