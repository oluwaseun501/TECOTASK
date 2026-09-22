import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
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

const periodOptions = [
  {
    key: "7 days",
    label: "Last 7 days",
  },
  {
    key: "30 days",
    label: "Last 30 days",
  },
  {
    key: "Custom",
    label: "Custom range",
  },
];

const initialModerators = [
  {
    id: "MOD-001",
    name: "Amina Yusuf",
    email: "amina.yusuf@example.com",
    initials: "AY",
    status: "Active",
    joinedAt: "2025-04-12",
    lastActive: "Active now",
    performance: {
      "7 days": {
        approved: 42,
        rejected: 8,
        pending: 3,
        averageResponse: "18 min",
        activity: [
          { day: "Mon", approved: 7, rejected: 1 },
          { day: "Tue", approved: 6, rejected: 2 },
          { day: "Wed", approved: 8, rejected: 1 },
          { day: "Thu", approved: 5, rejected: 1 },
          { day: "Fri", approved: 9, rejected: 2 },
          { day: "Sat", approved: 4, rejected: 1 },
          { day: "Sun", approved: 3, rejected: 0 },
        ],
      },
      "30 days": {
        approved: 164,
        rejected: 29,
        pending: 7,
        averageResponse: "21 min",
        activity: [
          { day: "Week 1", approved: 39, rejected: 7 },
          { day: "Week 2", approved: 43, rejected: 8 },
          { day: "Week 3", approved: 38, rejected: 6 },
          { day: "Week 4", approved: 44, rejected: 8 },
        ],
      },
      Custom: {
        approved: 91,
        rejected: 16,
        pending: 4,
        averageResponse: "19 min",
        activity: [
          { day: "Week 1", approved: 30, rejected: 5 },
          { day: "Week 2", approved: 33, rejected: 6 },
          { day: "Week 3", approved: 28, rejected: 5 },
        ],
      },
    },
  },
  {
    id: "MOD-002",
    name: "Daniel Mensah",
    email: "daniel.mensah@example.com",
    initials: "DM",
    status: "Active",
    joinedAt: "2025-05-08",
    lastActive: "Active 12 min ago",
    performance: {
      "7 days": {
        approved: 35,
        rejected: 11,
        pending: 5,
        averageResponse: "24 min",
        activity: [
          { day: "Mon", approved: 5, rejected: 2 },
          { day: "Tue", approved: 4, rejected: 2 },
          { day: "Wed", approved: 6, rejected: 1 },
          { day: "Thu", approved: 5, rejected: 2 },
          { day: "Fri", approved: 7, rejected: 2 },
          { day: "Sat", approved: 4, rejected: 1 },
          { day: "Sun", approved: 4, rejected: 1 },
        ],
      },
      "30 days": {
        approved: 142,
        rejected: 41,
        pending: 12,
        averageResponse: "26 min",
        activity: [
          { day: "Week 1", approved: 34, rejected: 10 },
          { day: "Week 2", approved: 39, rejected: 12 },
          { day: "Week 3", approved: 32, rejected: 11 },
          { day: "Week 4", approved: 37, rejected: 8 },
        ],
      },
      Custom: {
        approved: 78,
        rejected: 22,
        pending: 6,
        averageResponse: "25 min",
        activity: [
          { day: "Week 1", approved: 27, rejected: 8 },
          { day: "Week 2", approved: 31, rejected: 7 },
          { day: "Week 3", approved: 20, rejected: 7 },
        ],
      },
    },
  },
  {
    id: "MOD-003",
    name: "Sarah Mensah",
    email: "sarah.mensah@example.com",
    initials: "SM",
    status: "Active",
    joinedAt: "2025-06-19",
    lastActive: "Active 1 hour ago",
    performance: {
      "7 days": {
        approved: 28,
        rejected: 5,
        pending: 2,
        averageResponse: "31 min",
        activity: [
          { day: "Mon", approved: 4, rejected: 1 },
          { day: "Tue", approved: 5, rejected: 0 },
          { day: "Wed", approved: 3, rejected: 1 },
          { day: "Thu", approved: 4, rejected: 1 },
          { day: "Fri", approved: 6, rejected: 1 },
          { day: "Sat", approved: 3, rejected: 0 },
          { day: "Sun", approved: 3, rejected: 1 },
        ],
      },
      "30 days": {
        approved: 118,
        rejected: 24,
        pending: 8,
        averageResponse: "29 min",
        activity: [
          { day: "Week 1", approved: 26, rejected: 6 },
          { day: "Week 2", approved: 31, rejected: 5 },
          { day: "Week 3", approved: 29, rejected: 7 },
          { day: "Week 4", approved: 32, rejected: 6 },
        ],
      },
      Custom: {
        approved: 64,
        rejected: 13,
        pending: 5,
        averageResponse: "30 min",
        activity: [
          { day: "Week 1", approved: 22, rejected: 4 },
          { day: "Week 2", approved: 24, rejected: 5 },
          { day: "Week 3", approved: 18, rejected: 4 },
        ],
      },
    },
  },
  {
    id: "MOD-004",
    name: "Joseph Okoro",
    email: "joseph.okoro@example.com",
    initials: "JO",
    status: "Away",
    joinedAt: "2025-08-03",
    lastActive: "Active yesterday",
    performance: {
      "7 days": {
        approved: 19,
        rejected: 7,
        pending: 6,
        averageResponse: "42 min",
        activity: [
          { day: "Mon", approved: 3, rejected: 1 },
          { day: "Tue", approved: 2, rejected: 2 },
          { day: "Wed", approved: 4, rejected: 1 },
          { day: "Thu", approved: 3, rejected: 1 },
          { day: "Fri", approved: 4, rejected: 1 },
          { day: "Sat", approved: 2, rejected: 0 },
          { day: "Sun", approved: 1, rejected: 1 },
        ],
      },
      "30 days": {
        approved: 86,
        rejected: 26,
        pending: 14,
        averageResponse: "39 min",
        activity: [
          { day: "Week 1", approved: 19, rejected: 7 },
          { day: "Week 2", approved: 21, rejected: 6 },
          { day: "Week 3", approved: 23, rejected: 8 },
          { day: "Week 4", approved: 23, rejected: 5 },
        ],
      },
      Custom: {
        approved: 47,
        rejected: 15,
        pending: 8,
        averageResponse: "41 min",
        activity: [
          { day: "Week 1", approved: 15, rejected: 4 },
          { day: "Week 2", approved: 17, rejected: 6 },
          { day: "Week 3", approved: 15, rejected: 5 },
        ],
      },
    },
  },
];

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));

