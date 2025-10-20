// src/FAQPage.tsx
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";
import { COLORS, Container } from "./components/common";
import MainNav from "./components/MainNav";
import StyleInject from "./components/StyleInject";
import Cards from "./sections/home/Cards";
import Footer from "./sections/home/Footer";
import MomentsMarquee from "./sections/home/MomentsMarquee";

/* ======================= 全局背景（与 AboutPage 一致） ======================= */
function GlobalBackground({ scoped = false }: { scoped?: boolean }) {
  const base = scoped ? "faq-bgfx-scope" : "faq-bgfx";
  return (
    <>
      <style>{`
        .faq-bgfx{position:fixed; inset:0; pointer-events:none; z-index:0}
        .faq-bgfx-scope{position:absolute; inset:0; pointer-events:none; z-index:0}
        .faq-bgfx-base{ background:${COLORS.lightBG}; }
        .faq-bgfx-aurora{ filter: blur(80px); opacity:.75; }
        .faq-bgfx-aurora-b{ opacity:.55; }
        .faq-bgfx-aurora-a{
          animation: faq-driftA 26s ease-in-out infinite alternate;
          background:
            radial-gradient(38% 46% at 12% 20%, rgba(76,175,140,.35), transparent 62%),
            radial-gradient(36% 42% at 86% 18%, rgba(26,115,232,.24), transparent 64%);
        }
        .faq-bgfx-aurora-b{
          animation: faq-driftB 34s ease-in-out infinite alternate;
          background:
            radial-gradient(44% 54% at 78% 84%, rgba(255,181,67,.28), transparent 68%),
            radial-gradient(28% 34% at 18% 86%, rgba(13,140,116,.22), transparent 62%);
        }
        @keyframes faq-driftA{
          0%{ transform: translate3d(-4%, -2%, 0) scale(1.02) }
          50%{ transform: translate3d(4%, 1%, 0) scale(1.06) }
          100%{ transform: translate3d(-2%, 3%, 0) scale(1.03) }
        }
        @keyframes faq-driftB{
          0%{ transform: translate3d(2%, 3%, 0) scale(1.03) }
          50%{ transform: translate3d(-3%, -2%, 0) scale(1.06) }
          100%{ transform: translate3d(3%, -1%, 0) scale(1.02) }
        }
        .faq-bgfx-grid{
          background-image:
            linear-gradient(to right, rgba(0,0,0,.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,.035) 1px, transparent 1px);
          background-size:24px 24px; opacity:.12;
        }
        .faq-bgfx-noise{
          opacity:.06;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");
        }
      `}</style>
      <div className={`${base} faq-bgfx-base`} />
      <div className={`${base} faq-bgfx-aurora faq-bgfx-aurora-a`} />
      <div className={`${base} faq-bgfx-aurora faq-bgfx-aurora-b`} />
      <div className={`${base} faq-bgfx-grid`} />
      <div className={`${base} faq-bgfx-noise`} />
    </>
  );
}

/* ======================= 数据 ======================= */
const FAQS = [
  {
    id: "solo",
    q: "Can I participate as a solo entrant?",
    a: `Yes, you can definitely take part individually. However, one of our main ambitions of the challenge is
to develop and build collaboration and teamwork skills - so reach out, ask your friends and peers, and try and assemble an awesome team!
This is an experience you'll want to share with others.`
  },
  {
    id: "ceremony",
    q: "Will there be a ceremony to present the Award?",
    a: "Yes, at the end of the challenge we will hold an award ceremony for those lucky enough to have been selected as a finalist."
  },
  {
    id: "no-stem",
    q: "I don’t think I have enough knowledge or experience in STEM, can I still enter?",
    a: "Yes, the Challenge is open to all those who are motivated highschool students with a willingness to impact the world around them."
  },
  {
    id: "not-9-12",
    q: "I’m not a high school student in years 9-12, can I still enter?",
    a: "Unfortunately not, the challenge is only open to those within these years at school. If you’re not in year 9 yet, hang in there we’ll see you soon."
  },
  {
    id: "more-than-one",
    q: "Can I enter more than one project?",
    a: "No, unfortunately you can only enter one project per year."
  },
  {
    id: "enter-again",
    q: "Can I participate in the Challenge again if I entered it in a previous year?",
    a: "Yes, absolutely. We love seeing familiar faces and welcome anyone who wants to participate again."
  },
  {
    id: "no-prototype",
    q: "I haven't made a prototype for my design - can I still enter?",
    a: "Yes. We appreciate that prototyping is not always feasible while studying. Prototyping will not be considered in marking criteria so don’t worry. However, if you are keen enough to build one, there will be additional prizes for the top prototypes."
  },
  {
    id: "secret",
    q: "Can I enter but keep my design a secret?",
    a: "Unfortunately, no. Our aim is to celebrate and raise awareness for young designers and we can’t do this without your designs and stories. Your entry will be published on the BIOTech Futures website and may be used for publicity purposes. If you're worried your idea might be stolen by someone else, we suggest you seek advice from your mentor during the challenge."
  },
  {
    id: "free",
    q: "Is it free to enter?",
    a: "Yes!"
  },
  {
    id: "profit",
    q: "Will BIOTech Futures profit from my idea?",
    a: "No. You will retain the rights to any intellectual property surrounding your idea. BIOTech Futures will not steal your idea, ever. The BIOTech Futures Challenge could, instead, help you find contacts that can push your design into the market."
  },
  {
    id: "region",
    q: "Why isn't my country or region participating?",
    a: "We can only run the BIOTech Futures Challenge in countries or regions where we have the suitable means to support it. We hope to add more countries to the BIOTech Futures Challenge in future, when we can. When we do, we’ll update our Terms and Conditions."
  }
];

/* ======================= 高亮工具 ======================= */
function highlight(text: string, term: string) {
  if (!term) return text;
  try {
    const re = new RegExp(`(${term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")})`, "ig");
    return text.split(re).map((part, i) =>
      re.test(part) ? (
        <mark key={i} style={{ background: "#FFF3B0", padding: "0 2px" }}>
          {part}
        </mark>
      ) : (
        <React.Fragment key={i}>{part}</React.Fragment>
      )
    );
  } catch {
    return text;
  }
}

