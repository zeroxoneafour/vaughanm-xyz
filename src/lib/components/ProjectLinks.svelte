<!-- A project's Code and Visit buttons; renders nothing if it has neither link. -->
<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import CodeIcon from '@lucide/svelte/icons/code';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';
	import type { Project } from '#lib/types.js';

	let { project, class: className }: { project: Project; class?: ClassValue } = $props();
</script>

{#if project.codeLink || project.deployLink}
	<div class={['flex flex-wrap gap-2', className]}>
		{#if project.codeLink}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external URL -->
			<a href={project.codeLink} class="btn preset-tonal">
				<CodeIcon />
				<span>Code</span>
			</a>
		{/if}
		{#if project.deployLink}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external URL -->
			<a href={project.deployLink} class="btn preset-filled-primary-500">
				<ExternalLinkIcon />
				<span>Visit</span>
			</a>
		{/if}
	</div>
{/if}
