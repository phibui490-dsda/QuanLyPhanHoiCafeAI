import React, { useState, useEffect } from 'react';
import { recommendationService, menuService } from '../services/api';
import { Star, Coffee, Sparkles, X, ShoppingCart } from 'lucide-react';
import StarRating from '../components/StarRating';

const RecommendationsPage = ({ user, addToCart }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      if (!user?.userId) {
        console.error("Missing userId");
        setLoading(false);
        return;
      }
      const response = await recommendationService.getRecommendations(user.userId);
      setRecommendations(response.data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (drinkId) => {
    setLoadingDetail(true);
    try {
      const response = await menuService.getDrinkById(drinkId);
      setSelectedDrink(response.data);
    } catch (err) {
      console.error('Error fetching drink detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full text-primary mb-4 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
          <Sparkles size={32} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Dành Riêng Cho Bạn</h1>
        <p className="text-gray-400">
          AI của chúng tôi đã phân tích sở thích và lịch sử đánh giá của bạn để chọn ra những thức uống phù hợp nhất.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="glass p-12 text-center rounded-2xl max-w-2xl mx-auto">
          <Coffee size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Chưa đủ dữ liệu</h3>
          <p className="text-gray-400">
            Hãy trải nghiệm và đánh giá thêm các thức uống để AI có thể hiểu rõ hơn về sở thích của bạn nhé!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((item, index) => (
            <div 
              key={item.drinkId} 
              className="glass rounded-2xl overflow-hidden group hover:-translate-y-2 transition-all duration-300 border border-primary/10 hover:border-primary/40 relative"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {index === 0 && (
                <div className="absolute top-3 right-3 z-10 bg-gradient-to-r from-primary to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                  <Star size={12} className="fill-white" /> Top 1 Phù Hợp
                </div>
              )}
              
              <div className="h-48 bg-coffee-800/50 relative overflow-hidden">
                {item.drinkImageUrl ? (
                  <img src={item.drinkImageUrl} alt={item.drinkName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Coffee size={48} className="text-gray-600 group-hover:scale-110 transition-transform duration-500" />
                  </div>
                )}
                {/* AI Match Score Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.matchScore * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-bold text-primary">{(item.matchScore * 100).toFixed(0)}% Match</span>
                  </div>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                    {item.drinkName}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-400 mb-4 h-10 line-clamp-2">
                  {item.reason}
                </p>
                
                <div className="flex justify-between items-center mt-auto border-t border-coffee-800/50 pt-4">
                  <div className="flex items-center gap-1">
                    <StarRating rating={5} readOnly size={14} />
                  </div>
                  <button 
                    onClick={() => handleOpenDetail(item.drinkId)}
                    disabled={loadingDetail}
                    className="text-primary text-sm font-medium hover:text-white transition-colors disabled:opacity-50"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Xem chi tiết sản phẩm từ gợi ý */}
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
                <StarRating rating={selectedDrink.averageRating || 5} readOnly size={16} />
                <span className="text-sm font-medium text-gray-300 ml-1">
                  {(selectedDrink.averageRating || 5.0).toFixed(1)} / 5.0
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mô tả sản phẩm</h4>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {selectedDrink.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                </p>
              </div>

              <div className="pt-4 border-t border-coffee-800/50 flex justify-end gap-2">
                <button 
                  onClick={() => setSelectedDrink(null)}
                  className="btn-primary px-6 bg-transparent border border-white/10 text-white hover:bg-white/5"
                >
                  Đóng
                </button>
                {addToCart && user?.role === 'Customer' && (
                  <button 
                    onClick={() => {
                      addToCart(selectedDrink);
                      setSelectedDrink(null);
                    }}
                    className="btn-primary px-6 flex items-center gap-2"
                  >
                    <ShoppingCart size={18} /> Thêm vào giỏ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
