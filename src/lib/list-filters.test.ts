import { describe, expect, it } from 'vitest';
import {
	countActive,
	countTags,
	localISODate,
	matchesFilters,
	parseFilters,
	toSearchParams,
	type ListFilters
} from '#lib/list-filters.js';

const params = (query: string) => new URLSearchParams(query);

describe('parseFilters', () => {
	it('returns no filters for an empty query', () => {
		expect(parseFilters(params(''))).toEqual({
			tags: [],
			from: undefined,
			to: undefined,
			sort: undefined
		});
	});

	it('reads repeated tags, dropping duplicates', () => {
		expect(parseFilters(params('tag=vr&tag=linux&tag=vr')).tags).toEqual(['vr', 'linux']);
	});

	it('reads YYYY-MM-DD dates and ignores anything else', () => {
		expect(parseFilters(params('from=2025-01-02&to=2025-12-31'))).toMatchObject({
			from: '2025-01-02',
			to: '2025-12-31'
		});
		expect(parseFilters(params('from=2025-1-2&to=yesterday'))).toMatchObject({
			from: undefined,
			to: undefined
		});
	});

	it('only accepts sort values the list allows', () => {
		expect(parseFilters(params('sort=newest'), ['newest']).sort).toBe('newest');
		expect(parseFilters(params('sort=bogus'), ['newest']).sort).toBeUndefined();
		expect(parseFilters(params('sort=newest')).sort).toBeUndefined();
	});
});

describe('toSearchParams', () => {
	it('round-trips through parseFilters', () => {
		const filters: ListFilters = {
			tags: ['vr', 'web'],
			from: '2025-01-01',
			to: '2025-06-30',
			sort: 'newest'
		};
		expect(parseFilters(toSearchParams(filters), ['newest'])).toEqual(filters);
	});

	it('omits unset values, so no filters is an empty query', () => {
		expect(toSearchParams({ tags: [] }).toString()).toBe('');
		expect(toSearchParams({ tags: ['vr'] }).toString()).toBe('tag=vr');
	});
});

describe('countActive', () => {
	it('counts each tag, date bound and a non-default sort', () => {
		expect(countActive({ tags: [] })).toBe(0);
		expect(countActive({ tags: ['a', 'b'], from: '2025-01-01' })).toBe(3);
		expect(countActive({ tags: ['a'], from: '2025-01-01', to: '2025-02-01', sort: 'newest' })).toBe(
			4
		);
	});
});

describe('matchesFilters', () => {
	const item = { tags: ['vr', 'linux'], start: '2025-03-01', end: '2025-03-31' };

	it('matches anything when there are no filters', () => {
		expect(matchesFilters(item, { tags: [] })).toBe(true);
	});

	it('requires every selected tag', () => {
		expect(matchesFilters(item, { tags: ['vr'] })).toBe(true);
		expect(matchesFilters(item, { tags: ['vr', 'linux'] })).toBe(true);
		expect(matchesFilters(item, { tags: ['vr', 'web'] })).toBe(false);
	});

	it('matches when the item was active at any point in the range (overlap)', () => {
		// Range inside the item's period.
		expect(matchesFilters(item, { tags: [], from: '2025-03-10', to: '2025-03-20' })).toBe(true);
		// Range covering the whole period.
		expect(matchesFilters(item, { tags: [], from: '2025-01-01', to: '2025-12-31' })).toBe(true);
		// Overlapping only the start or only the end.
		expect(matchesFilters(item, { tags: [], from: '2025-02-01', to: '2025-03-05' })).toBe(true);
		expect(matchesFilters(item, { tags: [], from: '2025-03-25', to: '2025-04-30' })).toBe(true);
		// Entirely before or after.
		expect(matchesFilters(item, { tags: [], to: '2025-02-28' })).toBe(false);
		expect(matchesFilters(item, { tags: [], from: '2025-04-01' })).toBe(false);
	});

	it('treats both bounds as inclusive', () => {
		expect(matchesFilters(item, { tags: [], to: '2025-03-01' })).toBe(true);
		expect(matchesFilters(item, { tags: [], from: '2025-03-31' })).toBe(true);
	});

	it('handles single-day items (blog posts)', () => {
		const post = { tags: [], start: '2025-03-15', end: '2025-03-15' };
		expect(matchesFilters(post, { tags: [], from: '2025-03-15', to: '2025-03-15' })).toBe(true);
		expect(matchesFilters(post, { tags: [], from: '2025-03-16' })).toBe(false);
		expect(matchesFilters(post, { tags: [], to: '2025-03-14' })).toBe(false);
	});

	it('combines tags and dates', () => {
		expect(matchesFilters(item, { tags: ['vr'], from: '2025-04-01' })).toBe(false);
		expect(matchesFilters(item, { tags: ['web'], from: '2025-03-01' })).toBe(false);
		expect(matchesFilters(item, { tags: ['vr'], from: '2025-03-01' })).toBe(true);
	});
});

describe('countTags', () => {
	it('counts tags across items, sorted alphabetically', () => {
		expect(countTags([{ tags: ['web', 'vr'] }, { tags: ['vr'] }, { tags: [] }])).toEqual([
			['vr', 2],
			['web', 1]
		]);
	});

	it('returns nothing for no items', () => {
		expect(countTags([])).toEqual([]);
	});
});

describe('localISODate', () => {
	it('formats the local calendar date with zero padding', () => {
		expect(localISODate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
		expect(localISODate(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31');
	});
});
