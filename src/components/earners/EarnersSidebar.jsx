import { NavLink, Link } from "react-router-dom";

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

const EarnersSidebar = () => {
  return (
    <aside className="earner-sidebar">
      <Link to="/" className="earner-sidebar__brand">
        <span className="earner-sidebar__logo">T</span>

        <span>
          Teco<span>Task</span>
        </span>
      </Link>

      <p className="earner-sidebar__label">Earner workspace</p>

      <nav className="earner-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `earner-sidebar__link ${isActive ? "is-active" : ""}`
            }
          >
            <span className="earner-sidebar__icon">{item.icon}</span>
            <span>{item.label}</span>

            {item.count && (
              <span className="earner-sidebar__count">{item.count}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="earner-sidebar__bottom">
        <div className="earner-sidebar__profile">
          <span className="earner-sidebar__avatar">CO</span>

          <div>
            <strong>Chinedu Okafor</strong>
            <small>TT-48219</small>
          </div>
        </div>

        <button type="button" className="earner-sidebar__logout">
          <span>↪</span>
          Log out
        </button>
      </div>
    </aside>
  );
};

export default EarnersSidebar;