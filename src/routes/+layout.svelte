<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { AppBar } from '@skeletonlabs/skeleton-svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { markAppReady } from '#lib/app-ready.js';
	import favicon from '#lib/assets/favicon.svg';
	import faviconDark from '#lib/assets/favicon-dark.svg';
	import BrandIcon from '#lib/components/BrandIcon.svelte';
	import { SITE } from '#lib/site.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// The page's absolute URL (path only: the query string isn't available while prerendering).
	const pageUrl = $derived(SITE.url + page.url.pathname);

	// Children mount first, so anything that checks this during its first render can tell an
	// initial page load apart from a later client-side navigation.
	onMount(markAppReady);

	const links = [
		{ href: resolve('/about'), label: 'About' },
		{ href: resolve('/projects'), label: 'Projects' },
		{ href: resolve('/blog'), label: 'Blog' }
	];

	function isActive(href: string) {
		return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} media="(prefers-color-scheme: light)" />
	<link rel="icon" href={faviconDark} media="(prefers-color-scheme: dark)" />

	<!-- Link previews (pages add their own title/description via PageMeta). -->
	<link rel="canonical" href={pageUrl} />
	<meta property="og:site_name" content={SITE.name} />
	<meta property="og:url" content={pageUrl} />
	<meta property="og:image" content={SITE.url + SITE.image.path} />
	<meta property="og:image:width" content={String(SITE.image.width)} />
	<meta property="og:image:height" content={String(SITE.image.height)} />
	<meta property="og:image:alt" content={SITE.image.alt} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="grid min-h-screen grid-cols-1 grid-rows-[auto_1fr_auto]">
	<AppBar
		class="sticky top-0 z-10 border-b border-surface-200-800 bg-surface-100-900/85 p-0 backdrop-blur"
	>
		<!-- `items-stretch` lets the nav links fill the bar's full height. -->
		<AppBar.Toolbar
			class="mx-auto h-14 w-full max-w-6xl grid-cols-[1fr_auto] items-stretch px-3 sm:px-4"
		>
			<AppBar.Lead class="flex items-stretch">
				<a
					href={resolve('/')}
					class="mr-4 ml-2 flex items-center text-base font-bold tracking-tight max-[359px]:text-sm sm:ml-0 sm:text-lg"
				>
					vaughanm<span class="text-primary-500">.xyz</span>
				</a>
				<div class="grow sm:hidden"></div>
				{#each links as link (link.href)}
					<!-- `-mb-px` sits the underline on top of the bar's bottom border, like svelte.dev. -->
					<a
						href={link.href}
						class="-mb-px flex items-center border-b-2 border-transparent px-2 text-sm font-medium text-surface-800-200 transition-colors hover:border-surface-400-600 hover:text-surface-950-50 aria-[current=page]:border-primary-500 aria-[current=page]:text-primary-500 max-[359px]:px-1 sm:px-3"
						aria-current={isActive(link.href) ? 'page' : undefined}
					>
						{link.label}
					</a>
				{/each}
			</AppBar.Lead>
			<AppBar.Trail class="hidden items-center gap-0 sm:flex sm:gap-1" aria-label="Elsewhere">
				<a
					href="https://github.com/zeroxoneafour"
					class="btn-icon text-surface-800-200 transition-colors hover:text-primary-500 sm:btn-icon-lg"
					aria-label="GitHub"
					title="GitHub"
					rel="me"
				>
					<BrandIcon name="github" />
				</a>
				<a
					href="https://www.linkedin.com/in/vaughanm0/"
					class="btn-icon text-surface-800-200 transition-colors hover:text-primary-500 sm:btn-icon-lg"
					aria-label="LinkedIn"
					title="LinkedIn"
					rel="me"
				>
					<BrandIcon name="linkedin" />
				</a>
			</AppBar.Trail>
		</AppBar.Toolbar>
	</AppBar>

	<main class="mx-auto w-full max-w-6xl px-4 py-10">
		{@render children()}
	</main>

	<footer class="border-t border-surface-200-800 p-6 text-center text-sm text-surface-800-200">
		&copy; {new Date().getFullYear()} Vaughan Milliman
	</footer>
</div>
