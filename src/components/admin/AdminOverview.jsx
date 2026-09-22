import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  ShieldAlert,
  Users,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const withdrawalRows = [
  {
    initials: "CO",
    name: "Chinedu Okafor",
    account: "@chinedu•••441",
    amount: "₦46,200",
    status: "Cleared",
    tone: "green",
  },
  {
    initials: "AB",
    name: "Aisha Bello",
    account: "Opay •••1009",
    amount: "₦2,500",
    status: "Cleared",
    tone: "green",
  },
  {
    initials: "SY",
    name: "Samuel Iyke",
    account: "PalmPay •••2088",
    amount: "₦38,000",
    status: "Manual review",
    tone: "amber",
  },
  {
    initials: "GE",
    name: "Grace Effiong",
    account: "Moniepoint •••7174",
    amount: "₦6,300",
    status: "Cleared",
    tone: "green",
  },
];


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
        avatarStyles[tone] || avatarStyles.green
      )}
    >
      {initials}
    </span>
  );
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
        <h2 className="truncate text-sm font-semibold tracking-[-0.01em] text-slate-800">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        {action}

        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
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
      trend: "text-slate-400",
    },
    green: {
      card: "border-emerald-200 bg-emerald-50/70",
      icon: "bg-emerald-100 text-emerald-700",
      trend: "text-emerald-600",
    },
    blue: {
      card: "border-blue-200 bg-blue-50/60",
      icon: "bg-blue-100 text-blue-700",
      trend: "text-blue-600",
    },
    amber: {
      card: "border-amber-200 bg-amber-50/70",
      icon: "bg-amber-100 text-amber-700",
      trend: "text-amber-600",
    },
  };

  const currentStyle = styles[tone] || styles.default;

  return (
    <article
      className={cn(
        "rounded-2xl border p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]",
        currentStyle.card
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
          {label}
        </p>

        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            currentStyle.icon
          )}
        >
          <Icon size={17} strokeWidth={1.8} />
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <strong className="text-2xl font-semibold tracking-[-0.05em] text-slate-900">
          {value}
        </strong>

        {trend && (
          <span
            className={cn(
              "mb-1 flex items-center gap-1 text-xs font-medium",
              currentStyle.trend
            )}
          >
            <ArrowUpRight size={13} />
            {trend}
          </span>
        )}
      </div>

      <p className="mt-2 text-xs text-slate-400">{note}</p>
    </article>
  );
}

function RevenuePerformancePanel({ period }) {
  const breakdown = [
    {
      label: "Completed payouts",
      amount: "₦2,410,000",
      percentage: 62,
      tone: "bg-emerald-500",
    },
    {
      label: "Pending withdrawals",
      amount: "₦930,000",
      percentage: 24,
      tone: "bg-amber-500",
    },
    {
      label: "Platform fees",
      amount: "₦530,000",
      percentage: 14,
      tone: "bg-slate-400",
    },
  ];

  const activity = [
    {
      title: "Campaign payout processed",
      detail: "Chinedu Okafor · 8 mins ago",
      amount: "₦46,200",
      type: "success",
    },
    {
      title: "Advertiser wallet funded",
      detail: "BrightPath Campaign · 26 mins ago",
      amount: "₦120,000",
      type: "success",
    },
    {
      title: "Withdrawal awaiting approval",
      detail: "Samuel Iyke · 48 mins ago",
      amount: "₦38,000",
      type: "warning",
    },
  ];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SectionHeading
            title="Revenue performance"
            subtitle={`Money movement for ${period.toLowerCase()}`}
            icon={DollarSign}
          />

          <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                Total collected
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <strong className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">
                  ₦3,870,000
                </strong>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-600">
                  <ArrowUpRight size={12} />
                  18.4%
                </span>
              </div>

              <p className="mt-2 text-xs text-slate-400">
                Compared with the previous period
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-emerald-600">
                Average daily revenue
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-800">
                ₦553,000
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {breakdown.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">{item.label}</span>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700">
                      {item.amount}
                    </span>

                    <span className="w-8 text-right text-xs text-slate-400">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                  <span
                    className={cn(
                      "block h-full rounded-full transition-all",
                      item.tone
                    )}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Recent activity
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                Latest financial events
              </p>
            </div>

            <button
              type="button"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
            </button>
          </div>

          <div className="mt-5 divide-y divide-slate-100">
            {activity.map((item) => {
              const isWarning = item.type === "warning";
              const ActivityIcon = isWarning ? AlertTriangle : CheckCircle2;

              return (
                <div
                  key={item.title}
                  className="flex items-center gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      isWarning
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    )}
                  >
                    <ActivityIcon size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {item.title}
                    </p>

                    <p className="mt-1 truncate text-xs text-slate-400">
                      {item.detail}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "shrink-0 text-sm font-medium",
                      isWarning ? "text-amber-600" : "text-emerald-600"
                    )}
                  >
                    {item.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
}

function PeopleCard() {
  const people = [
    ["Active earners", "132,406"],
    ["Advertisers", "2,918"],
    ["Moderators", "146"],
  ];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <SectionHeading
        title="People on the platform"
        subtitle="Live account totals"
        icon={Users}
      />

      <div className="mt-6 divide-y divide-slate-100">
        {people.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
          >
            <span className="text-sm text-slate-500">{label}</span>

            <strong className="text-sm font-medium text-slate-800">
              {value}
            </strong>
          </div>
        ))}
      </div>
    </article>
  );
}


