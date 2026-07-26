# Ember & Oak — Cafe / Restaurant Online Ordering Platform

A complete full-stack ordering application:
- **Customer side:** browse the menu with real product photos, add items to a cart, check out, and track order status live (Placed → Preparing → Out for delivery → Completed).
- **Admin side:** log in as an admin to manage menu items — including drag-and-drop image uploads, badges (New/Popular/Best Seller/Limited), and stock status — and view & update every incoming order.
- **Auth:** JWT-based accounts for both customers and admins (same `users` table, different `role`).
- **Database:** SQLite (file-based — zero setup, zero cost, no external database needed).
- **Polish:** toast notifications, skeleton loading states, hover/scale animations, image zoom on hover, and a glass-effect sticky nav.

Stack: **React + Vite** (frontend) and **Node.js + Express + SQLite** (backend). Both are 100% free and open-source — nothing here requires a paid plan, API key, or credit card.

```
cafe-ordering-platform/
├── backend/     Express API + SQLite database
└── frontend/    React (Vite) customer + admin UI
```

---

## 1. Run it locally

You need [Node.js](https://nodejs.org) 18+ installed. Then, in two terminals:

**Backend**
```bash
cd backend
cp .env.example .env      # defaults work out of the box
npm install
npm start                 # http://localhost:4000
```
The first time it runs, it automatically creates the SQLite database file and seeds:
- A sample menu (coffee, mains, salads, desserts)
- A default admin account: **admin@cafe.com / Admin123!** (change these in `.env` before you deploy publicly)

**Frontend** (new terminal)
```bash
cd frontend
cp .env.example .env      # points at http://localhost:4000/api by default
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173`. Order as a customer by registering an account, or log in with the admin credentials above and go to **Admin** to manage the menu and orders.

---

## 2. Deploy it live — for $0, in ONE place

The backend is set up to also serve the built frontend, so you only need **one deployment, on one platform** — no need to juggle two services or worry about CORS.

### Step A — Push to GitHub
```bash
cd cafe-ordering-platform
git init
git add .
git commit -m "Cafe ordering platform"
git branch -M main
git remote add origin https://github.com/<your-username>/cafe-ordering-platform.git
git push -u origin main
```

### Step B — Deploy everything as one Render web service (free)
1. Go to [render.com](https://render.com) → sign up free with GitHub.
2. **New → Web Service** → select your repo.
3. **Root Directory:** leave blank (use the repo root — this deploy needs both `frontend` and `backend`).
4. **Build command:**
   ```
   cd frontend && npm install && npm run build && cd ../backend && npm install
   ```
5. **Start command:**
   ```
   cd backend && npm start
   ```
6. Add environment variables (from `backend/.env.example`):
   - `JWT_SECRET` → any long random string
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` → your own admin login (don't ship the default password)
   - You can leave `CORS_ORIGIN` and the frontend's `VITE_API_URL` unset entirely — everything runs on the same domain, so no cross-origin setup is needed.
7. Deploy. Render builds the frontend, then starts the backend, which serves both the website and the API from one URL, like `https://cafe-ordering.onrender.com`.

That's it — one URL for everything. Render's free tier needs no credit card; Railway works the same way if you'd rather use that instead.

> **Free-tier note:** Render's free web services spin down after inactivity (the first request after idling takes ~30–60s to wake up) and use an ephemeral filesystem, so the SQLite file resets on redeploy/restart. That's completely fine for a demo/portfolio project. If you want the data to persist permanently for free, deploy to **[Fly.io](https://fly.io)** instead using the same build/start commands, and attach their free 1GB volume to store `backend/db/cafe.sqlite`.

### Alternative: two separate services (Render + Vercel)
If you'd rather split the frontend and backend onto two platforms (e.g. for a CDN-fast frontend), that still works — deploy `backend` to Render as its own web service, deploy `frontend` to Vercel/Netlify as its own static site, set `VITE_API_URL` on the frontend to the backend's URL + `/api`, and set `CORS_ORIGIN` on the backend to the frontend's URL. The single-service route above is simpler and is what most people should use for a project this size.

---

## 3. What to submit for the internship task

The email asked for a GitHub repo, live URL(s), a Build Log, and a demo video. This project gives you the code and the two deployment guides above — the rest needs to be genuinely yours:

- **GitHub repo:** push this code (Step A) and make the repo public.
- **Live URL(s):** your Vercel frontend URL + Render/Fly backend URL from Steps B & C.
- **Build Log:** a short write-up of what you built, which AI tools you used and how, and what you learned. A starter template is in [`BUILD_LOG.md`](./BUILD_LOG.md) — fill it in honestly in your own words; don't submit it unedited, since it should reflect your own process.
- **Demo video (3–5 min):** record your screen walking through: browsing the menu → adding to cart → checking out → tracking the order status → logging in as admin → adding/editing a menu item → updating an order's status. Free screen recorders: **OBS Studio** (desktop, all platforms) or **Loom**'s free plan (browser-based, easy for quick uploads).

---

## 4. Project structure reference

```
backend/
  server.js          Express app entry point
  db/index.js         SQLite schema + auto-seed (admin user + sample menu)
  routes/auth.js       POST /api/auth/register, /api/auth/login
  routes/menu.js        GET (public) + POST/PUT/DELETE (admin only) /api/menu
  routes/orders.js       POST /api/orders, GET /api/orders/mine, GET/PATCH /api/orders (admin)
  middleware/auth.js      JWT verification + admin role check

frontend/
  src/pages/Menu.jsx            Customer menu browsing + add to cart
  src/pages/Cart.jsx             Cart review
  src/pages/Checkout.jsx          Delivery details + place order
  src/pages/OrderTracking.jsx      Customer order history + live status timeline
  src/pages/Login.jsx / Register.jsx   Customer + admin auth (same login form)
  src/pages/AdminDashboard.jsx      Admin shell (sidebar)
  src/pages/AdminMenu.jsx            Admin: add/edit/delete menu items
  src/pages/AdminOrders.jsx           Admin: view orders + update status
  src/context/AuthContext.jsx           Logged-in user + JWT token
  src/context/CartContext.jsx            Cart state
```

## 5. A note on the internship email

Before you submit this, it's worth quickly checking the company itself (search "Digitalsofts" reviews, LinkedIn presence, Glassdoor) — unpaid multi-month "internships" that ask for a complete deployed product before any paid offer are a pattern worth a sanity check, even when the company is legitimate. That said, the project itself is a genuinely solid portfolio piece either way, so it's not wasted effort regardless of how this particular opportunity turns out.
