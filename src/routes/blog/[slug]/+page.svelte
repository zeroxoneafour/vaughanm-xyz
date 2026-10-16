<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { resolve } from '$app/paths';
	import { getBlogListHref } from '#lib/blog-context.js';
	import FormattedDate from '#lib/components/FormattedDate.svelte';
	import RouteModal from '#lib/components/RouteModal.svelte';
	import TagChip from '#lib/components/TagChip.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const post = $derived(data.post);

	// The /blog layout renders the post list behind this card; closing returns to it.
	const listHref = getBlogListHref();
</script>

<PageMeta title={post.title} description={post.description || undefined} type="article" />

<RouteModal title={post.title} closeHref={listHref()}>
	<div class="space-y-8">
		<div class="space-y-3">
			<p class="text-sm text-surface-800-200">
				<FormattedDate date={post.pubDate} />
			</p>
			{#if post.tags.length}
				<ul class="flex flex-wrap gap-2">
					{#each post.tags as tag (tag)}
						<li><TagChip {tag} href={resolve(`/blog?tag=${encodeURIComponent(tag)}`)} /></li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Compiled from our own markdown at build time by `#lib/server/blog`. -->
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div class="prose max-w-none">{@html post.html}</div>
	</div>
</RouteModal>
