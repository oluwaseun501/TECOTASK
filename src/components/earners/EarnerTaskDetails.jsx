import { Fragment, useEffect, useRef, useState } from "react";
import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { authApi } from "../../services/auth.js";
import "../../styles/EarnersDashboard.css";

const MAX_PROOF_IMAGE_BYTES = 2 * 1024 * 1024;

const PROOF_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const formatNaira = (amount = 0) =>
  `₦${Number(amount).toLocaleString("en-NG")}`;

function cleanUrl(url) {
  return url.replace(/[),.;!?]+$/g, "");
}

function getInstructionLinks(instructions = "") {
  const matches = String(instructions).match(/https?:\/\/[^\s]+/gi) || [];

  return [...new Set(matches.map(cleanUrl))];
}

function renderInstructions(instructions = "") {
  const parts = String(instructions).split(/(https?:\/\/[^\s]+)/gi);

  return parts.map((part, index) => {
    if (!/^https?:\/\//i.test(part)) {
      return <Fragment key={index}>{part}</Fragment>;
    }

    const url = cleanUrl(part);
    const trailingText = part.slice(url.length);

    return (
      <Fragment key={index}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
        {trailingText}
      </Fragment>
    );
  });
}

const EarnerTaskDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { taskId } = useParams();

  const {
    dashboard,
    setDashboard,
    isDashboardLoading: isLoading,
    dashboardError,
  } = useOutletContext();

  const [submissionId, setSubmissionId] = useState("");
  const [submissionStatus, setSubmissionStatus] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [proofNote, setProofNote] = useState("");
  const [proofImage, setProofImage] = useState(null);
  const [proofImagePreview, setProofImagePreview] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const proofImageInputRef = useRef(null);
  const proofFormRef = useRef(null);

  const existingSubmission =
    dashboard?.recentSubmissions?.find(
      (submission) => String(submission.task?.id) === String(taskId),
    ) || null;

  const taskFromDashboard =
    dashboard?.taskQueue?.find(
      (item) => String(item.id) === String(taskId),
    ) ||
    existingSubmission?.task ||
    null;

  const task = taskFromDashboard || location.state?.task || null;

  const currentSubmissionId =
    submissionId || existingSubmission?.id || "";

  const currentStatus =
    submissionStatus || existingSubmission?.status || "";

  const showProofForm = ["started", "rejected"].includes(currentStatus);

  const advertiserLinks = getInstructionLinks(task?.instructions || "");

  useEffect(() => {
    setSubmissionId(existingSubmission?.id || "");
    setSubmissionStatus(existingSubmission?.status || "");
    setProofUrl(existingSubmission?.proofUrl || "");
    setProofNote(existingSubmission?.proofNote || "");
  }, [
    taskId,
    existingSubmission?.id,
    existingSubmission?.status,
    existingSubmission?.proofUrl,
    existingSubmission?.proofNote,
  ]);

  useEffect(() => {
    if (!proofImage) {
      setProofImagePreview("");
      return undefined;
    }

    const previewUrl = URL.createObjectURL(proofImage);
    setProofImagePreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [proofImage]);

  useEffect(() => {
    if (!showProofForm) return undefined;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const frameId = window.requestAnimationFrame(() => {
      proofFormRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [showProofForm]);

  const refreshDashboard = async (token) => {
    const updatedDashboard = await authApi.getEarnerDashboard(token);

    setDashboard((current) => ({
      ...updatedDashboard,
      stats: {
        ...(updatedDashboard.stats || {}),
        walletBalance:
          current?.stats?.walletBalance ??
          updatedDashboard.stats?.walletBalance ??
          0,
      },
    }));
  };

  const handleStartTask = async () => {
    if (!task || isBusy) return;

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsBusy(true);
    setActionError("");
    setActionMessage("");

    try {
      const result = await authApi.startEarnerTask(task.id, token);

      setSubmissionId(result.submission.id);
      setSubmissionStatus("started");
      setActionMessage(
        result.message || "Task started. You can now submit your proof.",
      );

      try {
        await refreshDashboard(token);
      } catch {
        // The task is started. Keep the local page state usable if refresh fails.
      }
    } catch (error) {
      setActionError(error.message || "Could not start this task.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleProofImageChange = (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0] || null;

    setActionError("");

    if (!file) {
      setProofImage(null);
      return;
    }

    if (!PROOF_IMAGE_TYPES.has(file.type)) {
      setProofImage(null);
      input.value = "";
      setActionError(
        "Choose a PNG, JPEG, or WebP image. Videos are not accepted.",
      );
      return;
    }

    if (file.size > MAX_PROOF_IMAGE_BYTES) {
      setProofImage(null);
      input.value = "";
      setActionError("The image must be 2 MB or smaller.");
      return;
    }

    setProofImage(file);
  };

  const handleRemoveProofImage = () => {
    setProofImage(null);

    if (proofImageInputRef.current) {
      proofImageInputRef.current.value = "";
    }
  };

  const handleSubmitProof = async (event) => {
    event.preventDefault();

    if (!currentSubmissionId || isBusy) return;

    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setIsBusy(true);
    setActionError("");
    setActionMessage("");

    try {
      if (proofImage) {
        await authApi.uploadEarnerProofImage(
          currentSubmissionId,
          proofImage,
          token,
        );
      }

      const result = await authApi.submitEarnerProof(
        currentSubmissionId,
        { proofUrl, proofNote },
        token,
      );

      setSubmissionStatus("submitted");
      setProofImage(null);

      if (proofImageInputRef.current) {
        proofImageInputRef.current.value = "";
      }

      setActionMessage(result.message || "Proof submitted successfully.");

      try {
        await refreshDashboard(token);
      } catch {
        setActionError(
          "Your proof was submitted, but the dashboard could not refresh. Reload the page to see the update.",
        );
      }
    } catch (error) {
      setActionError(error.message || "Could not submit proof.");
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="earner-loading" role="status" aria-live="polite">
        <span className="earner-loading__roller" aria-hidden="true">
          <span />
        </span>
        <span className="earner-loading__sr-only">
          Loading task details
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

  if (!task) {
    return (
      <main className="earner-task-detail">
        <button
          type="button"
          className="earner-secondary-button"
          onClick={() => navigate("/earners")}
        >
          ← Back to tasks
        </button>

        <div className="earner-empty-state">
          <strong>Task not found</strong>
          <p>It may no longer be available. Return to your task board to see current tasks.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="earner-task-detail">
      <button
        type="button"
        className="earner-secondary-button earner-task-detail__back"
        onClick={() => navigate("/earners")}
      >
        ← Back to tasks
      </button>

      <article className="earner-task-detail__card">
        <div className="earner-task-detail__meta">
          <span className="earner-task-badge">{task.type}</span>
          <span>{task.brand}</span>
          {task.estimatedMinutes ? (
            <span>{task.estimatedMinutes} min</span>
          ) : null}
          {Number.isFinite(Number(task.slotsLeft)) ? (
            <span>{task.slotsLeft} slots left</span>
          ) : null}
        </div>

        <div className="earner-task-detail__heading">
          <div>
            <p className="earner-task-detail__eyebrow">Task details</p>
            <h1>{task.title}</h1>
          </div>

          <div className="earner-task-detail__reward">
            <strong>{formatNaira(task.rewardAmount)}</strong>
            <span>per approved task</span>
          </div>
        </div>

        {task.guideImageUrl && (
  <section className="earner-task-detail__guide">
    <div className="earner-task-detail__guide-heading">
      <div>
        <h2>Advertiser image guide</h2>
        <p>Use this image as a reference while completing the task.</p>
      </div>

      <a
        href={task.guideImageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="earner-task-detail__guide-link"
      >
        Open full image ↗
      </a>
    </div>

    <img
      src={task.guideImageUrl}
      alt={`Advertiser guide for ${task.title}`}
      loading="lazy"
    />
  </section>
)}

        <section className="earner-task-detail__section">
          <h2>About this task</h2>
          <p>
            {task.description || "Read the advertiser’s instructions below."}
          </p>
        </section>

        <section className="earner-task-detail__section">
          <h2>Advertiser instructions</h2>
          <div className="earner-task-detail__instructions">
            {task.instructions ? (
              renderInstructions(task.instructions)
            ) : (
              <span>No additional instructions were provided.</span>
            )}
          </div>
        </section>

        {advertiserLinks.length > 0 && (
          <section className="earner-task-detail__links">
            <div>
              <h2>Advertiser link</h2>
              <p>Open the link to complete the task, then return here to submit proof.</p>
            </div>

            <div className="earner-task-detail__link-list">
              {advertiserLinks.map((url, index) => (
                <a
                  key={`${url}-${index}`}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="earner-secondary-button earner-task-detail__link"
                >
                  {advertiserLinks.length > 1
                    ? `Open advertiser link ${index + 1}`
                    : "Open advertiser link"}
                  <span aria-hidden="true"> ↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {currentStatus === "rejected" && (
          <div className="earner-task-detail__status earner-task-detail__status--rejected">
            <strong>Changes requested</strong>
            {existingSubmission?.rejectionReasonLabel ? (
              <span>{existingSubmission.rejectionReasonLabel}</span>
            ) : null}
            {existingSubmission?.moderatorComment ? (
              <p>{existingSubmission.moderatorComment}</p>
            ) : null}
            <span>Update your proof below and resubmit.</span>
          </div>
        )}

        {currentStatus === "submitted" && (
          <div className="earner-task-detail__status earner-task-detail__status--submitted">
            <strong>Proof submitted</strong>
            <span>Your submission is waiting for review.</span>
          </div>
        )}

        {currentStatus === "approved" && (
          <div className="earner-task-detail__status earner-task-detail__status--approved">
            <strong>Task approved</strong>
            <span>Your submission has been approved.</span>
          </div>
        )}

        {!currentStatus && (
          <div className="earner-task-detail__action">
            <p>
              Review the instructions and advertiser link before starting. Starting
              reserves your place for this task.
            </p>

            <button
              type="button"
              className="earner-primary-button"
              onClick={handleStartTask}
              disabled={isBusy}
            >
              {isBusy ? "Starting..." : "Start task"}
              <span aria-hidden="true"> →</span>
            </button>
          </div>
        )}

        {actionError && (
          <p className="role-error" role="alert">
            {actionError}
          </p>
        )}

        {actionMessage && (
          <p className="earner-task-detail__message" role="status">
            {actionMessage}
          </p>
        )}

        {showProofForm && currentSubmissionId && (
          <section className="earner-task-detail__proof">
            <div className="earner-task-detail__section-heading">
              <p className="earner-task-detail__eyebrow">Task complete?</p>
              <h2>Submit your proof</h2>
              <p>Add your proof link and an optional screenshot.</p>
            </div>

            <form
              className="earner-proof-form"
              ref={proofFormRef}
              onSubmit={handleSubmitProof}
            >
              <label className="earner-proof-form__field">
                <span>Proof link</span>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(event) => setProofUrl(event.target.value)}
                  placeholder="https://..."
                  required
                />
              </label>

              <label className="earner-proof-form__field">
                <span>Note (optional)</span>
                <textarea
                  value={proofNote}
                  onChange={(event) => setProofNote(event.target.value)}
                  maxLength={2000}
                  rows={3}
                />
              </label>

              <div className="earner-proof-image">
                <div className="earner-proof-image__copy">
                  <strong>Screenshot proof (optional)</strong>
                  <span>PNG, JPG, or WebP · max 2 MB · no video</span>
                </div>

                <label className="earner-proof-image__picker">
                  <span>{proofImage ? "Change image" : "Choose image"}</span>
                  <input
                    ref={proofImageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    aria-label="Choose an optional screenshot image"
                    onChange={handleProofImageChange}
                  />
                </label>

                {proofImage && proofImagePreview && (
                  <div className="earner-proof-image__preview">
                    <img
                      src={proofImagePreview}
                      alt="Selected proof screenshot"
                    />

                    <div className="earner-proof-image__file">
                      <strong title={proofImage.name}>
                        {proofImage.name}
                      </strong>
                      <span>{Math.ceil(proofImage.size / 1024)} KB</span>
                    </div>

                    <button
                      type="button"
                      className="earner-proof-image__remove"
                      onClick={handleRemoveProofImage}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="earner-primary-button earner-proof-form__submit"
                disabled={isBusy}
              >
                {isBusy ? "Uploading and submitting..." : "Submit proof"}
              </button>
            </form>
          </section>
        )}
      </article>
    </main>
  );
};

export default EarnerTaskDetails;