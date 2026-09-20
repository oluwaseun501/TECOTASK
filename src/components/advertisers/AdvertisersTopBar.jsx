import { useLocation } from "react-router-dom";

const AdvertisersTopBar = () => {
  const { pathname } = useLocation();

  const isWalletPage = pathname === "/advertisers/wallet";
  const isReferralsPage = pathname === "/advertisers/referrals";

  const pageTitle = isWalletPage
    ? "Wallet"
    : isReferralsPage
      ? "Referrals"
      : "Campaigns";

  const pageDescription = isWalletPage
    ? "Fund your campaign wallet and track every naira spent."
    : isReferralsPage
      ? "Earn ₦200 each time someone activates with your code."
      : "3 active · 911 verified actions delivered";

  const showCampaignActions =
    !isWalletPage && !isReferralsPage;

  return (
    <header className="advertiser-topbar">
      <div>
        <h1>{pageTitle}</h1>
        <p>{pageDescription}</p>
      </div>

      <div className="advertiser-topbar__actions">
        {showCampaignActions && (
          <>
            <button
              type="button"
              className="advertiser-topbar__button advertiser-topbar__button--primary"
            >
              + New campaign
            </button>

            <button
              type="button"
              className="advertiser-topbar__button"
            >
              ▣ Fund wallet
            </button>
          </>
        )}

        <span className="advertiser-topbar__balance">
          Balance <strong>₦54,580</strong>
        </span>

        <button
          type="button"
          className="advertiser-topbar__notification"
          aria-label="Notifications"
        >
          ♧
          <span />
        </button>

        <span className="advertiser-topbar__avatar">OO</span>
      </div>
    </header>
  );
};

export default AdvertisersTopBar;