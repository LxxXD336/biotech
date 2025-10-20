import React from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import {
    Users, Handshake, Microscope, GraduationCap, BookOpen, FlaskConical,
    ArrowRight, Building2,
} from "lucide-react";
import MainNav from "./MainNav";
import defaultStoryBg2 from "../Photo/sponsor2/studentnmentor.jpg";
import bgChallenge from "../Photo/Pastwinnerimages/b.jpg";
import bgLearning  from "../Photo/sponsor2/studentnmentor.jpg";
import bgMentor    from "../Photo/sponsor2/studentnmentor.jpg";
import bgCommunity from "../Photo/sponsor2/studentnmentor.jpg";
import defaultStoryBg from "../Photo/sponsor2/sm2.jpg";
import PartnerGalaxy from "./PartnerGalaxy";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "../sections/home/Footer";
import MomentsMarquee from "../sections/home/MomentsMarquee";
import Cards from "../sections/home/Cards";

/* ========= New helpers (non-destructive additions) ========= */
const deriveDownloadName = (url: string | undefined | null, fallback = "download.bin") => {
    if (!url) return fallback;
    try {
        if (url.startsWith("data:")) {
            const m = url.match(/^data:([^;]+);/);
            const mime = (m?.[1] || "").toLowerCase();
            const ext =
                mime.includes("pdf") ? "pdf" :
                    mime.includes("png") ? "png" :
                        mime.includes("jpeg") ? "jpg" :
                            mime.includes("jpg") ? "jpg" :
                                mime.includes("webp") ? "webp" :
                                    mime.includes("svg") ? "svg" :
                                        "bin";
            const base = fallback.replace(/\.[^.]+$/, "");
            return `${base}.${ext}`;
        }
        const u = new URL(url, typeof window !== "undefined" ? window.location.href : "http://localhost");
        const leaf = u.pathname.split("/").pop() || fallback;
        return leaf;
    } catch {
        return fallback;
    }
};


/* =========================================================== */

type ImgOv = Partial<{
    defaultStoryBg: string;
    defaultStoryBg2: string;
    bgChallenge: string;
    bgLearning: string;
    bgMentor: string;
    bgCommunity: string;
    bgHero: string;
}>;

const readImgOv = (): ImgOv => {
    try {
        return JSON.parse(localStorage.getItem("btfImageOverrides") || "{}") || {};
    } catch {
        return {};
    }
};

const __OV = typeof window !== "undefined" ? readImgOv() : {};
const IMG = {
    defaultStoryBg: __OV.defaultStoryBg || defaultStoryBg,
    defaultStoryBg2: __OV.defaultStoryBg2 || defaultStoryBg2,
    bgChallenge: __OV.bgChallenge || bgChallenge,
    bgLearning: __OV.bgLearning || bgLearning,
    bgMentor: __OV.bgMentor || bgMentor,
    bgCommunity: __OV.bgCommunity || bgCommunity,
};

/* ======================= THEME ======================= */
const TOKENS = {
    green: "#007253", mint: "#3FB3A5", pale: "#C3EBCA", navy: "#283D5C",
    teal: "#26697D", gray: "#F1F1F1", black: "#000000", white: "#FFFFFF",
    lemon: "#F6F6B2", coral: "#FF8A80", violet: "#A78BFA", sky: "#60A5FA",
} as const;

type Tier = "platinum" | "gold" | "silver" | "supporter";
type Sponsor = { name: string; logo: string; url?: string; blurb?: string; tier?: Tier; points?: string[] };

/* ======================= COPY ======================= */
const VOICE = "community" as const;
const COPY = {
    community: {
        kicker: "Let’s build good things together",
        h1: "Help young scientists take their first big step.",
        sub: "We connect curious students with mentors and hands-on projects. If you care about access, education and opportunity, come co-create with us — talks, tours, challenges, or simply cheering from the sidelines.",
        why: "Moments that matter",
        whySub: "Highlights from recent programs — skills built, confidence grown, and mentors who made the difference.",
        ways: "Ways you can plug in",
    },
    academic: {
        kicker: "Collaboration, not sponsorship",
        h1: "Join a community growing the next wave of biotech talent.",
        sub: "BioTech Futures brings students, researchers and industry together to learn, build and share.",
        why: "What we’ve built together",
        whySub: "A few snapshots from recent cohorts.",
        ways: "Ways to collaborate",
    },
} as const;

/* ======================= DATA ======================= */
let LOCAL_SPONSORS: Sponsor[] = [];
try {
    const mods = import.meta.glob("../Photo/sponsors/*.{png,jpg,jpeg,webp,svg}", { eager: true }) as Record<string, { default: string }>;
    const metaMods = import.meta.glob("../Photo/sponsors/*.json", { eager: true }) as Record<string, { default: any }>;
    const META: Record<string, any> = {};
    for (const [, m] of Object.entries(metaMods)) {
        const data = (m as any).default;
        if (Array.isArray(data)) for (const entry of data) if (entry && (entry.file || entry.name)) META[entry.file || entry.name] = entry;
        else if (data && typeof data === "object") Object.assign(META, data);
    }
    LOCAL_SPONSORS = Object.entries(mods).map(([path, mod]) => {
        const file = path.split("/").pop() || ""; const base = file.replace(/\.[^.]+$/, "");
        const meta = META[file] || META[base] || {};
        const display = (meta.name || base).replace(/[-_]+/g, " ").trim() || "Sponsor";
        const tierRaw = String(meta.tier || meta.level || "").toLowerCase();
        const tier: Tier = (["platinum","gold","silver"] as Tier[]).includes(tierRaw as Tier)? (tierRaw as Tier) : "supporter";
        return { name: display, logo: (mod as any).default, url: meta.url || "#", blurb: meta.blurb || "", points: meta.points || [], tier };
    });
} catch {}

