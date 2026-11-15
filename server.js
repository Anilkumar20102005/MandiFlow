/* ═══════════════════════════════════════════════
   MandiFlow Orchestrator — Backend API Server
   Smart India Hackathon 2026 | PS ID: 26032
   Team: NUVEXA
   Tech Stack: Node.js + Express.js + REST APIs
   ═══════════════════════════════════════════════ */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files (index.html, app.js, styles.css)
app.use(express.static(path.join(__dirname)));

/* ───── In-Memory Relational Data Store ───── */
const db = {
    metadata: {
        system: "MandiFlow Orchestrator",
        sih_year: 2026,
        problem_statement_id: 26032,
        problem_title: "Farmer Procurement Delays & Uncertainty",
        team_name: "NUVEXA",
        status: "Operational"
    },
    farmer: {
        name: "Ramesh Kumar",
        phone: "+91 98765 43210",
        aadhaar: "4521 8839 1204",
        landRecord: "Khasra #142/2A (4.5 Acres)",
        village: "Sanwer",
        district: "Indore",
        mandi: "Krishi Upaj Mandi, Indore",
        bankAcc: "SBI ****4523",
        bankIfsc: "SBIN0001234",
        bankName: "State Bank of India"
    },
    mspRates: {
        wheat: { name: "Wheat (गेहूं)", rate: 2275 },
        rice: { name: "Rice / Paddy (चावल)", rate: 2300 },
        soybean: { name: "Soybean (सोयाबीन)", rate: 4892 },
        maize: { name: "Maize (मक्का)", rate: 2090 },
        gram: { name: "Gram (चना)", rate: 5440 },
        mustard: { name: "Mustard (सरसों)", rate: 5650 },
        cotton: { name: "Cotton (कपास)", rate: 7121 },
        sugarcane: { name: "Sugarcane (गन्ना)", rate: 315 }
    },
    capacities: {
        inflowMultiplier: 1.0,
        weighbridge2Active: true,
        emergencyAssayActive: false,
        assaying: { activeStations: 5, totalStations: 8, loadPercent: 65, avgTimeMin: 12 },
        weighing: { activeBridges: 3, totalBridges: 4, loadPercent: 78, avgTimeMin: 8 },
        unloading: { freeBays: 6, totalBays: 10, loadPercent: 45, avgTimeMin: 18 },
        labour: { activeWorkers: 35, totalWorkers: 40, availabilityPercent: 85, shift: "Shift A" },
        storage: { currentMT: 2800, maxMT: 10000, occupancyPercent: 72 },
        offtake: { clearedTrucks: 8, scheduledTrucks: 12, nextRakeHours: 2.5 }
    },
    currentSlot: {
        token: "MF-2026-4821",
        cropKey: "wheat",
        cropName: "Wheat (गेहूं)",
        quantity: 50,
        vehicle: "Tractor Trolley",
        date: "2026-11-15",
        time: "09:00 – 10:00 AM",
        mspRate: 2275,
        estimatedPay: 113750
    },
    yardProcessing: {
        currentStage: 2, // 1: Gate, 2: Assaying, 3: Weighing, 4: Procurement, 5: Unloading
        moisturePercent: 11.8,
        foreignMatterPercent: 1.2,
        qualityGrade: "FAQ Grade A",
        grossWeight: 72.5,
        tareWeight: 24.0,
        netWeight: 48.5,
        baseMsp: 2275,
        gradeDiscount: 0,
        netPayable: 110337.50,
        bayAssigned: "Bay 04 (Stack 7)",
        dbtStatus: "Processing via PFMS Treasury",
        utr: "RBI2026994821"
    },
    queue: [
        { pos: 1, token: "MF-2026-4818", name: "Suresh Yadav", crop: "Soybean (सोयाबीन)", qty: 40, status: "Processing", statusClass: "q-processing", time: "08:45 AM" },
        { pos: 2, token: "MF-2026-4819", name: "Mohan Patel", crop: "Wheat (गेहूं)", qty: 65, status: "At Gate", statusClass: "q-gate", time: "08:55 AM" },
        { pos: 3, token: "MF-2026-4820", name: "Geeta Devi", crop: "Gram (चना)", qty: 30, status: "Waiting", statusClass: "q-waiting", time: "09:00 AM" },
        { pos: 4, token: "MF-2026-4821", name: "Ramesh Kumar", crop: "Wheat (गेहूं)", qty: 50, status: "Waiting", statusClass: "q-waiting", time: "09:05 AM", isUser: true },
        { pos: 5, token: "MF-2026-4822", name: "Lakshmi Bai", crop: "Mustard (सरसों)", qty: 25, status: "Waiting", statusClass: "q-waiting", time: "09:15 AM" },
        { pos: 6, token: "MF-2026-4823", name: "Vikram Singh", crop: "Rice (चावल)", qty: 80, status: "Waiting", statusClass: "q-waiting", time: "09:20 AM" },
        { pos: 7, token: "MF-2026-4824", name: "Anita Kumari", crop: "Maize (मक्का)", qty: 45, status: "Waiting", statusClass: "q-waiting", time: "09:30 AM" }
    ],
    smsInbox: [
        { id: 1, sender: "JK-MANDI", time: "08:30 AM", text: "Kisan Suvidha: Slot confirmed for Wheat (50 Qtl) on 15 Nov, 09:00–10:00 AM. Token: MF-2026-4821. Mandi: Krishi Upaj Mandi Indore." },
        { id: 2, sender: "JK-MANDI", time: "08:50 AM", text: "MandiFlow Alert: 3 vehicles ahead of you in yard. Please proceed to Gate #1 with Vehicle MP-09-AB-1234." },
        { id: 3, sender: "GOV-DBT", time: "09:45 AM", text: "DBT e-Payment initiated: ₹1,10,337.50 for 48.5 Qtl Wheat procurement. Direct transfer to SBI A/c ****4523 via PFMS." }
    ],
    exceptionsLog: [
        { time: "08:15 AM", type: "INFO", text: "Capacity scheduler active. Baseline 24 vehicles/hr established." },
        { time: "08:42 AM", type: "RESOLVED", text: "Token MF-4817 arrived 15m late: Auto-diverted to Buffer Bay 2." }
    ]
};

