// ==========================
// RefiningEducation.tsx (updated buttons -> #017151)
// ==========================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { COLORS, useReveal, Container } from "../../components/common";
import { picChoice3 as mainPagePic2 } from "../../assets/images";

/* ---------- Button tokens with brand #017151 ---------- */
const BTN2 = {
  /** 主按钮：实心品牌绿 + 白字 */
  primary:
    "btn bg-[#017151] border-[#017151] text-white hover:brightness-110 active:brightness-90",

  /** 次按钮：描边款，文本为品牌色 */
  subtle:
    "btn bg-white border-[#017151] text-[#017151] hover:bg-[#017151]/10 active:bg-[#017151]/15",

  /** 小按钮：用于 Reset / Close / 次级动作 */
  softSm:
    "btn btn-sm bg-[#017151] border-[#017151] text-white hover:brightness-110 active:brightness-90",
  iconClose:
    "btn btn-sm bg-white border-[#017151] text-[#017151] hover:bg-[#017151]/10 active:bg-[#017151]/15",
};

/* ---------- Tiny confetti (pure CSS/JS) ---------- */
const ConfettiBurst: React.FC<{ show: boolean; onDone?: () => void }> = ({ show, onDone }) => {
  const [pieces, setPieces] = useState<
    { id: number; left: string; delay: string; duration: string; rotate: string }[]
  >([]);

  useEffect(() => {
    if (!show) return;
    const arr = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.2}s`,
      duration: `${0.9 + Math.random() * 0.7}s`,
      rotate: `${Math.random() * 360}deg`,
    }));
    setPieces(arr);
    const t = setTimeout(() => onDone?.(), 1500);
    return () => clearTimeout(t);
  }, [show, onDone]);

  if (!show) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 h-2 w-2 rounded-sm bg-emerald-400"
          style={{
            left: p.left,
            transform: `translateY(-10px) rotate(${p.rotate})`,
            animation: `fall ${p.duration} ${p.delay} ease-out forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          to { transform: translateY(120%) rotate(0deg); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

/* ---------- Chips that open local info panels ---------- */
type InfoKey = "docs" | "tutorials" | "faq";
/* ---------- Chip buttons (brand) ---------- */
const ChipButton2: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <button
    {...props}
    className={[
      "inline-flex items-center h-9 px-4 rounded-full text-sm font-medium border",
      "bg-[#017151] border-[#017151] text-white hover:brightness-110 active:brightness-90",
      "transition-transform hover:scale-[1.02] active:scale-[0.98]",
      className,
    ].join(" ")}
  >
    <span className="font-medium">{children}</span>
  </button>
);

/* ---------- Role-based feature tabs (segmented) ---------- */
type RoleKey = "participants" | "mentors" | "supervisors";
const roleFeatures: Record<RoleKey, string[]> = {
  participants: [
    "Track upcoming events and deadlines",
    "Submit project updates in one place",
    "Access learning modules & resources",
    "Chat with mentors and peers",
  ],
  mentors: [
    "Monitor mentee progress at a glance",
    "Give feedback on submissions",
    "Schedule office hours & sessions",
    "Share curated reading lists",
  ],
  supervisors: [
    "Oversee multiple teams and cohorts",
    "Export reports & attendance",
    "Manage permissions and roles",
    "Integrate calendars & announcements",
  ],
};

const FeatureTabs: React.FC = () => {
  const [active, setActive] = useState<RoleKey>("participants");
  const items = roleFeatures[active];
  const keys: RoleKey[] = ["participants", "mentors", "supervisors"];
  const idx = keys.indexOf(active);

  return (
    <div className="rounded-xl border p-4 md:p-6">
      <div className="relative inline-grid grid-cols-3 rounded-full border p-1 gap-1">
        <span
          className="absolute h-[30px] rounded-full bg-emerald-500/10 transition-all"
          style={{ width: "33.3333%", left: `calc(${idx} * 33.3333%)`, top: 4 }}
          aria-hidden
        />
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`relative z-10 px-3 py-1.5 rounded-full text-sm transition ${active === k ? "text-emerald-900 font-semibold" : "hover:bg-black/5"}`}
          >
            {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-2">
        {items.map((t, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ---------- FAQ accordion ---------- */
type FAQItem = { q: string; a: string };
const FAQAccordion: React.FC<{ items: FAQItem[] }> = ({ items }) => {
  const [open, setOpen] = useState<number | null>(0);
  const toggle = (i: number) => setOpen((p) => (p === i ? null : i));
  return (
    <div className="rounded-xl border divide-y">
      {items.map((it, i) => (
        <div key={i}>
          <button
            className="w-full text-left px-4 py-3 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#017151]/60"
            aria-expanded={open === i}
            onClick={() => toggle(i)}
          >
            <span className="font-medium">{it.q}</span>
            <span className={`transition-transform ${open === i ? "rotate-90" : ""}`} aria-hidden>›</span>
          </button>
          <div className={`px-4 overflow-hidden transition-[max-height] duration-300 ${open === i ? "max-h-48 pb-4" : "max-h-0"}`}>
            <p className="text-sm opacity-80">{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ---------- Checklist with progress + confetti ---------- */


/* ---------- Modal ---------- */
const Modal2: React.FC<{ open: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border p-6 relative">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} className={BTN2.iconClose} aria-label="Close">×</button>
          </div>
          <div className="mt-3">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ✔ Drop-in 替换 AccessRequestInline（按钮采用品牌色）
const AccessRequestInline: React.FC<{ className?: string; onSuccess?: () => void }> = ({
  className,
  onSuccess,
}) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleKey>("participants");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const valid = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const onSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      onSuccess?.();
      setEmail("");
      setTimeout(() => setSent(false), 2600);
    }, 600);
  };

  return (
    <form
      onSubmit={onSubmit}
      className={[
        "rounded-2xl border p-4 md:p-5",
        "bg-gradient-to-r from-emerald-50 to-emerald-50/40",
        "focus-within:border-[#017151] focus-within:shadow-[0_0_0_4px_rgba(1,113,81,0.12)]",
        className || "",
      ].join(" ")}
    >
      <label className="block text-sm font-medium mb-3 text-emerald-900">
        Request early access
      </label>

      {/* 统一用 Grid：1fr / 12rem / auto，所有控件 h-11，完美对齐 */}
      <div className="grid gap-2 md:grid-cols-[1fr,12rem,auto] items-center">
        {/* Email */}
        <div className="relative">
          {/* 左侧 mail 图标 */}
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60"
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M4 7l8 6 8-6" stroke="currentColor" strokeWidth="1.6" fill="none" />
            </svg>
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            aria-invalid={email.length > 0 && !valid}
            className={[
              "input input-bordered w-full h-11 pl-10",
              "bg-white/95 placeholder:text-emerald-900/40",
              "focus:outline-none focus:ring-2 focus:ring-[#017151]/60 focus:border-[#017151]",
              "rounded-lg",
            ].join(" ")}
          />
          {/* 右侧状态标记 */}
          {email.length > 0 && (
            <span
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                valid ? "text-[#017151]" : "text-red-600"
              }`}
              aria-hidden
            >
              {valid ? "✓" : "!"}
            </span>
          )}
        </div>

        {/* Role */}
        <div className="relative">
          {/* 左侧 user 图标 */}
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60 z-10"
            aria-hidden
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
              <path d="M5 19c1.5-3 5-4 7-4s5.5 1 7 4" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </span>
          <select
            className={[
              "select select-bordered w-full h-11 pl-9 pr-9", // 左留空间给图标，右留空间给下拉箭头
              "bg-white/95 focus:border-[#017151] focus:ring-2 focus:ring-[#017151]/60",
              "rounded-lg",
            ].join(" ")}
            value={role}
            onChange={(e) => setRole(e.target.value as RoleKey)}
          >
            <option value="participants">Participant</option>
            <option value="mentors">Mentor</option>
            <option value="supervisors">Supervisor</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!valid || sending}
          className={[
            BTN2.primary,
            "h-11 px-5 rounded-lg md:w-auto",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {sending ? <span className="loading loading-spinner loading-xs" /> : "Request"}
        </button>
      </div>

      {/* helper text */}
      <div className="mt-2 text-xs min-h-[1.1rem]" aria-live="polite">
        {!email ? (
          <span className="opacity-60">No spam. Unsubscribe anytime.</span>
        ) : valid ? (
          <span className="text-[#017151]">Looks good — press Request.</span>
        ) : (
          <span className="text-red-600">Please enter a valid email address.</span>
        )}
      </div>

      {/* success banner */}
      {sent && (
        <p className="mt-2 text-[#017151] text-sm flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" />
          </svg>
          Thanks! We'll email you access details shortly.
        </p>
      )}
    </form>
  );
};

/* ---------- Mini "Portal Demo" (in-section, no navigation) ---------- */
type DemoTab = "events" | "chat" | "resources";
const PortalDemo: React.FC = () => {
  const [tab, setTab] = useState<DemoTab>("events");
  const [xp, setXp] = useState(0);
  const [burst, setBurst] = useState(false);

  // events
  const [events, setEvents] = useState<string[]>(["Kickoff webinar", "Mentor office hour"]);
  const [newEvt, setNewEvt] = useState("");

  // chat
  const [chat, setChat] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: "Welcome! Ask anything here 👋" },
  ]);
  const [msg, setMsg] = useState("");

  // resources
  const [res, setRes] = useState<Record<string, boolean>>({ "Onboarding guide": false, "Sample dataset": false, "Code templates": false });

  const gainXP = (n: number) => {
    setXp((p) => {
      const v = Math.min(100, p + n);
      if (p < 100 && v === 100) {
        setBurst(true);
        setTimeout(() => setBurst(false), 1600);
      }
      return v;
    });
  };

  const addEvent = () => {
    if (!newEvt.trim()) return;
    setEvents((p) => [newEvt.trim(), ...p]);
    setNewEvt("");
    gainXP(12);
  };
  const sendMsg = () => {
    if (!msg.trim()) return;
    setChat((p) => [...p, { me: true, text: msg.trim() }]);
    setMsg("");
    gainXP(8);
  };
  const toggleRes = (k: string) => {
    setRes((p) => {
      const next = { ...p, [k]: !p[k] };
      gainXP(6);
      return next;
    });
  };

  return (
    <div className="relative rounded-xl border p-4 md:p-6 overflow-hidden">
      <ConfettiBurst show={burst} onDone={() => setBurst(false)} />
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-full border p-1 gap-1">
          {(["events", "chat", "resources"] as DemoTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${tab === t ? "bg-[#017151] text-white" : "hover:bg-black/5"}`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* XP bar */}
        <div className="min-w-[160px]">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="opacity-70">XP</span>
            <span className="opacity-70">{xp}/100 {xp === 100 ? "🏆" : ""}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all" style={{ width: `${xp}%` }} />
          </div>
        </div>
      </div>

      {/* content */}
      <div className="mt-4">
        {tab === "events" && (
          <div className="grid gap-3">
            <div className="flex gap-2">
              <input className="input input-bordered flex-1" placeholder="Add an event..." value={newEvt} onChange={(e) => setNewEvt(e.target.value)} />
              <button className={BTN2.softSm} onClick={addEvent}>Add</button>
            </div>
            <ul className="grid gap-2">
              {events.map((e, i) => (
                <li key={i} className="px-3 py-2 rounded-lg border flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden /> {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {tab === "chat" && (
          <div className="grid gap-3">
            <div className="border rounded-lg p-3 h-40 overflow-auto bg-emerald-50/30">
              {chat.map((c, i) => (
                <div key={i} className={`max-w-[80%] mb-2 ${c.me ? "ml-auto text-right" : ""}`}>
                  <div className={`inline-block px-3 py-2 rounded-2xl ${c.me ? "bg-emerald-500 text-white" : "bg-white border"}`}>{c.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input input-bordered flex-1" placeholder="Say hi…" value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e)=> e.key==="Enter" && sendMsg()} />
              <button className={BTN2.softSm} onClick={sendMsg}>Send</button>
            </div>
          </div>
        )}

        {tab === "resources" && (
          <ul className="grid gap-2">
            {Object.keys(res).map((k) => (
              <li key={k} className="flex items-center gap-3 border rounded-lg px-3 py-2">
                <input type="checkbox" className="checkbox checkbox-sm" checked={res[k]} onChange={() => toggleRes(k)} />
                <span className="text-sm">{k}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* ---------- Main Section (all interactions stay in-section) ---------- */
export const RefiningEducationSection: React.FC = () => {
  const refText = useReveal();
  const refImage = useReveal();

  // local panels
  const [info, setInfo] = useState<InfoKey | null>(null);
  const [tourOpen, setTourOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  // FAQ
  const faqs: FAQItem[] = [
    { q: "How do I get access to the portal?", a: "Request early access using the form below. We’ll verify your role and send login details." },
    { q: "Can teachers manage multiple classes?", a: "Yes. Supervisors and teachers can create cohorts, assign mentors, and track attendance." },
    { q: "Is there a sandbox for demos?", a: "We provide a demo space with sample data so you can explore features safely." },
  ];


  return (
    <section id="education" style={{ backgroundColor: COLORS?.white ?? "#fff" }} className="py-16 md:py-24">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image column */}
          <div ref={refImage} className="reveal relative order-1 md:order-none">
            <img src={mainPagePic2} alt="Platform" loading="lazy" className="w-full h-auto rounded-xl shadow-md object-cover transition-transform hover:scale-[1.02]" />
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm border rounded-full px-3 py-1 text-xs shadow">All systems operational</div>
          </div>

          {/* Text column */}
          <div ref={refText} className="reveal">
            <span className="pill">REFINING EDUCATION</span>
            <h2 className="section-title mt-4">A PLATFORM THAT SUPPORTS OUR COMMUNITY</h2>
            <div className="section-body">
              <p>Our upgraded portal helps participants, mentors, and supervisors track events, collaborate, and learn — all in one place.</p>
            </div>

            {/* Quick “chips” → open info panels in-place */}
            <div className="mt-4 flex flex-wrap gap-2">
              <ChipButton2 onClick={() => setInfo("docs")}>Docs</ChipButton2>
              <ChipButton2 onClick={() => setInfo("tutorials")}>Tutorials</ChipButton2>
              <ChipButton2 onClick={() => setInfo("faq")}>FAQ</ChipButton2>
            </div>

            {/* Primary CTAs (no navigation) */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className={BTN2.primary} onClick={() => setShowDemo((v) => !v)}>
                {showDemo ? "Hide portal demo" : "Open portal demo"}
              </button>
              <button onClick={() => setTourOpen(true)} className={BTN2.subtle}>Take a quick tour</button>
            </div>

          </div>
        </div>



        {/* Portal demo appears inline below */}
        {showDemo && (
          <div className="mt-10 md:mt-14">
            <PortalDemo />
          </div>
        )}
      </Container>

      {/* Info Panels via Modal */}
      <Modal2 open={!!info} onClose={() => setInfo(null)} title={
        info === "docs" ? "Docs" : info === "tutorials" ? "Tutorials" : "FAQ"
      }>
        {info === "docs" && (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Getting started</li>
            <li>Roles & permissions</li>
            <li>Data & privacy</li>
            <li>Accessibility guidelines</li>
          </ul>
        )}
        {info === "tutorials" && (
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Create your account and profile.</li>
            <li>Join a cohort using an invite code.</li>
            <li>Submit the first checkpoint task.</li>
          </ol>
        )}
        {info === "faq" && (
          <div className="text-sm">
            <p className="mb-2">Common questions:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>How to reset password?</li>
              <li>How to invite a mentor?</li>
              <li>Where do I see deadlines?</li>
            </ul>
          </div>
        )}
      </Modal2>

      {/* Tour modal (still local) */}
      <Modal2 open={tourOpen} onClose={() => setTourOpen(false)} title="Quick tour">
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Open the portal demo below.</li>
          <li>Add an event and send a message.</li>
          <li>Tick off resources and watch your XP grow.</li>
          <li>Finish the checklist to trigger a celebration.</li>
        </ol>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setTourOpen(false)} className={BTN2.softSm}>Close</button>
        </div>
      </Modal2>
    </section>
  );
};

export default RefiningEducationSection;
