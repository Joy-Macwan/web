// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Import Supabase connection (ONLY ONE TIME)
const supabase = require('./config/supabase');

// Import your routes
const userRoutes = require('./routes/user');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const moodRoutes = require('./routes/mood');
const notificationRoutes = require('./routes/notifications');
const counselorRoutes = require('./routes/counselors');
const databaseRoutes = require('./routes/database');

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Supabase + Express Backend is running 🚀',
    status: 'success'
  });
});

// ✅ Test Supabase connection (just counts rows from "users")
app.get('/test-db', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return res.status(500).json({
        error: 'Database connection failed',
        details: error.message
      });
    }

    res.json({
      message: 'Supabase connected successfully!',
      success: true,
      userCount: count,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      error: 'Database connection failed',
      details: err.message
    });
  }
});

// ✅ Test route: fetch first 5 rows from "users"
app.get('/test-db-rows', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(5);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      rows: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Universal test route: count rows from ANY table
app.get('/test-table/:table', async (req, res) => {
  const { table } = req.params;

  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      table,
      rowCount: count,
      success: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Universal test route: fetch first 5 rows from ANY table
app.get('/test-table/:table/rows', async (req, res) => {
  const { table } = req.params;

  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(5);

    if (error) return res.status(500).json({ error: error.message });

    res.json({
      table,
      rows: data,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Example route to fetch all users
app.get('/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Use API routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/counselors', counselorRoutes);
app.use('/api/database', databaseRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    details: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Test DB count: http://localhost:${PORT}/test-db`);
  console.log(`📋 Test DB rows: http://localhost:${PORT}/test-db-rows`);
  console.log(`📌 Universal test route: http://localhost:${PORT}/test-table/{table_name}`);
});
