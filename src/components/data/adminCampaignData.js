export const serviceTemplates = [
  {
    id: "social-media-engagement",
    name: "Social media engagement",
    category: "Social Media",
    pricePerPerson: 20,
    status: "Active",
    description:
      "Earners complete simple social media engagement tasks.",
    instructions:
      "Follow the provided account, like the specified post, and complete the task carefully.",
  },
  {
    id: "app-install",
    name: "App installation",
    category: "Mobile Apps",
    pricePerPerson: 150,
    status: "Active",
    description:
      "Earners install and open an approved mobile application.",
    instructions:
      "Download the app from the official store, install it, and open it once.",
  },
  {
    id: "survey-completion",
    name: "Survey completion",
    category: "Research",
    pricePerPerson: 100,
    status: "Inactive",
    description:
      "Earners complete a short advertiser survey.",
    instructions:
      "Answer every question honestly and submit the survey after completion.",
  },
];

export const adminCampaigns = [
  {
    id: "brightpath-instagram-push",
    name: "BrightPath Instagram community push",
    advertiser: "BrightPath Agency",
    service: "Social media engagement",
    category: "Social Media",
    rewardPerPerson: 20,
    totalSlots: 250,
    approved: 146,
    pending: 22,
    rejected: 8,
    status: "Pending review",
    created: "Today, 10:24 AM",
    submittedBy: "BrightPath Agency",
    advertiserInstructions:
      "Follow our Instagram account and like the latest campaign post.",
    adminInstructions:
      "Follow the official account, like the latest campaign post, and make sure the account remains followed after completion.",
    totalBudget: 5000,
  },
  {
    id: "paywave-app-install",
    name: "PayWave app installation campaign",
    advertiser: "PayWave Nigeria",
    service: "App installation",
    category: "Mobile Apps",
    rewardPerPerson: 150,
    totalSlots: 100,
    approved: 74,
    pending: 11,
    rejected: 3,
    status: "Published",
    created: "Yesterday, 2:15 PM",
    submittedBy: "PayWave Nigeria",
    advertiserInstructions:
      "Install the PayWave app and open it after installation.",
    adminInstructions:
      "Install the official PayWave app from the approved app store and open it once after installation.",
    totalBudget: 15000,
  },
  {
    id: "greenlife-survey",
    name: "GreenLife customer survey",
    advertiser: "GreenLife Foods",
    service: "Survey completion",
    category: "Research",
    rewardPerPerson: 100,
    totalSlots: 300,
    approved: 0,
    pending: 0,
    rejected: 0,
    status: "Needs changes",
    created: "Jun 03, 2024",
    submittedBy: "GreenLife Foods",
    advertiserInstructions:
      "Complete our survey and send your feedback.",
    adminInstructions: "",
    totalBudget: 30000,
  },
  {
    id: "campaign-tree-social",
    name: "Campaign Tree social awareness",
    advertiser: "Campaign Tree Ltd",
    service: "Social media engagement",
    category: "Social Media",
    rewardPerPerson: 20,
    totalSlots: 500,
    approved: 318,
    pending: 26,
    rejected: 14,
    status: "Paused",
    created: "May 30, 2024",
    submittedBy: "Campaign Tree Ltd",
    advertiserInstructions:
      "Engage with our social media content.",
    adminInstructions:
      "Follow the official page and interact with the specified campaign post.",
    totalBudget: 10000,
  },
];