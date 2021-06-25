import Cache from "./Cache";

export type Capability = `${string}/${string}`;
export type Result = { isSupported: boolean; details?: unknown };
export type Test = () => Promise<Result>;
export type Plugin = [name: Capability, test: Test];

class Lock {
	#locked = false;

	acquire() {
		if (this.#locked) {
			throw new Error("Already acquired.");
		}
		this.#locked = true;
	}

	unlock = () => {
		this.#locked = false;
	};

	isLocked() {
		return this.#locked;
	}
}

class Capabilities extends Lock {
	#capabilities = new Map<Capability, () => ReturnType<Test>>();

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

	list() {
		return [...this.#capabilities.keys()];
	}

	has(capability: Capability) {
		return this.#capabilities.has(capability);
	}

	get(capability: Capability) {
		return this.#capabilities.get(capability);
	}
}

export default class MonetizationCapabilities {
	#capabilities = new Capabilities();
	#cache: Cache;

	constructor() {
		this.#cache = new Cache({ enabled: true });
	}

	acquire() {
		this.#capabilities.acquire();
		return this.#capabilities;
	}

	list() {
		return this.#capabilities.list();
	}

	has(capability: Capability) {
		return this.#capabilities.has(capability);
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
		if (!bypassCache) {
			try {
				await this.#cache.set(capability, result);
			} catch (error) {
				console.error("Failed to cache result", error);
			}
		}

		return result;
	}

	async clearCache() {
		await this.#cache.clear();
	}
}
