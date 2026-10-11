import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "../../styles/AdminCampaigns.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const initialForm = {
  name: "",
  platform: "Social Media",
  advertiserPricePerPerson: "",
  earnerRewardPerPerson: "",
  platformFeePerPerson: "",
  description: "",
  defaultInstructions: "",
  isActive: true,
};

const formatNaira = (amount = 0) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`;

export default function AdminServiceSetup({
  basePath = "/admin",
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setError("");
  };

  const advertiserPrice = Number(form.advertiserPricePerPerson);
  const earnerReward = Number(form.earnerRewardPerPerson);
  const platformFee = Number(form.platformFeePerPerson);

  const instructionSteps = form.defaultInstructions
    .split(/\r?\n/)
    .map((step) => step.trim())
    .filter(Boolean);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !Number.isSafeInteger(advertiserPrice) ||
      advertiserPrice < 1 ||
      !Number.isSafeInteger(earnerReward) ||
      earnerReward < 1 ||
      !Number.isSafeInteger(platformFee) ||
      platformFee < 0
    ) {
      setError(
        "Enter whole-number prices. The advertiser price and earner reward must be at least ₦1; the platform fee can be ₦0 or more.",
      );
      return;
    }

    if (advertiserPrice < earnerReward + platformFee) {
      setError(
        "The advertiser price must cover the earner reward and platform fee.",
      );
      return;
    }

    if (instructionSteps.length < 1 || instructionSteps.length > 20) {
      setError("Add between 1 and 20 default instruction steps.");
      return;
    }

    if (instructionSteps.some((step) => step.length > 1000)) {
      setError("Each instruction step must be 1,000 characters or fewer.");
      return;
    }

    const token =
      sessionStorage.getItem("tecotaskToken") ||
      localStorage.getItem("tecotaskToken");

    if (!token) {
      setError("Your admin session token was not found. Sign in again.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/services`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          platform: form.platform,
          description: form.description.trim(),
          defaultInstructions: instructionSteps,
          advertiserPricePerPerson: advertiserPrice,
          earnerRewardPerPerson: earnerReward,
          platformFeePerPerson: platformFee,
          isActive: form.isActive,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not save this service.");
      }

      navigate(`${basePath}/campaigns`, {
        state: {
          activeTab: "services",
          notice: data.message || "Service created successfully.",
        },
      });
    } catch (requestError) {
      setError(requestError.message || "Could not save this service.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="admin-campaigns-page">
      <div className="admin-campaigns-container">
        <Link
          to={`${basePath}/campaigns`}
          className="campaign-back-link"
        >
          <ArrowLeft size={15} />
          Back to campaigns
        </Link>

        <header className="admin-campaigns-header campaign-form-header">
          <div>
            <p className="admin-campaigns-eyebrow">Service pricing</p>
            <h1>Add a service</h1>
            <p>
              Set the advertiser price, earner reward, and platform fee.
            </p>
          </div>
        </header>

        <form
          className="campaign-form-layout"
          onSubmit={handleSubmit}
        >
          <section className="campaign-form-card">
            <div className="campaign-form-section-heading">
              <div>
                <h2>Service details</h2>
                <p>Define the service shown to advertisers.</p>
              </div>
              <CheckCircle2 size={18} />
            </div>

            <div className="campaign-form-grid">
              <label className="campaign-form-field campaign-form-field--full">
                <span>Service name</span>
                <input
                  required
                  maxLength="100"
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Example: Social media engagement"
                />
              </label>

              <label className="campaign-form-field">
                <span>Category / platform</span>
                <select
                  value={form.platform}
                  onChange={(event) =>
                    updateField("platform", event.target.value)
                  }
                >
                  <option>Social Media</option>
                  <option>Mobile Apps</option>
                  <option>Research</option>
                  <option>Content</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="campaign-form-field">
                <span>Price charged to advertiser</span>
                <div className="campaign-input-with-prefix">
                  <span>₦</span>
                  <input
                    required
                    min="1"
                    step="1"
                    type="number"
                    value={form.advertiserPricePerPerson}
                    onChange={(event) =>
                      updateField(
                        "advertiserPricePerPerson",
                        event.target.value,
                      )
                    }
                    placeholder="20"
                  />
                </div>
              </label>

              <label className="campaign-form-field">
                <span>Reward paid to earner</span>
                <div className="campaign-input-with-prefix">
                  <span>₦</span>
                  <input
                    required
                    min="1"
                    step="1"
                    type="number"
                    value={form.earnerRewardPerPerson}
                    onChange={(event) =>
                      updateField(
                        "earnerRewardPerPerson",
                        event.target.value,
                      )
                    }
                    placeholder="15"
                  />
                </div>
              </label>

              <label className="campaign-form-field">
                <span>Platform fee</span>
                <div className="campaign-input-with-prefix">
                  <span>₦</span>
                  <input
                    required
                    min="0"
                    step="1"
                    type="number"
                    value={form.platformFeePerPerson}
                    onChange={(event) =>
                      updateField(
                        "platformFeePerPerson",
                        event.target.value,
                      )
                    }
                    placeholder="5"
                  />
                </div>
              </label>

              <label className="campaign-form-field campaign-form-field--full">
                <span>Service description</span>
                <textarea
                  required
                  rows="4"
                  maxLength="500"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe what this service is for..."
                />
              </label>

              <label className="campaign-form-field campaign-form-field--full">
                <span>Default instructions</span>
                <textarea
                  required
                  rows="5"
                  value={form.defaultInstructions}
                  onChange={(event) =>
                    updateField("defaultInstructions", event.target.value)
                  }
                  placeholder={
                    "Add one instruction step per line.\nExample: Open the link and follow the account."
                  }
                />
                <small>
                  These steps will prefill the advertiser’s campaign form.
                  Add 1–20 steps.
                </small>
              </label>
            </div>
          </section>

          <aside className="campaign-form-side">
            <section className="campaign-price-preview">
              <div className="campaign-price-preview-icon">
                <Calculator size={18} />
              </div>

              <p>Advertiser price preview</p>
              <strong>{formatNaira(advertiserPrice)}</strong>
              <span>per approved earner</span>

              <div className="campaign-price-note">
                <div>
                  Earner reward: {formatNaira(earnerReward)}
                </div>
                <div>
                  Platform fee: {formatNaira(platformFee)}
                </div>
                <div>
                  Advertiser price must cover both amounts.
                </div>
              </div>
            </section>

            <section className="campaign-form-card campaign-publish-card">
              <h2>Service visibility</h2>
              <p>
                Active services are selectable by advertisers. Inactive
                services are hidden from their campaign form.
              </p>

              <label className="campaign-toggle-row">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                />

                <span>
                  <strong>Available to advertisers</strong>
                  <small>Allow this service to be selected.</small>
                </span>
              </label>
            </section>
          </aside>

          {error && (
            <p
              role="alert"
              style={{
                gridColumn: "1 / -1",
                color: "#b42318",
              }}
            >
              {error}
            </p>
          )}

          <div className="campaign-form-actions">
            <Link
              to={`${basePath}/campaigns`}
              className="campaign-secondary-button"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="campaign-primary-button"
              disabled={isSaving}
            >
              {isSaving ? "Saving service…" : "Save service"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}