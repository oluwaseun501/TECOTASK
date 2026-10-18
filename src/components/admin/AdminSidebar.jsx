import {
  ArrowDownToLine,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ReceiptText,
  Settings,
  ShieldAlert,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import "../../styles/AdminSidebar.css";

const cn = (...classes) => classes.filter(Boolean).join(" ");

function displayRole(role) {
  if (!role) return "Role unavailable";

  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getInitials(account) {
  const name = account?.fullName?.trim();

  if (name) {
    const parts = name.split(/\s+/);

    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
  }

  const emailName = account?.email?.split("@")[0];
  return emailName ? emailName.slice(0, 2).toUpperCase() : "?";
}

export default function AdminSidebar({
  basePath = "/admin",
  mobileOpen,
  onClose,
  account,
  accountLoading,
  accountError,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const closeSidebar = onClose || (() => {});

  const userItems = [
    {
      key: "users",
      label: "All users",
      icon: Users,
      to: `${basePath}/users`,
    },
  ];

  const operationItems = [
    {
      key: "campaigns",
      label: "Campaigns",
      icon: Megaphone,
      to: `${basePath}/campaigns`,
    },
    {
      key: "withdrawals",
      label: "Withdrawals",
      icon: ArrowDownToLine,
      to: `${basePath}/withdrawals`,
    },
    {
      key: "transactions",
      label: "All transactions",
      icon: ReceiptText,
      to: `${basePath}/transactions`,
    },
    {
      key: "moderation",
      label: "Moderation",
      icon: ShieldAlert,
      to: `${basePath}/moderation`,
    },
  ];

  const systemItems = [
    {
      key: "settings",
      label: "Settings",
      icon: Settings,
      to: `${basePath}/settings`,
    },
  ];

  const isActive = (item) => {
    if (item.query) {
      return (
        location.pathname === `${basePath}/users` &&
        location.search === `?role=${item.query}`
      );
    }

    if (item.key === "users") {
      return (
        location.pathname.startsWith(`${basePath}/users`) &&
        !location.search
      );
    }

    if (item.end) {
      return location.pathname === item.to;
    }

    return (
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`)
    );
  };

  const renderLink = (item) => {
    const Icon = item.icon;

    return (
      <Link
        key={item.key}
        to={item.to}
        onClick={closeSidebar}
        className={cn(
          "admin-nav-link",
          isActive(item) && "admin-nav-link--active",
        )}
      >
        <Icon size={15} strokeWidth={1.9} />
        <span>{item.label}</span>
      </Link>
    );
  };

  function handleLogout() {
    for (const storage of [window.sessionStorage, window.localStorage]) {
      storage.removeItem("tecotaskToken");
      storage.removeItem("tecotaskUser");
    }

    closeSidebar();
    navigate("/admin/accessmeadmin", { replace: true });
  }

  const profileName = accountLoading
    ? "Loading account..."
    : account?.fullName || account?.email || "Profile unavailable";

  const profileRole = accountError
    ? "Could not load profile"
    : accountLoading
      ? " "
      : displayRole(account?.role);

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="admin-sidebar-scrim"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          "admin-sidebar",
          mobileOpen && "admin-sidebar--open",
        )}
      >
        <div className="admin-sidebar-header">
        <Link
  to={basePath}
  className="admin-brand"
  onClick={closeSidebar}
>
  <img
    src="/teco_task-logo.png"
    alt="TecoTask"
    className="admin-brand-logo"
  />
</Link>

          <button
            type="button"
            className="admin-mobile-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <X size={17} />
          </button>
        </div>

        <div className="admin-workspace-label">ADMIN WORKSPACE</div>

        <nav className="admin-sidebar-nav">
          {renderLink({
            key: "overview",
            label: "Overview",
            icon: LayoutDashboard,
            to: basePath,
            end: true,
          })}

          <div className="admin-nav-section-label">USER MANAGEMENT</div>
          {userItems.map(renderLink)}

          <div className="admin-nav-section-label">OPERATIONS</div>
          {operationItems.map(renderLink)}

          <div className="admin-nav-section-label">SYSTEM</div>
          {systemItems.map(renderLink)}
        </nav>

        <div className="admin-sidebar-spacer" />

        <div className="admin-profile" title={account?.email || ""}>
          <span className="admin-avatar admin-avatar--dark">
            {accountLoading ? "…" : getInitials(account)}
          </span>

          <span className="admin-profile-details">
            <strong>{profileName}</strong>
            <small>{profileRole}</small>
          </span>
        </div>

        <button
          type="button"
          className="admin-logout"
          onClick={handleLogout}
        >
          <LogOut size={14} />
          <span>Log out</span>
        </button>
      </aside>
    </>
  );
}
