import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // [{ menu_item_id, name, price, quantity }]

  function addItem(menuItem) {
    setItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === menuItem.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menu_item_id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }];
    });
  }

  function changeQuantity(menuItemId, delta) {
    setItems((prev) =>
      prev
        .map((i) => (i.menu_item_id === menuItemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(menuItemId) {
    setItems((prev) => prev.filter((i) => i.menu_item_id !== menuItemId));
  }

  function clearCart() {
    setItems([]);
  }

  const total = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addItem, changeQuantity, removeItem, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
