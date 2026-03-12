# Beer E-Commerce — Frontend

React SPA for a beer e-commerce challenge. Allows users to browse products, view details with real-time stock and pricing, and place orders through a cart.

---

## Tech Stack

| Tool | Version |
|------|---------|
| React | 19 |
| Vite | 7 |
| React Router | 7 |
| Vitest | 4 |
| @testing-library/react | 16 |

JavaScript only — no TypeScript.

---

## Requirements

- Node.js >= 18
- The [backend](../backend) must be running on port `3001`

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment variable

Create a `.env` file in this directory:

```env
VITE_API_URL=http://localhost:3001
```

If this file is missing, the app falls back to `http://localhost:3001` automatically.

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once and exit |

---

## Routes

| Path | Page | Auth required |
|------|------|:---:|
| `/` | Redirects to `/products` | — |
| `/login` | Login page | No |
| `/register` | Register page | No |
| `/products` | Product listing (PLP) | Yes |
| `/product/:slug` | Product detail (PDP) | Yes |
| `/cart` | Shopping cart | Yes |

Unauthenticated users are redirected to `/login` automatically.

### URL slug format

PDP routes follow the pattern `{id}-{brand-slug}`:

```
/product/127-modelo-especial
/product/374-miller-lite
/product/743-corona-premier
/product/841-budweiser
```

---

## Architecture

```
src/
├── context/
│   ├── AuthContext.jsx       # JWT token + user — persisted in localStorage
│   ├── CartContext.jsx       # Cart state with useReducer — persisted in localStorage
│   └── ProductsContext.jsx   # Products list — fetched once on login
│
├── hooks/
│   ├── useForm.js            # Generic form state + submit handler
│   ├── useLocalStorage.js    # State synced with localStorage
│   ├── useStockPrice.js      # Fetches and polls stock/price every 5s
│   ├── useProductById.js     # Resolves product from URL slug
│   └── useCheckout.js        # Checkout flow — validates stock, clears cart
│
├── services/
│   └── api.js                # All API calls (auth, products, stock, checkout)
│
├── pages/
│   ├── LoginPage/
│   ├── RegisterPage/
│   ├── ProductListPage/      # PLP
│   ├── ProductDetailPage/    # PDP — polls stock/price every 5s per spec
│   └── CartPage/
│
├── components/
│   ├── ProtectedRoute.jsx    # Redirects to /login if not authenticated
│   ├── header/Header.jsx     # Hamburger menu with logout
│   ├── plp/ProductCard.jsx   # Product card for PLP
│   └── pdp/VariantSelector.jsx
│
└── test/
    ├── setup.js
    ├── cartReducer.test.js
    ├── useForm.test.js
    ├── useLocalStorage.test.js
    ├── useStockPrice.test.js
    ├── ProtectedRoute.test.jsx
    └── LoginPage.test.jsx
```

---

## Authentication

JWT-based auth. The token is stored in `localStorage` and attached as a `Bearer` header on every API request.

**Demo credentials** (available on the login page):

| Email | Password |
|-------|----------|
| `admin@beer.com` | `admin123` |
| `john@beer.com` | `password123` |
| `jane@beer.com` | `beer1234` |

> These credentials are pre-filled on the login page as demo hints. Requires the backend to be running.

---

## Key Features

- **Real-time stock & price** — PDP polls `GET /api/stock-price/:sku` every 5 seconds. Interval is cleared on unmount.
- **Cart persistence** — Cart survives page refresh via `localStorage`.
- **Checkout with stock validation** — Sends the full cart to `POST /api/checkout`. If the backend rejects any item (insufficient stock or not found), the error is shown via `window.alert` and no order is placed.
- **Protected routes** — All product and cart routes require a valid JWT. Expired or missing tokens redirect to `/login`.
- **Logout** — Available in the hamburger menu (☰). Clears token and user from `localStorage`.

---

## CSS Rules

No CSS framework is used anywhere in this project. All styles are vanilla CSS.

---

## Running Tests

```bash
# Single run (CI-friendly)
npm run test:run

# Watch mode
npm test
```

### Test coverage

| File | What's tested |
|------|---------------|
| `cartReducer.test.js` | ADD_ITEM, REMOVE_ITEM, CLEAR_CART, quantity increment, unknown action |
| `useForm.test.js` | Initialization, handleChange, reset, submit, error handling, loading state |
| `useLocalStorage.test.js` | Hydration, persistence, null/undefined removal, invalid JSON fallback, updater function |
| `useStockPrice.test.js` | Initial fetch, polling every 5s, cleanup on unmount, SKU change, error handling, stale update prevention |
| `ProtectedRoute.test.jsx` | Renders children when authenticated, redirects to /login when not |
| `LoginPage.test.jsx` | Form rendering, demo credentials, redirect if authenticated, successful login, error alert, loading state |

> Tests use `jsdom` as environment and `vi.useFakeTimers()` for timer-dependent tests.

---

## Potential Improvements

### Features
- **Quantity control in cart** — currently items can only be added or fully removed; +/- controls per item would improve UX
- **Order history** — persist completed orders and show them in a dedicated page
- **Product search and filtering** — filter by style, ABV, origin or price range on the PLP
- **Ratings from backend** — ratings are currently hardcoded on the frontend; the backend could expose them per product

### Auth
- **Refresh token flow** — when the JWT expires the user is silently logged out; intercepting 401s and triggering a token refresh would allow seamless re-authentication
- **Token expiry detection** — if a 401 is received on any API call, automatically redirect to `/login` instead of showing an alert

### UX
- **Loading skeletons** — replace plain "Loading..." text with shimmer card placeholders on the PLP and PDP
- **Toast notifications** — replace `window.alert()` with an in-app toast system for errors and success messages (e.g. "Added to cart", "Order placed")
- **Add to cart feedback** — animate the cart badge when an item is added
- **Out of stock badge** — show a visual indicator on PLP cards when a product's first SKU is out of stock

### Technical
- **Test coverage for remaining components** — `CartPage`, `ProductCard`, and `useCheckout` are not yet covered
- **E2E tests** — add Playwright or Cypress tests for the full login → browse → checkout flow
