let ready = false;

/**
 * Whether the app has finished its first render. Anything rendered after that came from
 * client-side navigation; anything before it is the initial (possibly prerendered) page.
 */
export function isAppReady() {
	return ready;
}

/** Called once by the root layout when it mounts. */
export function markAppReady() {
	ready = true;
}
