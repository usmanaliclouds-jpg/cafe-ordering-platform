import React from "react";

export default function MenuCardSkeleton({ count = 6 }) {
  return (
    <div className="menu-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div className="menu-card skeleton-card" key={i}>
          <div className="menu-card-media skeleton-shimmer" style={{ height: 160 }} />
          <div className="menu-card-body">
            <div className="skeleton-line skeleton-shimmer" style={{ width: "60%", height: 20 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: "90%", height: 14, marginTop: 10 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: "40%", height: 14, marginTop: 6 }} />
            <div className="skeleton-line skeleton-shimmer" style={{ width: "100%", height: 38, marginTop: 16, borderRadius: 6 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
