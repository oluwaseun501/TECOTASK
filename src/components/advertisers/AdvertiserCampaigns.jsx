import "../../styles/AdvertiserCampaigns.css";

const campaigns = [
  {
    id: 1,
    title: "Instagram",
    type: "Social Media",
    status: "In review",
    statusClass: "review",
    created: "09 Sep 2026",
    budgetUsed: "₦0",
    budgetTotal: "₦8,000",
    filled: "0 of 400 slots filled",
    progress: 0,
  },
  {
    id: 2,
    title: "Instagram community push",
    type: "Social Media",
    status: "Active",
    statusClass: "active",
    created: "12 Sep 2026",
    budgetUsed: "₦3,260",
    budgetTotal: "₦5,000",
    filled: "130 of 250 slots filled",
    progress: 63,
  },
  {
    id: 3,
    title: "Bloom savings install drive",
    type: "App install",
    status: "Active",
    statusClass: "active",
    created: "10 Sep 2026",
    budgetUsed: "₦3,750",
    budgetTotal: "₦5,000",
    filled: "188 of 250 slots filled",
    progress: 75,
  },
  {
    id: 4,
    title: "Data plan habits survey",
    type: "Survey",
    status: "Paused",
    statusClass: "paused",
    created: "02 Sep 2026",
    budgetUsed: "₦6,425",
    budgetTotal: "₦10,000",
    filled: "257 of 400 slots filled",
    progress: 64,
  },
  {
    id: 5,
    title: "Mama Chi kitchen reviews",
    type: "Review",
    status: "Completed",
    statusClass: "completed",
    created: "21 Aug 2026",
    budgetUsed: "₦4,500",
    budgetTotal: "₦4,500",
    filled: "150 of 150 slots filled",
    progress: 100,
  },
];

const AdvertiserCampaigns = () => {
  return (
    <section className="advertiser-campaigns">
      <section className="advertiser-stat-grid">
        <article className="advertiser-stat-card advertiser-stat-card--green">
          <span>Wallet balance</span>
          <strong>₦54,580</strong>
          <small>Available for campaigns</small>
        </article>

        <article className="advertiser-stat-card">
          <span>Verified actions</span>
          <strong>911</strong>
          <small>All approved task actions</small>
        </article>

        <article className="advertiser-stat-card">
          <span>Average cost per action</span>
          <strong>₦20</strong>
          <small>Across all campaigns</small>
        </article>
      </section>

      <div className="advertiser-campaigns__grid">
        <section className="advertiser-campaign-list">
          <div className="advertiser-section-heading">
            <div>
              <h2>Your campaigns</h2>
              <p>
                Fill rate updates live as moderators approve submissions.
              </p>
            </div>

            <span>{campaigns.length} total</span>
          </div>

          <div className="advertiser-campaign-items">
            {campaigns.map((campaign) => (
              <article
                className="advertiser-campaign-card"
                key={campaign.id}
              >
                <div className="advertiser-campaign-card__top">
                  <div className="advertiser-campaign-card__title">
                    <h3>{campaign.title}</h3>

                    <span
                      className={`advertiser-campaign-status ${campaign.statusClass}`}
                    >
                      {campaign.status}
                    </span>
                  </div>

                  <div className="advertiser-campaign-card__budget">
                    <strong>
                      {campaign.budgetUsed}{" "}
                      <small>/ {campaign.budgetTotal}</small>
                    </strong>

                    <span>Budget used</span>
                  </div>
                </div>

                <p className="advertiser-campaign-card__meta">
                  {campaign.type} · Created {campaign.created}
                </p>

                <div className="advertiser-campaign-card__progress-row">
                  <span>{campaign.filled}</span>
                  <strong>{campaign.progress}%</strong>
                </div>

                <div className="advertiser-campaign-card__progress">
                  <span
                    style={{
                      width: `${campaign.progress}%`,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
};

export default AdvertiserCampaigns;