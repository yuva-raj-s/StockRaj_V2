import React from 'react';
import { type SentimentData } from '../types';
import { Brain } from 'lucide-react';

interface SentimentCardProps {
  data: SentimentData;
}

const SentimentCard: React.FC<SentimentCardProps> = ({ data }) => {
  const getSentimentColor = (score: number) => {
    if (score <= 40) return 'text-red-600';
    if (score <= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-4">
        <Brain className="w-6 h-6 text-indigo-600" />
        <h3 className="ml-2 text-lg font-semibold">Sentiment Analysis</h3>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getSentimentColor(data.score)}`}>
            {data.score}
          </div>
          <div className="text-sm text-gray-500 mt-1">Sentiment Score</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-semibold">{data.label}</div>
          <div className="text-sm text-gray-500 mt-1">Recommendation</div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">News Analysis</span>
          <div className="w-2/3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 rounded-full h-2"
              style={{ width: `${data.sources.news}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Social Media</span>
          <div className="w-2/3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 rounded-full h-2"
              style={{ width: `${data.sources.social}%` }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Forums</span>
          <div className="w-2/3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 rounded-full h-2"
              style={{ width: `${data.sources.forums}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentCard;