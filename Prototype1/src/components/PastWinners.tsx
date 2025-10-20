// src/components/PastWinners.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, MotionConfig, useMotionValue, useSpring } from "framer-motion";
import MainNav from "./MainNav";
import Footer from "../sections/home/Footer";
import { listPosters, createPoster, updatePoster, hidePoster, unhidePoster, deletePoster } from "../api/posters";

/* =============== Types =============== */
type PosterDTO = {
  id: number;
  title: string;
  year: number;
  award?: string;
  type?: string;
  area?: string;
  description?: string;
  image_url: string | null;
  pdf_url: string | null;
  hidden: boolean;
};
type Poster = {
  id: number;
  title: string;
  year: number;
  award?: string;
  type?: string;
  area?: string;
  img: string;
  pdf?: string;
  desc?: string;

};

/* =============== Theme =============== */
const PALETTE = {
  brand: "#007253",
  accent: "#3FB3A5",
  mint: "#C3EBCA",
  navy: "#283D5C",
  teal: "#26697D",
} as const;
const PAGE_BG = "#FFFFFF";                       // 全页面白底
const HALO_GRAD = "linear-gradient(120deg, #007253, #3FB3A5)"; // 绿色光晕


/* =============== Utils =============== */
const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><rect width='100%' height='100%' fill='#f3f5f4'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='system-ui' font-size='20' fill='#9aa3a0'>No Image</text></svg>`
    );

function downloadViaAnchor(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* =============== Tiny Toast =============== */
function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const t = useRef<number | null>(null);
  const show = (m: string, ms = 1800) => {
    setMsg(m);
    if (t.current) window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setMsg(null), ms);
  };
  const node = (
      <AnimatePresence>
        {msg && (
            <motion.div
                className="fixed left-1/2 top-6 z-[1200] -translate-x-1/2 rounded-full bg-black text-white px-4 py-2 text-sm shadow-lg"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
            >
              {msg}
            </motion.div>
        )}
      </AnimatePresence>
  );
  return { show, node };
}

/* =============== Magnetic =============== */
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let mx = 0,
        my = 0,
        raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      mx = Math.max(-10, Math.min(10, x * 0.15));
      my = Math.max(-10, Math.min(10, y * 0.15));
    };
    const loop = () => {
      el.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, []);
  return (
      <div ref={ref} className="inline-block will-change-transform">
        {children}
      </div>
  );
}

/* =============== TiltCard =============== */
function TiltCard({ children }: { children: React.ReactNode }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 220, damping: 18, mass: 0.35 });
  const sy = useSpring(ry, { stiffness: 220, damping: 18, mass: 0.35 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 8);
    rx.set(-(py - 0.5) * 8);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
      <div style={{ perspective: 1200 }}>
        <motion.div
            style={{ rotateX: sx, rotateY: sy, transformStyle: "preserve-3d" }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
        >
          {children}
        </motion.div>
      </div>
  );
}

/* =============== Filter Bar =============== */
function FilterBar({
                     years,
                     awards,
                     types,
                     areas,
                     year,
                     award,
                     type,
                     area,
                     setYear,
                     setAward,
                     setType,
                     setArea,
                   }: {
  years: string[];
  awards: string[];
  types: string[];
  areas: string[];
  year: string;
  award: string;
  type: string;
  area: string;
  setYear: (v: string) => void;
  setAward: (v: string) => void;
  setType: (v: string) => void;
  setArea: (v: string) => void;
}) {
  const base = "h-10 rounded-xl border border-black/10 bg-white/70 backdrop-blur px-3 text-sm";
  return (
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        <div className="text-sm font-semibold" style={{ color: PALETTE.navy }}>
          Filter
        </div>
        <div className="flex flex-1 flex-wrap gap-3">
          <select className={base} value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="All">Year: All</option>
            {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
            ))}
          </select>
          <select className={base} value={award} onChange={(e) => setAward(e.target.value)}>
            <option value="All">Award: All</option>
            {awards.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
            ))}
          </select>
          <select className={base} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="All">Type: All</option>
            {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
            ))}
          </select>
          <select className={base} value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="All">Area of Interest: All</option>
            {areas.map((ar) => (
                <option key={ar} value={ar}>
                  {ar}
                </option>
            ))}
          </select>
        </div>
        <button
            type="button"
            onClick={() => {
              setYear("All");
              setAward("All");
              setType("All");
              setArea("All");
            }}
            className="h-10 rounded-xl px-3 text-sm font-semibold text-white"
            style={{ background: PALETTE.brand }}
        >
          Clear
        </button>
      </div>
  );
}

/* =============== Poster Strip =============== */
function PosterThumb({ p }: { p: Poster }) {
  return (
      <motion.img
          src={p.img || PLACEHOLDER}
          alt={p.title}
          className="w-full aspect-[3/4] object-cover will-change-transform"
          whileHover={{ scale: 1.03, filter: "saturate(110%) brightness(1.04)" }}
          transition={{ duration: 0.35 }}
      />
  );
}

function PosterStrip({
                       posters,
                       onOpen,
                       header,
                     }: {
  posters: Poster[];
  onOpen: (p: Poster) => void;
  header?: React.ReactNode;
}) {
  const C = { brand: "#007253", navy: "#283D5C", hair: "rgba(0,0,0,.08)", mint: "#C3EBCA", accent: "#3FB3A5", teal: "#26697D" } as const;
    const HALO = HALO_GRAD; // 用上面定义的绿色光晕


  return (
      <MotionConfig transition={{ ease: [0.2, 0.8, 0.2, 1] }}>
        <section id="posters" className="relative w-full overflow-hidden" style={{ background: PAGE_BG }}>
          <div className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-10 py-12">
            {header}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-14 md:justify-center">
              {posters.map((p, idx) => {
                const grad = HALO;
                return (
                    <motion.article
                        key={p.id}
                        className="group cursor-pointer md:max-w-[416px] w-full place-self-center"
                        initial={{ opacity: 0, y: 18 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10% 0% -8% 0%" }}
                        transition={{ duration: 0.45, delay: (idx % 8) * 0.05 }}
                        onClick={() => onOpen(p)}
                    >
                        <motion.div
                            className="relative rounded-[30px] p-[2px]"
                            style={{ background: HALO, backgroundSize: "160% 160%" }}
                            whileHover={{ backgroundPosition: "120% 0%" }}
                            transition={{ duration: 0.9 }}
                        >


                        <motion.div
                            className="absolute -inset-6 -z-10 rounded-[44px] blur-3xl opacity-0 group-hover:opacity-40"
                            style={{ background: grad }}
                            initial={false}
                            animate={{ opacity: [0.12, 0.18, 0.12] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />
                        <TiltCard>
                            <motion.div
                                className="relative overflow-hidden rounded-[28px] border bg-white"
                                style={{
                                    borderColor: C.hair,
                                    boxShadow: "0 18px 60px rgba(0,114,83,.14), 0 6px 18px rgba(0,114,83,.08)", // 绿色偏向
                                }}
                                whileHover={{
                                    boxShadow: "0 28px 90px rgba(0,114,83,.22), 0 10px 28px rgba(0,114,83,.12)",
                                }}
                            >

                            <PosterThumb p={p} />
                            <motion.div
                                className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
                                initial={{ y: 18, opacity: 0 }}
                                whileHover={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.25 }}
                                style={{
                                  background: `linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.4) 90%), linear-gradient(90deg, ${C.brand}33, ${C.accent}44, ${C.teal}33)`,
                                }}
                            >
                              <div className="p-3 text-white/95 text-xs flex items-center justify-between">
                                <span>{p.year}</span>
                                <span className="opacity-90">View ↗</span>
                              </div>
                            </motion.div>
                          </motion.div>
                        </TiltCard>
                      </motion.div>

                      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-2 rounded-2xl bg-white/95 backdrop-blur px-3 py-2 ring-1 ring-black/10">
                        <div>
                          <div
                              className="text-[18px] md:text-[20px] font-semibold leading-tight drop-shadow-[0_1px_0_rgba(255,255,255,0.9)]"
                              style={{ color: C.navy }}
                          >
                            {p.title}
                          </div>
                          <div className="text-xs text-black/60">{p.year}</div>
                          <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-black/60">
                            {p.award && (
                                <span className="rounded-md bg-white/90 ring-1 ring-black/10 px-2 py-0.5">{p.award}</span>
                            )}
                            {p.type && (
                                <span className="rounded-md bg-white/90 ring-1 ring-black/10 px-2 py-0.5">{p.type}</span>
                            )}
                            {p.area && (
                                <span className="rounded-md bg-white/90 ring-1 ring-black/10 px-2 py-0.5">{p.area}</span>
                            )}
                          </div>
                        </div>
                        <Magnetic>
                          <button
                              type="button"
                              className="h-9 w-9 rounded-full border border-black/10 bg-white text-lg leading-none transition group-hover:scale-105"
                              aria-label="Open"
                          >
                            ↗
                          </button>
                        </Magnetic>
                      </div>
                    </motion.article>
                );
              })}
            </div>
          </div>
        </section>
      </MotionConfig>
  );
}

/* =============== Overlay =============== */
function Overlay({ p, onClose }: { p: Poster; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const safeName = `${p.title || "poster"}_${p.year || ""}`.replace(/[^\w.-]+/g, "_");
  return (
      <AnimatePresence>
        <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
          <motion.div
              className="relative w-[min(1000px,92vw)] overflow-hidden rounded-3xl border border-black/10 bg-white"
              initial={{ y: 30, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 30, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
          >
            <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ color: PALETTE.brand, border: `1px solid ${PALETTE.brand}55`, background: `${PALETTE.mint}55` }}
            >
              Close
            </button>

            <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-5 sm:gap-6 sm:p-6">
              <motion.div className="relative aspect-[3/4] overflow-hidden rounded-2xl sm:col-span-3">
                <img src={p.img || PLACEHOLDER} alt={p.title} className="h-full w-full object-cover" />
              </motion.div>
              <div className="sm:col-span-2">
                <div className="text-sm font-semibold" style={{ color: PALETTE.brand }}>
                  {p.year}
                </div>
                <div className="mt-1 text-2xl font-black" style={{ color: PALETTE.navy }}>
                  {p.title}
                </div>
                  {p.desc && (
                      <div className="mt-3 text-[13px] leading-relaxed whitespace-pre-line text-black/70">
                          {p.desc}
                      </div>
                  )}
                <div className="mt-6 flex flex-wrap gap-8">
                  {p.pdf ? (
                      <>
                        <a
                            href={p.pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.03]"
                            style={{ color: "#FFFFFF", background: PALETTE.brand }}
                        >
                          Open Poster
                        </a>
                        <button
                            type="button"
                            onClick={() => downloadViaAnchor(p.pdf!, `${safeName}.pdf`)}
                            className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-black/[.03]"
                        >
                          Download Poster
                        </button>
                      </>
                  ) : (
                      <button
                          type="button"
                          onClick={() => downloadViaAnchor(p.img || PLACEHOLDER, `${safeName}.jpg`)}
                          className="rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-black/10 hover:bg-black/[.03]"
                      >
                        Download Image
                      </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
  );
}

/* =============== Pagination =============== */
function Pagination({
                      page,
                      pageCount,
                      onPage,
                    }: {
  page: number;
  pageCount: number;
  onPage: (p: number) => void;
}) {
  const btn = "h-9 min-w-9 px-2 rounded-full text-sm flex items-center justify-center";
  const num = "h-9 min-w-9 px-2 rounded-full text-sm flex items-center justify-center hover:bg-black/5";
  const wrap =
      "mx-auto mt-8 w-full max-w-[720px] flex items-center justify-center gap-2 rounded-full ring-1 ring-black/15 bg-white/70 backdrop-blur px-3 py-2";
  const pages: (number | string)[] = [];
  const push = (v: number | string) => pages.push(v);
  push(1);
  if (page > 3) push("…");
  for (let p = page - 1; p <= page + 1; p++) if (p > 1 && p < pageCount) push(p);
  if (page < pageCount - 2) push("…");
  if (pageCount > 1) push(pageCount);
  return (
      <div className={wrap}>
        <button
            type="button"
            className={`${btn} ${page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-black/5"}`}
            onClick={() => page > 1 && onPage(page - 1)}
            aria-label="Previous"
        >
          ‹
        </button>
        {pages.map((p, i) =>
            typeof p === "string" ? (
                <span key={`e${i}`} className="px-2 text-sm opacity-60 select-none">
            {p}
          </span>
            ) : (
                <button
                    type="button"
                    key={p}
                    className={`${num} ${p === page ? "font-semibold ring-1 ring-black/20 bg-white" : ""}`}
                    onClick={() => onPage(p)}
                    aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
            )
        )}
        <button
            type="button"
            className={`${btn} ${page === pageCount ? "opacity-40 cursor-not-allowed" : "hover:bg-black/5"}`}
            onClick={() => page < pageCount && onPage(page + 1)}
            aria-label="Next"
        >
          ›
        </button>
      </div>
  );
}

