import { Navigate, Outlet, useLocation } from "react-router-dom";

function getAuthToken() {
  return (
    sessionStorage.getItem("tecotaskToken") ||
    localStorage.getItem("tecotaskToken")
  );
}

const RequireAuth = ({ redirectTo = "/login" }) => {
  const location = useLocation();
  const token = getAuthToken();

  if (!token) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
};

export default RequireAuth;