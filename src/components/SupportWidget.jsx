import { useRef, useState } from "react";
import {
  ChevronDown,
  ExternalLink,
  MessageCircle,
  X,
} from "lucide-react";

import "../styles/SupportWidget.css";

/*
 * Replace this with the WhatsApp number in international format.
 * Example:
 * const WHATSAPP_NUMBER = "2348012345678";
 */
const WHATSAPP_NUMBER = "YOUR_WHATSAPP_NUMBER";

const FAQ_SECTIONS = [
  {
    id: "general",
    title: "General questions",
    questions: [
      {
        id: "general-contact",
        question: "How can I contact TecoTask support?",
        answer:
          "You can browse the common questions here. If you still need help, click the WhatsApp button below to message the TecoTask support team directly.",
      },
      {
        id: "general-password",
        question: "How do I reset my password?",
        answer:
          "Click the Forgot password link on your login page and follow the instructions. If you cannot access your email, contact support through WhatsApp.",
      },
    ],
  },
  {
    id: "earners",
    title: "Earner questions",
    questions: [
      {
        id: "earner-tasks",
        question: "How do I complete a task and receive my reward?",
        answer:
          "Open an available task, read the instructions carefully, complete the required action, and submit your proof. Your reward is added after the submission has been reviewed and approved.",
      },
      {
        id: "earner-withdrawal",
        question: "When will my withdrawal be processed?",
        answer:
          "Withdrawal requests are reviewed before they are processed. Make sure your payment details are correct and contact support if your request remains pending longer than expected.",
      },
    ],
  },
  {
    id: "advertisers",
    title: "Advertiser questions",
    questions: [
      {
        id: "advertiser-campaign",
        question: "How do I create an advertising campaign?",
        answer:
          "Open your advertiser dashboard, select Campaigns, and choose Create campaign. Add the campaign details, target audience, budget, and task instructions before submitting it for review.",
      },
      {
        id: "advertiser-review",
        question: "Why is my campaign being reviewed?",
        answer:
          "Campaigns are reviewed to confirm that the instructions are clear, the reward is appropriate, and the campaign follows TecoTask guidelines. You will see an update in your dashboard after review.",
      },
    ],
  },
];

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

function getSavedTopPosition() {
  if (typeof window === "undefined") {
    return 50;
  }

  try {
    const savedPosition = Number(
      window.localStorage.getItem("tecotask-support-position")
    );

    if (Number.isFinite(savedPosition)) {
      return clamp(savedPosition, 10, 90);
    }
  } catch {
    // Use the default position when localStorage is unavailable.
  }

  return 50;
}

export default function SupportWidget() {
  const supportButtonRef = useRef(null);

  const dragRef = useRef({
    dragging: false,
    moved: false,
    startY: 0,
    startTop: 0,
  });

  const ignoreClickRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [topPosition, setTopPosition] = useState(getSavedTopPosition);
  const [isDragging, setIsDragging] = useState(false);

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      "Hello TecoTask support, I need help with my account."
    );

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const handlePointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    const button = supportButtonRef.current;

    if (!button) {
      return;
    }

    const buttonRect = button.getBoundingClientRect();

    dragRef.current = {
      dragging: true,
      moved: false,
      startY: event.clientY,
      startTop: buttonRect.top + buttonRect.height / 2,
    };

    setIsDragging(true);

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.dragging) {
      return;
    }

    const distanceMoved =
      event.clientY - dragRef.current.startY;

    if (Math.abs(distanceMoved) > 4) {
      dragRef.current.moved = true;
    }

    const nextTopInPixels = clamp(
      dragRef.current.startTop + distanceMoved,
      55,
      window.innerHeight - 55
    );

    const nextTopPercentage =
      (nextTopInPixels / window.innerHeight) * 100;

    setTopPosition(clamp(nextTopPercentage, 10, 90));
  };

  const handlePointerUp = () => {
    if (!dragRef.current.dragging) {
      return;
    }

    const wasMoved = dragRef.current.moved;

    dragRef.current.dragging = false;

    setIsDragging(false);

    if (wasMoved) {
      ignoreClickRef.current = true;

      try {
        window.localStorage.setItem(
          "tecotask-support-position",
          String(topPosition)
        );
      } catch {
        // The widget still works if localStorage is unavailable.
      }
    }
  };

  const handleToggle = () => {
    if (ignoreClickRef.current) {
      ignoreClickRef.current = false;
      return;
    }

    setIsOpen((current) => !current);
  };

  const toggleQuestion = (questionId) => {
    setActiveQuestion((current) =>
      current === questionId ? null : questionId
    );
  };

  return (
    <>
      <button
        ref={supportButtonRef}
        type="button"
        className={`support-widget__toggle ${
          isDragging ? "support-widget__toggle--dragging" : ""
        }`}
        style={{ "--support-top": `${topPosition}%` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleToggle}
        aria-label="Open contact support"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={21} /> : <MessageCircle size={22} />}

        <span className="support-widget__toggle-label">
          Support
        </span>
      </button>

      {isOpen ? (
        <aside className="support-widget__panel" aria-label="Contact support">
          <div className="support-widget__header">
            <div className="support-widget__header-icon">
              <MessageCircle size={18} />
            </div>

            <div>
              <h2>Contact support</h2>
              <p>Find quick answers before messaging us.</p>
            </div>

            <button
              type="button"
              className="support-widget__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close support"
            >
              <X size={17} />
            </button>
          </div>

          <div className="support-widget__body">
            {FAQ_SECTIONS.map((section) => (
              <section
                className="support-widget__section"
                key={section.id}
              >
                <h3>{section.title}</h3>

                <div className="support-widget__questions">
                  {section.questions.map((item) => {
                    const isActive = activeQuestion === item.id;

                    return (
                      <div
                        className={`support-widget__question ${
                          isActive
                            ? "support-widget__question--active"
                            : ""
                        }`}
                        key={item.id}
                      >
                        <button
                          type="button"
                          onClick={() => toggleQuestion(item.id)}
                          aria-expanded={isActive}
                        >
                          <span>{item.question}</span>

                          <ChevronDown
                            size={15}
                            className="support-widget__chevron"
                          />
                        </button>

                        {isActive ? (
                          <p>{item.answer}</p>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <div className="support-widget__whatsapp">
            <div>
              <strong>Still need help?</strong>

              <span>
                Message our support team directly on WhatsApp.
              </span>
            </div>

            <button
              type="button"
              onClick={openWhatsApp}
              className="support-widget__whatsapp-button"
            >
              Open WhatsApp
              <ExternalLink size={14} />
            </button>
          </div>
        </aside>
      ) : null}
    </>
  );
}