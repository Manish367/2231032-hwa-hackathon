const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "img")));

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
    image: "/img/PawQuest%20Enrichment%20Station.png",
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
    image: "/img/Scent%20Trail%20Refill%20Pack.png",
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
    image: "/img/Level-Up%20Challenge%20Pack.png",
    description: "A rotating set of puzzle layouts to keep familiar play feeling new.",
    features: ["Four challenge layouts", "Beginner-to-advanced progression", "Simple setup in minutes"],
    includes: ["4 challenge inserts", "Activity cards"]
  },
  { id: "snuffle-mat", name: "Garden Snuffle Mat", tagline: "Hide treats and let natural sniffing begin.", price: 1299, compareAt: 1599, category: "Snuffle toys", rating: 4.8, reviews: 76, badge: "Popular", image: "/img/Garden%20Snuffle%20Mat.png", description: "A soft textured mat that turns treat searching into an engaging nose-work activity.", features: ["Soft fabric hiding zones", "Machine washable", "Non-slip base"], includes: ["1 snuffle mat", "Care guide"] },
  { id: "treat-puzzle-ball", name: "Rolling Treat Puzzle Ball", tagline: "Roll, tumble and uncover every reward.", price: 899, compareAt: 1199, category: "Puzzle toys", rating: 4.7, reviews: 64, badge: "Brain game", image: "/img/Rolling%20Treat%20Puzzle%20Ball.png", description: "A rewarding treat-release ball for curious paws and clever noses.", features: ["Adjustable difficulty", "Durable hard plastic", "Easy-open design"], includes: ["1 puzzle ball"] },
  { id: "slow-feeder-bowl", name: "Slow-Feeder Meadow Bowl", tagline: "Make mealtime calmer and longer-lasting.", price: 749, compareAt: 999, category: "Mealtime", rating: 4.9, reviews: 93, badge: "Everyday", image: "/img/Slow-Feeder%20Meadow%20Bowl.png", description: "A raised-pattern bowl that encourages slower, healthier eating.", features: ["Food-safe silicone", "Non-slip base", "Dishwasher safe"], includes: ["1 slow-feeder bowl"] },
  { id: "hide-and-seek-cubes", name: "Hide-and-Seek Cube Set", tagline: "Find the squeaky friend hiding inside.", price: 1099, compareAt: 1399, category: "Puzzle toys", rating: 4.6, reviews: 48, badge: "Gift pick", image: "/img/Hide-and-Seek%20Cube%20Set.png", description: "Nested cubes with soft plush animals for engaging hide-and-seek play.", features: ["Multiple puzzle layers", "Soft plush toys", "Crinkle and squeak play"], includes: ["3 cubes", "3 plush animals"] },
  { id: "rope-chew", name: "Cotton Rope Chew Bundle", tagline: "Tug, chew and play together.", price: 599, compareAt: 799, category: "Chew toys", rating: 4.7, reviews: 55, badge: "Durable", image: "/img/Cotton%20Rope%20Chew%20Bundle.png", description: "Natural cotton rope toys for supervised chewing and interactive play.", features: ["Natural cotton", "Knotted grips", "Three-piece set"], includes: ["3 rope toys"] },
  { id: "lick-mat", name: "Calming Silicone Lick Mat", tagline: "Turn snacks into a soothing reset.", price: 649, compareAt: 849, category: "Calming", rating: 4.8, reviews: 71, badge: "Calming", image: "/img/Calming%20Silicone%20Lick%20Mat.png", description: "A textured lick mat for spreads, wet food and calming enrichment.", features: ["Strong suction base", "Freezer safe", "Food-grade silicone"], includes: ["1 lick mat"] },
  { id: "training-treat-pouch", name: "Adventure Treat Pouch", tagline: "Keep rewards close on every walk.", price: 799, compareAt: 999, category: "Walk essentials", rating: 4.6, reviews: 39, badge: "Walk ready", image: "/img/Adventure%20Treat%20Pouch.png", description: "A lightweight waist pouch for treats, waste bags and small essentials.", features: ["Adjustable belt", "Secure drawstring", "Clip-on waste bags"], includes: ["Treat pouch", "Waste-bag dispenser"] },
  { id: "outdoor-agility-cones", name: "Mini Agility Cone Set", tagline: "Set up a backyard confidence course.", price: 1499, compareAt: 1899, category: "Training", rating: 4.7, reviews: 34, badge: "Active", image: "/img/Mini%20Agility%20Cone%20Set.png", description: "Bright cones and poles for beginner agility and indoor training games.", features: ["Lightweight set", "Easy storage", "Indoor and outdoor use"], includes: ["6 cones", "3 adjustable poles"] },
  { id: "cozy-bed", name: "Cloud-Nest Calming Bed", tagline: "A soft place for paws to rest.", price: 2499, compareAt: 2999, category: "Comfort", rating: 4.9, reviews: 112, badge: "Bestseller", image: "/img/Cloud-Nest%20Calming%20Bed.png", description: "A plush donut bed with a raised rim for cosy, secure lounging.", features: ["Washable cover", "Non-slip base", "Deep cushioned center"], includes: ["1 calming bed"] },
  { id: "travel-bowl", name: "Collapsible Trail Bowl", tagline: "Hydration anywhere the paws lead.", price: 449, compareAt: 599, category: "Travel", rating: 4.6, reviews: 47, badge: "Travel", image: "/img/Collapsible%20Trail%20Bowl.png", description: "A compact silicone bowl that unfolds for water and travel meals.", features: ["Leak-resistant", "Carabiner clip", "Fold-flat design"], includes: ["1 collapsible bowl"] },
  { id: "grooming-brush", name: "Soft-Glow Grooming Brush", tagline: "Gentle care for coat and bonding time.", price: 899, compareAt: 1199, category: "Grooming", rating: 4.8, reviews: 68, badge: "Gentle", image: "/img/Soft-Glow%20Grooming%20Brush.png", description: "Rounded grooming pins designed for comfortable everyday brushing.", features: ["Self-cleaning pad", "Comfort grip", "Suitable for short and long coats"], includes: ["1 grooming brush"] },
  { id: "splash-sprinkler", name: "Backyard Splash Sprinkler", tagline: "Cool, chase and splash on warm days.", price: 1799, compareAt: 2199, category: "Outdoor play", rating: 4.5, reviews: 29, badge: "Summer", image: "/img/Backyard%20Splash%20Sprinkler.png", description: "A hose-connected splash pad for supervised outdoor water play.", features: ["Heavy-duty PVC", "Quick hose connection", "Low-pressure spray"], includes: ["1 splash pad", "Hose adapter"] },
  { id: "indoor-potty", name: "Fresh-Grass Training Pad", tagline: "A realistic potty spot for apartment days.", price: 1399, compareAt: 1699, category: "Training", rating: 4.4, reviews: 36, badge: "Indoor", image: "/img/Fresh-Grass%20Training%20Pad.png", description: "A washable indoor potty pad with a natural grass-style surface.", features: ["Washable tray", "Odour-friendly", "Fast-draining layer"], includes: ["Training pad", "Removable tray"] },
  { id: "bandana-set", name: "Adventure Bandana Set", tagline: "Three colorful looks for curious pups.", price: 699, compareAt: 899, category: "Accessories", rating: 4.7, reviews: 41, badge: "Style", image: "/img/Adventure%20Bandana%20Set.png", description: "Soft, adjustable bandanas for walks, photos and everyday comfort.", features: ["Soft cotton blend", "Snap fit", "Three patterns"], includes: ["3 bandanas"] },
  { id: "crate-mat", name: "Washable Crate Comfort Mat", tagline: "Bring familiar comfort to every crate.", price: 1199, compareAt: 1499, category: "Comfort", rating: 4.8, reviews: 59, badge: "Crate ready", image: "/img/Washable%20Crate%20Comfort%20Mat.png", description: "A cushioned, washable mat that fits a wide range of crate sizes.", features: ["Low-profile cushion", "Machine washable", "Anti-slip bottom"], includes: ["1 crate mat"] },
  { id: "toothbrush-kit", name: "Gentle Dental Care Kit", tagline: "Make healthy routines easier to build.", price: 549, compareAt: 699, category: "Health", rating: 4.7, reviews: 52, badge: "Wellness", image: "/img/Gentle%20Dental%20Care%20Kit.png", description: "A soft-bristle dental care set for supervised at-home brushing.", features: ["Soft dual-head brush", "Finger brush", "Compact case"], includes: ["Dual brush", "Finger brush", "Case"] },
  { id: "recovery-blanket", name: "Recovery Snuggle Blanket", tagline: "Soft warmth for rest and recovery.", price: 999, compareAt: 1299, category: "Comfort", rating: 4.8, reviews: 44, badge: "Soft touch", image: "/img/Recovery%20Snuggle%20Blanket.png", description: "A lightweight blanket for sofas, crates and post-walk cuddles.", features: ["Hypoallergenic fill", "Soft fleece", "Machine washable"], includes: ["1 snuggle blanket"] },
  { id: "raincoat", name: "Puddle-Day Raincoat", tagline: "Stay dry through rainy walks.", price: 1699, compareAt: 2099, category: "Wearables", rating: 4.6, reviews: 38, badge: "Weatherproof", image: "/img/Puddle-Day%20Raincoat.png", description: "A lightweight raincoat with a secure fit and reflective details.", features: ["Adjustable straps", "Water-resistant shell", "Reflective piping"], includes: ["1 raincoat"] },
  { id: "memory-game", name: "Cup-and-Treat Memory Game", tagline: "Track the cup and earn the reward.", price: 959, compareAt: 1199, category: "Puzzle toys", rating: 4.7, reviews: 33, badge: "New skill", image: "/img/Cup-and-Treat%20Memory%20Game.png", description: "A simple scent-and-memory puzzle using sturdy sliding cups.", features: ["Three puzzle cups", "Textured surfaces", "Beginner friendly"], includes: ["3 cups", "Training guide"] }
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
    normalized.push({ id: product.id, name: product.name, price: product.price, quantity, image: product.image });
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

app.delete("/api/orders/:id", (req, res) => {
  const remaining = readOrders().filter(order => order.id !== req.params.id);
  if (remaining.length === readOrders().length) return res.status(404).json({ error: "Order not found." });
  writeOrders(remaining);
  res.json({ message: "Order deleted successfully", id: req.params.id });
});

app.get("/api/health", (req, res) => res.json({ ok: true, app: "PawQuest Store" }));

app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

if (require.main === module) {
  app.listen(PORT, () => console.log(`PawQuest Store running at http://localhost:${PORT}`));
}

module.exports = app;
