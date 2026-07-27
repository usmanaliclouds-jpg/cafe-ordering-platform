import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Checkout() {
  const { user, token } = useAuth();
  const { items, total, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (items.length === 0) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const order = await api.placeOrder(
        {
          items,
          customer_name: customerName,
          customer_phone: phone,
          customer_address: address,
          notes,
        },
        token
      );
      clearCart();
      showToast("Order placed successfully!", "success");
      navigate(`/orders?placed=${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 40, paddingBottom: 60 }}>
      <h1>Checkout</h1>

      <div className="summary-card" style={{ position: "static", marginBottom: 24 }}>
        {items.map((i) => (
          <div className="cart-summary-row" key={i.menu_item_id}>
            <span>{i.quantity} × {i.name}</span>
            <span>${(i.price * i.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="cart-summary-total">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="float-field">
          <input id="customerName" placeholder=" " required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <label htmlFor="customerName">Full name</label>
        </div>
        <div className="float-field">
          <input id="phone" placeholder=" " required value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label htmlFor="phone">Phone number</label>
        </div>
        <div className="field">
          <label htmlFor="address">Delivery address</label>
          <textarea id="address" required value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="notes">Order notes (optional)</label>
          <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergies, delivery instructions, etc." />
        </div>
        <button className="btn btn-primary btn-block btn-shine" disabled={loading}>
          {loading ? "Placing order…" : `Place order · $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
}
