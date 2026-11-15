/* ═══════════════════════════════════════════════
   MandiFlow Orchestrator — Application Logic
   Smart India Hackathon 2026 | PS ID: 26032
   Team: NUVEXA
   Theme: Smart Automation
   ═══════════════════════════════════════════════ */

// ───── Global Application State ─────
const MandiState = {
    lang: 'en', // 'en', 'hi', 'pa'
    isOnline: true,
    offlineQueue: [],
    farmer: {
        name: 'Ramesh Kumar',
        phone: '+91 98765 43210',
        aadhaar: '4521 8839 1204',
        landRecord: 'Khasra #142/2A (4.5 Acres)',
        village: 'Sanwer',
        district: 'Indore',
        mandi: 'Krishi Upaj Mandi, Indore',
        bankAcc: 'SBI ****4523',
        bankIfsc: 'SBIN0001234',
        bankName: 'State Bank of India'
    },
    currentSlot: {
        cropKey: 'wheat',
        cropName: 'Wheat (गेहूं)',
        quantity: 50,
        vehicle: 'Tractor Trolley',
        date: '2026-11-15',
        time: '09:00 – 10:00 AM',
        token: 'MF-2026-4821',
        mspRate: 2275,
        estimatedPay: 113750
    },
    yardProcessing: {
        currentStage: 2, // 1: Gate, 2: Assaying, 3: Weighing, 4: Procurement, 5: Unloading
        moisturePercent: 11.8,
        foreignMatterPercent: 1.2,
        qualityGrade: 'FAQ Grade A',
        grossWeight: 72.5,
        tareWeight: 24.0,
        netWeight: 48.5,
        baseMsp: 2275,
        gradeDiscount: 0,
        netPayable: 110337.50,
        bayAssigned: 'Bay 04 (Stack 7)'
    },
    capacities: {
        inflowMultiplier: 1.0,
        weighbridge2Active: true,
        emergencyAssayActive: false,
        assaying: 65,
        weighing: 78,
        unloading: 45,
        labour: 85,
        storage: 72,
        offtake: 40
    },
    queue: [
        { pos: 1, token: 'MF-2026-4818', name: 'Suresh Yadav', crop: 'Soybean (सोयाबीन)', qty: 40, status: 'Processing', statusClass: 'q-processing', time: '08:45 AM' },
        { pos: 2, token: 'MF-2026-4819', name: 'Mohan Patel', crop: 'Wheat (गेहूं)', qty: 65, status: 'At Gate', statusClass: 'q-gate', time: '08:55 AM' },
        { pos: 3, token: 'MF-2026-4820', name: 'Geeta Devi', crop: 'Gram (चना)', qty: 30, status: 'Waiting', statusClass: 'q-waiting', time: '09:00 AM' },
        { pos: 4, token: 'MF-2026-4821', name: 'Ramesh Kumar', crop: 'Wheat (गेहूं)', qty: 50, status: 'Waiting', statusClass: 'q-waiting', time: '09:05 AM', isUser: true },
        { pos: 5, token: 'MF-2026-4822', name: 'Lakshmi Bai', crop: 'Mustard (सरसों)', qty: 25, status: 'Waiting', statusClass: 'q-waiting', time: '09:15 AM' },
        { pos: 6, token: 'MF-2026-4823', name: 'Vikram Singh', crop: 'Rice (चावल)', qty: 80, status: 'Waiting', statusClass: 'q-waiting', time: '09:20 AM' },
        { pos: 7, token: 'MF-2026-4824', name: 'Anita Kumari', crop: 'Maize (मक्का)', qty: 45, status: 'Waiting', statusClass: 'q-waiting', time: '09:30 AM' }
    ],
    smsMessages: [
        { id: 1, sender: 'JK-MANDI', time: '08:30 AM', text: 'Kisan Suvidha: Slot confirmed for Wheat (50 Qtl) on 15 Nov, 09:00–10:00 AM. Token: MF-2026-4821. Mandi: Krishi Upaj Mandi Indore.' },
        { id: 2, sender: 'JK-MANDI', time: '08:50 AM', text: 'MandiFlow Alert: 3 vehicles ahead of you in yard. Please proceed to Gate #1 with Vehicle MP-09-AB-1234.' },
        { id: 3, sender: 'GOV-DBT', time: '09:45 AM', text: 'DBT e-Payment initiated: ₹1,10,337.50 for 48.5 Qtl Wheat procurement. Direct transfer to SBI A/c ****4523 via PFMS.' }
    ],
    exceptionsLog: [
        { time: '08:15 AM', type: 'info', text: 'Capacity scheduler active. Baseline 24 vehicles/hr established.' },
        { time: '08:42 AM', type: 'success', text: 'Token MF-4817 arrived 15m late: Auto-diverted to Buffer Bay 2.' }
    ],
    ivr: {
        isActive: false,
        durationSeconds: 0,
        timerInterval: null,
        currentStep: 'root',
        isSpeaking: false
    }
};

// ───── Backend API Client Helper ─────
const API_BASE = (window.location.protocol.startsWith('http')) ? '' : 'http://localhost:3000';

async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data) options.body = JSON.stringify(data);
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        if (res.ok) return await res.json();
    } catch (e) {
        // Fall back gracefully to local state
    }
    return null;
}

async function checkBackendHealth() {
    const health = await apiCall('/api/health');
    if (health && health.success) {
        const netLabel = document.getElementById('networkLabel');
        if (netLabel) netLabel.textContent = 'Backend Active';
        console.log(`[MandiFlow] Connected to Backend REST API (SIH ${health.sih_year})`);
    }
}

// ───── Application Bootstrap ─────
document.addEventListener('DOMContentLoaded', () => {
    checkBackendHealth();
    initPreloader();
    initParticles();
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initCounterAnimation();
    initFlowDiagramAnimation();
    initLanguageSelector();
    initNetworkToggle();
    initQuickPillLaunchers();
    initTimeSlots();
    initAvailabilityChart();
    initQueueTable();
    initRegistrationForm();
    initSlotForm();
    initNotificationPanel();
    initCapacityEngine();
    initGateProcessingWorkflow();
    initExceptionSimulator();
    initIVRSimulator();
    initSMSSimulator();
    initReceiptModal();
    initArchModal();
    setMinDate();
    renderQrCode();
    updatePaymentSummaryUI();
    simulateQueueMovement();
});

/* ───── Preloader ───── */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 600);
        }, 1200);
    });
    setTimeout(() => {
        if (preloader) {
            preloader.classList.add('hidden');
            setTimeout(() => preloader.remove(), 600);
        }
    }, 2500);
}

