// src/__tests__/PastWinners.extra.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach, test } from "vitest";
import {
    render,
    screen,
    fireEvent,
    within,
    waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* ========= Vite env & glob fallback ========= */
if (!(import.meta as any).env) {
    (import.meta as any).env = {
        VITE_ADMIN_PASSWORD: "biotech",
        VITE_API_BASE: "http://api",
    };
}
if (!(import.meta as any).glob) {
    (import.meta as any).glob = (_p: string, _o?: any) => ({});
}

/* ========= framer-motion pass-through mock (must run before importing the component) ========= */
vi.mock("framer-motion", () => {
    const React = require("react");
    const strip = (props: any) => {
        const {
            initial,
            animate,
            exit,
            transition,
            variants,
            whileHover,
            whileTap,
            whileInView,
            layout,
            layoutId,
            viewport,
            style,
            ...rest
        } = props || {};
        return { ...rest, style };
    };
    const passthrough =
        (tag = "div") =>
            ({ children, ...rest }: any) =>
                React.createElement(tag, strip(rest), children);

    return {
        motion: new Proxy(
            {},
            {
                get: (_t, key: any) =>
                    passthrough(key === "img" ? "img" : "div"),
            }
        ),
        AnimatePresence: ({ children }: any) =>
            React.createElement(React.Fragment, null, children),
        MotionConfig: ({ children }: any) =>
            React.createElement(React.Fragment, null, children),
        useMotionValue: () => ({ set: () => {}, get: () => 0 }),
        useSpring: (v: any) => v,
    };
});

/* ========= Simplified MainNav / Footer ========= */
vi.mock("../components/MainNav", () => ({
    default: () => <nav data-testid="main-nav" />,
}));
vi.mock("../sections/home/Footer", () => ({
    default: () => <footer data-testid="footer" />,
}));

/* ========= hoisted API mock (before importing the component) ========= */
type PosterDTO = {
    id: number;
    title: string;
    year: number;
    award?: string;
    type?: string;
    area?: string;
    description?: string;
    image_url: string | null;
    pdf_url: string | null;
    hidden: boolean;
};

const hoisted = vi.hoisted(() => {
    let DB: PosterDTO[] = [];
    const setDB = (rows: PosterDTO[]) => {
        DB = rows;
    };
    const getDB = () => DB.slice();

    const listPosters = vi.fn(async ({ include_hidden }: any = {}) =>
        include_hidden ? getDB() : getDB().filter((p) => !p.hidden)
    );
    const hidePoster = vi.fn(async (id: number) => {
        DB = DB.map((p) => (p.id === id ? { ...p, hidden: true } : p));
        return true;
    });
    const unhidePoster = vi.fn(async (id: number) => {
        DB = DB.map((p) => (p.id === id ? { ...p, hidden: false } : p));
        return true;
    });
    const deletePoster = vi.fn(async (id: number) => {
        DB = DB.filter((p) => p.id !== id);
        return true;
    });
    const updatePoster = vi.fn(async (id: number, patch: any) => {
        DB = DB.map((p) =>
            p.id === id
                ? {
                    ...p,
                    ...(patch.title !== undefined ? { title: patch.title } : {}),
                    ...(patch.year !== undefined ? { year: Number(patch.year) } : {}),
                    ...(patch.award !== undefined ? { award: patch.award } : {}),
                    ...(patch.type !== undefined ? { type: patch.type } : {}),
                    ...(patch.area !== undefined ? { area: patch.area } : {}),
                    ...(patch.description !== undefined
                        ? { description: patch.description }
                        : {}),
                    ...(patch.image ? { image_url: "http://img/updated.jpg" } : {}),
                    ...(patch.pdf ? { pdf_url: "http://pdf/updated.pdf" } : {}),
                }
                : p
        );
        return DB.find((p) => p.id === id)!;
    });
    const createPoster = vi.fn(async (payload: any) => {
        const id = Math.max(0, ...DB.map((p) => p.id)) + 1;
        DB = DB.concat([
            {
                id,
                title: payload.title,
                year: Number(payload.year),
                award: payload.award || "",
                type: payload.type || "",
                area: payload.area || "",
                description: payload.description || "",
                image_url: "http://img/new.jpg",
                pdf_url: payload.pdf ? "http://pdf/new.pdf" : null,
                hidden: false,
            },
        ]);
        return DB[DB.length - 1];
    });

    return {
        setDB,
        getDB,
        listPosters,
        hidePoster,
        unhidePoster,
        deletePoster,
        updatePoster,
        createPoster,
    };
});

vi.mock("../api/posters", () => ({
    listPosters: hoisted.listPosters,
    hidePoster: hoisted.hidePoster,
    unhidePoster: hoisted.unhidePoster,
    deletePoster: hoisted.deletePoster,
    updatePoster: hoisted.updatePoster,
    createPoster: hoisted.createPoster,
}));

/* ========= Import the tested component after mocks ========= */
import PastWinners from "../components/PastWinners";

/* ========= Utilities & Data ========= */
function baseRows(): PosterDTO[] {
    return [
        {
            id: 1,
            title: "Alpha",
            year: 2019,
            award: "Winner",
            type: "Bio",
            area: "Medicine",
            description: "d1",
            image_url: "http://img/1.jpg",
            pdf_url: "http://pdf/1.pdf",
            hidden: false,
        },
        {
            id: 2,
            title: "Beta",
            year: 2020,
            award: "Runner Up",
            type: "Env",
            area: "Environment",
            description: "d2",
            image_url: "http://img/2.jpg",
            pdf_url: null,
            hidden: false,
        },
        {
            id: 3,
            title: "Gamma",
            year: 2021,
            award: "Winner",
            type: "Health",
            area: "Medicine",
            description: "d3",
            image_url: "http://img/3.jpg",
            pdf_url: "http://pdf/3.pdf",
            hidden: true,
        },
        {
            id: 4,
            title: "Delta",
            year: 2018,
            award: "Merit",
            type: "Chem",
            area: "Physics",
            description: "d4",
            image_url: "http://img/4.jpg",
            pdf_url: null,
            hidden: false,
        },
    ];
}

async function renderWith(rows: PosterDTO[]) {
    (hoisted as any).setDB(rows);
    const ui = render(<PastWinners />);
    await screen.findByText(/^Showing/i);
    return ui;
}
async function renderDefault() {
    return renderWith(baseRows());
}
function expectDisabledLike(el: HTMLElement) {
    const cls = (el.getAttribute("class") || "").toLowerCase();
    const aria = el.getAttribute("aria-disabled");
    expect(
        el.hasAttribute("disabled") ||
        aria === "true" ||
        cls.includes("cursor-not-allowed") ||
        cls.includes("pointer-events-none") ||
        cls.includes("opacity-50")
    ).toBe(true);
}

function getYearSelect() {
    return screen.getByDisplayValue("Year: All") as HTMLSelectElement;
}
function getAwardSelect() {
    return screen.getByDisplayValue("Award: All") as HTMLSelectElement;
}
function getTypeSelect() {
    return screen.getByDisplayValue("Type: All") as HTMLSelectElement;
}
function getAreaSelect() {
    return screen.getByDisplayValue(
        "Area of Interest: All"
    ) as HTMLSelectElement;
}
function postersGrid() {
    return document.getElementById("posters")!;
}
function openAdmin() {
    fireEvent.click(screen.getByLabelText(/^open admin$/i));
}

/* ========= Common beforeEach ========= */
beforeEach(() => {
    vi.clearAllMocks();
    document.body.style.overflow = "";
});

/* ========= Your "extended cases" original tests (unchanged) ========= */
describe("PastWinners - Extended cases", () => {
    it("Initial screen: call listPosters({ include_hidden: true })", async () => {
        await renderDefault();
        expect(hoisted.listPosters).toHaveBeenCalledWith({
            include_hidden: true,
        });
    });

    it("MainNav and Footer exist", async () => {
        await renderDefault();
        expect(screen.getByTestId("main-nav")).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
    });

    it("Filters: Year options are a deduplicated set and sorted in descending order (visible items only)", async () => {
        await renderDefault();
        const yearSel = getYearSelect();
        const labels = within(yearSel)
            .getAllByRole("option")
            .map((o) => o.textContent?.trim() || "");

        expect(labels[0]).toBe("Year: All");
        const years = labels.slice(1).map((s) => parseInt(s, 10));
        const sorted = [...years].sort((a, b) => b - a);
        expect(years).toEqual(sorted);
        expect(labels).not.toContain("2021");
    });

    it("Filters: switching Year resets to page 1 and updates the 'Showing' count", async () => {
        const rows = Array.from({ length: 35 }, (_, i) => ({
            id: i + 1,
            title: `P#${i + 1}`,
            year: 2018 + (i % 4),
            award: i % 2 ? "Runner Up" : "Winner",
            type: ["Bio", "Env", "Health", "Chem"][i % 4],
            area: ["Medicine", "Environment", "Physics"][i % 3],
            description: `d${i + 1}`,
            image_url: `http://img/${i + 1}.jpg`,
            pdf_url: i % 3 === 0 ? `http://pdf/${i + 1}.pdf` : null,
            hidden: false,
        }));
        await renderWith(rows);

        fireEvent.click(screen.getByRole("button", { name: /next/i }));

        const yearSel = getYearSelect();
        const opt = within(yearSel)
            .getAllByRole("option")
            .find((o) => /^\d{4}$/.test(o.textContent || ""));
        fireEvent.change(yearSel, {
            target: {
                value: opt?.getAttribute("value") || opt?.textContent,
            },
        });

        const showingReset = screen.getByText(/^Showing/i).textContent!;
        expect(showingReset).toMatch(/Showing \d+ of \d+/);

        const prevBtn = screen.getByRole("button", { name: /previous/i });
        expectDisabledLike(prevBtn);
    });

    it("Empty result: filtering to 0 items disables Previous/Next and shows 'Showing 0 of 0'", async () => {
        await renderDefault();
        const yearSel = getYearSelect();
        fireEvent.change(yearSel, { target: { value: "1999" } });
        expect(screen.getByText(/Showing 0 of 0/)).toBeInTheDocument();

        const prevBtn = screen.getByRole("button", { name: /previous/i });
        const nextBtn = screen.getByRole("button", { name: /next/i });
        expectDisabledLike(prevBtn);
        expectDisabledLike(nextBtn);
    });

    it("Overlay: clicking download triggers via <a>; filename includes title_year", async () => {
        await renderDefault();

        fireEvent.click(within(postersGrid()).getAllByLabelText(/^open$/i)[0]);
        await screen.findByText(/Download Poster/i);

        const aClick = vi.fn();
        const appendChild = vi.spyOn(document.body, "appendChild");

        const origCreate = document.createElement;
        vi.spyOn(document, "createElement").mockImplementation((tag: any) => {
            if (tag === "a") {
                const a = origCreate.call(document, "a");
                (a as any).click = aClick;
                return a as HTMLAnchorElement;
            }
            return origCreate.call(document, tag);
        });

        const removeSpy = vi
            .spyOn(Element.prototype as any, "remove")
            .mockImplementation(() => {});
        // Use real timers + waitFor
        fireEvent.click(screen.getByText(/Download Poster/i));

        await waitFor(() => expect(aClick).toHaveBeenCalled());
        await waitFor(() => expect(appendChild).toHaveBeenCalled());
        await waitFor(() => expect(removeSpy).toHaveBeenCalled());

        (document.createElement as any).mockRestore?.();
        appendChild.mockRestore();
        removeSpy.mockRestore();
    });

    it("Admin: Hide / Unhide / Delete workflow with toast", async () => {
        await renderDefault();
        openAdmin();
        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);
        await screen.findAllByRole("button", { name: /edit/i });

        const hideBtn = screen.getAllByRole("button", { name: /^hide$/i })[0];
        fireEvent.click(hideBtn);
        await screen.findByText(/Hidden ✓/i);
        expect(hoisted.hidePoster).toHaveBeenCalled();

        const unhideBtn = (
            await screen.findAllByRole("button", { name: /^unhide$/i })
        )[0];
        fireEvent.click(unhideBtn);
        await screen.findByText(/Restored ✓/i);
        expect(hoisted.unhidePoster).toHaveBeenCalled();

        const spyConfirm = vi.spyOn(window, "confirm").mockReturnValue(true);
        const delBtn = screen.getAllByRole("button", { name: /^delete$/i })[0];
        fireEvent.click(delBtn);
        await screen.findByText(/Deleted ✓/i);
        expect(hoisted.deletePoster).toHaveBeenCalled();
        spyConfirm.mockRestore();
    });

    it("Public grid does not include hidden items (e.g., Gamma)", async () => {
        await renderDefault();
        expect(within(postersGrid()).queryByText("Gamma")).toBeNull();
    });

    it("Filters: Award / Type / Area each work; 'Showing … of …' matches the card count", async () => {
        await renderDefault();
        const countAll = within(postersGrid()).getAllByLabelText(/^open$/i).length;

        const awardSel = getAwardSelect();
        const aOpt = within(awardSel)
            .getAllByRole("option")
            .find((o) => o.value !== "All");
        if (aOpt) fireEvent.change(awardSel, { target: { value: aOpt.value } });

        const typeSel = getTypeSelect();
        const tOpt = within(typeSel)
            .getAllByRole("option")
            .find((o) => o.value !== "All");
        if (tOpt) fireEvent.change(typeSel, { target: { value: tOpt.value } });

        const areaSel = getAreaSelect();
        const arOpt = within(areaSel)
            .getAllByRole("option")
            .find((o) => o.value !== "All");
        if (arOpt) fireEvent.change(areaSel, { target: { value: arOpt.value } });

        const countFiltered = within(postersGrid()).queryAllByLabelText(/^open$/i)
            .length;
        const showing = screen.getByText(/^Showing/i).textContent || "";
        const m = showing.match(/Showing\s+(\d+)\s+of\s+(\d+)/i);
        expect(m).not.toBeNull();
        if (m) {
            const x = Number(m[1]);
            const y = Number(m[2]);
            expect(x).toBe(countFiltered <= 20 ? countFiltered : 20);
            expect(y).toBeGreaterThanOrEqual(countFiltered);
        }
        expect(countFiltered).toBeLessThanOrEqual(countAll);
    });

    it("Overlay: 'Open' opens; ESC does not close; 'Close' closes and restores body overflow", async () => {
        await renderDefault();
        const user = userEvent.setup();

        await user.click(screen.getAllByLabelText(/^open$/i)[0]);
        const closeBtn = await screen.findByRole("button", { name: /^close$/i });
        expect(closeBtn).toBeInTheDocument();
        expect(document.body.style.overflow).toBe("hidden");

        fireEvent.keyDown(document, { key: "Escape" });
        expect(
            screen.getByRole("button", { name: /^close$/i })
        ).toBeInTheDocument();

        await user.click(closeBtn);
        await waitFor(() =>
            expect(
                screen.queryByRole("button", { name: /^close$/i })
            ).toBeNull()
        );
        expect(document.body.style.overflow).toBe("");
    });

    it("Overlay: with pdf_url shows Open/Download Poster; without pdf_url shows Download Image only", async () => {
        await renderDefault();

        const alphaOpen = within(postersGrid()).getAllByLabelText(/^open$/i)[0];
        fireEvent.click(alphaOpen);
        expect(await screen.findByText(/Open Poster/i)).toBeInTheDocument();
        expect(screen.getByText(/Download Poster/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole("button", { name: /close/i }));

        const beta = within(postersGrid()).getAllByLabelText(/^open$/i)[1];
        fireEvent.click(beta);
        await screen.findByText(/Download Image/i);
        expect(screen.queryByText(/Open Poster/i)).toBeNull();
    });

    it("Card A11y: each card has <img> with alt=title; 'Open' count equals card count; not confused with 'Open Admin'", async () => {
        await renderDefault();
        const imgs = within(postersGrid()).getAllByRole("img");
        for (const img of imgs) {
            const alt = (img as HTMLImageElement).alt;
            expect(alt).toBeTruthy();
        }
        const openBtns = within(postersGrid()).getAllByLabelText(/^open$/i);
        expect(openBtns.length).toBe(imgs.length);

        const adminBtn = screen.getByLabelText(/^open admin$/i);
        expect(adminBtn).toBeInTheDocument();
    });

    it("Admin: wrong password shows 'Wrong password'; correct shows 'Admin unlocked ✓'", async () => {
        await renderDefault();
        openAdmin();

        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "wrong" } });
        fireEvent.submit(pwd.closest("form")!);
        expect(await screen.findByText(/Wrong password/i)).toBeInTheDocument();

        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);
        expect(await screen.findByText(/Admin unlocked/i)).toBeInTheDocument();
    });

    it("Admin: toggle Show Uploader / Hide Uploader; alert for missing required fields; toast on creation", async () => {
        await renderDefault();
        openAdmin();

        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);
        await screen.findByText(/Show Uploader/i);

        fireEvent.click(screen.getByText(/Show Uploader/i));

        const spyAlert = vi.spyOn(window, "alert").mockImplementation(() => {});
        fireEvent.submit(
            screen.getByRole("button", { name: /create/i }).closest("form")!
        );
        expect(spyAlert).toHaveBeenCalledWith(
            "Title / Year / Image are required"
        );
        spyAlert.mockRestore();

        fireEvent.change(screen.getByLabelText(/Title\*/i), {
            target: { value: "Zeta" },
        });
        fireEvent.change(screen.getByLabelText(/Year\*/i), {
            target: { value: "2022" },
        });

        const imgLabel = screen.getByLabelText(/Image\*/i);
        const fileInput =
            (imgLabel
                    .closest("label")
                    ?.querySelector('input[type="file"]') ??
                document.querySelector('input[type="file"][accept*="image"]')) as HTMLInputElement;
        const file = new File([new Uint8Array([1, 2, 3])], "z.png", {
            type: "image/png",
        });
        await userEvent.upload(fileInput, file);

        fireEvent.submit(
            screen.getByRole("button", { name: /create/i }).closest("form")!
        );
        await screen.findByText(/Created ✓/i);
        expect(hoisted.createPoster).toHaveBeenCalled();
    });

    it("Admin: Hide / Unhide / Delete workflow with toast", async () => {
        await renderDefault();
        openAdmin();
        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);
        await screen.findAllByRole("button", { name: /edit/i });

        const hideBtn = screen.getAllByRole("button", { name: /^hide$/i })[0];
        fireEvent.click(hideBtn);
        await screen.findByText(/Hidden ✓/i);
        expect(hoisted.hidePoster).toHaveBeenCalled();

        const spyConfirm = vi.spyOn(window, "confirm").mockReturnValue(true);
        const delBtn = screen.getAllByRole("button", { name: /^delete$/i })[0];
        fireEvent.click(delBtn);
        await screen.findByText(/Deleted ✓/i);
        expect(hoisted.deletePoster).toHaveBeenCalled();
        spyConfirm.mockRestore();
    });

    it("Admin: 'Edit' save submits delta fields for description/image/pdf and shows 'Saved ✓'", async () => {
        await renderDefault();
        openAdmin();
        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);
        await screen.findAllByRole("button", { name: /edit/i });

        fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[0]);

        const desc = screen.getByLabelText(/Description/i);
        fireEvent.change(desc, { target: { value: "updated desc" } });

        const imgLabel = screen.getByLabelText(/^Image$/i);
        const imgInput = imgLabel
            .closest("label")!
            .querySelector('input[type="file"]') as HTMLInputElement;
        await userEvent.upload(
            imgInput,
            new File([new Uint8Array([5, 6])], "u.png", { type: "image/png" })
        );

        const pdfLabel = screen.getByLabelText(/^PDF$/i);
        const pdfInput = pdfLabel
            .closest("label")!
            .querySelector('input[type="file"]') as HTMLInputElement;
        await userEvent.upload(
            pdfInput,
            new File([new Uint8Array([7, 8])], "u.pdf", {
                type: "application/pdf",
            })
        );

        fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
        await screen.findByText(/Saved ✓/i);

        const call = (hoisted as any).updatePoster.mock.calls.at(-1)!;
        const [, payload] = call;
        expect(payload.description).toBe("updated desc");
        expect(payload.image instanceof Blob).toBe(true);
        expect(payload.pdf instanceof Blob).toBe(true);
    });

    it("'Open Poster' link has target=_blank and rel=noreferrer", async () => {
        await renderDefault();
        fireEvent.click(within(postersGrid()).getAllByLabelText(/^open$/i)[0]);
        const link = await screen.findByText(/Open Poster/i);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", expect.stringMatching(/noreferrer/i));
    });
});

