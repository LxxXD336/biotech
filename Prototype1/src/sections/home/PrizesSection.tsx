// ==== PRIZES — Scratch Cards (safe, colorful, big images, hardened) ====
import React from "react";
import { Container, COLORS } from "../../components/common";

// 你已有的 3 张图（保持不变）—— 奖杯先用 emoji 兜底
import printerImg from "../../Photo/3d.jpg";
import solarImg from "../../Photo/solar.jpg";
import telescopeImg from "../../Photo/telescope.jpg";
import p1 from "../../Photo/p1.jpg";
import p2 from "../../Photo/p2.jpg";
import p3 from "../../Photo/p3.jpg";
type PrizeItem = {
    id: string;
    label: string;
    emoji: string;
    iconSrc?: string;
    accent: string;
};

const PRIZES: PrizeItem[] = [
    { id: "p1", label: "3D Printer",  emoji: "🖨️", iconSrc: printerImg,   accent: "#10b981" },
    { id: "p2", label: "Solar Powered phone charger", emoji: "🔋", iconSrc: solarImg,     accent: "#f59e0b" },
    { id: "p3", label: "Telescope",                   emoji: "🔭", iconSrc: telescopeImg, accent: "#8b5cf6" },
    { id: "p4", label: "BIOTech Futures Trophy",      emoji: "🏆", /* iconSrc: trophyImg, */ accent: "#06b6d4" },
];

const hasWindow = typeof window !== "undefined";

