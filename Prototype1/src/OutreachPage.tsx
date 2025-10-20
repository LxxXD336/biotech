// OutreachPage.tsx
import React from "react";
import CylinderCarousel from "./Outreach/CylinderCarousel";
import OutreachAnimatedStats from "./Outreach/OutreachAnimatedStats";
import FuturePlans from "./Outreach/FuturePlans";
import EventShowcase from "./Outreach/EventShowcase";
import MainNav from "./components/MainNav";
import Footer from "./sections/home/Footer";
import heroImg from "./Photo/outreach/_H9A5158.jpg";
import { COLORS } from "./components/common";
import Cards from "./sections/home/Cards";
import MomentsMarquee from "./sections/home/MomentsMarquee";

import OutreachAdminInline, { useOutreachContent } from "./Outreach/SubpageAdminPanel";
import type { PageText } from "./Outreach/SubpageAdminPanel";

/* ========= Global background + THEME (标准配色) ========= */
function GlobalBackground({ scoped = false }: { scoped?: boolean }) {
  const base = scoped ? "bgfx-scope" : "bgfx";
  return (
    <>
      <style>{`
        :root{
          --brand:        #017151;
          --brand-deep:   #017151;
          --brand-ink:    #0b0f14;
          --brand-06:     rgba(1,113,81,0.06);
          --brand-08:     rgba(1,113,81,0.08);
          --brand-12:     rgba(1,113,81,0.12);
          --brand-16:     rgba(1,113,81,0.16);
          --brand-24:     rgba(1,113,81,0.24);
          --accent-mint:  #74e7c0;
          --page-bg:      ${COLORS.lightBG};
          --kicker-bg: var(--brand);
          --kicker-fg: #fff;
        }
        .bgfx{position:fixed; inset:0; z-index:0; pointer-events:none}
        .bgfx-scope{position:absolute; inset:0; z-index:0; pointer-events:none}
        .bgfx-base{ background: var(--page-bg); }
        .bgfx-aurora{ filter: blur(70px); opacity:.78; }
        .bgfx-aurora-a{
          animation: driftA 26s ease-in-out infinite alternate;
          background:
            radial-gradient(38% 46% at 12% 20%, rgba(1,113,81,.22), transparent 62%),
            radial-gradient(36% 42% at 85% 18%, rgba(1,113,81,.14), transparent 64%);
        }
        .bgfx-aurora-b{
          animation: driftB 34s ease-in-out infinite alternate;
          background:
            radial-gradient(40% 52% at 78% 84%, rgba(116,231,192,.18), transparent 66%),
            radial-gradient(26% 30% at 18% 86%, rgba(1,113,81,.10), transparent 60%);
        }
        @keyframes driftA{ 0%{ transform: translate3d(-4%, -2%, 0) scale(1.02) } 50%{ transform: translate3d(4%, 1%, 0) scale(1.06) } 100%{ transform: translate3d(-2%, 3%, 0) scale(1.03) } }
        @keyframes driftB{ 0%{ transform: translate3d(2%, 3%, 0) scale(1.03) } 50%{ transform: translate3d(-3%, -2%, 0) scale(1.06) } 100%{ transform: translate3d(3%, -1%, 0) scale(1.02) } }
        .bgfx-grid{
          background-image:
            linear-gradient(to right, rgba(0,0,0,.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,.03) 1px, transparent 1px);
          background-size:24px 24px; opacity:.08;
        }
        .bgfx-noise{opacity:.05; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.32'/%3E%3C/svg%3E");}
        .heading-xl{font-weight:800;line-height:1.08;letter-spacing:.01em;color:var(--brand-deep)}
        @media (min-width:768px){.heading-xl{font-size:2.4rem}}
        @media (min-width:1280px){.heading-xl{font-size:3rem}}
        .kicker{display:inline-flex;align-items:center;gap:.5ch;padding:.35rem .7rem;border-radius:999px;background: var(--kicker-bg); color: var(--kicker-fg); font-weight:700;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase}
        /* === Buttons used in hero === */
        .btn-brand{
          display:inline-flex; align-items:center; justify-content:center;
          padding:.6rem 1rem; border-radius:9999px;
          background:var(--brand); color:#fff; font-weight:700;
          border:1px solid var(--brand-24);
          box-shadow:0 10px 26px var(--brand-16);
          transition:transform .08s ease, box-shadow .2s ease, background .2s ease;
        }
        .btn-brand:hover{ transform:translateY(-1px); background:#016446; box-shadow:0 14px 36px var(--brand-16); }
        .btn-brand:active{ transform:translateY(0); box-shadow:0 8px 20px var(--brand-16); }

        .btn-white{
          display:inline-flex; align-items:center; justify-content:center;
          padding:.6rem 1rem; border-radius:9999px;
          background:#fff; color:var(--brand); font-weight:700;
          border:1px solid var(--brand-16);
          transition:transform .08s ease, box-shadow .2s ease, background .2s ease, color .2s ease;
        }
        .btn-white:hover{ transform:translateY(-1px); background:var(--brand-06); box-shadow:0 10px 26px rgba(0,0,0,.1); }
        .btn-white:active{ transform:translateY(0); }

      `}</style>

      <div className={`${base} bgfx-base`} />
      <div className={`${base} bgfx-aurora bgfx-aurora-a`} />
      <div className={`${base} bgfx-aurora bgfx-aurora-b`} />
      <div className={`${base} bgfx-grid`} />
      <div className={`${base} bgfx-noise`} />
    </>
  );
}

