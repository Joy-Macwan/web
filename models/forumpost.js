// models/ForumPost.js
const supabase = require('../config/supabase');

class ForumPost {
  // Create new post
  static async create(postData) {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert([{
        author: postData.author,
        title: postData.title,
        content: postData.content,
        category: postData.category,
        is_anonymous: postData.isAnonymous ?? false,
        tags: postData.tags ?? []
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Find posts with optional filter
  static async find(filter = {}) {
    let query = supabase.from('forum_posts').select('*');

    Object.keys(filter).forEach(key => {
      query = query.eq(key, filter[key]);
    });

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  // Get a post with replies
  static async findByIdWithReplies(id) {
    const { data: post, error: postError } = await supabase
      .from('forum_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError) throw postError;

    const { data: replies, error: repliesError } = await supabase
      .from('forum_replies')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    return { ...post, replies };
  }

  // Add reply to a post
  static async addReply(postId, replyData) {
    const { data, error } = await supabase
      .from('forum_replies')
      .insert([{
        post_id: postId,
        author: replyData.author,
        content: replyData.content,
        is_anonymous: replyData.isAnonymous ?? false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Like a post
  static async likePost(postId) {
    const { data, error } = await supabase.rpc('increment_post_likes', { post_id_input: postId });
    if (error) throw error;
    return data;
  }

  // Report a post
  static async reportPost(postId, userId) {
    const { data, error } = await supabase
      .from('forum_reports')
      .insert([{ post_id: postId, reported_by: userId }])
      .select()
      .single();

    if (error && error.code !== '23505') throw error; // 23505 = unique violation
    return data;
  }
}

module.exports = ForumPost;
