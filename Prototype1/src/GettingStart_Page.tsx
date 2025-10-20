import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { COLORS, Container, useReveal } from "./components/common";
import MainNav from "./components/MainNav";
import StyleInject from "./components/StyleInject";
import gettingstart1 from "./resources/gettingstart1.jpg";
import gettingstart2 from "./resources/gettingstart2.jpg";

import Cards from "./sections/home/Cards";
import Footer from "./sections/home/Footer";
import MomentsMarquee from "./sections/home/MomentsMarquee";
import { SectionsStyle } from "./sections/home/Sections";

/* ======================= 全局背景（Aurora/Grid/Noise） ======================= */
function GlobalBackground({ scoped = false }: { scoped?: boolean }) {
  const base = scoped ? "hte-bgfx-scope" : "hte-bgfx";
  return (
    <>
      <style>{`
        .hte-bgfx{position:fixed; inset:0; pointer-events:none; z-index:0}
        .hte-bgfx-scope{position:absolute; inset:0; pointer-events:none; z-index:0}
        .hte-bgfx-base{ background:${COLORS.lightBG}; }
        .hte-bgfx-aurora{ filter: blur(80px); opacity:.75; }
        .hte-bgfx-aurora-b{ opacity:.55; }
        .hte-bgfx-aurora-a{
          animation: hte-driftA 26s ease-in-out infinite alternate;
          background:
            radial-gradient(38% 46% at 12% 20%, rgba(76,175,140,.35), transparent 62%),
            radial-gradient(36% 42% at 86% 18%, rgba(26,115,232,.24), transparent 64%);
        }
        .hte-bgfx-aurora-b{
          animation: hte-driftB 34s ease-in-out infinite alternate;
          background:
            radial-gradient(44% 54% at 78% 84%, rgba(255,181,67,.28), transparent 68%),
            radial-gradient(28% 34% at 18% 86%, rgba(13,140,116,.22), transparent 62%);
        }
        @keyframes hte-driftA{
          0%{ transform: translate3d(-4%, -2%, 0) scale(1.02) }
          50%{ transform: translate3d(4%, 1%, 0) scale(1.06) }
          100%{ transform: translate3d(-2%, 3%, 0) scale(1.03) }
        }
        @keyframes hte-driftB{
          0%{ transform: translate3d(2%, 3%, 0) scale(1.03) }
          50%{ transform: translate3d(-3%, -2%, 0) scale(1.06) }
          100%{ transform: translate3d(3%, -1%, 0) scale(1.02) }
        }
        .hte-bgfx-grid{
          background-image:
            linear-gradient(to right, rgba(0,0,0,.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,.035) 1px, transparent 1px);
          background-size:24px 24px; opacity:.12;
        }
        .hte-bgfx-noise{
          opacity:.06;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
        }
      `}</style>
      <div className={`${base} hte-bgfx-base`} />
      <div className={`${base} hte-bgfx-aurora hte-bgfx-aurora-a`} />
      <div className={`${base} hte-bgfx-aurora hte-bgfx-aurora-b`} />
      <div className={`${base} hte-bgfx-grid`} />
      <div className={`${base} hte-bgfx-noise`} />
    </>
  );
}

/* ======================= Hero ======================= */
function Hero({ heroImg }: { heroImg: string }) {
  const reveal = useReveal();
  const [glassOn, setGlassOn] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setGlassOn(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        minHeight: "clamp(520px, 72vh, 760px)",
        color: COLORS.lime,
        backgroundImage: `url(${heroImg})`,


        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.35) 35%, rgba(0,0,0,.55) 100%)",
        }}
        aria-hidden
      />
      <Container className="relative py-16 md:py-24">
        <style>{`
          .glass-card{ background: rgba(255,255,255,0); border-color: rgba(255,255,255,.14); transition: all .45s ease; }
          .glass-on{ background: rgba(255,255,255,.10); border-color: rgba(255,255,255,.28); backdrop-filter: saturate(140%) blur(8px); }
          .headline-roll { display:inline-block; perspective: 800px; }
          .headline-roll .char{
            display:inline-block;
            transform-origin: left 80%;
            transform: rotateX(90deg) translateY(6px);
            opacity:0; filter: blur(4px);
            animation: rollIn 650ms cubic-bezier(.2,.9,.2,1) calc(var(--i) * 55ms) forwards;
          }
          @keyframes rollIn{ to{ transform: rotateX(0deg) translateY(0); opacity:1; filter: blur(0); } }
        `}</style>
        <div ref={reveal} className="reveal" style={{ maxWidth: 880 }}>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold"
            style={{
              background: "rgba(255,255,255,.08)",
              borderColor: "rgba(255,255,255,.24)",
              color: "#fff",
            }}
          >
            HOW TO ENTER
          </div>
          <h1 className="mt-4 text-white font-extrabold text-4xl md:text-5xl">
            <span className="headline-roll">
              {Array.from("Take Your First Step").map((ch, i) => (
                <span
                  key={i}
                  className="char"
                  style={{ ["--i" as any]: i } as React.CSSProperties}
                >
                  {ch === " " ? "\u00A0" : ch}
                </span>
              ))}
            </span>
          </h1>
          <div
            className={`mt-6 card-soft glass-card ${glassOn ? "glass-on" : ""}`}
            style={{ color: "#fff" }}
          >
            <p className="text-lg md:text-xl">
              Got a problem-solving idea? Join the BIOTech Futures Challenge and turn it into
              something real — the entry is super simple.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a className="btn-primary" href="#handbook">
                Challenge Handbook
              </a>
              <a
                className="btn-ghost"
                href="#register"
                style={{ borderColor: "rgba(255,255,255,.85)", color: "#fff" }}
              >
                Register on 7 May 2025
              </a>
            </div>
          </div>
        </div>
      </Container>
      <svg
        viewBox="0 0 1440 80"
        className="absolute bottom-0 left-0 w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0,40 C180,80 420,0 720,40 C1020,80 1260,20 1440,40 L1440,80 L0,80 Z"
          fill={COLORS.lightBG}
        />
      </svg>
    </section>
  );
}


// ===== 全局文本覆写逻辑 (localStorage + 实时事件通知) =====
const ls = typeof window !== "undefined" ? window.localStorage : undefined;
const TEXT_KEY = "btf.admin.text";

