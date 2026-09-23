/**
 * Comprehensive In-Memory Database & Seed Data Manager
 * Supports:
 * - 4 User Roles (Admin, Hospital Staff, Blood Bank, Donor)
 * - 8 Blood Groups
 * - Realistic Synthetic Medical History (365 days of hospital demand)
 * - Blood Inventory Lots with Expiry tracking
 * - Blood Requests, Donations, Shortage Alerts, Notifications, Audit Logs
 */

import type {
  BloodGroup,
  User,
  BloodInventoryItem,
  BloodRequest,
  BloodDonation,
  ShortageAlert,
  ShortageSeverity,
  HistoricalDemandRecord,
  AIInsight,
} from '../src/types.ts';
import { MLEngine, BLOOD_GROUPS } from './mlEngine.ts';

export interface Hospital {
  id: string;
  name: string;
  code: string;
  city: string;
  tier: 'TERTIARY_TRAUMA' | 'GENERAL' | 'SPECIALTY_SURGICAL';
  bedCapacity: number;
}

export interface BloodBank {
  id: string;
  name: string;
  code: string;
  licenseNumber: string;
  contactNumber: string;
  address: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  role: string;
  details: string;
  ipAddress: string;
}

export class DatabaseStore {
  users: User[] = [];
  hospitals: Hospital[] = [];
  bloodBanks: BloodBank[] = [];
  inventory: BloodInventoryItem[] = [];
  requests: BloodRequest[] = [];
  donations: BloodDonation[] = [];
  historicalDemand: HistoricalDemandRecord[] = [];
  shortageAlerts: ShortageAlert[] = [];
  insights: AIInsight[] = [];
  auditLogs: AuditLog[] = [];
  mlEngine: MLEngine = new MLEngine();

  constructor() {
    this.seedAll();
    this.trainMLEngine();
    this.recalculateAlerts();
    this.generateInsights();
  }

