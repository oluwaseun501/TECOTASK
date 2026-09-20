import { Link } from "react-router-dom";
import { advertiserTransactions } from "../data/advertiserTransactions";
import "../../styles/AdvertiserTransactions.css";

const AdvertiserTransactions = () => {
  return (
    <section className="advertiser-transactions-page">
      <div className="advertiser-transactions-page__heading">
        <div>
          <span>Wallet activity</span>
          <h1>Transaction history</h1>
          <p>
            View every wallet top-up and campaign charge on your account.
          </p>
        </div>

        <Link
          to="/advertisers/wallet"
          className="advertiser-transactions-page__back"
        >
          ← Back to wallet
        </Link>
      </div>

      <section className="advertiser-all-transactions">
        <div className="advertiser-all-transactions__heading">
          <div>
            <h2>All transactions</h2>
            <p>
              {advertiserTransactions.length} transactions recorded
            </p>
          </div>

          <span className="advertiser-all-transactions__balance">
            Current balance: <strong>₦54,580</strong>
          </span>
        </div>

        <div className="advertiser-full-transaction-list">
          {advertiserTransactions.map((transaction) => (
            <Link
              key={transaction.id}
              to={`/advertisers/transactions/${transaction.id}`}
              className="advertiser-full-transaction"
            >
              <span
                className={`advertiser-full-transaction__icon ${transaction.type}`}
              >
                {transaction.icon}
              </span>

              <div className="advertiser-full-transaction__details">
                <strong>{transaction.title}</strong>
                <small>{transaction.meta}</small>
              </div>

              <div
                className={`advertiser-full-transaction__amount ${transaction.type}`}
              >
                <strong>{transaction.amount}</strong>
                <span>{transaction.status}</span>
              </div>

              <span className="advertiser-full-transaction__arrow">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
};

export default AdvertiserTransactions;