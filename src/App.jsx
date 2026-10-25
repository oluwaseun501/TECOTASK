import { useEffect, useRef } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustBar from "./components/TrustBar";
import HowItWorks from "./components/HowItWorks";
import Tasks from "./components/Tasks";
import WhatWeDo from "./components/WhatWeDo";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

import Signup from "./pages/Signup";
import ChooseRole from "./pages/ChooseRole";
import Login from "./pages/Login";
import ForgotPassword from "./components/ForgotPassword";

import RequireAuth from "./components/auth/RequireAuth";
import RequireRole from "./components/auth/RequireRole";
import LegalPage from "./pages/LegalPage";
import { getWhatsAppSupportUrl } from "./config/support.js";

/* Earner workspace */
import EarnersLayout from "./components/earners/EarnersLayout";
import EarnersDashboard from "./components/earners/EarnersDashboard";
import EarnersSettings from "./components/earners/EarnersSettings";
import EarnersWallet from "./components/earners/EarnersWallet";
import EarnersReferrals from "./components/earners/EarnersReferrals";
import EarnersActivation from "./components/earners/EarnersActivation";
import EarnerTaskDetails from "./components/earners/EarnerTaskDetails";
import EarnerActivationThankYou from "./components/earners/EarnerActivationThankYou";

/* Advertiser workspace */
import AdvertisersLayout from "./components/advertisers/AdvertisersLayout";
import AdvertiserCampaigns from "./components/advertisers/AdvertiserCampaigns";
import AdvertiserWallet from "./components/advertisers/AdvertiserWallet";
import AdvertiserTransactions from "./components/advertisers/AdvertiserTransactions";
import AdvertiserTransactionDetails from "./components/advertisers/AdvertiserTransactionDetails";
import AdvertiserReferrals from "./components/advertisers/AdvertiserReferrals";
import AdvertiserSettings from "./components/advertisers/AdvertiserSettings";
import AdvertiserCreateCampaign from "./components/advertisers/AdvertiserCreateCampaign";
import AdvertiserPaymentThankYou from "./components/advertisers/AdvertiserPaymentThankYou";

/* Admin workspace */
import AdminDashboard from "./components/admin/AdminDashboard.jsx";
import AdminUsers from "./components/admin/AdminUsers.jsx";
import AdminUserDetails from "./components/admin/AdminUserDetails.jsx";
import AdminOverview from "./components/admin/AdminOverview.jsx";
import AdminCampaigns from "./components/admin/AdminCampaigns.jsx";
import AdminServiceSetup from "./components/admin/AdminServiceSetup.jsx";
import AdminCampaignDetails from "./components/admin/AdminCampaignDetails.jsx";
import AdminTransactions from "./components/admin/AdminTransactions.jsx";
import AdminWithdrawals from "./components/admin/AdminWithdrawals.jsx";
import AdminModeration from "./components/admin/AdminModeration.jsx";
import AdminSettings from "./components/admin/AdminSettings.jsx";
import AdminOverviewPage from "./components/admin/AdminOverviewPage.jsx";

/* Moderator workspace */
import ModeratorDashboard from "./components/moderator/ModeratorDashboard.jsx";
import ModeratorOverview from "./components/moderator/ModeratorOverview.jsx";
import ModeratorReviewQueue from "./components/moderator/ModeratorReviewQueue.jsx";
import ModeratorReviewDetails from "./components/moderator/ModeratorReviewDetails.jsx";
import ModeratorWithdrawals from "./components/moderator/ModeratorWithdrawals.jsx";
import ModeratorInstructions from "./components/moderator/ModeratorInstructions.jsx";
import ModeratorSettings from "./components/moderator/ModeratorSettings.jsx";

/* Staff login pages */
import AdminLogin from "./pages/AdminLogin";
import ModeratorLogin from "./pages/ModeratorLogin";

import SupportWidget from "./components/SupportWidget";

import MarketplacePage from "./pages/MarketplacePage";
import MarketplacePostManager from "./components/marketplace/MarketplacePostManager";
import AdminMarketplacePosts from "./components/admin/AdminMarketplacePosts.jsx";

const Home = () => {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <Tasks />
        <WhatWeDo />
        <FAQ />
      </main>

      <Footer />
    </>
  );
};

const SupportRedirect = () => {
  const supportUrl = getWhatsAppSupportUrl();

  useEffect(() => {
    window.location.replace(supportUrl);
  }, [supportUrl]);

  return (
    <main className="legal-page">
      <div className="legal-page__container">
        <h1>Contact TecoTask support</h1>
        <p className="legal-page__intro">
          Opening WhatsApp. If it does not open, use the link below.
        </p>
        <a
          className="legal-page__contact-link"
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open WhatsApp
        </a>
      </div>
    </main>
  );
};