export const readText = () => {
  try {
    return JSON.parse(ls?.getItem(TEXT_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

export const writeText = (m: Record<string, string>) => {
  try {
    ls?.setItem(TEXT_KEY, JSON.stringify(m));
  } catch {}
};

// ✅ 从 localStorage 获取文本
export const textGet = (id: string, fallback: string) =>
  readText()[id] ?? fallback;

// ✅ 更新文本并触发全局事件（关键）
export const textSet = (id: string, v: string) => {
  const m = readText();
  m[id] = v;
  writeText(m);
  // 👇 通知所有监听组件刷新
  window.dispatchEvent(new Event("btf-text-update"));
};

// ✅ 重置文本并触发刷新
export const textReset = (id: string) => {
  const m = readText();
  delete m[id];
  writeText(m);
  window.dispatchEvent(new Event("btf-text-update"));
};

// ✅ 重置所有文本字段
export const textResetAll = () => {
  try {
    ls?.removeItem(TEXT_KEY);
    ls?.removeItem("btf.how.hero");
    ls?.removeItem("btf.how.cta");
    ls?.removeItem("btf.how.who");
    [1, 2, 3, 4].forEach(i => ls?.removeItem(`btf.how.structure.${i}`));
    ls?.removeItem("btf.how.kit");
    ls?.removeItem("btf.how.poster");
    console.log("✅ All text and images cleared from localStorage");
  } catch (err) {
    console.error("❌ Error resetting all content:", err);
  }

  window.dispatchEvent(new Event("btf-text-update"));
  window.dispatchEvent(new Event("btf-image-update"));
};



export default function HowToEnterPage() {
// ===== Admin 登录逻辑（新版） =====
const ss = typeof window !== "undefined" ? window.sessionStorage : undefined;
const [admin, setAdmin] = useState<boolean>(() => ss?.getItem("btf.admin") === "true");
const [showLogin, setShowLogin] = useState(false);
const [pwd, setPwd] = useState("");

// ===== Admin image overrides =====
const [heroOverride, setHeroOverride] = useState<string>(() => {
  try { return localStorage.getItem("btf.enter.hero") || ""; } catch { return ""; }
});
const [whoOverride, setWhoOverride] = useState<string>(() => {
  try { return localStorage.getItem("btf.enter.who") || ""; } catch { return ""; }
});

// 处理上传（通用）
const toDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });

const onPick = async (e: React.ChangeEvent<HTMLInputElement>, slot: "hero" | "who") => {
  const f = e.target.files?.[0];
  if (!f) return;
  const data = await toDataUrl(f);
  if (slot === "hero") {
    setHeroOverride(data);
    localStorage.setItem("btf.enter.hero", data);
  } else {
    setWhoOverride(data);
    localStorage.setItem("btf.enter.who", data);
  }
};

const onReset = (slot: "hero" | "who") => {
  if (slot === "hero") {
    setHeroOverride("");
    localStorage.removeItem("btf.enter.hero");
  } else {
    setWhoOverride("");
    localStorage.removeItem("btf.enter.who");
  }
};


// 快捷键 Ctrl+Shift+A 打开登录框
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
      setShowLogin(true);
    }
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, []);

// 从 import.meta 安全读取环境变量
const getImportMeta = (): any => {
  try {
    return (0, eval)("import.meta");
  } catch {
    return {} as any;
  }
};

// 登录逻辑：验证密码
const doLogin = useCallback(() => {
  const expected = getImportMeta()?.env?.VITE_ADMIN_PASSWORD || "btf-2024"; // 默认密码
  if (pwd === expected) {
    setAdmin(true);
    try { ss?.setItem("btf.admin", "true"); } catch {}
    setShowLogin(false);
    setPwd("");
  } else {
    alert("Incorrect password");
  }
}, [pwd, ss]);


  return (
    <main
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        color: COLORS.charcoal,
        background: "transparent",
        minHeight: "100vh",
        position: "relative",
      }}
    >
      <GlobalBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <StyleInject />
        <MainNav />
        <SectionsStyle />
        <Hero heroImg={heroOverride || gettingstart1} />


      {/* ===== Who can enter ===== */}
      <TwoColSection
        pill="ELIGIBILITY REQUIREMENTS"
        title={
          <Editable
            id="who.title"
            defaultText="Who can enter?"
            admin={false}
          />
        }
        body={[
          "Open to high-school students in Years 9–12 from anywhere in Australia (international students welcome).",
          "You just need internet access and a device to talk with your mentor.",
          "Enter in teams of 2–5 (one entry per person). You'll also need an adult supervisor (teacher or parent).",
        ]}
        imageSrc={whoOverride || gettingstart2}

        imageAlt="Students collaborating around a laptop"
        imageSide="left"
      />

        {/* ===== How Judging Works ===== */}
        <section style={{ background: COLORS.white }}>
          <Container className="py-20 md:py-28">
            <Pill>STEP-BY-STEP</Pill>
            <h1
            style={{
              fontSize: "clamp(36px, 6vw, 60px)",
              lineHeight: 1.15,
              fontWeight: 900,
              margin: "16px 0 24px",
              color: COLORS.charcoal,
              textAlign: "center",
            }}
          >
            <Editable
              id="judge.title"
              defaultText="How Judging Works"
              admin={false}
              as="span"
            />
          </h1>

            <StepJourney
              steps={[
                {
                  badge: "Sep",
                  title: "Stage 1",
                  text:
                    "Every group must submit a poster showing their challenge, research and proposed innovation and reflective short answer questions...",
                },
                {
                  badge: "Sep",
                  title: "Stage 2",
                  text:
                    "Each submission will be double marked and from this, the top 25 entries will be selected...",
                },
                {
                  badge: "Oct",
                  title: "Stage 3",
                  text:
                    "The final round will take place in October 2025 in a live symposium where finalists will be invited...",
                },
              ]}
            />
          </Container>
        </section>



        {/* ===== Structure ===== */}
        <section id="structure">
          <Container className="py-14 md:py-20">
