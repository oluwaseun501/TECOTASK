import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserCreateCampaign.css";

const campaignListPath = "/advertisers";

const MAX_GUIDE_IMAGE_BYTES = 2 * 1024 * 1024;

const GUIDE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const formatNaira = (amount = 0) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

const AdvertiserCreateCampaign = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");
  const [savingAction, setSavingAction] = useState("");
  const [draftCampaignId, setDraftCampaignId] = useState("");

  const [guideImageFile, setGuideImageFile] = useState(null);
  const [guideImagePreview, setGuideImagePreview] = useState("");
  const guideImageInputRef = useRef(null);

  const [campaign, setCampaign] = useState({
    serviceId: "",
    brief: "",
    numberOfPeople: "5",
  });

  const [instructions, setInstructions] = useState([""]);

  useEffect(() => {
    let isMounted = true;

    async function loadFormData() {
      const token = sessionStorage.getItem("tecotaskToken");

      if (!token) {
        navigate("/login", { replace: true });
        if (isMounted) setIsLoadingData(false);
        return;
      }

      try {
        const [serviceData, dashboard] = await Promise.all([
          authApi.getAdvertiserServices(token),
          authApi.getAdvertiserDashboard(token),
        ]);

        if (!isMounted) return;

        const activeServices = serviceData.services || [];

        setServices(activeServices);

        const firstService = activeServices[0];

        setInstructions(
          Array.isArray(firstService?.defaultInstructions) &&
            firstService.defaultInstructions.length > 0
            ? [...firstService.defaultInstructions]
            : [""],
        );

        setAvailableBalance(
          Number(dashboard.wallet?.availableBalance || 0),
        );

        setCampaign((current) => ({
          ...current,
          serviceId: current.serviceId || activeServices[0]?.id || "",
        }));

        if (activeServices.length === 0) {
          setLoadError("No active campaign services are available right now.");
        }
      } catch (requestError) {
        if (isMounted) {
          setLoadError(
            requestError.message || "Could not load campaign options.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingData(false);
        }
      }
    }

    loadFormData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!guideImageFile) {
      setGuideImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(guideImageFile);
    setGuideImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [guideImageFile]);

  const selectedService = services.find(
    (service) => service.id === campaign.serviceId,
  );

  const targetQuantity = Number(campaign.numberOfPeople);
  const hasValidQuantity =
    Number.isSafeInteger(targetQuantity) && targetQuantity > 0;

  const pricePerPerson = Number(
    selectedService?.advertiserPricePerPerson || 0,
  );
  const rewardPerPerson = Number(
    selectedService?.earnerRewardPerPerson || 0,
  );
  const feePerPerson = Number(
    selectedService?.platformFeePerPerson || 0,
  );

  const totalBudget = hasValidQuantity
    ? pricePerPerson * targetQuantity
    : 0;
  const rewardTotal = hasValidQuantity
    ? rewardPerPerson * targetQuantity
    : 0;
  const feeTotal = hasValidQuantity
    ? feePerPerson * targetQuantity
    : 0;

  const handleCampaignChange = (event) => {
    const { name, value } = event.target;

    setCampaign((previousCampaign) => ({
      ...previousCampaign,
      [name]: value,
    }));

    if (name === "serviceId") {
      const selected = services.find((service) => service.id === value);
      const defaults = selected?.defaultInstructions;

      setInstructions(
        Array.isArray(defaults) && defaults.length > 0
          ? [...defaults]
          : [""],
      );
    }

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

  const handleGuideImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!GUIDE_IMAGE_TYPES.has(file.type)) {
      setGuideImageFile(null);
      event.target.value = "";
      setMessage(
        "Choose a PNG, JPG, or WebP image. Videos are not accepted.",
      );
      setMessageType("error");
      return;
    }

    if (file.size > MAX_GUIDE_IMAGE_BYTES) {
      setGuideImageFile(null);
      event.target.value = "";
      setMessage("The guide image must be 2 MB or smaller.");
      setMessageType("error");
      return;
    }

    setGuideImageFile(file);
    setMessage("");
  };

  const handleRemoveGuideImage = () => {
    setGuideImageFile(null);

    if (guideImageInputRef.current) {
      guideImageInputRef.current.value = "";
    }

    setMessage("");
  };

  const addInstruction = () => {
    if (instructions.length >= 20) {
      setMessage("A campaign can have no more than 20 instruction steps.");
      setMessageType("error");
      return;
    }

    setInstructions((previousInstructions) => [
      ...previousInstructions,
      "",
    ]);

    setMessage("");
  };

  const removeInstruction = (index) => {
    if (instructions.length === 1) return;

    setInstructions((previousInstructions) =>
      previousInstructions.filter(
        (_, instructionIndex) => instructionIndex !== index,
      ),
    );

    setMessage("");
  };

  const validateTaskDetails = () => {
    if (!campaign.serviceId || !selectedService) {
      return "Please select an available service.";
    }

    // Only checking the max limit now, since steps are optional
    if (instructions.length > 20) {
      return "A campaign can have no more than 20 instruction steps.";
    }

    return "";
  };

  const validateCompleteCampaign = () => {
    const detailError = validateTaskDetails();

    if (detailError) return detailError;

    if (!hasValidQuantity) {
      return "Number of people must be a positive whole number.";
    }

    return "";
  };

  const buildCampaignPayload = () => {
    // Auto-generate a name for the backend since we removed the input
    const generatedName = selectedService 
      ? `${selectedService.name} - ${new Date().toLocaleDateString("en-NG", { day: '2-digit', month: 'short', year: 'numeric' })}`
      : "New Campaign";

    return {
      serviceId: campaign.serviceId,
      name: generatedName, // Sending auto-generated name
      shortBrief: campaign.brief.trim(), // Can be empty
      instructions: instructions.map((instruction) => instruction.trim()).filter(Boolean), // Filter out empty strings
      proofRequirements: "", // Defaulting to empty since removed
      targetQuantity,
    };
  };

  const handleContinue = (event) => {
    event.preventDefault();

    const validationMessage = validateTaskDetails();

    if (validationMessage) {
      setMessage(validationMessage);
      setMessageType("error");
      return;
    }

    setMessage("");
    setStep(2);
  };

  const handleBack = () => {
    setMessage("");
    setStep(1);
  };

  const saveCurrentDraft = async (token, payload) => {
    if (draftCampaignId) {
      await authApi.updateAdvertiserCampaign(
        draftCampaignId,
        payload,
        token,
      );

      return draftCampaignId;
    }

    const result = await authApi.createAdvertiserCampaign(payload, token);
    const newDraftId = result.campaign?.id;

    if (!newDraftId) {
      throw new Error("The campaign draft was created without an ID.");
    }

    setDraftCampaignId(newDraftId);
    return newDraftId;
  };

  const uploadGuideImageIfSelected = async (campaignId, token) => {
    if (!guideImageFile) return;

    await authApi.uploadAdvertiserGuideImage(
      campaignId,
      guideImageFile,
      token,
    );
  };

  const handleSaveAndExit = async () => {
    const validationMessage = validateCompleteCampaign();

    if (validationMessage) {
      setMessage(validationMessage);
      setMessageType("error");
      return;
    }

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSavingAction("draft");
    setMessage("");

    try {
      const campaignId = await saveCurrentDraft(
        token,
        buildCampaignPayload(),
      );

      await uploadGuideImageIfSelected(campaignId, token);

      navigate(campaignListPath);
    } catch (requestError) {
      setMessage(
        requestError.message || "Could not save the campaign draft.",
      );
      setMessageType("error");
    } finally {
      setSavingAction("");
    }
  };

  const handlePublishCampaign = async (event) => {
    event.preventDefault();

    const validationMessage = validateCompleteCampaign();

    if (validationMessage) {
      setMessage(validationMessage);
      setMessageType("error");
      return;
    }

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setSavingAction("publish");
    setMessage("");

    try {
      const campaignId = await saveCurrentDraft(
        token,
        buildCampaignPayload(),
      );

      await uploadGuideImageIfSelected(campaignId, token);

      await authApi.submitAdvertiserCampaign(campaignId, token);

      navigate(campaignListPath);
    } catch (requestError) {
      setMessage(
        requestError.message || "Could not submit the campaign for review.",
      );
      setMessageType("error");
    } finally {
      setSavingAction("");
    }
  };

  if (isLoadingData) {
    return (
      <section className="advertiser-create-campaign advertiser-create-campaign--loading">
        <div
          className="advertiser-create-campaign__loader"
          role="status"
          aria-live="polite"
        >
          <span
            className="advertiser-create-campaign__roller"
            aria-hidden="true"
          >
            <span />
          </span>
          <strong>Preparing your campaign builder</strong>
          <p>Loading services and wallet balance...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="advertiser-create-campaign">
      <div className="advertiser-create-campaign__top">
        <div>
          <Link
            to={campaignListPath}
            className="advertiser-create-campaign__back"
          >
            ← Back to campaigns
          </Link>

          <span className="advertiser-create-campaign__eyebrow">
            Campaign builder
          </span>

          <h1>Create a campaign</h1>

          <p>Publish a task and only pay for approved work.</p>
        </div>
      </div>

      {loadError && (
        <p className="advertiser-create-campaign__message" role="alert">
          {loadError}
        </p>
      )}

      <div className="advertiser-campaign-stepper" aria-label="Campaign steps">
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
          <form className="advertiser-campaign-form" onSubmit={handleContinue}>
            <div className="advertiser-campaign-form__heading">
              <h2>Task details</h2>
              <p>Tell earners exactly what they need to complete.</p>
            </div>

            <div className="advertiser-form-field">
              <label htmlFor="campaignCategory">Task category</label>

              <select
                id="campaignCategory"
                name="serviceId"
                value={campaign.serviceId}
                onChange={handleCampaignChange}
                disabled={isLoadingData || services.length === 0}
                required
              >
                <option value="">Choose a service</option>

                {services.map((service) => (
                  <option value={service.id} key={service.id}>
                    {service.name}
                    {service.platform ? ` · ${service.platform}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="advertiser-form-field">
              <div className="advertiser-form-label-row">
                <label htmlFor="campaignBrief">Short brief for earners</label>
                <span>Optional</span>
              </div>

              <textarea
                id="campaignBrief"
                name="brief"
                rows="4"
                value={campaign.brief}
                onChange={handleCampaignChange}
                placeholder="Explain what the earner needs to do."
              />

              <small>
                Plain language works best. Earners decide in seconds whether to
                take your task.
              </small>
            </div>

            <div className="advertiser-form-field">
              <div className="advertiser-form-label-row">
                <label>Instruction steps</label>
                <span>Optional</span>
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
                disabled={instructions.length >= 20}
              >
                + Add step
              </button>
            </div>

            <div className="advertiser-form-field">
              <div className="advertiser-form-label-row">
                <label htmlFor="campaignGuideImage">
                  Guide image for earners
                </label>
                <span>Optional</span>
              </div>

              <div className="advertiser-guide-image">
                <div className="advertiser-guide-image__content">
                  {guideImagePreview ? (
                    <img
                      className="advertiser-guide-image__preview"
                      src={guideImagePreview}
                      alt="Campaign guide image preview"
                    />
                  ) : (
                    <div
                      className="advertiser-guide-image__placeholder"
                      aria-hidden="true"
                    >
                      +
                    </div>
                  )}

                  <div className="advertiser-guide-image__copy">
                    <strong>
                      {guideImageFile
                        ? "Image selected"
                        : "Add a reference image"}
                    </strong>

                    <span>
                      Give earners a visual example of the account, page, or
                      result.
                    </span>

                    {guideImageFile && (
                      <small>
                        {guideImageFile.name} ·{" "}
                        {Math.ceil(guideImageFile.size / 1024)} KB
                      </small>
                    )}
                  </div>
                </div>

                <div className="advertiser-guide-image__actions">
                  <label className="advertiser-guide-image__choose">
                    {guideImageFile ? "Change image" : "Choose image"}
                    <input
                      ref={guideImageInputRef}
                      id="campaignGuideImage"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleGuideImageChange}
                    />
                  </label>

                  {guideImageFile && (
                    <button
                      type="button"
                      className="advertiser-guide-image__remove"
                      onClick={handleRemoveGuideImage}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <small>
                Optional. PNG, JPG, or WebP only; maximum 2 MB. Videos aren’t
                accepted.
              </small>
            </div>

            {message && (
              <p
                className="advertiser-create-campaign__message"
                role={messageType === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            )}

            <div className="advertiser-create-campaign__actions">
              <button
                type="button"
                className="advertiser-campaign-secondary-button"
                onClick={handleSaveAndExit}
                disabled={isLoadingData || savingAction !== ""}
              >
                {savingAction === "draft" ? "Saving..." : "Save and exit"}
              </button>

              <button
                type="submit"
                className="advertiser-campaign-primary-button"
                disabled={isLoadingData || savingAction !== ""}
              >
                Continue
                <span>→</span>
              </button>
            </div>
          </form>

          <CampaignCostSidebar
            selectedService={selectedService}
            quantity={targetQuantity}
            hasValidQuantity={hasValidQuantity}
            totalBudget={totalBudget}
            rewardTotal={rewardTotal}
            feeTotal={feeTotal}
            availableBalance={availableBalance}
          />
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
                Set your target, then check the campaign before publishing it.
              </p>
            </div>

            <div className="advertiser-form-grid">
              <div className="advertiser-form-field">
                <label htmlFor="pricePerPerson">Price per person</label>

                <div className="advertiser-input-with-prefix">
                  <span>₦</span>

                  <input
                    id="pricePerPerson"
                    type="text"
                    value={
                      selectedService
                        ? pricePerPerson.toLocaleString("en-NG")
                        : ""
                    }
                    placeholder="Choose a service"
                    readOnly
                  />
                </div>

                <small>Price is set by the selected service.</small>
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
                  required
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
                  <dt>Category</dt>
                  <dd>
                    {selectedService?.platform ||
                      selectedService?.name ||
                      "—"}
                  </dd>
                </div>

                <div>
                  <dt>Number of people</dt>
                  <dd>{hasValidQuantity ? targetQuantity : "—"}</dd>
                </div>

                <div>
                  <dt>Guide image</dt>
                  <dd>{guideImageFile ? guideImageFile.name : "Not added"}</dd>
                </div>
              </dl>
            </section>

            {message && (
              <p
                className="advertiser-create-campaign__message"
                role={messageType === "error" ? "alert" : "status"}
              >
                {message}
              </p>
            )}

            <div className="advertiser-create-campaign__actions">
              <button
                type="button"
                className="advertiser-campaign-secondary-button"
                onClick={handleBack}
                disabled={savingAction !== ""}
              >
                ← Back
              </button>

              <button
                type="submit"
                className="advertiser-campaign-primary-button"
                disabled={isLoadingData || savingAction !== ""}
              >
                {savingAction === "publish"
                  ? "Publishing..."
                  : "Publish campaign"}
                <span>→</span>
              </button>
            </div>
          </form>

          <CampaignCostSidebar
            selectedService={selectedService}
            quantity={targetQuantity}
            hasValidQuantity={hasValidQuantity}
            totalBudget={totalBudget}
            rewardTotal={rewardTotal}
            feeTotal={feeTotal}
            availableBalance={availableBalance}
          />
        </div>
      )}
    </section>
  );
};
const CampaignCostSidebar = ({
  selectedService,
  quantity,
  hasValidQuantity,
  totalBudget,
  availableBalance,
}) => {
  const hasEstimate =
    Boolean(selectedService) &&
    hasValidQuantity &&
    Number.isSafeInteger(quantity);

  return (
    <aside className="advertiser-campaign-preview">
      <section className="advertiser-campaign-cost-card">
        <span>Total campaign cost</span>

        <strong>{formatNaira(hasEstimate ? totalBudget : 0)}</strong>

        {/* Kept only the wallet balance as requested */}
        <div className="advertiser-campaign-cost-line" style={{ marginTop: "1rem" }}>
          <span>Wallet balance</span>
          <strong>{formatNaira(availableBalance)}</strong>
        </div>

        {hasEstimate && totalBudget > availableBalance && (
          <p className="advertiser-create-campaign__message" role="status">
            The campaign cost is higher than your available balance.
          </p>
        )}

        <p style={{ marginTop: "1rem" }}>
          Unused budget stays in your wallet — you only pay for approved proofs.
        </p>
      </section>

      <section className="advertiser-publish-info">
        <h2>Before you publish</h2>

        <p>
          Campaigns go through a short moderation review, usually under two
          hours.
        </p>

        {/* Updated this text since we removed the proof requirement field */}
        <p>
          Make sure your task instructions are clear to avoid duplicate
          submissions and slow approvals.
        </p>

        <p>
          You can pause a campaign at any time and keep the remaining budget.
        </p>
      </section>
    </aside>
  );
};

export default AdvertiserCreateCampaign;