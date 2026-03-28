import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Trophy, Heart, Info, Shield, Shuffle, BarChart3, Users, DollarSign, ChevronRight, Star } from 'lucide-react';

const DrawInfo = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrawInfo();
  }, []);

  const fetchDrawInfo = async () => {
    try {
      const response = await api.get('/api/draws/info');
      if (response.data.success) {
        setInfo(response.data.data);
      }
    } catch (error) {
      console.error('Fetch draw info error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-50"
    >
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-800">
            Golf<span className="text-emerald-600">Charity</span>
          </Link>
          <Link
            to="/draws"
            className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            View Draws
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How the Draw Works
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fair, transparent, and powered by charity. Every subscription contributes to the prize pool and a worthy cause.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Trophy className="text-emerald-600" />
            Prize Distribution
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                    <Star className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-900">5-Match - Jackpot</h3>
                    <p className="text-amber-700 text-sm">All 5 numbers match</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-amber-700">40%</p>
                  <p className="text-amber-600 text-sm">of prize pool</p>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-3 text-sm text-amber-800">
                If there are multiple 5-match winners, the 40% is split equally among them.
                If there are no 5-match winners, the prize rolls over to the next draw.
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <Trophy className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-emerald-900">4-Match - Second Tier</h3>
                    <p className="text-emerald-700 text-sm">4 numbers match</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-emerald-700">35%</p>
                  <p className="text-emerald-600 text-sm">of prize pool</p>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-3 text-sm text-emerald-800">
                Prize is split equally among all 4-match winners.
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-blue-900">3-Match - Third Tier</h3>
                    <p className="text-blue-700 text-sm">3 numbers match</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-700">25%</p>
                  <p className="text-blue-600 text-sm">of prize pool</p>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-3 text-sm text-blue-800">
                Prize is split equally among all 3-match winners.
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Heart className="text-rose-500" />
            Charity Contribution
          </h2>
          
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center">
                <Heart className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-rose-900">10% of Every Subscription</h3>
                <p className="text-rose-700 mt-1">
                  A minimum of 10% of your subscription goes directly to your chosen charity. 
                  You can increase this allocation up to 100% if you wish.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Shield className="text-emerald-600" />
            Fairness & Transparency
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shuffle className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Certified Random Numbers</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Draws use cryptographically secure random number generation to ensure every number has an equal chance.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Full Prize Transparency</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Every draw shows exactly how much was collected, how much went to charity, and how prizes were split.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Equal Opportunity</h3>
                <p className="text-sm text-gray-600 mt-1">
                  All subscribers with 5 scores entered have an equal chance to win, regardless of subscription length.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">No Hidden Fees</h3>
                <p className="text-sm text-gray-600 mt-1">
                  The $10 monthly subscription goes entirely to the prize pool and charity. No additional charges.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {info?.stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Current Statistics</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-4xl font-bold">{info.stats.currentParticipants}</p>
                <p className="text-white/80 mt-1">Active Subscribers</p>
              </div>
              <div>
                <p className="text-4xl font-bold">{info.stats.totalDraws}</p>
                <p className="text-white/80 mt-1">Draws Completed</p>
              </div>
              <div>
                <p className="text-4xl font-bold">${info.stats.estimatedPrizePool.toLocaleString()}</p>
                <p className="text-white/80 mt-1">Est. Prize Pool</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl"
          >
            Start Playing Today
            <ChevronRight size={20} />
          </Link>
        </motion.div>
      </main>

      <footer className="bg-white/50 backdrop-blur-sm border-t border-gray-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Every subscription supports both exciting prizes and worthy charities.</p>
          <p className="mt-2">GolfCharity Platform</p>
        </div>
      </footer>
    </motion.div>
  );
};

export default DrawInfo;