/* ======================= 页面 ======================= */
export default function FAQPage() {


  const [faqs, setFaqs] = useState(FAQS);

useEffect(() => {
  const updateFAQs = () => {
    const overrides = readText();
    const merged = [...FAQS];

    // 🔹 从 localStorage 提取额外 FAQ（新增的）
    const extraKeys = Object.keys(overrides)
      .map((k) => k.replace(/\.[qa]$/, ""))
      .filter((v, i, arr) => arr.indexOf(v) === i);

    extraKeys.forEach((id) => {
      if (!merged.some((f) => f.id === id)) {
        merged.push({
          id,
          q: overrides[`${id}.q`] || "Untitled Question",
          a: overrides[`${id}.a`] || "No answer yet.",
        });
      }
    });

    setFaqs(merged);
  };

  updateFAQs();
  window.addEventListener("btf-text-update", updateFAQs);
  return () => window.removeEventListener("btf-text-update", updateFAQs);
}, []);

  // ===== Admin 登录逻辑（与其他页面相同） =====
const ss = typeof window !== "undefined" ? window.sessionStorage : undefined;
const [admin, setAdmin] = useState<boolean>(() => ss?.getItem("btf.admin") === "true");
const [showLogin, setShowLogin] = useState(false);
const [pwd, setPwd] = useState("");


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

// 登录逻辑
const doLogin = () => {
  const expected = "btf-2024"; // ✅ 固定密码（或用环境变量）
  if (pwd.trim() === expected) {
    setAdmin(true);
    try { ss?.setItem("btf.admin", "true"); } catch {}
    setShowLogin(false);
    setPwd("");
  } else {
    alert("❌ Incorrect password");
  }
};


  const [search, setSearch] = useState("");
  const [openIds, setOpenIds] = useState<string[]>([]); // 折叠/展开状态

  // URL hash 打开对应问题
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!hash) return;
    const exists = FAQS.find((f) => f.id === hash);
    if (exists) {
      setOpenIds((ids) => Array.from(new Set([...ids, exists.id])));
      document.getElementById(exists.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // 顶部滚动进度
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setProgress(Math.min(100, Math.max(0, (window.scrollY / max) * 100)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 搜索过滤
const filtered = useMemo(() => {
  const t = search.trim().toLowerCase();
  if (!t) return faqs;
  return faqs.filter((f) =>
    f.q.toLowerCase().includes(t) || f.a.toLowerCase().includes(t)
  );
}, [search, faqs]);


  const expandAll = () => setOpenIds(filtered.map((f) => f.id));
  const collapseAll = () => setOpenIds([]);

  return (
    <main
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        background: "transparent",
        color: COLORS.charcoal,
        position: "relative",
        minHeight: "100vh"
      }}
    >
      <GlobalBackground />
      <div style={{ position: "relative", zIndex: 1 }}>
        <StyleInject />
        <MainNav />

        {/* 顶部进度条 */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, height: 3, background: "#F2F5F4" }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: COLORS.mint,
              transition: "width .15s linear"
            }}
          />
        </div>

        <Container className="py-10 md:py-14">
          {/* ✅ 去掉左侧目录，只保留主体 */}
          <section>
            <header className="mb-6">
              <p style={{ color: COLORS.mint, fontWeight: 800, letterSpacing: 0.6 }}>FREQUENTLY</p>
              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 48px)",
                  lineHeight: 1.1,
                  margin: "4px 0 12px"
                }}
              >
                Asked Questions
              </h1>

              <div className="flex flex-wrap gap-3 items-center">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions…"
                  aria-label="Search FAQs"
                  style={{
                    flex: "1 1 320px",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid #E6F3EE",
                    outline: "none",
                    background: COLORS.white
                  }}
                />
                <button
                  onClick={expandAll}
                  className="px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: COLORS.mint, color: "#fff" }}
                >
                  Expand all
                </button>
                <button
                  onClick={collapseAll}
                  className="px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: "#EEF6F4", color: COLORS.charcoal, border: "1px solid #E6F3EE" }}
                >
                  Collapse all
                </button>
              </div>
            </header>

            <div className="space-y-4">
            {filtered.map((f) => (
              <FAQItem
                key={f.id}
                id={f.id}
                question={f.q}
                answer={f.a}
                isOpen={openIds.includes(f.id)}
                onToggle={() =>
                  setOpenIds((ids) =>
                    ids.includes(f.id) ? ids.filter((x) => x !== f.id) : [...ids, f.id]
                  )
                }
                searchTerm={search}
                admin={admin}  // ✅ 加上这行！
              />
            ))}

              {filtered.length === 0 && (
                <div className="rounded-xl p-4" style={{ background: COLORS.lightBG }}>
                  No results. Try different keywords.
                </div>
              )}
            </div>
          </section>
        </Container>

        <Cards />
        <MomentsMarquee />

        <Footer />
        {/* ✅ Admin 登录按钮 */}
<button
  onClick={() => setShowLogin(true)}
  title="Admin"
  style={{
    position: "fixed",
    right: 10,
    bottom: 10,
    width: 22,
    height: 22,
    borderRadius: 9999,
    border: 0,
    backgroundColor: "rgba(1,113,81,0.1)",
    cursor: "pointer",
    zIndex: 1000,
  }}
/>

{/* ✅ 登录弹窗 */}
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
    </div>
  </div>
)}

{/* ✅ 管理面板浮层 */}
{admin && <AdminPanel ss={ss} setAdmin={setAdmin} />}

      </div>
    </main>
  );
}

