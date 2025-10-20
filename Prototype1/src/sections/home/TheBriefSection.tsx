import React, { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Container } from "../../components/common"; // Align with Outreach
import { Brief } from "../../assets/images";

/**
 * TheBrief — renders the "Brief" section.
 */
export default function TheBrief() {
    const sectionRef = useRef<HTMLDivElement | null>(null);
    // Trigger animation once when the section enters the viewport
    const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });

    // Split the headline into words to keep the per-word hover animation
    const headline = "DESIGN SOMETHING THAT SOLVES A PROBLEM";
    const words = headline.split(" ");
    const bgX = -450; // Slight left offset after centering (px)

    // Background illustration — fixed at bottom-left
    const bgImage = Brief;

    return (
        <section
            id="brief"
            ref={sectionRef}
            aria-labelledby="the-brief"
            className="relative isolate overflow-hidden bg-[#BEE5A3] text-neutral-900 py-10 md:py-24" // Slightly tighter on mobile
        >
            {/* Background illustration (desktop/tablet): centered and slightly left */}
            <motion.img
                src={bgImage}
                alt=""
                aria-hidden
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-[300px] md:w-[420px] lg:w-[520px] pointer-events-none select-none [filter:drop-shadow(0_20px_44px_rgba(0,0,0,0.22))]"
                style={{ x: bgX, transformOrigin: "center" }}
            />

            {/* Soft glow at top-right */}
            <motion.div
                aria-hidden
                initial={{ opacity: 0 }}
                animate={{ opacity: inView ? 0.15 : 0 }}
                transition={{ duration: 0.8 }}
                className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-black/20 blur-3xl"
            />

            {/* Use Container to align with the global baseline/grid */}
            <Container>
                {/* Two-column grid and column gap consistent with Outreach */}
                <div className="relative z-10 grid md:grid-cols-2 items-start gap-4 md:gap-12">
                    {/* Left column: pill and headline */}
                    <div className="pb-4 md:pb-32 lg:pb-40">
                        {/* Pill style */}
                        <span className="pill">THE BRIEF</span>

                        {/* Semantic heading (visually hidden) for accessibility */}
                        <h2 id="the-brief" className="sr-only">
                            The Brief
                        </h2>

                        <motion.h3
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: inView ? 0 : 20, opacity: inView ? 1 : 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            // Use clamp for responsive headline size; proportionally aligned with other titles
                            className="font-extrabold tracking-tight leading-[0.95] mt-4 text-[clamp(20px,5vw,67px)]"
                            style={{ wordSpacing: "0.35em" }}
                        >
                            {words.map((w, i) => (
                                <motion.span
                                    key={i}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="inline-block will-change-transform mr-2 md:mr-4 lg:mr-6"
                                >
                                    {w}
                                </motion.span>
                            ))}
                        </motion.h3>

                        {/* Mobile illustration: always under the title */}
                        <motion.img
                            src={bgImage}
                            alt=""
                            aria-hidden
                            initial={{ opacity: 1, y: 0 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="md:hidden block mx-auto mt-1 mb-0 w-[280px] pointer-events-none select-none [filter:drop-shadow(0_10px_20px_rgba(0,0,0,0.14))]"
                            style={{ transformOrigin: "center" }}
                        />
                    </div>

                    {/* Right column content */}
                    <div className="space-y-4 md:space-y-5 text-base md:text-lg leading-7 md:leading-8 max-w-[62ch]">
                        <Reveal inView={inView}>
                            <p>
                                The competition is open annually to students in years 9–12 who think differently, to create products that work better.
                            </p>
                        </Reveal>

                        <Reveal inView={inView} delay={0.05}>
                            <details className="group rounded-xl border border-black/10 bg-white/50 p-3 md:p-4 open:shadow-md open:bg-white/70">
                                <summary className="cursor-pointer list-none font-semibold flex items-center justify-between">
                                    What judges look for
                                    <span aria-hidden className="ml-3 inline-block transition-transform group-open:rotate-45 text-xl">+</span>
                                </summary>
                                <p className="mt-3 text-neutral-800">
                                    Judges — and Prof. Hala Zreiqat especially — are drawn to projects that employ
                                    <abbr
                                        title="Simple, elegant engineering at the right level of complexity"
                                        className="underline decoration-dashed underline-offset-4 decoration-2 mx-1"
                                    >
                                        clever yet simple
                                    </abbr>
                                    engineering and scientific principles and address clear problems.
                                </p>
                                <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                    {["Clarity of problem", "Scientific rigor", "Creativity", "Collaboration"].map((t) => (
                                        <li key={t} className="rounded-lg bg-green-100 px-3 py-2 border border-green-300/50">
                                            {t}
                                        </li>
                                    ))}
                                </ul>
                            </details>
                        </Reveal>

                        <Reveal inView={inView} delay={0.1}>
                            <div className="rounded-xl border border-black/10 bg-white/50 p-3 md:p-4">
                                <p>
                                    This year BIOtech Futures will also be looking for entries that address
                                    <span className="mx-1 font-semibold">sustainable issues</span> and
                                    <span className="mx-1 font-semibold">humanitarian engineering</span>
                                    — what that means in the context of Australian priority areas and globalisation.
                                </p>
                            </div>
                        </Reveal>

                        <Reveal inView={inView} delay={0.2}>
                            <div className="pt-2">
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 0 }}
                                    onClick={() => {
                                        // No action on click for now; add navigation or scrolling later
                                        document.querySelector("#enter")?.scrollIntoView({ behavior: "smooth" });
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-white/80 px-5 py-3 text-sm font-semibold shadow-sm backdrop-blur hover:shadow-md focus:outline-none focus:ring-4 focus:ring-neutral-900/10"
                                >
                                    FIND OUT HOW TO ENTER
                                </motion.button>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </Container>
        </section>
    );
}

function Reveal({ inView, delay = 0, children }: { inView: boolean; delay?: number; children: React.ReactNode }) {
    return (
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: inView ? 0 : 16, opacity: inView ? 1 : 0 }} transition={{ duration: 0.55, delay }}>
            {children}
        </motion.div>
    );
}

export function TheBriefDev() {
    return <TheBrief />;
}