/* =============== IntroHero（VERBATIM：不要改） =============== */
function IntroHero({ seeds = [] }: { seeds?: string[] }) {
  const fallback = useMemo(() => {
    const mods = import.meta.glob("/src/photo/Pastwinnerimages/*.{jpg,jpeg,png,webp,avif,gif}", { as: "url", eager: true });
    return Object.values(mods) as string[];
  }, []);
  const imgs = seeds.length ? seeds : fallback.length ? fallback : ["/placeholder.jpg"];
  const cards = useMemo(() => {
    const N = Math.min(12, imgs.length);
    return imgs.slice(0, N).map((src, i) => {
      const size = 200 + Math.random() * 140;
      const aspect = 1.2 + Math.random() * 0.6;
      const left = 8 + Math.random() * 84;
      const top = 6 + Math.random() * 70;
      const rot = (Math.random() - 0.5) * 6;
      const amp = 6 + Math.random() * 8;
      const dur = 7 + Math.random() * 5;
      const delay = i * 0.08;
      return { src, size, aspect, left, top, rot, amp, dur, delay };
    });
  }, [imgs]);

  return (
      <motion.section
          id="hero"
          className="relative h-[min(88vh,760px)] w-full overflow-hidden"
          style={{ background: PAGE_BG }}
          initial={{ opacity: 0, scale: 1.06, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="absolute inset-0">
          {cards.map((c, i) => (
              <motion.div
                  key={i}
                  className="absolute rounded-2xl overflow-hidden shadow-2xl"
                  style={{ left: `${c.left}%`, top: `${c.top}%`, width: c.size, height: c.size / c.aspect, rotate: `${c.rot}deg` }}
                  initial={{ y: 80, opacity: 0, scale: 0.98 }}
                  animate={{ y: [80, 0, -c.amp, 0, c.amp, 0], opacity: 1, scale: 1 }}
                  transition={{ duration: c.dur + 1, repeat: Infinity, ease: "easeInOut", delay: c.delay, times: [0, 0.12, 0.37, 0.62, 0.87, 1] }}
              >
                <img src={c.src} className="h-full w-full object-cover" loading="lazy" />
              </motion.div>
          ))}
        </div>
        <div className="relative z-10 h-full grid place-items-center text-center">
          <div>
            <div className="mt-2">
              <div
                  className="leading-none text-[min(7.8vw,96px)] font-serif italic tracking-tight relative z-20"
                  style={{
                    color: PALETTE.accent,
                    WebkitTextStroke: "30px #FFFFFF",
                    paintOrder: "stroke fill",
                    textShadow: "0 0 40px rgba(255,255,255,0.90)",
                  }}
              >
                A CELEBRATION OF EXCELLENCE
              </div>
              <div
                  className="leading-none font-black tracking-[-0.04em] text-[min(12.5vw,168px)] relative z-20"
                  style={{
                    color: PALETTE.navy,
                    WebkitTextStroke: "30px #FFFFFF",
                    paintOrder: "stroke fill",
                    textShadow: "0 0 60px rgba(255,255,255,0.95)",
                  }}
              >
                Past
              </div>
              <div
                  className="-mt-3 leading-none font-black tracking-[-0.04em] text-[min(12.5vw,168px)] relative z-20"
                  style={{
                    color: PALETTE.navy,
                    WebkitTextStroke: "30px #FFFFFF",
                    paintOrder: "stroke fill",
                    textShadow: "0 0 60px rgba(255,255,255,0.95)",
                  }}
              >
                Winners
              </div>
            </div>
          </div>
        </div>
      </motion.section>
  );
}

/* =============== Admin Panel（带密码 & 上传成功提示 & IME 友好） =============== */
function AdminPanel({
                      open,
                      onClose,
                      data,
                      onRefresh,
                      toast,
                    }: {
  open: boolean;
  onClose: () => void;
  data: PosterDTO[];
  onRefresh: () => Promise<void>;
  toast: (msg: string) => void;
}) {
  const [authed, setAuthed] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdErr, setPwdErr] = useState<string | null>(null);

  // 创建
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [year, setYear] = useState<string>("");
  const [award, setAward] = useState("");
  const [type, setType] = useState("");
  const [area, setArea] = useState("");
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState<File | null>(null);
  const [pdf, setPdf] = useState<File | null>(null);
  const [imgOk, setImgOk] = useState(false);
  const [pdfOk, setPdfOk] = useState(false);

  // 编辑
  const [editing, setEditing] = useState<PosterDTO | null>(null);
  const [patch, setPatch] = useState<Record<string, any>>({});
  const [imgPatch, setImgPatch] = useState<File | null>(null);
  const [pdfPatch, setPdfPatch] = useState<File | null>(null);
  const [imgPatchOk, setImgPatchOk] = useState(false);
  const [pdfPatchOk, setPdfPatchOk] = useState(false);

  // IME / Enter 拦截
  const composingRef = useRef(false);
  const formKeyGuard = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    const composing =
        composingRef.current || (e.nativeEvent as any)?.isComposing || (e as any)?.isComposing;
    if (e.key === "Enter" && tag !== "TEXTAREA") {
      if (composing) {
        e.preventDefault();
        return;
      }
      // 不在 textarea 的回车默认阻止，避免误提交
      e.preventDefault();
    }
  };
  const compStart = () => (composingRef.current = true);
  const compEnd = () => (composingRef.current = false);

  const ADMIN_KEY = (import.meta.env.VITE_ADMIN_PASSWORD as string) || "biotech";

  if (!open) return null;

  return (
      <div
          className="fixed inset-0 z-[1100] grid place-items-center"
          style={{ background: "rgba(0,0,0,.5)" }}
          // 不允许点击遮罩关闭，避免误触
          onMouseDown={(e) => {
            // no-op
          }}
      >
        <div
            className="w-[min(96vw, 900px)] max-h-[90vh] overflow-auto rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-8">
            <div style={{ fontWeight: 800, color: "#017151", fontSize: 16 }}>Past Winners Admin</div>
            <div className="grow" />
            <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm"
            >
              Close
            </button>
          </div>

          {!authed ? (
              <form
                  onSubmit={(e) => {
              e.preventDefault();
              if (pwd === ADMIN_KEY) {
              setAuthed(true);
              setPwdErr(null);
              toast("Admin unlocked ✓");
          } else {
              setPwdErr("Wrong password");
          }
          }}
              className="mt-4 grid gap-3"
              >
                <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                  <span className="text-sm text-black/70">Admin Password</span>
                  <input
                      type="password"
                      className="pw-input rounded-lg border border-black/15 px-3 py-2"
                      value={pwd}
                      onChange={(e) => setPwd(e.target.value)}
                      onCompositionStart={compStart}
                      onCompositionEnd={compEnd}
                  />
                </label>
                {pwdErr && <div className="text-sm text-red-600">{pwdErr}</div>}
                <div className="flex justify-end gap-8">
                  <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-black/15 px-3 py-2 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                      type="submit"
                      className="rounded-lg bg-[#017151] px-3 py-2 text-sm font-semibold text-white"
                  >
                    Unlock
                  </button>
                </div>
              </form>
          ) : (
              <>
                {/* Controls */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                      type="button"
                      onClick={() => setShowUpload((v) => !v)}
                      className="rounded-lg border border-black/15 bg-white px-3 py-2 text-sm"
                  >
                    {showUpload ? "Hide Uploader" : "Show Uploader"}
                  </button>
                </div>

                {/* Uploader */}
                {showUpload && (
                    <form
                        onKeyDown={formKeyGuard}
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!title || !year || !img) {
                            alert("Title / Year / Image are required");
                            return;
                          }
                          try {
                            await createPoster({
                              title,
                              year: Number(year),
                              award,
                              type,
                              area,
                              description: desc,
                              image: img,
                              pdf,
                            });
                            toast("Created ✓");
                            await onRefresh();
                            setShowUpload(false);
                            setTitle("");
                            setYear("");
                            setAward("");
                            setType("");
                            setArea("");
                            setDesc("");
                            setImg(null);
                            setPdf(null);
                            setImgOk(false);
                            setPdfOk(false);
                          } catch (err: any) {
                            alert(`Create failed: ${err?.message ?? err}`);
                          }
                        }}
                        className="mt-4 grid gap-2"
                    >
                      <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <span className="text-sm text-black/70">Title*</span>
                        <input
                            className="pw-input rounded-lg border border-black/15 px-3 py-2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onCompositionStart={compStart}
                            onCompositionEnd={compEnd}
                        />
                      </label>
                      <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <span className="text-sm text-black/70">Year*</span>
                        <input
                            className="pw-input rounded-lg border border-black/15 px-3 py-2"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            onCompositionStart={compStart}
                            onCompositionEnd={compEnd}
                        />
                      </label>
                      <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <span className="text-sm text-black/70">Award</span>
                        <input
                            className="pw-input rounded-lg border border-black/15 px-3 py-2"
                            value={award}
                            onChange={(e) => setAward(e.target.value)}
                            onCompositionStart={compStart}
                            onCompositionEnd={compEnd}
                        />
                      </label>
                      <label className="grid grid-cols=[120px_1fr] items-center gap-3">
                        <span className="text-sm text-black/70">Type</span>
                        <input
                            className="pw-input rounded-lg border border-black/15 px-3 py-2"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            onCompositionStart={compStart}
                            onCompositionEnd={compEnd}
                        />
                      </label>
                      <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <span className="text-sm text-black/70">Area</span>
                        <input
                            className="pw-input rounded-lg border border-black/15 px-3 py-2"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            onCompositionStart={compStart}
                            onCompositionEnd={compEnd}
                        />
                      </label>
                      <label className="grid grid-cols-[120px_1fr] items-start gap-3">
                        <span className="mt-2 text-sm text-black/70">Description</span>
                        <textarea
                            className="pw-input rounded-lg border border-black/15 px-3 py-2"
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            rows={3}
                            onCompositionStart={compStart}
                            onCompositionEnd={compEnd}
                        />
                      </label>
                      <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <span className="text-sm text-black/70">Image*</span>
                        <div className="flex items-center gap-2">
                          <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setImg(f);
                                if (f) {
                                  setImgOk(true);
                                  toast("Image uploaded ✓");
                                } else {
                                  setImgOk(false);
                                }
                              }}
                          />
                          {imgOk && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">✓ Uploaded</span>}
                        </div>
                      </label>
                      <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                        <span className="text-sm text-black/70">PDF</span>
                        <div className="flex items-center gap-2">
                          <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setPdf(f);
                                if (f) {
                                  setPdfOk(true);
                                  toast("PDF uploaded ✓");
                                } else {
                                  setPdfOk(false);
                                }
                              }}
                          />
                          {pdfOk && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">✓ Uploaded</span>}
                        </div>
                      </label>

                      <div className="mt-2 flex justify-end gap-8">
                        <button
                            type="button"
                            onClick={() => setShowUpload(false)}
                            className="rounded-lg border border-black/15 px-3 py-2 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-[#017151] px-3 py-2 text-sm font-semibold text-white"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                )}

                {/* List */}
                <div className="mt-4 text-[#017151] font-bold">Manage Posters</div>
                <div className="mt-2 max-h-[40vh] overflow-auto rounded-lg border border-black/10">
                  {data.map((p) => (
                      <div
                          key={p.id}
                          className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 border-b border-dashed border-black/5 px-3 py-2"
                      >
                        <div className="min-w-0 truncate">
                          <b>{p.title}</b>{" "}
                          <span className="ml-2 text-xs text-black/60">{p.year}</span>
                          {p.hidden && (
                              <span className="ml-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
                        hidden
                      </span>
                          )}
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                              setEditing(p);
                              setPatch({});
                              setImgPatch(null);
                              setPdfPatch(null);
                              setImgPatchOk(false);
                              setPdfPatchOk(false);
                            }}
                            className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm"
                        >
                          Edit
                        </button>
                        {!p.hidden ? (
                            <button
                                type="button"
                                onClick={async () => {
                                  await hidePoster(p.id);
                                  toast("Hidden ✓");
                                  await onRefresh();
                                }}
                                className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700"
                            >
                              Hide
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={async () => {
                                  await unhidePoster(p.id);
                                  toast("Restored ✓");
                                  await onRefresh();
                                }}
                                className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-sm"
                            >
                              Unhide
                            </button>
                        )}
                          <button
                              type="button"
                              onClick={async () => {
                                  if (!confirm(`Delete "${p.title}" (${p.year}) ? This cannot be undone.`)) return;
                                  try {
                                      await deletePoster(p.id);
                                      toast("Deleted ✓");
                                      await onRefresh();
                                  } catch (err: any) {
                                      alert(`Delete failed: ${err?.message ?? err}`);
                                  }
                              }}
                              className="rounded-lg border border-red-300 bg-red-100 px-3 py-1.5 text-sm text-red-800"
                          >
                              Delete
                          </button>
                      </div>
                  ))}
                </div>

                {/* Edit */}
                {editing && (
                    <form
                        onKeyDown={formKeyGuard}
                        onSubmit={async (e) => {
                          e.preventDefault();
                          try {
                            const body: Record<string, any> = { ...patch };
                            if (imgPatch) body.image = imgPatch;
                            if (pdfPatch) body.pdf = pdfPatch;
                            await updatePoster(editing.id, body);
                            toast("Saved ✓");
                            setEditing(null);
                            setPatch({});
                            setImgPatch(null);
                            setPdfPatch(null);
                            setImgPatchOk(false);
                            setPdfPatchOk(false);
                            await onRefresh();
                          } catch (err: any) {
                            alert(`Save failed: ${err?.message ?? err}`);
                          }
                        }}
                        className="mt-4 rounded-lg border border-black/10 p-3"
                    >
                      <div className="font-bold text-[#017151]">Edit: {editing.title}</div>
                      <div className="mt-2 grid gap-2">
                        <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                          <span className="text-sm text-black/70">Title</span>
                          <input
                              className="pw-input rounded-lg border border-black/15 px-3 py-2"
                              defaultValue={editing.title}
                              onChange={(e) => setPatch((s) => ({ ...s, title: e.target.value }))}
                              onCompositionStart={compStart}
                              onCompositionEnd={compEnd}
                          />
                        </label>
                        <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                          <span className="text-sm text-black/70">Year</span>
                          <input
                              className="pw-input rounded-lg border border-black/15 px-3 py-2"
                              defaultValue={String(editing.year)}
                              onChange={(e) => setPatch((s) => ({ ...s, year: Number(e.target.value) }))}
                              onCompositionStart={compStart}
                              onCompositionEnd={compEnd}
                          />
                        </label>
                        <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                          <span className="text-sm text-black/70">Award</span>
                          <input
                              className="pw-input rounded-lg border border-black/15 px-3 py-2"
                              defaultValue={editing.award ?? ""}
                              onChange={(e) => setPatch((s) => ({ ...s, award: e.target.value }))}
                              onCompositionStart={compStart}
                              onCompositionEnd={compEnd}
                          />
                        </label>
                        <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                          <span className="text-sm text-black/70">Type</span>
                          <input
                              className="pw-input rounded-lg border border-black/15 px-3 py-2"
                              defaultValue={editing.type ?? ""}
                              onChange={(e) => setPatch((s) => ({ ...s, type: e.target.value }))}
                              onCompositionStart={compStart}
                              onCompositionEnd={compEnd}
                          />
                        </label>
                        <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                          <span className="text-sm text-black/70">Area</span>
                          <input
                              className="pw-input rounded-lg border border-black/15 px-3 py-2"
                              defaultValue={editing.area ?? ""}
                              onChange={(e) => setPatch((s) => ({ ...s, area: e.target.value }))}
                              onCompositionStart={compStart}
                              onCompositionEnd={compEnd}
                          />
                        </label>
                          {/* Edit 表单内部其它字段下面，新增 Description */}
                          <label className="grid grid-cols-[120px_1fr] items-start gap-3">
                              <span className="mt-2 text-sm text-black/70">Description</span>
                              <textarea
                                  className="pw-input rounded-lg border border-black/15 px-3 py-2"
                                  defaultValue={editing.description ?? ""}           // 读旧值
                                  rows={3}
                                  onChange={(e) => setPatch((s) => ({ ...s, description: e.target.value }))}  // ✅ 写入 patch
                                  onCompositionStart={compStart}
                                  onCompositionEnd={compEnd}
                              />
                          </label>

                          <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                          <span className="text-sm text-black/70">Image</span>
                          <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const f = e.target.files?.[0] ?? null;
                                  setImgPatch(f);
                                  setImgPatchOk(!!f);
                                  if (f) toast("Image uploaded ✓");
                                }}
                            />
                            {imgPatchOk && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          ✓ Uploaded
                        </span>
                            )}
                          </div>
                        </label>
                        <label className="grid grid-cols-[120px_1fr] items-center gap-3">
                          <span className="text-sm text-black/70">PDF</span>
                          <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={(e) => {
                                  const f = e.target.files?.[0] ?? null;
                                  setPdfPatch(f);
                                  setPdfPatchOk(!!f);
                                  if (f) toast("PDF uploaded ✓");
                                }}
                            />
                            {pdfPatchOk && (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          ✓ Uploaded
                        </span>
                            )}
                          </div>
                        </label>
                      </div>

                      <div className="mt-2 flex justify-end gap-8">
                        <button
                            type="button"
                            onClick={() => {
                              setEditing(null);
                              setPatch({});
                              setImgPatch(null);
                              setPdfPatch(null);
                              setImgPatchOk(false);
                              setPdfPatchOk(false);
                            }}
                            className="rounded-lg border border-black/15 px-3 py-2 text-sm"
                        >
                          Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-[#017151] px-3 py-2 text-sm font-semibold text-white"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                )}
              </>
          )}
        </div>
      </div>
  );
}

