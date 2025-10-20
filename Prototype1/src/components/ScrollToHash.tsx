import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // Always close over the latest hash
    const hash = location.hash?.replace(/^#/, "");
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        // slight delay to allow layout after route changes
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }
    } else {
      // No hash: scroll to top on route change
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, location.hash]);

  return null;
}

