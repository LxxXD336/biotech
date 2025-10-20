
import { createPortal } from 'react-dom';
// src/Outreach/EventShowcase.tsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, LayoutGrid, Rows3, Sparkles,
  ChevronLeft, ChevronRight, MapPin, Calendar, X
} from "lucide-react";
// 自动抓取 ./photo/ 下所有图片（排除 HEIC）
const PHOTOS = import.meta.glob('./photo/*.{jpg,jpeg,png,JPG,JPEG}', {
  eager: true,
  as: 'url',
});
const photoPool = Array.from(
  new Set(                       // 去重（避免指向相同文件）
    Object.entries(PHOTOS)
      .filter(([k]) => !/\.heic$/i.test(k))     // 保险：排除 HEIC
      .sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' })) // 按文件名排序
      .map(([, url]) => url as string)
  )
);

// 小工具：第 i 张图片（若数量不足返回空串，不会抛错）
const pick = (i: number) => (i < photoPool.length ? photoPool[i] : '');

/** ===== 配色（走全站 --brand，回退到 #017151） ===== */
const BRAND = "var(--brand, #017151)";
const B06   = "var(--brand-06, rgba(1,113,81,.06))";
const B08   = "var(--brand-08, rgba(1,113,81,.08))";
const B16   = "var(--brand-16, rgba(1,113,81,.16))";

/* ======================================================================= */
/*                          仅新增：内联编辑支持                             */
/* ======================================================================= */

type InlineCtl = { value?: string; onChange: (v: string) => void };

/** 可重复使用的内联可编辑标签（虚线框样式与 OutreachPage 保持一致） */
const Editable: React.FC<{
  ctl: InlineCtl;
  as?: "span" | "div";
  className?: string;
  dashed?: boolean;
}> = ({ ctl, as = "span", className = "", dashed = true }) => {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const cur = ref.current;
    if (cur && cur.innerText !== (ctl.value ?? "")) {
      cur.innerText = ctl.value ?? "";
    }
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

/* ======================================================================= */
/*                                  类型                                    */
/* ======================================================================= */

export interface EventItem {
  id?: string;
  title: string;
  blurb?: string;
  longText?: string;
  location?: string;
  date?: string | number;        // "2025-10-12" / "Aug 2025" / timestamp
  tags?: string[];
  image?: string;
  img?: string;                  // 兼容旧字段
  link?: string;
  href?: string;                 // 兼容
}

type EventInternal = Required<Pick<EventItem, "title">> & Omit<EventItem, "image" | "img" | "link"> & {
  image?: string;
  href?: string;
  dateMs?: number;
  year?: number | null;          // 解析后的年份；无日期则为 null
  id: string;
};

export interface EventsSectionProps {
  events?: EventItem[];
  title?: string;
  subtitle?: string;
  kicker?: string;
  defaultYear?: number | "latest" | "all";   // 默认年份
  /** 仅当 Admin 开关打开时由父组件传入；不传则按只读展示 */
  inlineControls?: { title?: InlineCtl; subtitle?: InlineCtl; kicker?: InlineCtl };
}

/* ======================================================================= */
/*                                工具函数                                  */
/* ======================================================================= */

const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseDateMs(d?: string | number): number | undefined {
  if (d == null) return undefined;
  if (typeof d === "number") return d;
  const iso = Date.parse(d);
  if (!Number.isNaN(iso)) return iso;
  const m = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(d.trim());
  if (m) {
    const mi = MONTH_MAP[m[1].slice(0, 3).toLowerCase()];
    if (mi != null) return new Date(Number(m[2]), mi, 1).getTime();
  }
  return undefined;
}

const imgBg = (img?: string): string =>
  img
    ? `url(${img}) center/cover no-repeat, linear-gradient(135deg, ${B06}, #ecf7f2)`
    : `linear-gradient(135deg, ${B06}, #ecf7f2)`;

/** ===== Tag 颜色（站点绿色系 + 柔和糖果色） ===== */
const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Outreach:   { bg: "rgba(16,185,129,.12)", text: "#065f46", border: "rgba(16,185,129,.35)" }, // emerald
  Schools:    { bg: "rgba(5,150,105,.12)",  text: "#065f46", border: "rgba(5,150,105,.35)"  }, // emerald deep
  Workshop:   { bg: "rgba(59,130,246,.12)", text: "#1e3a8a", border: "rgba(59,130,246,.35)" }, // blue
  Mentor:     { bg: "rgba(14,165,233,.12)", text: "#0c4a6e", border: "rgba(14,165,233,.35)" }, // sky
  Competition:{ bg: "rgba(245,158,11,.12)", text: "#7c2d12", border: "rgba(245,158,11,.35)" }, // amber
  "Open Lab": { bg: "rgba(139,92,246,.12)", text: "#4c1d95", border: "rgba(139,92,246,.35)" }, // violet
  Roadshow:   { bg: "rgba(236,72,153,.12)", text: "#831843", border: "rgba(236,72,153,.35)" }, // pink
  TBD:        { bg: "rgba(107,114,128,.12)", text: "#374151", border: "rgba(107,114,128,.35)" }, // gray
};
function colorForTag(tag: string) {
  const t = TAG_COLORS[tag];
  if (t) return t;
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) | 0;
  const hues = [160, 200, 260, 300, 20, 40]; // 绿-蓝-紫-粉-橙
  const hue = hues[Math.abs(h) % hues.length];
  return {
    bg: `hsla(${hue}, 80%, 90%, .7)`,
    text: `hsla(${hue}, 55%, 25%, 1)`,
    border: `hsla(${hue}, 70%, 55%, .35)`,
  };
}

