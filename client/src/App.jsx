import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';

import DashboardLayout from './components/layout/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Scores from './pages/Scores';
import Draws from './pages/Draws';
import DrawInfo from './pages/DrawInfo';
import Charity from './pages/Charity';
import Subscription from './pages/Subscription';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import AdminDashboard from './pages/AdminDashboard';
import MyWinnings from './pages/MyWinnings';

const AuthRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const SubscriberRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'subscriber' && user.role !== 'admin') {
    // Prevent infinite redirect loop - allow access to subscription page
    if (location.pathname === '/subscription' || location.pathname === '/subscription/success') {
      return children;
    }
    return <Navigate to="/subscription" />;
  }
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;
  return children;
};

// FullAuthRoute - provides access to setUser for components that need it
const FullAuthRoute = ({ children }) => {
  const auth = useContext(AuthContext);
  const { user, loading } = auth;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/draw-info" element={<DrawInfo />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      
      <Route path="/subscription" element={
        <AuthRoute>
          <DashboardLayout><Subscription /></DashboardLayout>
        </AuthRoute>
      } />

      <Route path="/subscription/success" element={
        <FullAuthRoute>
          <SubscriptionSuccess />
        </FullAuthRoute>
      } />

      {/* Scores - Accessible to all logged-in users (visitors + subscribers) */}
      <Route path="/scores" element={
        <AuthRoute>
          <DashboardLayout><Scores /></DashboardLayout>
        </AuthRoute>
      } />

      {/* Charity - Accessible to all logged-in users (visitors + subscribers) */}
      <Route path="/charity" element={
        <AuthRoute>
          <DashboardLayout><Charity /></DashboardLayout>
        </AuthRoute>
      } />

      {/* Dashboard & Draws - Premium features for subscribers only */}
      <Route path="/dashboard" element={
        <SubscriberRoute>
          <DashboardLayout><Dashboard /></DashboardLayout>
        </SubscriberRoute>
      } />
      <Route path="/draws" element={
        <SubscriberRoute>
          <DashboardLayout><Draws /></DashboardLayout>
        </SubscriberRoute>
      } />
      
      <Route path="/my-winnings" element={
        <SubscriberRoute>
          <DashboardLayout><MyWinnings /></DashboardLayout>
        </SubscriberRoute>
      } />
      <Route path="/admin" element={
        <AdminRoute>
          <DashboardLayout><AdminDashboard /></DashboardLayout>
        </AdminRoute>
      } />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;