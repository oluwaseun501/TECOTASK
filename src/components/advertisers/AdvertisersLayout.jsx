import { Outlet } from "react-router-dom";
import AdvertisersSidebar from "./AdvertisersSidebar";
import AdvertisersTopBar from "./AdvertisersTopBar";
import "../../styles/AdvertisersLayout.css";

const AdvertisersLayout = () => {
  return (
    <div className="advertiser-layout">
      <AdvertisersSidebar />

      <main className="advertiser-layout__main">
        <AdvertisersTopBar />
        <Outlet />
      </main>
    </div>
  );
};

export default AdvertisersLayout;