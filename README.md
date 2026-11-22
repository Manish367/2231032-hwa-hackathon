# PawQuest — Happy While Away hackathon storefront

PawQuest is a concept product and demo e-commerce experience for the Happy While Away brief.

## Product idea

The PawQuest Enrichment Station is a modular, screen-free dog activity station. Its interchangeable activities invite a dog to sniff out hidden treats, nudge sliders and explore a rotating treat compartment. The product is designed around natural sniffing and problem-solving behaviours, with adjustable challenge options.

**Important product honesty:** the concept does not claim to prevent separation anxiety, replace human care, or guarantee a specific amount of time occupied. Dogs should be introduced to new enrichment while supervised, and the station should be removed if a dog chews or damages components.

## Included

- Responsive storefront and product catalogue
- Product detail information embedded in the product catalogue data
- Cart with quantity controls and local browser persistence
- Checkout form with basic validation
- Demo order API and JSON-file persistence
- Simple order dashboard at `/admin.html`
- Health endpoint at `/api/health`

## Run locally

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

## Demo checkout

Checkout is intentionally a **demo order flow**. It does not collect payment or store card details. Orders are saved to `data/orders.json` on the server. The data folder and JSON file are created automatically.

Place a test order from the storefront, then visit http://localhost:3000/admin.html to view it.

Optional admin protection:

```bash
# macOS/Linux
ADMIN_KEY=your-secret npm start

# PowerShell
$env:ADMIN_KEY="your-secret"
npm start
```

When `ADMIN_KEY` is configured, requests to `/api/admin/orders` must include the `x-admin-key` header. The included dashboard is intended for local/demo use; add a login flow before public production use.

## API

- `GET /api/health` — server health
- `GET /api/products` — list products
- `GET /api/products/:id` — product details
- `POST /api/orders` — create a demo order
- `GET /api/admin/orders` — list orders (optionally protected by `ADMIN_KEY`)

Example order body:

```json
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

## Before a real launch

This is a working hackathon prototype, not a production commerce platform. Before accepting real customers/payments, add:
- Authentication and role-based admin access
- A payment gateway and verified payment webhooks
- Database hosting and backups (replace JSON file storage)
- Server-side rate limiting, stronger validation and security headers
- Shipping, tax, returns, privacy and terms pages
- Real product photography, manufacturing validation and dog-safety testing

## Hackathon file safety

This ZIP contains only the PawQuest application files. It does **not** include, modify or replace the organizer-provided `init.py` or any organizer setup files. Place/extract this project only in a location permitted by the hackathon instructions. If the organizers supplied a starter project folder, check its rules before copying files into it.
