import React, { useEffect, useRef, useState } from "react";
import { MoreVertical } from "lucide-react";

export default function ActionMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="action-menu" ref={ref}>
      <button className="action-menu-trigger" onClick={() => setOpen((o) => !o)} aria-label="Actions">
        <MoreVertical size={16} />
      </button>
      {open && (
        <div className="action-menu-list">
          {items.map((item, i) =>
            item.divider ? (
              <div className="action-menu-divider" key={i} />
            ) : (
              <button
                key={item.label}
                className={item.danger ? "danger-item" : ""}
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.icon}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
