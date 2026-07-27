import React from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import { LayoutGrid, ClipboardList, UtensilsCrossed } from "lucide-react";
import AdminOverview from "./AdminOverview.jsx";
import AdminMenu from "./AdminMenu.jsx";
import AdminOrders from "./AdminOrders.jsx";

export default function AdminDashboard() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin/overview" className={({ isActive }) => (isActive ? "active" : "")}>
          <LayoutGrid /> Overview
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          <ClipboardList /> Orders
        </NavLink>
        <NavLink to="/admin/menu" className={({ isActive }) => (isActive ? "active" : "")}>
          <UtensilsCrossed /> Menu items
        </NavLink>
      </aside>
      <div className="admin-main">
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
        </Routes>
      </div>
    </div>
  );
}
