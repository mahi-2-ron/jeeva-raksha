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

    console.log('2. Fetching recent audit logs...');
    const listRes = await fetch(`${BASE}/audit-logs?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!listRes.ok) {
        console.log('Audit log fetch failed:', listRes.status);
        console.log(await listRes.text());
        return;
    }

    const data = await listRes.json();
    console.log(`   Total logs: ${data.total}`);
    console.log('   Recent 5 logs:');
    if (data.data) {
        data.data.forEach(l => {
            console.log(`   - [${l.action}] ${l.entity_type} ID: ${l.entity_id} Details: ${l.details} @ ${l.created_at}`);
        });
    } else {
        console.log('   No data array:', data);
    }
}

run().catch(console.error);
