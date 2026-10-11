import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import "../../styles/AdminWithdrawals.css";
import {
  getAdminWithdrawals,
  updateAdminWithdrawal,
} from "../data/adminWithdrawalsApi.js";

const roleTabs = [
  { key: "All", label: "All withdrawals" },
  { key: "Earner", label: "Earner withdrawals" },
  { key: "Moderator", label: "Moderator withdrawals" },
];

const statusTabs = [
  "All",
  "Pending",
  "Processing",
  "Paid",
  "Rejected",
  "Failed",
];

const statusValues = {
  Pending: "pending",
  Processing: "processing",
  Paid: "paid",
  Rejected: "rejected",
  Failed: "failed",
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date))
    : "—";

const formatDateTime = (date) =>
  date
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(date))
    : "—";

function StatusBadge({ status }) {
  const labels = {
    pending: "Pending",
    processing: "Processing",
    paid: "Paid",
    rejected: "Rejected",
    failed: "Failed",
  };

  const styleStatus =
    {
      processing: "pending",
      paid: "approved",
      failed: "rejected",
    }[status] || status;

  return (
    <span className={`withdrawal-status withdrawal-status--${styleStatus}`}>
      <span className="withdrawal-status-dot" />
      {labels[status] || status}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span className={`withdrawal-role withdrawal-role--${role.toLowerCase()}`}>
      {role === "Moderator" ? (
        <ShieldCheck size={12} />
      ) : (
        <UserRound size={12} />
      )}
      {role}
    </span>
  );
}

function WithdrawalDetails({ withdrawal }) {
  return (
    <section
      className="withdrawal-hover-details"
      aria-label={`Details for withdrawal ${withdrawal.id}`}
    >
      <div className="withdrawal-hover-details__header">
        <div>
          <span
            className="withdrawal-hover-details__eyebrow"
            id="withdrawal-modal-title"
          >
            Withdrawal details
          </span>
          <strong>{withdrawal.requester}</strong>
        </div>

        <StatusBadge status={withdrawal.status} />
      </div>

      <div className="withdrawal-hover-details__grid">
        <div className="withdrawal-hover-details__item">
          <span>Request ID</span>
          <strong>{withdrawal.id || "—"}</strong>
        </div>

        <div className="withdrawal-hover-details__item">
          <span>Email</span>
          <strong>{withdrawal.email || "—"}</strong>
        </div>

        <div className="withdrawal-hover-details__item">
          <span>Role</span>
          <strong>{withdrawal.role || "—"}</strong>
        </div>

        <div className="withdrawal-hover-details__item">
          <span>Amount</span>
          <strong>{formatCurrency(withdrawal.amount)}</strong>
        </div>

        <div className="withdrawal-hover-details__item">
          <span>Payment method</span>
          <strong>{withdrawal.method || "—"}</strong>
        </div>

        <div className="withdrawal-hover-details__item">
          <span>Account / destination</span>
          <strong>{withdrawal.account || "—"}</strong>
        </div>

        <div className="withdrawal-hover-details__item">
          <span>Requested</span>
          <strong>{formatDateTime(withdrawal.requestedAt)}</strong>
        </div>

        <div className="withdrawal-hover-details__item">
          <span>Payment reference</span>
          <strong>{withdrawal.paymentReference || "Not recorded"}</strong>
        </div>

        {withdrawal.reviewNote && (
          <div className="withdrawal-hover-details__item withdrawal-hover-details__item--note">
            <span>Review note</span>
            <strong>{withdrawal.reviewNote}</strong>
          </div>
        )}
      </div>
    </section>
  );
}

