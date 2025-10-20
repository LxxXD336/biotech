import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SearchOverlay from '../SearchOverlay';

const flush = async () => {
    await act(async () => {
        jest.runOnlyPendingTimers();
    });
    await act(async () => {});
};

describe('SearchOverlay (portal)', () => {
    const originalRAF = window.requestAnimationFrame;

    beforeEach(() => {
        jest.useFakeTimers();
        (window as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
            (setTimeout(() => cb(0), 0) as unknown as number);
        (window as any).innerWidth = 1024;
        (window as any).innerHeight = 768;
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true });
        window.scrollTo = jest.fn();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        window.requestAnimationFrame = originalRAF;
        document.body.removeAttribute('style');
    });

    const anchorRect = { left: 10, top: 20, width: 100, height: 50 };

    const news = [
        { title: 'BioTech Futures launches', excerpt: 'Big day for biotech', cover: '/img/1.jpg' },
        { title: 'AI in medicine', excerpt: 'clinical insights', cover: '/img/2.jpg' },
        { title: 'Sports', excerpt: 'football is fun', cover: '/img/3.jpg' },
    ];

    test('closed -> returns null', () => {
        const { container } = render(<SearchOverlay open={false} anchorRect={anchorRect} news={news} />);
        expect(container.firstChild).toBeNull();
    });

    test('open -> locks body; overlay fades in; input auto-focused; transform resets', async () => {
        render(<SearchOverlay open anchorRect={anchorRect} news={news} onClose={jest.fn()} onSelect={jest.fn()} />);

        expect(document.body.style.position).toBe('fixed');
        expect(document.body.style.overflow).toBe('hidden');
        expect(document.body.style.top).toBe('-200px');

        const input = await screen.findByPlaceholderText('Search news…');
        const focusSpy = jest.spyOn(input, 'focus');

        await flush();

        const overlay = document.querySelector('.searchZoomOverlay') as HTMLElement;
        expect(overlay).toBeTruthy();
        expect(overlay.style.opacity).toBe('1');

        const panel = document.querySelector('.searchZoomPanel') as HTMLElement;
        expect(panel).toBeTruthy();
        expect(panel.style.transform).toBe('translate(0px, 0px) scale(1, 1)');
        expect(panel.style.width).toBe('1024px');
        expect(panel.style.height).toBe('768px');

        expect(focusSpy).toHaveBeenCalled();

        fireEvent.click(screen.getByText('Search'));
        expect(focusSpy).toHaveBeenCalledTimes(2);
    });

    test("filtering: keyword hit → shows subset; miss → 'No results'", async () => {
        render(<SearchOverlay open anchorRect={anchorRect} news={news} />);

        await flush();

        const input = await screen.findByPlaceholderText('Search news…');

        fireEvent.change(input, { target: { value: 'bio' } });
        expect(screen.getAllByRole('article')).toHaveLength(1);
        expect(screen.getByText(/BioTech Futures/i)).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'zzzz' } });
        expect(screen.queryAllByRole('article')).toHaveLength(0);
        expect(screen.getByText('No results')).toBeInTheDocument();
    });

    test('clicking a card calls onSelect with image bounding rect', async () => {
        const onSelect = jest.fn();
        render(<SearchOverlay open anchorRect={anchorRect} news={news} onSelect={onSelect} />);

        await flush();

        const firstCard = screen.getAllByRole('article')[0];
        const img = firstCard.querySelector('.searchCard__img') as HTMLElement;

        (img as any).getBoundingClientRect = () => ({
            left: 33,
            top: 44,
            width: 120,
            height: 80,
            right: 0,
            bottom: 0,
            x: 33,
            y: 44,
            toJSON: () => ({}),
        });

        fireEvent.click(firstCard);

        expect(onSelect).toHaveBeenCalledTimes(1);
        const [selected, rect] = onSelect.mock.calls[0];
        expect(selected.title).toBe(news[0].title);
        expect(rect).toEqual({ left: 33, top: 44, width: 120, height: 80 });
    });

    test('clicking overlay/close button calls onClose and clears query; cleanup restores scroll', async () => {
        const onClose = jest.fn();
        const { unmount } = render(<SearchOverlay open anchorRect={anchorRect} news={news} onClose={onClose} />);

        await flush();

        const input = await screen.findByPlaceholderText('Search news…');

        fireEvent.change(input, { target: { value: 'ai' } });
        expect((input as HTMLInputElement).value).toBe('ai');

        const overlay = document.querySelector('.searchZoomOverlay') as HTMLElement;
        fireEvent.click(overlay);

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
            expect((input as HTMLInputElement).value).toBe('');
            expect((overlay as HTMLElement).style.opacity).toBe('0');
        });

        unmount();
        expect(window.scrollTo).toHaveBeenCalledWith(0, 200);
        expect(document.body.style.position).toBe('');
        expect(document.body.style.overflow).toBe('');
    });

    test('close via × button behaves the same as overlay click', async () => {
        const onClose = jest.fn();
        render(<SearchOverlay open anchorRect={anchorRect} news={news} onClose={onClose} />);

        await flush();

        const input = await screen.findByPlaceholderText('Search news…');
        fireEvent.change(input, { target: { value: 'med' } });

        fireEvent.click(screen.getByText('×'));
        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
            expect((input as HTMLInputElement).value).toBe('');
        });
    });
});
