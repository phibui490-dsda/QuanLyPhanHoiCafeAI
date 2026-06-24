import React, { useState, useEffect } from 'react';
import { feedbackService, menuService } from '../services/api';
import { MessageSquare, Send, Reply, Clock, AlertCircle } from 'lucide-react';
import StarRating from '../components/StarRating';
import SentimentBadge from '../components/SentimentBadge';

const FeedbackPage = ({ user }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Submit Feedback State
  const [newFeedback, setNewFeedback] = useState({ drinkId: '', comment: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  // Reply State
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feedbacksRes, drinksRes] = await Promise.all([
        feedbackService.getAllFeedbacks(),
        menuService.getAllDrinks()
      ]);
      setFeedbacks(feedbacksRes.data);
      setDrinks(drinksRes.data);
      if (drinksRes.data.length > 0) {
        setNewFeedback(prev => ({ ...prev, drinkId: drinksRes.data[0].id }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackService.submitFeedback(newFeedback);
      setNewFeedback({ drinkId: drinks[0]?.id || '', comment: '', rating: 5 });
      fetchData();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Không thể gửi đánh giá.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (feedbackId) => {
    if (!replyContent.trim()) return;
    try {
      await feedbackService.replyToFeedback(feedbackId, { content: replyContent });
      setReplyingTo(null);
      setReplyContent('');
      fetchData();
    } catch (err) {
      console.error('Error replying:', err);
      alert('Không thể gửi phản hồi.');
    }
  };

  const isCustomer = user?.role === 'Customer';
  const isStaffOrManager = user?.role === 'Staff' || user?.role === 'Manager';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-primary" /> Đánh Giá & Phản Hồi
          </h1>
          <p className="text-gray-400 mt-1">
            {isCustomer ? 'Chia sẻ cảm nhận của bạn về thức uống' : 'Quản lý đánh giá từ khách hàng'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Submit Form */}
        {isCustomer && (
          <div className="lg:col-span-1">
            <div className="glass p-6 rounded-2xl sticky top-24">
              <h3 className="text-lg font-bold text-white mb-4">Gửi đánh giá mới</h3>
              <form onSubmit={handleSubmitFeedback} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Chọn thức uống</label>
                  <select
                    value={newFeedback.drinkId}
                    onChange={(e) => setNewFeedback({...newFeedback, drinkId: e.target.value})}
                    className="input-field cursor-pointer"
                    required
                  >
                    {drinks.map(drink => (
                      <option key={drink.id} value={drink.id} className="bg-coffee-900 text-white">
                        {drink.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mức độ hài lòng</label>
                  <div className="bg-coffee-800/30 p-3 rounded-xl border border-white/5 flex justify-center">
                    <StarRating rating={newFeedback.rating} setRating={(val) => setNewFeedback({...newFeedback, rating: val})} size={28} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Cảm nhận của bạn</label>
                  <textarea
                    required
                    value={newFeedback.comment}
                    onChange={(e) => setNewFeedback({...newFeedback, comment: e.target.value})}
                    className="input-field min-h-[100px] resize-none"
                    placeholder="Thức uống này như thế nào?"
                  ></textarea>
                </div>

                <button type="submit" disabled={submitting} className="btn-primary w-full flex justify-center items-center gap-2">
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Send size={18} /> Gửi đánh giá
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Feedback List */}
        <div className={isCustomer ? 'lg:col-span-2' : 'lg:col-span-3'}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="glass p-12 text-center rounded-2xl flex flex-col items-center">
              <MessageSquare size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400">Chưa có đánh giá nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbacks.map(fb => (
                <div key={fb.id} className="glass p-5 rounded-2xl hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-primary font-bold">
                        {fb.customerName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-white">{fb.customerName}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="text-primary/80">{fb.drinkName}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {new Date(fb.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <StarRating rating={fb.rating} readOnly size={16} />
                      {fb.sentimentResult && (
                        <SentimentBadge sentiment={fb.sentimentResult} isAI={true} />
                      )}
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm bg-coffee-800/30 p-3 rounded-xl border border-white/5">
                    {fb.comment}
                  </p>

                  {/* Replies */}
                  {fb.replies && fb.replies.length > 0 && (
                    <div className="mt-4 pl-4 ml-4 border-l-2 border-primary/30 space-y-3">
                      {fb.replies.map(reply => (
                        <div key={reply.id} className="bg-black/20 p-3 rounded-xl">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-primary flex items-center gap-1">
                              <Reply size={12} /> {reply.staffName} (Phản hồi)
                            </span>
                            <span className="text-xs text-gray-500">{new Date(reply.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <p className="text-sm text-gray-300">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form (Staff/Manager only) */}
                  {isStaffOrManager && (
                    <div className="mt-4 pt-4 border-t border-coffee-800/50">
                      {replyingTo === fb.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Nhập phản hồi của bạn..."
                            className="input-field flex-1"
                            autoFocus
                          />
                          <button onClick={() => handleReply(fb.id)} className="btn-primary px-4">Gửi</button>
                          <button onClick={() => setReplyingTo(null)} className="px-4 py-2 rounded-xl text-gray-400 hover:bg-white/5">Hủy</button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setReplyingTo(fb.id)}
                          className="text-sm text-primary hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <Reply size={14} /> Trả lời
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
