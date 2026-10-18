import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getWhatsAppSupportUrl } from "../config/support.js";
import "../styles/LegalPage.css";

const LEGAL_CONTENT = {
  privacy: {
    eyebrow: "Your information",
    title: "Privacy policy",
    intro:
      "This policy explains how TecoTask may handle information when you visit the website, create an account, complete tasks, run campaigns, or contact support.",
    sections: [
      {
        title: "Information we handle",
        paragraphs: [
          "Depending on the features you use, this may include account details you submit, such as your name, email address, and role; task, campaign, and referral activity; proof you upload; payout details you provide; support messages; and basic technical information needed to operate and secure the site.",
        ],
      },
      {
        title: "How information is used",
        paragraphs: [
          "TecoTask uses information to manage accounts, make platform features available, review task submissions and campaigns, administer rewards and withdrawal requests, respond to support requests, and protect the platform from misuse.",
        ],
      },
    //   {
    //     title: "When information may be shared",
    //     paragraphs: [
    //       "Information in a task submission may be available to the relevant campaign advertiser and TecoTask reviewers so they can assess the submission. Information may also be handled by providers that help operate the platform, or disclosed when required by law.",
    //     ],
    //   },
      {
        title: "Storage and security",
        paragraphs: [
          "TecoTask takes steps intended to protect information and keeps it for as long as needed to operate the service and meet applicable recordkeeping obligations. The exact retention periods depend on the type of information and why it is needed.",
        ],
      },
    //   {
    //     title: "Browser storage",
    //     paragraphs: [
    //       "The website may use browser storage for sign-in sessions and saved preferences. You can manage browser storage through your browser settings, though some site features may not work properly if it is disabled.",
    //     ],
    //   },
      {
        title: "Your choices and requests",
        paragraphs: [
          "You can contact TecoTask to ask about your information or request a correction or deletion. Some records may need to be retained where required for legal, payment, security, or dispute-related reasons.",
        ],
      },
    ],
  },

  terms: {
    eyebrow: "Using TecoTask",
    title: "Terms of use",
    intro:
      "These terms describe the basic rules for using TecoTask as an earner or advertiser. By using the platform, you agree to follow them and any instructions shown for a specific task or campaign.",
    sections: [
      {
        title: "Accounts",
        paragraphs: [
          "Provide accurate account information and keep your sign-in details secure. You are responsible for activity carried out through your account and should contact support if you believe it has been accessed without permission.",
        ],
      },
      {
        title: "Tasks and campaigns",
        paragraphs: [
          "Earners should read each task’s instructions and submit genuine, relevant proof. Advertisers should provide clear campaign requirements and reward details. TecoTask or the relevant advertiser may review submissions against those requirements.",
        ],
      },
      {
        title: "Rewards and withdrawals",
        paragraphs: [
          "Rewards depend on the requirements shown for the task or campaign and whether the submission is approved. Withdrawal requests may be reviewed before processing. Keep your payout information accurate and check your account for the status of requests.",
        ],
      },
      {
        title: "Acceptable use",
        paragraphs: [
          "Do not submit false proof, manipulate referrals or rewards, misuse another person’s account, interfere with the platform, or use TecoTask for unlawful or abusive activity. Advertisers must not use campaigns to mislead or harm participants.",
        ],
      },
      {
        title: "Platform access and changes",
        paragraphs: [
          "TecoTask may review activity and restrict access when needed to protect users, address suspected misuse, or comply with legal obligations. Features, tasks, campaigns, and reward availability may change over time.",
        ],
      },
    //   {
    //     title: "No guaranteed earnings",
    //     paragraphs: [
    //       "Task availability, campaign participation, and rewards can vary. Using TecoTask does not guarantee a particular amount of work or earnings.",
    //     ],
    //   },
    ],
  },
};

export default function LegalPage({ type = "privacy" }) {
  const page = LEGAL_CONTENT[type] || LEGAL_CONTENT.privacy;
  const supportUrl = getWhatsAppSupportUrl(
    `Hello TecoTask support, I have a question about the ${page.title}.`,
  );

  return (
    <>
      <Navbar />

      <main className="legal-page">
        <div className="legal-page__container">
          <div className="legal-page__breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span>{page.title}</span>
          </div>

          <p className="legal-page__eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="legal-page__intro">{page.intro}</p>

          {/* <p className="legal-page__updated">
            Last updated: <strong>[Add the publication date]</strong>
          </p> */}

          <div className="legal-page__sections">
            {page.sections.map((section) => (
              <section className="legal-page__section" key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>

          <aside className="legal-page__contact">
            <h2>Questions?</h2>
            <p>Contact the TecoTask support team on WhatsApp.</p>
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="legal-page__contact-link"
            >
              Contact support
            </a>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}