/* ======================================================================= */
/*                                子组件                                    */
/* ======================================================================= */

const TagChip: React.FC<{ tag: string }> = ({ tag }) => {
  const c = colorForTag(tag);
  return (
    <span
      className="text-xs rounded-full px-2 py-0.5 border"
      style={{ background: c.bg, color: c.text, borderColor: c.border }}
    >
      {tag}
    </span>
  );
};

const Card: React.FC<{ e: EventInternal; onClick: () => void; large?: boolean; }> = ({ e, onClick, large = false }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    transition={{ type: "spring", stiffness: 260, damping: 20 }}
    className={`rounded-2xl text-left overflow-hidden border bg-white ${large ? "h-[360px] md:h-[420px] w-full" : ""}`}
    style={{ borderColor: "rgba(0,0,0,.06)" }}
  >
    <div className={`${large ? "h-2/3" : "h-36"} w-full`} style={{ background: imgBg(e.image) }} />
    <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${BRAND}, ${B16})` }} />
    <div className="p-4">
      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--ink-70, rgba(23,66,67,.70))" }}>
        {e.date && (<span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4"/>{e.date}</span>)}
        {e.location && (<span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4"/>{e.location}</span>)}
      </div>
      <div className="font-extrabold leading-snug mt-1" style={{ color: "var(--brand-ink, #174243)" }}>{e.title}</div>
      {e.blurb && <div className="mt-1 text-sm" style={{ color: "var(--ink-70, rgba(23,66,67,.70))" }}>{e.blurb}</div>}
      <div className="mt-2 flex flex-wrap gap-2">
        {(e.tags || []).map((t) => <TagChip key={t} tag={t} />)}
      </div>
    </div>
  </motion.button>
);

const Spotlight: React.FC<{
  items: EventInternal[];
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  onOpen: () => void;
}> = ({ items, index, setIndex, onOpen }) => {
  const safeIndex = Math.max(0, Math.min(index, Math.max(items.length - 1, 0)));
  const e = items[safeIndex];
  if (!e) return null;

  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "ArrowRight") setIndex(i => Math.min(items.length - 1, i + 1));
      if (ev.key === "ArrowLeft")  setIndex(i => Math.max(0, i - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, setIndex]);

  return (
    <div className="rounded-3xl border p-3 md:p-4"
         style={{ borderColor: "rgba(0,0,0,.08)", background: `linear-gradient(120deg, #F8FFFB, ${B06})` }}>
      <div className="flex items-center justify-between mb-3">
        <div className="inline-flex items-center gap-2 text-sm px-2 py-1 rounded-full"
             style={{ background:B08, border:`1px solid ${B16}`, color:"var(--ink-70)" }}>
          <Sparkles className="w-4 h-4"/> Spotlight
        </div>
        <div className="inline-flex items-center gap-2">
          <button onClick={()=>setIndex((i)=>Math.max(0, i-1))} className="h-9 w-9 grid place-items-center rounded-full border" style={{ borderColor:B16 }}><ChevronLeft className="w-4 h-4"/></button>
          <button onClick={()=>setIndex((i)=>Math.min(items.length-1, i+1))} className="h-9 w-9 grid place-items-center rounded-full border" style={{ borderColor:B16 }}><ChevronRight className="w-4 h-4"/></button>
        </div>
      </div>
      <Card e={e} onClick={onOpen} large />
      <div className="mt-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 md:gap-4 snap-x">
          {items.map((it, i)=>(
            <button key={it.id || i} onClick={()=>setIndex(i)}
              className="shrink-0 w-[180px] snap-center rounded-xl overflow-hidden border bg-white/70 flex flex-col"
              style={{
                borderColor: i===index ? BRAND : "rgba(0,0,0,.08)",
                boxShadow: i===index ? `0 6px 16px ${B16}` : "none"
              }}>
              <div className="h-24" style={{ background: imgBg(it.image) }} />
              <div className="px-2 py-1 text-xs text-center truncate" style={{ color:"var(--ink-60)" }}>{it.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Modal: React.FC<{ items: EventInternal[]; index: number; setIndex: React.Dispatch<React.SetStateAction<number>>; onClose: () => void; }>
= ({ items, index, setIndex, onClose }) => {
  const e = items[index];
  if (!e) return null;
  return createPortal(
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] grid place-items-center bg-black/50 backdrop-blur-sm">
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
          className="w-[min(860px,92vw)] max-h-[85vh] overflow-auto rounded-3xl overflow-hidden bg-white border"
          style={{ borderColor:"rgba(0,0,0,.08)", boxShadow:"0 30px 120px rgba(0,0,0,.25)" }}>
          <div className="h-64 w-full" style={{ background: imgBg(e.image) }} />
          <div className="px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="text-xs inline-flex items-center gap-1" style={{ color:"var(--ink-60)" }}>
                {e.location && (<><MapPin className="w-4 h-4"/>{e.location}</>)}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={()=>setIndex((i)=>Math.max(0, i-1))} className="h-9 w-9 grid place-items-center rounded-full border" style={{ borderColor:B16 }}>‹</button>
                <button onClick={()=>setIndex((i)=>Math.min(items.length-1, i+1))} className="h-9 w-9 grid place-items-center rounded-full border" style={{ borderColor:B16 }}>›</button>
                <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full border" style={{ borderColor:B16 }}><X className="w-4 h-4"/></button>
              </div>
            </div>
            <h3 className="text-2xl font-extrabold mt-1" style={{ color: "var(--brand, #017151)" }}>{e.title}</h3>
            {(e.date || e.location) && (
              <div className="mt-2 flex items-center gap-3 text-sm" style={{ color:"var(--ink-70)" }}>
                {e.date && (<span className="inline-flex items-center gap-1"><Calendar className="w-4 h-4"/>{e.date}</span>)}
                {e.location && (<span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4"/>{e.location}</span>)}
              </div>
            )}
            {e.blurb && <p className="mt-3" style={{ color:"var(--ink-70)" }}>{e.blurb}</p>}
            {e.longText && <p className="mt-2 whitespace-pre-wrap" style={{ color:"var(--ink-70)" }}>{e.longText}</p>}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

/* ======================================================================= */
/*                              主组件（原样保留）                           */
/* ======================================================================= */

const FALLBACK_EVENTS: EventItem[] = [
  { title: "Griffith NSW Schools", blurb: "Regional communities • hands-on STEM day.", location: "Griffith, NSW", date: "2025-08-10", tags: ["Outreach","Schools"], image: pick(0), href: "#" },
  { title: "Workshops & Networking", blurb: "Mentor events • skills & connections.", location: "Sydney, NSW", date: "2025-09-12", tags: ["Workshop","Mentor"], image: pick(1), href: "#" },
  { title: "University Open Lab", blurb: "Lab tours • demos • Q&A.", location: "UNSW Kensington", date: "2024-10-05", tags: ["Open Lab"], image: pick(2), href: "#" },
  { title: "Regional Outreach", blurb: "Traveling showcase across NSW.", location: "Across NSW", date: "2024-11-18", tags: ["Roadshow"], image: pick(3), href: "#" },
  { title: "Competition Day", blurb: "Student projects • judging • awards.", location: "Sydney, NSW", date: "2023-12-02", tags: ["Competition"], image: pick(4), href: "#" },
  { title: "TBD Showcase", blurb: "Date to be confirmed.", location: "Sydney, NSW", tags: ["TBD"], image: pick(5), href: "#" },
];


const EventsSection: React.FC<EventsSectionProps> = ({
  events = FALLBACK_EVENTS,
  title = "Explore events",
  subtitle = "Click a year on the timeline to filter",
  kicker = "EVENTS",
  defaultYear = "latest",
  inlineControls, // ← 仅新增这个解构；其他不变
}) => {
  // 预处理
  const data: EventInternal[] = useMemo(
    () =>
      (events.length ? events : FALLBACK_EVENTS).map((e, i) => {
        const dateMs = parseDateMs(e.date);
        const year = dateMs != null ? new Date(dateMs).getFullYear() : null;
        return {
          id: e.id || `ev_${i}`,
          title: e.title,
          blurb: e.blurb,
          longText: e.longText,
          location: e.location,
          date: e.date,
          tags: e.tags || [],
          image: e.image || e.img,
          href: e.href || e.link,
          dateMs,
          year,
        };
      }),
    [events]
  );

  // 年份 & 类型（去重）
  const years = useMemo(() => {
    const ys = Array.from(new Set(data.filter(d => d.year != null).map(d => d.year as number))).sort((a,b)=>a-b);
    return ys;
  }, [data]);
  const allTypes = useMemo(() => {
    const ts = new Set<string>();
    data.forEach(d => (d.tags || []).forEach(t => ts.add(t)));
    return Array.from(ts).sort((a, b) => a.localeCompare(b));
  }, [data]);

  const latestYear = years[years.length - 1];
  const [selectedYear, setSelectedYear] = useState<number | "all" | "tbd">(
    defaultYear === "latest" ? (latestYear ?? "all") : defaultYear
  );

  // 类型多选
  const [types, setTypes] = useState<string[]>([]);
  const toggleType = (t: string) => {
    setTypes((prev) => (prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]));
  };
  const clearTypes = () => setTypes([]);

  // 搜索 / 展示模式
  const [query, setQuery] = useState<string>("");
  const [mode, setMode] = useState<"spotlight" | "wall" | "rail">("spotlight");
  const [idx, setIdx] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  // 过滤逻辑
  const byYear = useMemo(() => {
    return data.filter(d => {
      if (selectedYear === "all") return true;
      if (selectedYear === "tbd") return d.year == null;
      return d.year === selectedYear;
    });
  }, [data, selectedYear]);

  const byType = useMemo(() => {
    if (types.length === 0) return byYear;
    return byYear.filter(d => d.tags?.some(t => types.includes(t)));
  }, [byYear, types]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = byType.filter(p =>
      !q ||
      (p.title || "").toLowerCase().includes(q) ||
      (p.location || "").toLowerCase().includes(q)
    );
    return arr.slice().sort((a,b)=>{
      const ax = a.dateMs ?? Number.POSITIVE_INFINITY;
      const bx = b.dateMs ?? Number.POSITIVE_INFINITY;
      return ax - bx;
    });
  }, [byType, query]);

  useEffect(()=>{ if (idx > filtered.length - 1) setIdx(0); }, [filtered.length, idx]);
  useEffect(()=>{ document.body.style.overflow = open ? "hidden" : ""; return ()=>{ document.body.style.overflow = ""; }; }, [open]);

  return (
    <section className="relative">
      {/* 组件内主题作用域 + 居中留白 */}
      <style>{`
        .events-theme{
          --brand: #017151;
          --brand-06: rgba(1,113,81,.06);
          --brand-08: rgba(1,113,81,.08);
          --brand-16: rgba(1,113,81,.16);
          --brand-24: rgba(1,113,81,.24);
          --brand-ink: #174243;
          --ink-70: rgba(23,66,67,.70);
          --ink-60: rgba(23,66,67,.60);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial;
        }
      `}</style>
      <div className="events-theme mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* 头部（仅此处加入内联编辑；其余保持原样） */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-extrabold"
               style={{ background: BRAND, color: "#fff", border: `1px solid ${B16}` }}>
            {inlineControls?.kicker ? <Editable ctl={inlineControls.kicker} /> : kicker}
          </div>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold" style={{ color: "var(--brand)" }}>
            {inlineControls?.title ? <Editable ctl={inlineControls.title} as="span" /> : title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-[15px]" style={{ color: "var(--ink-70)" }}>
              {inlineControls?.subtitle ? <Editable ctl={inlineControls.subtitle} as="span" /> : subtitle}
            </p>
          )}
        </div>

        {/* 工具栏：搜索 + 视图切换（原样保留） */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-72 max-w-[60vw]">
            <Search className="w-4 h-4 absolute left-3 top-2.5" style={{ color: "var(--ink-70)" }}/>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events…"
              className="w-full rounded-xl bg-white/60 border focus:outline-none"
              style={{ borderColor: "rgba(0,0,0,.1)", padding: ".5rem .75rem .5rem 2.25rem", color: "var(--brand-ink)" }}
            />
          </div>
          <button onClick={() => setMode("spotlight")} className={`h-9 px-3 rounded-xl border inline-flex items-center gap-2 ${mode === "spotlight" ? "bg-white" : ""}`} style={{ borderColor: "rgba(0,0,0,.1)", color: "var(--brand-ink)" }}>
            <Sparkles className="w-4 h-4" /> Spotlight
          </button>
          <button onClick={() => setMode("wall")} className={`h-9 px-3 rounded-xl border inline-flex items-center gap-2 ${mode === "wall" ? "bg-white" : ""}`} style={{ borderColor: "rgba(0,0,0,.1)", color: "var(--brand-ink)" }}>
            <LayoutGrid className="w-4 h-4" /> Wall
          </button>
          <button onClick={() => setMode("rail")} className={`h-9 px-3 rounded-xl border inline-flex items-center gap-2 ${mode === "rail" ? "bg-white" : ""}`} style={{ borderColor: "rgba(0,0,0,.1)", color: "var(--brand-ink)" }}>
            <Rows3 className="w-4 h-4" /> Rail
          </button>

          {/* 右侧统计 */}
          <div className="ml-auto text-sm" style={{ color:"var(--ink-60)" }}>
            {selectedYear === "all" ? "All years" : selectedYear === "tbd" ? "Date: TBD" : `Year: ${selectedYear}`}
            {` • ${filtered.length} item${filtered.length===1?"":"s"}`}
          </div>
        </div>

        {/* 年份时间线（原样保留） */}
        <YearTimeline
          years={years}
          hasTbd={data.some(d => d.year == null)}
          selected={selectedYear}
          onSelect={setSelectedYear}
        />

        {/* 类型筛选（原样保留） */}
        {allTypes.length > 0 && (
          <div className="mt-4 rounded-2xl border bg-white/70 backdrop-blur-xl px-4 py-3"
               style={{ borderColor: "rgba(0,0,0,.06)", background: `linear-gradient(120deg,#F8FFFB, ${B06})` }}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm" style={{ color: "var(--ink-60)" }}>Types:</span>

              <button
                onClick={() => setTypes([])}
                className={`h-8 px-3 rounded-full border text-sm ${types.length===0 ? "bg-white" : ""}`}
                style={{ borderColor: types.length===0 ? BRAND : "rgba(0,0,0,.12)", color: "var(--brand-ink)" }}
              >
                All types
              </button>

              <div className="flex flex-wrap gap-2">
                {allTypes.map((t) => {
                  const c = colorForTag(t);
                  const active = types.includes(t);
                  return (
                    <button
                      key={t}
                      onClick={() => setTypes(prev => prev.includes(t) ? prev.filter(x => x!==t) : [...prev, t])}
                      className="h-8 px-3 rounded-full border text-sm"
                      style={{
                        background: active ? c.bg : "white",
                        color: active ? c.text : "var(--brand-ink)",
                        borderColor: active ? c.border : "rgba(0,0,0,.12)",
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>

              {types.length > 0 && (
                <button onClick={() => setTypes([])} className="ml-auto text-xs underline" style={{ color: "var(--ink-60)" }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* 内容区（Spotlight / Wall / Rail 原样保留） */}
        <div className="mt-6">
          {mode === "spotlight" && filtered.length > 0 && (
            <Spotlight items={filtered} index={idx} setIndex={setIdx} onOpen={() => setOpen(true)} />
          )}

          {mode === "wall" && (
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
              {filtered.map((e, i) => (
                <Card key={e.id || i} e={e} onClick={() => { setIdx(i); setOpen(true); }} />
              ))}
            </div>
          )}

          {mode === "rail" && (
            <div className="rounded-2xl border overflow-x-auto no-scrollbar"
                 style={{ borderColor: "rgba(0,0,0,.08)", background: `linear-gradient(120deg,#F8FFFB, ${B06})` }}>
              <div className="flex gap-5 px-6 py-6 snap-x">
                {filtered.map((e, i) => (
                  <div key={e.id || i} className="w-[300px] shrink-0 snap-center">
                    <Card e={e} onClick={() => { setIdx(i); setOpen(true); }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-sm" style={{ color: "var(--ink-60)" }}>
              No events found for this year.
            </div>
          )}
        </div>

        {open && <Modal items={filtered} index={idx} setIndex={setIdx} onClose={() => setOpen(false)} />}
      </div>
    </section>
  );
};

const YearTimeline: React.FC<{
  years: number[];
  selected: number | "all" | "tbd";
  hasTbd?: boolean;
  onSelect: (y: number | "all" | "tbd") => void;
}> = ({ years, selected, hasTbd = false, onSelect }) => {
  // 键盘左右切换（原逻辑保留）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!years.length) return;
      const idx =
        selected === "all"
          ? years.length
          : selected === "tbd"
          ? years.length - 1
          : years.indexOf(selected);
      if (e.key === "ArrowRight") {
        const next = Math.min(idx + 1, years.length + (hasTbd ? 1 : 0));
        onSelect(
          next === years.length + (hasTbd ? 1 : 0)
            ? "tbd"
            : next === years.length
            ? "all"
            : years[next]
        );
      }
      if (e.key === "ArrowLeft") {
        const prev = Math.max(idx - 1, -1);
        onSelect(prev < 0 ? "all" : years[prev]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [years, selected, hasTbd, onSelect]);

  const DOT = 24;
  const showTrack = years.length > 0 || hasTbd;

  return (
    <div
      className="mt-6 rounded-2xl border bg-white/70 backdrop-blur-xl px-4 py-6 md:py-7"
      style={{ borderColor: "rgba(0,0,0,.06)", overflow: "visible" }} // 不裁切
    >
      {showTrack && (
        <div className="relative px-2">
          <div className="relative h-14">
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 rounded-full"
              style={{ background: "var(--brand-06, rgba(1,113,81,.12))" }}
            />
            <div className="absolute inset-0 flex items-center justify-between">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => onSelect(y)}
                  className="grid place-items-center select-none"
                  title={String(y)}
                  aria-label={`Year ${y}`}
                  style={{ lineHeight: 1 }}
                >
                  <span
                    className="rounded-full border grid place-items-center"
                    style={{
                      height: DOT,
                      width: DOT,
                      background: selected === y ? "var(--brand,#017151)" : "#fff",
                      borderColor:
                        selected === y ? "var(--brand,#017151)" : "rgba(0,0,0,.2)",
                      boxShadow:
                        selected === y
                          ? "0 0 0 6px var(--brand-08, rgba(1,113,81,.08))"
                          : "none",
                      transition: "all .15s ease",
                    }}
                  >
                    <span
                      className="rounded-full"
                      style={{ height: DOT * 0.42, width: DOT * 0.42, background: "#fff" }}
                    />
                  </span>
                  <span
                    className="mt-2 text-sm font-semibold"
                    style={{ color: "var(--brand-ink,#174243)" }}
                  >
                    {y}
                  </span>
                </button>
              ))}

              {hasTbd && (
                <button
                  onClick={() => onSelect("tbd")}
                  className="grid place-items-center select-none"
                  title="TBD"
                  aria-label="Date TBD"
                  style={{ lineHeight: 1 }}
                >
                  <span
                    className="rounded-full border grid place-items-center"
                    style={{
                      height: DOT,
                      width: DOT,
                      background: selected === "tbd" ? "var(--brand,#017151)" : "#fff",
                      borderColor:
                        selected === "tbd" ? "var(--brand,#017151)" : "rgba(0,0,0,.2)",
                      boxShadow:
                        selected === "tbd"
                          ? "0 0 0 6px var(--brand-08, rgba(1,113,81,.08))"
                          : "none",
                    }}
                  >
                    <span
                      className="rounded-full"
                      style={{ height: DOT * 0.42, width: DOT * 0.42, background: "#fff" }}
                    />
                  </span>
                  <span
                    className="mt-2 text-sm font-semibold"
                    style={{ color: "var(--brand-ink,#174243)" }}
                  >
                    TBD
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 底部快捷筛选 */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onSelect("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-bold border ${selected === "all" ? "text-white" : ""}`}
          style={{
            color: selected === "all" ? "#fff" : "var(--brand-ink)",
            background: selected === "all" ? "var(--brand,#017151)" : "var(--brand-08, rgba(1,113,81,.08))",
            borderColor: selected === "all" ? "var(--brand,#017151)" : "var(--brand-16, rgba(1,113,81,.16))",
          }}
        >
          All years
        </button>

        {!years.length && hasTbd && (
          <button
            onClick={() => onSelect("tbd")}
            className={`px-3 py-1.5 rounded-full text-sm font-bold border ${selected === "tbd" ? "text-white" : ""}`}
            style={{
              color: selected === "tbd" ? "#fff" : "var(--brand-ink)",
              background: selected === "tbd" ? "var(--brand,#017151)" : "var(--brand-08, rgba(1,113,81,.08))",
              borderColor: selected === "tbd" ? "var(--brand,#017151)" : "var(--brand-16, rgba(1,113,81,.16))",
            }}
          >
            Date: TBD
          </button>
        )}
      </div>
    </div>
  );
};

export default EventsSection;
