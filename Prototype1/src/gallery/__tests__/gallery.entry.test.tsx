import React from "react";

const renderSpies: jest.Mock[] = [];
let lastOverlayProps: any = null;
const stageFades: any[] = [];

const flush = () => new Promise<void>((r) => setTimeout(r, 0));

beforeEach(() => {
    jest.resetModules();
    document.body.innerHTML = `
    <div id="root"></div>
    <div id="overlapLayer"></div>
    <div id="nav-root"></div>
    <button id="gridButton"></button>
    <button id="marqueeButton"></button>
    <button id="searchButton"></button>
  `;
    renderSpies.length = 0;
    stageFades.length = 0;
    lastOverlayProps = null;
});

jest.mock("react-dom/client", () => {
    const actual = jest.requireActual("react-dom/client");
    return {
        ...actual,
        createRoot: (el: Element) => {
            const realRoot = actual.createRoot(el as HTMLElement);
            const render = jest.fn((node: React.ReactNode) => realRoot.render(node as any));
            renderSpies.push(render);
            return { render };
        },
    };
});

jest.mock("../GalleryWidgets/FourColumnInfiniteGallery.jsx", () => () => (
    <div data-testid="grid-stub" />
));

jest.mock("../GalleryWidgets/MarqueeGallery.jsx", () => (p: any) => (
    <div data-testid="marquee-stub">
        <button data-testid="marquee-close" onClick={() => p.onRequestClose?.()} />
        <button data-testid="marquee-done" onClick={() => p.onSlideOutDone?.()} />
    </div>
));

jest.mock("../GalleryWidgets/SelectedGroup.jsx", () => (p: any) => (
    <div
        data-testid="choose-stub"
        onClick={() => p.onPick?.({ id: "symposium", title: "Symposium" })}
    />
));

jest.mock("../GalleryWidgets/SearchOverlay.jsx", () => (p: any) => (
    <div data-testid="search-stub" onClick={() => p.onRequestClose?.()} />
));

jest.mock("../GalleryWidgets/Transitions.jsx", () => ({
    OverlayShell: (p: any) => {
        lastOverlayProps = p;
        if (p.open) setTimeout(() => p.onEntered?.(), 0);
        if (p.closingStage === "panelOut") setTimeout(() => p.onPanelOutDone?.(), 0);
        return <div data-testid="overlay-shell">{p.children}</div>;
    },
    StageFade: (p: any) => {
        stageFades.push(p);
        return <div data-testid="stage-fade">{p.children}</div>;
    },
    IntroGate: (p: any) => {
        if (p.play) setTimeout(() => p.onDone?.(), 0);
        return <div data-testid="intro-gate" />;
    },
}));

const click = (id: string) => (document.getElementById(id) as HTMLButtonElement).click();

const triggerStageExitByChildTestId = (tid: string) => {
    const sf = [...stageFades]
        .reverse()
        .find(
            (s) =>
                React.isValidElement(s.children) &&
                s.children.props &&
                s.children.props["data-testid"] === tid
        );
    sf?.onExitComplete?.();
};

