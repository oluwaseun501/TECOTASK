import { useState } from "react";
import "../../styles/EarnersDashboard.css";

const tasks = [
  {
    id: 1,
    icon: "◎",
    iconColor: "green",
    title: "Follow @PaySwiftNG on Instagram",
    brand: "PaySwift",
    type: "Social Media",
    time: "1 min",
    slots: "184 slots left",
    reward: "₦10",
    description:
      "Follow the page and keep the follow for at least 14 days.",
  },
  {
    id: 2,
    icon: "↗",
    iconColor: "blue",
    title: "Retweet and comment on a launch post",
    brand: "Naija Deals",
    type: "Social Media",
    time: "2 min",
    slots: "97 slots left",
    reward: "₦15",
  },
  {
    id: 3,
    icon: "▣",
    iconColor: "purple",
    title: "Install the Bloom Savings app and open it",
    brand: "Bloom Savings",
    type: "App Install",
    time: "4 min",
    slots: "62 slots left",
    reward: "₦20",
  },
  {
    id: 4,
    icon: "✦",
    iconColor: "orange",
    title: "Answer a six-question data plan survey",
    brand: "Telco Insights",
    type: "Survey",
    time: "5 min",
    slots: "143 slots left",
    reward: "₦25",
  },
];

const EarnersDashboard = () => {
  const [activeTask, setActiveTask] = useState(tasks[0]);
  const [taskStarted, setTaskStarted] = useState(false);

  const handleTaskSelect = (task) => {
    setActiveTask(task);
    setTaskStarted(false);
  };

  return (
    <div className="earner-dashboard">
      <section className="earner-stat-grid">
        <article className="earner-stat-card earner-stat-card--green">
          <span>Wallet balance</span>
          <strong>₦4,235</strong>
          <small>Withdraw from ₦2,000</small>
        </article>

        <article className="earner-stat-card">
          <span>Earned this session</span>
          <strong>₦0</strong>
          <small>0 submissions sent</small>
        </article>

        <article className="earner-stat-card">
          <span>Pending review</span>
          <strong>0</strong>
          <small>Approved within 30 minutes</small>
        </article>

        <article className="earner-stat-card">
          <span>Referral earnings</span>
          <strong>₦800</strong>
          <small>4 friends activated</small>
        </article>
      </section>

      <div className="earner-dashboard__heading">
        <div>
          <h2>Your task queue</h2>
          <p>Finish the task at the top, then move straight to the next one.</p>
        </div>

        <span>0 of 5 done</span>
      </div>

      <div className="earner-dashboard__grid">
        <section>
          <article className="earner-featured-task">
            <div className="earner-featured-task__meta">
              <span className="earner-task-badge">↗ Up next</span>
              <span>{activeTask.type}</span>
              <span>· {activeTask.time}</span>
              <span>· {activeTask.slots}</span>
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
                <strong>{activeTask.reward}</strong>
                <span>per approved proof</span>
              </div>
            </div>

            <div className="earner-featured-task__actions">
              <button
                type="button"
                className="earner-primary-button"
                onClick={() => setTaskStarted(true)}
              >
                {taskStarted ? "Task started" : "Start this task"}
                <span>→</span>
              </button>

              <button type="button" className="earner-secondary-button">
                Upload proof
              </button>
            </div>
          </article>

          <div className="earner-task-list">
            {tasks.slice(1).map((task, index) => (
              <button
                type="button"
                key={task.id}
                className="earner-task-row"
                onClick={() => handleTaskSelect(task)}
              >
                <span className={`earner-task-icon ${task.iconColor}`}>
                  {index + 2}
                </span>

                <span className="earner-task-row__details">
                  <strong>{task.title}</strong>
                  <small>
                    {task.brand} · {task.type} · {task.time}
                  </small>
                </span>

                <span className="earner-task-row__reward">
                  {task.reward}
                </span>

                <span className="earner-task-row__arrow">→</span>
              </button>
            ))}
          </div>
        </section>

        <aside className="earner-dashboard__side">
          <section className="earner-panel">
            <h3>Session progress</h3>
            <p>Clear all 5 tasks to unlock the bonus board.</p>

            <strong className="earner-progress-number">0%</strong>

            <div className="earner-progress-bar">
              <span />
            </div>

            <small>
              Potential from remaining tasks: <strong>₦100</strong>
            </small>
          </section>

          <section className="earner-panel earner-submissions">
            <h3>Recent submissions</h3>

            <div className="earner-empty-state">
              <span>▣</span>
              <strong>No submissions yet</strong>
              <p>
                Finish the task above and upload your screenshot to see it
                here.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default EarnersDashboard;