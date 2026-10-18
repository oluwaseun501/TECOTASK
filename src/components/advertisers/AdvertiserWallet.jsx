import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserWallet.css";

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60;

const formatNaira = (amount = 0) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

const formatDateTime = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getAuthToken = () =>
  sessionStorage.getItem("tecotaskToken") ||
  localStorage.getItem("tecotaskToken");

const transactionLabels = {
  deposit: "Wallet funding",
  campaign_reservation: "Campaign funded",
  campaign_spend: "Campaign spend",
  campaign_refund: "Campaign refund",
  admin_adjustment: "Wallet adjustment",
};

const getTransactionDisplay = (transaction) => {
  const isCredit = transaction.direction === "credit";
  const label = transactionLabels[transaction.type] || "Wallet transaction";

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
  const [searchParams, setSearchParams] = useSearchParams();

  const paymentReference = searchParams.get("reference") || "";

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [isStartingPayment, setIsStartingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadWallet() {
      const token = getAuthToken();

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
          setError(requestError.message || "Could not load your wallet.");
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

  useEffect(() => {
    if (!paymentReference) return undefined;

    const token = getAuthToken();

    if (!token) {
      navigate("/login", { replace: true });
      return undefined;
    }

    let isStopped = false;
    let timeoutId;
    let attempts = 0;

    setPaymentError("");
    setPaymentNotice("Checking your payment with KoraPay…");

    function clearPaymentReference() {
      setSearchParams(
        (currentParams) => {
          const nextParams = new URLSearchParams(currentParams);
          nextParams.delete("reference");
          return nextParams;
        },
        { replace: true },
      );
    }

    async function checkPaymentStatus() {
      if (isStopped) return;

      attempts += 1;

      try {
        const result = await authApi.getAdvertiserWalletTopUpStatus(
          paymentReference,
          token,
        );

        if (isStopped) return;

        const topUp = result.topUp;

        if (topUp?.status === "success") {
          setPaymentError("");
          setPaymentNotice("Payment confirmed. Your wallet has been funded.");

          try {
            const walletData = await authApi.getAdvertiserWallet(token);

            if (!isStopped) {
              setWallet(walletData.wallet || null);
              setTransactions(walletData.transactions || []);
            }
          } catch {
            // The payment is confirmed; the next wallet refresh
            // will show the credited balance.
          }

          clearPaymentReference();
          return;
        }

        if (topUp?.status === "failed") {
          setPaymentNotice("");
          setPaymentError(
            "The payment was not completed. Your wallet was not credited.",
          );
          clearPaymentReference();
          return;
        }

        if (topUp?.status === "review") {
          setPaymentNotice("");
          setPaymentError(
            result.message ||
              topUp.reviewReason ||
              "This payment needs review. Your wallet has not been credited.",
          );
          clearPaymentReference();
          return;
        }

        setPaymentNotice(
          "Payment is still processing. We’ll check again shortly.",
        );
      } catch {
        if (!isStopped) {
          setPaymentNotice(
            "Payment status is taking longer to load. Checking again shortly…",
          );
        }
      }

      if (attempts >= MAX_POLL_ATTEMPTS) {
        setPaymentNotice(
          "Payment is still awaiting confirmation. You can reload this page to check again.",
        );
        return;
      }

      timeoutId = window.setTimeout(checkPaymentStatus, POLL_INTERVAL_MS);
    }

    checkPaymentStatus();

    return () => {
      isStopped = true;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [paymentReference, navigate, setSearchParams]);

  async function handleStartTopUp(event) {
    event.preventDefault();

    setPaymentError("");
    setPaymentNotice("");

    const numericAmount = Number(amount);

    if (!Number.isSafeInteger(numericAmount) || numericAmount < 100) {
      setPaymentError("Enter a whole amount of at least ₦100.");
      return;
    }

    const token = getAuthToken();

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsStartingPayment(true);

    try {
      const result = await authApi.startAdvertiserWalletTopUp(
        numericAmount,
        token,
      );

      const checkoutUrl = result.topUp?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(
          "KoraPay did not return a checkout link. Please try again.",
        );
      }

      window.location.assign(checkoutUrl);
    } catch (requestError) {
      setPaymentError(
        requestError.message ||
          "Could not start the payment. Please try again.",
      );
      setIsStartingPayment(false);
    }
  }

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
          <p>Getting your balance and recent transactions…</p>
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
              You’ll complete payment securely on KoraPay. Your wallet is
              credited after TecoTask verifies the payment.
            </p>

            <form onSubmit={handleStartTopUp}>
              <label htmlFor="walletAmount">Amount (₦)</label>

              <input
                id="walletAmount"
                type="number"
                min="100"
                step="100"
                value={amount}
                onChange={(event) => {
  setAmount(event.target.value);
  setPaymentError("");
}}
                placeholder="Enter amount"
                disabled={isStartingPayment}
                required
              />

              <div className="advertiser-wallet-quick-amounts">
                {[10000, 25000, 50000].map((presetAmount) => (
                  <button
                    key={presetAmount}
                    type="button"
                    disabled={isStartingPayment}
                    onClick={() => setAmount(String(presetAmount))}
                  >
                    {formatNaira(presetAmount)}
                  </button>
                ))}
              </div>

              {paymentNotice && (
                <p
                  className="advertiser-payment-notice advertiser-payment-notice--pending"
                  role="status"
                  aria-live="polite"
                >
                  {paymentNotice}
                </p>
              )}

              {paymentError && (
                <p
                  className="advertiser-payment-notice advertiser-payment-notice--error"
                  role="alert"
                >
                  {paymentError}
                </p>
              )}

              <button
                type="submit"
                className="advertiser-fund-button"
                disabled={isStartingPayment || !amount}
              >
                <span>+</span>
                {isStartingPayment ? "Opening KoraPay…" : "Fund wallet"}
              </button>
            </form>
          </section>

          <section className="advertiser-wallet-protection">
            <span className="advertiser-wallet-protection__icon">♡</span>

            <div>
              <h2>Secure KoraPay checkout</h2>
              <p>
                Your payment status is checked securely by TecoTask before funds
                are added to your wallet.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
};

export default AdvertiserWallet;
