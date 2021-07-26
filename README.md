# Monetization Capabilities API

Lets website define what monetization methods it accepts; lets users define their monetization preferences and provides website a match between both.

## Example

```js
/**
 * Website defines its Monetization Capabilities.
 */

// Acquire a lock so only the owner can modify capabilities
const capabilities = window.monet.capabilities.acquire();

// Define capabilities and their verifiers
capabilities.define("ads/*", () => {
  return { isSupported: !!document.querySelector("#ad1, #ad2") };
});
capabilities.define("subscription/foo", () => {
  return fetch("/account", { credentials: "include" }).then(response => {
    return { isSupported: response.ok };
  });
});
// ...or use plugins
capabilities.use(webMonetization({ timeout: 3000 }));

console.log(window.monet.capabilities.list());
// ["ads/*", "subscription/foo", "webmonetization/*"]

/**
 * User informs website of their monetization preferences.
 * This is done via some UI or browser add-on.
 * Preferences are saved across sessions/websites.
 */

const prefs = window.monet.userPreferences;
prefs.deny("ads/behavioral");
prefs.allow("ads/*");
prefs.allow("webmonetization/*");
prefs.allow("foo/*");
console.log(window.monet.userPreferences.get());
// { allows: ["ads/*", "webmonetization/*", "foo/*"], denies: ["ads/behavioral"] }

/**
 * Website later finds matches between
 *  - what the user prefers (userPreferences),
 *  - what monetization methods the website supports (capabilities), and
 *  - what user actually supports (using the capability verifiers).
 */
const usableMonetizationMethods = await window.monet.match();
// ["ads/*", "webmonetization/*"]

console.log(window.monet.userPreferences.denies("ads/behavioral")); // true
```
