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
        password: hashedPassword
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
}

module.exports = User;