/* ───── REST API Endpoints ───── */

// 1. Health & SIH 2026 Metadata
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: "MandiFlow Orchestrator Backend API is Running",
        ...db.metadata,
        timestamp: new Date().toISOString()
    });
});

// 2. Farmer Registration & Profile
app.get('/api/v1/farmer/profile', (req, res) => {
    res.json({ success: true, farmer: db.farmer });
});

app.post('/api/v1/farmer/register', (req, res) => {
    const { name, phone, aadhaar, landRecord, village, district, mandi, bankAcc } = req.body;
    if (!name || !phone || !aadhaar) {
        return res.status(400).json({ success: false, error: "Name, phone, and Aadhaar are required" });
    }
    db.farmer = {
        name,
        phone,
        aadhaar,
        landRecord: landRecord || "Khasra #142/2A (4.5 Acres)",
        village: village || "Sanwer",
        district: district || "Indore",
        mandi: mandi || "Krishi Upaj Mandi, Indore",
        bankAcc: bankAcc || "SBI ****4523",
        bankIfsc: "SBIN0001234",
        bankName: "State Bank of India"
    };
    res.json({
        success: true,
        message: `Farmer ${name} successfully verified with e-KYC and Land Records.`,
        farmer: db.farmer
    });
});

// 3. Mandi Processing Capacity Engine
app.get('/api/v1/capacity/status', (req, res) => {
    const { inflowMultiplier, assaying, weighing, unloading } = db.capacities;
    const bottleneckMinimum = Math.min(assaying.loadPercent, weighing.loadPercent, unloading.loadPercent);
    const maxHourlySlots = Math.round(24 / inflowMultiplier);

    res.json({
        success: true,
        capacities: db.capacities,
        metrics: {
            bottleneckMinimum,
            maxHourlySlots,
            allocatedToday: 156,
            yardEfficiencyPercent: 94
        }
    });
});

