import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/AdvertiserCreateCampaign.css";

const categories = [
  "Social Media",
  "App Install",
  "Survey",
  "Review",
  "Website Visit",
];

const AdvertiserCreateCampaign = () => {
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const [campaign, setCampaign] = useState({
    name: "Instagram community push",
    category: "Social Media",
    brief: "Follow our Instagram page and keep the follow for 14 days.",
    proof:
      "Screenshot that shows the following button and the username is visible.",
    pricePerPerson: "1000",
    numberOfPeople: "5",
  });

  const [instructions, setInstructions] = useState([
    "Open the link and tap Follow",
    "Screenshot the result",
  ]);

  const handleCampaignChange = (event) => {
    const { name, value } = event.target;

    setCampaign((previousCampaign) => ({
      ...previousCampaign,
      [name]: value,
    }));

    setMessage("");
  };

  const handleInstructionChange = (index, value) => {
    setInstructions((previousInstructions) =>
      previousInstructions.map((instruction, instructionIndex) =>
        instructionIndex === index ? value : instruction,
      ),
    );

    setMessage("");
  };

  const addInstruction = () => {
    setInstructions((previousInstructions) => [
      ...previousInstructions,
      "",
    ]);
  };

  const removeInstruction = (index) => {
    if (instructions.length === 1) {
      return;
    }

    setInstructions((previousInstructions) =>
      previousInstructions.filter(
        (_, instructionIndex) => instructionIndex !== index,
      ),
    );
  };

  const validateTaskDetails = () => {
    const hasEmptyInstruction = instructions.some(
      (instruction) => !instruction.trim(),
    );

    if (!campaign.name.trim()) {
      return "Please enter a campaign name.";
    }

    if (!campaign.brief.trim()) {
      return "Please add a short brief for earners.";
    }

    if (hasEmptyInstruction) {
      return "Please complete every instruction step.";
    }

    if (!campaign.proof.trim()) {
      return "Please describe the proof requirement.";
    }

    return "";
  };

  const handleContinue = (event) => {
    event.preventDefault();

    const validationMessage = validateTaskDetails();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setMessage("");
    setStep(2);
  };

  const handleBack = () => {
    setMessage("");
    setStep(1);
  };

  const handlePublishCampaign = (event) => {
    event.preventDefault();

    setMessage(
      "Campaign is ready to publish. Backend submission will be connected later.",
    );
  };

  return (
    <section className="advertiser-create-campaign">
      <div className="advertiser-create-campaign__top">
        <div>
          <Link
            to="/advertisers/campaigns"
            className="advertiser-create-campaign__back"
          >
            ← Back to campaigns
          </Link>

          <span className="advertiser-create-campaign__eyebrow">
            Campaign builder
          </span>

          <h1>Create a campaign</h1>

          <p>
            Publish a task and only pay for approved work.
          </p>
        </div>
      </div>

      <div
        className="advertiser-campaign-stepper"
        aria-label="Campaign steps"
      >
        <div
          className={`advertiser-campaign-step ${
            step >= 1 ? "is-active" : ""
          }`}
        >
          <span>1</span>
          <strong>Task details</strong>
        </div>

        <div className="advertiser-campaign-step-line" />

        <div
          className={`advertiser-campaign-step ${
            step >= 2 ? "is-active" : ""
          }`}
        >
          <span>2</span>
          <strong>Budget &amp; review</strong>
        </div>
      </div>

      {step === 1 ? (
        <div className="advertiser-create-campaign__layout">
          <form
            className="advertiser-campaign-form"
            onSubmit={handleContinue}
          >
            <div className="advertiser-campaign-form__heading">
              <h2>Task details</h2>
              <p>Tell earners exactly what they need to complete.</p>
            </div>

            <div className="advertiser-form-field">
              <label htmlFor="campaignName">Campaign name</label>

              <input
                id="campaignName"
                name="name"
                type="text"
                value={campaign.name}
                onChange={handleCampaignChange}
                placeholder="Example: Instagram community push"
              />
            </div>

            <div className="advertiser-form-field">
              <label htmlFor="campaignCategory">Task category</label>

              <select
                id="campaignCategory"
                name="category"
                value={campaign.category}
                onChange={handleCampaignChange}
              >
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="advertiser-form-field">
              <label htmlFor="campaignBrief">
                Short brief for earners
              </label>

              <textarea
                id="campaignBrief"
                name="brief"
                rows="4"
                value={campaign.brief}
                onChange={handleCampaignChange}
                placeholder="Explain what the earner needs to do."
              />

              <small>
                Plain language works best. Earners decide in seconds whether
                to take your task.
              </small>
            </div>

            <div className="advertiser-form-field">
              <div className="advertiser-form-label-row">
                <label>Instruction steps</label>
                <span>{instructions.length} steps</span>
              </div>

              <div className="advertiser-instructions">
                {instructions.map((instruction, index) => (
                  <div
                    className="advertiser-instruction-row"
                    key={`instruction-${index}`}
                  >
                    <span className="advertiser-instruction-number">
                      {index + 1}
                    </span>

                    <input
                      type="text"
                      value={instruction}
                      onChange={(event) =>
                        handleInstructionChange(index, event.target.value)
                      }
                      placeholder={
                        index === 0
                          ? "Open the link and tap Follow"
                          : "Describe the next step"
                      }
                    />

                    <button
                      type="button"
                      className="advertiser-instruction-action"
                      onClick={() => removeInstruction(index)}
                      aria-label={`Remove instruction ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="advertiser-add-instruction"
                onClick={addInstruction}
              >
                + Add step
              </button>
            </div>

            <div className="advertiser-form-field">
              <label htmlFor="proofRequirement">
                Proof requirement
              </label>

              <input
                id="proofRequirement"
                name="proof"
                type="text"
                value={campaign.proof}
                onChange={handleCampaignChange}
                placeholder="Explain the screenshot or proof an earner must submit."
              />

              <small>
                Moderators reject any submission that does not meet this rule.
              </small>
            </div>

            {message && (
              <p className="advertiser-create-campaign__message" role="alert">
                {message}
              </p>
            )}

            <div className="advertiser-create-campaign__actions">
              <Link
                to="/advertisers/campaigns"
                className="advertiser-campaign-secondary-button"
              >
                Save and exit
              </Link>

              <button
                type="submit"
                className="advertiser-campaign-primary-button"
              >
                Continue
                <span>→</span>
              </button>
            </div>
          </form>

          <CampaignCostSidebar />
        </div>
      ) : (
        <div className="advertiser-create-campaign__layout">
          <form
            className="advertiser-campaign-form"
            onSubmit={handlePublishCampaign}
          >
            <div className="advertiser-campaign-form__heading">
              <h2>Budget &amp; review</h2>
              <p>
                Set your budget, then check the campaign before publishing it.
              </p>
            </div>

            <div className="advertiser-form-grid">
              <div className="advertiser-form-field">
                <label htmlFor="pricePerPerson">
                  Price per person
                </label>

                <div className="advertiser-input-with-prefix">
                  <span>₦</span>

                  <input
                    id="pricePerPerson"
                    name="pricePerPerson"
                    type="number"
                    min="1"
                    step="1"
                    value={campaign.pricePerPerson}
                    onChange={handleCampaignChange}
                    placeholder="1000"
                  />
                </div>
              </div>

              <div className="advertiser-form-field">
                <label htmlFor="numberOfPeople">
                  Number of people / slots
                </label>

                <input
                  id="numberOfPeople"
                  name="numberOfPeople"
                  type="number"
                  min="1"
                  step="1"
                  value={campaign.numberOfPeople}
                  onChange={handleCampaignChange}
                  placeholder="5"
                />
              </div>
            </div>

            <section className="advertiser-review-card">
              <div className="advertiser-review-card__heading">
                <h3>Campaign summary</h3>
                <span>Step 2 of 2</span>
              </div>

              <dl className="advertiser-review-list">
                <div>
                  <dt>Campaign name</dt>
                  <dd>{campaign.name || "—"}</dd>
                </div>

                <div>
                  <dt>Category</dt>
                  <dd>{campaign.category || "—"}</dd>
                </div>

                <div>
                  <dt>Number of people</dt>
                  <dd>{campaign.numberOfPeople || "—"}</dd>
                </div>

                <div>
                  <dt>Proof requirement</dt>
                  <dd>{campaign.proof || "—"}</dd>
                </div>
              </dl>
            </section>

            {message && (
              <p className="advertiser-create-campaign__message" role="alert">
                {message}
              </p>
            )}

            <div className="advertiser-create-campaign__actions">
              <button
                type="button"
                className="advertiser-campaign-secondary-button"
                onClick={handleBack}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="advertiser-campaign-primary-button"
              >
                Publish campaign
                <span>→</span>
              </button>
            </div>
          </form>

          <CampaignCostSidebar />
        </div>
      )}
    </section>
  );
};

const CampaignCostSidebar = () => (
  <aside className="advertiser-campaign-preview">
    <section className="advertiser-campaign-cost-card">
      <span>Campaign cost</span>

      <strong>₦5,500</strong>

      <div className="advertiser-campaign-cost-line">
        <span>Rewards to earners</span>
        <strong>₦5,000</strong>
      </div>

      <div className="advertiser-campaign-cost-line">
        <span>Moderation &amp; service fee</span>
        <strong>₦500</strong>
      </div>

      <div className="advertiser-campaign-cost-line">
        <span>Wallet balance</span>
        <strong>₦62,580</strong>
      </div>

      <p>
        Unused budget stays in your wallet — you only pay for approved proofs.
      </p>
    </section>

    <section className="advertiser-publish-info">
      <h2>Before you publish</h2>

      <p>
        Campaigns go through a short moderation review, usually under two
        hours.
      </p>

      <p>
        Be specific about your proof rule to avoid duplicate submissions and
        slow approvals.
      </p>

      <p>
        You can pause a campaign at any time and keep the remaining budget.
      </p>
    </section>
  </aside>
);

export default AdvertiserCreateCampaign;