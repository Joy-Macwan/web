// models/moodEntry.js
const supabase = require('../config/supabase');

class MoodEntry {
  // Create new mood entry
  static async create(moodData) {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert([{
        user_id: moodData.userId,
        mood_level: moodData.moodLevel,
        emotions: moodData.emotions,
        notes: moodData.notes,
        activities: moodData.activities,
        sleep_hours: moodData.sleepHours,
        stress_level: moodData.stressLevel,
        energy_level: moodData.energyLevel,
        entry_date: moodData.entryDate || new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get mood entries for a user
  static async findByUserId(userId, limit = 30) {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  // Get mood entries for a date range
  static async findByDateRange(userId, startDate, endDate) {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // Update mood entry
  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('mood_entries')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Delete mood entry
  static async delete(id) {
    const { data, error } = await supabase
      .from('mood_entries')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get mood statistics for a user
  static async getMoodStats(userId, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('mood_entries')
      .select('mood_level, stress_level, energy_level, sleep_hours, entry_date')
      .eq('user_id', userId)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .lte('entry_date', endDate.toISOString().split('T')[0])
      .order('entry_date', { ascending: true });
    
    if (error) throw error;
    
    if (data.length === 0) {
      return {
        averageMood: 0,
        averageStress: 0,
        averageEnergy: 0,
        averageSleep: 0,
        totalEntries: 0,
        trend: 'neutral'
      };
    }

    // Calculate averages
    const averageMood = data.reduce((sum, entry) => sum + (entry.mood_level || 0), 0) / data.length;
    const averageStress = data.reduce((sum, entry) => sum + (entry.stress_level || 0), 0) / data.length;
    const averageEnergy = data.reduce((sum, entry) => sum + (entry.energy_level || 0), 0) / data.length;
    const averageSleep = data.reduce((sum, entry) => sum + (entry.sleep_hours || 0), 0) / data.length;

    // Calculate trend (comparing first half to second half)
    const midPoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midPoint);
    const secondHalf = data.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + (entry.mood_level || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + (entry.mood_level || 0), 0) / secondHalf.length;

    let trend = 'neutral';
    if (secondHalfAvg > firstHalfAvg + 0.5) trend = 'improving';
    else if (secondHalfAvg < firstHalfAvg - 0.5) trend = 'declining';

    return {
      averageMood: Math.round(averageMood * 100) / 100,
      averageStress: Math.round(averageStress * 100) / 100,
      averageEnergy: Math.round(averageEnergy * 100) / 100,
      averageSleep: Math.round(averageSleep * 100) / 100,
      totalEntries: data.length,
      trend,
      entries: data
    };
  }

  // Get mood entry for specific date
  static async findByDate(userId, date) {
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Get most common emotions for a user
  static async getCommonEmotions(userId, days = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('mood_entries')
      .select('emotions')
      .eq('user_id', userId)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .lte('entry_date', endDate.toISOString().split('T')[0]);
    
    if (error) throw error;
    
    // Flatten and count emotions
    const emotionCounts = {};
    data.forEach(entry => {
      if (entry.emotions && Array.isArray(entry.emotions)) {
        entry.emotions.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      }
    });

    // Sort by frequency
    const sortedEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 emotions

    return sortedEmotions.map(([emotion, count]) => ({ emotion, count }));
  }
}

module.exports = MoodEntry;
