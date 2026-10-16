<!--
	Shows one slide at a time. Each change slides the new slide in from the side it's coming from,
	so Next always moves forward, even when wrapping from the last slide to the first. (Skeleton's
	Carousel scrolls a strip of slides, so wrapping there scrolls backwards across all of them.)
	Slides change with the arrows, the dots, touch swipes, and horizontal scrolling. The arrows show
	while hovering an enclosing `group/card`; on touch screens they, and image captions, always show.
-->
<script lang="ts">
	import { cubicOut } from 'svelte/easing';
	import type { ClassValue } from 'svelte/elements';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade, fly } from 'svelte/transition';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { asset } from '$app/paths';
	import { modalEnter, modalLeave } from '#lib/modal-motion.js';
	import type { ProjectSlide } from '#lib/types.js';

	let { slides, class: className }: { slides: ProjectSlide[]; class?: ClassValue } = $props();

	let index = $state(0);
	/** 1: the next slide comes in from the right; -1: from the left. */
	let direction = $state(1);
	const motion = $derived({
		duration: prefersReducedMotion.current ? 0 : 300,
		easing: cubicOut,
		opacity: 1
	});

	function go(to: number, dir: number) {
		direction = dir;
		index = (to + slides.length) % slides.length;
	}

	// Swipe left/right on touch screens.
	let swipeStartX: number | undefined;
	/** Set when a swipe just changed slides, so the click that follows it doesn't open the image. */
	let swiped = false;
	function onpointerup(event: PointerEvent) {
		if (swipeStartX === undefined) return;
		const dx = event.clientX - swipeStartX;
		swipeStartX = undefined;
		if (Math.abs(dx) > 40) {
			go(index - Math.sign(dx), -Math.sign(dx));
			swiped = true;
		}
	}

	const imageSrc = ({ type, src }: ProjectSlide) =>
		type === 'static' ? asset(src as Parameters<typeof asset>[0]) : src;

	// Clicking an image opens it alone in a modal over the darkened page (a "lightbox").
	let lightbox: HTMLDialogElement;
	let enlarged = $state<ProjectSlide>();
	const enter = $derived(modalEnter());
	const leave = $derived(modalLeave());

	function enlarge(slide: ProjectSlide) {
		if (swiped) {
			swiped = false;
			return;
		}
		// Open the (still empty) dialog first, so the image's fly-in plays once it's on screen.
		lightbox.showModal();
		enlarged = slide;
	}

	/** Plays the leave animation; the dialog closes when the image's outro ends. */
	function closeLightbox() {
		enlarged = undefined;
	}

	// Horizontal scrolling (trackpad swipes, shift+wheel) moves one slide per gesture. A trackpad
	// keeps sending events as a swipe coasts to a stop, so after moving, ignore the rest of the
	// gesture until the events pause. Vertical scrolling is left alone so the page still scrolls.
	// Attached manually because Svelte's `onwheel` is passive, which can't stop the browser from
	// also scrolling the page sideways or treating the swipe as Back/Forward.
	const GESTURE_GAP = 200;
	function horizontalScroll(node: HTMLElement) {
		let distance = 0;
		let moved = false;
		let gestureEnd: ReturnType<typeof setTimeout>;

		function onwheel(event: WheelEvent) {
			if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
			event.preventDefault();

			clearTimeout(gestureEnd);
			gestureEnd = setTimeout(() => {
				distance = 0;
				moved = false;
			}, GESTURE_GAP);

			if (moved) return;
			distance += event.deltaX;
			if (Math.abs(distance) > 30) {
				const dir = Math.sign(distance);
				go(index + dir, dir);
				moved = true;
			}
		}

		node.addEventListener('wheel', onwheel, { passive: false });
		return () => {
			clearTimeout(gestureEnd);
			node.removeEventListener('wheel', onwheel);
		};
	}
</script>

