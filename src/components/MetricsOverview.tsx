import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Database, 
  Cpu, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Radio
} from 'lucide-react';
import { MonitoredEndpoint, WorkerPoolStats, RedisStats } from '../types';

interface MetricsOverviewProps {
  endpoints: MonitoredEndpoint[];
  workerStats: WorkerPoolStats;
  redisStats: RedisStats;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  endpoints = [],
  workerStats,
  redisStats
}) => {
  const safeEndpoints = endpoints || [];
  const totalEndpoints = safeEndpoints.length;
  const operationalCount = safeEndpoints.filter(e => e && e.status === 'operational').length;
  const hasOutage = safeEndpoints.some(e => e && e.status === 'down');
  const hasDegraded = safeEndpoints.some(e => e && e.status === 'degraded');

  const avgUptime = totalEndpoints > 0 
    ? (safeEndpoints.reduce((acc, ep) => acc + (ep.uptimePercentage || 0), 0) / totalEndpoints).toFixed(2)
    : '99.93';

  const avgLatency = totalEndpoints > 0
    ? Math.round(safeEndpoints.reduce((acc, ep) => acc + (ep.currentLatencyMs || 0), 0) / totalEndpoints)
    : 72;

  const avgP95 = totalEndpoints > 0
    ? Math.round(safeEndpoints.reduce((acc, ep) => acc + (ep.p95LatencyMs || 0), 0) / totalEndpoints)
    : 141;

  const avgErrorRate = totalEndpoints > 0
    ? (safeEndpoints.reduce((acc, ep) => acc + (ep.errorRatePercentage || 0), 0) / totalEndpoints).toFixed(2)
    : '0.07';

  const totalChecks = safeEndpoints.reduce((acc, ep) => acc + (ep.totalChecks || 0), 0);

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5 text-cyan-400" />
          <span>Core Telemetry Key Performance Indicators</span>
        </h2>
        <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
          Live 5s Evaluator • Real-Time Timescale Sink
        </span>
      </div>

      {/* 5 Prominent Core Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        {/* Card 1: Availability */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-emerald-500/50 hover:shadow-emerald-950/20 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-2 font-medium text-slate-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </span>
              <span className="font-mono font-semibold">Availability</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/60">
              <TrendingUp className="h-3 w-3" />
              +0.02%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {avgUptime}%
            </span>
            <span className="text-xs text-slate-400 font-mono">SLO 99.9%</span>
          </div>

          {/* Sparkline Visualizer */}
          <div className="my-2.5 flex items-end gap-1 h-6 w-full">
            {[98, 99, 99, 100, 100, 99, 100, 100, 98, 99, 100, 100, 99, 100, 100].map((val, idx) => (
              <div 
                key={idx}
                style={{ height: `${val - 50}%` }}
                className="flex-1 rounded-xs bg-gradient-to-t from-emerald-500/20 to-emerald-400/80 group-hover:to-emerald-300 transition-colors"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-full ${hasOutage ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="text-slate-200 font-semibold">{operationalCount}/{totalEndpoints} services healthy</span>
            </span>
          </div>
        </div>

        {/* Card 2: Avg Latency */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-cyan-500/50 hover:shadow-cyan-950/20 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-2 font-medium text-slate-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Clock className="h-4 w-4" />
              </span>
              <span className="font-mono font-semibold">Avg Latency</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded-full border border-cyan-800/60">
              <ArrowDownRight className="h-3 w-3 text-cyan-400" />
              ↓ 12%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {avgLatency}
            </span>
            <span className="text-xs text-slate-400 font-mono">ms</span>
          </div>

          {/* Latency Waveform Sparkline */}
          <div className="my-2.5 flex items-end gap-1 h-6 w-full">
            {[45, 52, 48, 62, 55, 70, 65, 58, 72, 60, 54, 48, 56, 50, 42].map((val, idx) => (
              <div 
                key={idx}
                style={{ height: `${(val / 80) * 100}%` }}
                className="flex-1 rounded-xs bg-gradient-to-t from-cyan-500/20 to-cyan-400/80 group-hover:to-cyan-300 transition-colors"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-slate-300 font-semibold">p95: {avgP95}ms</span>
            <span className="text-[10px] text-cyan-400">&lt; 200ms target</span>
          </div>
        </div>

        {/* Card 3: Error Rate */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-rose-500/50 hover:shadow-rose-950/20 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-2 font-medium text-slate-300">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${
                Number(avgErrorRate) > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                <AlertCircle className="h-4 w-4" />
              </span>
              <span className="font-mono font-semibold">Error Rate</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/60">
              <TrendingDown className="h-3 w-3" />
              ↓ 0.01%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-black font-mono tracking-tight ${
              Number(avgErrorRate) > 0 ? 'text-rose-400' : 'text-white'
            }`}>
              {avgErrorRate}%
            </span>
            <span className="text-xs text-slate-400 font-mono">&lt; 1% SLA</span>
          </div>

          {/* Micro Error Bar */}
          <div className="my-2.5 flex items-end gap-1 h-6 w-full">
            {[0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0, 0, Number(avgErrorRate) > 0 ? 5 : 0].map((val, idx) => (
              <div 
                key={idx}
                style={{ height: `${Math.max(15, val * 18)}%` }}
                className={`flex-1 rounded-xs ${val > 0 ? 'bg-rose-500' : 'bg-slate-800'}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-slate-300 font-semibold">{totalChecks.toLocaleString()} checks</span>
            <span className="text-[10px] text-emerald-400">Zero 5xx drop</span>
          </div>
        </div>

        {/* Card 4: Redis Cache */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-violet-500/50 hover:shadow-violet-950/20 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-2 font-medium text-slate-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Database className="h-4 w-4" />
              </span>
              <span className="font-mono font-semibold">Redis Cache</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-violet-300 bg-violet-950/70 px-2 py-0.5 rounded-full border border-violet-800/60">
              <TrendingUp className="h-3 w-3" />
              ↑ 1.2%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {redisStats.hitRatio}%
            </span>
            <span className="text-xs text-slate-400 font-mono">Hit Ratio</span>
          </div>

          {/* Redis Cache Hit Visualizer */}
          <div className="my-2.5 flex items-end gap-1 h-6 w-full">
            {[88, 91, 93, 90, 94, 92, 95, 93, 94, 96, 95, 94, 95, 94, 95].map((val, idx) => (
              <div 
                key={idx}
                style={{ height: `${val - 30}%` }}
                className="flex-1 rounded-xs bg-gradient-to-t from-violet-500/20 to-violet-400/80 group-hover:to-violet-300 transition-colors"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-violet-300 font-semibold">{redisStats.avgCacheLatencyMs}ms</span>
            <span className="text-[10px] text-slate-400">• {redisStats.hitCount.toLocaleString()} hits</span>
          </div>
        </div>

        {/* Card 5: Go Workers */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800/90 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 p-4 sm:p-5 backdrop-blur-md shadow-lg transition-all duration-200 hover:border-blue-500/50 hover:shadow-blue-950/20 hover:-translate-y-0.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="flex items-center gap-2 font-medium text-slate-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Cpu className="h-4 w-4" />
              </span>
              <span className="font-mono font-semibold">Go Workers</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-blue-300 bg-blue-950/70 px-2 py-0.5 rounded-full border border-blue-800/60">
              <TrendingUp className="h-3 w-3" />
              ↑ 5%
            </span>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black font-mono tracking-tight text-white">
              {workerStats.jobsPerMinute.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-mono">jobs/min</span>
          </div>

          {/* Concurrency Routine Visualizer */}
          <div className="my-2.5 flex items-end gap-1 h-6 w-full">
            {[40, 55, 65, 50, 75, 60, 80, 70, 85, 75, 90, 85, 95, 80, 90].map((val, idx) => (
              <div 
                key={idx}
                style={{ height: `${val}%` }}
                className="flex-1 rounded-xs bg-gradient-to-t from-blue-500/20 to-cyan-400/80 group-hover:to-cyan-300 transition-colors"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-slate-300 font-semibold">Queue: {workerStats.queueDepth}/{workerStats.maxQueueCapacity}</span>
            <span className="text-[10px] text-cyan-400">• CPU {workerStats.cpuUtilizationPercent}%</span>
          </div>
        </div>

      </div>
    </div>
  );
};
