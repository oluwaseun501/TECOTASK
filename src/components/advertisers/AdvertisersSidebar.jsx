import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";

const advertiserLinks = [
  {
    label: "Campaigns",
    path: "/advertisers/campaigns",
    icon: "▣",
  },
  {
    label: "Wallet",
    path: "/advertisers/wallet",
    icon: "▤",
  },
  {
    label: "Referrals",
    path: "/advertisers/referrals",
    icon: "♧",
  },
  {
    label: "Settings",
    path: "/advertisers/settings",
    icon: "⚙",
  },
];

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

function displayRole(role = "") {
  return role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "Advertiser";
}

const AdvertisersSidebar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const data = await authApi.getCurrentUser(token);

        if (isMounted) {
          setUser(data.user || null);
        }
      } catch (error) {
        console.error("Could not load advertiser account:", error);
      } finally {
        if (isMounted) {
          setLoadingUser(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("tecotaskToken");
    navigate("/login", { replace: true });
  };

  return (
    <aside className="advertiser-sidebar">
      <div>
        <div className="advertiser-sidebar__brand">
          <span>T</span>
          <strong>
            Teco<span>Task</span>
          </strong>
        </div>

        <p className="advertiser-sidebar__workspace">
          Advertiser workspace
        </p>

        <nav className="advertiser-sidebar__nav">
          {advertiserLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/advertisers/campaigns"}
              className={({ isActive }) =>
                `advertiser-sidebar__link ${isActive ? "is-active" : ""}`
              }
            >
              <span className="advertiser-sidebar__link-icon">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="advertiser-sidebar__footer">
        <div className="advertiser-sidebar__profile">
          <span className="advertiser-sidebar__avatar">
            {getInitials(user?.fullName)}
          </span>

          <div>
            <strong>
              {loadingUser ? "Loading..." : user?.fullName || "Account"}
            </strong>
            <small>{displayRole(user?.role)}</small>
          </div>
        </div>

        <button
          type="button"
          className="advertiser-sidebar__logout"
          onClick={handleLogout}
        >
          ↪
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdvertisersSidebar;