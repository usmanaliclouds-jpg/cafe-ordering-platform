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
      "INSERT INTO menu_items (name, description, price, category, image_url) VALUES (?, ?, ?, ?, ?)"
    );
    const items = [
      ["Espresso", "Double shot, rich and bold.", 3.5, "Coffee", ""],
      ["Cappuccino", "Espresso with steamed milk and foam.", 4.5, "Coffee", ""],
      ["Iced Latte", "Chilled espresso over milk and ice.", 5.0, "Coffee", ""],
      ["Margherita Pizza", "Tomato, mozzarella, and fresh basil.", 9.5, "Mains", ""],
      ["Grilled Chicken Sandwich", "Grilled chicken, lettuce, tomato, aioli.", 8.0, "Mains", ""],
      ["Caesar Salad", "Romaine, parmesan, croutons, Caesar dressing.", 7.5, "Salads", ""],
      ["Chocolate Brownie", "Warm fudge brownie with a scoop of vanilla.", 5.5, "Desserts", ""],
      ["Cheesecake Slice", "Classic New York style cheesecake.", 6.0, "Desserts", ""],
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
