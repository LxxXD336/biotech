/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen, waitFor, fireEvent, within, act } from "@testing-library/react";
import SearchOverlay from "../SearchOverlay";

const mockFetch = jest.fn();

const esListeners: Record<string, Function[]> = {};
class MockEventSource {
    url: string;
    constructor(url: string) {
        this.url = url;
    }
    addEventListener(type: string, cb: any) {
        (esListeners[type] ||= []).push(cb);
    }
    close() {}
}

const bcInstances: MockBroadcastChannel[] = [];
class MockBroadcastChannel {
    name: string;
    messages: any[] = [];
    constructor(name: string) {
        this.name = name;
        bcInstances.push(this);
    }
    postMessage = (m: any) => {
        this.messages.push(m);
    };
    close() {}
}

beforeAll(() => {
    // @ts-ignore
    global.fetch = mockFetch;
    // @ts-ignore
    global.EventSource = MockEventSource;
    // @ts-ignore
    global.BroadcastChannel = MockBroadcastChannel;
    jest.spyOn(window, "confirm").mockReturnValue(true);
});

afterAll(() => {
    jest.restoreAllMocks();
});

const groups = [
    { id: "g1", title: "Group A" },
    { id: "g2", title: "Group B" },
];

const imagesFrom = (gid: string) =>
    gid === "g1"
        ? ["https://ex/ga-1.jpg", "https://ex/ga-2.jpg"]
        : ["https://ex/gb-1.jpg", "https://ex/gb-2.jpg"];

const serverImages = [
    { id: 101, url: "https://srv/img-101.jpg", name: "Server Pic", category: "CatSrv", tags: ["alpha", "beta"] },
];

const serverMeta = { categories: ["CatSrv", "Symposium"], tags: ["alpha", "beta", "gamma"] };

function primeFetchMocks(meta: any = serverMeta, images: any = serverImages) {
    mockFetch.mockReset().mockImplementation(async (url: string, init?: any) => {
        if (url.endsWith("/api/images") && (!init || init.method === "GET")) {
            return { ok: true, json: async () => images } as any;
        }
        if (url.endsWith("/api/meta") && (!init || init.method === "GET")) {
            return { ok: true, json: async () => meta } as any;
        }
        if (url.endsWith("/api/admin/upload") && init?.method === "POST") {
            return { ok: true, json: async () => ({ url: "https://srv/uploaded.jpg" }) } as any;
        }
        if (url.endsWith("/api/admin/images") && init?.method === "POST") {
            return { ok: true, json: async () => ({ id: 555 }) } as any;
        }
        if (/\/api\/admin\/images\/\d+$/.test(url) && init?.method === "PATCH") {
            return { ok: true, json: async () => ({ ok: 1 }) } as any;
        }
        if (/\/api\/admin\/images\/\d+$/.test(url) && init?.method === "DELETE") {
            return { ok: true, json: async () => ({ ok: 1 }) } as any;
        }
        if (url.endsWith("/api/admin/meta") && init?.method === "PATCH") {
            return { ok: true, json: async () => ({ ok: 1 }) } as any;
        }
        return { ok: true, json: async () => ({}) } as any;
    });
}

const showingText = () => screen.getByText(/Showing/i);

