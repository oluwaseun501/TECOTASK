import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  Landmark,
  Smartphone,
  WalletCards,
  XCircle,
} from "lucide-react";

import "../../styles/ModeratorWithdrawals.css";

const WITHDRAWALS_STORAGE_KEY =
  "tecotask_moderator_withdrawal_history";

const startingHistory = [
  {
    id: "WD-1042",
    amount: 8500,
    method: "Bank transfer",
    provider: "GTBank",
    account: "•••• 2841",
    date: "Sep 20, 2026",
    status: "Completed",
  },
  {
    id: "WD-1037",
    amount: 4200,
    method: "Mobile wallet",
    provider: "Opay",
    account: "•••• 9012",
    date: "Sep 15, 2026",
    status: "Completed",
  },
  {
    id: "WD-1032",
    amount: 6000,
    method: "Bank transfer",
    provider: "Access Bank",
    account: "•••• 1148",
    date: "Sep 08, 2026",
    status: "Pending",
  },
];

function readWithdrawalHistory() {
  if (typeof window === "undefined") {
    return startingHistory;
  }

  try {
    const storedHistory = window.localStorage.getItem(
      WITHDRAWALS_STORAGE_KEY
    );

    return storedHistory
      ? JSON.parse(storedHistory)
      : startingHistory;
  } catch {
    return startingHistory;
  }
}

function saveWithdrawalHistory(history) {
  window.localStorage.setItem(
    WITHDRAWALS_STORAGE_KEY,
    JSON.stringify(history)
  );
}

