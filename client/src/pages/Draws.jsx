import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { ListSkeleton } from '../components/common/Skeleton';
import { Trophy, Heart, Info, ChevronRight, Sparkles, Award } from 'lucide-react';

const PrizeBreakdown = ({ breakdown }) => {
  if (!breakdown) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 my-4">
      <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
        <Trophy size={16} /> Prize Pool Breakdown
      </h4>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
        <div className="bg-white rounded-lg p-3">
          <p className="text-gray-500 text-xs">Total Collected</p>
          <p className="font-bold text-gray-900">${(breakdown.totalCollected || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-gray-500 text-xs">Charity (10%)</p>
          <p className="font-bold text-rose-600">${(breakdown.charityAmount || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-gray-500 text-xs">Prize Pool</p>
          <p className="font-bold text-emerald-600">${(breakdown.prizePool || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-gray-500 text-xs">Rollover</p>
          <p className="font-bold text-amber-600">${(breakdown.rollover || 0).toLocaleString()}</p>
        </div>
      </div>

      <div className="border-t border-emerald-200 pt-3 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
            <span className="text-gray-700">5-Match (40%)</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-amber-700">
              ${(breakdown.fiveMatchPool || 0).toLocaleString()}
            </span>
            <span className="text-gray-400 ml-2">
              → {breakdown.fiveMatchWinners || 0} winner{breakdown.fiveMatchWinners !== 1 ? 's' : ''} = ${(breakdown.fiveMatchPerWinner || 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            <span className="text-gray-700">4-Match (35%)</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-emerald-700">
              ${(breakdown.fourMatchPool || 0).toLocaleString()}
            </span>
            <span className="text-gray-400 ml-2">
              → {breakdown.fourMatchWinners || 0} winner{breakdown.fourMatchWinners !== 1 ? 's' : ''} = ${(breakdown.fourMatchPerWinner || 0).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
            <span className="text-gray-700">3-Match (25%)</span>
          </div>
          <div className="text-right">
            <span className="font-semibold text-blue-700">
              ${(breakdown.threeMatchPool || 0).toLocaleString()}
            </span>
            <span className="text-gray-400 ml-2">
              → {breakdown.threeMatchWinners || 0} winner{breakdown.threeMatchWinners !== 1 ? 's' : ''} = ${(breakdown.threeMatchPerWinner || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const anonymizeName = (name) => {
  if (!name || name === "Unknown") return "Anonymous Winner";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return parts[0] + " " + parts[parts.length - 1][0] + ".";
  }
  return name[0] + ".";
};

const DrawCard = ({ draw, index }) => {
  const fiveMatchWinners = draw.winners?.filter(w => w.matchCount === 5) || [];
  const fourMatchWinners = draw.winners?.filter(w => w.matchCount === 4) || [];
  const threeMatchWinners = draw.winners?.filter(w => w.matchCount === 3) || [];

  return (
    <motion.div
      key={draw._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">
                {new Date(draw.drawDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              {draw.drawType !== 'random' && (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full flex items-center gap-1">
                  <Sparkles size={12} /> {draw.drawType === 'weighted_least_frequent' ? 'Least Freq' : 'Most Freq'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Trophy size={14} className="text-emerald-600" />
                ${(draw.totalPool || 0).toLocaleString()} Pool
              </span>
              <span className="flex items-center gap-1">
                <Heart size={14} className="text-rose-500" />
                ${(draw.charityPool || 0).toLocaleString()} Charity
              </span>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
            {draw.status}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 mb-3">Winning Numbers</p>
          <div className="flex gap-3 justify-center">
            {draw.winningNumbers.map((num, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + i * 0.05 }}
                className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-emerald-600 text-white rounded-xl font-bold text-xl shadow-lg shadow-emerald-200"
              >
                {num}
              </motion.div>
            ))}
          </div>
        </div>

        <PrizeBreakdown breakdown={draw.prizeBreakdown} />

        {draw.winners && draw.winners.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2"><Award size={14} />Winners</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{fiveMatchWinners.length}</p>
                <p className="text-xs text-amber-600">5-Match</p>
                {fiveMatchWinners.length > 0 && (
                  <p className="text-xs font-medium text-amber-800 mt-1">
                    ${(draw.prizeBreakdown?.fiveMatchPerWinner || 0).toLocaleString()} each
                  </p>
                )}
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{fourMatchWinners.length}</p>
                <p className="text-xs text-emerald-600">4-Match</p>
                {fourMatchWinners.length > 0 && (
                  <p className="text-xs font-medium text-emerald-800 mt-1">
                    ${(draw.prizeBreakdown?.fourMatchPerWinner || 0).toLocaleString()} each
                  </p>
                )}
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{threeMatchWinners.length}</p>
                <p className="text-xs text-blue-600">3-Match</p>
                {threeMatchWinners.length > 0 && (
                  <p className="text-xs font-medium text-blue-800 mt-1">
                    ${(draw.prizeBreakdown?.threeMatchPerWinner || 0).toLocaleString()} each
                  </p>
                )}
              </div>
            </div>
            {(fiveMatchWinners.length > 0 || fourMatchWinners.length > 0 || threeMatchWinners.length > 0) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Verified Winners (Privacy Protected)</p>
                <div className="flex flex-wrap gap-2">
                  {[...fiveMatchWinners, ...fourMatchWinners, ...threeMatchWinners].map((winner, idx) => (
                    <span key={idx} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
                      {anonymizeName(winner.user?.name)} <span className="text-gray-400">({winner.matchCount}/5)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {draw.publishedBy && (
          <p className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100">
            Published by {draw.publishedBy.name} on {new Date(draw.publishedAt || draw.drawDate).toLocaleDateString()}
          </p>
        )}
      </div>
    </motion.div>
  );
};

const Draws = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDraws();
  }, []);

  const fetchDraws = async () => {
    try {
      const response = await api.get('/api/draws/results');
      if (response.data.success) {
        setDraws(response.data.data);
      }
    } catch (error) {
      console.error('Fetch draws error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Draws</h1>
          <p className="text-gray-500 mt-1">View past draw results</p>
        </div>
        <ListSkeleton count={3} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Monthly Draws</h1>
          <p className="text-gray-500 mt-1">Transparent prize distribution for every draw</p>
        </div>
        <Link
          to="/draw-info"
          className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <Info size={20} />
          How It Works
        </Link>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Fair & Transparent Draws</h2>
            <p className="text-white/80 text-sm max-w-lg">
              Every draw uses certified random number generation. Prize pools are split 40%/35%/25% 
              among 5-match, 4-match, and 3-match winners. 10% goes to charity.
            </p>
          </div>
          <div className="hidden md:block">
            <Trophy size={48} className="text-white/30" />
          </div>
        </div>
      </div>

      {draws.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-12 text-center">
          <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No draws published yet</p>
          <p className="text-gray-400 text-sm mt-2">Check back soon for the first draw results!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Draw History</h2>
            <span className="text-sm text-gray-500">{draws.length} draw{draws.length !== 1 ? 's' : ''}</span>
          </div>
          {draws.map((draw, index) => (
            <DrawCard key={draw._id} draw={draw} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Draws;
