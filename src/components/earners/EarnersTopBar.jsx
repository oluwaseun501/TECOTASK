import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const formatNaira = (amount = 0) =>
  `₦${Number(amount).toLocaleString("en-NG")}`;

function getFirstName(fullName = "") {
  return (fullName || "").trim().split(/\s+/)[0] || "there";
}

function getInitials(fullName = "") {
  const initials = (fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("");

  return initials.toUpperCase() || "TT";
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

const EarnersTopBar = ({
  user,
  stats,
  openTaskCount = 0,
  isActivated = false,
}) => {
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);
  const avatarRef = useRef(null);
  
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    function closeMenuOnOutsideClick(event) {
      if (
        !profileMenuRef.current?.contains(event.target) &&
        !avatarRef.current?.contains(event.target)
      ) {
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

  function toggleAccountMenu() {
    if (!accountMenuOpen && avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: Math.max(20, window.innerWidth - rect.right),
      });
    }
    setAccountMenuOpen((open) => !open);
  }

  function handleLogout() {
    clearStoredAuth();
    setAccountMenuOpen(false);
    navigate("/login", { replace: true });
  }

  const firstName = getFirstName(user?.fullName);
  const initials = getInitials(user?.fullName);
  const accountName = user?.fullName || "Earner account";
  const accountEmail = user?.email || "";

  return (
    <header className="earner-topbar">
      <div className="earner-topbar__main">
        <div>
          <h1>Good day, {firstName}</h1>

          <p>
            {openTaskCount}{" "}
            {openTaskCount === 1 ? "task is" : "tasks are"} open for you right
            now
          </p>
        </div>

        <div className="earner-topbar__actions">
          <span className="earner-topbar__balance">
            Balance{" "}
            <strong>{formatNaira(stats?.walletBalance || 0)}</strong>
          </span>

          <div className="earner-profile-dropdown">
            <button
              ref={avatarRef}
              type="button"
              className="earner-topbar__avatar"
              onClick={toggleAccountMenu}
              aria-label={
                accountMenuOpen
                  ? "Close earner account menu"
                  : "Open earner account menu"
              }
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              title={accountEmail || accountName}
            >
              <span className="earner-topbar__avatar-initials">
                {initials}
              </span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>

            {/* RENDER VIA PORTAL SO IT NEVER GETS CLIPPED */}
            {accountMenuOpen &&
              createPortal(
                <div
                  ref={profileMenuRef}
                  className="earner-account-menu"
                  style={{
                    top: `${menuPosition.top}px`,
                    right: `${menuPosition.right}px`,
                  }}
                  role="menu"
                  aria-label="Earner account menu"
                >
                  <div className="earner-account-menu__identity">
                    <div className="earner-account-menu__avatar">
                      {initials}
                    </div>
                    <div className="earner-account-menu__details">
                      <strong>{accountName}</strong>
                      {accountEmail && <span>{accountEmail}</span>}
                    </div>
                  </div>

                  <div className="earner-account-menu__links">
                    <Link
                      to="/earners"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} className="menu-icon" />
                      Dashboard
                    </Link>

                    <Link
                      to="/earners/settings"
                      role="menuitem"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <Settings size={16} className="menu-icon" />
                      Settings
                    </Link>
                  </div>

                  <div className="earner-account-menu__footer">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} className="menu-icon" />
                      Log out
                    </button>
                  </div>
                </div>,
                document.body
              )}
          </div>
        </div>
      </div>

      {!isActivated && (
        <div className="earner-activation-banner">
          <div>
            <strong>Activate your account to start earning</strong>
            <span>
              Unlock task submissions, withdrawals, and referral rewards.
            </span>
          </div>

          <Link
            to="/earners/activate"
            className="earner-activation-banner__button"
          >
            Activate account
            <span>→</span>
          </Link>
        </div>
      )}
    </header>
  );
};

export default EarnersTopBar;