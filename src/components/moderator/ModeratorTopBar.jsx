import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { authApi } from "../../services/auth.js";
import "../../styles/ModeratorTopBar.css";

function getStoredValue(key) {
  if (typeof window === "undefined") return "";

  return (
    window.sessionStorage.getItem(key) ||
    window.localStorage.getItem(key) ||
    ""
  );
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
      .toUpperCase() || "MO"
  );
}

function clearStoredAuth() {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    storage.removeItem("tecotaskToken");
    storage.removeItem("tecotaskUser");
  }
}

export default function ModeratorTopBar({
  basePath = "/moderator",
  onMenu,
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(getCachedUser);
  const [accountOpen, setAccountOpen] = useState(false);

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
          // Continue showing the account even if browser storage is unavailable.
        }
      } catch (error) {
        console.error("Could not load moderator account:", error);
      }
    }

    loadAccount();

    return () => {
      isActive = false;
    };
  }, []);

  function handleLogout() {
    clearStoredAuth();
    navigate("/login", { replace: true });
  }

  const fullName = user?.fullName || "Moderator account";
  const email = user?.email || "";

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
        <span className="moderator-breadcrumb-root">TecoTask</span>
        <ChevronRight size={13} />
        <span>Moderator workspace</span>
        <ChevronRight size={13} />
        <strong>{pageTitle}</strong>
      </div>

      <div className="moderator-topbar-actions">
        <div className="moderator-profile-wrapper">
          <button
            type="button"
            className="moderator-topbar-avatar"
            aria-label="Open account menu"
            aria-haspopup="menu"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((open) => !open)}
          >
            <span className="moderator-topbar-avatar__initials">
              {getInitials(fullName)}
            </span>
            <ChevronDown size={13} />
          </button>

          {accountOpen ? (
            <div className="moderator-account-menu" role="menu">
              <div className="moderator-account-menu__identity">
                <strong>{fullName}</strong>
                {email ? <span>{email}</span> : null}
              </div>

              <Link
                to={`${basePath}/reviews`}
                role="menuitem"
                onClick={() => setAccountOpen(false)}
              >
                <ClipboardList size={15} />
                View tasks
              </Link>

              <Link
                to={`${basePath}/settings`}
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