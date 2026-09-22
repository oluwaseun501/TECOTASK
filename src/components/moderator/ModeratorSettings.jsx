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
import { Link } from "react-router-dom";

import "../../styles/ModeratorSettings.css";

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
    <label className="moderator-settings-field">
      <span>{label}</span>

      <div className="moderator-password-input">
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

export default function ModeratorSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

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

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!currentPassword) {
      setErrorMessage("Enter your current password.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(
        "Your new password must contain at least 8 characters."
      );
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

  return (
    <main className="moderator-settings-page">
      <div className="moderator-settings-container">
        <header className="moderator-settings-header">
          <div>
            <span className="moderator-settings-eyebrow">
              Moderator workspace
            </span>

            <h1>Settings</h1>

            <p>
              Manage your moderator account and update your password.
            </p>
          </div>
        </header>

        <div className="moderator-settings-layout">
          <section className="moderator-settings-card moderator-account-card">
            <div className="moderator-settings-card-heading">
              <div className="moderator-settings-heading-icon">
                <UserRound size={17} />
              </div>

              <div>
                <h2>Moderator account</h2>
                <p>Your current TecoTask account information.</p>
              </div>
            </div>

            <div className="moderator-account-profile">
              <span className="moderator-account-avatar">MO</span>

              <div>
                <strong>Moderator account</strong>
                <span>moderator@tecotask.com</span>
              </div>
            </div>

            <div className="moderator-account-details">
              <div className="moderator-account-detail">
                <span className="moderator-account-detail-label">
                  <Mail size={14} />
                  Email address
                </span>

                <strong>moderator@tecotask.com</strong>
              </div>

              <div className="moderator-account-detail">
                <span className="moderator-account-detail-label">
                  <ShieldCheck size={14} />
                  Account role
                </span>

                <span className="moderator-role-badge">
                  <ShieldCheck size={12} />
                  Moderator
                </span>
              </div>
            </div>

            <div className="moderator-account-note">
              <ShieldCheck size={15} />

              <p>
                Your moderator role allows you to review task submissions,
                approve valid proofs, reject invalid submissions, and
                manage your withdrawals.
              </p>
            </div>
          </section>

          <section className="moderator-settings-card moderator-password-card">
            <div className="moderator-settings-card-heading">
              <div className="moderator-settings-heading-icon">
                <KeyRound size={17} />
              </div>

              <div>
                <h2>Change password</h2>
                <p>
                  Use a strong password to protect your moderator account.
                </p>
              </div>
            </div>

            {errorMessage ? (
              <div className="moderator-settings-message moderator-settings-message--error">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            ) : null}

            {successMessage ? (
              <div className="moderator-settings-message moderator-settings-message--success">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            ) : null}

            <form
              className="moderator-password-form"
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
                onToggle={() =>
                  setShowNewPassword((current) => !current)
                }
                autoComplete="new-password"
              />

              {newPassword ? (
                <div className="moderator-password-strength">
                  <div className="moderator-password-strength-top">
                    <span>Password strength</span>

                    <strong
                      className={`moderator-password-strength-label moderator-password-strength-label--${passwordStrength.tone}`}
                    >
                      {passwordStrength.label}
                    </strong>
                  </div>

                  <div className="moderator-password-strength-track">
                    <span
                      className={`moderator-password-strength-fill moderator-password-strength-fill--${passwordStrength.tone}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>
                </div>
              ) : null}

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

              <div className="moderator-password-requirements">
                <span>Password requirements</span>

                <ul>
                  {passwordRequirements.map((requirement) => (
                    <li
                      className={
                        requirement.valid
                          ? "moderator-password-requirement--valid"
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

              <div className="moderator-password-form-footer">
                <div>
                  <p>
                    You will need to use your new password the next time
                    you sign in.
                  </p>

                  <Link to="/forgot-password">
                    Forgot your current password?
                  </Link>
                </div>

                <button
                  type="submit"
                  className="moderator-save-password-button"
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