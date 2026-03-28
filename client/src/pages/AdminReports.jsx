import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Trophy, Users, Heart, TrendingUp, Download, RefreshCw } from 'lucide-react';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

const TABS = {
  OVERVIEW: 'overview',
  WINNERS: 'winners',
  CHARITIES: 'charities',
  USERS: 'users'
};

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white`}
  >
    <Icon size={28} className="mb-3 opacity-80" />
    <p className="text-3xl font-bold mb-1">{value}</p>
    <p className="text-sm opacity-80">{label}</p>
    {subtext && <p className="text-xs opacity-60 mt-1">{subtext}</p>}
  </motion.div>
);

const OverviewTab = ({ stats }) => {
  if (!stats) return <div className="p-8 text-center">Loading...</div>;

  const pieData = [
    { name: 'Subscribers', value: stats.users.subscribers },
    { name: 'Visitors', value: stats.users.total - stats.users.subscribers - stats.users.admins },
    { name: 'Admins', value: stats.users.admins }
  ].filter(d => d.value > 0);

  const winnerStatusData = Object.entries(stats.winners.byStatus).map(([name, value]) => ({
    name: name === 'Awaiting Review' ? 'Under Review' : name,
    value
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats.users.total} color="from-blue-500 to-blue-700" />
        <StatCard icon={TrendingUp} label="Subscribers" value={stats.users.subscribers} color="from-emerald-500 to-emerald-700" subtext={`${stats.users.conversionRate}% conversion`} />
        <StatCard icon={Trophy} label="Total Draws" value={stats.draws.total} color="from-purple-500 to-purple-700" />
        <StatCard icon={Heart} label="Charity Raised" value={`$${(stats.charities.totalRaised || 0).toLocaleString()}`} color="from-rose-500 to-rose-700" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">User Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No user data</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Winner Status</h3>
          {winnerStatusData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={winnerStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {winnerStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No winner data</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Prize Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-emerald-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-emerald-700">${(stats.prizes.totalPool || 0).toLocaleString()}</p>
            <p className="text-sm text-emerald-600">Total Prize Pool</p>
          </div>
          <div className="bg-rose-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-rose-700">${(stats.prizes.totalCharityPool || 0).toLocaleString()}</p>
            <p className="text-sm text-rose-600">Charity Pool</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-700">{stats.winners.total}</p>
            <p className="text-sm text-blue-600">Total Winners</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const WinnersTab = ({ data }) => {
  if (!data) return <div className="p-8 text-center">Loading...</div>;

  const monthlyData = data.monthly?.map(m => ({
    name: `${m._id.month}/${m._id.year.toString().slice(-2)}`,
    winners: m.count,
    prizes: m.totalPrize
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        {data.tiers?.map(tier => (
          <div key={tier._id} className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-gray-800">{tier._id}-Match</p>
            <p className="text-emerald-600 font-semibold">{tier.count} winners</p>
            <p className="text-sm text-gray-500">${tier.totalPrize.toLocaleString()} total</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Winners & Prizes</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="winners" fill="#10b981" name="Winners" />
              <Line yAxisId="right" type="monotone" dataKey="prizes" stroke="#f59e0b" strokeWidth={2} name="Prize $" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">No draw data available</p>
        )}
      </div>

      {data.topWinners?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Winners</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Wins</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total Won</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.topWinners.slice(0, 10).map((winner, idx) => (
                  <tr key={winner._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx === 0 ? 'bg-amber-100 text-amber-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'
                      }`}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{winner.userName || 'Unknown'}</td>
                    <td className="px-4 py-3">{winner.winCount}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">${winner.totalWinnings.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const CharitiesTab = ({ data }) => {
  if (!data) return <div className="p-8 text-center">Loading...</div>;

  const monthlyData = data.monthlyDonations?.map(m => ({
    name: `${m._id.month}/${m._id.year.toString().slice(-2)}`,
    amount: m.amount
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Heart} label="Total Raised" value={`$${(data.summary?.totalRaised || 0).toLocaleString()}`} color="from-rose-500 to-rose-700" />
        <StatCard icon={Users} label="Total Donors" value={data.summary?.totalDonors || 0} color="from-blue-500 to-blue-700" />
        <StatCard icon={TrendingUp} label="Donations" value={`$${(data.summary?.totalDonations || 0).toLocaleString()}`} color="from-purple-500 to-purple-700" />
        <StatCard icon={BarChart3} label="Active Charities" value={data.summary?.activeCharities || 0} color="from-emerald-500 to-emerald-700" />
      </div>

      {monthlyData.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Charity Donations</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#f43f5e" name="Charity Pool" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Charity Rankings</h3>
        <div className="space-y-3">
          {data.charities?.slice(0, 10).map((charity, idx) => (
            <div key={charity._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx === 0 ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {idx + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-800">{charity.name}</p>
                  <p className="text-sm text-gray-500">{charity.donationCount} donations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-emerald-600">${charity.totalRaised.toLocaleString()}</p>
                {charity.totalIndependentDonations > 0 && (
                  <p className="text-xs text-gray-400">+${charity.totalIndependentDonations.toLocaleString()} direct</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const UsersTab = ({ data }) => {
  if (!data) return <div className="p-8 text-center">Loading...</div>;

  const monthlyData = data.monthlyUsers?.map(m => ({
    name: `${m._id.month}/${m._id.year.toString().slice(-2)}`,
    total: m.total,
    subscribers: m.subscribers,
    visitors: m.visitors
  })) || [];

  const roleData = data.roleDistribution?.map(r => ({
    name: r._id.charAt(0).toUpperCase() + r._id.slice(1),
    value: r.count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={roleData.reduce((sum, r) => sum + r.value, 0)} color="from-blue-500 to-blue-700" />
        <StatCard icon={TrendingUp} label="Subscribers" value={roleData.find(r => r.name === 'Subscriber')?.value || 0} color="from-emerald-500 to-emerald-700" />
        <StatCard icon={BarChart3} label="Total Scores" value={data.scores?.totalScores || 0} color="from-purple-500 to-purple-700" />
        <StatCard icon={TrendingUp} label="Avg Score" value={data.scores?.avgScore?.toFixed(1) || 0} color="from-amber-500 to-amber-700" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth Over Time</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="subscribers" fill="#10b981" name="Subscribers" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-center py-8">No user data available</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Role Distribution</h3>
          {roleData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {roleData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-8">No role data</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Scores</span>
              <span className="font-bold">{data.scores?.totalScores || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average Score</span>
              <span className="font-bold">{data.scores?.avgScore?.toFixed(2) || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Min Score</span>
              <span className="font-bold">{data.scores?.minScore || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Max Score</span>
              <span className="font-bold">{data.scores?.maxScore || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [stats, setStats] = useState(null);
  const [winnerData, setWinnerData] = useState(null);
  const [charityData, setCharityData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/reports/stats');
      if (res.data.success) setStats(res.data.data);
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
    setLoading(false);
  };

  const fetchWinners = async () => {
    if (winnerData) return;
    try {
      const res = await api.get('/api/reports/winners');
      if (res.data.success) setWinnerData(res.data.data);
    } catch (error) {
      console.error('Fetch winners error:', error);
    }
  };

  const fetchCharities = async () => {
    if (charityData) return;
    try {
      const res = await api.get('/api/reports/charities');
      if (res.data.success) setCharityData(res.data.data);
    } catch (error) {
      console.error('Fetch charities error:', error);
    }
  };

  const fetchUsers = async () => {
    if (userData) return;
    try {
      const res = await api.get('/api/reports/users');
      if (res.data.success) setUserData(res.data.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === TABS.WINNERS) fetchWinners();
    if (activeTab === TABS.CHARITIES) fetchCharities();
    if (activeTab === TABS.USERS) fetchUsers();
  }, [activeTab]);

  const tabs = [
    { key: TABS.OVERVIEW, label: 'Overview', icon: BarChart3 },
    { key: TABS.WINNERS, label: 'Winners', icon: Trophy },
    { key: TABS.CHARITIES, label: 'Charities', icon: Heart },
    { key: TABS.USERS, label: 'Users', icon: Users }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive insights for your platform</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading report data...</p>
        </div>
      ) : (
        <>
          {activeTab === TABS.OVERVIEW && <OverviewTab stats={stats} />}
          {activeTab === TABS.WINNERS && <WinnersTab data={winnerData} />}
          {activeTab === TABS.CHARITIES && <CharitiesTab data={charityData} />}
          {activeTab === TABS.USERS && <UsersTab data={userData} />}
        </>
      )}
    </motion.div>
  );
};

export default AdminReports;