/* ───── Floating Particles Background ───── */
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const colors = ['rgba(34,197,94,0.3)', 'rgba(74,222,128,0.2)', 'rgba(245,158,11,0.2)', 'rgba(252,211,77,0.15)'];
    for (let i = 0; i < 26; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 6 + 3;
        p.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            animation-delay: ${Math.random() * 8}s;
            animation-duration: ${8 + Math.random() * 6}s;
        `;
        container.appendChild(p);
    }
}

/* ───── Navbar & Scrolling ───── */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 130;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-section');
            scrollToSection(targetId);
            const navLinksEl = document.getElementById('navLinks');
            const navToggleEl = document.getElementById('navToggle');
            if (navLinksEl) navLinksEl.classList.remove('open');
            if (navToggleEl) navToggleEl.classList.remove('open');
        });
    });
}

window.scrollToSection = function(id) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};

/* ───── Mobile Navigation ───── */
function initMobileMenu() {
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!toggle || !links) return;
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('open');
        links.classList.toggle('open');
    });
}

/* ───── Scroll Fade Animations ───── */
function initScrollAnimations() {
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -40px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animateElements = document.querySelectorAll(
        '.section-header, .form-card, .info-card, .slot-availability, ' +
        '.capacity-card, .capacity-summary, .token-card, .queue-position, ' +
        '.live-queue, .proc-step, .payment-card, .exception-card'
    );
    animateElements.forEach(el => {
        el.classList.add('fade-in-up');
        observer.observe(el);
    });
}

/* ───── Counter Animations ───── */
function initCounterAnimation() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 1800;
    const totalFrames = 60;
    let frame = 0;
    const counter = setInterval(() => {
        frame++;
        const progress = 1 - Math.pow(1 - (frame / totalFrames), 4);
        const currentValue = Math.round(target * progress);
        element.textContent = currentValue.toLocaleString();
        if (frame === totalFrames) {
            clearInterval(counter);
            element.textContent = target.toLocaleString();
        }
    }, duration / totalFrames);
}

/* ───── Hero Flow Animation ───── */
function initFlowDiagramAnimation() {
    const nodes = document.querySelectorAll('.flow-node');
    if (!nodes.length) return;
    let activeIndex = 0;
    setInterval(() => {
        nodes.forEach(node => node.classList.remove('flow-active'));
        nodes[activeIndex].classList.add('flow-active');
        activeIndex = (activeIndex + 1) % nodes.length;
    }, 2200);
}

/* ───── Language Selector (English / Hindi / Punjabi) ───── */
function initLanguageSelector() {
    const langSelect = document.getElementById('langSelect');
    if (!langSelect) return;

    langSelect.addEventListener('change', (e) => {
        MandiState.lang = e.target.value;
        applyLanguage(MandiState.lang);
        showToast(
            MandiState.lang === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है।' :
            MandiState.lang === 'pa' ? 'ਭਾਸ਼ਾ ਬਦਲ ਕੇ ਪੰਜਾਬੀ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।' :
            'Language switched to English.',
            'info'
        );
    });
}

function applyLanguage(lang) {
    const ivrLang = document.getElementById('ivrLangIndicator');
    if (ivrLang) {
        ivrLang.textContent = lang === 'hi' ? 'भाषा: हिन्दी' : lang === 'pa' ? 'ਭਾਸ਼ਾ: ਪੰਜਾਬੀ' : 'Language: English';
    }
}

/* ───── Network Status Toggle (Offline / Poor Connectivity Mitigation) ───── */
function initNetworkToggle() {
    const btn = document.getElementById('btnNetwork');
    const label = document.getElementById('networkLabel');
    const alertBar = document.getElementById('offlineAlertBar');
    if (!btn) return;

    btn.addEventListener('click', () => {
        MandiState.isOnline = !MandiState.isOnline;
        if (MandiState.isOnline) {
            btn.classList.remove('offline');
            btn.classList.add('online');
            label.textContent = 'Online';
            if (alertBar) alertBar.classList.remove('show');
            showToast('✅ Reconnected! Auto-synced 2 offline transactions with Mandi central server.', 'success');
        } else {
            btn.classList.add('offline');
            btn.classList.remove('online');
            label.textContent = 'Offline';
            if (alertBar) alertBar.classList.add('show');
            showToast('📶 Poor connectivity simulated. Actions stored locally; SMS fallback triggered.', 'warning');
        }
    });
}

window.syncOfflineData = function() {
    const btn = document.getElementById('btnNetwork');
    const label = document.getElementById('networkLabel');
    const alertBar = document.getElementById('offlineAlertBar');
    MandiState.isOnline = true;
    if (btn) {
        btn.classList.remove('offline');
        btn.classList.add('online');
    }
    if (label) label.textContent = 'Online';
    if (alertBar) alertBar.classList.remove('show');
    showToast('✅ Synced all local records with state procurement server!', 'success');
};

/* ───── Quick Pill Launchers in Hero ───── */
function initQuickPillLaunchers() {
    const pillIVR = document.getElementById('pillLaunchIVR');
    const pillYard = document.getElementById('pillSimulateYard');
    const pillEx = document.getElementById('pillSimulateException');
    const pillReceipt = document.getElementById('pillViewReceipt');

    if (pillIVR) pillIVR.addEventListener('click', () => window.openIVRModal());
    if (pillYard) pillYard.addEventListener('click', () => scrollToSection('procurement'));
    if (pillEx) pillEx.addEventListener('click', () => scrollToSection('exceptions'));
    if (pillReceipt) pillReceipt.addEventListener('click', () => window.openReceiptModal());

    const navIVR = document.getElementById('btnOpenIVR');
    const navSMS = document.getElementById('btnOpenSMS');
    const navArch = document.getElementById('btnOpenArch');

    if (navIVR) navIVR.addEventListener('click', () => window.openIVRModal());
    if (navSMS) navSMS.addEventListener('click', () => window.openSMSModal());
    if (navArch) navArch.addEventListener('click', () => window.openArchModal());
}

/* ───── Time Slots & Capacity Allocation ───── */
function initTimeSlots() {
    const container = document.getElementById('timeSlots');
    if (!container) return;

    const slots = [
        { time: '06:00 – 07:00 AM', count: 8, max: 24, status: 'available' },
        { time: '07:00 – 08:00 AM', count: 16, max: 24, status: 'available' },
        { time: '08:00 – 09:00 AM', count: 22, max: 24, status: 'filling' },
        { time: '09:00 – 10:00 AM', count: 24, max: 24, status: 'full' },
        { time: '10:00 – 11:00 AM', count: 12, max: 24, status: 'available' },
        { time: '11:00 – 12:00 PM', count: 6, max: 24, status: 'recommended' },
        { time: '12:00 – 01:00 PM', count: 10, max: 24, status: 'available' },
        { time: '01:00 – 02:00 PM', count: 5, max: 24, status: 'available' },
        { time: '02:00 – 03:00 PM', count: 14, max: 24, status: 'available' },
    ];

    container.innerHTML = '';
    slots.forEach((slot, index) => {
        const div = document.createElement('div');
        div.className = 'time-slot' + (slot.count >= slot.max ? ' slot-full' : '') + (slot.status === 'recommended' ? ' slot-rec' : '');
        if (index === 5) div.classList.add('selected'); // Default optimal

        div.innerHTML = `
            <div>${slot.time}</div>
            <span class="slot-count">${slot.count >= slot.max ? 'Full (24/24)' : slot.status === 'recommended' ? '★ Optimal (6/24)' : `${slot.max - slot.count} slots left`}</span>
        `;

        if (slot.count < slot.max) {
            div.addEventListener('click', () => {
                container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                div.classList.add('selected');
            });
        }
        container.appendChild(div);
    });

    const btnApplyRec = document.getElementById('btnApplyRecSlot');
    if (btnApplyRec) {
        btnApplyRec.addEventListener('click', () => {
            const allSlots = container.querySelectorAll('.time-slot');
            allSlots.forEach(s => s.classList.remove('selected'));
            if (allSlots[5]) {
                allSlots[5].classList.add('selected');
                showToast('Applied AI Optimal Slot: 11:00 AM – 12:00 PM (Zero Queue Delay)', 'success');
            }
        });
    }
}

/* ───── Availability Chart ───── */
function initAvailabilityChart() {
    const chart = document.getElementById('availabilityChart');
    if (!chart) return;

    const data = [
        { label: '06:00 AM', fill: 33, status: 'available' },
        { label: '07:00 AM', fill: 66, status: 'available' },
        { label: '08:00 AM', fill: 88, status: 'filling' },
        { label: '09:00 AM', fill: 100, status: 'full' },
        { label: '10:00 AM', fill: 50, status: 'available' },
        { label: '11:00 AM', fill: 25, status: 'available' },
        { label: '12:00 PM', fill: 42, status: 'available' },
        { label: '01:00 PM', fill: 21, status: 'available' },
        { label: '02:00 PM', fill: 58, status: 'available' },
    ];

    chart.innerHTML = '';
    data.forEach(item => {
        const row = document.createElement('div');
        row.className = 'avail-row';
        row.innerHTML = `
            <span class="avail-label">${item.label}</span>
            <div class="avail-bar-bg">
                <div class="avail-bar-fill ${item.status}" style="width: 0%;" data-width="${item.fill}%">
                    ${item.fill}%
                </div>
            </div>
        `;
        chart.appendChild(row);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                chart.querySelectorAll('.avail-bar-fill').forEach((bar, i) => {
                    setTimeout(() => {
                        bar.style.width = bar.getAttribute('data-width');
                    }, i * 60);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(chart);
}

/* ───── Queue Table & Live Filter ───── */
function initQueueTable() {
    const tbody = document.getElementById('queueTableBody');
    if (!tbody) return;

    renderQueueTable('all');

    const filterBtns = document.querySelectorAll('.btn-filter');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderQueueTable(btn.getAttribute('data-filter'));
        });
    });
}

function renderQueueTable(filter = 'all') {
    const tbody = document.getElementById('queueTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    let filtered = MandiState.queue;
    if (filter === 'gate') filtered = MandiState.queue.filter(q => q.status === 'At Gate');
    if (filter === 'processing') filtered = MandiState.queue.filter(q => q.status === 'Processing');
    if (filter === 'waiting') filtered = MandiState.queue.filter(q => q.status === 'Waiting');

    filtered.forEach(item => {
        const tr = document.createElement('tr');
        if (item.isUser) tr.className = 'current-user';
        tr.innerHTML = `
            <td><strong>${item.pos}</strong></td>
            <td><code style="font-size:12px; color: var(--green-300); font-weight:700;">${item.token}</code></td>
            <td>${item.name}${item.isUser ? ' <span style="color:var(--gold-400);font-size:11px;font-weight:700;">(You)</span>' : ''}</td>
            <td>${item.crop} (${item.qty} Qtl)</td>
            <td><span class="q-status ${item.statusClass}">${item.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

/* ───── Dynamic SVG QR Code Generator ───── */
function renderQrCode() {
    const container = document.getElementById('qrContainer');
    const jformContainer = document.getElementById('jformQrCodeContainer');
    if (!container) return;

    const token = MandiState.currentSlot.token;
    const farmer = MandiState.farmer.name;
    const crop = MandiState.currentSlot.cropName;
    const qty = MandiState.currentSlot.quantity;

    // Authentic high-tech SVG QR visualization
    const qrSvg = `
        <svg viewBox="0 0 100 100" width="130" height="130" style="display:block; margin:0 auto; border-radius:4px;">
            <rect width="100" height="100" fill="#ffffff" rx="4"/>
            <!-- Top-Left Finder -->
            <rect x="8" y="8" width="24" height="24" fill="#0f172a" rx="3"/>
            <rect x="13" y="13" width="14" height="14" fill="#ffffff"/>
            <rect x="16" y="16" width="8" height="8" fill="#15803d"/>
            <!-- Top-Right Finder -->
            <rect x="68" y="8" width="24" height="24" fill="#0f172a" rx="3"/>
            <rect x="73" y="13" width="14" height="14" fill="#ffffff"/>
            <rect x="76" y="16" width="8" height="8" fill="#15803d"/>
            <!-- Bottom-Left Finder -->
            <rect x="8" y="68" width="24" height="24" fill="#0f172a" rx="3"/>
            <rect x="13" y="73" width="14" height="14" fill="#ffffff"/>
            <rect x="16" y="76" width="8" height="8" fill="#15803d"/>
            <!-- Timing & Data Matrix Points -->
            <rect x="36" y="10" width="6" height="6" fill="#0f172a"/>
            <rect x="46" y="10" width="6" height="6" fill="#15803d"/>
            <rect x="56" y="10" width="6" height="6" fill="#0f172a"/>
            <rect x="10" y="36" width="6" height="6" fill="#0f172a"/>
            <rect x="10" y="46" width="6" height="6" fill="#15803d"/>
            <rect x="10" y="56" width="6" height="6" fill="#0f172a"/>
            <!-- Center Data Body -->
            <rect x="36" y="36" width="8" height="8" fill="#0f172a"/>
            <rect x="48" y="36" width="6" height="6" fill="#15803d"/>
            <rect x="58" y="36" width="8" height="8" fill="#0f172a"/>
            <rect x="36" y="48" width="8" height="8" fill="#15803d"/>
            <rect x="48" y="48" width="8" height="8" fill="#0f172a"/>
            <rect x="60" y="48" width="6" height="6" fill="#0f172a"/>
            <rect x="36" y="60" width="6" height="6" fill="#0f172a"/>
            <rect x="46" y="60" width="8" height="8" fill="#15803d"/>
            <rect x="58" y="60" width="8" height="8" fill="#0f172a"/>
            <!-- Bottom Data -->
            <rect x="36" y="74" width="8" height="8" fill="#0f172a"/>
            <rect x="48" y="74" width="6" height="6" fill="#0f172a"/>
            <rect x="60" y="74" width="8" height="8" fill="#15803d"/>
            <rect x="74" y="36" width="8" height="8" fill="#0f172a"/>
            <rect x="74" y="48" width="6" height="6" fill="#15803d"/>
            <rect x="74" y="60" width="8" height="8" fill="#0f172a"/>
            <rect x="74" y="74" width="8" height="8" fill="#0f172a"/>
        </svg>
    `;
    container.innerHTML = qrSvg;
    if (jformContainer) {
        jformContainer.innerHTML = qrSvg.replace('width="130" height="130"', 'width="90" height="90"');
    }
}

/* ───── Registration Form ───── */
function initRegistrationForm() {
    const form = document.getElementById('registrationForm');
    const btnDemo = document.getElementById('btnQuickFillDemo');
    if (!form) return;

    if (btnDemo) {
        btnDemo.addEventListener('click', () => {
            document.getElementById('farmerName').value = 'Ramesh Kumar';
            document.getElementById('farmerPhone').value = '+91 98765 43210';
            document.getElementById('farmerAadhaar').value = '4521 8839 1204';
            document.getElementById('farmerLandRecord').value = 'Khasra #142/2A (4.5 Acres)';
            document.getElementById('farmerVillage').value = 'Sanwer';
            document.getElementById('farmerDistrict').value = 'Indore';
            document.getElementById('farmerMandi').value = 'Krishi Upaj Mandi, Indore';
            document.getElementById('farmerBankAcc').value = 'SBI ****4523';
            showToast('Demo farmer profile filled successfully.', 'info');
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('farmerName').value.trim();
        const phone = document.getElementById('farmerPhone').value.trim();
        const aadhaar = document.getElementById('farmerAadhaar').value.trim();
        const land = document.getElementById('farmerLandRecord').value.trim();
        const village = document.getElementById('farmerVillage').value.trim();
        const bank = document.getElementById('farmerBankAcc').value.trim();

        if (!name || !phone || !aadhaar) {
            showToast('Please fill all required fields.', 'warning');
            return;
        }

        MandiState.farmer.name = name;
        MandiState.farmer.phone = phone;
        MandiState.farmer.aadhaar = aadhaar;
        MandiState.farmer.landRecord = land;
        MandiState.farmer.village = village;
        MandiState.farmer.bankAcc = bank;

        document.getElementById('tokenFarmer').textContent = name;
        document.getElementById('jformFarmerName').textContent = name;

        showToast(`Farmer registration verified for ${name}! e-KYC linked.`, 'success');
        setTimeout(() => scrollToSection('slot-booking'), 1200);
    });
}

/* ───── Slot Booking Form ───── */
function initSlotForm() {
    const form = document.getElementById('slotForm');
    const cropSelect = document.getElementById('cropType');
    const qtyInput = document.getElementById('cropQuantity');
    const mspPreview = document.getElementById('slotMspPreview');
    if (!form || !cropSelect || !qtyInput) return;

    const updateEstMsp = () => {
        const opt = cropSelect.options[cropSelect.selectedIndex];
        const msp = parseFloat(opt.getAttribute('data-msp')) || 2275;
        const qty = parseFloat(qtyInput.value) || 0;
        const total = msp * qty;
        mspPreview.textContent = `₹ ${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    cropSelect.addEventListener('change', updateEstMsp);
    qtyInput.addEventListener('input', updateEstMsp);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const cropOpt = cropSelect.options[cropSelect.selectedIndex];
        const cropText = cropOpt.text.split('—')[0].trim();
        const mspVal = parseFloat(cropOpt.getAttribute('data-msp')) || 2275;
        const qtyVal = parseFloat(qtyInput.value) || 50;
        const selectedSlot = document.querySelector('.time-slot.selected');

        if (!selectedSlot) {
            showToast('Please choose a capacity time slot.', 'warning');
            return;
        }

        const slotTime = selectedSlot.querySelector('div').textContent.trim();
        const newToken = 'MF-2026-' + (4800 + Math.floor(Math.random() * 150));

        MandiState.currentSlot.cropName = cropText;
        MandiState.currentSlot.quantity = qtyVal;
        MandiState.currentSlot.time = slotTime;
        MandiState.currentSlot.token = newToken;
        MandiState.currentSlot.mspRate = mspVal;
        MandiState.currentSlot.estimatedPay = mspVal * qtyVal;

        // Update token card
        document.getElementById('tokenNumber').textContent = newToken;
        document.getElementById('tokenCrop').textContent = cropText;
        document.getElementById('tokenQty').textContent = `${qtyVal} Quintals`;
        document.getElementById('tokenSlot').textContent = slotTime;
        document.getElementById('jformToken').textContent = newToken;
        document.getElementById('jformCrop').textContent = cropText;

        renderQrCode();
        updatePaymentSummaryUI();

        // Dispatch simulated SMS confirmation
        MandiState.smsMessages.unshift({
            id: Date.now(),
            sender: 'JK-MANDI',
            time: 'Just now',
            text: `Kisan Suvidha: Confirmed slot for ${cropText} (${qtyVal} Qtl) on today at ${slotTime}. Digital Token: ${newToken}.`
        });
        updateSmsBadge();

        showToast(`Slot allocated: ${slotTime}! Token ${newToken} generated.`, 'success');
        setTimeout(() => scrollToSection('queue'), 1200);
    });

    const btnPrint = document.getElementById('btnPrintToken');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            window.print();
        });
    }

    const btnSms = document.getElementById('btnSmsToken');
    if (btnSms) {
        btnSms.addEventListener('click', () => {
            showToast(`SMS sent to ${MandiState.farmer.phone} with Token & QR link.`, 'info');
        });
    }
}

/* ───── Min Date Setup ───── */
function setMinDate() {
    const dateInput = document.getElementById('slotDate');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.setAttribute('min', `${yyyy}-${mm}-${dd}`);
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
}

/* ───── Capacity Dashboard & Yard Inflow Simulator ───── */
function initCapacityEngine() {
    const sliderInflow = document.getElementById('sliderInflow');
    const labelInflow = document.getElementById('labelInflow');
    const btnBridge2 = document.getElementById('btnToggleBridge2');
    const btnEmergencyAssay = document.getElementById('btnToggleEmergencyAssay');

    if (sliderInflow) {
        sliderInflow.addEventListener('input', (e) => {
            const multiplier = parseFloat(e.target.value);
            MandiState.capacities.inflowMultiplier = multiplier;
            labelInflow.textContent = `${multiplier.toFixed(1)}x (${multiplier > 1.4 ? 'Peak Inflow' : multiplier < 0.8 ? 'Low Inflow' : 'Normal'})`;

            const baseAssay = Math.min(96, Math.round(65 * multiplier));
            const baseWeigh = Math.min(98, Math.round(78 * multiplier));
            const baseUnload = Math.min(95, Math.round(45 * multiplier));

            updateMeter('barAssaying', 'valAssaying', baseAssay);
            updateMeter('barWeighing', 'valWeighing', baseWeigh);
            updateMeter('barUnloading', 'valUnloading', baseUnload);

            const maxSlotsEl = document.getElementById('sumMaxSlots');
            if (maxSlotsEl) maxSlotsEl.textContent = Math.round(24 / multiplier);

            const banner = document.getElementById('bottleneckBanner');
            if (banner) {
                if (multiplier >= 1.6) {
                    banner.style.background = 'rgba(239, 68, 68, 0.15)';
                    banner.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                    banner.innerHTML = `<span style="font-size:22px;">⚠️</span><div style="font-size:13px; line-height:1.4;"><strong style="color:#fca5a5;">High Traffic Bottleneck Alert:</strong> Inflow surge detected. Capacity-Aware engine has throttled walk-ins and enabled secondary holding bays.</div>`;
                } else {
                    banner.style.background = 'rgba(34, 197, 94, 0.1)';
                    banner.style.borderColor = 'rgba(34, 197, 94, 0.3)';
                    banner.innerHTML = `<span style="font-size:22px;">🛡️</span><div style="font-size:13px; line-height:1.4;"><strong style="color:var(--green-300);">Yard Balance Optimal:</strong> Inflow balanced with mandi processing velocity. Zero gate accumulation.</div>`;
                }
            }
        });
    }

    if (btnBridge2) {
        btnBridge2.addEventListener('click', () => {
            MandiState.capacities.weighbridge2Active = !MandiState.capacities.weighbridge2Active;
            btnBridge2.classList.toggle('active');
            const statusEl = document.getElementById('statusWeighing');
            const detailEl = document.getElementById('detailWeighing');

            if (!MandiState.capacities.weighbridge2Active) {
                btnBridge2.innerHTML = `<span>⚠️ Weighbridge #2 OFFLINE (Click to Restore)</span>`;
                if (statusEl) {
                    statusEl.textContent = 'Critical (Lane Down)';
                    statusEl.className = 'cap-status status-critical';
                }
                if (detailEl) detailEl.textContent = '2 / 4 bridges active';
                updateMeter('barWeighing', 'valWeighing', 94);
                showToast('⚠️ Weighbridge #2 sensor fault! AI rebalancing traffic to Bridge #1 & #3.', 'warning');
                addExceptionAuditLog('FAULT', 'Weighbridge #2 sensor fault. AI Scheduler diverted light trucks to Bridge #1.');
            } else {
                btnBridge2.innerHTML = `<span>⚖️ Toggle Weighbridge #2 Breakdown</span>`;
                if (statusEl) {
                    statusEl.textContent = 'Moderate';
                    statusEl.className = 'cap-status status-warning';
                }
                if (detailEl) detailEl.textContent = '3 / 4 bridges active';
                updateMeter('barWeighing', 'valWeighing', 78);
                showToast('Weighbridge #2 restored to full service.', 'success');
                addExceptionAuditLog('RESTORE', 'Weighbridge #2 recalibrated and restored to queue pool.');
            }
        });
    }

    if (btnEmergencyAssay) {
        btnEmergencyAssay.addEventListener('click', () => {
            MandiState.capacities.emergencyAssayActive = !MandiState.capacities.emergencyAssayActive;
            btnEmergencyAssay.classList.toggle('active');
            const statusEl = document.getElementById('statusAssaying');
            const detailEl = document.getElementById('detailAssaying');

            if (MandiState.capacities.emergencyAssayActive) {
                btnEmergencyAssay.innerHTML = `<span>🔬 3 Extra Testing Kits Active (Click to Remove)</span>`;
                if (statusEl) {
                    statusEl.textContent = 'High Throughput';
                    statusEl.className = 'cap-status status-good';
                }
                if (detailEl) detailEl.textContent = '8 / 8 stations active';
                updateMeter('barAssaying', 'valAssaying', 42);
                showToast('🚀 Rapid assaying kits deployed. Wait times reduced by 40%!', 'success');
                addExceptionAuditLog('CAPACITY+', '3 Rapid Quality Assaying stations opened. Queue cleared.');
            } else {
                btnEmergencyAssay.innerHTML = `<span>🔬 Add Mobile Assaying Counters (+3)</span>`;
                if (statusEl) {
                    statusEl.textContent = 'Optimal';
                    statusEl.className = 'cap-status status-good';
                }
                if (detailEl) detailEl.textContent = '5 / 8 stations active';
                updateMeter('barAssaying', 'valAssaying', 65);
            }
        });
    }
}

