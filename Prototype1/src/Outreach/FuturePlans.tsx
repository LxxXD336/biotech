import React, { useEffect, useRef, useState } from "react";

/* ====== 新增：内联编辑支持（与 OutreachPage/Events 保持一致风格） ====== */
type InlineCtl = { value?: string; onChange: (v: string) => void };

const Editable: React.FC<{
  ctl: InlineCtl;
  as?: "span" | "div";
  className?: string;
  dashed?: boolean;
}> = ({ ctl, as = "span", className = "", dashed = true }) => {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const cur = ref.current;
    if (cur && cur.innerText !== (ctl.value ?? "")) cur.innerText = ctl.value ?? "";
  }, [ctl.value]);
  const Tag: any = as;
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={(e: React.FormEvent<HTMLElement>) =>
        ctl.onChange((e.currentTarget as HTMLElement).innerText)
      }
      className={`${className} inline-block align-baseline ${
        dashed
          ? "outline outline-2 outline-dashed outline-emerald-600/60 rounded-lg px-1 -mx-1"
          : ""
      }`}
    />
  );
};

/* ====== 原文件：类型与 Props ====== */
export type Idea = {
  id: string;
  title: string;
  details: string;
  category?: string;
  tags?: string[];
  preferredMonth?: string;
  location?: string;
  createdAt: number;
};

export interface FuturePlansProps {
  onSubmit?: (idea: Idea) => Promise<void> | void;
  storageKey?: string;
  allowLocalSave?: boolean;
  className?: string;
  title?: string;
  subtitle?: string;
  kicker?: string; // top-left badge text

  /* 新增：仅当 Admin 面板打开“Enable inline editing”时由父组件传入 */
  inlineControls?: {
    title?: InlineCtl;
    subtitle?: InlineCtl;
    kicker?: InlineCtl;
  };
}

/** Default quick tags */
const DEFAULT_TAGS = [
  "Workshop",
  "Hackathon",
  "Lab tour",
  "Mentorship",
  "Competition",
  "Community day",
  "Careers talk",
  "Field trip",
];

/** Always format months in English so they don't follow system locale */
const EN_LOCALE = "en-AU";
const monthsAhead = (n = 18) => {
  const list: { value: string; label: string }[] = [];
  const now = new Date();
  now.setDate(1);
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    list.push({
      value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleString(EN_LOCALE, { month: "long", year: "numeric" }),
    });
  }
  return list;
};

const useLocalIdeas = (key: string, enabled: boolean) => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) setIdeas(JSON.parse(raw));
    } catch {}
  }, [key, enabled]);
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(ideas));
    } catch {}
  }, [ideas, key, enabled]);
  return [ideas, setIdeas] as const;
};

