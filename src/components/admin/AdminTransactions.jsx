import { useMemo, useState } from "react";
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

const transactions = [
  {
    id: "TX-10482",
    date: "2025-02-14T10:42:00",
    description: "Campaign balance funded",
    reference: "CMP-7821",
    user: "Maya Chen",
    role: "Advertiser",
    type: "Campaign funding",
    amount: 1250,
    direction: "credit",
    status: "Completed",
    channel: "Card •••• 4821",
  },
  {
    id: "TX-10481",
    date: "2025-02-14T09:18:00",
    description: "Service payout — product review",
    reference: "SRV-4910",
    user: "Jon Bell",
    role: "Earner",
    type: "Earning payout",
    amount: 84.5,
    direction: "debit",
    status: "Completed",
    channel: "Teco wallet",
  },
  {
    id: "TX-10480",
    date: "2025-02-14T08:56:00",
    description: "Earner withdrawal request",
    reference: "WDR-2304",
    user: "Priya Nair",
    role: "Earner",
    type: "Withdrawal",
    amount: 210,
    direction: "debit",
    status: "Pending",
    channel: "Bank •••• 7732",
  },
  {
    id: "TX-10479",
    date: "2025-02-13T16:44:00",
    description: "Platform service fee",
    reference: "FEE-8832",
    user: "Maya Chen",
    role: "Advertiser",
    type: "Platform fee",
    amount: 18.75,
    direction: "credit",
    status: "Completed",
    channel: "Campaign wallet",
  },
  {
    id: "TX-10478",
    date: "2025-02-13T15:20:00",
    description: "Campaign funding reversed",
    reference: "CMP-7814",
    user: "Northstar Labs",
    role: "Advertiser",
    type: "Refund",
    amount: 400,
    direction: "debit",
    status: "Reversed",
    channel: "Card •••• 9014",
  },
  {
    id: "TX-10477",
    date: "2025-02-13T12:08:00",
    description: "Service payout — app testing",
    reference: "SRV-4887",
    user: "Luis Romero",
    role: "Earner",
    type: "Earning payout",
    amount: 52.25,
    direction: "debit",
    status: "Completed",
    channel: "Teco wallet",
  },
  {
    id: "TX-10476",
    date: "2025-02-13T11:34:00",
    description: "Campaign balance funded",
    reference: "CMP-7810",
    user: "Bramble & Co.",
    role: "Advertiser",
    type: "Campaign funding",
    amount: 890,
    direction: "credit",
    status: "Completed",
    channel: "Bank •••• 1180",
  },
  {
    id: "TX-10475",
    date: "2025-02-12T17:09:00",
    description: "Earner withdrawal request",
    reference: "WDR-2298",
    user: "Aisha Okafor",
    role: "Earner",
    type: "Withdrawal",
    amount: 125,
    direction: "debit",
    status: "Failed",
    channel: "Bank •••• 3201",
  },
  {
    id: "TX-10474",
    date: "2025-02-12T14:26:00",
    description: "Campaign payment refund",
    reference: "REF-1109",
    user: "Greenline Studio",
    role: "Advertiser",
    type: "Refund",
    amount: 75,
    direction: "debit",
    status: "Completed",
    channel: "Card •••• 6540",
  },
  {
    id: "TX-10473",
    date: "2025-02-12T10:02:00",
    description: "Service payout — data tagging",
    reference: "SRV-4871",
    user: "Jon Bell",
    role: "Earner",
    type: "Earning payout",
    amount: 31.2,
    direction: "debit",
    status: "Completed",
    channel: "Teco wallet",
  },
  {
    id: "TX-10472",
    date: "2025-02-11T18:37:00",
    description: "Platform service fee",
    reference: "FEE-8815",
    user: "Northstar Labs",
    role: "Advertiser",
    type: "Platform fee",
    amount: 9.5,
    direction: "credit",
    status: "Completed",
    channel: "Campaign wallet",
  },
  {
    id: "TX-10471",
    date: "2025-02-11T13:41:00",
    description: "Campaign balance funded",
    reference: "CMP-7799",
    user: "Kitehouse Media",
    role: "Advertiser",
    type: "Campaign funding",
    amount: 2100,
    direction: "credit",
    status: "Completed",
    channel: "Card •••• 1277",
  },
];

const statusOptions = [
  "All",
  "Completed",
  "Pending",
  "Failed",
  "Reversed",
];

const typeOptions = [
  "All types",
  "Campaign funding",
  "Earning payout",
  "Withdrawal",
  "Refund",
  "Platform fee",
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const formatDateTime = (date) =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

function getStatusClass(status) {
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
      {status}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`transaction-role transaction-role--${role.toLowerCase()}`}
    >
      {role}
    </span>
  );
}

