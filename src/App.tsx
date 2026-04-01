import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Kitchen from './pages/Kitchen';
import Settings from './pages/Settings';
import FoodDetail from './pages/FoodDetail';
import MyOrders from './pages/MyOrders';
import Profile from './pages/Profile';
import Users from './pages/Users';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/food/:id" element={<FoodDetail />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/dashboard" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
      <Route path="/kitchen" element={<ProtectedRoute requireAdmin><Kitchen /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute requireAdmin><Users /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
