import { useEffect, useState } from "react";
import { authApi } from "../../services/auth.js";
import "../../styles/AdvertiserSettings.css";
import "../../styles/AdvertiserDeveloperHub.css";

const apiEndpoint = `${(
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "")}/api/v2`;

const actions = [
  ["services", "List available service IDs, quantity limits, and NGN rates per 1,000."],
  ["balance", "Check your available advertiser wallet balance in NGN."],
  ["add", "Place an order with a service ID, a target link, and a quantity."],
  ["status", "Check one order with order or up to 100 with comma-separated orders."],
  ["cancel", "Cancel one or more orders and return unused funds to your wallet."],
];

const example = [
  `curl -X POST '${apiEndpoint}' \\`,
  "  --data-urlencode 'key=YOUR_API_KEY' \\",
  "  --data-urlencode 'action=add' \\",
  "  --data-urlencode 'service=1' \\",
  "  --data-urlencode 'link=https://example.com/target' \\",
  "  --data-urlencode 'quantity=50'",
].join("\n");

function getToken() {
  return sessionStorage.getItem("tecotaskToken") ||
    localStorage.getItem("tecotaskToken");
}

export default function AdvertiserDeveloperHub() {
  const [createdAt, setCreatedAt] = useState(undefined);
  const [secret, setSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadKey() {
      try {
        const result = await authApi.getAdvertiserApiKey(getToken());
        if (mounted) setCreatedAt(result.createdAt);
      } catch (requestError) {
        if (mounted) setError(requestError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadKey();
    return () => { mounted = false; };
  }, []);

  async function changeKey(revoke = false) {
    if (createdAt && !window.confirm(
      revoke
        ? "Revoke this key? Connected panels will lose access immediately."
        : "Replace this key? Connected panels will need the new key.",
    )) return;

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = revoke
        ? await authApi.revokeAdvertiserApiKey(getToken())
        : await authApi.generateAdvertiserApiKey(getToken());

      setSecret(result.key || "");
      setCreatedAt(result.createdAt);
      setNotice(revoke ? "API key revoked." : "API key generated.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  async function copy(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied.`);
    } catch {
      setNotice("Select the text and copy it manually.");
    }
  }

  return (
    <section className="advertiser-settings developer-hub">
      <header className="advertiser-settings__heading">
        <span>Advertiser integrations</span>
        <h1>Developer Hub</h1>
        <p>Connect an SMM panel or place orders from your own software.</p>
      </header>

      {error && <p role="alert">{error}</p>}
      <p role="status">{notice}</p>

      <section className="advertiser-account-card developer-hub__card">
        <h2>API access</h2>
        <p>Send POST requests to this endpoint using JSON or form data.</p>
        <div className="developer-hub__copy">
          <code>{apiEndpoint}</code>
          <button type="button" onClick={() => copy(apiEndpoint, "Endpoint")}>Copy URL</button>
        </div>

        <h3>API key</h3>
        <p>
          {loading
            ? "Checking API key…"
            : createdAt
              ? `Active key created ${new Date(createdAt).toLocaleDateString("en-NG")}.`
              : createdAt === null
                ? "Generate a key to connect your panel."
                : "API key status is unavailable. Reload to try again."}
        </p>
        <div className="developer-hub__actions">
          <button
            type="button"
            disabled={createdAt === undefined || busy}
            onClick={() => changeKey()}
          >
            {createdAt ? "Replace key" : "Generate key"}
          </button>
          {createdAt && (
            <button type="button" disabled={busy} onClick={() => changeKey(true)}>
              Revoke key
            </button>
          )}
        </div>

        {secret && (
          <>
            <p>Copy this key now. It is shown only when generated.</p>
            <div className="developer-hub__copy">
              <code>{secret}</code>
              <button type="button" onClick={() => copy(secret, "API key")}>Copy key</button>
            </div>
          </>
        )}
      </section>

      <section className="advertiser-account-card developer-hub__card">
        <h2>Place an order</h2>
        <p>
          Add funds to your advertiser wallet and use the services action to find
          a service ID. Orders reserve their budget and enter admin review before
          earners can start the task.
        </p>
        <pre><code>{example}</code></pre>
        <p>A successful request returns an order ID, such as <code>{'{"order": 123}'}</code>.</p>
        <p>
          For safe retries from custom software, send a unique <code>Idempotency-Key</code>
          {" "}header and reuse it when retrying the same order.
        </p>

        <h3>Custom comment orders</h3>
        <p>
          For <strong>Custom Comments</strong> services, send <code>comments</code> with
          one unique comment per line and a matching <code>quantity</code>. For
          <strong> Custom Comments Package</strong>, leave out <code>quantity</code>
          {" "}and the API counts the comments. For <strong>Comment Replies</strong>,
          include the <code>username</code> to reply to and a matching quantity.
        </p>

        <h3>Available actions</h3>
        <dl>
          {actions.map(([action, description]) => (
            <div key={action}>
              <dt><code>{action}</code></dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </section>
    </section>
  );
}
