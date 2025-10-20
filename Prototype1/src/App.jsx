import { Navigate, Route, Routes } from "react-router-dom";
import AboutPage from "./AboutPage";
import PastWinners from "./components/PastWinners";
import Sponsor from "./components/Sponsor";
import ContactPage from "./ContactPage";
import FAQPage from "./FAQPage.tsx";
import OutreachPage from "./OutreachPage";
import GettingStart_Page from "./GettingStart_Page.tsx";
import HomePage from "./HomePage";
import QueenslandSatellite from "./QueenslandSatellite";
import VictoriaSatellite from "./VictoriaSatellite";
import ScrollToHash from "./components/ScrollToHash";
import Mentorship from "./Mentorship.tsx";
import News from "./news/news.jsx";
import GalleryPage from "./gallery/GalleryPage.jsx";
import SubpageAdminPanel from "./Outreach/SubpageAdminPanel";


export default function App() {
  return (

    <>
      <ScrollToHash />
      <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sponsors" element={<Sponsor />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/past-winners" element={<PastWinners />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/outreach" element={<OutreachPage />} />
          <Route path="/getting-started" element={<GettingStart_Page />} />
          <Route path="/faqs" element={<FAQPage />} />
          <Route path="/news" element={<News />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/QueenslandSatellite" element={<QueenslandSatellite />} />
          <Route path="/VictoriaSatellite" element={<VictoriaSatellite />} />
          <Route path="/admin/subpage" element={<SubpageAdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}