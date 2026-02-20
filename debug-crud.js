const BASE = 'http://localhost:5000/api';

async function run() {
    console.log('1. Logging in as Admin...');
    // Using correct credentials from seed-passwords.js (line 20)
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@jeevaraksha.in', password: 'admin123' })
    });

    // Check if login failed
    if (!loginRes.ok) {
        const errText = await loginRes.text();
        throw new Error(`Login failed: ${loginRes.status} ${errText}`);
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('   Token acquired.');

    // ─── DOCTOR UPDATE TEST ───
    console.log('\n2. Testing Doctor Update...');
    const docsRes = await fetch(`${BASE}/doctors`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const docs = await docsRes.json();
    if (docs.length > 0) {
        const doc = docs[0];
        console.log(`   Fetched Doctor: ${doc.name} (ID: ${doc.id})`);

        const updatePayload = { ...doc, name: doc.name + ' (Updated)' };
        const updateRes = await fetch(`${BASE}/doctors/${doc.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatePayload)
        });

        if (updateRes.status === 500) {
            console.log('   ❌ CRASH CONFIRMED: 500 Internal Server Error on Doctor Update');
            try {
                const err = await updateRes.json();
                console.log('   Error details:', err);
            } catch (e) {
                console.log('   Error details: (Could not parse JSON)');
            }
        } else if (updateRes.ok) {
            console.log('   ✅ Doctor Update SUCCESS');
        } else {
            console.log(`   ⚠️ Doctor Update Unexpected Status: ${updateRes.status}`);
            const text = await updateRes.text();
            console.log('   Response:', text);
        }
    } else {
        console.log('   No doctors found to test update.');
    }

    // ─── PATIENT CREATION TEST ───
    console.log('\n3. Testing Patient Creation...');
    const timestamp = Date.now();
    const newPatient = {
        name: `Test Patient ${timestamp}`,
        date_of_birth: '1990-01-01',
        gender: 'Male',
        phone: '9999999999', // Using a valid phone format just in case
        email: `test.${timestamp}@example.com`,
        address: '123 Test St',
        city: 'Test City',
        state: 'Test State',
        pincode: '123456'
    };

    console.log('   Sending payload:', JSON.stringify(newPatient));

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
        console.log(`   ✅ Patient Created: ${created.name} (ID: ${created.id})`);

        // Verify it appears in the list
        console.log('   Verifying in list...');
        // Wait a bit for any potential async indexing (though Postgres should be immediate)
        await new Promise(r => setTimeout(r, 1000));

        const listRes = await fetch(`${BASE}/patients?search=${encodeURIComponent(created.name)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const list = await listRes.json();
        const found = list.find(p => p.id === created.id);

        if (found) {
            console.log('   ✅ Patient found in list.');
        } else {
            console.log('   ❌ Patient Created but NOT found in list!');
            console.log('   List response:', JSON.stringify(list, null, 2));
        }

    } else {
        console.log(`   ❌ Patient Creation Failed: ${createRes.status}`);
        const text = await createRes.text();
        console.log('   Response:', text);
    }

}

run().catch(console.error);