function WithdrawalRowActions({
  withdrawal,
  busy,
  onAction,
  mobile = false,
}) {
  const pending = withdrawal.status === "pending";
  const processing = withdrawal.status === "processing";

  if (!pending && !processing) {
    return mobile ? null : <span className="withdrawal-no-action">—</span>;
  }

  return (
    <div
      className={
        mobile ? "withdrawal-mobile-actions" : "withdrawal-row-actions"
      }
    >
      <button
        type="button"
        className="withdrawal-row-reject"
        disabled={busy}
        onClick={() => onAction(withdrawal, "reject")}
      >
        Reject
      </button>

      <button
        type="button"
        className="withdrawal-row-approve"
        disabled={busy}
        onClick={() => onAction(withdrawal, pending ? "process" : "pay")}
      >
        {pending ? "Process" : "Mark paid"}
      </button>

      {processing && (
        <button
          type="button"
          className="withdrawal-row-fail"
          disabled={busy}
          onClick={() => onAction(withdrawal, "fail")}
        >
          Mark failed
        </button>
      )}
    </div>
  );
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeRole, setActiveRole] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setWithdrawals(await getAdminWithdrawals());
    } catch (err) {
      setError(err.message || "Could not load withdrawals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedWithdrawal) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedWithdrawal(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedWithdrawal]);

  const summary = useMemo(() => {
    const pending = withdrawals.filter((item) => item.status === "pending");
    const paid = withdrawals.filter((item) => item.status === "paid");

    return {
      total: withdrawals.length,
      pending: pending.length,
      paid: paid.length,
      pendingAmount: pending.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
      paidAmount: paid.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0,
      ),
      earners: withdrawals.filter((item) => item.role === "Earner").length,
      moderators: withdrawals.filter((item) => item.role === "Moderator")
        .length,
    };
  }, [withdrawals]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return withdrawals.filter((item) => {
      const roleMatches =
        activeRole === "All" || item.role === activeRole;

      const statusMatches =
        activeStatus === "All" ||
        item.status === statusValues[activeStatus];

      const searchMatches =
        !query ||
        [
          item.id,
          item.requester,
          item.email,
          item.method,
          item.paymentReference,
        ].some((value) =>
          String(value || "").toLowerCase().includes(query),
        );

      return roleMatches && statusMatches && searchMatches;
    });
  }, [withdrawals, activeRole, activeStatus, searchQuery]);

  const runAction = async (withdrawal, action) => {
    const body = {};

    if (action === "pay") {
      const paymentReference = window.prompt(
        "Enter the payment reference after sending the payout:",
      );

      if (!paymentReference?.trim()) return;
      body.paymentReference = paymentReference.trim();
    }

    if (action === "reject" || action === "fail") {
      const reviewNote = window.prompt(
        `Enter a reason to ${action} this withdrawal:`,
      );

      if (!reviewNote?.trim()) return;
      body.reviewNote = reviewNote.trim();
    }

    setBusyId(withdrawal.id);
    setError("");

    try {
      await updateAdminWithdrawal(withdrawal, action, body);
      await load();
    } catch (err) {
      setError(err.message || "Could not update withdrawal.");
    } finally {
      setBusyId("");
    }
  };

  const countForRole = (role) =>
    role === "All"
      ? withdrawals.length
      : withdrawals.filter((item) => item.role === role).length;

  const countForStatus = (status) =>
    status === "All"
      ? withdrawals.length
      : withdrawals.filter(
          (item) => item.status === statusValues[status],
        ).length;

  const clearFilters = () => {
    setSearchQuery("");
    setActiveRole("All");
    setActiveStatus("All");
  };

  return (
    <main className="admin-withdrawals-page">
      <div className="admin-withdrawals-container">
        <header className="admin-withdrawals-header">
          <div>
            <span className="admin-withdrawals-eyebrow">
              Finance operations
            </span>
            <h1>All withdrawals</h1>
            <p>
              Review, process, and record payouts for earners and moderators.
            </p>
          </div>
        </header>

        <section className="withdrawal-summary-grid">
          <article className="withdrawal-summary-card">
            <div>
              <span>Total requests</span>
              <strong>{summary.total}</strong>
              <small>Earner and moderator requests</small>
            </div>
            <ArrowDownToLine size={18} />
          </article>

          <article className="withdrawal-summary-card withdrawal-summary-card--amber">
            <div>
              <span>Pending review</span>
              <strong>{summary.pending}</strong>
              <small>
                {formatCurrency(summary.pendingAmount)} awaiting review
              </small>
            </div>
            <Clock3 size={18} />
          </article>

          <article className="withdrawal-summary-card withdrawal-summary-card--green">
            <div>
              <span>Paid requests</span>
              <strong>{summary.paid}</strong>
              <small>{formatCurrency(summary.paidAmount)} paid</small>
            </div>
            <CheckCircle2 size={18} />
          </article>

          <article className="withdrawal-summary-card withdrawal-summary-card--blue">
            <div>
              <span>Earner requests</span>
              <strong>{summary.earners}</strong>
              <small>{summary.moderators} moderator requests</small>
            </div>
            <Users size={18} />
          </article>
        </section>

        <section className="withdrawal-content-card">
          <div className="withdrawal-tabs withdrawal-role-tabs">
            {roleTabs.map((role) => (
              <button
                type="button"
                key={role.key}
                className={`withdrawal-tab ${
                  activeRole === role.key ? "withdrawal-tab--active" : ""
                }`}
                onClick={() => setActiveRole(role.key)}
              >
                {role.label}
                <span>{countForRole(role.key)}</span>
              </button>
            ))}
          </div>

          <div className="withdrawal-tabs withdrawal-status-tabs">
            {statusTabs.map((status) => (
              <button
                type="button"
                key={status}
                className={`withdrawal-tab ${
                  activeStatus === status ? "withdrawal-tab--active" : ""
                }`}
                onClick={() => setActiveStatus(status)}
              >
                {status}
                <span>{countForStatus(status)}</span>
              </button>
            ))}
          </div>

          <div className="withdrawal-toolbar">
            <div className="withdrawal-search">
              <Search size={15} />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search requester, email or request ID"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  <XCircle size={14} />
                </button>
              )}
            </div>

            <div className="withdrawal-filter-actions">
              {(searchQuery ||
                activeRole !== "All" ||
                activeStatus !== "All") && (
                <button
                  type="button"
                  className="withdrawal-clear-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}

              <button
                type="button"
                className="withdrawal-clear-button"
                onClick={load}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                margin: "12px 16px",
                padding: 12,
                color: "#9f2424",
                background: "#fff0f0",
                borderRadius: 8,
              }}
            >
              {error}
            </div>
          )}

          {loading ? (
            <div
              className="withdrawals-empty-state withdrawal-loading"
              role="status"
              aria-live="polite"
            >
              <div
                className="withdrawal-loading__roller"
                aria-hidden="true"
              />
              <p>Loading withdrawal requests…</p>
            </div>
          ) : filtered.length ? (
            <>
              <div className="withdrawals-table-wrapper">
                <table className="withdrawals-table">
                  <thead>
                    <tr>
                      <th>Requester</th>
                      <th>Role</th>
                      <th>Amount</th>
                      <th>Payment method</th>
                      <th>Requested</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtered.map((item) => (
                      <tr
                        key={`${item.role}-${item.id}`}
                        className="withdrawal-data-row"
                      >
                        <td>
                          <button
                            type="button"
                            className="withdrawal-requester withdrawal-requester-trigger"
                            aria-label={`View withdrawal details for ${item.requester}`}
                            aria-haspopup="dialog"
                            onClick={() => setSelectedWithdrawal(item)}
                          >
                            <span className="withdrawal-avatar">
                              {item.requester
                                .split(" ")
                                .map((part) => part[0])
                                .join("")
                                .slice(0, 2)}
                            </span>
                            <span className="withdrawal-requester__text">
                              <strong>{item.requester}</strong>
                              <small>
                                {item.id} · {item.email}
                              </small>
                            </span>
                          </button>
                        </td>

                        <td><RoleBadge role={item.role} /></td>

                        <td>
                          <strong className="withdrawal-amount">
                            {formatCurrency(item.amount)}
                          </strong>
                        </td>

                        <td>
                          <div className="withdrawal-payment-method">
                            <strong>{item.method}</strong>
                            <small>{item.account}</small>
                          </div>
                        </td>

                        <td className="withdrawal-date">
                          {formatDate(item.requestedAt)}
                        </td>

                        <td><StatusBadge status={item.status} /></td>

                        <td>
                          <div className="withdrawal-row-actions">
                            <button
                              type="button"
                              className="withdrawal-view-button"
                              onClick={() => setSelectedWithdrawal(item)}
                            >
                              View
                            </button>

                            <WithdrawalRowActions
                              withdrawal={item}
                              busy={busyId === item.id}
                              onAction={runAction}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="withdrawals-mobile-list">
                {filtered.map((item) => (
                  <article
                    className="withdrawal-mobile-card"
                    key={`mobile-${item.role}-${item.id}`}
                  >
                    <div className="withdrawal-mobile-top">
                      <div className="withdrawal-requester">
                        <span className="withdrawal-avatar">
                          {item.requester
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        <div>
                          <strong>{item.requester}</strong>
                          <small>{item.id}</small>
                        </div>
                      </div>

                      <StatusBadge status={item.status} />
                    </div>

                    <div className="withdrawal-mobile-info">
                      <span>{item.role}</span>
                      <strong>{formatCurrency(item.amount)}</strong>
                      <small>{formatDate(item.requestedAt)}</small>
                    </div>

                    <button
                      type="button"
                      className="withdrawal-view-button"
                      onClick={() => setSelectedWithdrawal(item)}
                    >
                      View details
                    </button>

                    <WithdrawalRowActions
                      withdrawal={item}
                      busy={busyId === item.id}
                      onAction={runAction}
                      mobile
                    />
                  </article>
                ))}
              </div>

              <footer className="withdrawals-footer">
                Showing <strong>{filtered.length}</strong> of{" "}
                <strong>{withdrawals.length}</strong> withdrawal requests
              </footer>
            </>
          ) : (
            <div className="withdrawals-empty-state">
              <span><AlertCircle size={19} /></span>
              <h2>No withdrawal requests found</h2>
              <p>Try another search or remove an active filter.</p>
              <button
                type="button"
                className="withdrawal-primary-button"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>

      {selectedWithdrawal && (
        <div
          className="withdrawal-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedWithdrawal(null);
            }
          }}
        >
          <div
            className="withdrawal-modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="withdrawal-modal-title"
          >
            <button
              type="button"
              className="withdrawal-modal-close"
              aria-label="Close withdrawal details"
              onClick={() => setSelectedWithdrawal(null)}
            >
              <XCircle size={18} />
            </button>

            <WithdrawalDetails withdrawal={selectedWithdrawal} />
          </div>
        </div>
      )}
    </main>
  );
}