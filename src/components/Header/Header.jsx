import React, { useEffect, useState } from "react";
import { Gem, Menu, X } from "lucide-react";
import { MENU_ITEMS } from "../../utils/constants";
import "./Header.css";

export default function Header({ activePage, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path) => {
    setMenuOpen(false);

    if (typeof onNavigate === "function") {
      onNavigate(path);
    }
  };

  useEffect(() => {
    setMenuOpen(false);
  }, [activePage]);

  return (
    <header className="header">
      <button
        type="button"
        className="brand-button"
        onClick={() => handleNavigate("home")}
        aria-label="Về trang chủ"
      >
        <span className="brand-icon">
          <Gem size={24} />
        </span>

        <span>GIÁ VÀNG</span>
      </button>

      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
        aria-expanded={menuOpen}
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={`top-nav ${menuOpen ? "open" : ""}`}>
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
          className="forecast-button mobile-forecast-button"
          onClick={() => handleNavigate("forecast")}
        >
          Dự đoán ngày mai
        </button>
      </nav>

      <button
        type="button"
        className="forecast-button desktop-forecast-button"
        onClick={() => handleNavigate("forecast")}
      >
        Dự đoán ngày mai
      </button>
    </header>
  );
}