export const PrizesSection: React.FC = () => {
    const [resetTick, setResetTick] = React.useState(0);
    const hostRef = React.useRef<HTMLDivElement>(null);

    // 小彩带（hostRef 未挂载时直接返回，避免空引用）
    const boomConfetti = React.useCallback(() => {
        const root = hostRef.current;
        if (!root) return;
        for (let i = 0; i < 26; i++) {
            const s = document.createElement("span");
            s.className = "scratch-confetti";
            s.style.left = Math.random() * 100 + "%";
            s.style.setProperty("--r", (Math.random() * 140 - 70).toFixed(0) + "deg");
            s.style.setProperty("--dx", (Math.random() * 140 - 70).toFixed(0) + "px");
            s.style.setProperty("--d", (800 + Math.random() * 700).toFixed(0) + "ms");
            root.appendChild(s);
            setTimeout(() => s.remove(), 1400);
        }
    }, []);

    return (
        <section id="prizes" style={{ background: COLORS?.white || "#fff" }}>
            <Container className="py-16 md:py-20">
                <div className="grid gap-10 md:grid-cols-2 items-start">
                    {/* 左侧文案 */}
                    <div>
                        <span className="pill">PRIZES</span>
                        <h2 className="section-title mt-4">
                            WHAT'S AT <span style={{ color: COLORS?.green || "#10b981" }}>STAKE?</span>
                        </h2>
                        <p className="section-body mt-4" style={{ maxWidth: 720 }}>
                            BIOTech Futures is a chance to highlight your skills to give you the confidence and
                            passion to pursue STEM and supercharge your education. As well as having the
                            opportunity to win from a selection of great prizes, you can kick-start your career
                            and work together with your peers and classmates to create something innovative that
                            you can be proud of.
                        </p>
                        <div className="intro-media">
                            <img src={p1}   alt="Prize preview 1" />
                            <img src={p2}     alt="Prize preview 2" />
                            <img src={p3} alt="Prize preview 3" />
                        </div>
                    </div>


                    {/* 右侧：刮刮卡网格 */}
                    <div ref={hostRef} className="scratch-wrap">
                        <div className="scratch-grid">
                            {PRIZES.map((p, i) => (
                                <ScratchCard
                                    key={p.id}
                                    prize={p}
                                    resetTick={resetTick}
                                    onRevealed={boomConfetti}
                                    i={i}
                                />
                            ))}
                        </div>

                        <div className="scratch-actions">
                            <button className="btn-outline" onClick={() => setResetTick((x) => x + 1)}>
                                Reset all
                            </button>
                        </div>
                    </div>
                </div>
            </Container>

            {/* 私有样式 */}
            <style>{`
        .scratch-wrap{ display:flex; flex-direction:column; align-items:center; gap:12px; }
        .scratch-grid{
          width:min(560px, 92vw);
          display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:16px;
        }

        .scratch-card{
          position:relative; border-radius:18px;   /* 原来 22px */
          overflow:hidden;
          height: clamp(220px, 30vw, 320px);       /* 原来 clamp(260px, 38vw, 420px) */
          background: linear-gradient(180deg,#ffffff,#fafdfc);
          box-shadow: 0 12px 26px rgba(0,0,0,.10), inset 0 0 0 1px rgba(2,6,23,.08);
          transition: transform .18s ease, box-shadow .25s ease, outline-color .2s ease;
          outline:2px solid transparent;
        }
        .scratch-card:hover{
          transform: translateY(-4px);
          box-shadow: 0 22px 50px rgba(0,0,0,.16), inset 0 0 0 1px rgba(2,6,23,.08);
        }

        .scratch-card::before{
          content:""; position:absolute; inset:-2px; border-radius:inherit; z-index:0; opacity:.22;
          background:
            radial-gradient(120% 160% at 90% -10%, var(--accent, #3fb3a5) 0%, transparent 60%),
            radial-gradient(120% 160% at 10% 110%, var(--accent, #3fb3a5) 0%, transparent 60%);
          filter: blur(12px);
          animation: glow-pan var(--dur, 10s) linear infinite;
        }
        @keyframes glow-pan { 0% { transform: rotate(0deg) } 100% { transform: rotate(360deg) } }

        .scratch-card.is-revealed{
          outline-color: var(--accent, #3fb3a5);
          box-shadow: 0 22px 60px rgba(0,0,0,.18), 0 0 0 6px rgba(0,0,0,0);
          transform: translateY(-2px) scale(1.01);
        }

        .scratch-content{
          position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:18px; padding:20px 16px; z-index:0;
        }
        .scratch-title{
          font-weight:900; color:#0f172a; text-align:center; line-height:1.2;
          text-shadow: 0 1px 0 rgba(255,255,255,.7);
        }

        .scratch-icon{
          width: clamp(170px, 55%, 320px);
          height: auto; object-fit: contain; display:block;
          filter: drop-shadow(0 12px 24px rgba(0,0,0,.18));
          animation: bob 4s ease-in-out infinite;
        }
        .scratch-emoji{
          font-size: clamp(70px, 11vw, 120px); line-height:1;
          filter: drop-shadow(0 12px 24px rgba(0,0,0,.18));
          animation: bob 4s ease-in-out infinite;
        }
        @keyframes bob { 0%,100%{ transform: translateY(0) } 50%{ transform: translateY(-6px) } }

        .scratch-canvas{ position:absolute; inset:0; z-index:1; touch-action:none; }
        .scratch-hint{
          position:absolute; inset:auto 0 10px 0; text-align:center; z-index:2; pointer-events:none;
          font-size:12px; color:#334155; text-shadow:0 1px 0 rgba(255,255,255,.7);
        }

        .scratch-actions{ margin-top:8px; }

        .scratch-confetti{ position:absolute; top:6px; width:8px; height:10px; background:var(--accent, ${COLORS?.green || "#3fb3a5"});
          transform: rotate(var(--r)); animation: scratch-fall var(--d) ease-out forwards;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,.15));
        }
        .scratch-confetti::after{ content:""; position:absolute; inset:0; background:linear-gradient(180deg,#fff,transparent); opacity:.6; }
        @keyframes scratch-fall{
          0%{ transform: translate3d(0,0,0) rotate(var(--r)); opacity:1; }
          100%{ transform: translate3d(var(--dx), 140px, 0) rotate(calc(var(--r) + 120deg)); opacity:0; }
        }
        /* 左侧说明下面的小图 - 放大版 */
        .intro-media{
          margin-top:18px;
          display:grid;
          grid-template-columns: repeat(3, minmax(0,1fr)); /* 先保留 3 列 */
          gap:14px;
          max-width: min(680px, 92vw);                     /* 原 560px -> 680px */
        }
        
        .intro-media img{
          width:100%;
          aspect-ratio: 16 / 10;   /* 用宽度驱动高度，更大更稳 */
        height: clamp(120px, 18vw, 220px);           object-fit:cover;
          border-radius:14px;      /* 略大圆角更好看 */
          box-shadow: 0 10px 22px rgba(0,0,0,.10);
          transition: transform .18s ease, box-shadow .2s ease;
        }
        
        @media (max-width: 900px){
          .intro-media{ grid-template-columns: repeat(2, 1fr); } /* 中屏改为 2 列 -> 单张更宽更大 */
        }
        
        @media (max-width: 520px){
          .intro-media{ grid-template-columns: 1fr; }           /* 小屏单列，最大化图片 */
        }
        
        .intro-media img:hover{
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(0,0,0,.14);
        }
      `}

            </style>
        </section>
    );
};

