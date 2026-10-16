export interface PostMeta {
	/** Derived from the markdown filename, e.g. `002-alvr-config`. */
	slug: string;
	title: string;
	description: string;
	/** ISO date string (`YYYY-MM-DD`). */
	pubDate: string;
	tags: string[];
}

export interface Post extends PostMeta {
	/** Rendered HTML of the post body. */
	html: string;
}

export interface ProjectSlide {
	/**
	 * - `image`: `src` is a ready-to-use image URL (a bundled asset or an external image).
	 * - `static`: `src` is a root path to a file in `static/`; resolve it with `asset()`.
	 * - `embed`: `src` is a page to show in an iframe (e.g. a YouTube embed URL).
	 */
	type: 'image' | 'static' | 'embed';
	src: string;
	/** Alt text, or the iframe's title for embeds. */
	alt: string;
}

export interface Project {
	/** The project's folder name in `src/lib/projects`. */
	slug: string;
	name: string;
	description: string;
	codeLink?: string;
	deployLink?: string;
	tags: string[];
	skills: string[];
	slides: ProjectSlide[];
	/** Higher sorts first. Defaults to 50. */
	importance: number;
	/** `YYYY-MM-DD`. */
	startDate: string;
	/** `YYYY-MM-DD`, the same as `startDate` for one-day projects, or `null` while ongoing. */
	endDate: string | null;
}