function updateMeter(barId, valId, percent) {
    const bar = document.getElementById(barId);
    const val = document.getElementById(valId);
    if (bar) bar.style.setProperty('--fill', `${percent}%`);
    if (val) val.textContent = `${percent}%`;
    const fill = bar ? bar.querySelector('.meter-fill') : null;
    if (fill) fill.style.width = `${percent}%`;
}

/* ───── Gate Entry & 5-Stage Procurement Workflow ───── */
function initGateProcessingWorkflow() {
    const btnAdvance = document.getElementById('btnProcAdvance');
    const btnFastForward = document.getElementById('btnProcFastForward');
    const btnReset = document.getElementById('btnProcReset');
    const btnOpenReceipt = document.getElementById('btnOpenReceiptDirect');
    const inputMoisture = document.getElementById('inputMoisture');

    if (btnAdvance) {
        btnAdvance.addEventListener('click', () => {
            advanceStage();
        });
    }

    if (btnFastForward) {
        btnFastForward.addEventListener('click', () => {
            fastForwardWorkflow();
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            resetWorkflow();
        });
    }

    if (btnOpenReceipt) {
        btnOpenReceipt.addEventListener('click', () => {
            window.openReceiptModal();
        });
    }

    if (inputMoisture) {
        inputMoisture.addEventListener('input', (e) => {
            const m = parseFloat(e.target.value);
            MandiState.yardProcessing.moisturePercent = m;
            document.getElementById('valMoisture').textContent = `${m.toFixed(1)}%`;
            const gradeEl = document.getElementById('valGrade');

            if (m <= 12.0) {
                MandiState.yardProcessing.qualityGrade = 'FAQ Grade A';
                MandiState.yardProcessing.gradeDiscount = 0;
                if (gradeEl) {
                    gradeEl.textContent = 'FAQ Grade A (Full MSP)';
                    gradeEl.style.color = 'var(--green-300)';
                }
            } else if (m <= 14.0) {
                MandiState.yardProcessing.qualityGrade = 'Grade B (Moisture Deduction)';
                MandiState.yardProcessing.gradeDiscount = 25; // ₹25/qtl deduction
                if (gradeEl) {
                    gradeEl.textContent = 'Grade B (-₹25/Qtl discount)';
                    gradeEl.style.color = 'var(--gold-400)';
                }
            } else {
                MandiState.yardProcessing.qualityGrade = 'Under-Grade (High Moisture)';
                MandiState.yardProcessing.gradeDiscount = 60;
                if (gradeEl) {
                    gradeEl.textContent = 'Under-Grade (>14% Moisture)';
                    gradeEl.style.color = '#fca5a5';
                }
            }
            updatePaymentSummaryUI();
        });
    }
}

