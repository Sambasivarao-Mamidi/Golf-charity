const { body, param, query } = require('express-validator');

const createCharity = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Charity name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be 2-200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or less')
    .escape(),
  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Website must be a valid URL with http:// or https://'),
  body('image')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image must be a valid URL with http:// or https://'),
  body('allocationPercent')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Allocation must be between 0 and 100')
    .toInt(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be true or false')
];

const updateCharity = [
  param('id')
    .isMongoId()
    .withMessage('Invalid charity ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be 2-200 characters')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or less')
    .escape(),
  body('website')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Website must be a valid URL'),
  body('image')
    .optional()
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage('Image must be a valid URL'),
  body('allocationPercent')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Allocation must be between 0 and 100')
    .toInt(),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be true or false'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be true or false')
];

const getCharity = [
  param('id')
    .isMongoId()
    .withMessage('Invalid charity ID')
];

const deleteCharity = [
  param('id')
    .isMongoId()
    .withMessage('Invalid charity ID')
];

const makeDonation = [
  body('charityId')
    .isMongoId()
    .withMessage('Invalid charity ID'),
  body('amount')
    .isFloat({ min: 0.01, max: 10000 })
    .withMessage('Amount must be between 0.01 and 10000')
    .toFloat()
];

const updateAllocation = [
  body('charityId')
    .optional()
    .isMongoId()
    .withMessage('Invalid charity ID'),
  body('allocationPercent')
    .isInt({ min: 10, max: 100 })
    .withMessage('Allocation must be between 10 and 100')
    .toInt()
];

module.exports = { 
  createCharity, 
  updateCharity, 
  getCharity, 
  deleteCharity, 
  makeDonation, 
  updateAllocation 
};
