# MandiFlow Orchestrator — Capacity-Aware Smart Agricultural Procurement

> **Smart India Hackathon (SIH) 2026**  
> **Problem Statement ID:** 26032  
> **Problem Statement Title:** Farmer Procurement Delays & Uncertainty  
> **Theme:** Smart Automation  
> **Category:** Software  
> **Team Name:** NUVEXA  

---

## 📌 Executive Summary

Agricultural procurement centers (APMC Mandis and FCI/State Civil Supplies depots) across India face severe seasonal congestion during peak harvest arrivals (Rabi and Kharif marketing seasons). Farmers frequently experience **waiting times of 12 to 48 hours**, queue unpredictability, lack of real-time visibility into yard capacities, and distress selling.

**MandiFlow Orchestrator** is an intelligent, capacity-aware procurement management platform that eliminates bottlenecks by aligning farm produce arrivals with the real-time processing capacity of procurement centers across **Assaying, Weighbridges, and Unloading bays**.

---

## 🎯 Key Innovations & Capabilities

### 1. ⚙️ Capacity-Aware Dynamic Scheduling
- Evaluates real-time processing rates across:
  - **Quality Assaying Labs:** Number of active testers & moisture analysis speed (~12 min/sample).
  - **Weighbridges:** Gross and tare weighbridges availability (~8 min/vehicle).
  - **Unloading Bays:** Labor/Hamali workforce and godown stacking space.
  - **Storage & Off-take:** Warehouse occupancy and FCI rail rake / transport clearance.
- Dynamically calculates the optimal hourly slot allocation using:
  $$\text{Slot Capacity} = \min(\text{Assaying Rate}, \text{Weighbridge Rate}, \text{Unloading Rate})$$
- Generates **AI-recommended optimal slots** during low-congestion windows, reducing average turnaround time by up to 75%.

### 2. 🎫 Contactless Digital Token & Virtual Queue
- Issues dynamic digital tokens (e.g. `MF-2026-4821`) encoded into high-density **SVG QR codes**.
- Eliminates physical queueing; farmers can monitor live yard position (`# in line`) and dynamically calibrated ETAs from their smartphones or local village centers.
- Features real-time queue boards with status filtering (**At Gate**, **Assaying**, **Weighing**, **Unloading**, **Waiting**).

### 3. 📞 Interactive Voice Response (IVR) Helpline (`1800-MANDI`)
- **Direct Accessibility for Non-Smartphone Users (Slide 2 & 4):**
  - Farmers without smartphones or internet access can access all core features via phone calls.
  - Features an interactive feature-phone dialer with speech synthesis (Web Speech API / TTS):
    - **Press 1:** Capacity-Aware Slot Booking & Recommendation
    - **Press 2:** Digital Token & QR Details
    - **Press 3:** Real-Time Queue Position & Estimated Wait Time
    - **Press 4:** Procurement & DBT Payment Status
    - **Press 9:** Instant SMS Summary to farmer's mobile
    - **Press \*:** Instant Language Switch (English / हिन्दी / ਪੰਜਾਬੀ)
    - **Press 0:** Direct transfer to Mandi Duty Officer

### 4. ⚡ Dynamic Exception Management Engine
Self-healing algorithms dynamically resolve real-world edge cases without disrupting punctual farmers:
- **Late Arrivals:** Automatically reallocates farmers to buffer time lanes based on remaining capacity without halting punctual arrivals.
- **Unregistered Walk-ins:** Automatically detects capacity slack and issues emergency off-peak tokens (`MF-WALK-XXX`).
- **No-Show Expiry:** Automatically releases slots after a 15-minute grace period, advancing the waitlist and notifying subsequent farmers.
- **Equipment Breakdowns:** Dynamically re-routes inbound traffic when a weighbridge or assaying station undergoes maintenance.

### 5. 🚪 5-Stage Gate-to-Unloading Procurement Lifecycle
An interactive walkthrough covering every physical stage of procurement:
1. **Gate Entry Verification:** QR scanner verification and vehicle plate check.
2. **Quality Assaying Lab:** Interactive moisture meter (9% to 18%) and grain impurity testing with automated grading (**FAQ Grade A**, **Grade B**, **Under-Grade**).
3. **Digital Weighbridge:** Gross weight minus Tare weight computation to capture net produce.
4. **MSP Procurement Settlement:** Applies official Government Minimum Support Price (MSP 2026 rates) for 8 crops (Wheat, Paddy, Soybean, Maize, Gram, Mustard, Cotton, Sugarcane) with transparent grade bonuses/deductions.
5. **Unloading & Storage:** Dynamic bay assignment and stacking lot tracking.

### 6. 💰 Direct Benefit Transfer (DBT) & Form J (e-Bilti) Receipt
- Real-time tracking of Direct Benefit Transfer (DBT) payments routed via **PFMS** (Public Financial Management System) into Aadhaar-linked bank accounts.
- Generates an **official printable Mandi Form J [Rule 24(1)] Sale Slip / e-Bilti** complete with government seal, barcode, digital verification QR code, and signatures.

