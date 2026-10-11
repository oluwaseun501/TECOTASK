import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import ModeratorSidebar from "./ModeratorSidebar";
import ModeratorTopBar from "./ModeratorTopBar";

import "../../styles/ModeratorDashboard.css";

export default function ModeratorDashboard({
  basePath = "/moderator",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [pathname]);

  return (
    <div className="moderator-shell">
      <ModeratorSidebar
        basePath={basePath}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="moderator-main">
        <ModeratorTopBar
          basePath={basePath}
          onMenu={() => setMobileOpen(true)}
        />

        <main className="moderator-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}