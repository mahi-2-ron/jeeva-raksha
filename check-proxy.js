const BASE = 'http://localhost:3000/api';

async function check() {
    try {
        console.log('Checking health through Vite proxy (port 3000)...');
        const res = await fetch(`${BASE}/health`);
        if (res.ok) {
            console.log('✅ Proxy is WORKING:', await res.json());
        } else {
            console.log('❌ Proxy returned error:', res.status, await res.text());
        }
    } catch (e) {
        console.error('❌ Connection to proxy failed:', e.message);
    }
}

check();
