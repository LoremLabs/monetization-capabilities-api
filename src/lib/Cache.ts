export default class Cache {
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
		return `monetization/${key}`;
	}
}
