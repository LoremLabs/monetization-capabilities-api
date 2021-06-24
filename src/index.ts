export type Capability = `${string}/${string}`;
export type Result = { isSupported: boolean; details?: unknown };
export type Test = () => Promise<Result>;
export type Plugin = [name: Capability, test: Test];

class Cache {
	#enabled: boolean;
	#keys = new Set<string>();

	constructor({ enabled = true }) {
		this.#enabled = enabled;
	}

	async get(key: string) {
		if (!this.#canStore()) return;
		const val = localStorage.getItem(this.#key(key));
		return val ? JSON.parse(val).value : undefined;
	}

	async set(key: string, value: unknown) {
		if (!this.#canStore()) return;
		this.#keys.add(this.#key(key));
		localStorage.setItem(this.#key(key), JSON.stringify({ value }));
	}

	async delete(key: string) {
		if (!this.#canStore()) return;
		this.#keys.delete(this.#key(key));
		localStorage.removeItem(this.#key(key));
	}

	async clear() {
		await Promise.all([...this.#keys].map(key => this.delete(key)));
	}

	#canStore() {
		return this.#enabled && globalThis.localStorage;
	}

	#key(key: string) {
		return `monetization_${key}`;
	}
}

interface Options {
	useCache?: boolean;
}

export default class Monetization {
	static UserPreferences = Object.freeze({
		allow: new Set<Capability>(),
		deny: new Set<Capability>(),
	});

	#cache: Cache;
	#capabilities = new Map<Capability, () => ReturnType<Test>>();

	constructor({ useCache = false }: Options) {
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
		return [...userPreferences.allow]; // TODO
	}

	async clearCache() {
		await this.#cache.clear();
	}

	async #get(capability: Capability, { bypassCache = false } = {}) {
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
