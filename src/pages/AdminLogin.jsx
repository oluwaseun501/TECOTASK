import PrivilegedLogin from "../components/auth/PrivilegedLogin";

export default function AdminLogin() {
  return (
    <PrivilegedLogin
      role="Admin"
      heading="Admin access"
      description="Sign in to manage the TecoTask platform, users, and operations."
      dashboardPath="/admin"
    />
  );
}