describe("gallery.jsx entry", () => {
    test("roots mount and buttons toggle classes via events", async () => {
        await import("../gallery.jsx");
        await flush();

        expect(renderSpies.length).toBeGreaterThanOrEqual(2);

        const gridBtn = document.getElementById("gridButton")!;
        const marqueeBtn = document.getElementById("marqueeButton")!;
        const searchBtn = document.getElementById("searchButton")!;

        expect(gridBtn.classList.contains("active")).toBe(true);
        expect(marqueeBtn.classList.contains("active")).toBe(false);
        expect(searchBtn.classList.contains("active")).toBe(false);

        click("marqueeButton");
        await flush();
        expect(marqueeBtn.classList.contains("active")).toBe(true);

        click("searchButton");
        await flush();
        expect(searchBtn.classList.contains("active")).toBe(true);

        click("gridButton");
        await flush();
        expect(gridBtn.classList.contains("active")).toBe(true);

        window.dispatchEvent(new Event("open-overlay"));
        await flush();
        expect(marqueeBtn.classList.contains("active")).toBe(true);

        window.dispatchEvent(new Event("open-search-overlay"));
        await flush();
        expect(searchBtn.classList.contains("active")).toBe(true);

        window.dispatchEvent(new Event("close-overlay"));
        await flush();
        expect(gridBtn.classList.contains("active")).toBe(true);
    });

    test("open-search from closed → searchIntro → search, then close to grid via slideOut/panelOut", async () => {
        await import("../gallery.jsx");
        await flush();

        const gridBtn = document.getElementById("gridButton")!;
        const searchBtn = document.getElementById("searchButton")!;

        window.dispatchEvent(new Event("open-search-overlay"));
        await flush();

        expect(searchBtn.classList.contains("active")).toBe(true);
        expect(document.querySelector('[data-testid="search-stub"]')).toBeTruthy();

        (document.querySelector('[data-testid="search-stub"]') as HTMLElement).click();
        await flush();

        expect(gridBtn.classList.contains("active")).toBe(true);
    });

    test("open-overlay → choose → pick -> marquee, then close marquee (slideOut) back to grid", async () => {
        await import("../gallery.jsx");
        await flush();

        const gridBtn = document.getElementById("gridButton")!;
        const marqueeBtn = document.getElementById("marqueeButton")!;

        window.dispatchEvent(new Event("open-overlay"));
        await flush();

        expect(marqueeBtn.classList.contains("active")).toBe(true);
        expect(document.querySelector('[data-testid="choose-stub"]')).toBeTruthy();

        (document.querySelector('[data-testid="choose-stub"]') as HTMLElement).click();
        await flush();
        expect(document.querySelector('[data-testid="marquee-stub"]')).toBeTruthy();

        (document.querySelector('[data-testid="marquee-close"]') as HTMLElement).click();
        await flush();

        expect(gridBtn.classList.contains("active")).toBe(true);
    });

    test("open-overlay while in search: search exits via StageFade.onExitComplete to choose (panelOut), then reopen overlay shows choose", async () => {
        await import("../gallery.jsx");
        await flush();

        window.dispatchEvent(new Event("open-search-overlay"));
        await flush();
        expect(document.querySelector('[data-testid="search-stub"]')).toBeTruthy();

        window.dispatchEvent(new Event("open-overlay"));
        await flush();

        triggerStageExitByChildTestId("search-stub");
        await flush();

        await flush();

        window.dispatchEvent(new Event("open-overlay"));
        await flush();
        expect(document.querySelector('[data-testid="choose-stub"]')).toBeTruthy();
    });

    test("close-overlay noop when overlay is already closed", async () => {
        await import("../gallery.jsx");
        await flush();

        const gridBtn = document.getElementById("gridButton")!;
        expect(gridBtn.classList.contains("active")).toBe(true);

        window.dispatchEvent(new Event("close-overlay"));
        await flush();
        expect(gridBtn.classList.contains("active")).toBe(true);
    });

    test("choose close path: trigger StageFade.onExitComplete when closingChoose=true", async () => {
        await import("../gallery.jsx");
        await flush();

        const gridBtn = document.getElementById("gridButton")!;

        window.dispatchEvent(new Event("open-overlay"));
        await flush();
        expect(document.querySelector('[data-testid="choose-stub"]')).toBeTruthy();

        window.dispatchEvent(new Event("close-overlay"));
        await flush();

        triggerStageExitByChildTestId("choose-stub");
        await flush();

        expect(gridBtn.classList.contains("active")).toBe(true);
    });

    test("marquee onSlideOutDone triggers panelOut and resets overlay state", async () => {
        await import("../gallery.jsx");
        await flush();

        window.dispatchEvent(new Event("open-overlay"));
        await flush();

        (document.querySelector('[data-testid="choose-stub"]') as HTMLElement).click();
        await flush();

        expect(document.querySelector('[data-testid="marquee-stub"]')).toBeTruthy();

        (document.querySelector('[data-testid="marquee-done"]') as HTMLElement).click();
        await flush();
        await flush();

        expect(lastOverlayProps?.open).toBe(false);
        expect(lastOverlayProps?.closingStage).toBe("idle");
    });
});
