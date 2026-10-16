import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FilterPanel from '#lib/components/FilterPanel.svelte';
import { toSearchParams, type ListFilters } from '#lib/list-filters.js';

const { goto } = vi.hoisted(() => ({ goto: vi.fn() }));
vi.mock('$app/navigation', () => ({ goto }));

const href = (filters: ListFilters) => {
	const query = toSearchParams(filters).toString();
	return query ? `/list?${query}` : '/list';
};

const setup = (filters: ListFilters = { tags: [] }, extra?: ReturnType<typeof createRawSnippet>) =>
	render(FilterPanel, {
		title: 'Things',
		label: 'Filter things',
		filters,
		tags: [
			['linux', 2],
			['vr', 5]
		],
		defaultDates: { from: '2023-01-01', to: '2026-10-16' },
		href,
		extra
	});
const panel = () => screen.getByRole('region', { name: 'Filter things', hidden: true });

describe('FilterPanel', () => {
	beforeEach(() => goto.mockClear());

	it('shows the heading and a Filters button', () => {
		setup();
		expect(screen.getByRole('heading', { level: 1, name: 'Things' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Filters/ })).toBeInTheDocument();
	});

	it('lists each tag with its count, linking to the toggled filter', () => {
		setup({ tags: ['vr'] });
		const linux = within(panel()).getByRole('link', { name: /linux/, hidden: true });
		const vr = within(panel()).getByRole('link', { name: /vr/, hidden: true });
		expect(linux).toHaveTextContent('linux 2');
		// Selecting adds the tag; selecting an active tag removes it.
		expect(linux).toHaveAttribute('href', '/list?tag=vr&tag=linux');
		expect(vr).toHaveAttribute('href', '/list');
		expect(vr).toHaveAttribute('aria-current', 'true');
		expect(linux).not.toHaveAttribute('aria-current');
	});

	it('badges the button with how many filters are active', () => {
		setup({ tags: ['vr', 'linux'], from: '2024-01-01' });
		expect(screen.getByRole('button', { name: /Filters/ })).toHaveTextContent('Filters 3');
	});

	it('has no badge or Clear link with no filters', () => {
		setup();
		expect(screen.getByRole('button', { name: /Filters/ })).toHaveTextContent(/^\s*Filters\s*$/);
		expect(within(panel()).queryByRole('link', { name: /Clear filters/, hidden: true })).toBeNull();
	});

	it('offers Clear filters, back to the unfiltered list', () => {
		setup({ tags: ['vr'], sort: 'newest' });
		expect(
			within(panel()).getByRole('link', { name: /Clear filters/, hidden: true })
		).toHaveAttribute('href', '/list');
	});

	it('prefills the date pickers with the defaults, or the active filter', () => {
		setup({ tags: [], to: '2025-06-01' });
		const from = within(panel()).getByLabelText('From') as HTMLInputElement;
		const to = within(panel()).getByLabelText('To') as HTMLInputElement;
		expect(from.value).toBe('2023-01-01');
		expect(to.value).toBe('2025-06-01');
		// Each picker can't cross the other.
		expect(from).toHaveAttribute('max', '2025-06-01');
		expect(to).toHaveAttribute('min', '2023-01-01');
	});

	it('navigates to the new filter when a date changes, replacing history', async () => {
		setup({ tags: ['vr'] });
		const from = within(panel()).getByLabelText('From') as HTMLInputElement;
		from.value = '2024-05-01';
		await fireEvent.change(from);
		expect(goto).toHaveBeenCalledWith('/list?tag=vr&from=2024-05-01', {
			replace: true,
			reset: false
		});
	});

	it('leaves a date at its default out of the URL', async () => {
		setup({ tags: [], from: '2024-05-01' });
		const from = within(panel()).getByLabelText('From') as HTMLInputElement;
		from.value = '2023-01-01'; // the default
		await fireEvent.change(from);
		expect(goto).toHaveBeenCalledWith('/list', expect.anything());
	});

	it('restores the default when a date is cleared', async () => {
		setup({ tags: [], to: '2025-06-01' });
		const to = within(panel()).getByLabelText('To') as HTMLInputElement;
		to.value = '';
		await fireEvent.change(to);
		expect(to.value).toBe('2026-10-16');
		expect(goto).toHaveBeenCalledWith('/list', expect.anything());
	});

	it('renders extra controls in the panel', () => {
		setup(
			{ tags: [] },
			createRawSnippet(() => ({ render: () => '<span>Sort control</span>' }))
		);
		expect(within(panel()).getByText('Sort control')).toBeInTheDocument();
	});
});
