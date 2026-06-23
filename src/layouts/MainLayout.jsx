// import React from "react";
// import Header from "../components/Header/Header";
// import BottomNav from "../components/BottomNav/BottomNav";
// import "./MainLayout.css";

// export default function MainLayout({ activePage, onNavigate, children }) {
//   return (
//     <div className="page-shell">
//       <div className="site-card">
//         <Header activePage={activePage} onNavigate={onNavigate} />

//         <main className="layout-content">{children}</main>

//         <BottomNav activePage={activePage} onNavigate={onNavigate} />
//       </div>
//     </div>
//   );
// }
//ban moi
// import Header from "../components/Header/Header";
// import BottomNav from "../components/BottomNav/BottomNav";
// import SidebarAds from "../components/Ads/SidebarAds";
// import "./MainLayout.css";

// export default function MainLayout({ children, activePage, onNavigate }) {
//   return (
//     <>
//       <Header activePage={activePage} onNavigate={onNavigate} />

//       <SidebarAds />

//       <main className="layout-content">{children}</main>

//       <BottomNav activePage={activePage} onNavigate={onNavigate} />
//     </>
//   );
// }

import Header from "../components/Header/Header";
import BottomNav from "../components/BottomNav/BottomNav";
import SidebarAds from "../components/Ads/SidebarAds";
import "./MainLayout.css";

export default function MainLayout({ children, activePage, onNavigate }) {
  return (
    <>
      <SidebarAds />

      <div className="site-frame">
        <Header activePage={activePage} onNavigate={onNavigate} />

        <main className="layout-content">{children}</main>
      </div>

      <BottomNav activePage={activePage} onNavigate={onNavigate} />
    </>
  );
}
