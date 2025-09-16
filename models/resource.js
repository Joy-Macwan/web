// models/Resource.js
const supabase = require('../config/supabase');

class Resource {
  // Create a resource
  static async create(resourceData) {
    const { data, error } = await supabase
      .from('resources')
      .insert([{
        title: resourceData.title,
        description: resourceData.description,
        type: resourceData.type,
        category: resourceData.category,
        content_url: resourceData.content?.url,
        content_file_path: resourceData.content?.filePath,
        content_text: resourceData.content?.text,
        language: resourceData.language || 'en',
        tags: resourceData.tags || [],
        duration: resourceData.duration,
        difficulty: resourceData.difficulty,
        is_public: resourceData.isPublic ?? true,
        uploaded_by: resourceData.uploadedBy
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Find all resources with filters
  static async find(filter = {}) {
    let query = supabase.from('resources').select('*');

    Object.keys(filter).forEach(key => {
      query = query.eq(key, filter[key]);
    });

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Find by ID with ratings
  static async findById(id) {
    const { data: resource, error } = await supabase
      .from('resources')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    const { data: ratings, error: ratingError } = await supabase
      .from('resource_ratings')
      .select(`
        *,
        users (id, name)
      `)
      .eq('resource_id', id);

    if (ratingError) throw ratingError;

    return { ...resource, ratings };
  }

  // Like a resource
  static async likeResource(id) {
    const { data, error } = await supabase.rpc('increment_resource_likes', { resource_id_input: id });
    if (error) throw error;
    return data;
  }

  // Rate a resource
  static async rateResource(resourceId, userId, rating, review) {
    const { data, error } = await supabase
      .from('resource_ratings')
      .upsert([{
        resource_id: resourceId,
        user_id: userId,
        rating,
        review
      }], { onConflict: ['resource_id', 'user_id'] })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = Resource;