<Pill>STRUCTURING YOUR ENTRY</Pill>

{/* ✅ 标题可修改 */}
<SectionHeading>
  <Editable
    id="structure.title"
    defaultText="What we need to see"
    admin={false}
    as="span"
  />
</SectionHeading>

{/* ✅ 副标题可修改 */}
<p
  style={{
    maxWidth: 880,
    fontSize: "clamp(16px, 1.6vw, 20px)",
    lineHeight: 1.75,
    opacity: 0.9,
    marginTop: 8,
  }}
>
  <Editable
    id="structure.subtitle"
    defaultText="Start by registering and uploading proof that you're a high-school student..."
    admin={false}
    as="span"
  />
</p>

{/* ✅ 卡片内容动态化 */}
<RoadmapGrid
  items={[
    { title: textGet("structure.card1.title", "Explore"), text: textGet("structure.card1.text", "Do quick background research...") },
    { title: textGet("structure.card2.title", "Define"), text: textGet("structure.card2.text", "Write a clear research question...") },
    { title: textGet("structure.card3.title", "Create"), text: textGet("structure.card3.text", "Brainstorm solutions...") },
    { title: textGet("structure.card4.title", "Show"), text: textGet("structure.card4.text", "Prepare your poster and complete short answers...") },
  ]}
/>
            <TipBanner
              title="Poster tips"
              text="Use a science-fair style..."
              className="mt-10"
            />
          </Container>
        </section>

  

        <Cards />
        <MomentsMarquee />
        <Footer />
      {/* ===== Admin Hidden Login Button (新版) ===== */}
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
          backgroundColor: "rgba(1,113,81,0.1)", // ✅ 新透明写法
          cursor: "pointer",
          zIndex: 1000,
        }}
      />


        {/* ===== Login Modal (新版) ===== */}
        {showLogin && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1000,
              display: "grid",
              placeItems: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 16,
                width: 360,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              <h3 style={{ marginBottom: 10, color: COLORS.green }}>Admin Login</h3>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                }}
              />
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setPwd("");
                  }}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={doLogin}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: 0,
                    background: COLORS.green,
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Login
                </button>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Hint: Press Ctrl+Shift+A to open
              </div>
            </div>
          </div>
        )}

{/* ===== Admin Panel — floating (match AboutPage) ===== */}
{admin && (
  <div
    style={{
      position: "fixed",
      bottom: 16,
      right: 16,
      zIndex: 1000,
      background: "#ffffff",
      border: "1px solid #E6F3EE",
      borderRadius: 12,
      boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
      width: 380,
      maxHeight: "50vh",            // ✅ 限制面板最大高度
      display: "flex",
      flexDirection: "column",      // ✅ 垂直排列 header / content / footer
    }}
  >
    {/* ===== 顶部标题栏（固定） ===== */}
    <div
      style={{
        padding: "10px 14px",
        fontWeight: 700,
        color: COLORS.green,
        borderBottom: "1px solid #E6F3EE",
        flexShrink: 0,               // ✅ 不随内容压缩
        background: "#F9FCFB",
      }}
    >
      HowToEnter Admin
    </div>

    {/* ===== 中间可滚动区域 ===== */}
    <div
      style={{
        padding: 12,
        overflowY: "auto",           // ✅ 内容可滚动
        flex: 1,                     // ✅ 占据剩余空间
      }}
    >

      {/* ===== Image Overrides ===== */}
<div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>
  Image Overrides
</div>

{/* Hero image */}
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
  <span style={{ minWidth: 120 }}>Hero background</span>
  <input
    id="enter-hero"
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => onPick(e, "hero")}
  />
  <button
    onClick={() => document.getElementById("enter-hero")?.click()}
    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
  >
    Choose file
  </button>
  <span style={{ opacity: 0.6 }}>{heroOverride ? "1 file chosen" : "No file chosen"}</span>
  {heroOverride && (
    <button
      onClick={() => onReset("hero")}
      style={{ fontSize: 12, border: 0, background: "transparent", color: COLORS.blue, textDecoration: "underline", cursor: "pointer" }}
    >
      Reset
    </button>
  )}
</div>

{/* Who can enter image */}
<div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
  <span style={{ minWidth: 120 }}>Who can enter image</span>
  <input
    id="enter-who"
    type="file"
    accept="image/*"
    style={{ display: "none" }}
    onChange={(e) => onPick(e, "who")}
  />
  <button
    onClick={() => document.getElementById("enter-who")?.click()}
    style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "#fff", cursor: "pointer" }}
  >
    Choose file
  </button>
  <span style={{ opacity: 0.6 }}>{whoOverride ? "1 file chosen" : "No file chosen"}</span>
  {whoOverride && (
    <button
      onClick={() => onReset("who")}
      style={{ fontSize: 12, border: 0, background: "transparent", color: COLORS.blue, textDecoration: "underline", cursor: "pointer" }}
    >
      Reset
    </button>
  )}