app.post('/api/v1/capacity/simulate', (req, res) => {
    const { inflowMultiplier, toggleWeighbridge2, toggleEmergencyAssay } = req.body;

    if (inflowMultiplier !== undefined) {
        db.capacities.inflowMultiplier = parseFloat(inflowMultiplier);
        db.capacities.assaying.loadPercent = Math.min(96, Math.round(65 * db.capacities.inflowMultiplier));
        db.capacities.weighing.loadPercent = Math.min(98, Math.round(78 * db.capacities.inflowMultiplier));
        db.capacities.unloading.loadPercent = Math.min(95, Math.round(45 * db.capacities.inflowMultiplier));
    }

    if (toggleWeighbridge2 !== undefined) {
        db.capacities.weighbridge2Active = !db.capacities.weighbridge2Active;
        db.capacities.weighing.activeBridges = db.capacities.weighbridge2Active ? 3 : 2;
        db.capacities.weighing.loadPercent = db.capacities.weighbridge2Active ? 78 : 94;
    }

    if (toggleEmergencyAssay !== undefined) {
        db.capacities.emergencyAssayActive = !db.capacities.emergencyAssayActive;
        db.capacities.assaying.activeStations = db.capacities.emergencyAssayActive ? 8 : 5;
        db.capacities.assaying.loadPercent = db.capacities.emergencyAssayActive ? 42 : 65;
    }

    res.json({
        success: true,
        message: "Capacity parameters updated",
        capacities: db.capacities
    });
});

// 4. Capacity-Aware Slot Booking & Dynamic Recommendation
app.get('/api/v1/slots/available', (req, res) => {
    const slots = [
        { time: "06:00 – 07:00 AM", count: 8, max: 24, status: "available" },
        { time: "07:00 – 08:00 AM", count: 16, max: 24, status: "available" },
        { time: "08:00 – 09:00 AM", count: 22, max: 24, status: "filling" },
        { time: "09:00 – 10:00 AM", count: 24, max: 24, status: "full" },
        { time: "10:00 – 11:00 AM", count: 12, max: 24, status: "available" },
        { time: "11:00 – 12:00 PM", count: 6, max: 24, status: "recommended" }, // AI Optimal
        { time: "12:00 – 01:00 PM", count: 10, max: 24, status: "available" },
        { time: "01:00 – 02:00 PM", count: 5, max: 24, status: "available" },
        { time: "02:00 – 03:00 PM", count: 14, max: 24, status: "available" }
    ];
    res.json({
        success: true,
        optimalSlot: "11:00 – 12:00 PM",
        reason: "Assaying stations report 35% lower load. Saves ~45 mins waiting time.",
        slots
    });
});

app.post('/api/v1/slots/allocate', (req, res) => {
    const { cropKey, quantity, vehicle, time, date } = req.body;
    const cropData = db.mspRates[cropKey] || db.mspRates.wheat;
    const qty = parseFloat(quantity) || 50;
    const newToken = "MF-2026-" + (4800 + Math.floor(Math.random() * 150));
    const slotTime = time || "11:00 – 12:00 PM";

    db.currentSlot = {
        token: newToken,
        cropKey: cropKey || "wheat",
        cropName: cropData.name,
        quantity: qty,
        vehicle: vehicle || "Tractor Trolley",
        date: date || new Date().toISOString().split('T')[0],
        time: slotTime,
        mspRate: cropData.rate,
        estimatedPay: cropData.rate * qty
    };

    // Auto-dispatch simulated SMS
    db.smsInbox.unshift({
        id: Date.now(),
        sender: "JK-MANDI",
        time: "Just now",
        text: `Kisan Suvidha: Slot confirmed for ${cropData.name} (${qty} Qtl) at ${slotTime}. Token: ${newToken}.`
    });

    res.json({
        success: true,
        message: "Capacity slot successfully allocated",
        token: newToken,
        slot: db.currentSlot
    });
});

// 5. Virtual Queue & Live Board
app.get('/api/v1/queue/live', (req, res) => {
    res.json({
        success: true,
        userPosition: 4,
        estimatedWaitMin: 21,
        activeToken: db.currentSlot.token,
        queue: db.queue
    });
});

// 6. 5-Stage Yard Gate-to-Unloading Lifecycle
app.get('/api/v1/procurement/status', (req, res) => {
    res.json({
        success: true,
        currentStage: db.yardProcessing.currentStage,
        details: db.yardProcessing
    });
});

