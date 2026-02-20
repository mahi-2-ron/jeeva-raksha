const BASE = 'http://localhost:5000/api';
const LOG_TO_CONSOLE = true;

function log(msg) {
    if (LOG_TO_CONSOLE) console.log(msg);
}

async function run() {
    log('🚀 STARTING DOCTOR CRUD CHECK...');

    // 1. Login as Doctor
    log('\n1. 👩‍⚕️ Logging in as Doctor (Aditi Sharma)...');
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'aditi.sharma@jeevaraksha.in', password: 'doctor123' })
    });

    if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
    const loginData = await loginRes.json();
    const token = loginData.token;
    log(`   ✅ Token acquired. Role: ${loginData.user.role}`);

    if (loginData.user.role !== 'doctor') {
        throw new Error(`Expected role 'doctor', got '${loginData.user.role}'`);
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // ─── PATIENTS CRUD as DOCTOR ───
    log('\n2. 🏥 PATIENTS CRUD (Doctor Role)');

    // Create
    const pName = `DocCreated Pat ${Date.now()}`;
    const newPatient = {
        name: pName,
        date_of_birth: '1990-01-01',
        gender: 'Male',
        phone: String(Math.floor(Math.random() * 9000000000) + 1000000000),
        address: 'Clinic Rd'
    };

    const createP = await fetch(`${BASE}/patients`, { method: 'POST', headers, body: JSON.stringify(newPatient) });
    if (!createP.ok) throw new Error(`Doctor Create Patient Failed: ${createP.status} ${await createP.text()}`);
    const createdPatient = await createP.json();
    log(`   ✅ Doctor Created Patient: ${createdPatient.name} (${createdPatient.id})`);

    // Update
    const updateP = await fetch(`${BASE}/patients/${createdPatient.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ address: 'Updated by Doctor' })
    });
    if (!updateP.ok) throw new Error(`Doctor Update Patient Failed: ${updateP.status} ${await updateP.text()}`);
    const updatedPatient = await updateP.json();
    log(`   ✅ Doctor Updated Patient Address: ${updatedPatient.address}`);

    // Soft Delete
    const deleteP = await fetch(`${BASE}/patients/${createdPatient.id}`, { method: 'DELETE', headers });
    if (!deleteP.ok) throw new Error(`Doctor Soft Delete Patient Failed: ${deleteP.status} ${await deleteP.text()}`);
    log(`   ✅ Doctor Soft Deleted Patient`);

    // Verify Soft Delete
    const listP = await fetch(`${BASE}/patients?search=${encodeURIComponent(createdPatient.uhid)}`, { headers });
    const listPData = await listP.json(); // May return empty list or specific error
    // If it returns list structure
    if (listPData.data) {
        const foundP = listPData.data.find(p => p.id === createdPatient.id);
        if (foundP) throw new Error('❌ Patient still visible in list after soft delete!');
    }
    log(`   ✅ Patient successfully removed from active list.`);

    log('\n✨ DOCTOR CRUD CHECKS PASSED!');
}

run().catch(err => {
    console.error('\n❌ TEST FAILED:', err.message);
    process.exit(1);
});
