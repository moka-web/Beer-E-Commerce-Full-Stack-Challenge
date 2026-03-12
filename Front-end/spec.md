# Frontend Spec — Beer E-Commerce Challenge

## Stack
- React 19 + Vite
- JavaScript (no TypeScript)
- Routing: `react-router-dom`
- PLP: any CSS library allowed
- PDP: vanilla CSS only (no CSS frameworks)

## Folder Structure

```
src/
  pages/
    ProductListPage.jsx       # PLP — route /products
    ProductDetailPage.jsx     # PDP — route /product/:slug
  components/
    plp/
      ProductCard.jsx         # Card individual de producto
    pdp/
      ProductInfo.jsx         # Info estática del producto (brand, style, abv, origin, description)
      VariantSelector.jsx     # Lista de SKUs con precio y stock en tiempo real
  services/
    api.js                    # Todas las llamadas al backend
  App.jsx
  main.jsx
```

## Routes

| Path | Page | Notes |
|---|---|---|
| `/products` | ProductListPage | redirect from `/` |
| `/product/:slug` | ProductDetailPage | slug format: `{id}-{brand-slug}` e.g. `127-modelo-especial` |
| `/cart` | CartPage | lista de items agregados al carrito |

## Pages

### PLP — `/products`

- Fetch `GET /api/products` al montar
- Mostrar una card por producto con: imagen, brand, style, substyle, ABV, origin
- Click en card navega a `/product/{id}-{brand-slug}`
- Brand slug: lowercase, espacios reemplazados por `-`
- Mientras carga: estado de loading
- Error en fetch: `window.alert()`

### PDP — `/product/:slug`

- Extraer `id` del slug para identificar el producto
- Fetch `GET /api/products` para obtener los datos del producto
- Mostrar: brand, style, substyle, ABV, origin, description, imagen
- Mostrar lista de SKUs (variantes de tamaño)
- Por cada SKU, fetch `GET /api/stock-price/:sku` para precio y stock
- **Polling cada 5 segundos** sobre stock/precio de todos los SKUs del producto
- Precio viene en centavos → dividir por 100 y formatear como USD
- Stock 0 → mostrar "Out of stock"
- Botón "Add to cart" → `window.alert('Add to cart not implemented')`
- Error en fetch: `window.alert()`
- Limpiar interval al desmontar el componente

## Services — `src/services/api.js`

```js
const BASE_URL = 'http://localhost:3001'

export const getProducts = () => fetch(`${BASE_URL}/api/products`).then(r => r.json())
export const getStockPrice = (sku) => fetch(`${BASE_URL}/api/stock-price/${sku}`).then(r => r.json())
```

## Vite Config

Sin cambios adicionales. El backend ya tiene CORS habilitado para `*`.

## CSS Rules

- **PLP:** se puede usar cualquier librería (Tailwind, Bootstrap, etc.)
- **PDP:** solo vanilla CSS — el archivo CSS vive en `src/pages/ProductDetailPage.css` o en un módulo CSS por componente

## Data Reference

### Productos disponibles
| id | brand | image |
|---|---|---|
| 127 | Modelo Especial | /products/modelo-especial.jpeg |
| 374 | Miller Lite | /products/miller-lite.png |
| 743 | Corona Premier | /products/corona.jpg |
| 841 | Budweiser | /products/budweiser.jpg |

### Campos por producto
`id`, `brand`, `image`, `style`, `substyle`, `abv`, `origin`, `information`, `skus[]`

### Campos por SKU
`code` (usado para stock-price), `name` (label del tamaño)

### Stock-price response
```json
{ "stock": 130, "price": 2865 }
```
Precio en centavos → `(price / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })`

## Action Plan

- [x] 1. Instalar `react-router-dom`
- [x] 2. Limpiar boilerplate (App.css, index.css, App.jsx)
- [x] 3. Crear `src/services/api.js`
- [x] 5. Configurar rutas en `App.jsx`
- [x] 6. Implementar PLP (`ProductListPage` + `ProductCard`)
- [x] 7. Implementar PDP (`ProductDetailPage` + `ProductInfo` + `VariantSelector`)
- [x] 8. Verificar polling y cleanup del interval en PDP
- [x] 9. Verificar navegación y slugs

## Mejoras — Fase 2

### Variables de entorno
- [x] 10. Crear `.env` con `VITE_API_URL=http://localhost:3001`
  - `api.js` usa `import.meta.env.VITE_API_URL` en lugar de string hardcodeado
  - Exportar helper `getImageUrl(path)` desde `api.js`
  - Eliminar `BASE_URL` hardcodeado de `ProductCard.jsx` e `ProductInfo.jsx`, importar `getImageUrl`

### Context
- [x] 11. Crear `src/context/ProductsContext.jsx`
  - Fetch de `GET /api/products` una sola vez al montar
  - Expone `{ products, loading, error }` vía hook `useProducts()`
  - `ProductListPage` y `ProductDetailPage` consumen el context → elimina el fetch duplicado en PDP
- [x] 12. Crear `src/context/CartContext.jsx`
  - Estado del carrito con `useReducer`
  - Acciones: `ADD_ITEM`, `REMOVE_ITEM`, `CLEAR_CART`
  - Expone `{ cart, addItem, removeItem, clearCart, totalItems }` vía hook `useCart()`
  - `VariantSelector` usa `addItem` en lugar de `window.alert`

### Fixes
- [x] 13. Fix `useEffect` en `VariantSelector` — `fetchAll` movido dentro del effect para evitar stale closure sobre `skus`

### App.jsx
- [x] 14. Envolver la app con `<ProductsProvider>` y `<CartProvider>`

## Mejoras — Fase 3

### CartPage
- [x] 15. Crear `src/components/Nav.jsx` — navbar global con link a `/products` y botón carrito con contador (`totalItems`)
- [x] 16. Crear `src/pages/CartPage.jsx`
  - Estado vacío: mensaje + botón "Back to products"
  - Lista de items: brand, sku name, cantidad, precio unitario, subtotal por item
  - Total general
  - Botón "Remove" por item → `removeItem(sku)`
  - Botón "Clear cart" → `clearCart()`
  - Botón "Continue shopping" → navega a `/products`
- [x] 17. Agregar ruta `/cart` en `App.jsx` y montar `<Nav />` global
