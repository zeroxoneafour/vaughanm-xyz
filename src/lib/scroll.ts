import { prefersReducedMotion } from 'svelte/motion';

/**
 * Smoothly scrolls the page so `element` sits at the top, honouring its `scroll-margin-top`.
 * Faster than the browser's `behavior: 'smooth'` (whose speed can't be set), eases out, and stops
 * if the user starts scrolling themselves. Jumps instantly when reduced motion is preferred.
 */
export function scrollToElement(element: Element, duration = 450) {
	const margin = parseFloat(getComputedStyle(element).scrollMarginTop) || 0;
	const start = scrollY;
	const target = Math.min(
		element.getBoundingClientRect().top + scrollY - margin,
		document.documentElement.scrollHeight - innerHeight
	);

	if (prefersReducedMotion.current || Math.abs(target - start) < 1) {
		scrollTo(0, target);
		return;
	}

	const interrupts = ['wheel', 'touchstart', 'keydown'] as const;
	let frame = 0;
	const stop = () => {
		cancelAnimationFrame(frame);
		for (const type of interrupts) removeEventListener(type, stop);
	};
	for (const type of interrupts) addEventListener(type, stop, { passive: true });

	const t0 = performance.now();
	const step = (now: number) => {
		const t = Math.min((now - t0) / duration, 1);
		const eased = 1 - (1 - t) ** 3; // ease-out cubic
		scrollTo(0, start + (target - start) * eased);
		if (t < 1) frame = requestAnimationFrame(step);
		else stop();
	};
	frame = requestAnimationFrame(step);
}
