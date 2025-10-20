import React, { useEffect, useMemo, useRef } from "react";

export function Column({ list, gap, speed }) {
    const wrapRef = useRef(null);
    const measureRef = useRef(null);
    const laneLenRef = useRef(1);

    const measure = () => {
        if (measureRef.current) {
            laneLenRef.current = measureRef.current.getBoundingClientRect().height || 1;
        }
    };

    useEffect(() => {
        measure();
        const onResize = () => measure();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [list]);

    return (
        <div style={{ position: "relative", overflow: "hidden" }}>
            <div ref={wrapRef} style={{ position: "absolute", top: 0, left: 0, right: 0, willChange: "transform" }}>
                <div ref={measureRef}>
                    {list.map((src, i) => (
                        <figure key={`a-${i}`} style={{ aspectRatio: "4 / 6", width: "100%", margin: 0, marginBottom: `${gap}px`, borderRadius: 1, overflow: "hidden", boxShadow: "0 0 40px rgba(0,0,0,0.25)", backfaceVisibility: "hidden" }}>
                            <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </figure>
                    ))}
                </div>
                <div>
                    {list.map((src, i) => (
                        <figure key={`b-${i}`} style={{ aspectRatio: "4 / 6", width: "100%", margin: 0, marginBottom: `${gap}px`, borderRadius: 1, overflow: "hidden", boxShadow: "0 0 40px rgba(0,0,0,0.25)", backfaceVisibility: "hidden" }}>
                            <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </figure>
                    ))}
                </div>
            </div>
            <div data-speed={speed} data-measure-id />
        </div>
    );
}

export default function FourColumnInfiniteGallery({ images = [], gap = 16 }) {
    const containerRef = useRef(null);
    const colsData = useMemo(() => {
        const c = [[], [], [], []];
        images.forEach((src, i) => c[i % 4].push(src));
        return c;
    }, [images]);

    const speeds = [1.0, 0.92, 1.08, 0.98];
    const scrollRef = useRef(0);
    const targetRef = useRef(0);
    const rafRef = useRef(0);

    const wrapsRef = useRef([]);
    const lanesLenRef = useRef([]);
    wrapsRef.current = [];
    lanesLenRef.current = [];

    const setWrap = (idx, el) => {
        wrapsRef.current[idx] = el;
    };
    const setMeasure = (idx, el) => {
        if (!el) return;
        const h = el.getBoundingClientRect().height || 1;
        lanesLenRef.current[idx] = h;
    };

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const onWheel = (e) => {
            e.preventDefault();
            targetRef.current += e.deltaY;
        };
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => el.removeEventListener("wheel", onWheel);
    }, []);

    useEffect(() => {
        const tick = () => {
            scrollRef.current += (targetRef.current - scrollRef.current) * 0.12;
            for (let i = 0; i < wrapsRef.current.length; i += 1) {
                const wrap = wrapsRef.current[i];
                const L = lanesLenRef.current[i] || 1;
                const s = speeds[i] || 1;
                if (!wrap || !L) continue;
                let offset = scrollRef.current * s;
                if (offset >= L) offset -= Math.floor(offset / L) * L;
                if (offset < 0) offset += Math.ceil(-offset / L) * L;
                wrap.style.transform = `translate3d(0, ${-Math.round(offset)}px, 0)`;
            }
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    useEffect(() => {
        const measureAll = () => {
            const measures = containerRef.current?.querySelectorAll("[data-measure-id]") || [];
            measures.forEach((m, idx) => {
                const lane = m.previousSibling;
                if (lane) {
                    const h = lane.getBoundingClientRect().height || 1;
                    lanesLenRef.current[idx] = h;
                }
            });
        };
        measureAll();
        const onResize = () => measureAll();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [colsData]);

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100vw",
                height: "100vh",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 9
            }}
        >
            {colsData.map((list, colIdx) => (
                <div key={colIdx} style={{ position: "relative", overflow: "hidden" }}>
                    <div
                        ref={(el) => setWrap(colIdx, el)}
                        style={{ position: "absolute", top: 0, left: 0, right: 0, willChange: "transform" }}
                    >
                        <div ref={(el) => setMeasure(colIdx, el)}>
                            {list.map((src, i) => (
                                <figure key={`a-${i}`} style={{ aspectRatio: "4 / 6", width: "100%", margin: 0, marginBottom: `${gap}px`, borderRadius: 1, overflow: "hidden", boxShadow: "0 0 40px rgba(0,0,0,0.25)", backfaceVisibility: "hidden" }}>
                                    <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </figure>
                            ))}
                        </div>
                        <div>
                            {list.map((src, i) => (
                                <figure key={`b-${i}`} style={{ aspectRatio: "4 / 6", width: "100%", margin: 0, marginBottom: `${gap}px`, borderRadius: 1, overflow: "hidden", boxShadow: "0 0 40px rgba(0,0,0,0.25)", backfaceVisibility: "hidden" }}>
                                    <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </figure>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
