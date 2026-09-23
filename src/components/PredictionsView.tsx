import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  BrainCircuit,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  Zap,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { BloodGroup, PredictionResult, ShortageSeverity } from '../types';
import { api } from '../lib/api';

export const PredictionsView: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<BloodGroup>('O-');
  const [horizon, setHorizon] = useState<number>(7);
  const [hospital, setHospital] = useState<string>('Metro Central Trauma Center');

  // Interactive Scenario Simulator Parameters
  const [emergencyFactor, setEmergencyFactor] = useState<number>(4);
  const [customStock, setCustomStock] = useState<number>(18);
  const [simulatedPred, setSimulatedPred] = useState<PredictionResult | null>(null);

  // Sequence Forecast Data
  const [forecastSequence, setForecastSequence] = useState<Array<PredictionResult & { dayIndex: number; date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeModel, setActiveModel] = useState<string>('Random Forest Regressor');

  const loadForecast = async () => {
    setLoading(true);
    try {
      const data = await api.getBloodGroupForecast(selectedGroup, horizon);
      setForecastSequence(data.forecast || []);
      setActiveModel(data.activeModel || 'Random Forest Regressor');

      // Also get initial single-day prediction
      const single = await api.generateCustomPrediction({
        bloodGroup: selectedGroup,
        emergencyFactor,
        daysAhead: 1,
        availableUnits: customStock,
      });
      setSimulatedPred(single);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, [selectedGroup, horizon]);

  const handleRunSimulation = async () => {
    try {
      const single = await api.generateCustomPrediction({
        bloodGroup: selectedGroup,
        emergencyFactor,
        daysAhead: 1,
        availableUnits: customStock,
      });
      setSimulatedPred(single);
    } catch (err) {
      console.error(err);
    }
  };

  const getRiskColor = (severity?: ShortageSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return { text: 'text-red-700', bg: 'bg-red-50 border-red-200' };
      case 'WARNING':
        return { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' };
      case 'LOW':
        return { text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' };
      default:
        return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' };
    }
  };

  const riskBadge = getRiskColor(simulatedPred?.riskLevel);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-2xl border border-slate-700/60 shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Multi-Horizon ML Time-Series Engine ({activeModel})</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              AI Demand Forecasting & Shortage Probability
            </h1>
            <p className="text-slate-300 text-sm">
              Machine learning models forecast multi-day unit burn rates, compute 95% confidence intervals, and quantify shortage risk based on clinical trauma surge and elective surgery schedules.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadForecast}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Refresh Forecast"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Select Blood Group, Hospital, Horizon */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Blood Group Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Target Blood Group
          </label>
          <div className="flex flex-wrap gap-1.5">
            {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map((bg) => (
              <button
                key={bg}
                onClick={() => setSelectedGroup(bg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                  selectedGroup === bg
                    ? 'bg-rose-600 text-white shadow-xs scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Forecast Horizon Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Forecast Horizon
          </label>
          <div className="flex items-center space-x-1.5">
            {[
              { days: 1, label: 'Tomorrow (24h)' },
              { days: 7, label: '7-Day Sequence' },
              { days: 30, label: '30-Day Trend' },
            ].map((h) => (
              <button
                key={h.days}
                onClick={() => setHorizon(h.days)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  horizon === h.days
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hospital Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Hospital Entity
          </label>
          <select
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="Metro Central Trauma Center">Metro Central Trauma Center</option>
            <option value="St. Jude Memorial Hospital">St. Jude Memorial Hospital</option>
            <option value="Apollo Regional Medical Center">Apollo Regional Medical Center</option>
            <option value="City Women & Children Hospital">City Women & Children Hospital</option>
          </select>
        </div>
      </div>

      {/* Main Forecast Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-rose-600" />
              <span>
                {selectedGroup} Projected Daily Demand & Estimated Stock Depletion ({horizon}-Day Forecast)
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Shaded interval represents 95% Confidence Bounds (±1.96 × Model RMSE)
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            Active: {activeModel}
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastSequence} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />

              {/* Confidence Interval Band */}
              <Area
                type="monotone"
                dataKey="confidenceUpper"
                name="95% Upper Bound"
                stroke="none"
                fill="#fca5a5"
                fillOpacity={0.25}
              />
              <Area
                type="monotone"
                dataKey="confidenceLower"
                name="95% Lower Bound"
                stroke="none"
                fill="#fca5a5"
                fillOpacity={0.25}
              />

              {/* Main Predicted Demand Line */}
              <Line
                type="monotone"
                dataKey="predictedDemand"
                name="Projected Daily Demand (Units)"
                stroke="#dc2626"
                strokeWidth={3}
                dot={{ r: 4, fill: '#dc2626' }}
              />

              {/* Estimated Remaining Availability */}
              <Line
                type="monotone"
                dataKey="estimatedAvailability"
                name="Projected Available Reserve"
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="5 5"
              />

              <ReferenceLine y={25} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Safety Line', fill: '#ea580c', fontSize: 11 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Explainable AI & What-If Scenario Stress Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Explainable AI: Feature Attribution (SHAP-inspired) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Explainable AI: Demand Feature Attribution</h2>
              <p className="text-xs text-slate-500">Why did the model predict this demand volume?</p>
            </div>
          </div>

          <div className="space-y-3">
            {simulatedPred?.contributingFeatures.map((feat, idx) => {
              const isPositive = feat.impact >= 0;
              return (
                <div key={idx} className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">{feat.feature}</span>
                    <span
                      className={`text-xs font-mono font-extrabold px-2 py-0.5 rounded ${
                        isPositive ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isPositive ? `+${feat.impact}` : feat.impact} Units
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{feat.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs text-blue-900 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              Additive feature contributions explain how moving averages, seasonal surge, and day-of-week elective surgery schedules adjust the baseline.
            </p>
          </div>
        </div>

        {/* What-If Scenario Stress Testing */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center space-x-2 mb-4">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">What-If Scenario Stress Tester</h2>
              <p className="text-xs text-slate-500">Simulate emergency trauma spikes & inventory depletion</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Slider 1: Anticipated Emergency Trauma Cases */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Emergency Trauma Incidents</span>
                <span className="text-rose-600 font-mono text-sm">{emergencyFactor} Cases</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={emergencyFactor}
                onChange={(e) => setEmergencyFactor(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>0 (Quiet)</span>
                <span>5 (Standard Weekend)</span>
                <span>10 (Mass Casualty)</span>
              </div>
            </div>

            {/* Slider 2: Available Initial Stock */}
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Current Vault Reserves</span>
                <span className="text-blue-600 font-mono text-sm">{customStock} Units</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={customStock}
                onChange={(e) => setCustomStock(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>5 Units (Depleted)</span>
                <span>60 Units (Nominal)</span>
                <span>120 Units (Optimal)</span>
              </div>
            </div>

            <button
              onClick={handleRunSimulation}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98 flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Recalculate Stress Scenario</span>
            </button>

            {/* Simulation Outcome Card */}
            {simulatedPred && (
              <div className={`p-4 rounded-xl border ${riskBadge.bg} space-y-2 mt-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Scenario Outcome
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${riskBadge.text} bg-white shadow-xs`}>
                    {simulatedPred.riskLevel} RISK
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Predicted Demand</div>
                    <div className="text-lg font-black text-rose-600">{simulatedPred.predictedDemand} u</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Shortage Prob</div>
                    <div className="text-lg font-black text-amber-600">{simulatedPred.shortageProbability}%</div>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200/80">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Rec. Buffer</div>
                    <div className="text-lg font-black text-blue-600">{simulatedPred.recommendedStock} u</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
