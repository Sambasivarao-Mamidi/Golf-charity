const { body, param } = require('express-validator');

const addScore = [
  body('value')
    .exists({ checkNull: true, checkFalsy: true })
    .withMessage('Score value is required')
    .isInt({ min: 1, max: 45 })
    .withMessage('Score must be between 1 and 45')
    .toInt(),
  body('course')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Course name must be 200 characters or less')
    .escape()
];

const updateScore = [
  param('id')
    .isMongoId()
    .withMessage('Invalid score ID'),
  body('value')
    .optional()
    .isInt({ min: 1, max: 45 })
    .withMessage('Score must be between 1 and 45')
    .toInt(),
  body('course')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Course name must be 200 characters or less')
    .escape()
];

const deleteScore = [
  param('id')
    .isMongoId()
    .withMessage('Invalid score ID')
];

module.exports = { addScore, updateScore, deleteScore };
