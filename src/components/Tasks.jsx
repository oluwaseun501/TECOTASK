import "../styles/Tasks.css";

const tasks = [
  {
    icon: "◎",
    iconColor: "green",
    title: "Follow @PaySwiftNG on Instagram",
    brand: "PaySwift",
    type: "Social Media",
    time: "1 min",
    slots: "184 slots left",
    reward: "₦10",
  },
  {
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
    icon: "✦",
    iconColor: "orange",
    title: "Answer a six-question data plan survey",
    brand: "Telco Insights",
    type: "Survey",
    time: "5 min",
    slots: "143 slots left",
    reward: "₦25",
  },
  {
    icon: "↯",
    iconColor: "green",
    title: "Complete a customer feedback form",
    brand: "Mama Chi Kitchen",
    type: "Feedback",
    time: "4 min",
    slots: "28 slots left",
    reward: "₦30",
  },
];

const Tasks = () => {
  return (
    <section id="tasks" className="tasks-section">
      <div className="tasks-section__inner">
        <div className="tasks-section__header">
          <div>
            <h2>Tasks open right now</h2>

            <p>
              Rewards start at ₦10 and rise with effort. Slots are first come,
              first served.
            </p>
          </div>

          <button type="button" className="tasks-section__all-button">
            See all tasks
            <span>→</span>
          </button>
        </div>

        <div className="tasks-list">
          {tasks.map((task) => (
            <article className="task-row" key={task.title}>
              <div className={`task-row__icon ${task.iconColor}`}>
                {task.icon}
              </div>

              <div className="task-row__details">
                <h3>{task.title}</h3>

                <p>
                  {task.brand} · {task.type} · {task.time}
                </p>
              </div>

              <div className="task-row__availability">
                <span>{task.slots}</span>
              </div>

              <div className="task-row__reward">{task.reward}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tasks;