import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminNewsUploader from "../AdminNewsUploader";

jest.mock("quill", () => ({ __esModule: true, default: { register: jest.fn() } }));
jest.mock("@enzedonline/quill-blot-formatter2", () => ({ __esModule: true, default: function () {} }));
jest.mock("quill2-image-uploader", () => ({ __esModule: true, default: function () {} }));

jest.mock("react-quill-new/dist/quill.snow.css", () => ({}));

jest.mock("react-quill-new", () => {
    const React = require("react");
    const Mock = React.forwardRef(function MockQuill(props, ref) {
        const editorApi = {
            getSelection: jest.fn(() => ({ index: 0, length: 0 })),
            getLength: jest.fn(() => (props.value ? String(props.value).length : 0)),
            insertText: jest.fn(),
            insertEmbed: jest.fn(),
            setSelection: jest.fn(),
        };
        if (!globalThis.__mockQuillEditors) globalThis.__mockQuillEditors = [];
        globalThis.__mockQuillEditors.push(editorApi);
        React.useImperativeHandle(ref, () => ({ getEditor: () => editorApi }));
        return (
            <div data-testid="mock-quill">
                <textarea
                    aria-label="quill-input"
                    value={props.value}
                    placeholder={props.placeholder}
                    onChange={(e) => props.onChange(e.target.value)}
                />
                <button
                    type="button"
                    data-testid="quill-image-btn"
                    onClick={() => props.modules?.toolbar?.handlers?.image?.()}
                >
                    _toolbar_image_
                </button>
                <button
                    type="button"
                    data-testid="quill-image-uploader-call"
                    onClick={async () => {
                        try {
                            await props.modules?.imageUploader?.upload?.(
                                new File(["x"], "x.png", { type: "image/png" })
                            );
                        } catch {}
                    }}
                >
                    _imageUploader_upload_
                </button>
            </div>
        );
    });
    return { __esModule: true, default: Mock };
});

const origCreateElement = document.createElement;
const restoreCreateElement = () => (document.createElement = origCreateElement);

function mockFileInputOnce({ fileName = "x.png", type = "image/png" } = {}) {
    const file = new File(["x"], fileName, { type });
    document.createElement = (tag, options) => {
        const el = origCreateElement.call(document, tag, options);
        if (String(tag).toLowerCase() === "input") {
            let clicked = false;
            Object.defineProperty(el, "files", {
                get: () => (clicked ? [file] : []),
                configurable: true,
            });
            const userOnChange = () => {
                const ev = new Event("change", { bubbles: true });
                el.dispatchEvent(ev);
                if (typeof el.onchange === "function") el.onchange({ target: el });
            };
            const origClick = el.click ? el.click.bind(el) : null;
            el.click = function () {
                clicked = true;
                userOnChange();
            };
        }
        return el;
    };
}

beforeEach(() => {
    jest.resetAllMocks();
    restoreCreateElement();
    delete globalThis.__mockQuillEditors;
    global.fetch = jest.fn(async (url) => {
        if (String(url).includes("/api/admin/upload")) {
            return { ok: true, json: async () => ({ url: "https://cdn/ok.png" }) };
        }
        return { ok: true, json: async () => ({}) };
    });
    window.confirm = jest.fn(() => true);
});

afterEach(() => restoreCreateElement());

test("closed -> returns null", () => {
    const { container } = render(<AdminNewsUploader externalOpen={false} onClose={jest.fn()} />);
    expect(container.firstChild).toBeNull();
});

test("create flow: fill and publish -> POST /api/admin/news; triggers onCreated & onClose", async () => {
    const onCreated = jest.fn();
    const onClose = jest.fn();
    render(<AdminNewsUploader externalOpen onCreated={onCreated} onClose={onClose} />);
    expect(screen.getByText("New Article")).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue("Events / Announcements"), {
        target: { value: "mentor" },
    });
    fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "Hello" } });
    fireEvent.change(screen.getByPlaceholderText("Excerpt"), { target: { value: "Short" } });
    fireEvent.change(screen.getByLabelText("quill-input"), { target: { value: "Body Text" } });
    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    await waitFor(() => expect(onCreated).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    const [url, opts] = global.fetch.mock.calls.at(-1);
    expect(url).toBe("/api/admin/news");
    expect(opts.method).toBe("POST");
    const body = JSON.parse(opts.body);
    expect(body).toMatchObject({
        title: "Hello",
        excerpt: "Short",
        body: "Body Text",
        category: "mentor",
    });
});

test("create flow: publish failed -> shows error", async () => {
    global.fetch = jest.fn(async (url) => {
        if (String(url).includes("/api/admin/news")) return { ok: false, json: async () => ({}) };
        return { ok: true, json: async () => ({ url: "https://cdn/ok.png" }) };
    });
    render(<AdminNewsUploader externalOpen onCreated={jest.fn()} onClose={jest.fn()} />);
    fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText("quill-input"), { target: { value: "B" } });
    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    await waitFor(() => expect(screen.getByText("Failed to publish")).toBeInTheDocument());
});

