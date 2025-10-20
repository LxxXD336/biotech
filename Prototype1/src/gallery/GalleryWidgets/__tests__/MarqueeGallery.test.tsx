/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

// Robust framer-motion mock:
// - motion.tag renders the real underlying tag (e.g., <figure>)
// - Strips motion-only props to avoid unknown-prop warnings
// - Triggers onAnimationComplete on mount to drive intro->run and closing callbacks immediately
jest.mock("framer-motion", () => {
    const React = require("react");

    const stripMotionProps = (props: any) => {
        const {
            layoutId,
            whileHover,
            whileTap,
            initial,
            animate,
            exit,
            variants,
            transition,
            onAnimationComplete,
            ...rest
        } = props || {};
        return { rest, onAnimationComplete };
    };

    const createMotion = (tag: string) =>
        React.forwardRef(function MotionTag(
            { children, ...props }: any,
            ref: React.Ref<any>
        ) {
            const { rest, onAnimationComplete } = stripMotionProps(props);
            React.useEffect(() => {
                if (typeof onAnimationComplete === "function") onAnimationComplete();
            }, []);
            return React.createElement(tag, { ref, ...rest }, children);
        });

    const motion = new Proxy(
        {},
        {
            get: (_target, prop: string) => createMotion(prop),
        }
    );

    const PassThrough: React.FC<any> = ({ children }) => <>{children}</>;

    return {
        motion,
        AnimatePresence: PassThrough,
        LayoutGroup: PassThrough,
    };
});

// SUT
import MarqueeGallery from "../MarqueeGallery";

// Stable window height helper wrapped in act()
const setWindowHeight = (h: number) => {
    act(() => {
        Object.defineProperty(window, "innerHeight", { value: h, configurable: true });
        window.dispatchEvent(new Event("resize"));
    });
};

describe("MarqueeGallery", () => {
    const images = ["https://ex/1.jpg", "https://ex/2.jpg", "https://ex/3.jpg", "https://ex/4.jpg"];

    beforeEach(() => {
        document.body.style.overflow = "";
        setWindowHeight(1000);
    });

    test("when visible=false, intro gating prevents marquee from rendering", () => {
        const { container } = render(
            <MarqueeGallery images={images} visible={false} onRequestClose={jest.fn()} />
        );
        // Marquee returns null when startIntro=false && introDone=false
        expect(container.querySelector(".marquee-container")).toBeNull();
    });

    test("visible=true: Intro → Run happens immediately; doubled list; open/close lightbox; pause/resume; body scroll lock/restored", async () => {
        const onRequestClose = jest.fn();
        const { container } = render(
            <MarqueeGallery images={images} visible={true} onRequestClose={onRequestClose} />
        );

        // After mocked onAnimationComplete, we should be in Run phase (doubled)
        await waitFor(() => {
            const figures = container.querySelectorAll("figure");
            expect(figures.length).toBe(images.length * 2);
        });

        // Marquee container exists and contains a <style> with marquee animation
        const styleContainer = container.querySelector(".marquee-container") as HTMLElement;
        expect(styleContainer).toBeTruthy();
        const styleTag = styleContainer.querySelector("style") as HTMLStyleElement;
        expect(styleTag?.textContent).toMatch(/animation:\s*marqueeScroll\s*/i);

        // Click any figure to open Lightbox (active=true → paused=true) and lock body scroll
        const anyCard = container.querySelectorAll("figure")[0];
        fireEvent.click(anyCard);

        const closeBtn = await screen.findByLabelText("Close");

        // Re-query container after state change and assert paused class
        await waitFor(() => {
            const latest = container.querySelector(".marquee-container") as HTMLElement | null;
            expect(latest).not.toBeNull();
            expect(latest!.className).toMatch(/is-paused/);
        });

        // Body scroll locked
        expect(document.body.style.overflow).toBe("hidden");

        // Close Lightbox via close button
        fireEvent.click(closeBtn);
        await waitFor(() => expect(screen.queryByLabelText("Close")).toBeNull());
        expect(document.body.style.overflow).toBe("");

        // Open again, then close by clicking the outer overlay (has cursor: zoom-out)
        fireEvent.click(container.querySelectorAll("figure")[1]);

        const overlay = await waitFor(() =>
            container.querySelector('div[style*="cursor: zoom-out"]')
        );
        expect(overlay).toBeTruthy();
        fireEvent.click(overlay as Element);
        await waitFor(() => expect(screen.queryByLabelText("Close")).toBeNull());

        // ESC should call top-level onRequestClose
        fireEvent.keyDown(window, { key: "Escape" });
        expect(onRequestClose).toHaveBeenCalled();
    });

    test("closing=true triggers slide-out completion callback and marquee is paused", async () => {
        const onSlideOutDone = jest.fn();
        const { container } = render(
            <MarqueeGallery
                images={images}
                visible={true}
                closing={true}
                onSlideOutDone={onSlideOutDone}
                onRequestClose={jest.fn()}
            />
        );
        await waitFor(() => expect(onSlideOutDone).toHaveBeenCalled());

        const marqueeContainer = container.querySelector(".marquee-container") as HTMLElement;
        expect(marqueeContainer.className).toMatch(/is-paused/);
    });

    test("viewport height changes are observed by the hook (smoke)", async () => {
        const { container, rerender } = render(
            <MarqueeGallery images={images} visible={true} onRequestClose={jest.fn()} />
        );
        await waitFor(() => container.querySelector(".marquee-container"));

        // Trigger resize (the hook should update internally)
        setWindowHeight(777);

        // Rerender to ensure style injection path is exercised again
        rerender(<MarqueeGallery images={images} visible={true} onRequestClose={jest.fn()} />);
        const styleTag = container.querySelector(".marquee-container style") as HTMLStyleElement;
        expect(styleTag?.textContent).toMatch(/marqueeScroll/);
    });
});
