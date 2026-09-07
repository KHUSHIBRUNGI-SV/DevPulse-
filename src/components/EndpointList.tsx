import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Plus, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Pause, 
  ExternalLink,
  ChevronRight,
  Flame,
  Activity,
  Layers,
  Sparkles,
  X,
  RotateCcw
} from 'lucide-react';
import { MonitoredEndpoint } from '../types';
import { EndpointCard } from './EndpointCard';

interface EndpointListProps {
  endpoints: MonitoredEndpoint[];
  onProbeNow: (id: string) => void;
  onTogglePause: (id: string) => void;
  onToggleChaos: (id: string) => void;
  onOpenDetails: (endpoint: MonitoredEndpoint) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  probingEndpointId: string | null;
}

export const EndpointList: React.FC<EndpointListProps> = ({
  endpoints = [],
  onProbeNow,
  onTogglePause,
  onToggleChaos,
  onOpenDetails,
  onDelete,
  onOpenAddModal,
  probingEndpointId
}) => {
  const safeEndpoints = endpoints || [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const domainCategories = [
    { id: 'all', label: 'All Services' },
    { id: 'auth', label: 'Auth' },
    { id: 'payments', label: 'Payments' },
    { id: 'core', label: 'Core APIs' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'external', label: 'External' },
  ];

  const counts = {
    all: safeEndpoints.length,
    operational: safeEndpoints.filter(e => e && e.status === 'operational').length,
    degraded: safeEndpoints.filter(e => e && e.status === 'degraded').length,
    down: safeEndpoints.filter(e => e && e.status === 'down').length,
  };

  const statusChips = [
    { id: 'all', label: 'All', count: counts.all, dotColor: null },
    { id: 'operational', label: 'Up', count: counts.operational, dotColor: 'bg-emerald-400' },
    { id: 'degraded', label: 'Degraded', count: counts.degraded, dotColor: 'bg-amber-400' },
    { id: 'down', label: 'Down', count: counts.down, dotColor: 'bg-rose-400' },
  ];

  const filteredEndpoints = useMemo(() => {
    return safeEndpoints.filter(ep => {
      if (!ep) return false;
      // Search matching name, url, tags
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        (ep.name && ep.name.toLowerCase().includes(query)) ||
        (ep.url && ep.url.toLowerCase().includes(query)) ||
        (ep.category && ep.category.toLowerCase().includes(query)) ||
        (ep.tags && ep.tags.some(t => t.toLowerCase().includes(query)));
      
      // Domain category
      const matchesCategory = selectedCategory === 'all' || ep.category === selectedCategory;

      // Status
      const matchesStatus = selectedStatus === 'all' || ep.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [safeEndpoints, searchQuery, selectedCategory, selectedStatus]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  return (
    <div className="space-y-6">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2.5">
              <Layers className="h-6 w-6 text-cyan-400" />
              <span>Monitored Service Endpoints</span>
            </h2>
            <span className="rounded-full bg-slate-800/90 border border-slate-700/80 px-2.5 py-0.5 text-xs font-mono font-bold text-cyan-300">
              {filteredEndpoints.length} of {endpoints.length} Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-sans mt-1">
            Real-time latency breakdown, SLA status, and synthetic health evaluations polled continuously by Go background workers.
          </p>
        </div>

        {/* View Mode Toggle & Add Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1 text-xs">
            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' 
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs tracking-tight shadow-md shadow-cyan-500/20 transition-all hover:scale-105 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add API</span>
          </button>
        </div>
      </div>

      {/* Filter Dock: Search + Status Chips + Domain Filters */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
        
        {/* Top Filter Row: Search Input + Status Chips */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Endpoints */}
          <div className="relative flex-1 max-w-lg">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search endpoints by name, URL, method or #tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-9 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none font-mono transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Chips: All, Up, Degraded, Down */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="text-[11px] text-slate-400 font-semibold mr-1">Status:</span>
            {statusChips.map(chip => {
              const isActive = selectedStatus === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => setSelectedStatus(chip.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                    isActive
                      ? 'bg-cyan-950/80 border-cyan-600 text-cyan-300 shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {chip.dotColor && (
                    <span className={`h-2 w-2 rounded-full ${chip.dotColor} ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                  <span>{chip.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                    isActive ? 'bg-cyan-900/80 text-cyan-200' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Domain Filters: All Services, Auth, Payments, Core APIs, Catalog, Notifications, External */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <span className="text-[11px] text-slate-400 font-semibold mr-2 flex items-center gap-1">
            <Filter className="h-3 w-3 text-cyan-400" />
            Domains:
          </span>

          {domainCategories.map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-900/60 to-blue-900/60 border-cyan-500/70 text-cyan-200 shadow-xs'
                    : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 font-medium cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Endpoint Content: Grid View or Table View */}
      {filteredEndpoints.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-12 text-center font-mono space-y-3">
          <Layers className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-200">No matching endpoints found</h3>
          <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
            No service matched your current search filters. Try adjusting your query or resetting all filters.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredEndpoints.map(endpoint => (
            <EndpointCard
              key={endpoint.id}
              endpoint={endpoint}
              onProbeNow={onProbeNow}
              onTogglePause={onTogglePause}
              onToggleChaos={onToggleChaos}
              onOpenDetails={onOpenDetails}
              onDelete={onDelete}
              isProbing={probingEndpointId === endpoint.id}
            />
          ))}
        </div>
      ) : (
        /* Compact High-Density Table View */
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 overflow-hidden shadow-xl font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400">
                  <th className="p-3.5 pl-5">Service & Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Latency</th>
                  <th className="p-3.5">p95 / SLA</th>
                  <th className="p-3.5">30d Uptime</th>
                  <th className="p-3.5">Total Checks</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEndpoints.map(ep => (
                  <tr 
                    key={ep.id}
                    onClick={() => onOpenDetails(ep)}
                    className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-cyan-400 border border-slate-800">
                          {ep.method}
                        </span>
                        <div>
                          <div className="font-bold text-white hover:text-cyan-400 transition-colors">
                            {ep.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs">{ep.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        ep.status === 'down' 
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : ep.status === 'degraded'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          ep.status === 'down' ? 'bg-rose-400' : ep.status === 'degraded' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                        {ep.status === 'down' ? 'OUTAGE' : ep.status === 'degraded' ? 'DEGRADED' : 'OPERATIONAL'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`font-bold ${
                        ep.status === 'down' ? 'text-rose-400' : ep.currentLatencyMs > 200 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {ep.status === 'down' ? 'TIMEOUT' : `${ep.currentLatencyMs}ms`}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">
                      {ep.p95LatencyMs}ms <span className="text-[10px] text-slate-500">(limit {ep.latencyThresholdMs}ms)</span>
                    </td>
                    <td className="p-3.5 text-emerald-400 font-bold">
                      {ep.uptimePercentage.toFixed(2)}%
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {ep.totalChecks.toLocaleString()}
                    </td>
                    <td className="p-3.5 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onProbeNow(ep.id)}
                          disabled={probingEndpointId === ep.id}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
                          title="Instant Probe"
                        >
                          <Zap className={`h-3.5 w-3.5 text-amber-400 ${probingEndpointId === ep.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => onOpenDetails(ep)}
                          className="px-2 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60 text-[11px] font-bold transition-colors"
                        >
                          Deep Dive →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
