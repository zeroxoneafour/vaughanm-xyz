import { getPosts } from '#lib/server/blog.js';
import { getProjects } from '#lib/server/projects.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		// Ongoing projects (no end date), most important first.
		currentProjects: getProjects().filter((project) => project.endDate === null),
		recentPosts: (await getPosts()).slice(0, 3)
	};
};
