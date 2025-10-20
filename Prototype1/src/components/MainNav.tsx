import { useState } from "react";
import { Link } from "react-router-dom";
import { COLORS, Container } from "./common";
// @ts-ignore - JS component
import MenuAnimation from "../MenuAnimation.jsx";
// ✅ 注入全局样式（确保 portal 里的菜单也拿到 hover 等样式）
import StyleInject from "./StyleInject";

export default function MainNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav
      className="w-full border-b backdrop-blur-sm sticky top-0 z-30"
      style={{ borderColor: "#E6F3EE", backgroundColor: "#ffffff" }}
    >
      {/* 全站样式注入 */}
      <StyleInject />

      <Container className="py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" style={{ textDecoration: "none" }} aria-label="Go to homepage">
          <div
            className="rounded-full w-9 h-9 flex items-center justify-center ring-2 ring-[#E6F3EE]"
            style={{ backgroundColor: COLORS.green }}
            aria-hidden
          >
            <span className="text-white text-sm" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
              B
            </span>
          </div>
          <span
            className="text-lg font-semibold"
            style={{ color: COLORS.green, fontFamily: "Arial, Helvetica, sans-serif" }}
          >
            BIOTech Futures
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="px-3 py-2 rounded-xl text-sm font-semibold transition"
            style={{ color: COLORS.green, border: "1px solid #E6F3EE", backgroundColor: COLORS.white }}
            aria-label="Contact us"
          >
            Contact
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-95 transition"
            style={{ backgroundColor: COLORS.blue, boxShadow: "0 6px 16px rgba(57,107,123,0.25)" }}
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </Container>

      <MenuAnimation
        isOpen={open}
        onClose={() => setOpen(false)}
        items={[
          { label: "About", to: "/about" },
          {
            label: "Join",
            children: [
              { label: "Getting started", to: "/getting-started" },
              { label: "FAQs", to: "/faqs" },
            ],
          },
          {
            label: "Collaborate",
            children: [
              { label: "Mentorship", to: "/mentorship" },
              { label: "Sponsorship", to: "/sponsors" },
              { label: "Outreach", to: "/outreach" },
            ],
          },
          {
            label: "Satellite",
            children: [
              { label: "Queensland", to: "/QueenslandSatellite" },
              { label: "Victoria", to: "/VictoriaSatellite" },
            ],
          },
          {
            label: "Explore",
            children: [
              { label: "Past Winners", to: "/past-winners" },
              { label: "Events gallery", to: "/gallery" },
              { label: "News", to: "/news" },
            ],
          },
        ]}
      />
    </nav>
  );
}
