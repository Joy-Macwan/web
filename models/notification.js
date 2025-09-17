// models/notification.js
const supabase = require('../config/supabase');

class Notification {
  // Create new notification
  static async create(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: notificationData.userId,
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type || 'info',
        action_url: notificationData.actionUrl,
        expires_at: notificationData.expiresAt
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get notifications for a user
  static async findByUserId(userId, limit = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Get unread notifications for a user
  static async getUnreadByUserId(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Mark notification as read
  static async markAsRead(id) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Mark all notifications as read for a user
  static async markAllAsRead(userId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select();
    
    if (error) throw error;
    return data;
  }

  // Delete notification
  static async delete(id) {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get notification count for a user
  static async getUnreadCount(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    return count || 0;
  }

  // Create bulk notifications
  static async createBulk(notifications) {
    const { data, error } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();
    
    if (error) throw error;
    return data;
  }

  // Send notification to all users with specific role
  static async sendToRole(role, notificationData) {
    // First get all users with the specified role
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('role', role)
      .eq('is_active', true);
    
    if (userError) throw userError;
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      user_id: user.id,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      action_url: notificationData.actionUrl,
      expires_at: notificationData.expiresAt
    }));
    
    if (notifications.length > 0) {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notifications)
        .select();
      
      if (error) throw error;
      return data;
    }
    
    return [];
  }

  // Clean up expired notifications
  static async cleanupExpired() {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select();
    
    if (error) throw error;
    return data;
  }

  // Get notifications by type
  static async findByType(userId, type) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

module.exports = Notification;
