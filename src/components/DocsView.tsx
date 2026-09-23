import React, { useState } from 'react';
import {
  BookOpen,
  Code2,
  Database,
  Cpu,
  Layers,
  Award,
  Terminal,
  ShieldCheck,
  FileText,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const DocsView: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'OVERVIEW' | 'ARCHITECTURE' | 'ML_METHODOLOGY' | 'SHORTAGE_LOGIC' | 'API_SPEC' | 'VIVA_GUIDE'
  >('OVERVIEW');

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <BookOpen className="w-6 h-6 text-rose-600" />
          <span>System Documentation & Academic Research Dossier</span>
        </h1>
        <p className="text-sm text-slate-500">
          Complete project blueprint, machine learning pipeline methodology, architectural diagrams, and viva defense guide
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2 text-xs font-bold">
        {[
          { id: 'OVERVIEW', label: '1. Executive Summary' },
          { id: 'ARCHITECTURE', label: '2. System Architecture' },
          { id: 'ML_METHODOLOGY', label: '3. Machine Learning Engine' },
          { id: 'SHORTAGE_LOGIC', label: '4. Shortage Detection Formula' },
          { id: 'API_SPEC', label: '5. REST API Specifications' },
          { id: 'VIVA_GUIDE', label: '6. Academic Viva & FAQ' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeSection === tab.id
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Executive Summary */}
      {activeSection === 'OVERVIEW' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs leading-relaxed text-sm text-slate-700">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Project Overview & Problem Statement</h2>
            <p>
              Blood bank inventory management is critically sensitive to unpredictable trauma surges, perishable product lifetimes (35–42 days for refrigerated whole blood and red blood cells, 5 days for platelets), and ABO-Rh compatibility constraints. In traditional healthcare systems, blood banks reactively order blood after stock depletes, triggering life-threatening delays in surgical theaters and maternal emergency wards.
            </p>
            <p>
              The <strong>AI Blood Demand & Availability Prediction System</strong> solves this paradigm by introducing predictive machine learning to forecast hospital demand multi-days in advance, continuously monitor cold storage availability, quantify stock coverage days, and issue early automated alerts before critical deficits occur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <h3 className="font-bold text-rose-900 mb-1">Predictive Forecasting</h3>
              <p className="text-xs text-rose-800">
                Machine learning ensemble (Random Forest, Gradient Boosting, Ridge Regression) predicting 24-hour and 7-day demand with 95% confidence intervals.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-1">Cold-Chain Tracking</h3>
              <p className="text-xs text-blue-800">
                Real-time tracking of units across regional blood banks and storage vaults, maintaining optimal 4°C regulation and expiry dates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
              <h3 className="font-bold text-purple-900 mb-1">Proactive Shortage Defense</h3>
              <p className="text-xs text-purple-800">
                Automated stock coverage index calculating burn rate: alerting hospital staff when reserves dip below 1.5–3.0 coverage days.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Architecture */}
      {activeSection === 'ARCHITECTURE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs text-sm text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">Full-Stack System Architecture</h2>
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
            <pre>{`+---------------------------------------------------------------------------------+
|                                USER INTERFACE (Vite + React + Tailwind + Recharts) |
|  - Real-time Dashboard   - Inventory Mgmt    - Requisitions   - AI Forecaster   |
|  - Shortage Alerts       - Donor Portal      - Analytics      - ML Lab          |
+---------------------------------------------------------------------------------+
                                      |
                                      | HTTP REST / JSON API (JWT Bearer)
                                      v
+---------------------------------------------------------------------------------+
|                             APPLICATION LAYER (Express.js / Node.js)            |
|  - Role-Based Access Control (Admin, Blood Bank Staff, Hospital Staff, Donor)   |
|  - Blood Inventory & Reservation Transaction Engine                             |
|  - Automated Shortage Risk Evaluator (Coverage Days & Burn Rate)                 |
+---------------------------------------------------------------------------------+
                                      |
         +----------------------------+----------------------------+
         |                                                         |
         v                                                         v
+------------------------------------+    +---------------------------------------+
|  MACHINE LEARNING PIPELINE ENGINE  |    |  DATA STORAGE & PERSISTENCE LAYER     |
|  - Temporal Feature Extractor      |    |  - Blood Inventory Lots (4°C)         |
|  - Moving Average Lag Windows      |    |  - Requisitions & Emergency Orders    |
|  - Ensemble Models:                |    |  - Donor Registry & Donations History |
|    * Random Forest Regressor       |    |  - 90-Day Longitudinal Training Data  |
|    * Gradient Boosting Regressor   |    +---------------------------------------+
|    * Ridge Linear Regressor        |
|  - Auto Best-Model Selector        |
|  - 95% Confidence Interval Engine  |
+------------------------------------+`}</pre>
          </div>
        </div>
      )}

      {/* Tab 3: Machine Learning Methodology */}
      {activeSection === 'ML_METHODOLOGY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs text-sm text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">Machine Learning Pipeline & Feature Engineering</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900">1. Feature Engineering Vector</h3>
              <p className="text-xs text-slate-600 mt-1">
                Raw clinical logs are transformed into standardized mathematical feature vectors:
              </p>
              <ul className="list-disc list-inside text-xs space-y-1 mt-2 font-mono text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <li>x0: Group Baseline Demand Weight (ABO-Rh population incidence)</li>
                <li>x1: Day of Week Cyclic Encoding (capturing weekend trauma vs weekday surgeries)</li>
                <li>x2: Is Weekend Binary Indicator</li>
                <li>x3: Month of Year (capturing seasonal elective surgery patterns)</li>
                <li>x4: 7-Day Historical Moving Average Demand</li>
                <li>x5: 3-Day Short-Term Exponential Moving Average</li>
                <li>x6: Normalized Emergency Trauma Intake Factor (0.0 to 1.0)</li>
                <li>x7: Scheduled Elective Surgeries Factor</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">2. Model Selection & Cross-Validation</h3>
              <p className="text-xs text-slate-600 mt-1">
                The training pipeline applies an 80/20 chronological train-test split to preserve time-series causality. Three distinct model families are fitted and benchmarked:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-900">Ridge Linear Regression</div>
                  <div className="text-slate-500 mt-0.5">L2 regularized baseline for linear feature response.</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-900">Random Forest Regressor</div>
                  <div className="text-slate-500 mt-0.5">Ensemble of decision trees mitigating non-linear trauma variance.</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="font-bold text-slate-900">Gradient Boosting Regressor</div>
                  <div className="text-slate-500 mt-0.5">Iterative gradient shrinkage boosting on residual errors.</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900">3. Evaluation Metrics</h3>
              <p className="text-xs text-slate-600 mt-1">
                Standard statistical metrics used to grade performance:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono mt-2">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="font-bold text-slate-900">MAE:</span> Mean Absolute Error
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="font-bold text-slate-900">RMSE:</span> Root Mean Squared Error
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="font-bold text-slate-900">MAPE:</span> Mean Abs Percentage Error
                </div>
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <span className="font-bold text-slate-900">R² Score:</span> Variance Explained (0 to 1)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Shortage Logic */}
      {activeSection === 'SHORTAGE_LOGIC' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs text-sm text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">Blood Shortage Formula & Threshold Logic</h2>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
            <div className="text-xs font-bold text-rose-900 uppercase">Core Equation</div>
            <div className="text-base font-mono font-bold text-rose-950">
              Stock Coverage (Days) = Available Units / Predicted Daily Demand
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              If a blood bank currently possesses 12 units of O- negative blood, and the AI model predicts an upcoming daily burn rate of 10 units/day:
              <br />
              <strong className="font-mono">Coverage = 12 / 10 = 1.2 Days (&lt; 1.5 Days → CRITICAL DEFICIT)</strong>
            </p>
          </div>

          <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Severity</th>
                <th className="p-2.5">Stock Coverage (Days)</th>
                <th className="p-2.5">Inventory vs Threshold</th>
                <th className="p-2.5">Automated Action Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-red-50/50">
                <td className="p-2.5 font-bold text-red-700">CRITICAL</td>
                <td className="p-2.5 font-bold">&lt; 1.5 Days</td>
                <td className="p-2.5">&lt; 35% of Safety Level</td>
                <td className="p-2.5">Trigger SMS/Emergency push to universal donors; restrict non-urgent surgery.</td>
              </tr>
              <tr className="bg-amber-50/50">
                <td className="p-2.5 font-bold text-amber-700">WARNING</td>
                <td className="p-2.5 font-bold">1.5 – 3.0 Days</td>
                <td className="p-2.5">35% – 70% of Safety Level</td>
                <td className="p-2.5">Schedule regional mobile blood drives; request inter-hospital inventory rebalance.</td>
              </tr>
              <tr className="bg-blue-50/50">
                <td className="p-2.5 font-bold text-blue-700">LOW</td>
                <td className="p-2.5 font-bold">3.0 – 6.0 Days</td>
                <td className="p-2.5">70% – 100% of Safety Level</td>
                <td className="p-2.5">Standard donor reminder notifications; monitor weekend elective schedule.</td>
              </tr>
              <tr className="bg-emerald-50/50">
                <td className="p-2.5 font-bold text-emerald-700">NORMAL</td>
                <td className="p-2.5 font-bold">≥ 6.0 Days</td>
                <td className="p-2.5">&gt; 100% of Safety Level</td>
                <td className="p-2.5">Optimal cold-chain storage; routine monitoring.</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: API Spec */}
      {activeSection === 'API_SPEC' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs text-sm text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">RESTful API Endpoints Specification</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 font-mono">
                <tr>
                  <th className="p-2.5">Method</th>
                  <th className="p-2.5">Endpoint</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/auth/login</td>
                  <td className="p-2.5 text-slate-500 font-sans">Public</td>
                  <td className="p-2.5 font-sans">Authenticate user and retrieve session token & role.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                  <td className="p-2.5">/api/inventory</td>
                  <td className="p-2.5 text-slate-500 font-sans">Authenticated</td>
                  <td className="p-2.5 font-sans">Fetch all 8 blood group inventory items with vault locations.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/inventory</td>
                  <td className="p-2.5 text-slate-500 font-sans">Blood Bank Staff / Admin</td>
                  <td className="p-2.5 font-sans">Register new tested blood lot units into cold storage.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/inventory/:id/issue</td>
                  <td className="p-2.5 text-slate-500 font-sans">Blood Bank Staff</td>
                  <td className="p-2.5 font-sans">Issue units to hospital transfusion ward.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                  <td className="p-2.5">/api/requests</td>
                  <td className="p-2.5 text-slate-500 font-sans">Hospital / Staff</td>
                  <td className="p-2.5 font-sans">List clinical blood requisitions with status.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-emerald-600 font-bold">GET</td>
                  <td className="p-2.5">/api/ml/forecast/:group</td>
                  <td className="p-2.5 text-slate-500 font-sans">Authenticated</td>
                  <td className="p-2.5 font-sans">Generate multi-day AI demand forecast with 95% confidence bounds.</td>
                </tr>
                <tr>
                  <td className="p-2.5 text-blue-600 font-bold">POST</td>
                  <td className="p-2.5">/api/ml/train</td>
                  <td className="p-2.5 text-slate-500 font-sans">Admin</td>
                  <td className="p-2.5 font-sans">Retrain ML pipeline, benchmark models, and select best performer.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Academic Viva & FAQ */}
      {activeSection === 'VIVA_GUIDE' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs text-sm text-slate-700">
          <h2 className="text-xl font-bold text-slate-900">Final-Year Project Viva Defense & Presentation Guide</h2>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Q1: Why is blood demand forecasting not a simple time-series problem?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>Answer:</strong> Blood demand is non-stationary, heavily multi-modal, and influenced by unpredictable trauma surges, weekday elective surgery schedules (peaks on Tuesdays/Thursdays), seasonality, and strict biological shelf-life constraints (e.g., 35 days for RBCs, 5 days for platelets). A linear model fails to capture sudden trauma shocks, which is why an ensemble Random Forest with rolling lag features and emergency surge indices yields superior generalization.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Q2: How does the system handle explainability for doctors and staff?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>Answer:</strong> The platform incorporates Explainable AI (XAI) feature attribution. Instead of delivering an opaque number, the dashboard explicitly details the additive contributions: e.g., <em>"+4.2 units from 7-day moving average", "+6.1 units from emergency trauma intake", "-1.8 units from weekend scheduled surgery reduction"</em>, fostering clinical confidence.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-900 text-base">Q3: What makes this a complete, production-grade system rather than a toy CRUD app?</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                <strong>Answer:</strong> It unites end-to-end healthcare workflow: (1) Machine Learning pipeline with 80/20 cross-validation and automatic model selection (MAE/RMSE/R²), (2) Real cold-chain inventory with location and expiry tracking, (3) Mathematical shortage risk quantification ($Stock Coverage = Units / Demand$), (4) Hospital requisition approval workflows, (5) Donor eligibility physiological calculators, and (6) CSV/PDF regulatory report generation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
