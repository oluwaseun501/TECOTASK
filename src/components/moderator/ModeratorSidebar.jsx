import {
  ArrowDownToLine,
  BookOpen,
  CircleHelp,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import "../../styles/ModeratorSidebar.css";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function ModeratorSidebar({
  basePath = "/moderator",
  mobileOpen,
  onClose,
}) {
  const location = useLocation();
  const closeSidebar = onClose || (() => {});

  const isActive = (item) => {
    if (item.end) {
      return location.pathname === item.to;
    }

    return (
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
    );
  };

  const mainItems = [
    {
      key: "overview",
      label: "Overview",
      icon: LayoutDashboard,
      to: basePath,
      end: true,
    },
    {
      key: "review-queue",
      label: "Review queue",
      icon: ClipboardCheck,
      to: `${basePath}/reviews`,
    },
    {
      key: "withdrawals",
      label: "Withdrawals",
      icon: ArrowDownToLine,
      to: `${basePath}/withdrawals`,
    },
  ];

  const supportItems = [
    {
      key: "instructions",
      label: "Instructions",
      icon: BookOpen,
      to: `${basePath}/instructions`,
    },
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      to: `${basePath}/settings`,
    },
  ];

  const renderLink = (item) => {
    const Icon = item.icon;
    const active = isActive(item);

    return (
      <Link
        key={item.key}
        to={item.to}
        onClick={closeSidebar}
        className={cn(
          "moderator-nav-link",
          active && "moderator-nav-link--active"
        )}
      >
        <Icon size={15} strokeWidth={1.9} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="moderator-sidebar-scrim"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          "moderator-sidebar",
          mobileOpen && "moderator-sidebar--open"
        )}
      >
        <div className="moderator-sidebar-header">
          <Link
            to={basePath}
            className="moderator-brand"
            onClick={closeSidebar}
          >
            <span className="moderator-brand-mark">T</span>

            <span className="moderator-brand-name">
              Teco<em>Task</em>
            </span>
          </Link>

          <button
            type="button"
            className="moderator-mobile-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        <div className="moderator-workspace-label">
          MODERATOR WORKSPACE
        </div>

        <nav className="moderator-sidebar-nav">
          <div className="moderator-nav-section-label">
            WORKSPACE
          </div>

          {mainItems.map(renderLink)}

          <div className="moderator-nav-section-label">
            SUPPORT
          </div>

          {supportItems.map(renderLink)}
        </nav>

        <div className="moderator-sidebar-spacer" />

        <button
          type="button"
          className="moderator-sidebar-help"
          onClick={() =>
            window.alert("Help center will be available soon.")
          }
        >
          <CircleHelp size={15} />
          <span>Help center</span>
        </button>

        <div className="moderator-profile">
          <span className="moderator-avatar">MO</span>

          <span className="moderator-profile-details">
            <strong>Moderator account</strong>
            <small>Moderator</small>
          </span>
        </div>

        <button
          type="button"
          className="moderator-logout"
          onClick={() =>
            window.alert("Logout will be connected later.")
          }
        >
          <LogOut size={14} />
          <span>Log out</span>
        </button>
      </aside>
    </>
  );
}