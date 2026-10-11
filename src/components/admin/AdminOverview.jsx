import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
 
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../../styles/AdminOverview.css";

const cn = (...classes) => classes.filter(Boolean).join(" ");
function NairaSign({ size = 17 }) {
  return (
    <span
      aria-hidden="true"
      style={{
        fontSize: size,
        fontWeight: 700,
        lineHeight: 1,
        fontFamily: "Poppins, Arial, sans-serif",
      }}
    >
      ₦
    </span>
  );
}
const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-NG");

function formatCurrency(value) {
  return Number.isFinite(Number(value))
    ? currencyFormatter.format(Number(value))
    : "—";
}

function formatNumber(value) {
  return Number.isFinite(Number(value))
    ? numberFormatter.format(Number(value))
    : "—";
}

function formatChange(value) {
  if (!Number.isFinite(Number(value))) return null;

  const change = Number(value);
  const Icon = change < 0 ? ArrowDownRight : ArrowUpRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
        change < 0
          ? "bg-rose-50 text-rose-600"
          : "bg-emerald-50 text-emerald-600",
      )}
    >
      <Icon size={12} />
      {Math.abs(change).toFixed(1)}%
    </span>
  );
}

function formatRelativeTime(value) {
  if (!value) return "Time unavailable";

  const date = new Date(value);
  const elapsedMs = Date.now() - date.getTime();

  if (Number.isNaN(date.getTime()) || elapsedMs < 0) {
    return "Just now";
  }

  const minutes = Math.floor(elapsedMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
  });
}

function initialsFor(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";
}

