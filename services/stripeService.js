const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
    name: 'Monthly Subscription',
    amount: 999
  },
  yearly: {
    priceId: process.env.STRIPE_YEARLY_PRICE_ID,
    name: 'Yearly Subscription',
    amount: 9999
  }
};

const createCheckoutSession = async (userId, userEmail, planType) => {
  const plan = PLANS[planType];
  
  if (!plan) {
    throw new Error('Invalid plan type');
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: userEmail,
    client_reference_id: userId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: plan.name,
            description: 'Golf Charity Subscription'
          },
          unit_amount: plan.amount,
          recurring: {
            interval: planType === 'monthly' ? 'month' : 'year'
          }
        },
        quantity: 1
      }
    ],
    success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/subscription/canceled`
  });

  return session;
};

const constructWebhookEvent = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

const cancelSubscription = async (subscriptionId) => {
  return stripe.subscriptions.cancel(subscriptionId);
};

const getSubscription = async (subscriptionId) => {
  return stripe.subscriptions.retrieve(subscriptionId);
};

module.exports = {
  stripe,
  createCheckoutSession,
  constructWebhookEvent,
  cancelSubscription,
  getSubscription,
  PLANS
};