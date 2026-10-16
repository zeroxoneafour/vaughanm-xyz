import { getPosts } from '#lib/server/blog.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return { posts: await getPosts() };
};
