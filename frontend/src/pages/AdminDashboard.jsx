import React from "react";
import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import AdminMenu from "./AdminMenu.jsx";
import AdminOrders from "./AdminOrders.jsx";

export default function AdminDashboard() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink to="/admin/orders" className={({ isActive }) => (isActive ? "active" : "")}>
          Orders
        </NavLink>
        <NavLink to="/admin/menu" className={({ isActive }) => (isActive ? "active" : "")}>
          Menu items
        </NavLink>
      </aside>
      <div className="admin-main">
        <Routes>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="menu" element={<AdminMenu />} />
        </Routes>
      </div>
    </div>
  );
}
