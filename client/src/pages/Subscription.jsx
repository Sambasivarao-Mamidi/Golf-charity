import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle, CreditCard, Sparkles, Star, Zap } from 'lucide-react';
import { PageSkeleton } from '../components/common/Skeleton';

const Subscription = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    if (searchParams.get('session_id')) {
      navigate('/subscription/success');
      return;
    }
    fetchSubscriptionStatus();
  }, [searchParams]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/api/subscriptions/status');
      if (response.data.success) {
        setSubscription(response.data.data);
      }
    } catch (error) {
      console.error('Fetch subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planType) => {
    setProcessing(true);
    try {
      const response = await api.post('/api/subscriptions/create-session', { planType });
      if (response.data.success) {
        window.location.href = response.data.data.url;
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setProcessing(false);
    }
  };

  // Test mode - simulate payment without Stripe
  const handleTestSubscribe = async () => {
    setProcessing(true);
    setTestMode(true);
    try {
      const response = await api.post('/api/subscriptions/simulate-payment');
      if (response.data.success) {
        // Update local user state
        setUser({ ...user, role: 'subscriber' });
        // Navigate to success page
        navigate('/subscription/success');
      }
    } catch (error) {
      console.error('Test subscribe error:', error);
      setProcessing(false);
      setTestMode(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    setProcessing(true);
    try {
      await api.post('/api/subscriptions/cancel');
      window.location.reload();
    } catch (error) {
      console.error('Cancel error:', error);
      setProcessing(false);
    }
  };

  if (loading) {
    return <PageSkeleton />;
  }

  if (subscription?.isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white/50 p-8 text-center shadow-xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
            className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200"
          >
            <CheckCircle className="text-white" size={40} />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're Subscribed!</h2>
          <p className="text-gray-500 mb-6">
            Your {subscription.planType} subscription is active
          </p>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border border-emerald-100/50">
            <p className="text-sm text-emerald-600 font-medium">Status</p>
            <p className="font-bold text-emerald-700 capitalize">{subscription.status}</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-emerald-200 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="text-amber-400" size={24} />
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
          <Sparkles className="text-amber-400" size={24} />
        </div>
        <p className="text-gray-500 mt-2">Unlock all features with a subscription</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-emerald-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Monthly</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">$9.99<span className="text-lg font-normal text-gray-500">/mo</span></p>
          <ul className="space-y-3 mb-8 text-gray-600">
            <li className="flex items-center gap-2">✓ Monthly draw entries</li>
            <li className="flex items-center gap-2">✓ Score tracking</li>
            <li className="flex items-center gap-2">✓ Charity donations</li>
            <li className="flex items-center gap-2">✓ Winner verification</li>
          </ul>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubscribe('monthly')}
            disabled={processing}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-50 transition-all"
          >
            {processing ? 'Processing...' : 'Subscribe Monthly'}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50 p-8 relative"
        >
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg">
            <Star size={12} fill="white" /> BEST VALUE
          </span>
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="text-emerald-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900">Yearly</h3>
          </div>
          <p className="text-4xl font-bold text-gray-900 mb-2">$99.99<span className="text-lg font-normal text-gray-500">/yr</span></p>
          <p className="text-sm text-emerald-600 font-medium mb-4">Save $19.89 per year</p>
          <ul className="space-y-3 mb-8 text-gray-600">
            <li className="flex items-center gap-2">✓ All monthly features</li>
            <li className="flex items-center gap-2">✓ 12 monthly draw entries</li>
            <li className="flex items-center gap-2">✓ Priority support</li>
          </ul>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSubscribe('yearly')}
            disabled={processing}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-50 transition-all"
          >
            {processing ? 'Processing...' : 'Subscribe Yearly'}
          </motion.button>
        </motion.div>
      </div>

      {/* Test Mode Button */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-400 mb-3">For testing only</p>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTestSubscribe}
          disabled={processing}
          className="px-6 py-3 bg-gray-800 text-white font-medium rounded-xl flex items-center gap-2 mx-auto hover:bg-gray-700 disabled:opacity-50 transition-all"
        >
          <Zap size={20} />
          {testMode ? 'Activating...' : 'Test Subscription (Free)'}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Subscription;