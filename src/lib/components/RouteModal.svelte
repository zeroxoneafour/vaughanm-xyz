<!--
	A page rendered as a card that flies up over the page behind it (e.g. a blog post over /blog).
	Use it as the whole content of a route's +page.svelte, with the background in a parent layout.

	- Navigating to the route in-app: the card flies up and the background dims.
	- Loading the URL directly: the card is just there, with no animation. It's in the prerendered
	  HTML, so it shows before hydration too.
	- Leaving the route by any means (X, Escape, backdrop click, Back button, a link): the card drops
	  back down and the dimming fades out. The transitions are `|global` so they also run when
	  SvelteKit unmounts the page, which keeps this in the DOM until they finish.
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import XIcon from '@lucide/svelte/icons/x';
	import { afterNavigate, goto } from '$app/navigation';
	import { isAppReady } from '#lib/app-ready.js';
	import { modalEnter, modalLeave } from '#lib/modal-motion.js';

	interface Props {
		/** Shown in the card's sticky header, and labels the dialog. */
		title: string;
		/** Where closing goes, as a resolved path (e.g. `resolve('/blog')`). */
		closeHref: string;
		children: Snippet;
	}

	let { title, closeHref, children }: Props = $props();

	const titleId = $props.id();
	// Only animate in when opened by client-side navigation. On a direct load the card is already on
	// screen from the prerendered HTML, so flying it in would make it jump.
	const animateIn = isAppReady();
	const enter = $derived(animateIn ? modalEnter() : { ...modalEnter(), duration: 0 });
	const leave = $derived(modalLeave());

	let dialog: HTMLDialogElement;
	let previous: URL | undefined;
	let closing = false;

	afterNavigate(({ from }) => {
		previous = from?.url;
	});

	onMount(() => {
		// The dialog is rendered with `open` so the card shows before hydration. Re-open it as a real
		// modal: that makes the page behind inert, keeps focus inside, and closes on Escape. Closing
		// it first resets its scroll position, so restore that (e.g. after a direct `#heading` link).
		const { scrollTop } = dialog;
		const returnFocus = document.activeElement;
		dialog.close();
		dialog.showModal();
		dialog.scrollTop = scrollTop;

		// Runs once the leave transition has finished and the dialog is removed.
		return () => {
			if (returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
		};
	});

	function close() {
		if (closing) return;
		closing = true;

		// If we arrived from where closing leads (e.g. opened from the list), step back instead of
		// stacking a new history entry, so Back/Forward behave and the list keeps its scroll position.
		const target = new URL(closeHref, location.href);
		if (previous?.pathname === target.pathname && previous.search === target.search) {
			history.back();
		} else {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- `closeHref` is resolved by the caller
			goto(closeHref, { reset: false });
		}
	}
</script>

<dialog
	bind:this={dialog}
	open
	data-route-modal
	aria-labelledby={titleId}
	class="fixed inset-0 z-50 m-0 size-full max-h-none max-w-none overflow-y-auto overscroll-contain bg-transparent p-0 text-inherit backdrop:bg-transparent"
	oncancel={(event) => {
		event.preventDefault();
		close();
	}}
>
	<!-- Keyboard users close with Escape (the dialog's cancel event) or the X button. -->
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 bg-(--color-backdrop)"
		in:fade|global={enter}
		out:fade|global={leave}
		onclick={close}
	></div>

	<article
		class="relative mx-auto my-12 w-full max-w-6xl rounded-container border border-surface-200-800 bg-surface-50-950 shadow-2xl md:my-16"
		in:fly|global={{ ...enter, y: '100vh', opacity: 1 }}
		out:fly|global={{ ...leave, y: '100vh', opacity: 1 }}
	>
		<header
			class="sticky top-0 z-10 flex items-start gap-4 rounded-t-container border-b border-surface-200-800 bg-surface-50-950/90 px-6 py-4 backdrop-blur"
		>
			<h1 id={titleId} class="min-w-0 flex-1 h3 break-words">{title}</h1>
			<button
				type="button"
				class="btn-icon shrink-0 preset-tonal"
				aria-label="Close"
				onclick={close}
			>
				<XIcon />
			</button>
		</header>

		<div class="px-6 py-6">
			{@render children()}
		</div>
	</article>
</dialog>