</div>



      {/* Text Overrides */}
      <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>
        Text Overrides
      </div>

      {/* ✅ 动态监听 localStorage 的变化 */}
      <AdminTextOverrides />

      {/* System Status */}
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.6,
          background: "#fff",
          border: "1px solid #E6F3EE",
          borderRadius: 8,
          padding: 10,
          marginTop: 12,
        }}
      >
        <div>✔️ Login verified</div>
        <div>✔️ Session active</div>
        <div>🕒 Last login: {new Date().toLocaleString()}</div>
      </div>
    </div>

    {/* ===== 底部固定操作区 ===== */}
    <div
      style={{
        padding: "10px 12px",
        borderTop: "1px solid #E6F3EE",
        background: "#F9FCFB",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,               // ✅ 固定，不滚动
      }}
    >
      <button
        onClick={() => {
          try { ss?.removeItem("btf.admin"); } catch {}
          setAdmin(false);
        }}
        style={{
          fontSize: 13,
          border: "1px solid #ddd",
          background: "#fff",
          borderRadius: 6,
          padding: "6px 10px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
      <button
  onClick={() => {
    // 1️⃣ 调用清除函数
    textResetAll();

    // 2️⃣ 同步清空 React 状态（⚡这一部分才会让图片立即刷新）
    setHeroOverride("");
    setWhoOverride("");
    setCtaOverride("");
    setStructureOverride(["", "", "", ""]);
    setKitUrl(defaultKit);
    setPosterUrl("");

    // 3️⃣ 通知刷新或强制重载（任选）
    window.dispatchEvent(new Event("btf-image-update"));
    // window.location.reload(); // ← 如果想完全刷新页面可打开
  }}
  style={{
    fontSize: 12,
    border: 0,
    background: COLORS.blue,
    color: "#fff",
    borderRadius: 6,
    padding: "6px 8px",
    cursor: "pointer",
  }}
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
/* ------------------------------------------------------------------ */
/* StepJourney —— 放大版小人沿路径步骤组件                             */
/* ------------------------------------------------------------------ */
function StepJourney({
  steps,
}: {
  steps: { badge: string; title: string; text: string }[];
}) {
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  // 曲线关键点
  const points = useMemo(
    () => [
      { x: 15, y: 25 },
      { x: 50, y: 12 },
      { x: 85, y: 25 },
    ],
    []
  );

  // 键盘切换
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx((p) => Math.min(p + 1, steps.length - 1));
      if (e.key === "ArrowLeft") setIdx((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  const active = steps[idx];

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 24,
        background: COLORS.lightBG,
        boxShadow: "inset 0 0 0 1px #E6F3EE",
        overflow: "hidden",
        padding: "180px 20px 80px", // 给上面曲线和按钮预留空间
      }}
    >
      {/* 曲线 */}
      <svg
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "180px",
        }}
        aria-hidden
      >
        <path
          d="M 5 30 C 30 8, 70 8, 95 30"
          fill="none"
          stroke={COLORS.mint}
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>

      {/* Stage 按钮 */}
      {steps.map((s, i) => {
        const p = points[i];
        const selected = i === idx;
        return (
          <button
            key={s.title}
            onClick={() => setIdx(i)}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
              background: "transparent",
              border: "none",
            }}
            aria-label={s.title}
          >
            <motion.div
              initial={false}
              animate={{ scale: selected ? 1.08 : 1 }}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              style={{
                background: COLORS.white,
                borderRadius: 18,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                boxShadow: selected
                  ? "0 10px 28px rgba(0,0,0,0.14)"
                  : "0 3px 10px rgba(0,0,0,0.08)",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "999px",
                  background: COLORS.mint,
                  color: COLORS.white,
                  fontWeight: 800,
                  fontSize: 16,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {s.badge}
              </span>
              <span style={{ fontWeight: 900, fontSize: 20 }}>{s.title}</span>
            </motion.div>
          </button>
        );
      })}

      {/* 小人放在 Stage 符号下方 */}
      <motion.div
        role="img"
        aria-label={`Mascot at ${active?.title}`}
        initial={false}
        animate={{
          left: `${points[idx].x}%`,
          top: `${points[idx].y + 18}%`, // ⬅️ 下方偏移
        }}
        transition={
          reduce ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 22 }
        }
        style={{
          position: "absolute",
          transform: "translate(-50%, -50%)",
          width: 56,
          height: 56,
          borderRadius: "999px",
          background: COLORS.blue,
          color: COLORS.white,
          display: "grid",
          placeItems: "center",
          boxShadow: "0 0 18px rgba(57,104,123,0.45)",
          fontSize: 28,
        }}
      >
        <span aria-hidden>🧑‍🔬</span>
      </motion.div>

      {/* 进度条 */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 8,
          background: "#E6F3EE",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${((idx + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.35 }}
          style={{ height: "100%", background: COLORS.mint }}
        />
      </div>

      {/* Stage 内容卡片 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: COLORS.white,
            borderRadius: 20,
            padding: "28px 32px",
            maxWidth: 880,
            margin: "0 auto",
            boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
          }}
        >
          <div
            style={{
              fontWeight: 900,
              fontSize: 22,
              marginBottom: 12,
              color: COLORS.charcoal,
            }}
          >
            {active.title}
          </div>
          <p style={{ fontSize: 18, lineHeight: 1.7, opacity: 0.95 }}>
          <Editable
            id={`judge.stage${idx + 1}`}
            defaultText={active.text}
            admin={false} // ✅ 页面不可编辑，只读
            as="span"
          />
        </p>

        </motion.div>
      </AnimatePresence>

      {/* 左右切换按钮（Fragment 包裹） */}
      <>
        <NavChip side="left" onClick={() => setIdx((p) => Math.max(0, p - 1))}>
          ‹
        </NavChip>
        <NavChip side="right" onClick={() => setIdx((p) => Math.min(steps.length - 1, p + 1))}>
          ›
        </NavChip>
      </>
    </div>
  );
}


