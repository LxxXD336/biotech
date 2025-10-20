import React, { useState } from "react";
import { Link } from "react-router-dom";
import { leaf as mainPagePic, picMainPage2 as mainPagePic2 } from "./assets/images";
/**
 * BIOTech Futures — Home (Animated Refresh)
 * - Pure React + CSS (no extra libs)
 * - Parallax hero, blobs, reveal on scroll, tilt cards, marquee
 * - Consistent section styling + interactive Goals/Values tabs
 */

const COLORS = {
  green: "#017151",
  charcoal: "#174243",
  white: "#FFFFFF",
  black: "#000000",
  lightBG: "#F6FBF9",
  mint: "#5EA99E",
  navy: "#1A345E",
  blue: "#396B7B",
  yellow: "#F1E5A6",
  lime: "#B6F0C2",
};

const BASE = import.meta.env.BASE_URL || "/";

/* ---------- Universal Container (响应式最大宽度) ---------- */
const Container = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`btf-container ${className}`}>{children}</div>;

/* ---------- Tiny utilities ---------- */

function useReveal() {
  const callback = (el: HTMLElement | null) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("reveal-in");
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
  };
  return callback;
}

const PageSection = ({
  children,
  bg = COLORS.white,
  id,
}: {
  children: React.ReactNode;
  bg?: string;
  id?: string;
}) => (
  <section id={id} className="w-full" style={{ backgroundColor: bg }}>
    <Container className="py-16 md:py-20">{children}</Container>
  </section>
);

const DashList = ({ items }: { items: string[] }) => (
  <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
    {items.map((t, i) => (
      <li
        key={i}
        className="mb-2 leading-relaxed"
        style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}
      >
        <span
          style={{
            color: COLORS.green,
            marginRight: 10,
            fontWeight: 700,
            display: "inline-block",
            transform: "translateY(-1px)",
          }}
        >
          —
        </span>
        {t}
      </li>
    ))}
  </ul>
);

/* ---------- Top Nav ---------- */

const Nav = () => (
    <nav
        className="w-full border-b backdrop-blur-sm sticky top-0 z-30"
        style={{ borderColor: "#E6F3EE", backgroundColor: "rgba(255,255,255,0.85)" }}
    >
      <Container className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
              className="rounded-full w-9 h-9 flex items-center justify-center ring-2 ring-[#E6F3EE]"
              style={{ backgroundColor: COLORS.green }}
              aria-hidden
          >
          <span className="text-white text-sm" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
            B
          </span>
          </div>
          <span
              className="text-lg font-semibold"
              style={{ color: COLORS.green, fontFamily: "Arial, Helvetica, sans-serif" }}
          >
          BIOTech Futures
        </span>
        </div>

        <div className="hidden md:flex items-center gap-9">
          {["About", "How to enter", "Work with us", "Symposium", "Satellite"].map((l) => (
              <a
                  key={l}
                  href="#"
                  style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}
                  className="text-lg hover:underline font-medium"
              >
                {l}
              </a>
          ))}

          <a
              href={`${BASE}gallery.html`}
              style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}
              className="text-lg hover:underline font-medium"
          >
            Gallery
          </a>

          <a
              href={`${BASE}news.html`}
              style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}
              className="text-lg hover:underline font-medium"
          >
            News
          </a>

          <a
              href="#"
              className="px-5 py-2.5 rounded-xl text-white text-lg font-semibold hover:opacity-95 transition"
              style={{
                backgroundColor: COLORS.blue,
                fontFamily: "Arial, Helvetica, sans-serif",
                boxShadow: "0 6px 16px rgba(57,107,123,0.25)",
              }}
          >
            Log in
          </a>
        </div>
      </Container>
    </nav>
);


/* ---------- Hero with parallax ---------- */

