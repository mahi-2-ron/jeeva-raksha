
import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import {
    Plug, CheckCircle2, XCircle, AlertTriangle,
    Battery, Search, Plus, Activity
} from 'lucide-react';

const DeviceIntegrations: React.FC = () => {
    const { showToast } = useToast();
    const [syncing, setSyncing] = useState<string | null>(null);

    const [devices, setDevices] = useState([
        { id: 'DEV001', name: 'Philips IntelliVue MX800', type: 'Patient Monitor', location: 'ICU Bay 1', status: 'Online', lastSync: '2 sec ago', battery: null, alerts: 0 },
        { id: 'DEV002', name: 'GE Carescape R860', type: 'Ventilator', location: 'ICU Bay 3', status: 'Online', lastSync: '5 sec ago', battery: null, alerts: 1 },
        { id: 'DEV003', name: 'Masimo Radical-7', type: 'Pulse Oximeter', location: 'Ward 2A', status: 'Online', lastSync: '1 min ago', battery: '82%', alerts: 0 },
        { id: 'DEV004', name: 'Welch Allyn Connex', type: 'Vital Signs Monitor', location: 'OPD Room 4', status: 'Offline', lastSync: '15 min ago', battery: '12%', alerts: 2 },
        { id: 'DEV005', name: 'Siemens Atellica CI', type: 'Lab Analyzer', location: 'Pathology Lab', status: 'Online', lastSync: '30 sec ago', battery: null, alerts: 0 },
        { id: 'DEV006', name: 'Drager Fabius GS', type: 'Anesthesia Machine', location: 'OT-1', status: 'Online', lastSync: '3 sec ago', battery: null, alerts: 0 },
        { id: 'DEV007', name: 'Roche cobas 6800', type: 'Molecular Analyzer', location: 'Microbiology Lab', status: 'Maintenance', lastSync: '2 hrs ago', battery: null, alerts: 1 },
        { id: 'DEV008', name: 'Nellcor PM1000N', type: 'Pulse Oximeter', location: 'Emergency Bay', status: 'Online', lastSync: '8 sec ago', battery: '95%', alerts: 0 },
    ]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDevice, setNewDevice] = useState({ name: '', type: '', location: '', id: '' });

    const handleSync = async (id: string) => {
        setSyncing(id);
        await new Promise(r => setTimeout(r, 1500));
        showToast('success', `Device ${id} re-synced successfully`);
        setSyncing(null);
    };

    const handleAddDevice = (e: React.FormEvent) => {
        e.preventDefault();
        const id = newDevice.id || `DEV${String(devices.length + 1).padStart(3, '0')}`;
        const device = {
            ...newDevice,
            id,
            status: 'Offline', // Default status for new devices
            lastSync: 'Never',
            battery: null,
            alerts: 0
        };
        setDevices([...devices, device as any]);
        setShowAddModal(false);
        setNewDevice({ name: '', type: '', location: '', id: '' });
        showToast('success', 'New device added to registry');
    };

    const online = devices.filter(d => d.status === 'Online').length;
    const offline = devices.filter(d => d.status === 'Offline').length;
    const totalAlerts = devices.reduce((s, d) => s + d.alerts, 0);

    return (
        <div className="max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8 relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Device Integrations</h2>
                    <p className="text-sm font-medium text-slate-500 font-kannada">"ಯಂತ್ರ ಸಂಪರ್ಕ — ನಿರಂತರ ಕಣ್ಗಾವಲು" — Connected devices, continuous monitoring.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => showToast('info', 'Device discovery scan initiated...')} className="px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex items-center gap-2">
                        <Search size={14} /> Scan Network
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Plus size={14} /> Add Device
                    </button>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Devices', value: devices.length.toString(), color: 'text-slate-900', icon: Plug },
                    { label: 'Online', value: online.toString().padStart(2, '0'), color: 'text-success', icon: CheckCircle2 },
                    { label: 'Offline', value: offline.toString().padStart(2, '0'), color: 'text-danger', icon: XCircle },
                    { label: 'Active Alerts', value: totalAlerts.toString().padStart(2, '0'), color: 'text-warning', icon: AlertTriangle },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-slate-400"><s.icon size={20} /></span>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                        </div>
                        <p className={`text-3xl font-black ${s.color} tracking-tighter`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Device List */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connected Medical Devices</h3>
                </div>
                <div className="divide-y divide-slate-50">
                    {devices.map(dev => (
                        <div key={dev.id} className="px-8 py-5 flex items-center gap-6 hover:bg-hospital-bg/50 transition-colors">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${dev.status === 'Online' ? 'bg-success/10 text-success' : dev.status === 'Offline' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                                {dev.status === 'Online' ? <CheckCircle2 size={20} /> : dev.status === 'Offline' ? <XCircle size={20} /> : <AlertTriangle size={20} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-black text-slate-800">{dev.name}</p>
                                <p className="text-[10px] font-bold text-slate-400">{dev.type} • {dev.location} • Last sync: {dev.lastSync}</p>
                            </div>
                            {dev.battery && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <Battery size={14} className={parseInt(dev.battery) < 20 ? 'text-danger' : 'text-success'} />
                                    <span className={`text-[10px] font-black ${parseInt(dev.battery) < 20 ? 'text-danger' : 'text-success'}`}>{dev.battery}</span>
                                </div>
                            )}
                            {dev.alerts > 0 && (
                                <span className="px-2 py-1 bg-danger/10 text-danger rounded-lg text-[8px] font-black uppercase tracking-widest animate-pulse shrink-0">{dev.alerts} Alert{dev.alerts > 1 ? 's' : ''}</span>
                            )}
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shrink-0 ${dev.status === 'Online' ? 'bg-success/10 text-success' : dev.status === 'Offline' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{dev.status}</span>
                            <button onClick={() => handleSync(dev.id)} disabled={syncing === dev.id} className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all disabled:opacity-50 shrink-0">
                                {syncing === dev.id ? <Activity size={14} className="animate-spin" /> : 'Re-Sync'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl">
                        <Plug size={32} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h4 className="text-lg font-black text-white">HL7 FHIR Integration Active</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">All device data streams are HL7/FHIR compliant. Real-time bi-directional sync with central EHR.</p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">FHIR Version</p>
                        <p className="text-lg font-black text-primary mt-1">R4B</p>
                    </div>
                </div>
            </div>

            {/* Add Device Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center animate-in fade-in duration-200 p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">Add Monitoring Device</h2>
                        <form onSubmit={handleAddDevice} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Device Name</label>
                                <input required type="text" placeholder="Ex. Philips IntelliVue" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={newDevice.name} onChange={e => setNewDevice({ ...newDevice, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Device Type</label>
                                    <select required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        value={newDevice.type} onChange={e => setNewDevice({ ...newDevice, type: e.target.value })}>
                                        <option value="">Select Type</option>
                                        <option value="Patient Monitor">Patient Monitor</option>
                                        <option value="Ventilator">Ventilator</option>
                                        <option value="Infusion Pump">Infusion Pump</option>
                                        <option value="Analyzer">Lab Analyzer</option>
                                        <option value="Imaging">Imaging (X-Ray/CT)</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Location</label>
                                    <input required type="text" placeholder="Ex. ICU Bay 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        value={newDevice.location} onChange={e => setNewDevice({ ...newDevice, location: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">Asset ID (Optional)</label>
                                <input type="text" placeholder="Auto-generated if empty" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={newDevice.id} onChange={e => setNewDevice({ ...newDevice, id: e.target.value })} />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-primary/20">Add Device</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeviceIntegrations;
