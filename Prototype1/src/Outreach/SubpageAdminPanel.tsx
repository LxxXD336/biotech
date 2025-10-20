import * as React from "react";
import { Image as ImageIcon } from "lucide-react";

// --- simple auth (session based) ---
const AUTH_KEY = "outreach_admin_authed";

// 允许用环境变量覆盖密码（默认 biotech）
const getEnvVar = (key: string, def = ""): string => {
  // Node/test 环境
  const nodeEnv = (typeof process !== "undefined" ? (process as any)?.env : undefined) as any;
  if (nodeEnv && (nodeEnv.NODE_ENV === "test" || nodeEnv.JEST_WORKER_ID)) return nodeEnv[key] || def;

  // 浏览器 vite 环境（避免 TS 对 import.meta 报错）
  if (typeof window !== "undefined") {
    try {
      const im: any = (0, eval)("import.meta");
      if (im?.env && typeof im.env[key] !== "undefined") return im.env[key] || def;
    } catch {}
  }
  return (nodeEnv?.[key] as string) || def;
};
const ADMIN_PASS = getEnvVar("VITE_ADMIN_PASSWORD", "biotech");

// ========= 你已有的组件类型 =========
export type CylinderItem = {
  img?: string;
  title?: string;
  blurb?: string;
  longText?: string;
  date?: string | number;
  location?: string;
  tags?: string[];
};
export type StatItem = { label: string; value: number; suffix?: string };
export type DonutItem = { label: string; value: number };

// ========= 类型 =========
export type AdminStats = {
  title?: string;
  subtitle?: string;
  kicker?: string;
  cols?: 2 | 3 | 4;
  items: StatItem[];
  donutTitle?: string;
  donutItems?: DonutItem[];
  donutSize?: number;
  donutThickness?: number;
  badgePercent?: number;
  badgeLabel?: string;
  badgeSize?: number;
};

export type AdminFuture = { title?: string; subtitle?: string; kicker?: string };

export type AdminDownloads = { sponsorKit?: string; poster?: string };

export type PageText = {
  // Hero
  heroKicker?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCta1Label?: string; heroCta1Href?: string;
  heroCta2Label?: string; heroCta2Href?: string;
  // Events section
  eventsKicker?: string;
  eventsTitle?: string;
  eventsSubtitle?: string;
  // Moments/Stats section
  momentsKicker?: string;
  momentsTitle?: string;
  momentsSubtitle?: string;
  // Future section
  futureKicker?: string;
  futureTitle?: string;
  futureSubtitle?: string;
};

export type AdminContent = {
  events: CylinderItem[];     // EventShowcase 用
  carousel: CylinderItem[];   // CylinderCarousel 用
  stats: AdminStats;          // OutreachAnimatedStats 用
  future: AdminFuture;        // FuturePlans 用（为兼容保留）
  downloads: AdminDownloads;  // 下载文件
  inlineEdit?: boolean;       // 页面是否开启内联编辑（仅存状态）
  text: PageText;             // 全页文字
};

