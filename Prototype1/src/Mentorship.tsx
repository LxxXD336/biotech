import React from "react";
import { Container, PageSection, COLORS, useReveal } from "./components/common";
import StyleInject from "./components/StyleInject";
import MainNav from "./components/MainNav";
import Footer from "./sections/home/Footer";

// Type declarations for JSX
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}
// Image paths - using string paths to avoid TypeScript import issues
const heroImg = "/src/Photo/Mentorship/Mentorship1.png";
const idealimg = "/src/Photo/Mentorship/BTF-INTRO-WEEK.png";
const involvedimg = "/src/Photo/Mentorship/Involve.JPG";
const testimonialimg = "/src/Photo/Mentorship/TESTIMONIALS1.png";
const testimonialimg2 = "/src/Photo/Mentorship/TESTIMONIALS2.png";
const testimonialimg3 = "/src/Photo/Mentorship/TESTIMONIALS3.png";
const supportimg = "/src/Photo/Mentorship/Support.png";
const innovatorimg = "/src/Photo/Mentorship/Innovator.JPG";
const leadershipimg = "/src/Photo/Mentorship/Leadership.JPG";
const givebackimg = "/src/Photo/Mentorship/Giveback.JPG";
const realimpactimg = "/src/Photo/Mentorship/Realimpact.JPG";
const beinspiredimg = "/src/Photo/Mentorship/BeInspired.JPG";
const recognitionimg = "/src/Photo/Mentorship/Recognition.JPG";

// ===== Admin helpers (Mentorship) =====
type MentorImgOv = Partial<{
    bgHero: string;
    bgInvolved: string;
    bgSupport: string;
    idealImg: string;
    testimonial1Img: string;
    testimonial2Img: string;
    testimonial3Img: string;
    innovatorImg: string;
    leadershipImg: string;
    givebackImg: string;
    realimpactImg: string;
    beinspiredImg: string;
    recognitionImg: string;
}>;

const M_IMG_KEY = "btfMentorImageOverrides";
const M_TEXT_KEY = "btf.mentor.text";

const readJson = (k: string) => {
    try { return JSON.parse(localStorage.getItem(k) || "{}") || {}; } catch { return {}; }
};
const writeJson = (k: string, v: any) => {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

const readMentorImgOv = (): MentorImgOv => readJson(M_IMG_KEY);

const textGet = (id: string, fallback: string) => {
    const m = readJson(M_TEXT_KEY);
    return (m[id] ?? fallback) as string;
};
const textSet = (id: string, v: string) => {
    const m = readJson(M_TEXT_KEY); m[id] = v; writeJson(M_TEXT_KEY, m);
};
const textReset = (id: string) => {
    const m = readJson(M_TEXT_KEY); delete m[id]; writeJson(M_TEXT_KEY, m);
};

// Global Editable (read sessionStorage btf.admin / btf.inlineEdit)
export function Editable({
                             id, defaultText, as = "span", className, style,
                         }: {
    id: string;
    defaultText: string;
    as?: keyof JSX.IntrinsicElements;
    className?: string;
    style?: React.CSSProperties;
}) {
    const Tag = as as any;
    // Controlled by the bottom-right Admin Panel toggles
    const canEdit =
        (typeof window !== "undefined") &&
        sessionStorage.getItem("btf.admin") === "true" &&
        sessionStorage.getItem("btf.inlineEdit") === "true";

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

// No external UI libraries needed. Fully based on your existing common.tsx + StyleInject.tsx.
// - Buttons: use .btn-primary or a custom bordered button
// - Cards: use .card-soft
// - Animations: add className="reveal" and bind ref={reveal}

const CTA_LINK = "https://sydney.au1.qualtrics.com"; // TODO: Replace with the real registration/sign-up link
const HERO_IMG = heroImg;
const IDEAL_IMG = idealimg;
const INVOLVED_IMG = involvedimg;
const TESTIMONIAL_IMG = testimonialimg;
const TESTIMONIAL_IMG2 = testimonialimg2;
const TESTIMONIAL_IMG3 = testimonialimg3;
const SUPPORT_IMG = supportimg;
const INNOVATOR_IMG = innovatorimg;
const LEADERSHIP_IMG = leadershipimg;
const GIVEBACK_IMG = givebackimg;
const REALIMPACT_IMG = realimpactimg;
const BEINSPIRED_IMG = beinspiredimg;
const RECOGNITION_IMG = recognitionimg;

function Kicker({ children }: { children: React.ReactNode }) {
    // Match the same pill style as “THE BRIEF”: solid green background, white, all caps, no leading dot
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 16px",
                borderRadius: 9999,
                fontWeight: 800,
                letterSpacing: ".3px",
                fontSize: 12,
                textTransform: "uppercase",
                background: COLORS.green,
                color: "#fff",
                boxShadow: "0 6px 14px rgba(23,66,67,.12)",
                border: "none",
                lineHeight: 1,
            }}
        >
      {children}
    </span>
    );
}

function GlobalBackground({ scoped = false }: { scoped?: boolean }) {
    const base = scoped ? "bgfx-scope" : "bgfx";
    return (
        <>
            <style>{`
        .bgfx{position:fixed; inset:0; z-index:0; pointer-events:none}
        .bgfx-scope{position:absolute; inset:0; z-index:0; pointer-events:none}
        .bgfx-base{ background: ${COLORS.lightBG}; }
        /* Aurora: more pronounced, two layers drifting */
        .bgfx-aurora{ filter: blur(70px); opacity:.85; }
        .bgfx-aurora.bgfx-aurora-b{ opacity:.55; }
        .bgfx-aurora-a{
          animation: driftA 26s ease-in-out infinite alternate;
          background:
            radial-gradient(38% 46% at 12% 20%, rgba(76,175,140,.35), transparent 62%),
            radial-gradient(36% 42% at 85% 18%, rgba(26,115,232,.22), transparent 64%);
        }
        .bgfx-aurora-b{
          animation: driftB 34s ease-in-out infinite alternate;
          background:
            radial-gradient(40% 52% at 78% 84%, rgba(255,181,67,.28), transparent 66%),
            radial-gradient(26% 30% at 18% 86%, rgba(13,140,116,.22), transparent 60%);
        }
        @keyframes driftA{ 0%{ transform: translate3d(-4%, -2%, 0) scale(1.02) } 50%{ transform: translate3d(4%, 1%, 0) scale(1.06) } 100%{ transform: translate3d(-2%, 3%, 0) scale(1.03) } }
        @keyframes driftB{ 0%{ transform: translate3d(2%, 3%, 0) scale(1.03) } 50%{ transform: translate3d(-3%, -2%, 0) scale(1.06) } 100%{ transform: translate3d(3%, -1%, 0) scale(1.02) } }
        /* Subtle grid to avoid overpowering the aurora */
        .bgfx-grid{
          background-image:
            linear-gradient(to right, rgba(0,0,0,.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,.03) 1px, transparent 1px);
          background-size:24px 24px; opacity:.12;
        }
        /* Slightly stronger noise to mitigate banding */
        .bgfx-noise{opacity:.06; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");}
      `}</style>
            <div className={`${base} bgfx-base`} />
            <div className={`${base} bgfx-aurora bgfx-aurora-a`} />
            <div className={`${base} bgfx-aurora bgfx-aurora-b`} />
            <div className={`${base} bgfx-grid`} />
            <div className={`${base} bgfx-noise`} />
        </>
    );
}