test("cover selection: success sets image; failure shows error", async () => {
    mockFileInputOnce({ fileName: "cover.png" });
    render(<AdminNewsUploader externalOpen onClose={jest.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Choose Cover" }));
    await waitFor(() =>
        expect(screen.getByAltText("")).toHaveAttribute("src", "https://cdn/ok.png")
    );
    restoreCreateElement();
    global.fetch = jest.fn(async (url) => {
        if (String(url).includes("/api/admin/upload")) return { ok: false, json: async () => ({}) };
        return { ok: true, json: async () => ({}) };
    });
    mockFileInputOnce({ fileName: "bad.png" });
    fireEvent.click(screen.getByRole("button", { name: "Choose Cover" }));
    await waitFor(() => expect(screen.getByText("Cover upload failed")).toBeInTheDocument());
});

test("editor toolbar image: upload success -> insertEmbed called", async () => {
    render(<AdminNewsUploader externalOpen onClose={jest.fn()} />);
    mockFileInputOnce({ fileName: "in-editor.png" });
    fireEvent.click(screen.getByTestId("quill-image-btn"));
    await waitFor(() => {
        const editor = globalThis.__mockQuillEditors?.[0];
        expect(editor).toBeTruthy();
        expect(editor.insertEmbed).toHaveBeenCalledWith(
            expect.any(Number),
            "image",
            "https://cdn/ok.png",
            "user"
        );
    });
});

test("editor imageUploader.upload: failure -> shows error", async () => {
    global.fetch = jest.fn(async (url) => {
        if (String(url).includes("/api/admin/upload")) return { ok: false, json: async () => ({}) };
        return { ok: true, json: async () => ({}) };
    });
    render(<AdminNewsUploader externalOpen onClose={jest.fn()} />);
    fireEvent.click(screen.getByTestId("quill-image-uploader-call"));
    await waitFor(() => expect(screen.getByText("Image upload failed")).toBeInTheDocument());
});

test("edit flow: prefill; Update -> PATCH; Delete -> confirm true executes / false skips", async () => {
    const onUpdated = jest.fn();
    const onDeleted = jest.fn();
    const onClose = jest.fn();
    const initial = {
        id: 123,
        title: "Old",
        excerpt: "Ex",
        cover_url: "https://img/old.png",
        body: "Old body",
        category: "mentor",
        updated_at: "2025-01-01T00:00:00Z",
    };
    render(
        <AdminNewsUploader
            externalOpen
            initial={initial}
            onUpdated={onUpdated}
            onDeleted={onDeleted}
            onClose={onClose}
        />
    );
    expect(screen.getByText("Edit Article")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Old")).toBeInTheDocument();
    expect(screen.getByAltText("")).toHaveAttribute("src", "https://img/old.png");
    fireEvent.change(screen.getByPlaceholderText("Title"), { target: { value: "New" } });
    fireEvent.click(screen.getByRole("button", { name: /update/i }));
    await waitFor(() => expect(onUpdated).toHaveBeenCalled());
    expect(onClose).toHaveBeenCalled();
    const patchCall = global.fetch.mock.calls.find(
        ([u, o]) => String(u).includes("/api/admin/news/123") && o?.method === "PATCH"
    );
    expect(patchCall).toBeTruthy();
    expect(JSON.parse(patchCall[1].body).title).toBe("New");
    window.confirm = jest.fn(() => true);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    await waitFor(() => expect(onDeleted).toHaveBeenCalled());
    onDeleted.mockClear();
    window.confirm = jest.fn(() => false);
    fireEvent.click(screen.getByRole("button", { name: /delete/i }));
    expect(onDeleted).not.toHaveBeenCalled();
});

test("click overlay: closes when not busy; blocked while busy (uploading)", async () => {
    const onClose = jest.fn();
    const { container, unmount } = render(<AdminNewsUploader externalOpen onClose={onClose} />);
    fireEvent.click(container.firstChild);
    expect(onClose).toHaveBeenCalled();
    unmount();
    onClose.mockClear();
    let resolveUpload;
    global.fetch = jest.fn(
        () =>
            new Promise((res) => {
                resolveUpload = () => res({ ok: true, json: async () => ({ url: "https://cdn/ok.png" }) });
            })
    );
    const r2 = render(<AdminNewsUploader externalOpen onClose={onClose} />);
    mockFileInputOnce();
    fireEvent.click(screen.getByRole("button", { name: "Choose Cover" }));
    fireEvent.click(r2.container.firstChild);
    expect(onClose).not.toHaveBeenCalled();
    resolveUpload();
    await waitFor(() => expect(screen.getByAltText("")).toBeInTheDocument());
    r2.unmount();
});
