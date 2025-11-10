import connectionManager from './sse.manager.js';
import sseConfig from './sse.config.js';

/**
 * Setup SSE headers
 */
const setupSSEHeaders = (res) => {
  Object.entries(sseConfig.headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
};

/**
 * Send SSE event
 */
const sendSSEEvent = (res, event, data = null, id = null) => {
  try {
    let message = '';

    if (id) {
      message += `id: ${id}\n`;
    }

    if (event) {
      message += `event: ${event}\n`;
    }

    if (data) {
      const dataString = typeof data === 'string' ? data : JSON.stringify(data);
      message += `data: ${dataString}\n`;
    }

    message += '\n';

    res.write(message);
    return true;
  } catch (error) {
    console.error('[SSE] Error sending event:', error);
    return false;
  }
};

/**
 * Send SSE data (default message event)
 */
const sendSSEData = (res, data) => {
  return sendSSEEvent(res, null, data);
};

/**
 * Send SSE comment (for heartbeat)
 */
const sendSSEComment = (res, comment = 'heartbeat') => {
  try {
    res.write(`: ${comment}\n\n`);
    return true;
  } catch (error) {
    console.error('[SSE] Error sending comment:', error);
    return false;
  }
};

/**
 * Initialize SSE connection
 */
const initializeSSEConnection = (userId, res, req, metadata = {}) => {
  // Setup headers
  setupSSEHeaders(res);
  res.status(200);

  // Send initial connection event
  sendSSEEvent(res, 'connected', {
    message: 'ping',
    timestamp: new Date().toISOString(),
    config: {
      heartbeatInterval: sseConfig.heartbeatInterval,
    },
  });

  // Add to connection manager
  connectionManager.addClient(userId, res, req, metadata);

  // Handle client disconnect
  req.on('close', () => {
    connectionManager.removeClient(userId);
  });

  req.on('error', (error) => {
    console.error(`[SSE] Request error for ${userId}:`, error);
    connectionManager.removeClient(userId);
  });
};

/**
 * Send event to specific user
 */
const sendToUser = (userId, event, data) => {
  const client = connectionManager.getClient(userId);
  if (!client) return false;

  return sendSSEEvent(client.res, event, data);
};

/**
 * Send data to specific user (default message event)
 */
const sendDataToUser = (userId, data) => {
  return sendToUser(userId, 'message', data);
};

/**
 * Send notification to user
 */
const sendNotificationToUser = (userId, notification) => {
  return sendToUser(userId, 'notification', {
    ...notification,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Broadcast to all connected users
 */
const broadcast = (event, data) => {
  const userIds = connectionManager.getConnectedUserIds();
  let successCount = 0;

  userIds.forEach((userId) => {
    if (sendToUser(userId, event, data)) {
      successCount++;
    }
  });

  return {
    total: userIds.length,
    success: successCount,
    failed: userIds.length - successCount,
  };
};

/**
 * Broadcast to multiple specific users
 */
const broadcastToUsers = (userIds, event, data) => {
  let successCount = 0;

  userIds.forEach((userId) => {
    if (sendToUser(userId, event, data)) {
      successCount++;
    }
  });

  return {
    total: userIds.length,
    success: successCount,
    failed: userIds.length - successCount,
  };
};

/**
 * Check if user is connected
 */
const isUserConnected = (userId) => {
  return connectionManager.isConnected(userId);
};

/**
 * Get connection stats
 */
const getConnectionStats = () => {
  return connectionManager.getStats();
};

/**
 * Disconnect user
 */
const disconnectUser = (userId) => {
  return connectionManager.removeClient(userId);
};

/**
 * Cleanup all connections (for graceful shutdown)
 */
const cleanup = () => {
  connectionManager.cleanup();
};

export default  {
  // Core functions
  initializeSSEConnection,
  setupSSEHeaders,

  // Send functions
  sendSSEEvent,
  sendSSEData,
  sendSSEComment,
  sendToUser,
  sendDataToUser,
  sendNotificationToUser,

  // Broadcast functions
  broadcast,
  broadcastToUsers,

  // Connection management
  isUserConnected,
  disconnectUser,
  getConnectionStats,
  cleanup,

  // Direct access to manager
  connectionManager,
};