{#snippet slide({ type, src, alt }: ProjectSlide)}
	{#if type === 'embed'}
		<iframe
			{src}
			title={alt}
			loading="lazy"
			allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
			class="block aspect-video w-full"
		></iframe>
	{:else}
		<figure class="relative">
			<button
				type="button"
				class="block w-full cursor-zoom-in"
				aria-label="Enlarge image: {alt}"
				onclick={() => enlarge({ type, src, alt })}
			>
				<img
					src={imageSrc({ type, src, alt })}
					{alt}
					loading="lazy"
					decoding="async"
					class="aspect-video w-full object-cover"
				/>
			</button>
			<!-- Shows the alt text while hovering the slides (always on touch screens); hidden from
			     screen readers, which already read `alt`. -->
			<figcaption
				aria-hidden="true"
				class="pointer-events-none absolute inset-x-0 bottom-0 bg-surface-50-950/80 px-3 py-2 text-sm opacity-0 backdrop-blur transition-opacity group-hover/slides:opacity-100 pointer-coarse:opacity-100"
			>
				{alt}
			</figcaption>
		</figure>
	{/if}
{/snippet}

{#if slides.length === 1}
	<div class={className}>
		<div class="group/slides overflow-hidden rounded-t-base">{@render slide(slides[0])}</div>
	</div>
{:else if slides.length > 1}
	<section
		aria-roledescription="carousel"
		aria-label="Slides"
		class={['flex flex-col gap-2', className]}
	>
		<!-- `group/slides`: captions show while hovering anywhere here, arrows included. This element
		     stays put while slides change, so the captions stay visible and move with their slides. -->
		<div class="group/slides relative">
			<!-- Slides share one grid cell, so the outgoing and incoming slide overlap while moving. -->
			<div
				class="grid touch-pan-y overflow-hidden rounded-t-base"
				aria-live="polite"
				role="presentation"
				onpointerdown={(e) => {
					if (e.pointerType !== 'mouse') swipeStartX = e.clientX;
				}}
				{onpointerup}
				onpointercancel={() => (swipeStartX = undefined)}
				{@attach horizontalScroll}
			>
				{#key index}
					<div
						class="col-start-1 row-start-1"
						role="group"
						aria-roledescription="slide"
						aria-label="{index + 1} of {slides.length}"
						in:fly={{ ...motion, x: `${direction * 100}%` }}
						out:fly={{ ...motion, x: `${-direction * 100}%` }}
					>
						{@render slide(slides[index])}
					</div>
				{/key}
			</div>
			<button
				type="button"
				class="absolute top-1/2 left-2 btn-icon -translate-y-1/2 rounded-full bg-surface-50-950/80 opacity-0 backdrop-blur transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
				aria-label="Previous slide"
				onclick={() => go(index - 1, -1)}
			>
				<ChevronLeftIcon />
			</button>
			<button
				type="button"
				class="absolute top-1/2 right-2 btn-icon -translate-y-1/2 rounded-full bg-surface-50-950/80 opacity-0 backdrop-blur transition-opacity group-hover/card:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
				aria-label="Next slide"
				onclick={() => go(index + 1, 1)}
			>
				<ChevronRightIcon />
			</button>
		</div>
		<div class="mt-2 flex justify-center gap-2">
			{#each slides as item, i (item.src + i)}
				<button
					type="button"
					class={[
						'size-2 rounded-full transition-colors',
						i === index ? 'bg-primary-500' : 'bg-surface-300-700'
					]}
					aria-label="Show slide {i + 1}"
					aria-current={i === index ? 'true' : undefined}
					onclick={() => go(i, i > index ? 1 : -1)}
				></button>
			{/each}
		</div>
	</section>
{/if}

<!--
	The lightbox: just the image over the dimmed page. It flies up from the bottom and drops back down,
	with the same timing and dimming as RouteModal (blog posts). Clicking outside the image (on the
	dimmed backdrop) or pressing Escape closes it. Uses `open:grid`, not `grid`: a display class would
	override the browser hiding the closed dialog, leaving an invisible overlay blocking the page.
-->
<dialog
	bind:this={lightbox}
	data-lightbox
	aria-label={enlarged?.alt}
	class="fixed inset-0 m-0 size-full max-h-none max-w-none place-items-center overflow-hidden bg-transparent p-0 outline-none backdrop:bg-transparent open:grid"
	oncancel={(event) => {
		event.preventDefault();
		closeLightbox();
	}}
>
	{#if enlarged}
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 bg-(--color-backdrop)"
			in:fade={enter}
			out:fade={leave}
			onclick={closeLightbox}
		></div>
		<img
			src={imageSrc(enlarged)}
			alt={enlarged.alt}
			class="relative block max-h-[75vh] max-w-[75vw] rounded-base object-contain"
			in:fly={{ ...enter, y: '100vh', opacity: 1 }}
			out:fly={{ ...leave, y: '100vh', opacity: 1 }}
			onoutroend={() => lightbox.close()}
		/>
	{/if}
</dialog>