const ScratchCard: React.FC<{
    prize: PrizeItem;
    resetTick: number;
    onRevealed?: () => void;
    i: number;
}> = ({ prize, resetTick, onRevealed, i }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const boxRef = React.useRef<HTMLDivElement>(null);
    const [revealed, setRevealed] = React.useState(false);

    // 安全的银膜绘制：判空 + 兜底
    const paintFoil = React.useCallback(() => {
        const canvas = canvasRef.current;
        const box = boxRef.current;
        if (!canvas || !box) return;

        const dpr = hasWindow ? Math.max(1, window.devicePixelRatio || 1) : 1;
        const widthCss = box.clientWidth || 0;
        const heightCss = box.clientHeight || 0;

        // 如果容器尺寸为 0（尚未布局），跳过这次
        if (!widthCss || !heightCss) return;

        canvas.width = Math.floor(widthCss * dpr);
        canvas.height = Math.floor(heightCss * dpr);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 将坐标系按 CSS 像素绘制
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

// BTF 浅绿底（Style Guide: "Used for light theme elements (poster background)"）
        const BTF_LIGHT = "#C3EBCA";
        const grad = ctx.createLinearGradient(0, 0, widthCss, heightCss);
// 两端用同系更亮的绿，层次更柔
        grad.addColorStop(0, BTF_LIGHT);
        grad.addColorStop(1, "#E9F7EF"); // 比 #C3EBCA 更浅一点
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, widthCss, heightCss);

        const p = document.createElement("canvas");
        p.width = p.height = 40;
        const pc = p.getContext("2d");
        if (pc) {
            const pattern = ctx.createPattern(p, "repeat");
            if (pattern) {
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = pattern;
                ctx.fillRect(0, 0, widthCss, heightCss);
                ctx.globalAlpha = 1;
            }
        }

        // ctx.fillStyle = "rgba(0,0,0,.22)";
        // ctx.font = "700 14px system-ui, -apple-system, Segoe UI, Roboto";
        // ctx.textAlign = "center";
        // ctx.fillText("Scratch to reveal", widthCss / 2, heightCss / 2);

        canvas.style.opacity = "1";
        canvas.style.pointerEvents = "auto";
        setRevealed(false);
    }, []);

    // 首次与重置
    React.useEffect(() => {
        paintFoil();

        // ResizeObserver 兜底
        let ro: ResizeObserver | null = null;
        const el = boxRef.current;

        if (hasWindow && "ResizeObserver" in window && el) {
            ro = new ResizeObserver(() => paintFoil());
            ro.observe(el);
        } else if (hasWindow) {
            const onResize = () => paintFoil();
            window.addEventListener("resize", onResize);
            return () => window.removeEventListener("resize", onResize);
        }

        return () => {
            if (ro && el) ro.unobserve(el);
            if (ro) ro.disconnect();
        };
    }, [paintFoil]);

    React.useEffect(() => { paintFoil(); }, [resetTick, paintFoil]);

    // --- 刮开逻辑（更跟手：rAF 合批 + 缓存 rect + 阻止默认滚动） ---
    React.useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        const box = boxRef.current;
        if (!canvas || !ctx || !box) return;

        let isDown = false;
        let rect: DOMRect | null = null;
        let lastX = 0, lastY = 0;
        const BRUSH = 18;

        // rAF 合批
        let rafId: number | null = null;
        let nextPoint: { x: number; y: number } | null = null;

        const drawSeg = (x0: number, y0: number, x1: number, y1: number) => {
            ctx.globalCompositeOperation = "destination-out";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.lineWidth = BRUSH * 2;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
            ctx.globalCompositeOperation = "source-over";
        };

        const getXY = (ev: PointerEvent) => {
            const r = rect || canvas.getBoundingClientRect();
            return { x: ev.clientX - r.left, y: ev.clientY - r.top };
        };

        const onDown = (e: PointerEvent) => {
            rect = canvas.getBoundingClientRect(); // 缓存一次，避免 hover 移动影响
            isDown = true;
            try { canvas.setPointerCapture(e.pointerId); } catch {}
            box.classList.add("is-scratching");
            const { x, y } = getXY(e);
            lastX = x; lastY = y;
            // 立即打点，避免起笔延迟感
            drawSeg(lastX, lastY, lastX + 0.01, lastY + 0.01);
        };

        const onMove = (e: PointerEvent) => {
            if (!isDown) return;
            e.preventDefault(); // 移动端阻止滚动/缩放手势
            const { x, y } = getXY(e);
            nextPoint = { x, y };
            if (rafId == null) {
                rafId = requestAnimationFrame(() => {
                    if (nextPoint) {
                        drawSeg(lastX, lastY, nextPoint.x, nextPoint.y);
                        lastX = nextPoint.x; lastY = nextPoint.y;
                        nextPoint = null;
                    }
                    rafId = null;
                });
            }
        };

        const onUp = () => {
            if (!isDown) return;
            isDown = false;
            rect = null;
            box.classList.remove("is-scratching");
            if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }

            // 估算已刮开比例
            try {
                const step = 8;
                const { width, height } = canvas;
                const data = ctx.getImageData(0, 0, width, height).data;
                let cleared = 0, total = 0;
                for (let y = 0; y < height; y += step) {
                    for (let x = 0; x < width; x += step) {
                        const a = data[(y * width + x) * 4 + 3];
                        total++; if (a < 64) cleared++;
                    }
                }
                if (total > 0) {
                    const ratio = cleared / total;
                    if (ratio > 0.45 && !revealed) {
                        canvas.style.transition = "opacity .35s ease";
                        canvas.style.opacity = "0";
                        canvas.style.pointerEvents = "none";
                        setRevealed(true);
                        onRevealed && onRevealed();
                    }
                }
            } catch {}
        };

        canvas.addEventListener("pointerdown", onDown, { passive: false });
        canvas.addEventListener("pointermove", onMove, { passive: false });
        canvas.addEventListener("pointerup", onUp);
        canvas.addEventListener("pointercancel", onUp);

        return () => {
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerup", onUp);
            canvas.removeEventListener("pointercancel", onUp);
            if (rafId != null) cancelAnimationFrame(rafId);
        };
    }, [onRevealed, revealed]);

    return (
        <div
            ref={boxRef}
            className={`scratch-card ${revealed ? "is-revealed" : ""}`}
            style={{ ["--accent" as any]: prize.accent, ["--dur" as any]: `${9 + i * 0.6}s` } as React.CSSProperties}
            aria-live="polite"
        >
            <div className="scratch-content">
                <div className="scratch-title">{prize.label}</div>
                {prize.iconSrc ? (
                    <img className="scratch-icon" src={prize.iconSrc} alt={prize.label} />
                ) : (
                    <div className="scratch-emoji" aria-hidden>{prize.emoji}</div>
                )}
            </div>

            <canvas className="scratch-canvas" ref={canvasRef} aria-label="Scratch surface" />
            {!revealed && <div className="scratch-hint">Scratch to reveal</div>}
        </div>
    );
};

export default PrizesSection;
