# Beer E-Commerce — Backend

REST API for a beer e-commerce challenge. Handles authentication, product listing, real-time stock and pricing, and checkout with stock validation.

---

## Tech Stack

| Tool | Version |
|------|---------|
| Node.js | >= 18 |
| Express | 5 |
| jsonwebtoken | 9 |
| bcryptjs | 3 |
| nodemon | 3 (dev) |

JavaScript only — no TypeScript. ESModules (`import/export`).

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server (with auto-reload)
pnpm dev

# Start production server
pnpm start
```

The server runs on `http://localhost:3001`.

### Environment variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `PORT` | No | `3001` | Port the server listens on |
| `JWT_SECRET` | Yes* | `beer-challenge-dev-secret` | Secret used to sign JWT tokens |

> *A warning is printed on startup if `JWT_SECRET` is not set. Never use the default in production.

Create a `.env` file if needed:

```env
PORT=3001
JWT_SECRET=your-strong-secret-here
```

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start with nodemon (auto-reload on file changes) |
| `pnpm start` | Start without auto-reload |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once and exit |

---

## Running Tests

```bash
pnpm test:run
```

Uses Jest with `--experimental-vm-modules` for ESModules support.

### Test coverage

| File | What's tested |
|------|---------------|
| `users.test.js` | `findByEmail` (null, found), `createUser` (id, email, incrementing ids) |
| `stockStore.test.js` | `getEntry` (null, known SKU), `decrementStock` (quantity, to zero, price unchanged) |
| `authenticate.test.js` | No header, wrong format, valid token → `next()` + `req.user`, tampered token, expired token, wrong secret |
| `authController.test.js` | `register` (missing fields, invalid email, short password, 201 success, 409 duplicate), `login` (missing fields, not found, wrong password, 200 success) |
| `checkoutController.test.js` | Empty cart, missing items, SKU not found, insufficient stock, 200 success, atomicity (no partial decrement on failure) |

> `JWT_SECRET` warnings during test runs are expected — no `.env` file is present in the test environment and the insecure default is used.

---

## API Reference

### Auth — public endpoints

#### `POST /api/auth/register`

Creates a new user account and returns a JWT token.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| `201` | `{ token, user: { id, email } }` |
| `400` | Missing fields / invalid email / password too short (min 6 chars) |
| `409` | Email already registered |

---

#### `POST /api/auth/login`

Authenticates a user and returns a JWT token.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Responses:**

| Status | Description |
|--------|-------------|
| `200` | `{ token, user: { id, email } }` |
| `400` | Missing fields |
| `401` | Invalid credentials |

---

### Protected endpoints

All routes below require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

#### `GET /api/products`

Returns all available products.

**Response `200`:**
```json
[
  {
    "id": 127,
    "brand": "Modelo Especial",
    "image": "/products/modelo-especial.jpeg",
    "style": "Lager",
    "substyle": "Light Lager",
    "abv": "4.4%",
    "origin": "Import",
    "information": "...",
    "skus": [
      { "code": "10167", "name": "12 - 24oz Cans" }
    ]
  }
]
```

---

#### `GET /api/stock-price/:sku`

Returns current stock and price for a given SKU. Price is in cents.

**Response `200`:**
```json
{ "stock": 130, "price": 2865 }
```

| Status | Description |
|--------|-------------|
| `200` | Stock and price data |
| `401` | Missing or invalid token |
| `404` | SKU not found |

---

#### `POST /api/checkout`

Validates stock availability for all cart items and decrements stock if all pass.

**Request body:**
```json
{
  "items": [
    { "sku": "10167", "name": "12 - 24oz Cans", "quantity": 2 }
  ]
}
```

**Validation is atomic** — if any item fails (not found or insufficient stock), no stock is decremented.

| Status | Description |
|--------|-------------|
| `200` | `{ message: "Order placed successfully" }` |
| `400` | Empty cart |
| `401` | Missing or invalid token |
| `404` | SKU not found |
| `409` | Insufficient stock — includes item name, available and requested quantities |

---

### Static files

Product images are served statically:

```
GET /products/:filename
```

Example: `GET /products/modelo-especial.jpeg`

---

## Architecture

```
backend/
├── index.js                        # Entry point — seeds users, starts server
├── data/
│   ├── products.js                 # Static product catalog (do not modify)
│   └── stock-price.js              # Initial stock and prices (do not modify)
└── src/
    ├── app.js                      # Express setup — CORS, middleware, routes
    ├── config.js                   # JWT_SECRET and token expiry
    ├── routes/
    │   ├── auth.routes.js
    │   ├── products.routes.js
    │   ├── stockPrice.routes.js
    │   └── checkout.routes.js
    ├── controllers/
    │   ├── authController.js       # register + login logic
    │   ├── productsController.js
    │   ├── stockPriceController.js
    │   └── checkoutController.js   # two-phase stock validation + decrement
    ├── middleware/
    │   └── authenticate.js         # JWT Bearer token guard
    └── data/
        ├── users.js                # In-memory user store + seed function
        ├── mockUsers.js            # Dev-only mock credentials
        └── stockStore.js           # Mutable copy of stock-price.js
```

---

## Data Layer

All data is stored **in memory** — no database. Data resets on server restart.

| Store | File | Description |
|-------|------|-------------|
| Products | `data/products.js` | Static — never modified at runtime |
| Stock & price | `src/data/stockStore.js` | Mutable copy of `data/stock-price.js` — decremented on checkout |
| Users | `src/data/users.js` | In-memory array, seeded on startup |

---

## Mock Users

The following users are available on every server start:

| Email | Password |
|-------|----------|
| `admin@beer.com` | `admin123` |
| `john@beer.com` | `password123` |
| `jane@beer.com` | `beer1234` |

---

## Potential Improvements

- **Persistent database** — replace in-memory stores with SQLite or PostgreSQL
- **Refresh tokens** — current tokens expire in 7 days with no renewal mechanism
- **Rate limiting** — protect auth endpoints against brute-force attacks
- **Environment-based CORS** — restrict `Access-Control-Allow-Origin` to the frontend URL instead of `*`
- **Ratings endpoint** — expose ratings per product so the frontend doesn't need to hardcode them
- **Unit tests** — add Vitest or Jest tests for `authController` and `checkoutController`
