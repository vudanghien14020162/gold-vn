import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/Home/HomePage";
import GoldPricePage from "../pages/GoldPrice/GoldPricePage";
import ForecastPage from "../pages/Forecast/ForecastPage";
import NewsPage from "../pages/News/NewsPage";
import ContactPage from "../pages/Contact/ContactPage";
import TtsTelegramPage from "../pages/TtsTelegram/TtsTelegramPage";
import WorldMarketPage from "../pages/WorldMarketPage/WorldMarketPage";

export default function AppRoutes() {
  const [activePage, setActivePage] = useState("home");
  const [routeState, setRouteState] = useState({});

  const navigate = (page, state = {}) => {
    setRouteState(state || {});
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case "price":
        return (
          <GoldPricePage
            key={`price-${routeState.companyId || "all"}`}
            initialCompanyId={routeState.companyId || "all"}
          />
        );

      case "forecast":
        return <ForecastPage />;

      case "tts":
        return <TtsTelegramPage />;

      case "news":
        return <NewsPage />;

      case "contact":
        return <ContactPage />;

      case "world":
        return <WorldMarketPage />;

      case "home":
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <MainLayout activePage={activePage} onNavigate={navigate}>
      {renderPage()}
    </MainLayout>
  );
}