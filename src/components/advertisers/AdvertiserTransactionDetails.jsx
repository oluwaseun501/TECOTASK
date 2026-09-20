import { Link, useParams } from "react-router-dom";
import {
  getAdvertiserTransaction,
} from "../data/advertiserTransactions";;
import "../../styles/AdvertiserTransactions.css";

const AdvertiserTransactionDetails = () => {
  const { transactionId } = useParams();
  const transaction = getAdvertiserTransaction(transactionId);

  if (!transaction) {
    return (
      <section className="advertiser-transaction-not-found">
        <h1>Transaction not found</h1>
        <p>This transaction could not be found.</p>

        <Link to="/advertisers/transactions">
          Back to transaction history
        </Link>
      </section>
    );
  }

  return (
    <section className="advertiser-transaction-details-page">
      <Link
        to="/advertisers/transactions"
        className="advertiser-transaction-details-page__back"
      >
        ← Back to transaction history
      </Link>

      <section className="advertiser-transaction-detail-card">
        <div className="advertiser-transaction-detail-card__top">
          <div>
            <span className="advertiser-transaction-detail-card__eyebrow">
              Transaction details
            </span>

            <h1>{transaction.title}</h1>

            <p>{transaction.description}</p>
          </div>

          <span
            className={`advertiser-transaction-detail-card__icon ${transaction.type}`}
          >
            {transaction.icon}
          </span>
        </div>

        <div className="advertiser-transaction-detail-card__amount">
          <span>Transaction amount</span>
          <strong className={transaction.type}>
            {transaction.amount}
          </strong>

          <small>{transaction.status}</small>
        </div>

        <div className="advertiser-transaction-detail-card__info">
          <div>
            <span>Date</span>
            <strong>{transaction.date}</strong>
          </div>

          <div>
            <span>Time</span>
            <strong>{transaction.time}</strong>
          </div>

          <div>
            <span>Category</span>
            <strong>{transaction.category}</strong>
          </div>

          <div>
            <span>Payment method</span>
            <strong>{transaction.method}</strong>
          </div>

          <div>
            <span>Reference</span>
            <strong>{transaction.reference}</strong>
          </div>

          <div>
            <span>Status</span>
            <strong className="is-successful">
              {transaction.status}
            </strong>
          </div>
        </div>

        <div className="advertiser-transaction-detail-card__footer">
          <span>Need help with this transaction?</span>

          <Link to="/support">Contact support</Link>
        </div>
      </section>
    </section>
  );
};

export default AdvertiserTransactionDetails;