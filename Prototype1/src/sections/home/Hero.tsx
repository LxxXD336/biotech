// src/sections/home/Hero.tsx
import React, { useRef, useState, useLayoutEffect, useCallback } from "react";
import { motion } from "framer-motion";
import defaultHeroBg from "../../Photo/bg.jpg";

/* ----------------- 小容器 ----------------- */
type ContainerProps = { children: React.ReactNode; className?: string };
const Container: React.FC<ContainerProps> = ({ children, className = "" }) => (
    <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);

/* ----------------- BioField 背景装饰 ----------------- */
const BioField: React.FC = () => (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
            <linearGradient id="g1" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="rgba(63,179,165,.20)" />
                <stop offset="1" stopColor="rgba(38,105,125,.10)" />
            </linearGradient>
            <radialGradient id="glow" cx="18%" cy="22%" r="60%">
                <stop offset="0%" stopColor="rgba(255,255,255,.45)" />
                <stop offset="70%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>
            <style>{`
        .ring { stroke: url(#g1); fill: none; stroke-width: 1.5; opacity:.8; }
        .dash { stroke-dasharray: 12 18; animation: dashMove 6s linear infinite; }
        @keyframes dashMove { to { stroke-dashoffset: -300; } }
        .pulse { animation: pulse 10s ease-in-out infinite; transform-origin: 70% 0%; }
        @keyframes pulse { 0%,100% { transform: scale(1)} 50% {transform: scale(1.06)} }
      `}</style>
        </defs>
        <rect x="0" y="0" width="1440" height="900" fill="url(#glow)" />
        {Array.from({ length: 8 }).map((_, i) => (
            <path key={i} className={`ring ${i % 2 ? "dash" : ""}`} d={`M 1100,-120 m 0,0 a ${260 + i * 90},${260 + i * 90} 0 1,1 -1 0`} />
        ))}
        <g className="pulse">
            <path className="ring" d="M 1100,-120 m 0,0 a 520,520 0 1,1 -1 0" />
        </g>
    </svg>
);

/* ----------------- TitleReveal ----------------- */
type TitleProps = { over?: string; title?: string; lead?: string };
const TitleReveal: React.FC<TitleProps> = ({ over, title, lead }) => {
    const renderTitle = (text?: string) =>
        String(text ?? "")
            .split("\n")
            .map((ln, i, arr) => (
                <React.Fragment key={i}>
                    {ln}
                    {i < arr.length - 1 ? <br /> : null}
                </React.Fragment>
            ));

    return (
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.2, 1, 0.3, 1] }}>
            {over ? (
                <p className="tracking-[0.18em] text-xs md:text-sm mb-3" style={{ color: "var(--btf-subheading, #4b5563)" }}>
                    {over}
                </p>
            ) : null}
            <motion.h1
                className="font-extrabold leading-[1.05]"
                style={{ color: "var(--btf-headings, #0f172a)", fontSize: "clamp(2.4rem, 5.5vw, 4.6rem)" }}
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{ duration: 0.9, ease: [0.2, 1, 0.3, 1], delay: 0.15 }}
            >
                {title ? renderTitle(title) : <>Design the Future.<br />Share Your Science.</>}
            </motion.h1>
            {lead ? (
                <motion.p
                    className="mt-5 md:text-lg max-w-xl"
                    style={{ color: "color-mix(in oklab, var(--btf-text, #0f172a) 90%, transparent)" }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    {lead}
                </motion.p>
            ) : null}
        </motion.div>
    );
};

