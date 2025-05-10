import React from 'react';
import { BarChart2 } from 'lucide-react';
import { Card } from '../ui/Card';

interface Pattern {
  name: string;
  status: string;
  confidence: number;
}

interface PatternRecognitionProps {
  patterns: Pattern[];
}

export const PatternRecognition: React.FC<PatternRecognitionProps> = ({ patterns }) => {
  return (
    <Card>
      <div className="flex items-center mb-4">
        <BarChart2 className="w-5 h-5 mr-2 text-accent-primary" />
        <h3 className="text-lg font-semibold text-white">Pattern Recognition</h3>
      </div>
      <div className="space-y-4">
        {patterns.map((pattern) => (
          <div key={pattern.name} className="glass p-3 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-white">{pattern.name}</span>
              <span className="text-green-400">{pattern.status}</span>
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
              <div
                className="h-1 rounded-full bg-accent-primary"
                style={{ width: `${pattern.confidence}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};