const App = () => {
  const location = useLocation();
  const routeContentRef = useRef(null);

  useEffect(() => {
    const element = routeContentRef.current;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let animation;

    if (element && !reduceMotion && typeof element.animate === "function") {
      animation = element.animate(
        [
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        {
          duration: 380,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        },
      );
    }

    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    });

    return () => animation?.cancel();
  }, [location.pathname]);

  return (
    <>
      <div ref={routeContentRef}>
        <Routes>
        {/* Public website */}
        <Route path="/" element={<Home />} />

        {/* Public authentication pages */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin/accessmeadmin" element={<AdminLogin />} />
        <Route
          path="/moderator/accessmoderator"
          element={<ModeratorLogin />}
        />

        {/* All normal user private routes */}
        <Route element={<RequireAuth />}>
          {/* A logged-in user can choose a role */}
          <Route path="/choose-role" element={<ChooseRole />} />

          {/* Earner-only routes */}
          <Route element={<RequireRole allowedRoles={["earner"]} />}>
            <Route path="/earners/activate" element={<EarnersActivation />} />

            <Route path="/earners" element={<EarnersLayout />}>
              <Route index element={<EarnersDashboard />} />
              <Route path="tasks/:taskId" element={<EarnerTaskDetails />} />
              <Route path="wallet" element={<EarnersWallet />} />
              <Route
  path="/earners/activate"
  element={<EarnersActivation />}
/>
<Route
  path="/earners/activate/thank-you"
  element={<EarnerActivationThankYou />}
/>
<Route
  path="marketplace-posts"
  element={<MarketplacePostManager workspaceRole="earner" />}
/>
              <Route path="referrals" element={<EarnersReferrals />} />
              <Route path="settings" element={<EarnersSettings />} />
            </Route>
          </Route>

          {/* Advertiser-only routes */}
          <Route element={<RequireRole allowedRoles={["advertiser"]} />}>
            <Route path="/advertisers" element={<AdvertisersLayout />}>
              <Route index element={<AdvertiserCampaigns />} />
              <Route path="campaigns" element={<AdvertiserCampaigns />} />
              <Route path="wallet" element={<AdvertiserWallet />} />
              <Route
  path="wallet/thank-you"
  element={<AdvertiserPaymentThankYou />}
/>
<Route
  path="marketplace-posts"
  element={<MarketplacePostManager workspaceRole="advertiser" />}
/>
<Route path="wallet" element={<AdvertiserWallet />} />
              <Route
                path="campaigns/new"
                element={<AdvertiserCreateCampaign />}
              />
              <Route path="transactions" element={<AdvertiserTransactions />} />
              <Route
                path="transactions/:transactionId"
                element={<AdvertiserTransactionDetails />}
              />
              <Route path="referrals" element={<AdvertiserReferrals />} />
              <Route path="settings" element={<AdvertiserSettings />} />
            </Route>
          </Route>
        </Route>

        {/* Staff workspaces
            Unauthorized visitors are sent to the landing page.
        */}
       <Route element={<RequireAuth redirectTo="/" />}>
  <Route element={<RequireRole allowedRoles={["moderator"]} />}>
    <Route
      path="/moderator"
      element={<ModeratorDashboard basePath="/moderator" />}
    >
      <Route index element={<ModeratorOverview />} />
      <Route path="reviews" element={<ModeratorReviewQueue />} />
      <Route
        path="reviews/:reviewId"
        element={<ModeratorReviewDetails />}
      />
      <Route path="withdrawals" element={<ModeratorWithdrawals />} />
      <Route path="instructions" element={<ModeratorInstructions />} />
      <Route path="settings" element={<ModeratorSettings />} />
    </Route>
  </Route>


          {/* Admin workspace */}
          <Route element={<RequireRole allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard basePath="/admin" />}>
              <Route index element={<AdminOverviewPage />} />

              <Route
                path="users"
                element={<AdminUsers role="all" basePath="/admin" />}
              />

              <Route
                path="earners"
                element={<AdminUsers role="earner" basePath="/admin" />}
              />

              <Route
                path="advertisers"
                element={<AdminUsers role="advertiser" basePath="/admin" />}
              />

              <Route
                path="moderators"
                element={<AdminUsers role="moderator" basePath="/admin" />}
              />

              <Route
                path="users/:userId"
                element={<AdminUserDetails basePath="/admin" />}
              />

              <Route
                path="campaigns"
                element={<AdminCampaigns basePath="/admin" />}
              />

              <Route
                path="campaigns/new-service"
                element={<AdminServiceSetup basePath="/admin" />}
              />

              <Route
                path="campaigns/:campaignId"
                element={<AdminCampaignDetails basePath="/admin" />}
              />

              <Route
  path="marketplace-posts"
  element={<AdminMarketplacePosts />}
/>

              <Route
                path="campaign-progress"
                element={<Navigate to="campaigns" replace />}
              />

              <Route path="transactions" element={<AdminTransactions />} />

              <Route path="moderation" element={<AdminModeration />} />

              <Route path="withdrawals" element={<AdminWithdrawals />} />

              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Route>

        {/* Public support page */}
        <Route path="/terms" element={<LegalPage type="terms" />} />
<Route path="/privacy" element={<LegalPage type="privacy" />} />
<Route path="/support" element={<SupportRedirect />} />
<Route path="/marketplace" element={<MarketplacePage />} />
<Route path="/marketplace/:slug" element={<MarketplacePage />} />

        {/* Unknown routes return to landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
      </div>

      <SupportWidget />
    </>
  );
};

export default App;
