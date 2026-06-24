import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle, Edit2, Search, X } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAllOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    try {
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Có lỗi xảy ra khi cập nhật trạng thái.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'Processing': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'Completed': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'Cancelled': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Pending': return 'Chờ xác nhận';
      case 'Processing': return 'Đang xử lý';
      case 'Completed': return 'Đã hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} />;
      case 'Processing': return <AlertCircle size={16} />;
      case 'Completed': return <CheckCircle size={16} />;
      case 'Cancelled': return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toString().includes(searchQuery) ||
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-primary" /> Quản Lý Đơn Hàng
          </h1>
          <p className="text-gray-400 mt-1">Quản lý và cập nhật trạng thái đơn hàng của khách</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Tìm mã đơn, tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-coffee-800/50 text-gray-300 text-sm uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-semibold">Mã Đơn</th>
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Ngày đặt</th>
                <th className="p-4 font-semibold">Tổng tiền</th>
                <th className="p-4 font-semibold">Thanh toán</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 font-medium text-white">#{order.id}</td>
                  <td className="p-4 text-gray-300">{order.customerName}</td>
                  <td className="p-4 text-gray-400 text-sm">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                  <td className="p-4 font-medium text-primary">{order.totalPrice.toLocaleString('vi-VN')} ₫</td>
                  <td className="p-4 text-gray-300 text-sm">
                    {order.paymentMethod === 'Cash' ? 'Tiền mặt' : order.paymentMethod === 'Momo' ? 'Ví MoMo' : 'Chuyển khoản'}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status);
                      }}
                      className="p-2 bg-coffee-800/50 text-blue-400 hover:bg-blue-400/20 rounded-xl transition-colors"
                      title="Cập nhật trạng thái"
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">Không tìm thấy đơn hàng nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Cập nhật trạng thái */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-5 border-b border-coffee-800/50">
              <h2 className="text-xl font-bold text-white">
                Cập nhật đơn hàng #{selectedOrder.id}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="bg-coffee-800/30 p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Khách hàng:</span>
                  <span className="text-white font-medium">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tổng tiền:</span>
                  <span className="text-primary font-bold">{selectedOrder.totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Trạng thái đơn hàng</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Pending', 'Processing', 'Completed', 'Cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2
                        ${newStatus === status 
                          ? getStatusColor(status) + ' shadow-lg scale-105'
                          : 'border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                    >
                      {getStatusIcon(status)} {getStatusText(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-coffee-800/50 mt-6">
                <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">
                  Hủy
                </button>
                <button onClick={handleUpdateStatus} className="btn-primary">
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
