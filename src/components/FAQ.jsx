import { useState } from "react";
import "../styles/FAQ.css";

const questions = [
  {
    question: "What is TecoTask?",
    answer:
      "TecoTask connects earners with advertisers. Earners complete verified online tasks and submit proof, while advertisers create campaigns to reach real people.",
  },
  {
    question: "How do earners receive rewards?",
    answer:
      "Earners choose an available task, follow the instructions, and submit the required screenshot or link. Once the submission is approved, the reward is added to the earner wallet.",
  },
  {
    question: "What kind of proof is required?",
    answer:
      "Proof depends on the campaign. It may include a screenshot, a completed form, a link, or other information requested by the advertiser.",
  },
  {
    question: "Can advertisers add an image to a campaign?",
    answer:
      "Yes. Advertisers can add an optional campaign image, target link, instructions, reward amount, and the number of available task slots.",
  },
  {
    question: "How are submissions reviewed?",
    answer:
      "Submissions are checked by moderators. They compare the submitted proof with the campaign instructions before approving or rejecting the task.",
  },
  {
    question: "Can I refer someone to TecoTask?",
    answer:
      "Yes. Earners can share their referral link and receive referral rewards when the referred person completes the required activation process.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="faq-section__inner">
        <div className="faq-section__intro">
          <span className="faq-section__eyebrow">
            Frequently asked questions
          </span>

          <h2>
            Questions Nigerians
            <br />
            actually ask.
          </h2>

          <p>
            Learn more about earning, campaigns, proof submission, rewards,
            and approvals on TecoTask.
          </p>

          <div className="faq-section__help">
            <span>Still need help?</span>
            <a href="mailto:support@tecotask.com">
              Contact support →
            </a>
          </div>
        </div>

        <div className="faq-list">
          {questions.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className={`faq-item ${isOpen ? "is-open" : ""}`}
              >
                <button
                  type="button"
                  className="faq-item__button"
                  onClick={() => toggleQuestion(index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>

                  <span className="faq-item__icon">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="faq-item__answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;