import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/EarnersDashboard.css";

const formatNaira = (amount = 0) =>
  `₦${Number(amount).toLocaleString("en-NG")}`;

const taskColors = ["green", "blue", "purple", "orange"];

const EarnersDashboard = () => {
  const navigate = useNavigate();

  const {
    dashboard,
    setDashboard,
    isDashboardLoading: isLoading,
    dashboardError,
  } = useOutletContext();

  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskStarted, setTaskStarted] = useState(false);
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [showProofForm, setShowProofForm] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [isTaskActionLoading, setIsTaskActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  

if (isLoading) {
  return (
    <div className="earner-loading" role="status" aria-live="polite">
      <span className="earner-loading__roller" aria-hidden="true">
        <span />
      </span>
      <span className="earner-loading__sr-only">
        Loading your dashboard
      </span>
    </div>
  );
}

  if (dashboardError) {
    return (
      <div className="earner-dashboard">
        <div className="role-error" role="alert">
          {dashboardError}
        </div>
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const progress = dashboard?.progress || {};
  const tasks = dashboard?.taskQueue || [];
  const recentSubmissions = dashboard?.recentSubmissions || [];

  const activeTask =
    tasks.find((task) => task.id === activeTaskId) || tasks[0] || null;

 const handleTaskSelect = (task) => {
  if (activeSubmissionId) return;

  setActiveTaskId(task.id);
  setTaskStarted(false);
  setActionError("");
  setActionMessage("");
};

  const handleStartTask = async () => {
  if (!activeTask || isTaskActionLoading) return;

  const token = sessionStorage.getItem("tecotaskToken");

  if (!token) {
    navigate("/login", { replace: true });
    return;
  }

  setIsTaskActionLoading(true);
  setActionError("");
  setActionMessage("");

  try {
    const result = await authApi.startEarnerTask(
      activeTask.id,
      token,
    );

    setActiveSubmissionId(result.submission.id);
    setTaskStarted(true);
    setActionMessage(result.message || "Task started.");
  } catch (error) {
    setActionError(error.message || "Could not start this task.");
  } finally {
    setIsTaskActionLoading(false);
  }
};

const handleSubmitProof = async (event) => {
  event.preventDefault();

  if (!activeSubmissionId || isTaskActionLoading) return;

  const token = sessionStorage.getItem("tecotaskToken");

  if (!token) {
    navigate("/login", { replace: true });
    return;
  }

  setIsTaskActionLoading(true);
  setActionError("");
  setActionMessage("");

  try {
    const result = await authApi.submitEarnerProof(
      activeSubmissionId,
      { proofUrl, proofNote },
      token,
    );

    setActionMessage(result.message || "Proof submitted.");
    setActiveSubmissionId(null);
    setTaskStarted(false);
    setShowProofForm(false);
    setProofUrl("");
    setProofNote("");

        try {
      const updatedDashboard =
        await authApi.getEarnerDashboard(token);

      setDashboard((current) => ({
        ...updatedDashboard,
        stats: {
          ...updatedDashboard.stats,
          walletBalance:
            current?.stats?.walletBalance ??
            updatedDashboard.stats?.walletBalance ??
            0,
        },
      }));

      setActiveTaskId(updatedDashboard.taskQueue?.[0]?.id || null);
    } catch {
      setActionError(
        "Proof was submitted, but the dashboard could not refresh. Reload the page to see the update.",
      );
    }
  } catch (error) {
    setActionError(error.message || "Could not submit proof.");
  } finally {
    setIsTaskActionLoading(false);
  }
};

  return (
    <div className="earner-dashboard">
      <section className="earner-stat-grid">
        <article className="earner-stat-card earner-stat-card--green">
          <span>Wallet balance</span>
          <strong>{formatNaira(stats.walletBalance)}</strong>
          <small>Withdraw from ₦2,000</small>
        </article>

        <article className="earner-stat-card">
          <span>Earned this session</span>
          <strong>{formatNaira(stats.earnedThisSession)}</strong>
          <small>{stats.submissionsSent || 0} submissions sent</small>
        </article>

        <article className="earner-stat-card">
          <span>Pending review</span>
          <strong>{stats.pendingReview || 0}</strong>
          <small>Approved within 30 minutes</small>
        </article>

        <article className="earner-stat-card">
          <span>Referral earnings</span>
          <strong>{formatNaira(stats.referralEarnings)}</strong>
          <small>{stats.activatedReferrals || 0} friends activated</small>
        </article>
      </section>

      <div className="earner-dashboard__heading">
        <div>
          <h2>Your task queue</h2>
          <p>Finish the task at the top, then move straight to the next one.</p>
        </div>

        <span>
          {progress.completed || 0} of {progress.total || 0} done
        </span>
      </div>

      {activeTask ? (
        <div className="earner-dashboard__grid">
          <section>
            <article className="earner-featured-task">
              <div className="earner-featured-task__meta">
                <span className="earner-task-badge">↗ Up next</span>
                <span>{activeTask.type}</span>
                <span>· {activeTask.estimatedMinutes} min</span>
                <span>· {activeTask.slotsLeft} slots left</span>
              </div>

              <div className="earner-featured-task__content">
                <div>
                  <h3>{activeTask.title}</h3>

                  <p>
                    {activeTask.brand} is looking for genuine community
                    engagement on a new campaign launch.
                  </p>

                  <p>
                    {activeTask.description ||
                      "Complete the instructions and upload your proof when finished."}
                  </p>
                </div>

                <div className="earner-featured-task__reward">
                  <strong>{formatNaira(activeTask.rewardAmount)}</strong>
                  <span>per approved proof</span>
                </div>
              </div>

              <div className="earner-featured-task__actions">
                <button
  type="button"
  className="earner-primary-button"
  onClick={handleStartTask}
  disabled={taskStarted || isTaskActionLoading}
>
  {isTaskActionLoading
    ? "Starting..."
    : taskStarted
      ? "Task started"
      : "Start this task"}
  <span>→</span>
</button>

<button
  type="button"
  className="earner-secondary-button"
  onClick={() => setShowProofForm(true)}
  disabled={!activeSubmissionId || isTaskActionLoading}
>
  Upload proof
</button>
{actionError && (
  <p className="role-error" role="alert">
    {actionError}
  </p>
)}

{actionMessage && (
  <p role="status">
    {actionMessage}
  </p>
)}

{showProofForm && activeSubmissionId && (
  <form onSubmit={handleSubmitProof}>
    <label>
      Proof link
      <input
        type="url"
        value={proofUrl}
        onChange={(event) => setProofUrl(event.target.value)}
        placeholder="https://..."
        required
      />
    </label>

    <label>
      Note (optional)
      <textarea
        value={proofNote}
        onChange={(event) => setProofNote(event.target.value)}
        maxLength={2000}
      />
    </label>

    <button type="submit" disabled={isTaskActionLoading}>
      {isTaskActionLoading ? "Submitting..." : "Submit proof"}
    </button>
  </form>
)}
              </div>
            </article>

            <div className="earner-task-list">
              {tasks
                .filter((task) => task.id !== activeTask.id)
                .map((task, index) => (
                  <button
                    type="button"
                    key={task.id}
                    className="earner-task-row"
                    onClick={() => handleTaskSelect(task)}
                  >
                    <span
                      className={`earner-task-icon ${
                        taskColors[index % taskColors.length]
                      }`}
                    >
                      {index + 2}
                    </span>

                    <span className="earner-task-row__details">
                      <strong>{task.title}</strong>
                      <small>
                        {task.brand} · {task.type} · {task.estimatedMinutes} min
                      </small>
                    </span>

                    <span className="earner-task-row__reward">
                      {formatNaira(task.rewardAmount)}
                    </span>

                    <span className="earner-task-row__arrow">→</span>
                  </button>
                ))}
            </div>
          </section>

          <aside className="earner-dashboard__side">
            <section className="earner-panel">
              <h3>Session progress</h3>
              <p>Clear all tasks to unlock the bonus board.</p>

              <strong className="earner-progress-number">
                {progress.percent || 0}%
              </strong>

              <div className="earner-progress-bar">
                <span
                  style={{
                    width: `${progress.percent || 0}%`,
                  }}
                />
              </div>

              <small>
                Potential from remaining tasks:{" "}
                <strong>{formatNaira(progress.potentialReward)}</strong>
              </small>
            </section>

            <section className="earner-panel earner-submissions">
              <h3>Recent submissions</h3>

              {recentSubmissions.length === 0 ? (
                <div className="earner-empty-state">
                  <span>▣</span>
                  <strong>No submissions yet</strong>
                  <p>
                    Finish the task above and upload your proof to see it here.
                  </p>
                </div>
              ) : (
                <div>
                  {recentSubmissions.map((submission) => (
                    <div key={submission.id}>
                      <strong>{submission.task?.title}</strong>
                      <p>Status: {submission.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </aside>
        </div>
      ) : (
        <div className="earner-empty-state">
          <strong>No tasks are available right now.</strong>
          <p>New tasks will appear here when they become available.</p>
        </div>
      )}
    </div>
  );
};

export default EarnersDashboard;
