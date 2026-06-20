import React from "react";
import Header from "../components/Header/Header";
import BottomNav from "../components/BottomNav/BottomNav";
import "./MainLayout.css";

export default function MainLayout({ activePage, onNavigate, children }) {
  return (
    <div className="page-shell">
      <div className="site-card">
        <Header activePage={activePage} onNavigate={onNavigate} />

        <main className="layout-content">{children}</main>

        <BottomNav activePage={activePage} onNavigate={onNavigate} />
      </div>
    </div>
  );
}