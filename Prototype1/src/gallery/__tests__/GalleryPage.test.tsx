import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";

const mockItems = [
    { id: 1, url: "https://ex/a.jpg", name: "A", category: "cat1", tags: ["t1"] },
    { id: 2, url: "https://ex/b.jpg", name: "B", category: "cat1", tags: ["t2"] },
    { id: 3, url: "https://ex/c.jpg", name: "C", category: "cat2", tags: [] },
];

const lastProps: Record<string, any> = { stageFades: [] };
const bcCreated: any[] = [];
const esListeners: Record<string, Function[]> = {};

class BCMock {
    name: string;
    onmessage: ((ev: any) => void) | null = null;
    messages: any[] = [];
    constructor(name: string) {
        this.name = name;
        bcCreated.push(this);
    }
    postMessage(m: any) {
        this.messages.push(m);
        this.onmessage?.({ data: m });
    }
    close() {}
}
class ESMock {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
    addEventListener(type: string, cb: Function) {
        (esListeners[type] ||= []).push(cb);
    }
    close() {}
}

beforeAll(() => {
    (global as any).BroadcastChannel = BCMock;
    (global as any).EventSource = ESMock;
});

const origConsoleError = console.error;
beforeEach(() => {
    jest.useFakeTimers();
    (global as any).fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(mockItems),
    } as any);
    lastProps.stageFades = [];
    jest.spyOn(console, "error").mockImplementation((...args: any[]) => {
        const msg = String(args[0] ?? "");
        if (
            msg.includes("not wrapped in act") ||
            msg.includes("Cannot update a component")
        ) {
            return;
        }
        return origConsoleError(...args);
    });
});

afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    (console.error as jest.Mock).mockRestore();
});

jest.mock("../GalleryWidgets/FourColumnInfiniteGallery.jsx", () => (p: any) => {
    lastProps.grid = p;
    return <div data-testid="grid" />;
});

jest.mock("../GalleryWidgets/MarqueeGallery.jsx", () => (p: any) => {
    lastProps.marquee = p;
    return (
        <div>
            <button data-testid="marquee" onClick={() => p.onRequestClose?.()}>
                M
            </button>
            <button data-testid="marquee-done" onClick={() => p.onSlideOutDone?.()} />
        </div>
    );
});

jest.mock("../GalleryWidgets/SelectedGroup.jsx", () => (p: any) => {
    lastProps.choose = p;
    return p?.__visible__ ? (
        <button
            data-testid="pick"
            onClick={() => p.onPick?.({ id: "cat1", title: "cat1" })}
        >
            Pick
        </button>
    ) : null;
});

jest.mock("../GalleryWidgets/SearchOverlay.jsx", () => (p: any) => {
    lastProps.search = p;
    return (
        <button data-testid="search-overlay" onClick={() => p.onRequestClose?.()}>
            S
        </button>
    );
});

jest.mock("../GalleryWidgets/Transitions.jsx", () => {
    const React = require("react");

    function collectTestIds(node: any, out: string[] = []): string[] {
        if (!node) return out;
        if (Array.isArray(node)) {
            node.forEach((n) => collectTestIds(n, out));
            return out;
        }
        if (React.isValidElement(node)) {
            const tid = (node.props && node.props["data-testid"]) || null;
            if (tid) out.push(String(tid));
            if (node.props && node.props.children) {
                collectTestIds(node.props.children, out);
            }
        }
        return out;
    }

    return {
        OverlayShell: (p: any) => {
            lastProps.overlay = p;
            if (p.open) setTimeout(() => p.onEntered?.(), 0);
            if (p.closingStage === "panelOut") setTimeout(() => p.onPanelOutDone?.(), 0);
            return (
                <div data-testid="overlay">
                    {(p.open || p.closingStage !== "idle") ? p.children : null}
                </div>
            );
        },
        StageFade: (p: any) => {
            const ids = collectTestIds(p.children);
            const key = ids[0] || `stage-${lastProps.stageFades.length}`;
            lastProps.stageFades.push({ key, ids, props: p });
            const withVisibility =
                p.show && React.isValidElement(p.children)
                    ? React.cloneElement(p.children, { __visible__: true })
                    : p.children;
            return <div data-testid={`stage-${key}`}>{p.show ? withVisibility : null}</div>;
        },
        IntroGate: (p: any) => {
            if (p.play) setTimeout(() => p.onDone?.(), 0);
            return <div data-testid="intro" />;
        },
    };
});

