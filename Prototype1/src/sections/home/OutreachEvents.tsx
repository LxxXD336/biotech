﻿// ==========================
// OutreachEvents.tsx (updated buttons -> #017151)
// ==========================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { COLORS, useReveal, Container } from "../../components/common";
import { picChoice2 as mainPagePic2 } from "../../assets/images";

/* ---------- UI atoms (保持站内风格) ---------- */
const BTN = {
  softSm:
    "btn btn-sm bg-[#017151] border-[#017151] text-white hover:brightness-110 active:brightness-90",
};
// OutreachEvents.tsx
const ChipButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  className = "",
  ...props
}) => (
  <button
    {...props}
    className={[
      "inline-flex items-center gap-2 h-9 px-5 rounded-full border transition",
      // 改成实心品牌绿 + 白字
      "bg-[#017151] text-white border-[#017151] hover:brightness-110 active:brightness-90",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#017151]/60",
      className,
    ].join(" ")}
  >
    <span className="font-medium">{children}</span>
  </button>
);

const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ open, onClose, title, children }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg border p-6">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button onClick={onClose} aria-label="Close" className={BTN.softSm}>×</button>
          </div>
          <div className="mt-3">{children}</div>
          <div className="mt-4 flex justify-end">
            <button onClick={onClose} className={BTN.softSm}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

type Audience = "Participants" | "Mentors" | "Supervisors";
const AudienceSwitch: React.FC<{ value: Audience; onChange: (a: Audience) => void }> = ({ value, onChange }) => {
  const options: Audience[] = ["Participants", "Mentors", "Supervisors"];
  return (
    <div role="tablist" aria-label="Audience" className="inline-flex rounded-full border p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt}
          role="tab"
          aria-selected={value === opt}
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 rounded-full text-sm transition ${
            value === opt ? "bg-[#017151] text-white" : "hover:bg-black/5"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
};

const NextEventProgress: React.FC<{ targetISO: string; windowDays?: number }> = ({ targetISO, windowDays = 30 }) => {
  const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(t); }, []);
  const msWindow = windowDays * 24 * 3600 * 1000;
  const remaining = Math.max(0, target - now);
  const percent = 100 - Math.round(Math.min(1, remaining / msWindow) * 100);
  const d = Math.floor(remaining / (24 * 3600 * 1000));
  const h = Math.floor((remaining % (24 * 3600 * 1000)) / (3600 * 1000));
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="opacity-70">Next major event</span>
        <span className="opacity-70">{remaining <= 0 ? "Happening now" : `${d}d ${h}h to go`}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
        <div className="h-full bg-neutral-900 transition-all" style={{ width: `${percent}%` }} role="progressbar" aria-label="Progress toward next event" />
      </div>
    </div>
  );
};

const TiltImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-py * 6).toFixed(2);
    const ry = (px * 8).toFixed(2);
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
  };
  const onLeave = () => { const el = ref.current; if (el) el.style.transform = ""; };
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="rounded-xl shadow-md overflow-hidden transition-transform will-change-transform" aria-label={alt}>
      <img src={src} alt={alt} loading="lazy" className="w-full h-auto object-cover" />
    </div>
  );
};

/* ---------- Latest Event（大号品牌绿色按钮） ---------- */
type LatestEvent = {
  imageSrc: string;
  title?: string;
  date?: string;
  location?: string;
  blurb?: string;
  ctaText?: string;
  ctaHref?: string;
  onCta?: () => void;
};

