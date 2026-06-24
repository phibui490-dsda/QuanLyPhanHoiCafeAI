import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MenuPage from './pages/MenuPage';
import FeedbackPage from './pages/FeedbackPage';
import ReportsPage from './pages/ReportsPage';
import RecommendationsPage from './pages/RecommendationsPage';
import AIConfigPage from './pages/AIConfigPage';
import UsersPage from './pages/UsersPage';
import MyOrdersPage from './pages/MyOrdersPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const addToCart = (drink) => {
    setCart(prev => {
      const existing = prev.find(item => item.drinkId === drink.id);
      if (existing) {
        return prev.map(item => item.drinkId === drink.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { drinkId: drink.id, name: drink.name, price: drink.price, quantity: 1, imageUrl: drink.imageUrl }];
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {user && <Navbar user={user} onLogout={handleLogout} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} />}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/login" element={!user ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage onLogin={handleLogin} /> : <Navigate to="/" />} />
          
          <Route path="/" element={
            <ProtectedRoute user={user}>
              {user?.role === 'Customer' ? <MenuPage user={user} cart={cart} setCart={setCart} addToCart={addToCart} /> : <DashboardPage />}
            </ProtectedRoute>
          } />
          
          <Route path="/menu" element={
            <ProtectedRoute user={user}>
              <MenuPage user={user} cart={cart} setCart={setCart} addToCart={addToCart} />
            </ProtectedRoute>
          } />
          
          <Route path="/feedback" element={
            <ProtectedRoute user={user}>
              <FeedbackPage user={user} />
            </ProtectedRoute>
          } />
          
          <Route path="/recommendations" element={
            <ProtectedRoute user={user} allowedRoles={['Customer']}>
              <RecommendationsPage user={user} addToCart={addToCart} />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute user={user} allowedRoles={['Manager', 'Admin']}>
              <ReportsPage />
            </ProtectedRoute>
          } />

          <Route path="/ai-config" element={
            <ProtectedRoute user={user} allowedRoles={['Manager', 'Admin']}>
              <AIConfigPage />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute user={user} allowedRoles={['Admin']}>
              <UsersPage />
            </ProtectedRoute>
          } />

          <Route path="/my-orders" element={
            <ProtectedRoute user={user}>
              <MyOrdersPage />
            </ProtectedRoute>
          } />

          <Route path="/orders" element={
            <ProtectedRoute user={user} allowedRoles={['Staff', 'Manager', 'Admin']}>
              <OrdersPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </div>
  );
}

const ProtectedRoute = ({ user, children, allowedRoles }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};

export default App;
