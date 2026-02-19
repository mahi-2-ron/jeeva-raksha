const BASE = 'http://localhost:5000/api';

async function check() {
    try {
        console.log('Checking health...');
        const res = await fetch(`${BASE}/health`);
        if (res.ok) {
            console.log('✅ Server is UP:', await res.json());
        } else {
            console.log('❌ Server returned:', res.status, await res.text());
        }
    } catch (e) {
        console.error('❌ Connection failed:', e.message);
    }
}

check();