function advanceStage() {
    let current = MandiState.yardProcessing.currentStage;
    if (current < 5) {
        current++;
        MandiState.yardProcessing.currentStage = current;
        renderStageUI(current);
        const stageNames = ['', 'Gate Verified', 'Quality Assayed', 'Weighed on Scale', 'Procurement & MSP Approved', 'Unloaded at Bay'];
        showToast(`Stage ${current} Completed: ${stageNames[current]}`, 'success');
    } else {
        showToast('All 5 procurement stages completed. Payment voucher ready for DBT transfer.', 'info');
    }
}

function fastForwardWorkflow() {
    showToast('Fast-forwarding procurement journey across all 5 stages…', 'info');
    let s = 1;
    const interval = setInterval(() => {
        renderStageUI(s);
        s++;
        if (s > 5) {
            clearInterval(interval);
            MandiState.yardProcessing.currentStage = 5;
            showToast('✅ Full journey executed: Gate -> Assaying -> Scale -> MSP -> Bay 04 Stacked.', 'success');
        }
    }, 600);
}

function resetWorkflow() {
    MandiState.yardProcessing.currentStage = 1;
    renderStageUI(1);
    showToast('Procurement stages reset to Gate Entry.', 'info');
}

function renderStageUI(stage) {
    const steps = [
        document.getElementById('procStep1'),
        document.getElementById('procStep2'),
        document.getElementById('procStep3'),
        document.getElementById('procStep4'),
        document.getElementById('procStep5')
    ];
    const badges = [
        document.getElementById('procBadge1'),
        document.getElementById('procBadge2'),
        document.getElementById('procBadge3'),
        document.getElementById('procBadge4'),
        document.getElementById('procBadge5')
    ];
    const times = [
        document.getElementById('procTime1'),
        document.getElementById('procTime2'),
        document.getElementById('procTime3'),
        document.getElementById('procTime4'),
        document.getElementById('procTime5')
    ];

    steps.forEach((step, idx) => {
        if (!step) return;
        step.classList.remove('active-stage');
        const num = idx + 1;
        if (num < stage) {
            if (badges[idx]) {
                badges[idx].className = 'proc-badge proc-completed';
                badges[idx].textContent = 'Completed';
            }
            if (times[idx] && times[idx].textContent === '—') times[idx].textContent = '09:25 AM';
        } else if (num === stage) {
            step.classList.add('active-stage');
            if (badges[idx]) {
                badges[idx].className = 'proc-badge proc-progress';
                badges[idx].textContent = 'In Progress';
            }
            if (times[idx]) times[idx].textContent = 'Live Now';
        } else {
            if (badges[idx]) {
                badges[idx].className = 'proc-badge proc-pending';
                badges[idx].textContent = 'Pending';
            }
            if (times[idx]) times[idx].textContent = '—';
        }
    });

    // Update queue position stepper
    const qpSteps = document.querySelectorAll('.qp-step');
    qpSteps.forEach((qp, i) => {
        qp.classList.remove('active', 'completed');
        if (i < stage) qp.classList.add('completed');
        else if (i === stage) qp.classList.add('active');
    });
}

