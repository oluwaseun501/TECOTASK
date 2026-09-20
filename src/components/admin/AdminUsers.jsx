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
import { useMemo, useState } from "react";

import { adminUsers } from "../data/adminUsersData";
import "../../styles/AdminUsers.css";

const tabs = [
  { key: "all", label: "All users", icon: Users },
  { key: "earner", label: "Earners", icon: UserRoundCheck },
  { key: "advertiser", label: "Advertisers", icon: Megaphone },
  { key: "moderator", label: "Moderators", icon: ShieldCheck },
];

const roleStyles = {
  earner: "user-role user-role--earner",
  advertiser: "user-role user-role--advertiser",
  moderator: "user-role user-role--moderator",
};

const statusStyles = {
  Active: "user-status user-status--active",
  Pending: "user-status user-status--pending",
  Suspended: "user-status user-status--suspended",
};

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
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
  const [statusFilter, setStatusFilter] = useState("All statuses");

  const counts = useMemo(
    () => ({
      all: adminUsers.length,
      earner: adminUsers.filter((user) => user.roleKey === "earner").length,
      advertiser: adminUsers.filter((user) => user.roleKey === "advertiser")
        .length,
      moderator: adminUsers.filter((user) => user.roleKey === "moderator")
        .length,
    }),
    [],
  );

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return adminUsers.filter((user) => {
      const matchesTab = activeTab === "all" || user.roleKey === activeTab;

      const matchesStatus =
        statusFilter === "All statuses" || user.status === statusFilter;

      const matchesSearch =
        !normalizedSearch ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.username.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      return matchesTab && matchesStatus && matchesSearch;
    });
  }, [activeTab, search, statusFilter]);

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

          <div className="admin-users-live-status">
            <span />
            <div>
              <strong>Live directory</strong>
              <small>Updated just now</small>
            </div>
          </div>
        </header>

        <section className="user-summary-grid">
          <SummaryCard
            label="Total users"
            value={adminUsers.length}
            detail="Across all account types"
            tone="green"
          />
          <SummaryCard
            label="Active today"
            value="132,406"
            detail="Users active in the last 24 hours"
            tone="blue"
          />
          <SummaryCard
            label="Pending review"
            value={
              adminUsers.filter((user) => user.status === "Pending").length
            }
            detail="Accounts waiting for attention"
            tone="amber"
          />
          <SummaryCard
            label="Suspended"
            value={
              adminUsers.filter((user) => user.status === "Suspended").length
            }
            detail="Accounts currently restricted"
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
                  onClick={() => setActiveTab(tab.key)}
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
                placeholder="Search by name, username or email..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <label className="users-filter">
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All statuses</option>
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            </label>
          </div>

          <div className="users-table-wrapper">
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
                        <span className="user-avatar">
                          {user.initials || getInitials(user.name)}
                        </span>

                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.username}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={roleStyles[user.roleKey]}>
                        {user.role}
                      </span>
                    </td>

                    <td>
                      <span className={statusStyles[user.status]}>
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

            {filteredUsers.length === 0 && (
              <div className="users-empty-state">
                <Users size={24} />
                <strong>No users found</strong>
                <span>Try changing your search or filter.</span>
              </div>
            )}
          </div>

          <div className="users-table-footer">
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{adminUsers.length}</strong> users
          </div>
        </section>
      </div>
    </main>
  );
}
