import React, { useState, useEffect } from 'react';
import { aiConfigService } from '../services/api';
import { Settings, Save, AlertCircle, Server } from 'lucide-react';

const AIConfigPage = () => {
  const [config, setConfig] = useState({
    aiServiceUrl: '',
    sentimentThreshold: 0.5,
    maxRecommendations: 5
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await aiConfigService.getConfig();
      if (response.data) {
        setConfig({
          ...response.data,
          aiServiceUrl: 'Google Gemini API (Cloud Service)'
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Không thể tải cấu hình AI.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      const savePayload = {
        ...config,
        aiServiceUrl: 'Google Gemini API (Cloud Service)'
      };
      await aiConfigService.updateConfig(savePayload);
      setMessage({ type: 'success', text: 'Cập nhật cấu hình thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi lưu cấu hình.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-primary" /> Cấu Hình AI
        </h1>
        <p className="text-gray-400 mt-1">Quản lý các thông số cấu hình cho dịch vụ AI (Google Gemini API)</p>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl">
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}>
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Server size={16} className="text-primary" />
                Dịch vụ AI đang hoạt động
              </label>
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={config.aiServiceUrl}
                  className="input-field font-semibold text-sm bg-coffee-950/40 text-emerald-400 border-emerald-500/25 cursor-not-allowed select-none pr-24"
                />
                <span className="absolute right-3 top-2.5 px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium">
                  Connected
                </span>
              </div>
              <p className="mt-1.5 text-xs text-gray-400">
                Hệ thống đã được kết nối trực tiếp tới đám mây Google Gemini để phân tích cảm xúc và gợi ý đồ uống.
              </p>
            </div>

            <div className="pt-4 border-t border-coffee-800/50">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ngưỡng phân loại cảm xúc (Sentiment Threshold)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.sentimentThreshold}
                  onChange={(e) => setConfig({...config, sentimentThreshold: parseFloat(e.target.value)})}
                  className="flex-1 accent-primary"
                />
                <span className="w-12 text-center bg-coffee-800/50 py-1 rounded-lg text-primary font-mono text-sm">
                  {config.sentimentThreshold}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-coffee-800/50">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Số lượng gợi ý tối đa
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={config.maxRecommendations}
                onChange={(e) => setConfig({...config, maxRecommendations: parseInt(e.target.value)})}
                className="input-field w-full md:w-1/3"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-coffee-800/50 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-6"
            >
              {saving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save size={18} /> Lưu cấu hình
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIConfigPage;
