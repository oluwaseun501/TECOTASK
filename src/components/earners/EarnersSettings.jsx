import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/EarnersSettings.css";

const EarnersSettings = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPasswords((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage("Your new passwords do not match.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setMessage("Your new password must be at least 8 characters.");
      return;
    }

    // Temporary front-end success state.
    // Connect this to your backend later.
    setMessage("Your password has been updated successfully.");

    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

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

          <div className="settings-account">
            <div className="settings-account__avatar">CO</div>

            <div>
              <strong>Chinedu Okafor</strong>
              <span>chinedu@example.com</span>
            </div>
          </div>

          <div className="settings-detail-row">
            <span>Account ID</span>
            <strong>TT-48219</strong>
          </div>

          <div className="settings-detail-row">
            <span>Role</span>
            <strong className="settings-role">Earner</strong>
          </div>

          <div className="settings-detail-row">
            <span>Account status</span>
            <strong className="settings-status">
              <span />
              Active
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

          <form className="settings-password-form" onSubmit={handleSubmit}>
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
                    setShowCurrentPassword(!showCurrentPassword)
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
                  onClick={() => setShowNewPassword(!showNewPassword)}
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
                    setShowConfirmPassword(!showConfirmPassword)
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

            {message && (
              <p
                className={`settings-message ${
                  message.includes("successfully")
                    ? "settings-message--success"
                    : "settings-message--error"
                }`}
              >
                {message}
              </p>
            )}

            <button type="submit" className="settings-save-button">
              Update password
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