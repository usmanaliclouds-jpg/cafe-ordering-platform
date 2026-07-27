import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Package } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

const STEPS = [
  { key: "placed", label: "Placed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "completed", label: "Completed" },
];

function stepIndex(status) {
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default function OrderTracking() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params] = useSearchParams();
  const justPlacedId = params.get("placed");

  useEffect(() => {
    api
      .getMyOrders(token)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 40, paddingBottom: 60 }}>
      <h1>My orders</h1>

      {justPlacedId && <div className="success-banner">Order #{justPlacedId} placed successfully — thank you!</div>}
      {loading && <p>Loading your orders…</p>}
      {error && <div className="error-banner">{error}</div>}

      {!loading && orders.length === 0 && (
        <div className="empty-state">
          <Package />
          <h3>No orders yet</h3>
          <p>You haven't placed any orders yet.</p>
        </div>
      )}

      {orders.map((order) => {
        if (order.status === "cancelled") {
          return (
            <div className="order-card" key={order.id}>
              <div className="toolbar">
                <h3>Order #{order.id}</h3>
                <span className="status-badge status-cancelled">Cancelled</span>
              </div>
              <p>This order was cancelled. Total was ${order.total.toFixed(2)}.</p>
            </div>
          );
        }

        const current = stepIndex(order.status);
        return (
          <div className="order-card" key={order.id}>
            <div className="toolbar">
              <h3>Order #{order.id}</h3>
              <span className={`status-badge status-${order.status}`}>
                {STEPS.find((s) => s.key === order.status)?.label || order.status}
              </span>
            </div>

            <div className="timeline">
              {STEPS.map((step, i) => (
                <div className="timeline-step-wrap" key={step.key} style={{ position: "relative", flex: 1 }}>
                  <div className={`timeline-step ${i <= current ? "done" : ""}`}>
                    <div className="timeline-line" />
                    <div className="node" />
                    <div className="label">{step.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, fontSize: "0.9rem" }}>
              {order.items.map((item) => (
                <div className="cart-summary-row" key={item.id}>
                  <span>{item.quantity} × {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="cart-summary-total">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
