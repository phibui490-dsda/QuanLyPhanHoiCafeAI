import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coffee, Menu, MessageSquare, Star, BarChart2, Settings, LogOut, Users, ShoppingBag } from 'lucide-react';

const Navbar = ({ user, onLogout, cartCount = 0 }) => {
  const location = useLocation();

  const getLinks = () => {
    const common = [
      { path: '/menu', label: 'Thực đơn', icon: <Menu size={18} /> },
      { path: '/feedback', label: 'Đánh giá', icon: <MessageSquare size={18} /> },
    ];

    if (user.role === 'Customer') {
      return [
        ...common,
        { path: '/my-orders', label: 'Đơn hàng', icon: <ShoppingBag size={18} /> },
        { path: '/recommendations', label: 'Gợi ý cho bạn', icon: <Star size={18} /> },
      ];
    } else if (user.role === 'Manager') {
      return [
        { path: '/', label: 'Dashboard', icon: <BarChart2 size={18} /> },
        ...common,
        { path: '/orders', label: 'Đơn hàng', icon: <ShoppingBag size={18} /> },
        { path: '/reports', label: 'Báo cáo', icon: <BarChart2 size={18} /> },
        { path: '/ai-config', label: 'Cấu hình AI', icon: <Settings size={18} /> },
      ];
    } else if (user.role === 'Admin') {
      return [
        { path: '/', label: 'Dashboard', icon: <BarChart2 size={18} /> },
        ...common,
        { path: '/orders', label: 'Đơn hàng', icon: <ShoppingBag size={18} /> },
        { path: '/reports', label: 'Báo cáo', icon: <BarChart2 size={18} /> },
        { path: '/ai-config', label: 'Cấu hình AI', icon: <Settings size={18} /> },
        { path: '/users', label: 'Người dùng', icon: <Users size={18} /> },
      ];
    } else if (user.role === 'Staff') {
      return [
        ...common,
        { path: '/orders', label: 'Đơn hàng', icon: <ShoppingBag size={18} /> },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <nav className="glass sticky top-0 z-50 border-b border-coffee-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
              <Coffee className="text-primary" />
              Café AI
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-4 text-sm font-medium">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                    location.pathname === link.path || (link.path === '/' && location.pathname === '/dashboard')
                      ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(212,175,55,0.15)]'
                      : 'text-gray-300 hover:text-white hover:bg-coffee-800'
                  }`}
                >
                  {link.icon}
                  {link.label}
                  {link.path === '/menu' && user.role === 'Customer' && cartCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-primary text-black rounded-full animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 border-l border-coffee-800 pl-4 ml-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user.fullName}</span>
                <span className="text-xs text-primary/80">{user.role}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                title="Đăng xuất"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
