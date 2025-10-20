import { COLORS } from "./common";

export default function StyleInject() {
  return (
    <style>{`
/* ========= Responsive container ========= */
.btf-container{
  width:100%;
  margin-left:auto; margin-right:auto;
  padding-left:1.5rem; padding-right:1.5rem; /* px-6 */
  max-width: 720px;
}
@media (min-width: 768px){ .btf-container{ max-width: 900px; padding-left:2.5rem; padding-right:2.5rem; } }
@media (min-width: 1024px){ .btf-container{ max-width: 1100px; } }
@media (min-width: 1280px){ .btf-container{ max-width: 1280px; } }
@media (min-width: 1536px){ .btf-container{ max-width: 1440px; } }
@media (min-width: 1920px){ .btf-container{ max-width: 1600px; } }
@media (min-width: 2560px){ .btf-container{ max-width: 1800px; } }

/* Links underline animation */
.link-animated { position: relative; text-decoration: none; }
.link-animated::after {
  content: ""; position: absolute; left: 0; bottom: -4px; height: 2px; width: 0;
  background: ${COLORS.green}; transition: width .25s ease;
}
.link-animated:hover::after { width: 100%; }

/* --- Tabs (match section styling) --- */
.btf-tabs {
  position: relative;
  display: inline-grid;
  grid-auto-flow: column;
  gap: 6px;
  padding: 6px;
  border-radius: 14px;
  background: #F1F6F4;
  border: 1px solid #E2EEE8;
}
.tab-btn { position: relative; z-index: 1; appearance: none; border: 0; padding: 10px 14px; border-radius: 10px; font-weight: 700; letter-spacing: .2px; background: transparent; color: ${COLORS.charcoal}; cursor: pointer; transition: transform .12s ease; }
.tab-btn:hover { transform: translateY(-1px); }
.tab-btn.active { color: ${COLORS.white}; }
.tab-underline { position: absolute; top: 6px; left: 6px; width: calc(50% - 6px); height: calc(100% - 12px); border-radius: 10px; background: ${COLORS.green}; box-shadow: 0 10px 22px rgba(1,113,81,.25); transition: transform .2s ease; }

/* --- Animated tick list --- */
.tick-list { list-style: none; padding-left: 0; margin-top: 14px; display: grid; gap: 10px; }
.tick-list li { position: relative; padding-left: 28px; line-height: 1.6; will-change: transform, opacity; animation: slideIn .35s ease var(--d, 0s) both; }
.tick-list li::before { content: "✓"; position: absolute; left: 0; top: 0; font-weight: 900; color: ${COLORS.green}; }
.tick-list li:nth-child(1){ --d: .02s; }
.tick-list li:nth-child(2){ --d: .08s; }
.tick-list li:nth-child(3){ --d: .14s; }
@keyframes slideIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }

/* Hero headline type-in */
.hero-type { font-size: clamp(32px, 5vw, 56px); line-height: 1.05; letter-spacing: 0.4px; overflow: hidden; white-space: nowrap; border-right: 3px solid rgba(255,255,255,.8); animation: typing 2.2s steps(22, end), blink .9s step-end infinite alternate; max-width: 22ch; }
@keyframes typing { from { width: 0 } to { width: 22ch } }
@keyframes blink { 50% { border-color: transparent } }

/* Floating blobs */
.blob { position: absolute; border-radius: 9999px; filter: blur(20px); opacity: .45; }
.blob-a { width: 180px; height: 180px; background: ${COLORS.lime}; top: 12%; left: 10%; animation: float 9s ease-in-out infinite; }
.blob-b { width: 140px; height: 140px; background: ${COLORS.yellow}; bottom: 10%; right: 14%; animation: float 7.5s ease-in-out infinite reverse; }
.blob-c { width: 120px; height: 120px; background: #D6F0FF; bottom: 22%; left: 22%; animation: float 8.5s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }

/* Reveal on scroll */
.reveal { opacity: 0; transform: translateY(20px); transition: opacity .6s ease, transform .6s ease; }
.reveal-in { opacity: 1 !important; transform: translateY(0) !important; }

/* Soft cards and tilt interactions */
.card-soft { background: #fff; border: 1px solid #E8F1ED; border-radius: 16px; padding: 16px; box-shadow: 0 6px 24px rgba(0,0,0,0.05); }
.card-tilt { display: block; text-decoration: none; border-radius: 18px; padding: 20px; background: #fff; box-shadow: 0 10px 24px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.04); transform: perspective(600px) rotateX(0) rotateY(0) translateY(0); transition: transform .18s ease, box-shadow .18s ease; will-change: transform; }
.card-tilt:hover { transform: perspective(600px) rotateX(2deg) rotateY(-2deg) translateY(-2px); box-shadow: 0 16px 36px rgba(0,0,0,0.12), inset 0 0 0 1px rgba(0,0,0,0.05); }
.tilt { transition: transform .25s ease; }
.tilt:hover { transform: rotate(-1.2deg) translateY(-2px); }

/* Buttons */
.btn-primary { display: inline-block; padding: 10px 16px; border-radius: 14px; color: #fff; text-decoration: none; background: ${COLORS.green}; box-shadow: 0 10px 24px rgba(1,113,81,0.35); transition: transform .15s ease, box-shadow .15s ease; }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 14px 28px rgba(1,113,81,0.45); }
.btn-ghost { display: inline-block; padding: 10px 16px; border-radius: 14px; text-decoration: none; color: #fff; border: 2px solid rgba(255,255,255,.9); transition: background .15s ease, color .15s ease; }
.btn-ghost:hover { background: rgba(255,255,255,.15); }

/* Marquee ribbon */
.marquee { display: flex; gap: 28px; white-space: nowrap; will-change: transform; animation: marquee 18s linear infinite; }
.marquee-item { font-weight: 700; letter-spacing: .6px; padding: 10px 18px; border-radius: 999px; color: ${COLORS.navy}; background: #EAF7F1; border: 1px solid #DCEFE7; }
@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

/* ===== Animated Menu Overlay ===== */
.menuButton {
  position: fixed; top: 18px; right: 18px; z-index: 1105;
  width: 46px; height: 46px; border-radius: 9999px;
  color: ${COLORS.charcoal};
  background: rgba(255,255,255,.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(2,6,23,.08);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  padding: 0; box-sizing: border-box; line-height: 0;
  box-shadow: 0 10px 24px rgba(0,0,0,0.12);
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
}
.menuButton:hover { transform: translateY(-1px); background: rgba(255,255,255,.95); box-shadow: 0 14px 32px rgba(0,0,0,0.16); }
.menuButton:active { transform: translateY(0); box-shadow: 0 6px 16px rgba(0,0,0,0.10); }
.menuButton:focus-visible { outline: none; box-shadow: 0 0 0 4px rgba(16,185,129,0.22); }

/* Minimal menu (hamburger) icon */
.hicon { position: relative; width: 20px; height: 14px; display:block; }
.hicon .hbar {
  position: absolute; left: 50%; width: 20px; height: 2px;
  background: currentColor; border-radius: 2px; transform-origin: 50% 50%;
  transform: translateX(-50%);
  transition: transform .18s ease, opacity .18s ease, background .18s ease;
}
.hicon .h1 { top: 1px; }
.hicon .h2 { top: 6px; }
.hicon .h3 { top: 11px; }
.menuButton:hover .h1 { transform: translateX(-50%) translateY(-1px); }
.menuButton:hover .h3 { transform: translateX(-50%) translateY(1px); }

#menuList { position: absolute; top: 50%; left: 10%; transform: translateY(-50%); display: grid; gap: 18px; }
.menuText { line-height: 1; }
.menuLink { text-decoration: none; color: ${COLORS.charcoal}; }
.menuLink:hover { text-decoration: underline; }
.menuText .menuLink { font-weight: 900; font-size: clamp(36px, 6vw, 72px); letter-spacing: -0.5px; }
    `}</style>
  );
}
