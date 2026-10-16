import { describe, expect, it } from 'vitest';
import {
	byImportance,
	getProjects,
	parseProject,
	type ProjectAssets
} from '#lib/server/projects.js';
import type { Project } from '#lib/types.js';

const PATH = '/src/lib/projects/demo/project.json';
const assets: ProjectAssets = {
	imageUrls: {
		'/src/lib/projects/demo/1.png': '/_app/assets/1.abc.png',
		'/src/lib/projects/demo/shots/2.png': '/_app/assets/2.def.png',
		'/src/lib/projects/shared/3.png': '/_app/assets/3.ghi.png'
	},
	staticFileExists: (path) => path === '/images/static.png'
};

const minimal = { name: 'Demo', description: 'A demo project', date: '2025-05-01' };
const parse = (data: Record<string, unknown>) => parseProject(PATH, data, assets);

describe('parseProject', () => {
	it('fills in defaults for optional fields', () => {
		expect(parse(minimal)).toEqual({
			slug: 'demo',
			name: 'Demo',
			description: 'A demo project',
			codeLink: undefined,
			deployLink: undefined,
			tags: [],
			skills: [],
			slides: [],
			importance: 50,
			startDate: '2025-05-01',
			endDate: '2025-05-01'
		});
	});

	it('keeps every field when given', () => {
		const project = parse({
			...minimal,
			codeLink: 'https://github.com/x/y',
			deployLink: 'https://x.dev',
			tags: ['web'],
			skills: ['svelte', 'tailwind'],
			importance: 90
		});
		expect(project).toMatchObject({
			codeLink: 'https://github.com/x/y',
			deployLink: 'https://x.dev',
			tags: ['web'],
			skills: ['svelte', 'tailwind'],
			importance: 90
		});
	});

	it('takes its slug from the folder name', () => {
		expect(parseProject('/src/lib/projects/my-thing/project.json', minimal, assets).slug).toBe(
			'my-thing'
		);
	});

	describe('dates', () => {
		const base = { name: 'Demo', description: 'd' };

		it('uses "date" as both start and end (a one-day project)', () => {
			expect(parse({ ...base, date: '2024-01-02' })).toMatchObject({
				startDate: '2024-01-02',
				endDate: '2024-01-02'
			});
		});

		it('uses startDate and endDate as a range', () => {
			expect(parse({ ...base, startDate: '2024-01-02', endDate: '2024-03-04' })).toMatchObject({
				startDate: '2024-01-02',
				endDate: '2024-03-04'
			});
		});

		it('treats a missing endDate as ongoing', () => {
			expect(parse({ ...base, startDate: '2024-01-02' }).endDate).toBeNull();
		});

		it('treats endDate "ongoing" as ongoing', () => {
			expect(parse({ ...base, startDate: '2024-01-02', endDate: 'ongoing' }).endDate).toBeNull();
		});

		it('allows a range that starts and ends on the same day', () => {
			expect(parse({ ...base, startDate: '2024-01-02', endDate: '2024-01-02' }).endDate).toBe(
				'2024-01-02'
			);
		});

		it('rejects an end before the start', () => {
			expect(() => parse({ ...base, startDate: '2024-03-04', endDate: '2024-01-02' })).toThrow(
				/"endDate" is before "startDate"/
			);
		});

		it('rejects "date" together with startDate/endDate', () => {
			expect(() => parse({ ...base, date: '2024-01-02', startDate: '2024-01-02' })).toThrow(
				/either "date" or "startDate"\/"endDate"/
			);
		});

		it('requires some date', () => {
			expect(() => parse(base)).toThrow(/needs a "date" or "startDate"/);
		});

		it('rejects dates that are not YYYY-MM-DD', () => {
			expect(() => parse({ ...base, date: '2024/01/02' })).toThrow(/"date" must be YYYY-MM-DD/);
			expect(() => parse({ ...base, startDate: '2024-01-02', endDate: 'soon' })).toThrow(
				/"endDate" must be YYYY-MM-DD/
			);
		});
	});

	describe('validation', () => {
		it('requires a name and description', () => {
			expect(() => parse({ description: 'd', date: '2024-01-01' })).toThrow(/"name"/);
			expect(() => parse({ name: 'n', date: '2024-01-01' })).toThrow(/"description"/);
			expect(() => parse({ ...minimal, name: '' })).toThrow(/"name" must be a non-empty string/);
		});

		it('rejects non-string links', () => {
			expect(() => parse({ ...minimal, codeLink: 42 })).toThrow(/"codeLink"/);
		});

		it('rejects tags/skills that are not arrays of strings', () => {
			expect(() => parse({ ...minimal, tags: 'web' })).toThrow(/"tags" must be an array/);
			expect(() => parse({ ...minimal, skills: ['ok', 3] })).toThrow(/"skills" must be an array/);
		});

		it('rejects a non-numeric importance', () => {
			expect(() => parse({ ...minimal, importance: 'high' })).toThrow(/"importance"/);
			expect(() => parse({ ...minimal, importance: Number.NaN })).toThrow(/"importance"/);
		});

		it('names the project and file in errors', () => {
			expect(() => parse({})).toThrow(`Project "demo" (${PATH})`);
		});
	});

	describe('slides', () => {
		const slide = (src: string) => parse({ ...minimal, slides: [{ src, alt: 'Alt' }] }).slides[0];

		it('resolves a filename next to project.json to its bundled URL', () => {
			expect(slide('1.png')).toEqual({ type: 'image', src: '/_app/assets/1.abc.png', alt: 'Alt' });
		});

		it('resolves relative paths, including subfolders and ../', () => {
			expect(slide('shots/2.png').src).toBe('/_app/assets/2.def.png');
			expect(slide('./1.png').src).toBe('/_app/assets/1.abc.png');
			expect(slide('../shared/3.png').src).toBe('/_app/assets/3.ghi.png');
		});

		it('treats a leading / as a file in static/', () => {
			expect(slide('/images/static.png')).toEqual({
				type: 'static',
				src: '/images/static.png',
				alt: 'Alt'
			});
		});

		it('shows URLs to image files as images', () => {
			expect(slide('https://example.com/a/pic.webp')).toEqual({
				type: 'image',
				src: 'https://example.com/a/pic.webp',
				alt: 'Alt'
			});
			// The extension is checked on the path, ignoring any query string.
			expect(slide('https://example.com/pic.JPG?size=large').type).toBe('image');
		});

		it('embeds other URLs', () => {
			expect(slide('https://www.youtube.com/embed/abc?si=x')).toEqual({
				type: 'embed',
				src: 'https://www.youtube.com/embed/abc?si=x',
				alt: 'Alt'
			});
			expect(slide('http://example.com/page').type).toBe('embed');
		});

		it('keeps slide order', () => {
			const slides = parse({
				...minimal,
				slides: [
					{ src: 'shots/2.png', alt: 'second' },
					{ src: '1.png', alt: 'first' }
				]
			}).slides;
			expect(slides.map((s) => s.alt)).toEqual(['second', 'first']);
		});

		it('fails on missing files', () => {
			expect(() => slide('missing.png')).toThrow(/"missing.png" not found relative to/);
			expect(() => slide('/images/missing.png')).toThrow(/not found in static\//);
		});

		it('requires a src and alt', () => {
			expect(() => parse({ ...minimal, slides: [{ src: '1.png' }] })).toThrow(
				/slides\[0\] needs a "src" and an "alt"/
			);
			expect(() => parse({ ...minimal, slides: [{ src: '', alt: 'a' }] })).toThrow(/slides\[0\]/);
			expect(() => parse({ ...minimal, slides: [null] })).toThrow(/slides\[0\]/);
		});
	});
});

describe('byImportance', () => {
	const project = (importance: number, startDate: string) => ({ importance, startDate }) as Project;

	it('puts higher importance first', () => {
		expect([project(10, '2025-01-01'), project(90, '2024-01-01')].sort(byImportance)).toEqual([
			project(90, '2024-01-01'),
			project(10, '2025-01-01')
		]);
	});

	it('breaks ties with the most recent start', () => {
		expect([project(50, '2024-01-01'), project(50, '2025-01-01')].sort(byImportance)).toEqual([
			project(50, '2025-01-01'),
			project(50, '2024-01-01')
		]);
	});
});

describe('getProjects (the real src/lib/projects)', () => {
	const projects = getProjects();

	it('loads every project.json without errors', () => {
		expect(projects.length).toBeGreaterThan(0);
	});

	it('has unique slugs (they are used as page anchors)', () => {
		const slugs = projects.map((p) => p.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('is sorted by importance', () => {
		expect([...projects].sort(byImportance)).toEqual(projects);
	});

	it('returns a copy, so callers cannot reorder the shared list', () => {
		getProjects().reverse();
		expect(getProjects()).toEqual(projects);
	});
});
