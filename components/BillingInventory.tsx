
import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, Lock } from 'lucide-react';

const BillingInventory: React.FC = () => {
  const mockTransactions = [
    { id: 'INV-001', patient: 'Anjali Sharma', type: 'IPD/Surge', amount: 48500, status: 'Paid' },
    { id: 'INV-002', patient: 'Vikram Mehta', type: 'OPD/Cons', amount: 1500, status: 'Pending' },
    { id: 'INV-003', patient: 'Rahul Gupta', type: 'Pharmacy', amount: 2850, status: 'Paid' },
    { id: 'INV-004', patient: 'Sneha Rao', type: 'Lab/Diag', amount: 3200, status: 'Overdue' },
  ];

  const mockInventory = [
    { name: 'Adrenaline 1mg Inj.', stock: 124, status: 'Stable' },
    { name: 'Insulin Glargine', stock: 42, status: 'Low Stock' },
    { name: 'Surgical Gloves (Size 7)', stock: 0, status: 'Out of Stock' },
    { name: 'IV Fluid NS 500ml', stock: 840, status: 'Stable' },
  ];

  const [transactions, setTransactions] = useState(mockTransactions);
  const [inventory, setInventory] = useState(mockInventory);
  const [totalRevenue, setTotalRevenue] = useState('₹42,84,500');
  const { canPerformAction } = useAuth();
  const { showToast } = useToast();
  const isAdmin = canPerformAction('BILLING', 'ADMIN');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoices, stock] = await Promise.all([
          api.getInvoices().catch(() => null),
          api.getPharmacyStock().catch(() => null),
        ]);
        if (invoices && invoices.length > 0) {
          setTransactions(invoices.map((inv: any) => ({
            id: inv.invoice_number || inv.id,
            patient: inv.patient_name || 'Unknown',
            type: 'OPD',
            amount: parseFloat(inv.total_amount) || 0,
            status: inv.status === 'paid' ? 'Paid' : inv.status === 'overdue' ? 'Overdue' : 'Pending',
          })));
          const total = invoices.reduce((s: number, i: any) => s + (parseFloat(i.total_amount) || 0), 0);
          setTotalRevenue(`₹${total.toLocaleString('en-IN')}`);
        }
        if (stock && stock.length > 0) {
          setInventory(stock.map((s: any) => ({
            name: s.name || s.drug_name,
            stock: s.quantity_in_stock ?? s.stock ?? 0,
            status: (s.quantity_in_stock ?? s.stock ?? 0) === 0 ? 'Out of Stock' :
              (s.quantity_in_stock ?? s.stock ?? 0) < 50 ? 'Low Stock' : 'Stable',
          })));
        }
      } catch { /* fallback to mock */ }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Revenue & Supply Chain</h2>
          <p className="text-sm font-medium text-slate-500">Financial transparency and critical asset monitoring for Jeeva Raksha.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">Export GSTR-1</button>
          <button
            onClick={() => isAdmin && showToast('info', 'New invoice form opening...')}
            disabled={!isAdmin}
            title={!isAdmin ? "Requires Admin privileges" : "Create new invoice"}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${isAdmin
                ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-700'
                : 'bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed grayscale'
              }`}
          >
            {isAdmin ? <Plus size={14} /> : <Lock size={14} />} New Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Billing Ledger */}
        <div className="lg:col-span-7 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Patient Ledger</h3>
            <div className="relative">
              <input type="text" placeholder="Filter invoices..." className="bg-hospital-bg border border-slate-100 rounded-full py-2 pl-10 pr-4 text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary/20" />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]">🔍</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50">
                  <th className="pb-6">Patient Identifier</th>
                  <th className="pb-6">Service Type</th>
                  <th className="pb-6">Bill Amount</th>
                  <th className="pb-6">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map(t => (
                  <tr key={t.id} className="group hover:bg-hospital-bg transition-colors">
                    <td className="py-6">
                      <p className="font-bold text-slate-900 text-sm">{t.patient}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{t.id}</p>
                    </td>
                    <td className="py-6">
                      <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{t.type}</span>
                    </td>
                    <td className="py-6 text-sm font-black text-slate-900">₹{t.amount.toLocaleString()}</td>
                    <td className="py-6">
                      <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${t.status === 'Paid' ? 'bg-success/5 text-success border-success/10' :
                        t.status === 'Pending' ? 'bg-warning/5 text-warning border-warning/10' : 'bg-danger/5 text-danger border-danger/10'
                        }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pharmacy & Asset Inventory */}
        <div className="lg:col-span-5 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Asset Control</h3>
            <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Audit Inventory</button>
          </div>
          <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {inventory.map(item => (
              <div key={item.name} className="flex items-center justify-between p-5 rounded-[2rem] border border-slate-50 bg-hospital-bg/40 hover:bg-white hover:shadow-lg transition-all cursor-default">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${item.status === 'Stable' ? 'bg-primary/5 text-primary' :
                    item.status === 'Low Stock' ? 'bg-warning/5 text-warning' : 'bg-danger/5 text-danger'
                    }`}>
                    {item.status === 'Out of Stock' ? '📦' : '💊'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-base tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.stock} Units In-Bay</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${item.status === 'Stable' ? 'bg-success/5 text-success border-success/10' :
                    item.status === 'Low Stock' ? 'bg-warning/5 text-warning border-warning/10' : 'bg-danger/5 text-danger border-danger/10'
                    }`}>
                    {item.status}
                  </span>
                  {item.status !== 'Stable' && (
                    <button className="block text-[10px] font-black text-primary uppercase tracking-widest hover:underline mt-2">Expedite</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enterprise Financial Summary */}
      <div className="bg-slate-900 rounded-[4rem] p-16 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
          <div className="space-y-4">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Verified MTD Collections</p>
            <h4 className="text-5xl font-black tracking-tighter">{totalRevenue}</h4>
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-success">
              <span className="bg-success/20 px-3 py-1 rounded-full">▲ 18.2% Growth</span>
            </div>
          </div>
          <div className="space-y-4 border-x border-slate-800">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Pending Claim Approvals</p>
            <h4 className="text-5xl font-black tracking-tighter text-warning">₹3,12,400</h4>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Awaiting TPA Response</p>
          </div>
          <div className="space-y-4">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em]">Insurance Pay-out Ratio</p>
            <h4 className="text-5xl font-black tracking-tighter text-accent">92.4%</h4>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Efficiency: Optimal</p>
          </div>
        </div>

        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2"></div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default BillingInventory;
