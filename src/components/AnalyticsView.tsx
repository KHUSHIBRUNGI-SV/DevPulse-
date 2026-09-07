import React, { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { 
  BarChart3, 
  Clock, 
  Zap, 
  Database, 
  Activity, 
  ArrowDownRight, 
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Radio,
  Server
} from 'lucide-react';
import { MonitoredEndpoint, RedisStats } from '../types';

interface AnalyticsViewProps {
  endpoints: MonitoredEndpoint[];
  redisStats: RedisStats;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  endpoints = [],
  redisStats
}) => {
  const safeEndpoints = endpoints || [];
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('1h');

  // Filtered endpoints
  const targetEndpoints = useMemo(() => {
    if (selectedEndpointId === 'all') return safeEndpoints;
    return safeEndpoints.filter(ep => ep && ep.id === selectedEndpointId);
  }, [safeEndpoints, selectedEndpointId]);

  // Aggregate Key Performance Indicators
  const metrics = useMemo(() => {
    if (targetEndpoints.length === 0) {
      return { p50: 38, p95: 85, p99: 142, errorRate: 0.05, throughput: 1420, totalVolume: 120278 };
    }
    const avgLatency = Math.round(targetEndpoints.reduce((a, b) => a + b.currentLatencyMs, 0) / targetEndpoints.length);
    const p50 = Math.round(avgLatency * 0.72);
    const p95 = Math.round(targetEndpoints.reduce((a, b) => a + b.p95LatencyMs, 0) / targetEndpoints.length);
    const p99 = Math.round(targetEndpoints.reduce((a, b) => a + b.p99LatencyMs, 0) / targetEndpoints.length);
    const errorRate = (targetEndpoints.reduce((a, b) => a + b.errorRatePercentage, 0) / targetEndpoints.length).toFixed(2);
    const totalVolume = targetEndpoints.reduce((a, b) => a + b.totalChecks, 0);
    const throughput = Math.round(totalVolume / (timeRange === '1h' ? 60 : timeRange === '24h' ? 1440 : 10080));

    return { p50, p95, p99, errorRate: Number(errorRate), throughput, totalVolume };
  }, [targetEndpoints, timeRange]);

  // Generate synthetic timeseries data reflecting live latency, error rates, and throughput
  const chartData = useMemo(() => {
    const pointsCount = timeRange === '1h' ? 24 : timeRange === '24h' ? 24 : 14;
    const baseP50 = metrics.p50;
    const baseP95 = metrics.p95;
    const baseP99 = metrics.p99;
    const hasOutage = targetEndpoints.some(e => e.status === 'down');
    const hasDegraded = targetEndpoints.some(e => e.status === 'degraded');

    return Array.from({ length: pointsCount }, (_, i) => {
      const timeLabel = timeRange === '1h'
        ? `${String(Math.floor((i * 60) / pointsCount)).padStart(2, '0')}:00`
        : timeRange === '24h'
        ? `${String(i).padStart(2, '0')}:00`
        : `Day ${i + 1}`;

      const spike = (hasOutage && i > pointsCount - 5) ? 180 : (hasDegraded && i > pointsCount - 4) ? 80 : 0;
      const noise = (Math.sin(i * 1.3) * 8);

      const p50 = Math.max(12, Math.round(baseP50 + noise * 0.6 + spike * 0.4));
      const p95 = Math.max(p50 + 15, Math.round(baseP95 + noise + spike * 0.8));
      const p99 = Math.max(p95 + 25, Math.round(baseP99 + noise * 1.4 + spike));
      const errorRate = hasOutage && i > pointsCount - 5 ? +(Math.random() * 4 + 2).toFixed(2) : +(Math.random() * 0.1).toFixed(2);
      const reqVolume = Math.round(1200 + Math.sin(i * 0.8) * 350 + (i * 20));

      return {
        time: timeLabel,
        p50,
        p95,
        p99,
        errorRate,
        reqVolume
      };
    });
  }, [timeRange, metrics, targetEndpoints]);

  // Status code distribution
  const statusCodeData = useMemo(() => {
    let s200 = 0, s400 = 0, s429 = 0, s500 = 0, s502 = 0;
    targetEndpoints.forEach(ep => {
      if (ep.status === 'down') {
        s502 += 48;
        s500 += 22;
      } else if (ep.status === 'degraded') {
        s429 += 18;
        s200 += 820;
      } else {
        s200 += 2600;
        s400 += 6;
      }
    });

    return [
      { code: '200 OK', count: s200, fill: '#10b981' },
      { code: '400 Bad Req', count: s400, fill: '#06b6d4' },
      { code: '429 Rate Limit', count: s429, fill: '#f59e0b' },
      { code: '500 Server Err', count: s500, fill: '#f43f5e' },
      { code: '502 Bad Gateway', count: s502, fill: '#e11d48' },
    ];
  }, [targetEndpoints]);

  return (
    <div className="space-y-6">
      
      {/* Header controls: Filter by endpoint, time range selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-xl backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <BarChart3 className="h-5 w-5 text-cyan-400" />
            <span>Performance & Telemetry Trends</span>
          </h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Latency percentiles, error rates, and request throughput aggregated across TimescaleDB sinks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          {/* Endpoint Filter */}
          <select
            value={selectedEndpointId}
            onChange={(e) => setSelectedEndpointId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono text-xs"
          >
            <option value="all">All Services (Aggregate)</option>
            {endpoints.map(ep => (
              <option key={ep.id} value={ep.id}>{ep.name}</option>
            ))}
          </select>

          {/* Time range buttons */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-1">
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === '1h' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              1 Hour
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === '24h' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              24 Hours
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                timeRange === '7d' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800/60' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
          </div>
        </div>
      </div>

      {/* Top Telemetry KPI Row: p50 Latency, p95 Threshold, Error Rate, Throughput, Request Volume */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 font-mono">
        
        {/* p50 Median */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 shadow-md">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>p50 Median</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {metrics.p50}ms
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">50th percentile</div>
        </div>

        {/* p95 Threshold */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 shadow-md">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>p95 Latency</span>
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 mt-1">
            {metrics.p95}ms
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">SLA Target &lt; 250ms</div>
        </div>

        {/* Error Rate */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 shadow-md">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Error Rate</span>
            <span className={`h-2 w-2 rounded-full ${metrics.errorRate > 0 ? 'bg-rose-400' : 'bg-emerald-400'}`} />
          </div>
          <div className={`text-2xl font-black mt-1 ${metrics.errorRate > 0 ? 'text-rose-400' : 'text-slate-100'}`}>
            {metrics.errorRate}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">5xx drop tracking</div>
        </div>

        {/* Throughput */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 shadow-md">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Throughput</span>
            <Radio className="h-3 w-3 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-300 mt-1">
            {metrics.throughput.toLocaleString()}/m
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active routine calls</div>
        </div>

        {/* Request Volume */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-950/70 p-4 shadow-md col-span-2 sm:col-span-1">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Request Volume</span>
            <Activity className="h-3 w-3 text-violet-400" />
          </div>
          <div className="text-2xl font-black text-violet-300 mt-1">
            {metrics.totalVolume.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total checked</div>
        </div>

      </div>

      {/* Main Latency Percentiles Chart (p50, p95, p99) */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              API Latency Distribution Percentiles (p50, p95, p99)
            </h3>
            <div className="flex items-center gap-4 mt-1.5 font-mono text-xs">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                p50 Median ({metrics.p50}ms)
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                p95 Threshold ({metrics.p95}ms)
              </span>
              <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                p99 Tail ({metrics.p99}ms)
              </span>
            </div>
          </div>

          <div className="font-mono text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            SLA Warning Target: &lt; 200ms
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="p50Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="p95Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="p99Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c084fc" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#c084fc" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" unit="ms" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#020617', 
                  borderColor: '#334155', 
                  borderRadius: '0.75rem',
                  fontFamily: 'monospace',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="p99" 
                stroke="#c084fc" 
                strokeWidth={1.5} 
                fillOpacity={1} 
                fill="url(#p99Grad)" 
                name="p99 Latency (ms)"
              />
              <Area 
                type="monotone" 
                dataKey="p95" 
                stroke="#06b6d4" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#p95Grad)" 
                name="p95 Latency (ms)"
              />
              <Area 
                type="monotone" 
                dataKey="p50" 
                stroke="#10b981" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#p50Grad)" 
                name="p50 Latency (ms)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Status Code Breakdown & Throughput Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Status Code Breakdown */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              HTTP Status Code Distribution
            </h3>
            <span className="text-xs font-mono text-slate-500">Live Go telemetry</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusCodeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="code" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#020617', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }} 
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Check Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Throughput & Request Volume Area Chart */}
        <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-blue-400" />
              <span>Throughput & Request Volume</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
              {metrics.throughput}/min AVG
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="reqVolGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#020617', 
                    borderColor: '#334155', 
                    borderRadius: '0.75rem',
                    fontFamily: 'monospace',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="reqVolume" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#reqVolGrad)" 
                  name="Requests Processed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Redis Caching Impact Section */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-950/80 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-purple-400" />
            <span>Redis Cache Performance Impact</span>
          </h3>
          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-800 font-bold">
            {redisStats.hitRatio}% HIT RATIO
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Redis Cache Fetch Latency</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {redisStats.avgCacheLatencyMs}ms
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-emerald-400" />
              98.9% faster than disk query
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">PostgreSQL Disk Read Fallback</div>
            <div className="text-2xl font-black text-amber-400 mt-1">
              142ms
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Cold path query latency
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Queries Avoided via Cache</div>
            <div className="text-2xl font-black text-purple-400 mt-1">
              {redisStats.hitCount.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Protected database load
            </div>
          </div>
        </div>

        {/* Acceleration Visual Bar */}
        <div className="space-y-2 font-mono text-xs">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Cache Efficiency Baseline:</span>
            <span className="text-emerald-400 font-bold">{redisStats.hitRatio}% in-memory</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div style={{ width: `${redisStats.hitRatio}%` }} className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 pt-1">
            <span>RAM: {redisStats.memoryUsedMb}MB Allocated</span>
            <span>Eviction Strategy: allkeys-lru</span>
            <span>Active Keys: {redisStats.keysCount}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
