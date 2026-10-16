<!--
	A compact project card (name, Code/Visit buttons, description) that links to the project on /projects.
	The title's link is stretched over the whole card, so clicking anywhere goes there, while the
	Code/Visit buttons sit above it and keep working. (Links can't be nested, so the card itself
	can't be one big <a>.)
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import ProjectLinks from '#lib/components/ProjectLinks.svelte';
	import type { Project } from '#lib/types.js';

	let { project }: { project: Project } = $props();
</script>

<article
	class="group relative flex h-full flex-wrap items-center justify-between gap-4 rounded-container border border-surface-200-800 bg-surface-100-900 p-5 transition hover:-translate-y-0.5 hover:border-primary-500 hover:shadow-lg"
>
	<h3 class="h5 transition-colors group-hover:text-primary-500">
		<!-- `reset="false"`: /projects scrolls to the card itself, smoothly (see its afterNavigate). -->
		<a
			href={resolve(`/projects#${project.slug}`)}
			data-sveltekit-reset="false"
			class="after:absolute after:inset-0 after:rounded-container"
		>
			{project.name}
		</a>
	</h3>
	<ProjectLinks {project} class="relative" />
	<!-- `w-full` wraps it onto its own line below the title and buttons. -->
	<p class="w-full text-sm text-surface-800-200">{project.description}</p>
</article>