function formatAmount(amount) {
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

function StatusBadge({ status }) {
  const statusClass = status.toLowerCase();

  return (
    <span
      className={`moderator-withdrawal-status moderator-withdrawal-status--${statusClass}`}
    >
      {status === "Completed" ? (
        <CheckCircle2 size={12} />
      ) : status === "Rejected" ? (
        <XCircle size={12} />
      ) : (
        <Clock3 size={12} />
      )}

      {status}
    </span>
  );
}

export default function ModeratorWithdrawals() {
  const [history, setHistory] = useState(readWithdrawalHistory);
  const [filter, setFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    amount: "",
    method: "Bank transfer",
    provider: "",
    accountName: "",
    accountNumber: "",
    note: "",
  });

  const availableBalance = 18450;
  const minimumWithdrawal = 1000;

  const filteredHistory = useMemo(() => {
    if (filter === "All") {
      return history;
    }

    return history.filter((item) => item.status === filter);
  }, [filter, history]);

  const pendingTotal = history
    .filter((item) => item.status === "Pending")
    .reduce((total, item) => total + item.amount, 0);

  const completedTotal = history
    .filter((item) => item.status === "Completed")
    .reduce((total, item) => total + item.amount, 0);

  const updateForm = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setNotice("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const amount = Number(form.amount);

    if (!amount || amount < minimumWithdrawal) {
      setError(
        `The minimum withdrawal amount is ${formatAmount(
          minimumWithdrawal
        )}.`
      );
      return;
    }

    if (amount > availableBalance) {
      setError("This amount is higher than your available balance.");
      return;
    }

    if (!form.provider.trim()) {
      setError("Enter your bank or wallet provider.");
      return;
    }

    if (!form.accountName.trim()) {
      setError("Enter the account name.");
      return;
    }

    if (!form.accountNumber.trim()) {
      setError("Enter the account or wallet number.");
      return;
    }

    const newWithdrawal = {
      id: `WD-${Date.now().toString().slice(-4)}`,
      amount,
      method: form.method,
      provider: form.provider,
      account: `•••• ${form.accountNumber.slice(-4)}`,
      date: "Just now",
      status: "Pending",
      note: form.note,
    };

    const updatedHistory = [newWithdrawal, ...history];

    setHistory(updatedHistory);
    saveWithdrawalHistory(updatedHistory);

    setForm({
      amount: "",
      method: "Bank transfer",
      provider: "",
      accountName: "",
      accountNumber: "",
      note: "",
    });

    setError("");
    setNotice(
      "Your withdrawal request has been submitted for review."
    );
  };

  return (
    <main className="moderator-withdrawals">
      <div className="moderator-withdrawals__inner">
        <header className="moderator-withdrawals__header">
          <div>
            <span className="moderator-withdrawals__eyebrow">
              Earnings
            </span>

            <h1>Withdrawals</h1>

            <p>
              Request a payout and keep track of your withdrawal history.
            </p>
          </div>

          <div className="moderator-withdrawals__header-icon">
            <WalletCards size={21} />
          </div>
        </header>

        {notice ? (
          <div className="moderator-withdrawals__notice moderator-withdrawals__notice--success">
            <CheckCircle2 size={15} />
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="moderator-withdrawals__notice moderator-withdrawals__notice--error">
            <XCircle size={15} />
            {error}
          </div>
        ) : null}

        <section className="moderator-withdrawals__summary">
          <article className="moderator-balance-card">
            <div className="moderator-balance-card__icon">
              <WalletCards size={18} />
            </div>

            <span>Available balance</span>

            <strong>{formatAmount(availableBalance)}</strong>

            <small>Available for withdrawal</small>
          </article>

          <article className="moderator-withdrawal-stat">
            <span>Pending withdrawals</span>
            <strong>{formatAmount(pendingTotal)}</strong>
            <small>Currently being processed</small>
          </article>

          <article className="moderator-withdrawal-stat">
            <span>Total withdrawn</span>
            <strong>{formatAmount(completedTotal)}</strong>
            <small>Completed payouts</small>
          </article>
        </section>

        <section className="moderator-withdrawals__layout">
          <form
            className="moderator-withdrawal-form"
            onSubmit={handleSubmit}
          >
            <div className="moderator-withdrawal-form__heading">
              <div>
                <h2>Request withdrawal</h2>
                <p>
                  Withdrawals are reviewed before payment is released.
                </p>
              </div>

              <ArrowDownToLine size={17} />
            </div>

            <label>
              Amount
              <div className="moderator-amount-input">
                <span>₦</span>

                <input
                  type="number"
                  min={minimumWithdrawal}
                  max={availableBalance}
                  value={form.amount}
                  onChange={(event) =>
                    updateForm("amount", event.target.value)
                  }
                  placeholder="0.00"
                />
              </div>

              <small>
                Minimum withdrawal: {formatAmount(minimumWithdrawal)}
              </small>
            </label>

            <label>
              Withdrawal method

              <select
                value={form.method}
                onChange={(event) =>
                  updateForm("method", event.target.value)
                }
              >
                <option value="Bank transfer">Bank transfer</option>
                <option value="Mobile wallet">Mobile wallet</option>
              </select>
            </label>

            <label>
              {form.method === "Bank transfer"
                ? "Bank"
                : "Wallet provider"}

              <div className="moderator-input-with-icon">
                {form.method === "Bank transfer" ? (
                  <Landmark size={15} />
                ) : (
                  <Smartphone size={15} />
                )}

                <input
                  type="text"
                  value={form.provider}
                  onChange={(event) =>
                    updateForm("provider", event.target.value)
                  }
                  placeholder={
                    form.method === "Bank transfer"
                      ? "e.g. GTBank"
                      : "e.g. Opay"
                  }
                />
              </div>
            </label>

            <label>
              Account name

              <input
                type="text"
                value={form.accountName}
                onChange={(event) =>
                  updateForm("accountName", event.target.value)
                }
                placeholder="Enter account name"
              />
            </label>

            <label>
              {form.method === "Bank transfer"
                ? "Account number"
                : "Wallet number"}

              <input
                type="text"
                inputMode="numeric"
                value={form.accountNumber}
                onChange={(event) =>
                  updateForm("accountNumber", event.target.value)
                }
                placeholder={
                  form.method === "Bank transfer"
                    ? "Enter account number"
                    : "Enter wallet number"
                }
              />
            </label>

            <label>
              Note <span className="moderator-optional">(optional)</span>

              <textarea
                rows={3}
                value={form.note}
                onChange={(event) =>
                  updateForm("note", event.target.value)
                }
                placeholder="Add a note about this withdrawal..."
              />
            </label>

            <button
              type="submit"
              className="moderator-withdrawal-submit"
            >
              <ArrowDownToLine size={15} />
              Place withdrawal
            </button>
          </form>

          <section className="moderator-withdrawal-history">
            <div className="moderator-withdrawal-history__heading">
              <div>
                <h2>Withdrawal history</h2>
                <p>Your previous payout requests.</p>
              </div>

              <div className="moderator-withdrawal-filters">
                {["All", "Pending", "Completed", "Rejected"].map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      className={
                        filter === item
                          ? "moderator-withdrawal-filter moderator-withdrawal-filter--active"
                          : "moderator-withdrawal-filter"
                      }
                      onClick={() => setFilter(item)}
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="moderator-withdrawal-table">
              <div className="moderator-withdrawal-table__header">
                <span>Reference</span>
                <span>Method</span>
                <span>Amount</span>
                <span>Date</span>
                <span>Status</span>
              </div>

              {filteredHistory.map((withdrawal) => (
                <div
                  className="moderator-withdrawal-table__row"
                  key={withdrawal.id}
                >
                  <div>
                    <strong>{withdrawal.id}</strong>
                    <small>{withdrawal.provider}</small>
                  </div>

                  <div>
                    <strong>{withdrawal.method}</strong>
                    <small>{withdrawal.account}</small>
                  </div>

                  <strong>
                    {formatAmount(withdrawal.amount)}
                  </strong>

                  <span className="moderator-withdrawal-date">
                    {withdrawal.date}
                  </span>

                  <StatusBadge status={withdrawal.status} />
                </div>
              ))}

              {filteredHistory.length === 0 ? (
                <div className="moderator-withdrawal-empty">
                  <ArrowDownToLine size={22} />
                  <strong>No withdrawals found</strong>
                  <span>
                    There are no withdrawals under this filter.
                  </span>
                </div>
              ) : null}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}