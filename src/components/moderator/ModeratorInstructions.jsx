import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  ShieldCheck,
} from "lucide-react";

import "../../styles/ModeratorInstructions.css";

const reviewRules = [
  {
    icon: Eye,
    title: "Check the proof carefully",
    description:
      "Make sure the screenshot, link, or response clearly proves that the earner completed the task.",
  },
  {
    icon: ClipboardCheck,
    title: "Compare it with the instructions",
    description:
      "Do not approve a submission just because it looks complete. Confirm that every task requirement was followed.",
  },
  {
    icon: AlertTriangle,
    title: "Use the correct rejection reason",
    description:
      "If a task is not valid, choose the closest rejection reason and leave a clear comment when necessary.",
  },
  {
    icon: CheckCircle2,
    title: "Be consistent",
    description:
      "Apply the same standard to every earner and every submission, regardless of the task value or account.",
  },
];

export default function ModeratorInstructions() {
  return (
    <main className="moderator-instructions">
      <div className="moderator-instructions__inner">
        <header className="moderator-instructions__header">
          <span className="moderator-instructions__eyebrow">
            Moderator guidance
          </span>

          <h1>Review instructions</h1>

          <p>
            Follow these guidelines to keep task approvals accurate,
            fair, and reliable.
          </p>
        </header>

        <section className="moderator-ai-monitor">
          <div className="moderator-ai-monitor__icon">
            <Bot size={22} />
          </div>

          <div>
            <span className="moderator-ai-monitor__label">
              Quality monitoring is active
            </span>

            <h2>Review every task carefully</h2>

            <p>
              An AI quality monitor checks review patterns, skipped
              evidence, repeated approvals, and inconsistent decisions.
              Work carefully and make decisions based on the submitted
              proof.
            </p>
          </div>

          <div className="moderator-ai-monitor__status">
            <span />
            Monitoring active
          </div>
        </section>

        <section className="moderator-attention-card">
          <AlertTriangle size={18} />

          <div>
            <strong>Use your best judgment.</strong>

            <p>
              Do not approve tasks just to reduce the queue. Do not reject
              valid work without a clear reason. Repeated inaccurate
              decisions may be flagged for additional moderator review.
            </p>
          </div>
        </section>

        <section className="moderator-instruction-grid">
          {reviewRules.map((rule) => {
            const RuleIcon = rule.icon;

            return (
              <article
                className="moderator-instruction-card"
                key={rule.title}
              >
                <div className="moderator-instruction-card__icon">
                  <RuleIcon size={17} />
                </div>

                <h2>{rule.title}</h2>

                <p>{rule.description}</p>
              </article>
            );
          })}
        </section>

        <section className="moderator-final-note">
          <ShieldCheck size={18} />

          <div>
            <strong>Good moderation protects everyone.</strong>

            <p>
              Accurate reviews protect earners, advertisers, and the
              quality of the TecoTask platform.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}