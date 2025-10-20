import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { COLORS, Container } from "./components/common";
import MainNav from "./components/MainNav";
import StyleInject from "./components/StyleInject";
import { SectionsStyle } from "./sections/home/Sections";
import Cards from "./sections/home/Cards";
import Footer from "./sections/home/Footer";
import MomentsMarquee from "./sections/home/MomentsMarquee";
import halaPhoto from "./Photo/Team_member_photos/prof.Hala-Zreiqat AM.avif";

// Helper to derive a readable filename for downloads (PDF/Image/Data URL)
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

// Safely access import.meta in both Vite and Jest/Node test environments
const getImportMeta = (): any => {
  try {
    // Avoid direct syntax so CommonJS/older TS configs don't choke during tests
    // eslint-disable-next-line no-new-func
    return (0, eval)("import.meta");
  } catch {
    return {} as any;
  }
};

const globAssets = (pattern: string) => {
  const meta = getImportMeta() as any;
  const globFn: ((p: string, opts: any) => Record<string, string>) | undefined =
    typeof meta?.glob === "function" ? meta.glob.bind(meta) : undefined;
  if (globFn) {
    try {
      return globFn(pattern, { eager: true, as: "url" }) as Record<string, string>;
    } catch {
      /* ignore and fall back */
    }
  }
  return {} as Record<string, string>;
};

