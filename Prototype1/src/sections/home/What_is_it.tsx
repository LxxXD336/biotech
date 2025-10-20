// src/sections/home/What_is_it.tsx
import { useEffect, useState } from "react";
import { WhatIsIt1 as mainPagePic2 } from "../../assets/images";
import { COLORS, PageSection, useReveal } from "../../components/common";

/* 数字缓动 */
const useCountUp = (to: number, ms = 900) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setVal(Math.round(p * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return val;
};

export default function WhatIsItSection() {
  const refLeft = useReveal();
  const refRight = useReveal();

  /*** Stepper ***/
  const steps = [
    {
      k: "Sign up",
      d: "Apply online. It only takes a few minutes. Create an account, pick interests, optionally invite 2–4 teammates, and submit consent if required.",
    },
    {
      k: "Match",
      d: "We match teams with mentors, set cadence and goals, and run a kick-off meeting so everyone is aligned from day one.",
    },
    {
      k: "Sprint",
      d: "8–12 weeks of guided work with weekly/bi-weekly check-ins. Plan experiments or prototypes, iterate with feedback, and prepare your demo.",
    },
    {
      k: "Showcase",
      d: "Present your solution to the community and judges. Share lessons learned and explore next-step opportunities.",
    },
  ] as const;
  const [step, setStep] = useState(0);

  /*** Checklist（持久化） ***/
  type ItemId = "consent" | "teammates" | "topic" | "timeline";
  const CHECK_KEY = "btf_ready_check_v1";
  const DEFAULT_CHECK: Record<ItemId, boolean> = {
    consent: false,
    teammates: false,
    topic: false,
    timeline: false,
  };
  const [check, setCheck] = useState<Record<ItemId, boolean>>(() => {
    try {
      const raw = localStorage.getItem(CHECK_KEY);
      return raw ? (JSON.parse(raw) as Record<ItemId, boolean>) : DEFAULT_CHECK;
    } catch {
      return DEFAULT_CHECK;
    }
  });
  const setItem = (k: ItemId, v: boolean) => {
    setCheck((prev) => {
      const next = { ...prev, [k]: v };
      localStorage.setItem(CHECK_KEY, JSON.stringify(next));
      return next;
    });
  };

  const progressPct = Math.round(
    (Object.values(check).filter(Boolean).length / Object.keys(check).length) * 100
  );

  return (
    <PageSection bg={COLORS.white}>
      {/* 顶部：左图右文 */}
      <div id="what" className="grid md:grid-cols-2 gap-12 items-center mb-10">
        <div ref={refLeft} className="reveal">
          <div
            className="rounded-2xl p-3"
            style={{ border: `4px solid ${COLORS.green}`, backgroundColor: COLORS.lightBG }}
          >
            <img
              src={mainPagePic2}
              alt="Students and mentors"
              className="w-full h-[420px] md:h-[480px] object-cover rounded-xl"
            />
          </div>
        </div>

        <div ref={refRight} className="reveal">
          <span className="pill">WHAT IS IT?</span>
          <h2 className="section-title mt-4">
            A HEAD START FOR THE BRIGHTEST YOUNG MINDS
          </h2>
          <div className="section-body">
            <p>
              BIOTech Futures is an innovation and mentorship program that empowers
              high school students to think creatively about science-inspired solutions
              across medicine, health, sustainable environment, emerging technologies,
              regulations and ethics.
            </p>
          </div>
        </div>
      </div>

      {/* 主体：两列网格；左侧 Stepper，右侧 Checklist */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧（占两列） */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stepper */}
          <div className="rounded-2xl border p-5 min-h-[360px] flex flex-col">
            <h4 className="text-xl font-bold mb-3">How it works</h4>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {steps.map((s, i) => (
                <button
                  key={s.k}
                  onClick={() => setStep(i)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    step === i ? "text-white" : "text-[#017151]"
                  }`}
                  style={{ backgroundColor: step === i ? "#017151" : "rgba(1,113,81,0.08)" }}
                  aria-current={step === i ? "step" : undefined}
                >
                  {i + 1}. {s.k}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-1 grow">
              <div>
                <p className="text-gray-800 leading-relaxed">{steps[step].d}</p>
                <div className="mt-3 text-sm text-gray-600">
                  <p className="mb-1">
                    Tips: keep a simple weekly log, align on a clear goal, and iterate fast with mentor feedback.
                  </p>
                  <p>You’ll receive templates and examples at each phase to save time.</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-full">
                  <div className="h-2 rounded-full mb-3" style={{ background: "rgba(1,113,81,0.12)" }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${((step + 1) / steps.length) * 100}%`,
                        background: "#017151",
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    {steps.map((s, i) => (
                      <span key={s.k} className={i === step ? "font-semibold text-[#017151]" : ""}>
                        {i + 1}. {s.k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧（占一列）：Checklist */}
        <div className="space-y-6">
          {/* Checklist */}
          <div className="rounded-2xl border p-5 bg-white">
            <h4 className="text-xl font-bold mb-3">Readiness checklist</h4>
            <div className="w-full h-2 rounded-full mb-4" style={{ background: "rgba(1,113,81,0.12)" }}>
              <div className="h-2 rounded-full" style={{ width: `${progressPct}%`, background: "#017151" }} />
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={check.consent}
                  onChange={(e) => setItem("consent", e.target.checked)}
                />
                <span>Parent/guardian consent acquired (if required)</span>
              </li>
              <li className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={check.teammates}
                  onChange={(e) => setItem("teammates", e.target.checked)}
                />
                <span>Have 2–4 teammates (optional — solo is fine)</span>
              </li>
              <li className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={check.topic}
                  onChange={(e) => setItem("topic", e.target.checked)}
                />
                <span>Shortlist a topic area</span>
              </li>
              <li className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={check.timeline}
                  onChange={(e) => setItem("timeline", e.target.checked)}
                />
                <span>Know your timeline (8–12 weeks with check-ins)</span>
              </li>
            </ul>

            <a
              href="#how-to-join"
              className="mt-4 inline-flex items-center px-4 py-2 rounded-lg font-semibold"
              style={{ backgroundColor: "#017151", color: "#fff" }}
            >
              Next step
            </a>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
