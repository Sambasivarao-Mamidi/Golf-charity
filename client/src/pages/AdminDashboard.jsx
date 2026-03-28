import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, Trash2, Edit2, X, Plus, Calendar, ExternalLink, Image, AlertCircle, Search, Users, Shield, Mail, Trophy, CreditCard, TrendingUp, ChevronLeft, ChevronRight, BarChart3 } from 'lucide-react';
import api from '../services/api';
import WinnerAdminTable from '../components/admin/WinnerAdminTable';
import AdminReports from './AdminReports';

const TABS = {
  OVERVIEW: 'overview',
  DRAW: 'draw',
  VERIFY: 'verify',
  CHARITIES: 'charities',
  USERS: 'users',
  REPORTS: 'reports'
};

const UserBadge = ({ role }) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-700',
    subscriber: 'bg-emerald-100 text-emerald-700',
    visitor: 'bg-gray-100 text-gray-700'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${colors[role] || colors.visitor}`}>
      {role}
    </span>
  );
};

const UserDetailModal = ({ user, onClose, onEdit, onResetPassword, onCancelSubscription }) => {
  const [activeSection, setActiveSection] = useState('profile');

  const sections = ['profile', 'scores', 'stats'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <UserBadge role={user?.role} />
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-100">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeSection === section
                  ? 'text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeSection === 'profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Role</p>
                  <p className="font-medium capitalize">{user?.role}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="font-medium">{user?.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Charity Allocation</p>
                  <p className="font-medium">{user?.charityAllocation}%</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1">Member Since</p>
                  <p className="font-medium">{new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {user?.selectedCharity && (
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs text-emerald-600 mb-1">Selected Charity</p>
                  <p className="font-medium text-emerald-800">
                    {typeof user.selectedCharity === 'object' ? user.selectedCharity.name : 'Charity'}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => onEdit(user)}
                  className="flex-1 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Edit User
                </button>
                <button
                  onClick={() => onResetPassword(user._id)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Reset Password
                </button>
              </div>

              {user?.role === 'subscriber' && (
                <button
                  onClick={() => onCancelSubscription(user._id)}
                  className="w-full px-4 py-3 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          )}

          {activeSection === 'scores' && (
            <div className="space-y-3">
              {user?.scores && user.scores.length > 0 ? (
                user.scores.map((score, index) => (
                  <div key={score._id || index} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{score.value} points</p>
                      <p className="text-sm text-gray-500">
                        {score.course || 'Unknown Course'} • {new Date(score.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-8">No scores recorded</p>
              )}
            </div>
          )}

          {activeSection === 'stats' && user?.stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <Trophy size={24} className="mx-auto text-emerald-600 mb-2" />
                <p className="text-2xl font-bold text-emerald-800">{user.stats.drawsWon || 0}</p>
                <p className="text-xs text-emerald-600">Draws Won</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <TrendingUp size={24} className="mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-800">${(user.stats.totalWinnings || 0).toLocaleString()}</p>
                <p className="text-xs text-blue-600">Total Won</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <CreditCard size={24} className="mx-auto text-purple-600 mb-2" />
                <p className="text-lg font-bold text-purple-800">
                  {user.stats.planType || 'None'}
                </p>
                <p className="text-xs text-purple-600">Plan</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Calendar size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-lg font-bold text-gray-800">
                  {user.stats.drawsParticipated || 0}
                </p>
                <p className="text-xs text-gray-600">Draws Entered</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const EditUserModal = ({ user, charities, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'visitor',
    charityAllocation: user?.charityAllocation || 10,
    selectedCharity: typeof user?.selectedCharity === 'object' ? user?.selectedCharity?._id : user?.selectedCharity || '',
    isActive: user?.isActive !== false
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-3xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
            >
              <option value="visitor">Visitor</option>
              <option value="subscriber">Subscriber</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Charity Allocation: {formData.charityAllocation}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={formData.charityAllocation}
              onChange={(e) => setFormData({ ...formData, charityAllocation: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500"
              />
              <span className="text-sm text-gray-700">Active User</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const UsersTab = ({ onRefresh }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search,
        role: roleFilter
      });
      
      const response = await api.get(`/api/users/admin?${params}`);
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
    setLoading(false);
  };

  const handleEdit = async (formData) => {
    try {
      const response = await api.put(`/api/users/${editingUser._id}`, formData);
      if (response.data.success) {
        setShowEditModal(false);
        setEditingUser(null);
        fetchUsers();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Update user error:', error);
      alert('Failed to update user');
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await api.get(`/api/users/${userId}`);
      if (response.data.success) {
        setSelectedUser(response.data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Fetch user details error:', error);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Send password reset email to this user?')) return;
    
    try {
      const response = await api.post(`/api/users/${userId}/reset-password`);
      if (response.data.success) {
        alert('Password reset email has been sent to the user.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      alert('Failed to send reset email');
    }
  };

  const handleCancelSubscription = async (userId) => {
    if (!confirm('Are you sure you want to cancel this user\'s subscription?')) return;
    
    try {
      const response = await api.post(`/api/users/${userId}/cancel-subscription`);
      if (response.data.success) {
        alert('Subscription canceled successfully');
        setShowDetailModal(false);
        fetchUsers();
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleToggleActive = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    
    try {
      await api.put(`/api/users/${user._id}`, { isActive: !user.isActive });
      fetchUsers();
    } catch (error) {
      console.error('Toggle active error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="subscriber">Subscribers</option>
          <option value="visitor">Visitors</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No users found</div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Scores</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <UserBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4">
                      {user.stats?.subscriptionStatus ? (
                        <span className={`text-sm ${
                          user.stats.subscriptionStatus === 'active' ? 'text-emerald-600' : 'text-gray-500'
                        }`}>
                          {user.stats.planType || 'Plan'}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">{user.stats?.scoresCount || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewUser(user._id)}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="View"
                        >
                          <Users size={18} />
                        </button>
                        <button
                          onClick={() => { setEditingUser(user); setShowEditModal(true); }}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
                            user.isActive
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <X size={18} /> : <Shield size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-gray-400">No users found</div>
          ) : (
            users.map((user) => (
              <div key={user._id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <UserBadge role={user.role} />
                      {user.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>{user.stats?.subscriptionStatus ? user.stats.planType || 'Plan' : 'No sub'}</span>
                      <span>{user.stats?.scoresCount || 0} scores</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleViewUser(user._id)}
                      className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Users size={18} />
                    </button>
                    <button
                      onClick={() => { setEditingUser(user); setShowEditModal(true); }}
                      className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
                        user.isActive
                          ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                      }`}
                      title={user.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {user.isActive ? <X size={18} /> : <Shield size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm text-gray-600 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {showDetailModal && selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => { setShowDetailModal(false); setSelectedUser(null); }}
            onEdit={(user) => { setShowDetailModal(false); setEditingUser(user); setShowEditModal(true); }}
            onResetPassword={handleResetPassword}
            onCancelSubscription={handleCancelSubscription}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && editingUser && (
          <EditUserModal
            user={editingUser}
            onSave={handleEdit}
            onClose={() => { setShowEditModal(false); setEditingUser(null); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const OverviewTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, drawsRes] = await Promise.all([
        api.get('/api/users/admin?limit=1&includeInactive=true'),
        api.get('/api/draws/results')
      ]);

      if (usersRes.data.success && drawsRes.data.success) {
        const users = usersRes.data.data;
        const draws = drawsRes.data.data;
        
        const subscribers = users.users.filter(u => u.role === 'subscriber').length;
        
        let totalWinnings = 0;
        draws.forEach(draw => {
          draw.winners.forEach(winner => {
            if (winner.status === 'Paid') {
              totalWinnings += winner.prizeAmount;
            }
          });
        });

        setStats({
          totalUsers: users.total,
          subscribers,
          totalDraws: draws.length,
          totalWinnings
        });
      }
    } catch (error) {
      console.error('Fetch stats error:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading stats...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {[
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'from-blue-400 to-blue-600' },
        { label: 'Subscribers', value: stats?.subscribers || 0, icon: CreditCard, color: 'from-emerald-400 to-emerald-600' },
        { label: 'Draws Run', value: stats?.totalDraws || 0, icon: Trophy, color: 'from-purple-400 to-purple-600' },
        { label: 'Winnings Paid', value: `$${(stats?.totalWinnings || 0).toLocaleString()}`, icon: TrendingUp, color: 'from-amber-400 to-amber-600' }
      ].map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white`}
        >
          <stat.icon size={32} className="mb-4 opacity-80" />
          <p className="text-3xl font-bold mb-1">{stat.value}</p>
          <p className="text-sm opacity-80">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

const CharityForm = ({ charity, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: charity?.name || '',
    description: charity?.description || '',
    website: charity?.website || '',
    image: charity?.image || '',
    allocationPercent: charity?.allocationPercent || 10,
    featured: charity?.featured || false,
    events: charity?.events || []
  });
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '', location: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    setFormData({
      ...formData,
      events: [...formData.events, { ...newEvent, date: new Date(newEvent.date) }]
    });
    setNewEvent({ title: '', date: '', description: '', location: '' });
  };

  const removeEvent = (index) => {
    setFormData({
      ...formData,
      events: formData.events.filter((_, i) => i !== index)
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {charity ? 'Edit Charity' : 'Add New Charity'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation: {formData.allocationPercent}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.allocationPercent}
                onChange={(e) => setFormData({ ...formData, allocationPercent: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Events</h3>
            <div className="space-y-2 mb-3">
              {formData.events.map((event, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-800">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString()} {event.location && `• ${event.location}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEvent(index)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="col-span-2 px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-500 outline-none"
              />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-emerald-500 outline-none"
              />
              <button
                type="button"
                onClick={addEvent}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !formData.name}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Charity'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(TABS.DRAW);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [winningNumbers, setWinningNumbers] = useState('');
  const [drawType, setDrawType] = useState('random');
  const [simulationMode, setSimulationMode] = useState('single');
  const [monteCarloRuns, setMonteCarloRuns] = useState(100);
  const [pendingWinners, setPendingWinners] = useState([]);
  const [selectedWinner, setSelectedWinner] = useState(null);
  const [isLoadingWinners, setIsLoadingWinners] = useState(false);
  const [allWinners, setAllWinners] = useState([]);
  
  const [charities, setCharities] = useState([]);
  const [isLoadingCharities, setIsLoadingCharities] = useState(false);
  const [showCharityForm, setShowCharityForm] = useState(false);
  const [editingCharity, setEditingCharity] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (activeTab === TABS.VERIFY) {
      fetchPendingWinners();
    } else if (activeTab === TABS.CHARITIES) {
      fetchCharities();
    }
  }, [activeTab]);

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      let response;
      if (simulationMode === 'montecarlo') {
        response = await api.post('/api/draws/simulate', {
          drawType,
          runs: monteCarloRuns
        });
      } else {
        response = await api.get('/api/draws/simulation');
        if (response.data.success) {
          response.data.data.drawType = drawType;
        }
      }
      if (response.data.success) {
        setSimulationResult(response.data.data);
      }
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Simulation failed: ' + (error.response?.data?.error || error.message));
    }
    setIsSimulating(false);
  };

  const publishDraw = async () => {
    const numbers = winningNumbers.split(',').map(n => parseInt(n.trim()));
    if (numbers.length !== 5 || numbers.some(n => isNaN(n) || n < 1 || n > 45)) {
      alert('Enter exactly 5 numbers between 1-45');
      return;
    }

    if (!confirm(`Publish draw with ${drawType === 'random' ? 'Random' : 'Weighted'} algorithm?\n\nWinning Numbers: ${numbers.join(', ')}`)) {
      return;
    }

    setIsPublishing(true);
    try {
      const response = await api.post('/api/draws/publish', { 
        winningNumbers: numbers,
        drawType 
      });
      if (response.data.success) {
        alert('Draw published successfully!\n\nWinners:\n' +
          `5-Match: ${response.data.data.winnersByTier.fiveMatch}\n` +
          `4-Match: ${response.data.data.winnersByTier.fourMatch}\n` +
          `3-Match: ${response.data.data.winnersByTier.threeMatch}`
        );
        setWinningNumbers('');
        setSimulationResult(null);
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert('Failed to publish draw: ' + (error.response?.data?.error || error.message));
    }
    setIsPublishing(false);
  };

  const fetchPendingWinners = async () => {
    setIsLoadingWinners(true);
    try {
      const response = await api.get('/api/draws/winners');
      if (response.data.success) {
        setAllWinners(response.data.data);
        const pending = response.data.data.filter(w => w.status === 'pending' || w.status === 'Awaiting Review');
        setPendingWinners(pending);
      }
    } catch (error) {
      console.error('Fetch winners error:', error);
    }
    setIsLoadingWinners(false);
  };

  const updateWinnerStatus = async (winnerId, drawId, status, rejectionReason = '') => {
    try {
      const response = await api.put(`/api/draws/${drawId}/winners/${winnerId}/status`, { status, rejectionReason });
      if (response.data.success) {
        fetchPendingWinners();
        setSelectedWinner(null);
      }
    } catch (error) {
      console.error('Update status error:', error);
    }
  };

  const fetchCharities = async () => {
    setIsLoadingCharities(true);
    try {
      const response = await api.get('/api/charities/all');
      if (response.data.success) {
        setCharities(response.data.data);
      }
    } catch (error) {
      console.error('Fetch charities error:', error);
    }
    setIsLoadingCharities(false);
  };

  const handleSaveCharity = async (formData) => {
    try {
      if (editingCharity) {
        const response = await api.put(`/api/charities/${editingCharity._id}`, formData);
        if (response.data.success) {
          fetchCharities();
          setShowCharityForm(false);
          setEditingCharity(null);
        }
      } else {
        const response = await api.post('/api/charities', formData);
        if (response.data.success) {
          fetchCharities();
          setShowCharityForm(false);
        }
      }
    } catch (error) {
      console.error('Save charity error:', error);
      alert(error.response?.data?.error || 'Failed to save charity');
    }
  };

  const handleDeleteCharity = async (charityId) => {
    if (!confirm('Are you sure you want to deactivate this charity?')) return;
    
    try {
      const response = await api.delete(`/api/charities/${charityId}`);
      if (response.data.success) {
        fetchCharities();
      }
    } catch (error) {
      console.error('Delete charity error:', error);
    }
  };

  const handleToggleFeatured = async (charity) => {
    try {
      await api.put(`/api/charities/${charity._id}`, { featured: !charity.featured });
      fetchCharities();
    } catch (error) {
      console.error('Toggle featured error:', error);
    }
  };

  const filteredCharities = charities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Manage draws, verify winners, and charities</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {[
          { key: TABS.OVERVIEW, label: 'Overview' },
          { key: TABS.DRAW, label: 'Draw Management' },
          { key: TABS.VERIFY, label: 'Winner Verification' },
          { key: TABS.CHARITIES, label: 'Charities' },
          { key: TABS.USERS, label: 'Users' },
          { key: TABS.REPORTS, label: 'Reports', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon && <tab.icon size={18} />}
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === TABS.OVERVIEW && <OverviewTab />}

      {activeTab === TABS.DRAW && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Simulation Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Draw Type</label>
                <select
                  value={drawType}
                  onChange={(e) => setDrawType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                >
                  <option value="random">Random (Recommended)</option>
                  <option value="weighted_least_frequent">Weighted: Least Frequent (Experimental)</option>
                  <option value="weighted_most_frequent">Weighted: Most Frequent (Experimental)</option>
                </select>
                {drawType !== 'random' && (
                  <p className="text-xs text-amber-600 mt-1">
                    Warning: Weighted algorithms are experimental and may not provide equal odds.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Simulation Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="simMode"
                      value="single"
                      checked={simulationMode === 'single'}
                      onChange={() => setSimulationMode('single')}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-sm text-gray-700">Single Run</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="simMode"
                      value="montecarlo"
                      checked={simulationMode === 'montecarlo'}
                      onChange={() => setSimulationMode('montecarlo')}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-sm text-gray-700">Monte Carlo ({monteCarloRuns}x)</span>
                  </label>
                </div>
              </div>

              {simulationMode === 'montecarlo' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Simulations: {monteCarloRuns}
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={monteCarloRuns}
                    onChange={(e) => setMonteCarloRuns(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>50</span>
                    <span>500</span>
                  </div>
                </div>
              )}

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="w-full px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isSimulating ? 'Running Simulation...' : simulationMode === 'montecarlo' ? `Run ${monteCarloRuns} Simulations` : 'Run Single Simulation'}
              </button>
            </div>
          </motion.div>

          {simulationResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-emerald-900">
                  {simulationMode === 'montecarlo' ? 'Monte Carlo Results' : 'Simulation Results'}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  simulationResult.drawType === 'random' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {simulationResult.drawType === 'random' ? 'Random' : 'Weighted'}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{simulationResult.totalParticipants}</p>
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">5-Match Avg</p>
                  <p className="text-2xl font-bold text-amber-600">
                    {simulationResult.averageWinners?.fiveMatch || simulationResult.winnersFound?.fiveMatch || 0}
                  </p>
                  {simulationResult.winnerRange && (
                    <p className="text-xs text-gray-400">Range: {simulationResult.winnerRange.fiveMatch}</p>
                  )}
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">4-Match Avg</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {simulationResult.averageWinners?.fourMatch || simulationResult.winnersFound?.fourMatch || 0}
                  </p>
                  {simulationResult.winnerRange && (
                    <p className="text-xs text-gray-400">Range: {simulationResult.winnerRange.fourMatch}</p>
                  )}
                </div>
                <div className="bg-white rounded-xl p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">3-Match Avg</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {simulationResult.averageWinners?.threeMatch || simulationResult.winnersFound?.threeMatch || 0}
                  </p>
                  {simulationResult.winnerRange && (
                    <p className="text-xs text-gray-400">Range: {simulationResult.winnerRange.threeMatch}</p>
                  )}
                </div>
              </div>

              {simulationResult.estimatedPools && (
                <div className="bg-white rounded-xl p-4 mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Estimated Prize Pool</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Total</p>
                      <p className="font-semibold">${(simulationResult.estimatedPools.totalCollected || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Charity (10%)</p>
                      <p className="font-semibold text-rose-600">${(simulationResult.estimatedPools.charityAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prize Pool</p>
                      <p className="font-semibold text-emerald-600">${(simulationResult.estimatedPools.prizePool || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">5-Match (40%)</p>
                      <p className="font-semibold text-amber-600">${(simulationResult.estimatedPools.fiveMatchPool || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {simulationResult.winningNumbers && (
                <div className="bg-white rounded-xl p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {simulationMode === 'montecarlo' ? 'Last Simulation Numbers' : 'Winning Numbers'}
                  </p>
                  <div className="flex gap-3 justify-center">
                    {simulationResult.winningNumbers.map((num, i) => (
                      <span key={i} className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-xl shadow-lg">
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Publish Draw</h2>
            <p className="text-sm text-gray-500 mb-4">
              Finalize and publish the official draw results. This will distribute prizes to winners.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={winningNumbers}
                  onChange={(e) => setWinningNumbers(e.target.value)}
                  placeholder="Enter 5 numbers (e.g., 3,7,12,28,41)"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
                />
                <button
                  onClick={publishDraw}
                  disabled={isPublishing}
                  className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  {isPublishing ? 'Publishing...' : 'Publish Draw'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Separate numbers with commas. Numbers must be between 1-45. Draw type: <span className="font-medium">{drawType === 'random' ? 'Random' : 'Weighted'}</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeTab === TABS.VERIFY && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <WinnerAdminTable winners={allWinners} onRefresh={fetchPendingWinners} />
          </motion.div>
        </motion.div>
      )}

      {activeTab === TABS.CHARITIES && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search charities..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
              <Heart className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button
              onClick={() => {
                setEditingCharity(null);
                setShowCharityForm(true);
              }}
              className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              <Plus size={20} /> Add Charity
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {isLoadingCharities ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : filteredCharities.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                {charities.length === 0 ? 'No charities yet. Add your first charity!' : 'No charities match your search'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredCharities.map((charity) => (
                  <div key={charity._id} className={`p-4 flex items-center gap-4 ${!charity.isActive ? 'bg-gray-50 opacity-60' : ''}`}>
                    {charity.image ? (
                      <img
                        src={charity.image}
                        alt={charity.name}
                        className="w-16 h-16 rounded-xl object-cover"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <Heart className="text-emerald-500" size={24} />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">{charity.name}</h3>
                        {charity.featured && (
                          <Star size={16} className="text-amber-500 fill-amber-500 flex-shrink-0" />
                        )}
                        {!charity.isActive && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">Inactive</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        ${(charity.totalRaised + charity.totalIndependentDonations).toLocaleString()} raised
                        {charity.website && (
                          <a href={charity.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-emerald-600 hover:underline">
                            <ExternalLink size={14} className="inline" />
                          </a>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleFeatured(charity)}
                        className={`p-2 rounded-lg transition-colors ${
                          charity.featured
                            ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                            : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                        }`}
                        title={charity.featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Star size={18} fill={charity.featured ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCharity(charity);
                          setShowCharityForm(true);
                        }}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteCharity(charity._id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Deactivate"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <AnimatePresence>
            {showCharityForm && (
              <CharityForm
                charity={editingCharity}
                onSave={handleSaveCharity}
                onCancel={() => {
                  setShowCharityForm(false);
                  setEditingCharity(null);
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {activeTab === TABS.USERS && <UsersTab onRefresh={fetchCharities} />}

      {activeTab === TABS.REPORTS && <AdminReports />}
    </motion.div>
  );
};

export default AdminDashboard;