// ========= 默认内容 =========
const DEFAULT_CONTENT: AdminContent = {
  events: [
    { img: "https://picsum.photos/id/1011/1200/700", title: "Griffith NSW Schools", blurb: "Regional communities • hands-on STEM day.", location: "Griffith, NSW", date: "Aug 2025", tags: ["Outreach","Schools"] },
    { img: "https://picsum.photos/id/1025/1200/700", title: "Workshops & Networking", blurb: "Mentor events • skills & connections.", location: "Sydney, NSW", date: "Sep 2025", tags: ["Workshop","Mentor"] },
    { img: "https://picsum.photos/id/1035/1200/700", title: "University Open Lab", blurb: "Lab tours • demos • Q&A.", location: "UNSW Kensington", date: "Oct 2025", tags: ["Open Lab"] },
    { img: "https://picsum.photos/id/1041/1200/700", title: "Regional Outreach", blurb: "Traveling showcase across NSW.", location: "Across NSW", date: "Nov 2025", tags: ["Roadshow"] },
  ],
  carousel: [
    { img: "https://picsum.photos/id/1003/1200/720", title: "Hero image" },
    { img: "https://picsum.photos/id/1005/1200/720", title: "Moments / stats" },
    { img: "https://picsum.photos/id/1018/1200/720", title: "Mentor section" },
    { img: "https://picsum.photos/id/1024/1200/720", title: "Community section" }
  ],
  stats: {
    title: "Outreach impact",
    subtitle: "Key metrics from our recent programs",
    kicker: "STATS",
    cols: 3,
    items: [
      { label: "Participants", value: 1200 },
      { label: "Schools", value: 42 },
      { label: "Workshops", value: 28 },
      { label: "Regions", value: 9 },
      { label: "Mentors", value: 35 },
      { label: "Satisfaction", value: 96, suffix: "%" },
    ],
    donutTitle: "Participant types",
    donutItems: [
      { label: "High school", value: 680 },
      { label: "Primary", value: 240 },
      { label: "Teachers", value: 120 },
      { label: "Parents", value: 160 },
    ],
    donutSize: 220,
    donutThickness: 24,
    badgePercent: 58,
    badgeLabel: "Female participants",
    badgeSize: 220,
  },
  future: { title: "Future plans", subtitle: "Write down your event ideas and suggestions for us!", kicker: "FUTURE" },
  downloads: {},
  inlineEdit: false,
  text: {
    heroKicker: "OUTREACH",
    heroTitle: "Our Outreach — Community & Events",
    heroSubtitle: "Discover hands-on activities, competitions, and guided lab visits designed to spark curiosity and build confidence.",
    heroCta1Label: "Explore events", heroCta1Href: "#events",
    heroCta2Label: "Share an idea",  heroCta2Href: "#future",

    eventsKicker: "EVENTS",
    eventsTitle:  "Explore events",
    eventsSubtitle:"Click a card to view details",

    momentsKicker: "STATS",
    momentsTitle:  "Outreach impact",
    momentsSubtitle:"Key metrics from our recent programs",

    futureKicker: "FUTURE",
    futureTitle:  "Future plans",
    futureSubtitle:"Write down your event ideas and suggestions for us!",
  },
};

// ========= localStorage =========
const LS_KEY = "outreach_admin_content";
const loadContent = (): AdminContent => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CONTENT,
      ...parsed,
      text: { ...DEFAULT_CONTENT.text, ...(parsed.text || {}) },
    } as AdminContent;
  } catch { return DEFAULT_CONTENT; }
};
const saveContent = (c: AdminContent) => { try { localStorage.setItem(LS_KEY, JSON.stringify(c)); } catch {} };

export function useOutreachContent() {
  const [content, setContent] = React.useState<AdminContent>(() => loadContent());
  React.useEffect(() => { saveContent(content); }, [content]);
  return [content, setContent] as const;
}

// ========= 小组件 =========
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[15px] font-semibold text-emerald-900 mt-4 mb-2">{children}</h3>
);

const Row: React.FC<React.PropsWithChildren<{ label: string; aside?: React.ReactNode }>> = ({ label, aside, children }) => (
  <div className="mb-3">
    <div className="text-[13px] font-medium text-emerald-900 mb-1">{label}</div>
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">{children}</div>
      {aside}
    </div>
  </div>
);

const TextInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} className={`w-full rounded-lg border px-3 py-2 outline-none text-[13px] ${props.className||''}`} style={{ borderColor: "rgba(0,0,0,.15)" }} />
);

