import { Router } from "express";
import { getStockPriceBySku } from "../controllers/stockPriceController.js";

const router = Router();

router.get("/stock-price/:sku", getStockPriceBySku);

export default router;

