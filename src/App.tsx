import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { EmergencyBanner } from './components/EmergencyBanner';
import { Dashboard } from './components/Dashboard';
import { InventoryView } from './components/InventoryView';
import { RequestsView } from './components/RequestsView';
import { PredictionsView } from './components/PredictionsView';
import { ShortageAlertsView } from './components/ShortageAlertsView';
import { DonationsView } from './components/DonationsView';
import { AnalyticsView } from './components/AnalyticsView';
import { MlLabView } from './components/MlLabView';
import { ReportsView } from './components/ReportsView';
import { DocsView } from './components/DocsView';
import { User, BloodGroup, RequestUrgency } from './types';
import { api } from './lib/api';
import { Zap, ShieldAlert, Heart, Building2, UserCheck, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [criticalGroups, setCriticalGroups] = useState<string[]>([]);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyBloodGroup, setEmergencyBloodGroup] = useState<BloodGroup>('O-');

  // Emergency request form
  const [emergencyUnits, setEmergencyUnits] = useState(3);
  const [emergencyHospital, setEmergencyHospital] = useState('Metro Central Trauma Center');
  const [emergencyNotes, setEmergencyNotes] = useState('Level 1 Trauma resuscitation.');
  const [emergencySuccess, setEmergencySuccess] = useState<string | null>(null);

  useEffect(() => {
    // Initial user setup
    const initUser = async () => {
      try {
        const user = await api.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to get current user', err);
      }
    };
    initUser();

    // Initial alert telemetry
    const checkCritical = async () => {
      try {
        const ov = await api.getOverview();
        setCriticalGroups(ov.criticalGroups || []);
      } catch (err) {
        console.error('Initial telemetry check failed', err);
      }
    };
    checkCritical();
  }, []);

  const handleRoleChange = (role: User['role']) => {
    let email = 'admin@bloodai.org';
    if (role === 'BLOOD_BANK_STAFF') email = 'staff@bloodbank.org';
    if (role === 'HOSPITAL_STAFF') email = 'doctor@metrohealth.org';
    if (role === 'DONOR') email = 'donor@gmail.com';

    const updated = api.switchUser(role, email);
    setCurrentUser(updated);
  };

  const handleOpenEmergency = (group?: string) => {
    if (group && ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].includes(group)) {
      setEmergencyBloodGroup(group as BloodGroup);
    }
    setIsEmergencyModalOpen(true);
  };

  const handleSendEmergencyRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRequest({
        hospitalName: emergencyHospital,
        hospitalId: 'H001',
        bloodGroup: emergencyBloodGroup,
        unitsRequired: emergencyUnits,
        urgency: 'CRITICAL_EMERGENCY' as RequestUrgency,
        department: 'Emergency & Trauma Surgery',
        patientCategory: 'Acute Hemorrhage / Level 1 Trauma',
        requiredBy: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        requesterName: currentUser?.name || 'Attending Trauma Surgeon',
        notes: emergencyNotes,
      });

      setEmergencySuccess(`Emergency requisition for ${emergencyUnits} units of ${emergencyBloodGroup} dispatched immediately.`);
      setTimeout(() => {
        setIsEmergencyModalOpen(false);
        setEmergencySuccess(null);
        setActiveTab('requests');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Emergency transmission error: ${msg}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased selection:bg-rose-500 selection:text-white">
      {/* Critical Shortage Broadcast Banner */}
      <EmergencyBanner
        criticalGroups={criticalGroups}
        onTakeAction={() => setActiveTab('alerts')}
      />

      {/* Main Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigate={setActiveTab}
            onRequestBlood={handleOpenEmergency}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView />
        )}

        {activeTab === 'requests' && (
          <RequestsView />
        )}

        {activeTab === 'predictions' && (
          <PredictionsView />
        )}

        {activeTab === 'alerts' && (
          <ShortageAlertsView />
        )}

        {activeTab === 'donations' && (
          <DonationsView currentUser={currentUser} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView />
        )}

        {activeTab === 'ml-lab' && (
          <MlLabView />
        )}

        {activeTab === 'reports' && (
          <ReportsView />
        )}

        {activeTab === 'docs' && (
          <DocsView />
        )}
      </main>

      {/* Quick Emergency Request Modal (Available system-wide) */}
      {isEmergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-red-600">
                <Zap className="w-5 h-5 fill-red-600 animate-bounce" />
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  STAT Emergency Blood Requisition
                </h2>
              </div>
              <button
                onClick={() => setIsEmergencyModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {emergencySuccess ? (
              <div className="p-4 my-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center font-bold text-sm">
                {emergencySuccess}
              </div>
            ) : (
              <form onSubmit={handleSendEmergencyRequest} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Blood Group Needed
                  </label>
                  <select
                    value={emergencyBloodGroup}
                    onChange={(e) => setEmergencyBloodGroup(e.target.value as BloodGroup)}
                    className="w-full border-2 border-red-300 rounded-xl px-3 py-2 text-base font-extrabold text-red-600 focus:outline-none focus:border-red-600"
                  >
                    {(['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] as BloodGroup[]).map(bg => (
                      <option key={bg} value={bg}>{bg} Whole Blood / PRBC</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    O- Negative is universal donor blood for emergency transfusions before typing.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Units (450ml)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={emergencyUnits}
                      onChange={(e) => setEmergencyUnits(Number(e.target.value))}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Ward</label>
                    <input
                      type="text"
                      value={emergencyHospital}
                      onChange={(e) => setEmergencyHospital(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trauma Indication</label>
                  <textarea
                    rows={2}
                    value={emergencyNotes}
                    onChange={(e) => setEmergencyNotes(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
                    placeholder="Specify trauma surgeon details or acute hemorrhage code"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEmergencyModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Broadcast STAT Order</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Medical Decision Support Prototype Regulatory Disclaimer Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-slate-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-slate-700">
              AI Blood Demand & Availability Prediction System
            </span>
            <span>• Academic Final-Year AI & Data Science Project Prototype</span>
          </div>

          <p className="text-center md:text-right text-[11px] text-slate-400 max-w-xl">
            *Clinical Disclaimer: This platform is designed solely as an intelligent decision-support prototype. It is not a certified medical device and does not replace human clinical judgment or certified transfusion laboratory technicians.*
          </p>
        </div>
      </footer>
    </div>
  );
}
