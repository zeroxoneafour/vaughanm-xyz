<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { setBlogListHref } from '#lib/blog-context.js';
	import FilterPanel from '#lib/components/FilterPanel.svelte';
	import PostList from '#lib/components/PostList.svelte';
	import {
		countActive,
		countTags,
		localISODate,
		matchesFilters,
		parseFilters,
		toSearchParams,
		type ListFilters
	} from '#lib/list-filters.js';
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
	const posts = $derived(
		data.posts.filter((post) =>
			matchesFilters({ tags: post.tags, start: post.pubDate, end: post.pubDate }, filters)
		)
	);
	const tags = $derived(countTags(data.posts));

	function href(next: ListFilters) {
		const query = toSearchParams(next).toString();
		return query ? resolve(`/blog?${query}`) : resolve('/blog');
	}

	// Posts close back to the list as it's shown, filters included.
	const listHref = $derived(href(filters));
	setBlogListHref(() => listHref);

	// What the date pickers show when that bound isn't filtered: the first post's date and today.
	// "Today" is computed in the browser, not baked into the prerendered HTML at build time.
	const defaultDates = $derived({
		from: data.posts.at(-1)?.pubDate ?? '',
		to: hydrated ? localISODate(new Date()) : ''
	});
</script>

<div class="space-y-6">
	<FilterPanel title="Blog" label="Filter posts" {filters} {tags} {defaultDates} {href} />

	<!-- `reset="false"`: opening a post keeps the list's scroll position behind it. -->
	<div data-sveltekit-reset="false">
		{#if posts.length || !countActive(filters)}
			<PostList {posts} class="md:grid-cols-2" />
		{:else}
			<p class="text-surface-800-200">No posts match these filters.</p>
		{/if}
	</div>
</div>

{@render children()}
