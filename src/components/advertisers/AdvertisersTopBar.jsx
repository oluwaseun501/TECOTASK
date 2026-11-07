import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";

const formatNaira = (amount = 0) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

function getFirstName(fullName = "") {
  return fullName.trim().split(/\s+/)[0] || "there";
}

function getInitials(fullName = "") {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "TT"
  );
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

const AdvertisersTopBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const [user, setUser] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHeaderData() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      const [userResult, dashboardResult] = await Promise.allSettled([
        authApi.getCurrentUser(token),
        authApi.getAdvertiserDashboard(token),
      ]);

      if (!isMounted) return;

      if (userResult.status === "fulfilled") {
        setUser(userResult.value.user || null);
      } else {
        console.error("Could not load advertiser account:", userResult.reason);
      }

      if (dashboardResult.status === "fulfilled") {
        setDashboard(dashboardResult.value);
      } else {
        console.error(
          "Could not load advertiser dashboard:",
          dashboardResult.reason,
        );
      }
    }

    void loadHeaderData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

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

  const isWalletPage = pathname === "/advertisers/wallet";
  const isReferralsPage = pathname === "/advertisers/referrals";
  const isSettingsPage = pathname === "/advertisers/settings";
  const isCreateCampaignPage = pathname === "/advertisers/campaigns/new";

  const pageTitle = isWalletPage
    ? "Wallet"
    : isReferralsPage
      ? "Referrals"
      : isSettingsPage
        ? "Settings"
        : isCreateCampaignPage
          ? "Create a campaign"
          : "Campaigns";

  const pageDescription = isWalletPage
    ? "View your available balance and wallet activity."
    : isReferralsPage
      ? "Track invited earners and rewards credited after activation."
      : isSettingsPage
        ? "Manage your advertiser account and security preferences."
        : isCreateCampaignPage
          ? "Set up and submit a new campaign."
          : dashboard?.stats
            ? `${dashboard.stats.activeCampaigns ?? 0} active · ${
                dashboard.stats.verifiedActions ?? 0
              } verified actions delivered`
            : "Track campaign activity and budget in your workspace.";

  const showCampaignActions =
    !isWalletPage &&
    !isReferralsPage &&
    !isSettingsPage &&
    !isCreateCampaignPage;

  const firstName = getFirstName(user?.fullName);
  const availableBalance = dashboard?.wallet?.availableBalance;
  const accountName = user?.fullName || "Advertiser account";
  const accountEmail = user?.email || "";

  return (
    <header className="advertiser-topbar">
      <div className="advertiser-topbar__main">
        <div>
          <h1>Good day, {firstName}</h1>
          <p>
            <span className="advertiser-topbar__section-label">
              {pageTitle}
            </span>
            {pageDescription ? ` · ${pageDescription}` : ""}
          </p>
        </div>

        <div className="advertiser-topbar__actions">
          {showCampaignActions && (
            <>
              <button
                type="button"
                className="advertiser-topbar__button advertiser-topbar__button--primary"
                onClick={() => navigate("/advertisers/campaigns/new")}
              >
                + New campaign
              </button>

              <button
                type="button"
                className="advertiser-topbar__button"
                onClick={() => navigate("/advertisers/wallet")}
              >
                ▣ Fund wallet
              </button>
            </>
          )}

          <span className="advertiser-topbar__balance">
            Balance{" "}
            <strong>
              {availableBalance === undefined
                ? "—"
                : formatNaira(availableBalance)}
            </strong>
          </span>

          {/* ONLY ADDED 'relative' HERE */}
          <div className="advertiser-profile-dropdown relative" ref={profileMenuRef}>
            <button
              type="button"
              className="advertiser-topbar__avatar"
              onClick={() => setAccountMenuOpen((open) => !open)}
              aria-label={
                accountMenuOpen
                  ? "Close advertiser account menu"
                  : "Open advertiser account menu"
              }
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
              aria-controls="advertiser-account-menu"
              title={accountEmail || accountName}
            >
              <span className="advertiser-topbar__avatar-initials">
                {getInitials(user?.fullName)}
              </span>
              <ChevronDown size={13} aria-hidden="true" />
            </button>

            {accountMenuOpen && (
              // ONLY ADDED 'absolute right-0 z-50' HERE - YOUR ORIGINAL CSS DOES THE REST
              <div
                className="advertiser-account-menu absolute right-0 z-50"
                id="advertiser-account-menu"
                role="menu"
                aria-label="Advertiser account menu"
              >
                <div className="advertiser-account-menu__identity">
                  <strong>{accountName}</strong>
                  {accountEmail && <span>{accountEmail}</span>}
                </div>

                <Link
                  to="/advertisers/campaigns"
                  role="menuitem"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  <LayoutDashboard size={15} />
                  Campaigns
                </Link>

                <Link
                  to="/advertisers/settings"
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
      </div>
    </header>
  );
};

export default AdvertisersTopBar;