import { Capability } from "./MonetizationCapabilities.js";

export default class UserPreferences {
	#prefer = new Set<Capability>();
	#deny = new Set<Capability>();

	prefer(capabilities: Capability[]) {
		this.#prefer.clear();
		capabilities.forEach(c => this.#prefer.add(c));
	}

	deny(capabilities: Capability[]) {
		this.#deny.clear();
		capabilities.forEach(c => this.#deny.add(c));
	}

	get() {
		return { prefers: [...this.#prefer], denies: [...this.#deny] };
	}
}