test("happy path: load/filter/select/viewer/upload/edit/meta/events", async () => {
    primeFetchMocks();

    const onRequestClose = jest.fn();
    const onUploaded = jest.fn();

    const { container } = render(
        <SearchOverlay
            groups={groups}
            imagesFrom={imagesFrom}
            onRequestClose={onRequestClose}
            items={undefined}
            onUploaded={onUploaded}
        />
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/meta$/)));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/images$/)));
    await waitFor(() => expect(showingText()).toHaveTextContent(/Showing\s*5\s*of\s*5/i));

    const input = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(input, { target: { value: "alpha" } });
    expect(showingText()).toHaveTextContent(/Showing\s*1\s*of\s*5/i);

    fireEvent.change(input, { target: { value: "" } });
    const categoriesSec = screen.getByText("Categories").parentElement as HTMLElement;
    fireEvent.click(within(categoriesSec).getByRole("button", { name: "CatSrv" }));
    expect(showingText()).toHaveTextContent(/Showing\s*1\s*of\s*5/i);

    fireEvent.click(within(categoriesSec).getByRole("button", { name: "CatSrv" }));
    const tagsSec = screen.getByText("Tags").parentElement as HTMLElement;
    fireEvent.click(within(tagsSec).getByRole("button", { name: /#\s*beta/i }));
    expect(showingText()).toHaveTextContent(/Showing\s*1\s*of\s*5/i);

    fireEvent.click(screen.getByRole("button", { name: /Select \(S\)/i }));
    expect(screen.getByText(/Bulk Actions/i)).toBeInTheDocument();

    const gridMain = container.querySelector('div[style*="grid-template-columns"]') as HTMLElement;
    expect(gridMain).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Select All \(Filtered\)/i }));
    expect(screen.getByText(/Selected:\s*1/i)).toBeInTheDocument();

    const catSelect = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(catSelect, { target: { value: "Symposium" } });

    const applyCat = screen.getByRole("button", { name: /Apply Category/i });
    await act(async () => {
        fireEvent.click(applyCat);
    });
    await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/admin\/images\/101$/),
            expect.objectContaining({ method: "PATCH" })
        )
    );

    const bulkTagContainer = screen.getByRole("button", { name: /Apply Tags/i }).closest("div") as HTMLElement;
    const tagAlpha = within(bulkTagContainer).getByRole("button", { name: /#\s*alpha/i });
    const tagGamma = within(bulkTagContainer).getByRole("button", { name: /#\s*gamma/i });
    fireEvent.click(tagAlpha);
    fireEvent.click(tagGamma);
    fireEvent.click(screen.getByRole("button", { name: /Apply Tags/i }));

    fireEvent.click(screen.getByRole("button", { name: /Done/i }));
    expect(screen.queryByText(/Bulk Actions/i)).toBeNull();

    const clearBtn = screen.getByRole("button", { name: "Clear" });
    fireEvent.click(clearBtn);
    await waitFor(() => expect(showingText()).toHaveTextContent(/Showing\s*5\s*of\s*5/i));

    const imgs = within(gridMain).getAllByRole("img");
    const targetFigure = (imgs[1] || imgs[0]).closest("figure") as HTMLElement;
    fireEvent.click(targetFigure);

    const nextBtn = screen.getByRole("button", { name: "Next" });
    const prevBtn = screen.getByRole("button", { name: "Previous" });
    fireEvent.click(nextBtn);
    fireEvent.click(prevBtn);

    const overlay = nextBtn.parentElement as HTMLElement;
    const imgInViewer = within(overlay).getByRole("img");
    fireEvent.doubleClick(imgInViewer);
    expect(screen.getByText(/%/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(screen.getByText(/100%/)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "+" });
    fireEvent.keyDown(window, { key: "-" });
    fireEvent.keyDown(window, { key: "r" });
    fireEvent.keyDown(window, { key: "ArrowRight" });
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Next" })).toBeNull());

    fireEvent.click((within(gridMain).getAllByRole("img")[0].closest("figure") as HTMLElement));
    const anchorClickSpy = jest.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(anchorClickSpy).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    anchorClickSpy.mockRestore();

    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    const uploadModal = screen.getByText("Upload Images").parentElement!.parentElement as HTMLElement;

    const chooseFiles = screen.getByRole("button", { name: "Choose Files" });
    fireEvent.click(chooseFiles);

    const fileInput = uploadModal.querySelector('input[type="file"][multiple]') as HTMLInputElement;
    const file = new File(["dummy"], "pic1.jpg", { type: "image/jpeg" });
    Object.defineProperty(fileInput, "files", { value: [file] });
    fireEvent.change(fileInput);

    const modalUploadBtn = within(uploadModal).getByRole("button", { name: "Upload" });
    await waitFor(() => expect(modalUploadBtn).not.toBeDisabled());
    fireEvent.click(modalUploadBtn);

    await waitFor(() => expect(onUploaded).toHaveBeenCalledTimes(1));
    expect(onUploaded.mock.calls[0][0]).toEqual(
        expect.objectContaining({
            src: "https://srv/uploaded.jpg",
            name: "pic1.jpg",
            categories: expect.any(Array),
            tags: expect.any(Array),
        })
    );

    const gridAgain = container.querySelector('div[style*="grid-template-columns"]') as HTMLElement;
    fireEvent.click(within(gridAgain).getAllByRole("img")[0].closest("figure") as HTMLElement);

    const nextInViewer = await screen.findByRole("button", { name: "Next" });
    const viewerToolbar = nextInViewer.parentElement as HTMLElement;

    fireEvent.click(within(viewerToolbar).getByRole("button", { name: "Edit" }));

    const editHeading = await screen.findByText("Edit Meta", { selector: "div" });
    const editModal = editHeading.parentElement!.parentElement as HTMLElement;

    const nameInput = within(editModal).getByRole("textbox") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    const catSelectInEdit = within(editModal).getByRole("combobox") as HTMLSelectElement;
    const firstCatValue = (catSelectInEdit.options[0] as HTMLOptionElement)?.value ?? "";
    if (firstCatValue) {
        fireEvent.change(catSelectInEdit, { target: { value: firstCatValue } });
    }

    const tagBtnInEdit =
        within(editModal).queryByRole("button", { name: /#\s*(alpha|tech)/i }) ||
        within(editModal).getAllByRole("button").find((el) => /^#/.test(el.textContent || ""));
    if (tagBtnInEdit) fireEvent.click(tagBtnInEdit as HTMLElement);

    fireEvent.click(within(editModal).getByRole("button", { name: "Save" }));
    await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/admin\/images\/\w+$/),
            expect.objectContaining({ method: "PATCH" })
        )
    );

    const nextInViewer2 = await screen.findByRole("button", { name: "Next" });
    const viewerToolbar2 = nextInViewer2.parentElement as HTMLElement;
    fireEvent.click(within(viewerToolbar2).getByRole("button", { name: "Edit" }));

    const editHeading2 = await screen.findByText("Edit Meta", { selector: "div" });
    const editModal2 = editHeading2.parentElement!.parentElement as HTMLElement;
    fireEvent.click(within(editModal2).getByRole("button", { name: "Delete" }));

    await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/admin\/images\/101$/),
            expect.objectContaining({ method: "DELETE" })
        )
    );
    await waitFor(() => expect(screen.queryByRole("button", { name: "Next" })).toBeNull());

    esListeners["images"]?.forEach((cb) => cb());
    esListeners["meta"]?.forEach((cb) => cb());
    await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/images$/));
        expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/meta$/));
    });
});

