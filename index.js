// require('dotenv').config();
import dotenv from "dotenv"
dotenv.config()
import app from './src/config/app.js';
import sseModule from './src/modules/sse/sse.module.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════╗
║  🚀 Server is running!               ║
║  📡 Port: ${PORT}                      ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}       ║
║  ⏰ Started at: ${new Date().toLocaleString()}  ║
╚═══════════════════════════════════════╝
  `);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} signal received: closing HTTP server`);

  // Cleanup SSE connections
  sseModule.cleanup();

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;