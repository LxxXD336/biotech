import React from "react";
import { Link } from "react-router-dom";
import { COLORS, Container, useReveal } from "../../components/common";
import { AnnualReport } from "./AnnualReportSection";
import PrizesSection from "./PrizesSection";
import TheBriefSection from "./TheBriefSection";

type SectionBlockProps = {
  id?: string;
  tag: string;
  title: string;
  body: React.ReactNode;
  tone?: "white" | "light" | "brief";
  imageSrc?: string;
  imageAlt?: string;
  imageSide?: "left" | "right";
  ctaText?: string;
  ctaHref?: string;
  internal?: boolean;
};

export const SectionBlock = ({ id, tag, title, body, tone = "white", imageSrc, imageAlt, imageSide = "right", ctaText, ctaHref, internal, }: SectionBlockProps) => {
  const refContent = useReveal();
  const refImage = useReveal();

  const bg = tone === "brief" ? "linear-gradient(135deg, #C6EFBF 0%, #BDE8B6 100%)" : tone === "light" ? COLORS.lightBG : COLORS.white;

  const content = (
    <div ref={refContent} className="reveal">
      <span className="pill">{tag}</span>
      <h2 className="section-title">{title}</h2>
      <div className="section-body">{body}</div>
      {ctaText && ctaHref ? (
        internal ? (
          <Link to={ctaHref} className="btn-outline mt-4 inline-block">{ctaText}</Link>
        ) : (
          <a href={ctaHref} className="btn-outline mt-4 inline-block">{ctaText}</a>
        )
      ) : null}
    </div>
  );

  const image = imageSrc ? (
    <div ref={refImage} className="reveal">
      <div className="img-tilt">
        <img src={imageSrc} alt={imageAlt || ""} loading="lazy" className="w-full h-80 object-contain md:object-cover rounded-xl" />
      </div>
    </div>
  ) : null;

  return (
    <section id={id} style={{ background: bg }}>
      <Container className="py-16 md:py-20">
        <div className={`grid gap-10 md:grid-cols-2 items-start ${imageSide === "left" ? "md:[direction:rtl]" : ""}`}>
          <div className={`${imageSide === "left" ? "[direction:ltr]" : ""}`}>{content}</div>
          <div className={`${imageSide === "left" ? "[direction:ltr]" : ""}`}>{image}</div>
        </div>
      </Container>
    </section>
  );
};




export const SectionsStyle = () => (
  <style>{`
.pill { display:inline-block;padding:10px 16px;border-radius:999px;font-weight:700; color:#fff;background:${COLORS.green};letter-spacing:.5px; }
.section-title{ margin-top:22px;font-size:clamp(28px,5vw,64px);font-weight:900;line-height:1.05;letter-spacing:-0.5px; }
.section-body{ margin-top:18px;font-size:clamp(16px,1.6vw,22px);line-height:1.6; }
.btn-outline{ border:2px solid ${COLORS.charcoal};color:${COLORS.charcoal};padding:10px 16px;border-radius:14px; text-decoration:none;transition:transform .15s ease, background .15s ease, box-shadow .15s ease; }
.btn-outline:hover{ transform:translateY(-1px); background:rgba(0,0,0,.03); box-shadow:0 10px 20px rgba(0,0,0,.06); }
.img-tilt{ transition:transform .25s ease, box-shadow .25s ease; border-radius:16px; overflow:hidden; }
.img-tilt:hover{ transform:rotate(-1.2deg) translateY(-2px); box-shadow:0 16px 36px rgba(0,0,0,0.12); }
`}</style>
);

export const HomeSectionsBundle = () => (
  <>
    <SectionsStyle />

    <TheBriefSection />
    <PrizesSection />
    <AnnualReport year={2024} />
  </>
);