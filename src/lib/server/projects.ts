import { existsSync } from 'node:fs';
import { posix } from 'node:path';
import type { Project, ProjectSlide } from '#lib/types.js';

// Each project is a folder in `src/lib/projects` with a `project.json`. Slide images next to it are
// imported as assets, so they're fingerprinted and copied into the build.
const sources = import.meta.glob<Record<string, unknown>>('/src/lib/projects/*/project.json', {
	import: 'default',
	eager: true
});
const imageUrls = import.meta.glob<string>(
	'/src/lib/projects/*/**/*.{png,jpg,jpeg,gif,webp,avif,svg}',
	{ import: 'default', eager: true }
);

const DEFAULT_IMPORTANCE = 50;
const URL_PATTERN = /^https?:\/\//i;
const IMAGE_EXTENSION = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Where a project's slide files can come from. Passed in so parsing can be tested without files. */
export interface ProjectAssets {
	/** Bundled image URLs, keyed by source path (e.g. `/src/lib/projects/foo/1.png`). */
	imageUrls: Record<string, string>;
	/** Whether a root path (e.g. `/images/a.png`) exists in `static/`. */
	staticFileExists: (path: string) => boolean;
}

/**
 * Validates one `project.json` (its source `path` and parsed `data`) and normalizes it into a
 * `Project`. Throws a descriptive error naming the project for anything invalid, so a bad file
 * fails the build instead of rendering a broken card.
 */
export function parseProject(
	path: string,
	data: Record<string, unknown>,
	{ imageUrls, staticFileExists }: ProjectAssets
): Project {
	const dir = path.slice(0, path.lastIndexOf('/'));
	const slug = dir.slice(dir.lastIndexOf('/') + 1);
	const fail = (message: string): never => {
		throw new Error(`Project "${slug}" (${path}): ${message}`);
	};

	const string = (key: string, required = false) => {
		const value = data[key];
		if (value === undefined && !required) return undefined;
		if (typeof value !== 'string' || !value) fail(`"${key}" must be a non-empty string`);
		return value as string;
	};
	const strings = (key: string) => {
		const value = data[key] ?? [];
		if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
			fail(`"${key}" must be an array of strings`);
		}
		return value as string[];
	};
	const date = (key: string) => {
		const value = string(key);
		if (value !== undefined && !ISO_DATE.test(value)) fail(`"${key}" must be YYYY-MM-DD`);
		return value;
	};

	// Dates: `date` alone is a one-day project. Otherwise `startDate`, with an `endDate` that's
	// either a date or missing/"ongoing" for a project that hasn't ended yet.
	let startDate: string;
	let endDate: string | null;
	if (data.date !== undefined) {
		if (data.startDate !== undefined || data.endDate !== undefined) {
			fail('use either "date" or "startDate"/"endDate", not both');
		}
		startDate = endDate = date('date')!;
	} else {
		startDate = date('startDate') ?? fail('needs a "date" or "startDate"');
		endDate = data.endDate === undefined || data.endDate === 'ongoing' ? null : date('endDate')!;
		if (endDate !== null && endDate < startDate) fail('"endDate" is before "startDate"');
	}

	const importance = data.importance ?? DEFAULT_IMPORTANCE;
	if (typeof importance !== 'number' || !Number.isFinite(importance)) {
		fail('"importance" must be a number');
	}

	// A slide's `src` is one of:
	// - a URL: shown as an image if it points at an image file, otherwise embedded in an iframe
	// - a path starting with `/`: a file in `static/`, i.e. served from the site root
	// - anything else (`1.png`, `shots/1.png`): a file relative to `project.json`
	const slides = ((data.slides ?? []) as unknown[]).map((slide, i): ProjectSlide => {
		const { src, alt } = (slide ?? {}) as Record<string, unknown>;
		if (typeof src !== 'string' || !src || typeof alt !== 'string') {
			return fail(`slides[${i}] needs a "src" and an "alt" string`);
		}
		if (URL_PATTERN.test(src)) {
			return { type: IMAGE_EXTENSION.test(new URL(src).pathname) ? 'image' : 'embed', src, alt };
		}
		if (src.startsWith('/')) {
			if (!staticFileExists(src)) fail(`slides[${i}]: "${src}" not found in static/`);
			return { type: 'static', src, alt };
		}
		const url =
			imageUrls[posix.join(dir, src)] ??
			fail(`slides[${i}]: "${src}" not found relative to ${dir}`);
		return { type: 'image', src: url, alt };
	});

	return {
		slug,
		name: string('name', true)!,
		description: string('description', true)!,
		codeLink: string('codeLink'),
		deployLink: string('deployLink'),
		tags: strings('tags'),
		skills: strings('skills'),
		slides,
		importance: importance as number,
		startDate,
		endDate
	};
}

/** Most important first; ties go to the most recently started. */
export function byImportance(a: Project, b: Project): number {
	return b.importance - a.importance || b.startDate.localeCompare(a.startDate);
}

const assets: ProjectAssets = {
	imageUrls,
	staticFileExists: (path) => existsSync(`static${path}`)
};
const projects = Object.entries(sources)
	.map(([path, data]) => parseProject(path, data, assets))
	.sort(byImportance);

/** All projects, most important first. */
export function getProjects(): Project[] {
	return [...projects];
}