/* ========= functions coverage add-ons (only fix these 4 new cases) ========= */

import * as postersApi from "../api/posters";

describe("PastWinners - functions coverage add-ons", () => {
    test("Download prefers pdf_url and cleans up temporary <a> after click (cover handleDownload branch)", async () => {
        await renderDefault(); // Alpha has pdf

        // Open Alpha (has pdf)
        fireEvent.click(within(postersGrid()).getAllByLabelText(/^open$/i)[0]);
        await screen.findByText(/Download Poster/i);

        // mock <a> element (use real timers to avoid conflicts with userEvent and fakeTimers)
        const user = userEvent.setup();
        const createElSpy = vi.spyOn(document, "createElement");
        const realCreate = Document.prototype.createElement;

        const fakeA = realCreate.call(document, "a");
        const aClick = vi.fn();
        const selfRemove = vi.fn();
        (fakeA as any).click = aClick;
        (fakeA as any).remove = selfRemove;

        createElSpy.mockImplementation((tag: any) => {
            if (tag === "a") return fakeA as HTMLAnchorElement;
            return realCreate.call(document, tag);
        });

        const appendChildSpy = vi.spyOn(document.body, "appendChild");
        const removeChildSpy = vi.spyOn(document.body, "removeChild");

        // trigger download (link or button)
        const dlBtn =
            screen.queryByRole("link", { name: /download (poster|image)/i }) ??
            screen.getByRole("button", { name: /download (poster|image)/i });
        await user.click(dlBtn);

        await waitFor(() => expect(appendChildSpy).toHaveBeenCalled());
        await waitFor(() => expect(aClick).toHaveBeenCalled());
        expect((fakeA as HTMLAnchorElement).href).toMatch(/\.pdf(\?|$)/);

        // cleanup: support a.remove() or body.removeChild(a)
        await waitFor(() => {
            expect(
                removeChildSpy.mock.calls.length > 0 ||
                selfRemove.mock.calls.length > 0
            ).toBe(true);
        });

        createElSpy.mockRestore();
        appendChildSpy.mockRestore();
        removeChildSpy.mockRestore();
    });

    test("After overlay opens, unmounting component restores body overflow (cover useEffect cleanup)", async () => {
        const ui = await renderDefault();           // key: hold ui
        const user = userEvent.setup();

        await user.click(screen.getAllByLabelText(/^open$/i)[0]);
        expect(document.body.style.overflow).toBe("hidden");

        ui.unmount();                               // key: actually unmount
        await waitFor(() => {
            expect(document.body.style.overflow).toBe("");
        });
    });


    test("Load failure enters catch branch and shows error/Toast (cover error handler)", async () => {
        const spy = vi
            .spyOn(postersApi as any, "listPosters")
            .mockRejectedValueOnce(new Error("boom"));

        render(<PastWinners />);
        expect(
            await screen.findByText(/(error|failed|load failed)/i)
        ).toBeInTheDocument();

        spy.mockRestore();
    });

    test("Paginating to last page disables Next; clicking Previous re-enables it (cover next/prev handlers)", async () => {
        // Build 37 rows → 3 pages
        const rows = Array.from({ length: 37 }, (_, i) => ({
            id: i + 1,
            title: `P#${i + 1}`,
            year: 2018 + (i % 4),
            award: i % 2 ? "Runner Up" : "Winner",
            type: ["Bio", "Env", "Health", "Chem"][i % 4],
            area: ["Medicine", "Environment", "Physics"][i % 3],
            description: `d${i + 1}`,
            image_url: `http://img/${i + 1}.jpg`,
            pdf_url: i % 3 === 0 ? `http://pdf/${i + 1}.pdf` : null,
            hidden: false,
        }));
        await renderWith(rows);

        const user = userEvent.setup();
        const isDisabled = (el: HTMLElement) => {
            const cls = (el.getAttribute("class") || "").toLowerCase();
            return (
                el.hasAttribute("disabled") ||
                el.getAttribute("aria-disabled") === "true" ||
                el.getAttribute("data-disabled") === "true" ||
                cls.includes("pointer-events-none") ||
                cls.includes("cursor-not-allowed") ||
                cls.includes("opacity-50")
            );
        };

        // Click Next to reach the last page (re-query each time, up to 10 times)
        for (let i = 0; i < 10; i++) {
            const next = screen.getByRole("button", { name: /next/i });
            if (isDisabled(next)) break;
            await user.click(next);
            await waitFor(() => {
                const txt = screen.getByText(/Showing \d+ of \d+/i).textContent!;
                expect(txt).toMatch(/Showing \d+ of \d+/);
            });
        }

        let next = screen.getByRole("button", { name: /next/i });
        expect(isDisabled(next)).toBe(true);     // now disabled

        // After clicking Previous, Next should be enabled
        const prev = screen.getByRole("button", { name: /previous/i });
        await user.click(prev);
        await waitFor(() => {
            next = screen.getByRole("button", { name: /next/i });
            expect(isDisabled(next)).toBe(false);
        });
    });

});
// === PastWinners - functions coverage add-ons (more / stable selectors) ===
describe("PastWinners - functions coverage add-ons (more)", () => {
    // The order of Year / Award / Type / Area (consistent per your DOM dump)
    const combo = (idx: number) => screen.getAllByRole("combobox")[idx];
    const YEAR = 0, AWARD = 1, TYPE = 2, AREA = 3;

    const isDisabled = (el: HTMLElement) => {
        const cls = (el.getAttribute("class") || "").toLowerCase();
        return (
            el.hasAttribute("disabled") ||
            el.getAttribute("aria-disabled") === "true" ||
            el.getAttribute("data-disabled") === "true" ||
            cls.includes("pointer-events-none") ||
            cls.includes("cursor-not-allowed") ||
            cls.includes("opacity-50") ||
            cls.includes("opacity-40")
        );
    };


    test("Changing Type resets to page 1 (Previous disabled)", async () => {
        // Build 37 rows to ensure 2+ pages
        const rows = Array.from({ length: 37 }, (_, i) => ({
            id: i + 1,
            title: `P#${i + 1}`,
            year: 2018 + (i % 4),
            award: i % 2 ? "Runner Up" : "Winner",
            type: i < 8 ? "Chem" : ["Bio", "Env", "Health"][i % 3],
            area: ["Medicine", "Environment", "Physics"][i % 3],
            description: `d${i + 1}`,
            image_url: `http://img/${i + 1}.jpg`,
            pdf_url: i % 5 === 0 ? `http://pdf/${i + 1}.pdf` : null,
            hidden: false,
        }));
        await renderWith(rows);
        const user = userEvent.setup();

        // go to page 2
        await user.click(screen.getByRole("button", { name: /next/i }));
        await screen.findByText(/Showing \d+ of \d+/i);

        // set Type=Chem → should return to page 1, Previous disabled
        fireEvent.change(combo(TYPE), { target: { value: "Chem" } });
        await screen.findByText(/Showing \d+ of \d+/i);

        expect(
            isDisabled(screen.getByRole("button", { name: /previous/i }))
        ).toBe(true);
    });

    test("Combined filters (Type=Env + Year=2019) total count matches data source", async () => {
        const rows = Array.from({ length: 40 }, (_, i) => ({
            id: i + 1,
            title: `R${i + 1}`,
            year: 2018 + (i % 4),
            award: i % 2 ? "Runner Up" : "Winner",
            type: ["Env", "Bio", "Health", "Chem"][i % 4],
            area: ["Medicine", "Environment", "Physics"][i % 3],
            description: `desc${i + 1}`,
            image_url: `http://img/${i + 1}.jpg`,
            pdf_url: null,
            hidden: false,
        }));
        const expected = rows.filter(
            (r) => r.type === "Env" && r.year === 2019 && !r.hidden
        ).length;

        await renderWith(rows);

        // Use index to select dropdowns (no accessible names)
        fireEvent.change(combo(TYPE), { target: { value: "Env" } });
        fireEvent.change(combo(YEAR), { target: { value: "2019" } });

        const el = await screen.findByText(/Showing \d+ of \d+/i);
        const m = el.textContent!.match(/of\s+(\d+)/i);
        expect(m).not.toBeNull();
        expect(Number(m![1])).toBe(expected);
    });
});
describe("PastWinners - more functions (Magnetic / TiltCard / Toast / Cancel)", () => {
    it("Magnetic: on unmount removes listeners and cancels RAF (cover cleanup)", async () => {
        const { unmount } = await renderDefault();

        const rmSpy = vi.spyOn(window, "removeEventListener");
        const cafSpy = vi.spyOn(window, "cancelAnimationFrame");

        unmount();

        // At least one 'mousemove' listener removed; and one animation frame canceled
        expect(rmSpy.mock.calls.some(c => c[0] === "mousemove")).toBe(true);
        expect(cafSpy).toHaveBeenCalled();

        rmSpy.mockRestore();
        cafSpy.mockRestore();
    });

    it("Toast: uploading a file shows a notification and auto-dismisses after 1800ms (cover timing branch of useToast)", async () => {
        // Fake timers + have userEvent advance them
        vi.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

        try {
            await renderDefault();
            openAdmin();

            const pwd = screen.getByLabelText(/Admin Password/i);
            fireEvent.change(pwd, { target: { value: "biotech" } });
            fireEvent.submit(pwd.closest("form")!);
            await screen.findAllByRole("button", { name: /edit/i });

            // enter edit
            fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[0]);

            // upload triggers “Image uploaded ✓” toast
            const fileInput = screen.getByLabelText(/Image/i) as HTMLInputElement;
            await user.upload(fileInput, new File(["x"], "x.jpg", { type: "image/jpeg" }));

            expect(await screen.findByText(/Image uploaded ✓/i)).toBeInTheDocument();

            // advance 1800ms → toast disappears automatically
            await vi.advanceTimersByTimeAsync(1800);
            await waitFor(() => expect(screen.queryByText(/Image uploaded ✓/i)).toBeNull());
        } finally {
            vi.useRealTimers();
        }
    });

    it("Admin: clicking Cancel clears this edit and the '✓ Uploaded' state (cover reset)", async () => {
        // Ensure not affected by previous fake timers
        vi.useRealTimers();
        const user = userEvent.setup();

        await renderDefault();
        openAdmin();

        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);
        await screen.findAllByRole("button", { name: /edit/i });

        // enter edit
        fireEvent.click(screen.getAllByRole("button", { name: /^edit$/i })[0]);

        // upload once, show ✓ Uploaded
        const imgInput = screen.getByLabelText(/Image/i) as HTMLInputElement;
        await user.upload(imgInput, new File(["x"], "x.jpg", { type: "image/jpeg" }));
        expect(await screen.findByText(/✓ Uploaded/i)).toBeInTheDocument();

        // clicking Cancel should clear the uploaded mark and form changes
        await user.click(screen.getByRole("button", { name: /^cancel$/i }));
        expect(screen.queryByText(/✓ Uploaded/i)).toBeNull();
    });
});
describe("PastWinners - functions coverage add-ons (new)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.style.overflow = "";
    });



    it("Download (no pdf_url): create temporary <a>, filename .jpg, click then cleanup (downloadViaAnchor path)", async () => {
        await renderDefault();
        // Open Beta (no pdf)
        fireEvent.click(within(postersGrid()).getAllByLabelText(/^open$/i)[1]);
        // fake <a> and observe remove()
        const createElSpy = vi.spyOn(document, "createElement");
        const fakeA = document.createElement("a");
        const clickSpy = vi.fn();
        const removeSpy = vi.fn();
        (fakeA as any).click = clickSpy;
        (fakeA as any).remove = removeSpy;
        createElSpy.mockReturnValueOnce(fakeA as HTMLAnchorElement);

        const btn =
            screen.queryByRole("link", { name: /download (poster|image)/i }) ??
            screen.getByRole("button", { name: /download (poster|image)/i });
        await userEvent.click(btn);

        // href points to image, download ends with .jpg (Beta_2020.jpg)
        expect((fakeA as HTMLAnchorElement).href).toMatch(/\/img\/2\.jpg$/);
        expect(fakeA.getAttribute("download")).toMatch(/Beta_2020\.jpg$/);
        expect(clickSpy).toHaveBeenCalled();
        // cleanup: code uses a.remove()
        expect(removeSpy).toHaveBeenCalled();

        createElSpy.mockRestore();
    });

    it("When Admin opens, body scroll is locked; restored after close (useEffect cleanup)", async () => {
        await renderDefault();
        // Opening any poster overlay locks scroll
        fireEvent.click(within(postersGrid()).getAllByLabelText(/^open$/i)[0]);
        expect(document.body.style.overflow).toBe("hidden");
        // Close overlay
        await userEvent.click(await screen.findByRole("button", { name: /^close$/i }));
        await waitFor(() =>
            expect(screen.queryByRole("button", { name: /^close$/i })).toBeNull()
        );
        expect(document.body.style.overflow).toBe("");
    });

    it("Filters: Award / Type / Area are deduplicated sets and include 'All'", async () => {
        await renderDefault();
        const awardOpts = within(getAwardSelect()).getAllByRole("option").map(o => o.textContent?.trim());
        const typeOpts  = within(getTypeSelect()).getAllByRole("option").map(o => o.textContent?.trim());
        const areaOpts  = within(getAreaSelect()).getAllByRole("option").map(o => o.textContent?.trim());

        expect(awardOpts[0]).toBe("Award: All");
        expect(new Set(awardOpts)).toHaveProperty("size", awardOpts.length);

        expect(typeOpts[0]).toBe("Type: All");
        expect(new Set(typeOpts)).toHaveProperty("size", typeOpts.length);

        expect(areaOpts[0]).toBe("Area of Interest: All");
        expect(new Set(areaOpts)).toHaveProperty("size", areaOpts.length);
    });

    it("Pagination: clicking numeric page jumps directly and sets aria-current correctly", async () => {
        // Build 42 rows, ensure ≥3 pages
        const rows = Array.from({ length: 42 }, (_, i) => ({
            id: i + 1,
            title: `P#${i + 1}`,
            year: 2018 + (i % 4),
            award: i % 2 ? "Runner Up" : "Winner",
            type: ["Bio", "Env", "Health", "Chem"][i % 4],
            area: ["Medicine", "Environment", "Physics"][i % 3],
            description: `d${i + 1}`,
            image_url: `http://img/${i + 1}.jpg`,
            pdf_url: null,
            hidden: false,
        }));
        await renderWith(rows);

        // jump to page 2
        const page2 = screen.getByRole("button", { name: "2" });
        await userEvent.click(page2);
        expect(page2).toHaveAttribute("aria-current", "page");

        // then to page 3
        const page3 = screen.getByRole("button", { name: "3" });
        await userEvent.click(page3);
        expect(page3).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("button", { name: "2" })).not.toHaveAttribute("aria-current", "page");
    });


});
describe("PastWinners - function paths (added)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.style.overflow = "";
    });
    it("heroSeeds: hero uses a local image or a placeholder (either is fine)", async () => {
        await renderDefault();

        // Search only within the hero container to avoid interference from grid poster images
        const hero = document.getElementById("hero")!;
        const imgs = within(hero).getAllByRole("img") as HTMLImageElement[];

        const isLocalHero = imgs.some((img) =>
            /\/src\/(Photo|photo)\/Pastwinnerimages\//.test(img.src || "")
        );
        const isPlaceholder = imgs.some((img) =>
            (img.src || "").startsWith("data:image/svg+xml")
        );

        // If your project has a local hero image => isLocalHero is true; otherwise => isPlaceholder is true
        expect(isLocalHero || isPlaceholder).toBe(true);
    });

    it("refresh: when listPosters returns non-array, fall back to empty array; Showing=0 of 0; Year only keeps the default option", async () => {
        (hoisted as any).listPosters.mockResolvedValueOnce("bad-data" as any);
        await renderWith([]);
        expect(screen.getByText(/Showing 0 of 0/i)).toBeInTheDocument();
        const yearSel = screen.getByDisplayValue("Year: All") as HTMLSelectElement;
        expect(within(yearSel).getAllByRole("option").length).toBe(1);
    });

    it("Pagination: with many pages shows ellipses; after Next to page 6 aria-current is correct", async () => {
        const rows = Array.from({ length: 220 }, (_, i) => ({
            id: i + 1,
            title: `P${i + 1}`,
            year: 2000 + (i % 10),
            award: ["Winner", "Runner Up"][i % 2],
            type: ["A", "B", "C", "D"][i % 4],
            area: ["R", "S", "T"][i % 3],
            description: `d${i + 1}`,
            image_url: `http://img/${i + 1}.jpg`,
            pdf_url: i % 2 ? null : `http://pdf/${i + 1}.pdf`,
            hidden: false,
        }));
        await renderWith(rows);

        // On the first page: show 1, 2, 11 and an ellipsis
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "11" })).toBeInTheDocument();
        expect(screen.getAllByText("…").length).toBeGreaterThanOrEqual(1);

        // Click Next 5 times to reach page 6 (component may not render button "6" on the first page)
        const nextBtn = screen.getByRole("button", { name: /Next/i });
        for (let i = 0; i < 5; i++) fireEvent.click(nextBtn);

        const current6 = screen.getByRole("button", { name: "6" });
        expect(current6).toHaveAttribute("aria-current", "page");

        // In middle pages, typically there are two ellipses
        expect(screen.getAllByText("…").length).toBeGreaterThanOrEqual(2);

        // Go back to page 1, verify ellipses return to one side
        const prevBtn = screen.getByRole("button", { name: /Previous/i });
        for (let i = 0; i < 5; i++) fireEvent.click(prevBtn);
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
        expect(screen.getAllByText("…").length).toBeGreaterThanOrEqual(1);
    });


    it("useToast: on consecutive triggers, the last message wins and disappears after 1800ms", async () => {
        vi.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        try {
            await renderDefault();
            openAdmin();

            const pwd = screen.getByLabelText(/Admin Password/i);
            fireEvent.change(pwd, { target: { value: "biotech" } });
            fireEvent.submit(pwd.closest("form")!);
            await screen.findByText(/Show Uploader/i);

            fireEvent.click(screen.getByText(/Show Uploader/i));

            const imgInput = document.querySelector(
                'input[type="file"][accept*="image"]'
            ) as HTMLInputElement;
            const pdfInput = document.querySelector(
                'input[type="file"][accept="application/pdf"]'
            ) as HTMLInputElement;

            await user.upload(
                imgInput,
                new File(["x"], "x.jpg", { type: "image/jpeg" })
            );
            expect(await screen.findByText(/Image uploaded ✓/i)).toBeInTheDocument();

            await user.upload(
                pdfInput,
                new File(["y"], "y.pdf", { type: "application/pdf" })
            );
            expect(await screen.findByText(/PDF uploaded ✓/i)).toBeInTheDocument();

            await vi.advanceTimersByTimeAsync(1799);
            expect(screen.queryByText(/PDF uploaded ✓/i)).toBeInTheDocument();

            await vi.advanceTimersByTimeAsync(1);
            await waitFor(() =>
                expect(screen.queryByText(/PDF uploaded ✓/i)).toBeNull()
            );
        } finally {
            vi.useRealTimers();
        }
    });

    it("Set derivation: deduplicate Award/Type/Area and exclude empty values", async () => {
        const rows = [
            { id: 1, title: "A", year: 2020, award: "W", type: "X", area: "R", description: "d", image_url: "http://img/1.jpg", pdf_url: null, hidden: false },
            { id: 2, title: "B", year: 2020, award: "W", type: "X", area: "R", description: "d", image_url: "http://img/2.jpg", pdf_url: null, hidden: false },
            { id: 3, title: "C", year: 2021, award: "",  type: "",  area: "",  description: "d", image_url: "http://img/3.jpg", pdf_url: null, hidden: false },
            { id: 4, title: "D", year: 2021,                 description: "d", image_url: "http://img/4.jpg", pdf_url: null, hidden: false },
            { id: 5, title: "E", year: 2022, award: "Z", type: "Y", area: "S", description: "d", image_url: "http://img/5.jpg", pdf_url: null, hidden: false },
        ] as any;
        await renderWith(rows);

        const awardSel = getAwardSelect();
        const awards = within(awardSel).getAllByRole("option").map(o => o.textContent?.trim() || "");
        expect(awards).toEqual(["Award: All", "W", "Z"]);

        const typeSel = getTypeSelect();
        const types = within(typeSel).getAllByRole("option").map(o => o.textContent?.trim() || "");
        expect(types).toEqual(["Type: All", "X", "Y"]);

        const areaSel = getAreaSelect();
        const areas = within(areaSel).getAllByRole("option").map(o => o.textContent?.trim() || "");
        expect(areas).toEqual(["Area of Interest: All", "R", "S"]);
    });
});
describe("PastWinners - function paths (more)", () => {
    const makeRows = (n = 220) =>
        Array.from({ length: n }, (_, i) => ({
            id: i + 1,
            title: `P${i + 1}`,
            year: 2000 + (i % 10),
            award: ["Winner", "Runner Up"][i % 2],
            type: ["A", "B", "C", "D"][i % 4],
            area: ["R", "S", "T"][i % 3],
            description: `d${i + 1}`,
            image_url: `http://img/${i + 1}.jpg`,
            pdf_url: i % 2 ? null : `http://pdf/${i + 1}.pdf`,
            hidden: false,
        }));

    it("Pagination: clicking the last page number jumps to the last page; clicking Next again stays on the last page", async () => {
        await renderWith(makeRows());

        // On the first page we should have 1 / 2 / 11 and one ellipsis
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("button", { name: "2" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "11" })).toBeInTheDocument();
        expect(screen.getAllByText("…").length).toBeGreaterThanOrEqual(1);

        // Click the last page directly
        fireEvent.click(screen.getByRole("button", { name: "11" }));
        const last = screen.getByRole("button", { name: "11" });
        expect(last).toHaveAttribute("aria-current", "page");

        // Clicking Next should not move off the last page
        const nextBtn = screen.getByRole("button", { name: /Next/i });
        fireEvent.click(nextBtn);
        expect(screen.getByRole("button", { name: "11" })).toHaveAttribute("aria-current", "page");
    });

    it("When filters change, reset to page 1 and recalc page count (11 → 3)", async () => {
        await renderWith(makeRows());

        // First go to page 6 to confirm a mid-page state
        const nextBtn = screen.getByRole("button", { name: /Next/i });
        for (let i = 0; i < 5; i++) fireEvent.click(nextBtn);
        expect(screen.getByRole("button", { name: "6" })).toHaveAttribute("aria-current", "page");
        expect(screen.getAllByText("…").length).toBeGreaterThanOrEqual(2);

        // Select Type=C (total 220/4=55, pages should become 3)
        await userEvent.selectOptions(getTypeSelect(), "C");

        // Back to page 1; last page number changes from 11 to 3
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
        expect(screen.queryByRole("button", { name: "11" })).toBeNull();
        expect(screen.getByRole("button", { name: "3" })).toBeInTheDocument();
    });



    it("Pagination: on the first page, Previous has no effect and stays on page 1", async () => {
        await renderWith(makeRows());

        const prevBtn = screen.getByRole("button", { name: /Previous/i });
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");

        fireEvent.click(prevBtn);
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
    });

    it("Clear: reset all filters to All and expand pagination back to full (11 appears)", async () => {
        await renderWith(makeRows());

        // Narrow the set first: Year=2000 + Type=D, pages will be far fewer
        await userEvent.selectOptions(getYearSelect(), "2000");
        await userEvent.selectOptions(getTypeSelect(), "D");
        expect(screen.queryByRole("button", { name: "11" })).toBeNull();

        // Click Clear
        await userEvent.click(screen.getByRole("button", { name: /^Clear$/i }));

        // Back to All; pagination returns to full (11 present)
        expect(getYearSelect()).toHaveDisplayValue("Year: All");
        expect(getTypeSelect()).toHaveDisplayValue("Type: All");
        expect(screen.getByRole("button", { name: "1" })).toHaveAttribute("aria-current", "page");
        expect(screen.getByRole("button", { name: "11" })).toBeInTheDocument();
    });
});