test("items branch + derived categories/tags + no result state + keyboard shortcuts (S/Escape)", async () => {
    const items = [
        { id: "i1", src: "https://local/1.jpg", name: "Local 1", category: "Loc", tags: ["Events"] },
        { id: "i2", src: "https://local/2.jpg", name: "Local 2", category: "Loc", tags: ["People"] },
    ];
    primeFetchMocks({ categories: [], tags: [] }, []);

    const onRequestClose = jest.fn();
    render(<SearchOverlay groups={groups} imagesFrom={imagesFrom} onRequestClose={onRequestClose} items={items} />);

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    expect(screen.getByRole("button", { name: /#\s*Events/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /#\s*People/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "s" });
    expect(screen.getByText(/Bulk Actions/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onRequestClose).toHaveBeenCalled();

    const input = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(input, { target: { value: "zzz-not-found" } });
    expect(await screen.findByText(/No results/i)).toBeInTheDocument();
});

test("extra coverage: global meta save + broadcast, bulk delete, viewer wheel/drag/backdrop, top close button", async () => {
    primeFetchMocks();

    const onRequestClose = jest.fn();
    const { container } = render(
        <SearchOverlay
            groups={groups}
            imagesFrom={imagesFrom}
            onRequestClose={onRequestClose}
            items={undefined}
        />
    );

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/images$/)));

    fireEvent.click(screen.getByRole("button", { name: "Global Meta" }));
    const metaModalHeading = await screen.findByText("Global Meta", { selector: "div" });
    const metaModal = metaModalHeading.parentElement!.parentElement as HTMLElement;

    fireEvent.click(within(metaModal).getByRole("button", { name: "Use Example" }));
    fireEvent.click(within(metaModal).getByRole("button", { name: "Save" }));

    await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/admin\/meta$/),
            expect.objectContaining({ method: "PATCH" })
        )
    );
    await waitFor(() => expect(screen.queryByText("Global Meta", { selector: "div" })).toBeNull());

    expect(screen.getByRole("button", { name: /#\s*tech/i })).toBeInTheDocument();

    const bc = bcInstances[bcInstances.length - 1];
    expect(bc.messages.some((m) => m?.type === "meta")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: /Select \(S\)/i }));
    const gridEl = container.querySelector('div[style*="grid-template-columns"]') as HTMLElement;
    const serverCard = within(gridEl).getByAltText("Server Pic").closest("figure") as HTMLElement;
    fireEvent.click(serverCard);
    fireEvent.click(screen.getByRole("button", { name: /Delete Selected \(1\)/i }));
    await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringMatching(/\/api\/admin\/images\/101$/),
            expect.objectContaining({ method: "DELETE" })
        )
    );

    const exitBtn = screen.queryByRole("button", { name: /Exit Select \(S\)/i });
    if (exitBtn) {
        fireEvent.click(exitBtn);
    }
    await waitFor(() =>
        expect(screen.getByRole("button", { name: /Select \(S\)/i })).toBeInTheDocument()
    );

    const anyCard = within(gridEl).getAllByRole("img")[0].closest("figure") as HTMLElement;
    fireEvent.click(anyCard);

    const nextButton = await screen.findByRole("button", { name: "Next" });

    const overlay = nextButton.parentElement as HTMLElement;

    for (let i = 0; i < 3; i++) fireEvent.wheel(overlay, { deltaY: -120 });

    expect(screen.getByText(/\d{3}%/)).toBeInTheDocument();

    fireEvent.mouseDown(overlay, { clientX: 10, clientY: 10 });
    fireEvent.mouseMove(overlay, { clientX: 30, clientY: 40 });
    expect((overlay as HTMLElement).style.cursor).toBe("grabbing");
    fireEvent.mouseUp(overlay);

    for (let i = 0; i < 10; i++) fireEvent.wheel(overlay, { deltaY: 120 });
    expect(screen.getByText(/100%/)).toBeInTheDocument();

    fireEvent.click(overlay);
    await waitFor(() => expect(screen.queryByRole("button", { name: "Next" })).toBeNull());

    fireEvent.click(screen.getByRole("button", { name: "Close (Esc)" }));
    expect(onRequestClose).toHaveBeenCalled();
});

test("items branch + derived categories/tags + no result state + keyboard shortcuts (S/Escape)", async () => {
    const items = [
        { id: "i1", src: "https://local/1.jpg", name: "Local 1", category: "Loc", tags: ["Events"] },
        { id: "i2", src: "https://local/2.jpg", name: "Local 2", category: "Loc", tags: ["People"] },
    ];
    primeFetchMocks({ categories: [], tags: [] }, []);

    const onRequestClose = jest.fn();
    render(<SearchOverlay groups={groups} imagesFrom={imagesFrom} onRequestClose={onRequestClose} items={items} />);

    await waitFor(() => expect(mockFetch).toHaveBeenCalled());

    expect(screen.getByRole("button", { name: /#\s*Events/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /#\s*People/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "s" });
    expect(screen.getByText(/Bulk Actions/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onRequestClose).toHaveBeenCalled();

    const input = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(input, { target: { value: "zzz-not-found" } });
    expect(await screen.findByText(/No results/i)).toBeInTheDocument();
});
