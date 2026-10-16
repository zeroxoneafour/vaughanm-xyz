// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Controls `prefersReducedMotion.current` from svelte/motion.
const motion = vi.hoisted(() => ({ reduced: false }));
vi.mock('svelte/motion', () => ({
	prefersReducedMotion: {
		get current() {
			return motion.reduced;
		}
	}
}));

const { scrollToElement } = await import('#lib/scroll.js');

/** An element whose top is `top`px below the current viewport top, with an optional scroll margin. */
function elementAt(top: number, scrollMargin = 0) {
	const element = document.createElement('div');
	element.style.scrollMarginTop = `${scrollMargin}px`;
	element.getBoundingClientRect = () => ({ top }) as DOMRect;
	document.body.append(element);
	return element;
}

describe('scrollToElement', () => {
	let y = 0;

	beforeEach(() => {
		vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] });
		y = 0;
		Object.defineProperty(window, 'scrollY', { configurable: true, get: () => y });
		window.scrollTo = vi.fn((_x: number, top: number) => {
			y = top;
		}) as unknown as typeof window.scrollTo;
		Object.defineProperty(window, 'innerHeight', { configurable: true, value: 800 });
		Object.defineProperty(document.documentElement, 'scrollHeight', {
			configurable: true,
			value: 5000
		});
		motion.reduced = false;
	});

	afterEach(() => {
		vi.useRealTimers();
		document.body.replaceChildren();
	});

	it('animates to the element, easing out, and lands exactly on it', () => {
		scrollToElement(elementAt(1000), 400);
		vi.advanceTimersByTime(100);
		const early = y;
		vi.advanceTimersByTime(100);
		const middle = y;
		vi.advanceTimersByTime(300);

		expect(early).toBeGreaterThan(0);
		// Ease-out: the first quarter covers more ground than the second.
		expect(early).toBeGreaterThan(middle - early);
		expect(y).toBe(1000);
	});

	it('honours the element’s scroll-margin-top', () => {
		scrollToElement(elementAt(1000, 96));
		vi.advanceTimersByTime(1000);
		expect(y).toBe(904);
	});

	it('never scrolls past the bottom of the page', () => {
		scrollToElement(elementAt(4900));
		vi.advanceTimersByTime(1000);
		expect(y).toBe(5000 - 800);
	});

	it('jumps straight there when reduced motion is preferred', () => {
		motion.reduced = true;
		scrollToElement(elementAt(1000));
		expect(window.scrollTo).toHaveBeenCalledTimes(1);
		expect(y).toBe(1000);
	});

	it('stops if the user starts scrolling', () => {
		scrollToElement(elementAt(1000), 400);
		vi.advanceTimersByTime(100);
		window.dispatchEvent(new Event('wheel'));
		const stoppedAt = y;
		vi.advanceTimersByTime(1000);
		expect(stoppedAt).toBeLessThan(1000);
		expect(y).toBe(stoppedAt);
	});
});
