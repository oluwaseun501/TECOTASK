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

import EarnersLayout from "./components/earners/EarnersLayout";
import EarnersDashboard from "./components/earners/EarnersDashboard";
import EarnersSettings from "./components/earners/EarnersSettings";
import EarnersWallet from "./components/earners/EarnersWallet";
import EarnersReferrals from "./components/earners/EarnersReferrals";

import EarnersActivation from "./components/earners/EarnersActivation";
// import AdvertiserDashboard from "./components/advertisers/AdvertiserDashboard";

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

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/choose-role" element={<ChooseRole />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
  path="/earners/activate"
  element={<EarnersActivation />}
/>

      {/* Earner workspace */}
  <Route path="/earners" element={<EarnersLayout />}>
  <Route index element={<EarnersDashboard />} />
  <Route path="referrals" element={<EarnersReferrals />} />
  <Route path="wallet" element={<EarnersWallet />} />

  <Route path="settings" element={<EarnersSettings />} />
</Route>

      {/* Advertiser workspace */}
      {/* <Route
        path="/advertisers"
        element={<AdvertiserDashboard />}
      /> */}

      <Route
        path="/support"
        element={<div>Support page coming soon.</div>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;