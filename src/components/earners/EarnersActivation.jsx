import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/EarnersActivation.css";

const paymentMethods = [
  {
    id: "card",
    title: "Debit or credit card",
    description: "Pay securely with your bank card.",
    icon: "▣",
  },
  {
    id: "bank",
    title: "Bank transfer",
    description: "Transfer ₦1,200 from your bank app.",
    icon: "↗",
  },
  {
    id: "ussd",
    title: "USSD",
    description: "Pay using your bank's USSD code.",
    icon: "⌁",
  },
];

const banks = ["GTBank", "Access Bank", "Opay", "Kuda", "Palmpay"];

const EarnersActivation = () => {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedBank, setSelectedBank] = useState("GTBank");
  const [paymentStarted, setPaymentStarted] = useState(false);

  const handlePayment = (event) => {
    event.preventDefault();

    // Temporary front-end state.
    // Connect this to your payment provider later.
    setPaymentStarted(true);
  };

  return (
    <main className="activation-page">
      <header className="activation-page__header">
        <Link to="/earners" className="activation-page__brand">
          <span>T</span>
          Teco<span>Task</span>
        </Link>

        <Link to="/earners" className="activation-page__back">
          ← Back to dashboard
        </Link>
      </header>

      <section className="activation-page__content">
        <div className="activation-page__intro">
          <span>Unlock your earner account</span>

          <h1>Activate your account and start earning.</h1>

          <p>
            Pay a one-time activation fee and get access to available tasks,
            proof submissions, withdrawals, and referral rewards.
          </p>

          <div className="activation-benefits">
            <div>
              <span>✓</span>
              <p>
                <strong>Complete tasks</strong>
                Find simple tasks from verified advertisers.
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Submit proof</strong>
                Upload screenshots and track moderation results.
              </p>
            </div>

            <div>
              <span>✓</span>
              <p>
                <strong>Withdraw earnings</strong>
                Receive approved rewards directly to your bank account.
              </p>
            </div>
          </div>
        </div>

        <section className="activation-payment-card">
          {!paymentStarted ? (
            <>
              <div className="activation-payment-card__heading">
                <div>
                  <span>One-time activation</span>
                  <h2>Choose how to pay</h2>
                </div>

                <strong>₦1,200</strong>
              </div>

              <p className="activation-payment-card__note">
                This is a one-time account activation fee. It is not a
                subscription.
              </p>

              <form onSubmit={handlePayment}>
                <div className="activation-methods">
                  {paymentMethods.map((method) => (
                    <button
                      type="button"
                      key={method.id}
                      className={`activation-method ${
                        paymentMethod === method.id ? "is-selected" : ""
                      }`}
                      onClick={() => setPaymentMethod(method.id)}
                    >
                      <span className="activation-method__icon">
                        {method.icon}
                      </span>

                      <span className="activation-method__copy">
                        <strong>{method.title}</strong>
                        <small>{method.description}</small>
                      </span>

                      <span className="activation-method__radio">
                        {paymentMethod === method.id ? "✓" : ""}
                      </span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "bank" && (
                  <div className="activation-bank-select">
                    <label htmlFor="bank">Choose your bank</label>

                    <select
                      id="bank"
                      value={selectedBank}
                      onChange={(event) => setSelectedBank(event.target.value)}
                    >
                      {banks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="activation-pay-button"
                >
                  Pay ₦1,200 and activate
                  <span>→</span>
                </button>

                <small className="activation-secure-note">
                  Your payment is processed securely. Your account activates
                  after payment confirmation.
                </small>
              </form>
            </>
          ) : (
            <div className="activation-payment-pending">
              <div className="activation-payment-pending__icon">✓</div>

              <h2>Payment setup is ready</h2>

              <p>
                The payment provider will be connected here next. Your selected
                method is{" "}
                <strong>
                  {paymentMethod === "bank"
                    ? `${selectedBank} transfer`
                    : paymentMethods.find(
                        (method) => method.id === paymentMethod,
                      )?.title}
                </strong>
                .
              </p>

              <button
                type="button"
                className="activation-pay-button"
                onClick={() => setPaymentStarted(false)}
              >
                Change payment method
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default EarnersActivation;