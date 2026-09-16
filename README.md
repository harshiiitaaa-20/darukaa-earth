# Darukaa.Earth — Geospatial Carbon & Biodiversity Analytics Platform

![Darukaa.Earth Platform](https://img.shields.io/badge/Status-Production--Ready-emerald?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React_18.2-61DAFB?style=for-the-badge&logo=react)
![PostGIS](https://img.shields.io/badge/GIS-PostgreSQL_PostGIS-336791?style=for-the-badge&logo=postgresql)
![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions)

> **Darukaa.Earth** is an enterprise-grade geospatial analytics dashboard for managing, drawing, and visualizing carbon sequestration and biodiversity monitoring projects worldwide. Built for environmental administrators to map land sites as spatial polygons, track multi-year environmental indicators (NDVI, canopy cover, soil organic carbon, carbon stock in $\text{tCO}_2\text{e}$), and inspect time-series telemetry.

---

## 🏛️ High-Level System Architecture

```
                                  +-------------------------------------------------+
                                  |                 Browser (React SPA)             |
                                  |  - Mapbox GL / Leaflet (Polygon GIS Drawing)    |
                                  |  - Chart.js (Time-series Carbon & Biodiversity)  |
                                  |  - Axios API Client + Auth Context              |
                                  +-----------------------+-------------------------+
                                                          |
                                                          | HTTP REST API (JWT Bearer)
                                                          v
                                  +-------------------------------------------------+
                                  |                FastAPI Backend                  |
                                  |  - Auth & JWT Security Middleware               |
                                  |  - Project & Site CRUD Controllers              |
                                  |  - GeoJSON Geometry Validator & Shapely Engine  |
                                  |  - Time-series Telemetry Analytics Engine       |
                                  +-----------------------+-------------------------+
                                                          |
                                                          | GeoAlchemy2 / SQLAlchemy 2.0
                                                          v
                                  +-------------------------------------------------+
                                  |           PostgreSQL + PostGIS Database         |
                                  |  - Spatial Indexing (GiST)                      |
                                  |  - GEOMETRY(Polygon, 4326)                      |
                                  |  - Users, Projects, Sites, Metrics Tables       |
                                  +-------------------------------------------------+
```

---

## 🗄️ Database Schema Breakdown (PostGIS Ready)

The database utilizes PostgreSQL with the **PostGIS** spatial extension enabled for standard OGC spatial polygon storage (`GEOMETRY(Polygon, 4326)`) and GiST spatial bounding box indexing.

```sql
-- Enable PostGIS Spatial Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Projects Table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(100) NOT NULL, -- Reforestation, Blue Carbon, Avoided Deforestation, Peatland
    country VARCHAR(100) NOT NULL,
    target_carbon_offset FLOAT NOT NULL DEFAULT 0.0, -- Target offset in tCO2e
    status VARCHAR(50) DEFAULT 'active',
    created_by_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sites Table (Spatial Polygon Boundaries in EPSG:4326 WGS 84)
CREATE TABLE sites (
    id SERIAL PRIMARY KEY,
    project_id INT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    area_hectares FLOAT NOT NULL,
    geometry GEOMETRY(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial B-Tree / GiST Index for fast spatial bounding box lookups
CREATE INDEX idx_sites_geometry ON sites USING GIST(geometry);

-- 4. Site Metrics Table (Multi-Year Environmental Indicator Telemetry)
CREATE TABLE site_metrics (
    id SERIAL PRIMARY KEY,
    site_id INT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    recorded_at DATE NOT NULL,
    ndvi FLOAT NOT NULL,                  -- Vegetation Health Index (0.0 to 1.0)
    canopy_cover_pct FLOAT NOT NULL,      -- Tree Canopy Cover % (0% to 100%)
    carbon_sequestered_tco2 FLOAT NOT,    -- Carbon stock (tCO2e / ha)
    soil_organic_carbon FLOAT NOT,        -- Soil Organic Carbon (tonnes C / ha)
    biodiversity_index FLOAT NOT NULL     -- Species & Ecosystem Health Index (1.0 to 10.0)
);

CREATE INDEX idx_site_metrics_site_date ON site_metrics(site_id, recorded_at DESC);
```

---

## 🛠️ Technology Stack & Justification

| Layer | Technology | Key Rationale & Architectural Trade-offs |
| :--- | :--- | :--- |
| **Backend** | **Python + FastAPI** | Chosen over Flask/Django for high-performance ASGI non-blocking execution, automatic OpenAPI/Swagger interactive UI (`/docs`), Pydantic GeoJSON polygon validation, and seamless spatial query handling. |
| **GIS / Mapping** | **Mapbox GL JS + Leaflet** | Vector polygon drawing canvas, centroid spatial scaling, WGS84 Mercator latitude distortion correction for real-time area calculation (Hectares), and styled tile layers. |
| **Visualization** | **Chart.js + react-chartjs-2** | Canvas rendering for multi-axis environmental indicators (NDVI vs Canopy vs Carbon vs Biodiversity) with gradient fills, timeframe filters (1Y, 3Y, 5Y, ALL), and tooltips. |
| **Database** | **PostgreSQL + PostGIS** | Spatial polygon indexing (`GiST`), `ST_Area` calculation, and GeoJSON feature collection serialization. |
| **Auth** | **JWT + Direct Bcrypt** | Stateless Bearer token security header with salted password hashing. |

---

## 🚀 Local Setup & Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- PostgreSQL + PostGIS (or Docker)

### Option A: Running with Docker Compose (Zero Config)

```bash
# Clone the repository
git clone https://github.com/your-username/darukaa-earth.git
cd darukaa-earth

# Launch PostGIS database, FastAPI backend, and React frontend
docker-compose up --build
```

- **Frontend**: `http://localhost:3000`
- **Backend API Docs**: `http://localhost:8000/docs`

---

### Option B: Running Locally

#### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
# Activate on Windows:
venv\Scripts\activate
# Activate on Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install email-validator

# Run Pytest suite
python -m pytest -v

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 CI/CD Pipeline & Automated Quality Checks

This repository enforces strict code quality standards before every commit and on every GitHub `push` or `pull_request`.

```
                  +--------------------------------------------------+
                  |               Developer Git Commit               |
                  +------------------------+-------------------------+
                                           |
                                           v
                  +--------------------------------------------------+
                  |  Husky Pre-Commit Hook + lint-staged             |
                  |  - Frontend: ESLint + Prettier format              |
                  |  - Backend: Ruff lint check                      |
                  +------------------------+-------------------------+
                                           |
                                           v
                  +--------------------------------------------------+
                  |         GitHub Actions Workflow (.github/ci.yml) |
                  |  - Job 1: Run Pytest Suite + PostGIS container   |
                  |  - Job 2: Run ESLint & Vite production build     |
                  +--------------------------------------------------+
```

### 1. Pre-Commit Hooks (Husky + lint-staged)
Before code is committed, Husky triggers `lint-staged` configured in `lint-staged.config.js`:
- Formats frontend JS/JSX/CSS code with **Prettier**.
- Lints frontend React rules with **ESLint**.
- Checks Python syntax with **Ruff**.

### 2. GitHub Actions Automated Pipeline (`.github/workflows/ci.yml`)
On every push to `main` or pull request:
- Spins up an Ubuntu runner with a **PostGIS 15** service container.
- Installs Python dependencies and runs the complete **Pytest test suite** (`test_auth.py`, `test_projects.py`, `test_sites.py`, `test_analytics.py`).
- Runs **ESLint** and validates the React production bundle (`npm run build`).

---

## 🔑 Demo Login Credentials

The database auto-seeds on initial launch with demo projects in Costa Rica, Indonesia, and Scotland:

- **Email**: `admin@darukaa.earth`
- **Password**: `Admin123!`

---

## 📄 Evaluator Repository Access Instructions

If the repository is private, access has been granted to the hiring team:
- `ankita.dasgupta@darukaa.com`
- `harsh.kumar@darukaa.com`
- `utkarsh.gauniyal@darukaa.com`
- `guneet.mutreja@darukaa.com`
