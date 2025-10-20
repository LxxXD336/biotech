import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";

/**
 * AnnualReport — annual report quote block
 * - Centered oversized quotation mark + italic quote text
 * - Capsule button below: YEAR ANNUAL REPORT (the button is inert for later linking)
 */
export function AnnualReport({
                                 year = 2024,
                                 href,
                                 onClick,
                                 text = `Since its inception in 2019, BIOTech Futures has produced over 2000 student alumni from 80 schools across metropolitan, regional and rural Australia and around the globe. These students have been paired with 300 academic mentors on 400 research projects towards innovative technologies to overcome industry-focused challenges in biomedical engineering. Read our ${2024} outcomes here:`,
                                 stats = [
                                     { label: "Student alumni", value: 2000, suffix: "+", goal: 2200, hint: "since 2019", icon: "🎓" },
                                     { label: "Schools", value: 80, suffix: "+", goal: 100, hint: "across AU & global", icon: "🏫" },
                                     { label: "Academic mentors", value: 300, suffix: "+", goal: 350, hint: "from universities & industry", icon: "🧑‍🏫" },
                                     { label: "Research projects", value: 400, suffix: "+", goal: 420, hint: "biomed & beyond", icon: "🔬" },
                                 ],
                                 cover,
                                 showProgress = true,
                             }: {
    year?: number;
    href?: string;
    onClick?: () => void;
    text?: string;
    stats?: { label: string; value: number; suffix?: string; goal?: number; hint?: string; icon?: string }[];
    cover?: string; // Optional: report cover image on the right
    showProgress?: boolean;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const inView = useInView(ref, { once: true, margin: "-10% 0px" });

    return (
        <section ref={ref} aria-labelledby="annual-report" className="relative isolate bg-white text-neutral-900">
            {/* Background arc decoration */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/2 top-0 h-64 w-[120vw] -translate-x-1/2 rounded-[100%] bg-teal-50 blur-[60px]" />
            </div>

            <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
                <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-8 md:gap-12 items-center">
                    {/* Left: oversized quote block */}
                    <motion.div
                        initial={{ y: 12, opacity: 0 }}
                        animate={{ y: inView ? 0 : 12, opacity: inView ? 1 : 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative"
                    >
                        <span aria-hidden className="absolute -left-4 -top-8 md:-left-8 md:-top-12 text-6xl md:text-8xl text-green-400 select-none leading-none">“</span>
                        <blockquote className="italic text-xl md:text-2xl leading-relaxed md:leading-[1.9] text-neutral-800 text-center md:text-left">
                            {text}
                        </blockquote>
                        <div className="mt-8 md:mt-10 flex justify-center md:justify-start">
                            <CreativeButton label={`${year} Annual Report`} href={href} onClick={onClick} shape="pill" />
                        </div>
                    </motion.div>

                    {/* Right: stats cards / optional cover image */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 8 }}
                        transition={{ duration: 0.6, delay: 0.05 }}
                    >
                        {cover ? (
                            <figure className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
                                <img src={cover} alt="Annual report cover" className="w-full h-auto object-cover" />
                            </figure>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                {stats.map((s, idx) => {
                                    const percent = s.goal ? Math.min(100, Math.round((s.value / s.goal) * 100)) : null;
                                    return (
                                        <div key={idx} className="group relative rounded-2xl border border-black/10 bg-teal-50/60 p-5 text-center shadow-sm overflow-hidden">
                                            {/* Background glow on hover */}
                                            <div aria-hidden className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-teal-200 blur-2xl" />
                                            </div>
                                            <div className="text-3xl md:text-4xl font-semibold text-teal-900 flex items-center justify-center gap-2">
                                                {s.icon ? <span className="text-2xl md:text-3xl" aria-hidden>{s.icon}</span> : null}
                                                <Counter to={s.value} duration={0.9 + idx * 0.2} />{s.suffix || ''}
                                            </div>
                                            <div className="mt-1 text-sm md:text-base text-teal-900/80">{s.label}</div>
                                            {s.hint && <div className="mt-1 text-xs text-teal-900/70">{s.hint}</div>}
                                            {showProgress && percent !== null && (
                                                <div className="mt-3 h-1.5 bg-teal-900/10 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${percent}%` }}
                                                        transition={{ duration: 0.9, delay: 0.2 + idx * 0.08 }}
                                                        className="h-full bg-teal-700"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

function CreativeButton({ label, href, onClick, shape = 'block', bg }: { label: string; href?: string; onClick?: () => void; shape?: 'pill' | 'block'; bg?: string }) {
    const [burst, setBurst] = React.useState(0);

    // Particles are regenerated on each click to keep hover visuals stable
    const particles = React.useMemo(() => {
        const palette = ["#22d3ee", "#34d399", "#f59e0b", "#ef4444", "#a78bfa"]; // Cyan/green/orange/red/purple
        const count = 16;
        return Array.from({ length: count }, (_, i) => {
            const angle = (i / count) * Math.PI * 2 + (Math.random() * 0.6 - 0.3);
            const dist = 28 + Math.random() * 36; // px
            const size = 3 + Math.random() * 4;   // 3–7 px
            const rotate = Math.random() * 360;
            const color = palette[i % palette.length];
            const shape = Math.random() > 0.5 ? "square" : "triangle";
            // Slight upward bias for a more celebratory motion
            return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * -dist * 0.8, size, rotate, color, shape };
        });
    }, [burst]);

    const core = (
        <motion.div
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="relative inline-flex items-center justify-center px-6 py-3 md:px-8 md:py-3 overflow-visible shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_6px_18px_rgba(0,0,0,0.15)]"
            style={{ background: bg || 'linear-gradient(90deg, #0f766e 0%, #0e7b75 40%, #0ea5a6 100%)', borderRadius: shape === 'pill' ? 9999 : 0 }}
        >
            <span className="relative z-20 text-white text-sm md:text-base font-semibold tracking-[0.22em] uppercase">
                {label}
            </span>
            {/* Sheen sweep highlight */}
            <motion.span
                key={`sheen-${burst}`}
                aria-hidden
                initial={{ x: "-120%" }}
                whileHover={{ x: "120%" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="pointer-events-none absolute left-0 top-0 h-full w-1/3 -skew-x-12 bg-white/25"
                style={{ borderRadius: 'inherit' }}
            />
            {/* Confetti; allow overflow beyond button bounds */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                {particles.map((p, i) => (
                    <motion.span
                        key={`${burst}-${i}`}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0, rotate: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0, 1, 1], x: p.dx, y: p.dy, rotate: p.rotate }}
                        transition={{ duration: 1 + Math.random() * 0.25, times: [0, 0.22, 1], ease: "easeOut" }}
                        className="absolute block"
                        style={{
                            width: p.size,
                            height: p.size,
                            backgroundColor: p.color,
                            clipPath: p.shape === "triangle" ? "polygon(50% 0, 0 100%, 100% 100%)" : undefined,
                            borderRadius: p.shape === "square" ? 2 : 0,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );

    const handleClick = () => {
        setBurst((n) => n + 1);
        onClick?.();
    };

    return href ? (
        <a
            href={href}
            onClick={handleClick}
            className="inline-block appearance-none bg-transparent border-0 p-0 m-0 rounded-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
            style={{ WebkitTapHighlightColor: "transparent", background: "transparent", border: "none" }}
            target="_self"
            rel="noopener"
        >
            {core}
        </a>
    ) : (
        <button
            type="button"
            onClick={handleClick}
            className="inline-block appearance-none bg-transparent border-0 p-0 m-0 rounded-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0"
            style={{ WebkitTapHighlightColor: "transparent", background: "transparent", border: "none" }}
        >
            {core}
        </button>
    );
}

function Counter({ from = 0, to = 0, duration = 1 }: { from?: number; to?: number; duration?: number }) {
    const [val, setVal] = React.useState(from);
    useEffect(() => {
        let raf: number;
        const start = performance.now();
        const step = (t: number) => {
            const p = Math.min(1, (t - start) / (duration * 1000));
            const n = Math.round(from + (to - from) * p);
            setVal(n);
            if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [from, to, duration]);
    return <span>{val.toLocaleString()}</span>;
}