function TransactionDetails({ transaction, onClose }) {
  return (
    <div className="transaction-drawer-overlay" onClick={onClose}>
      <aside
        className="transaction-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="transaction-drawer-header">
          <div>
            <span className="transaction-drawer-eyebrow">
              Transaction details
            </span>

            <h2>{transaction.id}</h2>
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

            <strong>
              {transaction.direction === "credit" ? "+" : "-"}
              {formatCurrency(transaction.amount)}
            </strong>

            <StatusBadge status={transaction.status} />
          </div>

          <div className="transaction-drawer-section">
            <span className="transaction-section-label">
              Audit information
            </span>

            <dl className="transaction-detail-list">
              <div>
                <dt>Description</dt>
                <dd>{transaction.description}</dd>
              </div>

              <div>
                <dt>Reference</dt>
                <dd>{transaction.reference}</dd>
              </div>

              <div>
                <dt>Initiated by</dt>
                <dd>{transaction.user}</dd>
              </div>

              <div>
                <dt>Account role</dt>
                <dd>{transaction.role}</dd>
              </div>

              <div>
                <dt>Transaction type</dt>
                <dd>{transaction.type}</dd>
              </div>

              <div>
                <dt>Channel</dt>
                <dd>{transaction.channel}</dd>
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
              This transaction is available for administrative review. Future
              processor events and settlement records can be displayed here.
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
      </aside>
    </div>
  );
}

export default function AdminTransactions() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState("All");
  const [activeType, setActiveType] = useState("All types");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const summary = useMemo(
    () => ({
      all: transactions.length,
      completed: transactions.filter(
        (transaction) => transaction.status === "Completed"
      ).length,
      pending: transactions.filter(
        (transaction) => transaction.status === "Pending"
      ).length,
      exceptions: transactions.filter(
        (transaction) =>
          transaction.status === "Failed" ||
          transaction.status === "Reversed"
      ).length,
    }),
    []
  );

  const filteredTransactions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        [
          transaction.id,
          transaction.reference,
          transaction.user,
          transaction.description,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        activeStatus === "All" || transaction.status === activeStatus;

      const matchesType =
        activeType === "All types" || transaction.type === activeType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, activeStatus, activeType]);

  const hasFilters =
    searchQuery || activeStatus !== "All" || activeType !== "All types";

  const clearFilters = () => {
    setSearchQuery("");
    setActiveStatus("All");
    setActiveType("All types");
  };

  const getStatusCount = (status) => {
    if (status === "All") return summary.all;

    return transactions.filter(
      (transaction) => transaction.status === status
    ).length;
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
              Review and audit every movement across the TecoTask marketplace.
            </p>
          </div>

          <button type="button" className="transactions-date-button">
            <CalendarDays size={15} />
            <span>Feb 11 – Feb 14, 2025</span>
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
                onClick={() => setActiveStatus(status)}
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
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search reference, name or description"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
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
                  onChange={(event) => setActiveType(event.target.value)}
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

          {filteredTransactions.length > 0 ? (
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
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <div className="transaction-name">
                            <span
                              className={`transaction-direction transaction-direction--${transaction.direction}`}
                            >
                              {transaction.direction === "credit" ? (
                                <ArrowDownLeft size={15} />
                              ) : (
                                <ArrowUpRight size={15} />
                              )}
                            </span>

                            <div>
                              <strong>{transaction.description}</strong>
                              <small>
                                {transaction.id} · {transaction.reference}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td className="transaction-date">
                          {formatDate(transaction.date)}
                        </td>

                        <td>
                          <div className="transaction-user">
                            <strong>{transaction.user}</strong>
                            <RoleBadge role={transaction.role} />
                          </div>
                        </td>

                        <td className="transaction-type">
                          {transaction.type}
                        </td>

                        <td>
                          <strong
                            className={`transaction-amount transaction-amount--${transaction.direction}`}
                          >
                            {transaction.direction === "credit" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </strong>
                        </td>

                        <td>
                          <StatusBadge status={transaction.status} />
                        </td>

                        <td className="transaction-channel">
                          {transaction.channel}
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
                {filteredTransactions.map((transaction) => (
                  <button
                    type="button"
                    key={transaction.id}
                    className="transaction-mobile-card"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <span
                      className={`transaction-direction transaction-direction--${transaction.direction}`}
                    >
                      {transaction.direction === "credit" ? (
                        <ArrowDownLeft size={15} />
                      ) : (
                        <ArrowUpRight size={15} />
                      )}
                    </span>

                    <span className="transaction-mobile-main">
                      <strong>{transaction.description}</strong>
                      <small>
                        {transaction.user} · {formatDate(transaction.date)}
                      </small>
                    </span>

                    <span className="transaction-mobile-side">
                      <strong
                        className={`transaction-amount transaction-amount--${transaction.direction}`}
                      >
                        {transaction.direction === "credit" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </strong>

                      <StatusBadge status={transaction.status} />
                    </span>
                  </button>
                ))}
              </div>

              <footer className="transactions-footer">
                Showing <strong>{filteredTransactions.length}</strong> of{" "}
                {transactions.length} transactions
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

              <button
                type="button"
                className="campaign-primary-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
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