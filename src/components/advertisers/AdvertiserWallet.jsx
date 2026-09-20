import { useState } from "react";
import { Link } from "react-router-dom";
import { advertiserTransactions } from "../data/advertiserTransactions";

import "../../styles/AdvertiserWallet.css";

const AdvertiserWallet = () => {
  const [amount, setAmount] = useState("1000");
  const [message, setMessage] = useState("");

  const recentTransactions = advertiserTransactions.slice(0, 5);

  const selectAmount = (value) => {
    setAmount(String(value));
    setMessage("");
  };

  const handleFundWallet = (event) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 1000) {
      setMessage("The minimum wallet funding amount is ₦1,000.");
      return;
    }

    setMessage(
      `Funding request for ₦${numericAmount.toLocaleString(
        "en-NG",
      )} is ready for payment.`,
    );
  };

  return (
    <section className="advertiser-wallet">
      <section className="advertiser-wallet-summary">
        <article className="advertiser-wallet-summary__balance">
          <span>Wallet balance</span>
          <strong>₦54,580</strong>
          <small>Available for campaigns</small>
        </article>

        <article className="advertiser-wallet-summary__stat">
          <span>Total campaign spend</span>
          <strong>₦14,920</strong>
          <small>Used across your campaigns</small>
        </article>
      </section>

      <div className="advertiser-wallet__grid">
        <section className="advertiser-wallet-transactions">
          <div className="advertiser-wallet__section-heading">
            <div>
              <h2>Recent transactions</h2>
              <p>
                Your latest wallet funding and campaign activity.
              </p>
            </div>

            <Link
              to="/advertisers/transactions"
              className="advertiser-wallet__view-all"
            >
              View all
              <span>→</span>
            </Link>
          </div>

          <div className="advertiser-wallet-transaction-list">
            {recentTransactions.map((transaction) => (
              <Link
                key={transaction.id}
                to={`/advertisers/transactions/${transaction.id}`}
                className="advertiser-wallet-transaction"
              >
                <span
                  className={`advertiser-wallet-transaction__icon ${transaction.type}`}
                >
                  {transaction.icon}
                </span>

                <div className="advertiser-wallet-transaction__details">
                  <strong>{transaction.title}</strong>
                  <small>{transaction.meta}</small>
                </div>

                <div
                  className={`advertiser-wallet-transaction__amount ${transaction.type}`}
                >
                  <strong>{transaction.amount}</strong>
                  <span>{transaction.status}</span>
                </div>

                <span className="advertiser-wallet-transaction__arrow">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <aside className="advertiser-wallet__side">
          <section className="advertiser-fund-card">
            <h2>Fund your wallet</h2>
            <p>Card, transfer, or USSD. Funds reflect instantly.</p>

            <form onSubmit={handleFundWallet}>
              <label htmlFor="walletAmount">Amount (₦)</label>

              <input
                id="walletAmount"
                type="number"
                min="1000"
                step="100"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setMessage("");
                }}
              />

              <div className="advertiser-wallet-quick-amounts">
                <button
                  type="button"
                  onClick={() => selectAmount(10000)}
                >
                  ₦10,000
                </button>

                <button
                  type="button"
                  onClick={() => selectAmount(25000)}
                >
                  ₦25,000
                </button>

                <button
                  type="button"
                  onClick={() => selectAmount(50000)}
                >
                  ₦50,000
                </button>
              </div>

              {message && (
                <p className="advertiser-wallet-message">
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="advertiser-fund-button"
              >
                <span>+</span>
                Fund wallet
              </button>
            </form>
          </section>

          <section className="advertiser-wallet-protection">
            <span className="advertiser-wallet-protection__icon">
              ♡
            </span>

            <div>
              <h2>Your money is protected</h2>

              <p>
                TecoTask balances are held with a licensed Nigerian payment
                partner. We never hold card details on our servers, and
                payments are processed securely.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default AdvertiserWallet;