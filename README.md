# ThermaShelter – Climate-Adaptive Passive Shelter Designer

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Backend-Python%203.12%20%7C%20FastAPI-blue.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Three.js-cyan.svg)](https://reactjs.org/)

**ThermaShelter** is a software-based thermal design and optimization platform inspired by the DRDO problem statement:
> *"Software Based Model Development for Design of Area Specific Shelter for Thermal Comfort Maintenance."*

The application combines a dynamic 24-hour lumped-parameter heat balance physics model, cold high-altitude climate datasets (Leh, Kargil, Drass, Nubra, Changthang), material thermal properties, multi-objective optimization, and an interactive 3D visualization frontend.

---

## 🌟 Key Product Modes & Features

### 1. MODE A – Analyze Existing Design
Simulates indoor temperature trajectories, solar radiation gains, envelope heat losses, and thermal comfort hours for user-specified shelter geometry, material layering, and infiltration rates.

### 2. MODE B – Smart Design Optimization (Main Feature)
Users specify high-level constraints without needing deep thermal engineering knowledge:
- **Location**: Leh, Kargil, Drass, Nubra, or Changthang
- **Purpose**: Agricultural, Livestock, Worker, Storage, Community, Emergency, or Custom
- **Required Floor Area**: e.g., 20–30 m²
- **Max Construction Budget**: e.g., ₹1,50,000
- **Available Local Materials**: Stone, Brick, Wood, Concrete, Mineral Wool, EPS, XPS, Mud/Adobe
- **Priority Objectives**: Max Comfort, Min Heat Loss, Lowest Cost, Max Solar Gain, or Balanced

The system automatically searches candidate designs and returns **Top 5 Pareto-efficient solutions** along with transparent **"Why This Design?"** technical explanations.

### 3. Interactive 3D Visualization
React Three Fiber procedural 3D model rendering shelter dimensions, wall material colors, gable roof vs flat slab, window glazing cutouts, door placement, and cardinal orientation compass (N, S, E, W).

### 4. What-If Sensitivity Perturbation
Live parameter slider allowing users to perturb insulation thickness and immediately observe indoor temperature, heat loss, and thermal score reactions.

### 5. Design Comparison Matrix
Side-by-side comparative table comparing Poorly Insulated, Conventional, and Optimized Passive shelters.

---

## 📐 Thermal Physics Model & Equations

The backend implements a dynamic stateful lumped-parameter heat-balance model. At every hourly timestep, net heat flow rate $Q_{net}$ (Watts) is calculated:

$$Q_{net} = Q_{solar,win} + Q_{solar,opaque} - (Q_{wall} + Q_{roof} + Q_{floor} + Q_{window} + Q_{door} + Q_{vent})$$

### Core Equations:
1. **Composite Wall/Roof U-Value**:
   $$R_{total} = R_{inside} + \sum \frac{d_i}{k_i} + R_{outside}, \quad U = \frac{1}{R_{total}}$$
2. **Conductive Heat Loss Rate**:
   $$Q_{cond} = U \cdot A \cdot (T_{inside} - T_{outside})$$
3. **Glazing Solar Heat Gain**:
   $$Q_{solar} = I_{solar} \cdot A_{win} \cdot \text{SHGC} \cdot \cos(\theta)$$
4. **Air Change Ventilation Loss**:
   $$Q_{vent} = \rho_{air} \cdot \dot{V} \cdot c_{p,air} \cdot (T_{inside} - T_{outside})$$
5. **State Update for Next Timestep**:
   $$T_{next} = T_{current} + \frac{Q_{net} \cdot \Delta t}{C_{eff}}$$

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, React Three Fiber (@react-three/fiber, three.js), Lucide React.
- **Backend**: Python 3.12, FastAPI, Pydantic v2, NumPy, SciPy, Optuna.
- **Testing**: Python unittest / Pytest API test client.

---

## 📁 Repository Structure

```text
thermashelter/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py              # FastAPI endpoints (/simulate, /optimize, /compare, etc.)
│   │   ├── data/
│   │   │   ├── materials.json         # 13 materials with thermal properties & costs
│   │   │   ├── locations.json         # Leh, Kargil, Drass, Nubra, Changthang
│   │   │   └── climate_data/          # Hourly temperature & solar radiation datasets
│   │   ├── models/
│   │   │   └── schemas.py             # Pydantic data schemas
│   │   ├── optimization/
│   │   │   └── optimizer.py           # Multi-objective candidate search & explanations
│   │   ├── thermal/
│   │   │   ├── geometry.py            # Cutout geometry & surface areas
│   │   │   ├── materials.py           # Composite U-values & assembly cost in INR
│   │   │   ├── solar.py               # Sol-air & glazing solar radiation incidence
│   │   │   ├── conduction.py          # Envelope heat transfer rates
│   │   │   ├── ventilation.py         # Air density altitude adjustment & ACH loss
│   │   │   ├── thermal_mass.py        # Effective heat capacity C_eff & state updates
│   │   │   ├── comfort.py             # Comfort hours (18°C-27°C) & performance score
│   │   │   └── simulator.py           # Dynamic 24h hourly simulation engine
│   │   └── main.py                    # FastAPI server entry point
│   ├── tests/
│   │   ├── test_geometry.py
│   │   ├── test_thermal.py
│   │   ├── test_simulation.py
│   │   ├── test_api.py
│   │   └── run_tests.py               # Standalone test runner (18 tests)
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/                # Recharts temperature, heat flow, & solar charts
│   │   │   ├── display/               # RecommendationCard, ExplanationPanel, MetricCard
│   │   │   ├── forms/                 # OptimizationForm, ShelterForm
│   │   │   ├── layout/                # Navbar, Footer
│   │   │   └── visualization/         # Shelter3D (React Three Fiber model)
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── AnalyzeDesign.tsx
│   │   │   ├── OptimizeDesign.tsx
│   │   │   ├── CompareDesigns.tsx
│   │   │   └── About.tsx
│   │   ├── services/
│   │   │   └── api.ts                 # Axios API client
│   │   ├── types/                     # TypeScript interfaces
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and `npm`
- Git

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run backend unit test suite
python tests/run_tests.py

# Launch FastAPI backend server (http://localhost:8000)
python -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite dev server (http://localhost:5173)
npm run dev
```

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/materials` | List materials with thermal properties & INR cost/m³ |
| `GET` | `/api/locations` | List supported cold high-altitude region profiles |
| `GET` | `/api/climate/{id}` | Get 24h hourly ambient climate & solar radiation |
| `POST` | `/api/simulate` | Run dynamic hourly heat balance simulation |
| `POST` | `/api/optimize` | Run multi-objective optimization & return Top 5 designs |
| `POST` | `/api/compare` | Compare thermal performance across multiple designs |
| `POST` | `/api/what-if` | Evaluate single-parameter perturbation sensitivity |
| `POST` | `/api/sensitivity` | Compute parameter sensitivity factors |

---

## ⚠️ Engineering Disclaimer

> **Prototype thermal simulation – engineering approximation, not a certified building-energy calculation.**
> This prototype is intended for design exploration, parametric study, and decision support. It does not replace detailed CFD envelope modeling, structural engineering calculations, or local building code compliance verification.
