const path = require("path");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");

const dbPath = path.join(__dirname, "cafe.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ---- Schema ----------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price REAL NOT NULL,
  category TEXT NOT NULL DEFAULT 'Mains',
  image_url TEXT DEFAULT '',
  badge TEXT DEFAULT '',
  is_available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'placed', -- placed | preparing | out_for_delivery | completed | cancelled
  total REAL NOT NULL,
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id),
  name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL
);
`);

// ---- Lightweight migration for databases created before `badge` existed ----
const menuColumns = db.prepare("PRAGMA table_info(menu_items)").all().map((c) => c.name);
if (!menuColumns.includes("badge")) {
  db.exec("ALTER TABLE menu_items ADD COLUMN badge TEXT DEFAULT ''");
}

// ---- Seed default admin + sample menu on first run --------------------
function seedIfEmpty() {
  const userCount = db.prepare("SELECT COUNT(*) AS c FROM users").get().c;
  if (userCount === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@cafe.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')"
    ).run("Admin", adminEmail, hash);
    console.log(`Seeded default admin account: ${adminEmail} / ${adminPassword}`);
  }

  const menuCount = db.prepare("SELECT COUNT(*) AS c FROM menu_items").get().c;
  if (menuCount === 0) {
    const insert = db.prepare(
      "INSERT INTO menu_items (name, description, price, category, image_url, badge) VALUES (?, ?, ?, ?, ?, ?)"
    );
    const items = [
      ["Espresso", "Double shot, rich and bold.", 3.5, "Coffee", "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&q=80", ""],
      ["Cappuccino", "Espresso with steamed milk and foam.", 4.5, "Coffee", "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80", "Popular"],
      ["Iced Latte", "Chilled espresso over milk and ice.", 5.0, "Coffee", "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&q=80", "New"],
      ["Margherita Pizza", "Tomato, mozzarella, and fresh basil.", 9.5, "Mains", "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&q=80", "Best Seller"],
      ["Grilled Chicken Sandwich", "Grilled chicken, lettuce, tomato, aioli.", 8.0, "Mains", "https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=600&q=80", ""],
      ["Caesar Salad", "Romaine, parmesan, croutons, Caesar dressing.", 7.5, "Salads", "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&q=80", ""],
      ["Chocolate Brownie", "Warm fudge brownie with a scoop of vanilla.", 5.5, "Desserts", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80", "Popular"],
      ["Cheesecake Slice", "Classic New York style cheesecake.", 6.0, "Desserts", "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80", ""],
    ];
    const insertMany = db.transaction((rows) => {
      for (const row of rows) insert.run(...row);
    });
    insertMany(items);
    console.log("Seeded sample menu items.");
  }
}

seedIfEmpty();

module.exports = db;
