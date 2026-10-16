import { error } from '@sveltejs/kit';
import { getPost, getPosts } from '#lib/server/blog.js';
import type { EntryGenerator, PageServerLoad } from './$types';

// Tell the prerenderer about every post, rather than relying on it finding them by crawling links.
export const entries: EntryGenerator = async () => {
	return (await getPosts()).map(({ slug }) => ({ slug }));
};

export const load: PageServerLoad = async ({ params }) => {
	const post = await getPost(params.slug);
	if (!post) error(404, 'Post not found');
	return { post };
};
