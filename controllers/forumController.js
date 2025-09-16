// controllers/forumController.js
// controllers/forumController.js
const { supabase } = require('../utils/supabase');

class ForumController {
  // --------- List posts ----------
  async listPosts(req, res) {
    try {
      const { category, search } = req.query;
      let query = supabase
        .from('forum_posts')
        .select('id, title, content, category, tags, is_pinned, created_at, views, likes, author(id, name)')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (category) query = query.eq('category', category);
      if (search) {
        // Supabase/Postgres full-text search
        query = query.textSearch('title', search, { type: 'websearch' });
      }

      const { data: posts, error } = await query;
      if (error) throw error;

      res.render('forum/index', {
        title: 'Community Forum',
        posts,
        categories: ['general', 'anxiety', 'depression', 'stress', 'academic', 'relationships', 'support'],
        currentCategory: category,
        searchQuery: search
      });
    } catch (error) {
      console.error('List posts error:', error.message);
      req.flash('error', 'Failed to load forum posts');
      res.redirect('/dashboard');
    }
  }

  renderCreatePost(req, res) {
    res.render('forum/create', {
      title: 'Create New Post',
      categories: ['general', 'anxiety', 'depression', 'stress', 'academic', 'relationships', 'support']
    });
  }

  // --------- Create new post ----------
  async createPost(req, res) {
    try {
      const { title, content, category, isAnonymous, tags } = req.body;

      const { error } = await supabase.from('forum_posts').insert([
        {
          author: req.session.user.id,
          title,
          content,
          category,
          is_anonymous: isAnonymous === 'on',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
          likes: 0,
          views: 0,
          report_count: 0,
          reported_by: []
        }
      ]);

      if (error) throw error;

      req.flash('success', 'Post created successfully');
      res.redirect('/forum');
    } catch (error) {
      console.error('Create post error:', error.message);
      req.flash('error', 'Failed to create post');
      res.redirect('/forum/create');
    }
  }

  // --------- View a single post ----------
  async getPost(req, res) {
    try {
      const { data: post, error } = await supabase
        .from('forum_posts')
        .select('*, author(id, name), forum_replies(id, content, is_anonymous, created_at, author(id, name))')
        .eq('id', req.params.id)
        .single();

      if (error || !post) {
        req.flash('error', 'Post not found');
        return res.redirect('/forum');
      }

      // Increment views
      await supabase
        .from('forum_posts')
        .update({ views: post.views + 1 })
        .eq('id', req.params.id);

      res.render('forum/post', {
        title: post.title,
        post
      });
    } catch (error) {
      console.error('Get post error:', error.message);
      req.flash('error', 'Failed to load post');
      res.redirect('/forum');
    }
  }

  // --------- Reply to post ----------
  async replyToPost(req, res) {
    try {
      const { content, isAnonymous } = req.body;

      const { error } = await supabase.from('forum_replies').insert([
        {
          post_id: req.params.id,
          author: req.session.user.id,
          content,
          is_anonymous: isAnonymous === 'on'
        }
      ]);

      if (error) throw error;

      req.flash('success', 'Reply added successfully');
      res.redirect(`/forum/${req.params.id}`);
    } catch (error) {
      console.error('Reply to post error:', error.message);
      req.flash('error', 'Failed to add reply');
      res.redirect(`/forum/${req.params.id}`);
    }
  }

  // --------- Like post ----------
  async likePost(req, res) {
    try {
      const { data: post, error: fetchError } = await supabase
        .from('forum_posts')
        .select('id, likes')
        .eq('id', req.params.id)
        .single();

      if (fetchError || !post) return res.status(404).json({ error: 'Post not found' });

      const { error: updateError } = await supabase
        .from('forum_posts')
        .update({ likes: post.likes + 1 })
        .eq('id', req.params.id);

      if (updateError) throw updateError;

      res.json({ success: true, likes: post.likes + 1 });
    } catch (error) {
      console.error('Like post error:', error.message);
      res.status(500).json({ error: 'Failed to like post' });
    }
  }

  // --------- Report post ----------
  async reportPost(req, res) {
    try {
      const { data: post, error: fetchError } = await supabase
        .from('forum_posts')
        .select('id, reported_by, report_count')
        .eq('id', req.params.id)
        .single();

      if (fetchError || !post) return res.status(404).json({ error: 'Post not found' });

      const reportedBy = post.reported_by || [];
      if (!reportedBy.includes(req.session.user.id)) {
        reportedBy.push(req.session.user.id);

        const { error: updateError } = await supabase
          .from('forum_posts')
          .update({
            reported_by: reportedBy,
            report_count: post.report_count + 1
          })
          .eq('id', req.params.id);

        if (updateError) throw updateError;
      }

      res.json({ success: true, message: 'Post reported for moderation' });
    } catch (error) {
      console.error('Report post error:', error.message);
      res.status(500).json({ error: 'Failed to report post' });
    }
  }
}

module.exports = new ForumController();