/* ───── Payment Summary & MSP Calculation ───── */
function updatePaymentSummaryUI() {
    const { cropName, mspRate } = MandiState.currentSlot;
    const { netWeight, gradeDiscount, qualityGrade } = MandiState.yardProcessing;

    const effectiveRate = Math.max(100, mspRate - gradeDiscount);
    const totalAmount = netWeight * effectiveRate;
    MandiState.yardProcessing.netPayable = totalAmount;

    // Payment card fields
    const cropEl = document.getElementById('payCrop');
    const grossEl = document.getElementById('payGross');
    const tareEl = document.getElementById('payTare');
    const netEl = document.getElementById('payNet');
    const mspEl = document.getElementById('payMsp');
    const totalEl = document.getElementById('payTotal');
    const bankEl = document.getElementById('payBank');
    const stepSettlement = document.getElementById('valStepSettlement');

    if (cropEl) cropEl.textContent = `${cropName} — ${qualityGrade}`;
    if (grossEl) grossEl.textContent = `${MandiState.yardProcessing.grossWeight.toFixed(2)} Quintals`;
    if (tareEl) tareEl.textContent = `${MandiState.yardProcessing.tareWeight.toFixed(2)} Quintals`;
    if (netEl) netEl.textContent = `${netWeight.toFixed(2)} Quintals`;
    if (mspEl) mspEl.textContent = `₹ ${effectiveRate.toFixed(2)} / Qtl`;
    if (totalEl) totalEl.textContent = `₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (stepSettlement) stepSettlement.textContent = `₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (bankEl) bankEl.textContent = `${MandiState.farmer.bankAcc} (${MandiState.farmer.bankIfsc})`;

    // J-Form modal fields
    const jCrop = document.getElementById('jformCrop');
    const jGrade = document.getElementById('jformGrade');
    const jMoisture = document.getElementById('jformMoisture');
    const jGross = document.getElementById('jformGross');
    const jTare = document.getElementById('jformTare');
    const jNet = document.getElementById('jformNet');
    const jMsp = document.getElementById('jformMsp');
    const jAmount = document.getElementById('jformAmount');
    const jTotalVal = document.getElementById('jformTotalVal');

    if (jCrop) jCrop.textContent = cropName;
    if (jGrade) jGrade.textContent = qualityGrade;
    if (jMoisture) jMoisture.textContent = `${MandiState.yardProcessing.moisturePercent.toFixed(1)}% (Allowed: 12%)`;
    if (jGross) jGross.textContent = MandiState.yardProcessing.grossWeight.toFixed(2);
    if (jTare) jTare.textContent = MandiState.yardProcessing.tareWeight.toFixed(2);
    if (jNet) jNet.textContent = netWeight.toFixed(2);
    if (jMsp) jMsp.textContent = `₹ ${effectiveRate.toFixed(2)}`;
    if (jAmount) jAmount.textContent = `₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (jTotalVal) jTotalVal.textContent = `₹ ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

/* ───── Dynamic Exception Management Simulator (Slide 2 & 4) ───── */
function initExceptionSimulator() {
    const btnLate = document.getElementById('btnSimLate');
    const btnWalkin = document.getElementById('btnSimWalkin');
    const btnNoShow = document.getElementById('btnSimNoShow');
    const btnBreakdown = document.getElementById('btnSimBreakdown');
    const btnReset = document.getElementById('btnSimResetExceptions');

    if (btnLate) {
        btnLate.addEventListener('click', () => {
            showToast('🕐 Late Arrival Triggered: Token MF-2026-4821 arrived 35m past slot window.', 'warning');
            addExceptionAuditLog('AUTO-RESOLVE', 'Token MF-4821 late: Reassigned to priority Buffer Lane #2. On-time farmers unaffected.');
            const posEl = document.getElementById('queuePosition');
            if (posEl) posEl.textContent = '2';
            const etaEl = document.getElementById('etaTime');
            if (etaEl) etaEl.textContent = '~10 min';
        });
    }

    if (btnWalkin) {
        btnWalkin.addEventListener('click', () => {
            const walkinToken = 'MF-WALK-' + (100 + Math.floor(Math.random() * 89));
            MandiState.queue.push({
                pos: MandiState.queue.length + 1,
                token: walkinToken,
                name: 'Baldev Singh (Walk-in)',
                crop: 'Soybean (सोयाबीन)',
                qty: 35,
                status: 'Waiting',
                statusClass: 'q-waiting',
                time: 'Just now'
            });
            renderQueueTable('all');
            showToast(`🚶 Unregistered farmer arrived. Spare assaying capacity found; ${walkinToken} issued!`, 'info');
            addExceptionAuditLog('CAPACITY-GAP', `Walk-in farmer Baldev Singh accommodated into Assaying Slack Window. Token ${walkinToken}.`);
        });
    }

    if (btnNoShow) {
        btnNoShow.addEventListener('click', () => {
            const removed = MandiState.queue.splice(1, 1);
            MandiState.queue.forEach((q, i) => q.pos = i + 1);
            renderQueueTable('all');
            showToast(`❌ 15-min grace expired for ${removed[0] ? removed[0].token : 'MF-4819'}. Slot auto-released. Queue advanced!`, 'warning');
            addExceptionAuditLog('AUTO-RELEASE', 'No-show grace period expired. Slot released to waitlist. Queue advanced.');
            const posEl = document.getElementById('queuePosition');
            if (posEl) posEl.textContent = '3';
            const etaEl = document.getElementById('etaTime');
            if (etaEl) etaEl.textContent = '~15 min';
        });
    }

    if (btnBreakdown) {
        btnBreakdown.addEventListener('click', () => {
            const btnB2 = document.getElementById('btnToggleBridge2');
            if (btnB2) btnB2.click();
        });
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            showToast('🔄 Exception parameters rebalanced. Baseline queue restored.', 'success');
            addExceptionAuditLog('RESET', 'Yard operational parameters restored to baseline.');
        });
    }
}

