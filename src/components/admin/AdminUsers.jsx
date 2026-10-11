import {
  ChevronRight,
  Filter,
  Search,
  ShieldCheck,
  Users,
  UserRoundCheck,
  Megaphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import "../../styles/AdminUsers.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const PAGE_SIZE = 20;

const tabs = [
  { key: "all", label: "All users", icon: Users },
  { key: "earner", label: "Earners", icon: UserRoundCheck },
  { key: "advertiser", label: "Advertisers", icon: Megaphone },
  { key: "moderator", label: "Moderators", icon: ShieldCheck },
];

const roleLabels = {
  pending: "Pending",
  earner: "Earner",
  advertiser: "Advertiser",
  moderator: "Moderator",
  admin: "Admin",
};

const roleStyles = {
  earner: "user-role user-role--earner",
  advertiser: "user-role user-role--advertiser",
  moderator: "user-role user-role--moderator",
};

const statusStyles = {
  Active: "user-status user-status--active",
  Pending: "user-status user-status--pending",
};

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SummaryCard({ label, value, detail, tone = "default" }) {
  return (
    <article className={`user-summary-card user-summary-card--${tone}`}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{detail}</span>
    </article>
  );
}

export default function AdminUsers({ basePath = "/admin" }) {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [roleCounts, setRoleCounts] = useState({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadUsers() {
      const token =
        sessionStorage.getItem("tecotaskToken") ||
        localStorage.getItem("tecotaskToken");

      if (!token) {
        setUsers([]);
        setError("Your admin session token was not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });

      if (activeTab !== "all") {
        params.set("role", activeTab);
      }

      if (search.trim()) {
        params.set("search", search.trim());
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/users?${params.toString()}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Could not load users.");
        }

        if (!isCurrentRequest) return;

        setUsers(Array.isArray(data.users) ? data.users : []);
        setRoleCounts(data.roleCounts || {});
        setPagination(
          data.pagination || {
            page,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
          },
        );
        setUpdatedAt(new Date());
      } catch (requestError) {
        if (!isCurrentRequest) return;
        setError(requestError.message || "Could not load users.");
        setUsers([]);
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    }

    loadUsers();

    return () => {
      isCurrentRequest = false;
    };
  }, [activeTab, search, page, reloadKey]);

  const totalUsers = Object.values(roleCounts).reduce(
    (total, count) => total + Number(count || 0),
    0,
  );

  const counts = {
    all: totalUsers,
    earner: Number(roleCounts.earner || 0),
    advertiser: Number(roleCounts.advertiser || 0),
    moderator: Number(roleCounts.moderator || 0),
  };
  const displayedUsers = useMemo(
    () =>
      users.map((user) => {
        const roleKey = user.role || "pending";
        const name = user.fullName || user.email || "Unknown user";

        const status =
          roleKey === "pending" ||
          (roleKey === "earner" && user.isActivated !== true)
            ? "Pending"
            : "Active";

        return {
          id: user.id,
          name,
          email: user.email || "—",
          initials: getInitials(name),
          roleKey,
          role: roleLabels[roleKey] || roleKey,
          status,
          joined: formatDate(user.createdAt),
          lastActive: "—",
          balance: "—",
        };
      }),
    [users],
  );

  const filteredUsers = useMemo(
    () =>
      displayedUsers.filter((user) => {
        return statusFilter === "all" || user.status === statusFilter;
      }),
    [displayedUsers, statusFilter],
  );

  const updatedLabel = updatedAt
    ? `Updated ${updatedAt.toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
      })}`
    : loading
      ? "Loading users"
      : "Waiting for data";

  return (
    <main className="admin-users-page">
      <div className="admin-users-container">
        <header className="admin-users-header">
          <div>
            <p className="admin-users-eyebrow">Platform directory</p>
            <h1>All users</h1>
            <p className="admin-users-description">
              Search and manage everyone using your platform.
            </p>
          </div>

          {/* <div className="admin-users-live-status">
            <span />
            <div>
              <strong>{error ? "Data unavailable" : "Live directory"}</strong>
              <small>{updatedLabel}</small>
            </div>
          </div> */}
        </header>

        {error && (
          <div className="users-empty-state" role="alert">
            <strong>Could not load users</strong>
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        )}

        <section className="user-summary-grid">
          <SummaryCard
            label="Total users"
            value={totalUsers}
            detail="Across all account types"
            tone="green"
          />
          <SummaryCard
            label="Active today"
            value="—"
            detail="Last-active data is not returned by the API"
            tone="blue"
          />
          <SummaryCard
            label="Pending role"
            value={Number(roleCounts.pending || 0)}
            detail="Accounts that have not selected a role"
            tone="amber"
          />
          <SummaryCard
            label="Suspended"
            value="—"
            detail="Suspension status is not returned by the API"
            tone="red"
          />
        </section>

        <section className="users-content-card">
          <div className="users-tabs" role="tablist" aria-label="User types">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`users-tab ${isActive ? "users-tab--active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setPage(1);
                  }}
                >
                  <Icon size={15} />
                  {tab.label}
                  <span>{counts[tab.key]}</span>
                </button>
              );
            })}
          </div>

          <div className="users-toolbar">
            <label className="users-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search by name, referral code or email..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <label className="users-filter">
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
              </select>
            </label>
          </div>

          <div
  className={`users-table-wrapper ${
    loading ? "users-table-wrapper--loading" : ""
  }`}
  aria-busy={loading}
>
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last active</th>
                  <th>Balance</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-table-person">
                        <span className="user-avatar">{user.initials}</span>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={roleStyles[user.roleKey] || "user-role"}>
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span
                        className={statusStyles[user.status] || "user-status"}
                      >
                        <i />
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <span className="users-muted-text">{user.joined}</span>
                    </td>

                    <td>
                      <span className="users-muted-text">
                        {user.lastActive}
                      </span>
                    </td>

                    <td>
                      <strong className="user-balance">{user.balance}</strong>
                    </td>

                    <td>
                      <Link
                        to={`${basePath}/users/${user.id}`}
                        className="user-view-link"
                      >
                        View
                        <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

           {loading && (
  <div className="admin-users-loading" role="status" aria-live="polite">
    <span className="admin-users-loading__roller" aria-hidden="true" />
    <span>Loading users…</span>
  </div>
)}
            {!loading && !error && filteredUsers.length === 0 && (
              <div className="users-empty-state">
                <Users size={24} />
                <strong>No users found</strong>
                <span>Try changing your search or filter.</span>
              </div>
            )}
          </div>

          <div className="users-table-footer">
            <span>
              Showing {filteredUsers.length} on this page · {pagination.total}{" "}
              matching users
            </span>

            {pagination.totalPages > 1 && (
              <span>
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>{" "}
                Page {page} of {pagination.totalPages}{" "}
                <button
                  type="button"
                  disabled={page >= pagination.totalPages || loading}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(pagination.totalPages, current + 1),
                    )
                  }
                >
                  Next
                </button>
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
