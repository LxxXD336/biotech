import { Container, COLORS } from "../../components/common";

export default function MomentsMarquee() {
  return (
    <div style={{ background: COLORS.white }}>
      <Container className="px-0 py-8 overflow-hidden">
        <div style={{ overflow: "hidden" }}>
        <div className="marquee">
          {["Inspiration", "Workshops", "Teamwork", "Innovation", "Mentors", "Showcase"].map((w, i) => (
            <span key={i} className="marquee-item">{w}</span>
          ))}
          {["Inspiration", "Workshops", "Teamwork", "Innovation", "Mentors", "Showcase"].map((w, i) => (
            <span key={`dup-${i}`} className="marquee-item">{w}</span>
          ))}
        </div>
        </div>
      </Container>
    </div>
  );
}

