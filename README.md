# AI Blood Demand & Availability Prediction System
> **Subtitle:** An Intelligent AI & Cloud-Based Platform for Blood Demand Forecasting, Availability Monitoring and Shortage Prediction  
> **Target:** Final-Year AI & Data Science Capstone Project  
> **Academic Level:** Production-grade full-stack architecture with functional ML pipeline

---

## 1. Executive Summary & Problem Statement
Blood transfusion management in hospitals and regional blood banks faces severe operational vulnerabilities:
- **Perishable biological shelf-life**: Packed red blood cells expire in 35–42 days; platelets expire in just 5 days.
- **Unpredictable clinical trauma spikes**: High-velocity emergency admissions create sudden multi-unit deficits.
- **ABO-Rh compatibility bottlenecks**: O-Negative universal donor blood is in perpetual shortage risk.
- **Fragmented communication**: Blood banks operate reactively rather than predictively.

This system introduces **supervised machine learning ensemble models (Random Forest, Gradient Boosting, Ridge Regression)** to forecast hospital blood demand 24-hours and 7-days ahead, calculate an interpretable **Stock Coverage Index**, track 4°C cold-chain inventory across regional vaults, and trigger automated shortage alerts to prevent clinical deficits.

---

## 2. Key Modules & System Capabilities

### Module 1: Executive Telemetry & Real-Time Dashboard
- 24-hour AI predicted demand vs. actual consumption timeline.
- Cold-chain inventory status (Available vs. Reserved vs. Safety Threshold).
- ABO-Rh blood group distribution charts (Recharts).
- Real-time critical shortage broadcast banner.
- AI Clinical Insights with actionable recommendations.

### Module 2: Blood Inventory Management (Cold-Chain)
- Track physical units across 8 blood groups (O+, O-, A+, A-, B+, B-, AB+, AB-).
- Multi-vault location tracking (4°C regulated, frozen plasma, quarantined).
- Expiry timeline tracking and proactive batch warnings.
- Unit issue transactions with clinical audit logging.

### Module 3: Hospital Demand & Requisition Processing
- Department-level blood orders (Trauma, Surgical, ICU, Maternity, Oncology).
- Urgency tiers: **CRITICAL_EMERGENCY (STAT)**, **URGENT**, and **ROUTINE**.
- Instant stock validation and reservation workflow.
- Dispatch tracking via temperature-regulated transport.

### Module 4: Multi-Horizon AI Demand Forecaster
- Dynamic 24-hour, 7-day, and 30-day projection curves.
- Continuous **95% Confidence Interval bounds** ($\pm 1.96 \times \text{RMSE}$).
- **Explainable AI (XAI)**: Quantified feature attributions (7-day moving averages, weekend trauma factors, elective surgery schedules).
- **What-If Scenario Stress Testing**: Interactive simulator allowing medical officers to test emergency casualty spikes and assess inventory depletion.

### Module 5: Automated Shortage Detection Engine
- Core metric:
  $$\text{Stock Coverage (Days)} = \frac{\text{Available Units}}{\text{Predicted Daily Demand}}$$
- Severity classification:
  - $\text{Coverage} < 1.5\text{ days} \implies \mathbf{CRITICAL}$
  - $1.5 \le \text{Coverage} < 3.0\text{ days} \implies \mathbf{WARNING}$
  - $3.0 \le \text{Coverage} < 6.0\text{ days} \implies \mathbf{LOW}$
  - $\text{Coverage} \ge 6.0\text{ days} \implies \mathbf{NORMAL}$
- Automated response protocols for hospital directors and blood bank logistics.

### Module 6: Blood Donation & Donor Health Screener
- Interactive WHO physiological eligibility screener (Age 18–65, Weight $\ge 50$kg, Hemoglobin $\ge 12.5$ g/dL, 90-day interval).
- Donor registration and donation logging.
- Automatic inventory replenishment upon certified donation intake.

### Module 7: Healthcare Analytics & Epidemiological Trends
- Longitudinal demand vs. collection velocity.
- Trauma surge correlation with weekend timings.
- Crossmatch and reservation efficiency indices.

### Module 8: Machine Learning Lab & Governance
- Benchmark comparison across **Ridge Regression, Random Forest, and Gradient Boosting**.
- Statistical evaluation metrics: **MAE, RMSE, MAPE, and $R^2$**.
- 80/20 chronological holdout validation.
- Interactive model retraining pipeline trigger.
- Feature importance weight charts (Gini/Variance reduction).

### Module 9: Regulatory Reports & CSV/PDF Export
- Daily and weekly audit reports for clinical authorities.
- Downloadable standard CSV export.
- Print-ready clinical summary format.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons |
| **Backend API** | Node.js, Express.js REST API, Role-Based Access Control |
| **Machine Learning** | Temporal Feature Engineering, Random Forest Regressor, Gradient Boosting, Ridge Regression |
| **Persistence** | Multi-lot Cold Storage Database, 90-day Synthetic Clinical Training Dataset |
| **DevOps** | Docker, multi-stage container build |

---

## 4. REST API Reference

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticate user persona |
| `GET` | `/api/inventory` | Authenticated | Retrieve cold storage inventory |
| `POST` | `/api/inventory` | Blood Bank / Admin | Add tested blood lot |
| `POST` | `/api/inventory/:id/issue` | Blood Bank Staff | Issue units to clinical ward |
| `GET` | `/api/requests` | Authenticated | Fetch hospital blood orders |
| `POST` | `/api/requests` | Hospital Staff / Admin | Transmit blood requisition |
| `GET` | `/api/ml/forecast/:group` | Authenticated | Multi-day AI forecast with 95% CI |
| `POST` | `/api/ml/train` | Admin | Retrain ML pipeline & select best model |
| `GET` | `/api/alerts` | Authenticated | Fetch active shortage warnings |
| `GET` | `/api/reports/:type` | Staff / Admin | Generate audit and regulatory reports |

---

## 5. Quickstart & Local Setup

```bash
# 1. Install dependencies
npm install

# 2. Run full-stack application (server + client)
npm run dev

# 3. Access in browser
http://localhost:3000
```

---

## 6. Docker Deployment

```bash
# Build Docker image
docker build -t blood-ai-platform .

# Run container on port 3000
docker run -p 3000:3000 blood-ai-platform
```

---

## 7. Regulatory & Clinical Disclaimer
*This platform is an intelligent decision-support prototype developed for academic and demonstration purposes. It is not a certified medical device and is designed to augment—not replace—the expertise of qualified transfusion laboratory technicians, blood bank directors, and attending physicians.*
