// routes/user.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Example: fetch all users
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
