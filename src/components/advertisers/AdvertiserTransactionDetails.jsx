import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserTransactions.css";

const transactionLabels = {
  deposit: "Wallet funding",
  campaign_reservation: "Campaign funded",
  campaign_spend: "Campaign spend",
  campaign_refund: "Campaign refund",
  admin_adjustment: "Wallet adjustment",
};

const formatNaira = (amount) =>
  amount == null
    ? "—"
    : `₦${Number(amount).toLocaleString("en-NG")}`;

const formatDateParts = (value) => {
  if (!value) return { date: "—", time: "—" };

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return { date: "—", time: "—" };
  }

  return {
    date: parsed.toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: parsed.toLocaleTimeString("en-NG", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const AdvertiserTransactionDetails = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

   useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });

    let isMounted = true;
    async function loadTransaction() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      setIsLoading(true);
      setError("");
      setTransaction(null);

      try {
        const data = await authApi.getAdvertiserTransaction(
          transactionId,
          token,
        );

        if (isMounted) {
          setTransaction(data.transaction || null);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message || "Could not load this transaction.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTransaction();

    return () => {
      isMounted = false;
    };
  }, [navigate, transactionId]);

  

  if (isLoading) {
    return (
      <section className="advertiser-transaction-details-page">
        <div
          className="advertiser-transactions-state"
          role="status"
          aria-live="polite"
        >
          <span
            className="advertiser-transactions-state__roller"
            aria-hidden="true"
          >
            <span />
          </span>
          <span className="advertiser-transactions-visually-hidden">
  Loading transaction details
</span>
        </div>
      </section>
    );
  }

  if (error || !transaction) {
    return (
      <section className="advertiser-transaction-not-found">
        <h1>Transaction unavailable</h1>
        <p role={error ? "alert" : undefined}>
          {error || "This transaction could not be found."}
        </p>
        <Link to="/advertisers/transactions">
          Back to transaction history
        </Link>
      </section>
    );
  }

  const isCredit = transaction.direction === "credit";
  const typeClass = isCredit ? "credit" : "debit";
  const transactionType =
    transactionLabels[transaction.type] || "Wallet transaction";
  const { date, time } = formatDateParts(transaction.createdAt);
  const amount = `${isCredit ? "+" : "−"}${formatNaira(transaction.amount)}`;

  const details = [
    { label: "Date", value: date },
    { label: "Time", value: time },
    { label: "Transaction type", value: transactionType },
    ...(transaction.campaignId
      ? [{ label: "Campaign ID", value: transaction.campaignId }]
      : []),
    { label: "Reference", value: transaction.reference || "—" },
    {
      label: "Available balance before",
      value: formatNaira(transaction.availableBalanceBefore),
    },
    {
      label: "Available balance after",
      value: formatNaira(transaction.availableBalanceAfter),
    },
  ];

  return (
    <section className="advertiser-transaction-details-page">
      <Link
        to="/advertisers/transactions"
        className="advertiser-transaction-details-page__back"
      >
        ← Back to transaction history
      </Link>

      <section className="advertiser-transaction-detail-card">
        <div className="advertiser-transaction-detail-card__top">
          <div>
            <span className="advertiser-transaction-detail-card__eyebrow">
              Transaction details
            </span>

            <h1>{transactionType}</h1>

            <p>{transaction.description || transactionType}</p>
          </div>

          <span
            className={`advertiser-transaction-detail-card__icon ${typeClass}`}
            aria-hidden="true"
          >
            {isCredit ? "✓" : "↗"}
          </span>
        </div>

        <div className="advertiser-transaction-detail-card__amount">
          <span>Transaction amount</span>
          <strong className={typeClass}>{amount}</strong>
          <small>{isCredit ? "Credit" : "Debit"}</small>
        </div>

        <div className="advertiser-transaction-detail-card__info">
          {details.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default AdvertiserTransactionDetails;