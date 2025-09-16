// routes/auth.js
const express = require('express');
const authRouter = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');

// Registration validation
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

// Login validation
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
authRouter.get('/register', authController.renderRegister);
authRouter.post('/register', registerValidation, authController.register);
authRouter.get('/login', authController.renderLogin);
authRouter.post('/login', loginValidation, authController.login);
authRouter.get('/logout', authController.logout);
authRouter.get('/forgot-password', authController.renderForgotPassword);
authRouter.post('/forgot-password', authController.forgotPassword);

module.exports = authRouter;