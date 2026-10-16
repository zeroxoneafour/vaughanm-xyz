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
