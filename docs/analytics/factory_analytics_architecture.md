# PredictX Factory Analytics & Decision Intelligence Specification

This document provides architectural and technical documentation for the **Factory Analytics & Decision Intelligence** module (Member 4 - Ankitha).

## Architecture Highlights
- **Isolated Business Logic:** All OEE, downtime, MTBF, MTTR, simulation, and recommendation computations reside in `analytics/`.
- **FastAPI Endpoint Layer:** `backend/app/api/v1/analytics.py` maps REST HTTP requests to the `analytics_service.py` bridge.
- **Data Source Agnostic:** Interacts seamlessly with MongoDB collections or the bundled deterministic synthetic dataset generator.
- **Frontend Dashboard Integration:** Integrated into `frontend/src/pages/FactoryAnalytics.tsx` with live REST fetching and offline mock fallbacks.

## Key Formulas
- **OEE = Availability × Performance × Quality**
- **Availability = Operating Time / Planned Production Time**
- **Performance = (Ideal Cycle Time × Total Units Produced) / Operating Time**
- **Quality = Good Units Produced / Total Units Produced**
- **MTBF = Total Operating Time / Number of Failures**
- **MTTR = Total Repair Time / Number of Repairs**

## Test Verification
Run: `python -m pytest tests/test_analytics.py -v` (19 automated tests passing).