app.post('/api/v1/procurement/stage/:stage', (req, res) => {
    const stageNum = parseInt(req.params.stage);
    if (stageNum < 1 || stageNum > 5) {
        return res.status(400).json({ success: false, error: "Stage must be between 1 and 5" });
    }
    db.yardProcessing.currentStage = stageNum;

    if (req.body.moisture !== undefined) {
        const m = parseFloat(req.body.moisture);
        db.yardProcessing.moisturePercent = m;
        if (m <= 12.0) {
            db.yardProcessing.qualityGrade = "FAQ Grade A";
            db.yardProcessing.gradeDiscount = 0;
        } else if (m <= 14.0) {
            db.yardProcessing.qualityGrade = "Grade B (Moisture Deduction)";
            db.yardProcessing.gradeDiscount = 25;
        } else {
            db.yardProcessing.qualityGrade = "Under-Grade (High Moisture)";
            db.yardProcessing.gradeDiscount = 60;
        }
        const effectiveRate = Math.max(100, db.yardProcessing.baseMsp - db.yardProcessing.gradeDiscount);
        db.yardProcessing.netPayable = db.yardProcessing.netWeight * effectiveRate;
    }

    res.json({
        success: true,
        message: `Procurement lifecycle advanced to Stage ${stageNum}`,
        stage: stageNum,
        processing: db.yardProcessing
    });
});

// 7. Dynamic Exception Management Engine
app.post('/api/v1/exceptions/trigger', (req, res) => {
    const { type } = req.body;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let resolution = "";

    switch (type) {
        case "LATE_ARRIVAL":
            resolution = "Farmer arrived 35m late: Auto-reassigned to Buffer Lane #2. On-time farmers unaffected.";
            db.exceptionsLog.unshift({ time: now, type: "RESOLVED", text: resolution });
            break;
        case "WALKIN":
            const walkToken = "MF-WALK-" + (100 + Math.floor(Math.random() * 89));
            resolution = `Walk-in farmer accommodated in Assaying Slack Window. Emergency token ${walkToken} issued.`;
            db.exceptionsLog.unshift({ time: now, type: "CAPACITY-GAP", text: resolution });
            db.queue.push({
                pos: db.queue.length + 1,
                token: walkToken,
                name: "Baldev Singh (Walk-in)",
                crop: "Soybean (सोयाबीन)",
                qty: 35,
                status: "Waiting",
                statusClass: "q-waiting",
                time: now
            });
            break;
        case "NO_SHOW":
            resolution = "15-min grace window expired for Token MF-4819. Slot auto-released. Queue advanced.";
            db.exceptionsLog.unshift({ time: now, type: "AUTO-RELEASE", text: resolution });
            if (db.queue.length > 1) {
                db.queue.splice(1, 1);
                db.queue.forEach((q, i) => q.pos = i + 1);
            }
            break;
        case "BREAKDOWN":
            resolution = "Weighbridge #2 sensor fault. AI Scheduler diverted light trucks to Bridge #1.";
            db.exceptionsLog.unshift({ time: now, type: "FAULT", text: resolution });
            db.capacities.weighbridge2Active = false;
            db.capacities.weighing.loadPercent = 94;
            break;
        case "RESET":
            resolution = "Yard operational parameters restored to baseline.";
            db.exceptionsLog.unshift({ time: now, type: "RESET", text: resolution });
            db.capacities.weighbridge2Active = true;
            db.capacities.weighing.loadPercent = 78;
            break;
        default:
            return res.status(400).json({ success: false, error: "Invalid exception type" });
    }

    res.json({
        success: true,
        type,
        resolution,
        auditLog: db.exceptionsLog
    });
});

// 8. Interactive Voice Response (IVR) Webhook Telephony
app.post('/api/v1/ivr/call', (req, res) => {
    const { lang = 'en' } = req.body;
    const greeting = lang === 'hi'
        ? "नमस्ते! मंडीफ्लो किसान सेवा में आपका स्वागत है। स्लॉट बुकिंग के लिए 1, टोकन विवरण के लिए 2, कतार स्थिति के लिए 3, भुगतान के लिए 4 दबाएं।"
        : "Welcome to MandiFlow Kisan Helpline. Press 1 for Slot Booking, 2 for Token Details, 3 for Queue Position, 4 for Payment Status, 9 for SMS.";

    res.json({
        status: "in-call",
        duration: "00:00",
        speechText: greeting,
        availableOptions: [1, 2, 3, 4, 9, "*", 0, "#"]
    });
});