function NavChip({
  side,
  onClick,
  children,
}: {
  side: "left" | "right";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous stage" : "Next stage"}
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
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* 通用 UI                                                             */
/* ------------------------------------------------------------------ */

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="pill">{children}</span>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="section-title mt-4">{children}</h2>;
}

function SectionBody({ children }: { children: React.ReactNode }) {
  return <div className="section-body">{children}</div>;
}



function TwoColSection({
  pill,
  title,
  body,
  imageSrc,
  imageAlt,
  imageSide = "right",
  bg,
}: {
  pill?: string;
  title?: React.ReactNode;
  body?: string[];
  imageSrc?: string;
  imageAlt?: string;
  imageSide?: "left" | "right";
  bg?: string;
}) {
  // ✅ 新增：监听全局文本更新事件并强制刷新
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const rerender = () => forceUpdate((n) => n + 1);
    window.addEventListener("btf-text-update", rerender);
    return () => window.removeEventListener("btf-text-update", rerender);
  }, []);

  const Img = (
    <div className="mt-6 md:mt-0">
      {imageSrc && (
        <img
          src={imageSrc}
          alt={imageAlt || "image"}
          className="w-full h-auto rounded-2xl"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
          loading="lazy"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://picsum.photos/seed/fallback-two-col/1200/800";
          }}
        />
      )}
    </div>
  );

  const Text = (
    <div>
      {pill && <Pill>{pill}</Pill>}
      {/* ✅ 这里保持不变，但现在每次触发 btf-text-update 时会重新渲染 */}
      {title && <SectionTitle>{title}</SectionTitle>}
      <SectionBody>
        {(body || []).map((p, i) => (
          <p key={i}>
            <Editable
              id={`who.body.${i}`}
              defaultText={p}
              admin={false} // ❌ 页面不允许编辑
              as="span"
            />
          </p>
        ))}
      </SectionBody>

    </div>
  );

  return (
    <section style={{ background: bg }}>
      <Container className="py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {imageSide === "left" ? (
            <>
              {Img}
              {Text}
            </>
          ) : (
            <>
              {Text}
              {Img}
            </>
          )}
        </div>
      </Container>
    </section>
  );
}




