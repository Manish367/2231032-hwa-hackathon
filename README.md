# PawQuest — Happy While Away Hackathon Storefront

PawQuest is a concept product and demo e-commerce experience built for the Happy While Away hackathon brief.

## Live Site

**https://2231032-hwa-hackathon.vercel.app**

Open this link in any browser to browse products, add items to your cart, place a demo order, and view the order dashboard.

## Product Idea

The PawQuest Enrichment Station is a modular, screen-free dog activity station designed for the hours your dog spends home alone. Its interchangeable activities invite a dog to sniff out hidden treats, nudge sliders, and explore a rotating treat compartment — turning everyday snack time into a sniff, search, and solve adventure.

**Product honesty:** the concept does not claim to prevent separation anxiety, replace human care, or guarantee a specific amount of time occupied. Dogs should be introduced to new enrichment while supervised, and the station should be removed if a dog chews or damages components.

## Product Catalogue (22 items)

| Product | Category | Price | Badge |
|---------|----------|-------|-------|
| PawQuest Enrichment Station | Interactive enrichment | ₹4,499 | Best seller |
| Scent Trail Refill Pack | Refills | ₹499 | Add-on |
| Level-Up Challenge Pack | Accessories | ₹699 | New |
| Garden Snuffle Mat | Snuffle toys | ₹1,299 | Popular |
| Rolling Treat Puzzle Ball | Puzzle toys | ₹899 | Brain game |
| Slow-Feeder Meadow Bowl | Mealtime | ₹749 | Everyday |
| Hide-and-Seek Cube Set | Puzzle toys | ₹1,099 | Gift pick |
| Cotton Rope Chew Bundle | Chew toys | ₹599 | Durable |
| Calming Silicone Lick Mat | Calming | ₹649 | Calming |
| Adventure Treat Pouch | Walk essentials | ₹799 | Walk ready |
| Mini Agility Cone Set | Training | ₹1,499 | Active |
| Cloud-Nest Calming Bed | Comfort | ₹2,499 | Bestseller |
| Collapsible Trail Bowl | Travel | ₹449 | Travel |
| Soft-Glow Grooming Brush | Grooming | ₹899 | Gentle |
| Backyard Splash Sprinkler | Outdoor play | ₹1,799 | Summer |
| Fresh-Grass Training Pad | Training | ₹1,399 | Indoor |
| Adventure Bandana Set | Accessories | ₹699 | Style |
| Washable Crate Comfort Mat | Comfort | ₹1,199 | Crate ready |
| Gentle Dental Care Kit | Health | ₹549 | Wellness |
| Recovery Snuggle Blanket | Comfort | ₹999 | Soft touch |
| Puddle-Day Raincoat | Wearables | ₹1,699 | Weatherproof |
| Cup-and-Treat Memory Game | Puzzle toys | ₹959 | New skill |

## Features

- **Responsive storefront** — works on desktop and mobile
- **Product catalogue** — 22 dog enrichment products with images, prices, ratings, and descriptions
- **Shopping cart** — add items, adjust quantities (max 10), remove items, subtotal calculated automatically; cart persists in browser localStorage
- **Checkout form** — full delivery details with validation (name, email, address, city, 6-digit PIN code required)
- **Demo order placement** — POST to `/api/orders`, order saved server-side, order confirmation modal with order ID and total
- **Order confirmation page** — `/confirmation.html` shows your placed order details with links to continue shopping or view the dashboard
- **Order dashboard** — `/admin.html` lists all placed orders with customer details, items, totals, and status
- **Health endpoint** — `GET /api/health` returns server status
- **Free shipping banner** — announced for orders over ₹2,999

## Live Demo Flow

1. Visit **https://2231032-hwa-hackathon.vercel.app**
2. Browse the shop and add products to your bag
3. Open the cart drawer and click "Continue to checkout"
4. Fill in delivery details and place the demo order (no payment collected)
5. See the order confirmation popup, then the confirmation page
6. Visit `/admin.html` to view all placed orders

## API Reference

Base URL: **https://2231032-hwa-hackathon.vercel.app**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/products` | GET | List all 22 products |
| `/api/products/:id` | GET | Get a single product by ID |
| `/api/orders` | POST | Create a demo order (customer + items) |
| `/api/admin/orders` | GET | List all placed orders |
| `/api/orders/:id` | DELETE | Delete an order by ID |

### Example: Place an order

```json
POST /api/orders
Content-Type: application/json

{
  "customer": {
    "name": "Alex",
    "email": "alex@example.com",
    "phone": "9876543210",
    "address": "12 Park Street",
    "city": "Kolkata",
    "postalCode": "700016"
  },
  "items": [
    { "id": "pawquest-station", "quantity": 1 }
  ]
}
```

Response:

```json
{
  "message": "Order placed successfully",
  "order": {
    "id": "PQ-ABC123",
    "createdAt": "2026-11-22T08:00:00.000Z",
    "status": "Received",
    "customer": { ... },
    "items": [ ... ],
    "total": 4499
  }
}
```

## Run Locally

Requirements: Node.js 18 or newer.

```bash
npm install
npm start
```

Open http://localhost:3000

For development with automatic server restart:

```bash
npm run dev
```

## Demo Checkout Notes

Checkout is intentionally a **demo order flow**. It does not collect payment or store card details. Orders are saved to `data/orders.json` on the server (in-memory on serverless platforms; JSON file locally).

Place a test order from the storefront, then visit http://localhost:3000/admin.html to view it.

### Optional admin protection

```bash
# macOS/Linux
ADMIN_KEY=your-secret npm start

# PowerShell
$env:ADMIN_KEY="your-secret"
npm start
```

When `ADMIN_KEY` is configured, requests to `/api/admin/orders` must include the `x-admin-key` header.

## Deployment

Deployed on Vercel at **https://2231032-hwa-hackathon.vercel.app**

- GitHub repo: https://github.com/Manish367/2231032-hwa-hackathon
- Push to `main` triggers deployment
- Build command: none (static + serverless Node.js)
- Output: none

## Tech Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript (no frameworks)
- **Backend:** Node.js + Express
- **Hosting:** Vercel (serverless functions for API routes)
- **Persistence:** `data/orders.json` locally; in-memory on Vercel serverless

## Before a Real Launch

This is a working hackathon prototype, not a production commerce platform. Before accepting real customers/payments, add:

- Authentication and role-based admin access
- A payment gateway and verified payment webhooks
- Database hosting and backups (replace JSON file storage)
- Server-side rate limiting, stronger validation and security headers
- Shipping, tax, returns, privacy and terms pages
- Real product photography, manufacturing validation and dog-safety testing

## Hackathon File Safety

This project contains only the PawQuest application files. It does **not** include, modify, or replace the organizer-provided `init.py`, `submit.py`, `hwa-start`, `opencode.json`, or the `.hwa` folder. Those files are excluded from git (`.gitignore`) and from Vercel deployment (`.vercelignore`) and must never be committed or deployed.
