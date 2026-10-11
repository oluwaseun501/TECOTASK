import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
} from "lucide-react";

import { authApi } from "../../services/auth.js";
import "../../styles/AdminSettings.css";

function displayRole(role = "") {
  if (!role) return "—";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  autoComplete,
  disabled,
}) {
  return (
    <label className="admin-settings-field" htmlFor={id}>
      <span>{label}</span>

      <div className="admin-password-input">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          disabled={disabled}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          disabled={disabled}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

export default function AdminSettings() {
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [accountError, setAccountError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const passwordRequirements = useMemo(
    () => [
      {
        label: "At least 8 characters",
        valid: newPassword.length >= 8,
      },
    ],
    [newPassword],
  );

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

    void loadSettings();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  function clearMessages() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage("Please complete all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Your new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "Your new password must differ from your current password.",
      );
      return;
    }

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSavingPassword(true);

    try {
      const result = await authApi.updatePassword(
        {
          currentPassword,
          newPassword,
          confirmPassword,
        },
        token,
      );

      setSuccessMessage(
        result.message || "Password updated successfully.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErrorMessage(error.message || "Could not update your password.");
    } finally {
      setSavingPassword(false);
    }
  }

  const roleLabel = displayRole(account?.role);

  return (
    <main className="admin-settings-page">
      <div className="admin-settings-container">
        <header className="admin-settings-header">
          <div>
            <span className="admin-settings-eyebrow">Admin workspace</span>
            <h1>Settings</h1>
            <p>View your admin account details and update your password.</p>
          </div>
        </header>

        <div className="admin-settings-layout">
          <section className="admin-settings-card admin-account-card">
            <div className="admin-settings-card-heading">
              <div className="admin-settings-heading-icon">
                <ShieldCheck size={17} />
              </div>

              <div>
                <h2>Admin account</h2>
                <p>Your signed-in account details.</p>
              </div>
            </div>

            {accountError && (
              <div
                className="admin-settings-message admin-settings-message--error"
                role="alert"
              >
                <AlertCircle size={16} />
                <span>{accountError}</span>
              </div>
            )}

            <div className="admin-account-details">
              {loadingAccount ? (
                <div className="admin-settings-account-loading" role="status">
                  <span className="admin-settings-spinner" aria-hidden="true">
                    <span />
                  </span>
                  <span>Loading account details…</span>
                </div>
              ) : (
                <>
                  <div className="admin-account-detail">
                    <span className="admin-account-detail-label">
                      <Mail size={14} />
                      Email address
                    </span>
                    <strong>{account?.email || "—"}</strong>
                  </div>

                  <div className="admin-account-detail">
                    <span className="admin-account-detail-label">
                      <ShieldCheck size={14} />
                      Account role
                    </span>

                    <span className="admin-role-badge">
                      <ShieldCheck size={12} />
                      {roleLabel}
                    </span>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="admin-settings-card admin-password-card">
            <div className="admin-settings-card-heading">
              <div className="admin-settings-heading-icon">
                <KeyRound size={17} />
              </div>

              <div>
                <h2>Change password</h2>
                <p>Use a strong password to protect your admin account.</p>
              </div>
            </div>

            {errorMessage && (
              <div
                className="admin-settings-message admin-settings-message--error"
                role="alert"
              >
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div
                className="admin-settings-message admin-settings-message--success"
                role="status"
              >
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            <form
              className="admin-password-form"
              onSubmit={handlePasswordSubmit}
            >
              <PasswordField
                id="currentPassword"
                label="Current password"
                value={currentPassword}
                onChange={(value) => {
                  setCurrentPassword(value);
                  clearMessages();
                }}
                placeholder="Enter your current password"
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword((visible) => !visible)
                }
                autoComplete="current-password"
                disabled={savingPassword}
              />

              <PasswordField
                id="newPassword"
                label="New password"
                value={newPassword}
                onChange={(value) => {
                  setNewPassword(value);
                  clearMessages();
                }}
                placeholder="Enter your new password"
                visible={showNewPassword}
                onToggle={() =>
                  setShowNewPassword((visible) => !visible)
                }
                autoComplete="new-password"
                disabled={savingPassword}
              />

              <PasswordField
                id="confirmPassword"
                label="Confirm new password"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  clearMessages();
                }}
                placeholder="Repeat your new password"
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((visible) => !visible)
                }
                autoComplete="new-password"
                disabled={savingPassword}
              />

              <div className="admin-password-requirements">
                <span>Password requirement</span>
                <ul>
                  {passwordRequirements.map((requirement) => (
                    <li
                      className={
                        requirement.valid
                          ? "admin-password-requirement--valid"
                          : ""
                      }
                      key={requirement.label}
                    >
                      <CheckCircle2 size={13} />
                      {requirement.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="admin-password-form-footer">
                <p>
                  You will need to use your new password the next time you
                  sign in.
                </p>

                <button
                  type="submit"
                  className="admin-save-password-button"
                  disabled={savingPassword}
                >
                  <Save size={15} />
                  {savingPassword ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}