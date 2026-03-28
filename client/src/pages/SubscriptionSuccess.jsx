import { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const response = await api.get('/api/auth/me');
        
        if (response.data.success && setUser) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Error refreshing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (setUser) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    if (isLoading) return;

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#10b981', '#34d399', '#fbbf24', '#f59e0b']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#10b981', '#34d399', '#fbbf24', '#f59e0b']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600">Activating your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 p-8 text-center shadow-xl shadow-emerald-100">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-300"
          >
            <CheckCircle className="text-white" size={48} />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="text-amber-400" size={20} />
              <h1 className="text-3xl font-bold text-gray-900">Welcome!</h1>
              <Sparkles className="text-amber-400" size={20} />
            </div>
            <p className="text-lg text-gray-600 mb-6">
              Your subscription is now active!
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-8"
          >
            <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl">
              <CheckCircle className="text-emerald-500" size={20} />
              <span className="text-gray-700">Access to monthly draws</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl">
              <CheckCircle className="text-emerald-500" size={20} />
              <span className="text-gray-700">Score tracking enabled</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl">
              <CheckCircle className="text-emerald-500" size={20} />
              <span className="text-gray-700">Charity donations active</span>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 hover:shadow-xl transition-all"
          >
            Go to Dashboard
            <ArrowRight size={20} />
          </motion.button>

          <p className="text-sm text-gray-400 mt-4">
            Redirecting to dashboard in 5 seconds...
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="bg-white/80 backdrop-blur-md px-6 py-3 rounded-full border border-white/50 shadow-lg">
          <p className="text-sm text-gray-600">
            Auto-redirecting to dashboard...
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionSuccess;