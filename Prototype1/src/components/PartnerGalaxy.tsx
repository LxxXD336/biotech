import * as React from "react";
import { motion, AnimatePresence, useAnimationFrame } from "framer-motion";

/** ===== Theme tokens ===== */
const TOKENS = {
    bg: "#FFFFFF",
    text: "#0A332A",

    // 描边
    ringGold: "#A06E18",
    ringSilver: "#6D7A86",
    ringPlatinum: "#4E5963",
    ringSupport: "#77B9A1",

    // 只有 Gold 填充
    fillGold: "rgba(160,110,24,0.28)",

    shadow: "0 10px 30px rgba(0,0,0,0.10)",
};

/** ===== Tier overrides (lowercase key) ===== */
const OVERRIDE_TIERS: Record<string, "gold" | "silver" | "platinum"> = {
    "usyd faculty of engineering": "gold",
    "usyd faculty of science": "gold",
    google: "silver",
    "usyd office of the vice chancellor": "platinum",
    nsw: "platinum",
};

function inferTierByKeywords(
    k: string
): "gold" | "silver" | "platinum" | undefined {
    if (!k) return undefined;
    if (k.includes("faculty of engineering") || k.includes("engineering"))
        return "gold";
    if (k.includes("faculty of science") || k.includes("science")) return "gold";
    if (k.includes("google")) return "silver";
    if (k.includes("vice chancellor")) return "platinum";
    if (k === "nsw" || k.includes("nsw")) return "platinum";
    return undefined;
}

function normalizeAndTierSponsors(raw: any[] = []) {
    return raw.map((it) => {
        const file = (it.file || "").toString();
        const base = file.replace(/\.[^.]+$/, "");
        const nameKey = (it.name || base || "").toString().toLowerCase().trim();
        const fileKey = base.toLowerCase();

        const override =
            OVERRIDE_TIERS[nameKey] || (fileKey ? OVERRIDE_TIERS[fileKey] : undefined);
        const inferred = inferTierByKeywords(nameKey) || inferTierByKeywords(fileKey);
        const finalTier =
            (override as any) ||
            (inferred as any) ||
            (it.tier ? String(it.tier).toLowerCase() : undefined) ||
            "supporter";

        return { ...it, tier: finalTier };
    });
}

export type SponsorItem = {
    name: string;
    logo: string;
    url?: string;
    tier?: "gold" | "silver" | "platinum" | "supporter" | string;
    file?: string;
    blurb?: string; // 可选：简介
};

type Props = {
    items?: SponsorItem[];
    height?: number;
    className?: string;

    /** 背景图（学生图） */
    bgImage?: string;
    /** 背景不透明度（0~1，默认 0.22） */
    bgOpacity?: number;
};

/** 工具：极坐标 → 笛卡尔 */
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

const TIER_LABEL: Record<string, string> = {
    gold: "Gold",
    silver: "Silver",
    platinum: "Platinum",
    supporter: "Supporter",
};

const PILL_STYLE: Record<string, { bg: string; text: string; border: string }> =
    {
        gold: { bg: "#FFF3D9", text: "#7A4E00", border: "#E8C777" },
        silver: { bg: "#EEF2F7", text: "#334155", border: "#C5CFDB" },
        platinum: { bg: "#E9EDF1", text: "#1F2933", border: "#9AA4AE" },
        supporter: { bg: "#E8F6F0", text: "#085E41", border: "#9AD6C2" },
    };

