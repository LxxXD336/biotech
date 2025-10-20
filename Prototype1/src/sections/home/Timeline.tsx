import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { COLORS, useReveal, Container } from "../../components/common";

type EventItem = {
    month: string;
    day: string;
    title: string;
    subtitle?: string;
    color?: string;
};

const EVENTS: EventItem[] = [
    { month: "MAY", day: "7", title: "Registration opens", subtitle: "Open for all participants", color: "#333333" },
    { month: "JUL", day: "28", title: "Registration close", subtitle: "Final day to register", color: "#5ea99e" },
    { month: "AUG", day: "04", title: "Challenge begins", subtitle: "Mentorship & work begins", color: "#BDE8B6" },
    { month: "SEP", day: "19", title: "Project submission", subtitle: "Submit projects & reports", color: "#BDE8B6" },
    { month: "SEP", day: "29", title: "Finalists shortlisted", subtitle: "Shortlist announced", color: "#BDE8B6" },
    { month: "OCT", day: "24", title: "Symposium & Science Fair", subtitle: "Showcase & awards", color: "#D9D9D9" },
];

const Timeline: React.FC = () => {
    const ref = useReveal();
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const sectionRef = useRef<HTMLDivElement | null>(null);
    const inView = useInView(sectionRef, { once: true, margin: "-10% 0px" });
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [progressWidth, setProgressWidth] = useState(0);
    const [characterPosition, setCharacterPosition] = useState(0);
    const [clickEffect, setClickEffect] = useState<{x: number, y: number} | null>(null);

    // 计算每个时间点的实际位置（基于DOM元素位置和大小）
    const [timePointPositions, setTimePointPositions] = useState<Array<{x: number, y: number}>>([]);

    // 计算小人移动的路径点（避免直线跳跃）
    const [characterPath, setCharacterPath] = useState<Array<{x: number, y: number}>>([]);

    // 新增：保存每个 node button 的 refs，用于在收起时 blur()
    const nodeRefs = useRef<Array<HTMLButtonElement | null>>([]);

    // 计算时间点位置的函数
    const calculateTimePointPositions = () => {
        const positions = nodeRefs.current.map((nodeRef, index) => {
            if (nodeRef && wrapRef.current) {
                const nodeRect = nodeRef.getBoundingClientRect();
                const containerRect = wrapRef.current.getBoundingClientRect();

                // 计算相对于容器的位置 - 小人放在时间点左侧
                const isMobile = window.innerWidth <= 820;
                const x = nodeRect.left - containerRect.left - (isMobile ? 20 : 30); // 节点左侧30px
                const y = nodeRect.top - containerRect.top + nodeRect.height / 2 - (isMobile ? 230 : 195); // 手机端向下移动

                return { x, y };
            }
            return { x: 0, y: 0 };
        });
        setTimePointPositions(positions);

        // 计算小人移动路径（沿着时间轴路径）
        const path = positions.map((pos, index) => {
            if (index === 0 || index === positions.length - 1) {
                return pos; // 第一个和最后一个点保持原位置
            }
            // 中间点稍微向下偏移，形成弧形路径
            return {
                x: pos.x,
                y: pos.y + 20 // 向下偏移20px形成弧形
            };
        });
        setCharacterPath(path);
    };

    // 计算时间点位置
    useEffect(() => {
        const timer = setTimeout(() => {
            calculateTimePointPositions();
        }, 100); // 延迟执行确保DOM已渲染

        const handleResize = () => {
            calculateTimePointPositions();
        };

        window.addEventListener('resize', handleResize);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [inView]); // 当inView改变时重新计算


    // 改进的 toggle：关闭时 blur 当前按钮，切换时 blur 之前按钮，并更新进度条
    const toggle = (i: number) => {
        const prev = openIndex;
        const wasOpen = prev === i;

        if (wasOpen) {
            // 如果正在关闭同一节点：收起并 blur 当前按钮，避免残留 focus 样式
            setOpenIndex(null);
            setTimeout(() => {
                nodeRefs.current[i]?.blur();
            }, 0);
        } else {
            // 打开新节点：先 blur 之前打开的节点（如果有），再设置新的 openIndex
            if (prev !== null && nodeRefs.current[prev]) {
                setTimeout(() => {
                    nodeRefs.current[prev]?.blur();
                }, 0);
            }
            setOpenIndex(i);
            // 更新进度条宽度和角色位置 - 基于点击的节点索引
            const progressPercentage = (i / (EVENTS.length - 1)) * 100;
            setProgressWidth(progressPercentage);
            setCharacterPosition(i);

            // 重新计算位置
            setTimeout(() => {
                calculateTimePointPositions();
            }, 50);

            // 添加点击效果
            if (nodeRefs.current[i]) {
                const rect = nodeRefs.current[i]!.getBoundingClientRect();
                setClickEffect({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                setTimeout(() => setClickEffect(null), 600);
            }
        }
    };

    return (
        <section id="timeline-enhanced-v2" ref={sectionRef} aria-label="Key dates timeline">
            <Container className="py-16 md:py-24">
                <div ref={wrapRef} className={`te2-wrap ${inView ? "te2-inview" : ""}`}>
                    <motion.header
                        className="te2-header"
                        initial={{opacity: 0, y: -30}}
                        animate={{opacity: inView ? 1 : 0, y: inView ? 0 : -30}}
                        transition={{duration: 0.8, ease: "easeOut"}}
                    >
                        <motion.span
                            className="pill"
                            // whileHover={{
                            //     scale: 1.05,
                            //     boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            //     transition: { duration: 0.3 }
                            // }}
                            // whileTap={{ scale: 0.95 }}
                        >
                            KEY DATES
                        </motion.span>
                        <motion.h2
                            className="te2-title hover-gradient-text"
                            // whileHover={{
                            //     scale: 1.02,
                            //     transition: { duration: 0.3 }
                            // }}
                            // whileTap={{ scale: 0.98 }}
                        >
                            KEY INTERNATIONAL DATES 2025
                        </motion.h2>
                    </motion.header>
                    <p className="te2-sub">
                        Find out more about our{" "}
                        <a
                            href="/QueenslandSatellite"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chapter-link"
                        >
                            Queensland
                        </a>{" "}
                        and{" "}
                        <a
                            href="/VictoriaSatellite"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="chapter-link"
                        >
                            Victoria
                        </a>{" "}
                        Chapters
                    </p>
                    <div className="te2-timeline glass-container" role="list" aria-hidden={!inView}>
                        {/* dotted center line (居中虚线) */}
                        <div className="te2-line" aria-hidden="true"/>
                        {/* Progress bar */}
                        <div className="te2-progress-bar" aria-hidden="true">
                            <div
                                className="te2-progress-fill"
                                style={{width: `${progressWidth}%`}}
                            />
                        </div>
                        {/* Character above time points - 基于实际DOM位置计算，使用路径动画 */}
                        {timePointPositions.length > 0 && timePointPositions[characterPosition] && (
                            <motion.div
                                role="img"
                                aria-label={`Mascot at ${EVENTS[characterPosition]?.month} ${EVENTS[characterPosition]?.day}`}
                                initial={false}
                                animate={{
                                    left: `${timePointPositions[characterPosition]?.x || 0}px`,
                                    top: `${timePointPositions[characterPosition]?.y || 0}px`,
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    mass: 0.8
                                }}
                                style={{
                                    position: "absolute",
                                    transform: "translate(-50%, -50%)",
                                    width: window.innerWidth <= 820 ? 40 : 56,
                                    height: window.innerWidth <= 820 ? 40 : 56,
                                    borderRadius: "999px",
                                    background: COLORS.blue,
                                    color: COLORS.white,
                                    display: "grid",
                                    placeItems: "center",
                                    boxShadow: "0 0 18px rgba(57,104,123,0.45)",
                                    fontSize: window.innerWidth <= 820 ? 20 : 28,
                                    cursor: "pointer",
                                    zIndex: 3,
                                }}
                                whileHover={{scale: 1.1}}
                                whileTap={{scale: 0.95}}
                                onClick={() => toggle(characterPosition)}
                            >
                                <span aria-hidden>🧑‍🔬</span>
                            </motion.div>
                        )}

                        {/* events */}
                        <ol className="te2-list">
                            {EVENTS.map((ev, i) => {
                                const delay = `${i * 120}ms`;
                                const isOpen = openIndex === i;
                                return (
                                    <motion.li
                                        key={i}
                                        className={`te2-item ${isOpen ? "open" : ""}`}
                                        style={{animationDelay: delay}}
                                        role="listitem"
                                        initial={{opacity: 0, y: 50, scale: 0.8}}
                                        animate={{
                                            opacity: inView ? 1 : 0,
                                            y: inView ? 0 : 50,
                                            scale: inView ? 1 : 0.8
                                        }}
                                        transition={{
                                            duration: 0.6,
                                            delay: inView ? i * 0.1 : 0,
                                            ease: "easeOut"
                                        }}
                                    >
                                        <div className="te2-node-wrap" style={{animationDelay: delay}}>
                                            <button
                                                ref={(el) => {
                                                    nodeRefs.current[i] = el;
                                                }}
                                                className="te2-node"
                                                onClick={() => toggle(i)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter" || e.key === " ") {
                                                        e.preventDefault();
                                                        toggle(i);
                                                    }
                                                }}
                                                aria-expanded={isOpen}
                                                aria-controls={`te2-detail-${i}`}
                                                title={`${ev.month} ${ev.day} — ${ev.title}`}
                                                style={{background: ev.color || "#eee"}}
                                            >
                                                <div
                                                    className="te2-month"
                                                    style={{
                                                        color:
                                                            i === 0
                                                                ? "#fff" // 第 1 个节点白色
                                                                : i === 1 || i === 2 || i === 3 || i === 4
                                                                    ? "#000" // 第 2、3 个节点黑色
                                                                    : "rgba(136,136,136,0.7)", // 第 4、5、6 个节点灰色
                                                    }}
                                                >
                                                    {ev.month}
                                                </div>
                                                <div
                                                    className="te2-day"
                                                    style={{
                                                        color:
                                                            i === 0
                                                                ? "#fff"
                                                                : i === 1 || i === 2 || i === 3 || i === 4
                                                                    ? "#000"
                                                                    : "#888",
                                                    }}
                                                >
                                                    {ev.day}
                                                </div>
                                                <span className="te2-node-ring" aria-hidden="true"/>
                                            </button>

                                        </div>

                                        <div
                                            className="te2-label"
                                            onClick={() => toggle(i)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    e.preventDefault();
                                                    toggle(i);
                                                }
                                            }}
                                            aria-pressed={isOpen}
                                        >
                                            {ev.title}
                                        </div>

                                        <div id={`te2-detail-${i}`} className="te2-detail" aria-hidden={!isOpen}>
                                            <div className="te2-card">
                                                <div className="te2-card-head">
                                                    <strong>{ev.title}</strong>
                                                    <span className="te2-card-date">
                            {ev.month} {ev.day}
                          </span>
                                                </div>
                                                {ev.subtitle && <div className="te2-card-body">{ev.subtitle}</div>}
                                                {/* Close 按钮已去掉：再次点击同一节点即可收起 */}
                                            </div>
                                        </div>
                                    </motion.li>
                                );
                            })}
                        </ol>
                    </div>
                </div>
            </Container>

            {/* Click effect overlay */}
            {clickEffect && (
                <div
                    className="click-effect"
                    style={{
                        left: clickEffect.x - 20,
                        top: clickEffect.y - 20,
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${COLORS.green}, transparent)`,
                        border: `2px solid ${COLORS.lime}`
                    }}
                />
            )}

            <style>{`
/* 基础布局 & 颜色 */
#timeline-enhanced-v2 { color: ${COLORS.charcoal}; background: #FFFFFF; }
.te2-wrap { max-width: 1500px; margin: auto;margin-bottom: -60px;margin-top: -40px;}
.te2-header { text-align: center; margin-bottom: 20px; }
.pill { display:inline-block;padding:8px 14px;border-radius:999px;background:${COLORS.green}; color:#fff;font-weight:700; letter-spacing: 0.4px; }
.te2-title { margin: 10px 0; font-size: clamp(32px,4.6vw,64px); font-weight:900; color:#174243}

/* 悬停渐变色动画 */
// .hover-gradient-text {
//     background-size: 200% 200%;
//     transition: background-position 0.6s ease;
// }
// .hover-gradient-text:hover {
//     background: linear-gradient(45deg, #A7DEA0, #017151, #5EA99E, #A7DEA0);
//     background-size: 300% 300%;
//     -webkit-background-clip: text;
//     -webkit-text-fill-color: transparent;
//     animation: gradientShift 2s ease infinite;
// }
// @keyframes gradientShift {
//     0% { background-position: 0% 50%; }
//     50% { background-position: 100% 50%; }
//     100% { background-position: 0% 50%; }
// }
.te2-sub { margin-top:-20px; color: ${COLORS.charcoal}; opacity:0.8; font-size:22px ;text-align: center}

/* chapter link style */
.te2-sub .chapter-link {
  text-decoration: underline;
  color: inherit;
  font-weight: 700;
}
.te2-sub .chapter-link:hover { color: ${COLORS.green}; text-decoration: underline; }

/* timeline container */
.te2-timeline { position: relative; padding: 25px 12px 16px;  }

/* Glass container */
.glass-container {
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.28);
  border-radius: 20px;
  backdrop-filter: saturate(140%) blur(8px);
  -webkit-backdrop-filter: saturate(140%) blur(8px);
  box-shadow: 0 10px 24px rgba(0,0,0,0.18);
  margin: 20px 0;
  
}
.te2-line {
  position: absolute;
  left: 48px;
  right: 48px;
  top: 86px; /* 与节点中心对齐 */
  height: 2px;
  background-image: linear-gradient(to right, rgba(0,0,0,0.16) 33%, rgba(0,0,0,0) 0%);
  background-size: 12px 2px;
  background-repeat: repeat-x;
  z-index: 1;
  transform-origin: center;
  animation: dashMove 3s linear infinite;
}

/* Progress bar */
.te2-progress-bar {
  position: absolute;
  left: 48px;
  right: 48px;
  top: 86px;
  height: 4px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  z-index: 2;
  overflow: hidden;
}

.te2-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, ${COLORS.green}, ${COLORS.lime});
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 8px rgba(38,166,91,0.4);
}

/* Character animation removed - now using inline styles with motion.div */

/* Click effect */
.click-effect {
  position: fixed;
  pointer-events: none;
  z-index: 1000;
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

/* list 布局 */
.te2-list {
  list-style: none;
  margin: 0;
  padding: 15px 36px;
  display: flex;
  gap: 28px;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 3;
  position: relative;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scroll-snap-type: x mandatory;
}
.te2-list::-webkit-scrollbar { height: 8px; }
.te2-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.06); border-radius:999px; }

/* item 入场 */
.te2-item {
  flex: 1 1 140px;
  min-width: 120px;
  max-width: 200px;
  text-align: center;
  transform: translateY(18px);
  opacity: 0;
  animation: appearUp .6s cubic-bezier(.2,.9,.3,1) forwards;
}

/* node */
.te2-node-wrap { display:flex; justify-content:center; align-items:center; }
.te2-node {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  display:flex;
  flex-direction: column;
  align-items:center;
  justify-content:center;
  font-weight:800;
  border: 6px solid rgba(255,255,255,0.0);
  box-shadow: 0 10px 30px rgba(3,10,30,0.06);
  cursor: pointer;
  transition: transform .22s ease, box-shadow .22s ease, border-color .18s;
  position: relative;
  background: linear-gradient(180deg, #fff 0%, #fbfbfb 100%);
  outline: none;
}
.te2-node:focus { box-shadow: 0 14px 36px rgba(0,0,0,0.12); transform: translateY(-6px) scale(1.03); }

/* month / day */
.te2-month { font-size: 12px; opacity: 0.9; font-weight:700; letter-spacing: 1px; margin-bottom: 4px; color:${COLORS.charcoal}; }
.te2-day { font-size: 28px; font-weight:900; color:${COLORS.charcoal}; }

/* hover + ring */
.te2-node-ring {
  position: absolute;
  left: 50%; top: 50%;
  width: 120%; height: 120%;
  transform: translate(-50%,-50%) scale(.9);
  border-radius: 999px;
  border: 6px solid transparent;
  box-shadow: 0 12px 30px rgba(0,0,0,0.04);
  transition: transform .36s ease, opacity .36s ease;
  pointer-events: none;
  opacity: 0;
}
.te2-node:hover { transform: translateY(-8px) rotate(-2deg) scale(1.06); box-shadow: 0 22px 44px rgba(3,10,30,0.12); }
.te2-node:hover .te2-node-ring { opacity: 0.22; transform: translate(-50%,-50%) scale(1); border-color: ${COLORS.green}; box-shadow: 0 18px 44px rgba(38,166,91,0.12); }

/* 事件名称（节点下方），点击也会展开 */
.te2-label {
  margin-top: 8px;
  font-weight:700;
  color: ${COLORS.charcoal};
  cursor: pointer;
  user-select: none;
  transition: transform .18s ease, color .18s ease;
}
.te2-label:hover { transform: translateY(-3px); color: ${COLORS.green}; }

/* detail 卡片（默认折叠） */
.te2-detail {
  margin-top: 12px;
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
  overflow: hidden;
  transition: max-height .36s ease, opacity .32s ease, transform .32s ease;
}
.te2-item.open { transform: translateY(0); }
.te2-item.open .te2-detail {
  max-height: 320px;
  opacity: 1;
  transform: translateY(0);
}

/* card 样式 */
.te2-card {
  background: linear-gradient(180deg,#fff,#fbfbfb);
  border-radius:12px;
  padding:12px;
  box-shadow: 0 12px 30px rgba(3,10,30,0.06);
  border: 1px solid rgba(0,0,0,0.04);
}
.te2-card-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; gap:8px; }
.te2-card-head strong { font-size:15px; }
.te2-card-date { font-size:13px; color:${COLORS.charcoal}; opacity:0.6; }
.te2-card-body { font-size:14px; color:${COLORS.charcoal}; opacity:0.85; margin-bottom:8px; }

/* 动画 keyframes */
@keyframes appearUp {
  from { transform: translateY(28px) scale(.98); opacity:0; filter: blur(6px); }
  to   { transform: translateY(0) scale(1); opacity:1; filter: blur(0); }
}
@keyframes dashMove {
  from { background-position: 0 0; }
  to   { background-position: 24px 0; }
}

/* 响应式：小屏幕保持水平滚动，调整间距和尺寸 */
@media (max-width: 820px) {
  .te2-line { left: 24px; right: 24px; top: 86px; }
  .te2-progress-bar { left: 24px; right: 24px; top: 86px; }
  .te2-list { 
    padding: 15px 24px; 
    gap: 16px; 
    overflow-x: auto;
    flex-wrap: nowrap;
  }
  .te2-item { 
    flex: 0 0 100px; 
    min-width: 100px; 
    max-width: 100px; 
  }
  .te2-node { width: 80px; height: 80px; }
  .te2-day { font-size: 20px; }
  .te2-month { font-size: 10px; }
}

/* 无障碍：用户减动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .te2-line { animation: none; }
  .te2-item, .te2-node, .te2-detail { transition: none !important; animation: none !important; transform: none !important; opacity: 1 !important; }
}

/* 微调：让虚线视觉居中 */
@media (min-width: 821px) {
  .te2-line { top: calc(96px/2 + 86px - 48px); } /* 调整以确保与节点中心对齐 */
  .te2-progress-bar { top: calc(96px/2 + 86px - 48px); }
}
`}</style>
        </section>
    );
};

export default Timeline;