/* ======================= 子组件 ======================= */
function FAQItem({
  id,
  question,
  answer,
  isOpen,
  onToggle,
  searchTerm,
  admin,
}: {
  id: string;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  searchTerm: string;
  admin: boolean;  // ✅ 新增 admin 参数类型
}) {

  return (
    <div
      id={id}
      className="rounded-2xl"
      style={{ border: "1px solid #E6F3EE", overflow: "hidden", background: "#fff" }}
    >
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-[#FAFDFB]"
      >
        <span
          className="mt-1 inline-flex items-center justify-center w-6 h-6 rounded-full"
          style={{ background: COLORS.lightBG }}
        >
          {isOpen ? "–" : "+"}
        </span>
        <div style={{ fontWeight: 800, fontSize: "clamp(16px, 2.2vw, 20px)" }}>
          <Editable id={`${id}.q`} defaultText={question} admin={admin} />

        </div>

      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ borderTop: "1px solid #E6F3EE" }}
          >
            <div className="px-5 py-4 relative">
              <div style={{ lineHeight: 1.7, fontSize: 16 }}>
              <Editable id={`${id}.a`} defaultText={answer} admin={admin} />
            </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* ====== Admin 文字覆写逻辑 (localStorage + 全局事件通知) ====== */
/* ------------------------------------------------------------------ */

const ls = typeof window !== "undefined" ? window.localStorage : undefined;
const TEXT_KEY = "btf.faq.text";

// 读取所有 FAQ 文本（问题和答案）
export const readText = () => {
  try {
    return JSON.parse(ls?.getItem(TEXT_KEY) || "{}") || {};
  } catch {
    return {};
  }
};

// 写入 localStorage
export const writeText = (m: Record<string, string>) => {
  try {
    ls?.setItem(TEXT_KEY, JSON.stringify(m));
  } catch {}
};

// 获取文本
export const textGet = (id: string, fallback: string) =>
  readText()[id] ?? fallback;

// 更新文本
export const textSet = (id: string, v: string) => {
  const m = readText();
  m[id] = v;
  writeText(m);
  window.dispatchEvent(new Event("btf-text-update"));
};

// 删除单项文本
export const textReset = (id: string) => {
  const m = readText();
  delete m[id];
  writeText(m);
  window.dispatchEvent(new Event("btf-text-update"));
};

// ✅ Reset All：清空所有 FAQ 文本
export const textResetAll = () => {
  try {
    ls?.removeItem(TEXT_KEY);
    console.log("✅ All FAQ text cleared");
  } catch (err) {
    console.error("❌ Error resetting FAQ:", err);
  }
  window.dispatchEvent(new Event("btf-text-update"));
};


function Editable({
  id,
  defaultText,
  admin,
  as = "span",
  style,
}: {
  id: string;
  defaultText: string;
  admin: boolean;
  as?: keyof JSX.IntrinsicElements;
  style?: React.CSSProperties;
}) {
  const Tag = as as any;
  const [val, setVal] = useState(textGet(id, defaultText));

  useEffect(() => {
    const reload = () => setVal(textGet(id, defaultText));
    window.addEventListener("btf-text-update", reload);
    return () => window.removeEventListener("btf-text-update", reload);
  }, [id, defaultText]);

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
      onBlur={handleBlur}
      style={{
        outline: admin ? "1px dashed rgba(0,0,0,0.3)" : "none",
        cursor: admin ? "text" : "default",
        ...style,
      }}
    >
      {val}
    </Tag>
  );
}


function AdminPanel({ ss, setAdmin }: any) {
  return (
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
        maxHeight: "50vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 顶部标题 */}
      <div
        style={{
          padding: "10px 14px",
          fontWeight: 700,
          color: COLORS.green,
          borderBottom: "1px solid #E6F3EE",
          background: "#F9FCFB",
          flexShrink: 0,
        }}
      >
        FAQ Admin
      </div>

      {/* 滚动内容区域 */}
      <div style={{ padding: 12, overflowY: "auto", flex: 1 }}>
        <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 8 }}>
          Text Overrides
        </div>

        <AdminTextOverrides />
      </div>

      {/* 底部操作按钮 */}
      <div
        style={{
          padding: "10px 12px",
          borderTop: "1px solid #E6F3EE",
          background: "#F9FCFB",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexShrink: 0,
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
            textResetAll();
            window.location.reload(); // ✅ 立即刷新
          }}
          style={{
            fontSize: 13,
            border: 0,
            background: COLORS.green,
            color: "#fff",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Reset All
        </button>
      </div>
    </div>
  );
}

