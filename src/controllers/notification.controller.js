import notificationService from '../service/notification.service.js';

/**
 * Get user notifications dengan pagination
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
};

/**
 * Get unread notifications
 */
const getUnreadNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notifications = await notificationService.getUnreadNotifications(
      userId
    );

    res.json({
      notifications,
      count: notifications.length,
    });
  } catch (error) {
    console.error('Error getting unread notifications:', error);
    res.status(500).json({ error: 'Failed to get unread notifications' });
  }
};

/**
 * Get unread count
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await notificationService.getUnreadCount(userId);

    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

/**
 * Mark notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await notificationService.markAsRead(id, userId);

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await notificationService.markAllAsRead(userId);

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

/**
 * Delete notification
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    await notificationService.deleteNotification(id, userId);

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

export default {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};