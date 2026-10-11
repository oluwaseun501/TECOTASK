import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Search,
  ShieldCheck,
  Target,
  Users,
  X,
  XCircle,
} from "lucide-react";

import "../../styles/AdminModeration.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const periodOptions = [
  { key: "7 days", label: "Last 7 days" },
  { key: "30 days", label: "Last 30 days" },
  { key: "Custom", label: "Custom range" },
];

const emptyMetrics = {
  approved: 0,
  rejected: 0,
  averageResponse: "—",
  activity: [],
};

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialCustomStart() {
  const date = new Date();
  date.setDate(date.getDate() - 29);
  return toDateInputValue(date);
}

function getInitialCustomEnd() {
  return toDateInputValue(new Date());
}

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
};

const calculateApprovalRate = (approved, rejected) => {
  const total = approved + rejected;

  return total ? Math.round((approved / total) * 100) : 0;
};

function ModeratorStatus({ status }) {
  const safeStatus = status || "Unknown";

  return (
    <span
      className={`moderator-status moderator-status--${safeStatus.toLowerCase()}`}
    >
      <span className="moderator-status-dot" />
      {safeStatus}
    </span>
  );
}

function PerformanceMetric({
  label,
  value,
  icon: Icon,
  tone = "default",
  helper,
}) {
  return (
    <article className={`moderation-metric-card moderation-metric-card--${tone}`}>
      <div className="moderation-metric-heading">
        <span>{label}</span>
        <Icon size={17} />
      </div>

      <strong>{value}</strong>

      <small>{helper}</small>
    </article>
  );
}

function ModeratorDetails({ moderator, period, onClose }) {
  const metrics = moderator.performance?.[period] || emptyMetrics;
  const approvalRate = calculateApprovalRate(
    metrics.approved,
    metrics.rejected
  );

  return (
    <div
      className="moderator-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="moderator-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="moderator-modal-title"
      >
        <div className="moderator-drawer-header">
          <div className="moderator-drawer-profile">
            <span className="moderator-large-avatar">
              {moderator.initials}
            </span>

            <div>
              <span className="moderator-drawer-eyebrow">
                Moderator performance
              </span>

              <h2 id="moderator-modal-title">{moderator.name}</h2>

              <p>{moderator.email || "No email available"}</p>
            </div>
          </div>

          <button
            type="button"
            className="moderator-close-button"
            onClick={onClose}
            aria-label="Close moderator details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="moderator-drawer-body">
          <div className="moderator-drawer-period">
            <span>Showing performance for</span>
            <strong>{period}</strong>
          </div>

          <div className="moderator-drawer-summary">
            <div>
              <span>Approved</span>
              <strong>{metrics.approved}</strong>
            </div>

            <div>
              <span>Rejected</span>
              <strong>{metrics.rejected}</strong>
            </div>

            <div>
              <span>Approval rate</span>
              <strong>{approvalRate}%</strong>
            </div>
          </div>

          <section className="moderator-drawer-section">
            <div className="moderator-section-heading">
              <div>
                <span className="moderator-section-eyebrow">
                  Review activity
                </span>
                <h3>Approvals and rejections</h3>
              </div>

              <Activity size={17} />
            </div>

            {metrics.activity.length > 0 ? (
              <div className="moderator-activity-list">
                {metrics.activity.map((item, index) => {
                  const total = item.approved + item.rejected;
                  const approvedWidth = total
                    ? `${(item.approved / total) * 100}%`
                    : "0%";

                  return (
                    <div
                      className="moderator-activity-row"
                      key={`${item.day}-${index}`}
                    >
                      <div className="moderator-activity-label">
                        <strong>{item.day}</strong>
                        <span>{total} reviews</span>
                      </div>

                      <div className="moderator-activity-bar">
                        <span
                          className="moderator-activity-approved"
                          style={{ width: approvedWidth }}
                        />
                      </div>

                      <div className="moderator-activity-values">
                        <span className="moderator-approved-value">
                          {item.approved}
                        </span>
                        <span className="moderator-rejected-value">
                          {item.rejected}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No review activity in this date range.</p>
            )}

            <div className="moderator-activity-legend">
              <span>
                <i className="moderator-approved-dot" />
                Approved
              </span>

              <span>
                <i className="moderator-rejected-dot" />
                Rejected
              </span>
            </div>
          </section>

          <section className="moderator-drawer-section">
            <span className="moderator-section-eyebrow">
              Moderator information
            </span>

            <dl className="moderator-detail-list">
              <div>
                <dt>Account status</dt>
                <dd>
                  <ModeratorStatus status={moderator.status} />
                </dd>
              </div>

              <div>
                <dt>Average response</dt>
                <dd>{metrics.averageResponse || "—"}</dd>
              </div>

              <div>
                <dt>Pending reviews</dt>
                <dd>Shared queue; not assigned per moderator</dd>
              </div>

              <div>
                <dt>Joined platform</dt>
                <dd>{formatDate(moderator.joinedAt)}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div className="moderator-drawer-footer">
          <button
            type="button"
            className="moderator-secondary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

export default function AdminModeration() {
  const [moderators, setModerators] = useState([]);
  const [summary, setSummary] = useState({
    totalReviewed: 0,
    approved: 0,
    rejected: 0,
    approvalRate: 0,
    pendingQueue: 0,
    moderatorCount: 0,
    activeModeratorCount: 0,
  });

  const [selectedPeriod, setSelectedPeriod] = useState("7 days");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModerator, setSelectedModerator] = useState(null);
  const [customStartDate, setCustomStartDate] = useState(
    getInitialCustomStart
  );
  const [customEndDate, setCustomEndDate] = useState(getInitialCustomEnd);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setLoadError("");

    const loadModerationData = async () => {
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
          range: selectedPeriod,
        });

        if (selectedPeriod === "Custom") {
          params.set("from", customStartDate);
          params.set("to", customEndDate);
        }

        const response = await fetch(
          `${API_BASE_URL}/api/admin/moderation?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Could not load moderation data.");
        }

        if (cancelled) return;

        setModerators(data.moderators || []);
        setSummary(
          data.summary || {
            totalReviewed: 0,
            approved: 0,
            rejected: 0,
            approvalRate: 0,
            pendingQueue: 0,
            moderatorCount: 0,
            activeModeratorCount: 0,
          }
        );
        setSelectedModerator(null);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Could not load moderation data.");
          setModerators([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadModerationData();

    return () => {
      cancelled = true;
    };
  }, [
    selectedPeriod,
    customStartDate,
    customEndDate,
    refreshKey,
  ]);

  useEffect(() => {
    if (!selectedModerator) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedModerator(null);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [selectedModerator]);

  const visibleModerators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return moderators;

    return moderators.filter(
      (moderator) =>
        moderator.name.toLowerCase().includes(query) ||
        moderator.email.toLowerCase().includes(query)
    );
  }, [moderators, searchQuery]);

  const customRangeLabel =
    selectedPeriod === "Custom"
      ? `${formatDate(`${customStartDate}T00:00:00`)} – ${formatDate(
          `${customEndDate}T00:00:00`
        )}`
      : null;

  return (
    <main className="admin-moderation-page">
      <div className="admin-moderation-container">
        <header className="admin-moderation-header">
          <div>
            <span className="admin-moderation-eyebrow">
              Admin workspace
            </span>

            <h1>Moderation</h1>

            <p>
              Review moderator decisions and performance using recorded task
              submissions.
            </p>
          </div>

          <div className="moderation-header-status">
            <span />
            {summary.activeModeratorCount} active · {summary.pendingQueue} in
            shared queue
          </div>
        </header>

        <section className="moderation-controls">
          <div className="moderation-period-tabs">
            {periodOptions.map((period) => (
              <button
                type="button"
                key={period.key}
                className={`moderation-period-tab ${
                  selectedPeriod === period.key
                    ? "moderation-period-tab--active"
                    : ""
                }`}
                onClick={() => setSelectedPeriod(period.key)}
              >
                {period.key === "Custom" && <CalendarDays size={14} />}
                {period.label}
              </button>
            ))}
          </div>

          {selectedPeriod === "Custom" && (
            <div className="moderation-custom-dates">
              <label>
                <span>From</span>
                <input
                  type="date"
                  value={customStartDate}
                  max={customEndDate}
                  onChange={(event) =>
                    setCustomStartDate(event.target.value)
                  }
                />
              </label>

              <span className="moderation-date-separator">to</span>

              <label>
                <span>To</span>
                <input
                  type="date"
                  value={customEndDate}
                  min={customStartDate}
                  max={toDateInputValue(new Date())}
                  onChange={(event) =>
                    setCustomEndDate(event.target.value)
                  }
                />
              </label>
            </div>
          )}

          {customRangeLabel && (
            <div className="moderation-custom-range-label">
              {customRangeLabel}
            </div>
          )}
        </section>

        <section className="moderation-summary-grid">
          <PerformanceMetric
            label="Total reviews"
            value={summary.totalReviewed}
            icon={Target}
            helper={`${selectedPeriod.toLowerCase()} across all moderators`}
          />

          <PerformanceMetric
            label="Approved"
            value={summary.approved}
            icon={CheckCircle2}
            tone="green"
            helper="recorded approved submissions"
          />

          <PerformanceMetric
            label="Rejected"
            value={summary.rejected}
            icon={XCircle}
            tone="red"
            helper="recorded rejected submissions"
          />

          <PerformanceMetric
            label="Approval rate"
            value={`${summary.approvalRate}%`}
            icon={ArrowUpRight}
            tone="blue"
            helper="approved out of all reviewed submissions"
          />
        </section>

        <section className="moderation-team-card">
          <div className="moderation-team-card-header">
            <div>
              <span className="moderation-section-eyebrow">
                Moderator directory
              </span>

              <h2>Moderator performance</h2>

              <p>
                Pending submissions are shared; the system does not record an
                assigned moderator for them.
              </p>
            </div>

            <div className="moderation-team-count">
              <Users size={15} />
              {summary.moderatorCount} moderators
            </div>
          </div>

          <div className="moderation-toolbar">
            <div className="moderation-search">
              <Search size={15} />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search moderators"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear moderator search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="moderation-current-period">
              <Clock3 size={14} />
              {selectedPeriod}
            </div>
          </div>

          {loading ? (
            <div
              className="moderation-loading"
              role="status"
              aria-live="polite"
            >
              <div
                className="moderation-loading__roller"
                aria-hidden="true"
              />
              <strong>Loading moderation data</strong>
              <p>Getting recorded review activity from the server.</p>
            </div>
          ) : loadError ? (
            <div className="moderation-empty-state" role="alert">
              <span>
                <ShieldCheck size={19} />
              </span>
              <h3>Could not load moderation data</h3>
              <p>{loadError}</p>
              <button
                type="button"
                onClick={() => setRefreshKey((current) => current + 1)}
              >
                Try again
              </button>
            </div>
          ) : visibleModerators.length > 0 ? (
            <>
              <div className="moderation-table-wrapper">
                <table className="moderation-table">
                  <thead>
                    <tr>
                      <th>Moderator</th>
                      <th>Account</th>
                      <th>Approved</th>
                      <th>Rejected</th>
                      <th>Approval rate</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleModerators.map((moderator) => {
                      const metrics =
                        moderator.performance?.[selectedPeriod] || emptyMetrics;

                      const approvalRate = calculateApprovalRate(
                        metrics.approved,
                        metrics.rejected
                      );

                      return (
                        <tr key={moderator.id}>
                          <td>
                            <div className="moderator-table-profile">
                              <span className="moderator-avatar">
                                {moderator.initials}
                              </span>

                              <div>
                                <strong>{moderator.name}</strong>
                                <small>{moderator.email}</small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <ModeratorStatus status={moderator.status} />
                          </td>

                          <td>
                            <span className="moderator-approved-number">
                              <CheckCircle2 size={14} />
                              {metrics.approved}
                            </span>
                          </td>

                          <td>
                            <span className="moderator-rejected-number">
                              <XCircle size={14} />
                              {metrics.rejected}
                            </span>
                          </td>

                          <td>
                            <div className="moderator-rate-cell">
                              <strong>{approvalRate}%</strong>

                              <span className="moderator-rate-track">
                                <span
                                  style={{
                                    width: `${approvalRate}%`,
                                  }}
                                />
                              </span>
                            </div>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="moderator-view-button"
                              onClick={() => setSelectedModerator(moderator)}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="moderation-mobile-list">
                {visibleModerators.map((moderator) => {
                  const metrics =
                    moderator.performance?.[selectedPeriod] || emptyMetrics;

                  const approvalRate = calculateApprovalRate(
                    metrics.approved,
                    metrics.rejected
                  );

                  return (
                    <article
                      className="moderator-mobile-card"
                      key={moderator.id}
                    >
                      <div className="moderator-mobile-header">
                        <div className="moderator-table-profile">
                          <span className="moderator-avatar">
                            {moderator.initials}
                          </span>

                          <div>
                            <strong>{moderator.name}</strong>
                            <small>{moderator.email}</small>
                          </div>
                        </div>

                        <ModeratorStatus status={moderator.status} />
                      </div>

                      <div className="moderator-mobile-stats">
                        <div>
                          <span>Approved</span>
                          <strong className="moderator-approved-number">
                            {metrics.approved}
                          </strong>
                        </div>

                        <div>
                          <span>Rejected</span>
                          <strong className="moderator-rejected-number">
                            {metrics.rejected}
                          </strong>
                        </div>

                        <div>
                          <span>Approval rate</span>
                          <strong>{approvalRate}%</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="moderator-view-button moderator-view-button--mobile"
                        onClick={() => setSelectedModerator(moderator)}
                      >
                        <Eye size={14} />
                        View performance
                      </button>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="moderation-empty-state">
              <span>
                <Search size={19} />
              </span>

              <h3>No moderators found</h3>

              <p>
                {searchQuery
                  ? "Try searching with another name or email address."
                  : "No moderator accounts were found."}
              </p>

              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")}>
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {selectedModerator && (
        <ModeratorDetails
          moderator={selectedModerator}
          period={selectedPeriod}
          onClose={() => setSelectedModerator(null)}
        />
      )}
    </main>
  );
}