const calculateApprovalRate = (approved, rejected) => {
  const total = approved + rejected;

  if (!total) {
    return 0;
  }

  return Math.round((approved / total) * 100);
};

function ModeratorStatus({ status }) {
  return (
    <span
      className={`moderator-status moderator-status--${status.toLowerCase()}`}
    >
      <span className="moderator-status-dot" />
      {status}
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

function ModeratorDetails({
  moderator,
  period,
  onClose,
}) {
  const metrics = moderator.performance[period];
  const approvalRate = calculateApprovalRate(
    metrics.approved,
    metrics.rejected
  );

  return (
    <div className="moderator-drawer-overlay" onClick={onClose}>
      <aside
        className="moderator-drawer"
        onClick={(event) => event.stopPropagation()}
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

              <h2>{moderator.name}</h2>

              <p>{moderator.email}</p>
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

            <div className="moderator-activity-list">
              {metrics.activity.map((item) => {
                const total = item.approved + item.rejected;
                const approvedWidth = total
                  ? `${(item.approved / total) * 100}%`
                  : "0%";

                return (
                  <div className="moderator-activity-row" key={item.day}>
                    <div className="moderator-activity-label">
                      <strong>{item.day}</strong>
                      <span>
                        {item.approved + item.rejected} reviews
                      </span>
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
                <dt>Status</dt>
                <dd>
                  <ModeratorStatus status={moderator.status} />
                </dd>
              </div>

              <div>
                <dt>Average response</dt>
                <dd>{metrics.averageResponse}</dd>
              </div>

              <div>
                <dt>Pending reviews</dt>
                <dd>{metrics.pending}</dd>
              </div>

              <div>
                <dt>Joined platform</dt>
                <dd>{formatDate(moderator.joinedAt)}</dd>
              </div>

              <div>
                <dt>Last activity</dt>
                <dd>{moderator.lastActive}</dd>
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
      </aside>
    </div>
  );
}

export default function AdminModeration() {
  const [moderators] = useState(initialModerators);
  const [selectedPeriod, setSelectedPeriod] = useState("7 days");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModerator, setSelectedModerator] = useState(null);
  const [customStartDate, setCustomStartDate] = useState("2026-09-01");
  const [customEndDate, setCustomEndDate] = useState("2026-09-22");

  const visibleModerators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return moderators;
    }

    return moderators.filter(
      (moderator) =>
        moderator.name.toLowerCase().includes(query) ||
        moderator.email.toLowerCase().includes(query)
    );
  }, [moderators, searchQuery]);

  const periodMetrics = useMemo(() => {
    return visibleModerators.reduce(
      (total, moderator) => {
        const metrics = moderator.performance[selectedPeriod];

        return {
          approved: total.approved + metrics.approved,
          rejected: total.rejected + metrics.rejected,
          pending: total.pending + metrics.pending,
        };
      },
      {
        approved: 0,
        rejected: 0,
        pending: 0,
      }
    );
  }, [visibleModerators, selectedPeriod]);

  const totalReviewed =
    periodMetrics.approved + periodMetrics.rejected;

  const overallApprovalRate = calculateApprovalRate(
    periodMetrics.approved,
    periodMetrics.rejected
  );

  const customRangeLabel =
    selectedPeriod === "Custom"
      ? `${formatDate(customStartDate)} – ${formatDate(customEndDate)}`
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
              Track moderator activity and review how requests are being
              approved or rejected.
            </p>
          </div>

          <div className="moderation-header-status">
            <span />
            Moderation team active
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
            value={totalReviewed}
            icon={Target}
            helper={`${selectedPeriod.toLowerCase()} across all moderators`}
          />

          <PerformanceMetric
            label="Approved"
            value={periodMetrics.approved}
            icon={CheckCircle2}
            tone="green"
            helper="requests approved by moderators"
          />

          <PerformanceMetric
            label="Rejected"
            value={periodMetrics.rejected}
            icon={XCircle}
            tone="red"
            helper="requests rejected by moderators"
          />

          <PerformanceMetric
            label="Approval rate"
            value={`${overallApprovalRate}%`}
            icon={ArrowUpRight}
            tone="blue"
            helper="average team approval rate"
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
                Select a moderator to see their approval and rejection
                activity.
              </p>
            </div>

            <div className="moderation-team-count">
              <Users size={15} />
              {visibleModerators.length} moderators
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
                  <XCircle size={14} />
                </button>
              )}
            </div>

            <div className="moderation-current-period">
              <Clock3 size={14} />
              {selectedPeriod}
            </div>
          </div>

          {visibleModerators.length > 0 ? (
            <>
              <div className="moderation-table-wrapper">
                <table className="moderation-table">
                  <thead>
                    <tr>
                      <th>Moderator</th>
                      <th>Status</th>
                      <th>Approved</th>
                      <th>Rejected</th>
                      <th>Approval rate</th>
                      <th>Pending</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {visibleModerators.map((moderator) => {
                      const metrics =
                        moderator.performance[selectedPeriod];

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
                            <span className="moderator-pending-number">
                              {metrics.pending}
                            </span>
                          </td>

                          <td>
                            <button
                              type="button"
                              className="moderator-view-button"
                              onClick={() =>
                                setSelectedModerator(moderator)
                              }
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
                  const metrics = moderator.performance[selectedPeriod];

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

              <p>Try searching with another name or email address.</p>

              <button
                type="button"
                onClick={() => setSearchQuery("")}
              >
                Clear search
              </button>
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