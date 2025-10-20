import React from "react";
import { COLORS } from "./components/common";
import MainNav from "./components/MainNav";
import StyleInject from "./components/StyleInject";
import Cards from "./sections/home/Cards";
import Footer from "./sections/home/Footer";
import Timeline from "./sections/VictoriaSatellite/Timeline";
import Hero from "./sections/VictoriaSatellite/Hero";

import About from "./sections/VictoriaSatellite/About";
import Intro from "./sections/VictoriaSatellite/Intro";
import ProjectList from "./sections/VictoriaSatellite/ProjectList";
import Contact from "./sections/VictoriaSatellite/Contact";

import MomentsMarquee from "./sections/home/MomentsMarquee";
import SatelliteAdminPanel from "./components/SatelliteAdminPanel";

// Mentorship-style background component
function GlobalBackground({ scoped = false }: { scoped?: boolean }) {
    const base = scoped ? "bgfx-scope" : "bgfx";
    return (
        <>
            <style>{`
        .bgfx{position:fixed; inset:0; z-index:0; pointer-events:none}
        .bgfx-scope{position:absolute; inset:0; z-index:0; pointer-events:none}
        .bgfx-base{ background: ${COLORS.lightBG}; }
        /* Aurora: more pronounced, two layers drifting */
        .bgfx-aurora{ filter: blur(70px); opacity:.85; }
        .bgfx-aurora.bgfx-aurora-b{ opacity:.55; }
        .bgfx-aurora-a{
          animation: driftA 26s ease-in-out infinite alternate;
          background:
            radial-gradient(38% 46% at 12% 20%, rgba(76,175,140,.35), transparent 62%),
            radial-gradient(36% 42% at 85% 18%, rgba(26,115,232,.22), transparent 64%);
        }
        .bgfx-aurora-b{
          animation: driftB 34s ease-in-out infinite alternate;
          background:
            radial-gradient(40% 52% at 78% 84%, rgba(255,181,67,.28), transparent 66%),
            radial-gradient(26% 30% at 18% 86%, rgba(13,140,116,.22), transparent 60%);
        }
        @keyframes driftA{ 0%{ transform: translate3d(-4%, -2%, 0) scale(1.02) } 50%{ transform: translate3d(4%, 1%, 0) scale(1.06) } 100%{ transform: translate3d(-2%, 3%, 0) scale(1.03) } }
        @keyframes driftB{ 0%{ transform: translate3d(2%, 3%, 0) scale(1.03) } 50%{ transform: translate3d(-3%, -2%, 0) scale(1.06) } 100%{ transform: translate3d(3%, -1%, 0) scale(1.02) } }
        /* Subtle grid to avoid overpowering the aurora */
        .bgfx-grid{
          background-image:
            linear-gradient(to right, rgba(0,0,0,.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,.03) 1px, transparent 1px);
          background-size:24px 24px; opacity:.12;
        }
        /* Slightly stronger noise to mitigate banding */
        .bgfx-noise{opacity:.06; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='2' stitchTiles='stitch' type='fractalNoise'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E");}
      `}</style>
            <div className={`${base} bgfx-base`} />
            
            <div className={`${base} bgfx-aurora bgfx-aurora-a`} />
            <div className={`${base} bgfx-aurora bgfx-aurora-b`} />
            <div className={`${base} bgfx-grid`} />
            <div className={`${base} bgfx-noise`} />
        </>
    );
}


export default function VictoriaSatellite() {
    return (
        <main style={{ background: "transparent", color: COLORS.charcoal, position: "relative" }}>
            <GlobalBackground />
            <div style={{ position: "relative", zIndex: 1 }}>
                <StyleInject />
                <MainNav />
                <Hero />
                <Intro />
                <Timeline />
                <About />
                <ProjectList />
                <Contact/>
                <Cards />
                <MomentsMarquee />
                <Footer />
            </div>
            <SatelliteAdminPanel satelliteType="victoria" />
        </main>
    );
}