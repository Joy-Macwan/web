// controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { supabase } = require('../utils/supabase');

class AuthController {
  // Render Register Page
  renderRegister(req, res) {
    res.render('auth/register', { title: 'Register' });
  }

  // Handle Registration
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('auth/register', {
          title: 'Register',
          errors: errors.array(),
          formData: req.body
        });
      }

      const { name, email, password, studentId, department, year } = req.body;

      // Check if user exists
      const { data: existingUser, error: findError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (findError && findError.code !== 'PGRST116') {
        throw findError;
      }

      if (existingUser) {
        return res.render('auth/register', {
          title: 'Register',
          errors: [{ msg: 'Email already exists' }],
          formData: req.body
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          name,
          email,
          password: hashedPassword,
          student_id: studentId,
          department,
          year,
          role: 'student',   // default role
          created_at: new Date()
        }]);

      if (insertError) throw insertError;

      req.flash('success', 'Registration successful! Please login.');
      res.redirect('/auth/login');
    } catch (error) {
      console.error('Registration error:', error.message);
      req.flash('error', 'Registration failed. Please try again.');
      res.redirect('/auth/register');
    }
  }

  // Render Login Page
  renderLogin(req, res) {
    res.render('auth/login', { title: 'Login' });
  }

  // Handle Login
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.render('auth/login', {
          title: 'Login',
          errors: errors.array(),
          formData: req.body
        });
      }

      const { email, password } = req.body;

      // Find user by email
      const { data: user, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (findError || !user) {
        return res.render('auth/login', {
          title: 'Login',
          errors: [{ msg: 'Invalid email or password' }],
          formData: req.body
        });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.render('auth/login', {
          title: 'Login',
          errors: [{ msg: 'Invalid email or password' }],
          formData: req.body
        });
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date() })
        .eq('id', user.id);

      // Save user in session
      req.session.user = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      const redirectPath =
        user.role === 'admin' ? '/admin/dashboard' :
        user.role === 'counselor' ? '/dashboard/counselor' :
        '/dashboard/student';

      res.redirect(redirectPath);
    } catch (error) {
      console.error('Login error:', error.message);
      req.flash('error', 'Login failed. Please try again.');
      res.redirect('/auth/login');
    }
  }

  // Handle Logout
  logout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.redirect('/');
    });
  }

  // Render Forgot Password
  renderForgotPassword(req, res) {
    res.render('auth/forgot-password', { title: 'Forgot Password' });
  }

  // Handle Forgot Password
  async forgotPassword(req, res) {
    // You can integrate Supabase Auth password reset here if needed
    req.flash('success', 'Password reset instructions sent to your email.');
    res.redirect('/auth/login');
  }
}

module.exports = new AuthController();
