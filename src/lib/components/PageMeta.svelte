<!--
	A page's <title>, description and link-preview (Open Graph / Twitter) title and description.
	The site-wide preview tags (image, URL, card type) are set in the root layout.
-->
<script lang="ts">
	import { SITE } from '#lib/site.js';

	interface Props {
		/** The page's own title; shown as "<title> | vaughanm.xyz". Omit for the site name alone. */
		title?: string;
		description?: string;
		/** `article` for blog posts; `website` otherwise. */
		type?: 'website' | 'article';
	}

	let { title, description = SITE.description, type = 'website' }: Props = $props();

	const fullTitle = $derived(title ? `${title} | ${SITE.name}` : SITE.name);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title ?? SITE.name} />
	<meta property="og:description" content={description} />
	<meta property="og:type" content={type} />
</svelte:head>
