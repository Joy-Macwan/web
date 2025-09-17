// models/counselor.js
const supabase = require('../config/supabase');

class Counselor {
  // Create new counselor profile
  static async create(counselorData) {
    const { data, error } = await supabase
      .from('counselors')
      .insert([{
        user_id: counselorData.userId,
        license_number: counselorData.licenseNumber,
        specialization: counselorData.specialization,
        years_of_experience: counselorData.yearsOfExperience,
        education: counselorData.education,
        bio: counselorData.bio,
        availability_schedule: counselorData.availabilitySchedule,
        hourly_rate: counselorData.hourlyRate
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Find counselors with user details
  static async findWithUserDetails(filter = {}) {
    let query = supabase
      .from('counselors')
      .select(`
        *,
        users (
          id,
          name,
          email,
          phone,
          profile_picture_url
        )
      `);
    
    Object.keys(filter).forEach(key => {
      query = query.eq(key, filter[key]);
    });
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Find counselor by user ID
  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from('counselors')
      .select(`
        *,
        users (
          id,
          name,
          email,
          phone,
          profile_picture_url
        )
      `)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get available counselors
  static async getAvailable() {
    const { data, error } = await supabase
      .from('counselors')
      .select(`
        *,
        users (
          id,
          name,
          email,
          profile_picture_url
        )
      `)
      .eq('is_verified', true)
      .eq('users.is_active', true);
    
    if (error) throw error;
    return data;
  }

  // Update counselor profile
  static async updateProfile(id, updateData) {
    const { data, error } = await supabase
      .from('counselors')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update counselor rating
  static async updateRating(counselorId, newRating) {
    // First get current rating and session count
    const { data: currentData, error: fetchError } = await supabase
      .from('counselors')
      .select('rating, total_sessions')
      .eq('id', counselorId)
      .single();
    
    if (fetchError) throw fetchError;
    
    const currentRating = currentData.rating || 0;
    const totalSessions = currentData.total_sessions || 0;
    
    // Calculate new average rating
    const newAverageRating = ((currentRating * totalSessions) + newRating) / (totalSessions + 1);
    
    const { data, error } = await supabase
      .from('counselors')
      .update({
        rating: Math.round(newAverageRating * 100) / 100, // Round to 2 decimal places
        total_sessions: totalSessions + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', counselorId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Search counselors by specialization
  static async searchBySpecialization(specialization) {
    const { data, error } = await supabase
      .from('counselors')
      .select(`
        *,
        users (
          id,
          name,
          email,
          profile_picture_url
        )
      `)
      .contains('specialization', [specialization])
      .eq('is_verified', true);
    
    if (error) throw error;
    return data;
  }

  // Get counselor statistics
  static async getStats(counselorId) {
    try {
      // Get appointment count
      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('counselor_id', counselorId);

      // Get completed appointments
      const { count: completedCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('counselor_id', counselorId)
        .eq('status', 'completed');

      // Get average rating from appointments
      const { data: ratingData } = await supabase
        .from('appointments')
        .select('rating')
        .eq('counselor_id', counselorId)
        .not('rating', 'is', null);

      const avgRating = ratingData.length > 0 
        ? ratingData.reduce((sum, app) => sum + app.rating, 0) / ratingData.length 
        : 0;

      return {
        totalAppointments: appointmentCount || 0,
        completedAppointments: completedCount || 0,
        averageRating: Math.round(avgRating * 100) / 100
      };
    } catch (error) {
      throw error;
    }
  }

  // Verify counselor
  static async verify(counselorId, isVerified = true) {
    const { data, error } = await supabase
      .from('counselors')
      .update({
        is_verified: isVerified,
        updated_at: new Date().toISOString()
      })
      .eq('id', counselorId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = Counselor;
