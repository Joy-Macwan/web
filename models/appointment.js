//model/appoiment.js
const supabase = require('../config/supabase');

class Appointment {
  static async create(appointmentData) {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async find(filter = {}) {
    let query = supabase.from('appointments').select('*');
    
    Object.keys(filter).forEach(key => {
      if (key === 'userId') {
        query = query.eq('user_id', filter[key]); // Note: user_id instead of userId
      } else {
        query = query.eq(key, filter[key]);
      }
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByIdAndUpdate(id, updateData) {
    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get appointments with user details (JOIN)
  static async findWithUser() {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `);
    
    if (error) throw error;
    return data;
  }
}

module.exports = Appointment;