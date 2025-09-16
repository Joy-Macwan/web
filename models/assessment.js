// models/Assessment.js
const supabase = require('../config/supabase');

class Assessment {
  static async create(assessmentData) {
    const { data, error } = await supabase
      .from('assessments')
      .insert([assessmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async find(filter = {}) {
    let query = supabase.from('assessments').select('*');
    
    Object.keys(filter).forEach(key => {
      query = query.eq(key, filter[key]);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByIdAndUpdate(id, updateData) {
    const { data, error } = await supabase
      .from('assessments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByIdAndDelete(id) {
    const { data, error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Assessment;