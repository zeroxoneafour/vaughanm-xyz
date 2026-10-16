import { fireEvent, render, screen } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RouteModal from '#lib/components/RouteModal.svelte';

// Capture the afterNavigate callback so tests can say where the modal was opened from.
const nav = vi.hoisted(() => ({
	goto: vi.fn(),
	afterNavigate: undefined as undefined | ((n: { from: { url: URL } | null }) => void)
}));
vi.mock('$app/navigation', () => ({
	goto: nav.goto,
	afterNavigate: (callback: typeof nav.afterNavigate) => (nav.afterNavigate = callback)
}));

const body = createRawSnippet(() => ({ render: () => '<p>Post body</p>' }));
const open = (closeHref = '/blog') =>
	render(RouteModal, { title: 'A Post', closeHref, children: body });
const arrivedFrom = (path: string | null) =>
	nav.afterNavigate?.({ from: path ? { url: new URL(path, location.href) } : null });
const dialog = () => document.querySelector('dialog[data-route-modal]') as HTMLDialogElement;

describe('RouteModal', () => {
	beforeEach(() => {
		nav.goto.mockClear();
		vi.spyOn(history, 'back').mockImplementation(() => {});
	});
	afterEach(() => vi.restoreAllMocks());

	it('renders the content in a dialog labelled by its title', () => {
		open();
		expect(dialog()).toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 1, name: 'A Post' }).id).toBe(
			dialog().getAttribute('aria-labelledby')
		);
		expect(screen.getByText('Post body')).toBeInTheDocument();
	});

	it('is open from the first render (so it shows in prerendered HTML)', () => {
		open();
		expect(dialog().open).toBe(true);
	});

	it('goes back in history when closed after being opened from where it closes to', async () => {
		open('/blog?tag=vr');
		arrivedFrom('/blog?tag=vr');
		await fireEvent.click(screen.getByRole('button', { name: 'Close' }));
		expect(history.back).toHaveBeenCalledOnce();
		expect(nav.goto).not.toHaveBeenCalled();
	});

	it('navigates to closeHref when opened directly or from elsewhere', async () => {
		open('/blog');
		arrivedFrom('/');
		await fireEvent.click(screen.getByRole('button', { name: 'Close' }));
		expect(nav.goto).toHaveBeenCalledWith('/blog', { reset: false });
		expect(history.back).not.toHaveBeenCalled();
	});

	it('does not treat a different filter of the same page as "where it came from"', async () => {
		open('/blog?tag=vr');
		arrivedFrom('/blog');
		await fireEvent.click(screen.getByRole('button', { name: 'Close' }));
		expect(nav.goto).toHaveBeenCalledWith('/blog?tag=vr', { reset: false });
	});

	it('closes on Escape instead of letting the dialog close abruptly', async () => {
		open();
		arrivedFrom(null);
		const cancel = new Event('cancel', { cancelable: true });
		dialog().dispatchEvent(cancel);
		expect(cancel.defaultPrevented).toBe(true);
		expect(nav.goto).toHaveBeenCalledWith('/blog', { reset: false });
	});

	it('closes when the dimmed backdrop is clicked', async () => {
		open();
		await fireEvent.click(dialog().querySelector(':scope > div')!);
		expect(nav.goto).toHaveBeenCalledOnce();
	});

	it('only navigates once, however many times close is triggered', async () => {
		open();
		const close = screen.getByRole('button', { name: 'Close' });
		await fireEvent.click(close);
		await fireEvent.click(close);
		dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
		expect(nav.goto).toHaveBeenCalledOnce();
	});
});