app.post('/api/v1/ivr/keypress', (req, res) => {
    const { digit, lang = 'en' } = req.body;
    const { cropName, time, token } = db.currentSlot;
    const { netPayable } = db.yardProcessing;

    let reply = "";
    switch (String(digit)) {
        case "1":
            reply = lang === 'hi'
                ? "आपकी मंडी क्षमता जांची गई। आज 11:00 बजे का स्लॉट उपलब्ध है।"
                : "Centre capacity checked. Optimal slot available at 11:00 AM with zero queue wait.";
            break;
        case "2":
            reply = lang === 'hi'
                ? `आपका टोकन नंबर ${token} है, फसल ${cropName}, समय ${time}।`
                : `Your active digital token is ${token} for ${cropName}. Arrival window is ${time}.`;
            break;
        case "3":
            reply = lang === 'hi'
                ? "आप लाइन में नंबर 4 पर हैं। अनुमानित प्रतीक्षा समय लगभग 21 मिनट है।"
                : "You are currently position 4 in the virtual queue. Estimated wait time is approximately 21 minutes.";
            break;
        case "4":
            reply = lang === 'hi'
                ? `आपकी भुगतान राशि ₹ ${Math.round(netPayable)} पीएफएमएस डीबीटी द्वारा स्वीकृत हो चुकी है।`
                : `Your MSP payment of ₹ ${Math.round(netPayable).toLocaleString('en-IN')} is approved and processing via PFMS Direct Bank Transfer.`;
            break;
        case "9":
            reply = lang === 'hi'
                ? "एसएमएस टोकन आपके पंजीकृत मोबाइल नंबर पर भेज दिया गया है।"
                : "SMS alert with your digital token pass has been dispatched to your mobile.";
            break;
        default:
            reply = "Please press 1 for Slot, 2 for Token, 3 for Queue, 4 for Payment.";
    }

    res.json({
        digit,
        speechText: reply
    });
});

// 9. SMS Fallback Webhook
app.get('/api/v1/sms/inbox', (req, res) => {
    res.json({ success: true, count: db.smsInbox.length, messages: db.smsInbox });
});

app.post('/api/v1/sms/query', (req, res) => {
    const { text } = req.body;
    const query = (text || "").toUpperCase();
    let reply = "";

    if (query.includes("STATUS") || query.includes("QUEUE")) {
        reply = `MandiFlow: Token ${db.currentSlot.token} is #4 in line. Est wait 21m. Gate #1 check-in ready.`;
    } else if (query.includes("PAY") || query.includes("DBT")) {
        reply = `DBT PFMS: Payment of ₹${db.yardProcessing.netPayable.toLocaleString('en-IN')} initiated for 48.5 Qtl Wheat. Credit to SBI ****4523 within 48h.`;
    } else {
        reply = "Kisan Helpline: Valid SMS commands: STATUS, SLOT, PAYMENT, HELP. Toll-free voice: 1800-MANDI.";
    }

    const newMsg = {
        id: Date.now(),
        sender: "JK-MANDI",
        time: "Just now",
        text: reply
    };
    db.smsInbox.unshift(newMsg);

    res.json({ success: true, reply: newMsg, inbox: db.smsInbox });
});

// 10. Official Mandi Form J (e-Bilti) Receipt
app.get('/api/v1/payment/receipt/:token', (req, res) => {
    res.json({
        success: true,
        billNo: "IND-2026-098421",
        date: "15-11-2026 09:48 AM",
        token: db.currentSlot.token,
        farmer: db.farmer,
        procuringAgency: "Food Corporation of India (FCI)",
        commodity: db.currentSlot.cropName,
        grade: db.yardProcessing.qualityGrade,
        moisture: `${db.yardProcessing.moisturePercent}%`,
        grossWeightQtl: db.yardProcessing.grossWeight,
        tareWeightQtl: db.yardProcessing.tareWeight,
        netWeightQtl: db.yardProcessing.netWeight,
        mspRatePerQtl: db.currentSlot.mspRate,
        netPayable: db.yardProcessing.netPayable,
        dbtTransfer: {
            bank: db.farmer.bankAcc,
            ifsc: db.farmer.bankIfsc,
            pfmsBatch: "PFMS-AGRI-2026-98124",
            utr: db.yardProcessing.utr,
            expectedCredit: "Within 48 hours"
        }
    });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌾 MandiFlow Orchestrator Backend API`);
    console.log(`   Smart India Hackathon 2026 | PS 26032 | Team NUVEXA`);
    console.log(`   Server running on: http://localhost:${PORT}`);
    console.log(`   REST API Health:    http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
});

