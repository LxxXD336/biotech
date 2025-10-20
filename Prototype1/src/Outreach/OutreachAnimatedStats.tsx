import React, { useEffect, useRef, useState } from "react";
import AuroraBadge from "./AuroraBadge";

/* ============= 新增：内联编辑支持（与其它组件一致） ============= */
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
      className={`${className} inline-block ${
        dashed ? "outline outline-2 outline-dashed outline-emerald-600/60 rounded-lg px-1 -mx-1" : ""
      }`}
    />
  );
};
/* ============================================================ */

export interface StatItem { label: string; value: number; suffix?: string; }
export interface DonutItem { label: string; value: number; color?: string; }

export interface OutreachAnimatedStatsProps {
  title?: string;
  subtitle?: string;
  items: StatItem[];
  cols?: 2 | 3 | 4;
  className?: string;
  durationMs?: number;

  // donut
  donutTitle?: string;
  donutItems?: DonutItem[];
  donutSize?: number;
  donutThickness?: number;
  donutPalette?: string[];

  // 左侧奖章
  badgePercent?: number;
  badgeLabel?: string;
  badgeSize?: number;
  badgeColors?: { primary: string; secondary: string; accent?: string };

  // 标题风格
  kicker?: string;                 // 如：'STATS' / 'EVENTS'
  align?: "left" | "center";       // 默认 left

  // ===== 新增：内联编辑控制（Admin 开关打开时由父组件传入） =====
  inlineControls?: {
    title?: InlineCtl;
    subtitle?: InlineCtl;
    kicker?: InlineCtl;
  };
}

/* 进入视口检测 */
const useInView = (margin = "0px 0px -20% 0px") => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current; if (!node) return;
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setInView(true)), { root: null, rootMargin: margin, threshold: 0.15 });
    io.observe(node); return () => io.disconnect();
  }, [margin]);
  return { ref, inView };
};

const ease = (k: number) => 0.5 - 0.5 * Math.cos(Math.PI * k);

/* 环形图 */
const Donut: React.FC<{ items: DonutItem[]; progress: number; size: number; thickness: number; palette: string[]; title?: string; }> =
({ items, progress, size, thickness, palette, title }) => {
  const total = Math.max(1e-9, items.reduce((s, it) => s + (it.value || 0), 0));
  const R = (size - thickness) / 2;
  const p = ease(progress);

  let acc = 0;
  const segs = items.map((it, i) => {
    const ratio = (it.value || 0) / total;
    const start = acc; acc += ratio;
    return { ...it, ratio, start, color: it.color ?? palette[i % palette.length] };
  });

  return (
    <div className="relative flex flex-col items-center" style={{ width: size }} aria-label={title ?? "Donut"}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="rgba(0,0,0,.08)" strokeWidth={thickness}/>
        {segs.map((s, i) => (
          <circle key={i} cx={size/2} cy={size/2} r={R} fill="none" stroke={s.color} strokeWidth={thickness} pathLength={1}
                  strokeLinecap="butt" strokeDasharray={`${Math.max(0, s.ratio * p)} ${Math.max(0, 1 - s.ratio * p)}`}
                  strokeDashoffset={1 - s.start} transform={`rotate(-90 ${size/2} ${size/2})`} />
        ))}
      </svg>
      <div className="mt-3 w-full space-y-1.5">
        {segs.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[13px]">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="text-black/80">{s.label}</span>
            <span className="ml-auto tabular-nums text-black/70">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OutreachAnimatedStats: React.FC<OutreachAnimatedStatsProps> = ({
  title, subtitle, items, cols = 3, className = "", durationMs = 2400,
  donutTitle, donutItems, donutSize = 220, donutThickness = 24,
  donutPalette = ["#0f6f5c", "#3cb48c", "#065f46", "#86efac"],
  badgePercent = 60,
  badgeLabel = "Female participants",
  badgeSize = 220,
  badgeColors = { primary: "#0f6f5c", secondary: "#3cb48c", accent: "#0b3d33" },
  kicker,
  align = "left",
  /* 新增 */ inlineControls,
}) => {
  const { ref, inView } = useInView();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / durationMs);
      setProgress(k);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, durationMs]);

  const p = ease(progress);

  const alignCls = align === "center" ? "text-center" : "text-left";
  const rowJustify = align === "center" ? "justify-center" : "justify-start";

  return (
    <section ref={ref} className={`relative ${className}`}>
      {/* 背景柔光 */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-8 -left-10 h-40 w-40 bg-emerald-200 rounded-full blur-3xl opacity-60"/>
        <div className="absolute bottom-0 right-0 h-44 w-44 bg-emerald-100 rounded-full blur-3xl opacity-70"/>
      </div>

      {(inlineControls?.kicker || inlineControls?.title || inlineControls?.subtitle || title || subtitle || kicker) && (
        <header className={`mb-6 md:mb-8 ${alignCls}`}>
          <div className={`flex items-baseline gap-3 flex-wrap ${rowJustify}`}>
            {(inlineControls?.kicker || kicker) && (
              <span className="kicker">
                {inlineControls?.kicker ? <Editable ctl={inlineControls.kicker} /> : kicker}
              </span>
            )}
            {(inlineControls?.title || title) && (
              <h3 className="heading-xl ">
                {inlineControls?.title ? <Editable ctl={inlineControls.title} as="span" /> : title}
              </h3>
            )}
          </div>
          {(inlineControls?.subtitle || subtitle) && (
            <p className="mt-2 text-[15px] md:text-base text-[color:var(--ink)]/70">
              {inlineControls?.subtitle ? <Editable ctl={inlineControls.subtitle} as="span" /> : subtitle}
            </p>
          )}
        </header>
      )}

      <div className="grid gap-8 md:grid-cols-[minmax(260px,1fr),2fr,minmax(260px,1fr)] items-start">
        {/* 左：徽章 */}
        <div className={`${inView ? "animate-softIn" : "opacity-0 translate-y-4"} flex justify-center`}>
          <AuroraBadge
            percent={badgePercent}
            label={badgeLabel}
            size={badgeSize}
            ring={Math.max(12, Math.round(badgeSize * 0.075))}
            colorFrom="var(--brand)"
            colorTo="var(--brand-mint)"
            glow
            active={inView}
            durationMs={durationMs}
          />
        </div>

        {/* 中：数字卡片 */}
        <div className={`grid gap-4 md:gap-6 ${cols===4 ? "grid-cols-2 md:grid-cols-4" : cols===2 ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"}`}>
          {items.map((it, i) => (
            <div key={i} className="rounded-2xl border border-black/5 bg-white/70 backdrop-blur-xl p-5 md:p-6 shadow-[0_10px_40px_rgba(0,0,0,.06)]">
              <div className="text-2xl md:text-3xl font-semibold tracking-tight tabular-nums text-[color:var(--brand-deep)]">
                {Math.round(it.value * p)}{p>=1 && it.suffix ? it.suffix : ""}
              </div>
              <div className="mt-1 text-sm md:text-base text-black/70">{it.label}</div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
                <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${Math.max(0.05, p) * 100}%` }}/>
              </div>
            </div>
          ))}
        </div>

        {/* 右：环形图 */}
        {donutItems?.length ? (
          <div className="mx-auto md:mx-0">
            <Donut items={donutItems} progress={progress} size={donutSize} thickness={donutThickness} palette={donutPalette} title={donutTitle}/>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default OutreachAnimatedStats;
