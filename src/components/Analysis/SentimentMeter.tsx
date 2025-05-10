import React from 'react';

interface SentimentMeterProps {
  score: number; // 0-100
}

export const SentimentMeter: React.FC<SentimentMeterProps> = ({ score }) => {
  const safeScore = Math.max(0, Math.min(100, score));
  // Map 0-100 to 0-180 degrees, then to radians (start from 180deg = left)
  const angle = (safeScore / 100) * Math.PI; // 0 = left, PI = right
  const radius = 120; // length of the needle, less than half the gauge width for safety

  // Calculate needle endpoint
  const x = 150 + radius * Math.cos(Math.PI - angle); // 150 is center x
  const y = 150 + radius * Math.sin(Math.PI - angle); // 150 is center y

  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <svg width={300} height={150} style={{ display: 'block' }}>
        {/* Gauge background */}
        <path
          d="M 30 150 A 120 120 0 0 1 270 150"
          fill="none"
          stroke="#374151"
          strokeWidth={30}
        />
        {/* Colored arc */}
        <path
          d="M 30 150 A 120 120 0 0 1 270 150"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={30}
          opacity={0.3}
        />
        <defs>
          <linearGradient id="gaugeGradient">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {/* Needle */}
        <line
          x1={150}
          y1={150}
          x2={x}
          y2={y}
          stroke="white"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Center circle */}
        <circle cx={150} cy={150} r={12} fill="white" />
      </svg>
      <div className="text-center mt-4">
        <div className="text-3xl font-bold text-white">{safeScore}</div>
        <div className="text-sm text-gray-400">Sentiment Score</div>
      </div>
    </div>
  );
};