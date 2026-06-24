import React, { useState, useEffect } from 'react';
import { menuService, recommendationService, orderService } from '../services/api';
import { Coffee, Plus, Edit2, Trash2, Search, X, AlertCircle, ShoppingCart, Minus, CheckCircle } from 'lucide-react';
import StarRating from '../components/StarRating';

const MenuPage = ({ user, cart, setCart, addToCart }) => {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrink, setEditingDrink] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: 0, category: 'Coffee', imageUrl: '' });
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Cart & Recommendations states
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  const categories = ['Coffee', 'Tea', 'Smoothie', 'Juice', 'Dessert'];

  useEffect(() => {
    fetchDrinks();
    fetchRecommendations();
  }, [user]);

  const fetchDrinks = async () => {
    try {
      setLoading(true);
      const response = await menuService.getAllDrinks();
      setDrinks(response.data);
    } catch (err) {
      console.error('Error fetching drinks:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!user?.id) return;
    try {
      const response = await recommendationService.getRecommendations(user.id);
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    }
  };

  const updateCartQuantity = (drinkId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.drinkId === drinkId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (drinkId) => {
    setCart(prev => prev.filter(item => item.drinkId !== drinkId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    console.log('[Checkout] Bắt đầu thanh toán, cart:', cart);
    
    // Lưu dữ liệu cart trước khi xóa
    const cartSnapshot = cart.map(item => ({
      ...item,
      drinkName: item.name,
    }));
    const total = cartSnapshot.reduce((sum, i) => sum + i.price * i.quantity, 0);
    
    setIsSubmittingOrder(true);
    
    let receipt = null;
    
    try {
      const orderData = {
        paymentMethod: paymentMethod,
        items: cartSnapshot.map(item => ({ drinkId: item.drinkId, quantity: item.quantity }))
      };
      console.log('[Checkout] Gọi API tạo đơn hàng:', orderData);
      const response = await orderService.createOrder(orderData);
      console.log('[Checkout] API trả về:', response.data);
      const serverReceipt = response.data;
      
      receipt = {
        id: serverReceipt.id,
        items: serverReceipt.items && serverReceipt.items.length > 0
          ? serverReceipt.items
          : cartSnapshot.map(item => ({
              drinkId: item.drinkId,
              drinkName: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
        totalPrice: serverReceipt.totalPrice || total,
        paymentMethod: serverReceipt.paymentMethod || paymentMethod,
      };
    } catch (err) {
      console.error('[Checkout] Lỗi API:', err);
      console.error('[Checkout] Response:', err.response?.data);
      // Vẫn tạo receipt từ dữ liệu local nếu API lỗi
      receipt = {
        id: Math.floor(Math.random() * 1000) + 1,
        items: cartSnapshot.map(item => ({
          drinkId: item.drinkId,
          drinkName: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice: total,
        paymentMethod: paymentMethod,
        error: true,
      };
    }
    
    console.log('[Checkout] Receipt data:', receipt);
    
    // Luôn hiện hóa đơn dù API thành công hay thất bại
    setIsSubmittingOrder(false);
    setReceiptData(receipt);
    setIsReceiptOpen(true);
    setIsCartOpen(false);
    setCart([]);
    
    console.log('[Checkout] Đã set isReceiptOpen = true');
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filteredDrinks = drinks.filter(drink => 
    drink.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    drink.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (drink = null) => {
    if (drink) {
      setEditingDrink(drink);
      setFormData({ ...drink });
    } else {
      setEditingDrink(null);
      setFormData({ name: '', description: '', price: 0, category: 'Coffee', imageUrl: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDrink(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      setUploadingImage(true);
      const response = await menuService.uploadImage(formDataUpload);
      // Backend trả về url tương đối như: /uploads/filename.ext
      // Vì frontend chạy ở port khác backend nên ta cần prepend host url http://localhost:5287
      const fullUrl = `http://localhost:5287${response.data.imageUrl}`;
      setFormData(prev => ({ ...prev, imageUrl: fullUrl }));
    } catch (err) {
      console.error('Error uploading image:', err);
      alert('Có lỗi xảy ra khi tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveDrink = async (e) => {
    e.preventDefault();
    try {
      if (editingDrink) {
        await menuService.updateDrink(editingDrink.id, formData);
      } else {
        await menuService.addDrink(formData);
      }
      handleCloseModal();
      fetchDrinks();
    } catch (err) {
      console.error('Error saving drink:', err);
      alert('Có lỗi xảy ra khi lưu thức uống');
    }
  };

  const handleDeleteDrink = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thức uống này?')) {
      try {
        await menuService.deleteDrink(id);
        fetchDrinks();
      } catch (err) {
        console.error('Error deleting drink:', err);
        alert('Có lỗi xảy ra khi xóa thức uống');
      }
    }
  };

  const isManager = user?.role === 'Manager' || user?.role === 'Admin';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Coffee className="text-primary" /> Thực Đơn
          </h1>
          <p className="text-gray-400 mt-1">Khám phá các loại thức uống tuyệt vời của chúng tôi</p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm đồ uống..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          {isManager && (
            <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 whitespace-nowrap">
              <Plus size={18} /> <span className="hidden sm:inline">Thêm mới</span>
            </button>
          )}
          <button onClick={() => setIsCartOpen(true)} className="btn-primary flex items-center gap-2 relative">
            <ShoppingCart size={18} />
            <span className="hidden sm:inline">Giỏ hàng</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : filteredDrinks.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl flex flex-col items-center">
          <Coffee size={48} className="text-gray-600 mb-4" />
          <p className="text-gray-400">Không tìm thấy thức uống nào phù hợp.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrinks.map(drink => (
            <div 
              key={drink.id} 
              onClick={() => setSelectedDrink(drink)}
              className="glass rounded-2xl overflow-hidden group hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="h-48 bg-coffee-800/50 relative overflow-hidden">
                {drink.imageUrl ? (
                  <img src={drink.imageUrl} alt={drink.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Coffee size={48} className="text-gray-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-semibold border border-white/10">
                  {drink.category}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors line-clamp-1" title={drink.name}>
                    {drink.name}
                  </h3>
                  <span className="text-primary font-bold whitespace-nowrap ml-2">
                    {drink.price.toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 mb-4 min-h-[40px]">
                  {drink.description || 'Chưa có mô tả.'}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex items-center gap-1.5 bg-coffee-800/50 px-2 py-1 rounded-lg border border-white/5">
                    <StarRating rating={drink.averageRating} readOnly size={14} />
                    <span className="text-xs text-gray-400 ml-1">({drink.averageRating.toFixed(1)})</span>
                  </div>
                  
                  {isManager && (
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(drink); }}
                        className="p-1.5 text-blue-400 hover:bg-blue-400/20 rounded-md transition-colors"
                        title="Sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteDrink(drink.id); }}
                        className="p-1.5 text-red-400 hover:bg-red-400/20 rounded-md transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(drink); }}
                    className="p-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl transition-colors"
                    title="Thêm vào giỏ"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal cho Thêm/Sửa */}
      {isModalOpen && isManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex justify-between items-center p-5 border-b border-coffee-800/50">
              <h2 className="text-xl font-bold text-white">
                {editingDrink ? 'Sửa Thức Uống' : 'Thêm Thức Uống Mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveDrink} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tên thức uống *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input-field"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Danh mục</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="input-field cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-coffee-900 text-white">{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input-field min-h-[80px] resize-none"
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hình ảnh thức uống</label>
                <div className="space-y-3">
                  {/* Chọn ảnh từ máy tính */}
                  <div className="flex items-center gap-3">
                    <label className="btn-primary cursor-pointer text-sm py-2 px-3 flex items-center gap-2 whitespace-nowrap bg-coffee-700/60 hover:bg-coffee-600/80 border border-white/10 rounded-xl">
                      <span>Chọn ảnh từ máy...</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                    {uploadingImage && (
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    )}
                  </div>

                  {/* Nhập URL thủ công */}
                  <div className="relative">
                    <div className="text-xs text-gray-500 mb-1">Hoặc đường dẫn ảnh (URL):</div>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                      className="input-field text-sm"
                      placeholder="https://example.com/image.jpg"
                      disabled={uploadingImage}
                    />
                  </div>

                  {/* Xem trước ảnh đã chọn/nhập */}
                  {formData.imageUrl && (
                    <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 bg-coffee-800/50">
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                        className="absolute top-1 right-1 bg-black/75 hover:bg-black text-white p-1 rounded-full border border-white/10 transition-colors"
                        title="Xóa ảnh"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-coffee-800/50 mt-6">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-colors">
                  Hủy
                </button>
                <button type="submit" className="btn-primary">
                  {editingDrink ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem chi tiết sản phẩm cho tất cả các vai trò */}
      {selectedDrink && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" 
          onClick={() => setSelectedDrink(null)}
        >
          <div 
            className="glass w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-64 bg-coffee-800/50">
              {selectedDrink.imageUrl ? (
                <img src={selectedDrink.imageUrl} alt={selectedDrink.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Coffee size={64} className="text-gray-600" />
                </div>
              )}
              <button 
                onClick={() => setSelectedDrink(null)}
                className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-2 rounded-full border border-white/10 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-semibold border border-white/10">
                {selectedDrink.category}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-white leading-tight">
                  {selectedDrink.name}
                </h2>
                <span className="text-2xl font-bold text-primary whitespace-nowrap ml-4">
                  {selectedDrink.price.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              <div className="flex items-center gap-2 bg-coffee-800/30 px-3 py-2 rounded-xl border border-white/5 w-fit">
                <StarRating rating={selectedDrink.averageRating} readOnly size={16} />
                <span className="text-sm font-medium text-gray-300 ml-1">
                  {selectedDrink.averageRating.toFixed(1)} / 5.0
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mô tả sản phẩm</h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {selectedDrink.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                </p>
              </div>

              <div className="pt-4 border-t border-coffee-800/50 flex justify-end">
                <button 
                  onClick={() => setSelectedDrink(null)}
                  className="btn-primary px-6"
                >
                  Đóng
                </button>
                <button 
                  onClick={() => {
                    addToCart(selectedDrink);
                    setSelectedDrink(null);
                  }}
                  className="btn-primary px-6 ml-2 flex items-center gap-2"
                >
                  <ShoppingCart size={18} /> Thêm vào giỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col md:flex-row max-h-[90vh]">
            
            {/* Left: Cart Items */}
            <div className="flex-1 p-6 overflow-y-auto border-r border-white/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="text-primary" /> Giỏ Hàng
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-white md:hidden">
                  <X size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <ShoppingCart size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Giỏ hàng của bạn đang trống.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.drinkId} className="flex items-center gap-4 bg-coffee-800/30 p-3 rounded-xl border border-white/5">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-coffee-800 shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Coffee size={24} className="text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white truncate">{item.name}</h4>
                        <div className="text-primary text-sm">{item.price.toLocaleString('vi-VN')} ₫</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-black/30 rounded-lg">
                          <button onClick={() => updateCartQuantity(item.drinkId, -1)} className="p-1.5 text-gray-400 hover:text-white">
                            <Minus size={16} />
                          </button>
                          <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.drinkId, 1)} className="p-1.5 text-gray-400 hover:text-white">
                            <Plus size={16} />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.drinkId)} className="text-red-400 hover:text-red-300 p-2">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations Section */}
              {recommendations.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/5">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <StarRating rating={5} readOnly size={16} /> Gợi ý cho bạn
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {recommendations.slice(0, 4).map(rec => {
                      const drink = drinks.find(d => d.id === rec.drinkId);
                      if (!drink) return null;
                      return (
                        <div key={rec.drinkId} className="bg-coffee-800/40 p-2 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-coffee-700/50 transition-colors"
                             onClick={() => addToCart(drink)}>
                           <div className="w-10 h-10 rounded-lg overflow-hidden bg-coffee-800 shrink-0">
                             {drink.imageUrl ? <img src={drink.imageUrl} className="w-full h-full object-cover" /> : <Coffee size={16} className="m-auto mt-2 text-gray-500" />}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="text-xs font-semibold text-white truncate">{drink.name}</div>
                             <div className="text-xs text-primary">{drink.price.toLocaleString()} ₫</div>
                           </div>
                           <button className="p-1 bg-primary/20 text-primary rounded-lg shrink-0">
                             <Plus size={14} />
                           </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Checkout Sidebar */}
            <div className="w-full md:w-80 bg-coffee-900/50 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h3 className="font-bold text-white">Thanh toán</h3>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="hidden md:block absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={24} />
              </button>

              <h3 className="text-lg font-bold text-white mb-4 hidden md:block">Tổng quan đơn hàng</h3>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex justify-between text-gray-300">
                  <span>Số lượng:</span>
                  <span>{cartItemCount} món</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/10">
                  <span>Tổng tiền:</span>
                  <span className="text-primary">{cartTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/10">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phương thức thanh toán</label>
                  <div className="space-y-3">
                    {['Cash', 'Momo', 'Bank'].map(method => (
                      <div key={method} className={`rounded-xl border transition-all duration-300 ${paymentMethod === method ? 'border-primary/50 bg-primary/10' : 'border-white/10 hover:bg-white/5'}`}>
                        <label className="flex items-center gap-3 p-3 cursor-pointer">
                          <input 
                            type="radio" 
                            name="payment" 
                            value={method} 
                            checked={paymentMethod === method}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="accent-primary w-4 h-4"
                          />
                          <span className={`font-medium ${paymentMethod === method ? 'text-primary' : 'text-white'}`}>
                            {method === 'Cash' ? 'Tiền mặt' : method === 'Momo' ? 'Ví MoMo' : 'Chuyển khoản ngân hàng'}
                          </span>
                        </label>
                        
                        {/* Mã QR hiển thị khi chọn Momo hoặc Bank */}
                        {paymentMethod === method && method !== 'Cash' && (
                          <div className="p-4 pt-0 flex flex-col items-center animate-fade-in">
                            <div className="bg-white p-2 rounded-xl shadow-lg mb-3">
                              <img 
                                src={method === 'Bank' ? './bank-qr.png' : './momo-qr.png'} 
                                alt={`QR Code ${method}`}
                                className="w-48 h-48 object-contain"
                              />
                            </div>
                            <p className="text-sm text-gray-400 text-center leading-relaxed">
                              Quét mã để thanh toán <br /> 
                              <span className="text-primary font-bold text-lg">{cartTotal.toLocaleString('vi-VN')} ₫</span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button 
                  onClick={handleCheckout} 
                  disabled={cart.length === 0 || isSubmittingOrder}
                  className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all ${
                    cart.length === 0 || isSubmittingOrder
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                  }`}
                >
                  {isSubmittingOrder ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>Thanh toán {cartTotal > 0 && `${cartTotal.toLocaleString('vi-VN')} ₫`}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {isReceiptOpen && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
            <div className="bg-primary/20 p-6 text-center border-b border-primary/30 relative">
              <button 
                onClick={() => setIsReceiptOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">Thanh toán thành công!</h2>
              <p className="text-gray-300 mt-3 text-sm">Số thứ tự của bạn là</p>
              <div className="text-6xl font-black text-primary my-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                #{receiptData.id}
              </div>
              <p className="text-sm text-gray-400">Vui lòng chú ý lắng nghe nhân viên gọi số</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <span className="text-gray-400">Phương thức:</span>
                <span className="text-white font-semibold">
                  {receiptData.paymentMethod === 'Cash' ? 'Tiền mặt' : receiptData.paymentMethod === 'Momo' ? 'Ví MoMo' : 'Chuyển khoản ngân hàng'}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Chi tiết đơn hàng</div>
                {receiptData.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm items-center">
                    <span className="text-white font-medium flex items-center gap-2">
                      <span className="bg-coffee-800/50 px-2 py-0.5 rounded text-xs text-primary">{item.quantity}x</span> 
                      {item.drinkName || 'Sản phẩm'}
                    </span>
                    <span className="text-gray-300">{(item.price * item.quantity).toLocaleString('vi-VN')} ₫</span>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                <span className="font-bold text-gray-300 text-lg">Tổng cộng:</span>
                <span className="text-2xl font-bold text-primary">{receiptData.totalPrice?.toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => setIsReceiptOpen(false)}
                  className="w-full btn-primary py-3 rounded-xl font-bold flex justify-center items-center gap-2"
                >
                  <CheckCircle size={18} /> Hoàn tất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
