import React from "react";

export default function SearchOverlay({ groups, imagesFrom, onRequestClose, items, onUploaded }) {
    const API_BASE = "http://localhost:5174";

    const baseData = React.useMemo(() => {
        if (Array.isArray(items) && items.length) {
            return items.map((x) => ({
                id: x.id ?? String(x.src || x.url || Math.random()),
                src: x.src || x.url,
                name: x.name || (x.src || x.url || "").split("/").pop() || "image",
                description: x.description || "",
                categories: Array.isArray(x.categories) ? x.categories : [x.category || "uncategorized"],
                tags: Array.isArray(x.tags) ? x.tags : [],
            }));
        }
        const seedTags = [["Events", "People"], ["Projects", "People"]];
        const out = [];
        for (const g of groups) {
            const imgs = imagesFrom(g.id);
            imgs.forEach((src, i) => {
                const pick = seedTags[i % seedTags.length];
                out.push({
                    id: `${g.id}-${i + 1}`,
                    src,
                    name: `${g.title} #${i + 1}`,
                    description: `Photo from ${g.title}, item ${i + 1}`,
                    categories: [g.title],
                    tags: pick,
                });
            });
        }
        return out;
    }, [groups, imagesFrom, items]);

    const [serverItems, setServerItems] = React.useState([]);
    const [overrides, setOverrides] = React.useState({});
    const [extraItems, setExtraItems] = React.useState([]);
    const [globalCats, setGlobalCats] = React.useState([]);
    const [globalTags, setGlobalTags] = React.useState([]);

    const material = React.useMemo(() => {
        return baseData.map((it) => {
            const o = overrides[it.id];
            if (!o) return it;
            return { ...it, name: o.name ?? it.name, categories: o.categories ?? it.categories, tags: o.tags ?? it.tags };
        });
    }, [baseData, overrides]);

    const merged = React.useMemo(() => {
        const m = new Map();
        for (const a of [...serverItems, ...material, ...extraItems]) {
            const key = String(a.id ?? a.src ?? Math.random());
            if (!m.has(key)) m.set(key, a);
        }
        return Array.from(m.values());
    }, [serverItems, material, extraItems]);

    const fetchImages = React.useCallback(async () => {
        const r = await fetch(`${API_BASE}/api/images`);
        const arr = await r.json();
        const mapped = arr.map((r) => ({
            id: String(r.id),
            src: r.url,
            name: r.name || (r.url || "").split("/").pop() || "image",
            description: "",
            categories: r.category ? [r.category] : [],
            tags: Array.isArray(r.tags) ? r.tags : [],
        }));
        setServerItems(mapped);
    }, [API_BASE]);

    const fetchMeta = React.useCallback(async () => {
        const r = await fetch(`${API_BASE}/api/meta`);
        const j = await r.json();
        setGlobalCats(Array.isArray(j.categories) ? j.categories : []);
        setGlobalTags(Array.isArray(j.tags) ? j.tags.slice(0, 5) : []);
    }, [API_BASE]);

    React.useEffect(() => {
        (async () => { await fetchMeta(); await fetchImages(); })();
    }, [fetchMeta, fetchImages]);

    const bcRef = React.useRef(null);
    React.useEffect(() => {
        bcRef.current = new BroadcastChannel("media-sync");
        bcRef.current.onmessage = () => { fetchImages(); fetchMeta(); };
        const es = new EventSource(`${API_BASE}/api/events`);
        const onImages = () => { fetchImages(); bcRef.current?.postMessage({ type: "images" }); };
        const onMeta = () => { fetchMeta(); bcRef.current?.postMessage({ type: "meta" }); };
        es.addEventListener("images", onImages);
        es.addEventListener("meta", onMeta);
        es.addEventListener("ping", () => {});
        const onFocus = () => fetchImages();
        window.addEventListener("focus", onFocus);
        return () => {
            bcRef.current?.close();
            es.close();
            window.removeEventListener("focus", onFocus);
        };
    }, [API_BASE, fetchImages, fetchMeta]);

    const derivedTags = React.useMemo(() => Array.from(new Set(merged.flatMap((x) => x.tags))).sort(), [merged]);
    const derivedCategories = React.useMemo(() => Array.from(new Set(merged.flatMap((x) => x.categories))).sort(), [merged]);

    const uiCategories = React.useMemo(() => (globalCats.length ? globalCats : derivedCategories), [globalCats, derivedCategories]);
    const uiTags = React.useMemo(() => (globalTags.length ? globalTags : derivedTags), [globalTags, derivedTags]);

    const allowedCats = uiCategories;
    const allowedTags = uiTags;

    const [query, setQuery] = React.useState("");
    const [activeTags, setActiveTags] = React.useState(new Set());
    const [activeCategories, setActiveCategories] = React.useState(new Set());

    const [selectionMode, setSelectionMode] = React.useState(false);
    const [selectedIds, setSelectedIds] = React.useState(new Set());
    const [bulkCategory, setBulkCategory] = React.useState("");
    const [bulkTags, setBulkTags] = React.useState([]);

    const exitSelection = React.useCallback(() => {
        setSelectionMode(false);
        setSelectedIds(new Set());
        setBulkCategory("");
        setBulkTags([]);
    }, []);

    React.useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onRequestClose?.();
            if (e.key.toLowerCase() === "s") {
                setSelectionMode((v) => {
                    if (v) {
                        setSelectedIds(new Set());
                        setBulkCategory("");
                        setBulkTags([]);
                    }
                    return !v;
                });
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onRequestClose]);

    React.useEffect(() => {
        if (!selectionMode) {
            setSelectedIds(new Set());
            setBulkCategory("");
            setBulkTags([]);
        } else {
            if (!bulkCategory) setBulkCategory(allowedCats[0] || "uncategorized");
        }
    }, [selectionMode, bulkCategory, allowedCats]);

    const data = merged;
    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return data.filter((item) => {
            const matchesQ =
                !q ||
                item.name.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                item.tags.some((t) => t.toLowerCase().includes(q)) ||
                item.categories.some((c) => c.toLowerCase().includes(q));
            const matchesTags = activeTags.size === 0 || Array.from(activeTags).every((t) => item.tags.includes(t));
            const matchesCats = activeCategories.size === 0 || Array.from(activeCategories).every((c) => item.categories.includes(c));
            return matchesQ && matchesTags && matchesCats;
        });
    }, [data, query, activeTags, activeCategories]);

    const toggleSet = (setter) => (val) =>
        setter((prev) => {
            const next = new Set(prev);
            next.has(val) ? next.delete(val) : next.add(val);
            return next;
        });

    const clearAll = () => {
        setQuery("");
        setActiveTags(new Set());
        setActiveCategories(new Set());
    };

    const [viewer, setViewer] = React.useState({ open: false, index: 0, scale: 1, dx: 0, dy: 0, dragging: false, lastX: 0, lastY: 0 });
    const openViewer = (idx) => setViewer({ open: true, index: idx, scale: 1, dx: 0, dy: 0, dragging: false, lastX: 0, lastY: 0 });
    const closeViewer = () => setViewer((v) => ({ ...v, open: false }));
    const prev = () => setViewer((v) => { if (!filtered.length) return v; const i=(v.index-1+filtered.length)%filtered.length; return { ...v, index:i, scale:1, dx:0, dy:0 }; });
    const next = () => setViewer((v) => { if (!filtered.length) return v; const i=(v.index+1)%filtered.length; return { ...v, index:i, scale:1, dx:0, dy:0 }; });
    const zoomIn = () => setViewer((v) => { const s=Math.min(4,v.scale+0.25); return s===1?{...v,scale:1,dx:0,dy:0}:{...v,scale:s}; });
    const zoomOut = () => setViewer((v) => { const s=Math.max(1,v.scale-0.25); return s===1?{...v,scale:1,dx:0,dy:0}:{...v,scale:s}; });
    const resetZoom = () => setViewer((v) => ({ ...v, scale: 1, dx: 0, dy: 0 }));
    const onWheel = (e) => { if(!viewer.open) return; e.preventDefault(); const d=e.deltaY>0?-0.2:0.2; setViewer((v)=>{ let s=Math.min(4,Math.max(1,v.scale+d)); if(s===1) return {...v,scale:1,dx:0,dy:0}; return {...v,scale:s}; }); };
    const onMouseDown = (e) => { e.preventDefault(); setViewer((v)=>({...v,dragging:true,lastX:e.clientX,lastY:e.clientY})); };
    const onMouseMove = (e) => { if(!viewer.dragging) return; e.preventDefault(); setViewer((v)=>{ const dx=v.dx+(e.clientX-v.lastX); const dy=v.dy+(e.clientY-v.lastY); return {...v,dx,dy,lastX:e.clientX,lastY:e.clientY}; }); };
    const endDrag = () => setViewer((v) => ({ ...v, dragging: false }));
    const onDoubleClick = () => setViewer((v) => (v.scale === 1 ? { ...v, scale: 2 } : { ...v, scale: 1, dx: 0, dy: 0 }));

    React.useEffect(() => {
        if (!viewer.open) return;
        const onKey = (e) => { if (e.key === "Escape") closeViewer(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); if (e.key === "+") zoomIn(); if (e.key === "-") zoomOut(); if (e.key.toLowerCase() === "r") resetZoom(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [viewer.open, filtered.length]);

    React.useEffect(() => {
        if (!viewer.open) return;
        if (viewer.index >= filtered.length) {
            setViewer((v) => ({ ...v, index: Math.max(0, filtered.length - 1), scale: 1, dx: 0, dy: 0 }));
        }
    }, [filtered.length, viewer.open, viewer.index]);

    const downloadCurrent = () => {
        if (!viewer.open || !filtered[viewer.index]) return;
        const it = filtered[viewer.index];
        const a = document.createElement("a");
        a.href = it.src;
        a.download = it.name || (it.src.split("/").pop() || "image.jpg");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const [uOpen, setUOpen] = React.useState(false);
    const [uFiles, setUFiles] = React.useState([]);
    const [uCategory, setUCategory] = React.useState("");
    const [uTags, setUTags] = React.useState([]);
    const [uBusy, setUBusy] = React.useState(false);
    const [uError, setUError] = React.useState("");
    const [uProgressDone, setUProgressDone] = React.useState(0);

    React.useEffect(() => {
        if (!uOpen) return;
        if (!uCategory) setUCategory(allowedCats[0] || "uncategorized");
        if (!uTags.length) setUTags([]);
    }, [uOpen, allowedCats, allowedTags, uCategory, uTags.length]);

    const dedupeFiles = (files) => {
        const map = new Map();
        for (const f of files) {
            const key = `${f.name}#${f.size}#${f.lastModified}`;
            if (!map.has(key)) map.set(key, f);
        }
        return Array.from(map.values());
    };

    const handlePickFiles = (fileList) => {
        const arr = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
        setUFiles((prev) => dedupeFiles([...(prev || []), ...arr]));
    };

    const uploadOne = async (file, category, tags) => {
        const fd = new FormData();
        fd.append("file", file);
        const upRes = await fetch(`${API_BASE}/api/admin/upload`, { method: "POST", body: fd });
        const upJson = await upRes.json();
        if (!upRes.ok || !upJson.url) throw new Error("upload failed");
        const body = { url: upJson.url, name: file.name, category, tags };
        const saveRes = await fetch(`${API_BASE}/api/admin/images`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        const saved = await saveRes.json();
        return {
            id: String(saved?.id || Date.now() + Math.random()),
            src: body.url,
            name: file.name,
            description: "",
            categories: [category],
            tags,
        };
    };

    const submitUpload = async () => {
        if (!uFiles.length || !uCategory) return;
        setUBusy(true);
        setUError("");
        setUProgressDone(0);
        const pickedTags = Array.from(new Set(uTags)).slice(0, 5);
        const created = [];
        for (const f of uFiles) {
            try {
                const item = await uploadOne(f, uCategory, pickedTags);
                created.push(item);
                setUProgressDone((n) => n + 1);
            } catch (e) {
                setUError("Some files failed to upload");
            }
        }
        if (created.length) {
            if (typeof onUploaded === "function") created.forEach((it) => onUploaded(it));
            else setExtraItems((prev) => [...prev, ...created]);
        }
        setUBusy(false);
        setUOpen(false);
        setUFiles([]);
        setUTags([]);
        if (!allowedCats.includes(uCategory)) setActiveCategories(new Set([uCategory]));
        bcRef.current?.postMessage({ type: "images" });
        fetchImages();
    };

    const [metaOpen, setMetaOpen] = React.useState(false);
    const [metaCatsText, setMetaCatsText] = React.useState("");
    const [metaTagsText, setMetaTagsText] = React.useState("");

    const openMeta = () => {
        const cs = globalCats.length ? globalCats : uiCategories;
        const ts = globalTags.length ? globalTags : uiTags.slice(0, 5);
        setMetaCatsText(cs.join(", "));
        setMetaTagsText(ts.join(", "));
        setMetaOpen(true);
    };

    const applyMetaExample = () => {
        setMetaCatsText("symposium2022, symposium2023, symposium2024, symposium2025");
        setMetaTagsText("tech, competition");
    };

    const saveMeta = async () => {
        let cats = Array.from(new Set(metaCatsText.split(",").map((s) => s.trim()).filter(Boolean)));
        let tags = Array.from(new Set(metaTagsText.split(",").map((s) => s.trim()).filter(Boolean))).slice(0, 5);
        await fetch(`${API_BASE}/api/admin/meta`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ categories: cats, tags }),
        });
        setGlobalCats(cats);
        setGlobalTags(tags);
        if (uOpen) {
            if (!cats.includes(uCategory)) setUCategory(cats[0] || "uncategorized");
            setUTags((prev) => prev.filter((t) => tags.includes(t)).slice(0, 5));
        }
        bcRef.current?.postMessage({ type: "meta" });
        setMetaOpen(false);
    };

    const [editOpen, setEditOpen] = React.useState(false);
    const [editCategory, setEditCategory] = React.useState("");
    const [editTags, setEditTags] = React.useState([]);
    const [editName, setEditName] = React.useState("");

    const updateImageRemote = async (id, payload) => {
        await fetch(`${API_BASE}/api/admin/images/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        bcRef.current?.postMessage({ type: "images" });
        fetchImages();
    };

    const deleteImageRemote = async (id) => {
        await fetch(`${API_BASE}/api/admin/images/${id}`, { method: "DELETE" });
    };

    const saveEdit = async () => {
        if (!viewer.open || !filtered[viewer.index]) return;
        const cur = filtered[viewer.index];
        const id = cur.id || String(cur.src);
        const payload = { name: editName, category: editCategory, tags: Array.from(new Set(editTags)).slice(0, 5) };
        await updateImageRemote(id, payload);
        setOverrides((m) => ({ ...m, [id]: { name: editName, categories: [editCategory], tags: payload.tags } }));
        setExtraItems((prev) => prev.map((x) => (x.id === id ? { ...x, name: editName, categories: [editCategory], tags: payload.tags } : x)));
        setEditOpen(false);
    };

    const deleteCurrent = async () => {
        if (!viewer.open || !filtered[viewer.index]) return;
        const cur = filtered[viewer.index];
        const id = cur.id || String(cur.src);
        const ok = window.confirm("Delete this image?");
        if (!ok) return;
        await deleteImageRemote(id);
        bcRef.current?.postMessage({ type: "images" });
        await fetchImages();
        setOverrides((m) => { const n = { ...m }; delete n[id]; return n; });
        setExtraItems((prev) => prev.filter((x) => x.id !== id));
        const newFiltered = filtered.filter((x) => x.id !== id);
        if (!newFiltered.length) setViewer({ open: false, index: 0, scale: 1, dx: 0, dy: 0, dragging: false, lastX: 0, lastY: 0 });
        else setViewer((v) => ({ ...v, index: Math.min(v.index, newFiltered.length - 1) }));
    };

    const toggleLimited = (list, setList, value) => {
        setList((prev) => {
            if (prev.includes(value)) return prev.filter((t) => t !== value);
            if (prev.length >= 5) return prev;
            return [...prev, value];
        });
    };

    const fileInputRef = React.useRef(null);
    const dirInputRef = React.useRef(null);

    const toggleSelected = (id) => {
        setSelectedIds((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    };

    const selectAllFiltered = () => {
        setSelectedIds(new Set(filtered.map((x) => x.id)));
    };

    const clearSelected = () => {
        setSelectedIds(new Set());
    };

    const deleteSelected = async () => {
        if (selectedIds.size === 0) return;
        const ok = window.confirm(`Delete the selected ${selectedIds.size} image(s)?`);
        if (!ok) return;
        const ids = Array.from(selectedIds);
        await Promise.all(ids.map((id) => deleteImageRemote(id)));
        bcRef.current?.postMessage({ type: "images" });
        await fetchImages();
        setOverrides((m) => {
            const n = { ...m };
            ids.forEach((id) => delete n[id]);
            return n;
        });
        setExtraItems((prev) => prev.filter((x) => !ids.includes(x.id)));
        if (viewer.open) {
            const cur = filtered[viewer.index];
            if (cur && ids.includes(cur.id)) setViewer({ open: false, index: 0, scale: 1, dx: 0, dy: 0, dragging: false, lastX: 0, lastY: 0 });
        }
        setSelectedIds(new Set());
        setSelectionMode(false);
    };

    const applyBulkCategory = async () => {
        if (selectedIds.size === 0 || !bulkCategory) return;
        const ids = Array.from(selectedIds);
        await Promise.all(ids.map((id) => updateImageRemote(id, { category: bulkCategory })));
        setOverrides((m) => {
            const n = { ...m };
            ids.forEach((id) => { n[id] = { ...(n[id] || {}), categories: [bulkCategory] }; });
            return n;
        });
    };

    const applyBulkTags = async () => {
        if (selectedIds.size === 0) return;
        const tags = Array.from(new Set(bulkTags)).slice(0, 5);
        const ids = Array.from(selectedIds);
        await Promise.all(ids.map((id) => updateImageRemote(id, { tags })));
        setOverrides((m) => {
            const n = { ...m };
            ids.forEach((id) => { n[id] = { ...(n[id] || {}), tags }; });
            return n;
        });
    };

    return (
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateRows: "auto 1fr", pointerEvents: "auto", zIndex: 810, padding: 24 }}>
            <div style={{ width: "min(1100px, 96vw)", margin: "0 auto", padding: 16, borderRadius: 16, background: "rgba(20,20,20,0.92)", boxShadow: "0 18px 48px rgba(0,0,0,0.35)", color: "#fff" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                    <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name / description / tags / categories..." style={{ flex: 1, minWidth: 260, height: 44, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: "0 14px", outline: "none" }}/>
                    <button onClick={openMeta} style={chipStyle({ solid: true })}>Global Meta</button>
                    <button onClick={() => setUOpen(true)} style={chipStyle({})}>Upload</button>
                    <button onClick={() => (selectionMode ? exitSelection() : setSelectionMode(true))} style={{ ...chipStyle({}), boxShadow: selectionMode ? "0 0 0 3px rgba(82,39,255,0.6)" : "none" }}>{selectionMode ? "Exit Select (S)" : "Select (S)"}</button>
                    <button onClick={clearAll} style={chipStyle({})}>Clear</button>
                    <button onClick={onRequestClose} style={chipStyle({})}>Close (Esc)</button>
                </div>

                <Section title="Categories" style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {uiCategories.map((c) => {
                            const active = activeCategories.has(c);
                            return <button key={c} onClick={() => toggleSet(setActiveCategories)(c)} style={chipStyle({ active })}>{c}</button>;
                        })}
                    </div>
                </Section>

                <Section title="Tags" style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {uiTags.map((t) => {
                            const active = activeTags.has(t);
                            return <button key={t} onClick={() => toggleSet(setActiveTags)(t)} style={chipStyle({ active })}>#{t}</button>;
                        })}
                    </div>
                </Section>

                <div style={{ marginTop: 10, opacity: 0.8, fontSize: 13 }}>Showing <b>{filtered.length}</b> of {data.length}</div>
            </div>

            <div style={{ width: "min(1100px, 96vw)", margin: "16px auto 0", padding: 8, borderRadius: 16, background: "rgba(12,12,12,0.8)", boxShadow: "0 18px 48px rgba(0,0,0,0.35)", overflow: "auto", scrollbarWidth: "none", msOverflows: "none" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                    {filtered.map((item, idx) => {
                        const selected = selectedIds.has(item.id);
                        return (
                            <figure
                                key={item.id}
                                style={{
                                    margin: 0,
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    background: "rgba(255,255,255,0.04)",
                                    border: selected ? "2px solid rgba(82,39,255,0.9)" : "1px solid rgba(255,255,255,0.08)",
                                    position: "relative",
                                    cursor: selectionMode ? "default" : "zoom-in",
                                    boxShadow: selected ? "0 0 0 4px rgba(82,39,255,0.25)" : "none",
                                }}
                                onClick={() => {
                                    if (selectionMode) toggleSelected(item.id);
                                    else openViewer(idx);
                                }}
                                title={selectionMode ? "Select" : "Click to zoom"}
                            >
                                {selectionMode && (
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 8,
                                            left: 8,
                                            zIndex: 2,
                                            width: 26,
                                            height: 26,
                                            borderRadius: 8,
                                            border: "1px solid rgba(255,255,255,0.5)",
                                            background: selected ? "rgba(82,39,255,0.9)" : "rgba(0,0,0,0.45)",
                                            display: "grid",
                                            placeItems: "center",
                                            fontSize: 16,
                                            color: "#fff",
                                            userSelect: "none",
                                        }}
                                    >
                                        {selected ? "✓" : ""}
                                    </div>
                                )}
                                <img
                                    src={item.src}
                                    alt={item.name}
                                    draggable={false}
                                    style={{
                                        width: "100%",
                                        height: 250,
                                        objectFit: "cover",
                                        display: "block",
                                        filter: selectionMode && !selected ? "grayscale(0.15) brightness(0.95)" : "none",
                                    }}
                                />
                                <figcaption style={{ padding: "8px 10px", color: "#fff" }}>
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                        title={item.name}
                                    >
                                        {item.name}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 4,
                                            fontSize: 12,
                                            opacity: 0.8,
                                            display: "flex",
                                            gap: 6,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        {item.tags.map((t) => (
                                            <span
                                                key={t}
                                                style={{
                                                    padding: "2px 6px",
                                                    borderRadius: 8,
                                                    background: "rgba(255,255,255,0.06)",
                                                    border: "1px solid rgba(255,255,255,0.08)",
                                                }}
                                            >
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </figcaption>
                            </figure>
                        );
                    })}
                </div>
                {filtered.length === 0 && <div style={{ textAlign: "center", padding: "36px 0", color: "rgba(255,255,255,0.75)" }}>No results. Try removing some filters.</div>}
            </div>

            {selectionMode && (
                <div style={{ position: "fixed", left: "50%", bottom: 100, transform: "translateX(-50%)", zIndex: 1800, width: "min(1100px, 96vw)", background: "rgba(18,18,18,0.96)", border: "1px solid rgba(82,39,255,0.45)", boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 0 0 4px rgba(82,39,255,0.2) inset", borderRadius: 18, color: "#fff", padding: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>Bulk Actions</div>
                            <div style={{ opacity: 0.85, fontSize: 13 }}>Selected: {selectedIds.size}</div>
                            <button onClick={selectAllFiltered} style={chipStyle({})}>Select All (Filtered)</button>
                            <button onClick={clearSelected} style={chipStyle({})}>Clear Selection</button>
                        </div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <span style={{ fontSize: 13, opacity: 0.85 }}>Category</span>
                                <select value={bulkCategory} onChange={(e) => setBulkCategory(e.target.value)} style={{ height: 38, borderRadius: 12, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: "0 12px", outline: "none" }}>
                                    {(allowedCats.length ? allowedCats : ["uncategorized"]).map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <button disabled={selectedIds.size === 0 || !bulkCategory} onClick={applyBulkCategory} style={chipStyle({ solid: selectedIds.size > 0 })}>Apply Category</button>
                            </div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                                <span style={{ fontSize: 13, opacity: 0.85 }}>Tags</span>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 420 }}>
                                    {(allowedTags.length ? allowedTags : ["tech","competition"]).map((t) => {
                                        const active = bulkTags.includes(t);
                                        const disabled = !active && bulkTags.length >= 5;
                                        return (
                                            <button key={t} onClick={() => !disabled && toggleLimited(bulkTags, setBulkTags, t)} style={{ ...chipStyle({ active }), opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>#{t}</button>
                                        );
                                    })}
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>{bulkTags.length}/5</div>
                                <button disabled={selectedIds.size === 0} onClick={applyBulkTags} style={chipStyle({ solid: selectedIds.size > 0 })}>Apply Tags</button>
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button disabled={selectedIds.size === 0} onClick={deleteSelected} style={{ ...chipStyle({}), border: "1px solid rgba(255,120,120,0.55)", background: "rgba(255,120,120,0.15)" }}>Delete Selected ({selectedIds.size})</button>
                            <button onClick={exitSelection} style={chipStyle({})}>Done</button>
                        </div>
                    </div>
                </div>
            )}

            {viewer.open && filtered[viewer.index] && (
                <div onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={endDrag} onMouseLeave={endDrag} onDoubleClick={onDoubleClick} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.86)", display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none", cursor: viewer.dragging ? "grabbing" : viewer.scale > 1 ? "grab" : "zoom-out" }} onClick={(e) => { if (e.target === e.currentTarget) closeViewer(); }}>
                    <button onClick={(e) => { e.stopPropagation(); prev(); }} style={navBtnStyle("left")} aria-label="Previous">‹</button>
                    <button onClick={(e) => { e.stopPropagation(); next(); }} style={navBtnStyle("right")} aria-label="Next">›</button>
                    <img src={filtered[viewer.index].src} alt={filtered[viewer.index].name} draggable={false} style={{ maxWidth: "90vw", maxHeight: "86vh", transform: `translate(${viewer.dx}px, ${viewer.dy}px) scale(${viewer.scale})`, transition: viewer.dragging ? "none" : "transform 120ms ease", boxShadow: "0 12px 40px rgba(0,0,0,0.45)", borderRadius: 12 }}/>
                    <div style={{ position: "fixed", left: "50%", top: 24, transform: "translateX(-50%)", display: "flex", gap: 8, padding: "8px 10px", background: "rgba(20,20,20,0.6)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, color: "#fff", fontSize: 13, alignItems: "center" }} onClick={(e) => e.stopPropagation()}>
                        <span style={{ opacity: 0.85 }}>{filtered[viewer.index].name} • {viewer.index + 1}/{filtered.length}</span>
                        <span style={{ opacity: 0.6 }}>|</span>
                        <button onClick={zoomOut} style={chipStyle({})} disabled={viewer.scale <= 1.01}>−</button>
                        <button onClick={resetZoom} style={chipStyle({ solid: true })}>Reset</button>
                        <button onClick={zoomIn} style={chipStyle({})} disabled={viewer.scale >= 3.99}>+</button>
                        <span style={{ opacity: 0.85 }}>{Math.round(viewer.scale * 100)}%</span>
                        <span style={{ opacity: 0.6 }}>|</span>
                        <button onClick={downloadCurrent} style={chipStyle({})}>Download</button>
                        <button onClick={() => setEditOpen(true)} style={chipStyle({})}>Edit</button>
                        <button onClick={deleteCurrent} style={chipStyle({})}>Delete</button>
                        <button onClick={closeViewer} style={chipStyle({})}>Close</button>
                    </div>
                </div>
            )}

            {uOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 2100, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center" }} onClick={() => !uBusy && setUOpen(false)}>
                    <div style={{ width: "min(760px, 92vw)", background: "rgba(22,22,22,0.98)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, boxShadow: "0 18px 48px rgba(0,0,0,0.35)", color: "#fff", padding: 20 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Upload Images</div>
                        <div style={{ display: "grid", gap: 12 }}>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handlePickFiles(e.target.files)}/>
                                <input ref={dirInputRef} type="file" accept="image/*" webkitdirectory="true" directory="true" mozdirectory="true" style={{ display: "none" }} onChange={(e) => handlePickFiles(e.target.files)}/>
                                <button onClick={() => fileInputRef.current?.click()} style={chipStyle({ solid: true })}>Choose Files</button>
                                <button onClick={() => dirInputRef.current?.click()} style={chipStyle({})}>Choose Folder</button>
                                <div style={{ alignSelf: "center", fontSize: 12, opacity: 0.8 }}>Selected {uFiles.length} file{uFiles.length === 1 ? "" : "s"}</div>
                            </div>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 13, opacity: 0.8 }}>Category</div>
                                <select value={uCategory} onChange={(e) => setUCategory(e.target.value)} style={{ height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: "0 12px", outline: "none" }}>
                                    {(allowedCats.length ? allowedCats : ["uncategorized"]).map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 13, opacity: 0.8 }}>Tags (max 5, applied to all)</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {(allowedTags.length ? allowedTags : ["tech", "competition"]).map((t) => {
                                        const active = uTags.includes(t);
                                        const disabled = !active && uTags.length >= 5;
                                        return <button key={t} onClick={() => !disabled && toggleLimited(uTags, setUTags, t)} style={{ ...chipStyle({ active }), opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>#{t}</button>;
                                    })}
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>{uTags.length}/5 selected</div>
                            </div>
                            {uBusy && <div style={{ fontSize: 12, opacity: 0.85 }}>Uploading {uProgressDone}/{uFiles.length}</div>}
                            {uError && <div style={{ color: "#ff8a8a", fontSize: 13 }}>{uError}</div>}
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                                <button disabled={uBusy} onClick={() => setUOpen(false)} style={chipStyle({})}>Cancel</button>
                                <button disabled={uBusy || !uFiles.length || !uCategory} onClick={submitUpload} style={chipStyle({ solid: true })}>{uBusy ? "Uploading..." : "Upload"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {metaOpen && (
                <div style={{ position: "fixed", inset: 0, zIndex: 2150, background: "rgba(0,0,0,0.6)", display: "grid", placeItems: "center" }} onClick={() => setMetaOpen(false)}>
                    <div style={{ width: "min(680px, 92vw)", background: "rgba(22,22,22,0.98)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, boxShadow: "0 18px 48px rgba(0,0,0,0.35)", color: "#fff", padding: 20 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Global Meta</div>
                        <div style={{ display: "grid", gap: 12 }}>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 13, opacity: 0.8 }}>Categories (comma separated)</div>
                                <textarea value={metaCatsText} onChange={(e) => setMetaCatsText(e.target.value)} rows={3} style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: 12, outline: "none", resize: "vertical" }}/>
                            </div>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 13, opacity: 0.8 }}>Tags (comma separated, max 5)</div>
                                <textarea value={metaTagsText} onChange={(e) => setMetaTagsText(e.target.value)} rows={2} style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: 12, outline: "none", resize: "vertical" }}/>
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 4 }}>
                                <button onClick={applyMetaExample} style={chipStyle({})}>Use Example</button>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => setMetaOpen(false)} style={chipStyle({})}>Cancel</button>
                                    <button onClick={saveMeta} style={chipStyle({ solid: true })}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editOpen && viewer.open && filtered[viewer.index] && (
                <div style={{ position: "fixed", inset: 0, zIndex: 2200, background: "rgba(0,0,0,0.55)", display: "grid", placeItems: "center" }} onClick={() => setEditOpen(false)}>
                    <div style={{ width: "min(600px, 92vw)", background: "rgba(24,24,24,0.98)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, boxShadow: "0 18px 48px rgba(0,0,0,0.35)", color: "#fff", padding: 18 }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Edit Meta</div>
                        <div style={{ display: "grid", gap: 10 }}>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 13, opacity: 0.8 }}>Name</div>
                                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: "0 12px", outline: "none" }}/>
                            </div>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 13, opacity: 0.8 }}>Category</div>
                                <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} style={{ height: 40, borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", padding: "0 12px", outline: "none" }}>
                                    {(allowedCats.length ? allowedCats : ["uncategorized"]).map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div style={{ display: "grid", gap: 6 }}>
                                <div style={{ fontSize: 13, opacity: 0.8 }}>Tags (max 5)</div>
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {(allowedTags.length ? allowedTags : ["tech", "competition"]).map((t) => {
                                        const active = editTags.includes(t);
                                        const disabled = !active && editTags.length >= 5;
                                        return <button key={t} onClick={() => !disabled && toggleLimited(editTags, setEditTags, t)} style={{ ...chipStyle({ active }), opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}>#{t}</button>;
                                    })}
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.7 }}>{editTags.length}/5 selected</div>
                            </div>
                            <div style={{ display: "flex", gap: 10, justifyContent: "space-between", marginTop: 6 }}>
                                <button onClick={async () => { if (!viewer.open || !filtered[viewer.index]) return; const cur = filtered[viewer.index]; const id = cur.id || String(cur.src); const ok = window.confirm("Delete this image?"); if (!ok) return; await deleteImageRemote(id); bcRef.current?.postMessage({ type: "images" }); await fetchImages(); setEditOpen(false); setViewer((v) => ({ ...v, open: false })); }} style={chipStyle({})}>Delete</button>
                                <div style={{ display: "flex", gap: 10 }}>
                                    <button onClick={() => setEditOpen(false)} style={chipStyle({})}>Cancel</button>
                                    <button onClick={saveEdit} style={chipStyle({ solid: true })}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Section({ title, children, style }) {
    return (
        <div style={style}>
            <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 6 }}>{title}</div>
            {children}
        </div>
    );
}

function chipStyle({ active = false, solid = false } = {}) {
    const base = { borderRadius: 999, padding: "8px 12px", fontSize: 13, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer" };
    if (solid) return { ...base, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", fontWeight: 600 };
    if (active) return { ...base, background: "rgba(82,39,255,0.25)", border: "1px solid rgba(82,39,255,0.4)", boxShadow: "0 0 0 2px rgba(82,39,255,0.2) inset", fontWeight: 600 };
    return base;
}

function navBtnStyle(side) {
    return { position: "fixed", top: "50%", [side]: 24, transform: "translateY(-50%)", width: 44, height: 44, borderRadius: 999, border: "1px solid rgba(255,255,255,0.25)", background: "rgba(20,20,20,0.45)", color: "#fff", fontSize: 24, lineHeight: "42px", textAlign: "center", cursor: "pointer", userSelect: "none" };
}
