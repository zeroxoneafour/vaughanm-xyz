<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} | vaughanm.xyz</title>
</svelte:head>

<div class="space-y-4">
	<h1 class="mb-4 h1">{page.status}</h1>
	<p class="text-surface-800-200">{page.error?.message}</p>
	<a href={resolve('/')} class="btn preset-filled">Go home</a>
</div>
