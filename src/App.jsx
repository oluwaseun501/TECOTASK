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

      {/* Temporary routes so buttons do not show a blank page */}
      <Route
        path="/forgot-password"
        element={<div>Forgot password page coming soon.</div>}
      />

      <Route
        path="/support"
        element={<div>Support page coming soon.</div>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;