import Monetization from "./lib/Monetization.js";

const monetization = new Monetization();
Object.defineProperty(window, "monetization", {
	writable: false,
	configurable: false,
	value: monetization,
});