const FuturePlans: React.FC<FuturePlansProps> = ({
  onSubmit,
  storageKey = "future_plans_ideas",
  allowLocalSave = true,
  className = "",
  title = "Future plans",
  subtitle = "Write down your event ideas and suggestions for us!",
  kicker = "FUTURE",
  /* 新增：解构 inlineControls */
  inlineControls,
}) => {
  const [ideas, setIdeas] = useLocalIdeas(storageKey, allowLocalSave);
  const hasIdeas = ideas.length > 0;

  const [titleInput, setTitleInput] = useState("");
  const [details, setDetails] = useState("");
  const [category, setCategory] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [preferredMonth, setPreferredMonth] = useState("");
  const [location, setLocation] = useState("");
  const canSubmit = titleInput.trim().length >= 3 && details.trim().length >= 10;

  const [submitting, setSubmitting] = useState(false);
  const [boom, setBoom] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setInView(true)),
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const toggleTag = (t: string) =>
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  const clearForm = () => {
    setTitleInput("");
    setDetails("");
    setCategory("");
    setSelectedTags([]);
    setPreferredMonth("");
    setLocation("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    const idea: Idea = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: titleInput.trim(),
      details: details.trim(),
      category: category.trim() || undefined,
      tags: selectedTags.length ? selectedTags : undefined,
      preferredMonth: preferredMonth || undefined,
      location: location.trim() || undefined,
      createdAt: Date.now(),
    };
    try {
      if (onSubmit) await onSubmit(idea);
      setIdeas((arr) => [idea, ...arr]);
      clearForm();
      setBoom((n) => n + 1);
      setTimeout(() => setSubmitting(false), 500);
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <section
      ref={containerRef}
      className={`relative full-bleed ${className} ${hasIdeas ? "pb-24 md:pb-32" : ""}`}
      style={{ overflow: "hidden", background: "transparent" }}
      aria-label="Future plans section"
    >
      <style>{`
        /* Animations */
        @keyframes softIn { 0% { opacity: 0; transform: translateY(16px) scale(0.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes ideaIn { 0% { opacity: 0; transform: translateY(10px) scale(.98); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes confetti { 0% { transform: translate(var(--x, 0), 0) rotate(0deg); opacity: 1; } 100% { transform: translate(calc(var(--x, 0) * 1.2), -120px) rotate(360deg); opacity: 0; } }
        .animate-softIn { animation: softIn .7s cubic-bezier(.2,.8,.2,1) both; }
        .animate-ideaIn { animation: ideaIn .45s cubic-bezier(.2,.8,.2,1) both; }

        /* Aurora border */
        @property --a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
        @keyframes hueSpin { to { --a: 360deg; } }
        .fp-aurora-border { --thickness: 2px; }
        .fp-aurora-border::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit;
          background: conic-gradient(from var(--a), rgba(231,185,208,.65), rgba(137,179,247,.65), rgba(106,221,183,.65), rgba(236,191,214,.97));
          animation: hueSpin 24s linear infinite; padding: var(--thickness); box-sizing: border-box;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
        }

        /* Full-bleed container */
        .full-bleed{ position: relative; left:50%; right:50%; margin-left:-50vw; margin-right:-50vw; width:100vw; max-width:100vw; }
        
        /* Shimmer for active tags */
        @keyframes gradientShift {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }

        /* Theme (aligned with site) */
        .fp-theme{
          --brand: #017151;
          --brand-06: rgba(1,113,81,.06);
          --brand-08: rgba(1,113,81,.08);
          --brand-16: rgba(1,113,81,.16);
          --brand-24: rgba(1,113,81,.24);
          --brand-ink: #174243;
          --ink-70: rgba(23,66,67,.70);
          --ink-60: rgba(23,66,67,.60);
          --kicker-bg: var(--brand);
          --kicker-fg: #fff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial;
        }
        .kicker{display:inline-flex;align-items:center;gap:.5ch;padding:.35rem .7rem;border-radius:999px;background: var(--kicker-bg); color: var(--kicker-fg); font-weight:800;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;}
        .heading-xl{font-weight:900;line-height:1.1;letter-spacing:.01em;color:var(--brand);}
        @media (min-width:768px){.heading-xl{font-size:2.2rem}}
        @media (min-width:1024px){.heading-xl{font-size:2.6rem}}
      `}</style>

      <div className={`fp-theme mx-auto w-full max-w-[1100px] ${inView ? "animate-softIn" : "opacity-0 translate-y-4"}`}>
        <header className="mb-6 md:mb-8">
          <div className="kicker mb-3">
            {inlineControls?.kicker ? <Editable ctl={inlineControls.kicker} /> : kicker}
          </div>
          <h3 className="heading-xl">
            {inlineControls?.title ? <Editable ctl={inlineControls.title} as="span" /> : title}
          </h3>
          <p className="mt-2 text-[15px] md:text-base max-w-2xl" style={{ color: "var(--ink-70)" }}>
            {inlineControls?.subtitle ? <Editable ctl={inlineControls.subtitle} as="span" /> : subtitle}
          </p>
        </header>

        <div className="relative rounded-3xl">
          <span aria-hidden className="fp-aurora-border pointer-events-none absolute inset-0 rounded-3xl" />
          <form
            onSubmit={handleSubmit}
            className="relative rounded-3xl bg-white/70 backdrop-blur-xl p-5 md:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
          >
            <div className="grid gap-4 md:gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold" style={{ color: "var(--brand-ink)" }}>
                  Event idea title
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="such as: AI Workshop for Beginners"
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2"
                  style={{
                    borderColor: "rgba(0,0,0,.10)",
                    boxShadow: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px var(--brand-24)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  maxLength={80}
                />
                <div className="mt-1 text-xs" style={{ color: "var(--ink-60)" }}>
                  at least 3 words
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold" style={{ color: "var(--brand-ink)" }}>
                  Idea details
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="your idea description, the more details the better"
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2 h-28 outline-none focus:ring-2"
                  style={{ borderColor: "rgba(0,0,0,.10)" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px var(--brand-24)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  maxLength={400}
                />
                <div className="mt-1 text-xs" style={{ color: "var(--ink-60)" }}>
                  {details.length}/400
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold" style={{ color: "var(--brand-ink)" }}>
                  Type
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Workshop / Competition / Mentorship…"
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2"
                  style={{ borderColor: "rgba(0,0,0,.10)" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px var(--brand-24)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold" style={{ color: "var(--brand-ink)" }}>
                  Preferred month
                </label>
                <select
                  value={preferredMonth}
                  onChange={(e) => setPreferredMonth(e.target.value)}
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2"
                  style={{ borderColor: "rgba(0,0,0,.10)" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px var(--brand-24)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                >
                  <option value="">not sure</option>
                  {monthsAhead(18).map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold" style={{ color: "var(--brand-ink)" }}>
                  Location / city
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="For example: Sydney / Melbourne / Regional NSW…"
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2 outline-none focus:ring-2"
                  style={{ borderColor: "rgba(0,0,0,.10)" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 2px var(--brand-24)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  maxLength={40}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: "var(--brand-ink)" }}>
                    Quick label:
                  </span>
                  {DEFAULT_TAGS.map((t) => {
                    const active = selectedTags.includes(t);
                    return (
                      <button
                        type="button"
                        key={t}
                        onClick={() => toggleTag(t)}
                        onMouseMove={(e) => {
                          const el = e.currentTarget as HTMLButtonElement;
                          (el.style as any).setProperty("--mx", (e.nativeEvent as any).offsetX + "px");
                          (el.style as any).setProperty("--my", (e.nativeEvent as any).offsetY + "px");
                        }}
                        className="relative overflow-hidden px-3 py-1 rounded-full text-sm border transition"
                        style={
                          active
                            ? {
                                background:
                                  "linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#ec4899)",
                                backgroundSize: "200% 100%",
                                animation: "gradientShift 8s linear infinite",
                                color: "#fff",
                                borderColor: "transparent",
                                boxShadow: "0 8px 24px rgba(16,185,129,.25)",
                              }
                            : {
                                background:
                                  "radial-gradient(120px 60px at var(--mx,50%) var(--my,50%), rgba(16,185,129,0.12), transparent 60%)",
                                borderColor: "rgba(0,0,0,.10)",
                              }
                        }
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={clearForm}
                className="px-4 py-2 rounded-xl border bg-white transition"
                style={{ borderColor: "var(--brand-16)", color: "var(--brand-ink)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--brand-08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="px-4 py-2 rounded-xl text-white shadow transition"
                style={{
                  background: canSubmit && !submitting ? "var(--brand)" : "rgba(1,113,81,.45)",
                  cursor: canSubmit && !submitting ? "pointer" : "not-allowed",
                  boxShadow: canSubmit && !submitting ? "0 10px 26px var(--brand-16)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (canSubmit && !submitting) e.currentTarget.style.background = "#016446";
                }}
                onMouseLeave={(e) => {
                  if (canSubmit && !submitting) e.currentTarget.style.background = "var(--brand)";
                }}
              >
                {submitting ? "Submitting…" : "Submit idea"}
              </button>
            </div>
          </form>
        </div>

        {ideas.length > 0 && (
          <div className="mt-10 grid gap-4 md:gap-6 md:grid-cols-2">
            {ideas.map((it, i) => (
              <div
                key={it.id}
                className="rounded-2xl border bg-white/70 backdrop-blur-xl p-4 md:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.07)] transition animate-ideaIn"
                style={{ animationDelay: `${i * 40}ms`, borderColor: "rgba(0,0,0,.05)" }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base md:text-lg font-semibold" style={{ color: "var(--brand-ink)" }}>
                      {it.title}
                    </div>
                    <div className="mt-0.5 text-xs" style={{ color: "var(--ink-60)" }}>
                      {new Date(it.createdAt).toLocaleString(EN_LOCALE, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  {it.tags && it.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {it.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-full text-[11px] text-white"
                          style={{
                            background: "linear-gradient(90deg,#10b981,#06b6d4,#8b5cf6,#ec4899)",
                            backgroundSize: "200% 100%",
                            animation: "gradientShift 12s linear infinite"
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-[15px] leading-6 whitespace-pre-wrap" style={{ color: "var(--brand-ink)" }}>
                  {it.details}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm" style={{ color: "var(--ink-70)" }}>
                  {it.category && (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ background: "var(--brand)" }} />
                      {it.category}
                    </span>
                  )}
                  {it.preferredMonth && (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ background: "#3b82f6" }} />
                      {it.preferredMonth}
                    </span>
                  )}
                  {it.location && (
                    <span className="inline-flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full" style={{ background: "#8b5cf6" }} />
                      {it.location}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Confetti key={boom} />
    </section>
  );
};

const Confetti: React.FC = () => {
  const colors = ["#017151", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b"];
  const pieces = 18;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: pieces }).map((_, i) => {
        const left = 50 + (Math.random() * 40 - 20);
        const x = (Math.random() * 40 - 20) + "px";
        const delay = i * 15;
        const size = 6 + Math.random() * 7;
        const color = colors[i % colors.length];
        return (
          <span
            key={i}
            className="absolute bottom-8"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              background: color,
              transform: "translate(-50%, 0)",
              borderRadius: 2,
              animation: `confetti 900ms ease-out ${delay}ms forwards`,
              ...( { ["--x" as any]: x } as any),
            }}
          />
        );
      })}
    </div>
  );
};

export default FuturePlans;
