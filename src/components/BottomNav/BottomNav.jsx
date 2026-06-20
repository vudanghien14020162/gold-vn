import React from "react";
import { MENU_ITEMS } from "../../utils/constants";
import "./BottomNav.css";

export default function BottomNav({ activePage, onNavigate }) {
  return (
    <footer className="bottom-nav">
      {MENU_ITEMS.map((item) => (
        <button
          key={item.path}
          type="button"
          className={activePage === item.path ? "bottom-active" : ""}
          onClick={() => onNavigate(item.path)}
        >
          {item.label}
        </button>
      ))}
    </footer>
  );
}