function AdminTextOverrides() {
  const [values, setValues] = useState<Record<string, string>>(() => readText());
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");

  useEffect(() => {
    const reload = () => setValues(readText());
    window.addEventListener("btf-text-update", reload);
    return () => window.removeEventListener("btf-text-update", reload);
  }, []);

  // ✅ 合并初始 FAQ + localStorage 扩展项
  const baseFields = FAQS.flatMap((f) => [
    { id: `${f.id}.q`, label: `${f.id} — Question`, def: f.q },
    { id: `${f.id}.a`, label: `${f.id} — Answer`, def: f.a },
  ]);

  const extraKeys = Object.keys(values)
    .map((k) => k.replace(/\.[qa]$/, ""))
    .filter((v, i, arr) => arr.indexOf(v) === i && !FAQS.some((f) => f.id === v));

  extraKeys.forEach((id) => {
    baseFields.push({ id: `${id}.q`, label: `${id} — Question`, def: "" });
    baseFields.push({ id: `${id}.a`, label: `${id} — Answer`, def: "" });
  });

  const fields = baseFields;

  // ✅ 新增 FAQ
  const addFAQ = () => {
    if (!newQ.trim() || !newA.trim()) {
      alert("Please fill both Question and Answer");
      return;
    }
    const newId = `faq-${Date.now()}`;
    textSet(`${newId}.q`, newQ.trim());
    textSet(`${newId}.a`, newA.trim());
    setNewQ("");
    setNewA("");
    window.dispatchEvent(new Event("btf-text-update"));
    alert("✅ New FAQ added!");
  };

  // ✅ 删除整组 FAQ（question + answer）
  const deleteFAQ = (idBase: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    textReset(`${idBase}.q`);
    textReset(`${idBase}.a`);
    window.dispatchEvent(new Event("btf-text-update"));
    alert(`🗑 Deleted ${idBase}`);
  };

  // 分组：把 q/a 配成对方便渲染
  const grouped = fields.reduce((acc, f) => {
    const base = f.id.replace(/\.[qa]$/, "");
    acc[base] = acc[base] || { id: base, q: "", a: "" };
    if (f.id.endsWith(".q")) acc[base].q = f;
    else acc[base].a = f;
    return acc;
  }, {} as Record<string, { id: string; q: any; a: any }>);

  const groupedArr = Object.values(grouped);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {groupedArr.map((g) => {
        const qVal = values[g.q.id] ?? g.q.def;
        const aVal = values[g.a.id] ?? g.a.def;
        return (
          <div
            key={g.id}
            style={{
              border: "1px solid #E6F3EE",
              borderRadius: 8,
              padding: 10,
              background: "#fff",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ fontWeight: 700, color: COLORS.green, fontSize: 13 }}>
              {g.id}
            </div>
            <input
              value={qVal}
              onChange={(e) => textSet(g.q.id, e.target.value)}
              placeholder="Question"
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #ddd",
              }}
            />
            <textarea
              value={aVal}
              onChange={(e) => textSet(g.a.id, e.target.value)}
              placeholder="Answer"
              rows={2}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #ddd",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  textReset(g.q.id);
                  textReset(g.a.id);
                }}
                style={{
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  background: "#f8f8f8",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Reset
              </button>
              <button
                onClick={() => deleteFAQ(g.id)}
                style={{
                  padding: "5px 8px",
                  borderRadius: 6,
                  border: 0,
                  background: "#fbeaea",
                  color: "#b20000",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                🗑 Delete
              </button>
            </div>
          </div>
        );
      })}

      {/* 新增 FAQ 输入区 */}
      <div
        style={{
          borderTop: "1px solid #E6F3EE",
          marginTop: 12,
          paddingTop: 12,
        }}
      >
        <div style={{ fontWeight: 700, color: COLORS.green, marginBottom: 6 }}>
          ➕ Add New FAQ
        </div>
        <input
          value={newQ}
          onChange={(e) => setNewQ(e.target.value)}
          placeholder="New question"
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid #ddd",
            marginBottom: 6,
          }}
        />
        <textarea
          value={newA}
          onChange={(e) => setNewA(e.target.value)}
          placeholder="New answer"
          rows={3}
          style={{
            width: "100%",
            padding: "6px 8px",
            borderRadius: 6,
            border: "1px solid #ddd",
            resize: "vertical",
            marginBottom: 6,
          }}
        />
        <button
          onClick={addFAQ}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 6,
            border: 0,
            background: COLORS.green,
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Add FAQ
        </button>
      </div>
    </div>
  );
}
