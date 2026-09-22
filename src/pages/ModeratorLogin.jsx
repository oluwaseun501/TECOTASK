import PrivilegedLogin from "../components/auth/PrivilegedLogin";

export default function ModeratorLogin() {
  return (
    <PrivilegedLogin
      role="Moderator"
      heading="Moderator access"
      description="Sign in to review submissions, manage withdrawals, and monitor task quality."
      dashboardPath="/moderator"
    />
  );
}