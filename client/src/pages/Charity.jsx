import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Star, Calendar, ExternalLink, X, DollarSign } from 'lucide-react';
import api from '../services/api';
import CharitySelector from '../components/charity/CharitySelector';
import { CardSkeleton } from '../components/common/Skeleton';

const FeaturedCharityCard = ({ charity, onSelect }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
  >
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="relative p-8">
      <div className="flex items-center gap-2 mb-4">
        <Star size={20} fill="currentColor" />
        <span className="text-sm font-medium uppercase tracking-wide">Featured Charity</span>
      </div>
      
      <h3 className="text-2xl font-bold mb-2">{charity.name}</h3>
      <p className="text-white/80 text-sm mb-6 line-clamp-2">
        {charity.description}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs text-white/60">Total Raised</p>
            <p className="text-xl font-bold">${(charity.totalRaised + charity.totalIndependentDonations).toLocaleString()}</p>
          </div>
          {charity.events && charity.events.length > 0 && (
            <div className="border-l border-white/20 pl-4">
              <p className="text-xs text-white/60">Next Event</p>
              <p className="text-sm font-medium">{charity.events[0].title}</p>
            </div>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect(charity)}
          className="px-6 py-3 bg-white text-emerald-600 font-semibold rounded-xl hover:bg-white/90 transition-colors"
        >
          Support This Charity
        </motion.button>
      </div>
    </div>
  </motion.div>
);

const CharityCard = ({ charity, onSelect, isSelected }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-2xl border overflow-hidden transition-all ${
      isSelected ? 'border-emerald-500 shadow-lg shadow-emerald-100' : 'border-gray-100 hover:border-emerald-200'
    }`}
  >
    {charity.image && (
      <div className="h-40 overflow-hidden">
        <img
          src={charity.image}
          alt={charity.name}
          className="w-full h-full object-cover"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>
    )}
    <div className="p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-900">{charity.name}</h3>
        {charity.featured && (
          <Star size={16} className="text-amber-500 fill-amber-500 flex-shrink-0" />
        )}
      </div>
      
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {charity.description}
      </p>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-emerald-600 font-medium">
          ${(charity.totalRaised + charity.totalIndependentDonations).toLocaleString()} raised
        </span>
        {charity.events && charity.events.length > 0 && (
          <span className="text-gray-400 flex items-center gap-1">
            <Calendar size={14} />
            {charity.events.length} event{charity.events.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelect(charity)}
        className={`w-full mt-4 py-2.5 rounded-xl font-medium transition-colors ${
          isSelected
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600'
        }`}
      >
        {isSelected ? 'Selected' : 'Select'}
      </motion.button>
    </div>
  </motion.div>
);

const CharityDetailModal = ({ charity, onClose, onDonate }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const [isDonating, setIsDonating] = useState(false);

  const handleDonate = async () => {
    if (!donationAmount || parseFloat(donationAmount) <= 0) return;
    
    setIsDonating(true);
    try {
      await onDonate(charity._id, parseFloat(donationAmount));
      setDonationAmount('');
    } finally {
      setIsDonating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {charity.image && (
          <div className="h-48 overflow-hidden rounded-t-3xl">
            <img
              src={charity.image}
              alt={charity.name}
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{charity.name}</h2>
              {charity.featured && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full mt-1">
                  <Star size={12} fill="currentColor" /> Featured
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <p className="text-gray-600 mb-6">{charity.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4">
              <p className="text-xs text-emerald-600 mb-1">From Subscriptions</p>
              <p className="text-xl font-bold text-emerald-700">${charity.totalRaised.toLocaleString()}</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-4">
              <p className="text-xs text-teal-600 mb-1">Direct Donations</p>
              <p className="text-xl font-bold text-teal-700">${charity.totalIndependentDonations.toLocaleString()}</p>
            </div>
          </div>
          
          {charity.website && (
            <a
              href={charity.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6"
            >
              Visit Website <ExternalLink size={16} />
            </a>
          )}
          
          {charity.events && charity.events.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Upcoming Events</h3>
              <div className="space-y-3">
                {charity.events.map((event, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {event.location && ` • ${event.location}`}
                    </p>
                    {event.description && (
                      <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Make a Donation</h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDonate}
                disabled={isDonating || !donationAmount}
                className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isDonating ? 'Donating...' : 'Donate'}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Charity = () => {
  const [charities, setCharities] = useState([]);
  const [featuredCharity, setFeaturedCharity] = useState(null);
  const [regularCharities, setRegularCharities] = useState([]);
  const [userAllocation, setUserAllocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCharity, setSelectedCharity] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const response = await api.get('/api/charities');
      if (response.data.success) {
        const data = response.data.data;
        const featured = data.find(c => c.featured);
        const others = data.filter(c => !c.featured);
        
        setFeaturedCharity(featured || (data.length > 0 ? data[0] : null));
        setRegularCharities(others);
        setCharities(data);
      }
    } catch (error) {
      console.error('Fetch charities error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    try {
      const response = await api.put('/api/charities/allocation', data);
      if (response.data.success) {
        setUserAllocation({
          charityId: data.charityId,
          allocationPercent: data.allocationPercent
        });
      }
    } catch (error) {
      console.error('Update allocation error:', error);
    }
  };

  const handleDonate = async (charityId, amount) => {
    try {
      const response = await api.post('/api/charities/donate', {
        charityId,
        amount
      });
      if (response.data.success) {
        alert(response.data.data.message);
        fetchCharities();
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert(error.response?.data?.error || 'Donation failed');
    }
  };

  const handleSelectCharity = (charity) => {
    setSelectedCharity(charity);
    setShowModal(true);
  };

  const filteredCharities = regularCharities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Charity</h1>
          <p className="text-gray-500 mt-1">Support a cause with every draw</p>
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Charity</h1>
        <p className="text-gray-500 mt-1">Support a cause with every draw</p>
      </div>

      {featuredCharity && !searchQuery && (
        <FeaturedCharityCard
          charity={featuredCharity}
          onSelect={handleSelectCharity}
        />
      )}

      <CharitySelector
        charities={charities}
        userAllocation={userAllocation}
        onUpdate={handleUpdate}
      />

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Charities</h2>
        
        <div className="relative mb-6">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search charities..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
          />
        </div>
        
        {filteredCharities.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No charities found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharities.map((charity) => (
              <CharityCard
                key={charity._id}
                charity={charity}
                onSelect={handleSelectCharity}
                isSelected={userAllocation?.charityId === charity._id}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && selectedCharity && (
          <CharityDetailModal
            charity={selectedCharity}
            onClose={() => setShowModal(false)}
            onDonate={handleDonate}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Charity;
