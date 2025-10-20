import { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import Quill from "quill";
import BlotFormatter from "@enzedonline/quill-blot-formatter2";
import ImageUploader from "quill2-image-uploader";
import "react-quill-new/dist/quill.snow.css";

Quill.register("modules/blotFormatter", BlotFormatter);
Quill.register("modules/imageUploader", ImageUploader);

const CATS = [
    { key: "events", label: "Events / Announcements" },
    { key: "mentor", label: "Mentor / Educator Outreach" },
    { key: "highlights", label: "Highlights / Reviews" },
    { key: "people", label: "People / Inspiration" },
    { key: "research", label: "Research / Media Spotlight" },
    { key: "community", label: "Community / Outreach" }
];

export default function AdminNewsUploader({ onCreated, onUpdated, onDeleted, externalOpen, onClose, initial }) {
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [cover, setCover] = useState("");
    const [body, setBody] = useState("");
    const [category, setCategory] = useState(CATS[0].key);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");
    const quillRef = useRef(null);

    const isEdit = !!(initial && initial.id);
    const open = !!externalOpen;
    const editorKey = isEdit ? `edit-${initial?.id ?? "x"}-${initial?.updated_at ?? "u"}` : "create";

    useEffect(() => {
        if (!open) return;
        if (isEdit && initial) {
            setTitle(initial.title || "");
            setExcerpt(initial.excerpt || "");
            setCover(initial.cover_url || initial.cover || "");
            setBody(initial.body || "");
            setCategory(initial.category || CATS[0].key);
        } else {
            setTitle(""); setExcerpt(""); setCover(""); setBody("");
            setCategory(CATS[0].key);
        }
        setErr("");
    }, [open, isEdit, initial?.id, initial?.updated_at]);

    async function uploadImage(file) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("upload failed");
        const { url } = await res.json();
        return url;
    }

    function handleImageButton() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
            const file = input.files && input.files[0];
            if (!file) return;
            try {
                const url = await uploadImage(file);
                const editor = quillRef.current.getEditor();
                let range = editor.getSelection(true);
                if (!range) range = { index: editor.getLength(), length: 0 };
                const insertAt = range.index + (range.length || 0);
                editor.insertText(insertAt, "\u200B", "user");
                editor.insertEmbed(insertAt + 1, "image", url, "user");
                editor.setSelection(insertAt + 2, 0, "user");
            } catch {
                setErr("Image upload failed");
            }
        };
        input.click();
    }


    async function handleCoverPick() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async () => {
            const file = input.files && input.files[0];
            if (!file) return;
            setBusy(true);
            setErr("");
            try {
                const url = await uploadImage(file);
                setCover(url);
            } catch {
                setErr("Cover upload failed");
            } finally {
                setBusy(false);
            }
        };
        input.click();
    }

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, false] }],
                    [{ size: ["small", false, "large", "huge"] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    [{ align: [] }],
                    ["link", "image", "blockquote", "code-block"],
                    ["clean"]
                ],
                handlers: { image: handleImageButton }
            },
            blotFormatter: {
                overlay: { style: { border: "2px solid #38bdf8" } },
                align: { icons: { left: "", center: "", right: "" } }
            },
            imageUploader: {
                upload: async (file) => {
                    try {
                        return await uploadImage(file);
                    } catch {
                        setErr("Image upload failed");
                        throw new Error("upload failed");
                    }
                }
            }
        }),
        []
    );

    const formats = [
        "header",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "bullet",
        "link",
        "image",
        "blockquote",
        "code-block",
        "align"
    ];

    async function submit() {
        if (!title || !body) return;
        setBusy(true);
        setErr("");
        try {
            if (isEdit) {
                const res = await fetch(`/api/admin/news/${initial.id}`, {
                    method: "PATCH",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ title, excerpt, cover_url: cover, body, category })
                });
                if (!res.ok) throw new Error("failed");
                onUpdated && onUpdated();
            } else {
                const res = await fetch("/api/admin/news", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify({ title, excerpt, cover_url: cover, body, category })
                });
                if (!res.ok) throw new Error("failed");
                onCreated && onCreated();
            }
            onClose && onClose();
        } catch {
            setErr("Failed to publish");
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        if (!isEdit) return;
        const yes = window.confirm("Delete this article?");
        if (!yes) return;
        setBusy(true);
        setErr("");
        try {
            const res = await fetch(`/api/admin/news/${initial.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("failed");
            onDeleted && onDeleted();
            onClose && onClose();
        } catch {
            setErr("Failed to delete");
        } finally {
            setBusy(false);
        }
    }

    if (!open) return null;

    return (
        <div className="newsModal" onClick={() => !busy && onClose && onClose()}>
            <div className="newsModal__panel" onClick={(e) => e.stopPropagation()}>
                {cover ? <img className="newsModal__cover" src={cover} alt="" /> : null}
                <h2 className="newsModal__title" style={{ marginTop: cover ? 0 : 16 }}>{isEdit ? "Edit Article" : "New Article"}</h2>
                <div style={{ display: "grid", gap: 12, padding: "0 20px 8px" }}>
                    <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px", background: "#fff" }}>
                        {CATS.map((c) => (
                            <option key={c.key} value={c.key}>{c.label}</option>
                        ))}
                    </select>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }} />
                    <input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Excerpt" style={{ height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
                        <input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="Cover Image URL" style={{ height: 44, borderRadius: 10, border: "1px solid #e5e7eb", padding: "0 12px" }} />
                        <button type="button" className="latestSearch__btn" onClick={handleCoverPick} disabled={busy} style={{ height: 44 }}>{busy ? "..." : "Choose Cover"}</button>
                    </div>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                        <ReactQuill
                            key={editorKey}
                            ref={quillRef}
                            value={body}
                            onChange={setBody}
                            modules={modules}
                            formats={formats}
                            placeholder="Write your content here. Paste or drag images into the editor to upload automatically."
                        />
                    </div>
                    {err ? <div style={{ color: "#b91c1c", fontSize: 14 }}>{err}</div> : null}
                    <div style={{ display: "flex", gap: 12, justifyContent: "space-between", marginTop: 16, paddingBottom: 12 }}>
                        <button className="searchBar__close" style={{ width: 100 }} type="button" onClick={() => !busy && onClose && onClose()}>✕</button>
                        <div style={{ display: "flex", gap: 10 }}>
                            {isEdit && (
                                <button type="button" className="latestSearch__btn" onClick={handleDelete} disabled={busy} style={{ background: "#ef4444", color: "#fff", opacity: busy ? .6 : 1 }}>
                                    {busy ? "Deleting..." : "Delete"}
                                </button>
                            )}
                            <button className="latestSearch__btn" type="button" onClick={submit} disabled={busy} style={{ opacity: busy ? .6 : 1 }}>
                                {busy ? (isEdit ? "Updating..." : "Publishing...") : (isEdit ? "Update" : "Publish")}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
