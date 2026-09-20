import { Navigate, Route, Routes } from "react-router-dom";

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

/* Earner workspace */
import EarnersLayout from "./components/earners/EarnersLayout";
import EarnersDashboard from "./components/earners/EarnersDashboard";
import EarnersSettings from "./components/earners/EarnersSettings";
import EarnersWallet from "./components/earners/EarnersWallet";
import EarnersReferrals from "./components/earners/EarnersReferrals";
import EarnersActivation from "./components/earners/EarnersActivation";

/* Advertiser workspace */
import AdvertisersLayout from "./components/advertisers/AdvertisersLayout";
import AdvertiserCampaigns from "./components/advertisers/AdvertiserCampaigns";
import AdvertiserWallet from "./components/advertisers/AdvertiserWallet";

import AdvertiserTransactions from "./components/advertisers/AdvertiserTransactions";
import AdvertiserTransactionDetails from "./components/advertisers/AdvertiserTransactionDetails";

import AdvertiserReferrals from "./components/advertisers/AdvertiserReferrals";
import AdvertiserSettings from "./components/advertisers/AdvertiserSettings";

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

const AdvertiserComingSoon = ({ title }) => {
  return (
    <section
      style={{
        maxWidth: "1380px",
        margin: "0 auto",
        padding: "40px 30px",
      }}
    >
      <h2 style={{ margin: 0, color: "#0f172a" }}>{title}</h2>

      <p style={{ color: "#94a3b8", fontSize: "13px" }}>
        This advertiser page is coming soon.
      </p>
    </section>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public website */}
      <Route path="/" element={<Home />} />

      {/* Authentication */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/choose-role" element={<ChooseRole />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Earner activation page */}
      <Route
        path="/earners/activate"
        element={<EarnersActivation />}
      />

      {/* Earner workspace */}
      <Route path="/earners" element={<EarnersLayout />}>
        <Route index element={<EarnersDashboard />} />
        <Route path="wallet" element={<EarnersWallet />} />
        <Route path="referrals" element={<EarnersReferrals />} />
        <Route path="settings" element={<EarnersSettings />} />
      </Route>

     <Route path="/advertisers" element={<AdvertisersLayout />}>
  <Route index element={<AdvertiserCampaigns />} />
  <Route path="campaigns" element={<AdvertiserCampaigns />} />
  <Route path="wallet" element={<AdvertiserWallet />} />

  <Route
    path="transactions/:transactionId"
    element={<AdvertiserTransactionDetails />}
  />

  <Route
    path="transactions"
    element={<AdvertiserTransactions />}
  />

 <Route
  path="referrals"
  element={<AdvertiserReferrals />}
/>

<Route
  path="settings"
  element={<AdvertiserSettings />}
/>
</Route>


      {/* Other pages */}
      <Route
        path="/support"
        element={<div>Support page coming soon.</div>}
      />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;