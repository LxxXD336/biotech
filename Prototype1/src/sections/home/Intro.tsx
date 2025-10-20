import { useEffect, useState } from "react";
import { introlImage1, introlImage2, introlImage3 } from "../../assets/images";
import { COLORS, PageSection, useReveal } from "../../components/common";

type TabKey = "goals" | "values";

type ImageItem = {
  src: string;
  alt: string;
  caption?: string;
};

export default function Intro() {
  const refLeft = useReveal();
  const refRight = useReveal();
  const [tab, setTab] = useState<TabKey>("goals");

  // 轮播图片
  const IMAGES: ImageItem[] = [
    {
      src: introlImage1,
      alt: "Student using VR headset",
      caption: "Exploring biotech solutions with cutting-edge VR technology.",
    },
    {
      src: introlImage2,
      alt: "Women in Engineering group",
      caption: "Mentors and students connecting at the Women in Engineering booth.",
    },
    {
      src: introlImage3,
      alt: "Students in creative costumes",
      caption: "Students enjoying a fun innovation activity with creative hats.",
    },
  ];

  // 轮播逻辑
  const [idx, setIdx] = useState(0);
  const totalSlides = IMAGES.length;
  const go = (n: number) =>
    setIdx((prev) => (prev + n + totalSlides) % totalSlides);
  const goTo = (n: number) =>
    setIdx(((n % totalSlides) + totalSlides) % totalSlides);

  useEffect(() => {
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [totalSlides]);

  return (
    <PageSection bg={COLORS.white}>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* ===== 左列：标题、正文、Tabs、引语、CTA ===== */}
        <div ref={refLeft} className="reveal">
          <span className="pill">FOUNDATION</span>
          <h2 className="section-title mt-4">THE START OF BIOTech Futures</h2>

          <div className="section-body">
            <p className="mb-3">
              <em style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                Founded by Prof. Hala Zreiqat AM
              </em>
            </p>
            <p>
              BIOTech Futures was founded by Prof. Hala Zreiqat AM to connect leading
              researchers with high-school students and spark a passion for science,
              creativity, and real-world problem-solving. Since its launch, the initiative
              has grown into a global community where students explore biotechnology through
              mentorship, challenges, and collaboration.
            </p>
          </div>

          <div className="btf-tabs mt-6" role="tablist" aria-label="Goals and Values">
            <button
              role="tab"
              aria-selected={tab === "goals"}
              className={`tab-btn ${tab === "goals" ? "active" : ""}`}
              onClick={() => setTab("goals")}
            >
              Our goals
            </button>
            <button
              role="tab"
              aria-selected={tab === "values"}
              className={`tab-btn ${tab === "values" ? "active" : ""}`}
              onClick={() => setTab("values")}
            >
              Our values
            </button>
            <span
              className="tab-underline"
              style={{
                transform:
                  tab === "goals" ? "translateX(0)" : "translateX(100%)",
              }}
              aria-hidden
            />
          </div>

          <div className="tab-panel reveal-in" role="tabpanel">
            {tab === "goals" ? (
              <ul className="tick-list">
                <li>Build meaningful bridges between research and students</li>
                <li>Encourage curiosity, creativity, and real-world impact</li>
                <li>Grow a diverse and supportive community of future leaders</li>
              </ul>
            ) : (
              <ul className="tick-list">
                <li>Integrity and openness</li>
                <li>Collaboration across disciplines</li>
                <li>Equity, diversity, and inclusion</li>
              </ul>
            )}
          </div>

          {/* Milestones 已移除 */}

          <figure
            className="mt-6 rounded-xl p-4"
            style={{
              border: `2px solid ${COLORS.green}`,
              backgroundColor: "#F6FBF9",
            }}
          >
            <blockquote className="text-base leading-relaxed">
              “When we trust young minds with real problems—and real mentors—we don’t just teach
              science; we cultivate purpose.”
            </blockquote>
            <figcaption className="mt-2 text-sm text-gray-600">
              — Prof. Hala Zreiqat AM, Founder
            </figcaption>
          </figure>

          <div className="mt-6">
            <a href="#how-to-join" className="btn-primary">
              How to join
            </a>
          </div>
        </div>

        {/* ===== 右列：仅保留轮播 ===== */}
        <div ref={refRight} className="reveal flex flex-col h-full">
          <div
            className="rounded-2xl p-3"
            style={{
              border: `4px solid ${COLORS.green}`,
              backgroundColor: COLORS.lightBG,
            }}
          >
            <div className="relative">
              <img
                src={IMAGES[idx].src}
                alt={IMAGES[idx].alt}
                className="w-full h-[500px] object-cover rounded-xl"
              />

              {/* 左右切换按钮 */}
              <button
                aria-label="Previous slide"
                onClick={() => go(-1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full px-3 py-2 shadow"
              >
                ‹
              </button>
              <button
                aria-label="Next slide"
                onClick={() => go(1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full px-3 py-2 shadow"
              >
                ›
              </button>

              {/* 圆点指示器 */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {IMAGES.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to slide ${i + 1}`}
                    onClick={() => goTo(i)}
                    className={`h-2.5 w-2.5 rounded-full ${
                      i === idx
                        ? "bg-white"
                        : "bg-white/60 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 图片说明 */}
            {IMAGES[idx].caption && (
              <div className="px-2 pt-3 pb-1">
                <p className="text-sm text-gray-700">{IMAGES[idx].caption}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageSection>
  );
}
