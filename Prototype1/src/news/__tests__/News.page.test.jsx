// src/news/__tests__/News.page.test.jsx
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { act } from "react";
import News from "../News";

jest.mock("../news.css", () => ({}));

jest.mock("../../components/MainNav", () => ({
    __esModule: true,
    default: () => <nav data-testid="main-nav">MAIN NAV</nav>,
}));

jest.mock("../Widgets/NewsModal.jsx", () => ({
    __esModule: true,
    default: ({ open, item, onClose }) =>
        open ? (
            <div data-testid="zoom-modal">
                <div data-testid="zoom-open">{String(open)}</div>
                <div data-testid="zoom-title">{item?.title ?? ""}</div>
                <button onClick={onClose}>close-zoom</button>
            </div>
        ) : null,
}));

jest.mock("../Widgets/SearchOverlay.jsx", () => ({
    __esModule: true,
    default: ({ open, onClose, onSelect }) =>
        open ? (
            <div data-testid="search-overlay">
                <button
                    onClick={() =>
                        onSelect(
                            { id: 999, title: "From Search", updated_at: "2025-01-01T00:00:00Z" },
                            { left: 0, top: 0, width: 10, height: 10 }
                        )
                    }
                >
                    pick-from-search
                </button>
                <button onClick={onClose}>close-search</button>
            </div>
        ) : null,
}));

jest.mock("../Widgets/AdminNewsUploader.jsx", () => ({
    __esModule: true,
    default: ({ externalOpen, initial, onCreated, onUpdated, onDeleted, onClose }) =>
        externalOpen ? (
            <div
                data-testid="uploader"
                data-mode={initial ? "edit" : "create"}
                data-initial-title={initial?.title ?? ""}
            >
                <button onClick={() => onCreated && onCreated()}>mock-create-done</button>
                <button onClick={() => onUpdated && onUpdated()}>mock-update-done</button>
                <button onClick={() => onDeleted && onDeleted()}>mock-delete-done</button>
                <button onClick={onClose}>mock-close</button>
            </div>
        ) : null,
}));

const LIST = [
    {
        id: 1,
        title: "Hero Post",
        excerpt: "A",
        cover_url: "/hero.jpg",
        body: "Hero body",
        category: "events",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
    },
    {
        id: 2,
        title: "Recent 1",
        excerpt: "R1",
        cover_url: "/r1.jpg",
        body: "Recent 1 body",
        category: "mentor",
        created_at: "2024-01-02T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
    },
    {
        id: 3,
        title: "Recent 2",
        excerpt: "R2",
        cover_url: "/r2.jpg",
        body: "Recent 2 body",
        category: "people",
        created_at: "2024-01-03T00:00:00Z",
        updated_at: "2024-01-03T00:00:00Z",
    },
];

beforeEach(() => {
    jest.resetAllMocks();
    global.fetch = jest.fn(async (url, opts) => {
        const u = String(url);
        if (u.endsWith("/api/news")) {
            return { ok: true, json: async () => LIST };
        }
        if (u.match(/\/api\/news\/\d+$/)) {
            const id = Number(u.split("/").pop());
            const row = LIST.find((x) => x.id === id);
            return {
                ok: true,
                json: async () => ({
                    ...row,
                    body: (row?.body ?? "") + " (full)",
                    updated_at: "2025-02-01T00:00:00Z",
                }),
            };
        }
        if (u.match(/\/api\/admin\/news\/\d+$/) && opts?.method === "DELETE") {
            return { ok: true, json: async () => ({ ok: 1 }) };
        }
        return { ok: true, json: async () => ({}) };
    });
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
});

