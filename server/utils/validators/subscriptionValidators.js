const { body } = require('express-validator');

const createSession = [
  body('planType')
    .trim()
    .notEmpty()
    .withMessage('Plan type is required')
    .isIn(['monthly', 'yearly'])
    .withMessage('Plan type must be monthly or yearly')
];

const simulatePayment = [
  body('planType')
    .optional()
    .trim()
    .isIn(['monthly', 'yearly'])
    .withMessage('Plan type must be monthly or yearly')
];

const cancelSubscription = [];

module.exports = { createSession, simulatePayment, cancelSubscription };
