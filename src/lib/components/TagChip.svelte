<script lang="ts">
	import type { HTMLAnchorAttributes } from 'svelte/elements';

	interface Props extends HTMLAnchorAttributes {
		tag: string;
		/** Renders a link when set, otherwise a plain label. */
		href?: string;
		active?: boolean;
		count?: number;
	}

	let { tag, href, active = false, count, ...rest }: Props = $props();
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	{href}
	class={['chip', active ? 'preset-filled-primary-500' : 'preset-tonal-secondary']}
	aria-current={active ? 'true' : undefined}
	{...rest}
>
	{tag}
	{#if count !== undefined}<span class="opacity-60">{count}</span>{/if}
</svelte:element>
