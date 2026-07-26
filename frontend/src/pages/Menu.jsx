import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import ProductImage from "../components/ProductImage.jsx";
import MenuCardSkeleton from "../components/MenuCardSkeleton.jsx";

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { addItem } = useCart();
  const { showToast } = useToast();

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
    showToast(`Added ${item.name} to cart`, "success");
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
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <MenuCardSkeleton />
        ) : (
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
                {visible.map((item, i) => (
                  <div
                    className="menu-card reveal-up"
                    key={item.id}
                    style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
                  >
                    <div className="menu-card-media-wrap">
                      <ProductImage src={item.image_url} alt={item.name} initial={item.name.charAt(0)} />
                      {item.badge && (
                        <span className={`product-badge badge-${item.badge.replace(/\s+/g, "-").toLowerCase()}`}>
                          {item.badge}
                        </span>
                      )}
                      {!item.is_available && <span className="soldout-overlay">Sold out</span>}
                    </div>
                    <div className="menu-card-body">
                      <div className="menu-card-top">
                        <h3>{item.name}</h3>
                        <span className="menu-card-price">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="menu-card-desc">{item.description}</p>
                      <button
                        className="btn btn-primary btn-block btn-shine"
                        disabled={!item.is_available}
                        onClick={() => handleAdd(item)}
                      >
                        {item.is_available ? "Add to cart" : "Sold out"}
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
