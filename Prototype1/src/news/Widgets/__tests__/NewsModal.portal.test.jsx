import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NewsModal from '../NewsModal';

const setViewport = (w, h) => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: w });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: h });
};
beforeAll(() => {
    Object.defineProperty(window, 'scrollTo', { value: jest.fn(), writable: true });
});
beforeEach(() => {
    jest.useFakeTimers();
    const rafCallbacks = [];
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        rafCallbacks.push(cb);
        window.__flushRaf = () => { while (rafCallbacks.length) rafCallbacks.shift()(); };
        return 1;
    });
    document.body.style = '';
});
afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
    delete window.__flushRaf;
});

const fromRect = { left: 20, top: 40, width: 80, height: 60 };
const baseItem = {
    id: 1,
    title: 'BioTech Futures',
    cover: '/c.jpg',
    body: '<p>Hello <img src="/x.jpg"></p>',
    updated_at: '2024-01-01T00:00:00Z',
};

test('closed -> returns null', () => {
    const { container, rerender } = render(<NewsModal open={false} item={null} fromRect={fromRect} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();

    rerender(<NewsModal open={false} item={baseItem} fromRect={fromRect} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
});

test('open (portrait) -> body lock, overlay fade-in, transform identity after RAF, date shown', async () => {
    setViewport(390, 844);
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 123 });

    const { unmount } = render(<NewsModal open item={{ ...baseItem, date: '12 Mar 2024' }} fromRect={fromRect} onClose={jest.fn()} />);

    expect(document.body.style.position).toBe('fixed');
    expect(document.body.style.top).toBe('-123px');

    const panel = screen.getByRole('dialog');
    const overlay = document.querySelector('.zoomOverlay');
    const expectedStart = (() => {
        const vw = window.innerWidth, vh = window.innerHeight;
        const tw = vw, th = vh, tx = 0, ty = 0;
        const dx = fromRect.left - tx;
        const dy = fromRect.top - ty;
        const sx = fromRect.width / tw;
        const sy = fromRect.height / th;
        return `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    })();
    expect(panel.style.transform).toBe(expectedStart);

    act(() => window.__flushRaf?.());
    expect(overlay).toHaveStyle({ opacity: '1' });
    expect(panel.style.transform).toBe('translate(0px, 0px) scale(1, 1)');
    expect(panel.style.transition).toContain('transform');

    expect(screen.getByText('12 Mar 2024')).toBeInTheDocument();

    unmount();
    expect(window.scrollTo).toHaveBeenCalledWith(0, 123);
    expect(document.body.style.position).toBe('');
    expect(document.body.style.top).toBe('');
});

test('open (landscape) -> center size calculation is correct', () => {
    setViewport(1200, 800);
    render(<NewsModal open item={baseItem} fromRect={fromRect} onClose={jest.fn()} />);
    const panel = screen.getByRole('dialog');

    expect(panel.style.left).toBe('100px');
    expect(panel.style.top).toBe('40px');
    expect(panel.style.width).toBe('1000px');
    expect(panel.style.height).toBe('720px');
});

test('image handling: normalizeHtml injects loading/decoding and scaling styles', () => {
    setViewport(390, 844);
    render(<NewsModal open item={baseItem} fromRect={fromRect} onClose={jest.fn()} />);
    const img = document.querySelector('.zoomContent img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('loading')).toBe('eager');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.style.maxWidth).toBe('100%');
    expect(img.style.height).toBe('auto');
});

test('close: clicking overlay triggers shrink animation, calls onClose after transitionend', () => {
    setViewport(390, 844);
    const onClose = jest.fn();
    render(<NewsModal open item={baseItem} fromRect={fromRect} onClose={onClose} />);

    const panel = screen.getByRole('dialog');
    const overlay = document.querySelector('.zoomOverlay');

    act(() => window.__flushRaf?.());

    fireEvent.click(overlay);
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.transitionEnd(panel);
    expect(onClose).toHaveBeenCalledTimes(1);
});

test('close: top-right × button behaves the same as overlay', () => {
    setViewport(390, 844);
    const onClose = jest.fn();
    render(<NewsModal open item={baseItem} fromRect={fromRect} onClose={onClose} />);
    act(() => window.__flushRaf?.());

    const panel = screen.getByRole('dialog');
    fireEvent.click(screen.getByText('×'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.transitionEnd(panel);
    expect(onClose).toHaveBeenCalledTimes(1);
});

test('no fromRect: handleClose directly calls onClose (no animation)', () => {
    setViewport(390, 844);
    const onClose = jest.fn();
    render(<NewsModal open item={baseItem} fromRect={undefined} onClose={onClose} />);
    fireEvent.click(document.querySelector('.zoomOverlay'));
    expect(onClose).toHaveBeenCalledTimes(1);
});

test('loading state: displays Loading… and no HTML content', () => {
    setViewport(390, 844);
    const item = { id: 2, title: 'Loading Card', loading: true };
    render(<NewsModal open item={item} fromRect={fromRect} onClose={jest.fn()} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(document.querySelector('.zoomContent')?.textContent?.trim()).toBe('');
});
