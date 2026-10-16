import { cubicIn, cubicOut } from 'svelte/easing';
import { prefersReducedMotion } from 'svelte/motion';

/**
 * Shared timing for modals that fly up from the bottom over a dimmed page (RouteModal, the image
 * lightbox), so they all feel the same. Read these inside `$derived` so a change to the reduced
 * motion preference applies straight away.
 */
export function modalEnter() {
	return { duration: prefersReducedMotion.current ? 0 : 300, easing: cubicOut };
}

export function modalLeave() {
	return { duration: prefersReducedMotion.current ? 0 : 220, easing: cubicIn };
}
