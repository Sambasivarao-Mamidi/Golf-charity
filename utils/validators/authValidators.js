const { body } = require('express-validator');

const register = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required')
    .isLength({ max: 255 })
    .withMessage('Email must be 255 characters or less'),
  body('password')
    .trim()
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be 8-128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters')
    .escape(),
  body('selectedCharity')
    .optional()
    .isMongoId()
    .withMessage('Invalid charity ID')
];

const login = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = { register, login };