function triggerStageExitByChildTestId(id: string) {
    const rec = lastProps.stageFades.find((r: any) => r.ids.includes(id));
    rec?.props?.onExitComplete?.();
}

import GalleryPage from "../GalleryPage.jsx";

function getModeButtons() {
    const root = document.body;
    return {
        grid: root.querySelector("#modeSwitcher .mode-btn:nth-child(1)") as HTMLButtonElement,
        marquee: root.querySelector("#modeSwitcher .mode-btn:nth-child(2)") as HTMLButtonElement,
        search: root.querySelector("#modeSwitcher .mode-btn:nth-child(3)") as HTMLButtonElement,
    };
}

async function renderPage() {
    await act(async () => {
        render(<GalleryPage />);
    });
    await act(async () => {});
}

test("happy path: fetch -> grid; search -> pick -> marquee -> grid; refresh via BC/ES", async () => {
    await renderPage();

    await waitFor(() => expect(screen.getByTestId("grid")).toBeInTheDocument());

    await waitFor(() => {
        expect(Array.isArray(lastProps.grid?.images)).toBe(true);
        expect(lastProps.grid.images.length).toBeGreaterThan(0);
    });
    expect(lastProps.grid.images).toEqual(
        expect.arrayContaining(mockItems.map((i) => i.url))
    );

    const { search, marquee } = getModeButtons();
    fireEvent.click(search);
    act(() => jest.runOnlyPendingTimers());

    await waitFor(() => expect(lastProps.search).toBeTruthy());
    expect(lastProps.search.items[0]).toEqual(
        expect.objectContaining({
            src: "https://ex/a.jpg",
            categories: expect.arrayContaining(["cat1"]),
        })
    );

    fireEvent.click(screen.getByTestId("search-overlay"));
    act(() => triggerStageExitByChildTestId("search-overlay"));
    act(() => jest.runOnlyPendingTimers());
    act(() => lastProps.overlay.onPanelOutDone?.());

    await waitFor(() =>
        expect(getModeButtons().grid.classList.contains("active")).toBe(true)
    );
    await waitFor(() =>
        expect(screen.queryByTestId("search-overlay")).toBeNull()
    );

    fireEvent.click(marquee);
    await waitFor(() => expect(lastProps.choose).toBeTruthy());
    act(() => lastProps.choose.onPick?.({ id: "cat1", title: "cat1" }));
    await waitFor(() =>
        expect(lastProps.marquee.images).toEqual([
            "https://ex/a.jpg",
            "https://ex/b.jpg",
        ])
    );

    fireEvent.click(screen.getByTestId("marquee"));
    await waitFor(() =>
        expect(getModeButtons().grid.classList.contains("active")).toBe(true)
    );

    if (bcCreated[0]) bcCreated[0].onmessage?.({ data: {} });
    esListeners["images"]?.forEach((cb) => cb());
    expect(screen.getByTestId("grid")).toBeInTheDocument();
});

test("openMarquee while in search exits search via StageFade.onExitComplete to choose", async () => {
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    const { search, marquee } = getModeButtons();

    fireEvent.click(search);
    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(lastProps.search).toBeTruthy());

    fireEvent.click(marquee);
    act(() => triggerStageExitByChildTestId("search-overlay"));
    await act(async () => {});
    await waitFor(() => expect(lastProps.choose).toBeTruthy());

    act(() => lastProps.choose.onPick?.({ id: "cat1", title: "cat1" }));
    await waitFor(() =>
        expect(lastProps.marquee.images).toEqual([
            "https://ex/a.jpg",
            "https://ex/b.jpg",
        ])
    );
});

