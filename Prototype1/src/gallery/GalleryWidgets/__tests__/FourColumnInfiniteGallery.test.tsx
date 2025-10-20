/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, fireEvent, act } from "@testing-library/react";
import FourColumnInfiniteGallery from "../FourColumnInfiniteGallery";

/**
 * Deterministic RAF: enqueue callbacks and flush manually.
 */
let rafQueue: FrameRequestCallback[] = [];
let rafId = 1;
let requestAnimationFrameSpy: jest.SpyInstance<number, [callback: FrameRequestCallback]>;
let cancelAnimationFrameSpy: jest.SpyInstance<void, [handle: number]>;

function flushRafFrames(n = 1) {
    for (let i = 0; i < n; i += 1) {
        const callbacks = rafQueue.slice();
        rafQueue = [];
        callbacks.forEach((cb) => cb(performance.now?.() ?? Date.now()));
    }
}

/**
 * Stable getBoundingClientRect so lane height is > 0 by default.
 */
let gbcrSpy: jest.SpyInstance<any, any>;

beforeAll(() => {
    gbcrSpy = jest
        .spyOn(HTMLElement.prototype as any, "getBoundingClientRect")
        .mockImplementation(function () {
            return {
                width: 200,
                height: 1000, // lane length L (default)
                top: 0,
                left: 0,
                right: 200,
                bottom: 1000,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            };
        });
});

afterAll(() => {
    gbcrSpy.mockRestore();
});

beforeEach(() => {
    rafQueue = [];
    rafId = 1;

    requestAnimationFrameSpy = jest
        .spyOn(window, "requestAnimationFrame")
        .mockImplementation((cb: FrameRequestCallback): number => {
            rafQueue.push(cb);
            return rafId++;
        });

    cancelAnimationFrameSpy = jest
        .spyOn(window, "cancelAnimationFrame")
        .mockImplementation((_handle: number) => {
            // no-op
        });
});

afterEach(() => {
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
});

function setWindowSize(h: number) {
    act(() => {
        Object.defineProperty(window, "innerHeight", { value: h, configurable: true });
        window.dispatchEvent(new Event("resize"));
    });
}

