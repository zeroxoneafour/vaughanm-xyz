<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { resolve } from '$app/paths';
	import PostList from '#lib/components/PostList.svelte';
	import ProjectLinkCard from '#lib/components/ProjectLinkCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PageMeta />

<div class="space-y-10">
	<section class="space-y-2">
		<h1 class="mb-4 h1">vaughanm<span class="text-primary-500">.xyz</span></h1>
		<p class="text-surface-800-200">
			My name is Vaughan Milliman, and I am a computer science student at the Georgia Institute of
			Technology. My programming interests are primarily centered around XR and Linux at the moment.
		</p>
		<p class="text-surface-800-200">
			You can check out my <a href={resolve('/about')} class="text-primary-500 hover:underline"
				>about page</a
			>
			and my <a href={resolve('/projects')} class="text-primary-500 hover:underline">projects</a> for
			more information.
		</p>
	</section>

	{#if data.currentProjects.length}
		<section class="space-y-4">
			<h2 class="mb-4 h3">Currently working on</h2>
			<ul class="grid gap-4">
				{#each data.currentProjects as project (project.slug)}
					<li><ProjectLinkCard {project} /></li>
				{/each}
			</ul>
		</section>
	{/if}

	<section class="space-y-4">
		<h2 class="mb-4 h3">Recent blog posts</h2>
		<PostList posts={data.recentPosts} />
	</section>
</div>
