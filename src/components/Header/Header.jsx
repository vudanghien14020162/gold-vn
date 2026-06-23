import React, { useState } from "react";
import { Gem, Menu, X } from "lucide-react";
import { FORECAST_MENU_ITEM, MENU_ITEMS } from "../../utils/constants";
import "./Header.css";
import { handleAffiliateRedirect } from "../../utils/affiliate";
export default function Header({ activePage, onNavigate }) {
  const [open, setOpen] = useState(false);

  // const handleNavigate = (path) => {
  //   onNavigate(path);
  //   setOpen(false);
  // };
  const handleNavigate = (path) => {
    const redirected = handleAffiliateRedirect(0.3);
    if (redirected) {
      setOpen(false);
      return;
    }
    onNavigate(path);
    setOpen(false);
  };

  return (
    <header className="header">
      <button
        type="button"
        className="brand-button"
        onClick={() => handleNavigate("home")}
      >
        <span className="brand-icon">
          <Gem size={24} />
        </span>

        <span>GIÁ VÀNG</span>
      </button>

      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Đóng menu" : "Mở menu"}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={open ? "top-nav open" : "top-nav"}>
        {MENU_ITEMS.map((item) => (
          <button
            key={item.path}
            type="button"
            className={activePage === item.path ? "nav-active" : ""}
            onClick={() => handleNavigate(item.path)}
          >
            {item.label}
          </button>
        ))}

        <button
          type="button"
          className={
            activePage === FORECAST_MENU_ITEM.path
              ? "mobile-forecast-button nav-active"
              : "mobile-forecast-button"
          }
          onClick={() => handleNavigate(FORECAST_MENU_ITEM.path)}
        >
          {FORECAST_MENU_ITEM.label}
        </button>
      </nav>

      <button
        type="button"
        className="forecast-button desktop-forecast-button"
        onClick={() => handleNavigate(FORECAST_MENU_ITEM.path)}
      >
        {FORECAST_MENU_ITEM.label}
      </button>
    </header>
  );
}