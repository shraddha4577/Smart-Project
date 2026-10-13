# 🌍 ECOTWIN: Smart Waste Management Digital Twin

> **College Capstone Project** | *IoT Sensor Telemetry, OpenCV/YOLO Waste Segregation, Interactive 3D Digital Twin, Leaflet GIS, Recharts, and Generative AI with Rule-Based Fallback*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![OpenCV](https://img.shields.io/badge/Computer%20Vision-OpenCV%205.0-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org)
[![SQLite](https://img.shields.io/badge/Database-SQLite%203-003B57?logo=sqlite&logoColor=white)](https://sqlite.org)
[![Tests](https://img.shields.io/badge/Tests-17%2F17%20Passed-10B981?logo=pytest&logoColor=white)](file:///e:/new/backend/tests/test_api.py)

---

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [Key Features](#-key-features)
4. [User & Admin Application Flows](#-user--admin-application-flows)
5. [Pre-Seeded Credentials](#-pre-seeded-credentials)
6. [Tech Stack](#-tech-stack)
7. [Quick Start & Setup Instructions](#-quick-start--setup-instructions)
8. [Automated Test Execution Results](#-automated-test-execution-results)
9. [Digital Twin & IoT Physics Engine](#-digital-twin--iot-physics-engine)
10. [AI Computer Vision (OpenCV & YOLO)](#-ai-computer-vision-opencv--yolo)
11. [AI Recommendations & Fallback Engine](#-ai-recommendations--fallback-engine)
12. [Two-Week Student Team Demonstration Guide](#-two-week-student-team-demonstration-guide)
13. [Known Limitations & Future Scope](#-known-limitations--future-scope)

---

## 🚀 Project Overview

**ECOTWIN** is a full-stack, cyber-physical digital twin designed for modern university campuses and smart municipal zones. It bridges physical waste receptacles with cloud telemetry, computer vision classification, dynamic collection fleet routing, and interactive digital twin actuation.

### Why Digital Twin for Smart Waste?
Traditional smart bins only transmit periodic battery and ultrasonic fill percentages. **ECOTWIN** builds a real-time software twin reflecting:
- Multi-sensor state estimation (Ultrasonic depth, DHT22 temperature/humidity, MQ-135 odor PPM, battery voltage, and lid orientation).
- Dynamic waste accumulation velocity (`%/hr`) with predictive time-to-overflow calculations.
- Bidirectional actuation: Facilities teams can remotely inspect container physics or simulate emptying events.
- Fuel and carbon emission savings through Greedy Traveling Salesperson (TSP) dynamic route optimization.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph IoT_Sensors ["📡 Cyber-Physical Node (Virtual Smart Bins)"]
        S1["HC-SR04 Ultrasonic Sensor"]
        S2["DHT22 Temp & Humidity"]
        S3["MQ-135 Odor / Gas Sensor"]
        S4["NB-IoT Gateway Node"]
    end

    subgraph Backend_FastAPI ["⚙️ Python FastAPI Backend (Port 8000)"]
        Engine["IoT Telemetry Simulation Worker (8s tick)"]
        DB[(SQLite Database smart_waste.db)]
        CV["OpenCV Contour & Color Texture Engine"]
        AI_Advisor["Heuristic TSP Router & AI Copilot"]
        REST["REST API Endpoints (/api/*)"]
    end

    subgraph Frontend_React ["💻 React 18 + Vite (Port 5173)"]
        UI_Nav["Dark Navy Dashboard UI"]
        Map["Leaflet GIS Campus Map (8 Bins)"]
        Twin["3D/Isometric Digital Twin Model"]
        Charts["Recharts Historical Time-Series"]
        Scan["AI Waste Image Classification"]
    end

    IoT_Sensors --> Engine
    Engine --> DB
    DB --> REST
    CV --> REST
    AI_Advisor --> REST
    REST <-->|Vite Proxy /api| Frontend_React
```

---

## ✨ Key Features

1. **Cyber-Physical Digital Twin Visualizer**:
   - Real-time animated container model with fluid level rendering and surface waves.
   - Headroom echo distance in centimeters (`95cm` container height).
   - Live sensor cluster: Internal Temperature, Humidity, Odor gas index (PPM), and Battery health.
   - Predictive time-to-full calculation (`hours_remaining = (100 - fill) / fill_rate`).
   - Interactive evaluation controls: Presenters can slide the ultrasonic fill level, toggle lid angle, or spike odor.

2. **Interactive Campus GIS Map (Leaflet)**:
   - 8 virtual campus nodes spread across Academic, Cafeteria, Hostel, Research Park, Sports Arena, and Admin zones.
   - Custom SVG pulsing markers color-coded by status:
     - 🟢 **Normal**: `< 70%` fill
     - 🟡 **Warning**: `70% - 89%` fill
     - 🔴 **Critical**: `≥ 90%` fill (with pulsing radar wave)
   - Interactive popups with live sensor values and 1-click "Digital Twin" and "Empty" actuation.

3. **AI Computer Vision Waste Segregation**:
   - Accepts image uploads via file picker or drag-and-drop.
   - Includes **5 instant evaluation presets** (Plastic Bottle, Organic Apple Peel, Cardboard Box, Aluminum Can, PCB Motherboard) for 1-click demonstration without external files.
   - Runs OpenCV contour segmentation, edge density analysis, and color histograms.
   - Renders bounding boxes directly on the image with confidence scores and actionable segregation guides.
   - **Clearly labeled Demo Mode Badge**: Reports `"OpenCV Contour & Color Analysis (Demo Fallback)"` when weights are absent and automatically switches to `"YOLOv8 Active"` when custom weights are provided.

4. **Dynamic Fleet Routing & AI Copilot**:
   - Greedy Nearest-Neighbor Traveling Salesperson (TSP) route optimization.
   - Queues only bins crossing warning thresholds, calculating fuel savings (up to 45%).
   - Campus Sustainability Assistant: Responds to student queries regarding e-waste, hazardous batteries, and sensor interpretation with instant rule-based fallback or Gemini GenAI.

5. **Role-Based Flows & Operational Center**:
   - **Admin flow**: Fleet KPIs, bin CRUD, vision inference, digital twin, route planning, alert dispatching, reports, and configurable thresholds.
   - **Student flow**: Campus cleanliness index, bin locator, personal eco-points (leaderboard), AI waste scanner, and litter reporting.

---

## 👥 User & Admin Application Flows

### 1. User Flow (Student / Campus Member)
$$\text{Open Website} \longrightarrow \text{Login} \longrightarrow \text{Student Dashboard} \longrightarrow \text{Select Feature} \longrightarrow \text{Reports \& Analytics} \longrightarrow \text{Logout}$$

- **Dashboard**: View campus eco score (`88/100`), nearby bin map preview, and eco-points badge.
- **Select Feature**:
  - *Find Smart Bins*: Fullscreen Leaflet map locator.
  - *AI Waste Scanner*: Scan litter to check recyclable suitability.
  - *Report Overflow*: Submit rapid alert to campus facilities.
  - *Eco Leaderboard*: Department sustainability standings.
- **Reports & Analytics**: Campus waste diverted charts and historical volume breakdown.

### 2. Admin Flow (Facilities & Environmental Officer)
$$\text{Admin Login} \longrightarrow \text{Admin Dashboard} \longrightarrow \text{Manage Waste Data} \longrightarrow \text{AI Detection} \longrightarrow \text{Digital Twin} \longrightarrow \text{AI Recommendations} \longrightarrow \text{Collection Management} \longrightarrow \text{Reports} \longrightarrow \text{System Settings}$$

- **Manage Waste Data**: Add, edit, delete, or empty smart bin nodes.
- **AI Detection**: Evaluate computer vision segregation model with bounding boxes.
- **Digital Twin**: Inspect ultrasonic depth and override sensor values.
- **AI Recommendations**: Review TSP optimized collection paths and predictive warnings.
- **Collection Management**: Assign drivers (`Driver Kumar`, `Driver Sarah`, `EV-Van #4`), resolve alerts.
- **Reports**: View Recharts area/donut charts and export official CSV telemetry.
- **System Settings**: Adjust Warning (`70%`) and Critical (`90%`) thresholds and simulation update speeds.

---

## 🔑 Pre-Seeded Credentials

| Role | Username | Password | Full Name | Department / Access Level |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `admin123` | Dr. Evelyn Reed | Facilities & Environmental Services (Full Admin) |
| **Student User** | `student` | `user123` | Alex Rivera | Campus Green Council / Student Portal |

> *Tip: The login portal includes **1-Click Quick Demo Login Buttons** for instant evaluation.*

---

## 💻 Tech Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React + Vite | React 18, Vite 8 | Fast reactive single-page application |
| **Styling** | Tailwind CSS | 3.4.17 | Custom Dark Navy (`#060a14`) theme with neon accents |
| **Mapping & GIS** | Leaflet + React-Leaflet | 1.9.4 | Interactive campus map with custom status markers |
| **Data Visualization** | Recharts | 2.15 | 24-hour telemetry area charts, donut composition, bar comparisons |
| **Icons** | Lucide React | 1.16 | Cohesive iconography |
| **Backend Framework** | Python FastAPI | 0.143 | Async REST API engine, CORS middleware, lifespan worker |
| **Web Server** | Uvicorn | 0.54 | High-performance ASGI server |
| **Database** | SQLite + SQLAlchemy | SQLAlchemy 2.1 | Embedded relational storage with foreign key relationships |
| **Computer Vision** | OpenCV + NumPy | OpenCV 5.0 | Contour segmentation, color histograms, bounding boxes |
| **Validation** | Pydantic V2 | 2.14 | Strict type validation and OpenAPI schema serialization |
| **Automated Testing** | Pytest + Httpx | Pytest 9.1 | End-to-end integration test suite |

---

## 🛠️ Quick Start & Setup Instructions

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on `v24.18.0`)
- Python `3.10+` or `3.12+` (Tested on `Python 3.12.9`)

---

### Option A: 1-Click Launch (Recommended for Windows)

Double-click `start_all.bat` in the root folder, or execute from PowerShell:
```powershell
.\start_all.bat
```
This automatically launches the FastAPI backend on port `8000`, the React frontend on port `5173`, and opens `http://localhost:5173` in your default browser.

---

### Option B: Step-by-Step Manual Launch

#### 1. Backend Setup
```powershell
# Navigate to backend directory
cd backend

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests to verify setup
pytest -v

# Start FastAPI server
python main.py
```
Backend will be live at:
- **API Root**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Alternative Redoc**: `http://localhost:8000/redoc`

#### 2. Frontend Setup
In a separate terminal window:
```powershell
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
Frontend will be live at:
- **Application URL**: `http://localhost:5173`

---

## 🧪 Automated Test Execution Results

All 17 automated integration tests run via `pytest` and execute real HTTP client calls against database models, simulation triggers, computer vision pipelines, and recommendation algorithms.

### Execution Log
```
============================= test session starts =============================
platform win32 -- Python 3.12.9, pytest-9.1.1, pluggy-1.6.0 -- E:\new\backend\venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: E:\new\backend
configfile: pytest.ini
testpaths: tests
plugins: anyio-4.15.1, asyncio-1.4.0
collecting ... collected 17 items

tests/test_api.py::test_health_check PASSED                              [  5%]
tests/test_api.py::test_auth_login_admin PASSED                          [ 11%]
tests/test_api.py::test_auth_login_student PASSED                        [ 17%]
tests/test_api.py::test_auth_login_failure PASSED                        [ 23%]
tests/test_api.py::test_get_bins_count PASSED                            [ 29%]
tests/test_api.py::test_get_bin_detail PASSED                            [ 35%]
tests/test_api.py::test_bin_telemetry_history PASSED                     [ 41%]
tests/test_api.py::test_simulation_tick PASSED                           [ 47%]
tests/test_api.py::test_empty_bin PASSED                                 [ 52%]
tests/test_api.py::test_spike_bin_fill PASSED                            [ 58%]
tests/test_api.py::test_vision_classification PASSED                     [ 64%]
tests/test_api.py::test_ai_recommendations PASSED                        [ 70%]
tests/test_api.py::test_ai_chat_assistant PASSED                         [ 76%]
tests/test_api.py::test_collections_and_dispatch PASSED                  [ 82%]
tests/test_api.py::test_reports_stats PASSED                             [ 88%]
tests/test_api.py::test_reports_csv PASSED                               [ 94%]
tests/test_api.py::test_settings_get_and_update PASSED                   [100%]

======================= 17 passed in 1.10s =======================
```

To re-run tests anytime:
```powershell
.\run_tests.bat
```

---

## 🛰️ Digital Twin & IoT Physics Engine

The backend simulation engine (`simulator.py`) runs a non-blocking asynchronous worker every 8 seconds, simulating roughly 10 minutes of waste accumulation per cycle.

### Physical Equations & Telemetry Logic:
1. **Fill Level Dynamics**:
   $$\text{Fill}_{t+1} = \min\left(100.0, \, \text{Fill}_t + \left(\frac{\text{Rate}}{6}\right) \times \text{Multiplier} \times \mathcal{U}(0.7, 1.3)\right)$$
2. **Ultrasonic Depth Echo**:
   $$\text{Headroom (cm)} = \text{Container Height (95 cm)} - \left(\frac{\text{Fill \%}}{100} \times 95\right)$$
3. **Decomposition & Air Quality Index (MQ-135)**:
   $$\text{Odor (PPM)} = 5.0 + \left(\frac{\text{Fill}}{100} \times \text{Factor}_{\text{organic}} \times 35.0\right) + \mathcal{N}(0, 1)$$
   *When organic waste exceeds 70% fill and temperature crosses 30°C, the odor index spikes to simulate decomposition, triggering warning advisories.*
4. **Automated Alert Generation**:
   Whenever a container crosses the **Critical Threshold** (`≥90%`), an automated `CollectionAlert` is inserted into the queue, alerting dispatchers.

---

## 👁️ AI Computer Vision (OpenCV & YOLO)

### Genuine Inference Architecture:
The system supports dual inference:
1. **YOLOv8 Object Detection**:
   Checks for trained weights at `backend/weights/yolov8n.pt`. If present and `ultralytics` is installed, runs standard YOLO bounding box detection.
2. **OpenCV Contour & Color Analysis (Demo Fallback)**:
   If weights are not present, the system runs an authentic computer vision pipeline:
   - Converts image to BGR and HSV color spaces.
   - Applies Gaussian blur, Canny edge detection, and dilation.
   - Extracts bounding contours around waste objects.
   - Evaluates chromatic masks: green/brown for organic items, cyan/blue for polymers, edge density for corrugated packaging.
   - Draws labeled bounding boxes on the image in OpenCV.
   - Clearly labels `[DEMO MODE] OpenCV Contour & Color Analysis active. Rule-based CV fallback`.

---

## 🤖 AI Recommendations & Fallback Engine

- **Dynamic TSP Routing**: Uses a greedy nearest-neighbor algorithm from the Campus Central Depot (`12.9716, 77.5946`) through all bins exceeding the warning threshold.
- **Generative AI Integration**: If `GEMINI_API_KEY` is set in `backend/.env`, calls Google Gemini Flash for campus optimization summaries.
- **Rule-Based Fallback**: If no key is set or the user is offline, the rule-based engine generates time-to-full forecasts, odor outbreak alerts, and responds to user queries through the sustainability copilot.

---

## 🎓 Two-Week Student Team Demonstration Guide

For a team of 3–4 students presenting to professors and evaluators:

### Role Breakdown
- **Student 1 (Presenter / System Architect)**: Introduces the Digital Twin concept, explains the dark navy UI, and walks through the architecture diagram.
- **Student 2 (IoT & Digital Twin Lead)**: Demonstrates the Leaflet campus map, opens the Digital Twin node, demonstrates live ultrasonic depth, and uses the slider to spike fill level to 96%.
- **Student 3 (AI & Computer Vision Specialist)**: Shows the AI Detection view, clicks the quick presets (e.g. Plastic Bottle, Organic Peel), explains OpenCV contour bounding boxes, and points out the honest Demo Mode badge.
- **Student 4 (Operations & Analytics Lead)**: Demonstrates dynamic TSP route dispatching, driver assignments, Recharts historical trends, and downloads the official CSV report.

### Step-by-Step Presentation Script (5–7 Minutes)
1. **Introduction**: Open `http://localhost:5173`. Click **Admin Login**.
2. **Dashboard Overview**: Highlight the 5 KPI cards (8 monitored bins, critical bins, 365 kg collected).
3. **Interactive Campus Map**: Click on **BIN-CAMPUS-02 (Cafeteria)** to show the popup with 95% fill and high odor. Click **"Digital Twin"**.
4. **Digital Twin Actuation**:
   - Point out the ultrasonic distance echo (`cm`), DHT22 temperature, and MQ-135 odor PPM.
   - Drag the fill override slider to 98%—watch the liquid height animate and status flip to CRITICAL.
   - Click **"Actuate Collection (Empty 0%)"**—watch the container empty in real time.
5. **AI Waste Segregation**:
   - Navigate to **AI Detection**.
   - Click the **"🥤 Plastic Bottle"** sample preset.
   - Point out the OpenCV bounding box drawn around the container, 91% confidence, and Recyclable tag.
6. **Fleet Route Optimization**:
   - Navigate to **AI Recommendations**.
   - Explain how TSP nearest-neighbor ordering visits only bins needing collection, saving ~38% fuel.
   - Type in the Copilot: *"Where do I throw lithium batteries?"*—show the instant guidance.
7. **Reports & Audit**:
   - Navigate to **Reports & Analytics**.
   - Review the diurnal 24-hour waste curve and category donut chart.
   - Click **"Export CSV Telemetry Report"** to download the CSV report.

---

## ⚠️ Known Limitations & Future Scope

### Known Limitations
- **Camera Access**: In local headless development environments without webcams, file upload and sample presets are recommended.
- **YOLO Weights**: By default, the application runs on the built-in OpenCV Contour & Color pipeline with clearly labelled Demo Mode to ensure 100% offline functionality without requiring large 50MB+ weight downloads.

### Future Scope
- Hardware deployment with ESP32 microcontrollers over MQTT / LoRaWAN.
- Real-time driver navigation integration with OpenStreetMap routing directions.
- Edge TPU acceleration (Coral / Raspberry Pi) mounted directly onto physical truck hoppers.

---

### Project Credits
- **Course**: Final Year Engineering Capstone Project
- **Project**: ECOTWIN - Smart Waste Management Digital Twin
- **Frameworks**: React, Vite, Tailwind CSS, FastAPI, OpenCV, Leaflet, Recharts
