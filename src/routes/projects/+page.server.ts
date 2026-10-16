import { getProjects } from '#lib/server/projects.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => {
	return { projects: getProjects() };
};
