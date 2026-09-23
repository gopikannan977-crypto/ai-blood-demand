import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Send,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Thermometer,
  Calendar,
  MapPin,
  RefreshCw,
  Building,
  Info,
} from 'lucide-react';
import { BloodInventoryItem, BloodGroup, StorageStatus } from '../types';
import { api } from '../lib/api';

interface InventoryViewProps {
  onIssueClick?: (item: BloodInventoryItem) => void;
  onRequestRestock?: (bloodGroup: BloodGroup) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = () => {
  const [inventory, setInventory] = useState<BloodInventoryItem[]>([]);
  const [predictionsMap, setPredictionsMap] = useState<Record<string, { predictedDemand: number; riskLevel: string }>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BloodInventoryItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    bloodGroup: 'O+' as BloodGroup,
    units: 10,
    location: 'Bay A, Vault 1 (4°C)',
    bloodBank: 'Red Cross Central Blood Institute',
    expiryDate: new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
    safetyThreshold: 60,
  });

  const [issueData, setIssueData] = useState({
    unitsToIssue: 2,
    recipientHospital: 'Metro Central Trauma Center',
    reason: 'Emergency Surgical Transfusion',
  });

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inv, preds] = await Promise.all([
        api.getInventory(),
        api.getTodayPredictions(),
      ]);
      setInventory(inv);

      const pMap: Record<string, { predictedDemand: number; riskLevel: string }> = {};
      preds.forEach(p => {
        pMap[p.bloodGroup] = {
          predictedDemand: p.predictedDemand,
          riskLevel: p.riskLevel,
        };
      });
      setPredictionsMap(pMap);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addInventory(formData);
      setFeedback({ message: `Successfully added ${formData.units} units of ${formData.bloodGroup}`, type: 'success' });
      setIsAddModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({ message: msg, type: 'error' });
    }
  };

  const handleIssueStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    try {
      await api.issueInventory(
        selectedItem.id,
        issueData.unitsToIssue,
        issueData.recipientHospital,
        issueData.reason
      );
      setFeedback({
        message: `Successfully issued ${issueData.unitsToIssue} units of ${selectedItem.bloodGroup} to ${issueData.recipientHospital}`,
        type: 'success',
      });
      setIsIssueModalOpen(false);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({ message: msg, type: 'error' });
    }
  };

  const filteredItems = inventory.filter(item => {
    const matchesSearch = item.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bloodBank.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || item.storageStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: StorageStatus) => {
    switch (status) {
      case 'OPTIMAL':
        return { label: 'Optimal 4°C', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'EXPIRING_SOON':
        return { label: 'Expiring Soon', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'REFRIGERATED_4C':
        return { label: 'Refrigerated 4°C', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'FROZEN_PLASMA':
        return { label: 'Frozen (-18°C)', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'QUARANTINED':
        return { label: 'Quarantined', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      default:
        return { label: status, bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getRiskBadge = (risk?: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 font-bold border border-red-200';
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 font-bold border border-amber-200';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 font-medium border border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 font-medium border border-emerald-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-6 h-6 text-rose-600" />
            <span>Blood Inventory Management</span>
          </h1>
          <p className="text-sm text-slate-500">
            Real-time cold-chain tracking, unit reserves, expiry timelines, and demand risk matrix
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Lot</span>
          </button>
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center justify-between ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* 8 Blood Groups Quick Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {inventory.map(item => {
          const pred = predictionsMap[item.bloodGroup];
          const isCritical = pred?.riskLevel === 'CRITICAL' || item.availableUnits < item.safetyThreshold * 0.4;
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border text-center transition-all ${
                isCritical
                  ? 'bg-red-50/70 border-red-300 ring-1 ring-red-200 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="text-lg font-black text-slate-900">{item.bloodGroup}</div>
              <div className="text-2xl font-extrabold text-rose-600 mt-0.5">{item.availableUnits}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Available</div>
              <div className="mt-2 text-[10px] font-bold">
                <span className={`px-1.5 py-0.5 rounded ${getRiskBadge(pred?.riskLevel || 'NORMAL')}`}>
                  {pred?.riskLevel || 'NORMAL'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by blood group, vault, or bank..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="ALL">All Storage Statuses</option>
            <option value="OPTIMAL">Optimal (4°C)</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
            <option value="REFRIGERATED_4C">Refrigerated (4°C)</option>
            <option value="QUARANTINED">Quarantined</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table with Requisition / Issue Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Blood Group</th>
                <th className="py-3.5 px-4">Available Units</th>
                <th className="py-3.5 px-4">Reserved</th>
                <th className="py-3.5 px-4">Total Stock</th>
                <th className="py-3.5 px-4">Predicted Demand</th>
                <th className="py-3.5 px-4">Shortage Risk</th>
                <th className="py-3.5 px-4">Storage Location</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item) => {
                const pred = predictionsMap[item.bloodGroup];
                const badge = getStatusBadge(item.storageStatus);
                const isLow = item.availableUnits < item.safetyThreshold;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 font-extrabold flex items-center justify-center text-sm border border-rose-200">
                          {item.bloodGroup}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">{item.bloodGroup} Whole Blood</div>
                          <div className="text-[11px] text-slate-400">{item.bloodBank}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                        <span>{item.availableUnits}</span>
                        {isLow && (
                          <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.5 rounded border border-red-200">
                            Below {item.safetyThreshold}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">Safe: {item.safetyThreshold} min</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <span className="font-medium text-slate-700">{item.reservedUnits}</span> units
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900">
                      {item.units} units
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">
                        {pred?.predictedDemand || Math.round(item.availableUnits * 0.4)} units
                      </div>
                      <div className="text-[11px] text-slate-500">24h Projection</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRiskBadge(pred?.riskLevel || 'NORMAL')}`}>
                        {pred?.riskLevel || 'NORMAL'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location}</span>
                      </div>
                      <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] border ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.expiryDate}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setIsIssueModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center space-x-1"
                      >
                        <Send className="w-3 h-3" />
                        <span>Issue Units</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Stock Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Add Blood Stock Lot</h2>
            <p className="text-xs text-slate-500 mb-4">Register tested units into cold storage inventory</p>

            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-rose-500"
                >
                  {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Units (450ml units)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Bank / Storage Facility</label>
                <input
                  type="text"
                  value={formData.bloodBank}
                  onChange={(e) => setFormData({ ...formData, bloodBank: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location (Rack / Vault)</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Safety Threshold</label>
                  <input
                    type="number"
                    value={formData.safetyThreshold}
                    onChange={(e) => setFormData({ ...formData, safetyThreshold: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Confirm & Store Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Stock Modal */}
      {isIssueModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              Issue {selectedItem.bloodGroup} Blood Units
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Dispatch units from cold storage (Available: <strong>{selectedItem.availableUnits} units</strong>)
            </p>

            <form onSubmit={handleIssueStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Units to Issue</label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.availableUnits}
                  value={issueData.unitsToIssue}
                  onChange={(e) => setIssueData({ ...issueData, unitsToIssue: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Hospital</label>
                <select
                  value={issueData.recipientHospital}
                  onChange={(e) => setIssueData({ ...issueData, recipientHospital: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="Metro Central Trauma Center">Metro Central Trauma Center</option>
                  <option value="St. Jude Memorial Hospital">St. Jude Memorial Hospital</option>
                  <option value="Apollo Regional Medical Center">Apollo Regional Medical Center</option>
                  <option value="City Women & Children Hospital">City Women & Children Hospital</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Indication / Reason</label>
                <textarea
                  value={issueData.reason}
                  onChange={(e) => setIssueData({ ...issueData, reason: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Scheduled open heart surgery crossmatch"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
