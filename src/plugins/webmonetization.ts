/// <reference types="@webmonetization/types" />
import { MonetizationExtendedDocument } from "@webmonetization/types";
import { Capability, Result, Plugin } from "../index.js";

const name: Capability = "webmonetization/*";

function isCapable(timeout: number) {
	return new Promise<Result>(resolve => {
		const wm = (document as MonetizationExtendedDocument).monetization;
		if (!wm) {
			return resolve({ isSupported: false });
		}
		const timerId = setTimeout(() => {
			resolve({ isSupported: false });
			wm.removeEventListener("monetizationprogress", onProgress);
		}, timeout);
		wm.addEventListener("monetizationprogress", onProgress);

		function onProgress() {
			resolve({ isSupported: true });
			clearTimeout(timerId);
			wm.removeEventListener("monetizationprogress", onProgress);
		}
	});
}

export default function webmonetization(timeout: number = 0): Plugin {
	return [name, () => isCapable(timeout)];
}
