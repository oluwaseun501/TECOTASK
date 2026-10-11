import { useCallback, useEffect, useMemo, useState } from "react";
import "../../styles/EarnersWallet.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  ""
).replace(/\/$/, "");

const EMPTY_WALLET = {
  summary: {
    availableBalance: 0,
    totalEarned: 0,
    pendingWithdrawal: 0,
    minimumWithdrawal: 2000,
  },
  payoutAccount: null,
  transactions: [],
};

const EMPTY_PAYOUT_FORM = {
  bankName: "",
  accountName: "",
  accountNumber: "",
};

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const capitalize = (value = "") =>
  value.charAt(0).toUpperCase() + value.slice(1);

const getToken = () => sessionStorage.getItem("tecotaskToken");

const apiRequest = async (path, options = {}) => {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...(options.body
      ? {
          body: JSON.stringify(options.body),
        }
      : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    sessionStorage.removeItem("tecotaskToken");
    window.location.assign("/login");
    throw new Error("Your session has expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
};

const EarnersWallet = () => {
  const [wallet, setWallet] = useState(EMPTY_WALLET);
  const [amount, setAmount] = useState("2000");

  const [loading, setLoading] = useState(true);
  const [submittingWithdrawal, setSubmittingWithdrawal] =
    useState(false);
  const [savingPayoutAccount, setSavingPayoutAccount] =
    useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [payoutForm, setPayoutForm] = useState(
    EMPTY_PAYOUT_FORM,
  );

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setMessage({
      type: "",
      text: "",
    });

    try {
      const data = await apiRequest("/api/earner/wallet");

      setWallet({
        summary: {
          ...EMPTY_WALLET.summary,
          ...(data.summary || {}),
        },
        payoutAccount: data.payoutAccount || null,
        transactions: Array.isArray(data.transactions)
          ? data.transactions
          : [],
      });

      if (data.payoutAccount) {
        setPayoutForm({
          bankName: data.payoutAccount.bankName || "",
          accountName: data.payoutAccount.accountName || "",
          accountNumber: "",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Could not load your wallet.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const availableBalance = Number(
    wallet.summary.availableBalance || 0,
  );

  const minimumWithdrawal = Number(
    wallet.summary.minimumWithdrawal || 2000,
  );

  const numericAmount = Number(amount);

  const canWithdraw =
    Number.isFinite(numericAmount) &&
    Number.isInteger(numericAmount) &&
    numericAmount >= minimumWithdrawal &&
    numericAmount <= availableBalance &&
    Boolean(wallet.payoutAccount);

  const quickAmounts = useMemo(() => {
    const values = [minimumWithdrawal, 2500, 4000];

    return values.filter(
      (value, index) =>
        value <= availableBalance &&
        values.indexOf(value) === index,
    );
  }, [availableBalance, minimumWithdrawal]);

  const selectAmount = (value) => {
    setAmount(String(value));
    setMessage({
      type: "",
      text: "",
    });
  };

  const handleWithdraw = async (event) => {
    event.preventDefault();

    if (!wallet.payoutAccount) {
      setMessage({
        type: "error",
        text: "Add a payout account before requesting a withdrawal.",
      });
      return;
    }

    if (
      !Number.isFinite(numericAmount) ||
      !Number.isInteger(numericAmount)
    ) {
      setMessage({
        type: "error",
        text: "Enter a valid whole-number withdrawal amount.",
      });
      return;
    }

    if (numericAmount < minimumWithdrawal) {
      setMessage({
        type: "error",
        text: `The minimum withdrawal amount is ${formatCurrency(
          minimumWithdrawal,
        )}.`,
      });
      return;
    }

    if (numericAmount > availableBalance) {
      setMessage({
        type: "error",
        text: "This amount is higher than your available balance.",
      });
      return;
    }

    setSubmittingWithdrawal(true);
    setMessage({
      type: "",
      text: "",
    });

    try {
      const data = await apiRequest(
        "/api/earner/wallet/withdrawals",
        {
          method: "POST",
          body: {
            amount: numericAmount,
          },
        },
      );

      if (data.wallet) {
        setWallet({
          summary: {
            ...EMPTY_WALLET.summary,
            ...(data.wallet.summary || {}),
          },
          payoutAccount: data.wallet.payoutAccount || null,
          transactions: Array.isArray(data.wallet.transactions)
            ? data.wallet.transactions
            : [],
        });
      } else {
        await loadWallet();
      }

      setAmount(String(minimumWithdrawal));

      setMessage({
        type: "success",
        text:
          data.message ||
          `Your withdrawal request for ${formatCurrency(
            numericAmount,
          )} has been submitted.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Could not submit your withdrawal request.",
      });
    } finally {
      setSubmittingWithdrawal(false);
    }
  };
const handleSavePayoutAccount = async (event) => {
  event.preventDefault();

  const bankName = payoutForm.bankName.trim();
  const accountName = payoutForm.accountName.trim();
  const accountNumber = payoutForm.accountNumber
    .replace(/\D/g, "")
    .trim();

  if (
    !bankName ||
    !accountName ||
    !/^\d{10}$/.test(accountNumber)
  ) {
    setMessage({
      type: "error",
      text:
        "Enter a bank name, account name, and valid 10-digit account number.",
    });
    return;
  }

  setSavingPayoutAccount(true);
  setMessage({ type: "", text: "" });

  try {
    const data = await apiRequest(
      "/api/earner/wallet/payout-account",
      {
        method: "PUT",
        body: { bankName, accountName, accountNumber },
      },
    );

    setWallet((currentWallet) => ({
      ...currentWallet,
      payoutAccount: data.payoutAccount,
    }));

    setPayoutForm((currentForm) => ({
      ...currentForm,
      accountNumber: "",
    }));

    setMessage({
      type: "success",
      text: data.message || "Payout account saved.",
    });
  } catch (error) {
    setMessage({
      type: "error",
      text: error.message || "Could not save your payout account.",
    });
  } finally {
    setSavingPayoutAccount(false);
  }
};

  const handlePayoutChange = (field, value) => {
    setPayoutForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  if (loading) {
  return (
    <section className="earner-wallet wallet-loading-state">
      <div
        className="wallet-loading-state__inner"
        role="status"
        aria-live="polite"
      >
        <span
          className="wallet-loading-state__roller"
          aria-hidden="true"
        >
          <span />
        </span>
        <p>Loading your wallet...</p>
      </div>
    </section>
  );
}

  return (
    <section className="earner-wallet">
      <div className="earner-wallet__heading">
        <div>
          <span>Money and transactions</span>
          <h1>Wallet</h1>
          <p>
            Your earnings, withdrawals, and full transaction history.
          </p>
        </div>
      </div>

      {message.text && (
        <p
          className={`wallet-message ${
            message.type === "success"
              ? "wallet-message--success"
              : "wallet-message--error"
          }`}
          role="status"
          style={{
            marginTop: "16px",
            fontSize: "10px",
          }}
        >
          {message.text}
        </p>
      )}

      <section className="wallet-summary">
        <article className="wallet-summary__balance">
          <span>Available balance</span>

          <strong>
            {loading
              ? "Loading..."
              : formatCurrency(availableBalance)}
          </strong>

          <small>
            Withdraw from {formatCurrency(minimumWithdrawal)}
          </small>
        </article>

        <article className="wallet-summary__stat">
          <span>Total earned</span>

          <strong>
            {loading
              ? "Loading..."
              : formatCurrency(wallet.summary.totalEarned)}
          </strong>

          <small>Since joining TecoTask</small>
        </article>

        <article className="wallet-summary__stat">
          <span>Pending withdrawal</span>

          <strong>
            {loading
              ? "Loading..."
              : formatCurrency(
                  wallet.summary.pendingWithdrawal,
                )}
          </strong>

          <small>
            {Number(wallet.summary.pendingWithdrawal || 0) > 0
              ? "Transfer awaiting processing"
              : "No transfers pending"}
          </small>
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
            {loading && (
              <article className="wallet-transaction">
                <div className="wallet-transaction__details">
                  <strong>Loading transactions...</strong>
                  <small>Please wait.</small>
                </div>
              </article>
            )}

            {!loading &&
              wallet.transactions.length === 0 && (
                <article className="wallet-transaction">
                  <div className="wallet-transaction__details">
                    <strong>No transactions yet</strong>
                    <small>
                      Completed task earnings will appear here.
                    </small>
                  </div>
                </article>
              )}

            {!loading &&
              wallet.transactions.map((transaction) => {
                const transactionType =
                  transaction.type === "debit"
                    ? "debit"
                    : "credit";

                const transactionStatus = capitalize(
                  transaction.status || "successful",
                );

                return (
                  <article
                    key={transaction.id}
                    className="wallet-transaction"
                  >
                    <span
                      className={`wallet-transaction__icon ${transactionType}`}
                    >
                      {transaction.icon ||
                        (transactionType === "credit"
                          ? "↙"
                          : "↗")}
                    </span>

                    <div className="wallet-transaction__details">
                      <strong>{transaction.title}</strong>
                      <small>{transaction.meta}</small>
                    </div>

                    <div
                      className={`wallet-transaction__amount ${transactionType}`}
                    >
                      <strong>
                        {transactionType === "credit" ? "+" : "-"}{" "}
                        {formatCurrency(transaction.amount)}
                      </strong>

                      <span
                        style={
                          transactionStatus.toLowerCase() !==
                            "successful" &&
                          transactionStatus.toLowerCase() !== "paid"
                            ? {
                                background: "#fef3c7",
                                color: "#b45309",
                              }
                            : undefined
                        }
                      >
                        {transactionStatus}
                      </span>
                    </div>
                  </article>
                );
              })}
          </div>
        </section>

        <aside className="wallet-actions">
          <section className="wallet-withdraw-card">
            <h2>Withdraw to bank</h2>

            <p>
              Minimum {formatCurrency(minimumWithdrawal)}. Your
              request will be reviewed before payout.
            </p>

            <form onSubmit={handleWithdraw}>
              <label htmlFor="withdrawAmount">Amount (₦)</label>

              <input
                id="withdrawAmount"
                name="withdrawAmount"
                type="number"
                min={minimumWithdrawal}
                max={availableBalance || undefined}
                step="100"
                value={amount}
                disabled={
                  loading ||
                  submittingWithdrawal ||
                  !wallet.payoutAccount
                }
                onChange={(event) => {
                  setAmount(event.target.value);
                  setMessage({
                    type: "",
                    text: "",
                  });
                }}
              />

              {quickAmounts.length > 0 && (
                <div className="wallet-quick-amounts">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      disabled={
                        loading || submittingWithdrawal
                      }
                      onClick={() => selectAmount(quickAmount)}
                    >
                      {formatCurrency(quickAmount)}
                    </button>
                  ))}
                </div>
              )}

              {wallet.payoutAccount ? (
                <div className="wallet-bank-card">
                  <span className="wallet-bank-card__icon">
                    ▣
                  </span>

                  <div>
                    <strong>
  {wallet.payoutAccount.bankName}{" "}
  {wallet.payoutAccount.accountNumberMasked}
</strong>

                    <small>
                      {wallet.payoutAccount.accountName}
                    </small>
                  </div>
                </div>
              ) : (
                <div
                  className="wallet-bank-card"
                  style={{
                    background: "#fff7ed",
                    border: "1px solid #fed7aa",
                  }}
                >
                  <span
                    className="wallet-bank-card__icon"
                    style={{ color: "#c2410c" }}
                  >
                    !
                  </span>

                  <div>
                    <strong style={{ color: "#9a3412" }}>
                      No payout account connected
                    </strong>

                    <small>
                      Add an account below before withdrawing.
                    </small>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="wallet-withdraw-button"
                disabled={
                  loading ||
                  submittingWithdrawal ||
                  !wallet.payoutAccount ||
                  !canWithdraw
                }
                style={{
                  opacity:
                    loading ||
                    submittingWithdrawal ||
                    !wallet.payoutAccount ||
                    !canWithdraw
                      ? 0.55
                      : 1,
                  cursor:
                    loading ||
                    submittingWithdrawal ||
                    !wallet.payoutAccount ||
                    !canWithdraw
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <span>{submittingWithdrawal ? "..." : "▣"}</span>

                {submittingWithdrawal
                  ? "Submitting request..."
                  : "Withdraw funds"}
              </button>
            </form>

            <details
              style={{
                marginTop: "18px",
                borderTop: "1px solid #f1f5f9",
                paddingTop: "14px",
              }}
              open={!wallet.payoutAccount}
            >
              <summary
                style={{
                  color: "#16a34a",
                  cursor: "pointer",
                  fontSize: "9px",
                  fontWeight: 600,
                }}
              >
                {wallet.payoutAccount
                  ? "Update payout account"
                  : "Add payout account"}
              </summary>

              <form
                onSubmit={handleSavePayoutAccount}
                style={{ marginTop: "14px" }}
              >
                <label htmlFor="bankName">Bank name</label>

                <input
                  id="bankName"
                  name="bankName"
                  type="text"
                  placeholder="GTBank"
                  value={payoutForm.bankName}
                  disabled={savingPayoutAccount}
                  onChange={(event) =>
                    handlePayoutChange(
                      "bankName",
                      event.target.value,
                    )
                  }
                />

                <label
                  htmlFor="accountName"
                  style={{ marginTop: "12px" }}
                >
                  Account name
                </label>

                <input
                  id="accountName"
                  name="accountName"
                  type="text"
                  placeholder="Your account name"
                  value={payoutForm.accountName}
                  disabled={savingPayoutAccount}
                  onChange={(event) =>
                    handlePayoutChange(
                      "accountName",
                      event.target.value,
                    )
                  }
                />

                <label
  htmlFor="accountNumber"
  style={{ marginTop: "12px" }}
>
  Bank account number
</label>

<input
  id="accountNumber"
  name="accountNumber"
  type="text"
  inputMode="numeric"
  maxLength={10}
  placeholder="0123456789"
  value={payoutForm.accountNumber}
  disabled={savingPayoutAccount}
  onChange={(event) =>
    handlePayoutChange(
      "accountNumber",
      event.target.value.replace(/\D/g, "").slice(0, 10),
    )
  }
/>

                <button
                  type="submit"
                  disabled={savingPayoutAccount}
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "36px",
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: "12px",
                    border: 0,
                    borderRadius: "8px",
                    background: "#eaf8ee",
                    color: "#15803d",
                    cursor: savingPayoutAccount
                      ? "not-allowed"
                      : "pointer",
                    font: '600 9px "Poppins", sans-serif',
                    opacity: savingPayoutAccount ? 0.6 : 1,
                  }}
                >
                  {savingPayoutAccount
                    ? "Saving..."
                    : "Save payout account"}
                </button>
              </form>
            </details>
          </section>

          <section className="wallet-protection-card">
            <span className="wallet-protection-card__icon">
              ♡
            </span>

            <div>
              <h2>Your money is protected</h2>

             <p>
  TecoTask payouts are made through secure bank transfers.
  Your earnings are sent only to a verified bank account in
  your own name.
</p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default EarnersWallet;