const LatestEventShowcase: React.FC<{ event: LatestEvent }> = ({ event }) => (
  <div className="mt-14 md:mt-16">
    <div className="relative rounded-3xl border shadow-sm bg-white overflow-hidden">
      {/* 柔和品牌光晕 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(1,113,81,0.35), rgba(1,113,81,0) 70%)",
        }}
      />
      <div className="grid md:grid-cols-2 gap-0">
        {/* 左图 */}
        <div className="p-4 md:p-6">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
            <img
              src={event.imageSrc}
              alt={event.title || "Latest event"}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 右文案 */}
        <div className="p-6 md:p-10 flex flex-col justify-center">
          <span className="pill w-fit">LATEST</span>
          <h3 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight text-emerald-900">
            Our Latest Event
          </h3>

          {event.title && (
            <p className="mt-4 text-xl md:text-2xl font-semibold text-neutral-900">
              {event.title}
            </p>
          )}

          {(event.date || event.location) && (
            <p className="mt-1 text-base md:text-lg text-neutral-600">
              {event.date || ""}
              {event.date && event.location ? " • " : ""}
              {event.location || ""}
            </p>
          )}

          {event.blurb && (
            <p className="mt-5 text-base md:text-lg leading-relaxed text-neutral-800">
              {event.blurb}
            </p>
          )}

          {/* ✅ 大号品牌绿色按钮 */}
          {(event.ctaHref || event.onCta) && (
            <div className="mt-8">
              {event.ctaHref ? (
                <a
                  href={event.ctaHref}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#017151] border-[#017151] text-white text-lg md:text-xl font-medium shadow-sm hover:brightness-110 active:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#017151]/60 w-fit"
                  aria-label="Learn more about this outreach event"
                >
                  {event.ctaText ?? "Learn more"}
                  <span aria-hidden>→</span>
                </a>
              ) : (
                <button
                  onClick={event.onCta}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#017151] border-[#017151] text-white text-lg md:text-xl font-medium shadow-sm hover:brightness-110 active:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#017151]/60 w-fit"
                >
                  {event.ctaText ?? "Learn more"}
                  <span aria-hidden>→</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

/* 默认示例数据：已把 CTA 指向 /outreach */
const DEFAULT_LATEST: LatestEvent = {
  imageSrc: mainPagePic2,
  title: "Open Lab Guided Tour",
  date: "Oct 15, 2025",
  location: "Darlington campus",
  blurb: "See real research instruments and talk to scientists.",
  ctaText: "Learn more",
  ctaHref: "/outreach", // ← 跳转到 outreach page
};

/* ---------- Register / Volunteer 表单 ---------- */
const RegisterForm: React.FC<{ onDone: () => void; onCancel: () => void }> = ({ onDone, onCancel }) => {
  const [ok, setOk] = useState(false);
  const submit: React.FormEventHandler = (e) => { e.preventDefault(); setOk(true); setTimeout(onDone, 1200); };
  if (ok) return <p className="text-[#017151]">Thanks! We’ll be in touch.</p>;
  return (
    <form onSubmit={submit} className="grid gap-3">
      <input className="input input-bordered" placeholder="Full name" required />
      <input className="input input-bordered" type="email" placeholder="you@example.com" required />
      <select className="select select-bordered"><option>Participants</option><option>Mentors</option><option>Supervisors</option></select>
      <div className="mt-1 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn bg-[#017151] border-[#017151] text-white hover:brightness-110 active:brightness-90">Cancel</button>
        <button type="submit" className="btn bg-[#017151] border-[#017151] text-white hover:brightness-110 active:brightness-90">Submit</button>
      </div>
    </form>
  );
};

const VolunteerForm: React.FC<{ onDone: () => void; onCancel: () => void }> = ({ onDone, onCancel }) => {
  const [ok, setOk] = useState(false);
  const submit: React.FormEventHandler = (e) => { e.preventDefault(); setOk(true); setTimeout(onDone, 1200); };
  if (ok) return <p className="text-[#017151]">Thank you for volunteering!</p>;
  return (
    <form onSubmit={submit} className="grid gap-3">
      <input className="input input-bordered" placeholder="Full name" required />
      <input className="input input-bordered" type="email" placeholder="you@example.com" required />
      <div className="mt-1 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn bg-[#017151] border-[#017151] text-white hover:brightness-110 active:brightness-90">Cancel</button>
        <button type="submit" className="btn bg-[#017151] border-[#017151] text-white hover:brightness-110 active:brightness-90">Submit</button>
      </div>
    </form>
  );
};

/* ---------- 主 Section ---------- */
export const OutreachEventsSection: React.FC = () => {
  const refText = useReveal();
  const refImage = useReveal();

  const [audience, setAudience] = useState<Audience>("Participants");
  const [openRegister, setOpenRegister] = useState(false);
  const [openVolunteer, setOpenVolunteer] = useState(false);

  return (
    <section id="outreach" style={{ backgroundColor: COLORS?.white ?? "#fff" }} className="py-16 md:py-24">
      <Container>
        {/* 顶部：站内既有风格 */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* 左：文字 */}
          <div ref={refText} className="reveal">
            <span className="pill">OUTREACH</span>
            <h2 className="section-title mt-4">OUR OUTREACH AND EVENTS</h2>

            <div className="mt-3">
              <AudienceSwitch value={audience} onChange={setAudience} />
              <p className="mt-3 text-sm md:text-base opacity-90">
                {audience === "Participants" &&
                  "Discover hands-on activities, competitions, and guided lab visits designed to spark curiosity and build confidence."}
                {audience === "Mentors" &&
                  "Support participants with feedback, host office hours, and share real-world insights from your field."}
                {audience === "Supervisors" &&
                  "Oversee cohorts, coordinate schedules, and monitor progress across teams and schools."}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <ChipButton onClick={() => setOpenRegister(true)}>Register interest</ChipButton>
              <ChipButton onClick={() => setOpenVolunteer(true)}>Volunteer</ChipButton>
            </div>

            <NextEventProgress targetISO="2025-10-15T09:00:00+10:00" />
          </div>

          {/* 右：配图（轻浮雕） */}
          <div ref={refImage} className="reveal relative">
            <TiltImage src={mainPagePic2} alt="Outreach" />
          </div>
        </div>

        {/* 美化后的 Latest Event */}
        <LatestEventShowcase event={DEFAULT_LATEST} />
      </Container>

      {/* 弹窗 */}
      <Modal open={openRegister} onClose={() => setOpenRegister(false)} title="Register interest">
        <RegisterForm onDone={() => setOpenRegister(false)} onCancel={() => setOpenRegister(false)} />
      </Modal>
      <Modal open={openVolunteer} onClose={() => setOpenVolunteer(false)} title="Volunteer with us">
        <VolunteerForm onDone={() => setOpenVolunteer(false)} onCancel={() => setOpenVolunteer(false)} />
      </Modal>
    </section>
  );
};

export default OutreachEventsSection;