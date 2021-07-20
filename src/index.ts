import Monetization from "./lib/Monetization.js";

Object.defineProperty(window, "monet", {
	writable: false,
	configurable: false,
	value: new Monetization(),
});
