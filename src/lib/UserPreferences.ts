import { Capability } from "./MonetizationCapabilities.js";

class PreferenceChangeEvent extends Event {
	constructor(
		public changeType: "allow" | "deny",
		public capability: Capability,
	) {
		super("change");
	}
}

class PreferenceUpdateEvent extends Event {
	constructor(public changeType: "update", public detail?: any) {
		super("change");
	}
}

export default class UserPreferences extends EventTarget {
	#allowList = new Set<Capability>();
	#blockList = new Set<Capability>();

	allow(capability: Capability) {
		this.#allow(capability);
		this.dispatchEvent(new PreferenceChangeEvent("allow", capability));
	}

	#allow(capability: Capability) {
		ensureValidCapability(capability);
		this.#allowList.add(capability);
		this.#blockList.delete(capability);
	}

	deny(capability: Capability) {
		this.#deny(capability);
		this.dispatchEvent(new PreferenceChangeEvent("deny", capability));
	}

	#deny(capability: Capability) {
		ensureValidCapability(capability);
		this.#blockList.add(capability);
		this.#allowList.delete(capability);
	}

	update(
		updateFn: (
			currentValue: { [k in "allows" | "denies"]: Capability[] },
		) => { [k in "allow" | "deny"]?: Capability[] },
	) {
		const { allow, deny } = updateFn(this.get()) || {};
		let hasChanged = false;
		if (Array.isArray(allow)) {
			hasChanged = hasChanged || this.#hasChanged(allow, this.#allowList);
			this.#allowList.clear();
			allow.forEach(cap => this.#allow(cap));
		}
		if (Array.isArray(deny)) {
			hasChanged = hasChanged || this.#hasChanged(deny, this.#blockList);
			this.#blockList.clear();
			deny.forEach(cap => this.#deny(cap));
		}
		if (hasChanged) {
			this.dispatchEvent(new PreferenceUpdateEvent("update"));
		}
	}

	#hasChanged(newValues: Capability[], oldValues: Set<Capability>) {
		if (newValues.length !== oldValues.size) return true;
		// Set is ordered (in case).
		let i = 0;
		for (const val of oldValues) {
			if (newValues[i++] !== val) return true;
		}
		return false;
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
			[...this.#blockList].some(cap => this.matches(cap, capability)) &&
			!this.#allowList.has(capability)
		);
	}

	get() {
		return { allows: [...this.#allowList], denies: [...this.#blockList] };
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
