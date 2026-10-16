import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { matter } from 'vfile-matter';
import type { Element, ElementContent, Root } from 'hast';
import type { Post, PostMeta } from '#lib/types.js';

// Bundled at build time; this module lives under `server/` so none of it (markdown sources or the
// compiler) can end up in client code. Pages get the rendered HTML via their server `load`.
const sources = import.meta.glob<string>('/src/lib/blog/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
});

/** Let inline code (e.g. long file paths) wrap after each `/`, not only at spaces. */
function rehypeBreakInlineCodeAtSlashes() {
	const wbr = (): Element => ({ type: 'element', tagName: 'wbr', properties: {}, children: [] });

	const walk = (node: Root | Element) => {
		for (const child of node.children) {
			if (child.type !== 'element' || child.tagName === 'pre') continue;
			if (child.tagName === 'code') {
				child.children = child.children.flatMap((c): ElementContent[] =>
					c.type === 'text'
						? c.value
								.split(/(?<=\/)/)
								.flatMap((value, i) =>
									i ? [wbr(), { type: 'text', value }] : [{ type: 'text', value }]
								)
						: [c]
				);
			} else {
				walk(child);
			}
		}
	};

	return walk;
}

const processor = unified()
	.use(remarkParse)
	.use(remarkGfm)
	.use(remarkRehype)
	.use(rehypeSlug)
	.use(rehypeBreakInlineCodeAtSlashes)
	.use(rehypeStringify);

function toISODate(value: unknown, slug: string): string {
	const date = value instanceof Date ? value : new Date(String(value));
	if (Number.isNaN(date.getTime())) {
		throw new Error(`Blog post "${slug}" has an invalid or missing pubDate`);
	}
	return date.toISOString().slice(0, 10);
}

async function compile(path: string, raw: string): Promise<{ meta: PostMeta; html: string }> {
	const slug = path.slice(path.lastIndexOf('/') + 1, -'.md'.length);

	const file = new VFile(raw);
	matter(file, { strip: true });
	const data = (file.data.matter ?? {}) as Record<string, unknown>;

	if (typeof data.title !== 'string') {
		throw new Error(`Blog post "${slug}" is missing a title`);
	}

	const meta: PostMeta = {
		slug,
		title: data.title,
		description: typeof data.description === 'string' ? data.description : '',
		pubDate: toISODate(data.pubDate, slug),
		tags: Array.isArray(data.tags) ? data.tags.map(String) : []
	};

	return { meta, html: String(await processor.process(file)) };
}

let cache: Promise<{ meta: PostMeta; html: string }[]> | undefined;

/** All posts, newest first. Compiled once per process. */
function loadAll() {
	cache ??= Promise.all(Object.entries(sources).map(([path, raw]) => compile(path, raw))).then(
		(posts) => posts.sort((a, b) => b.meta.pubDate.localeCompare(a.meta.pubDate))
	);
	return cache;
}

/** Post metadata (no body), newest first. */
export async function getPosts(): Promise<PostMeta[]> {
	return (await loadAll()).map(({ meta }) => meta);
}

export async function getPost(slug: string): Promise<Post | undefined> {
	const post = (await loadAll()).find(({ meta }) => meta.slug === slug);
	return post && { ...post.meta, html: post.html };
}
