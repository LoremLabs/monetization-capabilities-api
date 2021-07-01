import { Capability } from "./MonetizationCapabilities.js";

class PreferenceChangeEvent extends Event {
	constructor(
		public changeType: "allow" | "deny",
		public capability: Capability,
	) {
		super("change");
	}
}

export default class UserPreferences extends EventTarget {
	#allow = new Set<Capability>();
	#deny = new Set<Capability>();

	allow(capability: Capability) {
		ensureValidCapability(capability);
		this.#allow.add(capability);
		this.#deny.delete(capability);
		this.dispatchEvent(new PreferenceChangeEvent("allow", capability));
	}

	deny(capability: Capability) {
		ensureValidCapability(capability);
		this.#deny.add(capability);
		this.#allow.delete(capability);
		this.dispatchEvent(new PreferenceChangeEvent("deny", capability));
	}
	
	clear() {
		this.#allow.clear();
		this.#deny.clear();
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
		return (
			[...this.#deny].some(cap => this.matches(cap, capability)) &&
			!this.#allow.has(capability)
		);
	}

	get() {
		return { allows: [...this.#allow], denies: [...this.#deny] };
	}
}

export function isValidCapability(capability: Capability) {
	return typeof capability === "string" && /^\w+\/(\w+|\*)$/.test(capability);
}

export function ensureValidCapability(capability: Capability) {
	if (!isValidCapability(capability)) {
		throw new Error(`Invalid capability format: ${JSON.stringify(capability)}`);
	}
}
