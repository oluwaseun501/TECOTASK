import { useState } from "react";
import { Outlet } from "react-router-dom";

import ModeratorSidebar from "./ModeratorSidebar";
import ModeratorTopBar from "./ModeratorTopBar";

import "../../styles/ModeratorDashboard.css";

export default function ModeratorDashboard({
  basePath = "/moderator",
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);

    window.setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };

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
          refreshing={refreshing}
          onMenu={() => setMobileOpen(true)}
          onRefresh={handleRefresh}
        />

        <main className="moderator-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}