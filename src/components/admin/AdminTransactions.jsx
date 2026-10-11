import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileText,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import "../../styles/AdminTransactions.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const statusOptions = [
  "All",
  "Completed",
  "Pending",
  "Failed",
  "Reversed",
];

const typeOptions = [
  "All types",
  "Wallet funding",
  "Campaign reservation",
  "Campaign spend",
  "Refund",
  "Earning payout",
  "Withdrawal",
  "Moderator reward",
  "Admin adjustment",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatSignedAmount = (transaction) => {
  const amount = formatCurrency(transaction.amount);

  if (transaction.direction === "credit") return `+${amount}`;
  if (transaction.direction === "debit") return `-${amount}`;

  // A transfer moves money between wallet balances rather than in or out.
  return `↔ ${amount}`;
};

const getDirectionClass = (direction) =>
  direction === "credit" ? "credit" : "debit";

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const formatDateTime = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
};

function getStatusClass(status = "") {
  return status.toLowerCase();
}

function StatusBadge({ status }) {
  return (
    <span
      className={`transaction-status transaction-status--${getStatusClass(
        status
      )}`}
    >
      <span className="transaction-status-dot" />
      {status || "Unknown"}
    </span>
  );
}

function RoleBadge({ role }) {
  const safeRole = role || "Unknown";

  return (
    <span
      className={`transaction-role transaction-role--${safeRole.toLowerCase()}`}
    >
      {safeRole}
    </span>
  );
}

function DirectionIcon({ direction }) {
  if (direction === "credit") {
    return <ArrowDownLeft size={15} />;
  }

  return <ArrowUpRight size={15} />;
}

