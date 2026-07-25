import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Cart() {
  const { items, changeQuantity, removeItem, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  function goToCheckout() {
    navigate(user ? "/checkout" : "/login?next=/checkout");
  }

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 40, paddingBottom: 60 }}>
      <h1>Your cart</h1>

      {items.length === 0 ? (
        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary">Browse the menu</Link>
        </div>
      ) : (
        <>
          <div>
            {items.map((item) => (
              <div className="cart-row" key={item.menu_item_id}>
                <div>
                  <div className="cart-row-name">{item.name}</div>
                  <div style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
                    ${item.price.toFixed(2)} each
                  </div>
                </div>
                <div className="qty-control">
                  <button onClick={() => changeQuantity(item.menu_item_id, -1)} aria-label="Decrease quantity">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.menu_item_id, 1)} aria-label="Increase quantity">+</button>
                  <button className="btn btn-outline btn-sm" onClick={() => removeItem(item.menu_item_id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <div className="cart-summary-total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button className="btn btn-primary btn-block" style={{ marginTop: 24 }} onClick={goToCheckout}>
            Continue to checkout
          </button>
        </>
      )}
    </div>
  );
}
