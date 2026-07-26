const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/menu - public, everyone can browse the menu
router.get("/", (req, res) => {
  const items = db.prepare("SELECT * FROM menu_items ORDER BY category, name").all();
  res.json(items);
});

// POST /api/menu - admin only
router.post("/", requireAuth, requireAdmin, (req, res) => {
  const { name, description = "", price, category = "Mains", image_url = "", badge = "", is_available = 1 } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: "Name and price are required." });
  }
  const result = db
    .prepare(
      "INSERT INTO menu_items (name, description, price, category, image_url, badge, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(name, description, price, category, image_url, badge, is_available ? 1 : 0);
  const item = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(item);
});

// PUT /api/menu/:id - admin only
router.put("/:id", requireAuth, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Menu item not found." });

  const {
    name = existing.name,
    description = existing.description,
    price = existing.price,
    category = existing.category,
    image_url = existing.image_url,
    badge = existing.badge,
    is_available = existing.is_available,
  } = req.body;

  db.prepare(
    "UPDATE menu_items SET name = ?, description = ?, price = ?, category = ?, image_url = ?, badge = ?, is_available = ? WHERE id = ?"
  ).run(name, description, price, category, image_url, badge, is_available ? 1 : 0, req.params.id);

  const updated = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  res.json(updated);
});

// DELETE /api/menu/:id - admin only
router.delete("/:id", requireAuth, requireAdmin, (req, res) => {
  const existing = db.prepare("SELECT * FROM menu_items WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Menu item not found." });

  db.prepare("DELETE FROM menu_items WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
