import React from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";


function useViewportHeight() {
    const [vh, setVh] = React.useState(
        typeof window !== "undefined" ? window.innerHeight : 0
    );
    React.useEffect(() => {
        const onResize = () => setVh(window.innerHeight);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);
    return vh;
}

function toPx(height, viewportH) {
    if (typeof height === "number") return height;
    if (typeof height === "string") {
        const s = height.trim();
        if (s.endsWith("vh")) return (viewportH * parseFloat(s)) / 100;
        if (s.endsWith("px")) return parseFloat(s);
    }
    return 0;
}

function parseAR(ar) {
    if (typeof ar === "number" && isFinite(ar) && ar > 0) return ar;
    if (typeof ar === "string") {
        const [w, h] = ar.split("/").map((x) => parseFloat(x));
        if (w > 0 && h > 0) return w / h;
    }
    return 1;
}

function Marquee({
                     images,
                     height,
                     aspectRatio,
                     gap = 16,
                     onOpen,
                     paused = false,
                     startIntro = false,
                     introDone = true,
                     onIntroEnd,
                 }) {
    const doubled = React.useMemo(() => (images?.length ? [...images, ...images] : []), [images]);


    const viewportH = useViewportHeight();
    const hPx = toPx(height, viewportH);
    const ar = parseAR(aspectRatio);
    const itemWidth = hPx * ar;

    const targetPxPerSec = 250;
    const effectiveDuration = React.useMemo(() => {
        const n = images?.length ?? 0;
        if (!n || !itemWidth) return 20;
        const distance = n * (itemWidth + gap);
        return Math.max(distance / targetPxPerSec, 6);
    }, [images, itemWidth, gap]);

    if (!startIntro && !introDone) return null;


    const parentVariants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
    const itemVariants = { hidden: { y: 60, opacity: 0 }, show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 24 } } };

    if (startIntro && !introDone) {
        return (
            <div
                className="marquee-container is-paused"
                style={{ position: "absolute", top: "50%", left: 0, width: "100%", transform: "translateY(-50%)", overflow: "hidden" }}
            >
                <style>{`.intro-row{display:flex;}`}</style>
                <motion.div className="intro-row" key="intro" variants={parentVariants} initial="hidden" animate="show">
                    {images.map((src, i) => {
                        const isLast = i === images.length - 1;
                        const lid = `img-a-${i}`;
                        return (
                            <motion.figure
                                key={`intro-a-${i}`}
                                layoutId={lid}
                                variants={itemVariants}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onOpen && onOpen({ idx: i, seg: "a" })}
                                onAnimationComplete={() => { if (isLast) onIntroEnd?.(); }}
                                style={{
                                    height, aspectRatio, margin: 0, marginRight: `${gap}px`,
                                    borderRadius: 12, overflow: "hidden", boxShadow: "0 0 20px rgba(0,0,0,0.35)",
                                    flex: "0 0 auto", background: "#111", cursor: "pointer",
                                }}
                            >
                                <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </motion.figure>
                        );
                    })}
                </motion.div>
            </div>
        );
    }


    return (
        <div
            className={`marquee-container ${paused ? "is-paused" : ""}`}
            style={{ position: "absolute", top: "50%", left: 0, width: "100%", transform: "translateY(-50%)", overflow: "hidden" }}
        >
            <style>{`
        @keyframes marqueeScroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeScroll ${effectiveDuration}s linear infinite;
          will-change: transform;
          animation-play-state: running;
        }
        .marquee-container:hover .marquee-track { animation-play-state: paused; }
        .marquee-container.is-paused .marquee-track { animation-play-state: paused; }
      `}</style>

            <div className="marquee-track" key="run">
                {doubled.map((src, i) => {
                    const baseIdx = images.length ? (i % images.length) : 0;
                    const seg = i < images.length ? "a" : "b";
                    const lid = `img-${seg}-${baseIdx}`;
                    return (
                        <motion.figure
                            key={`run-${i}`}
                            layoutId={lid}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onOpen && onOpen({ idx: baseIdx, seg })}
                            style={{
                                height, aspectRatio, margin: 0, marginRight: `${gap}px`,
                                borderRadius: 12, overflow: "hidden", boxShadow: "0 0 20px rgba(0,0,0,0.35)",
                                flex: "0 0 auto", background: "#111", cursor: "pointer",
                            }}
                        >
                            <img src={src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </motion.figure>
                    );
                })}
            </div>
        </div>
    );
}

