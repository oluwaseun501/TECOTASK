import {
  ArrowLeft,
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import "../../styles/AdminCampaigns.css";

export default function AdminServiceSetup({
  basePath = "/admin",
}) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "Social Media",
    pricePerPerson: "",
    description: "",
    instructions: "",
    status: "Active",
  });

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    window.alert("Service saved successfully.");
    navigate(`${basePath}/campaigns`);
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
            <p className="admin-campaigns-eyebrow">
              Service pricing
            </p>

            <h1>Add a service</h1>

            <p>
              Create a service and set the price advertisers will use.
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
                  value={form.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                  placeholder="Example: Social media engagement"
                />
              </label>

              <label className="campaign-form-field">
                <span>Category</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
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
                <span>Price per approved person</span>
                <div className="campaign-input-with-prefix">
                  <span>₦</span>
                  <input
                    required
                    min="1"
                    type="number"
                    value={form.pricePerPerson}
                    onChange={(event) =>
                      updateField(
                        "pricePerPerson",
                        event.target.value
                      )
                    }
                    placeholder="20"
                  />
                </div>
              </label>

              <label className="campaign-form-field campaign-form-field--full">
                <span>Service description</span>
                <textarea
                  required
                  rows="4"
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
                  value={form.instructions}
                  onChange={(event) =>
                    updateField("instructions", event.target.value)
                  }
                  placeholder="Add the default instructions earners should follow..."
                />
              </label>
            </div>
          </section>

          <aside className="campaign-form-side">
            <section className="campaign-price-preview">
              <div className="campaign-price-preview-icon">
                <Calculator size={18} />
              </div>

              <p>Advertiser price preview</p>

              <strong>
                ₦{form.pricePerPerson || "0"}
              </strong>

              <span>
                per approved earner
              </span>

              <div className="campaign-price-note">
                This price will be shown before an advertiser creates a
                campaign using this service.
              </div>
            </section>

            <section className="campaign-form-card campaign-publish-card">
              <h2>Service visibility</h2>

              <p>
                Active services are available to advertisers. Inactive
                services will not appear when advertisers create campaigns.
              </p>

              <label className="campaign-toggle-row">
                <input
                  type="checkbox"
                  checked={form.status === "Active"}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.checked ? "Active" : "Inactive"
                    )
                  }
                />

                <span>
                  <strong>Available to advertisers</strong>
                  <small>
                    Allow this service to be selected.
                  </small>
                </span>
              </label>
            </section>
          </aside>

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
            >
              Save service
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}