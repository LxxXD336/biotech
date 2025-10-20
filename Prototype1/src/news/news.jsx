import { useEffect, useMemo, useRef, useState } from "react";
import MainNav from "../components/MainNav";
import "./news.css";
import ZoomModal from "./Widgets/NewsModal.jsx";
import SearchOverlay from "./Widgets/SearchOverlay.jsx";
import AdminNewsUploader from "./Widgets/AdminNewsUploader.jsx";

const CATS = [
    { key:"events", label:"Events / Announcements" },
    { key:"mentor", label:"Mentor / Educator Outreach" },
    { key:"highlights", label:"Highlights / Reviews" },
    { key:"people", label:"People / Inspiration" },
    { key:"research", label:"Research / Media Spotlight" },
    { key:"community", label:"Community / Outreach" }
];

function mapRow(n){
    return {
        ...n,
        cover: n.cover_url || "",
        content: n.body || "",
        category: n.category || "",
        date: n.created_at ? new Date(n.created_at).toLocaleDateString("en-AU",{year:"numeric",month:"short",day:"numeric"}) : ""
    };
}

export default function News() {
    const [rows, setRows] = useState([]);
    const [zoom, setZoom] = useState({ open: false, item: null, rect: null });
    const [query, setQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchRect, setSearchRect] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [createOpen, setCreateOpen] = useState(false);
    const inputAnchorRef = useRef(null);

    async function loadNews() {
        const res = await fetch("/api/news");
        const data = await res.json();
        setRows(data.map(mapRow));
    }
    useEffect(() => { loadNews(); }, []);

    async function fetchOne(id){
        const res = await fetch(`/api/news/${id}`);
        if(!res.ok) throw new Error("fetch one failed");
        return mapRow(await res.json());
    }

    const news = rows;
    const hero = news[0] || null;

    const picksByCat = useMemo(()=>{
        const m = {};
        for(const c of CATS) m[c.key] = [];
        for(const n of news){
            const k = (n.category||"").trim();
            if (k && m[k]) m[k].push(n);
        }
        return m; // 不再 slice(0,5)，无限制条数
    },[news]);

    const mostRecent = news.slice(1, 10);

    const openFrom = (cardEl, item, anchorSelector) => {
        const anchor = anchorSelector ? cardEl.querySelector(anchorSelector) : cardEl;
        const r = (anchor || cardEl).getBoundingClientRect();
        setZoom({ open: true, item, rect: { left: r.left, top: r.top, width: r.width, height: r.height } });
    };

    const onSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        const r = inputAnchorRef.current.getBoundingClientRect();
        setSearchRect({ left: r.left, top: r.top, width: r.width, height: r.height });
        setSearchOpen(true);
    };

    async function startEdit() {
        if (!zoom.item?.id) return;
        try {
            const full = await fetchOne(zoom.item.id);
            setZoom({ open:false, item:null, rect:null });
            setEditItem(full);
            setEditOpen(true);
        } catch {}
    }

    async function deleteCurrent() {
        if (!zoom.item?.id) return;
        const yes = window.confirm("Delete this article?");
        if (!yes) return;
        try{
            await fetch(`/api/admin/news/${zoom.item.id}`, { method: "DELETE" });
            setZoom({ open:false, item:null, rect:null });
            loadNews();
        }catch(e){
            alert("Delete failed");
        }
    }

    const editInitial = editItem ? {
        id: editItem.id,
        title: editItem.title || "",
        excerpt: editItem.excerpt || "",
        cover_url: editItem.cover || editItem.cover_url || "",
        body: editItem.content || editItem.body || "",
        category: editItem.category || "",
        updated_at: editItem.updated_at,
    } : null;

    const modalKey = zoom.item
        ? `${zoom.item.id ?? "x"}-${zoom.item.updated_at ?? "u"}-${zoom.item.created_at ?? "c"}`
        : "empty";

    return (
        <div className="news">
            <MainNav />
            <main className="news__container">
                <div className="news__grid">
                    <div className="sectionBar sectionBar--left">
                        <span className="sectionBar__label">CATEGORIES</span>
                        <span className="sectionBar__line" />
                    </div>
                    <div className="sectionBar sectionBar--center">
                        <span className="sectionBar__label">LATEST</span>
                        <span className="sectionBar__line" />
                    </div>
                    <div className="sectionBar sectionBar--right">
                        <span className="sectionBar__label">MOST RECENT</span>
                        <span className="sectionBar__line" />
                    </div>

                    <section
                        className="picks"
                        style={{ position:"sticky", top:90, height:"calc(100vh - 90px - 24px)", overflow:"auto", paddingRight:4 }}
                    >
                        <div style={{ display:"grid", gap:14 }}>
                            {CATS.map(cat => {
                                const arr = picksByCat[cat.key] || [];
                                if (!arr.length) return (
                                    <div key={cat.key} style={{ border:"1px solid #e5e7eb", borderRadius:12, background:"#fff", padding:12, opacity:.6 }}>
                                        <div style={{ fontFamily:"League Spartan, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", fontWeight:900, fontSize:18, letterSpacing:".12em", marginBottom:8 }}>{cat.label}</div>
                                        <div style={{ fontSize:13, color:"#6b7280" }}>No posts</div>
                                    </div>
                                );
                                return (
                                    <div key={cat.key} style={{ border:"1px solid #e5e7eb", borderRadius:12, background:"#fff", padding:12 }}>
                                        <div style={{ fontFamily:"League Spartan, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif", fontWeight:900, fontSize:21, letterSpacing:".12em", marginBottom:8 }}>{cat.label}</div>
                                        <div
                                            style={{
                                                display:"grid",
                                                gap:8,
                                                maxHeight:"260px",
                                                overflow:"auto",
                                                paddingRight:4,
                                                WebkitOverflowScrolling:"touch",
                                                overscrollBehavior:"contain"
                                            }}
                                        >
                                            {arr.map((it, i) => (
                                                <div
                                                    key={it.id || i}
                                                    className="isClickable"
                                                    onClick={(e)=>openFrom(e.currentTarget, it)}
                                                    style={{ display:"grid", gridTemplateColumns:"64px 1fr", gap:10, alignItems:"center", padding:8, borderRadius:10, border:"1px solid transparent" }}
                                                    onMouseEnter={(e)=>{ e.currentTarget.style.borderColor="#111"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,.06)"; }}
                                                    onMouseLeave={(e)=>{ e.currentTarget.style.borderColor="transparent"; e.currentTarget.style.boxShadow="none"; }}
                                                >
                                                    <div style={{ width:64, height:48, borderRadius:8, overflow:"hidden", background:"#eee" }}>
                                                        {it.cover ? <img src={it.cover} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} /> : null}
                                                    </div>
                                                    <div style={{ minWidth:0 }}>
                                                        <div style={{ fontWeight:800, lineHeight:1.2, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{it.title}</div>
                                                        <div style={{ color:"#6b7280", fontSize:12 }}>{it.date}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    <section className="latest">
                        {hero && (
                            <article
                                className="picksHero isClickable"
                                onClick={(e) => openFrom(e.currentTarget, hero, ".picksHero__img")}
                            >
                                <img className="picksHero__img" src={hero.cover} alt={hero.title} />
                                <h1 className="picksHero__title">{hero.title}</h1>
                                <p className="picksHero__excerpt">{hero.excerpt}</p>
                            </article>
                        )}

                        <form className="latestSearch" onSubmit={onSearch}>
                            <label htmlFor="news-q" className="sr-only">Search news</label>
                            <input
                                id="news-q"
                                name="q"
                                type="search"
                                placeholder="Search news…"
                                className="latestSearch__input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                ref={inputAnchorRef}
                                onFocus={(e) => {
                                    const r = e.currentTarget.getBoundingClientRect();
                                    setSearchRect({ left: r.left, top: r.top, width: r.width, height: r.height });
                                    setSearchOpen(true);
                                }}
                            />
                            <button className="latestSearch__btn" type="submit">Search</button>
                            <button type="button" className="latestSearch__btn" onClick={() => setCreateOpen(true)}>Upload</button>
                        </form>
                    </section>

                    <aside className="recent">
                        <div className="latestList latestList--sidebar">
                            {mostRecent.map((it, i) => (
                                <article
                                    key={it.id || i}
                                    className="latestCard isClickable"
                                    onClick={(e) => openFrom(e.currentTarget, it, ".latestCard__thumb")}
                                >
                                    <div className="latestCard__thumb">
                                        <img src={it.cover} alt={it.title} />
                                    </div>
                                    <div className="latestCard__body">
                                        <h3 className="latestCard__title">{it.title}</h3>
                                        <p className="latestCard__excerpt">{it.excerpt}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </aside>
                </div>
            </main>

            <ZoomModal
                key={modalKey}
                open={zoom.open}
                item={zoom.item}
                fromRect={zoom.rect}
                onClose={() => setZoom({ open: false, item: null, rect: null })}
            />

            {zoom.open && (
                <div style={{ position:"fixed", right:20, bottom:20, zIndex:12001, display:"flex", gap:10 }}>
                    <button className="latestSearch__btn" onClick={startEdit}>Edit</button>
                    <button className="latestSearch__btn" onClick={deleteCurrent} style={{ background:"#ef4444", color:"#fff" }}>Delete</button>
                </div>
            )}

            <AdminNewsUploader
                key={createOpen ? "create-open" : "create-closed"}
                externalOpen={createOpen}
                onCreated={() => { setCreateOpen(false); loadNews(); }}
                onClose={() => setCreateOpen(false)}
            />

            <AdminNewsUploader
                key={editOpen ? (editInitial?.id ?? "edit-open") : "edit-closed"}
                externalOpen={editOpen}
                initial={editInitial}
                onUpdated={() => { setEditOpen(false); setEditItem(null); loadNews(); }}
                onDeleted={() => { setEditOpen(false); setEditItem(null); loadNews(); }}
                onClose={() => { setEditOpen(false); setEditItem(null); }}
            />

            <SearchOverlay
                open={searchOpen}
                anchorRect={searchRect}
                news={news}
                onClose={() => setSearchOpen(false)}
                onSelect={(item, rect) => {
                    setZoom({ open: true, item, rect });
                }}
            />
        </div>
    );
}
