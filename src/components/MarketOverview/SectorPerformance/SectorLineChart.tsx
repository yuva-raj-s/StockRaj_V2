import React, { useState, useRef } from 'react';

interface DataPoint {
  time: string;
  values: Record<string, number>;
}

const historicalData: DataPoint[] = [
  {
    time: '9:15',
    values: { IT: 0, Banking: 0, Energy: 0, FMCG: 0, Auto: 0, Pharma: 0 }
  },
  {
    time: '11:00',
    values: { IT: 1.2, Banking: -0.5, Energy: 1.8, FMCG: 0.3, Auto: -0.2, Pharma: 0.8 }
  },
  {
    time: '13:00',
    values: { IT: 1.8, Banking: -0.8, Energy: 2.5, FMCG: 0.5, Auto: -0.4, Pharma: 1.2 }
  },
  {
    time: '15:30',
    values: { IT: 2.5, Banking: -1.2, Energy: 3.1, FMCG: 0.8, Auto: -0.5, Pharma: 1.7 }
  }
];

const colors = {
  IT: '#60A5FA', // blue
  Banking: '#F87171', // red
  Energy: '#34D399', // green
  FMCG: '#FBBF24', // yellow
  Auto: '#A78BFA', // purple
  Pharma: '#F472B6' // pink
};

interface TooltipData {
  visible: boolean;
  x: number;
  y: number;
  sector: string;
  time: string;
  value: number;
}