function TransactionDetails({ transaction, onClose }) {
  return (
    <div
      className="transaction-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="transaction-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="transaction-modal-title"
      >
        <div className="transaction-drawer-header">
          <div>
            <span className="transaction-drawer-eyebrow">
              Transaction details
            </span>
            <h2 id="transaction-modal-title">{transaction.id}</h2>
          </div>

          <button
            type="button"
            className="transaction-icon-button"
            onClick={onClose}
            aria-label="Close transaction details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="transaction-drawer-body">
          <div className="transaction-amount-card">
            <span>Recorded amount</span>
            <strong>{formatSignedAmount(transaction)}</strong>
            <StatusBadge status={transaction.status} />
          </div>

          <div className="transaction-drawer-section">
            <span className="transaction-section-label">
              Audit information
            </span>

            <dl className="transaction-detail-list">
              <div>
                <dt>Description</dt>
                <dd>{transaction.description || "—"}</dd>
              </div>
              <div>
                <dt>Reference</dt>
                <dd>{transaction.reference || "—"}</dd>
              </div>
              <div>
                <dt>Initiated by</dt>
                <dd>{transaction.user || "Unknown user"}</dd>
              </div>
              <div>
                <dt>Account role</dt>
                <dd>{transaction.role || "—"}</dd>
              </div>
              <div>
                <dt>Transaction type</dt>
                <dd>{transaction.type || "—"}</dd>
              </div>
              <div>
                <dt>Channel</dt>
                <dd>{transaction.channel || "—"}</dd>
              </div>
              <div>
                <dt>Date and time</dt>
                <dd>{formatDateTime(transaction.date)}</dd>
              </div>
            </dl>
          </div>

          <div className="transaction-drawer-note">
            <FileText size={16} />
            <p>
              Details shown here come from the recorded wallet or withdrawal
              information available to the admin system.
            </p>
          </div>
        </div>

        <div className="transaction-drawer-footer">
          <button
            type="button"
            className="transaction-secondary-button"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    all: 0,
    completed: 0,
    pending: 0,
    exceptions: 0,
  });
  const [statusCounts, setStatusCounts] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    pages: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeType, setActiveType] = useState("All types");
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const token =
          sessionStorage.getItem("tecotaskToken") ||
          localStorage.getItem("tecotaskToken");

        if (!token) {
          throw new Error(
            "Your login session is missing. Please sign in again."
          );
        }

        const params = new URLSearchParams({
          page: String(page),
          limit: "25",
          status: activeStatus,
          type: activeType === "All types" ? "All" : activeType,
          search: searchQuery.trim(),
        });

        const response = await fetch(
          `${API_BASE_URL}/api/admin/transactions?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Could not load transactions.");
        }

        if (cancelled) return;

        setTransactions(data.transactions || []);
        setSummary(
          data.summary || {
            all: 0,
            completed: 0,
            pending: 0,
            exceptions: 0,
          }
        );
        setStatusCounts(data.statusCounts || {});
        setPagination(
          data.pagination || {
            page: 1,
            limit: 25,
            total: 0,
            pages: 0,
          }
        );
        setLoadError("");
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Could not load transactions.");
          setTransactions([]);
          setSummary({
            all: 0,
            completed: 0,
            pending: 0,
            exceptions: 0,
          });
          setStatusCounts({});
          setPagination({
            page: 1,
            limit: 25,
            total: 0,
            pages: 0,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    page,
    activeStatus,
    activeType,
    searchQuery,
    refreshKey,
  ]);
  useEffect(() => {
    if (!selectedTransaction) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedTransaction(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedTransaction]);

  

  const hasFilters =
    Boolean(searchQuery) ||
    activeStatus !== "All" ||
    activeType !== "All types";

  const clearFilters = () => {
    setSearchQuery("");
    setActiveStatus("All");
    setActiveType("All types");
    setPage(1);
  };

  const getStatusCount = (status) =>
    status === "All" ? summary.all : statusCounts[status] || 0;

  const retryLoading = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <main className="admin-transactions-page">
      <div className="admin-transactions-container">
        <header className="admin-transactions-header">
          <div>
            <span className="admin-transactions-eyebrow">
              Finance operations
            </span>

            <h1>All transactions</h1>

            <p>
              Review and audit recorded wallet and withdrawal activity across
              the TecoTask marketplace.
            </p>
          </div>

          <button
            type="button"
            className="transactions-date-button"
            disabled
            title="Date range filtering is not available yet"
          >
            <CalendarDays size={15} />
            <span>All dates</span>
            <ChevronDown size={14} />
          </button>
        </header>

        <section className="transaction-summary-grid">
          <article className="transaction-summary-card">
            <div>
              <span>Ledger volume</span>
              <strong>{summary.all}</strong>
              <small>all records</small>
            </div>

            <CircleDollarSign size={18} />
          </article>

          <article className="transaction-summary-card transaction-summary-card--green">
            <div>
              <span>Completed</span>
              <strong>{summary.completed}</strong>
              <small>settled movements</small>
            </div>

            <CheckCircle2 size={18} />
          </article>

          <article className="transaction-summary-card transaction-summary-card--amber">
            <div>
              <span>Needs review</span>
              <strong>{summary.pending}</strong>
              <small>pending settlement</small>
            </div>

            <Clock3 size={18} />
          </article>

          <article className="transaction-summary-card transaction-summary-card--red">
            <div>
              <span>Exceptions</span>
              <strong>{summary.exceptions}</strong>
              <small>failed or reversed</small>
            </div>

            <AlertTriangle size={18} />
          </article>
        </section>

        <section className="transaction-content-card">
          <div className="transaction-tabs">
            {statusOptions.map((status) => (
              <button
                key={status}
                type="button"
                className={`transaction-tab ${
                  activeStatus === status ? "transaction-tab--active" : ""
                }`}
                onClick={() => {
                  setActiveStatus(status);
                  setPage(1);
                }}
              >
                {status}
                <span>{getStatusCount(status)}</span>
              </button>
            ))}
          </div>

          <div className="transaction-toolbar">
            <div className="transaction-search">
              <Search size={15} />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search reference, name or description"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="transaction-toolbar-actions">
              <label className="transaction-type-filter">
                <SlidersHorizontal size={14} />

                <select
                  value={activeType}
                  onChange={(event) => {
                    setActiveType(event.target.value);
                    setPage(1);
                  }}
                >
                  {typeOptions.map((type) => (
                    <option value={type} key={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <ChevronDown size={13} />
              </label>

              {hasFilters && (
                <button
                  type="button"
                  className="transaction-clear-button"
                  onClick={clearFilters}
                >
                  <X size={13} />
                  Clear filters
                </button>
              )}
            </div>
          </div>

     {loading ? (
  <div
    className="transactions-loading"
    role="status"
    aria-live="polite"
  >
    <div
      className="transactions-loading__roller"
      aria-hidden="true"
    />
    <strong>Loading transactions</strong>
    <p>Getting the latest transaction records from the server.</p>
  </div>
) : loadError ? (
  // Keep your existing error branch here
            <div className="transactions-empty-state" role="alert">
              <span>
                <AlertTriangle size={19} />
              </span>
              <h2>Could not load transactions</h2>
              <p>{loadError}</p>
              <button
                type="button"
                className="campaign-primary-button"
                onClick={retryLoading}
              >
                Try again
              </button>
            </div>
          ) : transactions.length > 0 ? (
            <>
              <div className="transactions-table-wrapper">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Date</th>
                      <th>User</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Channel</th>
                      <th />
                    </tr>
                  </thead>

                  <tbody>
                    {transactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <div className="transaction-name">
                            <span
                              className={`transaction-direction transaction-direction--${getDirectionClass(
                                transaction.direction
                              )}`}
                              title={
                                transaction.direction === "transfer"
                                  ? "Wallet balance transfer"
                                  : transaction.direction
                              }
                            >
                              <DirectionIcon
                                direction={transaction.direction}
                              />
                            </span>

                            <div>
                              <strong>
                                {transaction.description || "Transaction"}
                              </strong>
                              <small>
                                {transaction.id} ·{" "}
                                {transaction.reference || "No reference"}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="transaction-date">
                          {formatDate(transaction.date)}
                        </td>

                        <td>
                          <div className="transaction-user">
                            <strong>{transaction.user || "Unknown user"}</strong>
                            <RoleBadge role={transaction.role} />
                          </div>
                        </td>

                        <td className="transaction-type">
                          {transaction.type}
                        </td>

                        <td>
                          <strong
                            className={`transaction-amount transaction-amount--${getDirectionClass(
                              transaction.direction
                            )}`}
                          >
                            {formatSignedAmount(transaction)}
                          </strong>
                        </td>

                        <td>
                          <StatusBadge status={transaction.status} />
                        </td>

                        <td className="transaction-channel">
                          {transaction.channel || "—"}
                        </td>

                        <td>
                          <button
                            type="button"
                            className="transaction-view-button"
                            onClick={() =>
                              setSelectedTransaction(transaction)
                            }
                            aria-label={`View ${transaction.id}`}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="transactions-mobile-list">
                {transactions.map((transaction) => (
                  <button
                    type="button"
                    key={transaction.id}
                    className="transaction-mobile-card"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <span
                      className={`transaction-direction transaction-direction--${getDirectionClass(
                        transaction.direction
                      )}`}
                    >
                      <DirectionIcon direction={transaction.direction} />
                    </span>

                    <span className="transaction-mobile-main">
                      <strong>
                        {transaction.description || "Transaction"}
                      </strong>
                      <small>
                        {transaction.user || "Unknown user"} ·{" "}
                        {formatDate(transaction.date)}
                      </small>
                    </span>

                    <span className="transaction-mobile-side">
                      <strong
                        className={`transaction-amount transaction-amount--${getDirectionClass(
                          transaction.direction
                        )}`}
                      >
                        {formatSignedAmount(transaction)}
                      </strong>

                      <StatusBadge status={transaction.status} />
                    </span>
                  </button>
                ))}
              </div>

              <footer className="transactions-footer">
                <span>
                  Showing <strong>{transactions.length}</strong> of{" "}
                  {pagination.total} transactions
                </span>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <button
                    type="button"
                    disabled={page <= 1 || loading}
                    onClick={() =>
                      setPage((currentPage) => Math.max(1, currentPage - 1))
                    }
                  >
                    Previous
                  </button>

                  <span>
                    Page {page} of {Math.max(1, pagination.pages)}
                  </span>

                  <button
                    type="button"
                    disabled={
                      pagination.pages === 0 ||
                      page >= pagination.pages ||
                      loading
                    }
                    onClick={() => setPage((currentPage) => currentPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </footer>
            </>
          ) : (
            <div className="transactions-empty-state">
              <span>
                <Search size={19} />
              </span>

              <h2>No transactions found</h2>

              <p>
                Try a different search term or remove one of the active filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  className="campaign-primary-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {selectedTransaction && (
        <TransactionDetails
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </main>
  );
}