### 7. 📶 Poor Connectivity & SMS Fallback (Slide 4)
- **Offline / Low-Bandwidth Mode:** Enables transactions to be cached locally in `localStorage` / `IndexedDB` when network coverage drops in rural areas.
- Automatically synchronizes with central servers upon network restoration.
- Integrated **SMS Fallback Simulator** demonstrating real SMS alerts sent to basic feature phones.

---

## 🛠️ Technical Architecture

| Layer | Technologies & Protocols |
|---|---|
| **User Interfaces** | Responsive HTML5, Modern CSS Design System, Vanilla JS SPA, Feature-Phone Mockup |
| **Speech & Audio** | Web Speech Synthesis API (`hi-IN`, `en-IN`), Interactive Tone Synthesizer |
| **Backend & APIs** | RESTful Architecture, Express.js / Node.js, JSON-RPC Webhooks |
| **Data & Storage** | PostgreSQL / MySQL Relational Schema with ACID booking locks, LocalStorage cache |
| **Integration Protocols** | e-NAM API standard, PFMS DBT Gateway, AGMARKNET Price Feed, SMS Gateway |

---

## 📂 Project Structure

```
-MandiFlow-main/
│
├── server.js                            # Node.js + Express REST API Backend Server
├── package.json                         # Node dependencies & start scripts
├── test-api.js                          # Automated test suite for all 10 REST endpoints
├── index.html                           # Complete SPA with all SIH 2026 interactive modules
├── styles.css                           # Design system (Agricultural Green & Gold Theme, responsive)
├── app.js                              # Application state machine, IVR engine, Exception logic, QR gen
├── README.md                            # Comprehensive project documentation
└── SIH2026 - TEAM - NUVEXA (1) (1).pdf  # SIH 2026 Official Idea Submission Presentation
```

---

## 🚀 Getting Started

### Option 1: Full-Stack Mode (Node.js + Express Backend) — Recommended
Run the complete Node.js backend server with REST APIs and live static file serving:

```bash
# 1. Install dependencies (Express & CORS)
npm install

# 2. Start the backend API server (runs on port 3000)
npm start
# or: node server.js

# 3. (Optional) Run automated API test suite
node test-api.js
```
Then visit **`http://localhost:3000`** in your browser. All frontend actions communicate with live backend REST endpoints.

### Option 2: Direct Client-Side / Standalone Mode
No dependencies required. The application gracefully runs client-side with offline resilience:
- Double-click `index.html` or open in any web browser.
- Or run `python -m http.server 8000` and visit `http://localhost:8000`.

---

## 🧪 Interactive Evaluator Demonstration Guide

When presenting to evaluators or testing the system, follow this guided flow:

1. **Test Omnichannel IVR Voice Helpline:**
   - Click **"📞 IVR Helpline"** in the top navigation or hero banner.
   - Click **Call** to hear the automated voice prompt.
   - Press **1** (Optimal Slot), **2** (Token info), **3** (Queue position), **4** (Payment status), **9** (SMS dispatch).
   - Switch language on-the-fly by pressing `*`.

2. **Simulate Dynamic Exceptions:**
   - Scroll to **Dynamic Exception Engine** (or click the hero pill **"⚡ Test Dynamic Exceptions"**).
   - Click **"🕐 Test Late Arrival"** to watch the scheduler auto-reassign buffer lanes.
   - Click **"🚶 Test Walk-in Farmer"** to see capacity slack allocated to emergency tokens.
   - Click **"❌ Trigger No-Show Timeout"** to see expired slots auto-released and queue advanced.
   - Click **"⚠️ Trigger Weighbridge Fault"** to see real-time lane diversion.

3. **Step Through 5-Stage Yard Processing:**
   - In the **Gate Entry & Processing Stages** section, click **"▶️ Advance to Next Stage"** or **"⚡ Fast-Forward Full Journey"**.
   - Move the **Moisture %** slider to watch grade and price recalculations live!

4. **View Official Mandi Form J Receipt:**
   - In the Payment section, click **"📄 View & Print Official Mandi J-Form Receipt"**.
   - View the government seal, crop weighment breakdown, DBT bank transfer status, and printable e-Bilti layout.

5. **Test Offline / Low-Bandwidth Resilience:**
   - Click the **"Online"** button in the navbar to toggle **Offline Mode**.
   - Notice the top alert bar and simulated local caching with SMS fallback notification.

---

## 📚 References & Government Alignments

1. **e-NAM (National Agriculture Market):** Unified national trading portal (`https://play.google.com/store/apps/details?id=in.gov.enam`)
2. **E-Samridhi:** NAFED pulses and oilseeds procurement initiative (`https://esamridhi.in`)
3. **Department of Food & Public Distribution (DFPD) / FCI:** Decentralized procurement operations (`https://dfpd.gov.in`)
4. **AGMARKNET:** Agricultural Marketing Information Network (`https://agmarknet.gov.in`)
5. **Tribune India Research:** Analysis of mandi technical glitches and waiting queue bottlenecks.

---

*Developed by **Team NUVEXA** for **Smart India Hackathon 2026**.*
