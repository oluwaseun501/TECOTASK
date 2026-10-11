import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authApi } from "../../services/auth.js";

function getStoredValue(key) {
  return sessionStorage.getItem(key) || localStorage.getItem(key);
}

function getCachedUser() {
  try {
    const savedUser = getStoredValue("tecotaskUser");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function clearStoredAuth() {
  for (const storage of [sessionStorage, localStorage]) {
    storage.removeItem("tecotaskToken");
    storage.removeItem("tecotaskUser");
  }
}

const RequireRole = ({ allowedRoles }) => {
  const rolesKey = allowedRoles.join("|");

  const [status, setStatus] = useState(() => {
    const cachedUser = getCachedUser();

    if (!cachedUser) return "loading";
    if (cachedUser.role === "pending") return "pending";
    if (allowedRoles.includes(cachedUser.role)) return "allowed";

    return "loading";
  });

  useEffect(() => {
    let isMounted = true;

    async function checkUserRole() {
      const token = getStoredValue("tecotaskToken");

      if (!token) {
        if (isMounted) setStatus("unauthenticated");
        return;
      }

      try {
        const data = await authApi.getCurrentUser(token);
        const currentUser = data.user;
        const roles = rolesKey.split("|");

        sessionStorage.setItem(
          "tecotaskUser",
          JSON.stringify(currentUser),
        );

        if (!isMounted) return;

        if (currentUser.role === "pending") {
          setStatus("pending");
        } else if (roles.includes(currentUser.role)) {
          setStatus("allowed");
        } else {
          setStatus("wrong-role");
        }
      } catch {
        clearStoredAuth();

        if (isMounted) setStatus("unauthenticated");
      }
    }

    checkUserRole();

    return () => {
      isMounted = false;
    };
  }, [rolesKey]);

  if (status === "loading") {
    return (
      <div className="route-auth-loading" aria-live="polite">
        <div className="route-auth-loading__card">
          <span className="route-auth-loading__spinner" />
          <strong>Opening your workspace</strong>
          <small>Checking your account securely</small>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  if (status === "pending") {
    return <Navigate to="/choose-role" replace />;
  }

  if (status === "wrong-role") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireRole;