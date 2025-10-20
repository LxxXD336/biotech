import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function SearchOverlay({ open, anchorRect, news = [], onClose, onSelect }) {
    const panelRef = useRef(null);
    const inputRef = useRef(null);

    const [mounted, setMounted] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [target, setTarget] = useState({ left: 0, top: 0, width: 0, height: 0 });
    const [q, setQ] = useState("");

    useEffect(() => {
        if (!open) return;
        const y = window.scrollY;
        const { style } = document.body;
        const prev = {
            position: style.position,
            top: style.top,
            left: style.left,
            right: style.right,
            width: style.width,
            overflow: style.overflow,
        };
        style.position = "fixed";
        style.top = `-${y}px`;
        style.left = "0";
        style.right = "0";
        style.width = "100%";
        style.overflow = "hidden";
        return () => {
            const backY = -parseInt(style.top || "0", 10) || 0;
            style.position = prev.position || "";
            style.top = prev.top || "";
            style.left = prev.left || "";
            style.right = prev.right || "";
            style.width = prev.width || "";
            style.overflow = prev.overflow || "";
            window.scrollTo(0, backY);
        };
    }, [open]);

    useLayoutEffect(() => {
        if (!open || !anchorRect) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        setTarget({ left: 0, top: 0, width: vw, height: vh });
        setMounted(true);
    }, [open, anchorRect]);

    useLayoutEffect(() => {
        if (!mounted || !panelRef.current || !anchorRect) return;
        const el = panelRef.current;
        el.style.left = `${target.left}px`;
        el.style.top = `${target.top}px`;
        el.style.width = `${target.width}px`;
        el.style.height = `${target.height}px`;

        const dx = anchorRect.left - target.left;
        const dy = anchorRect.top - target.top;
        const sx = anchorRect.width / target.width;
        const sy = anchorRect.height / target.height;

        el.style.transformOrigin = "left top";
        el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
        el.getBoundingClientRect();
        requestAnimationFrame(() => {
            setOverlayVisible(true);
            el.style.transition = "transform .34s ease";
            el.style.transform = "translate(0px, 0px) scale(1, 1)";
            setTimeout(() => inputRef.current?.focus(), 60);
        });
    }, [mounted, target, anchorRect]);

    const handleClose = () => {
        setOverlayVisible(false);
        onClose?.();
        setQ("");
    };

    const filtered = useMemo(() => {
        const keyword = q.trim().toLowerCase();
        if (!keyword) return news;
        return news.filter(n =>
            (n.title || "").toLowerCase().includes(keyword) ||
            (n.excerpt || "").toLowerCase().includes(keyword)
        );
    }, [q, news]);

    if (!open) return null;

    return createPortal(
        <div className="searchZoomRoot" aria-hidden={!open}>
            <div
                className="searchZoomOverlay"
                style={{ opacity: overlayVisible ? 1 : 0 }}
                onClick={handleClose}
            />
            <div ref={panelRef} className="searchZoomPanel" role="dialog" aria-modal="true">
                <div className="searchBar">
                    <input
                        ref={inputRef}
                        className="searchBar__input"
                        type="search"
                        placeholder="Search news…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="searchBar__btn" type="button" onClick={() => inputRef.current?.focus()}>
                        Search
                    </button>
                    <button className="searchBar__close" type="button" onClick={handleClose}>×</button>
                </div>

                <div className="searchList">
                    {filtered.map((it, idx) => (
                        <article
                            key={idx}
                            className="searchCard"
                            onClick={(e) => {
                                const anchor = e.currentTarget.querySelector(".searchCard__img") || e.currentTarget;
                                const r = anchor.getBoundingClientRect();
                                onSelect?.(it, { left: r.left, top: r.top, width: r.width, height: r.height });
                            }}
                        >
                            <div className="searchCard__imgWrap">
                                <img className="searchCard__img" src={it.cover} alt={it.title} />
                            </div>
                            <div className="searchCard__body">
                                <h3 className="searchCard__title">{it.title}</h3>
                                <p className="searchCard__excerpt">{it.excerpt}</p>
                            </div>
                        </article>
                    ))}
                    {filtered.length === 0 && (
                        <div className="searchEmpty">No results</div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
