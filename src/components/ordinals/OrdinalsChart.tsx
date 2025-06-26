'use client';

import React, { useEffect, useRef } from 'react';

interface OrdinalsChartProps {
  collection?: string | null;
}

export const OrdinalsChart: React.FC<OrdinalsChartProps> = ({ collection }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Mock chart data
  const generateChartData = () => {
    const data = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const timestamp = now - (i * 24 * 60 * 60 * 1000);
      const basePrice = 0.005 + Math.random() * 0.01;
      const volume = Math.random() * 100;
      
      data.push({
        time: new Date(timestamp).toISOString().split('T')[0],
        price: basePrice,
        volume: volume,
        sales: Math.floor(Math.random() * 50)
      });
    }
    return data;
  };

  const chartData = generateChartData();
  const latestPrice = chartData[chartData.length - 1]?.price || 0;
  const priceChange = chartData.length > 1 
    ? ((latestPrice - chartData[chartData.length - 2].price) / chartData[chartData.length - 2].price * 100)
    : 0;

  useEffect(() => {
    // In a real implementation, you would use a charting library like Chart.js, D3, or TradingView
    // For now, we'll create a simple SVG chart
    if (!chartRef.current) return;

    const container = chartRef.current;
    container.innerHTML = '';

    // Create SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '200');
    svg.setAttribute('viewBox', '0 0 400 200');
    svg.style.background = '#000000';

    // Generate path for price line
    const maxPrice = Math.max(...chartData.map(d => d.price));
    const minPrice = Math.min(...chartData.map(d => d.price));
    const priceRange = maxPrice - minPrice || 0.001;

    let pathData = '';
    chartData.forEach((point, index) => {
      const x = (index / (chartData.length - 1)) * 380 + 10;
      const y = 180 - ((point.price - minPrice) / priceRange) * 160;
      
      if (index === 0) {
        pathData += `M ${x} ${y}`;
      } else {
        pathData += ` L ${x} ${y}`;
      }
    });

    // Create price line
    const priceLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    priceLine.setAttribute('d', pathData);
    priceLine.setAttribute('stroke', '#F7931A');
    priceLine.setAttribute('stroke-width', '2');
    priceLine.setAttribute('fill', 'none');
    svg.appendChild(priceLine);

    // Create gradient area under line
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const linearGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    linearGradient.setAttribute('id', 'priceGradient');
    linearGradient.setAttribute('x1', '0%');
    linearGradient.setAttribute('y1', '0%');
    linearGradient.setAttribute('x2', '0%');
    linearGradient.setAttribute('y2', '100%');

    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#F7931A');
    stop1.setAttribute('stop-opacity', '0.3');

    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#F7931A');
    stop2.setAttribute('stop-opacity', '0.05');

    linearGradient.appendChild(stop1);
    linearGradient.appendChild(stop2);
    gradient.appendChild(linearGradient);
    svg.appendChild(gradient);

    // Create area path
    const areaPath = pathData + ` L ${380 + 10} 180 L 10 180 Z`;
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('d', areaPath);
    area.setAttribute('fill', 'url(#priceGradient)');
    svg.insertBefore(area, priceLine);

    // Add grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (i / 4) * 180 + 10;
      const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gridLine.setAttribute('x1', '10');
      gridLine.setAttribute('y1', y.toString());
      gridLine.setAttribute('x2', '390');
      gridLine.setAttribute('y2', y.toString());
      gridLine.setAttribute('stroke', '#F7931A');
      gridLine.setAttribute('stroke-opacity', '0.1');
      gridLine.setAttribute('stroke-width', '1');
      svg.insertBefore(gridLine, area);
    }

    container.appendChild(svg);
  }, [chartData, collection]);

  return (
    <div className="h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-terminal text-bloomberg-orange">
            {collection || 'All Collections'} Floor Price
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-terminal text-bloomberg-orange">
              {latestPrice.toFixed(4)} BTC
            </span>
            <span className={`text-sm font-terminal ${priceChange >= 0 ? 'text-bloomberg-green' : 'text-bloomberg-red'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </span>
          </div>
        </div>
        
        <div className="text-right text-xs text-bloomberg-orange/60">
          <div>24h Volume: {chartData[chartData.length - 1]?.volume.toFixed(1)} BTC</div>
          <div>24h Sales: {chartData[chartData.length - 1]?.sales}</div>
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={chartRef} 
        className="w-full border border-bloomberg-orange/20 rounded bg-bloomberg-black"
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="text-center">
          <div className="text-xs text-bloomberg-orange/60">7D High</div>
          <div className="text-sm font-terminal text-bloomberg-orange">
            {Math.max(...chartData.slice(-7).map(d => d.price)).toFixed(4)} BTC
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-bloomberg-orange/60">7D Low</div>
          <div className="text-sm font-terminal text-bloomberg-orange">
            {Math.min(...chartData.slice(-7).map(d => d.price)).toFixed(4)} BTC
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-xs text-bloomberg-orange/60">Avg Price</div>
          <div className="text-sm font-terminal text-bloomberg-orange">
            {(chartData.slice(-7).reduce((sum, d) => sum + d.price, 0) / 7).toFixed(4)} BTC
          </div>
        </div>
      </div>
    </div>
  );
};