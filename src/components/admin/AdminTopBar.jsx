import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { authApi } from "../../services/auth.js";
import "../../styles/AdminTopBar.css";

function getStoredValue(key) {
  if (typeof window === "undefined") return "";

  try {
    return (
      window.sessionStorage.getItem(key) ||
      window.localStorage.getItem(key) ||
      ""
    );
  } catch {
    return "";
  }
}

function getCachedUser() {
  try {
    const storedUser = getStoredValue("tecotaskUser");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AD"
  );
}

function clearStoredAuth() {
  if (typeof window === "undefined") return;

  for (const storageName of ["sessionStorage", "localStorage"]) {
    try {
      window[storageName].removeItem("tecotaskToken");
      window[storageName].removeItem("tecotaskUser");
    } catch {
      // Continue to login if browser storage is unavailable.
    }
  }
}

export default function AdminTopBar({
  basePath = "/admin",
  unreadCount = 0,
  refreshing = false,
  onMenu,
  onRefresh,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);

  const [user, setUser] = useState(getCachedUser);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const normalizedBasePath = basePath.replace(/\/$/, "") || "/admin";
  const normalizedPath = pathname.replace(/\/$/, "") || "/";

  const routeTitles = [
    ["/all-users", "All users"],
    ["/users", "All users"],
    ["/campaigns", "Campaigns"],
    ["/withdrawals", "Withdrawals"],
    ["/all-transactions", "All transactions"],
    ["/transactions", "All transactions"],
    ["/moderation", "Moderation queue"],
    ["/notifications", "Notifications"],
    ["/settings", "Settings"],
  ];

  const matchedRoute = routeTitles.find(([route]) => {
    const fullRoute = `${normalizedBasePath}${route}`;
    return (
      normalizedPath === fullRoute ||
      normalizedPath.startsWith(`${fullRoute}/`)
    );
  });

  const pageTitle =
    normalizedPath === normalizedBasePath
      ? "Platform overview"
      : matchedRoute?.[1] || "Admin workspace";

  useEffect(() => {
    let isActive = true;

    async function loadAccount() {
      const token = getStoredValue("tecotaskToken");
      if (!token) return;

      try {
        const result = await authApi.getCurrentUser(token);
        const currentUser = result.user;

        if (!isActive || !currentUser) return;

        setUser(currentUser);

        try {
          window.sessionStorage.setItem(
            "tecotaskUser",
            JSON.stringify(currentUser),
          );
        } catch {
          // Keep showing the account even if storage is unavailable.
        }
      } catch (error) {
        console.error("Could not load admin account:", error);
      }
    }

    void loadAccount();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    function closeAccountMenu(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeAccountMenu);
    return () => {
      document.removeEventListener("pointerdown", closeAccountMenu);
    };
  }, []);

  useEffect(() => {
    if (!accountOpen) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setAccountOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  function handleLogout() {
    clearStoredAuth();
    setAccountOpen(false);
    navigate("/login", { replace: true });
  }

  const fullName = user?.fullName || user?.name || "Admin account";
  const initials =
    user?.fullName || user?.name ? getInitials(fullName) : "AD";
  const email = user?.email || "";

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
          disabled={refreshing}
          aria-label={refreshing ? "Refreshing page data" : "Refresh page data"}
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
              notificationsOpen ? "admin-notification-button--active" : ""
            }`}
            onClick={() => {
              setNotificationsOpen((open) => !open);
              setAccountOpen(false);
            }}
            aria-label="Open notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell size={17} />
            {unreadCount > 0 ? (
              <span className="admin-notification-dot" />
            ) : null}
          </button>

          {notificationsOpen ? (
            <div
              className="admin-notification-popover"
              aria-label="Notifications"
            >
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
                to={`${normalizedBasePath}/notifications`}
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

        <div className="admin-profile-wrapper" ref={accountMenuRef}>
          <button
            type="button"
            className="admin-topbar-avatar"
            onClick={() => {
              setAccountOpen((open) => !open);
              setNotificationsOpen(false);
            }}
            aria-label={accountOpen ? "Close account menu" : "Open account menu"}
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            aria-controls="admin-account-menu"
          >
            <span className="admin-topbar-avatar__initials">{initials}</span>
            <ChevronDown size={13} />
          </button>

          {accountOpen ? (
            <div
              className="admin-account-menu"
              id="admin-account-menu"
              role="menu"
              aria-label="Admin account menu"
            >
              <div className="admin-account-menu__identity">
                <strong>{fullName}</strong>
                {email ? <span>{email}</span> : null}
              </div>

              <Link
                to={normalizedBasePath}
                role="menuitem"
                onClick={() => setAccountOpen(false)}
              >
                <LayoutDashboard size={15} />
                Admin overview
              </Link>

              <Link
                to={`${normalizedBasePath}/settings`}
                role="menuitem"
                onClick={() => setAccountOpen(false)}
              >
                <Settings size={15} />
                Settings
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
              >
                <LogOut size={15} />
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}