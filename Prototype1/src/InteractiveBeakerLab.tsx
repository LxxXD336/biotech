import React, { useEffect, useMemo, useState } from "react";

export const InteractiveBeakerHero: React.FC = () => {
  // simple “chemistry” state
  const [water, setWater] = useState(0);       // 0..5
  const [nutri, setNutri] = useState(0);       // 0..5
  const [light, setLight] = useState(false);
  const [heat, setHeat] = useState(false);
  const [shake, setShake] = useState(false);
  const [done, setDone] = useState(false);

  const progress = useMemo(() => {
    let p = water * 10 + nutri * 12;
    if (light) p += 18;
    if (heat) p += 8;
    if (shake) p += 6;
    return Math.min(100, p);
  }, [water, nutri, light, heat, shake]);

  const hue = 160 + nutri * 6 - water * 2;
  const sat = 65 + Math.min(20, water * 4);
  const liquid = `hsl(${hue}, ${sat}%, 50%)`;
  const bubbles = Math.min(10, 2 + water + nutri + (heat ? 3 : 0));

  useEffect(() => { if (progress >= 95 && !done) setDone(true); }, [progress, done]);

  return (
    <div className="flex items-start gap-6">
      <div className="relative">
        <svg
          viewBox="0 0 320 200" width={320} height={200}
          className={`rounded-xl overflow-visible ${shake ? "animate-[wiggle_450ms_ease]" : ""}`}
        >
          {/* sun */}
          <g transform="translate(240,36)">
            <circle r="12" fill={light ? "#fde047" : "#fef08a"} className={light ? "animate-pulse" : ""} />
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={i} x1="0" y1="-18" x2="0" y2="-26" stroke="#fde047" strokeWidth="2"
                    transform={`rotate(${i * 36})`} opacity={light ? 1 : .55}/>
            ))}
            {light && <circle r="28" fill="none" stroke="#fde047" strokeOpacity=".2" className="animate-[spin_8s_linear_infinite]" />}
          </g>

          {/* beaker glass */}
          <g transform="translate(40,10)">
            <path d="M30 0 h60 v14 l20 70 a28 28 0 0 1 -28 36 h-44 a28 28 0 0 1 -28 -36 l20 -70 z"
                  fill="url(#gGlass)" stroke="#1f2937" strokeWidth="2" />

            {/* liquid */}
            <clipPath id="clip">
              <path d="M30 0 h60 v14 l20 70 a28 28 0 0 1 -28 36 h-44 a28 28 0 0 1 -28 -36 l20 -70 z" />
            </clipPath>
            <g clipPath="url(#clip)">
              <path d={`M14 120 h112 v20 H14 Z`} fill={liquid} opacity=".9" />
              <path d={`M14 ${120} C 40 ${116 - water}, 100 ${124 + (nutri ? 1 : 0)}, 126 ${120} L 126 130 L 14 130 Z`}
                    fill={liquid}/>
              {Array.from({ length: bubbles }).map((_, i) => (
                <circle key={i} cx={30 + Math.random() * 80} cy={110 + Math.random() * 16}
                        r={1.8 + Math.random() * 2.4} fill="#dcfce7"
                        style={{ animation: `bubble ${1.8 + Math.random() * 1.2}s ease-in-out ${i * 90}ms infinite` }}/>
              ))}
            </g>

            {/* stem & leaves */}
            <g transform="translate(92,40)" stroke="#065f46" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M0 80 C 0 60, -8 50, -6 28" className="animate-[draw_900ms_ease-out_forwards]" />
              <path d="M-14 48 C -28 36, -26 26, -6 34" fill="hsl(160,70%,45%)" />
              {progress > 40 && <path d="M-6 36 C 8 28, 16 30, 2 44" fill="hsl(160,70%,45%)" />}
              {progress > 70 && <path d="M-10 24 C -24 16, -26 8, -8 16" fill="hsl(160,70%,45%)" />}
              {progress > 92 && (
                <g transform="translate(0,14)">
                  <circle r="6" fill="#fcd34d" />
                  {Array.from({ length: 8 }).map((_, i) => (
                    <line key={i} x1="0" y1="-9" x2="0" y2="-14"
                          stroke="#fbbf24" strokeWidth="2" transform={`rotate(${i * 45})`} />
                  ))}
                </g>
              )}
            </g>

            {/* heat flame + steam */}
            {heat && (
              <>
                <path d="M45 152 C 52 142, 64 142, 70 156 C 74 164, 64 170, 58 164 C 52 158, 52 152, 58 150"
                      fill="#fb923c" opacity=".9" />
                {Array.from({ length: 2 }).map((_, i) => (
                  <path key={i} d={`M80 ${150 + i * 6} c 4 -10, 12 -10, 16 0`}
                        stroke="#e5e7eb" strokeWidth="2" opacity=".5"
                        style={{ animation: `steam 2.4s ease-in ${i * 400}ms infinite` }} />
                ))}
              </>
            )}
          </g>

          <defs>
            <linearGradient id="gGlass" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e5e7eb" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>

          <style>{`
            @keyframes bubble { 0% { transform: translateY(0); opacity: .9 } 100% { transform: translateY(-28px); opacity: 0 } }
            @keyframes steam  { 0% { opacity:.0; transform: translateY(0) } 40%{ opacity:.6 } 100% { opacity:0; transform: translateY(-20px) } }
            @keyframes draw   { from { stroke-dasharray: 0 200; } to { stroke-dasharray: 200 0; } }
            @keyframes wiggle { 0% { transform: rotate(0deg) } 25%{ transform: rotate(-2.2deg) } 50%{ transform: rotate(2.2deg) } 100%{ transform: rotate(0deg) } }
            @keyframes spin   { to { transform: rotate(360deg) } }
          `}</style>
        </svg>

        {done && (
          <div className="absolute -top-3 left-0 right-0 pointer-events-none text-center animate-bounce text-lg">✨ Bloom!</div>
        )}
      </div>

      {/* control panel */}
      <div className="rounded-xl border p-4 bg-white/90 w-[260px]">
        <div className="text-sm font-semibold">Mini lab — make it grow</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="btn btn-xs bg-emerald-50 hover:bg-emerald-100" onClick={() => setWater((v) => Math.min(5, v + 1))}>+ Water 💧</button>
          <button className="btn btn-xs bg-emerald-50 hover:bg-emerald-100" onClick={() => setNutri((v) => Math.min(5, v + 1))}>+ Nutrients 🧪</button>
          <button className={`btn btn-xs ${light ? "bg-yellow-400 text-black" : "bg-neutral-200"}`} onClick={() => setLight((v) => !v)}>{light ? "Light on ☀️" : "Light off"}</button>
          <button className={`btn btn-xs ${heat ? "bg-orange-400 text-white" : "bg-neutral-200"}`} onClick={() => setHeat((v) => !v)}>{heat ? "Heating 🔥" : "Heat off"}</button>
          <button className="btn btn-xs col-span-2 bg-emerald-100 hover:bg-emerald-200" onClick={() => { setShake(true); setTimeout(() => setShake(false), 450); }}>Shake beaker 🌀</button>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span>Growth</span><span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-200 overflow-hidden">
            <div className="h-full bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <button className="btn btn-ghost btn-xs" onClick={() => { setWater(0); setNutri(0); setLight(false); setHeat(false); setDone(false); }}>Reset</button>
          <span className="text-[11px] opacity-70">Tip: water + nutrients + light → bloom</span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveBeakerHero;