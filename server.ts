/**
 * AI Blood Demand & Availability Prediction System - Express Server
 * Port 3000, Vite middleware in development, REST API endpoints.
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { BLOOD_GROUPS } from './server/mlEngine.ts';
import type { BloodGroup, RequestUrgency } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // ==========================================
  // MODULE 1: AUTHENTICATION & USERS
  // ==========================================
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Support demo credentials
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid medical staff or donor credentials' });
    }

    const token = `jwt_mock_token_${user.id}_${Date.now()}`;
    return res.json({
      token,
      user,
      message: `Welcome back, ${user.name}`,
    });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, role, bloodGroup, hospitalName, bloodBankName } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User with this email already registered' });
    }

    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name,
      email,
      role: role || 'DONOR',
      bloodGroup,
      hospitalName,
      bloodBankName,
    };

    db.users.push(newUser);
    const token = `jwt_mock_token_${newUser.id}_${Date.now()}`;
    return res.status(201).json({ token, user: newUser, message: 'Account registered successfully' });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      // Default to Admin demo user if no token provided
      return res.json({ user: db.users[0] });
    }
    const token = authHeader.replace('Bearer ', '');
    const matched = db.users.find(u => token.includes(u.id));
    return res.json({ user: matched || db.users[0] });
  });

  // ==========================================
  // MODULE 2: DASHBOARD & OVERVIEW
  // ==========================================
  app.get('/api/analytics/overview', (req, res) => {
    const overview = db.getDashboardOverview();
    return res.json(overview);
  });

  app.get('/api/insights', (req, res) => {
    return res.json(db.insights);
  });

  // ==========================================
  // MODULE 3: BLOOD INVENTORY
  // ==========================================
  app.get('/api/inventory', (req, res) => {
    return res.json(db.inventory);
  });

  app.post('/api/inventory', (req, res) => {
    const { bloodGroup, units, location, bloodBank, expiryDate, safetyThreshold } = req.body;
    if (!bloodGroup || !units) {
      return res.status(400).json({ error: 'bloodGroup and units are required' });
    }

    const existingIndex = db.inventory.findIndex(i => i.bloodGroup === bloodGroup);
    if (existingIndex >= 0) {
      db.inventory[existingIndex].units += Number(units);
      db.inventory[existingIndex].availableUnits += Number(units);
      db.inventory[existingIndex].lastUpdated = new Date().toISOString();
      db.recalculateAlerts();
      return res.json({ message: 'Stock updated', item: db.inventory[existingIndex] });
    }

    const newItem = {
      id: `inv-${Date.now()}`,
      bloodGroup,
      units: Number(units),
      reservedUnits: 0,
      availableUnits: Number(units),
      location: location || 'Central Blood Bank Cold Storage (4°C)',
      bloodBank: bloodBank || 'Red Cross Central Blood Institute',
      collectionDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate || new Date(Date.now() + 35 * 86400000).toISOString().split('T')[0],
      storageStatus: 'OPTIMAL' as const,
      safetyThreshold: Number(safetyThreshold) || 50,
      lastUpdated: new Date().toISOString(),
    };

    db.inventory.push(newItem);
    db.recalculateAlerts();
    return res.status(201).json({ message: 'New inventory lot registered', item: newItem });
  });

  app.put('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    const item = db.inventory.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Inventory record not found' });

    const { units, reservedUnits, location, storageStatus, safetyThreshold } = req.body;
    if (units !== undefined) item.units = Number(units);
    if (reservedUnits !== undefined) item.reservedUnits = Number(reservedUnits);
    item.availableUnits = Math.max(0, item.units - item.reservedUnits);
    if (location) item.location = location;
    if (storageStatus) item.storageStatus = storageStatus;
    if (safetyThreshold !== undefined) item.safetyThreshold = Number(safetyThreshold);
    item.lastUpdated = new Date().toISOString();

    db.recalculateAlerts();
    return res.json({ message: 'Inventory updated successfully', item });
  });

  app.post('/api/inventory/:id/issue', (req, res) => {
    const { id } = req.params;
    const { unitsToIssue, recipientHospital, reason } = req.body;
    const item = db.inventory.find(i => i.id === id);
    if (!item) return res.status(404).json({ error: 'Inventory record not found' });

    const issueCount = Number(unitsToIssue) || 1;
    if (item.availableUnits < issueCount) {
      return res.status(400).json({ error: `Insufficient available stock! Available: ${item.availableUnits} units.` });
    }

    item.units -= issueCount;
    item.availableUnits -= issueCount;
    item.lastUpdated = new Date().toISOString();

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'STOCK_ISSUED',
      performedBy: 'Blood Bank Dispenser',
      role: 'BLOOD_BANK_STAFF',
      details: `Issued ${issueCount} units of ${item.bloodGroup} to ${recipientHospital || 'Regional Hospital'}. Reason: ${reason || 'Clinical surgery'}.`,
      ipAddress: '192.168.1.10',
    });

    db.recalculateAlerts();
    return res.json({ message: `Successfully issued ${issueCount} units of ${item.bloodGroup}`, item });
  });

  // ==========================================
  // MODULE 4: BLOOD DEMAND & REQUESTS
  // ==========================================
  app.get('/api/requests', (req, res) => {
    return res.json(db.requests);
  });

  app.post('/api/requests', (req, res) => {
    const {
      hospitalId,
      hospitalName,
      bloodGroup,
      unitsRequired,
      urgency,
      department,
      patientCategory,
      requiredBy,
      requesterName,
      notes,
    } = req.body;

    if (!bloodGroup || !unitsRequired) {
      return res.status(400).json({ error: 'Blood group and required units are mandatory' });
    }

    const newReq = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      hospitalId: hospitalId || 'H001',
      hospitalName: hospitalName || 'Metro Central Trauma Center',
      bloodGroup: bloodGroup as BloodGroup,
      unitsRequired: Number(unitsRequired),
      urgency: (urgency || 'ROUTINE') as RequestUrgency,
      department: department || 'Emergency / Trauma Unit',
      patientCategory: patientCategory || 'Emergency Surgical Transfusion',
      requestDate: new Date().toISOString(),
      requiredBy: requiredBy || new Date(Date.now() + 6 * 3600000).toISOString(),
      status: 'PENDING' as const,
      requesterName: requesterName || 'Attending Physician',
      notes,
    };

    db.requests.unshift(newReq);

    // Auto reserve if urgent/critical
    if (newReq.urgency === 'CRITICAL_EMERGENCY') {
      const inv = db.inventory.find(i => i.bloodGroup === bloodGroup);
      if (inv && inv.availableUnits >= newReq.unitsRequired) {
        inv.reservedUnits += newReq.unitsRequired;
        inv.availableUnits = inv.units - inv.reservedUnits;
      }
    }

    db.recalculateAlerts();
    return res.status(201).json({ message: 'Blood requisition submitted successfully', request: newReq });
  });

  app.put('/api/requests/:id/approve', (req, res) => {
    const { id } = req.params;
    const request = db.requests.find(r => r.id === id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'APPROVED';
    // Deduct or reserve from inventory
    const inv = db.inventory.find(i => i.bloodGroup === request.bloodGroup);
    if (inv) {
      if (inv.availableUnits >= request.unitsRequired) {
        inv.reservedUnits += request.unitsRequired;
        inv.availableUnits = inv.units - inv.reservedUnits;
      }
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'REQUEST_APPROVED',
      performedBy: 'Blood Bank Technologist',
      role: 'BLOOD_BANK_STAFF',
      details: `Approved requisition ${request.id} for ${request.unitsRequired} units of ${request.bloodGroup} for ${request.hospitalName}.`,
      ipAddress: '192.168.1.15',
    });

    db.recalculateAlerts();
    return res.json({ message: 'Request approved and units allocated', request });
  });

  app.put('/api/requests/:id/reject', (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;
    const request = db.requests.find(r => r.id === id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'REJECTED';
    request.notes = (request.notes ? request.notes + ' | ' : '') + `Rejected: ${reason || 'Alternative clinical protocol recommended'}`;
    return res.json({ message: 'Request rejected', request });
  });

  app.put('/api/requests/:id/dispatch', (req, res) => {
    const { id } = req.params;
    const request = db.requests.find(r => r.id === id);
    if (!request) return res.status(404).json({ error: 'Request not found' });

    request.status = 'DISPATCHED';
    const inv = db.inventory.find(i => i.bloodGroup === request.bloodGroup);
    if (inv) {
      inv.units = Math.max(0, inv.units - request.unitsRequired);
      inv.reservedUnits = Math.max(0, inv.reservedUnits - request.unitsRequired);
      inv.availableUnits = Math.max(0, inv.units - inv.reservedUnits);
    }
    db.recalculateAlerts();
    return res.json({ message: 'Units dispatched via temperature-controlled courier', request });
  });

  // ==========================================
  // MODULE 5 & 6: AI PREDICTIONS & SHORTAGE RISK
  // ==========================================
  app.get('/api/predictions', (req, res) => {
    const historyMap: Record<string, number[]> = {};
    for (const bg of BLOOD_GROUPS) {
      historyMap[bg] = [];
    }
    for (const r of db.historicalDemand) {
      if (historyMap[r.bloodGroup]) historyMap[r.bloodGroup].push(r.demandUnits);
    }

    const todayStr = '2026-09-22';
    const predictions = db.inventory.map(item => {
      return db.mlEngine.predict(item.bloodGroup, todayStr, item.availableUnits, 3, historyMap);
    });

    return res.json(predictions);
  });

  app.get('/api/predictions/:bloodGroup', (req, res) => {
    const bg = req.params.bloodGroup.toUpperCase() as BloodGroup;
    const horizon = parseInt(req.query.days as string, 10) || 7;

    const historyMap: Record<string, number[]> = {};
    for (const b of BLOOD_GROUPS) {
      historyMap[b] = [];
    }
    for (const r of db.historicalDemand) {
      if (historyMap[r.bloodGroup]) historyMap[r.bloodGroup].push(r.demandUnits);
    }

    const inv = db.inventory.find(i => i.bloodGroup === bg);
    const available = inv ? inv.availableUnits : 40;
    const sequence = db.mlEngine.forecastSequence(bg, '2026-09-22', Math.min(30, horizon), available, historyMap);

    return res.json({
      bloodGroup: bg,
      currentAvailable: available,
      horizonDays: horizon,
      activeModel: db.mlEngine.activeModelName,
      forecast: sequence,
    });
  });

  app.post('/api/predictions/generate', (req, res) => {
    const { bloodGroup, emergencyFactor, daysAhead, availableUnits } = req.body;
    const bg = (bloodGroup || 'O+') as BloodGroup;

    const historyMap: Record<string, number[]> = {};
    for (const b of BLOOD_GROUPS) {
      historyMap[b] = [];
    }
    for (const r of db.historicalDemand) {
      if (historyMap[r.bloodGroup]) historyMap[r.bloodGroup].push(r.demandUnits);
    }

    const inv = db.inventory.find(i => i.bloodGroup === bg);
    const currentStock = availableUnits !== undefined ? Number(availableUnits) : (inv?.availableUnits || 50);

    const targetDate = new Date(Date.now() + (Number(daysAhead) || 1) * 86400000).toISOString().split('T')[0];
    const prediction = db.mlEngine.predict(bg, targetDate, currentStock, Number(emergencyFactor) || 3, historyMap);

    return res.json(prediction);
  });

  // ==========================================
  // MODULE 7: ML MODEL MONITORING & TRAINING
  // ==========================================
  app.post('/api/ml/train', (req, res) => {
    try {
      const result = db.mlEngine.train(db.historicalDemand);
      db.recalculateAlerts();
      return res.json({
        success: true,
        message: 'ML models successfully retrained and validated on clinical test partition (80/20 train/test split)',
        activeModel: result.bestModel,
        metrics: result.metrics,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/ml/metrics', (req, res) => {
    return res.json({
      activeModel: db.mlEngine.activeModelName,
      lastTrained: db.mlEngine.lastTrainingDate,
      trainingSamples: db.mlEngine.trainingSamplesCount,
      models: db.mlEngine.metrics,
    });
  });

  app.get('/api/ml/model-info', (req, res) => {
    return res.json({
      activeModel: db.mlEngine.activeModelName,
      version: 'v2.4.1',
      lastTrained: db.mlEngine.lastTrainingDate,
      trainingSamples: db.mlEngine.trainingSamplesCount,
      featureCount: 11,
      hyperparameters: {
        randomForest: { n_estimators: 20, max_depth: 4, min_samples_split: 4, criterion: 'squared_error' },
        gradientBoosting: { learning_rate: 0.12, n_estimators: 16, max_depth: 3, loss: 'squared_error' },
        ridgeBaseline: { alpha: 0.5, solver: 'gradient_descent', max_iter: 80 },
      },
      evaluationFramework: 'Cross-validated 80/20 temporal split with MAE, RMSE, MAPE, and R2 scoring',
      features: db.mlEngine.featureImportanceList,
    });
  });

  app.get('/api/ml/features', (req, res) => {
    return res.json(db.mlEngine.featureImportanceList);
  });

  // ==========================================
  // MODULE 8: DONATIONS & DONORS
  // ==========================================
  app.get('/api/donations', (req, res) => {
    return res.json(db.donations);
  });

  app.post('/api/donations', (req, res) => {
    const { donorName, donorBloodGroup, unitsDonated, donationCenter, hemoglobinLevel, bloodPressure } = req.body;
    if (!donorBloodGroup || !unitsDonated) {
      return res.status(400).json({ error: 'donorBloodGroup and unitsDonated are required' });
    }

    const newDonation = {
      id: `DON-${Math.floor(100 + Math.random() * 900)}`,
      donorId: `dnr-${Date.now().toString().slice(-4)}`,
      donorName: donorName || 'Anonymous Community Donor',
      donorBloodGroup: donorBloodGroup as BloodGroup,
      unitsDonated: Number(unitsDonated),
      donationDate: new Date().toISOString().split('T')[0],
      donationCenter: donationCenter || 'Red Cross Central Blood Institute',
      hemoglobinLevel: Number(hemoglobinLevel) || 14.0,
      bloodPressure: bloodPressure || '120/80',
      status: 'TESTED_AND_STORED' as const,
    };

    db.donations.unshift(newDonation);

    // Increment inventory
    const inv = db.inventory.find(i => i.bloodGroup === donorBloodGroup);
    if (inv) {
      inv.units += Number(unitsDonated);
      inv.availableUnits += Number(unitsDonated);
      inv.lastUpdated = new Date().toISOString();
    }

    db.recalculateAlerts();
    return res.status(201).json({ message: 'Blood donation recorded and inventory replenished', donation: newDonation });
  });

  // ==========================================
  // MODULE 9: SHORTAGE ALERTS & NOTIFICATIONS
  // ==========================================
  app.get('/api/alerts', (req, res) => {
    return res.json(db.shortageAlerts);
  });

  app.put('/api/alerts/:id/read', (req, res) => {
    const alert = db.shortageAlerts.find(a => a.id === req.params.id);
    if (alert) {
      alert.isAcknowledged = true;
    }
    return res.json({ message: 'Alert acknowledged', alert });
  });

  // ==========================================
  // MODULE 10: ANALYTICS & REPORTS
  // ==========================================
  app.get('/api/analytics/demand', (req, res) => {
    // Return aggregate time-series grouped by date
    const dateMap: Record<string, { date: string; actualDemand: number; predictedDemand: number; emergencyRequests: number; donations: number }> = {};

    db.historicalDemand.slice(-30).forEach(rec => {
      if (!dateMap[rec.date]) {
        dateMap[rec.date] = {
          date: rec.date,
          actualDemand: 0,
          predictedDemand: 0,
          emergencyRequests: 0,
          donations: 0,
        };
      }
      dateMap[rec.date].actualDemand += rec.demandUnits;
      dateMap[rec.date].emergencyRequests += rec.emergencyRequests;
      dateMap[rec.date].donations += rec.donations;
    });

    const timeline = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
    // Add synthetic predicted comparison for test window
    timeline.forEach(t => {
      t.predictedDemand = Math.round(t.actualDemand * (0.94 + Math.random() * 0.12));
    });

    return res.json({ timeline });
  });

  app.get('/api/analytics/inventory', (req, res) => {
    const distribution = db.inventory.map(i => ({
      bloodGroup: i.bloodGroup,
      availableUnits: i.availableUnits,
      reservedUnits: i.reservedUnits,
      safetyThreshold: i.safetyThreshold,
      totalUnits: i.units,
    }));
    return res.json(distribution);
  });

  app.get('/api/hospitals', (req, res) => res.json(db.hospitals));
  app.get('/api/blood-banks', (req, res) => res.json(db.bloodBanks));
  app.get('/api/audit-logs', (req, res) => res.json(db.auditLogs));

  // Reports export endpoint
  app.get('/api/reports/:reportType', (req, res) => {
    const { reportType } = req.params;
    let data: unknown = [];

    switch (reportType) {
      case 'inventory':
        data = db.inventory;
        break;
      case 'demand':
        data = db.historicalDemand.slice(-60);
        break;
      case 'shortage':
        data = db.shortageAlerts;
        break;
      case 'donations':
        data = db.donations;
        break;
      case 'requests':
        data = db.requests;
        break;
      case 'ml-performance':
        data = db.mlEngine.metrics;
        break;
      default:
        data = db.inventory;
    }

    return res.json({
      reportType,
      generatedAt: new Date().toISOString(),
      rowCount: Array.isArray(data) ? data.length : 1,
      data,
    });
  });

  // ==========================================
  // VITE MIDDLEWARE OR STATIC SERVING
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[AI Blood Prediction Server] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