export const SectorLineChart: React.FC = () => {
  const width = 1200;
  const height = 500;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const chartRef = useRef<SVGSVGElement>(null);
  
  // State for interactive features
  const [visibleSectors, setVisibleSectors] = useState<Record<string, boolean>>(() => {
    const sectors = Object.keys(historicalData[0].values);
    return sectors.reduce((acc, sector) => ({...acc, [sector]: true}), {});
  });
  const [activeTimeIndex, setActiveTimeIndex] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    x: 0,
    y: 0,
    sector: '',
    time: '',
    value: 0
  });

  const sectors = Object.keys(historicalData[0].values);
  const timePoints = historicalData.map(d => d.time);
  
  // Calculate min and max values for y-axis
  const allValues = historicalData.flatMap(d => Object.values(d.values));
  const minValue = Math.min(-2.0, Math.floor(Math.min(...allValues)));
  const maxValue = Math.max(4.0, Math.ceil(Math.max(...allValues)));

  // Scale functions
  const xScale = (index: number) => 
    padding.left + (index * (width - padding.left - padding.right) / (timePoints.length - 1));
  
  const yScale = (value: number) =>
    height - padding.bottom - ((value - minValue) * (height - padding.top - padding.bottom) / (maxValue - minValue));

  // Generate path for each sector
  const generatePath = (sector: string) => {
    return historicalData.map((point, index) => {
      const x = xScale(index);
      const y = yScale(point.values[sector]);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  
  // Toggle sector visibility
  const toggleSector = (sector: string) => {
    setVisibleSectors(prev => ({
      ...prev,
      [sector]: !prev[sector]
    }));
  };
  
  // Handle mouse over for data points
  const handleDataPointHover = (sector: string, timeIndex: number, event: React.MouseEvent) => {
    if (!chartRef.current) return;
    
    const point = historicalData[timeIndex];
    const value = point.values[sector];
    
    // Get mouse position relative to SVG
    const svgRect = chartRef.current.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    
    setTooltip({
      visible: true,
      x: mouseX,
      y: mouseY,
      sector,
      time: point.time,
      value
    });
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    setTooltip(prev => ({...prev, visible: false}));
    setActiveTimeIndex(null);
  };
  
  // Handle timepoint selection
  const handleTimepointSelect = (index: number) => {
    setActiveTimeIndex(index === activeTimeIndex ? null : index);
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-white mb-6">Sector Trends</h2>
      
      {/* Interactive Legend */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        {sectors.map(sector => (
          <button
            key={sector}
            onClick={() => toggleSector(sector)}
            className={`flex items-center rounded-full px-4 py-2 transition-all duration-200 cursor-pointer ${
              visibleSectors[sector] 
                ? `bg-${colors[sector as keyof typeof colors].substring(1)}/20 border border-${colors[sector as keyof typeof colors].substring(1)}/30` 
                : 'bg-primary-light/30 text-gray-500'
            }`}
          >
            <div 
              className={`w-4 h-4 rounded-full mr-2 transition-all duration-200 ${
                visibleSectors[sector] ? 'scale-100' : 'scale-75 opacity-50'
              }`}
              style={{ backgroundColor: colors[sector as keyof typeof colors] }}
            />
            <span className={`text-sm ${visibleSectors[sector] ? 'text-gray-200' : 'text-gray-500'}`}>
              {sector}
            </span>
          </button>
        ))}
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Sector Performance Trends</h3>
        <div className="text-xs text-gray-400">
          Today's movement (%)
        </div>
      </div>
      
      <div 
        className="relative w-full rounded-xl overflow-hidden bg-primary-light/30 backdrop-blur-sm border border-white/5 shadow-lg" 
        style={{ height: `${height}px` }}
        onMouseLeave={handleMouseLeave}
      >
        <svg 
          ref={chartRef}
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Y-axis label */}
          <text 
            x={padding.left - 40} 
            y={height / 2} 
            transform={`rotate(-90, ${padding.left - 40}, ${height / 2})`} 
            textAnchor="middle" 
            className="fill-gray-400 text-xs"
          >
            Percentage Change (%)
          </text>
          
          {/* Grid lines */}
          {Array.from({ length: 7 }).map((_, i) => {
            const value = maxValue - (i * (maxValue - minValue) / 6);
            const y = yScale(value);
            return (
              <g key={i}>
                <line
                  x1={padding.left - 5}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1"
                  strokeDasharray={value === 0 ? "0" : "4"}
                />
                <text
                  x={padding.left - 10}
                  y={y}
                  textAnchor="end"
                  alignmentBaseline="middle"
                  className="text-xs fill-gray-400"
                >
                  {value.toFixed(1)}%
                </text>
              </g>
            );
          })}

          {/* Zero line highlighted */}
          <line
            x1={padding.left}
            y1={yScale(0)}
            x2={width - padding.right}
            y2={yScale(0)}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1.5"
          />

          {/* Time points and interactive vertical markers */}
          {timePoints.map((time, i) => (
            <g key={`timepoint-${i}`}>
              {/* Vertical grid lines */}
              <line
                x1={xScale(i)}
                y1={padding.top}
                x2={xScale(i)}
                y2={height - padding.bottom + 5}
                stroke={activeTimeIndex === i ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}
                strokeWidth={activeTimeIndex === i ? "2" : "1"}
                strokeDasharray="4"
              />
              
              {/* Interactive clickable areas for time selection */}
              <rect
                x={xScale(i) - 20}
                y={height - padding.bottom / 2 - 15}
                width="40"
                height="30"
                fill="transparent"
                className="cursor-pointer"
                onClick={() => handleTimepointSelect(i)}
              />
              
              {/* Time labels */}
              <text
                x={xScale(i)}
                y={height - padding.bottom / 2}
                textAnchor="middle"
                className={`text-xs font-medium ${
                  activeTimeIndex === i ? 'fill-accent-primary' : 'fill-gray-400'
                }`}
              >
                {time}
              </text>
              
              {/* Active time indicator */}
              {activeTimeIndex === i && (
                <circle
                  cx={xScale(i)}
                  cy={height - padding.bottom / 2 - 15}
                  r="3"
                  fill="#00F5D4"
                  className="animate-pulse"
                />
              )}
            </g>
          ))}

          {/* X-axis label */}
          <text 
            x={width / 2} 
            y={height - 15} 
            textAnchor="middle" 
            className="fill-gray-400 text-xs"
          >
            Time
          </text>
          
          {/* Only render visible sectors */}
          {sectors.filter(sector => visibleSectors[sector]).map((sector, index) => {
            const color = colors[sector as keyof typeof colors];
            const gradientId = `area-gradient-${index}`;
            const linGradientId = `line-gradient-${index}`;
            const path = generatePath(sector);
            // Create area path by extending the line to bottom
            const areaPath = `${path} L ${xScale(timePoints.length - 1)} ${yScale(0)} L ${xScale(0)} ${yScale(0)} Z`;
            
            return (
              <g key={sector}>
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                  </linearGradient>
                  <linearGradient id={linGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={color} stopOpacity="1" />
                  </linearGradient>
                  {/* Add glow effect */}
                  <filter id={`glow-${index}`} x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>
                
                {/* Only fill area for positive values */}
                {historicalData[historicalData.length - 1].values[sector] >= 0 && (
                  <path
                    d={areaPath}
                    fill={`url(#${gradientId})`}
                    className="opacity-30 hover:opacity-60 transition-opacity duration-300"
                  />
                )}
                
                {/* Line */}
                <path
                  d={path}
                  fill="none"
                  stroke={`url(#${linGradientId})`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-draw-line"
                  style={{
                    filter: activeTimeIndex !== null ? `url(#glow-${index})` : 'none',
                  }}
                />
                
                {/* Data points with interaction */}
                {historicalData.map((point, i) => (
                  <g key={`interactive-point-${sector}-${i}`}>
                    <circle
                      cx={xScale(i)}
                      cy={yScale(point.values[sector])}
                      r={activeTimeIndex === i ? 6 : 4}
                      fill={color}
                      className={`transition-all duration-300 ${
                        i === timePoints.length - 1 
                          ? "animate-pulse-slow" 
                          : activeTimeIndex === i 
                            ? "opacity-100" 
                            : "opacity-70"
                      }`}
                      onMouseOver={(e) => handleDataPointHover(sector, i, e)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* Larger transparent circle for easier hover */}
                    <circle
                      cx={xScale(i)}
                      cy={yScale(point.values[sector])}
                      r="12"
                      fill="transparent"
                      onMouseOver={(e) => handleDataPointHover(sector, i, e)}
                      style={{ cursor: 'pointer' }}
                    />
                    
                    {/* Value indicators for selected time */}
                    {activeTimeIndex === i && (
                      <text
                        x={xScale(i)}
                        y={yScale(point.values[sector]) - 12}
                        textAnchor="middle"
                        className="fill-white text-xs font-bold"
                        style={{ fill: color }}
                      >
                        {point.values[sector].toFixed(1)}%
                      </text>
                    )}
                  </g>
                ))}
                
                {/* Label at the end of line (only if not filtered and no active time point) */}
                {activeTimeIndex === null && (
                  <text
                    x={xScale(timePoints.length - 1) + 10}
                    y={yScale(historicalData[timePoints.length - 1].values[sector])}
                    textAnchor="start"
                    alignmentBaseline="middle"
                    className="fill-white text-xs font-bold"
                    style={{ fill: color }}
                  >
                    {sector}: {historicalData[timePoints.length - 1].values[sector].toFixed(1)}%
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Active time vertical indicator */}
          {activeTimeIndex !== null && (
            <line
              x1={xScale(activeTimeIndex)}
              y1={padding.top}
              x2={xScale(activeTimeIndex)}
              y2={height - padding.bottom}
              stroke="rgba(0, 245, 212, 0.4)"
              strokeWidth="2"
              strokeDasharray="4"
            />
          )}
        </svg>
        
        {/* Tooltip */}
        {tooltip.visible && (
          <div 
            className="absolute pointer-events-none bg-primary-dark/90 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-lg z-10 text-white transform -translate-x-1/2 -translate-y-full"
            style={{ 
              left: tooltip.x, 
              top: tooltip.y - 10,
              boxShadow: `0 0 15px rgba(0, 245, 212, 0.2)` 
            }}
          >
            <div className="font-bold text-sm flex items-center mb-1">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[tooltip.sector as keyof typeof colors] }}
              />
              {tooltip.sector}
            </div>
            <div className="flex justify-between gap-4 text-xs">
              <span className="text-gray-400">Time: <span className="text-white">{tooltip.time}</span></span>
              <span className={tooltip.value >= 0 ? 'text-success' : 'text-danger'}>
                {tooltip.value.toFixed(2)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Bottom gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/30 pointer-events-none"></div>
        
        {/* Interactive information */}
        {activeTimeIndex !== null && (
          <div className="absolute top-4 right-4 bg-primary-dark/90 backdrop-blur-sm p-3 rounded-lg border border-white/10 shadow-lg">
            <div className="text-sm font-bold text-white mb-1">
              {timePoints[activeTimeIndex]}
            </div>
            <div className="text-xs text-gray-400">
              Click on another time point or chart area to compare
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
        <div>
          <span className="text-success">Top performer: </span>
          <span>Energy +3.1%</span>
        </div>
        <div className="text-xs text-gray-400">
          <span>Click on sectors to toggle visibility • Hover for details</span>
        </div>
        <div>
          <span>Updated: Today, 15:30</span>
        </div>
      </div>
    </div>
  );
};