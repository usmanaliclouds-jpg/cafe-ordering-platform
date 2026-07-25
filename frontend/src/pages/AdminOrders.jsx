import React, { useEffect, useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STATUS_OPTIONS = ["placed", "preparing", "out_for_delivery", "completed", "cancelled"];
const STATUS_LABEL = {
  placed: "Placed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function AdminOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  function load() {
    setLoading(true);
    api.getAllOrders(token).then(setOrders).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function handleStatusChange(orderId, status) {
    try {
      await api.updateOrderStatus(orderId, status, token);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      setError(err.message);
    }
  }

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="toolbar">
        <h2 style={{ margin: 0 }}>Orders</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid var(--line)" }}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading ? (
        <p>Loading…</p>
      ) : visible.length === 0 ? (
        <div className="empty-state">No orders match this filter.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}<br /><span style={{ color: "var(--ink-soft)", fontSize: "0.78rem" }}>{order.created_at}</span></td>
                  <td>{order.customer_name}<br /><span style={{ color: "var(--ink-soft)", fontSize: "0.78rem" }}>{order.customer_phone}</span></td>
                  <td>{order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</td>
                  <td>${order.total.toFixed(2)}</td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
