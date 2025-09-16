//server.js
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

// Import your routes (FIXED names to match your folder)
const userRoutes = require('./routes/user');           
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Supabase + Express Backend is running 🚀',
    status: 'success'
  });
});

// ✅ Fixed: Test Supabase connection
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

// Example route to fetch data from "users" table
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

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

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
  console.log(`📊 Test database connection: http://localhost:${PORT}/test-db`);
});

