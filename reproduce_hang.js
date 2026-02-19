// using global fetch

const BASE = 'http://localhost:3000/api';

async function run() {
    console.log('Testing Vite Proxy via http://localhost:3000/api ...');

    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await fetch(`${BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'rajesh.kumar@jeevaraksha.in', password: 'admin123' })
        });

        if (!loginRes.ok) {
            console.error(`Login failed: ${loginRes.status} ${loginRes.statusText}`);
            const text = await loginRes.text();
            console.error('Response:', text);
            process.exit(1);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('   Login Successful. Token acquired.');

        // 2. Create Patient
        console.log('\n2. Creating Patient...');
        const timestamp = Date.now();
        const newPatient = {
            name: `Proxy Test Patient ${timestamp}`,
            date_of_birth: '1985-05-20',
            gender: 'Female',
            phone: '9876543210',
            email: `proxy.test.${timestamp}@example.com`,
            address: '456 Proxy Lane',
            city: 'Proxyville',
            state: 'TestState',
            pincode: '543210'
        };

        const createRes = await fetch(`${BASE}/patients`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newPatient)
        });

        if (createRes.ok) {
            const created = await createRes.json();
            console.log(`   ✅ Patient Created SUCCESSFULLY via Proxy: ${created.name} (ID: ${created.id})`);
        } else {
            console.error(`   ❌ Patient Creation Failed: ${createRes.status} ${createRes.statusText}`);
            const text = await createRes.text();
            console.error('   Response:', text);
            process.exit(1);
        }

    } catch (err) {
        console.error('   ❌ Network/Proxy Error:', err.message);
        process.exit(1);
    }
}

run();
