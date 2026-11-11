import { useEffect, useRef, useState } from "react";
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
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    function closeMenuOnOutsideClick(event) {
      if (!profileMenuRef.current?.contains(event.target)) {
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

          {/* Parent wrapper for relative positioning */}
          <div className="earner-profile-dropdown relative" ref={profileMenuRef}>
            <button
              type="button"
              className="earner-topbar__avatar"
              onClick={() => setAccountMenuOpen((open) => !open)}
              aria-label={
                accountMenuOpen
                  ? "Close earner account menu"
                  : "Open earner account menu"
              }
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              aria-controls="earner-account-menu"
              title={accountEmail || accountName}
            >
              <span className="earner-topbar__avatar-initials">
                {initials}
              </span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>

            {accountMenuOpen && (
              // 100% TAILWIND STYLING FOR THE DROPDOWN
              <div
                className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-32px)] rounded-xl bg-white shadow-xl border border-gray-100 z-50 overflow-hidden"
                id="earner-account-menu"
                role="menu"
                aria-label="Earner account menu"
              >
                {/* Identity Header */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                  <strong className="block text-sm font-semibold text-gray-900 truncate">
                    {accountName}
                  </strong>
                  {accountEmail && (
                    <span className="block text-xs text-gray-500 truncate mt-0.5">
                      {accountEmail}
                    </span>
                  )}
                </div>

                {/* Menu Links */}
                <div className="py-1">
                  <Link
                    to="/earners"
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-gray-400" />
                    Dashboard
                  </Link>

                  <Link
                    to="/earners/settings"
                    role="menuitem"
                    onClick={() => setAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" />
                    Settings
                  </Link>
                </div>

                {/* Logout Button */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} className="text-red-400" />
                    Log out
                  </button>
                </div>
              </div>
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