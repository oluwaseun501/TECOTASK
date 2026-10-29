import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Mail,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

import "../../styles/AdminUsers.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const roleLabels = {
  pending: "Pending",
  earner: "Earner",
  advertiser: "Advertiser",
  moderator: "Moderator",
  admin: "Admin",
};

const manageableRoleOptions = [
  { value: "earner", label: "Earner" },
  { value: "advertiser", label: "Advertiser" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
];

const roleStyles = {
  earner: "user-role user-role--earner",
  advertiser: "user-role user-role--advertiser",
  moderator: "user-role user-role--moderator",
};

const statusStyles = {
  Active: "user-status user-status--active",
  Pending: "user-status user-status--pending",
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(Number(value))
  ) {
    return "—";
  }

  return currencyFormatter.format(Number(value));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-NG");
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

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function createIdempotencyKey() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `admin-adjustment-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}`
  );
}

function getAdminToken() {
  return (
    sessionStorage.getItem("tecotaskToken") ||
    localStorage.getItem("tecotaskToken")
  );
}

function InfoRow({ icon: Icon, children }) {
  return (
    <div>
      <Icon size={15} />
      <span>{children}</span>
    </div>
  );
}

export default function AdminUserDetails({ basePath = "/admin" }) {
  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [referralStats, setReferralStats] = useState({
    total: 0,
    activated: 0,
  });
  const [balance, setBalance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [direction, setDirection] = useState("credit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState("");
  const [adjustmentMessage, setAdjustmentMessage] = useState("");
  const [adjustmentKey, setAdjustmentKey] = useState(
    createIdempotencyKey,
  );

  const [selectedRole, setSelectedRole] = useState("pending");
  const [savingRole, setSavingRole] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [roleMessage, setRoleMessage] = useState("");

  const [activationReference, setActivationReference] = useState("");
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState("");
  const [activationMessage, setActivationMessage] = useState("");

  const [confirmation, setConfirmation] = useState(null);
  const cancelConfirmationRef = useRef(null);

  const actionBusy = adjusting || savingRole || activating;

  useEffect(() => {
    let isCurrentRequest = true;

    async function loadUser() {
      const token = getAdminToken();

      if (!token) {
        setLoadError({
          title: "Admin session required",
          message: "Your admin session token was not found. Sign in again.",
        });
        setLoading(false);
        return;
      }

      setLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/users/${encodeURIComponent(userId)}`,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const requestError = new Error(
            data.message || "Could not load user details.",
          );
          requestError.status = response.status;
          throw requestError;
        }

        if (!isCurrentRequest) return;

        const loadedUser = data.user || null;

        setUser(loadedUser);
        setSelectedRole(loadedUser?.role || "pending");
        setReferralStats(
          data.referralStats || {
            total: 0,
            activated: 0,
          },
        );
        setBalance(data.balance ?? null);
      } catch (requestError) {
        if (!isCurrentRequest) return;

        setLoadError({
          title:
            requestError.status === 404
              ? "User not found"
              : "Could not load user",
          message:
            requestError.message || "Could not load user details.",
        });
      } finally {
        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      isCurrentRequest = false;
    };
  }, [userId, reloadKey]);

  useEffect(() => {
    if (!confirmation) return;

    cancelConfirmationRef.current?.focus();

    function handleConfirmationKeyDown(event) {
      if (event.key === "Escape" && !actionBusy) {
        setConfirmation(null);
      }
    }

    window.addEventListener("keydown", handleConfirmationKeyDown);

    return () => {
      window.removeEventListener("keydown", handleConfirmationKeyDown);
    };
  }, [confirmation, actionBusy]);

  function handleBalanceAdjustment(event) {
    event.preventDefault();
    setAdjustmentError("");
    setAdjustmentMessage("");

    const numericAmount = Number(amount);

    if (!Number.isSafeInteger(numericAmount) || numericAmount < 1) {
      setAdjustmentError("Enter a positive whole-number amount.");
      return;
    }

    if (!balance) {
      setAdjustmentError(
        "Balance data is unavailable. Check that the updated backend route is running.",
      );
      return;
    }

    if (!getAdminToken()) {
      setAdjustmentError("Your admin session token was not found.");
      return;
    }

    setConfirmation({
      type: "balance",
      direction,
      amount: numericAmount,
      description: description.trim(),
      idempotencyKey: adjustmentKey,
      availableBalance: balance.availableBalance,
      userName: user?.fullName || user?.email || "this user",
    });
  }

  async function executeBalanceAdjustment(action) {
    const token = getAdminToken();

    if (!token) {
      setAdjustmentError("Your admin session token was not found.");
      return;
    }

    setAdjusting(true);
    setAdjustmentError("");
    setAdjustmentMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${encodeURIComponent(
          userId,
        )}/balance-adjustment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            direction: action.direction,
            amount: action.amount,
            description: action.description,
            idempotencyKey: action.idempotencyKey,
          }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not adjust this user's balance.",
        );
      }

      const newBalance = Number(data.adjustment?.balanceAfter);

      setBalance((currentBalance) =>
        currentBalance
          ? {
              ...currentBalance,
              availableBalance: Number.isFinite(newBalance)
                ? newBalance
                : currentBalance.availableBalance,
            }
          : currentBalance,
      );

      setAdjustmentMessage(
        `Balance ${
          action.direction === "credit" ? "credited" : "debited"
        } successfully.`,
      );
      setAmount("");
      setDescription("");
      setAdjustmentKey(createIdempotencyKey());
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setAdjustmentError(
        requestError.message || "Could not adjust this user's balance.",
      );
    } finally {
      setAdjusting(false);
    }
  }

  function handleRoleUpdate(event) {
    event.preventDefault();
    setRoleError("");
    setRoleMessage("");

    const currentRole = user?.role || "pending";

    if (selectedRole === currentRole) return;

    if (!getAdminToken()) {
      setRoleError("Your admin session token was not found.");
      return;
    }

    setConfirmation({
      type: "role",
      role: selectedRole,
      currentRole,
      userName: user?.fullName || user?.email || "this user",
    });
  }

  async function executeRoleUpdate(action) {
    const token = getAdminToken();

    if (!token) {
      setRoleError("Your admin session token was not found.");
      return;
    }

    setSavingRole(true);
    setRoleError("");
    setRoleMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${encodeURIComponent(userId)}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: action.role }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Could not update this user's role.",
        );
      }

      if (data.user) {
        setUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                ...data.user,
                referredBy: currentUser.referredBy,
              }
            : data.user,
        );
        setSelectedRole(data.user.role || action.role);
      }

      setRoleMessage(data.message || "User role updated successfully.");
      setActivationError("");
      setActivationMessage("");
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setRoleError(
        requestError.message || "Could not update this user's role.",
      );
    } finally {
      setSavingRole(false);
    }
  }

  function handleEarnerActivation(event) {
    event.preventDefault();
    setActivationError("");
    setActivationMessage("");

    if (user?.role !== "earner" || user.isActivated) return;

    if (!getAdminToken()) {
      setActivationError("Your admin session token was not found.");
      return;
    }

    setConfirmation({
      type: "activation",
      reference: activationReference.trim(),
      userName: user.fullName || user.email || "this user",
    });
  }

  async function executeEarnerActivation(action) {
    const token = getAdminToken();

    if (!token) {
      setActivationError("Your admin session token was not found.");
      return;
    }

    setActivating(true);
    setActivationError("");
    setActivationMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/users/${encodeURIComponent(
          userId,
        )}/activation`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            action.reference
              ? { activationPaymentReference: action.reference }
              : {},
          ),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not activate this earner.");
      }

      if (data.user) {
        setUser((currentUser) =>
          currentUser
            ? {
                ...currentUser,
                ...data.user,
                referredBy: currentUser.referredBy,
              }
            : data.user,
        );
      }

      setActivationReference("");
      setActivationMessage(
        data.message || "Earner activated successfully.",
      );
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setActivationError(
        requestError.message || "Could not activate this earner.",
      );
    } finally {
      setActivating(false);
    }
  }

  async function confirmAdminAction() {
    if (!confirmation || actionBusy) return;

    const action = confirmation;

    if (action.type === "balance") {
      await executeBalanceAdjustment(action);
    } else if (action.type === "role") {
      await executeRoleUpdate(action);
    } else if (action.type === "activation") {
      await executeEarnerActivation(action);
    }

    setConfirmation(null);
  }

  if (loading) {
    return (
      <main className="admin-users-page">
        <div className="admin-users-container">
          <div
            className="admin-users-loading admin-users-loading--page"
            role="status"
            aria-live="polite"
          >
            <span
              className="admin-users-loading__roller"
              aria-hidden="true"
            />
            <span>Loading user details…</span>
            <small>Fetching this account from the platform.</small>
          </div>
        </div>
      </main>
    );
  }

  if (loadError || !user) {
    return (
      <main className="admin-users-page">
        <div className="admin-users-container">
          <div className="user-not-found">
            <h1>{loadError?.title || "User not found"}</h1>
            <p>
              {loadError?.message ||
                "This user account was not returned by the API."}
            </p>

            {loadError?.title !== "Admin session required" && (
              <button
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
              >
                Try again
              </button>
            )}

            <p>
              <Link to={`${basePath}/users`}>Return to all users</Link>
            </p>
          </div>
        </div>
      </main>
    );
  }

  const name = user.fullName || user.email || "Unknown user";
  const roleKey = user.role || "pending";
  const role = roleLabels[roleKey] || roleKey;

  const status =
    roleKey === "pending" ||
    (roleKey === "earner" && !user.isActivated)
      ? "Pending"
      : "Active";

  const canAdjustBalance = [
    "earner",
    "advertiser",
    "moderator",
  ].includes(roleKey);

  const referredBy =
    user.referredBy && typeof user.referredBy === "object"
      ? `${user.referredBy.fullName || "User"}${
          user.referredBy.email ? ` · ${user.referredBy.email}` : ""
        }`
      : "No referrer";

  const stats = [
    {
      label: "Total referrals",
      value: formatNumber(referralStats.total),
    },
    {
      label: "Activated referrals",
      value: formatNumber(referralStats.activated),
    },
    {
      label: "Account created",
      value: formatDate(user.createdAt),
    },
  ];

  const earnerBalanceRows =
    roleKey === "earner" && balance
      ? [
          ["Task earnings", balance.taskEarnings],
          ["Referral earnings", balance.referralEarnings],
          ["Admin credits", balance.adminCredits],
          ["Admin debits", balance.adminDebits],
          ["Paid withdrawals", balance.paidWithdrawals],
          ["Pending withdrawals", balance.pendingWithdrawals],
        ]
      : [];

  const confirmationTitle = confirmation
    ? confirmation.type === "balance"
      ? `Confirm ${
          confirmation.direction === "credit" ? "credit" : "debit"
        }`
      : confirmation.type === "role"
        ? "Confirm role change"
        : "Activate earner account?"
    : "";

  const confirmationDescription = confirmation
    ? confirmation.type === "balance"
      ? `${confirmation.direction === "credit" ? "Credit" : "Debit"} ${
          confirmation.userName
        }'s balance by ${formatCurrency(confirmation.amount)}?`
      : confirmation.type === "role"
        ? confirmation.role === "admin"
          ? `Promote ${confirmation.userName} to Admin? This grants full administrator access.`
          : `Change ${confirmation.userName}'s role from ${
              roleLabels[confirmation.currentRole] ||
              confirmation.currentRole
            } to ${roleLabels[confirmation.role] || confirmation.role}?`
        : `Activate ${confirmation.userName} as an earner? They will be able to start tasks and submit proof.`
    : "";

  const confirmationTone =
    confirmation?.type === "balance" &&
    confirmation.direction === "debit"
      ? "danger"
      : confirmation?.type === "role" && confirmation.role === "admin"
        ? "warning"
        : "success";

  const confirmationButtonText = confirmation
    ? confirmation.type === "balance"
      ? `Confirm ${
          confirmation.direction === "credit" ? "credit" : "debit"
        }`
      : confirmation.type === "role"
        ? "Confirm role change"
        : "Activate earner"
    : "Confirm";

  return (
    <main className="admin-users-page">
      <div className="admin-users-container">
        <Link to={`${basePath}/users`} className="user-back-link">
          <ArrowLeft size={16} />
          Back to all users
        </Link>

        <section className="user-profile-card">
          <div className="user-profile-main">
            <span className="user-profile-avatar">{getInitials(name)}</span>

            <div className="user-profile-heading">
              <div className="user-name-line">
                <h1>{name}</h1>
                <span className={roleStyles[roleKey] || "user-role"}>
                  {role}
                </span>
              </div>

              <p>{user.email || "Email not provided"}</p>

              <div className="user-profile-meta">
                <span className={statusStyles[status]}>
                  <i />
                  {status}
                </span>

                <span>
                  <CalendarDays size={14} />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="user-profile-verification">
            {roleKey === "earner" ? (
              user.isActivated ? (
                <>
                  <CheckCircle2 size={17} />
                  <div>
                    <strong>Account activated</strong>
                    <span>
                      {user.activatedAt
                        ? `Activated ${formatDate(user.activatedAt)}`
                        : "This earner account is activated"}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <AlertTriangle size={17} />
                  <div>
                    <strong>Earner activation required</strong>
                    <span>
                      Activation is needed before this earner can perform
                      tasks.
                    </span>
                  </div>
                </>
              )
            ) : roleKey === "pending" ? (
              <>
                <AlertTriangle size={17} />
                <div>
                  <strong>Role not assigned</strong>
                  <span>
                    Activation applies only after an account is assigned the
                    Earner role.
                  </span>
                </div>
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                <div>
                  <strong>Activation not required</strong>
                  <span>
                    Only Earner accounts need activation before performing
                    tasks.
                  </span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="user-details-stat-grid">
          {stats.map((stat) => (
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

              <div className="user-no-history">
                <Clock3 size={20} />
                <span>
                  Activity history is not included in the user details API yet.
                </span>
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

              <div className="user-no-history">
                <WalletCards size={20} />
                <span>
                  Withdrawal history is not included in the user details API
                  yet.
                </span>
              </div>
            </article>
          </div>

          <aside className="user-details-side-column">
            <article className="user-details-card">
              <div className="user-details-card-heading">
                <div>
                  <h2>Role management</h2>
                  <p>Change this user’s platform role</p>
                </div>
                <ShieldCheck size={17} />
              </div>

              <form
                onSubmit={handleRoleUpdate}
                className="user-admin-form"
              >
                <label>
                  <span>Role</span>
                  <select
                    value={selectedRole}
                    disabled={savingRole}
                    onChange={(event) => {
                      setSelectedRole(event.target.value);
                      setRoleError("");
                      setRoleMessage("");
                    }}
                  >
                    {roleKey === "pending" && (
                      <option value="pending" disabled>
                        Pending — choose a role
                      </option>
                    )}

                    {manageableRoleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <p className="users-muted-text">
                  Admin grants administrator access. Changing a user to Earner
                  does not activate them; inactive earners still need
                  activation.
                </p>

                {roleError && (
                  <p role="alert" className="user-form-message user-form-message--error">
                    {roleError}
                  </p>
                )}

                {roleMessage && (
                  <p role="status" className="user-form-message user-form-message--success">
                    {roleMessage}
                  </p>
                )}

                <button
                  type="submit"
                  className="user-admin-action-button user-admin-action-button--dark"
                  disabled={savingRole || selectedRole === roleKey}
                >
                  {savingRole ? "Saving role…" : "Save role"}
                </button>
              </form>
            </article>

            <article className="user-details-card">
              <div className="user-details-card-heading">
                <div>
                  <h2>User balance</h2>
                  <p>Available funds and admin adjustment</p>
                </div>
                <WalletCards size={17} />
              </div>

              {balance ? (
                <div className="user-balance-summary">
                  <p className="users-muted-text">Available balance</p>
                  <strong>{formatCurrency(balance.availableBalance)}</strong>

                  {balance.reservedBalance != null && (
                    <p className="users-muted-text">
                      Reserved: {formatCurrency(balance.reservedBalance)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="user-no-history">
                  Balance data is unavailable for this account.
                </p>
              )}

              {canAdjustBalance ? (
                <form
                  onSubmit={handleBalanceAdjustment}
                  className="user-admin-form"
                >
                  <label>
                    <span>Action</span>
                    <select
                      value={direction}
                      onChange={(event) => {
                        setDirection(event.target.value);
                        setAdjustmentKey(createIdempotencyKey());
                        setAdjustmentError("");
                        setAdjustmentMessage("");
                      }}
                    >
                      <option value="credit">Credit</option>
                      <option value="debit">Debit</option>
                    </select>
                  </label>

                  <label>
                    <span>Amount (NGN)</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      required
                      value={amount}
                      onChange={(event) => {
                        setAmount(event.target.value);
                        setAdjustmentKey(createIdempotencyKey());
                        setAdjustmentError("");
                        setAdjustmentMessage("");
                      }}
                    />
                  </label>

                  <label>
                    <span>Description</span>
                    <input
                      type="text"
                      maxLength="500"
                      value={description}
                      onChange={(event) => {
                        setDescription(event.target.value);
                        setAdjustmentKey(createIdempotencyKey());
                        setAdjustmentError("");
                        setAdjustmentMessage("");
                      }}
                      placeholder="Reason for adjustment"
                    />
                  </label>

                  <p className="users-muted-text">
                    The balance change will be recorded. Debits cannot exceed
                    the available balance.
                  </p>

                  {adjustmentError && (
                    <p role="alert" className="user-form-message user-form-message--error">
                      {adjustmentError}
                    </p>
                  )}

                  {adjustmentMessage && (
                    <p role="status" className="user-form-message user-form-message--success">
                      {adjustmentMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    className={`user-admin-action-button ${
                      direction === "credit"
                        ? "user-admin-action-button--green"
                        : "user-admin-action-button--red"
                    }`}
                    disabled={adjusting || !balance}
                  >
                    {adjusting
                      ? "Saving adjustment…"
                      : `${direction === "credit" ? "Credit" : "Debit"} user`}
                  </button>
                </form>
              ) : (
                <p className="user-no-history user-balance-unavailable">
                  This account role does not have an adjustable wallet.
                </p>
              )}

              {earnerBalanceRows.length > 0 && (
                <div className="user-balance-breakdown">
                  <h3>Balance breakdown</h3>
                  <div>
                    {earnerBalanceRows.map(([label, value]) => (
                      <div key={label}>
                        <span className="users-muted-text">{label}</span>
                        <strong>{formatCurrency(value)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <article className="user-details-card">
              <div className="user-details-card-heading">
                <div>
                  <h2>Account information</h2>
                  <p>Details returned by the platform</p>
                </div>
                <UserRound size={17} />
              </div>

              <div className="user-information-list">
                <InfoRow icon={Mail}>
                  {user.email || "Email not provided"}
                </InfoRow>
                <InfoRow icon={ShieldCheck}>Role: {role}</InfoRow>
                <InfoRow icon={UserRound}>
                  Referral code: {user.referralCode || "Not set"}
                </InfoRow>
                <InfoRow icon={UserRound}>Referred by: {referredBy}</InfoRow>
                <InfoRow icon={CalendarDays}>
                  Last updated: {formatDate(user.updatedAt)}
                </InfoRow>
              </div>
            </article>

            <article className="user-details-card user-account-status-card">
              <div className="user-details-card-heading">
                <div>
                  <h2>Account status</h2>
                  <p>Current activation state</p>
                </div>
              </div>

              <div className="user-status-large">
                <span className={statusStyles[status]}>
                  <i />
                  {status}
                </span>

                <p>
                  {roleKey === "earner"
                    ? user.isActivated
                      ? "This earner is activated and can start tasks and submit proof."
                      : "This earner must be activated before starting tasks or submitting proof."
                    : roleKey === "pending"
                      ? "Assign a role to complete this account’s setup."
                      : "Earner activation is not required for this role."}{" "}
                  Suspension details are not provided by this endpoint.
                </p>
              </div>

              {activationError && (
                <p
                  role="alert"
                  className="user-form-message user-form-message--error"
                >
                  {activationError}
                </p>
              )}

              {activationMessage && (
                <p
                  role="status"
                  className="user-form-message user-form-message--success"
                >
                  {activationMessage}
                </p>
              )}

              {roleKey === "earner" && !user.isActivated && (
                <form
                  onSubmit={handleEarnerActivation}
                  className="user-admin-form"
                >
                  <label>
                    <span>Payment reference (optional)</span>
                    <input
                      type="text"
                      maxLength={150}
                      value={activationReference}
                      onChange={(event) => {
                        setActivationReference(event.target.value);
                        setActivationError("");
                        setActivationMessage("");
                      }}
                      placeholder="Enter a reference if available"
                    />
                  </label>

                  <button
                    type="submit"
                    className="user-admin-action-button user-admin-action-button--green"
                    disabled={activating}
                  >
                    {activating ? "Activating earner…" : "Activate earner"}
                  </button>
                </form>
              )}
            </article>
          </aside>
        </section>
      </div>

      {confirmation && (
        <div
          className="admin-user-confirm-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !actionBusy) {
              setConfirmation(null);
            }
          }}
        >
          <section
            className="admin-user-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-user-confirm-title"
            aria-describedby="admin-user-confirm-description"
            aria-busy={actionBusy}
          >
            <div
              className={`admin-user-confirm-modal__icon admin-user-confirm-modal__icon--${confirmationTone}`}
            >
              {confirmationTone === "danger" ||
              confirmationTone === "warning" ? (
                <AlertTriangle size={21} />
              ) : (
                <CheckCircle2 size={21} />
              )}
            </div>

            <span className="admin-user-confirm-modal__eyebrow">
              ADMIN ACTION
            </span>

            <h2 id="admin-user-confirm-title">{confirmationTitle}</h2>

            <p id="admin-user-confirm-description">
              {confirmationDescription}
            </p>

            {confirmation.type === "balance" && (
              <div className="admin-user-confirm-modal__details">
                <div>
                  <span>Account</span>
                  <strong>{confirmation.userName}</strong>
                </div>
                <div>
                  <span>Adjustment</span>
                  <strong>
                    {confirmation.direction === "credit" ? "Credit" : "Debit"}{" "}
                    {formatCurrency(confirmation.amount)}
                  </strong>
                </div>
                <div>
                  <span>Current available balance</span>
                  <strong>
                    {formatCurrency(confirmation.availableBalance)}
                  </strong>
                </div>
                {confirmation.description && (
                  <div>
                    <span>Description</span>
                    <strong>{confirmation.description}</strong>
                  </div>
                )}
              </div>
            )}

            {confirmation.type === "role" && (
              <div className="admin-user-confirm-modal__details">
                <div>
                  <span>Account</span>
                  <strong>{confirmation.userName}</strong>
                </div>
                <div> 

_                  <span>New role</span>
                  <strong>
                    {roleLabels[confirmation.role] || confirmation.role}
                  </strong>
                </div>
              </div>
            )}

            {confirmation.type === "activation" &&
              confirmation.reference && (
                <div className="admin-user-confirm-modal__details">
                  <div>
                    <span>Payment reference</span>
                    <strong>{confirmation.reference}</strong>
                  </div>
                </div>
              )}

            <div className="admin-user-confirm-modal__actions">
              <button
                ref={cancelConfirmationRef}
                type="button"
                className="admin-user-confirm-button admin-user-confirm-button--secondary"
                disabled={actionBusy}
                onClick={() => setConfirmation(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`admin-user-confirm-button admin-user-confirm-button--${confirmationTone}`}
                disabled={actionBusy}
                onClick={() => void confirmAdminAction()}
              >
                {adjusting
                  ? "Saving adjustment…"
                  : savingRole
                    ? "Saving role…"
                    : activating
                      ? "Activating…"
                      : confirmationButtonText}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}