function addExceptionAuditLog(tag, text) {
    const log = document.getElementById('exceptionAuditLog');
    if (!log) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const div = document.createElement('div');
    div.className = 'audit-entry';
    div.innerHTML = `
        <span class="audit-time">[${timeStr}]</span>
        <span class="audit-tag ${tag.includes('FAULT') ? 'error' : tag.includes('RESOLVE') ? 'success' : 'warning'}">${tag}</span>
        <span>${text}</span>
    `;
    log.insertBefore(div, log.firstChild);
}

/* ───── Interactive Voice Response (IVR) Phone Simulator ───── */
function initIVRSimulator() {
    const btnOpen = document.getElementById('btnOpenIVR');
    const modal = document.getElementById('ivrModal');
    const btnClose = document.getElementById('closeIVRModal');
    const btnStart = document.getElementById('btnIvrStartCall');
    const btnEnd = document.getElementById('btnIvrEndCall');
    const keys = document.querySelectorAll('.keypad-btn');

    window.openIVRModal = function() {
        if (modal) modal.classList.add('active');
    };

    if (btnOpen) btnOpen.addEventListener('click', window.openIVRModal);
    if (btnClose) btnClose.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
        endIvrCall();
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                endIvrCall();
            }
        });
    }

    if (btnStart) btnStart.addEventListener('click', startIvrCall);
    if (btnEnd) btnEnd.addEventListener('click', endIvrCall);

    keys.forEach(key => {
        key.addEventListener('click', () => {
            const digit = key.getAttribute('data-key');
            handleIvrKeypress(digit);
        });
    });
}

