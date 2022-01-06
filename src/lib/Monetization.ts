import UserPreferences from "./UserPreferences.js";
import MonetizationCapabilities from "./MonetizationCapabilities.js";
import type { Result } from "./MonetizationCapabilities.js";
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
	 * Find matches between user preferences (one that user says they can
	 * support), user's capabilities (one that user actually supports) and the
	 * capabilities defined by site (i.e., site preferences).
	 */
	async match(
		options: DetectOptions = {},
	): Promise<{ capability: Capability; details?: unknown }[]> {
		const capabilities = this.getUserAcceptableCapabilites();
		const detectedCapabilities = await Promise.all(
			capabilities.map(capability => this.#tryDetect(capability, options)),
		);
		const result = [];
		for (let i = 0; i < capabilities.length; i++) {
			const res = detectedCapabilities[i];
			if (res && res.isSupported) {
				result.push({ capability: capabilities[i], details: res.details });
			}
		}
		return result;
	}

	async #tryDetect(capability: Capability, options: DetectOptions) {
		try {
			return await this.detect(capability, options);
		} catch (error) {
			console.error(error);
		}
	}

	/**
	 * Find matches between user preferences, and site preferences.
	 */
	getUserAcceptableCapabilites() {
		const siteCapabilities = this.#capabilities.list();
		return siteCapabilities.filter(cap => !this.#userPreferences.denies(cap));
	}

	clearCache() {
		return this.#capabilities.clearCache();
	}

	/**
	 * Check whether the user supports given capability.
	 */
	detect(capability: Capability, options: DetectOptions = {}) {
		if (!capability) {
			throw new TypeError(
				`Failed to execute 'detect' on 'Monetization': first argument 'capability' is required.`,
			);
		}
		if (!this.#capabilities.has(capability)) {
			throw new Error(`Unrecognized capability: ${capability}`);
		}

		return this.#capabilities.detect(capability, options);
	}
}
