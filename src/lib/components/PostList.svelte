<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import { resolve } from '$app/paths';
	import FormattedDate from '#lib/components/FormattedDate.svelte';
	import TagChip from '#lib/components/TagChip.svelte';
	import type { PostMeta } from '#lib/types.js';

	let { posts, class: className }: { posts: PostMeta[]; class?: ClassValue } = $props();
</script>

<ul class={['grid gap-4', className]}>
	{#each posts as post (post.slug)}
		<li>
			<a
				href={resolve('/blog/[slug]', { slug: post.slug })}
				class="group flex h-full flex-col gap-2 rounded-container border border-surface-200-800 bg-surface-100-900 p-5 transition hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-lg"
			>
				<h3 class="h5 transition-colors group-hover:text-primary-500">{post.title}</h3>
				<p class="text-sm text-surface-800-200">
					<FormattedDate date={post.pubDate} />
					{#if post.description}&middot; {post.description}{/if}
				</p>
				{#if post.tags.length}
					<div class="mt-auto flex flex-wrap gap-2">
						{#each post.tags as tag (tag)}
							<TagChip {tag} />
						{/each}
					</div>
				{/if}
			</a>
		</li>
	{:else}
		<li class="text-surface-800-200">No posts yet.</li>
	{/each}
</ul>