/* ----------- 增强区块用到的组件 ----------- */

function SectionHeading({
  children,
  size = "lg",
}: {
  children: React.ReactNode;
  size?: "lg" | "md";
}) {
  const map = {
    lg: "clamp(36px, 5.8vw, 64px)",
    md: "clamp(24px, 3.2vw, 36px)",
  } as const;
  return (
    <h2
      style={{
        fontSize: map[size],
        lineHeight: 1.15,
        fontWeight: 900,
        letterSpacing: "-0.5px",
        marginTop: 10,
        marginBottom: size === "lg" ? 10 : 6,
        color: COLORS.charcoal,
      }}
    >
      {children}
    </h2>
  );
}

function RoadmapGrid({
  items,
}: {
  items: { title: string; text: string }[];
}) {
  return (
    <div className="grid md:grid-cols-2 gap-4 mt-8">
      {items.map((it, i) => (
        <div
          key={i}
          className="rounded-xl"
          style={{
            background: "#fff",                // ✅ 改成纯白
            border: "1px solid #E6F3EE",       // ✅ 边框
            boxShadow: "0 4px 12px rgba(0,0,0,0.04)", // ✅ 阴影
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              fontWeight: 800,
              fontSize: "clamp(16px, 1.8vw, 20px)",
              marginBottom: 6,
              color: COLORS.charcoal,
            }}
          >
            {it.title}
          </div>
          <div
            style={{
              fontSize: "clamp(14px, 1.4vw, 16px)",
              opacity: 0.9,
              lineHeight: 1.6,
              color: COLORS.charcoal,
            }}
          >
            {it.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function TipBanner({
  title,
  text,
  className,
}: {
  title: string;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",                   // ✅ 改成纯白
        border: "1px solid #E6F3EE",          // ✅ 边框
        borderRadius: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.04)", // ✅ 阴影
        padding: "14px 18px",
        display: "grid",
        gridTemplateColumns: "28px 1fr",
        gap: 12,
        alignItems: "center",
      }}
    >
      <span
        aria-hidden
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          background: COLORS.mint,
          display: "inline-grid",
          placeItems: "center",
        }}
      >
        <span role="img" aria-label="tip" style={{ fontSize: 14, color: "#fff" }}>
          💡
        </span>
      </span>
      <div>
        <div style={{ fontWeight: 800, marginBottom: 4 }}>{title}</div>
        <div style={{ opacity: 0.9, lineHeight: 1.6 }}>{text}</div>
      </div>
    </div>
  );
}

// ===== 可编辑文本组件 (监听全局刷新事件) =====
function Editable({
  id,
  defaultText,
  admin,
  as = "span",
  className,
  style,
}: {
  id: string;
  defaultText: string;
  admin: boolean;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}) {
  const Tag = as as any;
  const [val, setVal] = useState(textGet(id, defaultText));

  // 👇 监听全局刷新事件，当 Admin Panel 调用 textSet() 时更新
  useEffect(() => {
    const reload = () => setVal(textGet(id, defaultText));
    window.addEventListener("btf-text-update", reload);
    return () => window.removeEventListener("btf-text-update", reload);
  }, [id, defaultText]);

  // 允许管理员在页面直接编辑
  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    const newVal = e.currentTarget.innerText.trim();
    textSet(id, newVal);
    setVal(newVal);
  };

  return (
    <Tag
      contentEditable={admin}
      suppressContentEditableWarning
      data-editable-id={id}
      className={className}
      style={{
        outline: admin ? "1px dashed rgba(0,0,0,0.2)" : "none",
        cursor: admin ? "text" : "default",
        ...style,
      }}
      onBlur={handleBlur}
    >
      {val}
    </Tag>
  );
}

