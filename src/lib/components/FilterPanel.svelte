<!--
	A page heading with a collapsible filter panel: tag toggles, a date range, and any extra controls
	(e.g. sorting). Filters live in the URL; every change navigates to `href(nextFilters)`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import FunnelIcon from '@lucide/svelte/icons/funnel';
	import XIcon from '@lucide/svelte/icons/x';
	import { Collapsible } from '@skeletonlabs/skeleton-svelte';
	import { goto } from '$app/navigation';
	import TagChip from '#lib/components/TagChip.svelte';
	import { countActive, type ListFilters } from '#lib/list-filters.js';

	interface Props {
		/** The page heading shown next to the Filters button. */
		title: string;
		/** Accessible name for the panel, e.g. "Filter posts". */
		label: string;
		filters: ListFilters;
		/** Every tag with its item count. */
		tags: [tag: string, count: number][];
		/** What each date picker shows when that bound isn't filtered. */
		defaultDates: { from: string; to: string };
		/** Resolved URL of the list with the given filters. */
		href: (filters: ListFilters) => string;
		/** Extra controls shown under the date range. */
		extra?: Snippet;
	}

	let { title, label, filters, tags, defaultDates, href, extra }: Props = $props();

	const activeCount = $derived(countActive(filters));

	function toggleTag(tag: string) {
		const tags = filters.tags.includes(tag)
			? filters.tags.filter((t) => t !== tag)
			: [...filters.tags, tag];
		return href({ ...filters, tags });
	}

	function setDate(key: 'from' | 'to', input: HTMLInputElement) {
		// A cleared picker shows its default again. Defaults don't narrow anything, so leave them
		// out of the URL to keep it clean and the active-filter count accurate.
		if (!input.value) input.value = defaultDates[key];
		const value = input.value === defaultDates[key] ? undefined : input.value;

		// eslint-disable-next-line svelte/no-navigation-without-resolve -- `href` returns resolved paths
		goto(href({ ...filters, [key]: value }), { replace: true, reset: false });
	}
</script>

<Collapsible class="items-stretch gap-6">
	<div class="flex flex-wrap items-center justify-between gap-4">
		<h1 class="h1">{title}</h1>
		<Collapsible.Trigger class="btn preset-tonal">
			<FunnelIcon />
			<span>Filters</span>
			{#if activeCount}
				<span class="badge-icon preset-filled-primary-500">{activeCount}</span>
			{/if}
			<Collapsible.Indicator class="group">
				<ChevronDownIcon class="transition-transform group-data-[state=open]:rotate-180" />
			</Collapsible.Indicator>
		</Collapsible.Trigger>
	</div>

	<Collapsible.Content>
		<section
			aria-label={label}
			class="space-y-4 card border border-surface-200-800 bg-surface-100-900 p-5"
			data-sveltekit-replacestate
			data-sveltekit-reset="false"
		>
			{#if tags.length}
				<div class="flex flex-wrap items-center gap-2">
					<span class="text-sm font-bold">Tags</span>
					{#each tags as [tag, count] (tag)}
						<TagChip {tag} {count} href={toggleTag(tag)} active={filters.tags.includes(tag)} />
					{/each}
				</div>
			{/if}

			<div class="flex flex-wrap items-end gap-4">
				<label class="label w-auto">
					<span class="label-text">From</span>
					<input
						type="date"
						class="input"
						value={filters.from ?? defaultDates.from}
						max={filters.to ?? defaultDates.to}
						onchange={(e) => setDate('from', e.currentTarget)}
					/>
				</label>
				<label class="label w-auto">
					<span class="label-text">To</span>
					<input
						type="date"
						class="input"
						value={filters.to ?? defaultDates.to}
						min={filters.from ?? defaultDates.from}
						onchange={(e) => setDate('to', e.currentTarget)}
					/>
				</label>
				{@render extra?.()}
				{#if activeCount}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- `href` returns resolved paths -->
					<a href={href({ tags: [] })} class="btn preset-tonal">
						<XIcon />
						<span>Clear filters</span>
					</a>
				{/if}
			</div>
		</section>
	</Collapsible.Content>
</Collapsible>
