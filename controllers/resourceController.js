// controllers/resourceController.js
const { supabase } = require('../utils/supabase');

class ResourceController {
  // --------- List all resources ----------
  async listResources(req, res) {
    try {
      const { category, type, search } = req.query;

      let query = supabase
        .from('resources')
        .select('id, title, description, category, type, tags, created_at, views, likes, uploaded_by(id, name)')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (category) query = query.eq('category', category);
      if (type) query = query.eq('type', type);
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      const { data: resources, error } = await query;
      if (error) throw error;

      res.render('resources/index', {
        title: 'Mental Health Resources',
        resources,
        categories: ['anxiety', 'depression', 'stress', 'sleep', 'relationships', 'academic', 'general'],
        types: ['video', 'audio', 'article', 'guide', 'infographic'],
        currentCategory: category,
        currentType: type,
        searchQuery: search
      });
    } catch (error) {
      console.error('List resources error:', error.message);
      req.flash('error', 'Failed to load resources');
      res.redirect('/dashboard');
    }
  }

  // --------- Videos ----------
  async listVideos(req, res) {
    try {
      const { data: videos, error } = await supabase
        .from('resources')
        .select('id, title, description, created_at, uploaded_by(id, name)')
        .eq('type', 'video')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.render('resources/videos', {
        title: 'Video Resources',
        resources: videos
      });
    } catch (error) {
      console.error('List videos error:', error.message);
      req.flash('error', 'Failed to load videos');
      res.redirect('/resources');
    }
  }

  // --------- Audio ----------
  async listAudio(req, res) {
    try {
      const { data: audioResources, error } = await supabase
        .from('resources')
        .select('id, title, description, created_at, uploaded_by(id, name)')
        .eq('type', 'audio')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.render('resources/audio', {
        title: 'Audio Resources',
        resources: audioResources
      });
    } catch (error) {
      console.error('List audio error:', error.message);
      req.flash('error', 'Failed to load audio resources');
      res.redirect('/resources');
    }
  }

  // --------- Guides / Articles ----------
  async listGuides(req, res) {
    try {
      const { data: guides, error } = await supabase
        .from('resources')
        .select('id, title, description, type, created_at, uploaded_by(id, name)')
        .in('type', ['guide', 'article'])
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.render('resources/guides', {
        title: 'Guides & Articles',
        resources: guides
      });
    } catch (error) {
      console.error('List guides error:', error.message);
      req.flash('error', 'Failed to load guides');
      res.redirect('/resources');
    }
  }

  // --------- Single resource ----------
  async getResource(req, res) {
    try {
      const { data: resource, error } = await supabase
        .from('resources')
        .select('*, uploaded_by(id, name), resource_ratings(rating, review, user(id, name))')
        .eq('id', req.params.id)
        .single();

      if (error || !resource) {
        req.flash('error', 'Resource not found');
        return res.redirect('/resources');
      }

      // Increment views
      await supabase
        .from('resources')
        .update({ views: resource.views + 1 })
        .eq('id', req.params.id);

      res.render('resources/detail', {
        title: resource.title,
        resource
      });
    } catch (error) {
      console.error('Get resource error:', error.message);
      req.flash('error', 'Failed to load resource');
      res.redirect('/resources');
    }
  }

  // --------- Like ----------
  async likeResource(req, res) {
    try {
      const { data: resource, error: fetchError } = await supabase
        .from('resources')
        .select('id, likes')
        .eq('id', req.params.id)
        .single();

      if (fetchError || !resource) return res.status(404).json({ error: 'Resource not found' });

      const { error: updateError } = await supabase
        .from('resources')
        .update({ likes: resource.likes + 1 })
        .eq('id', req.params.id);

      if (updateError) throw updateError;

      res.json({ success: true, likes: resource.likes + 1 });
    } catch (error) {
      console.error('Like resource error:', error.message);
      res.status(500).json({ error: 'Failed to like resource' });
    }
  }

  // --------- Rate ----------
  async rateResource(req, res) {
    try {
      const { rating, review } = req.body;

      // check if user already rated
      const { data: existingRating, error: checkError } = await supabase
        .from('resource_ratings')
        .select('*')
        .eq('resource_id', req.params.id)
        .eq('user', req.session.user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingRating) {
        // update existing
        const { error: updateError } = await supabase
          .from('resource_ratings')
          .update({ rating, review })
          .eq('id', existingRating.id);

        if (updateError) throw updateError;
      } else {
        // insert new
        const { error: insertError } = await supabase
          .from('resource_ratings')
          .insert([{ resource_id: req.params.id, user: req.session.user.id, rating, review }]);

        if (insertError) throw insertError;
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Rate resource error:', error.message);
      res.status(500).json({ error: 'Failed to rate resource' });
    }
  }
}

module.exports = new ResourceController();
