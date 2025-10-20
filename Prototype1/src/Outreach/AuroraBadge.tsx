import React from "react";

type Props = {
  percent: number;            // 0–100
  label?: string;
  size?: number;              // px
  ring?: number;              // 进度环厚度 px
  trackColor?: string;        // 底环
  colorFrom?: string;         // 渐变起
  colorTo?: string;           // 渐变止
  glow?: boolean;             // 外圈柔光
  active?: boolean;           // 可外部控制触发；不传则用 in-view 自动触发
  durationMs?: number;
  className?: string;
};

const AuroraBadge: React.FC<Props> = ({
  percent,
  label = "Female participants",
  size = 220,
  ring = 16,
  trackColor = "rgba(255,255,255,0.55)",
  colorFrom = "#34d399",
  colorTo = "#06b6d4",
  glow = true,
  active,
  durationMs = 1400,
  className = "",
}) => {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - ring) / 2;         // SVG 几何
  const circ = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circ;

  const wrapRef = React.useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = React.useState(false);
  const [display, setDisplay] = React.useState(0); // 递增数字（0..percent）
  const [offset, setOffset] = React.useState(circ); // 进度环 dashOffset

  // in-view 自动触发（如果 active 未指定）
  React.useEffect(() => {
    if (active !== undefined) {
      if (active) setStarted(true);
      return;
    }
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setStarted(true)),
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [active]);

  // 动画：数字 + 弧线 同步
  React.useEffect(() => {
    if (!started) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    if (reduce) {
      setDisplay(clamped);
      setOffset(circ - dash);
      return;
    }
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / durationMs);
      const e = ease(k);
      setDisplay(Math.round(clamped * e));
      setOffset(circ - dash * e);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, clamped, circ, dash, durationMs]);

  return (
    <div
      ref={wrapRef}
      className={`relative inline-grid place-items-center ${className}`}
      style={{ width: size, height: size }}
      aria-label={`${percent}% ${label}`}
    >
      {/* 背景层：柔光 + 细刻度圈 */}
      {glow && (
        <div
          className="absolute inset-[-18%] rounded-full blur-2xl opacity-70"
          style={{
            background:
              "radial-gradient(300px 300px at 25% 20%, rgba(52,211,153,0.3), transparent 60%)," +
              "radial-gradient(360px 360px at 80% 20%, rgba(6,182,212,0.28), transparent 60%)," +
              "radial-gradient(420px 420px at 50% 90%, rgba(139,92,246,0.24), transparent 60%)",
          }}
          aria-hidden
        />
      )}

      {/* 外圈刻度（蚀刻质感） */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
          background:
            "repeating-conic-gradient(from -90deg, rgba(255,255,255,0.25) 0 2deg, transparent 2deg 6deg)",
          WebkitMask:
            "radial-gradient(farthest-side,transparent calc(50% - 22px), #000 calc(50% - 22px), #000 55%, transparent 55%)",
          mask:
            "radial-gradient(farthest-side,transparent calc(50% - 22px), #000 calc(50% - 22px), #000 55%, transparent 55%)",
        }}
      />

      {/* 主体玻璃盘 */}
      <div
        className="absolute inset-[10px] rounded-full backdrop-blur-xl"
        style={{
          background:
            "radial-gradient(120% 120% at 50% 20%, rgba(255,255,255,0.9), rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.55))",
          boxShadow:
            "inset 0 12px 30px rgba(255,255,255,0.8), inset 0 -20px 40px rgba(11,15,20,0.08)",
        }}
      />

      {/* SVG 进度环（圆角收尾） */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0"
        aria-hidden
      >
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colorFrom} />
            <stop offset="100%" stopColor={colorTo} />
          </linearGradient>
        </defs>

        {/* 底环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={ring}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={0}
          opacity={0.8}
        />
        {/* 进度环 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#grad)"
          strokeWidth={ring}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transform: `rotate(-90deg)`, transformOrigin: "50% 50%" }}
          filter="drop-shadow(0 4px 18px rgba(6,182,212,0.35))"
        />
      </svg>

      {/* 文案 */}
      <div className="relative z-10 text-center">
        <div className="text-4xl md:text-5xl font-extrabold leading-none text-emerald-700">
          {display}
          <span className="align-top text-2xl md:text-3xl">%</span>
        </div>
        <div className="mt-1 text-sm md:text-base font-medium text-black/70">
          {label}
        </div>
      </div>
    </div>
  );
};

export default AuroraBadge;