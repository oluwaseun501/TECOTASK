import { NavLink } from "react-router-dom";

const navItems = [
  {
    label: "Tasks",
    path: "/earners",
    icon: "▦",
    end: true,
  },
  {
    label: "Referrals",
    path: "/earners/referrals",
    icon: "♧",
  },
  {
    label: "Earn",
    path: "/earners",
    icon: "↗",
    end: true,
    primary: true,
  },
  {
    label: "Wallet",
    path: "/earners/wallet",
    icon: "₦",
  },
  {
    label: "Profile",
    path: "/earners/settings",
    icon: "◉",
  },
];

const EarnersBottomNav = () => {
  return (
    <nav className="earner-bottom-nav" aria-label="Earner navigation">
      <div className="earner-bottom-nav__inner">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            aria-label={item.label}
            className={({ isActive }) =>
              [
                "earner-bottom-nav__item",
                item.primary && "earner-bottom-nav__item--earn",
                isActive && !item.primary && "active",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <span className="earner-bottom-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="earner-bottom-nav__label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default EarnersBottomNav;