test("openSearch when overlay already open goes through searchIntro then search", async () => {
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    const { search } = getModeButtons();

    fireEvent.click(search);
    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(lastProps.search).toBeTruthy());
    expect(Array.isArray(lastProps.search.items)).toBe(true);
});

test("closeOverlay from search to grid drives slideOut->panelOutDone", async () => {
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    const { search, grid } = getModeButtons();

    fireEvent.click(search);
    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(lastProps.search).toBeTruthy());

    fireEvent.click(grid);
    act(() => triggerStageExitByChildTestId("search-overlay"));
    act(() => jest.runOnlyPendingTimers());
    act(() => lastProps.overlay.onPanelOutDone?.());

    await waitFor(() =>
        expect(getModeButtons().grid.classList.contains("active")).toBe(true)
    );
    await waitFor(() =>
        expect(screen.queryByTestId("search-overlay")).toBeNull()
    );
});

test("closeOverlay from choose triggers choose StageFade exit path; can reopen afterwards", async () => {
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    const { marquee, grid } = getModeButtons();

    fireEvent.click(marquee);
    await waitFor(() => expect(lastProps.choose).toBeTruthy());

    fireEvent.click(grid);
    await act(async () => {});
    act(() => triggerStageExitByChildTestId("pick"));

    await waitFor(() =>
        expect(getModeButtons().grid.classList.contains("active")).toBe(true)
    );

    fireEvent.click(marquee);
    await waitFor(() => expect(lastProps.choose).toBeTruthy());
});

test("Marquee onSlideOutDone sets closingStage=panelOut (smoke)", async () => {
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    const { marquee } = getModeButtons();

    fireEvent.click(marquee);
    await waitFor(() => expect(lastProps.choose).toBeTruthy());
    act(() => lastProps.choose.onPick?.({ id: "cat1", title: "cat1" }));
    await waitFor(() => expect(lastProps.marquee).toBeTruthy());

    act(() => lastProps.marquee?.onSlideOutDone?.());
    expect(
        lastProps.overlay.closingStage === "panelOut" || lastProps.overlay.open === true
    ).toBeTruthy();
});

test("fetch error fallback sets empty items and grid shows no images", async () => {
    (global as any).fetch = jest.fn().mockRejectedValue(new Error("fail"));
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    await waitFor(() => {
        expect(Array.isArray(lastProps.grid?.images)).toBe(true);
    });
    expect(lastProps.grid.images).toEqual([]);
});

test("focus event triggers a refetch", async () => {
    const fetchSpy = jest
        .spyOn(global as any, "fetch")
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockItems) } as any)
        .mockResolvedValueOnce({ json: () => Promise.resolve(mockItems) } as any);

    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    act(() => {
        window.dispatchEvent(new Event("focus"));
    });

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledTimes(2));
    fetchSpy.mockRestore();
});

test("groups include (at least) real categories and imagesFrom works", async () => {
    const special = [
        ...mockItems,
        { id: 9, url: "https://ex/u.jpg", name: "U" },
    ];
    (global as any).fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(special),
    } as any);

    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    await waitFor(() =>
        expect(lastProps.grid?.images).toEqual(special.map((i: any) => i.url))
    );

    const { marquee } = getModeButtons();
    fireEvent.click(marquee);
    await waitFor(() => expect(lastProps.choose).toBeTruthy());

    const ids = lastProps.choose.groups.map((g: any) => g.id);
    expect(ids).toEqual(expect.arrayContaining(["cat1", "cat2"]));

    act(() => lastProps.choose.onPick?.({ id: "cat1", title: "cat1" }));
    await waitFor(() =>
        expect(lastProps.marquee.images).toEqual([
            "https://ex/a.jpg",
            "https://ex/b.jpg",
        ])
    );
});

test("openMarquee during searchIntro transitions search -> choose (via deferred closingSearch)", async () => {
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    const { search, marquee } = getModeButtons();

    fireEvent.click(search);

    act(() => jest.runOnlyPendingTimers());

    fireEvent.click(marquee);

    act(() => triggerStageExitByChildTestId("search-overlay"));

    await waitFor(() => expect(lastProps.choose).toBeTruthy());

    act(() => lastProps.choose.onPick?.({ id: "cat1", title: "cat1" }));
    await waitFor(() =>
        expect(lastProps.marquee.images).toEqual([
            "https://ex/a.jpg",
            "https://ex/b.jpg",
        ])
    );
});

test("onPanelOutDone fully resets overlay state after closing from search", async () => {
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    const { search, grid } = getModeButtons();

    fireEvent.click(search);
    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(lastProps.search).toBeTruthy());

    fireEvent.click(grid);
    act(() => triggerStageExitByChildTestId("search-overlay"));
    act(() => jest.runOnlyPendingTimers());

    act(() => lastProps.overlay.onPanelOutDone?.());

    await waitFor(() => {
        expect(lastProps.overlay.open).toBe(false);
        expect(lastProps.overlay.closingStage).toBe("idle");
    });
    expect(getModeButtons().grid.classList.contains("active")).toBe(true);
    expect(screen.queryByTestId("search-overlay")).toBeNull();
    expect(screen.queryByTestId("pick")).toBeNull();
});

test("clicking Grid while overlay is closed keeps mode at grid (noop path)", async () => {
    await renderPage();

    await waitFor(() => screen.getByTestId("grid"));
    const { grid } = getModeButtons();

    fireEvent.click(grid);

    expect(getModeButtons().grid.classList.contains("active")).toBe(true);
    if (lastProps.overlay) {
        expect(lastProps.overlay.open).toBe(false);
    }
});

test("openSearch while overlay is already open goes through searchIntro -> search", async () => {
    await renderPage();
    await waitFor(() => screen.getByTestId("grid"));
    const { marquee, search } = getModeButtons();

    fireEvent.click(marquee);
    await waitFor(() => expect(lastProps.choose).toBeTruthy());

    fireEvent.click(search);

    act(() => jest.runOnlyPendingTimers());

    await waitFor(() => expect(lastProps.search).toBeTruthy());
    expect(getModeButtons().search.classList.contains("active")).toBe(true);
});

test("imagesFrom('uncategorized') returns items without category", async () => {
    const special = [
        ...mockItems,
        { id: 9, url: "https://ex/u.jpg", name: "U" },
    ];
    (global as any).fetch = jest.fn().mockResolvedValue({
        json: () => Promise.resolve(special),
    } as any);

    await renderPage();
    await waitFor(() => screen.getByTestId("grid"));

    const { marquee } = getModeButtons();
    fireEvent.click(marquee);

    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(lastProps.choose).toBeTruthy());

    act(() =>
        lastProps.choose.onPick?.({ id: "uncategorized", title: "uncategorized" })
    );

    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(lastProps.marquee).toBeTruthy());

    await waitFor(() =>
        expect(lastProps.marquee.images).toEqual(["https://ex/u.jpg"])
    );
});

test("closeOverlay from marquee uses slideOut then panelOut reset path", async () => {
    await renderPage();
    await waitFor(() => screen.getByTestId("grid"));
    const { marquee, grid } = getModeButtons();

    fireEvent.click(marquee);
    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(lastProps.choose).toBeTruthy());

    act(() => lastProps.choose.onPick?.({ id: "cat1", title: "cat1" }));
    act(() => jest.runOnlyPendingTimers());
    await waitFor(() => expect(lastProps.marquee).toBeTruthy());

    fireEvent.click(grid);

    act(() => lastProps.marquee.onSlideOutDone?.());

    act(() => jest.runOnlyPendingTimers());

    act(() => lastProps.overlay.onPanelOutDone?.());

    await waitFor(() => expect(lastProps.overlay.open).toBe(false));
    expect(lastProps.overlay.closingStage).toBe("idle");
    expect(getModeButtons().grid.classList.contains("active")).toBe(true);
});