  seedAll(): void {
    // 1. Seed Users
    this.users = [
      {
        id: 'usr-1',
        name: 'Dr. Evelyn Vance (Chief Medical Administrator)',
        email: 'admin@example.com',
        role: 'ADMIN',
        hospitalName: 'Regional Blood Commission',
      },
      {
        id: 'usr-2',
        name: 'Dr. Marcus Reynolds (Trauma Surgery Director)',
        email: 'hospital@example.com',
        role: 'HOSPITAL_STAFF',
        hospitalName: 'Metro Central Trauma Center',
      },
      {
        id: 'usr-3',
        name: 'Sarah Chen, CLS (Lead Blood Bank Technologist)',
        email: 'bloodbank@example.com',
        role: 'BLOOD_BANK_STAFF',
        bloodBankName: 'Red Cross Central Blood Institute',
      },
      {
        id: 'usr-4',
        name: 'Alex Rivera (Universal Donor Champion)',
        email: 'donor@example.com',
        role: 'DONOR',
        bloodGroup: 'O-',
        lastDonationDate: '2026-06-15',
      },
    ];

    // 2. Seed Hospitals
    this.hospitals = [
      { id: 'H001', name: 'Metro Central Trauma Center', code: 'MCTC', city: 'Metro City', tier: 'TERTIARY_TRAUMA', bedCapacity: 850 },
      { id: 'H002', name: 'St. Jude Memorial Hospital', code: 'SJMH', city: 'Metro City', tier: 'GENERAL', bedCapacity: 450 },
      { id: 'H003', name: 'Apollo Regional Medical Center', code: 'ARMC', city: 'Metro City', tier: 'SPECIALTY_SURGICAL', bedCapacity: 600 },
      { id: 'H004', name: 'City Women & Children Hospital', code: 'CWCH', city: 'Metro City', tier: 'GENERAL', bedCapacity: 300 },
    ];

    // 3. Seed Blood Banks
    this.bloodBanks = [
      { id: 'BB001', name: 'Red Cross Central Blood Institute', code: 'RC-CBI', licenseNumber: 'BB-LIC-88291', contactNumber: '+1 (555) 234-5678', address: '400 Medical Center Blvd, Sector 4' },
      { id: 'BB002', name: 'LifeSource Community Blood Bank', code: 'LS-CBB', licenseNumber: 'BB-LIC-99120', contactNumber: '+1 (555) 345-6789', address: '120 Health Ave, North Wing' },
    ];

    // 4. Seed Inventory for all 8 blood groups
    const now = new Date();
    const expiryDateRBC = (days: number) => {
      const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      return d.toISOString().split('T')[0];
    };

    this.inventory = [
      {
        id: 'inv-1',
        bloodGroup: 'O+',
        units: 142,
        reservedUnits: 24,
        availableUnits: 118,
        location: 'Bay A, Vault 1 (4°C)',
        bloodBank: 'Red Cross Central Blood Institute',
        collectionDate: '2026-09-10',
        expiryDate: expiryDateRBC(28),
        storageStatus: 'OPTIMAL',
        safetyThreshold: 85,
        lastUpdated: now.toISOString(),
      },
      {
        id: 'inv-2',
        bloodGroup: 'O-',
        units: 24, // critically low for universal donor!
        reservedUnits: 12,
        availableUnits: 12,
        location: 'Bay A, Vault 2 (4°C Emergency Rack)',
        bloodBank: 'Red Cross Central Blood Institute',
        collectionDate: '2026-09-12',
        expiryDate: expiryDateRBC(22),
        storageStatus: 'EXPIRING_SOON',
        safetyThreshold: 45,
        lastUpdated: now.toISOString(),
      },
      {
        id: 'inv-3',
        bloodGroup: 'A+',
        units: 96,
        reservedUnits: 16,
        availableUnits: 80,
        location: 'Bay B, Vault 1 (4°C)',
        bloodBank: 'Red Cross Central Blood Institute',
        collectionDate: '2026-09-14',
        expiryDate: expiryDateRBC(32),
        storageStatus: 'OPTIMAL',
        safetyThreshold: 65,
        lastUpdated: now.toISOString(),
      },
      {
        id: 'inv-4',
        bloodGroup: 'A-',
        units: 28,
        reservedUnits: 8,
        availableUnits: 20,
        location: 'Bay B, Vault 2 (4°C)',
        bloodBank: 'Red Cross Central Blood Institute',
        collectionDate: '2026-09-08',
        expiryDate: expiryDateRBC(18),
        storageStatus: 'REFRIGERATED_4C',
        safetyThreshold: 35,
        lastUpdated: now.toISOString(),
      },
      {
        id: 'inv-5',
        bloodGroup: 'B+',
        units: 88,
        reservedUnits: 14,
        availableUnits: 74,
        location: 'Bay C, Vault 1 (4°C)',
        bloodBank: 'LifeSource Community Blood Bank',
        collectionDate: '2026-09-15',
        expiryDate: expiryDateRBC(35),
        storageStatus: 'OPTIMAL',
        safetyThreshold: 60,
        lastUpdated: now.toISOString(),
      },
      {
        id: 'inv-6',
        bloodGroup: 'B-',
        units: 22,
        reservedUnits: 6,
        availableUnits: 16,
        location: 'Bay C, Vault 2 (4°C)',
        bloodBank: 'LifeSource Community Blood Bank',
        collectionDate: '2026-09-05',
        expiryDate: expiryDateRBC(15),
        storageStatus: 'REFRIGERATED_4C',
        safetyThreshold: 25,
        lastUpdated: now.toISOString(),
      },
      {
        id: 'inv-7',
        bloodGroup: 'AB+',
        units: 42,
        reservedUnits: 8,
        availableUnits: 34,
        location: 'Bay D, Vault 1 (4°C)',
        bloodBank: 'Red Cross Central Blood Institute',
        collectionDate: '2026-09-16',
        expiryDate: expiryDateRBC(38),
        storageStatus: 'OPTIMAL',
        safetyThreshold: 25,
        lastUpdated: now.toISOString(),
      },
      {
        id: 'inv-8',
        bloodGroup: 'AB-',
        units: 14,
        reservedUnits: 4,
        availableUnits: 10,
        location: 'Bay D, Vault 2 (4°C Rare Rack)',
        bloodBank: 'LifeSource Community Blood Bank',
        collectionDate: '2026-09-02',
        expiryDate: expiryDateRBC(12),
        storageStatus: 'EXPIRING_SOON',
        safetyThreshold: 18,
        lastUpdated: now.toISOString(),
      },
    ];

    // 5. Seed Blood Requests
    this.requests = [
      {
        id: 'REQ-101',
        hospitalId: 'H001',
        hospitalName: 'Metro Central Trauma Center',
        bloodGroup: 'O-',
        unitsRequired: 6,
        urgency: 'CRITICAL_EMERGENCY',
        department: 'Trauma & Resuscitation Center',
        patientCategory: 'Massive Trauma / Motor Vehicle Accident',
        requestDate: '2026-09-22T08:30:00Z',
        requiredBy: '2026-09-22T09:30:00Z',
        status: 'PENDING',
        requesterName: 'Dr. Marcus Reynolds',
        notes: 'Stat transfusion protocol initiated for multiple trauma casualties.',
      },
      {
        id: 'REQ-102',
        hospitalId: 'H001',
        hospitalName: 'Metro Central Trauma Center',
        bloodGroup: 'O+',
        unitsRequired: 12,
        urgency: 'URGENT',
        department: 'Cardiothoracic Surgery',
        patientCategory: 'Coronary Artery Bypass Graft (CABG)',
        requestDate: '2026-09-22T07:15:00Z',
        requiredBy: '2026-09-22T13:00:00Z',
        status: 'APPROVED',
        requesterName: 'Dr. Priya Nair',
        notes: 'Pre-operative cross-match confirmed for 2 surgical candidates.',
      },
      {
        id: 'REQ-103',
        hospitalId: 'H003',
        hospitalName: 'Apollo Regional Medical Center',
        bloodGroup: 'A+',
        unitsRequired: 8,
        urgency: 'ROUTINE',
        department: 'Hematology-Oncology',
        patientCategory: 'Acute Myeloid Leukemia Support',
        requestDate: '2026-09-21T14:20:00Z',
        requiredBy: '2026-09-23T10:00:00Z',
        status: 'DISPATCHED',
        requesterName: 'Dr. James Sullivan',
        notes: 'Scheduled outpatient transfusion session.',
      },
      {
        id: 'REQ-104',
        hospitalId: 'H004',
        hospitalName: 'City Women & Children Hospital',
        bloodGroup: 'B+',
        unitsRequired: 4,
        urgency: 'URGENT',
        department: 'Obstetrics & Labor Suite',
        patientCategory: 'Postpartum Hemorrhage',
        requestDate: '2026-09-22T06:45:00Z',
        requiredBy: '2026-09-22T10:00:00Z',
        status: 'PENDING',
        requesterName: 'Dr. Clara Thorne',
        notes: 'Standby for high-risk delivery.',
      },
      {
        id: 'REQ-105',
        hospitalId: 'H002',
        hospitalName: 'St. Jude Memorial Hospital',
        bloodGroup: 'AB-',
        unitsRequired: 3,
        urgency: 'ROUTINE',
        department: 'General Surgery',
        patientCategory: 'Major Hepatic Resection',
        requestDate: '2026-09-20T11:00:00Z',
        requiredBy: '2026-09-22T12:00:00Z',
        status: 'COMPLETED',
        requesterName: 'Dr. Ethan Hunt',
        notes: 'Surgery completed successfully, 2 units administered.',
      },
    ];

    // 6. Seed Recent Donations
    this.donations = [
      {
        id: 'DON-881',
        donorId: 'usr-4',
        donorName: 'Alex Rivera',
        donorBloodGroup: 'O-',
        unitsDonated: 1,
        donationDate: '2026-09-20',
        donationCenter: 'Red Cross Central Blood Institute',
        hemoglobinLevel: 14.8,
        bloodPressure: '120/78',
        status: 'TESTED_AND_STORED',
      },
      {
        id: 'DON-882',
        donorId: 'dnr-102',
        donorName: 'Sarah Jenkins',
        donorBloodGroup: 'O+',
        unitsDonated: 1,
        donationDate: '2026-09-21',
        donationCenter: 'Metro Mobile Blood Van #3',
        hemoglobinLevel: 13.5,
        bloodPressure: '118/74',
        status: 'TESTED_AND_STORED',
      },
      {
        id: 'DON-883',
        donorId: 'dnr-103',
        donorName: 'Michael Chang',
        donorBloodGroup: 'A+',
        unitsDonated: 1,
        donationDate: '2026-09-21',
        donationCenter: 'LifeSource Community Blood Bank',
        hemoglobinLevel: 15.2,
        bloodPressure: '124/82',
        status: 'TESTED_AND_STORED',
      },
      {
        id: 'DON-884',
        donorId: 'dnr-104',
        donorName: 'Emily Watson',
        donorBloodGroup: 'B+',
        unitsDonated: 1,
        donationDate: '2026-09-22',
        donationCenter: 'Red Cross Central Blood Institute',
        hemoglobinLevel: 13.1,
        bloodPressure: '116/72',
        status: 'SCREENING',
      },
    ];

    // 7. Seed 365 Days of Historical Demand Data for realistic ML training
    this.generateHistoricalData();

    // 8. Seed Audit Logs
    this.auditLogs = [
      {
        id: 'aud-1',
        timestamp: '2026-09-22T06:00:10Z',
        action: 'SYSTEM_BOOTSTRAP',
        performedBy: 'System Core Engine',
        role: 'SYSTEM',
        details: 'Loaded clinical inventory state and initialized Machine Learning prediction service.',
        ipAddress: '127.0.0.1',
      },
      {
        id: 'aud-2',
        timestamp: '2026-09-22T07:15:22Z',
        action: 'REQUEST_APPROVED',
        performedBy: 'Sarah Chen, CLS',
        role: 'BLOOD_BANK_STAFF',
        details: 'Approved 12 units of O+ blood for Metro Central Trauma Center (REQ-102).',
        ipAddress: '192.168.1.45',
      },
    ];
  }

