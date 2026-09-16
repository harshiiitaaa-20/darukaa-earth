import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity, TreeDeciduous, Database, ShieldCheck } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TimeSeriesChart({ metrics = [], timeframe, onTimeframeChange }) {
  const [activeMetric, setActiveMetric] = useState('carbon'); // 'carbon' | 'ndvi' | 'canopy' | 'biodiversity'

  if (!metrics || metrics.length === 0) {
    return (
      <div className="glass-card p-8 text-center text-slate-400">
        <Activity className="w-8 h-8 mx-auto mb-2 text-slate-600 animate-pulse" />
        <p className="text-sm font-semibold">No telemetry data recorded for this site yet.</p>
      </div>
    );
  }

  const dates = metrics.map((m) => m.recorded_at);

  const metricConfigs = {
    carbon: {
      label: 'Carbon Sequestered (tCO2e / ha)',
      data: metrics.map((m) => m.carbon_sequestered_tco2),
      borderColor: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      unit: 'tCO2e/ha',
    },
    ndvi: {
      label: 'NDVI Vegetation Health Index',
      data: metrics.map((m) => m.ndvi),
      borderColor: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.15)',
      unit: 'Index (0-1)',
    },
    canopy: {
      label: 'Tree Canopy Cover (%)',
      data: metrics.map((m) => m.canopy_cover_pct),
      borderColor: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      unit: '%',
    },
    biodiversity: {
      label: 'Biodiversity & Species Index',
      data: metrics.map((m) => m.biodiversity_index),
      borderColor: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.15)',
      unit: 'Score (1-10)',
    },
  };

  const selectedConfig = metricConfigs[activeMetric];

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: selectedConfig.label,
        data: selectedConfig.data,
        borderColor: selectedConfig.borderColor,
        backgroundColor: selectedConfig.bgColor,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0f172a',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        titleColor: '#f8fafc',
        bodyColor: selectedConfig.borderColor,
        titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${context.parsed.y} ${selectedConfig.unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, maxTicksLimit: 10 },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } },
      },
    },
  };

  return (
    <div className="glass-card p-6 space-y-5">
      {/* Header & Metric Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
            Multi-Year Telemetry
          </span>
          <h3 className="font-display font-bold text-lg text-white">
            Environmental Performance Over Time
          </h3>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {['1Y', '3Y', '5Y', 'ALL'].map((tf) => (
            <button
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                timeframe === tf
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Indicator Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveMetric('carbon')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            activeMetric === 'carbon'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <TreeDeciduous className="w-3.5 h-3.5 text-emerald-400" />
          <span>Carbon Sequestered</span>
        </button>

        <button
          onClick={() => setActiveMetric('ndvi')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            activeMetric === 'ndvi'
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>NDVI Vegetation</span>
        </button>

        <button
          onClick={() => setActiveMetric('canopy')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            activeMetric === 'canopy'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-amber-400" />
          <span>Canopy Cover %</span>
        </button>

        <button
          onClick={() => setActiveMetric('biodiversity')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
            activeMetric === 'biodiversity'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
              : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Biodiversity Index</span>
        </button>
      </div>

      {/* Chart Canvas */}
      <div className="h-[320px] w-full pt-2">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
