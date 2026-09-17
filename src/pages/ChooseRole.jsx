import { useState } from "react";
import "../styles/ChooseRole.css";

const ChooseRole = () => {
  const [selectedRole, setSelectedRole] = useState("earner");

  const handleContinue = () => {
    if (selectedRole === "earner") {
      window.location.href = "/earner/dashboard";
    } else {
      window.location.href = "/advertiser/dashboard";
    }
  };

  return (
    <main className="role-page">
      <header className="role-header">
        <a href="/" className="role-brand">
          <span className="role-brand__logo">T</span>

          <span className="role-brand__name">
            Teco<span>Task</span>
          </span>
        </a>

        <span className="role-step">Step 2 of 2</span>
      </header>

      <section className="role-content">
        <div className="role-heading">
          <span>Account created, welcome</span>

          <h1>How will you be using TecoTask?</h1>

          <p>
            This helps us personalize your dashboard. 
            
          </p>
        </div>

        <div className="role-options">
          <button
            type="button"
            className={`role-card ${
              selectedRole === "earner" ? "selected" : ""
            }`}
            onClick={() => setSelectedRole("earner")}
          >
            <div className="role-card__top">
              <span className="role-card__icon role-card__icon--green">
                ₦
              </span>

              <span className="role-card__radio">
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
            onClick={() => setSelectedRole("advertiser")}
          >
            <div className="role-card__top">
              <span className="role-card__icon role-card__icon--dark">
                ↗
              </span>

              <span className="role-card__radio">
                {selectedRole === "advertiser" ? "✓" : ""}
              </span>
            </div>

            <h2>I want to advertise</h2>

            <p>Create campaigns and reach verified task earners.</p>

            <div className="role-card__divider" />

            <ul>
              <li>Set your own reward per action</li>
              <li>Add campaign links and instructions</li>
              <li>Track approved campaign progress</li>
            </ul>
          </button>
        </div>

        <div className="role-actions">
          <button
            type="button"
            className="role-back-button"
            onClick={() => window.history.back()}
          >
            Back
          </button>

          <button
            type="button"
            className="role-continue-button"
            onClick={handleContinue}
          >
            Continue as{" "}
            {selectedRole === "earner" ? "an earner" : "an advertiser"}
            <span>→</span>
          </button>
        </div>
      </section>
    </main>
  );
};

export default ChooseRole;