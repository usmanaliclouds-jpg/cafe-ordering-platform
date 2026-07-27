import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ArrowRight, Truck } from "lucide-react";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import ProductImage from "../components/ProductImage.jsx";
import MenuCardSkeleton from "../components/MenuCardSkeleton.jsx";

const TESTIMONIALS = [
  {
    name: "Sara Malik",
    role: "Regular customer",
    quote: "The ordering flow is so smooth, and tracking my order in real time actually makes the wait enjoyable.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
  },
  {
    name: "Ahmed Raza",
    role: "Weekly regular",
    quote: "Great menu variety and the checkout takes seconds. My go-to spot for lunch orders now.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
  },
  {
    name: "Fatima Noor",
    role: "First-time visitor",
    quote: "Loved how easy it was to browse the menu and see exactly what I was getting before ordering.",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&q=80",
  },
];

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("cafe_favorites") || "[]");
  } catch {
    return [];
  }
}

export default function Menu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites] = useState(loadFavorites);
  const [justAdded, setJustAdded] = useState(null);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    api
      .getMenu()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem("cafe_favorites", JSON.stringify(favorites));
  }, [favorites]);

  const categories = useMemo(() => ["All", ...new Set(items.map((i) => i.category))], [items]);
  const visible = useMemo(
    () => items.filter((i) => activeCategory === "All" || i.category === activeCategory),
    [items, activeCategory]
  );
  const featured = useMemo(() => items.filter((i) => i.badge).slice(0, 3), [items]);

  function toggleFavorite(id) {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }

  function handleAdd(item) {
    addItem(item);
    showToast(`Added ${item.name} to cart`, "success");
    setJustAdded(item.id);
    setTimeout(() => setJustAdded(null), 400);
  }

  function renderCard(item, i) {
    return (
      <div className="menu-card reveal-up" key={item.id} style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
        <div className="menu-card-media-wrap">
          <ProductImage src={item.image_url} alt={item.name} initial={item.name.charAt(0)} />
          {item.badge && (
            <span className={`product-badge badge-${item.badge.replace(/\s+/g, "-").toLowerCase()}`}>
              {item.badge}
            </span>
          )}
          <button
            className={`favorite-btn ${favorites.includes(item.id) ? "active" : ""}`}
            onClick={() => toggleFavorite(item.id)}
            aria-label="Toggle favorite"
          >
            <Heart />
          </button>
          {!item.is_available && <span className="soldout-overlay">Sold out</span>}
        </div>
        <div className="menu-card-body">
          <div className="category-tag">{item.category}</div>
          <div className="menu-card-top">
            <h3>{item.name}</h3>
            <span className="menu-card-price">${item.price.toFixed(2)}</span>
          </div>
          <p className="menu-card-desc">{item.description}</p>
          <button
            className={`btn btn-primary btn-block btn-shine add-btn ${justAdded === item.id ? "just-added" : ""}`}
            disabled={!item.is_available}
            onClick={() => handleAdd(item)}
          >
            {item.is_available ? "Add to cart" : "Sold out"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-split">
          <div className="reveal-up">
            <div className="eyebrow">☕ Open daily · 8am – 10pm</div>
            <h1>Good food, ordered your way.</h1>
            <p className="lede">
              Browse our menu, build your order, and track it in real time from kitchen to table —
              or straight to your door.
            </p>
            <div className="hero-ctas">
              <a href="#menu" className="btn btn-accent btn-shine">
                Explore the menu <ArrowRight size={16} />
              </a>
              <Link to="/cart" className="btn btn-outline">View cart</Link>
            </div>
            <div className="hero-trust">
              <div className="hero-trust-item"><strong>4.9</strong><span>Average rating</span></div>
              <div className="hero-trust-item"><strong>12k+</strong><span>Orders served</span></div>
              <div className="hero-trust-item"><strong>25 min</strong><span>Avg. prep time</span></div>
            </div>
          </div>
          <div className="hero-media reveal-up" style={{ animationDelay: "100ms" }}>
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&q=80"
              alt="Fresh coffee and pastries"
            />
            <div className="hero-media-badge">
              <img src="https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=100&q=80" alt="" />
              <div>
                <strong style={{ display: "block", fontSize: "0.88rem" }}>Iced Latte</strong>
                <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>Most ordered this week</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" id="menu">
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <MenuCardSkeleton />
        ) : (
          <>
            {featured.length > 0 && (
              <>
                <div className="section-header">
                  <div>
                    <span className="eyebrow">Chef's picks</span>
                    <h2>Featured dishes</h2>
                  </div>
                </div>
                <div className="menu-grid">
                  {featured.map((item, i) => renderCard(item, i))}
                </div>
              </>
            )}

            <div className="section-header">
              <div>
                <span className="eyebrow">Full menu</span>
                <h2>Browse everything</h2>
              </div>
            </div>

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
              <div className="menu-grid">{visible.map((item, i) => renderCard(item, i))}</div>
            )}

            <div className="section-header">
              <div>
                <span className="eyebrow">Loved by regulars</span>
                <h2>What people are saying</h2>
              </div>
            </div>
            <div className="testimonial-grid">
              {TESTIMONIALS.map((t) => (
                <div className="testimonial-card reveal-up" key={t.name}>
                  <div className="testimonial-stars">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} />)}
                  </div>
                  <p className="testimonial-quote">"{t.quote}"</p>
                  <div className="testimonial-author">
                    <img src={t.avatar} alt="" />
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.role}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
