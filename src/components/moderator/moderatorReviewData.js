export const moderatorReviews = [
  {
    id: "proof-1",
    initials: "CO",
    earnerName: "Chinedu Okafor",
    taskTitle: "Follow @PayWithFin on Instagram",
    category: "Social task",
    advertiser: "PayWithFin",
    campaign: "Financial awareness",
    amount: "₦10",
    submittedAt: "3 minutes ago",
    priority: "High",
    status: "Pending",
    description:
      "Follow the PayWithFin Instagram account and submit a screenshot showing that the account has been followed.",
    submittedResponse:
      "I followed the PayWithFin Instagram account and attached the confirmation screenshot.",
    instructions: [
      "Open the PayWithFin Instagram profile.",
      "Follow the account.",
      "Take a screenshot showing the account is followed.",
      "Upload the screenshot as proof.",
    ],
    proofLinks: [
      {
        label: "Open Instagram profile",
        url: "https://www.instagram.com/",
      },
      {
        label: "Open campaign instructions",
        url: "#campaign-instructions",
      },
    ],
    proofImages: [
      {
        label: "Instagram follow screenshot",
        url: "https://placehold.co/760x470/eaf7ed/24713d?text=Instagram+Follow+Screenshot",
      },
    ],
  },
  {
    id: "proof-2",
    initials: "AB",
    earnerName: "Aisha Bello",
    taskTitle: "Answer a 6-question data plan survey",
    category: "Survey",
    advertiser: "SwiftTel",
    campaign: "SwiftTel Customer Survey",
    amount: "₦25",
    submittedAt: "8 minutes ago",
    priority: "Normal",
    status: "Pending",
    description:
      "Answer all six questions about your current mobile data plan and submit the completion screen.",
    submittedResponse:
      "All six questions were answered. The final confirmation screen is attached.",
    instructions: [
      "Answer every question in the survey.",
      "Use honest and relevant answers.",
      "Complete the survey confirmation screen.",
      "Upload the final confirmation screenshot.",
    ],
    proofLinks: [
      {
        label: "Open survey campaign",
        url: "#survey-campaign",
      },
    ],
    proofImages: [
      {
        label: "Survey completion screenshot",
        url: "https://placehold.co/760x470/f0f6fc/315d87?text=Survey+Completion+Screenshot",
      },
      {
        label: "Survey confirmation screenshot",
        url: "https://placehold.co/760x470/f8f2ff/69449a?text=Survey+Confirmation",
      },
    ],
  },
  {
    id: "proof-3",
    initials: "TA",
    earnerName: "Tunde Adeyemi",
    taskTitle: "Install the Bloom Savings app and open it",
    category: "App task",
    advertiser: "Bloom Savings",
    campaign: "Bloom App Activation",
    amount: "₦20",
    submittedAt: "14 minutes ago",
    priority: "Normal",
    status: "Pending",
    description:
      "Install the Bloom Savings mobile application and open it successfully.",
    submittedResponse:
      "The app was installed and opened successfully.",
    instructions: [
      "Install the Bloom Savings app.",
      "Open the application after installation.",
      "Make sure the app name is visible in the submitted proof.",
      "Upload a clear screenshot.",
    ],
    proofLinks: [
      {
        label: "Open advertiser landing page",
        url: "#bloom-savings",
      },
    ],
    proofImages: [
      {
        label: "Bloom Savings app screenshot",
        url: "https://placehold.co/760x470/f8f5ea/866923?text=Bloom+Savings+App",
      },
    ],
  },
  {
    id: "proof-4",
    initials: "GE",
    earnerName: "Grace Effiong",
    taskTitle: "Retweet and comment on a launch post",
    category: "Social task",
    advertiser: "TecoTask Launch",
    campaign: "Product Launch Campaign",
    amount: "₦15",
    submittedAt: "18 minutes ago",
    priority: "Normal",
    status: "Pending",
    description:
      "Retweet the campaign launch post and leave a relevant comment.",
    submittedResponse:
      "The launch post was retweeted and a comment was added.",
    instructions: [
      "Open the campaign launch post.",
      "Retweet the post.",
      "Add a relevant comment.",
      "Submit screenshots showing both actions.",
    ],
    proofLinks: [
      {
        label: "Open launch post",
        url: "https://x.com/",
      },
    ],
    proofImages: [
      {
        label: "Retweet screenshot",
        url: "https://placehold.co/760x470/eaf2fb/315d87?text=Retweet+Screenshot",
      },
    ],
  },
  {
    id: "proof-5",
    initials: "BN",
    earnerName: "Bola Nwosu",
    taskTitle: "Write a Google review for Mama Chi Kitchen",
    category: "Review task",
    advertiser: "Mama Chi Kitchen",
    campaign: "Local Business Reviews",
    amount: "₦30",
    submittedAt: "24 minutes ago",
    priority: "Normal",
    status: "Pending",
    description:
      "Write and publish a genuine review for Mama Chi Kitchen on Google.",
    submittedResponse:
      "The review has been published on the business listing.",
    instructions: [
      "Open the Mama Chi Kitchen business listing.",
      "Write an honest and relevant review.",
      "Publish the review.",
      "Submit a screenshot showing the published review.",
    ],
    proofLinks: [
      {
        label: "Open business listing",
        url: "https://www.google.com/maps",
      },
    ],
    proofImages: [
      {
        label: "Google review screenshot",
        url: "https://placehold.co/760x470/f5f1e9/765d2a?text=Google+Review+Screenshot",
      },
    ],
  },
  {
    id: "proof-6",
    initials: "SO",
    earnerName: "Seyi Oladipo",
    taskTitle: "Verify the opening hours of a nearby store",
    category: "Verification",
    advertiser: "MarketSquare",
    campaign: "Store Information Verification",
    amount: "₦18",
    submittedAt: "31 minutes ago",
    priority: "High",
    status: "Pending",
    description:
      "Visit the listed store page and confirm that the displayed opening hours are accurate.",
    submittedResponse:
      "The store information was checked and the opening hours were confirmed.",
    instructions: [
      "Open the store listing.",
      "Check the displayed opening hours.",
      "Compare the information with the task instructions.",
      "Submit a screenshot of the verified listing.",
    ],
    proofLinks: [
      {
        label: "Open store listing",
        url: "https://www.google.com/maps",
      },
    ],
    proofImages: [
      {
        label: "Store hours screenshot",
        url: "https://placehold.co/760x470/edf7f0/34724a?text=Store+Hours+Screenshot",
      },
    ],
  },
];

export const DECISIONS_STORAGE_KEY =
  "tecotask_moderator_review_decisions";

export function getModeratorDecisions() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(DECISIONS_STORAGE_KEY) || "{}"
    );
  } catch {
    return {};
  }
}

export function saveModeratorDecision(reviewId, decision) {
  const decisions = getModeratorDecisions();

  const updatedDecisions = {
    ...decisions,
    [reviewId]: decision,
  };

  window.localStorage.setItem(
    DECISIONS_STORAGE_KEY,
    JSON.stringify(updatedDecisions)
  );

  return updatedDecisions;
}