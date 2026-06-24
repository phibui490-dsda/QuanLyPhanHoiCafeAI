import React, { useState, useEffect } from 'react';
import { reportService } from '../services/api';
import { BarChart2, Download, FileText, Calendar } from 'lucide-react';

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exportingType, setExportingType] = useState(null);

  useEffect(() => {
    // Default to last 30 days
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReportData();
    }
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await reportService.getSummaryReport(startDate, endDate);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    setExportingType(format);
    try {
      const response = await reportService.exportReport(format, startDate, endDate);
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CafeAI_Report_${startDate}_to_${endDate}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error exporting ${format}:`, err);
      alert(`Không thể xuất báo cáo ${format.toUpperCase()}`);
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-primary" /> Báo Cáo Thống Kê
          </h1>
          <p className="text-gray-400 mt-1">Xuất dữ liệu hệ thống ra PDF hoặc Excel</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-coffee-800/50 p-2 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 px-2">
            <Calendar size={16} className="text-gray-400" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
            />
            <span className="text-gray-500">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none text-sm text-white focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Card */}
        <div className="glass p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6 border-b border-coffee-800/50 pb-4">
            Tóm tắt kỳ báo cáo
          </h3>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-coffee-800/30 rounded-xl">
                <span className="text-gray-400">Tổng số đánh giá mới</span>
                <span className="text-xl font-bold text-white">{data.totalFeedbacksPeriod}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <span className="text-green-400">Đánh giá tích cực</span>
                <span className="text-xl font-bold text-green-400">{data.positiveCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <span className="text-red-400">Đánh giá tiêu cực</span>
                <span className="text-xl font-bold text-red-400">{data.negativeCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-coffee-800/30 rounded-xl">
                <span className="text-gray-400">Điểm trung bình hệ thống</span>
                <span className="text-xl font-bold text-primary">{data.averageRatingPeriod.toFixed(1)} / 5.0</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Export Actions */}
        <div className="glass p-6 rounded-2xl flex flex-col justify-center items-center text-center">
          <Download size={48} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">Xuất Dữ Liệu</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm">
            Tải xuống báo cáo chi tiết bao gồm danh sách thức uống, thống kê đánh giá và phân tích AI.
          </p>
          
          <div className="flex gap-4 w-full justify-center">
            <button 
              onClick={() => handleExport('pdf')}
              disabled={exportingType !== null}
              className={`flex-1 max-w-[160px] py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-300 ${
                exportingType === 'pdf' 
                  ? 'bg-red-500/50 text-white cursor-wait' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
              }`}
            >
              {exportingType === 'pdf' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Xuất PDF</>
              )}
            </button>
            
            <button 
              onClick={() => handleExport('excel')}
              disabled={exportingType !== null}
              className={`flex-1 max-w-[160px] py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all duration-300 ${
                exportingType === 'excel' 
                  ? 'bg-green-500/50 text-white cursor-wait' 
                  : 'bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500 hover:text-white shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]'
              }`}
            >
              {exportingType === 'excel' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>Xuất Excel</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
