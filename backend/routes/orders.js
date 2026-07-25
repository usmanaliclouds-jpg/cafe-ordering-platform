const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const VALID_STATUSES = ["placed", "preparing", "out_for_delivery", "completed", "cancelled"];

function getOrderWithItems(orderId) {
  const order = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
  if (!order) return null;
  const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(orderId);
  return { ...order, items };
}

// POST /api/orders - place a new order (must be logged in as a customer)
router.post("/", requireAuth, (req, res) => {
  const { items, customer_name, customer_phone, customer_address, notes = "" } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }
  if (!customer_name || !customer_phone || !customer_address) {
    return res.status(400).json({ error: "Name, phone, and delivery address are required." });
  }

  // Recalculate prices server-side from the live menu, never trust client totals.
  const menuStmt = db.prepare("SELECT * FROM menu_items WHERE id = ?");
  let total = 0;
  const resolvedItems = [];

  for (const line of items) {
    const menuItem = menuStmt.get(line.menu_item_id);
    if (!menuItem || !menuItem.is_available) {
      return res.status(400).json({ error: `"${line.name || "An item"}" is no longer available.` });
    }
    const qty = Math.max(1, parseInt(line.quantity, 10) || 1);
    total += menuItem.price * qty;
    resolvedItems.push({ menu_item_id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: qty });
  }

  const insertOrder = db.prepare(
    "INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, total, notes) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const insertItem = db.prepare(
    "INSERT INTO order_items (order_id, menu_item_id, name, price, quantity) VALUES (?, ?, ?, ?, ?)"
  );

  const createOrder = db.transaction(() => {
    const result = insertOrder.run(req.user.id, customer_name, customer_phone, customer_address, total, notes);
    const orderId = result.lastInsertRowid;
    for (const item of resolvedItems) {
      insertItem.run(orderId, item.menu_item_id, item.name, item.price, item.quantity);
    }
    return orderId;
  });

  const orderId = createOrder();
  res.status(201).json(getOrderWithItems(orderId));
});

// GET /api/orders/mine - a customer's own order history
router.get("/mine", requireAuth, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.user.id);
  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id),
  }));
  res.json(withItems);
});

// GET /api/orders/:id - a single order (owner or admin)
router.get("/:id", requireAuth, (req, res) => {
  const order = getOrderWithItems(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found." });
  if (order.user_id !== req.user.id && req.user.role !== "admin") {
    return res.status(403).json({ error: "You don't have access to this order." });
  }
  res.json(order);
});

// GET /api/orders - admin only, view every order
router.get("/", requireAuth, requireAdmin, (req, res) => {
  const orders = db.prepare("SELECT * FROM orders ORDER BY created_at DESC").all();
  const withItems = orders.map((o) => ({
    ...o,
    items: db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(o.id),
  }));
  res.json(withItems);
});

// PATCH /api/orders/:id/status - admin only, update order status
router.patch("/:id/status", requireAuth, requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(", ")}` });
  }
  const existing = db.prepare("SELECT * FROM orders WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Order not found." });

  db.prepare("UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
  res.json(getOrderWithItems(req.params.id));
});

module.exports = router;
