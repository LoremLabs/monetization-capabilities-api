import UserPreferences from "./UserPreferences.js";
import MonetizationCapabilities from "./MonetizationCapabilities.js";
import type { Capability } from "./MonetizationCapabilities.js";

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
	async match(): Promise<Capability[]> {
		const userPreferences = this.#userPreferences;
		const sitePreferences = this.#capabilities.list();
		return [...userPreferences.get().prefers]; // TODO
	}

	clearCache() {
		return this.#capabilities.clearCache();
	}

	get(capability: Capability, { bypassCache = false } = {}) {
		if (!capability) {
			throw new TypeError(
				`Failed to execute 'get' on 'Monetization': 1 argument required, but only 0 present.`,
			);
		}
		if (!this.#capabilities.has(capability)) {
			throw new Error(`Unrecognized capability: ${capability}`);
		}

		return this.#capabilities.get(capability, { bypassCache });
	}
}
