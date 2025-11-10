import express from "express";
import authControllers from "../controllers/auth.controllers.js";
import {
  authenticateToken,
  validateRefreshToken,
} from "../middleware/auth.midleware.js";

const router = express.Router();

// Public routes
router.post("/register", authControllers.register);
router.post("/login", authControllers.login);

// Protected routes
router.post("/refresh", validateRefreshToken, authControllers.refresh);
router.get("/profile", authenticateToken, authControllers.getProfile);

export default router;