function startIvrCall() {
    MandiState.ivr.isActive = true;
    MandiState.ivr.durationSeconds = 0;
    MandiState.ivr.currentStep = 'root';

    const statusEl = document.getElementById('ivrCallStatus');
    const durEl = document.getElementById('ivrCallDuration');
    const waveEl = document.getElementById('ivrAudioWave');
    if (statusEl) statusEl.textContent = 'Connected (1800-MANDI)';
    if (waveEl) waveEl.style.display = 'flex';

    if (MandiState.ivr.timerInterval) clearInterval(MandiState.ivr.timerInterval);
    MandiState.ivr.timerInterval = setInterval(() => {
        MandiState.ivr.durationSeconds++;
        const m = String(Math.floor(MandiState.ivr.durationSeconds / 60)).padStart(2, '0');
        const s = String(MandiState.ivr.durationSeconds % 60).padStart(2, '0');
        if (durEl) durEl.textContent = `In Call • ${m}:${s}`;
    }, 1000);

    const greetingEn = "Welcome to MandiFlow Kisan Helpline. Press 1 for Slot Booking. Press 2 for Token Details. Press 3 for Live Queue Position. Press 4 for Payment Status. Press 9 for SMS alert.";
    const greetingHi = "मंडीफ्लो किसान सेवा में आपका स्वागत है। स्लॉट बुकिंग के लिए 1 दबाएं। टोकन विवरण के लिए 2 दबाएं। लाइव कतार के लिए 3 दबाएं। भुगतान के लिए 4 दबाएं।";

    const prompt = MandiState.lang === 'hi' ? greetingHi : greetingEn;
    speakIvr(prompt);
}

function endIvrCall() {
    MandiState.ivr.isActive = false;
    if (MandiState.ivr.timerInterval) clearInterval(MandiState.ivr.timerInterval);

    const statusEl = document.getElementById('ivrCallStatus');
    const durEl = document.getElementById('ivrCallDuration');
    const waveEl = document.getElementById('ivrAudioWave');
    const transcriptEl = document.getElementById('ivrTranscript');

    if (statusEl) statusEl.textContent = 'Call Ended';
    if (durEl) durEl.textContent = 'Press Call to redial 1800-MANDI';
    if (waveEl) waveEl.style.display = 'none';
    if (transcriptEl) transcriptEl.textContent = 'Call disconnected. Thank you for using MandiFlow Kisan Helpline.';

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function handleIvrKeypress(key) {
    if (!MandiState.ivr.isActive) {
        startIvrCall();
        return;
    }

    const { cropName, time, token } = MandiState.currentSlot;
    const { netPayable } = MandiState.yardProcessing;

    let response = '';

    switch (key) {
        case '1':
            response = MandiState.lang === 'hi'
                ? "आपकी मंडी क्षमता जांची गई। आज 11:00 बजे का स्लॉट उपलब्ध है। पुष्टि के लिए 1 दबाएं।"
                : "Centre capacity checked. Optimal slot available at 11:00 AM with zero queue wait. Press 1 to confirm.";
            break;
        case '2':
            response = MandiState.lang === 'hi'
                ? `आपका टोकन नंबर ${token} है, फसल ${cropName}, समय ${time}।`
                : `Your active digital token is ${token} for ${cropName}. Arrival window is ${time}.`;
            break;
        case '3':
            response = MandiState.lang === 'hi'
                ? "आप लाइन में नंबर 4 पर हैं। अनुमानित प्रतीक्षा समय लगभग 21 मिनट है।"
                : "You are currently position 4 in the virtual queue. Estimated wait time is approximately 21 minutes.";
            break;
        case '4':
            response = MandiState.lang === 'hi'
                ? `आपकी भुगतान राशि ₹ ${Math.round(netPayable)} पीएफएमएस डीबीटी द्वारा स्वीकृत हो चुकी है।`
                : `Your MSP payment of ₹ ${Math.round(netPayable).toLocaleString('en-IN')} is approved and processing via PFMS Direct Bank Transfer.`;
            break;
        case '9':
            response = MandiState.lang === 'hi'
                ? "एसएमएस टोकन आपके पंजीकृत मोबाइल नंबर पर भेज दिया गया है।"
                : "SMS alert with your digital token pass has been dispatched to your mobile.";
            // Add SMS to inbox
            MandiState.smsMessages.unshift({
                id: Date.now(),
                sender: 'JK-MANDI',
                time: 'Just now',
                text: `Kisan IVR Update: Token ${token} active. Position #4, wait ~21m. Gate #1 check-in ready.`
            });
            updateSmsBadge();
            break;
        case '*':
            MandiState.lang = MandiState.lang === 'hi' ? 'en' : 'hi';
            applyLanguage(MandiState.lang);
            response = MandiState.lang === 'hi' ? "भाषा बदलकर हिन्दी कर दी गई है।" : "Language changed to English.";
            break;
        case '0':
            response = MandiState.lang === 'hi'
                ? "कृपया प्रतीक्षा करें, आपकी कॉल मंडी सहायक अधिकारी को स्थानांतरित की जा रही है।"
                : "Please hold while we connect you to the APMC Mandi Duty Officer.";
            break;
        case '#':
            response = MandiState.lang === 'hi'
                ? "मुख्य मेन्यू: 1 स्लॉट, 2 टोकन, 3 कतार, 4 भुगतान।"
                : "Main Menu: Press 1 for Slot, 2 for Token, 3 for Queue, 4 for Payment.";
            break;
        default:
            response = MandiState.lang === 'hi' ? "अमान्य विकल्प। कृपया 1 से 4 दबाएं।" : "Invalid choice. Please press 1 to 4 or # for main menu.";
    }

    speakIvr(response);
}

function speakIvr(text) {
    const transcriptEl = document.getElementById('ivrTranscript');
    if (transcriptEl) transcriptEl.textContent = text;

    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.lang = MandiState.lang === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
    }
}

