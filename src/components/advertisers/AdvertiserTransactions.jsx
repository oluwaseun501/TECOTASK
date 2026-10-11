import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserTransactions.css";

const PAGE_SIZE = 20;

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

  return {
    title: transactionLabels[transaction.type] || "Wallet transaction",
    typeClass: isCredit ? "credit" : "debit",
    icon: isCredit ? "✓" : "↗",
    amount: `${isCredit ? "+" : "−"}${formatNaira(transaction.amount)}`,
    directionLabel: isCredit ? "Credit" : "Debit",
    meta: [
      formatDateTime(transaction.createdAt),
      transaction.description || transaction.reference,
    ]
      .filter(Boolean)
      .join(" · "),
  };
};

const AdvertiserTransactions = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
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

    async function loadTransactions() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const data = await authApi.getAdvertiserTransactions(
          page,
          PAGE_SIZE,
          token,
        );

        if (!isMounted) return;

        setTransactions(
          Array.isArray(data.transactions) ? data.transactions : [],
        );

        setPagination(
          data.pagination || {
            page,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
          },
        );
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message || "Could not load transaction history.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      isMounted = false;
    };
  }, [navigate, page]);

  

  const total = Number(pagination.total || 0);
  const totalPages = Number(pagination.totalPages || 0);
  const firstItem = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(page * PAGE_SIZE, total);

  if (isLoading) {
    return (
      <section className="advertiser-transactions-page">
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

  if (error) {
    return (
      <section className="advertiser-transactions-page">
        <p className="advertiser-transactions-error" role="alert">
          {error}
        </p>
        <Link to="/advertisers/wallet">
          Back to wallet
        </Link>
      </section>
    );
  }

  return (
    <section className="advertiser-transactions-page">
      <div className="advertiser-transactions-page__heading">
        <div>
          <span>Wallet activity</span>
          <h1>Transaction history</h1>
          <p>View wallet funding and campaign charges on your account.</p>
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
              {total} {total === 1 ? "transaction" : "transactions"} recorded
            </p>
          </div>

          <span className="advertiser-all-transactions__range">
            Showing {firstItem}–{lastItem} of {total}
          </span>
        </div>

        <div className="advertiser-full-transaction-list">
          {transactions.length === 0 ? (
            <p className="advertiser-transactions-empty">
              No wallet transactions yet.
            </p>
          ) : (
            transactions.map((transaction) => {
              const display = getTransactionDisplay(transaction);

              return (
                <Link
                  key={transaction.id}
                  to={`/advertisers/transactions/${transaction.id}`}
                  className="advertiser-full-transaction"
                >
                  <span
                    className={`advertiser-full-transaction__icon ${display.typeClass}`}
                  >
                    {display.icon}
                  </span>

                  <div className="advertiser-full-transaction__details">
                    <strong>{display.title}</strong>
                    <small>{display.meta}</small>
                  </div>

                  <div
                    className={`advertiser-full-transaction__amount ${display.typeClass}`}
                  >
                    <strong>{display.amount}</strong>
                    <span>{display.directionLabel}</span>
                  </div>

                  <span className="advertiser-full-transaction__arrow">
                    →
                  </span>
                </Link>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div
            className="advertiser-transactions-pagination"
            aria-label="Transaction history pages"
          >
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1}
            >
              ← Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page >= totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </section>
    </section>
  );
};

export default AdvertiserTransactions;