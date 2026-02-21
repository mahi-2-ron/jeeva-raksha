// Jeeva Raksha — Frontend API Client v2.1

const VITE_API_URL = (import.meta as any).env?.VITE_API_URL;
const BASE = VITE_API_URL
    ? (VITE_API_URL.endsWith('/api') ? VITE_API_URL : (VITE_API_URL.endsWith('/') ? VITE_API_URL + 'api' : VITE_API_URL + '/api'))
    : '/api';
export const API_BASE = BASE;
console.log('[API CONFIG] Using backend:', BASE === '/api' ? 'Relative (/api)' : BASE);

// ─── Token management ────────────────────────────────────────
function getToken(): string | null {
    return localStorage.getItem('jrk_token') || sessionStorage.getItem('jrk_token');
}

function getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// ─── Base request ────────────────────────────────────────────
async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const res = await fetch(`${BASE}${url}`, {
            headers: getHeaders(),
            signal: controller.signal,
            ...options,
        });
        clearTimeout(id);

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            // Auto-logout on 401
            if (res.status === 401 && err.expired) {
                localStorage.removeItem('jrk_token');
                sessionStorage.removeItem('jrk_token');
                window.location.reload();
            }
            throw new Error(err.error || err.message || `API Error: ${res.status}`);
        }
        return res.json();
    } catch (err: any) {
        clearTimeout(id);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out. Please check your connection or server status.');
        }
        throw err;
    }
}

// ─── API ─────────────────────────────────────────────────────
export const api = {
    // Auth
    auth: {
        login: (email: string, password: string) =>
            request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
        demo: (role?: string) =>
            request<any>('/auth/demo', { method: 'POST', body: JSON.stringify({ role }) }),
        me: () => request<any>('/auth/me'),
        logout: () => request<any>('/auth/logout', { method: 'POST' }),
    },

    // Patients
    getPatients: async (search?: string, status?: string) => {
        const res = await request<any>(`/patients${search ? `?search=${encodeURIComponent(search)}` : ''}${status ? `${search ? '&' : '?'}status=${status}` : ''}`);
        // Handle paginated response { data: [], total: ... } vs flat array []
        return Array.isArray(res) ? res : (res.data || []);
    },
    getPatient: (id: string) => request<any>(`/patients/${id}`),
    getPatientByUHID: (uhid: string) => request<any>(`/patients/uhid/${encodeURIComponent(uhid)}`),
    createPatient: (data: any) => request<any>('/patients', { method: 'POST', body: JSON.stringify(data) }),
    updatePatient: (id: string, data: any) => request<any>(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deletePatient: (id: string, hard = false) => request<any>(`/patients/${id}${hard ? '?hard=true' : ''}`, { method: 'DELETE' }),

    // Doctors
    getDoctors: (search?: string, department?: string) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (department) params.set('department', department);
        const qs = params.toString();
        return request<any[]>(`/doctors${qs ? `?${qs}` : ''}`);
    },
    getDoctor: (id: string) => request<any>(`/doctors/${id}`),
    createDoctor: (data: any) => request<any>('/doctors', { method: 'POST', body: JSON.stringify(data) }),
    updateDoctor: (id: string, data: any) => request<any>(`/doctors/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteDoctor: (id: string, hard = false) => request<any>(`/doctors/${id}${hard ? '?hard=true' : ''}`, { method: 'DELETE' }),

    // Appointments
    getAppointments: (filters?: { doctor_id?: string; status?: string; date?: string }) => {
        const params = new URLSearchParams(filters as any).toString();
        return request<any[]>(`/appointments${params ? `?${params}` : ''}`);
    },
    createAppointment: (data: any) => request<any>('/appointments', { method: 'POST', body: JSON.stringify(data) }),
    updateAppointmentStatus: (id: string, status: string) =>
        request<any>(`/appointments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

    // Visits
    getVisits: (filters?: { patient_id?: string; type?: string }) => {
        const params = new URLSearchParams(filters as any).toString();
        return request<any[]>(`/visits${params ? `?${params}` : ''}`);
    },
    createVisit: (data: any) => request<any>('/visits', { method: 'POST', body: JSON.stringify(data) }),

    // Labs
    getLabOrders: (filters?: { patient_id?: string; status?: string }) => {
        const params = new URLSearchParams(filters as any).toString();
        return request<any[]>(`/labs/orders${params ? `?${params}` : ''}`);
    },
    createLabOrder: (data: any) => request<any>('/labs/orders', { method: 'POST', body: JSON.stringify(data) }),
    createLabResult: (data: any) => request<any>('/labs/results', { method: 'POST', body: JSON.stringify(data) }),

    // Pharmacy
    getPharmacyStock: (search?: string) =>
        request<any[]>(`/pharmacy/stock${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    getPrescriptions: (patient_id?: string) =>
        request<any[]>(`/pharmacy/prescriptions${patient_id ? `?patient_id=${patient_id}` : ''}`),
    createPrescription: (data: any) => request<any>('/pharmacy/prescriptions', { method: 'POST', body: JSON.stringify(data) }),

    // Billing
    getInvoices: (filters?: { patient_id?: string; status?: string }) => {
        const params = new URLSearchParams(filters as any).toString();
        return request<any[]>(`/billing/invoices${params ? `?${params}` : ''}`);
    },
    createInvoice: (data: any) => request<any>('/billing/invoices', { method: 'POST', body: JSON.stringify(data) }),
    createPayment: (data: any) => request<any>('/billing/payments', { method: 'POST', body: JSON.stringify(data) }),
    getInsuranceClaims: () => request<any[]>('/billing/insurance-claims'),

    // Wards & Beds
    getWards: () => request<any[]>('/wards'),
    createWard: (data: any) => request<any>('/wards', { method: 'POST', body: JSON.stringify(data) }),
    updateWard: (id: string, data: any) => request<any>(`/wards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteWard: (id: string) => request<any>(`/wards/${id}`, { method: 'DELETE' }),

    getBeds: (ward_id?: string) => request<any[]>(`/beds${ward_id ? `?ward_id=${ward_id}` : ''}`),
    createBed: (data: any) => request<any>('/beds', { method: 'POST', body: JSON.stringify(data) }),
    updateBed: (id: string, data: any) => request<any>(`/beds/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteBed: (id: string) => request<any>(`/beds/${id}`, { method: 'DELETE' }),
    updateBedStatus: (id: string, status: string) =>
        request<any>(`/beds/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

    // Dashboard
    getDashboardStats: () => request<any>('/dashboard/stats'),

    // Audit
    getAuditLogs: (page?: number) => request<any>(`/audit-logs?page=${page || 1}`),
    createAuditLog: (data: { action: string; entity_type?: string; entity_id?: string; details?: string }) =>
        request<any>('/audit-logs', { method: 'POST', body: JSON.stringify(data) }),

    // Health
    healthCheck: () => request<any>('/health'),
};

export default api;
