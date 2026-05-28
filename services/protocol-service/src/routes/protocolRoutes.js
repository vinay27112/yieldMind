import express from "express";
import {
  getAllProtocols,
  getProtocolByName,
  getBestRates,
} from "../controllers/protocolController.js";

const router = express.Router();

router.get("/", getAllProtocols);
router.get("/:protocol", getProtocolByName);
router.get("/rates/:symbol", getBestRates);

export default router;
