
const { api } = require('./apiClient'); // This won't work because apiClient is TS and uses import/export.
// I'll make a standalone script using fetch.

const BASE_URL = 'http://localhost:8080/api'; // Assuming running on default port or 8080

async function checkDashboardStats() {
    try {
        console.log('Fetching dashboard stats...');
        const response = await fetch(`${BASE_URL}/dashboard/stats`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const stats = await response.json();
        console.log('Dashboard Stats:', JSON.stringify(stats, null, 2));
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

checkDashboardStats();
