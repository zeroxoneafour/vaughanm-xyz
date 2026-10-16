<script lang="ts">
	import FormattedDate from '#lib/components/FormattedDate.svelte';
	import ProjectLinks from '#lib/components/ProjectLinks.svelte';
	import SlideCarousel from '#lib/components/SlideCarousel.svelte';
	import TagChip from '#lib/components/TagChip.svelte';
	import type { Project } from '#lib/types.js';

	interface Props {
		project: Project;
		/** Outline the card, e.g. when it's the one linked to by the URL's `#`. */
		highlighted?: boolean;
	}

	let { project, highlighted = false }: Props = $props();
</script>

<!-- `id` makes each card linkable as /projects#<folder name>. -->
<article
	id={project.slug}
	class={[
		// `group/card`: the slide carousel shows its arrows while the card is hovered.
		'group/card flex h-full scroll-mt-24 flex-col overflow-hidden rounded-container border bg-surface-100-900 transition duration-200',
		// Hover lifts the card, without the color change that would make it look clickable.
		'hover:shadow-lg motion-safe:hover:-translate-y-0.5',
		// Highlight: a mauve outline that pulses once when it appears.
		highlighted
			? 'border-primary-500 ring-2 ring-primary-500 motion-safe:animate-highlight'
			: 'border-surface-200-800 ring-0 ring-primary-500/0'
	]}
>
	{#if project.slides.length}
		<SlideCarousel slides={project.slides} />
	{/if}

	<div class="flex flex-1 flex-col gap-3 p-5">
		<div class="space-y-1">
			<h2 class="h5">{project.name}</h2>
			<p class="text-sm text-surface-800-200">
				<FormattedDate date={project.startDate} />
				{#if project.endDate === null}
					&ndash; Present
				{:else if project.endDate !== project.startDate}
					&ndash; <FormattedDate date={project.endDate} />
				{/if}
			</p>
		</div>

		<p>{project.description}</p>

		{#if project.tags.length || project.skills.length}
			<div class="flex flex-wrap gap-2">
				{#each project.tags as tag (tag)}
					<TagChip {tag} />
				{/each}
				{#each project.skills as skill (skill)}
					<span class="chip preset-outlined-surface-300-700 text-surface-800-200">{skill}</span>
				{/each}
			</div>
		{/if}

		<ProjectLinks {project} class="mt-auto pt-2" />
	</div>
</article>
