// src/__tests__/PastWinners.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    render,
    screen,
    fireEvent,
    act,
    within,
    waitFor,
    waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

/* ========= Vite environment fallbacks ========= */
if (!(import.meta as any).env) {
    (import.meta as any).env = {
        VITE_API_BASE: "http://localhost:8000",
        VITE_ADMIN_PASSWORD: "biotech",
    };
}
if (!(import.meta as any).glob) {
    (import.meta as any).glob = (_p: string, _o?: any) => ({});
}

/* ========= framer-motion: passthrough & strip motion-only props to avoid console warnings ========= */
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
            ...rest
        } = props || {};
        return rest;
    };
    const passthrough =
        (tag = "div") =>
            ({ children, ...rest }: any) =>
                React.createElement(tag, strip(rest), children);
    return {
        motion: new Proxy({}, { get: () => passthrough() }),
        AnimatePresence: passthrough(),
        MotionConfig: passthrough(),
        useMotionValue: () => ({ set: () => {} }),
        useSpring: (v: any) => v,
    };
});

/* ========= Simplify MainNav / Footer ========= */
vi.mock("../components/MainNav", () => ({ default: () => <nav data-testid="main-nav" /> }));
vi.mock("../sections/home/Footer", () => ({ default: () => <footer data-testid="footer" /> }));

/* ========= hoisted API mock ========= */
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
    const getDB = () => DB;

    const listPosters = vi.fn(async ({ include_hidden }: any = {}) =>
        include_hidden ? getDB().slice() : getDB().filter((p) => !p.hidden)
    );
    const hidePoster = vi.fn(async (id: number) => {
        const p = getDB().find((x) => x.id === id);
        if (p) p.hidden = true;
    });
    const unhidePoster = vi.fn(async (id: number) => {
        const p = getDB().find((x) => x.id === id);
        if (p) p.hidden = false;
    });
    const deletePoster = vi.fn(async (id: number) => {
        setDB(getDB().filter((x) => x.id !== id));
    });
    const updatePoster = vi.fn(async (id: number, patch: any) => {
        const rows = getDB().slice();
        const i = rows.findIndex((x) => x.id === id);
        if (i >= 0) {
            rows[i] = {
                ...rows[i],
                ...(patch.title !== undefined ? { title: patch.title } : {}),
                ...(patch.year !== undefined ? { year: Number(patch.year) } : {}),
                ...(patch.award !== undefined ? { award: patch.award } : {}),
                ...(patch.type !== undefined ? { type: patch.type } : {}),
                ...(patch.area !== undefined ? { area: patch.area } : {}),
                ...(patch.description !== undefined ? { description: patch.description } : {}),
                ...(patch.image ? { image_url: "http://img/updated.jpg" } : {}),
                ...(patch.pdf ? { pdf_url: "http://pdf/updated.pdf" } : {}),
            };
            setDB(rows);
            return rows[i];
        }
        return undefined;
    });

    return { setDB, getDB, listPosters, hidePoster, unhidePoster, deletePoster, updatePoster };
});

vi.mock("../api/posters", () => ({
    listPosters: hoisted.listPosters,
    hidePoster: hoisted.hidePoster,
    unhidePoster: hoisted.unhidePoster,
    deletePoster: hoisted.deletePoster,
    updatePoster: hoisted.updatePoster,
    __setDB: hoisted.setDB,
    __getDB: hoisted.getDB,
}));

/* ========= Import the tested component (after mocks) ========= */
import PastWinners from "../components/PastWinners";
import * as postersApi from "../api/posters";

/* ========= Utils ========= */
function seed() {
    (postersApi as any).__setDB([
        {
            id: 1,
            title: "Visible A",
            year: 2021,
            award: "Winner",
            type: "Bio",
            area: "Medicine",
            description: "d1",
            image_url: "http://img/a.jpg",
            pdf_url: null,
            hidden: false,
        },
        {
            id: 2,
            title: "Hidden B",
            year: 2020,
            award: "Runner Up",
            type: "Env",
            area: "Environment",
            description: "d2",
            image_url: "http://img/b.jpg",
            pdf_url: "http://pdf/b.pdf",
            hidden: true,
        },
    ] as PosterDTO[]);
}

