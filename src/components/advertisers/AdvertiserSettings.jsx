import { useState } from "react";
import "../../styles/AdvertiserSettings.css";

const AdvertiserSettings = () => {
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

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

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

    setMessage("Your password has been updated successfully.");
    setMessageType("success");

    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <section className="advertiser-settings">
      <div className="advertiser-settings__heading">
        <span>Account preferences</span>
        <h1>Settings</h1>
        <p>Manage your advertiser account and security preferences.</p>
      </div>

      <div className="advertiser-settings__grid">
        <section className="advertiser-account-card">
          <div className="advertiser-settings-card__heading">
            <div>
              <h2>Account information</h2>
              <p>Your TecoTask advertiser workspace details.</p>
            </div>

            <span className="advertiser-settings-card__icon">
              ◉
            </span>
          </div>

          <div className="advertiser-account-details">
            <div className="advertiser-account-detail">
              <span>Account owner</span>
              <strong>Olawale Ojo</strong>
            </div>

            <div className="advertiser-account-detail">
              <span>Account role</span>
              <strong>Advertiser</strong>
            </div>

            <div className="advertiser-account-detail">
              <span>Workspace</span>
              <strong>Advertiser workspace</strong>
            </div>

            <div className="advertiser-account-detail">
              <span>Account status</span>
              <strong className="is-active">Active</strong>
            </div>
          </div>
        </section>

        <section className="advertiser-access-card">
          <div className="advertiser-settings-card__heading">
            <div>
              <h2>Role and access</h2>
              <p>What you can do in your advertiser workspace.</p>
            </div>

            <span className="advertiser-settings-card__icon">
              ◇
            </span>
          </div>

          <div className="advertiser-access-role">
            <span className="advertiser-access-role__icon">A</span>

            <div>
              <strong>Advertiser</strong>
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
              <p>
                Use a strong password that you do not use elsewhere.
              </p>
            </div>

            <span className="advertiser-settings-card__icon">
              ♢
            </span>
          </div>

          <form
            className="advertiser-password-form"
            onSubmit={handlePasswordSubmit}
          >
            <div className="advertiser-password-field">
              <label htmlFor="currentPassword">
                Current password
              </label>

              <div className="advertiser-password-input">
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={
                    showPasswords.currentPassword
                      ? "text"
                      : "password"
                  }
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                />

                <button
                  type="button"
                  onClick={() =>
                    togglePasswordVisibility("currentPassword")
                  }
                  aria-label="Show or hide current password"
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
                  type={
                    showPasswords.newPassword ? "text" : "password"
                  }
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="At least 8 characters"
                />

                <button
                  type="button"
                  onClick={() =>
                    togglePasswordVisibility("newPassword")
                  }
                  aria-label="Show or hide new password"
                >
                  {showPasswords.newPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="advertiser-password-field">
              <label htmlFor="confirmPassword">
                Confirm new password
              </label>

              <div className="advertiser-password-input">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showPasswords.confirmPassword
                      ? "text"
                      : "password"
                  }
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Repeat new password"
                />

                <button
                  type="button"
                  onClick={() =>
                    togglePasswordVisibility("confirmPassword")
                  }
                  aria-label="Show or hide confirmed password"
                >
                  {showPasswords.confirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {message && (
              <p
                className={`advertiser-password-message ${messageType}`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="advertiser-password-button"
            >
              Update password
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