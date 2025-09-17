const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

class User {
  // Create new user (with password hashing)
  static async create(userData) {
    const hashedPassword = userData.password
      ? await bcrypt.hash(userData.password, 10)
      : null;

    const { data, error } = await supabase
      .from('users')
      .insert([{
        name: userData.name,
        email: userData.email,
        role: userData.role || 'student',
        password: hashedPassword,
        phone: userData.phone,
        date_of_birth: userData.dateOfBirth,
        gender: userData.gender,
        emergency_contact_name: userData.emergencyContactName,
        emergency_contact_phone: userData.emergencyContactPhone,
        medical_history: userData.medicalHistory,
        profile_picture_url: userData.profilePictureUrl
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async find(filter = {}) {
    let query = supabase.from('users').select('*');
    Object.keys(filter).forEach(key => {
      query = query.eq(key, filter[key]);
    });
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findOne(filter) {
    const key = Object.keys(filter)[0];
    const value = filter[key];
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq(key, value)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByIdAndUpdate(id, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async countDocuments(filter = {}) {
    let query = supabase.from('users').select('*', { count: 'exact', head: true });
    Object.keys(filter).forEach(key => {
      query = query.eq(key, filter[key]);
    });
    const { count, error } = await query;
    if (error) throw error;
    return count;
  }

  // Verify user password
  static async verifyPassword(email, password) {
    const user = await this.findOne({ email });
    if (!user || !user.password) {
      return false;
    }
    return await bcrypt.compare(password, user.password);
  }

  // Update user profile
  static async updateProfile(id, profileData) {
    const updateData = {
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update last login
  static async updateLastLogin(id) {
    const { data, error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get user statistics
  static async getUserStats(userId) {
    try {
      // Get appointment count
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get assessment count
      const { count: assessmentCount } = await supabase
        .from('assessments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get mood entries count
      const { count: moodEntryCount } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      return {
        appointments: appointmentCount || 0,
        assessments: assessmentCount || 0,
        moodEntries: moodEntryCount || 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Search users
  static async search(searchTerm, role = null) {
    let query = supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
    
    if (role) {
      query = query.eq('role', role);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}

module.exports = User;