const FullBleed: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties; }>
= ({ children, className = "", style }) => (
  <section className={`relative isolate w-full ${className}`} style={style}>{children}</section>
);

// ===== 内联编辑工具 =====
const AUTH_KEY = "outreach_admin_authed";

function useInlineTextHelpers(
  content: ReturnType<typeof useOutreachContent>[0],
  setContent: ReturnType<typeof useOutreachContent>[1]
) {
  const setText = React.useCallback(
    (patch: Partial<PageText>) => {
      setContent({ ...content, text: { ...content.text, ...patch } });
    },
    [content, setContent]
  );
  const isAuthed =
    typeof window !== "undefined" &&
    window.sessionStorage?.getItem(AUTH_KEY) === "1";
  const inlineOn = !!content.inlineEdit && isAuthed;
  return { setText, inlineOn };
}

const InlineText = ({
  value,
  onChange,
  as = "span",
  className = "",
  style,
  dashed = true,
}: {
  value?: string;
  onChange: (v: string) => void;
  as?: "span" | "div";
  className?: string;
  style?: React.CSSProperties;
  dashed?: boolean;
}) => {
  const ref = React.useRef<HTMLElement>(null as any);
  React.useEffect(() => {
    if (!ref.current) return;
    const t = value ?? "";
    if (ref.current.innerText !== t) ref.current.innerText = t;
  }, [value]);
  const Tag: any = as;
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={(e: any) => onChange(e.currentTarget.innerText)}
      className={
        className +
        " inline-block align-baseline" +
        (dashed
          ? " outline outline-2 outline-dashed outline-emerald-600/60 rounded-lg px-1 -mx-1"
          : "")
      }
      style={style}
    />
  );
};

