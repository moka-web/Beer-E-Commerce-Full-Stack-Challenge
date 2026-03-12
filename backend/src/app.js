import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import productsRoutes from "./routes/products.routes.js";
import stockPriceRoutes from "./routes/stockPrice.routes.js";
import authRoutes from "./routes/auth.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import { authenticate } from "./middleware/authenticate.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json());

app.use("/products", express.static(path.join(__dirname, "..", "public")));

app.use("/api/auth", authRoutes);
app.use("/api", authenticate, productsRoutes);
app.use("/api", authenticate, stockPriceRoutes);
app.use("/api", authenticate, checkoutRoutes);

export default app;
