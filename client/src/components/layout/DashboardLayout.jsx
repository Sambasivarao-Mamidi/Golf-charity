import { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Target, 
  Trophy, 
  Heart, 
  CreditCard, 
  LogOut,
  Home,
  Menu,
  X
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const userRole = user?.role || 'visitor';

  const navItems = [
    { 
      path: '/subscription', 
      label: 'Subscription', 
      icon: CreditCard,
      show: true
    },
    { 
      path: '/scores', 
      label: 'My Scores', 
      icon: Target,
      show: true // Show for all logged-in users
    },
    { 
      path: '/charity', 
      label: 'Charity', 
      icon: Heart,
      show: true // Show for all logged-in users
    },
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      show: userRole === 'subscriber' || userRole === 'admin'
    },
    { 
      path: '/draws', 
      label: 'Draws', 
      icon: Trophy,
      show: userRole === 'subscriber' || userRole === 'admin'
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-gray-50 to-teal-100">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 px-4 py-3 flex items-center justify-between">
        <span className="text-xl font-semibold text-gray-800">GolfCharity</span>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-white/50 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white/70 backdrop-blur-md border-r border-white/30 z-50
        transform transition-transform duration-300 ease-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-100/50">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Golf<span className="text-emerald-600">Charity</span>
          </h1>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.filter(item => item.show).map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${location.pathname === item.path 
                    ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' 
                    : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'}
                `}
              >
                <Icon size={20} className={location.pathname === item.path ? 'text-emerald-600' : 'text-gray-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100/50 space-y-2">
          <button
            onClick={handleHomeClick}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-white/50 rounded-xl transition-colors text-left"
          >
            <Home size={20} className="text-gray-400" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="p-6 lg:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;