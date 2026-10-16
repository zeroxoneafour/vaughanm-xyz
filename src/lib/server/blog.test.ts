import { describe, expect, it } from 'vitest';
import { compilePost, getPost, getPosts } from '#lib/server/blog.js';

const post = (frontMatter: string, body = 'Hello.') => `---\n${frontMatter}\n---\n\n${body}\n`;
const compile = (raw: string, path = '/src/lib/blog/010-demo.md') => compilePost(path, raw);

describe('compilePost: metadata', () => {
	it('reads front matter and takes the slug from the file name', async () => {
		const { meta } = await compile(
			post('title: Demo\ndescription: A demo\npubDate: 2025-04-05\ntags: [vr, linux]')
		);
		expect(meta).toEqual({
			slug: '010-demo',
			title: 'Demo',
			description: 'A demo',
			pubDate: '2025-04-05',
			tags: ['vr', 'linux']
		});
	});

	it('defaults the description and tags', async () => {
		const { meta } = await compile(post('title: Demo\npubDate: 2025-04-05'));
		expect(meta.description).toBe('');
		expect(meta.tags).toEqual([]);
	});

	it('keeps a YYYY-MM-DD date exactly, whatever the time zone', async () => {
		const { meta } = await compile(post('title: Demo\npubDate: "2025-01-01"'));
		expect(meta.pubDate).toBe('2025-01-01');
	});

	it('normalizes other date formats to YYYY-MM-DD', async () => {
		const { meta } = await compile(post('title: Demo\npubDate: 2025-04-05T12:00:00Z'));
		expect(meta.pubDate).toBe('2025-04-05');
	});

	it('requires a title', async () => {
		await expect(compile(post('pubDate: 2025-04-05'))).rejects.toThrow(
			'Blog post "010-demo" is missing a title'
		);
	});

	it('requires a valid date', async () => {
		await expect(compile(post('title: Demo'))).rejects.toThrow(/invalid or missing pubDate/);
		await expect(compile(post('title: Demo\npubDate: not a date'))).rejects.toThrow(
			/invalid or missing pubDate/
		);
	});
});

describe('compilePost: HTML', () => {
	const html = async (body: string) =>
		(await compile(post('title: Demo\npubDate: 2025-04-05', body))).html;

	it('leaves the front matter out of the HTML', async () => {
		const out = await html('Body text.');
		expect(out).not.toContain('title:');
		expect(out).toContain('<p>Body text.</p>');
	});

	it('gives headings ids so #anchors work', async () => {
		expect(await html('## Quick Settings')).toContain(
			'<h2 id="quick-settings">Quick Settings</h2>'
		);
	});

	it('supports GitHub-flavored markdown', async () => {
		const out = await html('| a | b |\n| - | - |\n| 1 | 2 |\n\n~~old~~ and https://example.com');
		expect(out).toContain('<table>');
		expect(out).toContain('<del>old</del>');
		expect(out).toContain('<a href="https://example.com">');
	});

	it('lets inline code break after each /', async () => {
		expect(await html('Go to `~/a/b/c`.')).toContain('<code>~/<wbr>a/<wbr>b/<wbr>c</code>');
	});

	it('leaves inline code without slashes alone', async () => {
		expect(await html('Run `make`.')).toContain('<code>make</code>');
	});

	it('does not touch code blocks', async () => {
		const out = await html('```\ncd ~/a/b\n```');
		expect(out).toContain('cd ~/a/b');
		expect(out).not.toContain('<wbr>');
	});
});

describe('getPosts / getPost (the real src/lib/blog)', () => {
	it('lists every post, newest first, without bodies', async () => {
		const posts = await getPosts();
		expect(posts.length).toBeGreaterThan(0);
		const dates = posts.map((p) => p.pubDate);
		expect(dates).toEqual([...dates].sort().reverse());
		for (const p of posts) expect(p).not.toHaveProperty('html');
	});

	it('has unique slugs', async () => {
		const slugs = (await getPosts()).map((p) => p.slug);
		expect(new Set(slugs).size).toBe(slugs.length);
	});

	it('returns a post with its HTML by slug', async () => {
		const [first] = await getPosts();
		const full = await getPost(first.slug);
		expect(full).toMatchObject(first);
		expect(full?.html).toMatch(/<\w+/);
	});

	it('returns undefined for an unknown slug', async () => {
		expect(await getPost('no-such-post')).toBeUndefined();
	});
});