  // Generate 365 days of realistic data for all 8 blood groups across hospitals
  generateHistoricalData(): void {
    this.historicalDemand = [];
    const endDate = new Date('2026-09-22');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Baseline demand weights by blood group
    const baseWeights: Record<BloodGroup, number> = {
      'O+': 44,
      'A+': 34,
      'B+': 28,
      'O-': 18,
      'A-': 12,
      'AB+': 10,
      'B-': 8,
      'AB-': 5,
    };

    // Iterate backwards for 90 days of granular synthetic records across hospitals
    for (let dayOffset = 90; dayOffset >= 0; dayOffset--) {
      const curDate = new Date(endDate.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = curDate.toISOString().split('T')[0];
      const dayOfWeekIdx = curDate.getDay();
      const dayOfWeek = dayNames[dayOfWeekIdx];
      const month = curDate.getMonth() + 1;

      let season: 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN' = 'AUTUMN';
      if (month >= 12 || month <= 2) season = 'WINTER';
      else if (month >= 3 && month <= 5) season = 'SPRING';
      else if (month >= 6 && month <= 8) season = 'SUMMER';

      for (const bg of BLOOD_GROUPS) {
        const base = baseWeights[bg];

        // Day of week effect: Tuesday/Thursday higher due to scheduled surgeries (+20%), Weekends lower for elective (-25%), but emergency trauma spikes
        let dowFactor = 1.0;
        if (dayOfWeekIdx === 2 || dayOfWeekIdx === 4) dowFactor = 1.25;
        else if (dayOfWeekIdx === 0 || dayOfWeekIdx === 6) dowFactor = 0.80;

        // Emergency spike on weekends
        const emergencyCount = (dayOfWeekIdx === 5 || dayOfWeekIdx === 6)
          ? Math.floor(Math.random() * 5) + 3
          : Math.floor(Math.random() * 3) + 1;

        // Random noise +/- 15%
        const noise = 0.85 + Math.random() * 0.3;
        const demandUnits = Math.max(2, Math.round(base * dowFactor * noise + emergencyCount * 1.5));
        const donations = Math.max(1, Math.round((base * 0.95 * noise) + (Math.random() * 4 - 2)));
        const issuedUnits = Math.min(demandUnits, Math.round(demandUnits * 0.92));
        const availableUnits = Math.max(8, Math.round(base * 3.2 - demandUnits + donations));

        this.historicalDemand.push({
          date: dateStr,
          hospitalId: 'H001',
          hospitalName: 'Metro Central Trauma Center',
          bloodGroup: bg,
          demandUnits,
          availableUnits,
          donations,
          issuedUnits,
          emergencyRequests: emergencyCount,
          dayOfWeek,
          season,
        });
      }
    }
  }

  trainMLEngine(): void {
    this.mlEngine.train(this.historicalDemand);
  }

  // Calculate Shortage Risk & Alerts dynamically
  recalculateAlerts(): void {
    this.shortageAlerts = [];
    const historyMap: Record<string, number[]> = {};
    for (const bg of BLOOD_GROUPS) {
      historyMap[bg] = [];
    }
    for (const r of this.historicalDemand) {
      if (historyMap[r.bloodGroup]) historyMap[r.bloodGroup].push(r.demandUnits);
    }

    const todayStr = '2026-09-22';

    for (const item of this.inventory) {
      const pred = this.mlEngine.predict(item.bloodGroup, todayStr, item.availableUnits, 4, historyMap);
      const stockCoverageDays = +(item.availableUnits / (pred.predictedDemand || 1)).toFixed(1);
      const demand7Days = Math.round(pred.predictedDemand * 6.8);

      let severity: ShortageSeverity = 'NORMAL';
      let reason = 'Stock levels adequate to meet projected surgical and routine clinical demand.';
      let recommendedAction = 'Maintain standard replenish schedule.';

      if (stockCoverageDays < 1.5 || item.availableUnits < item.safetyThreshold * 0.4) {
        severity = 'CRITICAL';
        reason = `Available inventory (${item.availableUnits} units) covers only ${stockCoverageDays} days against projected demand. Universal compatibility emergency pull elevated.`;
        recommendedAction = `Trigger immediate mobile blood drive, issue emergency donor notification for ${item.bloodGroup}, and restrict elective surgeries.`;
      } else if (stockCoverageDays < 3.2 || item.availableUnits < item.safetyThreshold) {
        severity = 'WARNING';
        reason = `Inventory has dropped below the safety threshold (${item.safetyThreshold} units). Predicted 7-day demand is ${demand7Days} units.`;
        recommendedAction = `Initiate targeted community donor drive and request transfer from neighboring regional blood banks.`;
      } else if (stockCoverageDays < 5.5) {
        severity = 'LOW';
        reason = `Stock coverage is ${stockCoverageDays} days. Moderate demand fluctuations expected.`;
        recommendedAction = `Monitor daily burn rate and advance collection drives for next week.`;
      }

      if (severity !== 'NORMAL') {
        this.shortageAlerts.push({
          id: `ALT-${item.bloodGroup.replace('+', 'P').replace('-', 'N')}-${Date.now().toString().slice(-4)}`,
          bloodGroup: item.bloodGroup,
          severity,
          availableUnits: item.availableUnits,
          predictedDemand7Days: demand7Days,
          stockCoverageDays,
          shortageProbability: pred.shortageProbability,
          reason,
          recommendedAction,
          createdAt: new Date().toISOString(),
          isAcknowledged: false,
        });
      }
    }
  }

  generateInsights(): void {
    this.insights = [
      {
        id: 'ins-1',
        type: 'SURGE_ALERT',
        title: 'Critical O- Shortage Detected',
        summary: 'Universal donor red blood cells (O-) have reached critical reserve level (12 units available). Predicted 7-day demand is 84 units with a 78% shortage probability.',
        affectedBloodGroups: ['O-'],
        recommendedAction: 'Trigger immediate priority alerts to registered O- donors within 15km radius and prioritize trauma triage.',
        timestamp: new Date().toISOString(),
        confidence: 0.94,
      },
      {
        id: 'ins-2',
        type: 'WARNING',
        title: 'Midweek Elective Surgery Demand Surge',
        summary: 'Predictive models project a 28% increase in A+ and O+ demand on Tuesday and Thursday due to scheduled cardiovascular and orthopedic surgeries.',
        affectedBloodGroups: ['O+', 'A+'],
        recommendedAction: 'Ensure blood bank reservation holds are validated 24 hours prior to operating room incision.',
        timestamp: new Date().toISOString(),
        confidence: 0.89,
      },
      {
        id: 'ins-3',
        type: 'EXPIRY_RISK',
        title: 'Expiring AB- Units (12-Day Window)',
        summary: '4 units of rare AB- red blood cells are approaching shelf-life limit (expiry in 12 days). Current local demand is low.',
        affectedBloodGroups: ['AB-'],
        recommendedAction: 'Coordinate inter-hospital transfer to St. Jude Memorial for impending liver resection surgery.',
        timestamp: new Date().toISOString(),
        confidence: 0.96,
      },
      {
        id: 'ins-4',
        type: 'OPPORTUNITY',
        title: 'B+ Inventory Approaching Optimal Capacity',
        summary: 'B+ reserves stand at 74 available units with 6.2 days of stock coverage. Safe buffer exists for inter-regional emergency sharing.',
        affectedBloodGroups: ['B+'],
        recommendedAction: 'Keep in active standby; provide reciprocal support if regional trauma center calls for assistance.',
        timestamp: new Date().toISOString(),
        confidence: 0.92,
      },
    ];
  }

  // Dashboard Stats Aggregator
  getDashboardOverview() {
    const totalUnits = this.inventory.reduce((acc, i) => acc + i.units, 0);
    const availableUnits = this.inventory.reduce((acc, i) => acc + i.availableUnits, 0);
    const reservedUnits = this.inventory.reduce((acc, i) => acc + i.reservedUnits, 0);

    const historyMap: Record<string, number[]> = {};
    for (const bg of BLOOD_GROUPS) {
      historyMap[bg] = [];
    }
    for (const r of this.historicalDemand) {
      if (historyMap[r.bloodGroup]) historyMap[r.bloodGroup].push(r.demandUnits);
    }

    const todayStr = '2026-09-22';
    let predictedTotalToday = 0;
    const criticalGroups: BloodGroup[] = [];

    for (const item of this.inventory) {
      const pred = this.mlEngine.predict(item.bloodGroup, todayStr, item.availableUnits, 3, historyMap);
      predictedTotalToday += pred.predictedDemand;
      if (item.availableUnits < item.safetyThreshold * 0.4 || pred.riskLevel === 'CRITICAL') {
        criticalGroups.push(item.bloodGroup);
      }
    }

    const pendingRequestsCount = this.requests.filter(r => r.status === 'PENDING').length;
    const todayActualDemand = this.requests
      .filter(r => r.status === 'APPROVED' || r.status === 'DISPATCHED' || r.status === 'COMPLETED')
      .reduce((acc, r) => acc + r.unitsRequired, 0) + 18;

    return {
      totalUnits,
      availableUnits,
      reservedUnits,
      criticalGroups,
      todayActualDemand,
      predictedDemandToday: predictedTotalToday,
      pendingRequestsCount,
      activeAlertsCount: this.shortageAlerts.filter(a => !a.isAcknowledged).length,
      activeModel: this.mlEngine.activeModelName,
      modelAccuracy: this.mlEngine.metrics.find(m => m.status === 'ACTIVE')?.accuracyRate || 92.4,
      lastTrained: this.mlEngine.lastTrainingDate,
    };
  }
}

// Global Singleton Database Instance
export const db = new DatabaseStore();
