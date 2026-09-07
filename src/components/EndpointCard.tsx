import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Zap, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Pause, 
  Activity,
  Flame,
  ChevronRight,
  ShieldCheck,
  Radio,
  ExternalLink,
  Sliders
} from 'lucide-react';
import { MonitoredEndpoint, HttpMethod } from '../types';

interface EndpointCardProps {
  endpoint: MonitoredEndpoint;
  onProbeNow: (id: string) => void;
  onTogglePause: (id: string) => void;
  onToggleChaos: (id: string) => void;
  onOpenDetails: (endpoint: MonitoredEndpoint) => void;
  onDelete: (id: string) => void;
  isProbing: boolean;
}

const methodStyles: Record<HttpMethod, { badge: string; text: string; dot: string }> = {
  GET: {
    badge: 'bg-emerald-950/70 border-emerald-700/60 text-emerald-300',
    text: 'text-emerald-400',
    dot: 'bg-emerald-400'
  },
  POST: {
    badge: 'bg-cyan-950/70 border-cyan-700/60 text-cyan-300',
    text: 'text-cyan-400',
    dot: 'bg-cyan-400'
  },
  PUT: {
    badge: 'bg-amber-950/70 border-amber-700/60 text-amber-300',
    text: 'text-amber-400',
    dot: 'bg-amber-400'
  },
  DELETE: {
    badge: 'bg-rose-950/70 border-rose-700/60 text-rose-300',
    text: 'text-rose-400',
    dot: 'bg-rose-400'
  },
  PATCH: {
    badge: 'bg-purple-950/70 border-purple-700/60 text-purple-300',
    text: 'text-purple-400',
    dot: 'bg-purple-400'
  },
};