function WithdrawalsCard({ basePath }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <SectionHeading
        title="Withdrawals awaiting approval"
        subtitle="4 requests · ₦93,000 total"
        action={
          <Link
            to={`${basePath}/moderation`}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            View all
            <ChevronRight size={14} />
          </Link>
        }
      />

      <div className="mt-5 divide-y divide-slate-100">
        {withdrawalRows.map((row) => (
          <div
            key={row.name}
            className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
          >
            <Avatar initials={row.initials} tone={row.tone} />

            <div className="min-w-[130px] flex-1">
              <p className="truncate text-sm font-medium text-slate-700">
                {row.name}
              </p>

              <p className="mt-1 truncate text-xs text-slate-400">
                {row.account}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">
                {row.amount}
              </p>

              <p
                className={cn(
                  "mt-1 text-[11px] font-medium",
                  row.tone === "amber"
                    ? "text-amber-600"
                    : "text-emerald-600"
                )}
              >
                {row.status}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.alert(`${row.status}: ${row.name}`)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition",
                row.tone === "amber"
                  ? "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              )}
            >
              {row.tone === "amber" ? "Inspect" : "Approve"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}


function CampaignStatusCard() {
  const statuses = [
    {
      label: "Active campaigns",
      count: "1,289",
      percentage: 74,
      tone: "bg-emerald-500",
    },
    {
      label: "Pending review",
      count: "318",
      percentage: 19,
      tone: "bg-amber-500",
    },
    {
      label: "Paused",
      count: "109",
      percentage: 7,
      tone: "bg-slate-400",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:p-6">
      <SectionHeading
        title="Campaigns by status"
        subtitle="Current advertiser activity"
        icon={WalletCards}
      />

      <div className="mt-6 grid gap-6 md:grid-cols-3 md:gap-8">
        {statuses.map((status) => (
          <div key={status.label}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-slate-500">
                {status.label}
              </span>

              <strong className="text-sm font-medium text-slate-700">
                {status.count}
              </strong>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <span
                className={cn(
                  "block h-full rounded-full transition-all",
                  status.tone
                )}
                style={{ width: `${status.percentage}%` }}
              />
            </div>

            <p className="mt-2 text-[11px] text-slate-400">
              {status.percentage}% of all campaigns
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function AdminOverview({ basePath = "/admin" }) {
  const [period, setPeriod] = useState("Last 7 days");

  return (
    <main className="min-h-full bg-[#f6f8f7] px-4 py-5 text-slate-800 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-[1440px]">
        {/* Page header */}
        <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
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

          <div className="flex items-center gap-2 self-start rounded-xl border border-emerald-100 bg-white px-3 py-2 lg:self-auto">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <div>
              <p className="text-xs font-medium text-slate-700">Live data</p>
              <p className="text-[10px] text-slate-400">Updated just now</p>
            </div>
          </div>
        </header>

        {/* Period switcher */}
        <div className="mt-7 flex w-fit items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {["Last 7 days", "Last 30 days"].map((item) => (
            <button
              type="button"
              key={item}
              onClick={() => setPeriod(item)}
              className={cn(
                "rounded-lg px-3 py-2 text-xs font-medium transition",
                period === item
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total revenue"
            value="₦3,870,000"
            note="Platform service fees collected"
            trend="18.4%"
            icon={DollarSign}
            tone="green"
          />
<MetricCard
  label="Active earners"
  value="132,406"
  note="Earner accounts currently active"
  trend="9.2%"
  icon={Users}
  tone="blue"
/>

          <MetricCard
            label="Escrow balance"
            value="₦8,420,500"
            note="Across 4,918 open tasks"
            icon={WalletCards}
          />

          <MetricCard
            label="Open risk cases"
            value="27"
            note="4 cases marked high priority"
            icon={ShieldAlert}
            tone="amber"
          />
        </section>

        {/* Revenue panel and side panels */}
     <section className="mt-6 grid gap-6 xl:grid-cols-12">
  <div className="xl:col-span-8">
    <RevenuePerformancePanel period={period} />
  </div>

  <div className="xl:col-span-4">
    <PeopleCard />
  </div>
</section>

        {/* Operational lists */}
       <section className="mt-6">
  <WithdrawalsCard basePath={basePath} />
</section>
        {/* Campaign status */}
        <div className="mt-6">
          <CampaignStatusCard />
        </div>

        {/* Footer status */}
        <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
          <CheckCircle2 size={14} className="text-emerald-500" />
          Dashboard data is updated in real time
        </div>
      </div>
    </main>
  );
}