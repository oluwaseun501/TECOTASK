
import { useMemo, useState } from "react";
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

const allowedWithdrawalRoles = ["Earner", "Moderator"];

const roleTabs = [
  {
    key: "All",
    label: "All withdrawals",
  },
  {
    key: "Earner",
    label: "Earner withdrawals",
  },
  {
    key: "Moderator",
    label: "Moderator withdrawals",
  },
];

const statusTabs = ["All", "Pending", "Approved", "Rejected"];

const initialWithdrawals = [
  {
    id: "WD-2304",
    requester: "Priya Nair",
    email: "priya.nair@example.com",
    role: "Earner",
    amount: 210,
    method: "Bank transfer",
    account: "•••• 7732",
    requestedAt: "2025-02-14T08:56:00",
    status: "Pending",
    note: "Regular weekly withdrawal",
  },
  {
    id: "WD-2303",
    requester: "Aisha Okafor",
    email: "aisha.okafor@example.com",
    role: "Earner",
    amount: 125,
    method: "Bank transfer",
    account: "•••• 3201",
    requestedAt: "2025-02-13T17:09:00",
    status: "Pending",
    note: "Withdrawal after completed campaign tasks",
  },
  {
    id: "WD-2302",
    requester: "Daniel Mensah",
    email: "daniel.mensah@example.com",
    role: "Moderator",
    amount: 480,
    method: "Bank transfer",
    account: "•••• 1190",
    requestedAt: "2025-02-13T14:22:00",
    status: "Pending",
    note: "Monthly moderator compensation",
  },
  {
    id: "WD-2301",
    requester: "Jon Bell",
    email: "jon.bell@example.com",
    role: "Earner",
    amount: 84.5,
    method: "Teco wallet",
    account: "Wallet balance",
    requestedAt: "2025-02-12T11:18:00",
    status: "Approved",
    note: "Service payout withdrawal",
  },
  {
    id: "WD-2300",
    requester: "Grace Williams",
    email: "grace.williams@example.com",
    role: "Moderator",
    amount: 350,
    method: "Bank transfer",
    account: "•••• 4501",
    requestedAt: "2025-02-11T16:43:00",
    status: "Approved",
    note: "Moderator monthly payout",
  },
  {
    id: "WD-2299",
    requester: "Luis Romero",
    email: "luis.romero@example.com",
    role: "Earner",
    amount: 52.25,
    method: "Teco wallet",
    account: "Wallet balance",
    requestedAt: "2025-02-11T12:08:00",
    status: "Rejected",
    note: "Account verification incomplete",
  },
  {
    id: "WD-2298",
    requester: "Mariam Bello",
    email: "mariam.bello@example.com",
    role: "Earner",
    amount: 180,
    method: "Bank transfer",
    account: "•••• 6767",
    requestedAt: "2025-02-10T09:40:00",
    status: "Approved",
    note: "Completed service withdrawal",
  },
  {
    id: "WD-2297",
    requester: "Samuel Adeyemi",
    email: "samuel.adeyemi@example.com",
    role: "Moderator",
    amount: 275,
    method: "Bank transfer",
    account: "•••• 8855",
    requestedAt: "2025-02-09T14:12:00",
    status: "Rejected",
    note: "Duplicate withdrawal request",
  },
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

function StatusBadge({ status }) {
  return (
    <span
      className={`withdrawal-status withdrawal-status--${status.toLowerCase()}`}
    >
      <span className="withdrawal-status-dot" />
      {status}
    </span>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`withdrawal-role withdrawal-role--${role.toLowerCase()}`}
    >
      {role === "Moderator" ? (
        <ShieldCheck size={12} />
      ) : (
        <UserRound size={12} />
      )}

      {role}
    </span>
  );
}

function WithdrawalDetails({ withdrawal, onClose }) {
  return (
    <div className="withdrawal-drawer-overlay" onClick={onClose}>
      <aside
        className="withdrawal-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="withdrawal-drawer-header">
          <div>
            <span className="withdrawal-drawer-eyebrow">
              Withdrawal request
            </span>

            <h2>{withdrawal.id}</h2>
          </div>

          <button
            type="button"
            className="withdrawal-close-button"
            onClick={onClose}
            aria-label="Close withdrawal details"
          >
            <XCircle size={19} />
          </button>
        </div>

        <div className="withdrawal-drawer-body">
          <div className="withdrawal-detail-amount">
            <span>Requested amount</span>

            <strong>{formatCurrency(withdrawal.amount)}</strong>

            <StatusBadge status={withdrawal.status} />
          </div>

          <div className="withdrawal-detail-section">
            <span className="withdrawal-section-label">
              Request information
            </span>

            <dl className="withdrawal-detail-list">
              <div>
                <dt>Requester</dt>
                <dd>{withdrawal.requester}</dd>
              </div>

              <div>
                <dt>Email</dt>
                <dd>{withdrawal.email}</dd>
              </div>

              <div>
                <dt>Account role</dt>
                <dd>
                  <RoleBadge role={withdrawal.role} />
                </dd>
              </div>

              <div>
                <dt>Payment method</dt>
                <dd>{withdrawal.method}</dd>
              </div>

              <div>
                <dt>Account</dt>
                <dd>{withdrawal.account}</dd>
              </div>

              <div>
                <dt>Requested</dt>
                <dd>{formatDateTime(withdrawal.requestedAt)}</dd>
              </div>

              <div>
                <dt>Note</dt>
                <dd>{withdrawal.note}</dd>
              </div>
            </dl>
          </div>

          {withdrawal.status === "Pending" && (
            <div className="withdrawal-drawer-actions">
              <button
                type="button"
                className="withdrawal-reject-button"
                onClick={() => {
                  withdrawal.onReject(withdrawal.id);
                  onClose();
                }}
              >
                <XCircle size={15} />
                Reject request
              </button>

              <button
                type="button"
                className="withdrawal-approve-button"
                onClick={() => {
                  withdrawal.onApprove(withdrawal.id);
                  onClose();
                }}
              >
                <CheckCircle2 size={15} />
                Approve withdrawal
              </button>
            </div>
          )}
        </div>

        <div className="withdrawal-drawer-footer">
          <button
            type="button"
            className="withdrawal-secondary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState(initialWithdrawals);
  const [activeRole, setActiveRole] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  const eligibleWithdrawals = useMemo(
    () =>
      withdrawals.filter((withdrawal) =>
        allowedWithdrawalRoles.includes(withdrawal.role)
      ),
    [withdrawals]
  );

  const summary = useMemo(() => {
    const pending = eligibleWithdrawals.filter(
      (withdrawal) => withdrawal.status === "Pending"
    );

    const approved = eligibleWithdrawals.filter(
      (withdrawal) => withdrawal.status === "Approved"
    );

    return {
      total: eligibleWithdrawals.length,
      pending: pending.length,
      approved: approved.length,
      pendingAmount: pending.reduce(
        (total, withdrawal) => total + withdrawal.amount,
        0
      ),
      approvedAmount: approved.reduce(
        (total, withdrawal) => total + withdrawal.amount,
        0
      ),
    };
  }, [eligibleWithdrawals]);

  const filteredWithdrawals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return eligibleWithdrawals.filter((withdrawal) => {
      const matchesSearch =
        !query ||
        [
          withdrawal.id,
          withdrawal.requester,
          withdrawal.email,
          withdrawal.method,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesRole =
        activeRole === "All" || withdrawal.role === activeRole;

      const matchesStatus =
        activeStatus === "All" || withdrawal.status === activeStatus;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [
    eligibleWithdrawals,
    searchQuery,
    activeRole,
    activeStatus,
  ]);

  const updateWithdrawalStatus = (id, status) => {
    setWithdrawals((currentWithdrawals) =>
      currentWithdrawals.map((withdrawal) =>
        withdrawal.id === id
          ? {
              ...withdrawal,
              status,
            }
          : withdrawal
      )
    );

    setSelectedWithdrawal(null);
  };

  const approveWithdrawal = (id) => {
    updateWithdrawalStatus(id, "Approved");
  };

  const rejectWithdrawal = (id) => {
    updateWithdrawalStatus(id, "Rejected");
  };

  const getStatusCount = (status) => {
    if (status === "All") {
      return eligibleWithdrawals.length;
    }

    return eligibleWithdrawals.filter(
      (withdrawal) => withdrawal.status === status
    ).length;
  };

  const getRoleCount = (role) => {
    if (role === "All") {
      return eligibleWithdrawals.length;
    }

    return eligibleWithdrawals.filter(
      (withdrawal) => withdrawal.role === role
    ).length;
  };

  const hasFilters =
    searchQuery ||
    activeRole !== "All" ||
    activeStatus !== "All";

  const clearFilters = () => {
    setSearchQuery("");
    setActiveRole("All");
    setActiveStatus("All");
  };

  const openDetails = (withdrawal) => {
    setSelectedWithdrawal({
      ...withdrawal,
      onApprove: approveWithdrawal,
      onReject: rejectWithdrawal,
    });
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
              Review, approve, and reject withdrawal requests from earners and
              moderators.
            </p>
          </div>

          <div className="withdrawals-live-indicator">
            <span />
            Live withdrawal queue
          </div>
        </header>

        <section className="withdrawal-summary-grid">
          <article className="withdrawal-summary-card">
            <div>
              <span>Total requests</span>
              <strong>{summary.total}</strong>
              <small>earner and moderator requests</small>
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
              <span>Approved requests</span>
              <strong>{summary.approved}</strong>
              <small>
                {formatCurrency(summary.approvedAmount)} approved
              </small>
            </div>

            <CheckCircle2 size={18} />
          </article>

          <article className="withdrawal-summary-card withdrawal-summary-card--blue">
            <div>
              <span>Earner requests</span>
              <strong>{getRoleCount("Earner")}</strong>
              <small>
                {getRoleCount("Moderator")} moderator requests
              </small>
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
                <span>{getRoleCount(role.key)}</span>
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
                <span>{getStatusCount(status)}</span>
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
              {hasFilters && (
                <button
                  type="button"
                  className="withdrawal-clear-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {filteredWithdrawals.length > 0 ? (
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
                    {filteredWithdrawals.map((withdrawal) => (
                      <tr key={withdrawal.id}>
                        <td>
                          <div className="withdrawal-requester">
                            <span className="withdrawal-avatar">
                              {withdrawal.requester
                                .split(" ")
                                .map((name) => name[0])
                                .join("")
                                .slice(0, 2)}
                            </span>

                            <div>
                              <strong>{withdrawal.requester}</strong>
                              <small>
                                {withdrawal.id} · {withdrawal.email}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <RoleBadge role={withdrawal.role} />
                        </td>

                        <td>
                          <strong className="withdrawal-amount">
                            {formatCurrency(withdrawal.amount)}
                          </strong>
                        </td>

                        <td>
                          <div className="withdrawal-payment-method">
                            <strong>{withdrawal.method}</strong>
                            <small>{withdrawal.account}</small>
                          </div>
                        </td>

                        <td className="withdrawal-date">
                          {formatDate(withdrawal.requestedAt)}
                        </td>

                        <td>
                          <StatusBadge status={withdrawal.status} />
                        </td>

                        <td>
                          {withdrawal.status === "Pending" ? (
                            <div className="withdrawal-row-actions">
                              <button
                                type="button"
                                className="withdrawal-row-reject"
                                onClick={() =>
                                  rejectWithdrawal(withdrawal.id)
                                }
                              >
                                Reject
                              </button>

                              <button
                                type="button"
                                className="withdrawal-row-approve"
                                onClick={() =>
                                  approveWithdrawal(withdrawal.id)
                                }
                              >
                                Approve
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="withdrawal-view-button"
                              onClick={() => openDetails(withdrawal)}
                            >
                              View
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="withdrawals-mobile-list">
                {filteredWithdrawals.map((withdrawal) => (
                  <article
                    className="withdrawal-mobile-card"
                    key={withdrawal.id}
                  >
                    <div className="withdrawal-mobile-top">
                      <div className="withdrawal-requester">
                        <span className="withdrawal-avatar">
                          {withdrawal.requester
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .slice(0, 2)}
                        </span>

                        <div>
                          <strong>{withdrawal.requester}</strong>
                          <small>{withdrawal.id}</small>
                        </div>
                      </div>

                      <StatusBadge status={withdrawal.status} />
                    </div>

                    <div className="withdrawal-mobile-info">
                      <span>{withdrawal.role}</span>
                      <strong>{formatCurrency(withdrawal.amount)}</strong>
                      <small>{formatDate(withdrawal.requestedAt)}</small>
                    </div>

                    {withdrawal.status === "Pending" && (
                      <div className="withdrawal-mobile-actions">
                        <button
                          type="button"
                          className="withdrawal-row-reject"
                          onClick={() => rejectWithdrawal(withdrawal.id)}
                        >
                          Reject
                        </button>

                        <button
                          type="button"
                          className="withdrawal-row-approve"
                          onClick={() => approveWithdrawal(withdrawal.id)}
                        >
                          Approve
                        </button>
                      </div>
                    )}

                    {withdrawal.status !== "Pending" && (
                      <button
                        type="button"
                        className="withdrawal-view-button"
                        onClick={() => openDetails(withdrawal)}
                      >
                        View details
                      </button>
                    )}
                  </article>
                ))}
              </div>

              <footer className="withdrawals-footer">
                Showing <strong>{filteredWithdrawals.length}</strong> of{" "}
                {eligibleWithdrawals.length} withdrawal requests
              </footer>
            </>
          ) : (
            <div className="withdrawals-empty-state">
              <span>
                <AlertCircle size={19} />
              </span>

              <h2>No withdrawal requests found</h2>

              <p>
                Try another search or remove one of the active filters.
              </p>

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
        <WithdrawalDetails
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
        />
      )}
    </main>
  );
}