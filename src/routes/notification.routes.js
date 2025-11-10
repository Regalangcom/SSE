import express from "express";
import notificationController from "../controllers/notification.controller.js";

import { authenticateToken } from "../middleware/auth.midleware.js";

const routerNotif = express.Router();

// Get all notifications dengan pagination
routerNotif.get("/", authenticateToken, notificationController.getNotifications);

// Get unread notifications
routerNotif.get(
  "/unread",
  authenticateToken,
  notificationController.getUnreadNotifications
);

// Get unread count
routerNotif.get(
  "/unread/count",
  authenticateToken,
  notificationController.getUnreadCount
);

// Mark notification as read
routerNotif.patch("/:id/read", authenticateToken, notificationController.markAsRead);

// Mark all as read
routerNotif.patch(
  "/read-all",
  authenticateToken,
  notificationController.markAllAsRead
);

// Delete notification
routerNotif.delete(
  "/:id",
  authenticateToken,
  notificationController.deleteNotification
);

export default routerNotif;
