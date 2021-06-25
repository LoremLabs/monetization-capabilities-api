import Cache from "./lib/Cache.js";
import UserPreferences from "./lib/UserPreferences.js";

export type Capability = `${string}/${string}`;
export type Result = { isSupported: boolean; details?: unknown };
export type Test = () => Promise<Result>;
export type Plugin = [name: Capability, test: Test];

interface Options {
	useCache?: boolean;
}

export default class Monetization {
	static UserPreferences = new UserPreferences();

	#cache: Cache;
	#capabilities = new Map<Capability, () => ReturnType<Test>>();

	constructor({ useCache = false }: Options = {}) {
		this.#cache = new Cache({ enabled: useCache });
	}

	/**
	 * Declare & define a website's capability to monetize by different methods.
	 * The order of `define()` calls defines the order for website's monetization
	 * preferences (first call being most preferred capability).
	 * @param capability capability name
	 * @param isUserCapable tests whether user is capable
	 */
	define(capability: Capability, isUserCapable: Test): void {
		this.#capabilities.set(capability, isUserCapable);
	}

	use([name, test]: Plugin): void {
		this.define(name, test);
	}

	/**
	 * Find matches between user preferences, user's capabilities and the
	 * capabilities defined by site (i.e., site preferences).
	 */
	async match(): Promise<Capability[]> {
		const userPreferences = Monetization.UserPreferences;
		const sitePreferences = [...this.#capabilities.keys()];
		return [...userPreferences.get().prefers]; // TODO
	}

	async clearCache() {
		await this.#cache.clear();
	}

	async get(capability: Capability, { bypassCache = false } = {}) {
		if (!this.#capabilities.has(capability)) {
			throw new Error(`Unrecognized capability: ${capability}`);
		}

		if (!bypassCache) {
			const cached = await this.#cache.get(capability);
			if (cached) {
				return cached;
			}
		}

		const result = await this.#capabilities.get(capability)!();
		try {
			await this.#cache.set(capability, result);
		} catch (error) {
			console.error("Failed to cache result", error);
		}

		return result;
	}
}
