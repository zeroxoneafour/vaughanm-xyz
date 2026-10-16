import { render, screen, within } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PostList from '#lib/components/PostList.svelte';
import ProjectCard from '#lib/components/ProjectCard.svelte';
import ProjectLinkCard from '#lib/components/ProjectLinkCard.svelte';
import type { PostMeta, Project } from '#lib/types.js';

const post = (slug: string, overrides: Partial<PostMeta> = {}): PostMeta => ({
	slug,
	title: `Post ${slug}`,
	description: `About ${slug}`,
	pubDate: '2025-03-01',
	tags: ['vr'],
	...overrides
});

const project = (overrides: Partial<Project> = {}): Project => ({
	slug: 'demo',
	name: 'Demo Project',
	description: 'Does demo things',
	tags: ['web'],
	skills: ['svelte', 'tailwind'],
	slides: [],
	importance: 50,
	startDate: '2025-02-27',
	endDate: '2025-03-01',
	...overrides
});

describe('PostList', () => {
	it('links each post to its page, with date, description and tags', () => {
		render(PostList, { posts: [post('a'), post('b', { tags: [] })] });
		const links = screen.getAllByRole('link');
		expect(links.map((a) => a.getAttribute('href'))).toEqual(['/blog/a', '/blog/b']);
		const first = within(links[0]);
		expect(first.getByRole('heading', { name: 'Post a' })).toBeInTheDocument();
		expect(first.getByText('March 1, 2025')).toBeInTheDocument();
		expect(first.getByText(/About a/)).toBeInTheDocument();
		expect(first.getByText('vr')).toBeInTheDocument();
	});

	it('says so when there are no posts', () => {
		render(PostList, { posts: [] });
		expect(screen.getByText('No posts yet.')).toBeInTheDocument();
	});
});

describe('ProjectCard', () => {
	it('shows name, description, tags and skills', () => {
		render(ProjectCard, { project: project() });
		expect(screen.getByRole('heading', { name: 'Demo Project' })).toBeInTheDocument();
		expect(screen.getByText('Does demo things')).toBeInTheDocument();
		for (const text of ['web', 'svelte', 'tailwind']) {
			expect(screen.getByText(text)).toBeInTheDocument();
		}
	});

	it('shows a date range', () => {
		const { container } = render(ProjectCard, { project: project() });
		expect(container.querySelector('h2 + p')).toHaveTextContent(
			'February 27, 2025 – March 1, 2025'
		);
	});

	it('shows a single date for one-day projects', () => {
		const { container } = render(ProjectCard, {
			project: project({ startDate: '2023-11-23', endDate: '2023-11-23' })
		});
		expect(container.querySelector('h2 + p')).toHaveTextContent(/^November 23, 2023$/);
	});

	it('shows "Present" for ongoing projects', () => {
		const { container } = render(ProjectCard, { project: project({ endDate: null }) });
		expect(container.querySelector('h2 + p')).toHaveTextContent('February 27, 2025 – Present');
	});

	it('is anchored by its slug (for /projects#slug links)', () => {
		const { container } = render(ProjectCard, { project: project({ slug: 'homelab' }) });
		expect(container.querySelector('article')).toHaveAttribute('id', 'homelab');
	});

	it('outlines the card only when highlighted', () => {
		const plain = render(ProjectCard, { project: project() }).container.querySelector('article');
		const lit = render(ProjectCard, {
			project: project(),
			highlighted: true
		}).container.querySelector('article');
		expect(plain).not.toHaveClass('ring-2');
		expect(lit).toHaveClass('ring-2', 'border-primary-500');
	});

	it('only shows a carousel when there are slides', () => {
		const without = render(ProjectCard, { project: project() });
		expect(without.container.querySelector('img, iframe')).toBeNull();
		const withSlide = render(ProjectCard, {
			project: project({ slides: [{ type: 'image', src: '/a.png', alt: 'Shot' }] })
		});
		expect(within(withSlide.container).getByAltText('Shot')).toBeInTheDocument();
	});

	it('shows the Code/Visit links', () => {
		render(ProjectCard, {
			project: project({ codeLink: 'https://github.com/x', deployLink: 'https://x.dev' })
		});
		expect(screen.getByRole('link', { name: 'Code' })).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Visit' })).toBeInTheDocument();
	});
});

describe('ProjectLinkCard (home page)', () => {
	it('links the title to the project on /projects, without resetting scroll', () => {
		render(ProjectLinkCard, { project: project({ slug: 'polonium' }) });
		const link = screen.getByRole('link', { name: 'Demo Project' });
		expect(link).toHaveAttribute('href', '/projects#polonium');
		expect(link).toHaveAttribute('data-sveltekit-reset', 'false');
	});

	it('shows the description but not dates, tags or skills', () => {
		render(ProjectLinkCard, { project: project() });
		expect(screen.getByText('Does demo things')).toBeInTheDocument();
		expect(screen.queryByText('web')).toBeNull();
		expect(screen.queryByText('svelte')).toBeNull();
		expect(screen.queryByText(/2025/)).toBeNull();
	});

	it('keeps Code/Visit as separate links above the card link', () => {
		render(ProjectLinkCard, { project: project({ codeLink: 'https://github.com/x' }) });
		const code = screen.getByRole('link', { name: 'Code' });
		expect(code).toHaveAttribute('href', 'https://github.com/x');
		// The stretched card link covers the card; the buttons sit above it (relative).
		expect(code.parentElement).toHaveClass('relative');
	});

	it('never shows slides', () => {
		const { container } = render(ProjectLinkCard, {
			project: project({ slides: [{ type: 'image', src: '/a.png', alt: 'Shot' }] })
		});
		expect(container.querySelector('img')).toBeNull();
	});
});
