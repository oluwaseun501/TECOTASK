import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  RefreshCw,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import "../../styles/AdminTopBar.css";

export default function AdminTopBar({
  basePath = "/admin",
  unreadCount = 0,
  refreshing = false,
  onMenu,
  onRefresh,
}) {
  const { pathname } = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  const pageTitle =
    normalizedPath === basePath
      ? "Platform overview"
      : normalizedPath.startsWith(`${basePath}/moderation`)
        ? "Moderation queue"
        : normalizedPath.startsWith(`${basePath}/notifications`)
          ? "Notifications"
          : "Platform overview";

  return (
    <header className="admin-topbar">
      <button
        type="button"
        className="admin-menu-button"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu size={19} />
      </button>

      <div className="admin-breadcrumb">
        <span className="admin-breadcrumb-root">TecoTask</span>
        <ChevronRight size={13} />
        <span>Admin workspace</span>
        <ChevronRight size={13} />
        <strong>{pageTitle}</strong>
      </div>

      <div className="admin-topbar-actions">
        <button
          type="button"
          className="admin-refresh-button"
          onClick={onRefresh}
        >
          <RefreshCw
            size={14}
            className={refreshing ? "admin-spin" : ""}
          />
          <span>{refreshing ? "Refreshing" : "Refresh"}</span>
        </button>

        <div className="admin-notification-wrapper">
          <button
            type="button"
            className={`admin-notification-button ${
              notificationsOpen
                ? "admin-notification-button--active"
                : ""
            }`}
            onClick={() => setNotificationsOpen((value) => !value)}
            aria-label="Open notifications"
          >
            <Bell size={17} />

            {unreadCount > 0 ? (
              <span className="admin-notification-dot" />
            ) : null}
          </button>

          {notificationsOpen ? (
            <div className="admin-notification-popover">
              <div className="admin-popover-heading">
                <strong>Notifications</strong>
                <span>{unreadCount} unread</span>
              </div>

              <div className="admin-popover-item">
                <span className="admin-popover-dot admin-popover-dot--red" />
                <div>
                  <strong>Risk flag needs review</strong>
                  <small>Campaign Tree airtime giveaway</small>
                </div>
                <time>12m</time>
              </div>

              <div className="admin-popover-item">
                <span className="admin-popover-dot admin-popover-dot--green" />
                <div>
                  <strong>Withdrawal cleared</strong>
                  <small>₦46,200 sent to Chinedu Okafor</small>
                </div>
                <time>34m</time>
              </div>

              <Link
                to={`${basePath}/notifications`}
                className="admin-popover-link"
                onClick={() => setNotificationsOpen(false)}
              >
                See all notifications
                <ChevronRight size={13} />
              </Link>
            </div>
          ) : null}
        </div>

        <span className="admin-topbar-divider" />

        <button
          type="button"
          className="admin-topbar-avatar"
          aria-label="Open account menu"
        >
          SB
          <ChevronDown size={12} />
        </button>
      </div>
    </header>
  );
}