// 读取图片并在前端压缩，避免 localStorage 超限
function pickFile(accept: string, cb: (dataUrl: string) => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = accept;
  input.onchange = () => {
    const f = input.files?.[0];
    if (!f) return;

    // 只对图片压缩；其他类型还是原样读
    if (!f.type.startsWith("image/")) {
      const r2 = new FileReader();
      r2.onload = () => cb(String(r2.result || ""));
      r2.readAsDataURL(f);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // 设定最大边 1600px，质量 0.82（可按需调整）
        const MAX = 1600;
        let { width, height } = img;
        if (width > height && width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        } else if (height > MAX) {
          width = Math.round((width * MAX) / height);
          height = MAX;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, width, height);

        // 统一导出为 jpeg 更省空间；如需保留透明可判断改为 image/png
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        cb(dataUrl);
      };
      img.onerror = () => {
        // 回退：读原始 dataURL
        cb(String(reader.result || ""));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(f);
  };
  input.click();
}

// ========= 主组件（悬浮卡片） =========
export default function OutreachAdminInline({ content, onChange, devOnly = true }: { content: AdminContent; onChange: (v: AdminContent) => void; devOnly?: boolean; }) {
  const [open, setOpen] = React.useState(false);
  const [authed, setAuthed] = React.useState<boolean>(() => {
    try { return sessionStorage.getItem(AUTH_KEY) === "1"; } catch { return false; }
  });
  const [showPwd, setShowPwd] = React.useState(false);
  const [pwd, setPwd] = React.useState("");
  const [pwdErr, setPwdErr] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (authed) setOpen(true);
  }, [authed]);

  // 环境判断（不依赖 ts 类型）
  const isDev = (() => {
    try { const m = (import.meta as any); if (m?.env && typeof m.env.DEV !== 'undefined') return !!m.env.DEV; } catch {}
    const nodeEnv = (globalThis as any)?.process?.env?.NODE_ENV; return typeof nodeEnv === 'string' ? nodeEnv !== 'production' : true;
  })();
  const showButton = devOnly ? isDev : true;

  // 快捷函数（改动即持久化到 localStorage）
  const patch = (p: Partial<AdminContent>) => {
    const next = { ...content, ...p };
    onChange(next);
    try { localStorage.setItem('outreach_admin_content', JSON.stringify(next)); } catch {}
  };
  const resetAll = () => {
    if (!confirm('Reset all to defaults?')) return;
    onChange(DEFAULT_CONTENT);
    try { localStorage.setItem('outreach_admin_content', JSON.stringify(DEFAULT_CONTENT)); } catch {}
  };
  const logout = () => {
    try { sessionStorage.removeItem(AUTH_KEY); } catch {}
    setAuthed(false);
    setOpen(false);
    setShowPwd(false);
    // 不清除面板数据
  };

  // —— 便捷键：Ctrl/⌘ + Shift + A 打开 —— 
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        const canShow = devOnly ? isDev : true;
        if (!canShow) return;
        if (authed) { setOpen(true); }
        else { setShowPwd(true); setPwd(""); setPwdErr(null); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [authed, devOnly, isDev]);

  // —— 单项更新/重置（背景图 & 下载） ——
  const setCarouselImg = (idx: number, url: string) => {
    const arr = content.carousel.slice();
    arr[idx] = { ...arr[idx], img: url };
    patch({ carousel: arr });
  };
  const resetCarouselImg = (idx: number) => setCarouselImg(idx, DEFAULT_CONTENT.carousel[idx]?.img || '');

  const setDownload = (key: keyof AdminDownloads, url: string) => patch({ downloads: { ...content.downloads, [key]: url } });
  const resetDownload = (key: keyof AdminDownloads) => {
    const next = { ...content.downloads, [key]: undefined } as AdminDownloads;
    patch({ downloads: next });
  };

  // —— 文案映射（全页 text 对象 + 与 stats 的三项同步） ——
  const setText = (patchObj: Partial<PageText>) => patch({ text: { ...content.text, ...patchObj } });
  const resetText = <K extends keyof PageText>(key: K) => setText({ [key]: (DEFAULT_CONTENT.text as any)[key] } as any);
  const setMoments = (k: 'momentsKicker'|'momentsTitle'|'momentsSubtitle', v: string) => {
    const next = { ...content.text, [k]: v } as PageText;
    const statsPatch: Partial<AdminStats> = {};
    if (k === 'momentsKicker') statsPatch.kicker = v;
    if (k === 'momentsTitle') statsPatch.title = v;
    if (k === 'momentsSubtitle') statsPatch.subtitle = v;
    onChange({ ...content, text: next, stats: { ...content.stats, ...statsPatch } });
  };

const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} className={`w-full rounded-lg border px-3 py-2 outline-none text-[13px] ${props.className||''}`} style={{ borderColor: "rgba(0,0,0,.15)" }} />
);

// ====== Events helpers (BEGIN) ======
const setEventField = (idx: number, key: keyof CylinderItem, value: any) => {
  const arr = content.events.slice();
  arr[idx] = { ...arr[idx], [key]: value };
  patch({ events: arr });
};

const setEventTagsStr = (idx: number, csv: string) => {
  const tags = csv.split(",").map(s => s.trim()).filter(Boolean);
  setEventField(idx, "tags", tags);
};
const getEventTagsStr = (idx: number) => (content.events[idx]?.tags || []).join(", ");

const addEvent = () => {
  const next: CylinderItem = {
    title: "New event", blurb: "", longText: "",
    date: "", location: "", tags: [], img: ""
  };
  patch({ events: [...content.events, next] });
};

