import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { authApi } from "../../services/auth.js";
import AdminSidebar from "./AdminSidebar";
import "../../styles/AdminDashboard.css";

function getPageTitle(pathname, search) {
  if (pathname === "/admin") {
    return "Overview";
  }

  if (pathname.startsWith("/admin/users")) {
    if (search.includes("role=earner")) return "Earners";
    if (search.includes("role=advertiser")) return "Advertisers";
    if (search.includes("role=moderator")) return "Moderators";
    if (pathname !== "/admin/users") return "User details";
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
  return emailName ? emailName.slice(0, 2).toUpperCase() : "AD";
}

function clearStoredAuth() {
  for (const storageName of ["sessionStorage", "localStorage"]) {
    try {
      window[storageName].removeItem("tecotaskToken");
      window[storageName].removeItem("tecotaskUser");
    } catch {
      // Continue to login if browser storage is unavailable.
    }
  }
}

export default function AdminDashboard({ basePath = "/admin" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const accountMenuRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const [accountLoading, setAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const normalizedBasePath = basePath.replace(/\/$/, "") || "/admin";

  useEffect(() => {
    let isMounted = true;

    async function loadAccount() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const data = await authApi.getSettings(token);

        if (isMounted) {
          setAccount(data.account || null);
        }
      } catch (error) {
        if (isMounted) {
          setAccountError(error.message || "Could not load your account.");
        }
      } finally {
        if (isMounted) {
          setAccountLoading(false);
        }
      }
    }

    void loadAccount();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    function closeMenuOnOutsideClick(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenuOnOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    function closeMenuOnEscape(event) {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    }

    document.addEventListener("keydown", closeMenuOnEscape);

    return () => {
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, [accountMenuOpen]);

  function handleLogout() {
    clearStoredAuth();
    setAccountMenuOpen(false);
    navigate("/login", { replace: true });
  }

  const pageTitle = getPageTitle(location.pathname, location.search);
  const avatarInitials = getInitials(account);
  const accountName = account?.fullName || "Admin account";
  const accountEmail = account?.email || "";

  return (
    <div className="admin-shell">
      <AdminSidebar
        basePath={basePath}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        account={account}
        accountLoading={accountLoading}
        accountError={accountError}
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
            <div className="admin-profile-dropdown" ref={accountMenuRef}>
              <button
                type="button"
                className="admin-topbar-avatar"
                onClick={() => setAccountMenuOpen((open) => !open)}
                title={accountEmail || accountName}
                aria-label={
                  account?.fullName
                    ? `Account menu for ${account.fullName}`
                    : "Open admin account menu"
                }
                aria-haspopup="menu"
                aria-expanded={accountMenuOpen}
                aria-controls="admin-account-menu"
              >
                <span className="admin-topbar-avatar__initials">
                  {accountLoading ? "…" : avatarInitials}
                </span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>

              {accountMenuOpen && (
                <div
                  className="admin-account-menu"
                  id="admin-account-menu"
                  role="menu"
                  aria-label="Admin account menu"
                >
                  <div className="admin-account-menu__identity">
                    <strong>{accountName}</strong>
                    {accountEmail && <span>{accountEmail}</span>}
                  </div>

                  <Link
                    to={normalizedBasePath}
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
                  >
                    <LayoutDashboard size={15} />
                    Admin overview
                  </Link>

                  <Link
                    to={`${normalizedBasePath}/settings`}
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
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
              )}
            </div>
          </div>
        </header>

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}