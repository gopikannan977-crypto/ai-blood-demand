import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle,
  XCircle,
  Truck,
  AlertCircle,
  Clock,
  Filter,
  RefreshCw,
  Hospital,
  AlertTriangle,
} from 'lucide-react';
import { BloodRequest, BloodGroup, RequestUrgency, RequestStatus } from '../types';
import { api } from '../lib/api';

export const RequestsView: React.FC = () => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New Request Form
  const [formData, setFormData] = useState({
    hospitalName: 'Metro Central Trauma Center',
    hospitalId: 'H001',
    bloodGroup: 'O+' as BloodGroup,
    unitsRequired: 4,
    urgency: 'URGENT' as RequestUrgency,
    department: 'Emergency & Trauma Unit',
    patientCategory: 'Acute Trauma / Hemorrhage',
    requiredBy: new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16),
    requesterName: 'Dr. Marcus Reynolds',
    notes: 'Stat crossmatch requested.',
  });

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRequest(formData);
      setFeedback({ message: 'Blood requisition submitted successfully to regional blood banks', type: 'success' });
      setIsNewModalOpen(false);
      loadRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({ message: msg, type: 'error' });
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.approveRequest(id);
      setFeedback({ message: 'Requisition approved. Units reserved in cold storage.', type: 'success' });
      loadRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({ message: msg, type: 'error' });
    }
  };

  const handleDispatch = async (id: string) => {
    try {
      await api.dispatchRequest(id);
      setFeedback({ message: 'Units dispatched via temperature-regulated transport.', type: 'success' });
      loadRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({ message: msg, type: 'error' });
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please specify clinical rationale for requisition rejection:') || 'Quota exceeded / Clinical review required';
    try {
      await api.rejectRequest(id, reason);
      setFeedback({ message: 'Requisition marked as rejected.', type: 'success' });
      loadRequests();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback({ message: msg, type: 'error' });
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'ALL' || r.urgency === urgencyFilter;
    return matchesStatus && matchesUrgency;
  });

  const getUrgencyBadge = (u: RequestUrgency) => {
    switch (u) {
      case 'CRITICAL_EMERGENCY':
        return 'bg-red-100 text-red-800 font-extrabold border border-red-300 animate-pulse';
      case 'URGENT':
        return 'bg-amber-100 text-amber-800 font-bold border border-amber-300';
      case 'ROUTINE':
        return 'bg-slate-100 text-slate-700 font-medium border border-slate-200';
    }
  };

  const getStatusBadge = (s: RequestStatus) => {
    switch (s) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APPROVED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DISPATCHED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <ClipboardList className="w-6 h-6 text-rose-600" />
            <span>Hospital Blood Demand & Requisitions</span>
          </h1>
          <p className="text-sm text-slate-500">
            Submit, authorize, and track emergency and routine clinical blood requisitions
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Blood Requisition</span>
          </button>
          <button
            onClick={loadRequests}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh requests"
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

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Status:</span>
          </div>
          {['ALL', 'PENDING', 'APPROVED', 'DISPATCHED', 'COMPLETED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500 font-medium">Urgency:</span>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Urgencies</option>
            <option value="CRITICAL_EMERGENCY">Critical Emergency</option>
            <option value="URGENT">Urgent</option>
            <option value="ROUTINE">Routine</option>
          </select>
        </div>
      </div>

      {/* Requisitions List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Req ID</th>
                <th className="py-3.5 px-4">Hospital & Department</th>
                <th className="py-3.5 px-4">Group & Units</th>
                <th className="py-3.5 px-4">Urgency</th>
                <th className="py-3.5 px-4">Patient Category</th>
                <th className="py-3.5 px-4">Timeline</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                    {r.id}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{r.hospitalName}</div>
                    <div className="text-xs text-slate-500">{r.department} • Dr. {r.requesterName}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 font-extrabold flex items-center justify-center text-sm border border-rose-200">
                        {r.bloodGroup}
                      </span>
                      <div>
                        <span className="font-extrabold text-slate-900 text-base">{r.unitsRequired}</span>
                        <span className="text-xs text-slate-500 ml-1">Units</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getUrgencyBadge(r.urgency)}`}>
                      {r.urgency.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-700 font-medium">
                    {r.patientCategory}
                    {r.notes && <div className="text-[11px] text-slate-400 mt-0.5">{r.notes}</div>}
                  </td>

                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Need by: {new Date(r.requiredBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Req: {new Date(r.requestDate).toLocaleDateString()}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${getStatusBadge(r.status)}`}>
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end space-x-1.5">
                      {r.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                            title="Approve Requisition"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                            title="Reject Requisition"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {r.status === 'APPROVED' && (
                        <button
                          onClick={() => handleDispatch(r.id)}
                          className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center space-x-1"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Dispatch</span>
                        </button>
                      )}
                      {r.status === 'DISPATCHED' && (
                        <span className="text-xs text-purple-700 font-medium">In Transit</span>
                      )}
                      {r.status === 'COMPLETED' && (
                        <span className="text-xs text-emerald-700 font-medium">Fulfilled</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Requisition Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">New Hospital Blood Requisition</h2>
            <p className="text-xs text-slate-500 mb-4">Transmit authorized clinical requisition to regional blood banks</p>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital</label>
                  <select
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="Metro Central Trauma Center">Metro Central Trauma Center</option>
                    <option value="St. Jude Memorial Hospital">St. Jude Memorial Hospital</option>
                    <option value="Apollo Regional Medical Center">Apollo Regional Medical Center</option>
                    <option value="City Women & Children Hospital">City Women & Children Hospital</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Units</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.unitsRequired}
                    onChange={(e) => setFormData({ ...formData, unitsRequired: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as RequestUrgency })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold"
                  >
                    <option value="CRITICAL_EMERGENCY">Critical Emergency</option>
                    <option value="URGENT">Urgent</option>
                    <option value="ROUTINE">Routine</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Diagnosis / Category</label>
                <input
                  type="text"
                  value={formData.patientCategory}
                  onChange={(e) => setFormData({ ...formData, patientCategory: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Major Trauma Hemorrhage / Emergency C-Section"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Required By (Date & Time)</label>
                  <input
                    type="datetime-local"
                    value={formData.requiredBy}
                    onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Attending Physician / Requester</label>
                  <input
                    type="text"
                    value={formData.requesterName}
                    onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Additional cross-matching specifics or allergy restrictions"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Transmit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