export default function MarqueeGallery({
                                           images = [],
                                           title,
                                           visible = true,
                                           closing = false,
                                           onSlideOutDone,
                                           onRequestClose,
                                       }) {
    const [active, setActive] = React.useState(null);
    const activeSrc = React.useMemo(
        () => (active && images?.length ? images[active.idx] : null),
        [active, images]
    );

    const [startIntro, setStartIntro] = React.useState(false);
    const [introDone, setIntroDone] = React.useState(false);
    React.useEffect(() => {
        if (visible) {
            setStartIntro(true);
            setIntroDone(false);
        }
    }, [visible]);

    React.useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onRequestClose?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onRequestClose]);

    React.useEffect(() => {
        if (active) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => { document.body.style.overflow = prev; };
        }
    }, [active]);

    const paused = !!active || closing;

    const contentExit = closing
        ? { y: "120vh", opacity: 0, transitionEnd: { display: "none", visibility: "hidden" } }
        : { y: 0, opacity: 1, display: "block", visibility: "visible" };

    const contentExitTransition = closing ? { duration: 0.5, ease: "easeIn" } : { duration: 0 };

    return (
        <LayoutGroup>
            <AnimatePresence>
                <motion.div key="content" style={{ position: "fixed", inset: 0, zIndex: 801 }}>
                    <motion.div
                        animate={contentExit}
                        transition={contentExitTransition}
                        onAnimationComplete={() => { if (closing) onSlideOutDone?.(); }}
                        style={{ position: "absolute", inset: 0 }}
                    >
                        <Marquee
                            images={images}
                            height={"70vh"}
                            aspectRatio="4 / 6"
                            gap={16}
                            onOpen={(payload) => setActive(payload)}
                            paused={paused}
                            startIntro={startIntro}
                            introDone={introDone}
                            onIntroEnd={() => setIntroDone(true)}
                        />

                        <AnimatePresence>
                            {active && (
                                <>
                                    <motion.div
                                        key="backdrop"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => setActive(null)}
                                        style={{
                                            position: "fixed", inset: 0,
                                            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)", zIndex: 9000,
                                        }}
                                    />
                                    <motion.div
                                        key="lightbox"
                                        layoutId={`img-${active.seg}-${active.idx}`}
                                        onClick={() => setActive(null)}
                                        style={{
                                            position: "fixed", inset: 0, display: "flex",
                                            alignItems: "center", justifyContent: "center",
                                            zIndex: 9001, cursor: "zoom-out", padding: "4vh 4vw",
                                        }}
                                    >
                                        <div
                                            onClick={(e) => e.stopPropagation()}
                                            style={{
                                                position: "relative", borderRadius: 16, overflow: "hidden",
                                                boxShadow: "0 30px 80px rgba(0,0,0,0.45)", background: "#000",
                                                maxWidth: "92vw", maxHeight: "88vh", display: "flex",
                                                alignItems: "center", justifyContent: "center",
                                            }}
                                        >
                                            <button
                                                onClick={() => setActive(null)}
                                                style={{
                                                    position: "absolute", top: 12, right: 12, width: 36, height: 36,
                                                    border: "none", borderRadius: 18, background: "rgba(255,255,255,0.85)",
                                                    cursor: "pointer", fontSize: 18, lineHeight: "36px", textAlign: "center",
                                                }}
                                                aria-label="Close"
                                            >
                                                ×
                                            </button>

                                            {activeSrc && (
                                                <img
                                                    src={activeSrc}
                                                    alt=""
                                                    draggable={false}
                                                    style={{ height: "88vh", width: "auto", maxWidth: "92vw", objectFit: "contain", display: "block" }}
                                                />
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </LayoutGroup>
    );
}
