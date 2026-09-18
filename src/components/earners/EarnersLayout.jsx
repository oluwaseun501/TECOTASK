import { Outlet } from "react-router-dom";
import EarnersSidebar from "./EarnersSidebar";
import EarnersTopBar from "./EarnersTopBar";
import "../../styles/EarnersLayout.css";

const EarnersLayout = () => {
  return (
    <div className="earner-layout">
      <EarnersSidebar />

      <div className="earner-layout__main">
        <EarnersTopBar />

        <main className="earner-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EarnersLayout;