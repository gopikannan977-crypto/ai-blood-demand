/**
 * API client for interacting with the backend REST endpoints
 */

import {
  BloodGroup,
  BloodInventoryItem,
  BloodRequest,
  BloodDonation,
  ShortageAlert,
  MLModelMetrics,
  FeatureImportance,
  PredictionResult,
  User,
  AIInsight,
} from '../types';

export const api = {
  // Auth
  async login(email: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    return data.user;
  },

  switchUser(role: string, email?: string): User {
    const userMap: Record<string, User> = {
      ADMIN: { id: 'U001', name: 'Dr. Sarah Jenkins', email: email || 'admin@bloodai.org', role: 'ADMIN', department: 'Clinical Administration' },
      BLOOD_BANK_STAFF: { id: 'U002', name: 'Robert Chen', email: email || 'staff@bloodbank.org', role: 'BLOOD_BANK_STAFF', department: 'Blood Bank Operations' },
      HOSPITAL_STAFF: { id: 'U003', name: 'Dr. Marcus Reynolds', email: email || 'doctor@metrohealth.org', role: 'HOSPITAL_STAFF', department: 'Emergency & Trauma' },
      DONOR: { id: 'U004', name: 'Emily Watson', email: email || 'donor@gmail.com', role: 'DONOR', bloodGroup: 'O+' },
    };
    return userMap[role] || userMap.ADMIN;
  },

  // Dashboard Overview
  async getOverview() {
    const res = await fetch('/api/analytics/overview');
    return res.json();
  },

  async getInsights(): Promise<AIInsight[]> {
    const res = await fetch('/api/insights');
    return res.json();
  },

  // Inventory
  async getInventory(): Promise<BloodInventoryItem[]> {
    const res = await fetch('/api/inventory');
    return res.json();
  },

  async addInventory(payload: Partial<BloodInventoryItem>) {
    const res = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async updateInventory(id: string, payload: Partial<BloodInventoryItem>) {
    const res = await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async issueInventory(id: string, unitsToIssue: number, recipientHospital: string, reason: string) {
    const res = await fetch(`/api/inventory/${id}/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitsToIssue, recipientHospital, reason }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Issue failed');
    return res.json();
  },

  // Requests
  async getRequests(): Promise<BloodRequest[]> {
    const res = await fetch('/api/requests');
    return res.json();
  },

  async createRequest(payload: Partial<BloodRequest>) {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to submit request');
    return res.json();
  },

  async approveRequest(id: string) {
    const res = await fetch(`/api/requests/${id}/approve`, { method: 'PUT' });
    return res.json();
  },

  async rejectRequest(id: string, reason: string) {
    const res = await fetch(`/api/requests/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async dispatchRequest(id: string) {
    const res = await fetch(`/api/requests/${id}/dispatch`, { method: 'PUT' });
    return res.json();
  },

  // Predictions & Forecasting
  async getTodayPredictions(): Promise<PredictionResult[]> {
    const res = await fetch('/api/predictions');
    return res.json();
  },

  async getBloodGroupForecast(bloodGroup: BloodGroup, days: number = 7) {
    const res = await fetch(`/api/predictions/${encodeURIComponent(bloodGroup)}?days=${days}`);
    return res.json();
  },

  async generateCustomPrediction(params: {
    bloodGroup: BloodGroup;
    emergencyFactor: number;
    daysAhead: number;
    availableUnits: number;
  }): Promise<PredictionResult> {
    const res = await fetch('/api/predictions/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // ML Training & Model Management
  async retrainModel(): Promise<{ success: boolean; message: string; activeModel: string; metrics: MLModelMetrics[] }> {
    const res = await fetch('/api/ml/train', { method: 'POST' });
    return res.json();
  },

  async getModelMetrics(): Promise<{ activeModel: string; lastTrained: string; trainingSamples: number; models: MLModelMetrics[] }> {
    const res = await fetch('/api/ml/metrics');
    return res.json();
  },

  async getModelInfo() {
    const res = await fetch('/api/ml/model-info');
    return res.json();
  },

  async getFeatureImportance(): Promise<FeatureImportance[]> {
    const res = await fetch('/api/ml/features');
    return res.json();
  },

  // Donations
  async getDonations(): Promise<BloodDonation[]> {
    const res = await fetch('/api/donations');
    return res.json();
  },

  async createDonation(payload: Partial<BloodDonation>) {
    const res = await fetch('/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Alerts
  async getAlerts(): Promise<ShortageAlert[]> {
    const res = await fetch('/api/alerts');
    return res.json();
  },

  async acknowledgeAlert(id: string) {
    const res = await fetch(`/api/alerts/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  // Analytics
  async getDemandTimeline() {
    const res = await fetch('/api/analytics/demand');
    return res.json();
  },

  async getInventoryAnalytics() {
    const res = await fetch('/api/analytics/inventory');
    return res.json();
  },

  // Reports
  async getReportData(reportType: string) {
    const res = await fetch(`/api/reports/${reportType}`);
    return res.json();
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch('/api/audit-logs');
    return res.json();
  },
};
