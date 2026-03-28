const stripeService = require('../services/stripeService');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendSubscriptionConfirmed } = require('../utils/email');

const createCheckoutSession = async (req, res) => {
  try {
    const user = req.user;
    const { planType } = req.body;

    if (user.role === 'subscriber') {
      return res.status(400).json({
        success: false,
        error: 'Already subscribed'
      });
    }

    const session = await stripeService.createCheckoutSession(
      user._id.toString(),
      user.email,
      planType
    );

    res.json({
      success: true,
      data: { sessionId: session.id, url: session.url }
    });
  } catch (error) {
    console.error('Create Checkout Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating checkout session'
    });
  }
};

const simulatePayment = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user || !user._id) {
      return res.status(400).json({
        success: false,
        error: 'User not authenticated properly'
      });
    }

    const existingSub = await Subscription.findOne({ user: user._id });
    if (existingSub) {
      user.role = 'subscriber';
      user.subscription = existingSub._id;
      await user.save();
      return res.json({
        success: true,
        message: 'Subscription already exists (test mode)',
        data: {
          role: 'subscriber',
          planType: existingSub.planType
        }
      });
    }

    if (user.role === 'subscriber') {
      return res.status(400).json({
        success: false,
        error: 'Already subscribed'
      });
    }
    
    const subscription = new Subscription({
      user: user._id,
      stripeCustomerId: `test_cus_${user._id}`,
      stripeSubscriptionId: `test_sub_${user._id}`,
      planType: 'monthly',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await subscription.save();

    user.role = 'subscriber';
    user.subscription = subscription._id;
    await user.save();

    try {
      await sendSubscriptionConfirmed(user, subscription.planType, 9.99);
    } catch (emailError) {
      console.error('Failed to send subscription confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Subscription activated successfully (test mode)',
      data: {
        role: user.role,
        planType: subscription.planType
      }
    });
  } catch (error) {
    console.error('Simulate Payment Error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error simulating payment: ' + error.message
    });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripeService.constructWebhookEvent(req.body, sig);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;

        const user = await User.findById(userId);
        if (!user) break;

        const subscription = new Subscription({
          user: user._id,
          stripeCustomerId: session.customer || session.customer_details?.email,
          stripeSubscriptionId: session.subscription,
          planType: session.metadata?.planType || 'monthly',
          status: 'active',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        await subscription.save();

        user.role = 'subscriber';
        user.subscription = subscription._id;
        await user.save();

        try {
          const amount = session.metadata?.planType === 'yearly' ? 99.99 : 9.99;
          await sendSubscriptionConfirmed(user, subscription.planType, amount);
        } catch (emailError) {
          console.error('Failed to send subscription confirmation email:', emailError);
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: invoice.subscription
        });

        if (subscription) {
          subscription.status = 'active';
          subscription.currentPeriodStart = new Date(invoice.period_start * 1000);
          subscription.currentPeriodEnd = new Date(invoice.period_end * 1000);
          await subscription.save();
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subDoc = await Subscription.findOne({
          stripeSubscriptionId: subscription.id
        });

        if (subDoc) {
          subDoc.status = 'canceled';
          subDoc.canceledAt = new Date();
          await subDoc.save();

          const user = await User.findById(subDoc.user);
          if (user) {
            user.role = 'visitor';
            await user.save();
          }
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: invoice.subscription
        });

        if (subscription) {
          subscription.status = 'past_due';
          await subscription.save();
        }

        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const user = req.user;

    if (!user.subscription) {
      return res.json({
        success: true,
        data: { isSubscribed: false }
      });
    }

    const subscription = await Subscription.findById(user.subscription);

    res.json({
      success: true,
      data: {
        isSubscribed: true,
        planType: subscription.planType,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('Get Subscription Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching subscription status'
    });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const user = req.user;

    if (!user.subscription) {
      return res.status(400).json({
        success: false,
        error: 'No active subscription'
      });
    }

    const subscription = await Subscription.findById(user.subscription);
    
    if (subscription.stripeSubscriptionId) {
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    }

    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();

    user.role = 'visitor';
    await user.save();

    res.json({
      success: true,
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    console.error('Cancel Subscription Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error canceling subscription'
    });
  }
};

module.exports = {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
  simulatePayment
};