const Hero = () => (
  <div className="relative w-full overflow-hidden select-none">
    {/* Parallax container */}
    <div
      className="w-full h-[420px] md:h-[520px] will-change-transform"
      style={{
        backgroundImage: `url(${mainPagePic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        transform: "translateZ(0)",
      }}
      onMouseMove={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        const rect = el.getBoundingClientRect();
        const cx = (e.clientX - rect.left) / rect.width - 0.5;
        const cy = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.backgroundPosition = `${50 + cx * 4}% ${50 + cy * 4}%`;
      }}
    />

    {/* overlay for contrast */}
    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(23,66,67,0.55), rgba(23,66,67,0.35))" }} />

    {/* floating blobs */}
    <span className="blob blob-a" />
    <span className="blob blob-b" />
    <span className="blob blob-c" />

    {/* headline */}
    <div className="absolute inset-0 flex items-center">
      <Container>
        <p
          className="mb-2 text-base text-lime-50"
          style={{ fontFamily: '"Times New Roman", Times, serif', fontStyle: "italic" }}
        >
          Learn more about BIOTech Futures
        </p>
        <h1
          className="hero-type text-white text-6xl md:text-8xl font-extrabold leading-tight max-w-none"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          OUR MISSION & VALUES
        </h1>
        <div className="mt-5 flex gap-3">
          <a href={`${BASE}gallery.html`} className="btn-primary" aria-label="View Gallery">View Gallery</a>
          <a href="#" className="btn-ghost">How to enter</a>
        </div>
      </Container>
    </div>
  </div>
);

/* ---------- Intro (consistent styling + interactive tabs) ---------- */

const Intro = () => {
  const refLeft = useReveal();
  const refRight = useReveal();
  const [tab, setTab] = useState<"goals" | "values">("goals");

  return (
    <PageSection bg={COLORS.white}>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Left */}
        <div ref={refLeft} className="reveal">
          <span className="pill">FOUNDATION</span>
          <h2 className="section-title mt-4">THE START OF BIOTECH FUTURES</h2>

          <div className="section-body">
            <p className="mb-3">
              <em style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                Founded by Prof. Hala Zreiqat AM
              </em>
            </p>
            <p>
              The vision for BIOTech Futures began nearly a decade ago, connecting researchers with
              high school students around the world to inspire the leaders of tomorrow.
            </p>
          </div>

          {/* Our goals / Our values tabs */}
          <div className="btf-tabs mt-6" role="tablist" aria-label="Goals and Values">
            <button
              role="tab"
              aria-selected={tab === "goals"}
              className={`tab-btn ${tab === "goals" ? "active" : ""}`}
              onClick={() => setTab("goals")}
            >
              Our goals
            </button>
            <button
              role="tab"
              aria-selected={tab === "values"}
              className={`tab-btn ${tab === "values" ? "active" : ""}`}
              onClick={() => setTab("values")}
            >
              Our values
            </button>
            <span
              className="tab-underline"
              style={{ transform: tab === "goals" ? "translateX(0)" : "translateX(100%)" }}
              aria-hidden
            />
          </div>

          <div className="tab-panel reveal-in" role="tabpanel">
            {tab === "goals" ? (
              <ul className="tick-list">
                <li>Build bridges between research and students</li>
                <li>Promote curiosity, creativity, and impact</li>
                <li>Grow a diverse community of future leaders</li>
              </ul>
            ) : (
              <ul className="tick-list">
                <li>Integrity and openness</li>
                <li>Collaboration across disciplines</li>
                <li>Equity, diversity, and inclusion</li>
              </ul>
            )}
          </div>
        </div>

        {/* Right */}
        <div ref={refRight} className="reveal">
          <div
            className="rounded-2xl p-3 tilt"
            style={{ border: `4px solid ${COLORS.green}`, backgroundColor: COLORS.lightBG }}
          >
            <img
              src={mainPagePic2}
              alt="Founder"
              className="w-full h-80 object-cover rounded-xl"
            />
          </div>
        </div>
      </div>
    </PageSection>
  );
};

/* === Reusable Section system =================================== */

type SectionBlockProps = {
  id?: string;
  tag: string;
  title: string;
  body: React.ReactNode;
  tone?: "white" | "light" | "brief";
  imageSrc?: string;
  imageAlt?: string;
  imageSide?: "left" | "right";
  ctaText?: string;
  ctaHref?: string;
  internal?: boolean;
};

const SectionBlock = ({
  id,
  tag,
  title,
  body,
  tone = "white",
  imageSrc,
  imageAlt,
  imageSide = "right",
  ctaText,
  ctaHref,
  internal,
}: SectionBlockProps) => {
  const refContent = useReveal();
  const refImage = useReveal();

  const bg =
    tone === "brief"
      ? "linear-gradient(135deg, #C6EFBF 0%, #BDE8B6 100%)"
      : tone === "light"
      ? COLORS.lightBG
      : COLORS.white;

  const content = (
    <div ref={refContent} className="reveal">
      <span className="pill">{tag}</span>
      <h2 className="section-title">{title}</h2>
      <div className="section-body">{body}</div>
      {ctaText && ctaHref ? (
        internal ? (
          <Link to={ctaHref} className="btn-outline mt-4 inline-block">
            {ctaText}
          </Link>
        ) : (
          <a href={ctaHref} className="btn-outline mt-4 inline-block">
            {ctaText}
          </a>
        )
      ) : null}
    </div>
  );

  const image = imageSrc ? (
    <div ref={refImage} className="reveal">
      <div className="img-tilt">
        <img
          src={imageSrc}
          alt={imageAlt || ""}
          className="w-full h-80 object-contain md:object-cover rounded-xl"
        />
      </div>
    </div>
  ) : null;

  return (
    <section id={id} style={{ background: bg }}>
      <Container className="py-16 md:py-20">
        <div className={`grid gap-10 md:grid-cols-2 items-start ${imageSide === "left" ? "md:[direction:rtl]" : ""}`}>
          <div className={`${imageSide === "left" ? "[direction:ltr]" : ""}`}>{content}</div>
          <div className={`${imageSide === "left" ? "[direction:ltr]" : ""}`}>{image}</div>
        </div>
      </Container>
    </section>
  );
};

/* ---- Five configured sections ---- */

const WhatIsItSection = () => (
  <SectionBlock
    id="what"
    tag="WHAT IS IT?"
    title="A HEAD START FOR THE BRIGHTEST YOUNG MINDS"
    body={
      <p>
        BIOTech Futures is an innovation and mentorship program that empowers high school students to
        think creatively about science-inspired solutions across medicine, health, sustainable environment,
        emerging technologies, regulations and ethics.
      </p>
    }
    tone="white"
    imageSrc={mainPagePic2}
    imageAlt="Students and mentors"
    imageSide="right"
  />
);

const OutreachEventsSection = () => (
  <SectionBlock
    id="outreach"
    tag="OUTREACH"
    title="OUR OUTREACH AND EVENTS"
    body={<p>From school visits to lab open days and our annual symposium, we bring hands-on science to classrooms and communities.</p>}
    tone="light"
    imageSrc={mainPagePic2}
    imageAlt="Outreach"
    imageSide="right"
    ctaText="See Outreach & Events"
    ctaHref="/outreach"
    internal
  />
);

const RefiningEducationSection = () => (
  <SectionBlock
    id="education"
    tag="REFINING EDUCATION"
    title="A PLATFORM THAT SUPPORTS OUR COMMUNITY"
    body={<p>Our upgraded portal helps participants, mentors, and supervisors track events, collaborate, and learn — all in one place.</p>}
    tone="white"
    imageSrc={mainPagePic2}
    imageAlt="Platform"
    imageSide="left"
    ctaText="Open the portal"
    ctaHref="#"
  />
);

const TheBriefSection = () => (
  <SectionBlock
    id="brief"
    tag="THE BRIEF"
    title="DESIGN SOMETHING THAT SOLVES A PROBLEM"
    body={<p>The competition invites Years 9–12 to apply simple, clever engineering and science to real-world problems with creativity and collaboration.</p>}
    tone="brief"
    imageSrc={mainPagePic2}
    imageAlt="Professor explaining"
    imageSide="right"
    ctaText="Find out how to enter"
    ctaHref="#"
  />
);

const PrizesSection = () => (
  <SectionBlock
    id="prizes"
    tag="PRIZES"
    title="WHAT'S AT STAKE?"
    body={<p>Boost your confidence, supercharge your STEM path, and win great prizes — while creating something you can be proud of.</p>}
    tone="white"
    imageSrc={mainPagePic2}
    imageAlt="Awards"
    imageSide="left"
    ctaText="See prizes"
    ctaHref="#"
  />
);

/* ---- Bundle + local styles ---- */

const HomeSectionsBundle = () => (
  <>
    <SectionsStyle />
    <WhatIsItSection />
    <OutreachEventsSection />
    <RefiningEducationSection />
    <TheBriefSection />
    <PrizesSection />
  </>
);

function SectionsStyle() {
  return (
    <style>{`
/* pills, titles, body text */
.pill {
  display:inline-block;padding:10px 16px;border-radius:999px;font-weight:700;
  color:#fff;background:${COLORS.green};letter-spacing:.5px;
}
.section-title{
  margin-top:22px;font-size:clamp(28px,5vw,64px);font-weight:900;line-height:1.05;letter-spacing:-0.5px;
}
.section-body{ margin-top:18px;font-size:clamp(16px,1.6vw,22px);line-height:1.6; }
/* CTA outline button */
.btn-outline{
  border:2px solid ${COLORS.charcoal};color:${COLORS.charcoal};padding:10px 16px;border-radius:14px;
  text-decoration:none;transition:transform .15s ease, background .15s ease, box-shadow .15s ease;
}
.btn-outline:hover{ transform:translateY(-1px); background:rgba(0,0,0,.03); box-shadow:0 10px 20px rgba(0,0,0,.06); }
/* image hover tilt */
.img-tilt{ transition:transform .25s ease, box-shadow .25s ease; border-radius:16px; overflow:hidden; }
.img-tilt:hover{ transform:rotate(-1.2deg) translateY(-2px); box-shadow:0 16px 36px rgba(0,0,0,0.12); }
`}</style>
  );
}

/* ---------- Action Cards ---------- */

const Cards = () => {
  const ref = useReveal();
  const items = [
    { title: "How to enter", text: "Steps for students and schools to participate in upcoming challenges.", href: "/getting-started", tone: COLORS.lime, type: "internal" },
    { title: "Symposium", text: "Explore highlights and resources from our annual gathering.", href: "/past-winners", tone: "#D6F0FF", type: "internal" },
    { title: "Work with us", text: "Partner with BIOTech Futures to mentor and support young innovators.", href: "/mentorship", tone: COLORS.yellow, type: "internal" },
    { title: "Gallery", text: "Browse photos from events, workshops, and projects.", href: "/gallery.html", tone: COLORS.lightBG, type: "external" },
  ];

  return (
    <PageSection bg={COLORS.lightBG} id="get-involved">
      <div ref={ref} className="reveal">
        <h2 className="text-2xl md:text-3xl font-bold mb-7" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>
          Get involved
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((c) =>
            c.type === "internal" ? (
              <Link key={c.title} to={c.href} className="card-tilt" style={{ backgroundColor: c.tone }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>{c.title}</h3>
                <p className="text-[15px]" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>{c.text}</p>
              </Link>
            ) : (
              <a key={c.title} href={c.href} className="card-tilt" style={{ backgroundColor: c.tone }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>{c.title}</h3>
                <p className="text-[15px]" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>{c.text}</p>
              </a>
            )
          )}
        </div>
      </div>
    </PageSection>
  );
};

/* ---------- Marquee ---------- */

const MomentsMarquee = () => (
  <div style={{ background: COLORS.white }}>
    <Container className="px-0 py-8 overflow-hidden">
      <div className="marquee">
        {["Inspiration", "Workshops", "Teamwork", "Innovation", "Mentors", "Showcase"].map((w, i) => (
          <span key={i} className="marquee-item">{w}</span>
        ))}
        {["Inspiration", "Workshops", "Teamwork", "Innovation", "Mentors", "Showcase"].map((w, i) => (
          <span key={`dup-${i}`} className="marquee-item">{w}</span>
        ))}
      </div>
    </Container>
  </div>
);

/* ---------- Footer ---------- */


const Footer = () => (
  <footer style={{ backgroundColor: COLORS.green }}>
    <div className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-6 text-white">
      {/* 左侧品牌信息 */}
      <div>
        <h4
          className="font-bold mb-2"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          BIOTech Futures
        </h4>
        <p
          className="text-white/90 text-sm"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Inspiring the future leaders of science and innovation.
        </p>
      </div>

      {/* 中间 quick links */}
      <div>
        <h4
          className="font-bold mb-2"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Quick links
        </h4>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              to="/"
              className="hover:underline text-white"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              About
            </Link>
          </li>
          <li>
            <a
              href="#"
              className="hover:underline text-white"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              News
            </a>
          </li>
          <li>
            <a
              href="#"
              className="hover:underline text-white"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              Contact
            </a>
          </li>
          <li>
            <a
              href="#"
              className="hover:underline text-white"
              style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
            >
              Privacy
            </a>
          </li>
        </ul>
      </div>

      {/* 右侧订阅 */}
      <div>
        <h4
          className="font-bold mb-2"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Subscribe
        </h4>
        <form className="flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            className="flex-1 px-3 py-2 rounded-md text-black"
            style={{
              border: `1px solid ${COLORS.lime}`,
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md text-black hover:opacity-95 transition"
            style={{
              backgroundColor: COLORS.yellow,
              fontFamily: "Arial, Helvetica, sans-serif",
            }}
          >
            Sign up
          </button>
        </form>
      </div>
    </div>
  </footer>
);
/* ---------- Page ---------- */

export default function BTF_Redesign() {
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", color: COLORS.charcoal }}>
      <StyleInject />
      <Nav />
      <Hero />
      <Intro />
      <HomeSectionsBundle />
      <Cards />
      <MomentsMarquee />
      <Footer />
    </div>
  );
}

/* ---------- CSS-in-JS ---------- */

function StyleInject() {
  return (
    <style>{`
/* ========= Responsive container ========= */
.btf-container{
  width:100%;
  margin-left:auto; margin-right:auto;
  padding-left:1.5rem; padding-right:1.5rem; /* px-6 */
  /* 小屏不拉满行长，阅读友好 */
  max-width: 720px;
}
@media (min-width: 768px){ .btf-container{ max-width: 900px; padding-left:2.5rem; padding-right:2.5rem; } }   /* md */
@media (min-width: 1024px){ .btf-container{ max-width: 1100px; } }                                     /* lg */
@media (min-width: 1280px){ .btf-container{ max-width: 1280px; } }                                     /* xl */
@media (min-width: 1536px){ .btf-container{ max-width: 1440px; } }                                     /* 2xl */
@media (min-width: 1920px){ .btf-container{ max-width: 1600px; } }                                     /* FHD+ */
@media (min-width: 2560px){ .btf-container{ max-width: 1800px; } }                                     /* 超宽屏 */

/* Links underline animation */
.link-animated { position: relative; text-decoration: none; }
.link-animated::after {
  content: ""; position: absolute; left: 0; bottom: -4px; height: 2px; width: 0;
  background: ${COLORS.green}; transition: width .25s ease;
}
.link-animated:hover::after { width: 100%; }

/* --- Tabs (match section styling) --- */
.btf-tabs {
  position: relative;
  display: inline-grid;
  grid-auto-flow: column;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: #F1F6F4;
  border: 1px solid #E2EEE8;
}
.tab-btn {
  position: relative;
  z-index: 1;
  appearance: none;
  border: 0;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 700;
  letter-spacing: .2px;
  background: transparent;
  color: ${COLORS.charcoal};
  cursor: pointer;
  transition: transform .12s ease;
}
.tab-btn:hover { transform: translateY(-1px); }
.tab-btn.active { color: ${COLORS.white}; }
.tab-underline {
  position: absolute;
  top: 6px; left: 6px;
  width: calc(50% - 6px); height: calc(100% - 12px);
  border-radius: 10px;
  background: ${COLORS.green};
  box-shadow: 0 10px 22px rgba(1,113,81,.25);
  transition: transform .2s ease;
}

/* --- Animated tick list --- */
.tick-list { 
  list-style: none; padding-left: 0; margin-top: 14px;
  display: grid; gap: 10px;
}
.tick-list li {
  position: relative; padding-left: 28px;
  line-height: 1.6;
  will-change: transform, opacity;
  animation: slideIn .35s ease var(--d, 0s) both;
}
.tick-list li::before {
  content: "✔";
  position: absolute; left: 0; top: 0;
  font-weight: 900;
  color: ${COLORS.green};
}
.tick-list li:nth-child(1){ --d: .02s; }
.tick-list li:nth-child(2){ --d: .08s; }
.tick-list li:nth-child(3){ --d: .14s; }
@keyframes slideIn {
  from { opacity: 0; transform: translateY(6px) }
  to   { opacity: 1; transform: translateY(0) }
}

/* Hero headline type-in */
.hero-type {
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1.05;
  letter-spacing: 0.4px;
  overflow: hidden; white-space: nowrap; border-right: 3px solid rgba(255,255,255,.8);
  animation: typing 2.2s steps(22, end), blink .9s step-end infinite alternate;
  max-width: 22ch;
}
@keyframes typing { from { width: 0 } to { width: 22ch } }
@keyframes blink { 50% { border-color: transparent } }

/* Floating blobs */
.blob { position: absolute; border-radius: 9999px; filter: blur(20px); opacity: .45; }
.blob-a { width: 180px; height: 180px; background: ${COLORS.lime}; top: 12%; left: 10%; animation: float 9s ease-in-out infinite; }
.blob-b { width: 140px; height: 140px; background: ${COLORS.yellow}; bottom: 10%; right: 14%; animation: float 7.5s ease-in-out infinite reverse; }
.blob-c { width: 120px; height: 120px; background: #D6F0FF; bottom: 22%; left: 22%; animation: float 8.5s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }

/* Reveal on scroll */
.reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
.reveal-in { opacity: 1 !important; transform: translateY(0) !important; }

/* Soft cards and tilt interactions */
.card-soft {
  background: #fff; border: 1px solid #E8F1ED; border-radius: 16px; padding: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.05);
}
.card-tilt {
  display: block; text-decoration: none; border-radius: 18px; padding: 20px; background: #fff;
  box-shadow: 0 10px 24px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04);
  transform: perspective(600px) rotateX(0) rotateY(0) translateY(0);
  transition: transform .18s ease, box-shadow .18s ease;
  will-change: transform;
}
.card-tilt:hover {
  transform: perspective(600px) rotateX(2deg) rotateY(-2deg) translateY(-2px);
  box-shadow: 0 16px 36px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.05);
}
.tilt { transition: transform .25s ease; }
.tilt:hover { transform: rotate(-1.2deg) translateY(-2px); }

/* Buttons */
.btn-primary {
  display: inline-block; padding: 10px 16px; border-radius: 14px; color: #fff; text-decoration: none;
  background: ${COLORS.green}; box-shadow: 0 10px 24px rgba(1,113,81,0.35); transition: transform .15s ease, box-shadow .15s ease;
}
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(1,113,81,0.45); }
.btn-ghost {
  display: inline-block; padding: 10px 16px; border-radius: 14px; text-decoration: none; color: #fff;
  border: 2px solid rgba(255,255,255,.9); transition: background .15s ease, color .15s ease;
}
.btn-ghost:hover { background: rgba(255,255,255,.15); }

/* Marquee ribbon */
.marquee {
  display: flex; gap: 28px; white-space: nowrap; will-change: transform;
  animation: marquee 18s linear infinite;
}
.marquee-item {
  font-weight: 700; letter-spacing: .6px; padding: 10px 18px; border-radius: 999px;
  color: ${COLORS.navy}; background: #EAF7F1; border: 1px solid #DCEFE7;
}
@keyframes marquee {
  from { transform: translateX(0) }
  to   { transform: translateX(-50%) }
}
    `}</style>
  );
}
