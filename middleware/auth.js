// middleware/auth.js
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    req.flash('error', 'Please log in to access this page');
    return res.redirect('/auth/login');
  }
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  } else {
    req.flash('error', 'Access denied. Admin privileges required.');
    return res.redirect('/dashboard');
  }
}

function requireCounselor(req, res, next) {
  if (req.session && req.session.user && 
      (req.session.user.role === 'counselor' || req.session.user.role === 'admin')) {
    return next();
  } else {
    req.flash('error', 'Access denied. Counselor privileges required.');
    return res.redirect('/dashboard');
  }
}

module.exports = {
  requireAuth,
  requireAdmin,
  requireCounselor
};

// // config/database.js
// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mental_health_db', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
    
//     console.log(`MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error('Database connection error:', error.message);
//     process.exit(1);
//   }
// };