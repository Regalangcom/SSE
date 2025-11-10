// import sseModule from '../modules/sse/sse.module.js';

// /**
//  * SSE Connection endpoint
//  */
// const connect = (req, res) => {
//   const userId = req.user.id;
//   const userEmail = req.user.email;

//   // Initialize SSE connection dengan metadata
//   sseModule.initializeSSEConnection(userId, res, req, {
//     email: userEmail,
//     userAgent: req.headers['user-agent'],
//     ip: req.ip || req.connection.remoteAddress,
//   });

  
// };

// /**
//  * Get SSE connection stats
//  */
// const getStats = (req, res) => {
//   const stats = sseModule.getConnectionStats();

//   res.json({
//     success: true,
//     data: stats,
//   });
// };

// /**
//  * Disconnect user (admin only)
//  */
// const disconnectUser = (req, res) => {
//   const { userId } = req.params;

//   const success = sseModule.disconnectUser(userId);

//   if (success) {
//     res.json({
//       success: true,
//       message: `User ${userId} disconnected`,
//     });
//   } else {
//     res.status(404).json({
//       success: false,
//       error: 'User not connected',
//     });
//   }
// };

// /**
//  * Broadcast message to all users (admin only)
//  */
// const broadcastMessage = (req, res) => {
//   const { event, data } = req.body;

//   const result = sseModule.broadcast(event || 'broadcast', data);

//   res.json({
//     success: true,
//     message: 'Broadcast sent',
//     data: result,
//   });
// };

// export   {
//   connect,
//   getStats,
//   disconnectUser,
//   broadcastMessage,
// };


import sseModule from '../modules/sse/sse.module.js';

/**
 * SSE Connection endpoint
 */
const connect = (req, res) => {
  const userId = req.user.userId;
  const userEmail = req.user.email;

  sseModule.initializeSSEConnection(userId, res, req, {
    email: userEmail,
    userAgent: req.headers['user-agent'],
    ip: req.ip || req.connection.remoteAddress,
  });
};

/**
 * Get SSE connection stats
 */
const getStats = (req, res) => {
  const stats = sseModule.getConnectionStats();

  res.json({
    success: true,
    data: stats,
  });
};

/**
 * Check if specific user is connected
 */
const checkUserConnection = (req, res) => {
  const { userId } = req.params;

  const isConnected = sseModule.isUserConnected(userId);

  res.json({
    success: true,
    data: {
      userId,
      connected: isConnected,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Send test notification to current user
 */
const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.userId;

    const sent = sseModule.sendNotificationToUser(userId, {
      id: `test-${Date.now()}`,
      title: '🧪 Test Notification',
      message: 'This is a test notification from SSE!',
      type: 'SYSTEM',
      priority: 'NORMAL',
      createdAt: new Date().toISOString(),
      isRead: false,
    });

    res.json({
      success: true,
      message: sent
        ? 'Test notification sent successfully'
        : 'User not connected',
      data: { sent },
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send test notification',
    });
  }
};

/**
 * Health check for SSE
 */
const healthCheck = (req, res) => {
  const stats = sseModule.getConnectionStats();

  res.json({
    success: true,
    message: 'SSE service is running',
    data: {
      totalConnections: stats.totalConnections,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
};

export {
  connect,
  getStats,
  checkUserConnection,
  sendTestNotification,
  healthCheck,
};