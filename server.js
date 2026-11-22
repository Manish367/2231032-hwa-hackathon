const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let orders = [];
try {
  if (fs.existsSync(ORDERS_FILE)) orders = JSON.parse(fs.readFileSync(ORDERS_FILE, "utf8"));
} catch { orders = []; }

const products = [
  {
    id: "pawquest-station",
    name: "PawQuest Enrichment Station",
    tagline: "A little adventure for the hours you're away.",
    price: 4499,
    compareAt: 5299,
    category: "Interactive enrichment",
    rating: 4.9,
    reviews: 128,
    badge: "Best seller",
    description: "A modular, screen-free activity station that turns snack time into a sequence of sniffing, nudging and problem-solving challenges.",
    features: [
      "Three interchangeable challenge modules",
      "Scent-search pockets that encourage natural sniffing",
      "Adjustable difficulty for curious beginners and clever pros",
      "Food-safe, wipe-clean, dog-friendly materials",
      "Non-slip base and rounded, chew-conscious edges"
    ],
    includes: ["PawQuest base", "Scent trail module", "Slide-and-reveal module", "Treat spinner module", "Quick-start enrichment guide"]
  },
  {
    id: "scent-refill",
    name: "Scent Trail Refill Pack",
    tagline: "Refresh the hunt with new hiding spots.",
    price: 499,
    compareAt: 649,
    category: "Refills",
    rating: 4.8,
    reviews: 42,
    badge: "Add-on",
    description: "A set of washable fabric scent pockets that gives your dog a fresh sniffing challenge.",
    features: ["Six reusable pockets", "Machine-washable fabric", "Works with the PawQuest station"],
    includes: ["6 scent pockets", "Setup card"]
  },
  {
    id: "challenge-pack",
    name: "Level-Up Challenge Pack",
    tagline: "New patterns for dogs who love a puzzle.",
    price: 699,
    compareAt: 849,
    category: "Accessories",
    rating: 4.9,
    reviews: 31,
    badge: "New",
    description: "A rotating set of puzzle layouts to keep familiar play feeling new.",
    features: ["Four challenge layouts", "Beginner-to-advanced progression", "Simple setup in minutes"],
    includes: ["4 challenge inserts", "Activity cards"]
  }
];

function readOrders() { return orders; }
function writeOrders(newOrders) {
  orders = newOrders;
  try { fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), "utf8"); }
  catch { /* read-only filesystem on serverless platforms; in-memory store is used */ }
}

app.get("/api/products", (req, res) => res.json(products));
app.get("/api/products/:id", (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.post("/api/orders", (req, res) => {
  const { customer, items } = req.body || {};
  if (!customer || !customer.name || !customer.email || !customer.address || !customer.city || !customer.postalCode) {
    return res.status(400).json({ error: "Please complete all required delivery details." });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Your cart is empty." });
  }
  const normalized = [];
  for (const item of items) {
    const product = products.find(p => p.id === item.id);
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: "One or more cart items are invalid." });
    }
    normalized.push({ id: product.id, name: product.name, price: product.price, quantity });
  }
  const total = normalized.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orders = readOrders();
  const order = {
    id: "PQ-" + Date.now().toString(36).toUpperCase(),
    createdAt: new Date().toISOString(),
    status: "Received",
    customer: {
      name: String(customer.name).trim(),
      email: String(customer.email).trim(),
      phone: String(customer.phone || "").trim(),
      address: String(customer.address).trim(),
      city: String(customer.city).trim(),
      postalCode: String(customer.postalCode).trim()
    },
    items: normalized,
    total
  };
  orders.unshift(order);
  writeOrders(orders);
  res.status(201).json({ message: "Order placed successfully", order });
});

// Demo admin endpoint for the hackathon prototype. Add ADMIN_KEY in production.
app.get("/api/admin/orders", (req, res) => {
  const key = process.env.ADMIN_KEY;
  if (key && req.headers["x-admin-key"] !== key) return res.status(401).json({ error: "Unauthorized" });
  res.json(readOrders());
});

app.get("/api/health", (req, res) => res.json({ ok: true, app: "PawQuest Store" }));

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

if (require.main === module) {
  app.listen(PORT, () => console.log(`PawQuest Store running at http://localhost:${PORT}`));
}

module.exports = app;
