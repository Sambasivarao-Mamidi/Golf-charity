import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const WinnerAdminTable = ({ winners, onRefresh }) => {
  const [loading, setLoading] = useState({});
  const [expandedWinner, setExpandedWinner] = useState(null);

  const handleMarkPaid = async (winnerId, drawId) => {
    setLoading(prev => ({ ...prev, [`paid-${winnerId}`]: true }));
    try {
      await api.put(`/api/draws/${drawId}/winners/${winnerId}/status`, {
        status: 'approved'
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to mark as paid:', error);
      alert('Failed to mark as paid. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [`paid-${winnerId}`]: false }));
    }
  };

  const handleVerify = async (winnerId, drawId) => {
    setLoading(prev => ({ ...prev, [`verify-${winnerId}`]: true }));
    try {
      await api.put(`/api/draws/${drawId}/winners/${winnerId}/status`, {
        status: 'approved'
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to verify winner:', error);
      alert('Failed to verify winner. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [`verify-${winnerId}`]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'Awaiting Review': 'bg-blue-100 text-blue-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status?.toUpperCase() || 'PENDING'}
      </span>
    );
  };

  if (!winners || winners.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No winners to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Winner
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Draw
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prize
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proof
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {winners.map((winner, index) => (
              <motion.tr
                key={`${winner.userId}-${winner.drawId}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {winner.userName || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {winner.userEmail || 'No email'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {winner.drawTitle || 'Unknown Draw'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {winner.drawDate ? new Date(winner.drawDate).toLocaleDateString() : ''}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-green-600">
                    ${winner.prizeAmount?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-gray-500">
                    {winner.prizeDetails || winner.prizeDescription || 'Prize'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(winner.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {winner.proofUrl ? (
                    <a
                      href={winner.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Proof
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">No proof</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col gap-2">
                    {(winner.status === 'pending' || winner.status === 'Awaiting Review') && (
                      <button
                        onClick={() => handleVerify(winner.id, winner.drawId)}
                        disabled={loading[`verify-${winner.id}`]}
                        className="px-3 py-2 min-h-[44px] text-blue-600 hover:text-blue-800 disabled:opacity-50 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
                      >
                        {loading[`verify-${winner.id}`] ? 'Verifying...' : 'Verify & Approve'}
                      </button>
                    )}
                    {winner.status === 'Approved' && (
                      <span className="px-3 py-2 text-green-600 font-medium text-center">Paid</span>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-200">
        {winners.map((winner, index) => (
          <motion.div
            key={`${winner.userId}-${winner.drawId}-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-medium text-gray-900">{winner.userName || 'Unknown'}</span>
                  {getStatusBadge(winner.status)}
                </div>
                <p className="text-sm text-gray-500 truncate">{winner.userEmail || 'No email'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">${winner.prizeAmount?.toLocaleString() || 0}</p>
                <p className="text-xs text-gray-500">{winner.matchCount || 0}/5 matched</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Draw</p>
                <p className="font-medium truncate">{winner.drawTitle || 'Unknown'}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium">
                  {winner.drawDate ? new Date(winner.drawDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {winner.proofUrl ? (
              <a
                href={winner.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 mb-3 text-center text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                View Proof
              </a>
            ) : (
              <p className="text-sm text-gray-400 mb-3 text-center">No proof submitted</p>
            )}

            <div className="flex gap-2">
              {(winner.status === 'pending' || winner.status === 'Awaiting Review') && (
                <button
                  onClick={() => handleVerify(winner.id, winner.drawId)}
                  disabled={loading[`verify-${winner.id}`]}
                  className="flex-1 px-4 py-3 min-h-[48px] text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg transition-colors font-medium"
                >
                  {loading[`verify-${winner.id}`] ? 'Verifying...' : 'Verify & Approve'}
                </button>
              )}
              {winner.status === 'Approved' && (
                <div className="flex-1 px-4 py-3 min-h-[48px] flex items-center justify-center text-green-600 font-medium bg-green-50 rounded-lg">
                  Paid
                </div>
              )}
              <button
                onClick={() => setExpandedWinner(expandedWinner === index ? null : index)}
                className="px-4 py-3 min-h-[48px] text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {expandedWinner === index ? 'Hide' : 'Details'}
              </button>
            </div>

            <AnimatePresence>
              {expandedWinner === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-gray-200"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">User ID:</span>
                      <p className="font-mono text-xs truncate">{winner.userId || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Draw ID:</span>
                      <p className="font-mono text-xs truncate">{winner.drawId || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Entry Count:</span>
                      <p>{winner.entryCount || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Won At:</span>
                      <p>{winner.wonAt ? new Date(winner.wonAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WinnerAdminTable;
