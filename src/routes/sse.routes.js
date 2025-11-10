import express from "express";
import {
  checkUserConnection,
  connect,
  getStats,
  healthCheck,
  sendTestNotification,
} from "../controllers/sse.controller.js";
import { authenticateToken } from "../middleware/auth.midleware.js";

const routerSSE = express.Router();

// SSE Connection
routerSSE.get("/connect", authenticateToken, connect);

// Monitoring endpoints
routerSSE.get("/health", healthCheck);
routerSSE.get("/stats", authenticateToken, getStats);
routerSSE.get("/check/:userId", authenticateToken, checkUserConnection);

// Test endpoint
routerSSE.post("/test", authenticateToken, sendTestNotification);

export default routerSSE;
