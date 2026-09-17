import "../styles/HowItWorks.css";

const steps = [
  {
    number: "1",
    title: "Create your account",
    description:
      "Sign up as an earner or advertiser and choose how you want to use TecoTask.",
  },
  {
    number: "2",
    title: "Activate your account",
    description:
      "Verify your details and unlock access to the task board or campaign tools.",
  },
  {
    number: "3",
    title: "Take action",
    description:
      "Earners complete tasks and upload proof, while advertisers create campaigns and add their instructions.",
  },
  {
    number: "4",
    title: "Get approved and track results",
    description:
      "Moderators review submitted proof, earners receive rewards, and advertisers monitor campaign progress.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__inner">
        <div className="how-it-works__heading">
          <span className="how-it-works__eyebrow">
            Simple and transparent
          </span>

          <h2>
            Four simple steps from sign-up
            <br />
            to results
          </h2>

          <p>
            Whether you want to earn from simple tasks or promote your brand,
            TecoTask makes the process clear and easy to follow.
          </p>
        </div>

        <div className="how-it-works__steps">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className="how-it-works__step"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <span className="how-it-works__number">{step.number}</span>

              <div className="how-it-works__content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;