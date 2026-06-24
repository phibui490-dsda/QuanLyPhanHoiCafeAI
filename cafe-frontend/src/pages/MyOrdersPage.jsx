import React, { useState, useEffect } from 'react';
import { orderService } from '../services/api';
import { ShoppingBag, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyOrders();
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="text-primary" /> Đơn Hàng Của Tôi
          </h1>
          <p className="text-gray-400 mt-1">Theo dõi lịch sử và trạng thái đơn hàng của bạn</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl flex flex-col items-center">
          <ShoppingBag size={48} className="text-gray-600 mb-4" />
          <p className="text-gray-400">Bạn chưa có đơn hàng nào.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="glass p-5 rounded-2xl">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-white text-lg">Đơn hàng #{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)} {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleString('vi-VN')}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center bg-primary/10 border border-primary/20 px-4 py-2 rounded-xl">
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Số thứ tự của bạn</div>
                    <div className="text-2xl font-black text-primary">#{order.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Tổng tiền</div>
                    <div className="text-xl font-bold text-primary">{order.totalPrice.toLocaleString('vi-VN')} ₫</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Chi tiết hóa đơn</div>
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-coffee-800/30 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-coffee-850 flex items-center justify-center text-primary font-bold border border-white/5">
                        {item.quantity}x
                      </div>
                      <div>
                        <span className="text-white font-medium block">{item.drinkName}</span>
                        <span className="text-xs text-gray-400">Đơn giá: {item.price ? item.price.toLocaleString('vi-VN') : (item.unitPrice ? item.unitPrice.toLocaleString('vi-VN') : '0')} ₫</span>
                      </div>
                    </div>
                    <span className="text-gray-300 font-semibold">
                      {((item.price || item.unitPrice || 0) * item.quantity).toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="text-sm text-gray-400 flex items-center gap-2">
                  <span>Thanh toán:</span>
                  <span className="font-semibold text-gray-200">
                    {order.paymentMethod === 'Cash' ? 'Tiền mặt tại quầy' : order.paymentMethod === 'Momo' ? 'Ví điện tử MoMo' : 'Chuyển khoản ngân hàng'}
                  </span>
                </div>
                {order.status === 'Pending' && (
                  <div className="text-xs text-amber-400 bg-amber-400/10 px-3 py-1 rounded-lg border border-amber-400/20 animate-pulse">
                    Vui lòng quét mã QR thanh toán tại Giỏ hàng hoặc gặp Nhân viên để hoàn tất đơn hàng
                  </div>
                )}
                {order.status === 'Processing' && (
                  <div className="text-xs text-blue-400 bg-blue-400/10 px-3 py-1 rounded-lg border border-blue-400/20">
                    Đang chế biến - Hãy chuẩn bị nhận món khi nhân viên gọi số <strong className="text-primary font-bold">#{order.id}</strong>
                  </div>
                )}
                {order.status === 'Completed' && (
                  <div className="text-xs text-green-400 bg-green-400/10 px-3 py-1 rounded-lg border border-green-400/20">
                    Chúc ngon miệng! Cảm ơn bạn đã lựa chọn cửa hàng.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
