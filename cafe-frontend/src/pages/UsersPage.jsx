import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { Users, Search, Trash2, Shield, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // stores user ID being updated/deleted
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null); // stores user object to delete

  // Get current logged in user from localStorage to prevent self actions
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Không thể tải danh sách người dùng.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(userId);
    setMessage({ type: '', text: '' });
    try {
      await userService.updateUserRole(userId, newRole);
      
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      setMessage({ type: 'success', text: 'Cập nhật vai trò người dùng thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Lỗi khi cập nhật vai trò người dùng.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId);
    setMessage({ type: '', text: '' });
    setDeleteConfirm(null);
    try {
      await userService.deleteUser(userId);
      
      // Remove from state
      setUsers(users.filter(u => u.id !== userId));
      
      setMessage({ type: 'success', text: 'Xóa người dùng thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Lỗi khi xóa người dùng.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-primary" /> Quản Lý Người Dùng
          </h1>
          <p className="text-gray-400 mt-1">Danh sách tài khoản và phân quyền vai trò người dùng hệ thống</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-4 py-2 bg-coffee-800 hover:bg-coffee-700 text-gray-300 rounded-xl transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin text-primary' : ''} />
          Làm mới
        </button>
      </div>

      {/* Notifications */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Search and Filters */}
      <div className="glass p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-3.5 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Tìm kiếm theo họ tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="All">Tất cả vai trò</option>
            <option value="Customer">Khách hàng (Customer)</option>
            <option value="Staff">Nhân viên (Staff)</option>
            <option value="Manager">Quản lý (Manager)</option>
            <option value="Admin">Quản trị (Admin)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-gray-400 text-sm">Đang tải danh sách người dùng...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            Không tìm thấy người dùng nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-coffee-800/80 bg-coffee-950/40 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Họ và Tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Ngày tham gia</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-800/40 text-sm">
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser.userId;
                  return (
                    <tr key={user.id} className="hover:bg-coffee-900/10 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-mono">{user.id}</td>
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-2">
                        {user.fullName}
                        {isSelf && (
                          <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold">
                            Bạn
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 text-gray-400">{formatDate(user.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            disabled={isSelf || actionLoading === user.id}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="bg-coffee-900 border border-coffee-800 text-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="Customer">Customer</option>
                            <option value="Staff">Staff</option>
                            <option value="Manager">Manager</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          disabled={isSelf || actionLoading === user.id}
                          onClick={() => setDeleteConfirm(user)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 disabled:cursor-not-allowed"
                          title={isSelf ? "Không thể tự xóa bản thân" : "Xóa người dùng"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass max-w-md w-full p-6 space-y-6 glow-border">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl shrink-0">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Xác nhận xóa người dùng?</h3>
                <p className="text-sm text-gray-400">
                  Bạn có chắc chắn muốn xóa tài khoản của <strong className="text-gray-200">{deleteConfirm.fullName}</strong> ({deleteConfirm.email}) không? Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-coffee-800 hover:bg-coffee-700 text-gray-300 rounded-xl text-sm transition-all"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirm.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] text-white font-semibold rounded-xl text-sm transition-all"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
