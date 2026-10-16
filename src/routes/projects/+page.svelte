<script lang="ts">
	import PageMeta from '#lib/components/PageMeta.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import FilterPanel from '#lib/components/FilterPanel.svelte';
	import ProjectCard from '#lib/components/ProjectCard.svelte';
	import {
		countActive,
		countTags,
		localISODate,
		matchesFilters,
		parseFilters,
		toSearchParams,
		type ListFilters
	} from '#lib/list-filters.js';
	import { scrollToElement } from '#lib/scroll.js';
	import type { Project } from '#lib/types.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** Sort orders other than the default (importance), as they appear in `?sort=`. */
	const SORTS = ['newest'] as const;
	type Sort = (typeof SORTS)[number] | 'importance';
	const sortLabels: Record<Sort, string> = {
		importance: 'Importance',
		newest: 'Newest'
	};

	// Prerendered, so the query string is only readable once hydrated (see the blog layout).
	let hydrated = $state(false);
	onMount(() => {
		hydrated = true;
	});

	const filters = $derived(
		hydrated ? parseFilters(page.url.searchParams, SORTS) : ({ tags: [] } as ListFilters)
	);
	// The project linked to by the URL's `#`, e.g. /projects#polonium. Highlighted from the URL rather
	// than CSS `:target`, which doesn't update on client-side navigation.
	const linkedSlug = $derived(hydrated ? decodeURIComponent(page.url.hash.slice(1)) : '');

	// Arriving via a link to a project (e.g. a home page card, which keeps the current scroll
	// position): scroll to its card smoothly. Direct loads use the browser's own jump, and Back/Forward
	// restore the previous position.
	afterNavigate(({ type, to }) => {
		if ((type !== 'link' && type !== 'goto') || !to?.url.hash) return;
		const card = document.getElementById(decodeURIComponent(to.url.hash.slice(1)));
		if (card) scrollToElement(card);
	});

	const sort = $derived((filters.sort ?? 'importance') as Sort);

	// Ongoing projects run until today, computed in the browser rather than at build time.
	const today = $derived(hydrated ? localISODate(new Date()) : '');
	const endOf = (project: Project) => project.endDate ?? (today || project.startDate);

	const compare: Record<Sort, (a: Project, b: Project) => number> = {
		importance: (a, b) => b.importance - a.importance,
		newest: (a, b) => endOf(b).localeCompare(endOf(a))
	};

	const projects = $derived(
		data.projects
			.filter((project) =>
				matchesFilters(
					{ tags: project.tags, start: project.startDate, end: endOf(project) },
					filters
				)
			)
			.sort((a, b) => compare[sort](a, b) || b.startDate.localeCompare(a.startDate))
	);
	const tags = $derived(countTags(data.projects));

	// The date pickers default to the whole range: the earliest start through today.
	const defaultDates = $derived({
		from: data.projects.map((project) => project.startDate).sort()[0] ?? '',
		to: today
	});

	function href(next: ListFilters) {
		const query = toSearchParams(next).toString();
		return query ? resolve(`/projects?${query}`) : resolve('/projects');
	}

	function setSort(value: string) {
		goto(href({ ...filters, sort: value === 'importance' ? undefined : value }), {
			replace: true,
			reset: false
		});
	}
</script>

<PageMeta title="Projects" />

<div class="space-y-6">
	<FilterPanel title="Projects" label="Filter projects" {filters} {tags} {defaultDates} {href}>
		{#snippet extra()}
			<label class="label w-auto">
				<span class="label-text">Sort by</span>
				<select
					class="select pr-1 pl-2"
					value={sort}
					onchange={(e) => setSort(e.currentTarget.value)}
				>
					{#each Object.entries(sortLabels) as [value, label] (value)}
						<option {value}>{label}</option>
					{/each}
				</select>
			</label>
		{/snippet}
	</FilterPanel>

	{#if projects.length}
		<ul class="grid gap-4 md:grid-cols-2">
			{#each projects as project (project.slug)}
				<li><ProjectCard {project} highlighted={project.slug === linkedSlug} /></li>
			{/each}
		</ul>
	{:else if countActive(filters)}
		<p class="text-surface-800-200">No projects match these filters.</p>
	{:else}
		<p class="text-surface-800-200">No projects yet.</p>
	{/if}
</div>
