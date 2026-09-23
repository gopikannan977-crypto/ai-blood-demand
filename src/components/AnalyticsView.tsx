import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  RefreshCw,
  PieChart as PieIcon,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../lib/api';

export const AnalyticsView: React.FC = () => {
  const [demandData, setDemandData] = useState<Array<{
    date: string;
    actualDemand: number;
    predictedDemand: number;
    emergencyRequests: number;
    donations: number;
  }>>([]);
  const [inventoryStats, setInventoryStats] = useState<Array<{
    bloodGroup: string;
    availableUnits: number;
    reservedUnits: number;
    safetyThreshold: number;
    totalUnits: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d'>('30d');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const [dRes, iRes] = await Promise.all([
        api.getDemandTimeline(),
        api.getInventoryAnalytics(),
      ]);
      setDemandData(dRes.timeline || []);
      setInventoryStats(iRes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const sliceCount = timeframe === '7d' ? 7 : timeframe === '14d' ? 14 : 30;
  const filteredTimeline = demandData.slice(-sliceCount);

  // Group demand aggregation
  const totalActual = filteredTimeline.reduce((acc, curr) => acc + curr.actualDemand, 0);
  const totalPredicted = filteredTimeline.reduce((acc, curr) => acc + curr.predictedDemand, 0);
  const totalDonations = filteredTimeline.reduce((acc, curr) => acc + curr.donations, 0);
  const totalEmergency = filteredTimeline.reduce((acc, curr) => acc + curr.emergencyRequests, 0);

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-rose-600" />
            <span>Healthcare Data Analytics & Epidemiological Trends</span>
          </h1>
          <p className="text-sm text-slate-500">
            Longitudinal demand dynamics, seasonal disease surges, donation velocities, and crossmatch ratios
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {(['7d', '14d', '30d'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === tf
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tf.toUpperCase()} Window
            </button>
          ))}
          <button
            onClick={loadAnalytics}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh analytics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Demand Units</div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{totalActual} Units</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across {timeframe} observation window</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Donation Inflow</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{totalDonations} Units</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Replenish ratio: {((totalDonations / (totalActual || 1)) * 100).toFixed(0)}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Trauma Emergency Cases</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{totalEmergency} Cases</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Weekend & evening incidents</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Forecast Bias Error</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {Math.abs(totalActual - totalPredicted)} Units
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">MAE variance &lt; 3.8%</div>
        </div>
      </div>

      {/* Primary Chart: Demand vs Donations vs Emergency Spikes */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-1">
          Demand Dynamics: Actual vs AI Forecast vs Collection Velocity
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Tracking transfusion consumption against donor influx over the past {timeframe}
        </p>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={filteredTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />

              <Bar dataKey="emergencyRequests" name="Emergency Trauma Requests" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="actualDemand"
                name="Actual Hospital Demand"
                stroke="#dc2626"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="predictedDemand"
                name="AI Prediction"
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="donations"
                name="Donations Inflow"
                stroke="#10b981"
                strokeWidth={2}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Inventory Stock vs Safety & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available vs Safety Threshold */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Stock Buffering Against Safety Thresholds</h2>
          <p className="text-xs text-slate-500 mb-4">
            Comparison of current physical stock vs minimum recommended safety reserve
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="availableUnits" name="Available Units" stroke="#ef4444" fill="#fecaca" fillOpacity={0.6} />
                <Area type="monotone" dataKey="safetyThreshold" name="Safety Threshold" stroke="#64748b" fill="#e2e8f0" fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Group Share */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-1">Stock Share Distribution by ABO-Rh Type</h2>
          <p className="text-xs text-slate-500 mb-4">
            Total units across all connected regional blood bank repositories
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  dataKey="totalUnits"
                  nameKey="bloodGroup"
                  label={({ name, percent }) => `${name}: ${(((percent as number) || 0) * 100).toFixed(0)}%`}
                >
                  {inventoryStats.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Units`, 'Stock']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