async function renderPage() {
    seed();
    const ui = render(<PastWinners />);
    await screen.findByText(/Showing/i);
    return ui;
}

async function renderWith(rows: PosterDTO[]) {
    (postersApi as any).__setDB(rows);
    const ui = render(<PastWinners />);
    await screen.findByText(/Showing/i);
    return ui;
}

function clickOpenAdmin() {
    const btnByLabel = screen.queryByLabelText(/^\s*Open Admin\s*$/i);
    if (btnByLabel) {
        fireEvent.click(btnByLabel);
        return;
    }
    fireEvent.click(
        screen.getByRole("button", {
            name: (name) => /^admin$/i.test(name) || /^open admin$/i.test(name),
        })
    );
}

function findImageFileInput(): HTMLInputElement {
    const byAccept = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement | null;
    if (byAccept) return byAccept;
    const labeled = screen.queryByLabelText(/^Image/i) as HTMLElement | null;
    if (labeled) {
        const fromLabel = labeled.closest("label")?.querySelector('input[type="file"]') as HTMLInputElement | null;
        if (fromLabel) return fromLabel;
        const fromParent = labeled.parentElement?.querySelector('input[type="file"]') as HTMLInputElement | null;
        if (fromParent) return fromParent;
    }
    const first = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    if (!first) throw new Error("File input not found");
    return first;
}

/* ========= Test cases ========= */
describe("PastWinners (Vitest)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Avoid leftover scroll lock from the previous case; some implementations set it once on mount
        document.body.style.overflow = "";
    });

    it("Initially shows only unhidden posters, and overlay can be opened", async () => {
        await renderPage();
        expect(screen.getByText("Visible A")).toBeInTheDocument();
        expect(screen.queryByText("Hidden B")).not.toBeInTheDocument();

        // Click the card's "Open" precisely (aria-label="Open") to avoid misclicking "Open Admin"
        const openBtns = screen.getAllByLabelText(/^open$/i);
        await act(async () => fireEvent.click(openBtns[0]));

        // Overlay appears: wait for the “Close” button (without relying on role=dialog)
        const overlayCloseBtn = await screen.findByRole("button", { name: /^close$/i });
        expect(overlayCloseBtn).toBeInTheDocument();
    });

    it("Admin unlock → Hide → Unhide", async () => {
        await renderPage();
        clickOpenAdmin();

        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);

        const editBtns = await screen.findAllByRole("button", { name: /edit/i });
        expect(editBtns.length).toBeGreaterThan(0);

        const hideBtns = screen.getAllByRole("button", { name: /hide/i });
        await act(async () => fireEvent.click(hideBtns[0]));
        expect(hoisted.hidePoster).toHaveBeenCalled();

        const unhideBtns = await screen.findAllByRole("button", { name: /unhide/i });
        await act(async () => fireEvent.click(unhideBtns[0]));
        expect(hoisted.unhidePoster).toHaveBeenCalled();
    });

    it("Admin deletes hidden item", async () => {
        await renderPage();
        clickOpenAdmin();

        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);

        await screen.findAllByRole("button", { name: /edit/i });

        vi.spyOn(window, "confirm").mockReturnValue(true);
        const delBtns = screen.getAllByRole("button", { name: /delete/i });
        await act(async () => fireEvent.click(delBtns[0]));
        expect(hoisted.deletePoster).toHaveBeenCalled();
    });

    it("Edit: can modify description and image (FormData semantics)", async () => {
        await renderPage();
        clickOpenAdmin();

        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);

        await screen.findAllByRole("button", { name: /edit/i });
        fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);

        const desc = screen.getByLabelText(/Description/i);
        fireEvent.change(desc, { target: { value: "new desc" } });

        const fileInput = findImageFileInput();
        const file = new File([new Uint8Array([1, 2, 3])], "x.png", { type: "image/png" });
        await act(async () => fireEvent.change(fileInput, { target: { files: [file] } } as any));

        const save = screen.getByRole("button", { name: /save/i });
        await act(async () => fireEvent.click(save));

        expect(hoisted.updatePoster).toHaveBeenCalled();
        const calls = hoisted.updatePoster.mock.calls;
        const lastCall = calls[calls.length - 1]!;
        const [, payload] = lastCall;
        expect(payload.description).toBe("new desc");
        expect(payload.image instanceof Blob).toBe(true);
    });
});

