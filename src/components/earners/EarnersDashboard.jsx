import { useNavigate, useOutletContext } from "react-router-dom";
import "../../styles/EarnersDashboard.css";

const formatNaira = (amount = 0) =>
  `₦${Number(amount).toLocaleString("en-NG")}`;

const taskColors = ["green", "blue", "purple", "orange"];

const EarnersDashboard = () => {
  const navigate = useNavigate();

  const {
    dashboard,
    isDashboardLoading: isLoading,
    dashboardError,
  } = useOutletContext();

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

  const openTask = (task) => {
    navigate(`/earners/tasks/${encodeURIComponent(task.id)}`, {
      state: { task },
    });
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
          <p>Choose a task to read the full instructions and get started.</p>
        </div>

        <span>
          {progress.completed || 0} of {progress.total || 0} done
        </span>
      </div>

      <div className="earner-dashboard__grid">
        <section>
          {tasks.length === 0 ? (
            <div className="earner-empty-state">
              <strong>No tasks are available right now.</strong>
              <p>New tasks will appear here when they become available.</p>
            </div>
          ) : (
            <div className="earner-task-cards">
              {tasks.map((task, index) => (
                <article className="earner-task-summary" key={task.id}>
                  <div className="earner-task-summary__meta">
                    <span
                      className={`earner-task-icon ${
                        taskColors[index % taskColors.length]
                      }`}
                    >
                      {index + 1}
                    </span>

                    <span className="earner-task-summary__type">
                      {task.type}
                    </span>

                    {task.estimatedMinutes ? (
                      <span>{task.estimatedMinutes} min</span>
                    ) : null}

                    <span>{task.slotsLeft} slots left</span>
                  </div>

                  <div className="earner-task-summary__main">
                    <div className="earner-task-summary__copy">
                      <h3>{task.title}</h3>
                      <p>
                        {task.description ||
                          "Open the task to read the advertiser’s instructions."}
                      </p>
                      <span className="earner-task-summary__brand">
                        {task.brand}
                      </span>
                    </div>

                    <div className="earner-task-summary__reward">
                      <strong>{formatNaira(task.rewardAmount)}</strong>
                      <span>per approved task</span>
                    </div>
                  </div>

                  <div className="earner-task-summary__actions">
                    <button
                      type="button"
                      className="earner-primary-button"
                      onClick={() => openTask(task)}
                    >
                      View task <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
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
                <p>Tasks you submit will appear here.</p>
              </div>
            ) : (
              <div className="earner-recent-submissions">
                {recentSubmissions.slice(0, 5).map((submission) => (
                  <div
                    className="earner-recent-submission"
                    key={submission.id}
                  >
                    <div>
                      <strong>{submission.task?.title || "Task submission"}</strong>
                      <span>Status: {submission.status}</span>
                    </div>

                    {submission.task?.id ? (
                      <button
                        type="button"
                        onClick={() => openTask(submission.task)}
                      >
                        View
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default EarnersDashboard;