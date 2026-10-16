import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import SlideCarousel from '#lib/components/SlideCarousel.svelte';
import type { ProjectSlide } from '#lib/types.js';

const image = (n: number): ProjectSlide => ({
	type: 'image',
	src: `/img/${n}.png`,
	alt: `Shot ${n}`
});
const three = [image(1), image(2), image(3)];

/** The slide label ("2 of 3") once any slide transition has finished. */
async function currentSlide() {
	await waitFor(() => expect(screen.getAllByRole('group', { name: /of/ })).toHaveLength(1));
	return screen.getByRole('group', { name: /of/ }).getAttribute('aria-label');
}
const viewport = () => screen.getByRole('presentation');

describe('SlideCarousel: one slide', () => {
	it('shows just the image, with no controls', () => {
		render(SlideCarousel, { slides: [image(1)] });
		expect(screen.getByAltText('Shot 1')).toHaveAttribute('src', '/img/1.png');
		expect(screen.queryByRole('button', { name: /slide/i })).toBeNull();
	});

	it('embeds non-image URLs in an iframe titled by the alt text', () => {
		render(SlideCarousel, {
			slides: [{ type: 'embed', src: 'https://www.youtube.com/embed/x', alt: 'Demo video' }]
		});
		const frame = screen.getByTitle('Demo video');
		expect(frame.tagName).toBe('IFRAME');
		expect(frame).toHaveAttribute('src', 'https://www.youtube.com/embed/x');
		expect(frame).toHaveAttribute('allowfullscreen');
	});

	it('serves static/ files from the site root', () => {
		render(SlideCarousel, { slides: [{ type: 'static', src: '/images/a.png', alt: 'Static' }] });
		expect(screen.getByAltText('Static').getAttribute('src')).toMatch(/\/images\/a\.png$/);
	});

	it('has a caption with the alt text, hidden from screen readers', () => {
		const { container } = render(SlideCarousel, { slides: [image(1)] });
		const caption = container.querySelector('figcaption');
		expect(caption).toHaveTextContent('Shot 1');
		expect(caption).toHaveAttribute('aria-hidden', 'true');
	});
});

describe('SlideCarousel: several slides', () => {
	it('starts on the first slide with arrows and one dot per slide', async () => {
		render(SlideCarousel, { slides: three });
		expect(await currentSlide()).toBe('1 of 3');
		expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
		expect(screen.getAllByRole('button', { name: /Show slide/ })).toHaveLength(3);
		expect(screen.getByRole('button', { name: 'Show slide 1' })).toHaveAttribute(
			'aria-current',
			'true'
		);
	});

	it('moves forward and wraps from the last slide to the first', async () => {
		render(SlideCarousel, { slides: three });
		const next = screen.getByRole('button', { name: 'Next slide' });
		await fireEvent.click(next);
		expect(await currentSlide()).toBe('2 of 3');
		await fireEvent.click(next);
		await fireEvent.click(next);
		expect(await currentSlide()).toBe('1 of 3');
	});

	it('moves backward and wraps from the first slide to the last', async () => {
		render(SlideCarousel, { slides: three });
		await fireEvent.click(screen.getByRole('button', { name: 'Previous slide' }));
		expect(await currentSlide()).toBe('3 of 3');
		expect(screen.getByAltText('Shot 3')).toBeInTheDocument();
	});

	it('jumps to a slide from its dot', async () => {
		render(SlideCarousel, { slides: three });
		await fireEvent.click(screen.getByRole('button', { name: 'Show slide 3' }));
		expect(await currentSlide()).toBe('3 of 3');
		expect(screen.getByRole('button', { name: 'Show slide 3' })).toHaveAttribute(
			'aria-current',
			'true'
		);
		expect(screen.getByRole('button', { name: 'Show slide 1' })).not.toHaveAttribute(
			'aria-current'
		);
	});

	it('changes slide on a touch swipe, and ignores small movements', async () => {
		render(SlideCarousel, { slides: three });
		const swipe = async (dx: number) => {
			await fireEvent.pointerDown(viewport(), { pointerType: 'touch', clientX: 200 });
			await fireEvent.pointerUp(viewport(), { pointerType: 'touch', clientX: 200 + dx });
		};
		await swipe(-100); // swipe left: next
		expect(await currentSlide()).toBe('2 of 3');
		await swipe(100); // swipe right: previous
		expect(await currentSlide()).toBe('1 of 3');
		await swipe(-20); // too small
		expect(await currentSlide()).toBe('1 of 3');
	});

	it('ignores mouse drags (only touch/pen swipe)', async () => {
		render(SlideCarousel, { slides: three });
		await fireEvent.pointerDown(viewport(), { pointerType: 'mouse', clientX: 200 });
		await fireEvent.pointerUp(viewport(), { pointerType: 'mouse', clientX: 50 });
		expect(await currentSlide()).toBe('1 of 3');
	});

	it('moves one slide per horizontal scroll gesture, however many events it sends', async () => {
		render(SlideCarousel, { slides: three });
		// A trackpad swipe: many small events in a row as it coasts.
		for (let i = 0; i < 20; i++) await fireEvent.wheel(viewport(), { deltaX: 10, deltaY: 0 });
		expect(await currentSlide()).toBe('2 of 3');
		// After the gesture pauses, the next one moves again.
		await new Promise((r) => setTimeout(r, 250));
		for (let i = 0; i < 5; i++) await fireEvent.wheel(viewport(), { deltaX: -10, deltaY: 0 });
		expect(await currentSlide()).toBe('1 of 3');
	});

	it('leaves vertical scrolling to the page', async () => {
		render(SlideCarousel, { slides: three });
		const event = new WheelEvent('wheel', { deltaX: 5, deltaY: 80, cancelable: true });
		viewport().dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
		expect(await currentSlide()).toBe('1 of 3');
	});

	it('stops horizontal scrolling from also scrolling the page', () => {
		render(SlideCarousel, { slides: three });
		const event = new WheelEvent('wheel', { deltaX: 50, deltaY: 0, cancelable: true });
		viewport().dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
	});
});