/* ----------------- OrbitAroundTarget ----------------- */
type OrbitProps = {
    targetRef: React.RefObject<HTMLDivElement>;
    topics: string[];
    padding?: number;
};
const OrbitAroundTarget: React.FC<OrbitProps> = ({ targetRef, topics, padding = 36 }) => {
    const wrapRef = useRef<HTMLDivElement>(null);
    const [geo, setGeo] = useState<null | { cx: number; cy: number; rOuter: number; rInner: number }>(null);

    const measure = useCallback(() => {
        const t = targetRef.current;
        const w = wrapRef.current;
        if (!t || !w) return;
        const tr = t.getBoundingClientRect();
        const wr = w.getBoundingClientRect();
        const cx = tr.left - wr.left + tr.width / 2;
        const cy = tr.top - wr.top + tr.height / 2;
        const base = Math.max(tr.width, tr.height) / 2;
        setGeo({ cx, cy, rOuter: base + padding, rInner: Math.max(80, base * 0.7) });
    }, [targetRef, padding]);

    useLayoutEffect(() => {
        measure();
        window.addEventListener("resize", measure);
        const id = requestAnimationFrame(measure);
        return () => {
            window.removeEventListener("resize", measure);
            cancelAnimationFrame(id);
        };
    }, [measure]);

    return (
        <div ref={wrapRef} className="absolute inset-0 pointer-events-none" aria-hidden>
            <style>{`
        .spin { position:absolute; inset:0; animation:spin 26s linear infinite; }
        .spin.slow { animation-duration: 34s; }
        .spin.rev  { animation-direction: reverse; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .chip-float {
          position:absolute; left:0; top:0;
          padding:.42rem .8rem; border:1px solid var(--btf-border, rgba(2,6,23,.08));
          border-radius:999px; background:rgba(255,255,255,.86);
          backdrop-filter: blur(6px); color:var(--btf-headings, #0f172a);
          font-size:.78rem; box-shadow:0 2px 8px rgba(0,0,0,.06);
          white-space:nowrap;
        }
      `}</style>

            {geo && (
                <>
                    <div className="spin slow" style={{ transformOrigin: `${geo.cx}px ${geo.cy}px` }}>
                        {topics.slice(0, Math.ceil(topics.length / 2)).map((t, i, arr) => {
                            const a = (i / arr.length) * 360;
                            return (
                                <span key={`outer-${t}`} className="chip-float" style={{ transform: `translate(${geo.cx}px, ${geo.cy}px) rotate(${a}deg) translate(${geo.rOuter}px) rotate(${-a}deg)` }}>
                  {t}
                </span>
                            );
                        })}
                    </div>
                    <div className="spin rev" style={{ transformOrigin: `${geo.cx}px ${geo.cy}px`, animationDuration: "20s" }}>
                        {topics.slice(Math.ceil(topics.length / 2)).map((t, i, arr) => {
                            const a = (i / arr.length) * 360;
                            return (
                                <span key={`inner-${t}`} className="chip-float" style={{ transform: `translate(${geo.cx}px, ${geo.cy}px) rotate(${a}deg) translate(${geo.rInner}px) rotate(${-a}deg)` }}>
                  {t}
                </span>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

/* ----------------- 主 Hero 组件（已内置 YouTube 链接） ----------------- */
type HeroContent = { heroOver?: string; heroTitle?: string; heroLead?: string };
type HeroProps = {
    heroBg?: string;          // 可传入覆盖背景（可选）
    topics?: string[];        // 覆盖芯片文本（可选）
    content?: HeroContent;    // 覆盖标题文案（可选）
    autoPlayMuted?: boolean;  // 是否静音自动播放（默认 true）
};

const DEFAULT_YT = "https://www.youtube.com/watch?v=0zrfebSOCqs";

const Hero: React.FC<HeroProps> = ({
                                       heroBg,
                                       topics,
                                       content,
                                       autoPlayMuted = true, // 默认静音自动播放
                                   }) => {
    const rightRef = useRef<HTMLDivElement>(null);

    const chips =
        topics && topics.length
            ? topics
            : ["AI × Bio", "SynBio", "Wet Lab", "Science Comms", "Data viz", "Open-source kits", "Cell design", "Ethics"];

    const c: Required<HeroContent> = {
        heroOver: content?.heroOver ?? "NEXT GEN INNOVATORS",
        heroTitle: content?.heroTitle ?? "Design the Future.\nShare Your Science.",
        heroLead:
            content?.heroLead ??
            "A bold, interactive hub where high school innovators team up with researchers and industry mentors.",
    } as Required<HeroContent>;

    const bgUrl = heroBg ?? defaultHeroBg;

    // —— 把 watch / youtu.be 自动转为 embed —— //
    const toEmbed = (url: string): string => {
        if (url.includes("youtube.com/watch")) {
            const id = new URL(url).searchParams.get("v") ?? "";
            return `https://www.youtube.com/embed/${id}`;
        }
        if (url.includes("youtu.be/")) {
            const id = url.split("youtu.be/")[1].split(/[?&]/)[0];
            return `https://www.youtube.com/embed/${id}`;
        }
        return url; // 已经是 embed
    };
    const videoId = "0zrfebSOCqs"; // 方便 loop 场景
    const base = toEmbed(DEFAULT_YT);
    const params = autoPlayMuted
        ? `?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${videoId}`
        : "";
    const ytSrc = `${base}${params}`;

    return (
        <section className="relative overflow-hidden" style={{ overflow: "hidden" }}>
            {/* 背景 */}
            <div
                className="absolute inset-0 -z-10"
                style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <BioField />

            <Container>
                <div className="relative z-10 grid md:grid-cols-2 gap-10 items-center pt-20 md:pt-28 pb-16 md:pb-24">
                    {/* 左侧：标题 + CTA */}
                    <div>
                        <TitleReveal over={c.heroOver} title={c.heroTitle} lead={c.heroLead} />

                        <div className="mt-7 flex flex-wrap items-center gap-3">
                            <a href="#projects" className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm hover:-translate-y-px transition">
                                Explore projects
                            </a>
                        </div>

                        <div className="mt-6 text-xs opacity-70" style={{ color: "var(--btf-headings, #0f172a)" }}>
                            Scroll ↓ see challenges
                        </div>
                    </div>

                    {/* 右侧：视频卡（作为旋转中心） */}
                    <div ref={rightRef} className="relative">
                        <div className="rounded-3xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-white/80 backdrop-blur-sm">
                            {/* 用 padding hack 保持 16:9 */}
                            <div className="relative" style={{ paddingTop: "56.25%" }}>
                                <iframe
                                    src={ytSrc}
                                    title="Hero video"
                                    className="absolute inset-0 w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    loading="lazy"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* 芯片只围着右侧视频框旋转 */}
            <OrbitAroundTarget targetRef={rightRef} topics={chips} padding={40} />
        </section>
    );
};

export default Hero;
