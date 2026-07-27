import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, ClipboardList, Clock, UtensilsCrossed, ArrowRight, TrendingUp } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_LABEL = {
  placed: "Placed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="skeleton-shimmer skeleton-line" style={{ width: 38, height: 38, borderRadius: 10 }} />
      <div className="skeleton-shimmer skeleton-line" style={{ width: "60%", height: 28, marginTop: 16 }} />
      <div className="skeleton-shimmer skeleton-line" style={{ width: "80%", height: 14, marginTop: 8 }} />
    </div>
  );
}

export default function AdminOverview() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.getAllOrders(token), api.getMenu()])
      .then(([o, m]) => {
        setOrders(o);
        setMenu(m);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const stats = useMemo(() => {
    const revenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0);
    const pending = orders.filter((o) => ["placed", "preparing", "out_for_delivery"].includes(o.status)).length;
    return { revenue, pending, totalOrders: orders.length, menuCount: menu.length };
  }, [orders, menu]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6),
    [orders]
  );

  return (
    <div>
      <div className="toolbar">
        <div>
          <h2 style={{ margin: 0 }}>Welcome back{user?.name ? `, ${user.name}` : ""}</h2>
          <p style={{ margin: "4px 0 0" }}>Here's how the cafe is doing today.</p>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card reveal-up">
            <div className="stat-card-top">
              <div className="stat-icon"><DollarSign /></div>
              <span className="stat-trend up"><TrendingUp size={13} /> live</span>
            </div>
            <div className="stat-value">${stats.revenue.toFixed(2)}</div>
            <div className="stat-label">Total revenue</div>
          </div>
          <div className="stat-card reveal-up" style={{ animationDelay: "60ms" }}>
            <div className="stat-card-top">
              <div className="stat-icon"><ClipboardList /></div>
            </div>
            <div className="stat-value">{stats.totalOrders}</div>
            <div className="stat-label">Total orders</div>
          </div>
          <div className="stat-card reveal-up" style={{ animationDelay: "120ms" }}>
            <div className="stat-card-top">
              <div className="stat-icon"><Clock /></div>
            </div>
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Orders in progress</div>
          </div>
          <div className="stat-card reveal-up" style={{ animationDelay: "180ms" }}>
            <div className="stat-card-top">
              <div className="stat-icon"><UtensilsCrossed /></div>
            </div>
            <div className="stat-value">{stats.menuCount}</div>
            <div className="stat-label">Menu items</div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <h3 style={{ margin: 0 }}>Recent orders</h3>
        <Link to="/admin/orders" className="btn btn-outline btn-sm">
          View all <ArrowRight size={14} />
        </Link>
      </div>

      {!loading && recentOrders.length === 0 ? (
        <div className="empty-state">
          <ClipboardList />
          <h3>No orders yet</h3>
          <p>Orders will show up here as customers place them.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{order.customer_name}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td><span className={`status-badge status-${order.status}`}>{STATUS_LABEL[order.status]}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
