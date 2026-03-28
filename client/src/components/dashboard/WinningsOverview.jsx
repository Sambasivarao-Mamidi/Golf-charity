import { motion } from 'framer-motion';

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  'Awaiting Review': 'bg-blue-100 text-blue-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-red-100 text-red-700',
  Paid: 'bg-purple-100 text-purple-700',
};

const statusLabels = {
  pending: 'Pending',
  'Awaiting Review': 'Awaiting Review',
  Approved: 'Approved',
  Rejected: 'Rejected',
  Paid: 'Paid',
};

const WinningsOverview = ({ stats }) => {
  const { totalWinnings = 0, pendingWinnings = 0, paidWinnings = 0, wins = 0 } = stats;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.4 }
    })
  };

  const StatCard = ({ label, value, color, index }) => (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
    >
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Winnings</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Won" value={`$${totalWinnings.toLocaleString()}`} color="text-gray-900" index={0} />
          <StatCard label="Total Wins" value={wins} color="text-emerald-600" index={1} />
          <StatCard label="Pending" value={`$${pendingWinnings.toLocaleString()}`} color="text-amber-600" index={2} />
          <StatCard label="Paid Out" value={`$${paidWinnings.toLocaleString()}`} color="text-purple-600" index={3} />
        </div>
      </div>

      {stats.recentWins && stats.recentWins.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
            Recent Winnings
          </h3>
          <div className="space-y-3">
            {stats.recentWins.map((win, index) => (
              <motion.div
                key={win._id || index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {win.matchCount} Match Win
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(win.drawDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${win.prizeAmount.toLocaleString()}</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[win.status]}`}>
                    {statusLabels[win.status]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WinningsOverview;