/* ───── SMS Messages Simulator (Slide 4) ───── */
function initSMSSimulator() {
    const modal = document.getElementById('smsModal');
    const btnOpen = document.getElementById('btnOpenSMS');
    const btnClose = document.getElementById('closeSMSModal');
    const btnSend = document.getElementById('btnSendSmsQuery');
    const input = document.getElementById('smsQueryInput');

    window.openSMSModal = function() {
        if (modal) {
            renderSmsList();
            modal.classList.add('active');
            const badge = document.getElementById('smsCountBadge');
            if (badge) badge.style.display = 'none';
        }
    };

    if (btnOpen) btnOpen.addEventListener('click', window.openSMSModal);
    if (btnClose) btnClose.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    if (btnSend && input) {
        btnSend.addEventListener('click', () => {
            const val = input.value.trim();
            if (!val) return;
            handleSmsUserQuery(val);
            input.value = '';
        });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                btnSend.click();
            }
        });
    }
}

function renderSmsList() {
    const list = document.getElementById('smsMessagesList');
    if (!list) return;

    list.innerHTML = '';
    MandiState.smsMessages.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'sms-bubble';
        div.innerHTML = `
            <div class="sms-bubble-header">
                <span class="sms-sender">${msg.sender}</span>
                <span class="sms-time">${msg.time}</span>
            </div>
            <div class="sms-text">${msg.text}</div>
        `;
        list.appendChild(div);
    });
}

function handleSmsUserQuery(query) {
    MandiState.smsMessages.unshift({
        id: Date.now(),
        sender: 'YOU (SMS)',
        time: 'Just now',
        text: query
    });

    setTimeout(() => {
        let reply = '';
        const upper = query.toUpperCase();
        if (upper.includes('STATUS') || upper.includes('QUEUE')) {
            reply = `MandiFlow: Token MF-2026-4821 is #4 in line. Est wait 21m. Gate #1. SMS 'CANCEL' to reschedule.`;
        } else if (upper.includes('PAY') || upper.includes('DBT')) {
            reply = `DBT PFMS: Payment of ₹1,10,337.50 initiated for 48.5 Qtl Wheat. Credit to SBI ****4523 within 48h.`;
        } else {
            reply = `Kisan Helpline: Valid commands: STATUS, SLOT, PAYMENT, HELP. Toll-free voice: 1800-MANDI.`;
        }

        MandiState.smsMessages.unshift({
            id: Date.now() + 1,
            sender: 'JK-MANDI',
            time: 'Just now',
            text: reply
        });
        renderSmsList();
        showToast('Incoming SMS from JK-MANDI', 'info');
    }, 700);

    renderSmsList();
}

function updateSmsBadge() {
    const badge = document.getElementById('smsCountBadge');
    if (badge) {
        badge.style.display = 'inline-block';
        badge.textContent = MandiState.smsMessages.length;
    }
}

/* ───── Official Mandi J-Form (e-Bilti) Receipt Modal ───── */
function initReceiptModal() {
    const modal = document.getElementById('receiptModal');
    const btnShow = document.getElementById('btnShowReceipt');
    const btnClose = document.getElementById('closeReceiptModal');

    window.openReceiptModal = function() {
        updatePaymentSummaryUI();
        if (modal) modal.classList.add('active');
    };

    if (btnShow) btnShow.addEventListener('click', window.openReceiptModal);
    if (btnClose) btnClose.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    window.downloadReceiptText = function() {
        const receiptText = `
═══════════════════════════════════════════════════════════
   KRISHI UPAJ MANDI SAMITI — INDORE (M.P.)
   FORM J [Rule 24(1)] — SALE MEMORANDUM & PROCUREMENT BILL
═══════════════════════════════════════════════════════════
Bill No       : IND-2026-098421
Date & Time   : 15-11-2026 09:48 AM
Token No      : ${MandiState.currentSlot.token}
Farmer Name   : ${MandiState.farmer.name}
Aadhaar No    : ${MandiState.farmer.aadhaar}
Land Record   : ${MandiState.farmer.landRecord}
Village       : ${MandiState.farmer.village}, ${MandiState.farmer.district}
Agency        : Food Corporation of India (FCI)

───────────────────────────────────────────────────────────
COMMODITY & QUALITY PARTICULARS
───────────────────────────────────────────────────────────
Produce       : ${MandiState.currentSlot.cropName}
Quality Grade : ${MandiState.yardProcessing.qualityGrade}
Moisture %    : ${MandiState.yardProcessing.moisturePercent}% (Permissible limit: 12.0%)
Gross Weight  : ${MandiState.yardProcessing.grossWeight} Quintals
Tare Weight   : ${MandiState.yardProcessing.tareWeight} Quintals
Net Weight    : ${MandiState.yardProcessing.netWeight} Quintals

Government MSP: ₹ ${MandiState.currentSlot.mspRate} / Quintal
NET PAYABLE   : ₹ ${MandiState.yardProcessing.netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}

───────────────────────────────────────────────────────────
DIRECT BENEFIT TRANSFER (DBT) SETTLEMENT
───────────────────────────────────────────────────────────
Disbursement  : Direct Bank Transfer via PFMS
Bank Account  : ${MandiState.farmer.bankAcc}
Bank IFSC     : ${MandiState.farmer.bankIfsc}
PFMS Batch    : PFMS-AGRI-2026-98124
UTR Reference : RBI2026994821

Digitally Authenticated by Mandi Secretary, APMC Indore.
═══════════════════════════════════════════════════════════
        `;

        const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Mandi_FormJ_${MandiState.currentSlot.token}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Form J e-Receipt downloaded successfully.', 'success');
    };
}

/* ───── System Architecture Modal ───── */
function initArchModal() {
    const modal = document.getElementById('archModal');
    const btnClose = document.getElementById('closeArchModal');

    window.openArchModal = function() {
        if (modal) modal.classList.add('active');
    };

    if (btnClose) btnClose.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
    });

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }
}

/* ───── Notification Panel ───── */
function initNotificationPanel() {
    const btn = document.getElementById('btnNotification');
    const panel = document.getElementById('notificationPanel');
    const closeBtn = document.getElementById('notifClose');
    if (!btn || !panel) return;

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('show');
        const badge = document.getElementById('notifBadge');
        if (badge) badge.style.display = 'none';
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('show');
        });
    }

    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && e.target !== btn) {
            panel.classList.remove('show');
        }
    });
}

/* ───── Toast Notification System ───── */
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: '📢' };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '🌾'}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4200);
}

/* ───── Queue Live Simulation Ticker ───── */
function simulateQueueMovement() {
    const positionEl = document.getElementById('queuePosition');
    const etaEl = document.getElementById('etaTime');
    const ticker = document.getElementById('queueTickerText');

    if (!positionEl || !etaEl) return;

    const tickerAnnouncements = [
        "🌾 Token MF-4819 completed weighing. Proceeding to Unloading Bay #2.",
        "🚚 Weighbridge #1 operational speed optimal: ~7 min per tractor.",
        "🔬 Assaying Lab #3 cleared 12 samples. Zero moisture dispute today.",
        "💰 DBT Treasury batch #98124 cleared. ₹1.4 Crore disbursed to 128 farmers."
    ];
    let tickerIdx = 0;

    setInterval(() => {
        tickerIdx = (tickerIdx + 1) % tickerAnnouncements.length;
        if (ticker) ticker.textContent = tickerAnnouncements[tickerIdx];
    }, 9000);
}
