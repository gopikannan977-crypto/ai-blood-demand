import React, { useState } from 'react';
import {
  Activity,
  Layers,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  HeartHandshake,
  BarChart3,
  Cpu,
  FileSpreadsheet,
  BookOpen,
  UserCheck,
  ChevronDown,
  Droplet,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  currentUser: User | null;
  onRoleChange: (role: UserRole) => void;
  criticalAlertCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  currentUser,
  onRoleChange,
  criticalAlertCount = 0,
}) => {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'System Admin', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'HOSPITAL_STAFF':
        return { label: 'Hospital Staff', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'BLOOD_BANK_STAFF':
        return { label: 'Blood Bank Staff', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'DONOR':
        return { label: 'Registered Donor', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      default:
        return { label: 'Medical Staff', bg: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'inventory', label: 'Blood Inventory', icon: Layers },
    { id: 'requests', label: 'Requisitions', icon: ClipboardList },
    { id: 'predictions', label: 'AI Forecasting', icon: TrendingUp },
    { id: 'alerts', label: 'Shortage Alerts', icon: AlertTriangle, badge: criticalAlertCount },
    { id: 'donations', label: 'Donations', icon: HeartHandshake },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'ml-lab', label: 'ML Model Lab', icon: Cpu },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
    { id: 'docs', label: 'Viva & Architecture', icon: BookOpen },
  ];

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center shadow-md shadow-rose-500/20 text-white">
              <Droplet className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  AI Blood Demand & Availability
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                  CLINICAL ML v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Intelligent Forecasting, Inventory Monitoring & Shortage Prevention
              </p>
            </div>
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser?.name}</div>
                <div className="text-[10px] text-slate-500">{currentUser?.department || currentUser?.email}</div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleInfo.bg}`}>
                {roleInfo.label}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Switch Active Persona
                </div>
                {[
                  { role: 'ADMIN', name: 'Dr. Sarah Jenkins', desc: 'System Admin (Full Access)' },
                  { role: 'BLOOD_BANK_STAFF', name: 'Robert Chen', desc: 'Blood Bank Operations' },
                  { role: 'HOSPITAL_STAFF', name: 'Dr. Marcus Reynolds', desc: 'Hospital Trauma Ward' },
                  { role: 'DONOR', name: 'Emily Watson', desc: 'Community Donor Portal' },
                ].map((item) => (
                  <button
                    key={item.role}
                    onClick={() => {
                      onRoleChange(item.role as UserRole);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-slate-50 transition-colors ${
                      currentUser?.role === item.role ? 'bg-rose-50 text-rose-900 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-50 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-rose-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white text-rose-600' : 'bg-rose-500 text-white animate-pulse'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
