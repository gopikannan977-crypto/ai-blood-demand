export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'ADMIN' | 'HOSPITAL_STAFF' | 'BLOOD_BANK_STAFF' | 'DONOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  hospitalName?: string;
  bloodBankName?: string;
  bloodGroup?: BloodGroup;
  lastDonationDate?: string;
}

export type StorageStatus = 'OPTIMAL' | 'REFRIGERATED_4C' | 'FROZEN_PLASMA' | 'EXPIRING_SOON' | 'QUARANTINED';

export interface BloodInventoryItem {
  id: string;
  bloodGroup: BloodGroup;
  units: number; // in units (approx 450ml per whole blood unit)
  reservedUnits: number;
  availableUnits: number;
  location: string;
  bloodBank: string;
  collectionDate: string;
  expiryDate: string;
  storageStatus: StorageStatus;
  safetyThreshold: number;
  lastUpdated: string;
}

export type RequestUrgency = 'ROUTINE' | 'URGENT' | 'CRITICAL_EMERGENCY';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'DISPATCHED' | 'COMPLETED' | 'REJECTED';

export interface BloodRequest {
  id: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgency: RequestUrgency;
  department: string;
  patientCategory: string; // e.g. 'Trauma/Emergency', 'Cardiovascular Surgery', 'Oncology', 'Maternity', 'Pediatric'
  requestDate: string;
  requiredBy: string;
  status: RequestStatus;
  requesterName: string;
  notes?: string;
}

export interface BloodDonation {
  id: string;
  donorId: string;
  donorName: string;
  donorBloodGroup: BloodGroup;
  unitsDonated: number;
  donationDate: string;
  donationCenter: string;
  hemoglobinLevel: number;
  bloodPressure: string;
  status: 'TESTED_AND_STORED' | 'SCREENING' | 'DISCARDED';
}

export type ShortageSeverity = 'NORMAL' | 'LOW' | 'WARNING' | 'CRITICAL';

export interface ShortageAlert {
  id: string;
  bloodGroup: BloodGroup;
  severity: ShortageSeverity;
  availableUnits: number;
  predictedDemand7Days: number;
  stockCoverageDays: number;
  shortageProbability: number;
  reason: string;
  recommendedAction: string;
  createdAt: string;
  isAcknowledged: boolean;
}

export interface MLModelMetrics {
  modelName: string;
  modelType: 'RANDOM_FOREST' | 'GRADIENT_BOOSTING' | 'RIDGE_REGRESSION' | 'PROPHET_BASELINE';
  version: string;
  trainedAt: string;
  trainingSamples: number;
  mae: number;
  rmse: number;
  mape: number;
  r2Score: number;
  accuracyRate: number;
  status: 'ACTIVE' | 'CANDIDATE' | 'RETIRED';
}

export interface FeatureImportance {
  feature: string;
  importanceScore: number; // 0 to 1
  category: 'TEMPORAL' | 'HISTORICAL_DEMAND' | 'INVENTORY_METRICS' | 'EMERGENCY_FACTORS';
}

export interface PredictionResult {
  bloodGroup: BloodGroup;
  hospitalId?: string;
  forecastDate: string;
  predictedDemand: number;
  confidenceLower: number;
  confidenceUpper: number;
  estimatedAvailability: number;
  shortageProbability: number;
  recommendedStock: number;
  riskLevel: ShortageSeverity;
  contributingFeatures: {
    feature: string;
    impact: number; // positive or negative contribution
    description: string;
  }[];
}

export interface HistoricalDemandRecord {
  date: string;
  hospitalId: string;
  hospitalName: string;
  bloodGroup: BloodGroup;
  demandUnits: number;
  availableUnits: number;
  donations: number;
  issuedUnits: number;
  emergencyRequests: number;
  dayOfWeek: string;
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'AUTUMN';
}

export interface AIInsight {
  id: string;
  type: 'WARNING' | 'OPPORTUNITY' | 'SURGE_ALERT' | 'EXPIRY_RISK' | 'OPERATIONAL_TIP';
  title: string;
  summary: string;
  affectedBloodGroups: BloodGroup[];
  recommendedAction: string;
  timestamp: string;
  confidence: number;
}
