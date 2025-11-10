import express from "express";
import cors from "cors";

import router from "../routes/routes.js";
import routerNotif from "../routes/notification.routes.js";
import routerSSE from "../routes/sse.routes.js";
import cookieParser from "cookie-parser";

const app = express();

// Middleware
app.use(
  cors({
    origin:'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Request logging (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Mount all routes under /api
app.use("/api/v1/users", router);
app.use("/api/v1/notification", routerNotif);
app.use("/api/v1/sse", routerSSE);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// Export app untuk digunakan di server.js
export default app;