export const EndpointCard: React.FC<EndpointCardProps> = ({
  endpoint,
  onProbeNow,
  onTogglePause,
  onToggleChaos,
  onOpenDetails,
  onDelete,
  isProbing
}) => {
  const [copied, setCopied] = useState(false);
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(endpoint.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    if (endpoint.status === 'paused') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-slate-900 text-slate-400 border border-slate-700">
          <Pause className="h-3 w-3" /> PAUSED
        </span>
      );
    }
    if (endpoint.status === 'down') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-rose-950/90 text-rose-200 border border-rose-600 shadow-md shadow-rose-950/50 animate-pulse">
          <span className="h-2 w-2 rounded-full bg-rose-400 animate-ping" />
          <XCircle className="h-3.5 w-3.5 text-rose-400" />
          <strong className="font-bold tracking-wide">
            OUTAGE ({endpoint.recentPings[endpoint.recentPings.length - 1]?.statusCode || 503})
          </strong>
        </span>
      );
    }
    if (endpoint.status === 'degraded') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-amber-950/90 text-amber-200 border border-amber-600 shadow-md shadow-amber-950/40">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
          <strong className="font-bold tracking-wide">DEGRADED SLA</strong>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-200 border border-emerald-600/70 shadow-md shadow-emerald-950/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <strong className="font-bold tracking-wide">200 OK</strong>
      </span>
    );
  };

  const getLatencyColor = (ms: number) => {
    if (endpoint.status === 'down') return 'text-rose-400';
    if (ms < 80) return 'text-emerald-400';
    if (ms < 200) return 'text-cyan-400';
    if (ms < 350) return 'text-amber-400';
    return 'text-rose-400';
  };

  const methodMeta = methodStyles[endpoint.method] || methodStyles.GET;

  return (
    <div 
      className={`group relative rounded-2xl border p-5 sm:p-6 transition-all duration-300 backdrop-blur-md shadow-xl ${
        endpoint.status === 'down'
          ? 'border-rose-600/80 bg-gradient-to-b from-rose-950/30 via-slate-950 to-slate-950 shadow-rose-950/30'
          : endpoint.status === 'degraded'
          ? 'border-amber-600/80 bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 shadow-amber-950/30'
          : 'border-slate-800/80 bg-gradient-to-b from-slate-900/60 via-slate-950/80 to-slate-950 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-950/20 hover:-translate-y-0.5'
      }`}
    >
      {/* Top Header: HTTP Method, Service Name, Chaos Flag, URL & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Method Badge */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono font-bold rounded-lg border shrink-0 shadow-xs ${methodMeta.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${methodMeta.dot}`} />
            {endpoint.method}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 
                onClick={() => onOpenDetails(endpoint)}
                className="text-base sm:text-lg font-bold text-white hover:text-cyan-400 cursor-pointer truncate transition-colors font-mono tracking-tight"
                title={endpoint.name}
              >
                {endpoint.name}
              </h3>

              {endpoint.inChaos && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800 shadow-sm animate-pulse">
                  <Flame className="h-3 w-3 text-rose-400" />
                  CHAOS {endpoint.inChaos.toUpperCase()}
                </span>
              )}
            </div>

            {/* URL with Copy */}
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
              <span className="truncate max-w-[280px] sm:max-w-[440px] text-slate-400 hover:text-slate-200 transition-colors" title={endpoint.url}>
                {endpoint.url}
              </span>
              <button
                onClick={handleCopyUrl}
                title="Copy API URL"
                className="text-slate-500 hover:text-cyan-400 transition-colors shrink-0 p-0.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-cyan-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {getStatusBadge()}
        </div>
      </div>

      {/* Main Metric Cards: Response Time, p95 Threshold, Uptime %, Total Checks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 font-mono">
        
        {/* Response Time */}
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Response Time</span>
            <Clock className="h-3 w-3 text-slate-400" />
          </div>
          <div className={`text-xl sm:text-2xl font-black mt-1 ${getLatencyColor(endpoint.currentLatencyMs)}`}>
            {endpoint.status === 'down' ? 'TIMEOUT' : `${endpoint.currentLatencyMs}ms`}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Live latency</div>
        </div>

        {/* p95 Threshold */}
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>p95 Threshold</span>
            <Activity className="h-3 w-3 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-200 mt-1">
            {endpoint.p95LatencyMs}ms
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">SLA limit {endpoint.latencyThresholdMs}ms</div>
        </div>

        {/* Uptime */}
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Uptime</span>
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {endpoint.uptimePercentage.toFixed(2)}%
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">{endpoint.uptimePercentage >= 99.9 ? 'Exceeds SLA' : 'Degraded SLA'}</div>
        </div>

        {/* Number of Checks */}
        <div className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/50">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Total Checks</span>
            <Radio className="h-3 w-3 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-300 mt-1">
            {endpoint.totalChecks.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Every {endpoint.intervalSeconds}s</div>
        </div>

      </div>

      {/* 45-Segment Live Trend Chart / SLA Reliability History */}
      <div className="space-y-2 pt-1 font-mono">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">Live Trend Chart (Last 45 Checks)</span>
          </span>
          <span className="text-emerald-400 font-bold">{endpoint.uptimePercentage.toFixed(2)}% SLA Reliability</span>
        </div>

        <div className="relative">
          <div className="flex items-center gap-[3px] h-6 w-full">
            {endpoint.uptimeBars.map((state, idx) => {
              let barColor = 'bg-emerald-500/80 hover:bg-emerald-400 hover:shadow-xs hover:shadow-emerald-500';
              if (state === 'degraded') barColor = 'bg-amber-500 hover:bg-amber-400 hover:shadow-xs hover:shadow-amber-500';
              if (state === 'down') barColor = 'bg-rose-500 hover:bg-rose-400 hover:shadow-xs hover:shadow-rose-500';

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredBarIndex(idx)}
                  onMouseLeave={() => setHoveredBarIndex(null)}
                  title={`Evaluation #${idx + 1}: ${state.toUpperCase()}`}
                  className={`flex-1 h-full rounded-[3px] transition-all duration-150 cursor-pointer ${barColor} ${
                    hoveredBarIndex === idx ? 'scale-y-125 z-10' : ''
                  }`}
                />
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] text-slate-500 pt-1">
            <span>45 checks ago</span>
            <span>Latest evaluation</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Tags & Action Buttons (Probe, Chaos, Deep Dive) */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {endpoint.tags.map(tag => (
            <span 
              key={tag} 
              className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-900 border border-slate-800 text-slate-400"
            >
              #{tag}
            </span>
          ))}
          <span className="text-[11px] font-mono text-slate-500 ml-1">
            Timeout: {endpoint.timeoutMs}ms
          </span>
        </div>

        {/* Action Buttons: Probe, Chaos, Deep Dive */}
        <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-xs">
          
          {/* Probe Button */}
          <button
            onClick={() => onProbeNow(endpoint.id)}
            disabled={isProbing}
            title="Execute instant synthetic probe"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-semibold transition-all hover:scale-105 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <Zap className={`h-3.5 w-3.5 text-amber-400 ${isProbing ? 'animate-spin' : ''}`} />
            <span>{isProbing ? 'Probing...' : 'Probe'}</span>
          </button>

          {/* Chaos Button */}
          <button
            onClick={() => onToggleChaos(endpoint.id)}
            title={endpoint.status === 'down' ? 'Recover endpoint' : 'Simulate synthetic outage (503)'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border font-medium transition-all hover:scale-105 cursor-pointer ${
              endpoint.status === 'down'
                ? 'bg-rose-950 border-rose-700 text-rose-200 hover:bg-rose-900'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-800'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-rose-400" />
            <span className="hidden sm:inline">{endpoint.status === 'down' ? 'Recover' : 'Chaos'}</span>
          </button>

          {/* Deep Dive Button */}
          <button
            onClick={() => onOpenDetails(endpoint)}
            title="Inspect full HTTP request/response metrics, headers, and timing waterfall"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-800/60 font-semibold transition-all hover:scale-105 cursor-pointer shadow-sm shadow-cyan-950"
          >
            <span>Deep Dive</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
