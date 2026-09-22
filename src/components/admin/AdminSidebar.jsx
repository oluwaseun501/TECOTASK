import {
  ArrowDownToLine,
  BarChart3,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ReceiptText,
  Settings,
  ShieldAlert,
  UserRoundCheck,
  Users,
  X,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import "../../styles/AdminSidebar.css";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export default function AdminSidebar({
  basePath = "/admin",
  mobileOpen,
  onClose,
}) {
  const location = useLocation();

  const closeSidebar = onClose || (() => {});

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
const userItems = [
  {
    key: "users",
    label: "All users",
    icon: Users,
    to: `${basePath}/users`,
  },
//   {
//     key: "earners",
//     label: "Earners",
//     icon: UserRoundCheck,
//     to: `${basePath}/earners`,
//   },
//   {
//     key: "advertisers",
//     label: "Advertisers",
//     icon: Megaphone,
//     to: `${basePath}/advertisers`,
//   },
//   {
//     key: "moderators",
//     label: "Moderators",
//     icon: ShieldAlert,
//     to: `${basePath}/moderators`,
//   },
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

  const renderLink = (item) => {
    const Icon = item.icon;
    const active = isActive(item);

    return (
      <Link
        key={item.key}
        to={item.to}
        onClick={closeSidebar}
        className={cn(
          "admin-nav-link",
          active && "admin-nav-link--active"
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
          className="admin-sidebar-scrim"
          onClick={closeSidebar}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          "admin-sidebar",
          mobileOpen && "admin-sidebar--open"
        )}
      >
        <div className="admin-sidebar-header">
          <Link
            to={basePath}
            className="admin-brand"
            onClick={closeSidebar}
          >
            <span className="admin-brand-mark">T</span>

            <span className="admin-brand-name">
              Teco<em>Task</em>
            </span>
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

        <button
          type="button"
          className="admin-sidebar-help"
          onClick={() =>
            window.alert("Help center will be available soon.")
          }
        >
          <CircleHelp size={15} />
          <span>Help center</span>
        </button>

        <div className="admin-profile">
          <span className="admin-avatar admin-avatar--dark">SB</span>

          <span className="admin-profile-details">
            <strong>Segun Bakare</strong>
            <small>Admin</small>
          </span>
        </div>

        <button
          type="button"
          className="admin-logout"
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