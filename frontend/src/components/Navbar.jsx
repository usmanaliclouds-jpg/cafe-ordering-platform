import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ShoppingBag, LogOut, LayoutDashboard, ClipboardList, Coffee } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <Coffee size={20} />
          Ember <span className="dot">&amp;</span> Oak
        </NavLink>
        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Menu
          </NavLink>
          {user && !isAdmin && (
            <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
              My Orders
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
              Admin
            </NavLink>
          )}
          {!isAdmin && (
            <NavLink to="/cart" className="cart-pill">
              <ShoppingBag /> {count > 0 && count}
            </NavLink>
          )}
          {user ? (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut size={14} /> Log out
            </button>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Log in
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}
