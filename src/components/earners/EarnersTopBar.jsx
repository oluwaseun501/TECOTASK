import { Link } from "react-router-dom";

const EarnersTopBar = ({ isActivated = false }) => {
  return (
    <header className="earner-topbar">
      <div className="earner-topbar__main">
        <div>
          <h1>Good day, Chinedu</h1>
          <p>5 tasks open for you right now</p>
        </div>

        <div className="earner-topbar__actions">
          <span className="earner-topbar__balance">
            Balance <strong>₦4,235</strong>
          </span>

          <button
            type="button"
            className="earner-topbar__notification"
            aria-label="Notifications"
          >
            ♧
            <span />
          </button>

          <span className="earner-topbar__avatar">CO</span>
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