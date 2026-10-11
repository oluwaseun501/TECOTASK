import { NavLink, Link, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Task board",
    path: "/earners",
    icon: "▦",
    end: true,
  },
  {
    label: "Wallet",
    path: "/earners/wallet",
    icon: "▣",
  },
  {
    label: "Referrals",
    path: "/earners/referrals",
    icon: "♧",
  },
  {
    label: "Settings",
    path: "/earners/settings",
    icon: "⚙",
  },
];

function getInitials(fullName = "") {
  const initials = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("");

  return initials.toUpperCase() || "TT";
}

const EarnersSidebar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("tecotaskToken");
    sessionStorage.removeItem("tecotaskUser");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="earner-sidebar">
      <Link to="/" className="earner-sidebar__brand">
        <span className="earner-sidebar__logo">T</span>

        <span className="earner-sidebar__brand-name">
          Teco<span>Task</span>
        </span>
      </Link>

      <p className="earner-sidebar__label">EARNER WORKSPACE</p>

      <nav className="earner-sidebar__nav" aria-label="Earner navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
  `earner-sidebar__link ${isActive ? "is-active" : ""}`
}
          >
            <span className="earner-sidebar__nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="earner-sidebar__bottom">
        <div className="earner-sidebar__profile">
          <span className="earner-sidebar__avatar">
            {getInitials(user?.fullName)}
          </span>

          <div>
            <strong>{user?.fullName || "Loading..."}</strong>
            <small>{user?.email || "Earner account"}</small>
          </div>
        </div>

        <button
          type="button"
          className="earner-sidebar__logout"
          onClick={handleLogout}
        >
          <span>↪</span>
          Log out
        </button>
      </div>
    </aside>
  );
};

export default EarnersSidebar;