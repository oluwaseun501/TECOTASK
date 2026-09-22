import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  RefreshCw,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import "../../styles/ModeratorTopBar.css";

export default function ModeratorTopBar({
  basePath = "/moderator",
  unreadCount = 2,
  refreshing = false,
  onMenu,
  onRefresh,
}) {
  const { pathname } = useLocation();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  const pageTitle =
    normalizedPath === basePath
      ? "Overview"
      : normalizedPath.startsWith(`${basePath}/reviews`)
        ? "Review queue"
        : normalizedPath.startsWith(`${basePath}/withdrawals`)
          ? "Withdrawals"
          : normalizedPath.startsWith(`${basePath}/instructions`)
            ? "Instructions"
            : normalizedPath.startsWith(`${basePath}/settings`)
              ? "Settings"
              : "Moderator workspace";

  return (
    <header className="moderator-topbar">
      <button
        type="button"
        className="moderator-menu-button"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu size={19} />
      </button>

      <div className="moderator-breadcrumb">
        <span className="moderator-breadcrumb-root">
          TecoTask
        </span>

        <ChevronRight size={13} />

        <span>Moderator workspace</span>

        <ChevronRight size={13} />

        <strong>{pageTitle}</strong>
      </div>

      <div className="moderator-topbar-actions">
        <button
          type="button"
          className="moderator-refresh-button"
          onClick={onRefresh}
        >
          <RefreshCw
            size={14}
            className={refreshing ? "moderator-spin" : ""}
          />

          <span>
            {refreshing ? "Refreshing" : "Refresh"}
          </span>
        </button>

        <div className="moderator-notification-wrapper">
          <button
            type="button"
            className={`moderator-notification-button ${
              notificationsOpen
                ? "moderator-notification-button--active"
                : ""
            }`}
            onClick={() =>
              setNotificationsOpen((value) => !value)
            }
            aria-label="Open notifications"
          >
            <Bell size={17} />

            {unreadCount > 0 ? (
              <span className="moderator-notification-dot" />
            ) : null}
          </button>

          {notificationsOpen ? (
            <div className="moderator-notification-popover">
              <div className="moderator-popover-heading">
                <strong>Notifications</strong>
                <span>{unreadCount} unread</span>
              </div>

              <div className="moderator-popover-item">
                <span className="moderator-popover-dot moderator-popover-dot--red" />

                <div>
                  <strong>New task awaiting review</strong>
                  <small>Product review campaign</small>
                </div>

                <time>8m</time>
              </div>

              <div className="moderator-popover-item">
                <span className="moderator-popover-dot moderator-popover-dot--green" />

                <div>
                  <strong>Review target completed</strong>
                  <small>You reached today&apos;s review target</small>
                </div>

                <time>26m</time>
              </div>

              <Link
                to={`${basePath}/reviews`}
                className="moderator-popover-link"
                onClick={() => setNotificationsOpen(false)}
              >
                Open review queue
                <ChevronRight size={13} />
              </Link>
            </div>
          ) : null}
        </div>

        <span className="moderator-topbar-divider" />

        <button
          type="button"
          className="moderator-topbar-avatar"
          aria-label="Open account menu"
          onClick={() =>
            window.alert("Profile settings will be added next.")
          }
        >
          MO
          <ChevronDown size={12} />
        </button>
      </div>
    </header>
  );
}