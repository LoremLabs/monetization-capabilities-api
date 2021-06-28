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

	/**
	 * @example assert(matches("foo/*", "foo/*"))
	 * @example assert(matches("foo/bar", "foo/bar"))
	 * @example assert(matches("foo/*", "foo/bar"))
	 * @example assert(matches("foo/bar", "foo/*"))
	 * @example assert(!matches("foo/*", "bar/*"))
	 * @example assert(!matches("foo/bar", "foo/baz"))
	 * @example assert(!matches("bar/bar", "baz/*"))
	 */
	matches(a: Capability, b: Capability): boolean {
		return b.endsWith("/*") && !a.endsWith("/*")
			? this.#matches(b, a)
			: this.#matches(a, b);
	}

	#matches(a: Capability, b: Capability): boolean {
		if (a === b) {
			return true;
		}
		if (a.endsWith("/*") && b.endsWith("/*")) {
			return a === b;
		}

		const [forPart, specificPart] = a.split("/", 2);
		if (b.startsWith(`${forPart}/`) && specificPart === "*") {
			return true;
		}
		return false;
	}

	denies(capability: Capability) {
		return [...this.#deny].some(cap => this.matches(cap, capability));
	}

	get() {
		return { prefers: [...this.#prefer], denies: [...this.#deny] };
	}
}
