import {
  ArrowDownToLine,
  BookOpen,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Settings,
  X,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import "../../styles/ModeratorSidebar.css";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function getStoredUser() {
  if (typeof window === "undefined") return null;

  const savedUser =
    window.sessionStorage.getItem("tecotaskUser") ||
    window.localStorage.getItem("tecotaskUser");

  if (!savedUser) return null;

  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function getInitials(name = "") {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "MO"
  );
}

function formatRole(role = "") {
  return role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Moderator";
}

export default function ModeratorSidebar({
  basePath = "/moderator",
  mobileOpen,
  onClose,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const closeSidebar = onClose || (() => {});
  const user = getStoredUser();

  const profileName = user?.fullName || "Moderator account";
  const profileIdentity = user?.fullName || user?.email || "Moderator";
  const profileRole = formatRole(user?.role);

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

  function handleLogout() {
    for (const storage of [
      window.sessionStorage,
      window.localStorage,
    ]) {
      storage.removeItem("tecotaskToken");
      storage.removeItem("tecotaskUser");
    }

    closeSidebar();
    navigate("/login", { replace: true });
  }

  const renderLink = (item) => {
    const Icon = item.icon;
    const active = isActive(item);

    return (
      <Link
        key={item.key}
        to={item.to}
        onClick={closeSidebar}
        aria-current={active ? "page" : undefined}
        className={cn(
          "moderator-nav-link",
          active && "moderator-nav-link--active",
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
          mobileOpen && "moderator-sidebar--open",
        )}
      >
        <div className="moderator-sidebar-header">
         <Link
  to={basePath}
  className="moderator-brand"
  onClick={closeSidebar}
>
  <img
    src="/teco_task-logo.png"
    alt="TecoTask"
    className="moderator-brand-logo"
  />
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
          <div className="moderator-nav-section-label">WORKSPACE</div>
          {mainItems.map(renderLink)}

          <div className="moderator-nav-section-label">SUPPORT</div>
          {supportItems.map(renderLink)}
        </nav>

        <div className="moderator-sidebar-spacer" />

        <div className="moderator-profile">
          <span className="moderator-avatar">
            {getInitials(profileIdentity)}
          </span>

          <span className="moderator-profile-details">
            <strong>{profileName}</strong>
            <small>{profileRole}</small>
          </span>
        </div>

        <button
          type="button"
          className="moderator-logout"
          onClick={handleLogout}
        >
          <LogOut size={14} />
          <span>Log out</span>
        </button>
      </aside>
    </>
  );
}