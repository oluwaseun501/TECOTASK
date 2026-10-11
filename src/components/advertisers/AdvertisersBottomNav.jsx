import { NavLink } from "react-router-dom";
import "../../styles/AdvertiserBottomNav.css";

const navItems = [
  {
    label: "Campaigns",
    path: "/advertisers/campaigns",
    icon: "▣",
    end: true,
  },
  {
    label: "Add funds",
    path: "/advertisers/wallet",
    icon: "₦",
  },
  {
    label: "Create campaign",
    path: "/advertisers/campaigns/new",
    icon: "+",
    create: true,
    end: true,
  },
  {
    label: "Referrals",
    path: "/advertisers/referrals",
    icon: "♧",
  },
  {
    label: "Profile",
    path: "/advertisers/settings",
    icon: "◉",
  },
];

const AdvertisersBottomNav = () => {
  return (
    <nav className="advertiser-bottom-nav" aria-label="Advertiser navigation">
      <div className="advertiser-bottom-nav__inner">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            aria-label={item.label}
            className={({ isActive }) =>
              [
                "advertiser-bottom-nav__item",
                item.create && "advertiser-bottom-nav__item--create",
                isActive && "active",
              ]
                .filter(Boolean)
                .join(" ")
            }
          >
            <span className="advertiser-bottom-nav__icon" aria-hidden="true">
              {item.icon}
            </span>
            <span className="advertiser-bottom-nav__label">
              {item.create ? "Create" : item.label}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default AdvertisersBottomNav;