test("initial load: render Hero (LATEST), MOST RECENT list and categories", async () => {
    render(<News />);
    const heroH1 = await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    expect(screen.getByTestId("main-nav")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Hero Post" })).toHaveAttribute("src", "/hero.jpg");
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Recent 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Recent 2" })).toBeInTheDocument();
    expect(screen.getByText(/CATEGORIES/i)).toBeInTheDocument();
    expect(screen.getByText(/LATEST/i)).toBeInTheDocument();
    expect(screen.getByText(/MOST RECENT/i)).toBeInTheDocument();
    expect(heroH1).toBeInTheDocument();
});

test("click Hero card -> open ZoomModal; click close-zoom to close", async () => {
    render(<News />);
    const heroH1 = await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    fireEvent.click(heroH1.closest("article"));
    expect(screen.getByTestId("zoom-modal")).toBeInTheDocument();
    expect(screen.getByTestId("zoom-open")).toHaveTextContent("true");
    expect(screen.getByTestId("zoom-title")).toHaveTextContent("Hero Post");
    fireEvent.click(screen.getByText("close-zoom"));
    await waitFor(() => expect(screen.queryByTestId("zoom-modal")).not.toBeInTheDocument());
});

test("focus search input -> open SearchOverlay; select in overlay -> open ZoomModal (From Search)", async () => {
    render(<News />);
    await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    const input = screen.getByPlaceholderText(/Search news…/i);
    await act(async () => {
        input.focus();
    });
    await waitFor(() => expect(screen.getByTestId("search-overlay")).toBeInTheDocument());
    fireEvent.click(screen.getByText("pick-from-search"));
    await waitFor(() => expect(screen.getByTestId("zoom-title")).toHaveTextContent("From Search"));
});

test("click Upload -> open create modal; click mock-create-done -> call onCreated and refresh list", async () => {
    render(<News />);
    await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    expect(global.fetch).toHaveBeenCalledWith("/api/news");
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    expect(screen.getByTestId("uploader")).toBeInTheDocument();
    expect(screen.getByTestId("uploader")).toHaveAttribute("data-mode", "create");
    fireEvent.click(screen.getByText("mock-create-done"));
    await waitFor(() => expect(screen.queryByTestId("uploader")).not.toBeInTheDocument());
    const callsToNews = global.fetch.mock.calls.filter(([u]) => String(u) === "/api/news");
    expect(callsToNews.length).toBeGreaterThanOrEqual(2);
});

test("detail mode click Edit -> fetch /api/news/:id and open edit modal (with initial)", async () => {
    render(<News />);
    const heroH1 = await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    fireEvent.click(heroH1.closest("article"));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() =>
        expect(global.fetch.mock.calls.some(([u]) => String(u).endsWith("/api/news/1"))).toBe(true)
    );
    await waitFor(() => expect(screen.getByTestId("uploader")).toBeInTheDocument());
    expect(screen.getByTestId("uploader")).toHaveAttribute("data-mode", "edit");
    expect(screen.getByTestId("uploader")).toHaveAttribute("data-initial-title", "Hero Post");
    fireEvent.click(screen.getByText("mock-update-done"));
    await waitFor(() => expect(screen.queryByTestId("uploader")).not.toBeInTheDocument());
    const newsCalls = global.fetch.mock.calls.filter(([u]) => String(u) === "/api/news");
    expect(newsCalls.length).toBeGreaterThanOrEqual(2);
});

test("detail mode click Delete: confirm=true -> call DELETE and refresh; confirm=false -> no delete", async () => {
    render(<News />);
    const heroH1 = await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    fireEvent.click(heroH1.closest("article"));
    window.confirm = jest.fn(() => true);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() =>
        expect(
            global.fetch.mock.calls.some(
                ([u, o]) => String(u).endsWith("/api/admin/news/1") && o?.method === "DELETE"
            )
        ).toBe(true)
    );
    const deleteCallsBefore = global.fetch.mock.calls.filter(
        ([u, o]) => String(u).includes("/api/admin/news/") && o?.method === "DELETE"
    ).length;
    fireEvent.click(
        (await screen.findByRole("heading", { level: 1, name: "Hero Post" })).closest("article")
    );
    window.confirm = jest.fn(() => false);
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
        const deleteCallsAfter = global.fetch.mock.calls.filter(
            ([u, o]) => String(u).includes("/api/admin/news/") && o?.method === "DELETE"
        ).length;
        expect(deleteCallsAfter).toBe(deleteCallsBefore);
    });
});

test("submitting empty search does not open SearchOverlay (onSearch early return)", async () => {
    render(<News />);
    await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    const form = document.querySelector("form.latestSearch");
    fireEvent.submit(form);
    await waitFor(() => expect(screen.queryByTestId("search-overlay")).not.toBeInTheDocument());
});

test("click left column category card -> open ZoomModal (no anchorSelector branch) and show floating action buttons", async () => {
    render(<News />);
    await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    const picks = document.querySelector("section.picks");
    const leftHero = within(picks).getByText("Hero Post");
    const clickable = leftHero.closest(".isClickable") || leftHero.parentElement;
    fireEvent.click(clickable);
    expect(screen.getByTestId("zoom-modal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
});

test("startEdit failure: fetching /api/news/:id not ok -> do not open edit modal", async () => {
    render(<News />);
    const heroH1 = await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    fireEvent.click(heroH1.closest("article"));
    global.fetch.mockImplementationOnce(async () => ({ ok: false, json: async () => ({}) }));
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    await waitFor(() => expect(screen.queryByTestId("uploader")).not.toBeInTheDocument());
    expect(screen.getByTestId("zoom-modal")).toBeInTheDocument();
});

test("deleteCurrent failure: DELETE not ok -> alert('Delete failed') and keep detail view", async () => {
    render(<News />);
    const heroH1 = await screen.findByRole("heading", { level: 1, name: "Hero Post" });
    fireEvent.click(heroH1.closest("article"));
    window.confirm = jest.fn(() => true);
    global.fetch.mockImplementationOnce((url, opts) => {
        if (String(url).includes("/api/admin/news/") && opts?.method === "DELETE") {
            return Promise.reject(new Error("boom"));
        }
        return Promise.resolve({ ok: true, json: async () => ({}) });
    });
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith("Delete failed"));
    expect(screen.getByTestId("zoom-modal")).toBeInTheDocument();
});