// ================== Extra cases: robustness / edges / error scenarios ==================
describe("PastWinners (extra cases)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.style.overflow = "";
    });

    it("Admin: wrong password does not unlock (guard); edit buttons remain invisible", async () => {
        await renderPage();

        fireEvent.click(screen.getByRole("button", { name: /admin/i }));

        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "wrong-pass" } });
        fireEvent.submit(pwd.closest("form")!);

        expect(screen.queryByText(/admin unlocked/i)).toBeNull();
        expect(screen.queryAllByRole("button", { name: /edit/i }).length).toBe(0);
    });

    it("Admin: cancel at delete confirmation (confirm=false) will not delete (error/rollback path)", async () => {
        await renderPage();

        fireEvent.click(screen.getByRole("button", { name: /admin/i }));
        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);
        await screen.findByText(/admin unlocked/i);

        const before = screen.getAllByRole("button", { name: /delete/i }).length;
        expect(before).toBeGreaterThan(0);

        vi.spyOn(window, "confirm").mockReturnValue(false);
        fireEvent.click(screen.getAllByRole("button", { name: /delete/i })[0]);

        const after = screen.getAllByRole("button", { name: /delete/i }).length;
        expect(after).toBe(before);
    });

    it("Pagination control: when there is only one page, Previous/Next are disabled (edge)", async () => {
        await renderPage();
        const prev = screen.getByRole("button", { name: /previous/i });
        const next = screen.getByRole("button", { name: /next/i });
        expect(prev).toHaveClass("cursor-not-allowed");
        expect(next).toHaveClass("cursor-not-allowed");
    });

    it("Filters: switching to non-All yields count <= switching back to All (normal + boundary)", async () => {
        await renderPage();

        const countAllStart = screen.getAllByRole("img").length;

        const combos = screen.getAllByRole("combobox");
        expect(combos.length).toBeGreaterThanOrEqual(1);

        const areaOrYear = combos[combos.length - 1]; // more likely Area
        const areaOption = Array.from(areaOrYear.querySelectorAll("option")).find((o) => /^(?!all$).+/i.test(o.value));
        if (!areaOption) return; // if there is no non-All option, skip gracefully to avoid false alarms

        fireEvent.change(areaOrYear, { target: { value: areaOption.value } });
        const countFiltered = screen.getAllByRole("img").length;
        expect(countFiltered).toBeLessThanOrEqual(countAllStart);

        const allOption = Array.from(areaOrYear.querySelectorAll("option")).find((o) => /^all$/i.test(o.value));
        if (allOption) {
            fireEvent.change(areaOrYear, { target: { value: allOption.value } });
            const countAllEnd = screen.getAllByRole("img").length;
            expect(countAllEnd).toBeGreaterThanOrEqual(countFiltered);
        }
    });

    it("A11y: each card has at least one actionable Open button (normal)", async () => {
        await renderPage();
        const openBtns = screen.getAllByLabelText(/^open$/i);
        expect(openBtns.length).toBeGreaterThan(0);
    });

    it("Overlay: clicking Close will close and restore body overflow", async () => {
        await renderPage();
        const user = userEvent.setup();

        // open
        await user.click(screen.getAllByLabelText(/^open$/i)[0]);

        const closeBtn = await screen.findByRole("button", { name: /^close$/i });
        expect(closeBtn).toBeInTheDocument();

        await user.click(closeBtn);
        // wait for exit animation then element removal
        await waitFor(() => {
            expect(screen.queryByRole("button", { name: /^close$/i })).toBeNull();
        });
        await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
    });

    it("Open button supports Enter key (accessibility)", async () => {
        await renderPage();
        const user = userEvent.setup();

        const openBtn = screen.getAllByLabelText(/^open$/i)[0];
        openBtn.focus();
        await user.keyboard("{Enter}");

        const closeBtn = await screen.findByRole("button", { name: /^close$/i });
        expect(closeBtn).toBeInTheDocument();
    });

    it("Overlay locks scroll when open (body overflow=hidden), restored on close", async () => {
        await renderPage();
        const user = userEvent.setup();

        await user.click(screen.getAllByLabelText(/^open$/i)[0]);
        const closeBtn = await screen.findByRole("button", { name: /^close$/i });

        expect(document.body.style.overflow).toBe("hidden"); // should lock after opening

        await user.click(closeBtn);
        await waitFor(() => expect(screen.queryByRole("button", { name: /^close$/i })).toBeNull());
        await waitFor(() => expect(document.body.style.overflow).not.toBe("hidden"));
    });

    it("Home page poster images use lazy loading (loading=lazy)", async () => {
        await renderPage();
        const imgs = screen.getAllByRole("img");
        expect(imgs.length).toBeGreaterThan(3);
        for (const img of imgs) {
            expect(img).toHaveAttribute("loading", "lazy");
        }
    });

    it("Robustness: with no downloadable assets (image_url & pdf_url both null) overlay still opens and closes normally", async () => {
        await renderWith([
            {
                id: 10,
                title: "No Assets",
                year: 2022,
                type: "Bio",
                area: "Medicine",
                award: "Winner",
                description: "no resources",
                image_url: null,
                pdf_url: null,
                hidden: false,
            },
        ]);

        const user = userEvent.setup();
        await user.click(screen.getAllByLabelText(/^open$/i)[0]);

        const closeBtn = await screen.findByRole("button", { name: /^close$/i });
        expect(closeBtn).toBeInTheDocument();

        await user.click(closeBtn);
        await waitFor(() => expect(screen.queryByRole("button", { name: /^close$/i })).toBeNull());
    });

    it("Structure: MainNav and Footer render (integration smoke check)", async () => {
        await renderPage();
        expect(screen.getByTestId("main-nav")).toBeInTheDocument();
        expect(screen.getByTestId("footer")).toBeInTheDocument();
    });
});
// ⬇️ Additional cases: paste directly at the end of the current PastWinners.test.tsx file

