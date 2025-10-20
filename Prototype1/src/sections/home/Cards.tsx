import { Link } from "react-router-dom";
import { COLORS, PageSection, useReveal } from "../../components/common";

export default function Cards() {
  const ref = useReveal();
  const items = [
    { title: "How to enter", text: "Steps for students and schools to participate in upcoming challenges.", href: "/getting-started", tone: COLORS.lime, type: "internal" },
    { title: "Symposium", text: "Explore highlights and resources from our annual gathering.", href: "/past-winners", tone: "#D6F0FF", type: "internal" },
    { title: "Work with us", text: "Partner with BIOTech Futures to mentor and support young innovators.", href: "/mentorship", tone: COLORS.yellow, type: "internal" },
    { title: "Gallery", text: "Browse photos from events, workshops, and projects.", href: "/gallery.html", tone: COLORS.lightBG, type: "external" },
  ] as const;

  return (
    <PageSection bg={COLORS.lightBG} id="get-involved">
      <div ref={ref} className="reveal">
        <h2 className="text-2xl md:text-3xl font-bold mb-7" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>
          Get involved
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((c) =>
            c.type === "internal" ? (
              <Link key={c.title} to={c.href} className="card-tilt" style={{ backgroundColor: c.tone }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>{c.title}</h3>
                <p className="text-[15px]" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>{c.text}</p>
              </Link>
            ) : (
              <a key={c.title} href={c.href} className="card-tilt" style={{ backgroundColor: c.tone }}>
                <h3 className="text-lg font-semibold mb-2" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>{c.title}</h3>
                <p className="text-[15px]" style={{ color: COLORS.charcoal, fontFamily: "Arial, Helvetica, sans-serif" }}>{c.text}</p>
              </a>
            )
          )}
        </div>
      </div>
    </PageSection>
  );
}

