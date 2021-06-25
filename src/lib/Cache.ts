export default class Cache {
	#enabled: boolean;
	#keys: Set<string>;
	#baseKey = "__monetization__";

	constructor({ enabled = true }) {
		this.#enabled = enabled;
		this.#keys = new Set<string>(this.#getKeys());
	}

	async get(key: string) {
		if (!this.#canStore()) return;
		const val = localStorage.getItem(this.#getKey(key));
		return val ? JSON.parse(val).value : undefined;
	}

	async set(key: string, value: unknown) {
		if (!this.#canStore()) return;
		this.#keys.add(key);
		this.#saveKeys();
		localStorage.setItem(this.#getKey(key), JSON.stringify({ value }));
	}

	async delete(key: string) {
		if (!this.#canStore()) return;
		this.#keys.delete(key);
		this.#saveKeys();
		localStorage.removeItem(this.#getKey(key));
	}

	async clear() {
		await Promise.all([...this.#keys].map(key => this.delete(key)));
		this.#keys.clear();
		this.#saveKeys();
	}

	#canStore() {
		return this.#enabled && globalThis.localStorage;
	}

	#getKey(key: string) {
		return `monetization/${key}`;
	}

	#saveKeys() {
		if (!this.#canStore()) return false;
		localStorage.setItem(this.#baseKey, JSON.stringify([...this.#keys]));
		return true;
	}

	#getKeys(): string[] {
		if (!this.#canStore()) return [];
		return JSON.parse(localStorage.getItem(this.#baseKey) || "[]");
	}
}
