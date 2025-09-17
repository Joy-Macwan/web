// utils/database.js
const supabase = require('../config/supabase');
const fs = require('fs');
const path = require('path');

class DatabaseManager {
  /**
   * Initialize the database with all required tables
   */
  static async initializeDatabase() {
    try {
      console.log('🔄 Initializing database...');
      
      // Read the SQL file
      const sqlPath = path.join(__dirname, '../config/database.sql');
      const sqlContent = fs.readFileSync(sqlPath, 'utf8');
      
      // Split SQL commands (basic splitting by semicolon)
      const commands = sqlContent
        .split(';')
        .map(cmd => cmd.trim())
        .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
      
      console.log(`📝 Found ${commands.length} SQL commands to execute`);
      
      // Execute each command
      for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: command });
            if (error) {
              console.warn(`⚠️ Warning executing command ${i + 1}: ${error.message}`);
            }
          } catch (err) {
            console.warn(`⚠️ Warning executing command ${i + 1}: ${err.message}`);
          }
        }
      }
      
      console.log('✅ Database initialization completed');
      return { success: true, message: 'Database initialized successfully' };
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test database connection
   */
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        throw error;
      }
      
      console.log('✅ Database connection successful');
      return { success: true, message: 'Database connection successful' };
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get database statistics
   */
  static async getDatabaseStats() {
    try {
      const tables = [
        'users', 'counselors', 'appointments', 'assessments', 
        'chat_sessions', 'forum_posts', 'resources', 'mood_entries'
      ];
      
      const stats = {};
      
      for (const table of tables) {
        try {
          const { count, error } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true });
          
          if (!error) {
            stats[table] = count || 0;
          }
        } catch (err) {
          stats[table] = 'Error';
        }
      }
      
      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new user with proper validation
   */
  static async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          name: userData.name,
          email: userData.email,
          password: userData.password, // Should be hashed before calling this
          role: userData.role || 'student',
          phone: userData.phone,
          date_of_birth: userData.dateOfBirth,
          gender: userData.gender,
          emergency_contact_name: userData.emergencyContactName,
          emergency_contact_phone: userData.emergencyContactPhone
        }])
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Backup database data
   */
  static async backupData() {
    try {
      const tables = [
        'users', 'counselors', 'appointments', 'assessments',
        'chat_sessions', 'forum_posts', 'resources', 'crisis_contacts'
      ];
      
      const backup = {
        timestamp: new Date().toISOString(),
        data: {}
      };
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*');
          
          if (!error) {
            backup.data[table] = data;
          }
        } catch (err) {
          console.warn(`Warning backing up ${table}:`, err.message);
        }
      }
      
      return { success: true, backup };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Clean up old data
   */
  static async cleanupOldData(daysOld = 90) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      // Clean up old notifications
      const { error: notifError } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('is_read', true);
      
      // Clean up old chat sessions
      const { error: chatError } = await supabase
        .from('chat_sessions')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .eq('status', 'ended');
      
      return { 
        success: true, 
        message: `Cleaned up data older than ${daysOld} days` 
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = DatabaseManager;
