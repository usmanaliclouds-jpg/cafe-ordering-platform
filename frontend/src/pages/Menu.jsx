import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(null);

  useEffect(() => {
    api
      .getMenu()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => ["All", ...new Set(items.map((i) => i.category))], [items]);
  const visible = useMemo(
    () => items.filter((i) => activeCategory === "All" || i.category === activeCategory),
    [items, activeCategory]
  );

  function handleAdd(item) {
    addItem(item);
    setJustAdded(item.id);
    setTimeout(() => setJustAdded(null), 900);
  }

  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="eyebrow">Open daily · 8am – 10pm</div>
          <h1>Good food, ordered your way.</h1>
          <p className="lede">
            Browse our menu, build your order, and track it in real time from kitchen to table —
            or straight to your door.
          </p>
        </div>
      </section>

      <div className="container">
        {loading && <p>Loading menu…</p>}
        {error && <div className="error-banner">{error}</div>}

        {!loading && !error && (
          <>
            <div className="category-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`category-tab ${activeCategory === c ? "active" : ""}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <div className="empty-state">Nothing here yet — check back soon.</div>
            ) : (
              <div className="menu-grid">
                {visible.map((item) => (
                  <div className="menu-card" key={item.id}>
                    <div className="menu-card-media">{item.name.charAt(0)}</div>
                    <div className="menu-card-body">
                      <div className="menu-card-top">
                        <h3>{item.name}</h3>
                        <span className="menu-card-price">${item.price.toFixed(2)}</span>
                      </div>
                      {!item.is_available && <span className="unavailable-tag">Sold out</span>}
                      <p className="menu-card-desc">{item.description}</p>
                      <button
                        className="btn btn-primary btn-block"
                        disabled={!item.is_available}
                        onClick={() => handleAdd(item)}
                      >
                        {justAdded === item.id ? "Added ✓" : "Add to cart"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