describe('SlideCarousel: lightbox', () => {
	const lightbox = () => document.querySelector('dialog[data-lightbox]') as HTMLDialogElement;

	it('is closed and empty to begin with', () => {
		render(SlideCarousel, { slides: three });
		expect(lightbox().open).toBe(false);
		expect(lightbox().querySelector('img')).toBeNull();
	});

	it('opens the clicked image, alone', async () => {
		render(SlideCarousel, { slides: three });
		await fireEvent.click(screen.getByRole('button', { name: 'Enlarge image: Shot 1' }));
		expect(lightbox().open).toBe(true);
		const images = lightbox().querySelectorAll('img');
		expect(images).toHaveLength(1);
		expect(images[0]).toHaveAttribute('alt', 'Shot 1');
		// Nothing but the image and the backdrop: no caption, arrows or dots.
		expect(lightbox().querySelector('figcaption, button')).toBeNull();
		expect(lightbox()).toHaveAttribute('aria-label', 'Shot 1');
	});

	it('works for single-image cards too', async () => {
		render(SlideCarousel, { slides: [image(1)] });
		await fireEvent.click(screen.getByRole('button', { name: 'Enlarge image: Shot 1' }));
		expect(lightbox().open).toBe(true);
	});

	it('closes when clicking outside the image (the backdrop)', async () => {
		render(SlideCarousel, { slides: three });
		await fireEvent.click(screen.getByRole('button', { name: 'Enlarge image: Shot 1' }));
		await fireEvent.click(lightbox().querySelector('div')!);
		await waitFor(() => expect(lightbox().open).toBe(false));
		expect(lightbox().querySelector('img')).toBeNull();
	});

	it('does not close when clicking the image itself', async () => {
		render(SlideCarousel, { slides: three });
		await fireEvent.click(screen.getByRole('button', { name: 'Enlarge image: Shot 1' }));
		await fireEvent.click(within(lightbox()).getByAltText('Shot 1'));
		await new Promise((r) => setTimeout(r, 20));
		expect(lightbox().open).toBe(true);
	});

	it('closes on Escape (the dialog cancel event), with its leave animation', async () => {
		render(SlideCarousel, { slides: three });
		await fireEvent.click(screen.getByRole('button', { name: 'Enlarge image: Shot 1' }));
		const cancel = new Event('cancel', { cancelable: true });
		lightbox().dispatchEvent(cancel);
		// The browser's instant close is prevented so the image can animate out first.
		expect(cancel.defaultPrevented).toBe(true);
		await waitFor(() => expect(lightbox().open).toBe(false));
	});

	it('does not open after a swipe that changed the slide', async () => {
		render(SlideCarousel, { slides: three });
		await fireEvent.pointerDown(viewport(), { pointerType: 'touch', clientX: 200 });
		await fireEvent.pointerUp(viewport(), { pointerType: 'touch', clientX: 50 });
		// The tap that ends a swipe also fires a click on the image.
		await fireEvent.click(screen.getAllByRole('button', { name: /Enlarge image/ }).at(-1)!);
		expect(lightbox().open).toBe(false);
		// The next real click opens it.
		await currentSlide();
		await fireEvent.click(screen.getByRole('button', { name: /Enlarge image/ }));
		expect(lightbox().open).toBe(true);
	});

	it('is not offered for embeds', () => {
		render(SlideCarousel, {
			slides: [{ type: 'embed', src: 'https://www.youtube.com/embed/x', alt: 'Video' }]
		});
		expect(screen.queryByRole('button', { name: /Enlarge image/ })).toBeNull();
	});
});