const removeEvent = (idx: number) => {
  if (!confirm("Delete this event?")) return;
  const arr = content.events.slice();
  arr.splice(idx, 1);
  patch({ events: arr });
};

const moveEvent = (idx: number, dir: -1 | 1) => {
  const arr = content.events.slice();
  const j = idx + dir;
  if (j < 0 || j >= arr.length) return;
  const [it] = arr.splice(idx, 1);
  arr.splice(j, 0, it);
  patch({ events: arr });
};

const chooseEventImage = (idx: number) => {
  pickFile("image/*", (dataUrl) => setEventField(idx, "img", dataUrl));
};
// ====== Events helpers (END) ======


  return (
    <>
      {/* 触发器：未登录显示“淡绿色小药丸”，登录后不显示 */}
      {showButton && !authed && (
        <button
          aria-label="Open outreach admin"
          title="Outreach Admin"
          onClick={() => { setShowPwd(true); setPwd(""); setPwdErr(null); }}
          style={{
            position: "fixed",
            right: 12,
            bottom: 16,
            width: 60,
            height: 28,
            borderRadius: 9999,
            background: "#017151",
            opacity: 0.12,
            border: "0",
            cursor: "pointer",
            zIndex: 1000,
          }}
        />
      )}

      {/* password modal */}
      {showPwd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setShowPwd(false)} />
          <div className="relative z-10 w-[320px] rounded-xl bg-white p-4 shadow-xl border" style={{ borderColor: 'rgba(0,0,0,.12)' }}>
            <div className="text-[15px] font-semibold text-emerald-900 mb-2">Enter admin password</div>
            <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} className="w-full rounded-lg border px-3 py-2 outline-none text-[13px]" style={{ borderColor: 'rgba(0,0,0,.15)' }} placeholder="Password" autoFocus />
            {pwdErr && <div className="text-[12px] text-red-600 mt-1">{pwdErr}</div>}
            <div className="mt-3 flex gap-2 justify-end">
              <button className="text-[12px] rounded border px-3 py-1.5" onClick={()=>setShowPwd(false)}>Cancel</button>
              <button className="text-[12px] rounded border px-3 py-1.5" onClick={()=>{
                if (pwd === ADMIN_PASS) {
                  try { sessionStorage.setItem(AUTH_KEY, '1'); } catch {}
                  setAuthed(true);
                  setShowPwd(false);
                  setOpen(true);
                } else {
                  setPwdErr('Wrong password');
                }
              }}>Enter</button>
            </div>
          </div>
        </div>
      )}

      {authed && open && (
        <div className="fixed right-6 top-20 z-50 w-[360px] sm:w-[380px] bg-white shadow-xl border rounded-2xl" style={{ borderColor: 'rgba(0,0,0,.12)', maxHeight: '90vh' }} onWheelCapture={(e)=>e.stopPropagation()} onTouchMoveCapture={(e)=>e.stopPropagation()}>
          <div className="flex flex-col max-h-[90vh] min-h-0">
            {/* 头部 */}
            <div className="px-3 py-3 border-b" style={{ borderColor: 'rgba(0,0,0,.12)' }}>
              <div className="text-[15px] font-semibold text-emerald-900">Outreach Page Admin</div>
              <label className="mt-2 flex items-center gap-2 text-[13px] text-emerald-950/80">
                <input type="checkbox" checked={!!content.inlineEdit} onChange={e=>patch({ inlineEdit: e.target.checked })} />
                Enable inline text editing on page
              </label>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-3">
              <SectionTitle>Background images</SectionTitle>
              <Row label="Hero image" aside={<>
                <button className="text-[12px] rounded border px-2 py-1" onClick={()=>pickFile('image/*', (u)=>setCarouselImg(0,u))}>Choose file</button>
                <button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetCarouselImg(0)}>Reset</button>
              </>}>
                {content.carousel[0]?.img ? <img src={content.carousel[0].img} className="h-16 w-full object-cover rounded"/> : <div className="h-16 grid place-items-center rounded border" style={{ borderColor: 'rgba(0,0,0,.12)' }}><ImageIcon className="w-4 h-4"/></div>}
              </Row>
              <Row label="Moments / stats image" aside={<>
                <button className="text-[12px] rounded border px-2 py-1" onClick={()=>pickFile('image/*', (u)=>setCarouselImg(1,u))}>Choose file</button>
                <button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetCarouselImg(1)}>Reset</button>
              </>}>
                {content.carousel[1]?.img ? <img src={content.carousel[1].img} className="h-16 w-full object-cover rounded"/> : <div className="h-16 grid place-items-center rounded border" style={{ borderColor: 'rgba(0,0,0,.12)' }}><ImageIcon className="w-4 h-4"/></div>}
              </Row>
              <Row label="Mentor section image" aside={<>
                <button className="text-[12px] rounded border px-2 py-1" onClick={()=>pickFile('image/*', (u)=>setCarouselImg(2,u))}>Choose file</button>
                <button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetCarouselImg(2)}>Reset</button>
              </>}>
                {content.carousel[2]?.img ? <img src={content.carousel[2].img} className="h-16 w-full object-cover rounded"/> : <div className="h-16 grid place-items-center rounded border" style={{ borderColor: 'rgba(0,0,0,.12)' }}><ImageIcon className="w-4 h-4"/></div>}
              </Row>
              <Row label="Community section image" aside={<>
                <button className="text-[12px] rounded border px-2 py-1" onClick={()=>pickFile('image/*', (u)=>setCarouselImg(3,u))}>Choose file</button>
                <button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetCarouselImg(3)}>Reset</button>
              </>}>
                {content.carousel[3]?.img ? <img src={content.carousel[3].img} className="h-16 w-full object-cover rounded"/> : <div className="h-16 grid place-items-center rounded border" style={{ borderColor: 'rgba(0,0,0,.12)' }}><ImageIcon className="w-4 h-4"/></div>}
              </Row>

              <hr className="my-3"/>



              <hr className="my-3"/>

              <SectionTitle>Text overrides</SectionTitle>
              {/* HERO */}
              <div className="mb-2 text-[12px] font-semibold text-emerald-800">Hero</div>
              <Row label="Hero kicker" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('heroKicker')}>Reset</button>}>
                <TextInput value={content.text.heroKicker || ''} onChange={e=>setText({ heroKicker: e.target.value })} />
              </Row>
              <Row label="Hero title (H1)" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('heroTitle')}>Reset</button>}>
                <TextInput value={content.text.heroTitle || ''} onChange={e=>setText({ heroTitle: e.target.value })} />
              </Row>
              <Row label="Hero subtitle" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('heroSubtitle')}>Reset</button>}>
                <TextInput value={content.text.heroSubtitle || ''} onChange={e=>setText({ heroSubtitle: e.target.value })} />
              </Row>
              <Row label="Hero CTA 1 label" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('heroCta1Label')}>Reset</button>}>
                <TextInput value={content.text.heroCta1Label || ''} onChange={e=>setText({ heroCta1Label: e.target.value })} />
              </Row>
              <Row label="Hero CTA 1 href" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('heroCta1Href')}>Reset</button>}>
                <TextInput value={content.text.heroCta1Href || ''} onChange={e=>setText({ heroCta1Href: e.target.value })} placeholder="#events" />
              </Row>
              <Row label="Hero CTA 2 label" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('heroCta2Label')}>Reset</button>}>
                <TextInput value={content.text.heroCta2Label || ''} onChange={e=>setText({ heroCta2Label: e.target.value })} />
              </Row>
              <Row label="Hero CTA 2 href" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('heroCta2Href')}>Reset</button>}>
                <TextInput value={content.text.heroCta2Href || ''} onChange={e=>setText({ heroCta2Href: e.target.value })} placeholder="#future" />
              </Row>

              <hr className="my-3" />

              <SectionTitle>Events</SectionTitle>
              <div className="space-y-4">
                {(content.events || []).map((ev, i) => (
                  <div key={i} className="rounded-xl border p-3" style={{ borderColor: "rgba(0,0,0,.12)" }}>
                    <div className="flex items-center gap-2">
                      <div className="text-[13px] font-semibold text-emerald-900 flex-1 truncate">
                        {ev.title || `Event ${i + 1}`}
                      </div>
                      <button className="text-[12px] rounded border px-2 py-1" onClick={() => moveEvent(i, -1)} title="Move up">↑</button>
                      <button className="text-[12px] rounded border px-2 py-1" onClick={() => moveEvent(i, 1)} title="Move down">↓</button>
                      <button className="text-[12px] rounded border px-2 py-1" onClick={() => removeEvent(i)} title="Delete">Delete</button>
                    </div>

                    <Row label="Title">
                      <TextInput value={ev.title || ""} onChange={(e) => setEventField(i, "title", e.target.value)} placeholder="e.g., University Open Lab" />
                    </Row>

                    <Row label="Date">
                      <TextInput value={String(ev.date ?? "")} onChange={(e) => setEventField(i, "date", e.target.value)} placeholder="YYYY-MM-DD 或如 'Aug 2025'" />
                    </Row>

                    <Row label="Location">
                      <TextInput value={ev.location || ""} onChange={(e) => setEventField(i, "location", e.target.value)} placeholder="e.g., UNSW Kensington" />
                    </Row>

                    <Row label="Tags (comma)">
                      <TextInput value={getEventTagsStr(i)} onChange={(e) => setEventTagsStr(i, e.target.value)} placeholder="Outreach, Schools, Workshop..." />
                    </Row>

                    <Row label="Cover image" aside={
                      <>
                        <button className="text-[12px] rounded border px-2 py-1" onClick={() => chooseEventImage(i)}>Choose file</button>
                        <button className="text-[12px] rounded border px-2 py-1" onClick={() => setEventField(i, "img", "")} title="Clear">Clear</button>
                      </>
                    }>
                      {ev.img ? (
                        <img src={ev.img} className="h-16 w-full object-cover rounded" />
                      ) : (
                        <TextInput value={ev.img || ""} onChange={(e) => setEventField(i, "img", e.target.value)} placeholder="https://... " />
                      )}
                    </Row>

                    <Row label="Blurb ">
                      <TextArea rows={2} value={ev.blurb || ""} onChange={(e) => setEventField(i, "blurb", e.target.value)} placeholder="Brief description" />
                    </Row>

                    <Row label="Details ">
                      <TextArea rows={4} value={ev.longText || ""} onChange={(e) => setEventField(i, "longText", e.target.value)} placeholder="Detailed description" />
                    </Row>
                  </div>
                ))}
                <button className="text-[12px] rounded border px-3 py-1.5" onClick={addEvent}>+ Add event</button>
              </div>

              <hr className="my-3" />


              {/* MOMENTS/Stats section */}
              <div className="mt-3 mb-2 text-[12px] font-semibold text-emerald-800">Moments / stats</div>
              <Row label="Moments heading" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>setMoments('momentsTitle', DEFAULT_CONTENT.text.momentsTitle!)}>Reset</button>}>
                <TextInput value={content.text.momentsTitle || ''} onChange={e=>setMoments('momentsTitle', e.target.value)} />
              </Row>
              <Row label="Moments subtitle" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>setMoments('momentsSubtitle', DEFAULT_CONTENT.text.momentsSubtitle!)}>Reset</button>}>
                <TextInput value={content.text.momentsSubtitle || ''} onChange={e=>setMoments('momentsSubtitle', e.target.value)} />
              </Row>
              <Row label="Moments kicker" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>setMoments('momentsKicker', DEFAULT_CONTENT.text.momentsKicker!)}>Reset</button>}>
                <TextInput value={content.text.momentsKicker || ''} onChange={e=>setMoments('momentsKicker', e.target.value)} />
              </Row>

              {/* FUTURE section */}
              <div className="mt-3 mb-2 text-[12px] font-semibold text-emerald-800">Future section</div>
              <Row label="Future kicker" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('futureKicker')}>Reset</button>}>
                <TextInput value={content.text.futureKicker || ''} onChange={e=>setText({ futureKicker: e.target.value })} />
              </Row>
              <Row label="Future title" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('futureTitle')}>Reset</button>}>
                <TextInput value={content.text.futureTitle || ''} onChange={e=>setText({ futureTitle: e.target.value })} />
              </Row>
              <Row label="Future subtitle" aside={<button className="text-[12px] rounded border px-2 py-1" onClick={()=>resetText('futureSubtitle')}>Reset</button>}>
                <TextInput value={content.text.futureSubtitle || ''} onChange={e=>setText({ futureSubtitle: e.target.value })} />
              </Row>
            </div>

            {/* 底部操作条 */}
            <div className="px-3 py-3 border-t flex items-center gap-2" style={{ borderColor: 'rgba(0,0,0,.12)' }}>
              <button onClick={logout} className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-[12px]" title="Clear session">Logout</button>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={()=>saveContent(content)} className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-[12px]">Save</button>
                <button onClick={resetAll} className="inline-flex items-center gap-1 rounded border px-3 py-1.5 text-[12px]">Reset All</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
