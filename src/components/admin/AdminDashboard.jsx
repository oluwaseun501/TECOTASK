import {
  ChevronRight,
  Menu,
  Search,
} from "lucide-react";
import {
  Outlet,
  useLocation,
} from "react-router-dom";
import { useState } from "react";

import AdminSidebar from "./AdminSidebar";
import "../../styles/AdminDashboard.css";

function getPageTitle(pathname, search) {
  if (pathname === "/admin") {
    return "Overview";
  }

  if (pathname.startsWith("/admin/users")) {
    if (search.includes("role=earner")) {
      return "Earners";
    }

    if (search.includes("role=advertiser")) {
      return "Advertisers";
    }

    if (search.includes("role=moderator")) {
      return "Moderators";
    }

    if (pathname !== "/admin/users") {
      return "User details";
    }

    return "All users";
  }

  if (pathname.startsWith("/admin/campaign-progress")) {
    return "Campaign progress";
  }

  if (pathname.startsWith("/admin/transactions")) {
    return "All transactions";
  }

  if (pathname.startsWith("/admin/moderation")) {
    return "Moderation";
  }

  if (pathname.startsWith("/admin/settings")) {
    return "Settings";
  }

  return "Admin workspace";
}

export default function AdminDashboard({
  basePath = "/admin",
}) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = getPageTitle(
    location.pathname,
    location.search
  );

  return (
    <div className="admin-shell">
      <AdminSidebar
        basePath={basePath}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-mobile-menu"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={19} />
          </button>

          <div className="admin-breadcrumbs">
            <span>Admin workspace</span>
            <ChevronRight size={14} />
            <strong>{pageTitle}</strong>
          </div>

          <div className="admin-topbar-actions">
            
            <div className="admin-topbar-status">
              <span />
              Live
            </div>

            <div className="admin-topbar-avatar">SB</div>
          </div>
        </header>

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}