function AdminTextOverrides() {
  const [fields] = useState([
    { id: "who.title", label: "Who can enter (section title)", def: "Who can enter?" },
    { id: "who.body.0", label: "Who can enter – paragraph 1", def: "Open to high-school students in Years 9–12 from anywhere in Australia (international students welcome)." },
  { id: "who.body.1", label: "Who can enter – paragraph 2", def: "You just need internet access and a device to talk with your mentor." },
  { id: "who.body.2", label: "Who can enter – paragraph 3", def: "Enter in teams of 2–5 (one entry per person). You'll also need an adult supervisor (teacher or parent)." },
  { id: "judge.title", label: "Judging – section title", def: "How Judging Works" },
  { id: "judge.stage1", label: "Judging – Stage 1 ", def: "Every group must submit a poster showing their challenge, research and proposed innovation and reflective short answer questions..." },
  { id: "judge.stage2", label: "Judging – Stage 2 ", def: "Each submission will be double marked and from this, the top 25 entries will be selected..." },
  { id: "judge.stage3", label: "Judging – Stage 3 ", def: "The final round will take place in October 2025 in a live symposium where finalists will be invited..." },
  // ✅ 新增 What we need to see
{ id: "structure.title", label: "Structure – section title", def: "What we need to see" },
{ id: "structure.subtitle", label: "Structure – subtitle", def: "Start by registering and uploading proof that you're a high-school student..." },

// ✅ 四个卡片
{ id: "structure.card1.title", label: "Structure – Card 1 title", def: "Explore" },
{ id: "structure.card1.text", label: "Structure – Card 1 text", def: "Do quick background research..." },
{ id: "structure.card2.title", label: "Structure – Card 2 title", def: "Define" },
{ id: "structure.card2.text", label: "Structure – Card 2 text", def: "Write a clear research question..." },
{ id: "structure.card3.title", label: "Structure – Card 3 title", def: "Create" },
{ id: "structure.card3.text", label: "Structure – Card 3 text", def: "Brainstorm solutions..." },
{ id: "structure.card4.title", label: "Structure – Card 4 title", def: "Show" },
{ id: "structure.card4.text", label: "Structure – Card 4 text", def: "Prepare your poster and complete short answers..." },
]);


  // 当前 localStorage 中的文本
  const [values, setValues] = useState<Record<string, string>>(() => readText());

  // 监听全局更新事件（无论来自页面编辑还是 Admin 面板）
  useEffect(() => {
    const reload = () => setValues(readText());
    window.addEventListener("btf-text-update", reload);
    return () => window.removeEventListener("btf-text-update", reload);
  }, []);

  return (
    <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
      {fields.map((f) => {
        const val = values[f.id] ?? f.def;
        return (
          <div
            key={f.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 6,
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 4 }}>{f.label}</div>
              <input
                value={val}
                onChange={(e) => textSet(f.id, e.target.value)} // ✅ 双向同步
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                }}
              />
            </div>
            <button
              onClick={() => textReset(f.id)}
              style={{
                height: 32,
                padding: "6px 10px",
                borderRadius: 6,
                border: 0,
                background: "#f6f6f6",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        );
      })}
    </div>
  );
}
