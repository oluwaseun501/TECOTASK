import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";;
import EarnersSidebar from "./EarnersSidebar";
import EarnersTopBar from "./EarnersTopBar";
import EarnersBottomNav from "./EarnersBottomNav";
import { authApi } from "../../services/auth.js";
import "../../styles/EarnersLayout.css";

const EarnersLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dashboard, setDashboard] = useState(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

useEffect(() => {
  let isMounted = true;

  async function loadDashboardHeader() {
    const token = sessionStorage.getItem("tecotaskToken");

    if (!token) {
      if (isMounted) {
        setDashboardError("Your session has expired. Please sign in again.");
        setIsDashboardLoading(false);
      }

      navigate("/login", { replace: true });
      return;
    }

    try {
      const data = await authApi.getEarnerDashboard(token);

      if (!isMounted) return;

      setDashboard(data);
      setDashboardError("");
      setIsDashboardLoading(false);

      // Load the wallet separately so it doesn't hold up the dashboard.
      try {
        const walletData = await authApi.getEarnerWallet(token);

        if (!isMounted) return;

        const walletBalance = walletData.summary?.availableBalance;

        if (walletBalance != null) {
          setDashboard((current) =>
            current
              ? {
                  ...current,
                  stats: {
                    ...current.stats,
                    walletBalance,
                  },
                }
              : current,
          );
        }
      } catch (walletError) {
        console.error(
          "Could not load earner wallet balance:",
          walletError.message,
        );
      }
    } catch (error) {
      if (!isMounted) return;

      setDashboardError(
        error.message || "Could not load your earner dashboard.",
      );
    } finally {
      if (isMounted) {
        setIsDashboardLoading(false);
      }
    }
  }

  void loadDashboardHeader();

  return () => {
    isMounted = false;
  };
}, [navigate]);

useEffect(() => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  window.scrollTo({
    top: 0,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}, [location.pathname]);


  return (
    <div className="earner-layout">
      <EarnersSidebar user={dashboard?.user} />

      <div className="earner-layout__main">
       <EarnersTopBar
  user={dashboard?.user}
  stats={dashboard?.stats}
  openTaskCount={dashboard?.taskQueue?.length || 0}
  isActivated={dashboard?.user?.isActivated === true}
/>
        <main className="earner-layout__content">
          <div
            key={location.pathname}
            className="earner-page-transition"
          >
            <Outlet
  context={{
    dashboard,
    setDashboard,
    isDashboardLoading,
    dashboardError,
  }}
/>
          </div>
        </main>
      </div>

      <EarnersBottomNav />
    </div>
  );
};

export default EarnersLayout;