const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
async function request(
  path,
  { method = "GET", body, token, timeoutMs = 15000 } = {},
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
    

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        ...(body && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body
        ? { body: isFormData ? body : JSON.stringify(body) }
        : {}),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed (${response.status}).`);
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The server took too long to respond. Please try again.");
    }

    if (error instanceof TypeError) {
      throw new Error(
        `Could not reach the API server at ${API_URL}. Check that it is running and the API URL is correct.`,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}


export const authApi = {
  register: (details) =>
    request("/api/auth/register", {
      method: "POST",
      body: details,
    }),

  login: (details) =>
    request("/api/auth/login", {
      method: "POST",
      body: details,
    }),

  google: (credential) =>
    request("/api/auth/google", {
      method: "POST",
      body: {
        credential,
      },
    }),

  chooseRole: (role, token) =>
    request("/api/auth/role", {
      method: "PATCH",
      body: {
        role,
      },
      token,
    }),

  getEarnerDashboard: (token) =>
    request("/api/earner/dashboard", {
      token,
    }),

    uploadEarnerProofImage: (submissionId, file, token) => {
  const formData = new FormData();
  formData.append("image", file);

  return request(
    `/api/uploads/earner/submissions/${encodeURIComponent(submissionId)}/proof-image`,
    {
      method: "POST",
      body: formData,
      token,
      timeoutMs: 60000,
    },
  );
},



    startEarnerTask: (taskId, token) =>
  request(
    `/api/earner/tasks/${encodeURIComponent(taskId)}/start`,
    {
      method: "POST",
      token,
    },
  ),

submitEarnerProof: (submissionId, details, token) =>
  request(
    `/api/earner/submissions/${encodeURIComponent(submissionId)}/submit`,
    {
      method: "POST",
      body: details,
      token,
    },
  ),

    getCurrentUser: (token) =>
  request("/api/users/me", {
    token,
  }),

  getEarnerReferrals: (token) =>
  request("/api/referrals", {
    token,
  }),

  getEarnerWallet: (token) =>
  request("/api/earner/wallet", {
    token,
  }),

  getSettings: (token) =>
  request("/api/settings", { token }),

updatePassword: (details, token) =>
  request("/api/settings/password", {
    method: "PATCH",
    body: details,
    token,
  }),

savePayoutAccount: (details, token) =>
  request("/api/earner/wallet/payout-account", {
    method: "PUT",
    body: details,
    token,
  }),

requestWithdrawal: (amount, token) =>
  request("/api/earner/wallet/withdrawals", {
    method: "POST",
    body: {
      amount,
    },
    token,
  }),

  getAdvertiserDashboard: (token) =>
  request("/api/advertiser/dashboard", {
    token,
  }),

getAdvertiserServices: (token) =>
  request("/api/services", {
    token,
  }),

createAdvertiserCampaign: (details, token) =>
  request("/api/advertiser/campaigns", {
    method: "POST",
    body: details,
    token,
  }),

updateAdvertiserCampaign: (campaignId, details, token) =>
  request(
    `/api/advertiser/campaigns/${encodeURIComponent(campaignId)}`,
    {
      method: "PATCH",
      body: details,
      token,
    },
  ),

  uploadAdvertiserGuideImage: (campaignId, file, token) => {
  const formData = new FormData();
  formData.append("image", file);

  return request(
    `/api/uploads/advertiser/campaigns/${encodeURIComponent(campaignId)}/guide-image`,
    {
      method: "POST",
      body: formData,
      token,
    },
  );
},

submitAdvertiserCampaign: (campaignId, token) =>
  request(
    `/api/advertiser/campaigns/${encodeURIComponent(campaignId)}/submit`,
    {
      method: "POST",
      token,
    },
  ),

  getAdvertiserWallet: (token) =>
  request("/api/advertiser/wallet", {
    token,
  }),

getAdvertiserTransactions: (page, limit, token) =>
  request(
    `/api/advertiser/wallet/transactions?page=${page}&limit=${limit}`,
    { token },
  ),

getAdvertiserTransaction: (transactionId, token) =>
  request(
    `/api/advertiser/wallet/transactions/${encodeURIComponent(transactionId)}`,
    { token },
  ),

  getAdvertiserDashboard: (token) =>
  request("/api/advertiser/dashboard", {
    token,
  }),
    getAdminOverview: (range, token) =>
    request(
      `/api/admin/overview?range=${encodeURIComponent(range)}`,
      { token },
    ),

    getModeratorReviewQueue: (page = 1, limit = 100, token) =>
  request(
    `/api/moderator/reviews?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`,
    { token },
  ),

  getModeratorReview: (submissionId, token) =>
  request(
    `/api/moderator/reviews/${encodeURIComponent(submissionId)}`,
    { token },
  ),

getModeratorRejectionReasons: (token) =>
  request("/api/moderator/reviews/rejection-reasons", {
    token,
  }),

approveModeratorReview: (submissionId, token) =>
  request(
    `/api/moderator/reviews/${encodeURIComponent(submissionId)}/approve`,
    {
      method: "POST",
      token,
    },
  ),

rejectModeratorReview: (submissionId, details, token) =>
  request(
    `/api/moderator/reviews/${encodeURIComponent(submissionId)}/reject`,
    {
      method: "POST",
      body: details,
      token,
    },
  ),

  getModeratorWallet: (token) =>
  request("/api/moderator/wallet", { token }),

getModeratorWithdrawals: (token) =>
  request("/api/moderator/withdrawals", { token }),

saveModeratorPayoutAccount: (details, token) =>
  request("/api/moderator/wallet/payout-account", {
    method: "PUT",
    body: details,
    token,
  }),

requestModeratorWithdrawal: (amount, token) =>
  request("/api/moderator/withdrawals", {
    method: "POST",
    body: { amount },
    token,
  }),

  startAdvertiserWalletTopUp: (amount, token) =>
  request("/api/advertiser/wallet/top-ups/initialize", {
    method: "POST",
    body: { amount },
    token,
  }),

getAdvertiserWalletTopUpStatus: (reference, token) =>
  request(
    `/api/advertiser/wallet/top-ups/${encodeURIComponent(reference)}/status`,
    { token },
  ),

  startEarnerActivation: (token) =>
  request("/api/earner/activation/initialize", {
    method: "POST",
    token,
  }),

getEarnerActivationStatus: (reference, token) =>
  request(
    `/api/earner/activation/${encodeURIComponent(reference)}/status`,
    { token },
  ),
};