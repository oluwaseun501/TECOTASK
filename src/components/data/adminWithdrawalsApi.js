const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function getAuthToken() {
  return (
    sessionStorage.getItem("tecotaskToken") ||
    localStorage.getItem("tecotaskToken")
  );
}

async function request(path, { method = "GET", body } = {}) {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

async function fetchAllPages(path) {
  const first = await request(`${path}?page=1&limit=100`);
  const rows = [...(first.withdrawals || [])];
  const totalPages = first.pagination?.totalPages || 1;

  for (let start = 2; start <= totalPages; start += 4) {
    const pages = [];

    for (
      let page = start;
      page < Math.min(start + 4, totalPages + 1);
      page += 1
    ) {
      pages.push(request(`${path}?page=${page}&limit=100`));
    }

    const results = await Promise.all(pages);
    results.forEach((result) => {
      rows.push(...(result.withdrawals || []));
    });
  }

  return rows;
}

export async function getAdminWithdrawals() {
  const [earners, moderators] = await Promise.all([
    fetchAllPages("/api/admin/earner-withdrawals"),
    fetchAllPages("/api/admin/moderator-withdrawals"),
  ]);

  const normalize = (item, role) => {
    const person =
      role === "Earner" ? item.earner : item.moderator;
    const account = item.payoutAccount || {};

    return {
      ...item,
      id: String(item.id),
      requester: person?.fullName || "Unknown requester",
      email: person?.email || "",
      role,
      amount: Number(item.amount || 0),
      method: account.bankName || "Bank transfer",
      account: [
        account.accountName,
        account.accountNumberMasked,
      ]
        .filter(Boolean)
        .join(" · "),
      requestedAt: item.createdAt,
      status: String(item.status || "pending").toLowerCase(),
      note: item.reviewNote || "",
    };
  };

  return [
    ...earners.map((item) => normalize(item, "Earner")),
    ...moderators.map((item) => normalize(item, "Moderator")),
  ].sort(
    (a, b) =>
      new Date(b.requestedAt) - new Date(a.requestedAt),
  );
}

export async function updateAdminWithdrawal(
  withdrawal,
  action,
  body = {},
) {
  const rolePath =
    withdrawal.role === "Earner"
      ? "/api/admin/earner-withdrawals"
      : "/api/admin/moderator-withdrawals";

  return request(
    `${rolePath}/${encodeURIComponent(withdrawal.id)}/${action}`,
    {
      method: "POST",
      body,
    },
  );
}