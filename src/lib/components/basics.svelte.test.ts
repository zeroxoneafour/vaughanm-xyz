import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import BrandIcon from '#lib/components/BrandIcon.svelte';
import FormattedDate from '#lib/components/FormattedDate.svelte';
import ProjectLinks from '#lib/components/ProjectLinks.svelte';
import TagChip from '#lib/components/TagChip.svelte';
import type { Project } from '#lib/types.js';

describe('FormattedDate', () => {
	it('shows a long date with a machine-readable datetime', () => {
		render(FormattedDate, { date: '2025-03-01' });
		const time = screen.getByText('March 1, 2025');
		expect(time.tagName).toBe('TIME');
		expect(time).toHaveAttribute('datetime', '2025-03-01');
	});

	it('never shifts the day, whatever the time zone (formats in UTC)', () => {
		render(FormattedDate, { date: '2025-01-01' });
		expect(screen.getByText('January 1, 2025')).toBeInTheDocument();
	});
});

describe('TagChip', () => {
	it('is a plain label without an href', () => {
		render(TagChip, { tag: 'vr' });
		const chip = screen.getByText('vr');
		expect(chip.tagName).toBe('SPAN');
		expect(chip).not.toHaveAttribute('aria-current');
	});

	it('is a link with an href, and shows a count', () => {
		render(TagChip, { tag: 'vr', href: '/blog?tag=vr', count: 3 });
		const link = screen.getByRole('link', { name: /vr/ });
		expect(link).toHaveAttribute('href', '/blog?tag=vr');
		expect(link).toHaveTextContent('vr 3');
	});

	it('marks the active tag', () => {
		render(TagChip, { tag: 'vr', href: '/blog', active: true });
		const link = screen.getByRole('link', { name: 'vr' });
		expect(link).toHaveAttribute('aria-current', 'true');
		expect(link).toHaveClass('preset-filled-primary-500');
	});
});

describe('BrandIcon', () => {
	it('renders a decorative, currentColor icon', () => {
		const { container } = render(BrandIcon, { name: 'github', class: 'size-5' });
		const svg = container.querySelector('svg')!;
		expect(svg).toHaveAttribute('aria-hidden', 'true');
		expect(svg).toHaveAttribute('fill', 'currentColor');
		expect(svg).toHaveClass('size-5');
		expect(svg.querySelector('path')?.getAttribute('d')).toBeTruthy();
	});

	it('has a different logo per brand', () => {
		const github = render(BrandIcon, { name: 'github' }).container.querySelector('path');
		const linkedin = render(BrandIcon, { name: 'linkedin' }).container.querySelector('path');
		expect(github?.getAttribute('d')).not.toBe(linkedin?.getAttribute('d'));
	});
});

describe('ProjectLinks', () => {
	const project = (links: Partial<Project>) => ({ ...links }) as Project;

	it('renders nothing without links', () => {
		const { container } = render(ProjectLinks, { project: project({}) });
		expect(container.querySelector('a')).toBeNull();
	});

	it('shows only the links that exist', () => {
		render(ProjectLinks, { project: project({ codeLink: 'https://github.com/x' }) });
		expect(screen.getByRole('link', { name: 'Code' })).toHaveAttribute(
			'href',
			'https://github.com/x'
		);
		expect(screen.queryByRole('link', { name: 'Visit' })).toBeNull();
	});

	it('shows both Code and Visit', () => {
		render(ProjectLinks, {
			project: project({ codeLink: 'https://github.com/x', deployLink: 'https://x.dev' })
		});
		expect(screen.getByRole('link', { name: 'Visit' })).toHaveAttribute('href', 'https://x.dev');
		expect(screen.getByRole('link', { name: 'Code' })).toBeInTheDocument();
	});
});
