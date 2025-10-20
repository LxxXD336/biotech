import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

function normalizeHtml(s){
    if(!s) return "";
    let out = s.replace(/<img\b(?![^>]*\bloading=)/gi, '<img loading="eager" decoding="async" ');
    out = out.replace(/<img\b((?:(?!style=).)*?)>/gi, '<img $1 style="max-width:100%;height:auto;">');
    return out;
}

export default function NewsModal({ open, item, fromRect, onClose }) {
    const panelRef = useRef(null);
    const [mounted, setMounted] = useState(false);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [target, setTarget] = useState({ left: 0, top: 0, width: 0, height: 0 });

    const cover = item?.cover || item?.cover_url || "";
    const dateText = item?.date || (item?.created_at ? new Date(item.created_at).toLocaleDateString("en-AU",{year:"numeric",month:"short",day:"numeric"}) : "");
    const html = useMemo(() => normalizeHtml(item?.body ?? item?.content ?? item?.excerpt ?? ""), [item?.id, item?.updated_at, item?.body, item?.content, item?.excerpt]);

    useEffect(() => {
        if (!open) return;
        const y = window.scrollY;
        const { style } = document.body;
        const prev = { position: style.position, top: style.top, left: style.left, right: style.right, width: style.width, overflow: style.overflow };
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
        if (!open || !fromRect) return;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const portrait = vh >= vw;
        let tw, th, tx, ty;
        if (portrait) { tw = vw; th = vh; tx = 0; ty = 0; }
        else { tw = Math.min(1000, Math.round(vw * 0.86)); th = Math.min(Math.round(vh * 0.9), vh - 40); tx = Math.round((vw - tw) / 2); ty = Math.round((vh - th) / 2); }
        setTarget({ left: tx, top: ty, width: tw, height: th });
        setMounted(true);
    }, [open, fromRect]);

    useLayoutEffect(() => {
        if (!mounted || !panelRef.current || !fromRect) return;
        const el = panelRef.current;
        el.style.left = target.left + "px";
        el.style.top = target.top + "px";
        el.style.width = target.width + "px";
        el.style.height = target.height + "px";
        const dx = fromRect.left - target.left;
        const dy = fromRect.top - target.top;
        const sx = fromRect.width / target.width;
        const sy = fromRect.height / target.height;
        el.style.transformOrigin = "left top";
        el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
        el.getBoundingClientRect();
        requestAnimationFrame(() => {
            setOverlayVisible(true);
            el.style.transition = "transform .34s ease";
            el.style.transform = "translate(0px, 0px) scale(1, 1)";
        });
    }, [mounted, target, fromRect]);

    useEffect(() => {
        if (!open) return;
        const container = panelRef.current?.querySelector(".zoomContent");
        if (!container) return;
        const imgs = container.querySelectorAll("img");
        imgs.forEach(img => {
            img.setAttribute("loading","eager");
            img.setAttribute("decoding","async");
            if (!img.complete) { const src = img.src; img.src = ""; img.src = src; }
        });
    }, [open, item?.id, item?.updated_at, html]);

    if (!open || !item) return null;

    const handleClose = () => {
        if (!panelRef.current || !fromRect) return onClose();
        const el = panelRef.current;
        const dx = fromRect.left - target.left;
        const dy = fromRect.top - target.top;
        const sx = fromRect.width / target.width;
        const sy = fromRect.height / target.height;
        setOverlayVisible(false);
        el.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
        const end = () => { el.removeEventListener("transitionend", end); onClose(); };
        el.addEventListener("transitionend", end);
    };

    return createPortal(
        <div className="zoomRoot" key={`modal-${item.id ?? "x"}-${item.updated_at ?? "u"}-${item.loading?"l":"r"}`}>
            <div className="zoomOverlay" style={{ opacity: overlayVisible ? 1 : 0 }} onClick={handleClose} />
            <div ref={panelRef} className="zoomPanel" role="dialog" aria-modal="true">
                <div className="zoomScroll">
                    {cover ? <img className="zoomCover" src={cover} loading="eager" decoding="async" alt="" /> : null}
                    <div className="zoomBody" key={`body-${item.id ?? "x"}-${item.updated_at ?? "u"}`}>
                        {item.loading ? <div className="zoomDate">Loading…</div> : (dateText ? <div className="zoomDate">{dateText}</div> : null)}
                        <h2 className="zoomTitle">{item.title}</h2>
                        {item.loading
                            ? <div className="zoomContent"> </div>
                            : <div className="zoomContent" dangerouslySetInnerHTML={{ __html: html }} />}
                    </div>
                </div>
                <button className="zoomClose" onClick={handleClose}>×</button>
            </div>
        </div>,
        document.body
    );
}
