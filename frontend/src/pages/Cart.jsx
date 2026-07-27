import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, Truck, Tag } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Cart() {
  const { items, changeQuantity, removeItem, total } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState("");

  function goToCheckout() {
    navigate(user ? "/checkout" : "/login?next=/checkout");
  }

  function applyCoupon(e) {
    e.preventDefault();
    showToast("Coupon codes are coming soon — stay tuned!", "info");
  }

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <h1>Your cart</h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <ShoppingBag />
          <h3>Your cart is empty</h3>
          <p>Add something delicious from the menu to get started.</p>
          <Link to="/" className="btn btn-accent btn-shine">Browse the menu</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {items.map((item) => (
              <div className="cart-row" key={item.menu_item_id}>
                <div>
                  <div className="cart-row-name">{item.name}</div>
                  <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    ${item.price.toFixed(2)} each
                  </div>
                </div>
                <div className="qty-control">
                  <button onClick={() => changeQuantity(item.menu_item_id, -1)} aria-label="Decrease quantity">
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.menu_item_id, 1)} aria-label="Increase quantity">
                    <Plus size={14} />
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.menu_item_id)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-card reveal-up">
            <h3>Order summary</h3>
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

            <div className="delivery-estimate">
              <Truck size={16} /> Estimated delivery: 25–40 minutes
            </div>

            <form className="coupon-row" onSubmit={applyCoupon}>
              <input placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
              <button type="submit" className="btn btn-outline btn-sm">
                <Tag size={14} /> Apply
              </button>
            </form>

            <button className="btn btn-primary btn-block btn-shine" style={{ marginTop: 20 }} onClick={goToCheckout}>
              Continue to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