function Hero() {
    const reveal = useReveal();

    // Read local image overrides on each render (same as Sponsor logic)
    const ov = (typeof window !== "undefined") ? readMentorImgOv() : {};
    const heroBg = (ov.bgHero || HERO_IMG) as string;

    // Enable inline editing for headline/subtitle via admin panel
    const headline = textGet("hero.h1", "Become a Mentor");
    const kickerText = textGet("hero.kicker", "Make a difference");
    const heroSub = textGet(
        "hero.sub",
        "Mentor registration for the 2025 Challenge is now closed. If you’d like to be considered for future Challenges and events, send us a message and we’ll be in touch."
    );

    const [glassOn, setGlassOn] = React.useState(false);
    React.useEffect(() => { const t = setTimeout(() => setGlassOn(true), 600); return () => clearTimeout(t); }, []);

    return (
        <section
            className="relative overflow-hidden"
            style={{
                minHeight: "clamp(520px, 72vh, 760px)",
                color: COLORS.lime,
                backgroundImage: `url(${heroBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="absolute inset-0" style={{ background:
                    "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.35) 35%, rgba(0,0,0,.55) 100%)" }} aria-hidden />

            <Container className="relative py-16 md:py-24">
                <style>{`
          .glass-card{ background: rgba(255,255,255,0); border-color: rgba(255,255,255,.14); transition: background .45s ease, border-color .45s ease, backdrop-filter .45s ease, -webkit-backdrop-filter .45s ease; }
          .glass-on{ background: rgba(255,255,255,.10); border-color: rgba(255,255,255,.28); }
          @supports (backdrop-filter: blur(8px)) { .glass-on { backdrop-filter: saturate(140%) blur(8px); } }
          @supports (-webkit-backdrop-filter: blur(8px)) { .glass-on { -webkit-backdrop-filter: saturate(140%) blur(8px); } }
        `}</style>

                <div ref={reveal} className="reveal" style={{ maxWidth: 880 }}>
                    <div
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold"
                        style={{ background: "rgba(255,255,255,.08)", borderColor: "rgba(255,255,255,.24)" }}
                    >
                        <Editable id="hero.kicker" defaultText={kickerText} as="span" />
                    </div>

                    <style>{`
            .headline-roll { display:inline-block; perspective: 800px; }
            .headline-roll .char{
              display:inline-block; transform-origin: left 80%;
              transform: rotateX(90deg) translateY(6px);
              opacity:0; filter: blur(4px);
              animation: rollIn 650ms cubic-bezier(.2,.9,.2,1) calc(var(--i) * 55ms) forwards;
              will-change: transform, opacity, filter;
            }
            @keyframes rollIn{ to{ transform: rotateX(0deg) translateY(0); opacity:1; filter: blur(0); } }
          `}</style>

                    <h1 className="mt-4" style={{ maxWidth: 880 }}>
                        <Editable id="hero.h1" defaultText={headline} as="span" className="headline-roll" />
                    </h1>

                    <div className={`mt-4 card-soft glass-card ${glassOn ? "glass-on" : ""}`} style={{ color: COLORS.lime }}>
                        <Editable id="hero.sub" defaultText={heroSub} as="p" className="text-lg md:text-xl" />
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <a className="btn-primary" href={CTA_LINK} target="_blank" rel="noreferrer">
                                {textGet("hero.cta", "Get started today →")}
                            </a>
                            <a
                                className="btn-ghost"
                                href="#faq"
                                style={{ borderColor: "rgba(255,255,255,.85)", color: COLORS.lime }}
                                onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }}
                            >
                                {textGet("hero.cta2", "Read FAQs")}
                            </a>
                        </div>
                    </div>
                </div>

                <style>{`
          .scroll-indicator{position:absolute;left:50%;transform:translateX(-50%);bottom:18px;display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:9999px;border:1px solid rgba(255,255,255,.32);background:rgba(255,255,255,.06);backdrop-filter:saturate(140%) blur(6px);font-weight:800;letter-spacing:.2px}
          .scroll-indicator::before{content:"";position:absolute;inset:-6px;border-radius:inherit;border:2px solid currentColor;opacity:.25;animation:pulse 2s ease-out infinite}
          @keyframes pulse{0%{transform:scale(.95);opacity:.25}70%{transform:scale(1.15);opacity:0}100%{opacity:0}}
          .scroll-indicator .chev{display:inline-block;animation:bounce 1.1s infinite}
          @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(3px)}}
          .scroll-indicator:hover{transform:translateX(-50%) translateY(-2px)}
        `}</style>
                <a
                    href="#events"
                    className="scroll-indicator"
                    style={{ color: COLORS.lime }}
                    onClick={(e) => { e.preventDefault(); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' }); }}
                    aria-label="Explore mentor events"
                >
                    <span className="chev">↓</span>
                    <span className="txt">{textGet("hero.scroll", "Explore")}</span>
                </a>
            </Container>

            <svg viewBox="0 0 1440 80" className="absolute left-0 w-full block pointer-events-none" style={{ bottom: -1 }} preserveAspectRatio="none" aria-hidden>
                <path d="M0,40 C180,80 420,0 720,40 C1020,80 1260,20 1440,40 L1440,80 L0,80 Z" fill={COLORS.lightBG} />
            </svg>
        </section>
    );
}

function Events() {
    const reveal = useReveal();
    return (
        <PageSection id="events" bg={COLORS.lightBG}>
            <div className="relative">
                {/* Scoped dynamic background (Events only) */}

                <div ref={reveal} className="reveal">
                    <Kicker>
                        <Editable id="events.kicker" defaultText="UPCOMING" as="span" />
                    </Kicker>
                    <h2 className="text-2xl md:text-3xl font-extrabold">
                        <Editable id="events.h" defaultText="Mentor Events" as="span" />
                    </h2>
                    <div className="card-soft mt-5 flex items-start gap-3">
                        <div aria-hidden>📅</div>
                        <div>
                            <p className="font-semibold">
                                <Editable id="events.sub" defaultText="We're putting together mentor events — check back later!" as="span" />
                            </p>
                            <p className="text-sm" style={{ color: COLORS.blue }}>
                                <Editable id="events.newsletter" defaultText="Want a ping when it's live? Join the newsletter below." as="span" />
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PageSection>
    );
}

function IdealAndWhat() {
    const reveal = useReveal();
    const ov = (typeof window !== "undefined") ? readMentorImgOv() : {};
    const idealImgSrc = (ov.idealImg || IDEAL_IMG) as string;

    return (
        <PageSection id="ideal" bg="transparent">
            <div ref={reveal} className="reveal grid gap-8 md:grid-cols-2 md:items-center">
                {/* Left: Big title + illustration card */}
                <div className="relative">
                    <Kicker>
                        <Editable id="ideal.kicker" defaultText="WHO" as="span" />
                    </Kicker>

                    <style>{`
            .ideal-title .under{ position: relative; display:inline-block; }
            .ideal-title .under::after{ content:""; position:absolute; left:0; right:0; bottom:-6px; height:8px; border-radius:999px; background: linear-gradient(90deg, ${COLORS.lime}, ${COLORS.yellow}); opacity:.55; transform: scaleX(0); transform-origin:left; animation: wipe 900ms ease .2s forwards; }
            @keyframes wipe{ to{ transform: scaleX(1); } }
            .hl{ background: linear-gradient(180deg, rgba(182,240,194,0) 60%, rgba(182,240,194,.6) 0); border-radius:3px; padding:0 .15em; }
            .tip{ text-decoration: underline dotted; text-underline-offset: 2px; cursor: help; }
            .chip{ font-size: 12px; padding: 6px 10px; border-radius: 9999px; border: 1px solid #E2EEE8; background: #F1F6F4; font-weight: 700; letter-spacing:.2px; display:inline-flex; align-items:center; gap:6px; }
            .chip .dot{ width:7px; height:7px; border-radius:9999px; background:${COLORS.green}; display:inline-block; }
            .ideal-illus{ max-width: 520px; }
            @media (min-width: 1280px){ .ideal-illus{ max-width: 560px; } }
            .ideal-illus img{ width: 100%; display: block; border-radius: 12px; aspect-ratio: 4/3; object-fit: contain; }
          `}</style>

                    <style>{`
            .ideal-copy{ font-size: 16px; line-height: 1.75; }
            @media (min-width: 768px){ .ideal-copy{ font-size: 21px; } }
            .ideal-copy .tick-list{ font-size: 1em; }
            .ideal-copy .tick-list li{ margin-bottom: .6em; }
            .ideal-copy .card-soft{ font-size: .95em; }
          `}</style>

                    <h2 className="ideal-title text-3xl md:text-4xl font-extrabold leading-tight">
                        <Editable id="ideal.h" defaultText="WHO IS AN IDEAL MENTOR?" as="span" />
                    </h2>

                    <div className="mt-5 card-soft tilt overflow-hidden ideal-illus" aria-hidden>
                        <img src={idealImgSrc} alt="Mentor illustration" />
                    </div>

                    <span className="absolute -z-10" style={{ width: 90, height: 90, left: -20, top: -20, borderRadius: 9999, background: COLORS.lime, filter: "blur(30px)", opacity: .45 }} />
                    <span className="absolute -z-10" style={{ width: 70, height: 70, right: 10, bottom: -10, borderRadius: 9999, background: COLORS.yellow, filter: "blur(24px)", opacity: .5 }} />
                </div>

                {/* Right: narrative + bullets + bonus callout */}
                <div className="ideal-copy">
                    <p style={{ color: COLORS.blue }}>
                        <Editable id="ideal.sub" defaultText="Anyone who is passionate about solving the world's biggest problems and is excited to share their love for STEM. More specifically, you would be well suited if:" as="span" />
                    </p>
                    <ul className="tick-list">
                        <li>
                            <Editable id="ideal.list.1" defaultText="You're a university student, academic, or educator in the science, engineering, or medicine industries." as="span" />
                        </li>
                        <li>
                            <Editable id="ideal.list.2" defaultText="You have a valid WWCC (or equivalent)." as="span" />
                        </li>
                        <li>
                            <Editable id="ideal.list.3" defaultText="You're available for virtual meetings in August–September to support the next generation of innovators!" as="span" />
                        </li>
                    </ul>

                    <div className="card-soft mt-4" style={{ background: "#F7FAF9", borderColor: "#E2EEE8" }}>
                        <Editable id="ideal.bonus" defaultText="Bonus: it helps if you're interested in one of the challenge topics." as="span" />
                    </div>
                </div>
            </div>
        </PageSection>
    );
}


function Involved() {
    const reveal = useReveal();
    const ov = (typeof window !== "undefined") ? readMentorImgOv() : {};
    const involvedBg = (ov.bgInvolved || INVOLVED_IMG) as string;

    return (
        <PageSection id="involved" bg="transparent">
            <div ref={reveal} className="reveal">
                <style>{`
          .iv-panel{ position: relative; overflow: hidden; border-radius: 20px; isolation: isolate; }
          .iv-panel::before{
            content:""; position:absolute; inset:0;
            background-image:url(${involvedBg});
            background-size:cover; background-position:center; filter:saturate(110%); transform:scale(1.02); z-index:0;
          }
          .iv-panel::after{ content:""; position:absolute; inset:0; background:
            linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.35) 40%, rgba(0,0,0,.55) 100%),
            radial-gradient(65% 55% at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 100%);
            z-index:0; }
          .iv-content{ position:relative; z-index:1; padding:24px; color:#EAF7F1; }
          @media (min-width:768px){ .iv-content{ padding:32px; } }
          /* Glass card (emphasis area only) */
          .iv-glass{ background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.22); border-radius:16px; backdrop-filter:saturate(140%) blur(8px); -webkit-backdrop-filter:saturate(140%) blur(8px); box-shadow:0 10px 24px rgba(0,0,0,.18); }
          .iv-chip{ display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:9999px; border:1px solid rgba(255,255,255,.28); background: rgba(255,255,255,.06); font-weight:400; letter-spacing:.2px }
          .iv-chip .dot{ width:6px; height:6px; border-radius:9999px; background:${COLORS.lime}; display:inline-block }
          .iv-title{ display:flex; align-items:center; gap:12px }
          .iv-title .bar{ width:6px; height:28px; border-radius:6px; background: linear-gradient(180deg, ${COLORS.lime}, ${COLORS.yellow}) }
          .font-medium {font-size:18px;}
          .tick-list {font-size:16px;}
          .iv-glass {font-size:16px;}
        `}</style>

                <div className="iv-panel card-soft">
                    <div className="iv-content">
                        <div className="grid gap-8 md:grid-cols-2 md:items-start">
                            {/* Left column: title + chips row */}
                            <div>
                                <div className="iv-title">
                                    <span className="bar" />
                                    <div>
                                        <div className="mb-1 text-sm font-bold tracking-widest" style={{ color: COLORS.lime }}>
                                            <Editable id="involved.kicker" defaultText="WHAT" as="span" />
                                        </div>
                                        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                                            <Editable id="involved.h" defaultText="WHAT IS INVOLVED?" as="span" />
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="iv-chip">
                                        <span className="dot" />
                                        <Editable id="involved.chip.1" defaultText="Up to 3 teams" as="span" />
                                    </span>
                                    <span className="iv-chip">
                                        <span className="dot" />
                                        <Editable id="involved.chip.2" defaultText="~5 hrs / team" as="span" />
                                    </span>
                                    <span className="iv-chip">
                                        <span className="dot" />
                                        <Editable id="involved.chip.3" defaultText="Guide final slides" as="span" />
                                    </span>
                                </div>
                            </div>

                            {/* Right column: responsibilities list + glass tip card */}
                            <div>
                                <div style={{ padding: 4 }}>
                                    <p className="font-medium" style={{ marginTop: 0, marginBottom: 6, opacity: .95 }}>
                                        <Editable id="involved.sub" defaultText="Your responsibilities include:" as="span" />
                                    </p>
                                    <ul className="tick-list" style={{ marginTop: 6 }}>
                                        <li>
                                            <Editable id="involved.list.1" defaultText="Supporting up to 3 teams of high school students through research and ideation." as="span" />
                                        </li>
                                        <li>
                                            <Editable id="involved.list.2" defaultText="Providing ~5 hrs of mentorship per team via Zoom or email." as="span" />
                                        </li>
                                        <li>
                                            <Editable id="involved.list.3" defaultText="Guiding preparations of the final presentations to be shared during the symposium." as="span" />
                                        </li>
                                    </ul>
                                </div>

                                <div className="iv-glass" style={{ marginTop: 14, padding: 14 }}>
                                    <p style={{ margin: 0 }}>
                                        <Editable id="involved.note" defaultText="Importantly, the role is mainly to guide students in the right direction — not doing their research or offering extra resources / lab time." as="span" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageSection>
    );
}

function Benefits() {
    const reveal = useReveal();
    const ov = (typeof window !== "undefined") ? readMentorImgOv() : {};

    // Benefits cards with editable content - using the same data structure as admin panel
    const benefitsCardsData = [
        { id: "benefits.connect", title: "Connect with top innovators", desc: "Join a community of mentors across Australian STEM.", img: INNOVATOR_IMG, dot: ["#6EE7B7", "#22C55E"], posY: "40%" },
        { id: "benefits.inspired", title: "Be inspired", desc: "See unique, creative solutions to real-world problems.", img: BEINSPIRED_IMG, dot: ["#FBBF24", "#FB923C"], posY: "35%" },
        { id: "benefits.giveback", title: "Give back", desc: "Be the reason a student chooses a STEM career.", img: GIVEBACK_IMG, dot: ["#FB7185", "#F43F5E"], posY: "30%" },
        { id: "benefits.leadership", title: "Grow your leadership", desc: "Strengthen technical and people leadership skills.", img: LEADERSHIP_IMG, dot: ["#38BDF8", "#3B82F6"], posY: "45%" },
        { id: "benefits.impact", title: "Real impact", desc: "Help teams prepare for the symposium and beyond.", img: REALIMPACT_IMG, dot: ["#A3E635", "#16A34A"], posY: "50%" },
        { id: "benefits.recognition", title: "Recognition", desc: "Showcase your contribution and expand your network.", img: RECOGNITION_IMG, dot: ["#A78BFA", "#D946EF"], posY: "38%" },
    ];

    const items = benefitsCardsData.map(card => {
        // Map card id to image override keys
        const imgKeyMap: Record<string, string> = {
            'connect': 'innovatorImg',
            'inspired': 'beinspiredImg',
            'giveback': 'givebackImg',
            'leadership': 'leadershipImg',
            'impact': 'realimpactImg',
            'recognition': 'recognitionImg'
        };
        const cardType = card.id.split('.')[1];
        const imgKey = imgKeyMap[cardType] as keyof typeof ov;

        return {
            id: card.id,
            title: textGet(`${card.id}.title`, card.title),
            desc: textGet(`${card.id}.desc`, card.desc),
            img: ov[imgKey] || card.img,
            dot: card.dot,
            posY: card.posY,
        };
    });

    return (
        <PageSection id="benefits" bg="transparent">
            <div ref={reveal} className="reveal">
                <Kicker>
                    <Editable id="benefits.kicker" defaultText="WHY" as="span" />
                </Kicker>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                    <Editable id="benefits.h" defaultText="Benefits of mentoring" as="span" />
                </h2>

                <style>{`
          /* ====== Responsive 3-column grid ====== */
          .bf-grid{
            display:grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
            margin-top: 14px;
          }
          @media (max-width: 1024px){ .bf-grid{ grid-template-columns: repeat(2, minmax(0, 1fr)); } }
          @media (max-width: 640px){  .bf-grid{ grid-template-columns: 1fr; } }

          /* ====== Card (16:9 landscape) ====== */
          .bf-card{
            position:relative;
            border-radius:18px;
            overflow:hidden;
            isolation:isolate;
            box-shadow:0 14px 34px rgba(23,66,67,.14);
            border:1px solid rgba(255,255,255,.14);
            aspect-ratio: 16 / 9;
            outline:none;
            container-type: inline-size;
          }
          @media (max-width:640px){ .bf-card{ aspect-ratio: 4 / 3; } }

          .bf-card img{
            width:100%; height:100%; display:block;
            object-fit: cover;
            object-position: 50% var(--oy, 30%); /* Allow per-card vertical fine-tuning */
            filter:saturate(112%);
            transition: transform .35s ease;
            will-change: transform;
          }

          /* Vignette overlay: improve text readability */
          .bf-card::after{
            content:""; position:absolute; inset:0; pointer-events:none;
            background:
              radial-gradient(60% 65% at 80% 85%, rgba(0,0,0,.38), transparent 62%),
              linear-gradient(180deg, rgba(0,0,0,.24) 0%, rgba(0,0,0,.08) 48%, rgba(0,0,0,.34) 100%);
            opacity:.40;
          }

          /* ====== Bottom glass panel (dot + title + description) ====== */
          .bf-float{
            position:absolute; left:12px; right:12px; bottom:12px;
            padding:12px 14px;
            border-radius:14px;
            color:#fff;
            background: rgba(20,24,22,.18);
            border:1px solid rgba(255,255,255,.28);
            backdrop-filter: saturate(140%) blur(10px);
            -webkit-backdrop-filter: saturate(140%) blur(10px);
            box-shadow: 0 10px 24px rgba(0,0,0,.22);
            transition: background .25s ease, border-color .25s ease;
          }
          .bf-head{ display:flex; align-items:center; gap:10px; font-weight:800; letter-spacing:.2px; font-size:17px; margin-bottom:6px; }
          .bf-desc{ font-size:16px; line-height:1.55; opacity:.95; }

          /* Dot: two-color gradient + soft glow */
          .bf-dot{
            width:10px; height:10px; border-radius:9999px; flex:0 0 auto;
            background: radial-gradient(circle at 35% 35%, var(--da) 0 55%, var(--db) 56% 100%);
            box-shadow:
              0 0 0 2px rgba(255,255,255,.22) inset,
              0 0 10px color-mix(in srgb, var(--da) 70%, transparent);
          }

          /* Fallback for browsers without backdrop-filter */
          @supports not (backdrop-filter: blur(8px)) {
            .bf-float { background: rgba(0,0,0,.55); border-color: rgba(255,255,255,.08); }
          }

          /* Interactions & accessibility */
          .bf-card:hover img{ transform: scale(1.04); }
          .bf-card:hover .bf-float{ background: rgba(20,24,22,.24); border-color: rgba(255,255,255,.34); }
          .bf-card:focus-visible .bf-float{
            box-shadow: 0 0 0 3px rgba(182,240,194,.95), 0 0 0 6px rgba(23,66,67,.35);
          }
          @media (prefers-reduced-motion: reduce){
            .bf-card img, .bf-float{ transition: none !important; }
          }

          /* Container query: scale down text when card is narrow */
          @container (max-width: 340px){
            .bf-head{ font-size:14px; }
            .bf-desc{ font-size: 13.5px; }
          }
        `}</style>

                <div className="bf-grid">
                    {items.map((it, i) => (
                        <figure
                            key={i}
                            className="bf-card"
                            tabIndex={0}
                            aria-label={`${it.title}: ${it.desc}`}
                            style={{
                                // Two accent colors for the dot
                                ['--da' as any]: it.dot[0],
                                ['--db' as any]: it.dot[1],
                                // Optional: vertical alignment (defaults to 30%)
                                ['--oy' as any]: it.posY ?? undefined,
                            }}
                        >
                            <img src={it.img} alt={it.title} />
                            <figcaption className="bf-float">
                                <div className="bf-head">
                                    <span className="bf-dot" />
                                    <span>{it.title}</span>
                                </div>
                                <div className="bf-desc">{it.desc}</div>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </PageSection>
    );
}

function Testimonial() {
    const reveal = useReveal();
    const ov = (typeof window !== "undefined") ? readMentorImgOv() : {};

    const items = [
        {
            img: ov.testimonial1Img || TESTIMONIAL_IMG,
            quote: textGet("testimonial.1.quote", "Being a mentor for BIOTech Futures has been an incredibly rewarding experience. Watching students grow in confidence and creativity while tackling real-world challenges has been truly inspiring."),
            name: textGet("testimonial.1.name", "Jasmine Pye"),
            role: textGet("testimonial.1.role", "UTS Biomedical Engineering"),
        },
        {
            img: ov.testimonial2Img || TESTIMONIAL_IMG2,
            quote: textGet("testimonial.2.quote", "I have been wholly inspired and captivated by some of the incredible ideas produced by the young school-aged BIOTech participants. I cannot recommend this experience highly enough!"),
            name: textGet("testimonial.2.name", "Rosemary Taouk"),
            role: textGet("testimonial.2.role", "Royal Australian Air Force"),
        },
        {
            img: ov.testimonial3Img || TESTIMONIAL_IMG3,
            quote: textGet("testimonial.3.quote", "Some of the student submissions I've seen have genuinely blown me away. It's really inspiring to see what students can do when they're given the chance to solve real-world problems."),
            name: textGet("testimonial.3.name", "Frank Fei"),
            role: textGet("testimonial.3.role", "PhD Candidate, USYD"),
        },
    ];

    return (
        <PageSection id="testimonials" bg="transparent">
            <div ref={reveal} className="reveal">
                <Kicker>
                    <Editable id="testimonials.kicker" defaultText="TESTIMONIALS" as="span" />
                </Kicker>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                    <Editable id="testimonials.h" defaultText="What mentors say" as="span" />
                </h2>

                <style>{`
          /* Mobile: horizontal scroll; Desktop: auto-fit columns */
          .t-strip{
            display:grid;
            grid-auto-flow: column;
            grid-auto-columns: min(88vw, 520px);
            gap: 18px;
            overflow-x:auto;
            padding: 6px;
            scroll-snap-type:x mandatory;

            /* Enhance scrolling experience */
            -webkit-overflow-scrolling: touch;
            scroll-padding: 6px;
            scroll-snap-stop: always;
          }
          .t-card{ scroll-snap-align: start; }

          @media (min-width: 1024px){
            .t-strip{
              /* Auto-fit columns: min 420px per card; 3 columns if space allows */
              grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
              grid-auto-flow: initial;
              grid-auto-columns: initial;
              overflow: visible;
              gap: 24px;
            }
          }

          /* Card styles */
          .t-card{
            position:relative;
            display:flex;
            gap:18px;
            align-items:center;
            padding:18px;
            border-radius:20px;
            background: ${COLORS.white};
            border:1px solid #E9F1EC;
            box-shadow:0 8px 26px rgba(23,66,67,.08);

            /* Enable container query by setting size container */
            container-type: inline-size;
          }

          .t-photo{
            width: clamp(150px, 22vw, 200px);
            height: clamp(150px, 22vw, 200px);
            border-radius: 9999px;
            object-fit: cover;
            box-shadow: 0 0 0 8px rgba(255,255,255,.9), 0 18px 34px rgba(23,66,67,.12);
          }

          .t-quote{ position:relative; flex:1; }
          .t-quote .mark{
            position:absolute; left:-10px; top:-6px;
            font-size:60px; line-height:1; color: rgba(23,66,67,.12);
            font-weight: 900; pointer-events:none;
          }
          .t-quote blockquote{
            margin:0; font-size:16px; line-height:1.6;

            /* Improve readability & word breaking */
            max-width: 60ch;
            hyphens: auto;
            word-break: break-word;
          }
          .t-quote footer{
            margin-top:10px; font-weight:700; color:${COLORS.navy}; font-style: italic;
          }

          /* Mobile fade mask */
          .t-mask{ position:relative; }
          .t-mask::after{
            content:""; position:absolute; inset:0; pointer-events:none;
            background: linear-gradient(90deg, ${COLORS.lightBG}, transparent 8%, transparent 92%, ${COLORS.lightBG});
            border-radius: 16px;
          }
          /* Hide mask on desktop */
          @media (min-width:1024px){ .t-mask::after{ display:none; } }
        `}</style>

                {/* Decorations */}
                <style>{`
          .t-card{ --sz: clamp(150px, 22vw, 200px); }
          .t-media{ position: relative; width: var(--sz); height: var(--sz); flex: 0 0 auto; }
          .t-media .t-ring{
            position:absolute; inset:-6px; border-radius:9999px;
            background: conic-gradient(from 0deg, rgba(33,132,113,.18), rgba(33,132,113,0) 60%, rgba(33,132,113,.18));
            animation: spin 16s linear infinite;
          }
          @keyframes spin{ to{ transform: rotate(360deg); } }

          .t-photo{ width:100%; height:100%; border-radius:9999px; object-fit:cover; box-shadow: 0 0 0 8px rgba(255,255,255,.9), 0 18px 34px rgba(23,66,67,.12); }
          .t-shine{ position:absolute; inset:-1px; border-radius:20px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.7), transparent); transform: translateX(-100%); opacity:0; pointer-events:none; }
          .t-card:hover .t-shine{ opacity:.15; animation: shine 900ms ease forwards; }
          @keyframes shine{ to{ transform: translateX(100%); } }

          .t-quote .rule{ height:2px; margin-top:10px; background: linear-gradient(90deg, ${COLORS.green}, ${COLORS.yellow}); opacity:.35; border-radius:9999px }
          .t-mask::before{ content:""; position:absolute; inset:0; border-radius:16px; background: radial-gradient(circle at 1px 1px, rgba(23,66,67,.06) 1px, transparent 1px) 0 0/14px 14px; pointer-events:none; opacity:.22 }

          /* Container query: when card width < 420px, stack vertically */
          @container (max-width: 420px){
            .t-card{
              flex-direction: column;
              align-items: flex-start;
            }
            .t-media{
              width: 140px;
              height: 140px;
              margin-bottom: 10px;
            }
            .t-quote .mark{ left:-2px; top:-8px; }
          }

          /* Respect reduced motion preference */
          @media (prefers-reduced-motion: reduce){
            .t-media .t-ring{ animation: none; }
            .t-card:hover .t-shine{ animation: none; }
            .t-strip{ scroll-behavior: auto; }
          }
        `}</style>

                <div className="t-mask mt-5">
                    <div className="t-strip">
                        {items.map((it, i) => (
                            <figure key={i} className="t-card">
                                <div className="t-media" aria-hidden>
                                    <span className="t-ring" />
                                    <img src={it.img} alt={it.name} className="t-photo" />
                                </div>
                                <figcaption className="t-quote">
                                    <div className="mark" aria-hidden>“</div>
                                    <blockquote>“{it.quote}”</blockquote>
                                    <div className="rule" aria-hidden />
                                    <footer>— {it.name}, {it.role}</footer>
                                </figcaption>
                                <div className="t-shine" aria-hidden />
                            </figure>
                        ))}
                    </div>
                </div>

                {/* Small hint: swipe horizontally (shown on mobile) */}
                <div className="mt-2 text-xs" style={{ color: COLORS.blue }}>
                    <span className="md:hidden">
                        <Editable id="testimonials.swipe" defaultText="Swipe to see more →" as="span" />
                    </span>
                </div>
            </div>
        </PageSection>
    );
}

function Support() {
    const reveal = useReveal();
    const ov = (typeof window !== "undefined") ? readMentorImgOv() : {};
    const supportBg = (ov.bgSupport || SUPPORT_IMG) as string;

    return (
        <PageSection id="support" bg="transparent">
            <Container className="py-10 md:py-14">
                <div className="reveal" ref={reveal}>
                    <style>{`
                      .sp-wrap{ position:relative; min-height: 440px; border-radius: 22px; overflow:hidden; isolation:isolate; box-shadow: 0 18px 44px rgba(23,66,67,.16); }
                      .sp-wrap::before{
                        content:""; position:absolute; inset:0;
                        background-image:url(${supportBg});
                        background-size:cover; background-position:center 40%; transform:scale(1.02); filter:saturate(112%); z-index:0;
                      }
                      .sp-wrap::after{ content:""; position:absolute; inset:0; background:
                        radial-gradient(50% 60% at 80% 80%, rgba(0,0,0,.12), transparent 60%),
                        linear-gradient(180deg, rgba(0,0,0,.08) 0%, rgba(0,0,0,.04) 40%, rgba(0,0,0,.12) 100%);
                        z-index:0; }
                      .sp-card{ position:absolute; z-index:1; left:clamp(16px,6vw,64px); top:clamp(16px,6vh,64px); width:min(760px, 86%); padding:22px 24px 26px; border-radius:16px; 
                        background: linear-gradient(180deg, rgba(182,240,194,.98), rgba(182,240,194,.94));
                        border:1px solid rgba(16,94,77,.18);
                        backdrop-filter: blur(4px) saturate(120%);
                        -webkit-backdrop-filter: blur(4px) saturate(120%);
                        box-shadow: 0 14px 30px rgba(23,66,67,.22);
                        color:${COLORS.charcoal};
                      }
                      /* Mobile: use normal document flow to avoid content cut-off */
                      @media (max-width: 640px){
                        .sp-wrap{ min-height:auto; }
                        .sp-card{ position: static; width: auto; left: auto; top: auto; margin: 16px; }
                        .sp-spacer{ display:none; }
                      }
                      .sp-card h2{ font-size: clamp(24px, 3vw, 36px); line-height:1.15; font-weight: 900; }
                      .sp-dot{ width:8px; height:8px; border-radius:9999px; background:${COLORS.green}; display:inline-block; margin-right:8px }
                      .sp-glow{ position:absolute; left:-60px; top:-60px; width:240px; height:240px; border-radius:9999px; background: radial-gradient(closest-side, rgba(255,255,255,.7), transparent); filter: blur(22px); opacity:.6; z-index:0 }
                    `}</style>

                    <div className="sp-wrap">
                        <div className="sp-card">
                            <Kicker>
                                <Editable id="support.kicker" defaultText="SUPPORT" as="span" />
                            </Kicker>
                            <h2 className="mt-3">
                                <Editable id="support.h" defaultText="WHAT SUPPORT DO MENTORS GET?" as="span" />
                            </h2>
                            <p className="mt-2" style={{ color: COLORS.navy }}>
                                <Editable id="support.sub" defaultText="You'll be supported by a thorough onboarding process, being assigned to team/s that align with your interests. We're also available throughout the program to chat through anything you might be unsure about." as="span" />
                            </p>
                            <ul className="tick-list" style={{ marginTop: 8 }}>
                                <li>
                                    <Editable id="support.list.1" defaultText="Structured onboarding & mentor guide." as="span" />
                                </li>
                                <li>
                                    <Editable id="support.list.2" defaultText="Matching with teams based on your interests." as="span" />
                                </li>
                                <li>
                                    <Editable id="support.list.3" defaultText="Ongoing support via email/Slack and resources/templates." as="span" />
                                </li>
                            </ul>
                        </div>
                        <span className="sp-glow" aria-hidden />
                        {/* Spacer to increase container height (prevent collapse due to absolute positioning) */}
                        <div className="sp-spacer" style={{ paddingTop: 420 }} />
                    </div>
                </div>
            </Container>
        </PageSection>
    );
}

function FAQ() {
    const reveal = useReveal();

    // Contact page route
    const CONTACT_URL = "/contact";

    // FAQ data (11 FAQ items with editable content) - shared with main component
    const FAQ_DATA = [
        { id: "faq.1", q: "How many teams will I mentor?", a: "As a mentor you are expected to mentor up to 3 teams. This largely depends on the number of students that enter the Challenge each year." },
        { id: "faq.2", q: "How many hours are expected?", a: "You are expected to spend a total of 5 hrs with each team you are paired with. How and when you use the allocated time over the 6-week Challenge is up to you and your team to discuss. Communication is typically conducted virtually (via email or zoom) but we also encourage face-to-face engagement where reasonable. You are in charge of organising your own meetings with your teams so you can schedule it to suit your calendar." },
        { id: "faq.3", q: "When will I find out which team/s I am paired with?", a: "We will send you an email in the lead up to the Challenge start date with you team, topic of interest (if you picked multiple), and the high school supervisors contact information. This information can also be found via the Challenge login members page once the Challenge begins." },
        { id: "faq.4", q: "What if multiple teams have different ideas?", a: "If you are mentoring multiple teams, expect that each team will be working on a different problem or solution in the area of interest you selected. The areas of interest are deliberately left open ended and encourage students to come up with unique and meaningful ideas." },
        { id: "faq.5", q: "Do I get paid as a mentor?", a: "No. All BIOTech Futures mentors are volunteers who are excited by the opportunity to share their love of STEM with students." },
        { id: "faq.6", q: "Will there be any events or training programs?", a: "Yes! We want you to feel connected with your community of mentors and well equipped to mentor your teams, and so we run regular events for you. Keep an eye on your email and on the events panel on this page for upcoming events. There will also be online training modules for you to work through at your own pace so you feel well-equipped. The BIOTech Futures team is also only a emails reach away if you have any concerns or questions throughout the process." },
        { id: "faq.7", q: "Can I be a mentor if I am still studying and don't have an area of expertise?", a: "That's ok! We don't expect mentors to have deep expertise in a specific topic area. You just need to be further along a professional pathway than the high school student teams you're mentoring to guide them through the problem solving and innovation process." },
        { id: "faq.8", q: "What do I need to provide?", a: "Only your time and expertise! We often see the most successful mentors may provide white papers, articles and electronic resources to help teams hone in on their projects. We do not expect mentors to provide any physical resources, labs, or other facilities for their student teams. BIOTech Futures provides everything else high school participants will need including poster templates, syllabus and Challenge handbooks." },
        { id: "faq.9", q: "How much help should I provide my teams?", a: "Your role as a mentor is to guide the students in identifying a real-world problem and coming up with an innovative solution. You may help the students in defining the nature and scope of the problem and/or solution. You're not meant to develop the solution for them or be deeply involved in putting together their poster or other assessment materials. You're also not accountable for the progress of your students' projects." },
        { id: "faq.10", q: "What do I need to sign up?", a: "In the submission form found on this website, please be ready to input your personal details, areas of interest, as well as a working with children check (WWCC) number depending on your state of residence. If you have not yet obtained a WWCC, please first submit an online application relevant to your state of residence and have your application number ready for input into the form." },
        { id: "faq.11", q: "Can I mentor with one of my friends?", a: "We would love it if you can share this opportunity far and wide! However, mentor matching is a complex process and because we have so many enthusiastic student teams needing a mentor, we are currently unable to accommodate for co-mentoring requests. But both you and your friends will have an amazing experience mentoring your own student teams!" },
    ];

    const faqs = FAQ_DATA.map(faq => ({
        q: textGet(`${faq.id}.q`, faq.q),
        a: textGet(`${faq.id}.a`, faq.a),
    }));

    // ===== Expand/collapse animation (keep original logic) =====
    const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const animateToggle = (details: HTMLDetailsElement) => {
        const panel = details.querySelector<HTMLElement>(".faq-panel");
        if (!panel || details.dataset.animating === "1") return;

        if (
            typeof window !== "undefined" &&
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        ) {
            // Reduced motion: toggle directly
            details.open = !details.open;
            return;
        }

        details.dataset.animating = "1";
        const DURATION = 260;
        const EASING = "ease";

        const cleanup = () => {
            panel.style.transition = "";
            panel.style.height = "";
            panel.style.overflow = "";
            panel.style.willChange = "";
            delete details.dataset.animating;
        };

        try {
            if (!details.open) {
                // Expand: reveal content, transition from 0px to measured height
                details.open = true; // Ensure content is in layout to measure height
                const end = panel.scrollHeight;

                // No content (0 height): skip animation
                if (!end) {
                    cleanup();
                    return;
                }

                panel.style.overflow = "hidden";
                panel.style.willChange = "height";
                panel.style.height = "0px";

                // Force reflow to apply the starting style
                panel.getBoundingClientRect();

                panel.style.transition = `height ${DURATION}ms ${EASING}`;
                panel.style.height = `${end}px`;

                const onEnd = () => {
                    panel.removeEventListener("transitionend", onEnd);
                    cleanup();
                };
                panel.addEventListener("transitionend", onEnd);
            } else {
                // Collapse: transition from current height to 0px, then close
                const start = panel.scrollHeight;

                panel.style.overflow = "hidden";
                panel.style.willChange = "height";
                panel.style.height = `${start}px`;

                // Force reflow to apply the starting style
                panel.getBoundingClientRect();

                panel.style.transition = `height ${DURATION}ms ${EASING}`;
                panel.style.height = "0px";

                const onEnd = () => {
                    panel.removeEventListener("transitionend", onEnd);
                    details.open = false;
                    cleanup();
                };
                panel.addEventListener("transitionend", onEnd);
            }
        } catch {
            // Fallback: ensure toggle works even if an error occurs
            details.open = !details.open;
            cleanup();
        }
    };

    const onSummaryClick: React.MouseEventHandler<HTMLElement> = (e) => {
        e.preventDefault();
        const details = (e.currentTarget as HTMLElement).closest("details") as HTMLDetailsElement;
        if (details) animateToggle(details);
    };

    const onSummaryKeyDown: React.KeyboardEventHandler<HTMLElement> = (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            const details = (e.currentTarget as HTMLElement).closest("details") as HTMLDetailsElement;
            if (details) animateToggle(details);
        }
    };

    return (
        <PageSection id="faq" bg="transparent">
            <div ref={reveal} className="reveal">
                <Kicker>
                    <Editable id="faq.kicker" defaultText="HELP" as="span" />
                </Kicker>
                <h2 className="text-2xl md:text-3xl font-extrabold">
                    <Editable id="faq.h" defaultText="Frequently asked questions" as="span" />
                </h2>

                <style>{`
          /* FAQ collapse interaction */
          .faq summary{ cursor:pointer; padding-right:.25rem; }
          .faq-panel{ overflow:hidden; }
          .faq-panel > .faq-content{
            opacity:.92; transform: translateY(-2px);
            transition: opacity 260ms ease, transform 260ms ease;
          }
          .faq[open] .faq-panel > .faq-content{ opacity:1; transform:none; }
          @media (prefers-reduced-motion: reduce){
            .faq-panel > .faq-content{ transition:none; }
          }

          /* ===== CTA container ===== */
          .faq-cta2{
            position:relative;
            display:grid;
            grid-template-columns: 1fr auto;
            gap: 16px;
            align-items:center;
            margin-top: 18px;
            padding: 18px 20px;
            border-radius: 18px;
            overflow:hidden;
            background: linear-gradient(135deg, rgba(182,240,194,.22), rgba(102,190,165,.18));
            border: 1px solid rgba(16,94,77,.22);
            box-shadow: 0 12px 28px rgba(23,66,67,.10);
          }
          .faq-cta2::before{
            content:""; position:absolute; right:-120px; top:-160px;
            width:420px; height:420px; border-radius:9999px;
            background: radial-gradient(circle, rgba(255,255,255,.35), transparent 60%);
            filter: blur(14px); opacity:.8; pointer-events:none;
          }
          .faq-cta2::after{
            content:""; position:absolute; inset:0; pointer-events:none;
            background-image:
              linear-gradient(to right, rgba(255,255,255,.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,.08) 1px, transparent 1px);
            background-size:22px 22px; opacity:.12;
          }
          .faq-cta2 .info{ display:flex; align-items:center; gap:12px; min-width:0; }
          .faq-cta2 .icon{
            width:42px; height:42px; border-radius:12px; flex:0 0 auto;
            display:grid; place-items:center; color:#fff;
            background:${COLORS.green};
            box-shadow:0 8px 18px rgba(23,66,67,.25);
          }
          .faq-cta2 h3{ margin:0; font-weight:900; color:${COLORS.navy}; }
          .faq-cta2 p{ margin:2px 0 0; color:${COLORS.blue}; }

          .faq-cta2 .actions{ display:flex; gap:10px; flex-wrap:wrap; justify-self:end; }

          /* ===== Contact button: stable white text + darker hover ===== */
          .faq-cta2 .contact-btn,
          .faq-cta2 .contact-btn:link,
          .faq-cta2 .contact-btn:visited{
            color:#fff;                                     /* Prevent global a:hover from turning blue */
            background: linear-gradient(135deg,#1aa77a,#139a70);
            border:1px solid rgba(0,0,0,.18);
            border-radius:12px;
            padding:10px 16px;
            font-weight:800;
            text-decoration:none;
            display:inline-flex;
            align-items:center;
            gap:8px;
            box-shadow: 0 8px 18px rgba(0,0,0,.18), 0 0 0 1px rgba(255,255,255,.20) inset;
            text-shadow: 0 1px 0 rgba(0,0,0,.25);           /* Improve white legibility on glass */
            transition: transform .15s ease, background .2s ease, box-shadow .2s ease;
          }
          .faq-cta2 .contact-btn:hover{
            color:#fff;
            background: linear-gradient(135deg,#168e67,#0f7f5a); /* Darker on hover */
            transform: translateY(-1px);
            box-shadow: 0 10px 22px rgba(0,0,0,.22), 0 0 0 1px rgba(255,255,255,.24) inset;
          }
          .faq-cta2 .contact-btn:active{
            transform: translateY(0);
            background: linear-gradient(135deg,#0f7f5a,#0a6d4d);
          }
          .faq-cta2 .contact-btn:focus-visible{
            outline:none;
            box-shadow:
              0 0 0 3px rgba(182,240,194,.95),
              0 0 0 6px rgba(23,66,67,.35);
          }

          @supports (backdrop-filter: blur(8px)){
            .faq-cta2{
              backdrop-filter: saturate(140%) blur(8px);
              -webkit-backdrop-filter: saturate(140%) blur(8px);
              background: linear-gradient(135deg, rgba(255,255,255,.12), rgba(255,255,255,.10));
            }
          }

          @media (max-width: 640px){
            .faq-cta2{ grid-template-columns: 1fr; }
            .faq-cta2 .actions{ justify-self:start; }
          }
        `}</style>

                {/* FAQ list */}
                <div className="mt-4 grid gap-3">
                    {faqs.map((f, i) => (
                        <details key={i} className="faq card-soft">
                            <summary
                                className="select-none font-semibold"
                                onClick={onSummaryClick}
                                onKeyDown={onSummaryKeyDown}
                            >
                                {f.q}
                            </summary>
                            <div className="faq-panel">
                                <div className="faq-content mt-2" style={{ color: COLORS.blue }}>
                                    {f.a}
                                </div>
                            </div>
                        </details>
                    ))}
                </div>

                {/* CTA */}
                <div className="faq-cta2">
                    <div className="info">
                        <div className="icon" aria-hidden>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M3.5 7.5h17v9h-17v-9Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
                                <path d="M4 8l8 6 8-6" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <div>
                            <h3>
                                <Editable id="faq.cta.h" defaultText="Still have questions?" as="span" />
                            </h3>
                            <p>
                                <Editable id="faq.cta.sub" defaultText="We're happy to help—reach out and we'll get back to you soon." as="span" />
                            </p>
                        </div>
                    </div>
                    <div className="actions">
                        <a href={CONTACT_URL} className="contact-btn">
                            <Editable id="btn.contact" defaultText="Contact us" as="span" />
                        </a>
                    </div>
                </div>
            </div>
        </PageSection>
    );
}

export default function BecomeMentor() {
    // ===== Admin & overrides (Mentorship) =====
    const ls = (typeof window !== "undefined") ? window.localStorage : undefined;
    const ss = (typeof window !== "undefined") ? window.sessionStorage : undefined;

    const [admin, setAdmin] = React.useState<boolean>(() => ss?.getItem("btf.admin") === "true");
    const [inlineEdit, setInlineEdit] = React.useState<boolean>(() => ss?.getItem("btf.inlineEdit") === "true");
    const [showLogin, setShowLogin] = React.useState(false);
    const [pwd, setPwd] = React.useState("");
    const [, forceRerender] = React.useState(0);

    // ===== Enhanced admin functionality (from Sponsor) =====
    const toDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result || ""));
        fr.onerror = reject;
        fr.readAsDataURL(file);
    });

    const getJson = (k: string) => { try { return JSON.parse(ls?.getItem(k) || "{}") } catch { return {} } };
    const setJson = (k: string, v: any) => { try { ls?.setItem(k, JSON.stringify(v)) } catch {} };

    // Enhanced image overrides for Mentorship
    type MentorshipImgKey = "bgHero" | "bgInvolved" | "bgSupport" | "idealImg" | "testimonial1Img" | "testimonial2Img" | "testimonial3Img" | "innovatorImg" | "leadershipImg" | "givebackImg" | "realimpactImg" | "beinspiredImg" | "recognitionImg";
    const setImgOverride = async (key: MentorshipImgKey, files: FileList | null) => {
        const f = files?.[0]; if (!f) return;
        const data = await toDataUrl(f);
        const next = { ...getJson("btfMentorImageOverrides"), [key]: data };
        setJson("btfMentorImageOverrides", next);
        forceRerender(Math.random());
    };
    const resetImgOverride = (key: MentorshipImgKey) => {
        const next = { ...getJson("btfMentorImageOverrides") };
        delete next[key];
        setJson("btfMentorImageOverrides", next);
        forceRerender(Math.random());
    };


    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "s") {
                setShowLogin(true);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const doLogin = React.useCallback(() => {
        const expected = "biotech"; // Default password for admin access
        if (pwd === expected) {
            setAdmin(true);
            try { ss?.setItem("btf.admin", "true"); } catch {}
            setShowLogin(false);
            setPwd("");
            forceRerender(Math.random());
        } else {
            alert("Incorrect password");
        }
    }, [pwd, ss]);

    const toggleInline = () => {
        setInlineEdit(v => {
            const nv = !v;
            try { ss?.setItem("btf.inlineEdit", String(nv)); } catch {}
            forceRerender(Math.random());
            return nv;
        });
    };

    // ---- localStorage helpers & keys (scoped for Mentorship page) ----
    const M_IMG_KEY = "btfMentorImageOverrides";
    const M_TEXT_KEY = "btf.mentor.text";

    const readJson = (k: string) => {
        try { return JSON.parse(ls?.getItem(k) || "{}") || {}; } catch { return {}; }
    };
    const writeJson = (k: string, v: any) => {
        try { ls?.setItem(k, JSON.stringify(v)); } catch {}
    };
    const readMentorImgOv = (): Partial<{ bgHero: string; bgInvolved: string; bgSupport: string; }> => readJson(M_IMG_KEY);

    const textSet = (id: string, v: string) => {
        const m = readJson(M_TEXT_KEY); m[id] = v; writeJson(M_TEXT_KEY, m);
    };
    const textReset = (id: string) => {
        const m = readJson(M_TEXT_KEY); delete m[id]; writeJson(M_TEXT_KEY, m);
    };

    // file -> dataURL (using the enhanced version from above)

    type ImgKey = "bgHero" | "bgInvolved" | "bgSupport" | "idealImg" | "testimonial1Img" | "testimonial2Img" | "testimonial3Img" | "innovatorImg" | "leadershipImg" | "givebackImg" | "realimpactImg" | "beinspiredImg" | "recognitionImg";
    const pickImg = async (key: ImgKey, files: FileList | null) => {
        const f = files?.[0]; if (!f) return;
        const data = await toDataUrl(f);
        const next = { ...readMentorImgOv(), [key]: data };
        writeJson(M_IMG_KEY, next);
        forceRerender(Math.random());
    };
    const resetImg = (key: ImgKey) => {
        const next = { ...readMentorImgOv() }; delete (next as any)[key]; writeJson(M_IMG_KEY, next);
        forceRerender(Math.random());
    };

    const resetAll = () => {
        try {
            ls?.removeItem(M_IMG_KEY);
            ls?.removeItem(M_TEXT_KEY);
        } catch {}
        forceRerender(Math.random());
    };

    // Mentorship-specific text fields organized by section
    const MENTORSHIP_TEXT_FIELDS: Array<{ id: string; label: string; def: string; section: string }> = [
        // Hero Section
        { id: "hero.kicker", label: "Hero kicker", def: "Make a difference", section: "Hero" },
        { id: "hero.h1", label: "Hero title", def: "Become a Mentor", section: "Hero" },
        { id: "hero.sub", label: "Hero subtitle", def: "Mentor registration for the 2025 Challenge is now closed. If you'd like to be considered for future Challenges and events, send us a message and we'll be in touch.", section: "Hero" },
        { id: "hero.cta", label: "Primary CTA", def: "Get started today →", section: "Hero" },
        { id: "hero.cta2", label: "Secondary CTA", def: "Read FAQs", section: "Hero" },
        { id: "hero.scroll", label: "Scroll indicator", def: "Explore", section: "Hero" },

        // Events Section
        { id: "events.kicker", label: "Events kicker", def: "UPCOMING", section: "Events" },
        { id: "events.h", label: "Events heading", def: "Mentor Events", section: "Events" },
        { id: "events.sub", label: "Events message", def: "We're putting together mentor events — check back later!", section: "Events" },
        { id: "events.newsletter", label: "Newsletter hint", def: "Want a ping when it's live? Join the newsletter below.", section: "Events" },

        // Ideal Mentor Section
        { id: "ideal.kicker", label: "Ideal mentor kicker", def: "WHO", section: "Ideal Mentor" },
        { id: "ideal.h", label: "Ideal mentor heading", def: "WHO IS AN IDEAL MENTOR?", section: "Ideal Mentor" },
        { id: "ideal.sub", label: "Ideal mentor description", def: "Anyone who is passionate about solving the world's biggest problems and is excited to share their love for STEM. More specifically, you would be well suited if:", section: "Ideal Mentor" },
        { id: "ideal.list.1", label: "Ideal mentor list item 1", def: "You're a university student, academic, or educator in the science, engineering, or medicine industries.", section: "Ideal Mentor" },
        { id: "ideal.list.2", label: "Ideal mentor list item 2", def: "You have a valid WWCC (or equivalent).", section: "Ideal Mentor" },
        { id: "ideal.list.3", label: "Ideal mentor list item 3", def: "You're available for virtual meetings in August–September to support the next generation of innovators!", section: "Ideal Mentor" },
        { id: "ideal.bonus", label: "Bonus text", def: "Bonus: it helps if you're interested in one of the challenge topics.", section: "Ideal Mentor" },

        // Involved Section
        { id: "involved.kicker", label: "Involved kicker", def: "WHAT", section: "Involved" },
        { id: "involved.h", label: "Involved heading", def: "WHAT IS INVOLVED?", section: "Involved" },
        { id: "involved.chip.1", label: "Involved chip 1", def: "Up to 3 teams", section: "Involved" },
        { id: "involved.chip.2", label: "Involved chip 2", def: "~5 hrs / team", section: "Involved" },
        { id: "involved.chip.3", label: "Involved chip 3", def: "Guide final slides", section: "Involved" },
        { id: "involved.sub", label: "Responsibilities intro", def: "Your responsibilities include:", section: "Involved" },
        { id: "involved.list.1", label: "Involved list item 1", def: "Supporting up to 3 teams of high school students through research and ideation.", section: "Involved" },
        { id: "involved.list.2", label: "Involved list item 2", def: "Providing ~5 hrs of mentorship per team via Zoom or email.", section: "Involved" },
        { id: "involved.list.3", label: "Involved list item 3", def: "Guiding preparations of the final presentations to be shared during the symposium.", section: "Involved" },
        { id: "involved.note", label: "Important note", def: "Importantly, the role is mainly to guide students in the right direction — not doing their research or offering extra resources / lab time.", section: "Involved" },

        // Benefits Section
        { id: "benefits.kicker", label: "Benefits kicker", def: "WHY", section: "Benefits" },
        { id: "benefits.h", label: "Benefits heading", def: "Benefits of mentoring", section: "Benefits" },

        // Testimonials Section
        { id: "testimonials.kicker", label: "Testimonials kicker", def: "TESTIMONIALS", section: "Testimonials" },
        { id: "testimonials.h", label: "Testimonials heading", def: "What mentors say", section: "Testimonials" },
        { id: "testimonials.swipe", label: "Swipe hint", def: "Swipe to see more →", section: "Testimonials" },

        // Support Section
        { id: "support.kicker", label: "Support kicker", def: "SUPPORT", section: "Support" },
        { id: "support.h", label: "Support heading", def: "WHAT SUPPORT DO MENTORS GET?", section: "Support" },
        { id: "support.sub", label: "Support description", def: "You'll be supported by a thorough onboarding process, being assigned to team/s that align with your interests. We're also available throughout the program to chat through anything you might be unsure about.", section: "Support" },
        { id: "support.list.1", label: "Support list item 1", def: "Structured onboarding & mentor guide.", section: "Support" },
        { id: "support.list.2", label: "Support list item 2", def: "Matching with teams based on your interests.", section: "Support" },
        { id: "support.list.3", label: "Support list item 3", def: "Ongoing support via email/Slack and resources/templates.", section: "Support" },

        // FAQ Section
        { id: "faq.kicker", label: "FAQ kicker", def: "HELP", section: "FAQ" },
        { id: "faq.h", label: "FAQ heading", def: "Frequently asked questions", section: "FAQ" },
        { id: "faq.cta.h", label: "FAQ CTA heading", def: "Still have questions?", section: "FAQ" },
        { id: "faq.cta.sub", label: "FAQ CTA description", def: "We're happy to help—reach out and we'll get back to you soon.", section: "FAQ" },
        { id: "btn.contact", label: "Contact button", def: "Contact us", section: "FAQ" },
    ];

    // Benefits cards data (6 cards with editable content) - shared with Benefits component
    const BENEFITS_CARDS = [
        { id: "benefits.connect", title: "Connect with top innovators", desc: "Join a community of mentors across Australian STEM.", imgKey: "benefits.connect.img" },
        { id: "benefits.inspired", title: "Be inspired", desc: "See unique, creative solutions to real-world problems.", imgKey: "benefits.inspired.img" },
        { id: "benefits.giveback", title: "Give back", desc: "Be the reason a student chooses a STEM career.", imgKey: "benefits.giveback.img" },
        { id: "benefits.leadership", title: "Grow your leadership", desc: "Strengthen technical and people leadership skills.", imgKey: "benefits.leadership.img" },
        { id: "benefits.impact", title: "Real impact", desc: "Help teams prepare for the symposium and beyond.", imgKey: "benefits.impact.img" },
        { id: "benefits.recognition", title: "Recognition", desc: "Showcase your contribution and expand your network.", imgKey: "benefits.recognition.img" },
    ];

    // Testimonials data (3 testimonials with editable content)
    const TESTIMONIALS_DATA = [
        { id: "testimonial.1", name: "Jasmine Pye", role: "UTS Biomedical Engineering", quote: "Being a mentor for BIOTech Futures has been an incredibly rewarding experience. Watching students grow in confidence and creativity while tackling real-world challenges has been truly inspiring.", imgKey: "testimonial.1.img" },
        { id: "testimonial.2", name: "Rosemary Taouk", role: "Royal Australian Air Force", quote: "I have been wholly inspired and captivated by some of the incredible ideas produced by the young school-aged BIOTech participants. I cannot recommend this experience highly enough!", imgKey: "testimonial.2.img" },
        { id: "testimonial.3", name: "Frank Fei", role: "PhD Candidate, USYD", quote: "Some of the student submissions I've seen have genuinely blown me away. It's really inspiring to see what students can do when they're given the chance to solve real-world problems.", imgKey: "testimonial.3.img" },
    ];

    // FAQ data (11 FAQ items with editable content) - shared between FAQ component and admin panel
    const FAQ_DATA = [
        { id: "faq.1", q: "How many teams will I mentor?", a: "As a mentor you are expected to mentor up to 3 teams. This largely depends on the number of students that enter the Challenge each year." },
        { id: "faq.2", q: "How many hours are expected?", a: "You are expected to spend a total of 5 hrs with each team you are paired with. How and when you use the allocated time over the 6-week Challenge is up to you and your team to discuss. Communication is typically conducted virtually (via email or zoom) but we also encourage face-to-face engagement where reasonable. You are in charge of organising your own meetings with your teams so you can schedule it to suit your calendar." },
        { id: "faq.3", q: "When will I find out which team/s I am paired with?", a: "We will send you an email in the lead up to the Challenge start date with you team, topic of interest (if you picked multiple), and the high school supervisors contact information. This information can also be found via the Challenge login members page once the Challenge begins." },
        { id: "faq.4", q: "What if multiple teams have different ideas?", a: "If you are mentoring multiple teams, expect that each team will be working on a different problem or solution in the area of interest you selected. The areas of interest are deliberately left open ended and encourage students to come up with unique and meaningful ideas." },
        { id: "faq.5", q: "Do I get paid as a mentor?", a: "No. All BIOTech Futures mentors are volunteers who are excited by the opportunity to share their love of STEM with students." },
        { id: "faq.6", q: "Will there be any events or training programs?", a: "Yes! We want you to feel connected with your community of mentors and well equipped to mentor your teams, and so we run regular events for you. Keep an eye on your email and on the events panel on this page for upcoming events. There will also be online training modules for you to work through at your own pace so you feel well-equipped. The BIOTech Futures team is also only a emails reach away if you have any concerns or questions throughout the process." },
        { id: "faq.7", q: "Can I be a mentor if I am still studying and don't have an area of expertise?", a: "That's ok! We don't expect mentors to have deep expertise in a specific topic area. You just need to be further along a professional pathway than the high school student teams you're mentoring to guide them through the problem solving and innovation process." },
        { id: "faq.8", q: "What do I need to provide?", a: "Only your time and expertise! We often see the most successful mentors may provide white papers, articles and electronic resources to help teams hone in on their projects. We do not expect mentors to provide any physical resources, labs, or other facilities for their student teams. BIOTech Futures provides everything else high school participants will need including poster templates, syllabus and Challenge handbooks." },
        { id: "faq.9", q: "How much help should I provide my teams?", a: "Your role as a mentor is to guide the students in identifying a real-world problem and coming up with an innovative solution. You may help the students in defining the nature and scope of the problem and/or solution. You're not meant to develop the solution for them or be deeply involved in putting together their poster or other assessment materials. You're also not accountable for the progress of your students' projects." },
        { id: "faq.10", q: "What do I need to sign up?", a: "In the submission form found on this website, please be ready to input your personal details, areas of interest, as well as a working with children check (WWCC) number depending on your state of residence. If you have not yet obtained a WWCC, please first submit an online application relevant to your state of residence and have your application number ready for input into the form." },
        { id: "faq.11", q: "Can I mentor with one of my friends?", a: "We would love it if you can share this opportunity far and wide! However, mentor matching is a complex process and because we have so many enthusiastic student teams needing a mentor, we are currently unable to accommodate for co-mentoring requests. But both you and your friends will have an amazing experience mentoring your own student teams!" },
    ];


    return (
        <main style={{ background: "transparent", color: COLORS.charcoal, position: "relative" }}>
            <GlobalBackground />
            <div style={{ position: "relative", zIndex: 1 }}>
                <MainNav />
                <StyleInject />
                <Hero />
                <Events />
                <IdealAndWhat />
                <Involved />
                <Benefits />
                <Testimonial />
                <Support />
                <FAQ />
                <Footer />

                {/* ---- Hidden trigger dot (open login) ---- */}
                <button
                    onClick={() => setShowLogin(true)}
                    aria-label="Open mentorship admin"
                    title="Mentorship Admin"
                    style={{
                        position: "fixed", right: 10, bottom: 42, width: 22, height: 22, borderRadius: 9999,
                        border: 0, background: "#017151", opacity: 0.12, cursor: "pointer", zIndex: 1000,
                    }}
                />

                {/* ---- Login modal ---- */}
                {showLogin && (
                    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "grid", placeItems: "center" }}>
                        <div style={{ background: "#fff", borderRadius: 12, padding: 16, width: 360, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                            <h3 style={{ marginBottom: 10, color: "#017151" }}>Mentorship Admin Login</h3>
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

                {/* ---- Mentorship-Specific Admin Panel ---- */}
                {admin && (
                    <div style={{
                        position: "fixed", bottom: 16, right: 16, zIndex: 1000, background: "#ffffff",
                        border: "1px solid #E6F3EE", borderRadius: 12, padding: 12, boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                        width: 480, maxHeight: "85vh", overflow: "auto"
                    }}>
                        <div style={{ fontWeight: 700, color: "#017151", marginBottom: 8, fontSize: 16 }}>
                            🎓 Mentorship Page Admin
                        </div>

                        {/* Inline editing toggle */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                            <input id="mt-inline" type="checkbox" checked={inlineEdit} onChange={toggleInline} />
                            <label htmlFor="mt-inline" style={{ userSelect: "none", fontSize: 14 }}>Enable inline text editing on page</label>
                        </div>

                        {/* Section 1: Page Content */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, color: "#017151", marginBottom: 8, fontSize: 14 }}>📝 Page Content</div>
                            <div style={{ display: "grid", gap: 6, maxHeight: 200, overflow: "auto", paddingRight: 4 }}>
                                {MENTORSHIP_TEXT_FIELDS.map(f => {
                                    const val = textGet(f.id, f.def);
                                    return (
                                        <div key={f.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
                                            <div>
                                                <div style={{ fontSize: 11, opacity: .7, marginBottom: 2 }}>{f.section} - {f.label}</div>
                                                <input
                                                    value={val}
                                                    onChange={(e)=>{ textSet(f.id, e.target.value); forceRerender(Math.random()); }}
                                                    style={{ width: "100%", padding: "4px 6px", borderRadius: 4, border: "1px solid #ddd", fontSize: 12 }}
                                                />
                                            </div>
                                            <button onClick={()=>{ textReset(f.id); forceRerender(Math.random()); }} style={{ height: 28, padding: "4px 8px", borderRadius: 4, border: 0, background: "#f6f6f6", cursor: "pointer", fontSize: 11 }}>
                                                Reset
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ height: 1, background: "#E6F3EE", margin: "12px 0" }} />

                        {/* Section 2: Benefits Cards */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, color: "#017151", marginBottom: 8, fontSize: 14 }}>✨ Benefits Cards (6 cards)</div>
                            <div style={{ display: "grid", gap: 6, maxHeight: 180, overflow: "auto", paddingRight: 4 }}>
                                {BENEFITS_CARDS.map(card => (
                                    <div key={card.id} style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: 8 }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: "#017151" }}>{card.title}</div>
                                        <div style={{ display: "grid", gap: 4 }}>
                                            <input
                                                value={textGet(`${card.id}.title`, card.title)}
                                                onChange={(e)=>{ textSet(`${card.id}.title`, e.target.value); forceRerender(Math.random()); }}
                                                placeholder="Card title"
                                                style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }}
                                            />
                                            <input
                                                value={textGet(`${card.id}.desc`, card.desc)}
                                                onChange={(e)=>{ textSet(`${card.id}.desc`, e.target.value); forceRerender(Math.random()); }}
                                                placeholder="Card description"
                                                style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }}
                                            />
                                            <div style={{ display: "flex", gap: 4 }}>
                                                <input
                                                    id={`${card.id}-img`}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: "none" }}
                                                    onChange={(e)=>setImgOverride(card.imgKey as MentorshipImgKey, e.currentTarget.files)}
                                                />
                                                <button onClick={()=>document.getElementById(`${card.id}-img`)?.click()} style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 10 }}>
                                                    Change Image
                                                </button>
                                                <button onClick={()=>resetImgOverride(card.imgKey as MentorshipImgKey)} style={{ padding: "3px 6px", borderRadius: 4, border: 0, background: "#f6f6f6", cursor: "pointer", fontSize: 10 }}>
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: 1, background: "#E6F3EE", margin: "12px 0" }} />

                        {/* Section 3: Testimonials */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, color: "#017151", marginBottom: 8, fontSize: 14 }}>💬 Testimonials (3 testimonials)</div>
                            <div style={{ display: "grid", gap: 6, maxHeight: 200, overflow: "auto", paddingRight: 4 }}>
                                {TESTIMONIALS_DATA.map((testimonial, index) => (
                                    <div key={testimonial.id} style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: 8 }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: "#017151" }}>Testimonial {index + 1}</div>
                                        <div style={{ display: "grid", gap: 4 }}>
                                            <input
                                                value={textGet(`${testimonial.id}.name`, testimonial.name)}
                                                onChange={(e)=>{ textSet(`${testimonial.id}.name`, e.target.value); forceRerender(Math.random()); }}
                                                placeholder="Name"
                                                style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }}
                                            />
                                            <input
                                                value={textGet(`${testimonial.id}.role`, testimonial.role)}
                                                onChange={(e)=>{ textSet(`${testimonial.id}.role`, e.target.value); forceRerender(Math.random()); }}
                                                placeholder="Role/Position"
                                                style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }}
                                            />
                                            <textarea
                                                value={textGet(`${testimonial.id}.quote`, testimonial.quote)}
                                                onChange={(e)=>{ textSet(`${testimonial.id}.quote`, e.target.value); forceRerender(Math.random()); }}
                                                placeholder="Quote"
                                                rows={3}
                                                style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11, resize: "vertical" }}
                                            />
                                            <div style={{ display: "flex", gap: 4 }}>
                                                <input
                                                    id={`${testimonial.id}-img`}
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: "none" }}
                                                    onChange={(e)=>setImgOverride(testimonial.imgKey as MentorshipImgKey, e.currentTarget.files)}
                                                />
                                                <button onClick={()=>document.getElementById(`${testimonial.id}-img`)?.click()} style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 10 }}>
                                                    Change Photo
                                                </button>
                                                <button onClick={()=>resetImgOverride(testimonial.imgKey as MentorshipImgKey)} style={{ padding: "3px 6px", borderRadius: 4, border: 0, background: "#f6f6f6", cursor: "pointer", fontSize: 10 }}>
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: 1, background: "#E6F3EE", margin: "12px 0" }} />

                        {/* Section 4: FAQ Management */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, color: "#017151", marginBottom: 8, fontSize: 14 }}>❓ FAQ Management (11 questions)</div>
                            <div style={{ display: "grid", gap: 6, maxHeight: 250, overflow: "auto", paddingRight: 4 }}>
                                {FAQ_DATA.map((faq, index) => (
                                    <div key={faq.id} style={{ border: "1px solid #f0f0f0", borderRadius: 6, padding: 8 }}>
                                        <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, color: "#017151" }}>FAQ {index + 1}</div>
                                        <div style={{ display: "grid", gap: 4 }}>
                                            <input
                                                value={textGet(`${faq.id}.q`, faq.q)}
                                                onChange={(e)=>{ textSet(`${faq.id}.q`, e.target.value); forceRerender(Math.random()); }}
                                                placeholder="Question"
                                                style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11 }}
                                            />
                                            <textarea
                                                value={textGet(`${faq.id}.a`, faq.a)}
                                                onChange={(e)=>{ textSet(`${faq.id}.a`, e.target.value); forceRerender(Math.random()); }}
                                                placeholder="Answer"
                                                rows={3}
                                                style={{ padding: "3px 6px", borderRadius: 4, border: "1px solid #ddd", fontSize: 11, resize: "vertical" }}
                                            />
                                            <div style={{ display: "flex", gap: 4 }}>
                                                <button onClick={()=>{ textReset(`${faq.id}.q`); textReset(`${faq.id}.a`); forceRerender(Math.random()); }} style={{ padding: "3px 6px", borderRadius: 4, border: 0, background: "#f6f6f6", cursor: "pointer", fontSize: 10 }}>
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ height: 1, background: "#E6F3EE", margin: "12px 0" }} />

                        {/* Section 5: Background Images */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, color: "#017151", marginBottom: 8, fontSize: 14 }}>🖼️ Background Images</div>
                            {[
                                { key: "bgHero", label: "Hero background" },
                                { key: "bgInvolved", label: "Involved section" },
                                { key: "bgSupport", label: "Support section" },
                            ].map(({ key, label }) => (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ minWidth: 120, fontSize: 12 }}>{label}</span>
                                    <input
                                        id={`mt-${key}`}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e)=>setImgOverride(key as MentorshipImgKey, e.currentTarget.files)}
                                    />
                                    <button onClick={()=>document.getElementById(`mt-${key}`)?.click()} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 11 }}>
                                        Choose
                                    </button>
                                    <button onClick={()=>resetImgOverride(key as MentorshipImgKey)} style={{ padding: "4px 8px", borderRadius: 4, border: 0, background: "#f6f6f6", cursor: "pointer", fontSize: 11 }}>
                                        Reset
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Section 6: Content Images */}
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontWeight: 600, color: "#017151", marginBottom: 8, fontSize: 14 }}>📸 Content Images</div>
                            {[
                                { key: "idealImg", label: "Ideal Mentor Image" },
                                { key: "testimonial1Img", label: "Testimonial 1 Image" },
                                { key: "testimonial2Img", label: "Testimonial 2 Image" },
                                { key: "testimonial3Img", label: "Testimonial 3 Image" },
                                { key: "innovatorImg", label: "Innovator Card Image" },
                                { key: "leadershipImg", label: "Leadership Card Image" },
                                { key: "givebackImg", label: "Giveback Card Image" },
                                { key: "realimpactImg", label: "Real Impact Card Image" },
                                { key: "beinspiredImg", label: "Be Inspired Card Image" },
                                { key: "recognitionImg", label: "Recognition Card Image" },
                            ].map(({ key, label }) => (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                    <span style={{ minWidth: 140, fontSize: 12 }}>{label}</span>
                                    <input
                                        id={`mt-${key}`}
                                        type="file"
                                        accept="image/*"
                                        style={{ display: "none" }}
                                        onChange={(e)=>setImgOverride(key as MentorshipImgKey, e.currentTarget.files)}
                                    />
                                    <button onClick={()=>document.getElementById(`mt-${key}`)?.click()} style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 11 }}>
                                        Choose
                                    </button>
                                    <button onClick={()=>resetImgOverride(key as MentorshipImgKey)} style={{ padding: "4px 8px", borderRadius: 4, border: 0, background: "#f6f6f6", cursor: "pointer", fontSize: 11 }}>
                                        Reset
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 12 }}>
                            <button
                                onClick={()=>{ try { ss?.removeItem("btf.admin"); } catch {}; setAdmin(false); forceRerender(Math.random()); }}
                                style={{ fontSize: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
                            >
                                Logout
                            </button>
                            <button
                                onClick={resetAll}
                                style={{ fontSize: 12, border: 0, background: "#1a73e8", color: "#fff", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}
                            >
                                Reset All
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