/* =============== Page =============== */
export default function PastWinners() {
  const { show, node } = useToast();

  // 后端数据
  const [serverItems, setServerItems] = useState<PosterDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

    async function refresh() {
        const data = await listPosters({ include_hidden: true });
        setServerItems(Array.isArray(data) ? data : []);
    }
  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

    const allItems: Poster[] = useMemo(
        () =>
            serverItems
                .filter(p => !p.hidden)             // ✅ 公开网格只展示未隐藏
                .map(p => ({
                    id: p.id,
                    title: p.title,
                    year: p.year,
                    award: p.award || "",
                    type: p.type || "",
                    area: p.area || "",
                    img: p.image_url || "",
                    pdf: p.pdf_url || undefined,
                    desc: p.description || "",
                })),
        [serverItems]
    );

  const heroSeeds = useMemo(() => {
    try {
        const mods = import.meta.glob(
            "/src/Photo/Pastwinnerimages/**/*.{jpg,jpeg,png,webp,avif,gif}",
            { as: "url", eager: true }
        );
        const arr = Object.values(mods) as string[];
      return arr.length ? arr : [PLACEHOLDER];
    } catch {
      return [PLACEHOLDER];
    }
  }, []);

  // 过滤+分页
  const [year, setYear] = useState("All");
  const [award, setAward] = useState("All");
  const [type, setType] = useState("All");
  const [area, setArea] = useState("All");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const years = useMemo(
      () => Array.from(new Set(allItems.map((i) => String(i.year)))).sort((a, b) => b.localeCompare(a)),
      [allItems]
  );
  const awards = useMemo(() => Array.from(new Set(allItems.map((i) => i.award).filter(Boolean))) as string[], [allItems]);
  const types = useMemo(() => Array.from(new Set(allItems.map((i) => i.type).filter(Boolean))) as string[], [allItems]);
  const areas = useMemo(() => Array.from(new Set(allItems.map((i) => i.area).filter(Boolean))) as string[], [allItems]);

  const filtered = useMemo(
      () =>
          allItems.filter((i) => {
            const okYear = year === "All" || String(i.year) === year;
            const okAward = award === "All" || i.award === award;
            const okType = type === "All" || i.type === type;
            const okArea = area === "All" || i.area === area;
            return okYear && okAward && okType && okArea;
          }),
      [allItems, year, award, type, area]
  );
  useEffect(() => setPage(1), [year, award, type, area]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  // Overlay + Admin
  const [selected, setSelected] = useState<Poster | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);

  return (
      <div className="relative min-h-screen bg-white text-black">
        {node /* Toast node */}
        {/* Admin 按钮 */}
        <button
            type="button"
            onClick={() => setShowAdmin(true)}
            aria-label="Open Admin"
            style={{
              position: "fixed",
              right: 12,
              bottom: 12,
              zIndex: 900,
              background: "rgba(0,0,0,0.06)",
              color: "#000",
              border: "1px dashed rgba(0,0,0,0.15)",
              borderRadius: 999,
              padding: "8px 10px",
              fontSize: 12,
              opacity: 0.35,
              transition: "opacity .2s, transform .2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
        >
          Admin
        </button>

        <MainNav />
        {/* Hero —— 保持不变 */}
        <IntroHero seeds={heroSeeds} />

        {/* Posters */}
        <section className="scroll-mt-20 pb-20 md:pb-20">
          <PosterStrip
              posters={pageItems}
              onOpen={setSelected}
              header={
                <FilterBar
                    years={years}
                    awards={awards}
                    types={types}
                    areas={areas}
                    year={year}
                    award={award}
                    type={type}
                    area={area}
                    setYear={setYear}
                    setAward={setAward}
                    setType={setType}
                    setArea={setArea}
                />
              }
          />
          <div style={{ background: PAGE_BG, marginTop: -8 }}>
            <div className="mx-auto max-w-[1200px] px-0 md:px-10 pb-0">
              <div className="pt-6 text-center text-xs text-black/60">
                {loading
                    ? "Loading…"
                    : `Showing ${Math.min(pageSize, Math.max(0, filtered.length - (page - 1) * pageSize))} of ${
                        filtered.length
                    } • ${pageSize} per page`}
                {err && <span style={{ color: "red", marginLeft: 8 }}>Error: {err}</span>}
              </div>
              <Pagination page={page} pageCount={pageCount} onPage={setPage} />
            </div>
          </div>
        </section>

        <AnimatePresence>{selected && <Overlay p={selected} onClose={() => setSelected(null)} />}</AnimatePresence>
        <Footer />

        {/* Admin Panel（带密码 & 上传成功提示 & IME 友好） */}
        <AdminPanel
            open={showAdmin}
            onClose={() => setShowAdmin(false)}
            data={serverItems}
            onRefresh={refresh}
            toast={show}
        />
      </div>
  );
}
