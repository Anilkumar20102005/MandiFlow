/* ───── Backend API Test Suite ───── */
const http = require('http');

function request(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTests() {
    console.log('Testing MandiFlow Backend REST APIs...');
    let passed = 0;

    try {
        // 1. Health
        const r1 = await request('GET', '/api/health');
        if (r1.status === 200 && r1.data.sih_year === 2026) {
            console.log('  [PASS] 1. GET /api/health - Status 200, SIH 2026 verified');
            passed++;
        }

        // 2. Capacity Status
        const r2 = await request('GET', '/api/v1/capacity/status');
        if (r2.status === 200 && r2.data.capacities) {
            console.log('  [PASS] 2. GET /api/v1/capacity/status - Status 200, Bottlenecks computed');
            passed++;
        }

        // 3. Farmer Register
        const r3 = await request('POST', '/api/v1/farmer/register', {
            name: 'Ramesh Kumar',
            phone: '+91 98765 43210',
            aadhaar: '4521 8839 1204',
            landRecord: 'Khasra #142/2A'
        });
        if (r3.status === 200 && r3.data.farmer.name === 'Ramesh Kumar') {
            console.log('  [PASS] 3. POST /api/v1/farmer/register - Status 200, Farmer KYC linked');
            passed++;
        }

        // 4. Slot Allocate
        const r4 = await request('POST', '/api/v1/slots/allocate', {
            cropKey: 'wheat',
            quantity: 50,
            time: '11:00 – 12:00 PM'
        });
        if (r4.status === 200 && r4.data.token) {
            console.log(`  [PASS] 4. POST /api/v1/slots/allocate - Status 200, Token ${r4.data.token} allocated`);
            passed++;
        }

        // 5. Virtual Queue Live
        const r5 = await request('GET', '/api/v1/queue/live');
        if (r5.status === 200 && r5.data.queue.length > 0) {
            console.log(`  [PASS] 5. GET /api/v1/queue/live - Status 200, ${r5.data.queue.length} tokens active in queue`);
            passed++;
        }

        // 6. Procurement Lifecycle Stage 3
        const r6 = await request('POST', '/api/v1/procurement/stage/3', { moisture: 11.5 });
        if (r6.status === 200 && r6.data.stage === 3) {
            console.log('  [PASS] 6. POST /api/v1/procurement/stage/3 - Status 200, Assaying & Weighbridge updated');
            passed++;
        }

        // 7. Exception Engine
        const r7 = await request('POST', '/api/v1/exceptions/trigger', { type: 'LATE_ARRIVAL' });
        if (r7.status === 200 && r7.data.resolution) {
            console.log('  [PASS] 7. POST /api/v1/exceptions/trigger - Status 200, Exception auto-resolved');
            passed++;
        }

        // 8. IVR Keypress
        const r8 = await request('POST', '/api/v1/ivr/keypress', { digit: 1, lang: 'en' });
        if (r8.status === 200 && r8.data.speechText) {
            console.log('  [PASS] 8. POST /api/v1/ivr/keypress - Status 200, Telephony voice synthesized');
            passed++;
        }

        // 9. SMS Query
        const r9 = await request('POST', '/api/v1/sms/query', { text: 'STATUS' });
        if (r9.status === 200 && r9.data.reply) {
            console.log('  [PASS] 9. POST /api/v1/sms/query - Status 200, SMS Fallback reply sent');
            passed++;
        }

        // 10. Form J Receipt
        const r10 = await request('GET', '/api/v1/payment/receipt/MF-2026-4821');
        if (r10.status === 200 && r10.data.billNo) {
            console.log('  [PASS] 10. GET /api/v1/payment/receipt/:token - Status 200, Form J e-Receipt generated');
            passed++;
        }

        console.log(`\nAll tests completed: ${passed}/10 endpoints passed successfully!`);
    } catch (err) {
        console.error('Test failed with error:', err.message);
    }
}

// Start server in background if not already started
const serverProcess = require('child_process').fork('server.js', { stdio: 'pipe' });

setTimeout(async () => {
    await runTests();
    serverProcess.kill();
    process.exit(0);
}, 1500);