/** ====== simple Modal（遮罩不改容器本身）====== */
function Dialog({
                    open,
                    onClose,
                    sponsor,
                }: {
    open: boolean;
    onClose: () => void;
    sponsor: SponsorItem | null;
}) {
    React.useEffect(() => {
        // 锁滚动
        if (open) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [open]);

    return (
        <AnimatePresence>
            {open && sponsor && (
                <>
                    {/* 遮罩：不动画布本体 */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(3, 20, 17, 0.45)",
                            backdropFilter: "blur(6px)",
                            zIndex: 1000,
                        }}
                    />
                    {/* 弹窗体 */}
                    <motion.div
                        key="dialog"
                        role="dialog"
                        aria-modal="true"
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ duration: 0.18 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            display: "grid",
                            placeItems: "center",
                            zIndex: 1001,
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            style={{
                                width: "min(720px, 92vw)",
                                background: "#fff",
                                borderRadius: 16,
                                boxShadow:
                                    "0 10px 30px rgba(0,0,0,.10), 0 0 0 1px rgba(0,0,0,.06)",
                                padding: 22,
                                pointerEvents: "auto",
                            }}
                        >
                            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                                <div
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: "50%",
                                        background: "#fff",
                                        border: "1px solid rgba(0,0,0,.08)",
                                        boxShadow: TOKENS.shadow,
                                        display: "grid",
                                        placeItems: "center",
                                        overflow: "hidden",
                                    }}
                                >
                                    <img
                                        src={sponsor.logo}
                                        alt={sponsor.name}
                                        style={{ width: "75%", height: "75%", objectFit: "contain" }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 20,
                                            color: TOKENS.text,
                                            lineHeight: 1.25,
                                        }}
                                    >
                                        {sponsor.name}
                                    </div>
                                    <div
                                        style={{
                                            marginTop: 8,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            padding: "4px 10px",
                                            borderRadius: 999,
                                            fontSize: 12,
                                            background:
                                                PILL_STYLE[sponsor.tier || "supporter"]?.bg ??
                                                PILL_STYLE.supporter.bg,
                                            color:
                                                PILL_STYLE[sponsor.tier || "supporter"]?.text ??
                                                PILL_STYLE.supporter.text,
                                            border: `1px solid ${
                                                PILL_STYLE[sponsor.tier || "supporter"]?.border ??
                                                PILL_STYLE.supporter.border
                                            }`,
                                        }}
                                    >
                                        {TIER_LABEL[sponsor.tier || "supporter"] || "Supporter"}
                                    </div>
                                </div>
                                <button
                                    aria-label="Close"
                                    onClick={onClose}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        fontSize: 22,
                                        lineHeight: 1,
                                        cursor: "pointer",
                                        color: "#6b7280",
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div
                                style={{
                                    marginTop: 18,
                                    padding: 14,
                                    borderRadius: 12,
                                    background: "#F7F9FB",
                                    color: "#344054",
                                }}
                            >
                                {sponsor.blurb
                                    ? sponsor.blurb
                                    : `Learn more about ${sponsor.name}.`}
                            </div>

                            <div
                                style={{
                                    marginTop: 18,
                                    display: "flex",
                                    gap: 10,
                                    justifyContent: "flex-end",
                                }}
                            >
                                <button
                                    onClick={onClose}
                                    style={{
                                        borderRadius: 12,
                                        padding: "10px 16px",
                                        border: "1px solid #d0d5dd",
                                        background: "#fff",
                                        color: "#111827",
                                        cursor: "pointer",
                                    }}
                                >
                                    Close
                                </button>
                                {sponsor.url && (
                                    <a
                                        href={sponsor.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{
                                            borderRadius: 12,
                                            padding: "10px 16px",
                                            border: "1px solid #0ea5a3",
                                            background: "#0ea5a3",
                                            color: "#fff",
                                            textDecoration: "none",
                                        }}
                                    >
                                        Visit site →
                                    </a>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

export default function PartnerGalaxy({
                                          items = [],
                                          height = 560,
                                          className = "",
                                          bgImage,
                                          bgOpacity = 0.22,
                                      }: Props) {
    const sponsors = React.useMemo(() => normalizeAndTierSponsors(items), [items]);

    const groups: Record<string, SponsorItem[]> = React.useMemo(() => {
        const g: Record<string, SponsorItem[]> = {
            gold: [],
            silver: [],
            platinum: [],
            supporter: [],
        };
        for (const it of sponsors) {
            const t = (it.tier || "supporter").toLowerCase();
            if (t === "gold") g.gold.push(it);
            else if (t === "silver") g.silver.push(it);
            else if (t === "platinum") g.platinum.push(it);
            else g.supporter.push(it);
        }
        return g;
    }, [sponsors]);

    /** 宽度自适应父容器 */
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [width, setWidth] = React.useState(1200);

    React.useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(() => setWidth(el.clientWidth));
        obs.observe(el);
        setWidth(el.clientWidth);
        return () => obs.disconnect();
    }, []);

    // 画布几何
    const W = width;
    const H = height;
    const CX = W / 2;
    const CY = H / 2;

    // 最大半径：离容器边留 24px 内边距
    const MAXR = Math.min(W, H) / 2 - 24;

    // 由内到外：Gold / Silver / Platinum / Supporter
    const rGold = MAXR * 0.3;
    const rSilver = MAXR * 0.63;
    const rPlatinum = MAXR * 0.9;
    const rSupporter = MAXR * 1.2;

    // 描边宽
    const RING_LINE = Math.max(4, Math.round(Math.min(W, H) * 0.008));

    // 节点尺寸
    const NODE = { gold: 86, silver: 70, platinum: 60, supporter: 60 } as const;

    // 自转（无 drag；悬停暂停，移开继续）
    const offsetsRef = React.useRef<Record<string, number>>({
        gold: 0,
        silver: 0,
        platinum: 0,
        supporter: 0,
    });
    const speedsRef = React.useRef<Record<string, number>>({
        gold: 4,
        silver: 7,
        platinum: -6,
        supporter: -9,
    });
    const spinningRef = React.useRef(true);
    const [, force] = React.useState(0);
    const lastT = React.useRef<number | null>(null);

    useAnimationFrame((t) => {
        if (!spinningRef.current) {
            lastT.current = t;
            return;
        }
        if (lastT.current == null) {
            lastT.current = t;
            return;
        }
        const dt = (t - lastT.current) / 1000;
        lastT.current = t;
        for (const k of Object.keys(offsetsRef.current)) {
            offsetsRef.current[k] += (speedsRef.current[k] || 0) * dt;
        }
        force((v) => (v + 1) % 1000000);
    });

    const pauseSpin = React.useCallback(() => {
        spinningRef.current = false;
    }, []);
    const resumeSpin = React.useCallback((delay = 250) => {
        window.setTimeout(() => {
            spinningRef.current = true;
        }, delay);
    }, []);

    function positionsFor(tier: "gold" | "silver" | "platinum" | "supporter") {
        const arr = groups[tier] || [];
        const n = arr.length || 1;
        const start = tier === "gold" ? -90 : -60;
        const step = 360 / n;
        const off = offsetsRef.current[tier] || 0;
        return arr.map((_, i) => start + step * i + off);
    }

    // 画圆工具
    const circle = (r: number, style: React.CSSProperties = {}) => (
        <div
            style={{
                position: "absolute",
                left: CX - r,
                top: CY - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                ...style,
            }}
        />
    );

    // 弹窗状态
    const [active, setActive] = React.useState<SponsorItem | null>(null);
    const closeDialog = React.useCallback(() => {
        setActive(null);
        resumeSpin(250);
    }, [resumeSpin]);

    return (
        <div
            className={className}
            ref={containerRef}
            style={{
                width: "100%",
                background: TOKENS.bg,
                borderRadius: 20,
                boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
                overflow: "hidden",
                position: "relative",
            }}
        >
            {/* 背景学生图：满铺 + 轻微漂浮（不改容器透明度） */}
            {bgImage && (
                <motion.img
                    src={bgImage}
                    alt=""
                    aria-hidden
                    initial={{ scale: 1.06, x: 0, y: 0 }}
                    animate={{
                        scale: [1.06, 1.1, 1.08, 1.06],
                        x: [0, 18, -12, 0],
                        y: [0, 12, -8, 0],
                    }}
                    transition={{ duration: 60, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: H,
                        objectFit: "cover",
                        opacity: bgOpacity,
                        filter: "saturate(0.95) brightness(0.98)",
                        pointerEvents: "none",
                    }}
                />
            )}

            {/* 画布 */}
            <div
                style={{
                    width: "100%",
                    height: H,
                    position: "relative",
                    overflow: "hidden",
                }}
                onMouseEnter={() => (spinningRef.current = true)}
            >
                {/* 只有 Gold 内圈填充；其它圈都透明，仅描边 */}
                {circle(rGold, { background: TOKENS.fillGold })}
                {circle(rGold, { border: `${RING_LINE}px solid ${TOKENS.ringGold}` })}
                {circle(rSilver, { border: `${RING_LINE}px solid ${TOKENS.ringSilver}` })}
                {circle(rPlatinum, { border: `${RING_LINE}px solid ${TOKENS.ringPlatinum}` })}
                {circle(rSupporter, {
                    border: `${RING_LINE}px solid ${TOKENS.ringSupport}`,
                })}

                {/* 各圈节点 */}
                {(
                    [
                        { key: "gold", r: rGold },
                        { key: "silver", r: rSilver },
                        { key: "platinum", r: rPlatinum },
                        { key: "supporter", r: rSupporter },
                    ] as const
                ).map((ring) => {
                    const tier = ring.key;
                    const arr = groups[tier] || [];
                    if (!arr.length) return null;
                    const angles = positionsFor(tier);
                    const pill = PILL_STYLE[tier] || PILL_STYLE.supporter;

                    return arr.map((s, i) => {
                        const angle = angles[i];
                        const { x, y } = polarToXY(CX, CY, ring.r, angle);
                        const size = (NODE as any)[tier] || 76;
                        const label = TIER_LABEL[tier] || "Supporter";

                        const inner = (
                            <div
                                style={{
                                    width: size,
                                    height: size,
                                    borderRadius: "50%",
                                    background: "#fff",
                                    border: `1px solid rgba(0,0,0,0.08)`,
                                    boxShadow: TOKENS.shadow,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                }}
                            >
                                <img
                                    src={s.logo}
                                    alt={s.name}
                                    style={{ width: "75%", height: "75%", objectFit: "contain" }}
                                />
                            </div>
                        );

                        return (
                            <motion.div
                                key={s.name + i}
                                initial={{ opacity: 0, scale: 0.92 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.35, delay: 0.02 * i }}
                                style={{
                                    position: "absolute",
                                    left: x - size / 2,
                                    top: y - size / 2,
                                    textAlign: "center",
                                }}
                                whileHover={{ y: -6, scale: 1.03 }}
                                onMouseEnter={pauseSpin}
                                onMouseLeave={() => active ? null : resumeSpin(200)}
                                onClick={() => {
                                    pauseSpin();
                                    setActive(s);
                                }}
                            >
                                {inner}
                                <div
                                    style={{
                                        marginTop: 8,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "4px 10px",
                                        borderRadius: 999,
                                        fontSize: 12,
                                        background: pill.bg,
                                        color: pill.text,
                                        border: `1px solid ${pill.border}`,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {label}
                                </div>
                            </motion.div>
                        );
                    });
                })}
            </div>

            {/* 介绍弹窗（打开时不改变画布容器；关闭即卸载遮罩） */}
            <Dialog open={!!active} onClose={closeDialog} sponsor={active} />
        </div>
    );
}
