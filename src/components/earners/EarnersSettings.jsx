import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/EarnersSettings.css";

function getInitials(fullName = "") {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "TT"
  );
}

function displayRole(role = "") {
  return role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "—";
}

const EarnersSettings = () => {
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [accountError, setAccountError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const data = await authApi.getSettings(token);

        if (isMounted) {
          setAccount(data.account || null);
        }
      } catch (error) {
        if (isMounted) {
          setAccountError(
            error.message || "Could not load account settings.",
          );
        }
      } finally {
        if (isMounted) {
          setLoadingAccount(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPasswords((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage({
      type: "",
      text: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({
        type: "error",
        text: "Your new passwords do not match.",
      });
      return;
    }

    if (passwords.newPassword.length < 8) {
      setMessage({
        type: "error",
        text: "Your new password must be at least 8 characters.",
      });
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      setMessage({
        type: "error",
        text: "Your new password must differ from your current password.",
      });
      return;
    }

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSavingPassword(true);
    setMessage({
      type: "",
      text: "",
    });

    try {
      const result = await authApi.updatePassword(
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword,
        },
        token,
      );

      setMessage({
        type: "success",
        text: result.message || "Password updated successfully.",
      });

      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Could not update your password.",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const accountStatus =
    account?.accountStatus === "active" ? "Active" : "Inactive";

  return (
    <section className="earner-settings">
      <div className="earner-settings__heading">
        <div>
          <span>Account preferences</span>
          <h1>Settings</h1>
          <p>Manage your account details and security preferences.</p>
        </div>
      </div>

      <div className="earner-settings__grid">
        <article className="settings-card settings-card--account">
          <div className="settings-card__heading">
            <div>
              <h2>Account</h2>
              <p>Your current TecoTask account information.</p>
            </div>

            <span className="settings-card__icon">◉</span>
          </div>

          {accountError && (
            <p className="settings-message settings-message--error" role="alert">
              {accountError}
            </p>
          )}

          <div className="settings-account">
            <div className="settings-account__avatar">
              {getInitials(account?.fullName)}
            </div>

            <div>
              <strong>
                {loadingAccount ? "Loading..." : account?.fullName || "—"}
              </strong>
              <span>{account?.email || ""}</span>
            </div>
          </div>

          <div className="settings-detail-row">
            <span>Account ID</span>
            <strong>{account?.id || "—"}</strong>
          </div>

          <div className="settings-detail-row">
            <span>Role</span>
            <strong className="settings-role">
              {displayRole(account?.role)}
            </strong>
          </div>

          <div className="settings-detail-row">
            <span>Account status</span>
            <strong className="settings-status">
              <span />
              {loadingAccount ? "Loading..." : accountStatus}
            </strong>
          </div>
        </article>

        <article className="settings-card">
          <div className="settings-card__heading">
            <div>
              <h2>Change password</h2>
              <p>Use a strong password that you do not use elsewhere.</p>
            </div>

            <span className="settings-card__icon">◆</span>
          </div>

          <form
            className="settings-password-form"
            onSubmit={handleSubmit}
          >
            <div className="settings-field">
              <label htmlFor="currentPassword">Current password</label>

              <div className="settings-password-input">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPassword((visible) => !visible)
                  }
                  aria-label={
                    showCurrentPassword
                      ? "Hide current password"
                      : "Show current password"
                  }
                >
                  {showCurrentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="newPassword">New password</label>

              <div className="settings-password-input">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword((visible) => !visible)
                  }
                  aria-label={
                    showNewPassword
                      ? "Hide new password"
                      : "Show new password"
                  }
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="settings-field">
              <label htmlFor="confirmPassword">Confirm new password</label>

              <div className="settings-password-input">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message.text && (
              <p
                className={`settings-message settings-message--${message.type}`}
                role={message.type === "error" ? "alert" : "status"}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              className="settings-save-button"
              disabled={savingPassword}
            >
              {savingPassword ? "Updating..." : "Update password"}
              <span>→</span>
            </button>
          </form>

          <div className="settings-forgot">
            <span>Forgot your current password?</span>
            <Link to="/forgot-password">Reset it here</Link>
          </div>
        </article>
      </div>
    </section>
  );
};

export default EarnersSettings;