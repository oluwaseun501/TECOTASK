const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const AUTH_TIMEOUT_MS = 60_000;
const AUTH_MAX_ATTEMPTS = 2;
const AUTH_RETRY_DELAY_MS = 1500;

const RETRYABLE_AUTH_STATUS_CODES = new Set([
  408,
  500,
  502,
  503,
  504,
]);

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function request(
  path,
  { method = "GET", body, token, timeoutMs = 15000 } = {},
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

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
      const error = new Error(
        data.message || `Request failed (${response.status}).`,
      );

      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      const retryError = new Error(
        "The server took too long to respond. Please try again.",
      );
      retryError.retryable = true;
      throw retryError;
    }

    if (error instanceof TypeError) {
      const retryError = new Error(
        `Could not reach the API server at ${API_URL}. Check that it is running and the API URL is correct.`,
      );
      retryError.retryable = true;
      throw retryError;
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function requestAuthWithRetry(path, options = {}) {
  for (let attempt = 1; attempt <= AUTH_MAX_ATTEMPTS; attempt += 1) {
    try {
      return await request(path, {
        ...options,
        timeoutMs: AUTH_TIMEOUT_MS,
      });
    } catch (error) {
      const isRetryable =
        error?.retryable === true ||
        RETRYABLE_AUTH_STATUS_CODES.has(error?.status);

      if (!isRetryable || attempt === AUTH_MAX_ATTEMPTS) {
        throw error;
      }

      await wait(AUTH_RETRY_DELAY_MS);
    }
  }
}


export const authApi = {
 register: async (details) => {
  // This safe GET wakes the backend; retry it if Render is starting up.
  await requestAuthWithRetry("/api/health");

  // Send account creation only once, after the backend is responsive.
  return request("/api/auth/register", {
    method: "POST",
    body: details,
    timeoutMs: AUTH_TIMEOUT_MS,
  });
},

  login: async (details) => {
    // Wake the API first, matching the existing signup flow.
    await requestAuthWithRetry("/api/health");

    // Keep the retry for temporary failures during the login request.
    return requestAuthWithRetry("/api/auth/login", {
      method: "POST",
      body: details,
    });
  },
  

google: (credential) =>
  requestAuthWithRetry("/api/auth/google", {
    method: "POST",
    body: { credential },
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