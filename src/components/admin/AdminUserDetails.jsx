import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  WalletCards,
  AlertTriangle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { adminUsers } from "../data/adminUsersData";

import "../../styles/AdminUsers.css";

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

export default function AdminUserDetails({ basePath = "/admin" }) {
  const { userId } = useParams();
  const user = adminUsers.find((item) => item.id === userId);

  if (!user) {
    return (
      <main className="admin-users-page">
        <div className="admin-users-container">
          <div className="user-not-found">
            <h1>User not found</h1>
            <p>The user you are looking for does not exist.</p>
            <Link to={`${basePath}/users`}>Return to all users</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-users-page">
      <div className="admin-users-container">
        <Link to={`${basePath}/users`} className="user-back-link">
          <ArrowLeft size={16} />
          Back to all users
        </Link>

        <section className="user-profile-card">
          <div className="user-profile-main">
            <span className="user-profile-avatar">{user.initials}</span>

            <div className="user-profile-heading">
              <div className="user-name-line">
                <h1>{user.name}</h1>
                <span className={roleStyles[user.roleKey]}>{user.role}</span>
              </div>

              <p>{user.username}</p>

              <div className="user-profile-meta">
                <span className={statusStyles[user.status]}>
                  <i />
                  {user.status}
                </span>

                <span>
                  <CalendarDays size={14} />
                  Joined {user.joined}
                </span>
              </div>
            </div>
          </div>

          <div className="user-profile-verification">
            {user.verification === "Verified" ? (
              <>
                <CheckCircle2 size={17} />
                <div>
                  <strong>Verified account</strong>
                  <span>Identity has been confirmed</span>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle size={17} />
                <div>
                  <strong>{user.verification}</strong>
                  <span>Account requires attention</span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="user-details-stat-grid">
          {user.stats.map((stat) => (
            <article className="user-details-stat" key={stat.label}>
              <p>{stat.label}</p>
              <strong>{stat.value}</strong>
              <ArrowUpRight size={16} />
            </article>
          ))}
        </section>

        <section className="user-details-grid">
          <div className="user-details-main-column">
            <article className="user-details-card">
              <div className="user-details-card-heading">
                <div>
                  <h2>Recent activity</h2>
                  <p>Latest actions connected to this account</p>
                </div>

                <Clock3 size={17} />
              </div>

              <div className="user-activity-list">
                {user.activity.map((item) => {
                  const isWarning = item.type === "warning";

                  return (
                    <div className="user-activity-row" key={item.title}>
                      <span
                        className={
                          isWarning
                            ? "user-activity-icon user-activity-icon--warning"
                            : item.type === "success"
                              ? "user-activity-icon user-activity-icon--success"
                              : "user-activity-icon"
                        }
                      >
                        {isWarning ? (
                          <AlertTriangle size={15} />
                        ) : item.type === "success" ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <Clock3 size={15} />
                        )}
                      </span>

                      <div>
                        <strong>{item.title}</strong>
                        <small>{item.detail}</small>
                      </div>

                      {item.amount && (
                        <span
                          className={
                            isWarning
                              ? "user-activity-amount user-activity-amount--warning"
                              : "user-activity-amount"
                          }
                        >
                          {item.amount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="user-details-card">
              <div className="user-details-card-heading">
                <div>
                  <h2>Withdrawal history</h2>
                  <p>Recent withdrawal requests from this account</p>
                </div>

                <WalletCards size={17} />
              </div>

              {user.withdrawals.length > 0 ? (
                <div className="user-withdrawal-list">
                  {user.withdrawals.map((withdrawal) => (
                    <div
                      className="user-withdrawal-row"
                      key={`${withdrawal.date}-${withdrawal.amount}`}
                    >
                      <div>
                        <strong>{withdrawal.amount}</strong>
                        <small>
                          {withdrawal.method} · {withdrawal.date}
                        </small>
                      </div>

                      <span
                        className={
                          withdrawal.status === "Pending"
                            ? "user-status user-status--pending"
                            : "user-status user-status--active"
                        }
                      >
                        <i />
                        {withdrawal.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="user-no-history">
                  <WalletCards size={20} />
                  <span>No withdrawal history for this account.</span>
                </div>
              )}
            </article>
          </div>

          <aside className="user-details-side-column">
            <article className="user-details-card">
              <div className="user-details-card-heading">
                <div>
                  <h2>Account information</h2>
                  <p>Personal and contact details</p>
                </div>

                <UserRound size={17} />
              </div>

              <div className="user-information-list">
                <div>
                  <Mail size={15} />
                  <span>{user.email}</span>
                </div>

                <div>
                  <Phone size={15} />
                  <span>{user.phone}</span>
                </div>

                <div>
                  <MapPin size={15} />
                  <span>{user.location}</span>
                </div>

                <div>
                  <ShieldCheck size={15} />
                  <span>{user.verification}</span>
                </div>
              </div>
            </article>

            <article className="user-details-card user-account-status-card">
              <div className="user-details-card-heading">
                <div>
                  <h2>Account status</h2>
                  <p>Current access level</p>
                </div>
              </div>

              <div className="user-status-large">
                <span className={statusStyles[user.status]}>
                  <i />
                  {user.status}
                </span>

                <p>
                  This account is currently{" "}
                  <strong>{user.status.toLowerCase()}</strong> on the platform.
                </p>
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  );
}
