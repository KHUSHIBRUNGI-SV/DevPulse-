import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Layers, 
  AlertOctagon, 
  Terminal, 
  Activity, 
  Sliders, 
  Cpu, 
  Flame, 
  Zap, 
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import { MonitoredEndpoint, Incident } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  endpoints: MonitoredEndpoint[];
  incidents: Incident[];
  onSelectTab: (tab: 'dashboard' | 'endpoints' | 'analytics' | 'incidents' | 'architecture' | 'prober' | 'settings') => void;
  onSelectEndpoint: (endpoint: MonitoredEndpoint) => void;
  onOpenAddModal: () => void;
  onTriggerChaos: (id: string) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  endpoints = [],
  incidents = [],
  onSelectTab,
  onSelectEndpoint,
  onOpenAddModal,
  onTriggerChaos
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEndpoints = (endpoints || []).filter(ep => 
    ep && (
      ep.name.toLowerCase().includes(query.toLowerCase()) ||
      ep.url.toLowerCase().includes(query.toLowerCase()) ||
      ep.category.toLowerCase().includes(query.toLowerCase())
    )
  );

  const filteredIncidents = (incidents || []).filter(inc =>
    inc && (
      inc.title.toLowerCase().includes(query.toLowerCase()) ||
      inc.endpointName.toLowerCase().includes(query.toLowerCase())
    )
  );

  type NavTabId = 'dashboard' | 'endpoints' | 'analytics' | 'incidents' | 'architecture' | 'prober' | 'settings';
  interface NavItem {
    id: NavTabId;
    label: string;
    icon: React.ReactNode;
    desc: string;
  }

  const allNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: <Layers className="h-4 w-4 text-cyan-400" />, desc: 'Real-time telemetry and health status' },
    { id: 'endpoints', label: 'Monitored Endpoints', icon: <Layers className="h-4 w-4 text-emerald-400" />, desc: 'View all services, latencies and SLA history' },
    { id: 'analytics', label: 'Performance Analytics', icon: <Activity className="h-4 w-4 text-sky-400" />, desc: 'p50/p95/p99 latency percentiles and error metrics' },
    { id: 'incidents', label: 'Incidents & Alerts', icon: <AlertOctagon className="h-4 w-4 text-rose-400" />, desc: 'Active outages and alert routing rules' },
    { id: 'architecture', label: 'Go Worker Architecture', icon: <Cpu className="h-4 w-4 text-purple-400" />, desc: 'Go concurrency routines & Redis cache stats' },
    { id: 'prober', label: 'Live cURL Prober', icon: <Terminal className="h-4 w-4 text-amber-400" />, desc: 'Interactive HTTP request and waterfall tester' },
    { id: 'settings', label: 'Platform Settings', icon: <Sliders className="h-4 w-4 text-zinc-400" />, desc: 'Poller frequency, worker concurrency and audio alerts' }
  ];

  const navigationItems: NavItem[] = allNavItems.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-cyan-500/30 bg-slate-950/95 shadow-2xl shadow-cyan-950/50 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle cyan glow header line */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-slate-800/80 px-4 py-3.5">
          <Search className="h-5 w-5 text-cyan-400 shrink-0" />
          <input
            type="text"
            placeholder="Search endpoints, incidents, or jump to any view (Ctrl + K)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none font-mono"
          />
          <button 
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 text-xs font-mono"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4 font-mono text-xs">
          
          {/* Quick Actions */}
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
              <span>Quick Actions</span>
              <span className="text-[9px] text-cyan-400">DevPulse Commands</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <button
                onClick={() => { onOpenAddModal(); onClose(); }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left bg-slate-900/60 hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-700/60 text-slate-200 transition-colors"
              >
                <Plus className="h-4 w-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-semibold text-white">Register New API</div>
                  <div className="text-[10px] text-slate-400">Add endpoint to Go worker pool</div>
                </div>
              </button>

              <button
                onClick={() => { onTriggerChaos('ep-payments'); onClose(); }}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-left bg-slate-900/60 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-700/60 text-slate-200 transition-colors"
              >
                <Flame className="h-4 w-4 text-rose-400 shrink-0" />
                <div>
                  <div className="font-semibold text-rose-300">Simulate Chaos Outage</div>
                  <div className="text-[10px] text-slate-400">Inject 503 into Payments API</div>
                </div>
              </button>
            </div>
          </div>

          {/* Navigation Views */}
          {navigationItems.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-1.5">
                Navigate Platform Views
              </div>
              <div className="space-y-1">
                {navigationItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { onSelectTab(item.id); onClose(); }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-slate-700">
                        {item.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-200 group-hover:text-white">{item.label}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Jump →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Endpoints Match */}
          {filteredEndpoints.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 px-2 mb-1.5 flex items-center justify-between">
                <span>Matching Endpoints ({filteredEndpoints.length})</span>
                <span className="text-[9px] text-emerald-400">Direct Inspect</span>
              </div>
              <div className="space-y-1">
                {filteredEndpoints.slice(0, 5).map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => { onSelectEndpoint(ep); onClose(); }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] font-bold text-cyan-400 border border-slate-800">
                        {ep.method}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200 truncate">{ep.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{ep.url}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className={`text-[10px] font-bold ${
                        ep.status === 'down' ? 'text-rose-400' : ep.status === 'degraded' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {ep.currentLatencyMs}ms
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {ep.uptimePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Incidents Match */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-rose-400 px-2 mb-1.5">
                Incidents & Outages ({filteredIncidents.length})
              </div>
              <div className="space-y-1">
                {filteredIncidents.map(inc => (
                  <button
                    key={inc.id}
                    onClick={() => { onSelectTab('incidents'); onClose(); }}
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 hover:border-rose-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertOctagon className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-rose-200 truncate">{inc.title}</div>
                        <div className="text-[10px] text-rose-400/80 truncate">{inc.endpointName}</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-300">
                      {inc.severity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Command Palette Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-900/50 px-4 py-2.5 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Navigate <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300">↑↓</kbd></span>
            <span>Select <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[10px] text-slate-300">↵</kbd></span>
          </div>
          <span className="text-cyan-400 font-medium">DevPulse Observability Engine</span>
        </div>
      </div>
    </div>
  );
};
