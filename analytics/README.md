# PredictX – Factory Performance Analytics & Decision Intelligence Module

**Module Owner:** Member 4 – Factory Analytics & Decision Intelligence Lead  
**Branch:** `feature/factory-analytics`  
**Integration Status:** Complete, Tested, and Verified  

---

## 1. Module Overview & Architecture

The **Factory Analytics & Decision Intelligence Module** provides enterprise-grade performance monitoring and actionable maintenance insights for industrial manufacturing plants. It quantifies line operational efficiency, breaks down stoppage causes, evaluates asset reliability, and executes transparent, deterministic decision rules to guide maintenance teams.

```
PredictX Analytics Architecture:
┌─────────────────────────────────────────────────────────────┐
│                 PredictX Web Dashboard                      │
│     (React 19, TypeScript, TailwindCSS v4, Recharts)        │
└──────────────────────────────▲──────────────────────────────┘
                               │ REST / JSON (HTTP)
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend Layer                    │
│      backend/app/api/v1/analytics.py | schemas/ | service   │
└──────────────────────────────▲──────────────────────────────┘
                               │ Python Service Bridge
┌──────────────────────────────▼──────────────────────────────┐
│                Factory Analytics Core Engine                │
│                                                             │
│   ┌────────────────────┐   ┌────────────────────────────┐   │
│   │   OEE Calculator   │   │     Downtime Analyzer      │   │
│   │ (Avail, Perf, Qual)│   │  (Pareto, Trends, Losses)  │   │
│   └─────────┬──────────┘   └─────────────┬──────────────┘   │
│             │                            │                  │
│   ┌─────────▼──────────┐   ┌─────────────▼──────────────┐   │
│   │ Reliability Engine │   │ Decision Intelligence Core │   │
│   │    (MTBF, MTTR)    │   │ (Transparent Rules Engine) │   │
│   └─────────┬──────────┘   └─────────────┬──────────────┘   │
│             │                            │                  │
│             └──────────────┬─────────────┘                  │
│                            │                                │
│   ┌────────────────────────▼────────────────────────────┐   │
│   │         What-If Scenario Simulation Engine          │   │
│   │   (Downtime Cut, Speed Boost, Scrap Mitigation)     │   │
│   └─────────────────────────────────────────────────────┘   │
└──────────────────────────────▲──────────────────────────────┘
                               │ Ingestion Adapter
┌──────────────────────────────▼──────────────────────────────┐
│            Data Layer (Synthetic / MongoDB Telemetry)       │
│       analytics/data_generation/production_generator.py     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Mathematical Formulations & Methodologies

### 2.1 Overall Equipment Effectiveness (OEE)
Conforms to standard Total Productive Maintenance (TPM) methodology:
$$\text{OEE} = \text{Availability} \times \text{Performance} \times \text{Quality}$$

#### A. Availability Rate ($A$)
Measures percentage of scheduled time the asset is actively operating:
$$\text{Availability} = \frac{\text{Operating Time}}{\text{Planned Production Time}}$$
- **Operating Time:** Planned production time minus all unplanned and planned stoppage events.
- **Defensive Safeguards:** Bounded in $[0.0, 1.0]$. Zero division protection for non-positive planned time.

#### B. Performance Efficiency ($P$)
Measures operating speed against theoretical design standard:
$$\text{Performance} = \frac{\text{Ideal Cycle Time} \times \text{Total Units Produced}}{\text{Operating Time}}$$
- **Ideal Cycle Time:** Minimum theoretical duration (in seconds) required to fabricate one part.
- **Defensive Safeguards:** Performance is clamped to 1.0 (100%) to prevent distorted OEE ratings from over-speeding.

#### C. Quality Rate ($Q$)
Measures first-pass manufacturing yield:
$$\text{Quality} = \frac{\text{Good Units Produced}}{\text{Total Units Produced}}$$
- **Total Units:** $\text{Good Units} + \text{Rejected / Scrap Units}$.
- **Defensive Safeguards:** Handles empty production runs gracefully ($0.0$). Clamped so good units cannot exceed total units.

#### TPM Industry Benchmark Classifications:
- **$\ge 85.0\%$**: World-Class Manufacturing standard
- **$70.0\% - 84.9\%$**: Acceptable / Standard Industrial Performance
- **$50.0\% - 69.9\%$**: Underperforming / Elevated Process Losses
- **$< 50.0\%$**: Critical Process Losses

---

### 2.2 Production Downtime Analysis
- **Total Downtime ($H_{DT}$):** Cumulative lost hours across all recorded stoppages.
- **Category Pareto Distribution:** Classifies stoppages into standard industrial root causes:
  1. *Tool Breakage & Insert Wear*
  2. *Thermal Overheating ($\Delta T$ Collapse)*
  3. *Mechanical Jam & Material Clog*
  4. *Spindle & Motor Electrical Trip*
  5. *Die Setup & Tool Changeover*
  6. *Pneumatic / Hydraulic Pressure Drop*
- **Financial & Volume Loss Calculations:**
  $$\text{Lost Units} = \text{Downtime Hours} \times \text{Nominal Units Per Hour}$$
  $$\text{Financial Loss (\$)} = (\text{Downtime Hours} \times \text{Hourly Overhead}) + (\text{Lost Units} \times \text{Unit Margin})$$

---

### 2.3 Mean Time Between Failures (MTBF)
Quantifies equipment operational reliability during verified run time:
$$\text{MTBF} = \frac{\text{Total Operating Time}}{\text{Number of Recorded Failures}}$$
- **Failure Rate ($\lambda$):** $\lambda = \frac{1}{\text{MTBF}}$ (failures per operating hour).
- **Zero Failures Handling:** If a machine completes its production schedule without breakdown, the engine assigns an explicit status `EXCELLENT` and displays $\text{MTBF} \ge \text{Operating Time}$ with `has_failures = False`.

---

### 2.4 Mean Time To Repair (MTTR)
Quantifies maintainability and restoration efficiency:
$$\text{MTTR} = \frac{\text{Total Repair Restoration Time}}{\text{Number of Completed Repairs}}$$
- **Units:** Standardized in decimal hours and human-readable minutes.
- **Zero Repairs Handling:** Yields `0.0h (No Repairs)` with status `NO_REPAIRS`.
- **Target Benchmark:** Standard industrial target is $\text{MTTR} \le 2.0\text{ hours}$.

---

## 3. Decision Intelligence Engine & Recommendation Logic

The **Maintenance Recommendation Engine** (`analytics/decision_engine/`) evaluates factory metrics deterministically:

> [!IMPORTANT]
> **Integrity & Transparency Notice:**
> All recommendations produced by this engine are strictly rule-based engineering interventions derived from operational limits. They are **NOT** marketed as artificial intelligence or black-box machine learning predictions.

### Rule Evaluation Matrix:
| Trigger Condition | Evaluated Metric | Threshold Limit | Actionable Recommendation | Priority |
|---|---|---|---|:---:|
| **Low OEE** | OEE | $< 65\%$ (High) / $< 75\%$ (Med) | Comprehensive cross-functional Kaizen loss review on production line | HIGH / MED |
| **Low Availability** | Availability | $< 75\%$ (High) / $< 85\%$ (Med) | Audit shift changeovers; inspect drive belts and mechanical bearings | HIGH / MED |
| **Low Performance** | Performance | $< 75\%$ (High) / $< 85\%$ (Med) | Inspect spindle lubrication; clean feed guides; calibrate servo torque | HIGH / MED |
| **Low Quality** | Quality | $< 95\%$ (High) / $< 98\%$ (Med) | Recalibrate cutting tools; check thermal offsets; inspect raw stock | HIGH / MED |
| **Low MTBF** | MTBF | $< 80\text{h}$ (High) / $< 150\text{h}$ (Med) | Perform Root Cause Failure Analysis (RCFA); replace high-wear components | HIGH / MED |
| **High MTTR** | MTTR | $\ge 4.5\text{h}$ (High) / $\ge 3.0\text{h}$ (Med) | Stock pre-tested subassemblies line-side; update technician diagnostic SOPs | HIGH / MED |
| **Repeated Downtime** | Stoppages | $\ge 4$ events (High) / $\ge 2$ events (Med) | Immediate preventive shutdown overhaul before catastrophic breakdown | HIGH / MED |

### Member 1 ML Survival Interface:
`RecommendationEngine.integrate_survival_predictions(recommendations, survival_data)` augments rule-based recommendations with survival risk probabilities from Member 1 (`feature/ml-survival`) when available, escalating ticket priority if 7-day failure probability exceeds $70\%$.

---

## 4. Synthetic Demonstration Dataset Specification

All demonstration records generated by `analytics/data_generation/production_generator.py` carry explicit metadata:
```json
{
  "is_synthetic": true,
  "dataset_source": "PredictX Synthetic Manufacturing Generator (Demonstration Data)"
}
```
Fleet includes 10 production assets:
1. `MAC-001`: CNC Milling Center 01 (Machining Line A)
2. `MAC-002`: CNC Lathe Unit 02 (Turning Cell B)
3. `MAC-003`: Hydraulic Press 500T (Stamping Shop)
4. `MAC-004`: Gas Turbine Unit 04 (Cogeneration Plant - High Stoppage Profile)
5. `MAC-005`: Fiber Laser Cell 05 (Fabrication Cell - High Scrap Profile)
6. `MAC-006`: Robotic Welding Cell 06 (Assembly Line 1)
7. `MAC-007`: Screw Air Compressor 07 (Utility Bay)
8. `MAC-008`: Vertical Machining Center 08 (Machining Line A)
9. `MAC-009`: High-Speed Lathe 09 (Turning Cell B)
10. `MAC-010`: Automated Stamping Press 10 (Stamping Shop)

---

## 5. REST API Integration (`backend/app/api/v1/analytics.py`)

| Method | Endpoint | Description | Response Schema |
|---|---|---|---|
| `GET` | `/api/v1/analytics/kpis` | Factory Overview KPIs (OEE, A, P, Q, MTBF, MTTR, Units) | `FactoryKPIsResponse` |
| `GET` | `/api/v1/analytics/oee` | 7-day OEE composite trend series | `List[OeeHistoryEntry]` |
| `GET` | `/api/v1/analytics/machines` | Machine-level OEE and unit breakdown | `List[MachinePerformanceResponse]` |
| `GET` | `/api/v1/analytics/downtime` | Pareto stoppage categories & financial impact | `List[DowntimeCategoryResponse]` |
| `GET` | `/api/v1/analytics/downtime/summary` | Complete downtime summary and trends | `DowntimeSummaryResponse` |
| `GET` | `/api/v1/analytics/reliability` | Fleet MTBF & MTTR rankings and metrics | `ReliabilityMetricsResponse` |
| `GET` | `/api/v1/analytics/recommendations` | Prioritized maintenance recommendations | `List[MaintenanceRecommendationResponse]` |
| `POST` | `/api/v1/analytics/simulate` | What-if simulation engine | `SimulationResponse` |

---

## 6. How to Run & Verify

### Running the Backend:
```bash
# From repository root
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
# Interactive OpenAPI Docs available at: http://127.0.0.1:8000/docs
```

### Running the Frontend:
```bash
cd frontend
npm run dev
# Dashboard accessible at: http://localhost:5173
```

### Running Automated Tests:
```bash
python -m pytest tests/test_analytics.py -v
```
All 19 test cases validate standard formulas, zero division handling, missing telemetry, negative inputs, recommendation prioritization, and API route contracts.
