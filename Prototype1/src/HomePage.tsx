import { COLORS } from "./components/common";
import MainNav from "./components/MainNav";
import StyleInject from "./components/StyleInject";
import Cards from "./sections/home/Cards";
import Footer from "./sections/home/Footer";
import Hero from "./sections/home/Hero";
import Intro from "./sections/home/Intro";
import Timeline from "./sections/home/Timeline";

import MomentsMarquee from "./sections/home/MomentsMarquee";
import OutreachEvents from "./sections/home/OutreachEvents";
import RefiningEducation from "./sections/home/RefiningEducation";
import { HomeSectionsBundle } from "./sections/home/Sections";
import WhatIsItSection from "./sections/home/What_is_it";
export default function HomePage() {
  return (
    <div style={{ fontFamily: "Arial, Helvetica, sans-serif", color: COLORS.charcoal }}>
      <StyleInject />
      <MainNav />
      <Hero />
      <Intro />
      <WhatIsItSection/>
      <OutreachEvents />
      <Timeline />
      <RefiningEducation />
      <HomeSectionsBundle />
      <Cards />
      <MomentsMarquee />
      <Footer />
    </div>
  );
}