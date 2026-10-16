// Setup for component tests (jsdom). jsdom lacks a few browser APIs the components rely on, so
// provide minimal stand-ins.
import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// `prefersReducedMotion` (svelte/motion) reads `matchMedia`; no media query matches.
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		addListener: vi.fn(),
		removeListener: vi.fn(),
		dispatchEvent: vi.fn()
	})
});

// Svelte transitions run on the Web Animations API. Finish each animation on the next tick so
// in/out transitions complete (and outros remove their elements) without real timing.
Element.prototype.animate ??= function () {
	const animation = {
		onfinish: null as null | (() => void),
		currentTime: 0,
		playState: 'running',
		cancel: vi.fn(),
		finish() {
			this.onfinish?.();
		},
		finished: Promise.resolve()
	};
	setTimeout(() => animation.onfinish?.(), 0);
	return animation as unknown as Animation;
};

// jsdom's <dialog> may not implement modal opening; emulate the `open` state.
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
	this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
	this.removeAttribute('open');
	this.dispatchEvent(new Event('close'));
};

window.scrollTo = vi.fn() as typeof window.scrollTo;
