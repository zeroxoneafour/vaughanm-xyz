import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Every route is prerendered (see `src/routes/+layout.ts`), so the whole site is emitted
			// as static files into `build/`. `strict` fails the build if any route can't be prerendered.
			// `404.html` is served by most static hosts for unknown paths and renders `+error.svelte`.
			adapter: adapter({ fallback: '404.html', strict: true })
		})
	]
});