const BTF_SITE_SPONSORS: Sponsor[] = [
    {
        name: "The University of Sydney",
        logo: "https://static.wixstatic.com/media/26fc79_5577f5604a5d49849046eae842d71245~mv2.png/v1/fill/w_440,h_152,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/the-university-of-sydney-3-logo-png-transparent.png",
        url: "https://www.sydney.edu.au", blurb: "Top 50 worldwide with research excellence and student impact.", tier: "platinum",
    },
    {
        name: "ARCCMIT",
        logo: "https://static.wixstatic.com/media/26fc79_0e45f0d013fa4be79428dc5d9782d578~mv2.jpg/v1/fill/w_213,h_191,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/arccmit.jpg",
        url: "#", blurb: "Industry partner & supporter.", tier: "supporter",
    },
    {
        name: "MBSI",
        logo: "https://static.wixstatic.com/media/26fc79_db094785172d433ebb10e5f6a6bebcc8~mv2.png/v1/fill/w_290,h_146,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/mbsilogo.png",
        url: "#", blurb: "Industry partner & supporter.", tier: "supporter",
    },
    {
        name: "Queensland University of Technology",
        logo: "https://static.wixstatic.com/media/26fc79_383daf459d7d48428bdd6b62cc62da4a~mv2.jpeg/v1/fill/w_295,h_166,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Queensland-University-of-Technology-logo.jpeg",
        url: "https://www.qut.edu.au", blurb: "Industry partner & supporter.", tier: "supporter",
    },
];

const DEV_TEST_SPONSORS: Sponsor[] = [
    { name: "Test Platinum", logo: "/vite.svg", url: "#", blurb: "Developer test sponsor (platinum).", tier: "platinum" },
    { name: "Test Gold", logo: "/vite.svg", url: "#", blurb: "Developer test sponsor (gold).", tier: "gold" },
    { name: "Test Silver", logo: "/vite.svg", url: "#", blurb: "Developer test sponsor (silver).", tier: "silver" },
];

/* ======================= UI HELPERS ======================= */
const Section = ({ className = "", children }: React.PropsWithChildren<{ className?: string }>) => (
    <section className={`w-full max-w-7xl mx-auto px-6 ${className}`}>{children}</section>
);

function Colorfield() {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden">
            <div
                className="absolute inset-0"
                style={{
                    background: `radial-gradient(1200px 800px at 10% 20%, ${TOKENS.mint}1f, transparent),
                       radial-gradient(1000px 700px at 90% 10%, ${TOKENS.violet}1a, transparent),
                       radial-gradient(900px 600px at 20% 90%, ${TOKENS.sky}1a, transparent),
                       radial-gradient(900px 600px at 80% 80%, ${TOKENS.coral}14, transparent),
                       conic-gradient(from 180deg at 50% 50%, ${TOKENS.lemon}0d, ${TOKENS.white}00 25%, ${TOKENS.mint}0d 50%, ${TOKENS.violet}0d 75%, ${TOKENS.lemon}0d)`,
                }}
            />
            <div
                className="absolute inset-0"
                style={{ background: `radial-gradient(800px 800px at 50% 0%, ${TOKENS.white}d9, ${TOKENS.white}bb, transparent)` }}
            />
        </div>
    );
}

function MouseHalo() {
    const [pos, setPos] = React.useState({ x: 0, y: 0 });
    React.useEffect(() => { const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY }); window.addEventListener("mousemove", onMove); return () => window.removeEventListener("mousemove", onMove); }, []);
    return (
        <div className="pointer-events-none absolute inset-0 -z-10"
             style={{ background: `radial-gradient(180px 180px at ${pos.x}px ${pos.y}px, ${TOKENS.lemon}44, transparent 70%)` }} />
    );
}



/* ----------------------- StoryCard ----------------------- */

