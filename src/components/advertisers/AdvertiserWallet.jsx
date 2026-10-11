import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserWallet.css";

const formatNaira = (amount = 0) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

const formatDateTime = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const transactionLabels = {
  deposit: "Wallet funding",
  campaign_reservation: "Campaign funded",
  campaign_spend: "Campaign spend",
  campaign_refund: "Campaign refund",
  admin_adjustment: "Wallet adjustment",
};

const getTransactionDisplay = (transaction) => {
  const isCredit = transaction.direction === "credit";
  const label =
    transactionLabels[transaction.type] || "Wallet transaction";

  return {
    title: label,
    typeClass: isCredit ? "credit" : "debit",
    icon: isCredit ? "✓" : "↗",
    amount: `${isCredit ? "+" : "−"}${formatNaira(transaction.amount)}`,
    status: "Recorded",
    meta: [
      formatDateTime(transaction.createdAt),
      transaction.description || transaction.reference,
    ]
      .filter(Boolean)
      .join(" · "),
  };
};

const AdvertiserWallet = () => {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadWallet() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.getAdvertiserWallet(token);

        if (isMounted) {
          setWallet(data.wallet || null);
          setTransactions(data.transactions || []);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message || "Could not load your wallet.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadWallet();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

if (isLoading) {
  return (
    <section className="advertiser-wallet advertiser-wallet--loading">
      <div
        className="advertiser-wallet__loader"
        role="status"
        aria-live="polite"
      >
        <span className="advertiser-wallet__roller" aria-hidden="true">
          <span />
        </span>
        <strong>Loading your wallet</strong>
        <p>Getting your balance and recent transactions...</p>
      </div>
    </section>
  );
}
  if (error) {
    return (
      <section className="advertiser-wallet">
        <p role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section className="advertiser-wallet">
      <section className="advertiser-wallet-summary">
        <article className="advertiser-wallet-summary__balance">
          <span>Wallet balance</span>
          <strong>{formatNaira(wallet?.availableBalance)}</strong>
          <small>Available for campaigns</small>
        </article>

        <article className="advertiser-wallet-summary__stat">
          <span>Total campaign spend</span>
          <strong>{formatNaira(wallet?.totalSpent)}</strong>
          <small>Used across your campaigns</small>
        </article>
      </section>

      <div className="advertiser-wallet__grid">
        <section className="advertiser-wallet-transactions">
          <div className="advertiser-wallet__section-heading">
            <div>
              <h2>Recent transactions</h2>
              <p>Your latest wallet funding and campaign activity.</p>
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
            {transactions.length === 0 ? (
              <p>No wallet transactions yet.</p>
            ) : (
              transactions.slice(0, 5).map((transaction) => {
                const display = getTransactionDisplay(transaction);

                return (
                  <Link
                    key={transaction.id}
                    to={`/advertisers/transactions/${transaction.id}`}
                    className="advertiser-wallet-transaction"
                  >
                    <span
                      className={`advertiser-wallet-transaction__icon ${display.typeClass}`}
                    >
                      {display.icon}
                    </span>

                    <div className="advertiser-wallet-transaction__details">
                      <strong>{display.title}</strong>
                      <small>{display.meta}</small>
                    </div>

                    <div
                      className={`advertiser-wallet-transaction__amount ${display.typeClass}`}
                    >
                      <strong>{display.amount}</strong>
                      <span>{display.status}</span>
                    </div>

                    <span className="advertiser-wallet-transaction__arrow">
                      →
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        <aside className="advertiser-wallet__side">
          <section className="advertiser-fund-card">
            <h2>Fund your wallet</h2>
            <p>
              Korapay checkout will be available once payment verification is
              connected.
            </p>

            <form onSubmit={(event) => event.preventDefault()}>
              <label htmlFor="walletAmount">Amount (₦)</label>

              <input
                id="walletAmount"
                type="number"
                min="1000"
                step="100"
                value=""
                placeholder="Available soon"
                disabled
              />

              <div className="advertiser-wallet-quick-amounts">
                <button type="button" disabled>₦10,000</button>
                <button type="button" disabled>₦25,000</button>
                <button type="button" disabled>₦50,000</button>
              </div>

              <p className="advertiser-wallet-message" role="status">
                Wallet funding is not available yet. No payment will be
                initiated from this page.
              </p>

              <button
                type="button"
                className="advertiser-fund-button"
                disabled
              >
                <span>+</span>
                Fund wallet — coming soon
              </button>
            </form>
          </section>

          <section className="advertiser-wallet-protection">
            <span className="advertiser-wallet-protection__icon">
              ♡
            </span>

            <div>
              <h2>Payment setup in progress</h2>
              <p>
                Your balance and transaction history reflect records currently
                in TecoTask. Wallet top-ups will be enabled after Korapay
                verification is implemented.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default AdvertiserWallet;