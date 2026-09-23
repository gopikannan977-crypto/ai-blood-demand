import React from 'react';
import { AlertOctagon, ArrowRight, ShieldAlert } from 'lucide-react';
import { ShortageAlert } from '../types';

interface EmergencyBannerProps {
  criticalGroups?: string[];
  alerts?: ShortageAlert[];
  onTakeAction?: () => void;
  onViewAlerts?: () => void;
  onRequestBlood?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  criticalGroups,
  alerts,
  onTakeAction,
  onViewAlerts,
  onRequestBlood,
}) => {
  const groups =
    criticalGroups && criticalGroups.length > 0
      ? criticalGroups
      : alerts
      ? alerts.filter(a => a.severity === 'CRITICAL' && !a.isAcknowledged).map(a => a.bloodGroup)
      : [];

  if (groups.length === 0) return null;

  const handleAction = onViewAlerts || onTakeAction || (() => {});

  return (
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-3 text-xs sm:text-sm">
          <div className="p-1 rounded-full bg-white/20 animate-pulse shrink-0">
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider bg-white text-red-700 px-1.5 py-0.5 rounded text-[11px] mr-2">
              Critical Shortage Alert
            </span>
            <span>
              Blood Group <strong className="underline underline-offset-2">{groups.join(', ')}</strong> reserves are critically low (stock coverage &lt; 1.5 days). Urgent replenishment required!
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleAction}
            className="flex items-center space-x-1 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-medium border border-white/30 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Triage Protocol</span>
          </button>
          {onRequestBlood && (
            <button
              onClick={onRequestBlood}
              className="flex items-center space-x-1 px-3 py-1 bg-white text-red-700 hover:bg-red-50 rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Request Units</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
