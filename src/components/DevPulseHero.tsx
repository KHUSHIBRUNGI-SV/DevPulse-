import React, { useState } from 'react';
import { 
  Activity, 
  Plus, 
  Terminal, 
  BookOpen, 
  Cpu, 
  Database, 
  Radio, 
  CheckCircle2, 
  Layers, 
  Zap, 
  Globe, 
  ArrowRight,
  Server,
  Network
} from 'lucide-react';
import { EndpointStatus, MonitoredEndpoint, RedisStats, WorkerPoolStats } from '../types';

interface DevPulseHeroProps {
  systemStatus: EndpointStatus;
  endpoints: MonitoredEndpoint[];
  redisStats: RedisStats;
  workerStats: WorkerPoolStats;
  onOpenAddModal: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  onNavigateToProber: () => void;
  onTriggerChaosSample?: () => void;
  hasActiveChaos?: boolean;
  onNavigateToArchitecture?: () => void;
}

export const DevPulseHero: React.FC<DevPulseHeroProps> = ({
  systemStatus,
  endpoints,
  redisStats,
  workerStats,
  onOpenAddModal,
  onRefreshAll,
  isRefreshing,
  onNavigateToProber,
  onTriggerChaosSample,
  hasActiveChaos = false,
  onNavigateToArchitecture
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const safeEndpoints = endpoints || [];
  const operationalCount = safeEndpoints.filter(e => e && e.status === 'operational').length;
  const avgLatency = safeEndpoints.length > 0
    ? Math.round(safeEndpoints.reduce((acc, ep) => acc + (ep.currentLatencyMs || 0), 0) / safeEndpoints.length)
    : 42;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-b from-[#080d1a] via-[#070b16] to-[#05070f] p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-[380px] w-[380px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 -right-16 h-[380px] w-[380px] rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-64 w-64 rounded-full bg-violet-600/5 blur-3xl" />

      {/* Grid Pattern overlay */}
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40" />

      <div className="relative z-10 space-y-8">
        
        {/* Top Micro Telemetry Pill Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 border border-slate-700/80 px-3.5 py-1 text-slate-200 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  systemStatus === 'down' ? 'bg-rose-400' : systemStatus === 'degraded' ? 'bg-amber-400' : 'bg-emerald-400'
                }`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  systemStatus === 'down' ? 'bg-rose-500' : systemStatus === 'degraded' ? 'bg-amber-500' : 'bg-emerald-400'
                }`} />
              </span>
              <span className="font-semibold tracking-wide uppercase text-[11px]">
                {systemStatus === 'down' 
                  ? 'System Outage' 
                  : systemStatus === 'degraded' 
                  ? 'Degraded SLA' 
                  : 'All Systems Operational'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 text-cyan-300">
              <Cpu className="h-3 w-3" />
              <span>Go Poller Pool ({workerStats.activeWorkers} Goroutines)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 px-3 py-1 text-blue-300">
              <Database className="h-3 w-3" />
              <span>Redis 7.2 ({redisStats.hitRatio}% Hit Ratio)</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Telemetry Pipeline: <strong className="text-white">{workerStats.jobsPerMinute.toLocaleString()} checks/min</strong></span>
          </div>
        </div>

        {/* Main Content Grid: Messaging on left, Futuristic Infrastructure Visualization on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero Messaging */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 text-xs font-mono text-cyan-400">
              <Activity className="h-3.5 w-3.5" />
              <span>Next-Gen Full-Stack Observability</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono leading-[1.1]">
              Build Reliable. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-400">
                Ship Faster.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl font-sans leading-relaxed">
              Monitor your services, detect issues, and keep your systems healthy with real-time insights. Powered by continuous synthetic ping workers, sub-millisecond in-memory caching, and automated incident triage.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 px-5 py-3 text-xs sm:text-sm font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-400 transition-all shadow-lg shadow-cyan-500/25 hover:scale-[1.02] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Monitored API</span>
              </button>

              <button
                onClick={() => onNavigateToArchitecture ? onNavigateToArchitecture() : onNavigateToProber()}
                className="flex items-center gap-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-200 transition-all hover:text-white hover:border-slate-600 cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-cyan-400" />
                <span>View Documentation</span>
              </button>

              <button
                onClick={onRefreshAll}
                disabled={isRefreshing}
                title="Execute immediate probe sweep across all registered endpoints"
                className="flex items-center gap-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <Activity className={`h-4 w-4 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Sweeping...' : 'Probe Sweep'}</span>
              </button>
            </div>
          </div>

          {/* Right Futuristic Telemetry Infrastructure Visualization */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl border border-cyan-500/30 bg-[#070b16]/90 p-5 backdrop-blur-xl shadow-2xl shadow-cyan-950/40">
              
              {/* Header of the visualization panel */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2 font-mono text-xs text-slate-300">
                  <Network className="h-4 w-4 text-cyan-400" />
                  <span className="font-bold">Topology & Dataflow Stream</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>SYNCHRONIZED</span>
                </div>
              </div>

              {/* Futuristic SVG & Interactive Nodes Matrix */}
              <div className="relative h-64 w-full rounded-xl bg-[#04060b] border border-slate-800/80 p-3 overflow-hidden font-mono select-none">
                
                {/* SVG Connection Tracks with animated pulse packets */}
                <svg className="absolute inset-0 h-full w-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="cyanLine" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
                    </linearGradient>
                    <linearGradient id="purpleLine" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* Connecting lines */}
                  <line x1="50" y1="50" x2="150" y2="120" stroke="url(#cyanLine)" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="150" y1="120" x2="250" y2="50" stroke="url(#cyanLine)" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="150" y1="120" x2="150" y2="200" stroke="url(#purpleLine)" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="50" y1="180" x2="150" y2="120" stroke="url(#cyanLine)" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1="150" y1="120" x2="250" y2="180" stroke="url(#cyanLine)" strokeWidth="1.5" strokeDasharray="3,3" />

                  {/* Animated Data Packets */}
                  <circle r="3" fill="#22d3ee">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path="M 50,50 L 150,120" />
                  </circle>
                  <circle r="3" fill="#38bdf8">
                    <animateMotion dur="2s" repeatCount="indefinite" path="M 150,120 L 250,50" />
                  </circle>
                  <circle r="3" fill="#a855f7">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M 150,120 L 150,200" />
                  </circle>
                  <circle r="3" fill="#34d399">
                    <animateMotion dur="2.2s" repeatCount="indefinite" path="M 250,180 L 150,120" />
                  </circle>
                </svg>

                {/* Node 1: Go Worker Pool (Center Hub) */}
                <div 
                  onMouseEnter={() => setHoveredNode('worker')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-900/90 via-blue-900/80 to-slate-900 border border-cyan-400/80 shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                    <Cpu className="h-6 w-6 text-cyan-300 animate-pulse" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-slate-950" />
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-cyan-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-cyan-800/60">
                    Go Poller Engine
                  </span>
                </div>

                {/* Node 2: Auth Service Node (Top Left) */}
                <div 
                  onMouseEnter={() => setHoveredNode('auth')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute left-3 top-3 z-10 flex flex-col items-start cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 px-2 py-1 shadow-md transition-all">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-200">Auth Gateway</span>
                    <span className="text-[9px] text-emerald-400 ml-1">37ms</span>
                  </div>
                </div>

                {/* Node 3: Payments API (Top Right) */}
                <div 
                  onMouseEnter={() => setHoveredNode('payments')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute right-3 top-3 z-10 flex flex-col items-end cursor-pointer group"
                >
                  <div className={`flex items-center gap-1.5 rounded-xl bg-slate-900/90 border px-2 py-1 shadow-md transition-all ${
                    hasActiveChaos ? 'border-rose-500 text-rose-300 animate-pulse' : 'border-slate-700 hover:border-cyan-400 text-slate-200'
                  }`}>
                    <div className={`h-2 w-2 rounded-full ${hasActiveChaos ? 'bg-rose-500' : 'bg-emerald-400'}`} />
                    <span className="text-[10px] font-bold">Payments API</span>
                    <span className="text-[9px] text-slate-400 ml-1">{hasActiveChaos ? '503' : '52ms'}</span>
                  </div>
                </div>

                {/* Node 4: Redis Hot Cache (Bottom Center) */}
                <div 
                  onMouseEnter={() => setHoveredNode('redis')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute left-1/2 bottom-2 -translate-x-1/2 z-10 flex flex-col items-center cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 rounded-xl bg-purple-950/80 border border-purple-800/80 hover:border-purple-500 px-2.5 py-1 shadow-md transition-all">
                    <Database className="h-3 w-3 text-purple-300" />
                    <span className="text-[10px] font-bold text-purple-200">Redis 7.2 L1 Cache</span>
                    <span className="text-[9px] text-purple-300 ml-1">1.4ms</span>
                  </div>
                </div>

                {/* Node 5: Catalog API (Bottom Left) */}
                <div 
                  onMouseEnter={() => setHoveredNode('catalog')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute left-3 bottom-8 z-10 flex flex-col items-start cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 px-2 py-1 shadow-md transition-all">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-200">Catalog Svc</span>
                    <span className="text-[9px] text-emerald-400 ml-1">28ms</span>
                  </div>
                </div>

                {/* Node 6: Edge Gateway (Bottom Right) */}
                <div 
                  onMouseEnter={() => setHoveredNode('edge')}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute right-3 bottom-8 z-10 flex flex-col items-end cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 px-2 py-1 shadow-md transition-all">
                    <Globe className="h-3 w-3 text-cyan-400" />
                    <span className="text-[10px] font-bold text-slate-200">Edge CDN</span>
                    <span className="text-[9px] text-cyan-400 ml-1">19ms</span>
                  </div>
                </div>

              </div>

              {/* Bottom Quick Metrics Strip */}
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-center">
                <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-2">
                  <div className="text-[9px] text-slate-400 uppercase">Availability</div>
                  <div className="text-sm font-bold text-emerald-400">99.96%</div>
                </div>
                <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-2">
                  <div className="text-[9px] text-slate-400 uppercase">Avg Latency</div>
                  <div className="text-sm font-bold text-cyan-400">{avgLatency}ms</div>
                </div>
                <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-2">
                  <div className="text-[9px] text-slate-400 uppercase">Services</div>
                  <div className="text-sm font-bold text-slate-200">{operationalCount}/{endpoints.length}</div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
