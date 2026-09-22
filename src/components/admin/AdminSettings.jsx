import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import "../../styles/AdminSettings.css";

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  autoComplete,
}) {
  return (
    <label className="admin-settings-field">
      <span>{label}</span>

      <div className="admin-password-input">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

export default function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const passwordRequirements = useMemo(
    () => [
      {
        label: "At least 8 characters",
        valid: newPassword.length >= 8,
      },
      {
        label: "At least one uppercase letter",
        valid: /[A-Z]/.test(newPassword),
      },
      {
        label: "At least one number",
        valid: /\d/.test(newPassword),
      },
    ],
    [newPassword]
  );

  const passwordStrength = useMemo(() => {
    const completed = passwordRequirements.filter(
      (requirement) => requirement.valid
    ).length;

    if (!newPassword) {
      return {
        label: "Enter a new password",
        width: "0%",
        tone: "empty",
      };
    }

    if (completed === 1) {
      return {
        label: "Weak password",
        width: "33%",
        tone: "weak",
      };
    }

    if (completed === 2) {
      return {
        label: "Fair password",
        width: "66%",
        tone: "fair",
      };
    }

    return {
      label: "Strong password",
      width: "100%",
      tone: "strong",
    };
  }, [newPassword, passwordRequirements]);

  const handlePasswordChange = (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword) {
      setErrorMessage("Enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("Your new password must contain at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setErrorMessage(
        "Your new password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/\d/.test(newPassword)) {
      setErrorMessage(
        "Your new password must contain at least one number."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("The new passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        "Your new password must be different from your current password."
      );
      return;
    }

    setSuccessMessage("Your password has been updated successfully.");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <main className="admin-settings-page">
      <div className="admin-settings-container">
        <header className="admin-settings-header">
          <div>
            <span className="admin-settings-eyebrow">
              Admin workspace
            </span>

            <h1>Settings</h1>

            <p>
              Manage your admin account and update your password.
            </p>
          </div>
        </header>

        <div className="admin-settings-layout">
          <section className="admin-settings-card admin-account-card">
            <div className="admin-settings-card-heading">
              <div className="admin-settings-heading-icon">
                <UserRound size={17} />
              </div>

              <div>
                <h2>Admin account</h2>
                <p>Your current administrator account information.</p>
              </div>
            </div>

            <div className="admin-account-profile">
              <span className="admin-account-avatar">SB</span>

              <div>
                <strong>Segun Bakare</strong>
                <span>Administrator account</span>
              </div>
            </div>

            <div className="admin-account-details">
              <div className="admin-account-detail">
                <span className="admin-account-detail-label">
                  <Mail size={14} />
                  Email address
                </span>

                <strong>admin@tecotask.com</strong>
              </div>

              <div className="admin-account-detail">
                <span className="admin-account-detail-label">
                  <ShieldCheck size={14} />
                  Account role
                </span>

                <span className="admin-role-badge">
                  <ShieldCheck size={12} />
                  Admin
                </span>
              </div>
            </div>

            <div className="admin-account-note">
              <ShieldCheck size={15} />

              <p>
                Your admin role controls access to users, campaigns,
                transactions, withdrawals, moderation, and settings.
              </p>
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
              <div className="admin-settings-message admin-settings-message--error">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="admin-settings-message admin-settings-message--success">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            <form
              className="admin-password-form"
              onSubmit={handlePasswordChange}
              onChange={clearMessages}
            >
              <PasswordField
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                placeholder="Enter your current password"
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword((current) => !current)
                }
                autoComplete="current-password"
              />

              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="Enter your new password"
                visible={showNewPassword}
                onToggle={() => setShowNewPassword((current) => !current)}
                autoComplete="new-password"
              />

              {newPassword && (
                <div className="admin-password-strength">
                  <div className="admin-password-strength-top">
                    <span>Password strength</span>
                    <strong
                      className={`admin-password-strength-label admin-password-strength-label--${passwordStrength.tone}`}
                    >
                      {passwordStrength.label}
                    </strong>
                  </div>

                  <div className="admin-password-strength-track">
                    <span
                      className={`admin-password-strength-fill admin-password-strength-fill--${passwordStrength.tone}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                </div>
              )}

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repeat your new password"
                visible={showConfirmPassword}
                onToggle={() =>
                  setShowConfirmPassword((current) => !current)
                }
                autoComplete="new-password"
              />

              <div className="admin-password-requirements">
                <span>Password requirements</span>

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
                >
                  <Save size={15} />
                  Update password
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}