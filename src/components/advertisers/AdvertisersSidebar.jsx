import { NavLink } from "react-router-dom";

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
}
];

const AdvertisersSidebar = () => {
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
                `advertiser-sidebar__link ${
                  isActive ? "is-active" : ""
                }`
              }
            >
              <span className="advertiser-sidebar__link-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>

              {item.badge && (
                <small className="advertiser-sidebar__badge">
                  {item.badge}
                </small>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="advertiser-sidebar__footer">
        <div className="advertiser-sidebar__profile">
          <span className="advertiser-sidebar__avatar">OO</span>

          <div>
            <strong>Olawale Ojo</strong>
            <small>Advertiser</small>
          </div>
        </div>

        <button type="button" className="advertiser-sidebar__logout">
          ↪
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdvertisersSidebar;