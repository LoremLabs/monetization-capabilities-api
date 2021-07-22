import Monetization from "./lib/Monetization.js";

export const monetization = new Monetization();
export { Monetization };

Object.defineProperty(window, "monet", {
	writable: false,
	configurable: false,
	value: monetization,
});
