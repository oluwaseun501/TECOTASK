import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  Landmark,
  WalletCards,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";

import { authApi } from "../../services/auth.js";
import "../../styles/ModeratorWithdrawals.css";

function getStoredToken() {
  if (typeof window === "undefined") return "";

  return (
    window.sessionStorage.getItem("tecotaskToken") ||
    window.localStorage.getItem("tecotaskToken") ||
    ""
  );
}

function formatAmount(amount) {
  const value = Number(amount);
  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0)}`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function displayStatus(value) {
  const status = String(value || "pending").toLowerCase();

  if (status === "paid" || status === "completed") return "Completed";
  if (status === "rejected") return "Rejected";
  if (status === "pending") return "Pending";

  return status.replace(/\b\w/g, (character) => character.toUpperCase());
}

function normalizeWithdrawal(withdrawal) {
  const id = String(withdrawal.id || "");

  return {
    id,
    reference:
      withdrawal.paymentReference ||
      (id ? `WD-${id.slice(-6).toUpperCase()}` : "Withdrawal"),
    amount: Number(withdrawal.amount || 0),
    status: displayStatus(withdrawal.status),
    method: "Bank transfer",
    provider: withdrawal.payoutAccount?.bankName || "Bank transfer",
    account: withdrawal.payoutAccount?.accountNumberMasked || "",
    date: formatDate(withdrawal.createdAt),
  };
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
  const [token] = useState(getStoredToken);
  const [wallet, setWallet] = useState(null);
  const [history, setHistory] = useState([]);
  const [minimumWithdrawal, setMinimumWithdrawal] = useState(1000);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingPayoutAccount, setEditingPayoutAccount] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    isDanger: false,
    onConfirm: null,
  });

  const [form, setForm] = useState({
    amount: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });

  useEffect(() => {
    let active = true;

    async function loadWithdrawals() {
      if (!token) {
        setError("Your moderator session was not found. Sign in again.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [walletData, withdrawalData] = await Promise.all([
          authApi.getModeratorWallet(token),
          authApi.getModeratorWithdrawals(token),
        ]);

        if (!active) return;

        const payoutAccount = walletData.wallet?.payoutAccount || null;
        const withdrawals = Array.isArray(withdrawalData.withdrawals)
          ? withdrawalData.withdrawals.map(normalizeWithdrawal)
          : [];

        setWallet({
          ...(walletData.wallet || {}),
          payoutAccount,
        });
        setHistory(withdrawals);
        setMinimumWithdrawal(
          Number(withdrawalData.minimumWithdrawal || 1000),
        );
        setEditingPayoutAccount(!payoutAccount);
        setForm((current) => ({
          ...current,
          bankName: payoutAccount?.bankName || "",
          accountName: payoutAccount?.accountName || "",
          accountNumber: "",
        }));
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message || "Could not load your withdrawals.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWithdrawals();

    return () => {
      active = false;
    };
  }, [token]);

  const availableBalance = Number(wallet?.availableBalance || 0);

  const pendingTotal = history
    .filter((item) => item.status === "Pending")
    .reduce((total, item) => total + item.amount, 0);

  const completedTotal = Number(
    wallet?.totalWithdrawn ??
      history
        .filter((item) => item.status === "Completed")
        .reduce((total, item) => total + item.amount, 0),
  );

  const filteredHistory = useMemo(() => {
    if (filter === "All") return history;
    return history.filter((item) => item.status === filter);
  }, [filter, history]);

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!token || !wallet) {
      setError("Your moderator wallet could not be loaded. Refresh and try again.");
      return;
    }

    const amount = Number(form.amount);

    if (!Number.isInteger(amount) || amount < minimumWithdrawal) {
      setError(
        `Enter a whole amount of at least ${formatAmount(minimumWithdrawal)}.`,
      );
      return;
    }

    if (amount > availableBalance) {
      setError("This amount is higher than your available balance.");
      return;
    }

    const existingAccount = wallet.payoutAccount;
    const needsNewAccount = !existingAccount || editingPayoutAccount;

    if (needsNewAccount) {
      if (!form.bankName.trim() || !form.accountName.trim()) {
        setError("Enter the bank name and account name.");
        return;
      }

      if (!/^\d{10}$/.test(form.accountNumber.replace(/\D/g, ""))) {
        setError("Enter a valid 10-digit Nigerian bank account number.");
        return;
      }
    }

    const bankName = needsNewAccount
      ? form.bankName.trim()
      : existingAccount.bankName;
    const maskedAccount = needsNewAccount
      ? `····${form.accountNumber.replace(/\D/g, "").slice(-4)}`
      : existingAccount.accountNumberMasked;

    setConfirmDialog({
      isOpen: true,
      title: "Process Withdrawal",
      message: `Request ${formatAmount(amount)} to ${bankName} account ${maskedAccount}? This moves the amount from your available balance into pending withdrawals.`,
      isDanger: true,
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        setSubmitting(true);

        try {
          let savedPayoutAccount = existingAccount;

          if (needsNewAccount) {
            const accountResult = await authApi.saveModeratorPayoutAccount(
              {
                bankName: form.bankName.trim(),
                accountName: form.accountName.trim(),
                accountNumber: form.accountNumber.replace(/\D/g, ""),
              },
              token,
            );

            savedPayoutAccount = accountResult.payoutAccount;
            setWallet((current) => ({
              ...current,
              payoutAccount: savedPayoutAccount,
            }));
          }

          const result = await authApi.requestModeratorWithdrawal(amount, token);

          setWallet((current) => ({
            ...current,
            ...(result.wallet || {}),
            payoutAccount: savedPayoutAccount,
          }));

          setHistory((current) => [
            normalizeWithdrawal(result.withdrawal),
            ...current,
          ]);

          setForm((current) => ({
            ...current,
            amount: "",
            accountNumber: "",
          }));
          setEditingPayoutAccount(false);
          setNotice(
            result.message || "Your withdrawal request has been submitted.",
          );
        } catch (requestError) {
          setError(
            requestError.message || "Could not submit the withdrawal request.",
          );
        } finally {
          setSubmitting(false);
        }
      },
    });
  }

  if (loading) {
    return (
      <main className="moderator-withdrawals moderator-withdrawals--loading">
        <div
          className="moderator-withdrawals__loader"
          role="status"
          aria-live="polite"
        >
          <span className="moderator-withdrawals__roller" aria-hidden="true">
            <i />
          </span>
          <strong>Loading your withdrawals</strong>
          <p>Getting your balance and withdrawal history.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="moderator-withdrawals">
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${confirmDialog.isDanger ? "bg-red-100" : "bg-green-100"}`}>
                <AlertCircle size={20} className={confirmDialog.isDanger ? "text-red-600" : "text-green-600"} />
              </div>
              <button onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmDialog.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  confirmDialog.isDanger ? "bg-red-600 hover:bg-red-700" : "bg-[#0d8a45] hover:bg-[#0a6e37]"
                }`}
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="moderator-withdrawals__inner">
        <header className="moderator-withdrawals__header">
          <div>
            <span className="moderator-withdrawals__eyebrow">Earnings</span>
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
          <div
            className="moderator-withdrawals__notice moderator-withdrawals__notice--error"
            role="alert"
          >
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
                  step="1"
                  inputMode="numeric"
                  value={form.amount}
                  onChange={(event) => updateForm("amount", event.target.value)}
                  placeholder="0"
                  required
                  disabled={loading || submitting}
                />
              </div>
              <small>
                Minimum withdrawal: {formatAmount(minimumWithdrawal)}
              </small>
            </label>

            <div className="moderator-payout-account">
              <div className="moderator-payout-account__heading">
                <Landmark size={16} />
                <strong>Bank transfer</strong>
              </div>

              {wallet?.payoutAccount && !editingPayoutAccount ? (
                <>
                  <p>
                    {wallet.payoutAccount.bankName} ·{" "}
                    {wallet.payoutAccount.accountName} ·{" "}
                    {wallet.payoutAccount.accountNumberMasked}
                  </p>
                  <button
                    type="button"
                    className="moderator-change-payout-account"
                    onClick={() => setEditingPayoutAccount(true)}
                    disabled={submitting}
                  >
                    Change payout account
                  </button>
                </>
              ) : (
                <>
                  <label>
                    Bank
                    <input
                      type="text"
                      value={form.bankName}
                      onChange={(event) =>
                        updateForm("bankName", event.target.value)
                      }
                      placeholder="e.g. GTBank"
                      required
                      disabled={submitting}
                    />
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
                      required
                      disabled={submitting}
                    />
                  </label>

                  <label>
                    10-digit account number
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={form.accountNumber}
                      onChange={(event) =>
                        updateForm(
                          "accountNumber",
                          event.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      placeholder="Enter account number"
                      required
                      disabled={submitting}
                    />
                  </label>

                  {wallet?.payoutAccount ? (
                    <button
                      type="button"
                      className="moderator-change-payout-account"
                      onClick={() => {
                        setEditingPayoutAccount(false);
                        setForm((current) => ({
                          ...current,
                          bankName: wallet.payoutAccount.bankName,
                          accountName: wallet.payoutAccount.accountName,
                          accountNumber: "",
                        }));
                      }}
                      disabled={submitting}
                    >
                      Keep saved account
                    </button>
                  ) : null}
                </>
              )}
            </div>

            <button
              type="submit"
              className="moderator-withdrawal-submit"
              disabled={loading || submitting || !wallet}
            >
              <ArrowDownToLine size={15} />
              {submitting ? "Submitting…" : "Place withdrawal"}
            </button>
          </form>

          <section className="moderator-withdrawal-history">
            <div className="moderator-withdrawal-history__heading">
              <div>
                <h2>Withdrawal history</h2>
                <p>Your previous payout requests.</p>
              </div>

              <div className="moderator-withdrawal-filters">
                {["All", "Pending", "Completed", "Rejected"].map((item) => (
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
                ))}
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
      <strong>{withdrawal.reference}</strong>
      <small>{withdrawal.provider}</small>
    </div>
    <div>
      <strong>{withdrawal.method}</strong>
      <small>{withdrawal.account}</small>
    </div>
    <strong>{formatAmount(withdrawal.amount)}</strong>
    <span className="moderator-withdrawal-date">
      {withdrawal.date}
    </span>
    <StatusBadge status={withdrawal.status} />
  </div>
))}
              {!loading && filteredHistory.length === 0 ? (
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