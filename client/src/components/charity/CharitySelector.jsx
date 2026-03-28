import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, TrendingUp, Users, Sparkles } from 'lucide-react';

const AnimatedCounter = ({ target, prefix = '$' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [target]);

  return <span>{prefix}{count.toLocaleString()}</span>;
};

const ProgressBar = ({ percentage }) => (
  <div className="w-full h-3 bg-gray-200/50 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(percentage, 100)}%` }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full"
    />
  </div>
);

const CharitySelector = ({ charities = [], userAllocation, onUpdate }) => {
  const [selectedCharity, setSelectedCharity] = useState('');
  const [allocationPercent, setAllocationPercent] = useState(10);
  const [isSaving, setIsSaving] = useState(false);
  const [showImpact, setShowImpact] = useState(false);

  useEffect(() => {
    if (userAllocation?.charityId) {
      setSelectedCharity(userAllocation.charityId);
    } else if (charities.length > 0 && !selectedCharity) {
      setSelectedCharity(charities[0]._id);
    }
    if (userAllocation?.allocationPercent) {
      setAllocationPercent(userAllocation.allocationPercent);
    }
  }, [userAllocation, charities]);

  const selectedCharityData = charities.find(c => c._id === selectedCharity);
  const goalAmount = 10000;
  const currentRaised = (selectedCharityData?.totalRaised || 0) + (selectedCharityData?.totalIndependentDonations || 0);
  const progressPercentage = Math.min((currentRaised / goalAmount) * 100, 100);

  const handleSave = async () => {
    if (!selectedCharity) return;
    
    setIsSaving(true);
    await onUpdate({ charityId: selectedCharity, allocationPercent });
    setIsSaving(false);
    setShowImpact(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
          <Heart className="text-white" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Your Charity Selection</h2>
          <p className="text-sm text-gray-500">Choose where to donate your winnings</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Charity
          </label>
          <select
            value={selectedCharity}
            onChange={(e) => {
              setSelectedCharity(e.target.value);
              setShowImpact(false);
            }}
            className="w-full px-4 py-3 rounded-xl border border-gray-200/50 bg-white/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all outline-none"
          >
            <option value="">Choose a charity...</option>
            {charities.map((charity) => (
              <option key={charity._id} value={charity._id}>
                {charity.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="text-sm font-medium text-gray-700">
              Allocation Percentage
            </label>
            <motion.span
              key={allocationPercent}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-emerald-600 font-bold text-lg"
            >
              {allocationPercent}%
            </motion.span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={allocationPercent}
            onChange={(e) => setAllocationPercent(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200/50 rounded-full appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-400">10%</span>
            <span className="text-xs text-gray-400">100%</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Minimum 10% of your winnings goes to charity
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving || !selectedCharity}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </motion.button>
      </div>

      {selectedCharity && selectedCharityData && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 pt-6 border-t border-gray-100/50"
        >
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100/50">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-emerald-500" size={20} />
              <h3 className="font-bold text-gray-800">{selectedCharityData.name}</h3>
            </div>
            
            {selectedCharityData.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{selectedCharityData.description}</p>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Raised</span>
                <span className="text-2xl font-bold text-gray-800">
                  <AnimatedCounter target={currentRaised} />
                </span>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Progress to ${goalAmount.toLocaleString()} goal</span>
                  <span className="text-emerald-600 font-medium">{progressPercentage.toFixed(1)}%</span>
                </div>
                <ProgressBar percentage={progressPercentage} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-100/50">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                    <Users size={16} />
                    <span className="text-xs">Beneficiaries</span>
                  </div>
                  <p className="font-bold text-gray-800">500+</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-600 mb-1">
                    <TrendingUp size={16} />
                    <span className="text-xs">This Month</span>
                  </div>
                  <p className="font-bold text-gray-800">+<AnimatedCounter target={currentRaised * 0.1} /></p>
                </div>
              </div>
            </div>

            {showImpact && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-emerald-100/50 rounded-xl text-center"
              >
                <p className="text-sm text-emerald-700 font-medium">
                  Your {allocationPercent}% contribution will make a difference!
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CharitySelector;