function SectionHeading({
  title,
  subtitle,
  icon: Icon,
  action,
  className = "",
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="admin-overview__section-title truncate text-sm font-semibold tracking-[-0.01em] text-slate-800">
          {title}
        </h2>
        {subtitle && (
          <p className="admin-overview__section-subtitle mt-1 text-xs text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {action}
        {Icon && (
          <div className="admin-overview__section-icon flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
            <Icon size={16} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  trend,
  tone = "default",
}) {
  const styles = {
    default: {
      card: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-500",
    },
    green: {
      card: "border-emerald-200 bg-emerald-50/70",
      icon: "bg-emerald-100 text-emerald-700",
    },
    blue: {
      card: "border-blue-200 bg-blue-50/60",
      icon: "bg-blue-100 text-blue-700",
    },
    amber: {
      card: "border-amber-200 bg-amber-50/70",
      icon: "bg-amber-100 text-amber-700",
    },
  };

  const currentStyle = styles[tone] || styles.default;

  return (
    <article
      className={cn(
        "admin-overview__card admin-overview__metric rounded-2xl border p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
        currentStyle.card,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="admin-overview__metric-label text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
          {label}
        </p>
        <div
          className={cn(
            "admin-overview__metric-icon flex h-9 w-9 items-center justify-center rounded-xl",
            currentStyle.icon,
          )}
        >
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <strong className="admin-overview__metric-value text-2xl font-semibold tracking-[-0.05em] text-slate-900">
          {value}
        </strong>
        {trend !== undefined && trend !== null && (
          <span className="mb-1">{formatChange(trend)}</span>
        )}
      </div>

      <p className="admin-overview__metric-note mt-2 text-xs text-slate-400">
        {note}
      </p>
    </article>
  );
}

function RevenuePerformancePanel({ period, data, loading }) {
  const totalCollected = data
    ? Number(data.totalCollected || 0)
    : Number.NaN;
  const breakdown = [
    {
      label: "Completed payouts",
      amount: data ? Number(data.completedPayouts || 0) : 0,
      tone: "bg-emerald-500",
    },
    {
      label: "Pending withdrawals",
      amount: data ? Number(data.pendingWithdrawals || 0) : 0,
      tone: "bg-amber-500",
    },
    {
      label: "Platform fees",
      amount: data ? Number(data.platformFees || 0) : 0,
      tone: "bg-slate-400",
    },
  ];
  const breakdownTotal = breakdown.reduce(
    (total, item) => total + item.amount,
    0,
  );
  const activity = Array.isArray(data?.recentActivity)
    ? data.recentActivity
    : [];

  return (
    <article className="admin-overview__card admin-overview__panel rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeading
            title="Revenue performance"
            subtitle={`Money movement for the last ${period === "7d" ? "7 days" : "30 days"}`}
            icon={NairaSign}
          />

          <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                Total collected
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <strong className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">
                  {formatCurrency(totalCollected)}
                </strong>
                {formatChange(data?.totalCollectedChangePercent)}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Platform fees recorded for this period
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-600">
                Average daily revenue
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-800">
                {formatCurrency(data?.averageDailyRevenue)}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {breakdown.map((item) => {
              const percentage =
                breakdownTotal > 0
                  ? Math.round((item.amount / breakdownTotal) * 100)
                  : 0;

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-700">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="w-8 text-right text-xs text-slate-400">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={cn(
                        "block h-full rounded-full transition-all",
                        item.tone,
                      )}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Recent activity
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Latest financial events
            </p>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {loading && !data ? (
              <p className="py-4 text-sm text-slate-400">
                Loading activity…
              </p>
            ) : activity.length === 0 ? (
              <p className="py-4 text-sm text-slate-400">
                No financial activity in this period.
              </p>
            ) : (
              activity.slice(0, 6).map((item) => {
                const isWarning = item.type === "pending_withdrawal";
                const ActivityIcon = isWarning
                  ? AlertTriangle
                  : CheckCircle2;
                const amountPrefix =
                  item.direction === "debit" ? "−" : "+";

                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    className="admin-overview__activity-row flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isWarning
                          ? "bg-amber-50 text-amber-600"
                          : "bg-emerald-50 text-emerald-600",
                      )}
                    >
                      <ActivityIcon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {item.title || "Account activity"}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {item.user?.fullName ||
                          item.description ||
                          "Platform activity"}
                        {" · "}
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 text-sm font-medium",
                        isWarning ? "text-amber-600" : "text-emerald-600",
                      )}
                    >
                      {amountPrefix}
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function PeopleCard({ people, loading }) {
  const rows = [
    ["Active earners", people?.activeEarners],
    ["Advertisers", people?.advertisers],
    ["Moderators", people?.moderators],
  ];

  return (
    <article className="admin-overview__card admin-overview__panel rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <SectionHeading
        title="People on the platform"
        subtitle="Live account totals"
        icon={Users}
      />
      <div className="mt-6 divide-y divide-slate-100">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="admin-overview__people-row flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <span className="text-sm text-slate-500">{label}</span>
            <strong className="text-sm font-medium text-slate-800">
              {value == null ? (loading ? "…" : "—") : formatNumber(value)}
            </strong>
          </div>
        ))}
      </div>
    </article>
  );
}

const avatarStyles = {
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-violet-100 text-violet-700",
  rose: "bg-rose-100 text-rose-700",
  amber: "bg-amber-100 text-amber-700",
};

function Avatar({ initials, tone = "green" }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
        avatarStyles[tone] || avatarStyles.green,
      )}
    >
      {initials}
    </span>
  );
}

function WithdrawalsCard({
  withdrawalsPath,
  withdrawalsData,
  loading,
}) {
  const withdrawals = Array.isArray(withdrawalsData?.withdrawals)
    ? withdrawalsData.withdrawals
    : [];
  const visibleWithdrawalAmount = withdrawals.reduce(
    (sum, withdrawal) => sum + Number(withdrawal.amount || 0),
    0,
  );

  return (
    <section className="admin-overview__card admin-overview__panel rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <SectionHeading
        title="Withdrawals awaiting approval"
        subtitle={
          withdrawalsData
            ? `${formatNumber(withdrawals.length)} shown · ${formatCurrency(visibleWithdrawalAmount)} in this list`
            : loading
              ? "Loading withdrawal totals"
              : "Withdrawal totals unavailable"
        }
        action={
          <Link
            to={withdrawalsPath}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            View all
            <ChevronRight size={14} />
          </Link>
        }
      />

      <div className="mt-5 divide-y divide-slate-100">
        {!withdrawalsData && loading ? (
          <p className="py-4 text-sm text-slate-400">
            Loading withdrawals…
          </p>
        ) : withdrawals.length === 0 ? (
          <p className="py-4 text-sm text-slate-400">
            No withdrawals are awaiting approval.
          </p>
        ) : (
          withdrawals.slice(0, 6).map((withdrawal) => {
            const userName = withdrawal.user?.fullName || "Unknown user";
            const isPending = withdrawal.status === "pending";
            const tone = isPending ? "amber" : "blue";

            return (
              <div
                key={`${withdrawal.type}-${withdrawal.id}`}
                className="admin-overview__activity-row flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
              >
                <Avatar initials={initialsFor(userName)} tone={tone} />
                <div className="min-w-[130px] flex-1">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {userName}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {withdrawal.user?.email || withdrawal.type || "Withdrawal"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-700">
                    {formatCurrency(withdrawal.amount)}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-[11px] font-medium capitalize",
                      isPending ? "text-amber-600" : "text-blue-600",
                    )}
                  >
                    {withdrawal.status || "Pending"}
                  </p>
                </div>
                <Link
                  to={withdrawalsPath}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-medium transition",
                    isPending
                      ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                  )}
                >
                  Review
                </Link>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function CampaignStatusCard({ campaigns, loading }) {
  const statuses = [
    {
      key: "active",
      label: "Active campaigns",
      tone: "bg-emerald-500",
    },
    {
      key: "pendingReview",
      label: "Pending review",
      tone: "bg-amber-500",
    },
    {
      key: "paused",
      label: "Paused",
      tone: "bg-slate-400",
    },
  ];
  const allCampaigns = Number(campaigns?.total || 0);

  return (
    <section className="admin-overview__card admin-overview__panel rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <SectionHeading
        title="Campaigns by status"
        subtitle="Current advertiser activity"
        icon={WalletCards}
      />

      {!campaigns ? (
        <p className="mt-6 text-sm text-slate-400">
          {loading
            ? "Loading campaign counts…"
            : "Campaign status counts are not included in the overview response."}
        </p>
      ) : (
        <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-8">
          {statuses.map((status) => {
            const count = Number(campaigns[status.key] || 0);
            const percentage =
              allCampaigns > 0
                ? Math.round((count / allCampaigns) * 100)
                : 0;

            return (
              <div key={status.key}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-slate-500">
                    {status.label}
                  </span>
                  <strong className="text-sm font-medium text-slate-700">
                    {formatNumber(count)}
                  </strong>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={cn(
                      "block h-full rounded-full transition-all",
                      status.tone,
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-slate-400">
                  {percentage}% of all campaigns
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function AdminOverviewLoading() {
  return (
    <main className="admin-overview admin-overview--loading" aria-busy="true">
      <div
        className="admin-loading admin-loading--page"
        role="status"
        aria-live="polite"
      >
        <span className="admin-loading__roller" aria-hidden="true">
          <span />
        </span>
        <strong>Preparing your dashboard</strong>
        <p>Loading platform stats and recent activity…</p>
      </div>
    </main>
  );
}

export default function AdminOverview({
  basePath = "/admin",
  withdrawalsPath,
  token,
  fetchOverview,
}) {
  const [period, setPeriod] = useState("7d");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    if (!token || typeof fetchOverview !== "function") {
      setOverview(null);
      setLoading(false);
      setError(
        !token
          ? "Your admin session token was not provided to this page."
          : "The admin overview API method was not provided.",
      );
      return () => {
        isCurrentRequest = false;
      };
    }

    setLoading(true);
    setError("");

    fetchOverview(period, token)
      .then((data) => {
        if (!isCurrentRequest) return;
        setOverview(data);
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setError(
          requestError?.message || "Could not load the admin overview.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [period, token, fetchOverview, reloadKey]);

  const summary = overview?.summary;
  const revenue = overview?.revenuePerformance;
  const resolvedWithdrawalsPath =
    withdrawalsPath || `${basePath}/withdrawals`;

  if (loading && !overview && !error) {
    return <AdminOverviewLoading />;
  }

  return (
    <main
      className="admin-overview min-h-full bg-[#f6f8f7] px-4 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-7"
      aria-busy={loading}
    >
      <div className="admin-overview__inner mx-auto max-w-[1380px]">
        <header className="admin-overview__header flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-emerald-600">
              Daily overview
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-900 sm:text-3xl">
              Today at a glance
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Here&apos;s what&apos;s happening across your platform today.
            </p>
          </div>
        </header>

        <div className="admin-overview__period mt-7 flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {[
            ["7d", "Last 7 days"],
            ["30d", "Last 30 days"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              onClick={() => setPeriod(value)}
              aria-pressed={period === value}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition",
                period === value
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="admin-overview__error mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
              className="font-medium underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}

        <section className="admin-overview__metrics mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Total revenue"
            value={
              summary
                ? formatCurrency(summary.totalRevenue)
                : loading
                  ? "…"
                  : "—"
            }
            note="Platform service fees collected"
            trend={summary?.totalRevenueChangePercent}
            icon={NairaSign}
            tone="green"
          />
          <MetricCard
            label="Active earners"
            value={
              summary
                ? formatNumber(summary.activeEarners)
                : loading
                  ? "…"
                  : "—"
            }
            note="Activated earner accounts"
            icon={Users}
            tone="blue"
          />
          <MetricCard
            label="Escrow balance"
            value={
              summary
                ? formatCurrency(summary.escrowBalance)
                : loading
                  ? "…"
                  : "—"
            }
            note={
              summary
                ? `Across ${formatNumber(summary.openTasks)} open tasks`
                : "Reserved advertiser funds"
            }
            icon={WalletCards}
          />
        </section>

        <section className="admin-overview__content mt-6 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <RevenuePerformancePanel
              period={period}
              loading={loading}
              data={
                revenue
                  ? {
                      ...revenue,
                      recentActivity: overview?.recentActivity || [],
                    }
                  : null
              }
            />
          </div>
          <div className="xl:col-span-4">
            <PeopleCard people={overview?.people} loading={loading} />
          </div>
        </section>

        <section className="admin-overview__section mt-6">
          <WithdrawalsCard
            withdrawalsPath={resolvedWithdrawalsPath}
            withdrawalsData={overview?.withdrawalsAwaitingApproval}
            loading={loading}
          />
        </section>

        <div className="admin-overview__section mt-6">
          <CampaignStatusCard
            campaigns={overview?.campaigns}
            loading={loading}
          />
        </div>

        <div className="admin-overview__status mt-5 flex items-center gap-2 text-xs text-slate-400">
          {loading ? (
            <span
              className="admin-loading admin-loading--compact"
              role="status"
              aria-live="polite"
            >
              <span className="admin-loading__roller" aria-hidden="true">
                <span />
              </span>
              <span>Refreshing dashboard data</span>
              <span className="admin-loading__sr-only">
                The selected date range is updating.
              </span>
            </span>
          ) : error ? (
            <>
              <AlertTriangle size={14} className="text-rose-500" />
              Dashboard could not refresh
            </>
          ) : (
            <>
              <CheckCircle2 size={14} className="text-emerald-500" />
              Dashboard data loaded from the API
            </>
          )}
        </div>
      </div>
    </main>
  );
}