const OutreachPage: React.FC = () => {
  const [content, setContent] = useOutreachContent();
  const { setText, inlineOn } = useInlineTextHelpers(content, setContent);
  const txt = content.text ?? {};

  // —— 处理可选的标题分段（保持你原有的“—”后半段为薄荷绿样式）——
  const rawTitle = txt.heroTitle ?? "Our Outreach — Community & Events";
  const splitIdx = rawTitle.indexOf("—");
  const titleLeft  = splitIdx >= 0 ? rawTitle.slice(0, splitIdx).trim() : rawTitle;
  const titleRight = splitIdx >= 0 ? rawTitle.slice(splitIdx + 1).trim() : "";

  return (
    <main className="min-h-[100svh] w-full text-[var(--brand-ink)] relative" style={{ background: "transparent" }}>
      <GlobalBackground />

      <div style={{ position: "relative", zIndex: 1 }}>
        <MainNav />

        {/* ================= HERO ================= */}
        <section aria-label="Outreach hero" className="relative w-full">
          <style>{`
            .hero-wrap{position:relative; width:100%;}
            .hero-min{min-height:560px}
            @media (min-width:768px){.hero-min{min-height:720px}}
            @media (min-width:1280px){.hero-min{min-height:780px}}
            .goo{filter:url('#gooey')}
            .blob{position:absolute; border-radius:50%; opacity:.72; filter:blur(28px)}
            .b1{width:520px;height:520px; left:8%; top:14%; background:radial-gradient(60% 60% at 40% 40%, rgba(1,113,81,.35), rgba(1,113,81,.18) 60%, transparent 70%); animation:float1 16s ease-in-out infinite alternate}
            .b2{width:360px;height:360px; right:10%; top:18%; background:radial-gradient(55% 55% at 50% 50%, rgba(116,231,192,.30), rgba(1,113,81,.16) 60%, transparent 70%); animation:float2 18s ease-in-out infinite alternate}
            .b3{width:420px;height:420px; left:22%; bottom:6%; background:radial-gradient(55% 55% at 55% 55%, rgba(1,113,81,.22), rgba(1,113,81,.12) 60%, transparent 70%); animation:float3 22s ease-in-out infinite alternate}
            @keyframes float1{0%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(16px,-12px,0) scale(1.06)} 100%{transform:translate3d(-8px,8px,0) scale(1.02)}}
            @keyframes float2{0%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(-14px,10px,0) scale(1.05)} 100%{transform:translate3d(10px,-8px,0) scale(1.03)}}
            @keyframes float3{0%{transform:translate3d(0,0,0) scale(1)} 50%{transform:translate3d(10px,10px,0) scale(1.04)} 100%{transform:translate3d(-10px,-6px,0) scale(1.02)}}
            .glass{
              position:relative; border-radius:24px; background:rgba(255,255,255,.10);
              backdrop-filter:blur(14px) saturate(120%);
              border:1px solid rgba(255,255,255,.22); box-shadow:0 18px 60px rgba(0,0,0,.22)
            }
            .glass::before{content:""; position:absolute; inset:-1px; border-radius:inherit; padding:1px; background:linear-gradient(180deg, rgba(255,255,255,.7), rgba(255,255,255,.06)); -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude;}
            .glass::after{content:""; position:absolute; left:6%; right:30%; top:0; height:70px; border-radius:0 0 100px 100px; background:linear-gradient(180deg, rgba(255,255,255,.55), transparent); filter:blur(2px); opacity:.85}
            
            /* 让装饰层不拦截点击 */
            .goo{ filter:url('#gooey'); pointer-events:none; }
            .blob{ position:absolute; border-radius:50%; opacity:.72; filter:blur(28px); pointer-events:none; }

            /* glass 的伪元素在内容之上，必须关掉事件 */
            .glass::before,
            .glass::after{ pointer-events:none; }

            /* 保险起见：按钮抬高一层 */
            .glass .btn-brand,
            .glass .btn-white{ position: relative; z-index: 1; }

          `}</style>

          <svg width="0" height="0" style={{position:'absolute'}} aria-hidden>
            <filter id="gooey">
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -8" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </svg>

          <div
            className="hero-wrap hero-min relative w-full bg-center bg-cover"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(1,113,81,0.65), rgba(6,13,12,0.55)), url(${heroImg})`,
            }}
          >
            <div className="absolute inset-0 goo" aria-hidden>
              <span className="blob b1" />
              <span className="blob b2" />
              <span className="blob b3" />
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24">
              <div className="max-w-5xl glass p-6 md:p-10">
                {/* kicker */}
                <div className="kicker mb-3">
                  {inlineOn ? (
                    <InlineText
                      value={txt.heroKicker ?? "OUTREACH"}
                      onChange={(v) => setText({ heroKicker: v })}
                    />
                  ) : (
                    txt.heroKicker ?? "OUTREACH"
                  )}
                </div>

                {/* title */}
                <h1 className="heading-xl " style={{ color: "#fff" }}>
                  {inlineOn ? (
                    <InlineText
                      as="div"
                      value={txt.heroTitle ?? "Our Outreach — Community & Events"}
                      onChange={(v) => setText({ heroTitle: v })}
                      className="leading-tight"
                    />
                  ) : splitIdx >= 0 ? (
                    <>
                      {titleLeft} — <span style={{ color: "var(--accent-mint)" }}>{titleRight}</span>
                    </>
                  ) : (
                    titleLeft
                  )}
                </h1>

                {/* subtitle */}
                <p className="mt-4 text-white/85 text-base md:text-lg max-w-3xl">
                  {inlineOn ? (
                    <InlineText
                      as="div"
                      value={
                        txt.heroSubtitle ??
                        "Discover hands-on activities, competitions, and guided lab visits designed to spark curiosity and build confidence."
                      }
                      onChange={(v) => setText({ heroSubtitle: v })}
                      className="leading-relaxed"
                    />
                  ) : (
                    txt.heroSubtitle ??
                    "Discover hands-on activities, competitions, and guided lab visits designed to spark curiosity and build confidence."
                  )}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a className="btn-brand" href={txt.heroCta1Href || "#events"}>{txt.heroCta1Label ?? "Explore events"}</a>
                  <a className="btn-white" href={txt.heroCta2Href || "#future"}>{txt.heroCta2Label ?? "Share an idea"}</a>
                </div>
              </div>
            </div>

            <svg className="absolute -bottom-px left-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
              <path d="M0,40 C280,70 560,0 840,30 C1080,55 1260,50 1440,20 L1440,60 L0,60 Z" fill="var(--page-bg)" />
            </svg>
          </div>
        </section>

        {/* 浮动 Admin 面板（只放一个实例） */}
        <OutreachAdminInline content={content} onChange={setContent} />

        {/* ================= CYLINDER ================= */}
        <FullBleed className="py-6 md:py-8" style={{ background: "transparent" }}>
          <div className="w-full px-2 md:px-6">
            <CylinderCarousel
              items={content.carousel}
              height={620}
              yOffset={-36}
              cardWidthPct={0.33}
              cardMin={300}
              cardMax={720}
              tiltOnHover
              glass
              showArrows
              showDots
              dofStrength={0.22}
              snapOnRelease={false}
              autoplay={true}
              pauseOnHover={true}
              autoSpeed={22}
              momentumOnRelease={true}
            />
          </div>
        </FullBleed>

        {/* ================= EVENTS GRID ================= */}
        <section id="events" className="scroll-mt-24">
          <EventShowcase
            events={content.events}
            kicker={txt.eventsKicker ?? "EVENTS"}
            title={txt.eventsTitle ?? "Explore events"}
            subtitle={txt.eventsSubtitle ?? "Click a card to view details"}
            inlineControls={
              inlineOn ? {
                kicker:   { value: txt.eventsKicker ?? "EVENTS", onChange: v => setText({ eventsKicker: v }) },
                title:    { value: txt.eventsTitle  ?? "Explore events", onChange: v => setText({ eventsTitle: v }) },
                subtitle: { value: txt.eventsSubtitle ?? "Click a card to view details", onChange: v => setText({ eventsSubtitle: v }) },
              } : undefined
            }
          />
        </section>


        {/* ================= STATS ================= */}
        <FullBleed className="py-10 md:py-16" style={{ background: "transparent" }}>
          <div className="mx-auto w-full max-w-[1280px] px-6">
            <OutreachAnimatedStats
              kicker={content.stats.kicker}
              title={content.stats.title}
              subtitle={content.stats.subtitle}
              items={content.stats.items}
              cols={content.stats.cols}
              donutTitle={content.stats.donutTitle}
              donutItems={content.stats.donutItems}
              donutSize={content.stats.donutSize}
              donutThickness={content.stats.donutThickness}
              inlineControls={inlineOn ? {
                kicker:   { value: content.stats.kicker   ?? "MOMENTS", onChange: v => setContent({ ...content, stats: { ...content.stats, kicker: v } }) },
                title:    { value: content.stats.title    ?? "Outreach impact", onChange: v => setContent({ ...content, stats: { ...content.stats, title: v } }) },
                subtitle: { value: content.stats.subtitle ?? "Highlights…", onChange: v => setContent({ ...content, stats: { ...content.stats, subtitle: v } }) },
              } : undefined}
            />
          </div>
        </FullBleed>
        {/* ================= FUTURE PLANS ================= */}
        <section id="future" className="scroll-mt-24">
          <FuturePlans
            kicker={txt.futureKicker ?? content.future.kicker}
            title={txt.futureTitle ?? content.future.title}
            subtitle={txt.futureSubtitle ?? content.future.subtitle}
            inlineControls={inlineOn ? {
              kicker:   { value: txt.futureKicker ?? (content.future.kicker || "FUTURE"), onChange: v => setText({ futureKicker: v }) },
              title:    { value: txt.futureTitle  ?? (content.future.title  || "Future plans"), onChange: v => setText({ futureTitle: v }) },
              subtitle: { value: txt.futureSubtitle ?? (content.future.subtitle || "Write down your event ideas and suggestions for us!"), onChange: v => setText({ futureSubtitle: v }) },
            } : undefined}
          />
        </section>
        {/* ================= NEWSLETTER CTA ================= */}
        <FullBleed className="mx-auto my-20 md:my-24 max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-2xl border border-black/[.06] bg-white p-6 shadow-[0_10px_50px_rgba(0,0,0,0.06)]">
            <div className="relative grid items-center gap-4 md:grid-cols-[1fr_auto]">
              <div>
                <div className="text-lg font-semibold" style={{ color: "var(--brand)" }}>Stay up to date</div>
                <p className="text-sm text-[color:var(--brand-ink)]/70">Get the latest updates from BIOTech Futures directly to your inbox.</p>
              </div>
              <a
                href="/news/news"
                className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-white"
                style={{ background: "var(--brand)", border: "1px solid var(--brand-24)", boxShadow:"0 10px 26px var(--brand-16)" }}
              >
                Subscribe
              </a>
            </div>
          </div>
        </FullBleed>

        <div className="h-1" />
        <Cards />
        <MomentsMarquee />
        <Footer />
      </div>
    </main>
  );
};

export default OutreachPage;