describe("FourColumnInfiniteGallery", () => {
    const IMAGES = Array.from({ length: 12 }, (_, i) => `https://ex/${i + 1}.jpg`);

    test("renders four columns; figures duplicated per column (A + B); gap applied", () => {
        const { container } = render(<FourColumnInfiniteGallery images={IMAGES} gap={16} />);
        act(() => flushRafFrames(1));

        const wraps = container.querySelectorAll('div[style*="will-change: transform"]');
        expect(wraps.length).toBe(4);

        const figures = container.querySelectorAll("figure");
        expect(figures.length).toBe(IMAGES.length * 2);

        const firstFig = figures[0] as HTMLElement;
        expect(firstFig.style.marginBottom).toBe("16px");
    });

    test("wheel scroll updates transforms via RAF; columns drift at different speeds", () => {
        const { container } = render(<FourColumnInfiniteGallery images={IMAGES} gap={12} />);
        act(() => flushRafFrames(1));

        const root = container.querySelector(
            'div[style*="grid-template-columns: repeat(4, 1fr)"]'
        ) as HTMLElement;
        expect(root).toBeTruthy();

        const wraps = container.querySelectorAll(
            'div[style*="will-change: transform"]'
        ) as NodeListOf<HTMLElement>;
        expect(wraps.length).toBe(4);

        const before = Array.from(wraps).map((w) => w.style.transform);

        act(() => {
            fireEvent.wheel(root, { deltaY: 600, bubbles: true, cancelable: true });
        });
        act(() => flushRafFrames(5));

        const after = Array.from(wraps).map((w) => w.style.transform);
        after.forEach((t, idx) => {
            expect(t).toMatch(/^translate3d\(0,\s*-?\d+px,\s*0\)$/);
            expect(t).not.toEqual(before[idx]);
        });

        // different speeds -> different offsets
        const uniqueOffsets = new Set(after.map((t) => t));
        expect(uniqueOffsets.size).toBeGreaterThan(1);

        // negative scroll to exercise the "< 0" wrap-around branch
        act(() => {
            fireEvent.wheel(root, { deltaY: -1500, bubbles: true, cancelable: true });
        });
        act(() => flushRafFrames(6));

        const afterNeg = Array.from(wraps).map((w) => w.style.transform);
        afterNeg.forEach((t) => {
            expect(t).toMatch(/^translate3d\(0,\s*-?\d+px,\s*0\)$/);
        });
    });

    test("resize path is exercised (smoke) and loop keeps running", () => {
        const { container, rerender } = render(<FourColumnInfiniteGallery images={IMAGES} />);
        act(() => flushRafFrames(1));

        setWindowSize(777);
        rerender(<FourColumnInfiniteGallery images={IMAGES} />);
        act(() => flushRafFrames(2));

        const wraps = container.querySelectorAll('div[style*="will-change: transform"]');
        expect(wraps.length).toBe(4);
    });

    test("unmount cancels RAF and removes wheel listener (no errors after unmount)", () => {
        const { container, unmount } = render(<FourColumnInfiniteGallery images={IMAGES} />);
        act(() => flushRafFrames(1));

        const root = container.querySelector(
            'div[style*="grid-template-columns: repeat(4, 1fr)"]'
        ) as HTMLElement;

        act(() => {
            fireEvent.wheel(root, { deltaY: 200, bubbles: true, cancelable: true });
        });
        act(() => flushRafFrames(1));

        unmount();
        expect(cancelAnimationFrameSpy).toHaveBeenCalled();
        expect(() => fireEvent.wheel(root, { deltaY: 100 })).not.toThrow();
    });

    /**
     * NEW: Explicitly verify the handler calls preventDefault (non-passive listener),
     * and also check the addEventListener options where possible.
     */
    test("wheel handler is non-passive and calls preventDefault; listener options include passive:false", () => {
        const addSpy = jest.spyOn(Element.prototype, "addEventListener");

        const { container } = render(<FourColumnInfiniteGallery images={IMAGES} />);
        act(() => flushRafFrames(1));

        const root = container.querySelector(
            'div[style*="grid-template-columns: repeat(4, 1fr)"]'
        ) as HTMLElement;

        const WheelCtor: any = (window as any).WheelEvent || Event;
        const ev = new WheelCtor("wheel", { deltaY: 120, bubbles: true, cancelable: true });
        const result = root.dispatchEvent(ev);

        expect(result).toBe(false);
        expect(ev.defaultPrevented).toBe(true);

        // Ensure we registered a non-passive listener on some element
        const calledWithNonPassive = addSpy.mock.calls.some(
            ([type, _handler, opts]) => type === "wheel" && !!opts && (opts as any).passive === false
        );
        expect(calledWithNonPassive).toBe(true);

        addSpy.mockRestore();
    });

    /**
     * NEW: Exercise measureAll() sentinel path and the "!L" branch (L = 0)
     * by injecting lane/sentinel pairs, then resizing to trigger re-measure.
     * Column 0 gets L=0 so it won't move; other columns still move.
     */
    test("measureAll sentinel path and '!L' branch: column with L=0 does not move while others do", () => {
        const { container } = render(<FourColumnInfiniteGallery images={IMAGES} />);
        act(() => flushRafFrames(1));

        const root = container.querySelector(
            'div[style*="grid-template-columns: repeat(4, 1fr)"]'
        ) as HTMLElement;
        expect(root).toBeTruthy();

        const wraps = container.querySelectorAll(
            'div[style*="will-change: transform"]'
        ) as NodeListOf<HTMLElement>;
        expect(wraps.length).toBe(4);

        // Baseline transforms
        const baseline = Array.from(wraps).map((w) => w.style.transform);

        // Inject 4 lane + sentinel pairs so measureAll() will override lanesLenRef by index
        for (let i = 0; i < 4; i++) {
            const lane = document.createElement("div");
            // Override getBoundingClientRect: L=0 for column 0, otherwise 1000
            (lane as any).getBoundingClientRect = () => ({
                width: 200,
                height: i === 0 ? 0 : 1000,
                top: 0,
                left: 0,
                right: 200,
                bottom: i === 0 ? 0 : 1000,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            });
            const sentinel = document.createElement("div");
            sentinel.setAttribute("data-measure-id", "");
            // Order is important: lane (previousSibling) then sentinel ([data-measure-id])
            root.appendChild(lane);
            root.appendChild(sentinel);
        }

        // Trigger measureAll() via resize
        act(() => {
            window.dispatchEvent(new Event("resize"));
        });

        // Try to move with a big positive delta
        act(() => {
            fireEvent.wheel(root, { deltaY: 1200, bubbles: true, cancelable: true });
        });
        act(() => flushRafFrames(8));

        const after = Array.from(wraps).map((w) => w.style.transform);

        // Column 0 had L=0 -> should skip movement (unchanged)
        expect(after[0]).toBe(baseline[0]);

        // Others should move
        expect(after[1]).not.toBe(baseline[1]);
        expect(after[2]).not.toBe(baseline[2]);
        expect(after[3]).not.toBe(baseline[3]);
    });

    /**
     * NEW: wrap-around with very large positive target clamps into < L (1000)
     */
    test("wrap-around clamps large positive scroll to < lane height", () => {
        const { container } = render(<FourColumnInfiniteGallery images={IMAGES} />);
        act(() => flushRafFrames(1));

        const root = container.querySelector(
            'div[style*="grid-template-columns: repeat(4, 1fr)"]'
        ) as HTMLElement;
        const wraps = container.querySelectorAll(
            'div[style*="will-change: transform"]'
        ) as NodeListOf<HTMLElement>;
        expect(wraps.length).toBe(4);

        for (let i = 0; i < 5; i++) {
            act(() => {
                fireEvent.wheel(root, { deltaY: 5000, bubbles: true, cancelable: true });
            });
        }
        act(() => flushRafFrames(30));

        const t = wraps[0].style.transform;
        const m = /translate3d\(0,\s*(-?\d+)px,\s*0\)/.exec(t);
        expect(m).toBeTruthy();
        const px = Math.abs(parseInt(m![1], 10));
        expect(px).toBeLessThan(1000);
    });

    test("renders correctly with empty images array", () => {
        const { container } = render(<FourColumnInfiniteGallery images={[]} />);
        act(() => flushRafFrames(2));

        const wraps = container.querySelectorAll('div[style*="will-change: transform"]');
        expect(wraps.length).toBe(4);

        const figures = container.querySelectorAll("figure");
        expect(figures.length).toBe(0);

        expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });
});

import { Column } from "../FourColumnInfiniteGallery";

test("Column renders two copies of the list and applies gap", () => {
    const list = ["https://ex/a.jpg", "https://ex/b.jpg", "https://ex/c.jpg"];
    const { container } = render(<Column list={list} gap={10} speed={1} />);
    const figures = container.querySelectorAll("figure");
    // two copies: A set + B set
    expect(figures.length).toBe(list.length * 2);
    // gap applied on figures
    expect((figures[0] as HTMLElement).style.marginBottom).toBe("10px");
    // has sentinel for measureAll parity with main component
    expect(container.querySelector("[data-measure-id]")).toBeTruthy();
});

test("Column measures on mount and on resize without crashing", () => {
    const list = ["https://ex/a.jpg", "https://ex/b.jpg"];
    const { unmount } = render(<Column list={list} gap={6} speed={0.9} />);
    // trigger resize to hit measure() path again
    act(() => {
        window.dispatchEvent(new Event("resize"));
    });
    // unmount should clean up listeners (no throw)
    expect(() => unmount()).not.toThrow();
});

