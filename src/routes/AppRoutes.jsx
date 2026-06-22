import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../layouts/MainLayout";

import HomePage from "../pages/Home/HomePage";
import GoldPricePage from "../pages/GoldPrice/GoldPricePage";
import ForecastPage from "../pages/Forecast/ForecastPage";
import WorldMarketPage from "../pages/WorldMarketPage/WorldMarketPage";
import TtsTelegramPage from "../pages/TtsTelegram/TtsTelegramPage";
import Contact from "../pages/Contact/ContactPage";
import News from "../pages/News/NewsPage";

import { FORECAST_MENU_ITEM, MENU_ITEMS } from "../utils/constants";

const ALL_ROUTES = [...MENU_ITEMS, FORECAST_MENU_ITEM];

function getPageBySlug(pathname) {
  const cleanPath = pathname || "/";
  const found = ALL_ROUTES.find((item) => item.slug === cleanPath);

  return found?.path || "home";
}

function getSlugByPage(page) {
  const found = ALL_ROUTES.find((item) => item.path === page);

  return found?.slug || "/";
}

function getParamsFromUrl() {
  const searchParams = new URLSearchParams(window.location.search);

  return {
    companyId: searchParams.get("companyId") || "all",
  };
}

function buildUrlWithParams(slug, params = {}) {
  const searchParams = new URLSearchParams();

  if (params.companyId && params.companyId !== "all") {
    searchParams.set("companyId", String(params.companyId));
  }

  const queryString = searchParams.toString();

  return queryString ? `${slug}?${queryString}` : slug;
}

export default function AppRoutes() {
  const [activePage, setActivePage] = useState(() =>
    getPageBySlug(window.location.pathname)
  );

  const [pageParams, setPageParams] = useState(() => getParamsFromUrl());

  useEffect(() => {
    const handlePopState = () => {
      setActivePage(getPageBySlug(window.location.pathname));
      setPageParams(getParamsFromUrl());
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleNavigate = (page, params = {}) => {
    const nextSlug = getSlugByPage(page);

    const nextParams = {
      companyId: params.companyId || "all",
    };

    const nextUrl = buildUrlWithParams(nextSlug, nextParams);

    if (`${window.location.pathname}${window.location.search}` !== nextUrl) {
      window.history.pushState({}, "", nextUrl);
    }

    setActivePage(page);
    setPageParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const pageContent = useMemo(() => {
    switch (activePage) {
      case "price":
        return (
          <GoldPricePage
            initialCompanyId={pageParams.companyId || "all"}
            selectedCompanyId={pageParams.companyId || "all"}
          />
        );

      case "forecast":
        return <ForecastPage />;

      case "world":
        return <WorldMarketPage />;

      case "tts":
        return <TtsTelegramPage />;

      case "news":
        return <News />;

      case "contact":
        return <Contact />;

      case "home":
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  }, [activePage, pageParams]);

  return (
    <MainLayout activePage={activePage} onNavigate={handleNavigate}>
      {pageContent}
    </MainLayout>
  );
}