import type { PostMeta } from '#lib/types.js';

/** Blog list filters, stored in the URL as `?tag=a&tag=b&from=YYYY-MM-DD&to=YYYY-MM-DD`. */
export interface BlogFilters {
	/** Posts must have every one of these tags. */
	tags: string[];
	/** Inclusive lower bound on `pubDate` (`YYYY-MM-DD`). */
	from?: string;
	/** Inclusive upper bound on `pubDate` (`YYYY-MM-DD`). */
	to?: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseFilters(params: Pick<URLSearchParams, 'get' | 'getAll'>): BlogFilters {
	const date = (key: string) => {
		const value = params.get(key);
		return value && ISO_DATE.test(value) ? value : undefined;
	};
	return { tags: [...new Set(params.getAll('tag'))], from: date('from'), to: date('to') };
}

export function toSearchParams({ tags, from, to }: BlogFilters): URLSearchParams {
	const params = new URLSearchParams();
	for (const tag of tags) params.append('tag', tag);
	if (from) params.set('from', from);
	if (to) params.set('to', to);
	return params;
}

export function hasFilters({ tags, from, to }: BlogFilters): boolean {
	return tags.length > 0 || !!from || !!to;
}

export function matchesFilters(post: PostMeta, { tags, from, to }: BlogFilters): boolean {
	// pubDate is `YYYY-MM-DD`, so string comparison orders dates correctly.
	return (
		tags.every((tag) => post.tags.includes(tag)) &&
		(!from || post.pubDate >= from) &&
		(!to || post.pubDate <= to)
	);
}
