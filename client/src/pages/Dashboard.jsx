import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import WinningsOverview from '../components/dashboard/WinningsOverview';
import { PageSkeleton } from '../components/common/Skeleton';
import { Calendar, CreditCard, Heart, Trophy, Clock, TrendingUp, Bell, ArrowRight } from 'lucide-react';

const SubscriptionStatusCard = ({ subscription, onSubscribe }) => {
  if (!subscription?.isSubscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="font-semibold">No Active Subscription</h3>
              <p className="text-sm text-white/70">Subscribe to join monthly draws</p>
            </div>
          </div>
          <button
            onClick={onSubscribe}
            className="px-6 py-3 bg-emerald-500 text-white font-medium rounded-xl hover:bg-emerald-600 transition-colors"
          >
            Subscribe Now
          </button>
        </div>
      </motion.div>
    );
  }

  const statusColors = {
    active: 'bg-emerald-100 text-emerald-700',
    past_due: 'bg-amber-100 text-amber-700',
    canceled: 'bg-red-100 text-red-700'
  };

  const planLabels = {
    monthly: 'Monthly Plan',
    yearly: 'Yearly Plan'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"
    >
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="font-semibold">{planLabels[subscription.planType] || subscription.planType}</h3>
            <p className="text-sm text-white/80">
              Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[subscription.status] || 'bg-white/20 text-white'}`}>
            {subscription.status}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const DrawNumbersCard = ({ drawNumbers }) => {
  const hasEnoughNumbers = drawNumbers.length >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Trophy size={20} className="text-emerald-600" />
          Your Draw Numbers
        </h3>
        <span className="text-sm text-gray-500">{drawNumbers.length}/5 entered</span>
      </div>

      {hasEnoughNumbers ? (
        <div className="flex gap-3 justify-center">
          {drawNumbers.map((num, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1, type: 'spring' }}
              className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200"
            >
              <span className="text-white font-bold text-xl">{num}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-2">Enter {5 - drawNumbers.length} more score{drawNumbers.length === 4 ? '' : 's'} to participate in draws</p>
          <div className="flex gap-2 justify-center">
            {drawNumbers.map((num, index) => (
              <div
                key={index}
                className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 font-medium flex items-center justify-center"
              >
                {num}
              </div>
            ))}
            {Array.from({ length: 5 - drawNumbers.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-10 h-10 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center border-2 border-dashed border-gray-200"
              >
                ?
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ParticipationCard = ({ drawsParticipated, drawsWon, nextDrawDate }) => {
  const daysUntilDraw = Math.ceil((nextDrawDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl border border-gray-100 p-6"
    >
      <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-emerald-600" />
        Participation Summary
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{drawsParticipated}</p>
          <p className="text-sm text-gray-500">Draws Entered</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{drawsWon}</p>
          <p className="text-sm text-gray-500">Draws Won</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
        <div className="flex items-center gap-3">
          <Clock size={20} className="text-amber-600" />
          <div>
            <p className="text-sm text-amber-700">Next Draw</p>
            <p className="font-semibold text-gray-900">
              {nextDrawDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-amber-600">In</p>
            <p className="font-bold text-amber-700">{daysUntilDraw} days</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CharityCard = ({ charity, allocation }) => {
  if (!charity) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border border-gray-100 p-6"
      >
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
          <Heart size={20} className="text-rose-500" />
          Your Charity
        </h3>
        <p className="text-gray-500 text-sm mb-4">Support a cause with every draw</p>
        <button className="w-full py-2 px-4 bg-rose-50 text-rose-600 font-medium rounded-xl hover:bg-rose-100 transition-colors">
          Select a Charity
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
          <Heart size={20} className="text-rose-500" />
          Your Charity
        </h3>
        <div className="flex items-start gap-4">
          {charity.image && (
            <img
              src={charity.image}
              alt={charity.name}
              className="w-16 h-16 rounded-xl object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}
          <div className="flex-1">
            <p className="font-medium text-gray-900">{charity.name}</p>
            <p className="text-sm text-emerald-600">{allocation}% of winnings</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-3 bg-rose-50 border-t border-rose-100">
        <p className="text-xs text-rose-600">
          Making a difference with every draw
        </p>
      </div>
    </motion.div>
  );
};


const WinnerToast = ({ pendingAmount, onDismiss }) => {
  if (!pendingAmount || pendingAmount <= 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="fixed top-4 right-4 z-50 max-w-sm"
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Trophy size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold">Congratulations!</h4>
            <p className="text-sm text-white/90 mt-1">
              You have won <span className="font-bold">${pendingAmount.toFixed(2)}</span>! Submit your score proof to claim your prize.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Link
                to="/my-winnings"
                className="px-3 py-1.5 bg-white text-amber-600 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-1"
              >
                View Details <ArrowRight size={14} />
              </Link>
              <button
                onClick={onDismiss}
                className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalWinnings: 0,
    pendingWinnings: 0,
    paidWinnings: 0,
    wins: 0,
    recentWins: []
  });
  const [subscription, setSubscription] = useState(null);
  const [scores, setScores] = useState([]);
  const [charity, setCharity] = useState(null);
  const [drawNumbers, setDrawNumbers] = useState([]);
  const [drawsParticipated, setDrawsParticipated] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWinnerToast, setShowWinnerToast] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [subRes, scoresRes, drawsRes] = await Promise.all([
        api.get('/api/subscriptions/status'),
        api.get('/api/scores'),
        api.get('/api/draws/results')
      ]);

      if (subRes.data.success) {
        setSubscription(subRes.data.data);
      }

      if (scoresRes.data.success) {
        setScores(scoresRes.data.data);
        const topScores = scoresRes.data.data
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)
          .map(s => s.value);
        setDrawNumbers(topScores);
      }

      if (drawsRes.data.success) {
        const draws = drawsRes.data.data;
        let total = 0, pending = 0, paid = 0, wins = 0, recent = [];
        
        draws.forEach(draw => {
          let userWon = false;
          draw.winners.forEach(winner => {
            if (winner.user && (winner.user._id === user?.id || winner.user === user?.id)) {
              wins++;
              userWon = true;
              total += winner.prizeAmount;
              if (winner.status === 'Paid') {
                paid += winner.prizeAmount;
              } else if (winner.status === 'pending' || winner.status === 'Awaiting Review') {
                pending += winner.prizeAmount;
              }
              recent.push({ ...winner, drawDate: draw.drawDate });
            }
          });
          if (userWon) {
            setDrawsParticipated(prev => prev + 1);
          }
        });
        
        // Show winner toast if there are pending winnings and subscription is active
        if (pending > 0 && subRes.data.success && subRes.data.data?.isSubscribed) {
          setShowWinnerToast(true);
          setTimeout(() => setShowWinnerToast(false), 10000); // Auto-dismiss after 10s
        }
        
        setStats({
          totalWinnings: total,
          pendingWinnings: pending,
          paidWinnings: paid,
          wins,
          recentWins: recent.slice(0, 5)
        });
      }

      if (user?.selectedCharity) {
        try {
          const charityRes = await api.get(`/api/charities/${user.selectedCharity}`);
          if (charityRes.data.success) {
            setCharity(charityRes.data.data);
          }
        } catch (err) {
          console.error('Error fetching charity:', err);
        }
      }
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNextDrawDate = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    if (lastDay < now) {
      return new Date(now.getFullYear(), now.getMonth() + 2, 0);
    }
    return lastDay;
  };

  const quickLinks = [
    { path: '/scores', label: 'Add Score', icon: '◎', color: 'from-emerald-400 to-emerald-600' },
    { path: '/draws', label: 'View Draws', icon: '◉', color: 'from-blue-400 to-blue-600' },
    { path: '/charity', label: 'Charity', icon: '♡', color: 'from-rose-400 to-rose-600' },
  ];

  if (loading) {
    return <PageSkeleton />;
  }

  const nextDrawDate = getNextDrawDate();

  return (
      <>
        <AnimatePresence>
          {showWinnerToast && (
            <WinnerToast 
              pendingAmount={pending} 
              onDismiss={() => setShowWinnerToast(false)} 
            />
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-500 mt-1">Here's your golf charity overview</p>
        </div>
        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium capitalize">
          {user?.role}
        </span>
      </div>

      <SubscriptionStatusCard 
        subscription={subscription} 
        onSubscribe={() => navigate('/subscription')} 
      />

      <div className="grid md:grid-cols-2 gap-6">
        <DrawNumbersCard drawNumbers={drawNumbers} />
        <ParticipationCard 
          drawsParticipated={drawsParticipated} 
          drawsWon={stats.wins}
          nextDrawDate={nextDrawDate}
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((link, index) => (
          <motion.button
            key={link.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(link.path)}
            className={`bg-gradient-to-br ${link.color} p-6 rounded-2xl text-left text-white shadow-lg hover:shadow-xl transition-all`}
          >
            <span className="text-3xl mb-3 block">{link.icon}</span>
            <span className="font-semibold">{link.label}</span>
          </motion.button>
        ))}
        <CharityCard 
          charity={charity} 
          allocation={user?.charityAllocation || 10} 
        />
      </div>

      <WinningsOverview stats={stats} />
      </motion.div>
      </>
  );
};

export default Dashboard;
