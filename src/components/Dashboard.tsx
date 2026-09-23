import React, { useState, useEffect } from 'react';
import {
  Activity,
  Layers,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Clock,
  CheckCircle2,
  Calendar,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { BloodInventoryItem, BloodRequest, ShortageAlert, AIInsight } from '../types';
import { api } from '../lib/api';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onRequestBlood: (bloodGroup?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onRequestBlood }) => {
  const [overview, setOverview] = useState<{
    totalUnits: number;
    availableUnits: number;
    reservedUnits: number;
    criticalGroups: string[];
    todayActualDemand: number;
    predictedDemandToday: number;
    pendingRequestsCount: number;
    activeAlertsCount: number;
    activeModel: string;
    modelAccuracy: number;
    lastTrained: string;
  } | null>(null);

  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [alerts, setAlerts] = useState<ShortageAlert[]>([]);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [forecastTimeline, setForecastTimeline] = useState<Array<{
    date: string;
    actualDemand: number;
    predictedDemand: number;
    emergencyRequests: number;
    donations: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ov, inv, reqs, alts, ins, tm] = await Promise.all([
        api.getOverview(),
        api.getInventory(),
        api.getRequests(),
        api.getAlerts(),
        api.getInsights(),
        api.getDemandTimeline(),
      ]);

      setOverview(ov);
      setInventory(inv);
      setRequests(reqs);
      setAlerts(alts);
      setInsights(ins);
      setForecastTimeline(tm.timeline || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#06b6d4', '#10b981', '#8b5cf6', '#ec4899', '#64748b'];

  const inventoryChartData = inventory.map(item => ({
    group: item.bloodGroup,
    Available: item.availableUnits,
    Reserved: item.reservedUnits,
    SafetyThreshold: item.safetyThreshold,
  }));

  const pieData = inventory.map(item => ({
    name: item.bloodGroup,
    value: item.availableUnits,
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-700/50">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>AI Blood Intelligence Engine • Active Model: {overview?.activeModel || 'Random Forest Regressor'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI Blood Demand & Availability Prediction System
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Predict future hospital demand, track real-time inventory across regional cold-chain vaults, identify shortage risks early, and prevent critical transfusion deficits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('predictions')}
              className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-md transition-all active:scale-95"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Generate Forecast</span>
            </button>
            <button
              onClick={() => onRequestBlood()}
              className="flex items-center space-x-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-medium transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Emergency Request</span>
            </button>
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Stock */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Stored Units</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-slate-900">{overview?.totalUnits || 0}</div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              4°C Regulated
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Across 2 regional blood banks & cold storage vaults
          </p>
        </div>

        {/* Available Units */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Immediately Available</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-emerald-700">{overview?.availableUnits || 0}</div>
            <span className="text-xs text-slate-500 font-medium">
              {overview?.reservedUnits || 0} reserved
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Unallocated units verified for immediate clinical dispatch
          </p>
        </div>

        {/* Predicted 24h Demand */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">24h AI Predicted Demand</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-purple-900">{overview?.predictedDemandToday || 0}</div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              {overview?.modelAccuracy || 92}% Accuracy
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Ensemble prediction from {overview?.activeModel?.split(' ')[0] || 'Random Forest'} model
          </p>
        </div>

        {/* Critical Blood Groups */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Shortage Groups</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-rose-600">
              {overview?.criticalGroups && overview.criticalGroups.length > 0 ? (
                overview.criticalGroups.join(', ')
              ) : (
                <span className="text-emerald-600 text-lg">None (All Stable)</span>
              )}
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-rose-700 hover:text-rose-800 flex items-center"
            >
              <span>View alerts</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Stock coverage &lt; 1.5 days or below critical safety threshold
          </p>
        </div>
      </div>

      {/* AI Insights & Clinical Recommendations Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Clinical Insights & Decision Support</h2>
              <p className="text-xs text-slate-500">Real-time situational intelligence generated by predictive models</p>
            </div>
          </div>
          <span className="text-xs text-slate-400">Updated: Just now</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.slice(0, 4).map((ins) => {
            const isSevere = ins.type === 'SURGE_ALERT' || ins.type === 'WARNING';
            return (
              <div
                key={ins.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSevere
                    ? 'bg-rose-50/50 border-rose-200/80 text-rose-950'
                    : 'bg-slate-50 border-slate-200/80 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    isSevere ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-800'
                  }`}>
                    {ins.title}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Confidence: {(ins.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed mb-2.5">{ins.summary}</p>
                <div className="text-xs font-medium text-slate-900 flex items-start space-x-1.5 bg-white/70 p-2 rounded-lg border border-slate-200/60">
                  <span className="text-rose-600 font-bold shrink-0">Action:</span>
                  <span className="text-slate-700">{ins.recommendedAction}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Demand Forecast vs Actual Timeline (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital Demand: Actual vs AI Predicted</h2>
              <p className="text-xs text-slate-500">Historical demand timeline and model forecast validation</p>
            </div>
            <button
              onClick={() => onNavigate('predictions')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center"
            >
              <span>Detailed Forecaster</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastTimeline.slice(-14)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="actualDemand"
                  name="Actual Hospital Demand"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="predictedDemand"
                  name="AI Model Prediction"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="donations"
                  name="Donation Inflow"
                  stroke="#10b981"
                  strokeWidth={1.5}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Group Distribution Pie Chart (1 Col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Current Stock by Blood Group</h2>
            <p className="text-xs text-slate-500">Inventory proportion across all 8 ABO-Rh types</p>
          </div>

          <div className="h-56 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val ?? 0} Units`, 'Available']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-1 text-[11px] text-slate-600 text-center font-medium">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center space-x-1 justify-center">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory Bar Chart (Available vs Safety Threshold) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Available Stock vs Configured Safety Thresholds</h2>
            <p className="text-xs text-slate-500">Groups dipping below their safety line trigger automated replenishment warnings</p>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center"
          >
            <span>Full Inventory Management</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={inventoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="group" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="Available" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Reserved" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="SafetyThreshold" name="Safety Threshold" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Requisitions & Urgent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Blood Requisitions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hospital Blood Requisitions</h2>
              <p className="text-xs text-slate-500">Live requests from surgical and emergency wards</p>
            </div>
            <button
              onClick={() => onNavigate('requests')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              View all ({requests.length})
            </button>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 4).map((r) => {
              const isUrgent = r.urgency === 'CRITICAL_EMERGENCY' || r.urgency === 'URGENT';
              return (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 font-extrabold flex items-center justify-center text-sm border border-rose-200">
                      {r.bloodGroup}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-900">{r.hospitalName}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          r.urgency === 'CRITICAL_EMERGENCY'
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : r.urgency === 'URGENT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {r.urgency.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {r.unitsRequired} Units • {r.department} • {r.patientCategory}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : r.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {r.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shortage Risk Monitor */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Shortage Alerts</h2>
              <p className="text-xs text-slate-500">System generated warnings based on daily burn rate</p>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              All Alerts ({alerts.length})
            </button>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 3).map((a) => (
              <div
                key={a.id}
                className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white font-extrabold text-xs">
                      {a.bloodGroup}
                    </span>
                    <span className="text-xs font-bold text-red-900">
                      {a.severity} SHORTAGE RISK ({a.shortageProbability}% Probability)
                    </span>
                  </div>
                  <span className="text-[11px] text-red-700 font-mono font-bold">
                    {a.stockCoverageDays} Days Coverage
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-snug">{a.reason}</p>
                <div className="text-[11px] text-red-800 font-medium">
                  <strong>Recommended:</strong> {a.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
