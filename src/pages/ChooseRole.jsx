import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/ChooseRole.css";
import { authApi } from "../services/auth.js";

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const ChooseRole = () => {
  const [selectedRole, setSelectedRole] = useState("earner");
  const [roleError, setRoleError] = useState("");
  const [isSavingRole, setIsSavingRole] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [roleNotice, setRoleNotice] = useState("");

  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (isSavingRole || isExiting) return;

    setRoleError("");
    setSelectedRole(role);
  };

  const handleContinue = async () => {
  const token = sessionStorage.getItem("tecotaskToken");

  if (!token) {
    setIsExiting(true);
    await wait(300);
    navigate("/login", { replace: true });
    return;
  }

  setRoleError("");
  setRoleNotice("");
  setIsSavingRole(true);

  const roleName = selectedRole === "earner" ? "Earner" : "Advertiser";
  const destination =
    selectedRole === "earner" ? "/earners" : "/advertisers";

  try {
    await authApi.chooseRole(selectedRole, token);

    // Show this immediately after the role is successfully saved.
    setRoleNotice(
      `Welcome as an ${selectedRole === "earner" ? "earner" : "advertiser"}!`
    );

    // Keep the notification visible while preparing the dashboard.
    await wait(1400);

    setIsExiting(true);

    // Allow the page exit animation to finish.
    await wait(420);

    navigate(destination, {
      replace: true,
      state: {
        notice: `Welcome, ${roleName}! Your dashboard is ready.`,
      },
    });
  } catch (error) {
    setRoleError(
      error?.message || "We could not save your role. Please try again."
    );
    setIsSavingRole(false);
  }
};

  const handleBack = async () => {
    if (isSavingRole || isExiting) return;

    setIsExiting(true);
    await wait(320);
    navigate(-1);
  };

  return (
    <main className={`role-page ${isExiting ? "role-page--exiting" : ""}`}>
      {roleNotice && (
  <div className="role-success-toast" role="status" aria-live="polite">
    <span className="role-success-toast__icon">✓</span>

    <div>
      <strong>{roleNotice}</strong>
      <p>Loading your dashboard...</p>
    </div>
  </div>
)}
      <header className="role-header">
        <Link to="/" className="role-brand">
          <span className="role-brand__logo">T</span>

          <span className="role-brand__name">
            Teco<span>Task</span>
          </span>
        </Link>

        <span className="role-step">Step 2 of 2</span>
      </header>

      <section className="role-content">
        <div className="role-heading">
          <span>Account created, welcome</span>

          <h1>How will you be using TecoTask?</h1>

          <p>
            Choose the option that best describes you. You can use TecoTask to
            complete tasks or create campaigns.
          </p>
        </div>

        <div className="role-options">
          <button
            type="button"
            className={`role-card ${
              selectedRole === "earner" ? "selected" : ""
            }`}
            aria-pressed={selectedRole === "earner"}
            disabled={isSavingRole || isExiting}
            onClick={() => handleRoleSelect("earner")}
          >
            <div className="role-card__top">
              <span className="role-card__icon role-card__icon--green">
                ₦
              </span>

              <span className="role-card__radio" aria-hidden="true">
                {selectedRole === "earner" ? "✓" : ""}
              </span>
            </div>

            <h2>I want to earn</h2>

            <p>Complete tasks, upload proof, and receive rewards.</p>

            <div className="role-card__divider" />

            <ul>
              <li>Complete simple online tasks</li>
              <li>Submit screenshots or required links</li>
              <li>Track approved rewards in your wallet</li>
            </ul>
          </button>

          <button
            type="button"
            className={`role-card ${
              selectedRole === "advertiser" ? "selected" : ""
            }`}
            aria-pressed={selectedRole === "advertiser"}
            disabled={isSavingRole || isExiting}
            onClick={() => handleRoleSelect("advertiser")}
          >
            <div className="role-card__top">
              <span className="role-card__icon role-card__icon--dark">
                ↗
              </span>

              <span className="role-card__radio" aria-hidden="true">
                {selectedRole === "advertiser" ? "✓" : ""}
              </span>
            </div>

            <h2>I want to advertise</h2>

            <p>Create campaigns and reach real people.</p>

            <div className="role-card__divider" />

            <ul>
              <li>Set your own reward per action</li>
              <li>Add campaign links and instructions</li>
              <li>Track approved campaign progress</li>
            </ul>
          </button>
        </div>

        {roleError && (
          <div className="role-error" role="alert">
            <span className="role-error__icon">!</span>
            <span>{roleError}</span>
          </div>
        )}

        <div className="role-actions">
          <button
            type="button"
            className="role-back-button"
            disabled={isSavingRole || isExiting}
            onClick={handleBack}
          >
            <span>←</span>
            Back
          </button>

          <button
            type="button"
            className="role-continue-button"
            aria-busy={isSavingRole}
            disabled={isSavingRole || isExiting}
            onClick={handleContinue}
          >
        {isSavingRole ? (
  <>
    <span className="role-button-spinner" aria-hidden="true" />
    <span>
      {roleNotice
        ? "Opening your dashboard..."
        : "Saving your choice..."}
    </span>
  </>
) : (
  <>
    <span>
      Continue as{" "}
      {selectedRole === "earner" ? "an earner" : "an advertiser"}
    </span>

    <span className="role-continue-button__arrow">→</span>
  </>
)}
          </button>
        </div>
      </section>
    </main>
  );
};

export default ChooseRole;