// Lightweight SVG placeholder used as a resilient fallback
const FALLBACK_IMG =
  "data:image/svg+xml;utf8,"
  + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 630'>
      <defs>
        <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0%' stop-color='#E8F1ED'/>
          <stop offset='100%' stop-color='#CFE8DF'/>
        </linearGradient>
      </defs>
      <rect width='1200' height='630' fill='url(#g)'/>
      <g fill='#0b3836' fill-opacity='0.3'>
        <circle cx='200' cy='160' r='90'/>
        <circle cx='980' cy='460' r='110'/>
      </g>
    </svg>`
  );

// Use local images from AboutPage_resource
const ABOUT_IMGS = Object.values(
  globAssets("./Photo/AboutPage_resource/*.{png,PNG,jpg,JPG,jpeg,JPEG,avif,AVIF,webp,WEBP}")
) as string[];

const HERO_BG_DEFAULT = ABOUT_IMGS[0] ?? FALLBACK_IMG;
const VALUES_IMGS_DEFAULT = [
  ABOUT_IMGS[1] ?? ABOUT_IMGS[0] ?? FALLBACK_IMG,
  ABOUT_IMGS[2] ?? ABOUT_IMGS[0] ?? FALLBACK_IMG,
  ABOUT_IMGS[3] ?? ABOUT_IMGS[0] ?? FALLBACK_IMG,
];
const CTA_IMG_DEFAULT = ABOUT_IMGS[4] ?? ABOUT_IMGS[1] ?? FALLBACK_IMG;

 


function GlobalBackground({ scoped = false }: { scoped?: boolean }) {
  const base = scoped ? "about-bgfx-scope" : "about-bgfx";
  return (
    <>
      <style>{`
        .about-bgfx{position:fixed; inset:0; pointer-events:none; z-index:0}
        .about-bgfx-scope{position:absolute; inset:0; pointer-events:none; z-index:0}
        .about-bgfx-base{ background:${COLORS.lightBG}; }
        .about-bgfx-aurora{ filter: blur(80px); opacity:.75; }
        .about-bgfx-aurora-b{ opacity:.55; }
        .about-bgfx-aurora-a{
          animation: about-driftA 26s ease-in-out infinite alternate;
          background:
            radial-gradient(38% 46% at 12% 20%, rgba(76,175,140,.35), transparent 62%),
            radial-gradient(36% 42% at 86% 18%, rgba(26,115,232,.24), transparent 64%);
        }
        .about-bgfx-aurora-b{
          animation: about-driftB 34s ease-in-out infinite alternate;
          background:
            radial-gradient(44% 54% at 78% 84%, rgba(255,181,67,.28), transparent 68%),
            radial-gradient(28% 34% at 18% 86%, rgba(13,140,116,.22), transparent 62%);
        }
        @keyframes about-driftA{ 0%{ transform: translate3d(-4%, -2%, 0) scale(1.02) } 50%{ transform: translate3d(4%, 1%, 0) scale(1.06) } 100%{ transform: translate3d(-2%, 3%, 0) scale(1.03) } }
        @keyframes about-driftB{ 0%{ transform: translate3d(2%, 3%, 0) scale(1.03) } 50%{ transform: translate3d(-3%, -2%, 0) scale(1.06) } 100%{ transform: translate3d(3%, -1%, 0) scale(1.02) } }
        .about-bgfx-grid{
          background-image:
            linear-gradient(to right, rgba(0,0,0,.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,.035) 1px, transparent 1px);
          background-size:24px 24px; opacity:.12;
        }
        .about-bgfx-noise{opacity:.06; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");}
      `}</style>
      <div className={`${base} about-bgfx-base`} />
      <div className={`${base} about-bgfx-aurora about-bgfx-aurora-a`} />
      <div className={`${base} about-bgfx-aurora about-bgfx-aurora-b`} />
      <div className={`${base} about-bgfx-grid`} />
      <div className={`${base} about-bgfx-noise`} />
    </>
  );
}

export default function AboutPage() {
  // Admin overrides and login state
  const ls = typeof window !== "undefined" ? window.localStorage : undefined;
  const ss = typeof window !== "undefined" ? window.sessionStorage : undefined;

  const getLS = useCallback((k: string) => {
    try { return ls?.getItem(k) || ""; } catch { return ""; }
  }, [ls]);
  const setLS = useCallback((k: string, v: string) => {
    try { ls?.setItem(k, v); } catch {}
  }, [ls]);
  const removeLS = useCallback((k: string) => {
    try { ls?.removeItem(k); } catch {}
  }, [ls]);

  const [admin, setAdmin] = useState<boolean>(() => ss?.getItem("btf.admin") === "true");
  const [showLogin, setShowLogin] = useState(false);
  const [pwd, setPwd] = useState("");
  const [inlineEdit, setInlineEdit] = useState<boolean>(() => ss?.getItem("btf.inlineEdit") === "true");
  const toggleInline = () => {
    setInlineEdit(v => { const nv = !v; try { ss?.setItem("btf.inlineEdit", String(nv)); } catch {} return nv; });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        setShowLogin(true);
      }
      if (e.key === "Escape") {
        setShowLogin(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const doLogin = useCallback(() => {
    const raw = getImportMeta()?.env?.VITE_ADMIN_PASSWORD;
    const expected = (raw && String(raw).trim()) || "btf-2024";
    const input = String(pwd || "").trim();
    if (input === expected) {
      setAdmin(true);
      try { ss?.setItem("btf.admin", "true"); } catch {}
      setShowLogin(false);
      setPwd("");
    } else {
      alert("Incorrect password");
    }
  }, [pwd, ss]);

  // Override state (data URLs)
  const isValid = (s: string) => !!s && (s.startsWith("data:image") || s.startsWith("/") || s.startsWith("http"));
  const [heroOverride, setHeroOverride] = useState<string>(() => {
    const v = getLS("btf.about.hero");
    return isValid(v) ? v : "";
  });
  const [valuesOverride, setValuesOverride] = useState<string[]>(() => [0,1,2].map(i => {
    const v = getLS(`btf.about.values.${i}`);
    return isValid(v) ? v : "";
  }));
  const [ctaOverride, setCtaOverride] = useState<string>(() => {
    const v = getLS("btf.about.cta");
    return isValid(v) ? v : "";
  });

  const heroImg = heroOverride || HERO_BG_DEFAULT;
  const valuesImgs = [0,1,2].map(i => valuesOverride[i] || VALUES_IMGS_DEFAULT[i]);
  const ctaImg = ctaOverride || CTA_IMG_DEFAULT;

  // Downloads (About resources)
  const defaultKit = "/files/BTF-About-Brochure.pdf";
  const [kitUrl, setKitUrl] = useState<string>(() => ls?.getItem("btf.about.kit") || defaultKit);
  const [posterUrl, setPosterUrl] = useState<string>(() => ls?.getItem("btf.about.poster") || "");

  const pickKit = async (files: FileList | null) => {
    const f = files?.[0]; if (!f) return;
    const data = await toDataUrl(f);
    try { ls?.setItem("btf.about.kit", data); } catch {}
    setKitUrl(data);
  };
  const resetKit = () => {
    try { ls?.removeItem("btf.about.kit"); } catch {}
    setKitUrl(defaultKit);
  };
  const pickPoster = async (files: FileList | null) => {
    const f = files?.[0]; if (!f) return;
    const data = await toDataUrl(f);
    try { ls?.setItem("btf.about.poster", data); } catch {}
    setPosterUrl(data);
  };

  const toDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>, slot: string) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await toDataUrl(f);
    setLS(slot, data);
    if (slot === "btf.about.hero") setHeroOverride(data);
    else if (slot.startsWith("btf.about.values.")) {
      const idx = Number(slot.split(".").pop());
      setValuesOverride(prev => { const next = [...prev]; next[idx] = data; return next; });
    } else if (slot === "btf.about.cta") setCtaOverride(data);
  };

  const clearSlot = (slot: string) => {
    removeLS(slot);
    if (slot === "btf.about.hero") setHeroOverride("");
    else if (slot.startsWith("btf.about.values.")) {
      const idx = Number(slot.split(".").pop());
      setValuesOverride(prev => { const next = [...prev]; next[idx] = ""; return next; });
    } else if (slot === "btf.about.cta") setCtaOverride("");
  };

  // --- Admin: team overrides helpers ---
  const persistTeam = (arr: { url: string; name: string }[]) => {
    try { setLS("btf.about.team", JSON.stringify(arr)); } catch {}
  };
  const onAddTeamFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const items: { url: string; name: string }[] = [];
    for (const f of Array.from(files)) {
      const data = await toDataUrl(f);
      const base = (f.name || "Team").replace(/\.[^.]+$/, "");
      items.push({ url: data, name: base });
    }
    setTeamOverrides(prev => { const next = [...prev, ...items]; persistTeam(next); return next; });
  };
  const onRenameTeam = (idx: number, name: string) => {
    setTeamOverrides(prev => { const next = [...prev]; if (next[idx]) next[idx].name = name; persistTeam(next); return next; });
  };
  const onRemoveTeam = (idx: number) => {
    setTeamOverrides(prev => { const next = prev.filter((_, i) => i !== idx); persistTeam(next); return next; });
  };
  const onReplaceTeam = async (idx: number, files: FileList | null) => {
    if (!files || !files[0]) return;
    const data = await toDataUrl(files[0]);
    setTeamOverrides(prev => {
      const next = [...prev];
      if (next[idx]) next[idx] = { ...next[idx], url: data };
      persistTeam(next);
      return next;
    });
  };
  const onReplaceTeamByName = async (name: string, files: FileList | null) => {
    if (!files || !files[0]) return;
    const data = await toDataUrl(files[0]);
    const norm = (s: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
    setTeamOverrides(prev => {
      const idx = prev.findIndex(p => norm(p.name) === norm(name));
      const next = [...prev];
      if (idx >= 0) next[idx] = { ...next[idx], url: data };
      else next.push({ name, url: data });
      persistTeam(next);
      return next;
    });
  };
  const onRemoveTeamByName = (name: string) => {
    const norm = (s: string) => (s || "").toLowerCase().replace(/\s+/g, " ").trim();
    setTeamOverrides(prev => { const next = prev.filter(p => norm(p.name) !== norm(name)); persistTeam(next); return next; });
  };
  const onResetTeam = () => {
    setTeamOverrides([]); removeLS("btf.about.team");
  };
  // Load team photos from folder using Vite glob (as URL strings)
  const team = useMemo(() => {
    const globs = globAssets("./Photo/Team_member_photos/**/*.{png,PNG,jpg,JPG,jpeg,JPEG,avif,AVIF,webp,WEBP}");
    const entries = Object.entries(globs).map(([path, url]) => {
      const file = path.split("/").pop() || path;
      const base = file.replace(/\.[^.]+$/, "");
      const pretty = base
        .replace(/^prof\.?/i, "Prof.")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      return { name: pretty, url };
    });
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }, []);
  // Exclude Prof. Hala's card from the team grid (used in story image)
  const teamVisible = useMemo(() => team.filter(t => t.url !== halaPhoto), [team]);

  // Admin: optional override list for team grid
  type TeamItem = { url: string; name: string };
  const [teamOverrides, setTeamOverrides] = useState<TeamItem[]>(() => {
    try {
      const raw = (typeof window !== "undefined" ? window.localStorage.getItem("btf.about.team") : null) || "";
      const arr = JSON.parse(raw || "[]");
      if (Array.isArray(arr)) {
        return arr
          .filter((x) => x && typeof x.url === "string")
          .map((x) => ({ url: String(x.url), name: String(x.name || "Team") }));
      }
    } catch {}
    return [];
  });

  // Earlier behavior: if overrides exist, show only overrides; otherwise show defaults
  const teamEffective: TeamItem[] = teamOverrides.length ? teamOverrides : teamVisible;

  // Lightbox state for interactive viewing
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeLightbox = () => setActiveIndex(null);
  const next = () => setActiveIndex(i => (i === null || teamEffective.length === 0 ? null : (i + 1) % teamEffective.length));
  const prev = () => setActiveIndex(i => (i === null || teamEffective.length === 0 ? null : (i - 1 + teamEffective.length) % teamEffective.length));

  // Soft glass transition for hero CTA card (mirrors Mentorship feel)
  const [glassOn, setGlassOn] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGlassOn(true), 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [activeIndex, teamEffective.length]);

  // ---- Text overrides (panel and optional inline editing) ----
  const TEXT_KEY = "btf.about.text";
  const readText = () => { try { return JSON.parse(ls?.getItem(TEXT_KEY) || "{}") || {}; } catch { return {}; } };
  const writeText = (m: Record<string, string>) => { try { ls?.setItem(TEXT_KEY, JSON.stringify(m)); } catch {} };
  const [texts, setTexts] = useState<Record<string, string>>(() => readText());
  const textGet = (id: string, fallback: string) => (texts[id] ?? fallback);
  const textSet = (id: string, v: string) => {
    setTexts(prev => {
      const next = { ...prev, [id]: v };
      writeText(next);
      return next;
    });
  };
  const textReset = (id: string) => {
    setTexts(prev => {
      if (!(id in prev)) return prev;
      const next = { ...prev };
      delete next[id];
      writeText(next);
      return next;
    });
  };
  const textResetAll = () => {
    setTexts({});
    try { ls?.removeItem(TEXT_KEY); } catch {}
  };

  type EditableProps<Tag extends keyof React.JSX.IntrinsicElements = "span"> = {
    id: string;
    defaultText: string;
    as?: Tag;
    className?: string;
    style?: React.CSSProperties;
  };

  function Editable<Tag extends keyof React.JSX.IntrinsicElements = "span">({ id, defaultText, as = "span" as Tag, className, style }: EditableProps<Tag>) {
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
          if (!t) {
            textReset(id);
            return;
          }
          if (t !== val) textSet(id, t);
        }}
      >
        {val}
      </Tag>
    );
  }


return (
  <main style={{ fontFamily: "Arial, Helvetica, sans-serif", background: "transparent", color: COLORS.charcoal, position: "relative", minHeight: "100vh" }}>
    <GlobalBackground />
    <div style={{ position: "relative", zIndex: 1 }}>
      <StyleInject />
      <MainNav />
      <SectionsStyle />

      {/* Hero with motion and background image */}
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,.55), rgba(255,255,255,.9)), url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="blob blob-a" />
        <div className="blob blob-b" />
        <div className="blob blob-c" />
        <Container className="relative py-16 md:py-24">
          {/* Glass transition and headline animation styles */}
          <style>{`
            .glass-card{ background: rgba(255,255,255,0); border-color: rgba(0,0,0,.10); transition: background .45s ease, border-color .45s ease, backdrop-filter .45s ease, -webkit-backdrop-filter .45s ease; }
            .glass-on{ background: rgba(255,255,255,.65); border-color: rgba(0,0,0,.12); }
            @supports (backdrop-filter: blur(10px)) { .glass-on { backdrop-filter: saturate(140%) blur(10px); } }
            @supports (-webkit-backdrop-filter: blur(10px)) { .glass-on { -webkit-backdrop-filter: saturate(140%) blur(10px); } }
            .headline-roll { display:inline-block; perspective: 800px; }
            .headline-roll .char{ display:inline-block; transform-origin: left 80%; transform: rotateX(90deg) translateY(6px); opacity:0; filter: blur(4px); animation: rollIn 650ms cubic-bezier(.2,.9,.2,1) calc(var(--i) * 55ms) forwards; will-change: transform, opacity, filter; }
            @keyframes rollIn{ to{ transform: rotateX(0deg) translateY(0); opacity:1; filter: blur(0); } }
          `}</style>

          {/* Kicker pill */}
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold"
               style={{ background: "rgba(255,255,255,.72)", borderColor: "rgba(0,0,0,.12)", color: COLORS.navy }}>
            <Editable id="hero.kicker" defaultText="Our story" as="span" />
          </div>

          {/* Animated headline */}
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                     style={{ fontSize: "clamp(30px, 5vw, 56px)", lineHeight: 1.08, margin: "12px 0 8px", color: COLORS.charcoal }}>
            <span className="headline-roll">
              {Array.from(String(textGet("hero.h1", "About BIOTech Futures"))).map((ch, i) => (
                <span key={i} className="char" style={{ ["--i" as any]: i } as React.CSSProperties}>
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </span>
          </motion.h1>

          {/* Glass CTA card */}
          <div className={`mt-4 card-soft glass-card ${glassOn ? 'glass-on' : ''}`} style={{ color: COLORS.navy, maxWidth: 880 }}>
            <p className="text-lg md:text-xl" style={{ marginBottom: 12 }}>
              <Editable id="hero.sub" defaultText="We empower students and researchers to co-create bold solutions in biotech and medical engineering through mentoring, community, and real-world challenges." as="span" />
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <a className="btn-primary" href="#start" onClick={(e)=>{e.preventDefault(); document.getElementById('start')?.scrollIntoView({behavior:'smooth'});}}>
                {textGet("btn.learn", "Learn more")}
              </a>
              <a className="btn-ghost" href="#milestones" onClick={(e)=>{e.preventDefault(); document.getElementById('milestones')?.scrollIntoView({behavior:'smooth'});}} style={{ borderColor: COLORS.green, color: COLORS.green }}>
                {textGet("btn.milestones", "Our milestones")}
              </a>
            </div>
          </div>
        </Container>

        {/* Bottom wave separator to match Mentorship hero */}
        <svg
          viewBox="0 0 1440 80"
          className="absolute bottom-0 left-0 w-full"
          preserveAspectRatio="none"
          aria-hidden
          style={{ bottom: -1 }}
        >
          <path d="M0,40 C180,80 420,0 720,40 C1020,80 1260,20 1440,40 L1440,80 L0,80 Z" fill={COLORS.lightBG} />
        </svg>
      </section>

      {/* Impact counters */}
      <section>
        <Container className="py-12 md:py-16">
          <div className="about-glass about-section-shell">
            <span className="pill"><Editable id="impact.kicker" defaultText="IMPACT AT A GLANCE" as="span" /></span>
            <h2 className="section-title mt-4"><Editable id="impact.h" defaultText="A growing community across Australia" as="span" /></h2>
            <div className="grid gap-6 md:grid-cols-3 mt-6">
              <StatCard value={2000} suffix="+" label="Participants"/>
              <StatCard value={120} suffix="+" label="Mentors & Supervisors"/>
              <StatCard value={50} suffix="+" label="Partner Organisations"/>
            </div>
          </div>
        </Container>
      </section>
      {/* The Start (story with photo) 鈥?redesigned */}
      <section id="start">
        <Container className="py-12 md:py-16">
          <style>{`
            .start-shell { position:relative; overflow:hidden; border-radius:28px; background: linear-gradient(180deg, #ffffff, #F6FBF9); border:1px solid #E6F3EE; box-shadow: 0 26px 70px rgba(11,56,54,0.12); }
            .start-grid { display:grid; gap:28px; align-items:center; grid-template-columns: 1fr; }
            @media (min-width: 768px){ .start-grid { grid-template-columns: 1.1fr 1fr; } }
            .start-quote { position:relative; margin-top:14px; padding-left:16px; }
            .start-quote::before { content:""; position:absolute; left:0; top:4px; bottom:4px; width:4px; border-radius:999px; background:${COLORS.green}; box-shadow:0 0 0 3px rgba(1,113,81,0.08); }
            .start-bullets { margin-top:14px; display:grid; gap:10px; }
            .start-bullets li { display:flex; align-items:flex-start; gap:10px; }
            .start-badge { display:inline-block; padding:8px 12px; border-radius:999px; background:#EAF7F1; border:1px solid #DCEFE7; color:${COLORS.navy}; font-weight:700; letter-spacing:.2px; }
            .start-img-wrap { position:relative; border-radius:20px; overflow:hidden; transform:translateZ(0); }
            .start-glow { position:absolute; inset:-20%; background: radial-gradient(300px 220px at var(--mx,70%) var(--my,30%), rgba(1,113,81,.18), transparent 60%); pointer-events:none; mix-blend-mode: multiply; transition: opacity .25s ease; }
          `}</style>
          <div className="start-shell p-6 md:p-10">
            <div className="start-grid">
              {/* Left copy */}
              <div>
                <span className="pill"><Editable id="start.kicker" defaultText="THE START OF BIOTECH FUTURES" as="span" /></span>
                <h2 className="section-title mt-3"><Editable id="start.h" defaultText="Founded by Prof. Hala Zreiqat AM" as="span" /></h2>
                <div className="section-body">
                  <p>
                    <Editable id="start.p1" defaultText="The vision for BIOTech Futures began almost a decade ago, when Prof. Hala Zreiqat shared her research with students at King Academy and the International Academy Amman in Jordan." as="span" />
                  </p>
                  <p className="start-quote">
                    <Editable id="start.p2" defaultText="From keynote talks to hands-on lab time, her efforts to connect high school students with researchers grew into a program that launched in 2019 and continues to expand each year." as="span" />
                  </p>
                </div>
                <ul className="start-bullets">
                  {["Inspiration across countries and schools","Mentoring with real research projects","A community that keeps growing"].map((t,i)=> (
                    <li key={i}>
                      <span className="start-badge">{i+1}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Right visual */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onMouseMove={(e)=>{
                  const el = e.currentTarget as HTMLDivElement;
                  const r = el.getBoundingClientRect();
                  const mx = ((e.clientX - r.left) / r.width) * 100;
                  const my = ((e.clientY - r.top) / r.height) * 100;
                  el.style.setProperty('--mx', mx+'%');
                  el.style.setProperty('--my', my+'%');
                }}
                className="start-img-wrap"
              >
                <img src={halaPhoto} alt="Prof. Hala Zreiqat AM" className="w-full h-80 object-cover" />
                <div className="start-glow" />
              </motion.div>
            </div>
          </div>
        </Container>
      </section>
      {/* Milestones timeline */}
      <section id="milestones" style={{ background: COLORS.lightBG }}>
        <Container className="py-12 md:py-16">
          <span className="pill"><Editable id="milestones.kicker" defaultText="MILESTONES" as="span" /></span>
          <h2 className="section-title mt-4"><Editable id="milestones.h" defaultText="Moments that shaped the program" as="span" /></h2>
          <div className="mt-6 grid gap-6">
            {[
              { year: 2019, text: "BIO Challenge launches with 200+ students and 50 academics." },
              { year: 2021, text: "New national partnerships expand mentoring and outreach." },
              { year: 2023, text: "Poster sessions highlight award-winning projects across key areas." },
              { year: 2025, text: "Interactive gallery and resources hub go live." },
            ].map((m, i) => (
              <motion.div key={m.year} className="card-soft" initial={{ opacity: 0, x: i % 2 ? 20 : -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: i * 0.05 }}>
                <div className="flex items-center gap-3">
                  <span className="rounded-full px-3 py-1 text-sm text-white" style={{ background: COLORS.green }}>{m.year}</span>
                  <p className="m-0">{m.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      

      {/* Meeting the team */}
      <section>
        <Container className="py-12 md:py-16">
          <span className="pill">MEET THE TEAM</span>
          <h2 className="section-title mt-4">The people behind BIOTech Futures</h2>
          <motion.div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4" initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}>
            {teamEffective.length === 0 && (
              <div className="col-span-full" style={{ color: COLORS.navy, opacity: 0.8, gridColumn: "1 / -1" }}>
                No team photos detected yet. Add images to <code>Prototype1/src/Photo/Team_member_photos</code> or upload them via the admin panel.
              </div>
            )}
            {teamEffective.map((m, i) => (
              <motion.div key={m.url} className="card-soft" variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <button
                  onClick={() => setActiveIndex(i)}
                  className="overflow-hidden rounded-xl tilt"
                  style={{ padding: 0, border: 0, background: "transparent", cursor: "zoom-in", width: "100%" }}
                  aria-label={`View ${m.name}`}
                >
                  <img src={m.url} alt={m.name} className="w-full h-48 object-cover" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }} />
                </button>
                <div className="mt-3 font-semibold" style={{ color: COLORS.green }}>{m.name}</div>
              </motion.div>
            ))}
          </motion.div>

          {activeIndex !== null && teamEffective[activeIndex] && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0"
              style={{ zIndex: 60 }}
            >
              <div
                className="absolute inset-0"
                style={{ background: "rgba(0,0,0,0.65)" }}
                onClick={closeLightbox}
              />
              <div className="absolute inset-0 grid place-items-center p-4">
                <div className="relative" style={{ maxWidth: 980, width: "100%" }}>
                  <img
                    src={teamEffective[activeIndex].url}
                    alt={teamEffective[activeIndex].name}
                    className="w-full object-contain rounded-xl"
                    style={{ maxHeight: "80vh", boxShadow: "0 30px 90px rgba(0,0,0,0.5)" }}
                    onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
                  />
                  <div className="absolute left-0 right-0 text-center text-white" style={{ bottom: -48 }}>
                    <strong>{teamEffective[activeIndex].name}</strong>
                  </div>
                  <button
                    onClick={closeLightbox}
                    aria-label="Close"
                    className="absolute rounded-full"
                    style={{ width: 40, height: 40, background: "rgba(255,255,255,0.9)", border: 0, cursor: "pointer", top: -12, right: -12 }}
                  >
                    Close
                  </button>
                  <button
                    onClick={prev}
                    aria-label="Previous"
                    className="absolute left-0"
                    style={{ top: "50%", transform: "translateY(-50%)", width: 44, height: 44, background: "rgba(255,255,255,0.9)", border: 0, borderRadius: 9999, cursor: "pointer" }}
                  >
                    Prev
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next"
                    className="absolute right-0"
                    style={{ top: "50%", transform: "translateY(-50%)", width: 44, height: 44, background: "rgba(255,255,255,0.9)", border: 0, borderRadius: 9999, cursor: "pointer" }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* Values cards */}
      <section>
        <Container className="py-12 md:py-16">
          <span className="pill">VALUES</span>
          <h2 className="section-title mt-4">Mentorship, Curiosity, and Bold Ideas</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[{ title: "Mentorship", body: "Guidance from researchers and industry supports students to dream bigger and navigate complexity.", img: valuesImgs[0] }, { title: "Curiosity", body: "Hands-on projects and open exploration spark lifelong interest in STEM.", img: valuesImgs[1] }, { title: "Bold Ideas", body: "We celebrate creative risks and fresh perspectives that move fields forward.", img: valuesImgs[2] }].map((c, i) => (
              <motion.div key={c.title} className="card-soft" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}>
                <div className="img-tilt">
                  <img src={c.img} alt="" className="w-full h-44 object-cover rounded-xl" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }} />
                </div>
                <h3 style={{ marginTop: 12, color: COLORS.green }}>{c.title}</h3>
                <p style={{ marginTop: 8 }}>{c.body}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section>
        <Container className="py-12 md:py-16">
          <div className="about-glass about-section-shell">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="section-title"><Editable id="cta.h" defaultText="Join the next chapter" as="span" /></h2>
                <p className="section-body"><Editable id="cta.sub" defaultText="Become a mentor, propose a project, or bring a school cohort to BIOTech Futures." as="span" /></p>
                <a href="/contact" className="btn-outline mt-4 inline-block">{textGet("cta.btn", "Contact the team")}</a>
              </div>
              <motion.div className="img-tilt" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <img src={ctaImg} alt="Inspiring the next generation" className="w-full h-72 object-cover rounded-xl" onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }} />
              </motion.div>
            </div>
          </div>
        </Container>
      </section>


      <Cards />
      <MomentsMarquee />
      <Footer />

<style>{`
        .about-glass { position:relative; border-radius:28px; background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.34); padding:clamp(1.5rem,2.8vw,2.75rem); box-shadow:0 26px 70px rgba(11,56,54,0.22); overflow:hidden; transition:background .45s ease, border-color .45s ease; }
        .about-glass::before { content:""; position:absolute; inset:-45% -25%; background:radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 62%); opacity:.22; filter:blur(48px); transform:rotate(12deg); animation:about-glass-flow 18s ease-in-out infinite; }
        .about-glass::after { content:""; position:absolute; inset:-18% 12% auto -18%; height:240px; background:linear-gradient(120deg, rgba(255,255,255,0.4), rgba(255,255,255,0)); opacity:.42; transform:rotate(8deg); animation:about-glass-sheen 22s linear infinite; }
        @supports (backdrop-filter: blur(12px)) { .about-glass { backdrop-filter:saturate(145%) blur(18px); -webkit-backdrop-filter:saturate(145%) blur(18px); } }
        .about-section-shell { position:relative; margin-top:clamp(1.5rem,4vw,3rem); }
        .about-section-shell:first-of-type { margin-top:0; }
        .about-hero-card { padding:clamp(1.75rem,3.6vw,3rem); background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.38); box-shadow:0 30px 90px rgba(15,56,65,0.28); }
        .about-hero-card::before { opacity:.28; }
        @keyframes about-glass-flow { 0%{ transform:translate3d(-8%, -6%, 0) scale(1); opacity:.16; } 50%{ transform:translate3d(6%, 4%, 0) scale(1.08); opacity:.33; } 100%{ transform:translate3d(-4%, -2%, 0) scale(1); opacity:.16; } }
        @keyframes about-glass-sheen { 0%{ transform:translateX(-130%) rotate(8deg); } 100%{ transform:translateX(120%) rotate(8deg); } }
        .stat { display:grid; place-items:center; padding:18px; border-radius:16px; background:#fff; border:1px solid #E8F1ED; box-shadow:0 6px 24px rgba(0,0,0,0.05) }
        .stat-val { font-size:clamp(28px,4.5vw,44px); font-weight:900; letter-spacing:-0.5px; color:${COLORS.green} }
        .stat-label { margin-top:6px; opacity:.8 }
      `}</style>
      
      {/* Hidden admin trigger button (small dot) */}
      <button
        onClick={() => setShowLogin(true)}
        aria-label="Open admin login"
        title="Admin"
        style={{
          position: "fixed",
          right: 10,
          bottom: 10,
          width: 22,
          height: 22,
          borderRadius: 9999,
          border: 0,
          background: COLORS.green,
          opacity: 0.1,
          cursor: "pointer",
          zIndex: 1000,
        }}
      />
      {/* Hidden admin login modal and panel */}
      {showLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "grid", placeItems: "center" }} onClick={()=>{ setShowLogin(false); setPwd(""); }}>
          <div role="dialog" aria-modal="true" aria-label="Admin Login" style={{ background: "#fff", borderRadius: 12, padding: 16, width: 360, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }} onClick={(e)=>e.stopPropagation()}>
            <h3 style={{ marginBottom: 10, color: COLORS.green }}>Admin Login</h3>
            <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} onKeyDown={(e)=>{ if (e.key === "Enter") doLogin(); if (e.key === "Escape") setShowLogin(false); }} placeholder="Enter password" style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }} />
            <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={()=>{ setShowLogin(false); setPwd(""); }} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Cancel</button>
              <button onClick={doLogin} style={{ padding: "8px 12px", borderRadius: 8, border: 0, background: COLORS.green, color: "#fff", cursor: "pointer" }}>Login</button>
            </div>
            <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>Hint: Press Ctrl+Shift+A to open</div>
          </div>
        </div>
      )}

      {admin && (
        <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000, background: "#ffffff", border: "1px solid #E6F3EE", borderRadius: 12, padding: 12, boxShadow: "0 10px 24px rgba(0,0,0,0.12)", width: 380, maxHeight: "90vh", overflowY: "auto" }}>
          <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 8 }}>About Page Admin</div>

          {/* Inline editing toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <input id="ab-inline" type="checkbox" checked={inlineEdit} onChange={toggleInline} />
            <label htmlFor="ab-inline" style={{ userSelect: "none" }}>Enable inline text editing on page</label>
          </div>

          {/* Background images */}
          <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>Background images</div>
          <div style={{ display: "grid", gap: 8 }}>
            <AdminFileControl label="Hero image" value={heroOverride} onPick={(e)=>onPick(e, "btf.about.hero")} onReset={()=>clearSlot("btf.about.hero")} />
            {[0,1,2].map(i => (
              <AdminFileControl key={i} label={`Values image ${i+1}`} value={valuesOverride[i]} onPick={(e)=>onPick(e, `btf.about.values.${i}`)} onReset={()=>clearSlot(`btf.about.values.${i}`)} />
            ))}
            <AdminFileControl label="CTA image" value={ctaOverride} onPick={(e)=>onPick(e, "btf.about.cta")} onReset={()=>clearSlot("btf.about.cta")} />
          </div>

          <div style={{ height: 1, background: "#E6F3EE", margin: "8px 0" }} />

          {/* Downloads */}
          <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>Downloads</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{ minWidth: 170 }}>About brochure (PDF/Image)</span>
            <input id="ab-kit" type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={(e)=>pickKit(e.currentTarget.files)} />
            <button onClick={()=>document.getElementById("ab-kit")?.click()} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
              Choose file
            </button>
            <button onClick={resetKit} style={{ padding: "6px 10px", borderRadius: 6, border: 0, background: "#f6f6f6", cursor: "pointer" }}>
              Reset
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <span style={{ minWidth: 170 }}>Poster (A4, PDF/Image)</span>
            <input id="ab-poster" type="file" accept=".pdf,image/*" style={{ display: "none" }} onChange={(e)=>pickPoster(e.currentTarget.files)} />
            <button onClick={()=>document.getElementById("ab-poster")?.click()} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
              Choose file
            </button>
          </div>

          <div style={{ height: 1, background: "#E6F3EE", margin: "8px 0" }} />
          
          {/* Team overrides (optional) */}
          <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>Team (overrides)</div>
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input id="ab-team-add" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e)=>onAddTeamFiles(e.currentTarget.files)} />
              <button onClick={()=>document.getElementById("ab-team-add")?.click()} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                Upload team photos
              </button>
              <button onClick={onResetTeam} style={{ padding: "6px 10px", borderRadius: 6, border: 0, background: "#f6f6f6", cursor: "pointer" }}>
                Reset overrides
              </button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {teamOverrides.length ? "Editing overrides below (shown instead of folder images)" : "No overrides set — showing photos directly from the Team_member_photos folder."}
            </div>
            {teamOverrides.length > 0 && (
              <div style={{ display: "grid", gap: 8, maxHeight: 200, overflow: "auto", paddingRight: 4 }}>
                {teamOverrides.map((t, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "48px 1fr auto", gap: 8, alignItems: "center" }}>
                    <img src={t.url} alt={t.name} style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} onError={(e)=>{ (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }} />
                    <input value={t.name} onChange={(e)=>onRenameTeam(i, e.target.value)} style={{ width: "100%", padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd" }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <label style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>
                        Replace
                        <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e)=>onReplaceTeam(i, e.currentTarget.files)} />
                      </label>
                      <button onClick={()=>onRemoveTeam(i)} style={{ padding: "6px 10px", borderRadius: 6, border: 0, background: "#ffecec", color: "#b00020", cursor: "pointer" }}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Text overrides */}
          <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>Text overrides</div>
          <div style={{ display: "grid", gap: 8, maxHeight: 220, overflow: "auto", paddingRight: 4 }}>
            {[
              { id: "hero.kicker", label: "Hero kicker", def: "Our story" },
              { id: "hero.h1",     label: "Hero title (H1)", def: "About BIOTech Futures" },
              { id: "hero.sub",    label: "Hero subtitle", def: "We empower students and researchers to co-create bold solutions in biotech and medical engineering through mentoring, community, and real-world challenges." },
              { id: "btn.learn",   label: "Button: Learn more", def: "Learn more" },
              { id: "btn.milestones", label: "Button: Our milestones", def: "Our milestones" },
              { id: "impact.kicker", label: "Impact kicker", def: "IMPACT AT A GLANCE" },
              { id: "impact.h",    label: "Impact heading", def: "A growing community across Australia" },
              { id: "start.kicker", label: "Start kicker", def: "THE START OF BIOTECH FUTURES" },
              { id: "start.h",     label: "Start heading", def: "Founded by Prof. Hala Zreiqat AM" },
              { id: "start.p1",    label: "Start paragraph 1", def: "The vision for BIOTech Futures began almost a decade ago, when Prof. Hala Zreiqat shared her research with students at King Academy and the International Academy Amman in Jordan." },
              { id: "start.p2",    label: "Start paragraph 2", def: "From keynote talks to hands-on lab time, her efforts to connect high school students with researchers grew into a program that launched in 2019 and continues to expand each year." },
              { id: "milestones.kicker", label: "Milestones kicker", def: "MILESTONES" },
              { id: "milestones.h", label: "Milestones heading", def: "Moments that shaped the program" },
              { id: "cta.h",       label: "CTA heading", def: "Join the next chapter" },
              { id: "cta.sub",     label: "CTA subtitle", def: "Become a mentor, propose a project, or bring a school cohort to BIOTech Futures." },
              { id: "cta.btn",     label: "CTA button", def: "Contact the team" },
            ].map(f => {
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
              onClick={()=>{ try { ss?.removeItem("btf.admin"); } catch {}; setAdmin(false); }}
              style={{ fontSize: 12, border: "1px solid #ddd", background: "#fff", borderRadius: 6, padding: "6px 8px", cursor: "pointer" }}
            >
              Logout
            </button>
            <button
              onClick={()=>{
                // Reset images and downloads
                clearSlot("btf.about.hero"); [0,1,2].forEach(i=>clearSlot(`btf.about.values.${i}`)); clearSlot("btf.about.cta");
                try { ls?.removeItem("btf.about.kit"); ls?.removeItem("btf.about.poster"); } catch {}
                setKitUrl(defaultKit); setPosterUrl("");
                // Reset texts
                textResetAll();
              }}
              style={{ fontSize: 12, border: 0, background: COLORS.blue, color: "#fff", borderRadius: 6, padding: "6px 8px", cursor: "pointer" }}
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

function StatCard({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now(); const dur = 900;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.round(value * (0.2 + 0.8 * eased)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <div className="stat">
      <div className="stat-val">{v}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// Small helper to render a consistent, English-labeled file control
function AdminFileControl({ label, value, onPick, onReset }: { label: string; value?: string; onPick: (e: React.ChangeEvent<HTMLInputElement>) => void; onReset: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const open = () => inputRef.current?.click();
  const chosen = !!value;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <span style={{ minWidth: 110 }}>{label}</span>
      <input ref={inputRef} type="file" accept="image/*" lang="en" onChange={onPick} style={{ display: "none" }} />
      <button onClick={open} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}>Choose file</button>
      <span style={{ opacity: 0.6 }}>{chosen ? "1 file chosen" : "No file chosen"}</span>
      {chosen && (
        <button onClick={onReset} style={{ marginLeft: 8, fontSize: 12, border: 0, background: "transparent", color: COLORS.blue, cursor: "pointer", textDecoration: "underline" }}>Reset</button>
      )}
    </div>
  );
}











