/**
 * Filters for tagged, dated lists (blog posts, projects), stored in the URL as
 * `?tag=a&tag=b&from=YYYY-MM-DD&to=YYYY-MM-DD&sort=…`.
 */
export interface ListFilters {
	/** Items must have every one of these tags. */
	tags: string[];
	/** Inclusive lower bound (`YYYY-MM-DD`). */
	from?: string;
	/** Inclusive upper bound (`YYYY-MM-DD`). */
	to?: string;
	/** A non-default sort order; omitted when using the list's default. */
	sort?: string;
}

/** What filters match against: an item's tags and the (inclusive) period it covers. */
export interface Filterable {
	tags: string[];
	/** `YYYY-MM-DD`. */
	start: string;
	/** `YYYY-MM-DD`; the same as `start` for single-day items like blog posts. */
	end: string;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** `sorts` lists the accepted non-default sort values; anything else is ignored. */
export function parseFilters(
	params: Pick<URLSearchParams, 'get' | 'getAll'>,
	sorts: readonly string[] = []
): ListFilters {
	const date = (key: string) => {
		const value = params.get(key);
		return value && ISO_DATE.test(value) ? value : undefined;
	};
	const sort = params.get('sort') ?? undefined;
	return {
		tags: [...new Set(params.getAll('tag'))],
		from: date('from'),
		to: date('to'),
		sort: sort && sorts.includes(sort) ? sort : undefined
	};
}

export function toSearchParams({ tags, from, to, sort }: ListFilters): URLSearchParams {
	const params = new URLSearchParams();
	for (const tag of tags) params.append('tag', tag);
	if (from) params.set('from', from);
	if (to) params.set('to', to);
	if (sort) params.set('sort', sort);
	return params;
}

/** How many filters (or a non-default sort) are applied. */
export function countActive({ tags, from, to, sort }: ListFilters): number {
	return tags.length + Number(!!from) + Number(!!to) + Number(!!sort);
}

/**
 * Whether an item has every selected tag and its period overlaps the date range, i.e. it was
 * active at some point between `from` and `to`. Dates are `YYYY-MM-DD`, so strings compare in order.
 */
export function matchesFilters(item: Filterable, { tags, from, to }: ListFilters): boolean {
	return (
		tags.every((tag) => item.tags.includes(tag)) &&
		(!from || item.end >= from) &&
		(!to || item.start <= to)
	);
}

/** Every tag with how many items have it, alphabetically. */
export function countTags(items: { tags: string[] }[]): [tag: string, count: number][] {
	const counts = new Map<string, number>();
	for (const tag of items.flatMap((item) => item.tags)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
	return [...counts].sort(([a], [b]) => a.localeCompare(b));
}

/** Local `YYYY-MM-DD`, so "today" matches the visitor's calendar rather than UTC. */
export function localISODate(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
