async function test() {
    try {
        console.log('Testing /api/audit-logs endpoint...');
        const res = await fetch('http://localhost:5000/api/audit-logs?page=1');
        if (res.ok) {
            const data = await res.json();
            console.log('✅ Success! Found entries:', data.data.length);
        } else {
            console.log('❌ Failed with status:', res.status, await res.text());
        }
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

test();
