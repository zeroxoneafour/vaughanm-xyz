import { getPosts } from '#lib/server/blog.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { recentPosts: (await getPosts()).slice(0, 3) };
};
