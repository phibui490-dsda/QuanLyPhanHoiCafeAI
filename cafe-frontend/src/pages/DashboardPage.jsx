import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Coffee, MessageSquare, TrendingUp, AlertCircle, Sparkles } from 'lucide-react';
import SentimentBadge from '../components/SentimentBadge';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await reportService.getDashboardStats();
      setData(response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 rounded-2xl flex items-center gap-3 text-red-400">
        <AlertCircle size={24} />
        <p>{error}</p>
      </div>
    );
  }

  const statCards = [
    { title: 'Tổng số người dùng', value: data?.totalUsers || 0, icon: <Users size={24} />, color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400' },
    { title: 'Tổng số thức uống', value: data?.totalDrinks || 0, icon: <Coffee size={24} />, color: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/20', text: 'text-orange-400' },
    { title: 'Tổng số đánh giá', value: data?.totalFeedbacks || 0, icon: <MessageSquare size={24} />, color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400' },
    { title: 'Đánh giá tích cực', value: `${((data?.positiveFeedbacks / (data?.totalFeedbacks || 1)) * 100).toFixed(0)}%`, icon: <TrendingUp size={24} />, color: 'from-green-500/20 to-green-500/5', border: 'border-green-500/20', text: 'text-green-400' },
  ];

  const pieData = [
    { name: 'Tích cực', value: data?.positiveFeedbacks || 0, color: '#4ade80' },
    { name: 'Tiêu cực', value: data?.negativeFeedbacks || 0, color: '#f87171' },
    { name: 'Trung tính', value: (data?.totalFeedbacks || 0) - (data?.positiveFeedbacks || 0) - (data?.negativeFeedbacks || 0), color: '#facc15' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart className="text-primary" /> Tổng quan Hệ thống
          </h1>
          <p className="text-gray-400 mt-1">Thống kê dữ liệu và đánh giá từ AI</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className={`glass p-6 rounded-2xl border bg-gradient-to-br ${stat.color} ${stat.border} hover:-translate-y-1 transition-transform duration-300`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-background/50 ${stat.text} shadow-inner`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Drinks Chart */}
        <div className="glass p-6 rounded-2xl lg:col-span-2 flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Coffee size={20} className="text-primary" /> Top Thức Uống Đánh Giá Cao
          </h3>
          <div className="flex-1 w-full">
            {data?.topRatedDrinks?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topRatedDrinks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#888" tick={{ fill: '#888', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 5]} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(212,175,55,0.1)' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  />
                  <Bar dataKey="averageRating" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Điểm đánh giá" maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Chưa có đủ dữ liệu</div>
            )}
          </div>
        </div>

        {/* Sentiment Distribution */}
        <div className="glass p-6 rounded-2xl flex flex-col h-[400px]">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles size={20} className="text-primary animate-pulse" /> Phân Tích Cảm Xúc AI
          </h3>
          <div className="flex-1 w-full flex justify-center items-center">
            {data?.totalFeedbacks > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Chưa có dữ liệu</div>
            )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
