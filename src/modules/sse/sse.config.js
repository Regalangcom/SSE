export default {
  heartbeatInterval: parseInt(process.env.SSE_HEARTBEAT_INTERVAL) || 30000, // 30 seconds
  maxReconnectAttempts: parseInt(process.env.SSE_MAX_RECONNECT_ATTEMPTS) || 5,
  connectionTimeout: parseInt(process.env.SSE_CONNECTION_TIMEOUT) || 60000, // 1 minute
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no", 
  },
};
