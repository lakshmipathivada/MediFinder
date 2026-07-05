import React, { useState } from 'react';
import { RegisteredCustomer, SearchQueryLog } from '../types';
import { store } from '../services/store';
import { Users, Search, HelpCircle, ShieldAlert, Trash2, X, RefreshCw, Smartphone, ClipboardList, Calendar, Eye, MapPin } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
  customers: RegisteredCustomer[];
  logs: SearchQueryLog[];
  onResetData: () => void;
}

export default function AdminPanel({ onClose, customers, logs, onResetData }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    l => 
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.customerPhone.includes(searchTerm)
  );

  const filteredCustomers = customers.filter(
    c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Semi-transparent backdrop blur */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-full border-l border-slate-150 dark:border-slate-850 animate-slide-up sm:animate-scale-in">
          
          {/* Header Panel */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#e6f8f7] text-[#0bbbb6] rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">Admin Console</h2>
                <p className="text-[10px] text-slate-400 font-mono font-bold tracking-wide uppercase">Realtime Network Analytics</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* KPI statistics cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f0fcfb] dark:bg-teal-950/20 border border-[#cbebe9] dark:border-teal-900/40 p-4 rounded-2xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-[#098b87] uppercase tracking-wider">Registered Patients</span>
                  <Users className="w-4 h-4 text-[#0bbbb6]" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {customers.length}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Active Indian Patient Nodes</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Queries Captured</span>
                  <ClipboardList className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {logs.length}
                </div>
                <p className="text-[9px] text-slate-400 mt-1">Medicine search logs</p>
              </div>
            </div>

            {/* Filter Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Filter customers or query history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-[#0bbbb6] focus:ring-1 focus:ring-[#0bbbb6] transition text-slate-800 dark:text-slate-150"
              />
            </div>

            {/* SECTION 1: Registered Customers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#0bbbb6]" />
                  Registered Customers ({customers.length})
                </h3>
              </div>

              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[240px] overflow-y-auto scrollbar-none divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching customers registered.
                  </div>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isOnline = cust.isOnline ?? false;
                    const logins = cust.loginsCount ?? 1;
                    const lastAct = cust.lastActive ? new Date(cust.lastActive) : null;
                    return (
                      <div key={cust.id} className="p-4 bg-white dark:bg-slate-900 text-xs hover:bg-slate-50 dark:hover:bg-slate-850/40 transition space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">{cust.name}</span>
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                isOnline 
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                  : 'bg-slate-100 text-slate-500'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                              <Smartphone className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                              {cust.phone}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Logins Count</span>
                            <span className="text-sm font-extrabold text-slate-700 dark:text-slate-200 font-mono block">
                              {logins}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-50 dark:border-slate-800/40">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            Joined: {new Date(cust.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="font-mono">
                            Last Active: {lastAct ? lastAct.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* SECTION 2: Search logs (What they are asking) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                  What Customers are Asking
                </h3>
                <span className="text-[9px] bg-[#e6f8f7] text-[#0bbbb6] font-mono font-bold px-2 py-0.5 rounded">
                  Live Feed
                </span>
              </div>

              <div className="border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden max-h-[220px] overflow-y-auto scrollbar-none divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.length === 0 ? (
                  <div className="p-5 text-center text-xs text-slate-400">
                    {searchTerm ? 'No logs match search parameters.' : 'No search query activity yet.'}
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="font-extrabold text-xs text-teal-600 dark:text-teal-400 font-mono tracking-tight bg-teal-50 dark:bg-teal-950/20 px-2 py-0.5 rounded-md">
                            {log.query}
                          </span>
                          <p className="text-[10.5px] text-slate-400 font-medium mt-1.5">
                            Asked by: <strong className="text-slate-700 dark:text-slate-200">{log.customerName}</strong> ({log.customerPhone})
                          </p>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                          <Calendar className="w-2.5 h-2.5 text-slate-450" />
                          <span>
                            {new Date(log.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SEED DATABASE CLEANER */}
            <div className="pt-4 border-t border-slate-150 dark:border-slate-800">
              <div className="bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl space-y-2.5">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                  <h4 className="text-xs font-black text-red-700 dark:text-red-400">Developer Testing Sandbox Tools</h4>
                </div>
                <p className="text-[10px] text-red-600/80 dark:text-red-400/80 leading-relaxed">
                  Reset simulated database back to initial clinical default states (restoring Apollo, MedPlus, etc.) and clearing registered customer query feeds.
                </p>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to restore the entire network to clean factory seeds? This resets customers and queries.")) {
                      onResetData();
                      alert("Simulated database has been reset! Pre-seeded Apollo, MedPlus, and logs restored.");
                    }
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 text-xs rounded-lg transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset System Database
                </button>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex justify-between items-center text-[10px] text-slate-400 font-mono">
            <span>Server Ingress: OK</span>
            <span>Security context: ISO27001 compliant</span>
          </div>

        </div>
      </div>
    </div>
  );
}
