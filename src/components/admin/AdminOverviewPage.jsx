import AdminOverview from "./AdminOverview.jsx";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

async function fetchAdminOverview(range, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/overview?range=${encodeURIComponent(range)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Could not load the admin overview.");
  }

  return data;
}

export default function AdminOverviewPage() {
  const token =
    sessionStorage.getItem("tecotaskToken") ||
    localStorage.getItem("tecotaskToken");

  return (
    <AdminOverview
      token={token}
      fetchOverview={fetchAdminOverview}
      basePath="/admin"
    />
  );
}