function LogoMarquee({ items }: { items?: Sponsor[] }) {
    const list = items ?? []; if (!list.length) return null;
    return (
        <div className="relative overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-10"  style={{ background:`linear-gradient(to right, ${TOKENS.white}, transparent)` }} />
            <div className="absolute inset-y-0 right-0 w-10" style={{ background:`linear-gradient(to left, ${TOKENS.white}, transparent)` }} />
            <div className="flex gap-12 animate-[carousel_28s_linear_infinite]" style={{ width:"max-content" }}>
                {[...list, ...list].map((s, i) => (<img key={i} src={s.logo} alt={s.name} className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition" />))}
            </div>
            <style>{`@keyframes carousel{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
        </div>
    );
}

function Counter({ to = 1000, duration = 1.2 }: { to: number | string; duration?: number }) {
    const n = typeof to === "number" ? to : parseFloat(String(to).replace(/\D/g, "")) || 0;
    const mv = useMotionValue(0); const [val, setVal] = React.useState("0");
    useAnimationFrame((t) => { const p = Math.min(1, t / (duration * 1000)); mv.set(p * n); const v = Math.round(mv.get()); setVal(String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ",")); });
    return <span>{val}{typeof to === "string" && /\D$/.test(to as string) ? (to as string).replace(/^[\d,]+/, "") : ""}</span>;
}


/* ======================= ImpactStatsFX (animated stats only) ======================= */
function ImpactStats() {
    const stats = [
        { icon: Users,        label: "Students", value: 10000, note: "engaged across Australia & NZ" },
        { icon: Microscope,   label: "Projects", value: 500,   note: "student research & prototypes" },
        { icon: GraduationCap,label: "Mentors",  value: 300,   note: "academics & industry experts" },
    ];

    const parent = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.12, delayChildren: 0.05 },
        },
    };

    const child = {
        hidden: { y: 18, rotate: -0.6, opacity: 0 },
        show:   { y: 0,  rotate: 0,    opacity: 1, transition: { type: "spring", stiffness: 280, damping: 22 } },
    };

    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={parent}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-10% 0px" }}
        >
            {stats.map((it, i) => {
                const Icon = it.icon;
                return (
                    <motion.div
                        key={i}
                        variants={child}
                        whileHover={{ y: -6, rotate: 0.2, scale: 1.01 }}
                        whileTap={{ scale: 0.995 }}
                        className="relative overflow-hidden rounded-2xl"
                        style={{ border: `1px solid ${TOKENS.green}33`, background: TOKENS.white }}
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div
                                className="absolute -top-16 -left-16 w-64 h-64 rounded-[40%] opacity-20 blur-2xl animate-blob"
                                style={{ background: TOKENS.pale }}
                            />
                            <div
                                className="absolute -bottom-16 -right-10 w-72 h-72 rounded-[45%] opacity-20 blur-2xl animate-blob2"
                                style={{ background: TOKENS.mint }}
                            />
                            <div
                                className="absolute inset-0 opacity-[.06]"
                                style={{
                                    backgroundImage: `radial-gradient(${TOKENS.black} 0.8px, transparent 0.8px)`,
                                    backgroundSize: "14px 14px",
                                }}
                            />
                        </div>

                        <motion.div
                            className="absolute inset-0 pointer-events-none mix-blend-soft-light"
                            initial={{ x: "-120%" }}
                            whileHover={{ x: "120%" }}
                            transition={{ duration: 1.2, ease: "easeInOut" }}
                            style={{
                                background:
                                    "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                            }}
                        />

                        <div className="relative p-6 md:p-8">
                            <div className="flex items-center gap-3">
                                <motion.span
                                    initial={false}
                                    whileHover={{ y: -2, scale: 1.06 }}
                                    transition={{ type: "spring", stiffness: 350, damping: 14 }}
                                >
                                    <Icon size={22} style={{ color: TOKENS.green }} />
                                </motion.span>
                                <span className="text-xl font-medium" style={{ color: "#000" }}>
                  {it.label}
                </span>
                            </div>

                            <div className="mt-4 flex items-center gap-4">
                                <div className="relative h-16 w-16">
                                    <svg className="absolute inset-0" viewBox="0 0 44 44">
                                        <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(0,0,0,.08)" strokeWidth="3" />
                                        <circle
                                            cx="22" cy="22" r="20" fill="none" stroke={TOKENS.mint} strokeWidth="3"
                                            strokeDasharray="5 125" strokeLinecap="round"
                                            className="animate-orbit"
                                        />
                                    </svg>
                                    <div
                                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full animate-breath"
                                        style={{ background: TOKENS.green }}
                                    />
                                </div>

                                <div>
                                    <div
                                        className="text-4xl md:text-5xl font-semibold tabular-nums leading-[1.12]"
                                        style={{ color: TOKENS.green }}
                                    >
                                        <Counter to={it.value} duration={3.2} />
                                    </div>
                                    <p className="mt-1 text-base" style={{ color: "rgba(0,0,0,0.70)" }}>
                                        {it.note}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            className="absolute left-0 right-0 bottom-0 h-[3px]"
                            style={{ background: `linear-gradient(90deg, ${TOKENS.green}, ${TOKENS.mint})` }}
                            initial={{ opacity: 0.6 }}
                            whileHover={{ opacity: 1 }}
                        />

                        <style>{`
              @keyframes blob {
                0%   { transform: translate(0,0) scale(1);   border-radius: 45% 55% 48% 52% / 42% 50% 50% 58%; }
                50%  { transform: translate(6px, -4px) scale(1.05); border-radius: 55% 45% 52% 48% / 50% 42% 58% 50%; }
                100% { transform: translate(0,0) scale(1);   border-radius: 45% 55% 48% 52% / 42% 50% 50% 58%; }
              }
              @keyframes blob2 {
                0%   { transform: translate(0,0) scale(1); }
                50%  { transform: translate(-6px, 6px) scale(1.06); }
                100% { transform: translate(0,0) scale(1); }
              }
              @keyframes orbit {
                0%   { stroke-dashoffset: 0; }
                100% { stroke-dashoffset: -130; }
              }
              @keyframes breath {
                0%, 100% { transform: translate(-50%, -50%) scale(0.92); opacity: .85; }
                50%      { transform: translate(-50%, -50%) scale(1.08); opacity: 1; }
              }
              .animate-blob  { animation: blob 8s ease-in-out infinite; }
              .animate-blob2 { animation: blob2 10s ease-in-out infinite; }
              .animate-orbit { animation: orbit 5s linear infinite; transform-origin: center; }
              .animate-breath{ animation: breath 2.6s ease-in-out infinite; }
            `}</style>
                    </motion.div>
                );
            })}
        </motion.div>
    );
}

type WayProps = {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    title: string; desc: string; bullets?: string[]; href?: string; bg?: string;
};
function Way({ icon: Icon, title, desc, bullets = [], href, bg }: WayProps) {
    const [hovered, setHovered] = React.useState(false);
    const PAD_CLASS   = "p-4 md:p-5";
    const TITLE_CLASS = "text-xl md:text-2xl";
    const DESC_CLASS  = "text-[15px] md:text-[15px]";
    const LIST_CLASS  = "text-[15px] md:text-[15px]";
    const LIST_GAP    = "space-y-1";
    const ICON_SIZE   = 18;
    const IMG_MIN_H   = "min-h-[5px] md:min-h-[15px]";

    const LEFT_PANEL_GRAD =
        "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.96) 42%," +
        "rgba(255,255,255,0.86) 54%, rgba(255,255,255,0.46) 74%, rgba(255,255,255,0.14) 100%)";

    const fallback = `linear-gradient(135deg, ${TOKENS.pale} 0%, ${TOKENS.mint}33 60%, ${TOKENS.white} 100%)`;

    return (
        <motion.a
            href={href}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.995 }}
            className="relative block rounded-2xl overflow-hidden"
            style={{ border:`1px solid ${TOKENS.green}33`, background:TOKENS.white }}
        >
            {bg ? (
                <motion.img src={bg} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover"
                            initial={{ scale: 1, filter: "saturate(0.95) brightness(0.98)" }}
                            animate={{ scale: hovered ? 1.06 : 1 }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ willChange:"transform" }} />
            ) : (<div className="absolute inset-0" style={{ background:fallback }} />)}

            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: LEFT_PANEL_GRAD, backdropFilter:"blur(6px)", WebkitBackdropFilter:"blur(6px)" }} />

            <motion.div className="absolute inset-0 pointer-events-none mix-blend-soft-light"
                        initial={{ x:"-120%" }} animate={{ x: hovered ? "120%" : "-120%" }}
                        transition={{ duration: 1.2, ease:"easeInOut" }}
                        style={{ background:"linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)" }} />

            <motion.div className="absolute inset-0 rounded-2xl pointer-events-none" initial={false}
                        animate={{ boxShadow: hovered ? `0 0 0 2px ${TOKENS.green}66 inset, 0 10px 22px rgba(0,0,0,.10)` : `0 0 0 0 ${TOKENS.green}00 inset, 0 0 0 rgba(0,0,0,0)` }}
                        transition={{ type:"spring", stiffness:260, damping:22 }} />

            <div className={`relative ${PAD_CLASS}`}>
                <div className="flex items-center gap-3">
                    <motion.span animate={{ scale: hovered ? 1.06 : 1, rotate: hovered ? 3 : 0 }}
                                 transition={{ type:"spring", stiffness:350, damping:12 }}>
                        <Icon size={ICON_SIZE} color={TOKENS.green} />
                    </motion.span>
                    <h4 className={`${TITLE_CLASS} font-semibold leading-[1.15]`} style={{ color:TOKENS.green }}>{title}</h4>
                </div>
                <p className={`mt-2 ${DESC_CLASS}`} style={{ color:"#000" }}>{desc}</p>
                {!!bullets.length && (
                    <ul className={`mt-3 ${LIST_GAP} ${LIST_CLASS}`} style={{ color:"#000" }}>
                        {bullets.map((b, i) => (
                            <motion.li key={i} className="flex items-start gap-2" initial={false}
                                       animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.92 }}
                                       transition={{ delay: i * 0.02 }}>
                                <span className="mt-[7px] inline-block h-1.5 w-1.5 rounded-full" style={{ background:TOKENS.green }} />
                                <span>{b}</span>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </div>

            <div className={`relative ${IMG_MIN_H}`}>
                {bg ? <span className="absolute inset-0" /> :
                    <div className="absolute inset-0" style={{ background:`linear-gradient(135deg, ${TOKENS.pale}, ${TOKENS.mint})` }} />}
            </div>
        </motion.a>
    );
}

/* ======================= Showcase / GentleCTA ======================= */

function GentleCTA() {
    return (
        <motion.div className="rounded-2xl border md:p-10 p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
                    style={{ borderColor:`${TOKENS.green}33`, background:TOKENS.white }} whileHover={{ y:-3 }}>
            <div className="flex-1">
                <h3 className="mt-3 text-2xl md:text-4xl font-semibold" style={{ color:TOKENS.green }}>
                    Curious about partnering with us?
                </h3>
                <p className="mt-2" style={{ color:`${TOKENS.green}B3` }}>
                    We’re happy to share examples, timelines and past activations. No pressure — just a conversation.
                </p>
            </div>
            <a href="mailto:biotechfutures@sydney.edu.au?subject=Partnership%20chat"
               className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
               style={{ background:TOKENS.green, color:TOKENS.white }}>
                Start a conversation <ArrowRight size={16}/>
            </a>
        </motion.div>
    );
}

type Story = {
    title: string;
    subtitle?: string;
    cta?: string;
    img: string;
    href?: string;
};

function StoriesRow({
                        items,
                        exploreHref = "/stories",
                        exploreText = "Explore more →",
                    }: {
    items: Story[];
    exploreHref?: string;
    exploreText?: string;
}) {
    const two = items.slice(0, 2);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {two.map((s, i) => (
                <motion.a
                    key={i}
                    href={s.href || "#"}
                    className="group relative overflow-hidden rounded-[24px] block will-change-transform"
                    style={{ height: "clamp(220px, 38vh, 360px)" }}
                    initial={false}
                    whileHover={{ y: -6, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    <motion.img
                        src={s.img}
                        alt={s.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,.12) 45%, rgba(0,0,0,0) 66%), linear-gradient(0deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 40%)",
                        }}
                    />
                    <motion.div
                        className="absolute inset-0 pointer-events-none mix-blend-soft-light"
                        initial={{ x: "-120%" }}
                        whileHover={{ x: "120%" }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        style={{
                            background:
                                "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
                        }}
                    />
                    <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
                        <div className="max-w-[85%]">
                            <h3 className="text-white/95 text-[32px] sm:text-[40px] font-semibold leading-tight">
                                {s.title}
                            </h3>
                            {s.subtitle && (
                                <p className="mt-1 text-white/85 text-sm sm:text-base">
                                    {s.subtitle}
                                </p>
                            )}
                            <span className="mt-3 inline-block text-white text-sm sm:text-base underline underline-offset-4 decoration-white/70">
                {s.cta || "Explore story"}
              </span>
                        </div>
                    </div>
                    <motion.div
                        className="absolute inset-0 rounded-[24px] pointer-events-none"
                        style={{ boxShadow: "0 8px 40px rgba(0,0,0,.22) inset" }}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-[24px] pointer-events-none"
                        animate={{ boxShadow: "0 0 0 2px rgba(0,114,83,.22) inset" }}
                        transition={{ duration: 0.4 }}
                    />
                </motion.a>
            ))}

            <motion.a
                href={exploreHref}
                className="relative rounded-[24px] border grid place-items-center textcenter px-6 overflow-hidden"
                style={{
                    height: "clamp(220px, 38vh, 360px)",
                    borderColor: "rgba(0,0,0,.08)",
                    background:
                        "linear-gradient(135deg, rgba(195,235,202,0.20), rgba(63,179,165,0.10))",
                }}
                initial={false}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                <div
                    className="absolute inset-0 opacity-[.06] pointer-events-none"
                    style={{
                        backgroundImage:
                            "radial-gradient(#000 0.8px, transparent 0.8px), radial-gradient(#000 0.8px, transparent 0.8px)",
                        backgroundSize: "14px 14px, 22px 22px",
                        backgroundPosition: "0 0, 7px 7px",
                    }}
                />

                <div className="relative z-[1]">
                    <motion.div
                        className="mx-auto mb-4 h-14 w-14 rounded-full grid place-items-center shadow-[0_8px_18px_rgba(0,0,0,.10)]"
                        style={{
                            background: "#FFFFFF",
                            border: "2px solid rgba(0,0,0,.10)",
                        }}
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.06 }}
                        transition={{ type: "spring", stiffness: 320, damping: 18 }}
                    >
                        <motion.span
                            className="text-[18px] leading-none"
                            style={{ color: "#000" }}
                            initial={{ x: 0 }}
                            whileHover={{ x: 4 }}
                            transition={{ type: "spring", stiffness: 320, damping: 18 }}
                        >
                            &gt;
                        </motion.span>
                    </motion.div>

                    <div
                        className="text-lg sm:text-xl font-semibold"
                        style={{ color: "#007253" }}
                    >
                        {exploreText}
                    </div>
                    <div className="mt-1 text-sm opacity-70" style={{ color: "#000" }}>
                        See all stories
                    </div>
                </div>

                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[58%] rounded-full pointer-events-none"
                    style={{
                        width: 96,
                        height: 96,
                        background:
                            "radial-gradient(circle, rgba(255,255,255,.85) 0%, rgba(255,255,255,.35) 45%, rgba(255,255,255,0) 60%)",
                        animation: "pulseRing 2.2s ease-in-out infinite",
                    }}
                />

                <div
                    className="absolute inset-0 rounded-[24px] pointer-events-none"
                    style={{ boxShadow: "0 0 0 2px rgba(0,114,83,.10) inset" }}
                />

                <motion.div
                    className="absolute inset-0 pointer-events-none mix-blend-soft-light"
                    initial={{ x: "-120%" }}
                    whileHover={{ x: "120%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                    style={{
                        background:
                            "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)",
                    }}
                />

                <style>{`
          @keyframes pulseRing {
            0%   { transform: translate(-50%, -58%) scale(0.92); opacity: .55; }
            50%  { transform: translate(-50%, -58%) scale(1.06); opacity: .35; }
            100% { transform: translate(-50%, -58%) scale(0.92); opacity: .55; }
          }
        `}</style>
            </motion.a>
        </div>
    );
}


/* ======================= DEV CHECKS ======================= */
const countByTier = (items: Sponsor[] = []) => items.reduce<Record<string, number>>((acc, s) => {
    acc[s.tier ?? "supporter"] = (acc[s.tier ?? "supporter"] || 0) + 1; return acc;
}, {});
function runDevTests() {
    if (import.meta?.env?.DEV) {
        try { const counts = countByTier(BTF_SITE_SPONSORS); console.assert(counts, "Counts exist"); }
        catch (e) { console.warn("SponsorsLanding dev checks failed", e); }
    }
}
runDevTests();

/* ======================= PAGE ======================= */
export default function Sponsor({ items }: { items?: Sponsor[] }) {
    let sponsors: Sponsor[] = items && items.length ? items : LOCAL_SPONSORS;
    if (!sponsors || sponsors.length === 0) sponsors = BTF_SITE_SPONSORS;
    if ((!sponsors || sponsors.length === 0) && import.meta?.env?.DEV) sponsors = DEV_TEST_SPONSORS;
    const c = COPY[VOICE];

    // ===== Admin & overrides (Sponsor) =====
    const ls = typeof window !== "undefined" ? window.localStorage : undefined
    const ss = typeof window !== "undefined" ? window.sessionStorage : undefined

    const [admin, setAdmin] = React.useState<boolean>(() => ss?.getItem("btf.admin") === "true")
    const [showLogin, setShowLogin] = React.useState(false)
    const [pwd, setPwd] = React.useState("")
    const [, forceRerender] = React.useState(0)

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
                setShowLogin(true)
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    const doLogin = React.useCallback(() => {
        const expected = (import.meta as any).env?.VITE_ADMIN_PASSWORD || "biotech"
        if (pwd === expected) {
            setAdmin(true)
            try { ss?.setItem("btf.admin", "true") } catch {}
            setShowLogin(false)
            setPwd("")
        } else {
            alert("Incorrect password")
        }
    }, [pwd, ss])

    // helpers
    const toDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const fr = new FileReader()
            fr.onload = () => resolve(String(fr.result || ""))
            fr.onerror = reject
            fr.readAsDataURL(file)
        })

    const getJson = (k: string) => { try { return JSON.parse(ls?.getItem(k) || "{}") } catch { return {} } }
    const setJson = (k: string, v: any) => { try { ls?.setItem(k, JSON.stringify(v)) } catch {} }

    // image overrides
    type ImgKey = "bgHero" | "bgMentor" | "bgCommunity" | "bgLearning"
    const setImgOverride = async (key: ImgKey, files: FileList | null) => {
        const f = files?.[0]; if (!f) return
        const data = await toDataUrl(f)
        const next = { ...getJson("btfImageOverrides"), [key]: data }
        setJson("btfImageOverrides", next)
        forceRerender(Math.random())
    }
    const resetImgOverride = (key: ImgKey) => {
        const next = { ...getJson("btfImageOverrides") }
        delete next[key]
        setJson("btfImageOverrides", next)
        forceRerender(Math.random())
    }

    // sponsor kit / poster
    const defaultKit = "/files/BTF-Sponsor-Kit.pdf"
    const [kitUrl, setKitUrl] = React.useState<string>(() => ls?.getItem("btf.sponsor.kit") || defaultKit)
    const [posterUrl, setPosterUrl] = React.useState<string>(() => ls?.getItem("btf.sponsor.poster") || "")

    const pickKit = async (files: FileList | null) => {
        const f = files?.[0]; if (!f) return
        const data = await toDataUrl(f)
        try { ls?.setItem("btf.sponsor.kit", data) } catch {}
        setKitUrl(data)
    }
    const resetKit = () => {
        try { ls?.removeItem("btf.sponsor.kit") } catch {}
        setKitUrl(defaultKit)
    }



    // ---- text overrides (new) ----
    const TEXT_KEY = "btf.sponsor.text";
    const readText = () => { try { return JSON.parse(ls?.getItem(TEXT_KEY) || "{}") || {}; } catch { return {}; } };
    const writeText = (m: Record<string, string>) => { try { ls?.setItem(TEXT_KEY, JSON.stringify(m)); } catch {} };

    const textGet = (id: string, fallback: string) => (readText()[id] ?? fallback);
    const textSet = (id: string, v: string) => { const m = readText(); m[id] = v; writeText(m); forceRerender(Math.random()); };
    const textReset = (id: string) => { const m = readText(); delete m[id]; writeText(m); forceRerender(Math.random()); };
    const textResetAll = () => { try { ls?.removeItem(TEXT_KEY); } catch {}; forceRerender(Math.random()); };

    const [inlineEdit, setInlineEdit] = React.useState<boolean>(() => ss?.getItem("btf.inlineEdit") === "true");
    const toggleInline = () => {
        setInlineEdit(v => {
            const nv = !v;
            try { ss?.setItem("btf.inlineEdit", String(nv)); } catch {}
            return nv;
        });
    };

    // small inline editable component (scoped here, no deletions of existing DOM; we just render text through Editable)
    function Editable({
                          id, defaultText, as = "span", className, style
                      }: { id: string; defaultText: string; as?: keyof JSX.IntrinsicElements; className?: string; style?: React.CSSProperties }) {
        const Tag = as as any;
        const canEdit = admin && inlineEdit;
        const val = textGet(id, defaultText);
        return (
            <Tag
                contentEditable={canEdit}
                suppressContentEditableWarning
                data-editable-id={id}
                className={className}
                style={style}
                onBlur={(e: React.FocusEvent<HTMLElement>) => {
                    const t = (e.currentTarget.innerText || "").replace(/\s+/g, " ").trim();
                    textSet(id, t);
                }}
            >
                {val}
            </Tag>
        );
    }

    // ---- effective images (read on every render so admin uploads apply immediately) ----
    const ov: ImgOv = getJson("btfImageOverrides")
    const heroBg      = ov.bgHero      || defaultStoryBg
    const learningBg  = ov.bgLearning  || bgLearning
    const mentorBg    = ov.bgMentor    || bgMentor
    const communityBg = ov.bgCommunity || bgCommunity

    // pre-compute filenames for download attribute
    const kitDownloadName = React.useMemo(
        () => deriveDownloadName(kitUrl || defaultKit, "BTF-Sponsor-Kit.pdf"),
        [kitUrl]
    );
    const posterDownloadName = React.useMemo(
        () => deriveDownloadName(posterUrl, "BTF-Poster.pdf"),
        [posterUrl]
    );

    // admin panel field registry (text)
    const TEXT_FIELDS: Array<{ id: string; label: string; def: string }> = [
        { id: "hero.kicker",  label: "Hero kicker",  def: c.kicker },
        { id: "hero.h1",      label: "Hero title (H1)", def: c.h1 },
        { id: "hero.sub",     label: "Hero subtitle",   def: c.sub },
        { id: "moments.h",    label: "Moments heading", def: c.why },
        { id: "moments.sub",  label: "Moments subheading", def: c.whySub },
        { id: "stories.h",    label: "Stories heading", def: "Program stories" },
        { id: "stories.sub",  label: "Stories subheading", def: "Snapshots from recent cohorts—projects built, mentors who made a difference, and moments that sparked curiosity." },
        { id: "ways.h",       label: "Ways heading", def: COPY[VOICE].ways || "Ways you can plug in" },
        { id: "ways.sub",     label: "Ways subheading", def: "Pick what fits you best—mentor a team, host a workshop, offer a lab tour, or back a student challenge." },
        { id: "way.mentor.title",   label: "Card: Become a mentor (title)", def: "Become a mentor" },
        { id: "way.mentor.desc",    label: "Card: Become a mentor (desc)",  def: "Guide a student team for 4–8 weeks with weekly check-ins." },
        { id: "way.workshop.title", label: "Card: Host a workshop (title)", def: "Host a workshop" },
        { id: "way.workshop.desc",  label: "Card: Host a workshop (desc)",  def: "Share a toolkit or hands-on exercise with curious students." },
        { id: "way.tour.title",     label: "Card: Offer a lab or site tour (title)", def: "Offer a lab or site tour" },
        { id: "way.tour.desc",      label: "Card: Offer a lab or site tour (desc)",  def: "Open the doors—show students what real-world science looks like." },
        { id: "way.challenge.title",label: "Card: Sponsor a challenge (title)", def: "Sponsor a challenge" },
        { id: "way.challenge.desc", label: "Card: Sponsor a challenge (desc)",  def: "Set a brief, be a judge, and help us cover kits & venues." },
        { id: "tiers.h",      label: "Tiers heading", def: "Our sponsorship tiers" },
        { id: "tiers.sub",    label: "Tiers subheading", def: "From Platinum to Supporter, each tier helps us open doors for curious students with mentors, lab time and real projects. Explore the galaxy to see where each partner sits." },
        { id: "btn.kit",      label: "Button: Download sponsor kit", def: "Download sponsor kit" },
        { id: "btn.poster.view",     label: "Button: View poster", def: "View poster" },
        { id: "btn.poster.download", label: "Button: Download poster", def: "Download poster" },
    ];

    return (
        <div className="h-dvh w-full text-black relative overflow-y-auto no-scrollbar" style={{ background:TOKENS.white }}>
            <style>{`
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar { width: 0; height: 0; display: none; }
        .no-scrollbar::-webkit-scrollbar-thumb { background-color: transparent; }
        ${inlineEdit ? `
          [contenteditable="true"]{
            outline: 1px dashed #017151;
            outline-offset: 2px;
            cursor: text;
          }
          [contenteditable="true"]:focus{
            background: rgba(1,113,81,0.06);
          }
        `:``}
      `}</style>

            <Colorfield />
            <MouseHalo />
            <MainNav />

            {/* ===== Hero header (uses heroBg override) ===== */}
            <header className="relative overflow-hidden"
                    style={{ backgroundImage:`radial-gradient(900px 600px at 18% 42%, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.78) 50%, rgba(255,255,255,0.28) 70%, rgba(255,255,255,0.00) 100%), url(${heroBg})`, backgroundSize:"auto, cover", backgroundPosition:"left top, center", backgroundRepeat:"no-repeat, no-repeat" }}>
                <Section className="py-20 md:py-28 relative z-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                             style={{ background:TOKENS.green, color:TOKENS.white }}>
                            <Handshake size={14}/>
                            <Editable id="hero.kicker" defaultText={c.kicker} as="span" />
                        </div>
                        <Editable
                            id="hero.h1"
                            defaultText={c.h1}
                            as="h1"
                            className="mt-4 font-semibold tracking-tight"
                            style={{ color:TOKENS.green, fontSize:"clamp(40px, 6vw, 70px)" }}
                        />
                        <Editable
                            id="hero.sub"
                            defaultText={c.sub}
                            as="p"
                            className="mt-4 text-base md:text-lg"
                            style={{ color:"rgba(0,0,0,0.80)" }}
                        />
                    </div>
                </Section>
                <div className="absolute left-0 right-0 bottom-[-2px] pointer-events-none">
                    <svg viewBox="0 0 1440 90" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-[84px] block">
                        <path d="M0,40 C240,90 480,-10 720,40 C960,90 1200,0 1440,30 L1440,90 L0,90 Z" fill="#FFFFFF"/>
                    </svg>
                </div>
            </header>

            <Section className="py-6 md:py-8"><LogoMarquee items={sponsors} /></Section>

            <main>
                {/* ===== Moments / stats (uses learningBg override) ===== */}
                <section className="relative">
                    <img
                        src={learningBg}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.86) 40%, rgba(255,255,255,0.80) 100%)",
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            WebkitMaskImage:
                                "radial-gradient(1200px 600px at 50% 10%, black 65%, transparent 100%)",
                            maskImage:
                                "radial-gradient(1200px 600px at 50% 10%, black 65%, transparent 100%)",
                            background: "white",
                            opacity: 0.0,
                        }}
                    />

                    <Section className="py-14 md:py-20 relative z-10">
                        <motion.h3 className="text-2xl md:text-5xl font-semibold" style={{ color: TOKENS.green }}
                                   initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
                            <Editable id="moments.h" defaultText={c.why} as="span" />
                        </motion.h3>
                        <motion.p className="mt-2 max-w-3xl" style={{ color:"#000000" }}
                                  initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
                            <Editable id="moments.sub" defaultText={c.whySub} as="span" />
                        </motion.p>
                        <div className="mt-6">
                            <ImpactStats />
                        </div>
                    </Section>
                </section>

                {/* ===== Program stories ===== */}
                <Section className="py-10 md:py-14">
                    <h3 className="text-2xl md:text-5xl font-semibold" style={{ color: TOKENS.green }}>
                        <Editable id="stories.h" defaultText="Program stories" as="span" />
                    </h3>
                    <p className="mt-2 max-w-2xl" style={{ color: "rgba(0,0,0,0.78)" }}>
                        <Editable id="stories.sub" defaultText="Snapshots from recent cohorts—projects built, mentors who made a difference, and moments that sparked curiosity." as="span" />
                    </p>

                    <div className="mt-6">
                        <StoriesRow
                            items={[
                                {
                                    title: "Student",
                                    subtitle: "From idea to prototype in 8 weeks",
                                    cta: "Explore story",
                                    img: defaultStoryBg2,
                                    href: "#",
                                },
                                {
                                    title: "Mentor",
                                    subtitle: "Mentor moments that matter",
                                    cta: "Explore story",
                                    img: defaultStoryBg,
                                    href: "#",
                                },
                            ]}
                            exploreHref="/stories"
                            exploreText="Explore more →"
                        />
                    </div>
                </Section>

                {/* ===== Ways you can plug in (uses mentor/community overrides where applicable) ===== */}
                <Section className="py-10 md:py-14">
                    <h3 className="text-2xl md:text-5xl font-semibold" style={{ color: TOKENS.green }}>
                        <Editable id="ways.h" defaultText={COPY[VOICE].ways || "Ways you can plug in"} as="span" />
                    </h3>
                    <p className="mt-2 max-w-2xl" style={{ color: "rgba(0,0,0,0.78)" }}>
                        <Editable id="ways.sub" defaultText="Pick what fits you best—mentor a team, host a workshop, offer a lab tour, or back a student challenge." as="span" />
                    </p>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Way
                            icon={Handshake}
                            title={textGet("way.mentor.title", "Become a mentor")}
                            desc={textGet("way.mentor.desc", "Guide a student team for 4–8 weeks with weekly check-ins.")}
                            bullets={["1–2 hrs/week", "Online or in-person", "Support from our team"]}
                            href="#mentor"
                            bg={mentorBg}
                        />
                        <Way
                            icon={BookOpen}
                            title={textGet("way.workshop.title", "Host a workshop")}
                            desc={textGet("way.workshop.desc", "Share a toolkit or hands-on exercise with curious students.")}
                            bullets={["60–90 mins", "Templates provided", "You pick the topic"]}
                            href="#workshop"
                            bg={learningBg}
                        />
                        <Way
                            icon={Building2}
                            title={textGet("way.tour.title", "Offer a lab or site tour")}
                            desc={textGet("way.tour.desc", "Open the doors—show students what real-world science looks like.")}
                            bullets={["Small groups", "Teacher accompanied", "Media-safe guidance"]}
                            href="#tour"
                            bg={communityBg}
                        />
                        <Way
                            icon={FlaskConical}
                            title={textGet("way.challenge.title", "Sponsor a challenge")}
                            desc={textGet("way.challenge.desc", "Set a brief, be a judge, and help us cover kits & venues.")}
                            bullets={["Custom brief", "Judging day", "Impact report"]}
                            href="#sponsor"
                            bg={IMG.bgChallenge}
                        />
                    </div>
                </Section>

                {/* ===== Sponsorship tiers header ===== */}
                <Section className="pt-6 md:pt-8 pb-2 md:pb-3">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                        <div className="max-w-2xl">
                            <h3 className="text-3xl md:text-5xl font-semibold tracking-tight" style={{ color: TOKENS.green }}>
                                <Editable id="tiers.h" defaultText="Our sponsorship tiers" as="span" />
                            </h3>
                            <p className="mt-2 text-base md:text-lg" style={{ color: "rgba(0,0,0,0.78)" }}>
                                <Editable id="tiers.sub" defaultText="From Platinum to Supporter, each tier helps us open doors for curious students with mentors, lab time and real projects. Explore the galaxy to see where each partner sits." as="span" />
                            </p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            <a
                                href={kitUrl || defaultKit}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={kitDownloadName}
                                className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition"
                                style={{ background: TOKENS.green, color: TOKENS.white, boxShadow: "0 8px 18px rgba(0, 114, 83, 0.18)" }}
                            >
                                <Editable id="btn.kit" defaultText="Download sponsor kit" as="span" /> <ArrowRight size={16} />
                            </a>

                            {posterUrl && (
                                <>
                                    <a
                                        href={posterUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
                                        style={{ border: `1px solid ${TOKENS.green}33`, background: TOKENS.white, color: TOKENS.green }}
                                    >
                                        <Editable id="btn.poster.view" defaultText="View poster" as="span" /> <ArrowRight size={16} />
                                    </a>
                                    <a
                                        href={posterUrl}
                                        download={posterDownloadName}
                                        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
                                        style={{ border: `1px solid ${TOKENS.green}33`, background: TOKENS.white, color: TOKENS.green }}
                                    >
                                        <Editable id="btn.poster.download" defaultText="Download poster" as="span" /> <ArrowRight size={16} />
                                    </a>
                                </>
                            )}
                        </div>
                    </div>
                </Section>

                {/* ===== Partner Galaxy ===== */}
                <Section className="-mt-2 md:-mt-3 pt-4 md:pt-6 pb-10 md:pb-14">
                    <PartnerGalaxy items={sponsors} bgImage={IMG.bgChallenge} bgOpacity={0.6} />
                </Section>

                <Section className="py-8 md:py-16">
                    <GentleCTA />
                </Section>
            </main>

            <Cards />
            <MomentsMarquee />

            {/* ---- Hidden trigger dot ---- */}
            <button
                onClick={() => setShowLogin(true)}
                aria-label="Open sponsor admin"
                title="Sponsor Admin"
                style={{
                    position: "fixed",
                    right: 10,
                    bottom: 42,
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    border: 0,
                    background: "#017151",
                    opacity: 0.12,
                    cursor: "pointer",
                    zIndex: 1000,
                }}
            />

            {/* ---- Login modal ---- */}
            {showLogin && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "grid", placeItems: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: 16, width: 360, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                        <h3 style={{ marginBottom: 10, color: "#017151" }}>Sponsor Admin Login</h3>
                        <input
                            type="password"
                            value={pwd}
                            onChange={(e)=>setPwd(e.target.value)}
                            placeholder="Enter password"
                            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
                        />
                        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
                            <button onClick={()=>{ setShowLogin(false); setPwd(""); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Cancel</button>
                            <button onClick={doLogin} style={{ padding: "8px 12px", borderRadius: 8, border: 0, background: "#017151", color: "#fff", cursor: "pointer" }}>Login</button>
                        </div>
                        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>Hint: Press Ctrl/⌘ + Shift + S</div>
                    </div>
                </div>
            )}

            {/* ---- Admin panel ---- */}
            {admin && (
                <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000, background: "#ffffff", border: "1px solid #E6F3EE", borderRadius: 12, padding: 12, boxShadow: "0 10px 24px rgba(0,0,0,0.12)", width: 380 }}>
                    <div style={{ fontWeight: 700, color: "#017151", marginBottom: 8 }}>Sponsor Page Admin</div>

                    {/* Inline editing toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <input id="sp-inline" type="checkbox" checked={inlineEdit} onChange={toggleInline} />
                        <label htmlFor="sp-inline" style={{ userSelect: "none" }}>Enable inline text editing on page</label>
                    </div>

                    {/* Image overrides */}
                    <div style={{ fontWeight: 700, color: "#017151", marginBottom: 6 }}>Background images</div>
                    {[
                        { key: "bgHero",      label: "Hero image" },
                        { key: "bgLearning",  label: "Moments / stats image" },
                        { key: "bgMentor",    label: "Mentor section image" },
                        { key: "bgCommunity", label: "Community section image" },
                    ].map(({ key, label }) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <span style={{ minWidth: 170 }}>{label}</span>
                            <input
                                id={`sp-${key}`}
                                type="file"
                                accept="image/*"
                                lang="en"
                                style={{ display: "none" }}
                                onChange={(e)=>setImgOverride(key as ImgKey, e.currentTarget.files)}
                            />
                            <button onClick={()=>document.getElementById(`sp-${key}`)?.click()} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                                Choose file
                            </button>
                            <button onClick={()=>resetImgOverride(key as ImgKey)} style={{ padding: "6px 10px", borderRadius: 6, border: 0, background: "#f6f6f6", cursor: "pointer" }}>
                                Reset
                            </button>
                        </div>
                    ))}

                    <div style={{ height: 1, background: "#E6F3EE", margin: "8px 0" }} />

                    {/* Kit / Poster */}
                    <div style={{ fontWeight: 700, color: "#017151", marginBottom: 6 }}>Downloads</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span style={{ minWidth: 170 }}>Sponsor kit (PDF/Image)</span>
                        <input id="sp-kit" type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={(e)=>pickKit(e.currentTarget.files)} />
                        <button onClick={()=>document.getElementById("sp-kit")?.click()} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                            Choose file
                        </button>
                        <button onClick={resetKit} style={{ padding: "6px 10px", borderRadius: 6, border: 0, background: "#f6f6f6", cursor: "pointer" }}>
                            Reset
                        </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{ minWidth: 170 }}>Poster (A4, PDF/Image)</span>
                        <input id="sp-poster" type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={(e)=>pickPoster(e.currentTarget.files)} />
                        <button onClick={()=>document.getElementById("sp-poster")?.click()} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                            Choose file
                        </button>

                    </div>

                    <div style={{ height: 1, background: "#E6F3EE", margin: "8px 0" }} />

                    {/* Text overrides (panel editing) */}
                    <div style={{ fontWeight: 700, color: "#017151", marginBottom: 6 }}>Text overrides</div>
                    <div style={{ display: "grid", gap: 8, maxHeight: 220, overflow: "auto", paddingRight: 4 }}>
                        {TEXT_FIELDS.map(f => {
                            const val = textGet(f.id, f.def);
                            return (
                                <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: 12, opacity: .75, marginBottom: 4 }}>{f.label}</div>
                                        <input
                                            value={val}
                                            onChange={(e)=>textSet(f.id, e.target.value)}
                                            style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd" }}
                                        />
                                    </div>
                                    <button onClick={()=>textReset(f.id)} style={{ height: 32, padding: "6px 10px", borderRadius: 6, border: 0, background: "#f6f6f6", cursor: "pointer" }}>
                                        Reset
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 10 }}>
                        <button
                            onClick={()=>{ try { ss?.removeItem("btf.admin") } catch {}; setAdmin(false) }}
                            style={{ fontSize: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 6, padding: "6px 8px", cursor: "pointer" }}
                        >
                            Logout
                        </button>
                        <button
                            onClick={()=>{
                                // reset everything
                                try { ls?.removeItem("btf.sponsor.kit"); ls?.removeItem("btf.sponsor.poster") } catch {}
                                const next = { ...getJson("btfImageOverrides") }
                                delete next.bgHero; delete next.bgMentor; delete next.bgCommunity; delete next.bgLearning
                                setJson("btfImageOverrides", next)
                                setKitUrl(defaultKit); setPosterUrl("")
                                textResetAll();
                                forceRerender(Math.random())
                            }}
                            style={{ fontSize: 12, border: 0, background: "#1a73e8", color: "#fff", borderRadius: 6, padding: "6px 8px", cursor: "pointer" }}
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
