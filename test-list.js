const BASE = 'http://localhost:5000/api';

async function run() {
    console.log('1. Logging in...');
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'rajesh.kumar@jeevaraksha.in', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    console.log('2. Fetching recent patients (searching for "Test")...');
    const listRes = await fetch(`${BASE}/patients?search=Test&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await listRes.json();
    console.log(`   Total patients: ${data.total}`);
    console.log('   Recent 5 patients:');
    if (data.data) {
        data.data.forEach(p => {
            console.log(`   - ${p.name} (${p.uhid}) Status: ${p.status} Created: ${p.created_at}`);
        });
    } else {
        console.log('   No data array:', data);
    }
}

run().catch(console.error);
