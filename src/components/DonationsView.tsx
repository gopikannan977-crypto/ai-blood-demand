import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Plus,
  CheckCircle2,
  Calendar,
  UserCheck,
  Activity,
  Heart,
  Droplet,
  ShieldCheck,
  RefreshCw,
  Award,
} from 'lucide-react';
import { BloodDonation, BloodGroup, User } from '../types';
import { api } from '../lib/api';

interface DonationsViewProps {
  currentUser: User | null;
}

export const DonationsView: React.FC<DonationsViewProps> = ({ currentUser }) => {
  const [donations, setDonations] = useState<BloodDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // New Donation Form
  const [formData, setFormData] = useState({
    donorName: currentUser?.role === 'DONOR' ? currentUser.name : 'Jane Doe (Community Volunteer)',
    donorBloodGroup: (currentUser?.bloodGroup || 'O+') as BloodGroup,
    unitsDonated: 1,
    donationCenter: 'Red Cross Central Blood Institute',
    hemoglobinLevel: 14.2,
    bloodPressure: '120/78',
  });

  const [feedback, setFeedback] = useState<string | null>(null);

  // Donor Eligibility Interactive Calculator
  const [eligibility, setEligibility] = useState({
    age: 26,
    weightKg: 64,
    hemoglobin: 13.8,
    daysSinceLastDonation: 110,
    hasRecentInfection: false,
  });

  const loadDonations = async () => {
    setLoading(true);
    try {
      const data = await api.getDonations();
      setDonations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleRecordDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDonation(formData);
      setFeedback(`Donation of ${formData.unitsDonated} unit(s) of ${formData.donorBloodGroup} recorded successfully. Inventory replenished!`);
      setIsRecordModalOpen(false);
      loadDonations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFeedback(msg);
    }
  };

  const isEligible =
    eligibility.age >= 18 &&
    eligibility.age <= 65 &&
    eligibility.weightKg >= 50 &&
    eligibility.hemoglobin >= 12.5 &&
    eligibility.daysSinceLastDonation >= 90 &&
    !eligibility.hasRecentInfection;

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <HeartHandshake className="w-6 h-6 text-rose-600" />
            <span>Blood Donations & Community Donor Portal</span>
          </h1>
          <p className="text-sm text-slate-500">
            Donor registration, collection drive intake, physiological screening, and blood replenishments
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Donation</span>
          </button>
          <button
            onClick={loadDonations}
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh donations"
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

      {/* Two Column Layout: Eligibility Checker & Donor Stat Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donor Interactive Eligibility Screener (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Clinical Donor Eligibility Screening</h2>
                <p className="text-xs text-slate-500">Standard WHO/Red Cross donor physiological criteria verification</p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
              isEligible
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-red-50 text-red-700 border-red-300'
            }`}>
              {isEligible ? 'ELIGIBLE TO DONATE' : 'DEFERRED / INELIGIBLE'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Donor Age (Years)</label>
              <input
                type="number"
                value={eligibility.age}
                onChange={(e) => setEligibility({ ...eligibility, age: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
              />
              <span className="text-[10px] text-slate-400">Must be 18 – 65</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Body Weight (kg)</label>
              <input
                type="number"
                value={eligibility.weightKg}
                onChange={(e) => setEligibility({ ...eligibility, weightKg: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
              />
              <span className="text-[10px] text-slate-400">Minimum 50 kg</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Hemoglobin (g/dL)</label>
              <input
                type="number"
                step="0.1"
                value={eligibility.hemoglobin}
                onChange={(e) => setEligibility({ ...eligibility, hemoglobin: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
              />
              <span className="text-[10px] text-slate-400">≥ 12.5 g/dL required</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Days Since Last Donation</label>
              <input
                type="number"
                value={eligibility.daysSinceLastDonation}
                onChange={(e) => setEligibility({ ...eligibility, daysSinceLastDonation: Number(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
              />
              <span className="text-[10px] text-slate-400">Standard interval: 90 days for whole blood</span>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <input
                type="checkbox"
                id="infect"
                checked={eligibility.hasRecentInfection}
                onChange={(e) => setEligibility({ ...eligibility, hasRecentInfection: e.target.checked })}
                className="rounded text-rose-600 focus:ring-rose-500"
              />
              <label htmlFor="infect" className="text-xs text-slate-700 font-medium">
                Recent fever, antibiotic course, or acute illness in past 14 days
              </label>
            </div>
          </div>
        </div>

        {/* Universal Donor Badge & Info (1 Col) */}
        <div className="bg-gradient-to-br from-rose-900 to-red-950 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Donor Recognition Club</span>
            </div>
            <h3 className="text-xl font-extrabold text-white">Save Up to 3 Lives Per Donation</h3>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
              Every 450ml unit of donated whole blood can be separated into Packed Red Blood Cells (PRBC), Platelets, and Fresh Frozen Plasma (FFP).
            </p>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-white/10 border border-white/20">
            <div className="text-xs text-rose-200 font-semibold">Priority Requirement Right Now:</div>
            <div className="text-2xl font-black text-white mt-1">O- & A- Types</div>
            <div className="text-xs text-rose-100 mt-1">
              Trauma emergency units need O- negative universal donors urgently.
            </div>
          </div>
        </div>
      </div>

      {/* Recent Donations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Validated Donations Record</h2>
          <span className="text-xs text-slate-500">{donations.length} records on file</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Donation ID</th>
                <th className="py-3 px-4">Donor Name</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Collection Center</th>
                <th className="py-3 px-4">Hemoglobin / BP</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">{d.id}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">{d.donorName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-extrabold text-xs border border-rose-200">
                      {d.donorBloodGroup}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{d.unitsDonated} Unit (450ml)</td>
                  <td className="py-3.5 px-4 text-xs text-slate-600">{d.donationCenter}</td>
                  <td className="py-3.5 px-4 text-xs font-mono text-slate-600">
                    Hb: {d.hemoglobinLevel} g/dL • {d.bloodPressure}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">{d.donationDate}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {d.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Donation Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Record Blood Donation</h2>
            <p className="text-xs text-slate-500 mb-4">Log volunteer blood collection and replenish laboratory inventory</p>

            <form onSubmit={handleRecordDonation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donor Name</label>
                <input
                  type="text"
                  value={formData.donorName}
                  onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
                  <select
                    value={formData.donorBloodGroup}
                    onChange={(e) => setFormData({ ...formData, donorBloodGroup: e.target.value as BloodGroup })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as BloodGroup[]).map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Units (450ml)</label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    value={formData.unitsDonated}
                    onChange={(e) => setFormData({ ...formData, unitsDonated: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Donation Center</label>
                <input
                  type="text"
                  value={formData.donationCenter}
                  onChange={(e) => setFormData({ ...formData, donationCenter: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.hemoglobinLevel}
                    onChange={(e) => setFormData({ ...formData, hemoglobinLevel: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Pressure</label>
                  <input
                    type="text"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g. 120/80"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Verify & Store Units
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
