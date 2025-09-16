
// middleware/validation.js
const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(error => error.msg).join(', '));
    return res.redirect('back');
  }
  next();
};

const validateAppointment = [
  body('counselorId').notEmpty().withMessage('Counselor selection is required'),
  body('appointmentDate').isISO8601().withMessage('Valid date is required'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Please provide a detailed reason (minimum 10 characters)')
];

const validateForumPost = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be between 5-200 characters'),
  body('content').trim().isLength({ min: 20 }).withMessage('Content must be at least 20 characters'),
  body('category').isIn(['general', 'anxiety', 'depression', 'stress', 'academic', 'relationships', 'support'])
    .withMessage('Valid category is required')
];

const validateAssessment = [
  body('answers').isArray({ min: 1 }).withMessage('At least one answer is required'),
  body('answers.*').isNumeric().withMessage('All answers must be numeric')
];

module.exports = {
  handleValidationErrors,
  validateAppointment,
  validateForumPost,
  validateAssessment
};
