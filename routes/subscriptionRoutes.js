const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
  simulatePayment
} = require('../controllers/subscriptionController');
const { authenticate } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validateRequest');
const { createSession: createSessionValidation, simulatePayment: simulatePaymentValidation } = require('../utils/validators');

router.post('/create-session', authenticate, createSessionValidation, validateRequest, createCheckoutSession);
router.post('/simulate-payment', authenticate, simulatePaymentValidation, validateRequest, simulatePayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);
router.get('/status', authenticate, getSubscriptionStatus);
router.post('/cancel', authenticate, cancelSubscription);

module.exports = router;
