import { useState } from "react";
import "../../styles/EarnersWallet.css";

const transactions = [
  {
    id: 1,
    type: "credit",
    icon: "↙",
    title: "Task reward — Instagram follow",
    meta: "Today, 10:42 AM · Task earnings",
    amount: "+ ₦10",
    status: "Successful",
  },
  {
    id: 2,
    type: "credit",
    icon: "↙",
    title: "Referral bonus — Aisha B.",
    meta: "Today, 9:15 AM · Referral",
    amount: "+ ₦200",
    status: "Successful",
  },
  {
    id: 3,
    type: "debit",
    icon: "↗",
    title: "Withdrawal to GTBank ····4412",
    meta: "Yesterday, 6:03 PM · Bank transfer",
    amount: "- ₦2,500",
    status: "Successful",
  },
  {
    id: 4,
    type: "credit",
    icon: "↙",
    title: "Task reward — Data plan survey",
    meta: "Yesterday, 2:20 PM · Task earnings",
    amount: "+ ₦25",
    status: "Successful",
  },
  {
    id: 5,
    type: "debit",
    icon: "↗",
    title: "Withdrawal to GTBank ····4412",
    meta: "Monday, 11:08 AM · Bank transfer",
    amount: "- ₦1,000",
    status: "Successful",
  },
];

const EarnersWallet = () => {
  const [amount, setAmount] = useState("2000");
  const [message, setMessage] = useState("");

  const numericAmount = Number(amount);
  const availableBalance = 4235;
  const minimumWithdrawal = 2000;

  const canWithdraw =
    numericAmount >= minimumWithdrawal &&
    numericAmount <= availableBalance;

  const selectAmount = (value) => {
    setAmount(String(value));
    setMessage("");
  };

  const handleWithdraw = (event) => {
    event.preventDefault();

    if (numericAmount < minimumWithdrawal) {
      setMessage("The minimum withdrawal amount is ₦2,000.");
      return;
    }

    if (numericAmount > availableBalance) {
      setMessage("This amount is higher than your available balance.");
      return;
    }

    // Temporary front-end state until withdrawals are connected to a backend.
    setMessage(
      `Your withdrawal request for ₦${numericAmount.toLocaleString(
        "en-NG",
      )} has been submitted.`,
    );
  };

  return (
    <section className="earner-wallet">
      <div className="earner-wallet__heading">
        <div>
          <span>Money and transactions</span>
          <h1>Wallet</h1>
          <p>Your earnings, withdrawals, and full transaction history.</p>
        </div>
      </div>

      <section className="wallet-summary">
        <article className="wallet-summary__balance">
          <span>Available balance</span>
          <strong>₦4,235</strong>
          <small>Withdraw from ₦2,000</small>
        </article>

        <article className="wallet-summary__stat">
          <span>Total earned</span>
          <strong>₦4,235</strong>
          <small>Since joining TecoTask</small>
        </article>

        <article className="wallet-summary__stat">
          <span>Pending withdrawal</span>
          <strong>₦0</strong>
          <small>No transfers pending</small>
        </article>
      </section>

      <div className="wallet-content-grid">
        <section className="wallet-transactions">
          <div className="wallet-section-heading">
            <div>
              <h2>Transaction history</h2>
              <p>Every credit and debit on your TecoTask account.</p>
            </div>
          </div>

          <div className="wallet-transaction-list">
            {transactions.map((transaction) => (
              <article
                key={transaction.id}
                className="wallet-transaction"
              >
                <span
                  className={`wallet-transaction__icon ${transaction.type}`}
                >
                  {transaction.icon}
                </span>

                <div className="wallet-transaction__details">
                  <strong>{transaction.title}</strong>
                  <small>{transaction.meta}</small>
                </div>

                <div
                  className={`wallet-transaction__amount ${transaction.type}`}
                >
                  <strong>{transaction.amount}</strong>
                  <span>{transaction.status}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="wallet-actions">
          <section className="wallet-withdraw-card">
            <h2>Withdraw to bank</h2>
            <p>Minimum ₦2,000. Payouts land within 10 minutes.</p>

            <form onSubmit={handleWithdraw}>
              <label htmlFor="withdrawAmount">Amount (₦)</label>

              <input
                id="withdrawAmount"
                name="withdrawAmount"
                type="number"
                min="2000"
                max="4235"
                step="100"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setMessage("");
                }}
              />

              <div className="wallet-quick-amounts">
                <button
                  type="button"
                  onClick={() => selectAmount(2000)}
                >
                  ₦2,000
                </button>

                <button
                  type="button"
                  onClick={() => selectAmount(2500)}
                >
                  ₦2,500
                </button>

                <button
                  type="button"
                  onClick={() => selectAmount(4000)}
                >
                  ₦4,000
                </button>
              </div>

              <div className="wallet-bank-card">
                <span className="wallet-bank-card__icon">▣</span>

                <div>
                  <strong>GTBank ····4412</strong>
                  <small>Chinedu Okafor</small>
                </div>
              </div>

              {message && (
                <p
                  className={`wallet-message ${
                    canWithdraw
                      ? "wallet-message--success"
                      : "wallet-message--error"
                  }`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                className="wallet-withdraw-button"
              >
                <span>▣</span>
                Withdraw funds
              </button>
            </form>
          </section>

          <section className="wallet-protection-card">
            <span className="wallet-protection-card__icon">♡</span>

            <div>
              <h2>Your money is protected</h2>

              <p>
                TecoTask balances are held with a licensed Nigerian payment
                partner. We never hold card details on our servers, and
                payouts always go to an account in your own name.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default EarnersWallet;