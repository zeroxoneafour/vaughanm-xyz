<script lang="ts">
	import { onMount } from 'svelte';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import FunnelIcon from '@lucide/svelte/icons/funnel';
	import XIcon from '@lucide/svelte/icons/x';
	import { Collapsible } from '@skeletonlabs/skeleton-svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { setBlogListHref } from '#lib/blog-context.js';
	import {
		hasFilters,
		matchesFilters,
		parseFilters,
		toSearchParams,
		type BlogFilters
	} from '#lib/blog-filters.js';
	import PostList from '#lib/components/PostList.svelte';
	import TagChip from '#lib/components/TagChip.svelte';
	import type { LayoutProps } from './$types';

	// The post list lives in this layout so it stays rendered behind an open post (/blog/[slug]).
	let { data, children }: LayoutProps = $props();

	// This page is prerendered, so the server can't see the query string (SvelteKit forbids reading
	// it during prerendering). Render and hydrate the unfiltered list, then apply the URL's filters.
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});

	// The list's query string. On /blog that's the URL's; while a post is open on top, keep showing
	// the list exactly as it was when the post was opened.
	let lastListSearch = '';
	function rememberListSearch(routeId: string | null | undefined, url: { search: string }) {
		if (routeId === '/blog') lastListSearch = url.search;
	}
	// afterNavigate covers in-app navigation; onMount covers the first page load, since Kit can run
	// the initial ('enter') afterNavigate callbacks before this layout has registered its own.
	onMount(() => rememberListSearch(page.route.id, page.url));
	afterNavigate(({ to }) => to && rememberListSearch(to.route.id, to.url));
	const listSearch = $derived(
		hydrated && page.route.id === '/blog' ? page.url.search : lastListSearch
	);

	const filters = $derived(parseFilters(new URLSearchParams(listSearch)));
	const posts = $derived(data.posts.filter((post) => matchesFilters(post, filters)));
	const activeCount = $derived(filters.tags.length + Number(!!filters.from) + Number(!!filters.to));

	/** Every tag with its post count, alphabetically. */
	const tags = $derived(
		Object.entries(
			data.posts
				.flatMap((post) => post.tags)
				.reduce<Record<string, number>>((counts, tag) => {
					counts[tag] = (counts[tag] ?? 0) + 1;
					return counts;
				}, {})
		).sort(([a], [b]) => a.localeCompare(b))
	);

	function href(next: BlogFilters) {
		const query = toSearchParams(next).toString();
		return query ? resolve(`/blog?${query}`) : resolve('/blog');
	}

	// Posts close back to the list as it's shown, filters included.
	const listHref = $derived(href(filters));
	setBlogListHref(() => listHref);

	function toggleTag(tag: string) {
		const tags = filters.tags.includes(tag)
			? filters.tags.filter((t) => t !== tag)
			: [...filters.tags, tag];
		return href({ ...filters, tags });
	}

	/** Local `YYYY-MM-DD`, so "today" matches the visitor's calendar rather than UTC. */
	function localISODate(date: Date) {
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
	}

	// What the date pickers show when that bound isn't filtered: the first post's date and today.
	// "Today" is computed in the browser, not baked into the prerendered HTML at build time.
	const defaultDates = $derived({
		from: data.posts.at(-1)?.pubDate ?? '',
		to: hydrated ? localISODate(new Date()) : ''
	});

	function setDate(key: 'from' | 'to', input: HTMLInputElement) {
		// A cleared picker shows its default again. Defaults don't narrow anything, so leave them
		// out of the URL to keep it clean and the active-filter count accurate.
		if (!input.value) input.value = defaultDates[key];
		const value = input.value === defaultDates[key] ? undefined : input.value;

		goto(href({ ...filters, [key]: value }), {
			replace: true,
			reset: false
		});
	}
</script>

<div class="space-y-6">
	<Collapsible class="items-stretch gap-6">
		<div class="flex flex-wrap items-center justify-between gap-4">
			<h1 class="h1">Blog</h1>
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
				aria-label="Filter posts"
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
					{#if hasFilters(filters)}
						<a href={resolve('/blog')} class="btn preset-tonal">
							<XIcon />
							<span>Clear filters</span>
						</a>
					{/if}
				</div>
			</section>
		</Collapsible.Content>
	</Collapsible>

	<!-- `reset="false"`: opening a post keeps the list's scroll position behind it. -->
	<div data-sveltekit-reset="false">
		{#if posts.length || !hasFilters(filters)}
			<PostList {posts} class="md:grid-cols-2" />
		{:else}
			<p class="text-surface-800-200">No posts match these filters.</p>
		{/if}
	</div>
</div>

{@render children()}
