const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

function getAuthToken() {
  return (
    sessionStorage.getItem("tecotaskToken") ||
    localStorage.getItem("tecotaskToken")
  );
}

async function apiRequest(path, { method = "GET", body } = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
    },
    ...(body !== undefined
      ? { body: JSON.stringify(body) }
      : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "The request failed.");
  }

  return data;
}

async function getAllCampaignPages() {
  const firstPage = await apiRequest(
    "/api/admin/campaigns?page=1&limit=100",
  );

  const campaigns = [...(firstPage.campaigns || [])];
  const totalPages = Math.max(
    Number(firstPage.pagination?.totalPages) || 1,
    1,
  );

  for (let page = 2; page <= totalPages; page += 1) {
    const result = await apiRequest(
      `/api/admin/campaigns?page=${page}&limit=100`,
    );

    campaigns.push(...(result.campaigns || []));
  }

  return campaigns;
}

export async function getAdminCampaigns() {
  return getAllCampaignPages();
}

export async function getAdminCampaign(campaignId) {
  const result = await apiRequest(
    `/api/admin/campaigns/${encodeURIComponent(campaignId)}`,
  );

  return result.campaign;
}

export async function getAdminServices() {
  const result = await apiRequest("/api/services/admin");
  return result.services || [];
}

export async function saveAdminCampaignReviewNotes(
  campaignId,
  notes,
) {
  const result = await apiRequest(
    `/api/admin/campaigns/${encodeURIComponent(campaignId)}/review-notes`,
    {
      method: "PATCH",
      body: notes,
    },
  );

  return result.campaign;
}

export async function approveAdminCampaign(
  campaignId,
  reviewData,
) {
  return apiRequest(
    `/api/admin/campaigns/${encodeURIComponent(campaignId)}/approve`,
    {
      method: "POST",
      body: reviewData,
    },
  );
}

export async function rejectAdminCampaign(
  campaignId,
  reviewData,
) {
  return apiRequest(
    `/api/admin/campaigns/${encodeURIComponent(campaignId)}/reject`,
    {
      method: "POST",
      body: reviewData,
    },
  );
}

export async function updateAdminService(serviceId, updates) {
  const result = await apiRequest(
    `/api/services/${encodeURIComponent(serviceId)}`,
    {
      method: "PATCH",
      body: updates,
    },
  );

  return result.service;
}