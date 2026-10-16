import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PageMeta from '#lib/components/PageMeta.svelte';
import { SITE } from '#lib/site.js';

const meta = (key: string) =>
	document.head
		.querySelector(`meta[property="${key}"], meta[name="${key}"]`)
		?.getAttribute('content');

describe('PageMeta', () => {
	it('uses the site name and default description on the home page', () => {
		render(PageMeta);
		expect(document.title).toBe('vaughanm.xyz');
		expect(meta('og:title')).toBe('vaughanm.xyz');
		expect(meta('description')).toBe(SITE.description);
		expect(meta('og:description')).toBe(SITE.description);
		expect(meta('og:type')).toBe('website');
	});

	it('titles other pages "<title> | vaughanm.xyz", with the bare title for previews', () => {
		render(PageMeta, { title: 'Projects' });
		expect(document.title).toBe('Projects | vaughanm.xyz');
		expect(meta('og:title')).toBe('Projects');
	});

	it('uses a page’s own description and type (blog posts)', () => {
		render(PageMeta, { title: 'Configuring ALVR', description: 'A guide', type: 'article' });
		expect(meta('description')).toBe('A guide');
		expect(meta('og:description')).toBe('A guide');
		expect(meta('og:type')).toBe('article');
	});
});

describe('SITE', () => {
	it('points previews at an absolute https URL and a static image', () => {
		expect(SITE.url).toMatch(/^https:\/\/[^/]+$/);
		expect(SITE.image.path).toMatch(/^\/.+\.png$/);
	});
});
