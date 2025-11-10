import sseConfig from "./sse.config.js";

/**
 * SSE Connection Manager
 * Manages all SSE connections and client states
 */
class SSEConnectionManager {
  constructor() {
    // Map untuk menyimpan connection per user
    // Key: userId, Value: { res, heartbeatInterval, connectedAt, metadata }
    this.clients = new Map();
  }

  /**
   * Add new client connection
   */
  addClient(userId, res, req, metadata = {}) {
    // Close existing connection if any
    if (this.clients.has(userId)) {
      this.removeClient(userId);
    }

    // Setup heartbeat
    const heartbeatInterval = setInterval(() => {
      this.sendHeartbeat(userId);
    }, sseConfig.heartbeatInterval);

    // Store client info
    this.clients.set(userId, {
      res,
      req,
      heartbeatInterval,
      connectedAt: new Date(),
      metadata,
    });

    console.log(`[SSE] Client connected: ${userId}`);
  }

  /**
   * Remove client connection
   */
  removeClient(userId) {
    const client = this.clients.get(userId);
    if (!client) return false;

    // Clear heartbeat
    if (client.heartbeatInterval) {
      clearInterval(client.heartbeatInterval);
    }

    // Close connection
    try {
      client.res.end();
    } catch (error) {
      console.error(`[SSE] Error closing connection for ${userId}:`, error);
    }

    this.clients.delete(userId);
    console.log(`[SSE] Client disconnected: ${userId}`);

    return true;
  }

  /**
   * Get client connection
   */
  getClient(userId) {
    return this.clients.get(userId);
  }

  /**
   * Check if user is connected
   */
  isConnected(userId) {
    return this.clients.has(userId);
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUserIds() {
    return Array.from(this.clients.keys());
  }

  /**
   * Get total active connections
   */
  getConnectionCount() {
    return this.clients.size;
  }

  /**
   * Send heartbeat to specific user
   */
  sendHeartbeat(userId) {
    const client = this.clients.get(userId);
    if (!client) return false;

    try {
      client.res.write(": heartbeat\n\n");
      return true;
    } catch (error) {
      console.error(`[SSE] Heartbeat failed for ${userId}:`, error);
      this.removeClient(userId);
      return false;
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const stats = {
      totalConnections: this.clients.size,
      connections: [],
    };

    this.clients.forEach((client, userId) => {
      stats.connections.push({
        userId,
        connectedAt: client.connectedAt,
        duration: Date.now() - client.connectedAt.getTime(),
        metadata: client.metadata,
      });
    });

    return stats;
  }

  /**
   * Cleanup all connections
   */
  cleanup() {
    console.log("[SSE] Cleaning up all connections...");
    const userIds = Array.from(this.clients.keys());
    userIds.forEach((userId) => this.removeClient(userId));
    console.log("[SSE] Cleanup completed");
  }
}

// Singleton instance
const connectionManager = new SSEConnectionManager();

export default connectionManager;
