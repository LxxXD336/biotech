import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CylinderItem = {
  img: string;
  title?: string;   // 保留类型但不再展示
  blurb?: string;   // 保留类型但不再展示
  longText?: string;
  location?: string;
  date?: string;
  tags?: string[];
  link?: string;
  gallery?: string[];
};

export interface CylinderCarouselProps {
  items: CylinderItem[];
  height?: number;
  yOffset?: number;
  cardWidthPct?: number;
  cardMin?: number;
  cardMax?: number;
  tiltOnHover?: boolean;
  glass?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  dofStrength?: number;
  snapOnRelease?: boolean;
  enableDetailOverlay?: boolean; // 仍保留，但默认改为 false
  onIndexChange?: (index: number) => void;
  className?: string;
  autoplay?: boolean;
  pauseOnHover?: boolean;
  autoSpeed?: number;
  momentumOnRelease?: boolean;
}

const CylinderCarousel: React.FC<CylinderCarouselProps> = ({
  items,
  height = 560,
  yOffset = 0,
  cardWidthPct = 0.34,
  cardMin = 280,
  cardMax = 720,
  tiltOnHover = true,
  glass = true,
  showArrows = true,
  showDots = true,
  dofStrength = 0.25,
  snapOnRelease = false,
  enableDetailOverlay = false, // ← 纯图片：默认关闭详情弹层
  onIndexChange,
  className = "",
  autoplay = false,
  pauseOnHover = true,
  autoSpeed = 20,
  momentumOnRelease = false,
}) => {
  const N = Math.max(1, items.length);
  const step = 360 / N;

  const stageRef = useRef<HTMLDivElement | null>(null);
  const [stageW, setStageW] = useState<number>(1024);

  const [detailIdx, setDetailIdx] = useState<number | null>(null);
  const openDetail = (i: number) => { if (enableDetailOverlay) setDetailIdx(i); };
  const closeDetail = () => setDetailIdx(null);
  const nextDetail = () => setDetailIdx((i) => (i == null ? 0 : (i + 1) % items.length));
  const prevDetail = () => setDetailIdx((i) => (i == null ? 0 : (i - 1 + items.length) % items.length));

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setStageW(el.clientWidth);
    update();

    const win: Window | undefined =
      typeof globalThis !== "undefined" && (globalThis as any).window
        ? ((globalThis as any).window as Window)
        : undefined;
    if (!win) return;

    if (typeof (win as any).ResizeObserver !== "undefined") {
      const RO = (win as any).ResizeObserver as typeof ResizeObserver;
      const ro = new RO((entries: ResizeObserverEntry[]) => {
        for (const entry of entries) setStageW(entry.contentRect.width);
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
    win.addEventListener("resize", update);
    return () => win.removeEventListener("resize", update);
  }, []);

  const cardW = Math.min(Math.max(stageW * cardWidthPct, cardMin), cardMax);
  const gap = Math.max(12, Math.min(32, cardW * 0.06));
  const radius = useMemo(() => {
    const rad = (Math.PI * 2) / N;
    return (cardW + gap) / (2 * Math.tan(rad / 2));
  }, [N, cardW, gap]);

  const [rotation, setRotation] = useState(0);
  const rotRef = useRef(rotation);
  useEffect(() => { rotRef.current = rotation; }, [rotation]);

  const frontIndex = useMemo(() => {
    let best = 0, bestAbs = 1e9;
    for (let i = 0; i < N; i++) {
      const ang = normalizeAngle(step * i + rotation);
      const a = Math.abs(ang);
      if (a < bestAbs) { bestAbs = a; best = i; }
    }
    return best;
  }, [rotation, N, step]);

  const lastFront = useRef(frontIndex);
  useEffect(() => {
    if (frontIndex !== lastFront.current) {
      lastFront.current = frontIndex;
      onIndexChange?.(frontIndex);
    }
  }, [frontIndex, onIndexChange]);

  const dragState = useRef({
    active: false, startX: 0, startRot: 0, degPerPx: 0.2,
    lastX: 0, lastTs: 0, velocity: 0, downIndex: null as number | null, moved: false
  });

  const computeDegPerPx = useCallback((w: number) => (180 / w), []);

  const onPointerDown = (e: React.PointerEvent) => {
    const targetEl = (e.target as HTMLElement);
    if (targetEl.closest("button, a, [data-interactive='true']")) return;

    const el = stageRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragState.current.active = true;
    dragState.current.startX = e.clientX;
    dragState.current.startRot = rotRef.current;
    dragState.current.degPerPx = computeDegPerPx(el.clientWidth);
    dragState.current.lastX = e.clientX;
    dragState.current.lastTs = performance.now();
    dragState.current.velocity = 0;
    dragState.current.moved = false;

    const cardNode = targetEl.closest("[data-card-index]") as HTMLElement | null;
    dragState.current.downIndex = cardNode ? parseInt(cardNode.dataset.cardIndex || "-1") : null;

    (el.style as any).cursor = "grabbing";
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragState.current.active) return;
    const now = performance.now();
    const dx = e.clientX - dragState.current.startX;
    if (Math.abs(dx) > 6) dragState.current.moved = true;

    const newRot = dragState.current.startRot + dx * dragState.current.degPerPx;
    setRotation(newRot);

    const ddx = e.clientX - dragState.current.lastX;
    const dt = Math.max(1, now - dragState.current.lastTs);
    const v = (ddx * dragState.current.degPerPx) / (dt / 1000);
    dragState.current.velocity = v;
    dragState.current.lastX = e.clientX;
    dragState.current.lastTs = now;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const el = stageRef.current;
    if (!el) return;
    el.releasePointerCapture(e.pointerId);
    (el.style as any).cursor = "grab";
    const v = dragState.current.velocity;
    const wasDrag = dragState.current.moved;
    const tappedIndex = dragState.current.downIndex;
    dragState.current.active = false;
    dragState.current.downIndex = null;

    // 纯图片：即使轻点也不打开详情
    if (!wasDrag && tappedIndex != null && tappedIndex >= 0 && enableDetailOverlay) {
      openDetail(tappedIndex);
      return;
    }

    if (snapOnRelease) {
      const idx = nearestIndex(rotRef.current, step);
      const target = -step * idx;
      smoothTo(target, 220);
    } else if (momentumOnRelease) {
      startMomentum(v);
    }
  };

  const smoothTo = (target: number, ms = 280) => {
    const start = rotRef.current;
    const delta = shortestDelta(start, target);
    const startTs = performance.now();
    const animate = (t: number) => {
      const k = Math.min(1, (t - startTs) / ms);
      const eased = 1 - Math.pow(1 - k, 3);
      setRotation(start + delta * eased);
      if (k < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  };

  const goPrev = () => smoothTo(rotRef.current + step, 220);
  const goNext = () => smoothTo(rotRef.current - step, 220);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
  };

  const hoveringRef = useRef(false);
  const momentumRef = useRef(0);
  const lastTick = useRef<number | null>(null);
  const startMomentum = (v0: number) => { momentumRef.current = v0; };

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      if (lastTick.current == null) lastTick.current = t;
      const dt = (t - lastTick.current) / 1000;
      lastTick.current = t;

      let delta = 0;
      if (autoplay && !(pauseOnHover && hoveringRef.current) && !dragState.current.active && detailIdx == null) {
        delta += autoSpeed * dt;
      }
      if (!dragState.current.active) {
        if (Math.abs(momentumRef.current) > 0.01) {
          delta += momentumRef.current * dt;
          const friction = 0.92;
          const factor = Math.pow(friction, dt * 60);
          momentumRef.current *= factor;
        } else {
          momentumRef.current = 0;
        }
      }
      if (delta !== 0) setRotation((r) => r + delta);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoplay, pauseOnHover, autoSpeed, detailIdx]);

  const stageStyle: React.CSSProperties = {
    height,
    perspective: Math.round(radius * 5) + "px",
    touchAction: "pan-y",
    cursor: "grab",
    background: "transparent",
  };

  return (
    <div className={`relative w-full select-none ${className}`}>
      <div
        ref={stageRef}
        className="relative mx-auto w-full overflow-visible"
        style={stageStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        onMouseEnter={() => { hoveringRef.current = true; }}
        onMouseLeave={() => { hoveringRef.current = false; }}
        tabIndex={0}
        aria-roledescription="3D cylinder carousel"
      >
        {/* 3D world */}
        <div className="relative mx-auto" style={{ height, transformStyle: "preserve-3d" }}>
          {items.map((it, i) => {
            const angle = step * i + rotation;
            const angNorm = normalizeAngle(angle);
            const c = Math.cos((angNorm * Math.PI) / 180);
            const scale = 1 - dofStrength * (1 - Math.max(0, c));
            const alpha = 0.4 + 0.6 * Math.max(0, c);
            const zIndex = 1000 + Math.round(1000 * Math.max(-1, c));

            const wrapperStyle: React.CSSProperties = {
              position: "absolute",
              top: "50%", left: "50%",
              transformStyle: "preserve-3d",
              transform: `translate(-50%,-50%) translateY(${yOffset}px) rotateY(${angle}deg) translateZ(${radius}px)`,
              zIndex,
            };

            const cardStyle: React.CSSProperties = {
              width: cardW, height: Math.round(cardW * 0.6),
              transform: `rotateY(${-angle}deg) scale(${scale})`,
              transformOrigin: "center center",
              transition: "transform 160ms ease, box-shadow 160ms ease",
              boxShadow: glass ? "0 10px 25px rgba(0,0,0,0.12)" : "0 8px 20px rgba(0,0,0,0.2)",
              opacity: alpha,
              willChange: "transform, opacity",
              borderRadius: 16,
              overflow: "hidden",
              background: glass ? "rgba(255,255,255,0.65)" : "#fff",
              backdropFilter: glass ? "blur(8px)" : undefined,
              border: glass ? "1px solid rgba(255,255,255,0.6)" : "1px solid rgba(0,0,0,0.06)",
            };

            const frontish = Math.abs(angNorm) < step / 2;

            return (
              <div key={i} style={wrapperStyle} aria-hidden={!frontish}>
                <div
                  data-card-index={i}
                  className={`group relative ${tiltOnHover && frontish ? "hover:scale-[1.02]" : ""}`}
                  style={cardStyle}
                >
                  {/* 纯图片：不显示任何文字或渐变遮罩 */}
                  <img src={it.img} alt="" className="h-full w-full object-cover" draggable={false} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ARROWS */}
        {showArrows && N > 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 md:px-6">
            <button
              className="pointer-events-auto h-10 w-10 md:h-11 md:w-11 rounded-full bg-white/90 border border-black/5 shadow flex items-center justify-center hover:bg-white"
              aria-label="Previous"
              onClick={goPrev}
              data-interactive="true"
            >‹</button>
            <button
              className="pointer-events-auto h-10 w-10 md:h-11 md:w-11 rounded-full bg-white/90 border border-black/5 shadow flex items-center justify-center hover:bg-white"
              aria-label="Next"
              onClick={goNext}
              data-interactive="true"
            >›</button>
          </div>
        )}

        {/* DOTS */}
        {showDots && N > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {items.map((_, i) => {
              const active = i === frontIndex;
              return (
                <button
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full ${active ? "bg-emerald-500" : "bg-black/20 hover:bg-black/40"}`}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => smoothTo(-step * i, 220)}
                  data-interactive="true"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 即使传入 enableDetailOverlay，也不会渲染任何文字（默认关闭） */}
      {enableDetailOverlay && detailIdx != null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-[rgba(8,12,20,0.45)] backdrop-blur-md" onClick={closeDetail} />
          <div className="relative w-full max-w-5xl rounded-[28px] overflow-hidden shadow-[0_30px_120px_rgba(0,0,0,.25)]">
            <div className="relative h-[44vh] min-h-[280px] overflow-hidden">
              <img src={items[detailIdx].img} alt="" className="absolute inset-0 h-full w-full object-cover" />
            </div>
            <button onClick={closeDetail} aria-label="Close"
              className="absolute top-3 right-3 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow grid place-items-center text-black/70">✕</button>
            <button onClick={prevDetail} aria-label="Previous"
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow grid place-items-center text-black/70">‹</button>
            <button onClick={nextDetail} aria-label="Next"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white shadow grid place-items-center text-black/70">›</button>
          </div>
        </div>
      )}
    </div>
  );
};

function normalizeAngle(deg: number) {
  let a = (deg + 180) % 360;
  if (a < 0) a += 360;
  return a - 180;
}
function shortestDelta(from: number, to: number) {
  let d = (to - from) % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}
function nearestIndex(rot: number, step: number) { return Math.round(-rot / step); }

export default CylinderCarousel;
