import React from 'react';
import { Smile, Meh, Frown, Sparkles } from 'lucide-react';

const SentimentBadge = ({ sentiment, isAI = false }) => {
  if (!sentiment) return null;

  const sentimentMap = {
    'Positive': {
      color: 'text-green-400',
      bg: 'bg-green-400/10',
      border: 'border-green-400/20',
      icon: <Smile size={14} />,
      label: 'Tích cực'
    },
    'Negative': {
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/20',
      icon: <Frown size={14} />,
      label: 'Tiêu cực'
    },
    'Neutral': {
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      border: 'border-yellow-400/20',
      icon: <Meh size={14} />,
      label: 'Trung tính'
    }
  };

  const config = sentimentMap[sentiment] || sentimentMap['Neutral'];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.border} ${config.color}`}>
      {isAI && <Sparkles size={12} className="text-primary animate-pulse" />}
      {config.icon}
      {config.label}
    </div>
  );
};

export default SentimentBadge;
