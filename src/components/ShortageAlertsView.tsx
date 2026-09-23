import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  BellRing,
  HelpCircle,
  TrendingDown,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { ShortageAlert, ShortageSeverity } from '../types';
import { api } from '../lib/api';

export const ShortageAlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<ShortageAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await api.getAlerts();
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      setFeedback('Alert marked as reviewed and logged in clinical audit trail.');
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'ALL') return true;
    return a.severity === severityFilter;
  });

  const getSeverityBadge = (s: ShortageSeverity) => {
    switch (s) {
      case 'CRITICAL':
        return {
          cardBg: 'bg-red-50/80 border-red-300 ring-1 ring-red-200',
          badgeBg: 'bg-red-600 text-white',
          icon: AlertOctagon,
          textColor: 'text-red-950',
        };
      case 'WARNING':
        return {
          cardBg: 'bg-amber-50/80 border-amber-300',
          badgeBg: 'bg-amber-600 text-white',
          icon: AlertTriangle,
          textColor: 'text-amber-950',
        };
      case 'LOW':
        return {
          cardBg: 'bg-blue-50/80 border-blue-200',
          badgeBg: 'bg-blue-600 text-white',
          icon: ShieldAlert,
          textColor: 'text-blue-950',
        };
      default:
        return {
          cardBg: 'bg-emerald-50/80 border-emerald-200',
          badgeBg: 'bg-emerald-600 text-white',
          icon: CheckCircle2,
          textColor: 'text-emerald-950',
        };
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Automated Blood Shortage Detection Engine</span>
          </h1>
          <p className="text-sm text-slate-500">
            Real-time shortage identification using the Stock Coverage Index and AI demand velocity
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadAlerts}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Interpretable Formula Educational Box */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400">
              <HelpCircle className="w-4 h-4" />
              <span>Interpretable Shortage Risk Formula</span>
            </div>
            <div className="text-sm font-mono text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 inline-block">
              Stock Coverage (Days) = Available Units / Predicted Daily Demand
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 bg-emerald-950/60 border border-emerald-700/60 rounded-lg">
              <div className="font-extrabold text-emerald-400">Coverage ≥ 6d</div>
              <div className="text-[11px] text-emerald-300">NORMAL</div>
            </div>
            <div className="p-2 bg-blue-950/60 border border-blue-700/60 rounded-lg">
              <div className="font-extrabold text-blue-400">3d ≤ Cov &lt; 6d</div>
              <div className="text-[11px] text-blue-300">LOW RISK</div>
            </div>
            <div className="p-2 bg-amber-950/60 border border-amber-700/60 rounded-lg">
              <div className="font-extrabold text-amber-400">1.5d ≤ Cov &lt; 3d</div>
              <div className="text-[11px] text-amber-300">WARNING</div>
            </div>
            <div className="p-2 bg-red-950/60 border border-red-700/60 rounded-lg">
              <div className="font-extrabold text-red-400">Cov &lt; 1.5d</div>
              <div className="text-[11px] text-red-300">CRITICAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-2">
        <Filter className="w-4 h-4 text-slate-400 ml-2" />
        <span className="text-xs font-semibold text-slate-500 mr-2">Severity:</span>
        {['ALL', 'CRITICAL', 'WARNING', 'LOW', 'NORMAL'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              severityFilter === sev
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Alerts Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAlerts.map((alert) => {
          const config = getSeverityBadge(alert.severity);
          const Icon = config.icon;

          return (
            <div
              key={alert.id}
              className={`p-6 rounded-2xl border shadow-xs transition-all ${config.cardBg} flex flex-col justify-between space-y-4`}
            >
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="w-12 h-12 rounded-xl bg-white shadow-xs font-black text-xl text-slate-900 flex items-center justify-center border border-slate-200">
                      {alert.bloodGroup}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${config.badgeBg}`}>
                          {alert.severity}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {alert.shortageProbability}% Shortage Probability
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Alert ID: {alert.id} • Generated by ML Telemetry
                      </div>
                    </div>
                  </div>

                  {alert.isAcknowledged ? (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                      Acknowledged
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 shadow-xs transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 mt-4 bg-white/80 p-3 rounded-xl border border-slate-200/60 text-center">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Available Reserve</div>
                    <div className="text-lg font-black text-slate-900">{alert.availableUnits} Units</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">7-Day Projected Demand</div>
                    <div className="text-lg font-black text-rose-600">{alert.predictedDemand7Days} Units</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Stock Coverage</div>
                    <div className="text-lg font-black text-indigo-700">{alert.stockCoverageDays} Days</div>
                  </div>
                </div>

                {/* Reason Explanation */}
                <div className="mt-3.5 space-y-1">
                  <span className="text-xs font-bold text-slate-800">Clinical Drivers & Reason:</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{alert.reason}</p>
                </div>
              </div>

              {/* Recommended Action Box */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 text-xs">
                <span className="font-bold text-rose-700 block mb-0.5">Recommended Response Protocol:</span>
                <span className="text-slate-800 font-medium">{alert.recommendedAction}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
