import sseModule from '../modules/sse/sse.module.js';
import { prismaClient } from '../config/database.js';


/**
 * Create notification dan kirim via SSE jika user online
 */
const createAndSendNotification = async ({
  userId,
  title,
  message,
  type = 'SYSTEM',
  priority = 'NORMAL',
  metadata = null,
  expiresAt = null,
}) => {
  try {
    // Create notification di database
    const notification = await prismaClient.inboxNotification.create({
      data: {
        userId,
        title,
        message,
        inboxNotificationId: type,
        priority,
        metadata,
        expiresAt,
        sentViaSSE: false,
      },
    });

    // Coba kirim via SSE jika user sedang online
    const sent = sseModule.sendNotificationToUser(userId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type,
      priority: notification.priority,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
    });

    // Update sentViaSSE status
    if (sent) {
      await prismaClient.inboxNotification.update({
        where: { id: notification.id },
        data: { sentViaSSE: true },
      });
    }

    return {
      notification,
      sentViaSSE: sent,
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Send welcome notification untuk user baru
 */
const sendWelcomeNotification = async (userId, userName) => {
  return createAndSendNotification({
    userId,
    title: '🎉 Selamat Datang!',
    message: `Halo ${userName}! Terima kasih telah bergabung dengan kami. Semoga Anda menikmati pengalaman berbelanja yang menyenangkan!`,
    type: 'WELCOME',
    priority: 'HIGHT',
    metadata: {
      category: 'onboarding',
      action: 'registration_complete',
    },
  });
};

/**
 * Send promo notification
 */
const sendPromoNotification = async (userId, promoData) => {
  return createAndSendNotification({
    userId,
    title: promoData.title,
    message: promoData.message,
    type: 'PROMO',
    priority: 'NORMAL',
    metadata: promoData.metadata,
    expiresAt: promoData.expiresAt,
  });
};

/**
 * Broadcast notification to multiple users
 */
const broadcastNotification = async (userIds, notificationData) => {
  const notifications = await Promise.allSettled(
    userIds.map((userId) =>
      createAndSendNotification({
        userId,
        ...notificationData,
      })
    )
  );

  const success = notifications.filter((n) => n.status === 'fulfilled').length;
  const failed = notifications.filter((n) => n.status === 'rejected').length;

  return {
    total: userIds.length,
    success,
    failed,
  };
};

/**
 * Get unread notifications untuk user
 */
const getUnreadNotifications = async (userId) => {
  return prismaClient.inboxNotification.findMany({
    where: {
      userId,
      isRead: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
  });
};

/**
 * Get all notifications dengan pagination
 */
const getUserNotifications = async (userId, { page = 1, limit = 20 }) => {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prismaClient.inboxNotification.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take: limit,
    }),
    prismaClient.inboxNotification.count({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    }),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  return prismaClient.inboxNotification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  return prismaClient.inboxNotification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });
};

/**
 * Delete notification
 */
const deleteNotification = async (notificationId, userId) => {
  return prismaClient.inboxNotification.deleteMany({
    where: {
      id: notificationId,
      userId,
    },
  });
};

/**
 * Get unread count
 */
const getUnreadCount = async (userId) => {
  return prismaClient.inboxNotification.count({
    where: {
      userId,
      isRead: false,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });
};

export default {
  createAndSendNotification,
  sendWelcomeNotification,
  sendPromoNotification,
  broadcastNotification,
  getUnreadNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
};