import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserSettings.css";

function displayRole(role = "") {
  return role
    ? role.charAt(0).toUpperCase() + role.slice(1)
    : "—";
}

const AdvertiserSettings = () => {
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [accountError, setAccountError] = useState("");

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
        const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });
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
          setAccountError(error.message || "Could not load account settings.");
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

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswords((previousPasswords) => ({
      ...previousPasswords,
      [name]: value,
    }));

    setMessage("");
    setMessageType("");
  };

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswords((previousVisibility) => ({
      ...previousVisibility,
      [fieldName]: !previousVisibility[fieldName],
    }));
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setMessage("Please complete all password fields.");
      setMessageType("error");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setMessage("Your new password must be at least 8 characters.");
      setMessageType("error");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("Your new passwords do not match.");
      setMessageType("error");
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      setMessage("Your new password must differ from your current password.");
      setMessageType("error");
      return;
    }

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSavingPassword(true);

    try {
      const result = await authApi.updatePassword(passwords, token);

      setMessage(result.message || "Password updated successfully.");
      setMessageType("success");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage(error.message || "Could not update your password.");
      setMessageType("error");
    } finally {
      setSavingPassword(false);
    }
  };

    const roleLabel = displayRole(account?.role);

  if (loadingAccount) {
    return (
      <section className="advertiser-settings advertiser-settings--loading">
        <div
          className="advertiser-settings-loader"
          role="status"
          aria-live="polite"
        >
          <span
            className="advertiser-settings-loader__roller"
            aria-hidden="true"
          >
            <span />
          </span>
          <span className="advertiser-settings-visually-hidden">
            Loading account settings
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="advertiser-settings">
      <div className="advertiser-settings__heading">
        <span>Account preferences</span>
        <h1>Settings</h1>
        <p>Manage your advertiser account and security preferences.</p>
      </div>

      {accountError && (
        <p className="role-error" role="alert">
          {accountError}
        </p>
      )}

      <div className="advertiser-settings__grid">
        <section className="advertiser-account-card">
          <div className="advertiser-settings-card__heading">
            <div>
              <h2>Account information</h2>
              <p>Your TecoTask advertiser workspace details.</p>
            </div>

            <span className="advertiser-settings-card__icon">◉</span>
          </div>

          <div className="advertiser-account-details">
            <div className="advertiser-account-detail">
              <span>Account owner</span>
              <strong>
                {loadingAccount ? "Loading..." : account?.fullName || "—"}
              </strong>
            </div>

            <div className="advertiser-account-detail">
              <span>Account role</span>
              <strong>{loadingAccount ? "Loading..." : roleLabel}</strong>
            </div>

            <div className="advertiser-account-detail">
              <span>Workspace</span>
              <strong>
                {loadingAccount
                  ? "Loading..."
                  : account?.role === "advertiser"
                    ? "Advertiser workspace"
                    : "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="advertiser-access-card">
          <div className="advertiser-settings-card__heading">
            <div>
              <h2>Role and access</h2>
              <p>What you can do in your advertiser workspace.</p>
            </div>

            <span className="advertiser-settings-card__icon">◇</span>
          </div>

          <div className="advertiser-access-role">
            <span className="advertiser-access-role__icon">
              {account?.role?.charAt(0).toUpperCase() || "A"}
            </span>

            <div>
              <strong>{loadingAccount ? "Loading..." : roleLabel}</strong>
              <small>Campaign manager</small>
            </div>
          </div>

          <ul className="advertiser-access-list">
            <li>Create and manage campaigns</li>
            <li>Fund your campaign wallet</li>
            <li>Review campaign performance</li>
            <li>Track verified task actions</li>
          </ul>
        </section>

        <section className="advertiser-password-card">
          <div className="advertiser-settings-card__heading">
            <div>
              <h2>Change password</h2>
              <p>Use a strong password that you do not use elsewhere.</p>
            </div>

            <span className="advertiser-settings-card__icon">♢</span>
          </div>

          <form
            className="advertiser-password-form"
            onSubmit={handlePasswordSubmit}
          >
            <div className="advertiser-password-field">
              <label htmlFor="currentPassword">Current password</label>

              <div className="advertiser-password-input">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.currentPassword ? "text" : "password"}
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  required
                  disabled={savingPassword}
                />

                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("currentPassword")}
                  aria-label="Show or hide current password"
                  disabled={savingPassword}
                >
                  {showPasswords.currentPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="advertiser-password-field">
              <label htmlFor="newPassword">New password</label>

              <div className="advertiser-password-input">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.newPassword ? "text" : "password"}
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={savingPassword}
                />

                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("newPassword")}
                  aria-label="Show or hide new password"
                  disabled={savingPassword}
                >
                  {showPasswords.newPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="advertiser-password-field">
              <label htmlFor="confirmPassword">Confirm new password</label>

              <div className="advertiser-password-input">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirmPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Repeat new password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={savingPassword}
                />

                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                  aria-label="Show or hide confirmed password"
                  disabled={savingPassword}
                >
                  {showPasswords.confirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <p
                className={`advertiser-password-message ${messageType}`}
                role={messageType === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="advertiser-password-button"
              disabled={savingPassword}
            >
              {savingPassword ? "Updating..." : "Update password"}
              <span>→</span>
            </button>
          </form>
        </section>
      </div>

      <section className="advertiser-security-notice">
        <span className="advertiser-security-notice__icon">♡</span>

        <div>
          <h2>Keep your account secure</h2>
          <p>
            Never share your password with anyone. TecoTask support will never
            ask you to send your password through chat or email.
          </p>
        </div>
      </section>
    </section>
  );
};

export default AdvertiserSettings;