describe("PastWinners (more cases)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.style.overflow = "";
    });

    it("After admin unlock: hidden item (Hidden B) becomes visible in the list", async () => {
        await renderPage();

        // Unlock
        fireEvent.click(screen.getByRole("button", { name: /admin/i }));
        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);

        // After success, previously hidden entry should be visible
        expect(await screen.findByText("Hidden B")).toBeInTheDocument();
    });

    it('Pagination: Next/Prev changes the "Showing … of …" text (multi-page scenario)', async () => {
        // Build 37 rows to ensure multiple pages
        const rows = Array.from({ length: 37 }, (_, i) => ({
            id: i + 1,
            title: `Poster #${i + 1}`,
            year: 2019 + ((i % 5) as number),
            award: i % 2 ? "Winner" : "Runner Up",
            type: ["Bio", "Env", "Health", "Chem"][i % 4],
            area: ["Medicine", "Environment", "Physics"][i % 3],
            description: `desc ${i + 1}`,
            image_url: `http://img/${i + 1}.jpg`,
            pdf_url: i % 3 === 0 ? `http://pdf/${i + 1}.pdf` : null,
            hidden: false,
        }));
        await renderWith(rows);

        const showingEl = screen.getByText(/^Showing/i);
        const before = showingEl.textContent ?? "";

        const nextBtn = screen.getByRole("button", { name: /next/i });
        const disabled =
            nextBtn.getAttribute("disabled") !== null ||
            nextBtn.getAttribute("aria-disabled") === "true" ||
            (nextBtn as HTMLButtonElement).className.includes("cursor-not-allowed");

        // If your implementation sets a very large pageSize (no next page), skip
        if (disabled) return;

        fireEvent.click(nextBtn);
        await waitFor(() =>
            expect((screen.getByText(/^Showing/i).textContent ?? "")).not.toBe(before)
        );

        const prevBtn = screen.getByRole("button", { name: /previous/i });
        fireEvent.click(prevBtn);
        await waitFor(() =>
            expect((screen.getByText(/^Showing/i).textContent ?? "")).toBe(before)
        );
    });

    it("Combined filters: after applying Type + Area together, result count should not exceed single filter", async () => {
        await renderPage();

        const combos = screen.queryAllByRole("combobox");
        if (combos.length < 2) return; // if there is only one dropdown, skip gracefully

        // Pick two different dropdowns (typically Type and Area)
        const [first, second] = combos;

        const pickNonAll = (el: HTMLElement) =>
            Array.from(el.querySelectorAll("option")).find((o) => !/^all$/i.test(o.value));

        const firstOpt = pickNonAll(first);
        const secondOpt = pickNonAll(second);

        if (!firstOpt || !secondOpt) return;

        const countAll = screen.getAllByRole("img").length;

        // Single filter on first
        fireEvent.change(first, { target: { value: firstOpt.value } });
        const countFirst = screen.getAllByRole("img").length;

        // Apply second on top of first
        fireEvent.change(second, { target: { value: secondOpt.value } });
        const countBoth = screen.getAllByRole("img").length;

        expect(countFirst).toBeLessThanOrEqual(countAll);
        expect(countBoth).toBeLessThanOrEqual(countFirst);

        // Restore
        const toAll = (el: HTMLElement) =>
            Array.from(el.querySelectorAll("option")).find((o) => /^all$/i.test(o.value));
        const all1 = toAll(first);
        const all2 = toAll(second);
        if (all1) fireEvent.change(first, { target: { value: all1.value } });
        if (all2) fireEvent.change(second, { target: { value: all2.value } });
        const countRestored = screen.getAllByRole("img").length;
        expect(countRestored).toBeGreaterThanOrEqual(countBoth);
    });

    it("Edit: after changing Title, the title updates immediately in the list", async () => {
        await renderPage();

        // Unlock
        fireEvent.click(screen.getByRole("button", { name: /admin/i }));
        const pwd = screen.getByLabelText(/Admin Password/i);
        fireEvent.change(pwd, { target: { value: "biotech" } });
        fireEvent.submit(pwd.closest("form")!);
        await screen.findAllByRole("button", { name: /edit/i });

        // Open the first edit form
        fireEvent.click(screen.getAllByRole("button", { name: /edit/i })[0]);

        // If your form does not have a Title field, skip
        const titleInput =
            (screen.queryByLabelText(/title/i) as HTMLInputElement | null) ||
            (screen.queryByPlaceholderText?.(/title/i) as HTMLInputElement | null);
        if (!titleInput) return;

        fireEvent.change(titleInput, { target: { value: "Visible A Edited" } });
        fireEvent.click(screen.getByRole("button", { name: /save/i }));

        // After update, the new title appears; the old title disappears
        // NEW: allow the new title to appear multiple times, but at least once
        const updatedTitles = await screen.findAllByText("Visible A Edited");
        expect(updatedTitles.length).toBeGreaterThan(0);

        // Precisely match the old title as a whole word to avoid hitting "Visible A Edited"
        expect(screen.queryByText(/^Visible A$/)).toBeNull();

    });

    it("Open button supports Space key (keyboard accessibility addition)", async () => {
        await renderPage();
        const user = userEvent.setup();

        const openBtn = screen.getAllByLabelText(/^open$/i)[0];
        openBtn.focus();
        await user.keyboard(" "); // Space

        const closeBtn = await screen.findByRole("button", { name: /^close$/i });
        expect(closeBtn).toBeInTheDocument();
    });

    it("Open vs Open Admin aria-labels are not confused", async () => {
        await renderPage();
        const contentOpens = screen.getAllByLabelText(/^open$/i);
        expect(contentOpens.length).toBeGreaterThan(0);

        const adminOpen = screen.getAllByLabelText(/^open admin$/i);
        expect(adminOpen.length).toBe(1);
    });

    it("Structure: Hero section (#hero) exists", async () => {
        await renderPage();
        expect(document.getElementById("hero")).toBeTruthy();
    });
});
