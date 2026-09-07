import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Copy, 
  Check, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  ShieldCheck, 
  Database,
  Terminal,
  ExternalLink,
  Flame
} from 'lucide-react';
import { MonitoredEndpoint } from '../types';

interface EndpointDetailModalProps {
  endpoint: MonitoredEndpoint | null;
  onClose: () => void;
  onProbeNow: (id: string) => void;
  isProbing: boolean;
}

export const EndpointDetailModal: React.FC<EndpointDetailModalProps> = ({
  endpoint,
  onClose,
  onProbeNow,
  isProbing
}) => {
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'waterfall' | 'headers' | 'history' | 'curl'>('waterfall');

  if (!endpoint) return null;

  const latestPing = endpoint.recentPings[endpoint.recentPings.length - 1] || {
    statusCode: 200,
    responseTimeMs: endpoint.currentLatencyMs,
    dnsTimeMs: 2,
    tcpTimeMs: 12,
    tlsTimeMs: 18,
    ttfbMs: endpoint.currentLatencyMs > 32 ? endpoint.currentLatencyMs - 32 : 10,
    contentDownloadMs: 4,
    responseSizeBytes: 1024,
    cachedInRedis: true
  };

  const totalTiming = latestPing.dnsTimeMs + latestPing.tcpTimeMs + latestPing.tlsTimeMs + latestPing.ttfbMs + latestPing.contentDownloadMs;
  const safeTotal = Math.max(totalTiming, 1);

  const curlCommand = `curl -X ${endpoint.method} "${endpoint.url}" \\
  -H "Accept: application/json" \\
  -H "X-DevPulse-Client: GoWorker/1.22" \\
  -w "\\nDNS: %{time_namelookup}s | Connect: %{time_connect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s\\n"`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
              {endpoint.method}
            </span>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>{endpoint.name}</span>
                {endpoint.status === 'down' ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                    DOWN
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                    OPERATIONAL
                  </span>
                )}
              </h2>
              <div className="text-xs text-zinc-400 font-mono truncate max-w-md">
                {endpoint.url}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onProbeNow(endpoint.id)}
              disabled={isProbing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-medium transition-colors disabled:opacity-50"
            >
              <Zap className={`h-3.5 w-3.5 ${isProbing ? 'animate-spin' : ''}`} />
              <span>Probe Now</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Diagnostic Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-zinc-800 bg-zinc-900/40 p-4 font-mono text-xs">
          <div className="rounded-lg bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase">Current Latency</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {endpoint.status === 'down' ? 'TIMEOUT' : `${endpoint.currentLatencyMs}ms`}
            </div>
          </div>
          <div className="rounded-lg bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase">p95 / p99 Percentile</span>
            <div className="text-lg font-bold text-sky-400 mt-0.5">
              {endpoint.p95LatencyMs}ms <span className="text-xs font-normal text-zinc-400">/ {endpoint.p99LatencyMs}ms</span>
            </div>
          </div>
          <div className="rounded-lg bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase">30-Day Availability</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {endpoint.uptimePercentage.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-lg bg-zinc-950 p-2.5 border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase">Redis Hot Cache</span>
            <div className="text-lg font-bold text-purple-400 mt-0.5 flex items-center gap-1">
              <Database className="h-4 w-4" />
              <span>{latestPing.cachedInRedis ? 'HIT (1.4ms)' : 'MISS (DB)'}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 px-6 text-xs font-mono">
          <button
            onClick={() => setActiveTab('waterfall')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'waterfall'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Network Timing Waterfall
          </button>
          <button
            onClick={() => setActiveTab('headers')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'headers'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Response Headers
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Recent Telemetry Logs
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`py-2.5 px-3 border-b-2 font-medium transition-colors ${
              activeTab === 'curl'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            cURL Snippet
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[440px] overflow-y-auto font-mono text-xs">
          
          {/* TAB 1: Network Waterfall */}
          {activeTab === 'waterfall' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Phase Breakdown (Go net/http/httptrace microsecond probe)</span>
                <span className="font-bold text-zinc-200">Total: {totalTiming}ms</span>
              </div>

              {/* Graphical Stacked Bar */}
              <div className="flex h-6 w-full overflow-hidden rounded-lg bg-zinc-900 border border-zinc-800">
                <div 
                  style={{ width: `${(latestPing.dnsTimeMs / safeTotal) * 100}%` }} 
                  title={`DNS Lookup: ${latestPing.dnsTimeMs}ms`}
                  className="bg-sky-500 hover:opacity-80 transition-all" 
                />
                <div 
                  style={{ width: `${(latestPing.tcpTimeMs / safeTotal) * 100}%` }} 
                  title={`TCP Connect: ${latestPing.tcpTimeMs}ms`}
                  className="bg-amber-500 hover:opacity-80 transition-all" 
                />
                <div 
                  style={{ width: `${(latestPing.tlsTimeMs / safeTotal) * 100}%` }} 
                  title={`TLS Handshake: ${latestPing.tlsTimeMs}ms`}
                  className="bg-purple-500 hover:opacity-80 transition-all" 
                />
                <div 
                  style={{ width: `${(latestPing.ttfbMs / safeTotal) * 100}%` }} 
                  title={`TTFB (Processing): ${latestPing.ttfbMs}ms`}
                  className="bg-emerald-500 hover:opacity-80 transition-all" 
                />
                <div 
                  style={{ width: `${(latestPing.contentDownloadMs / safeTotal) * 100}%` }} 
                  title={`Content Download: ${latestPing.contentDownloadMs}ms`}
                  className="bg-pink-500 hover:opacity-80 transition-all" 
                />
              </div>

              {/* Detailed Breakdown Rows */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-sky-500" />
                    <span className="text-zinc-300">DNS Resolution</span>
                  </div>
                  <span className="font-bold text-zinc-100">{latestPing.dnsTimeMs}ms</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-zinc-300">TCP Handshake</span>
                  </div>
                  <span className="font-bold text-zinc-100">{latestPing.tcpTimeMs}ms</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-purple-500" />
                    <span className="text-zinc-300">TLS Negotiation (SSL Cert Valid)</span>
                  </div>
                  <span className="font-bold text-zinc-100">{latestPing.tlsTimeMs}ms</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-zinc-300">Time to First Byte (TTFB / Backend Processing)</span>
                  </div>
                  <span className="font-bold text-emerald-400">{latestPing.ttfbMs}ms</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-zinc-900/60 border border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-pink-500" />
                    <span className="text-zinc-300">Content Transfer ({latestPing.responseSizeBytes} bytes)</span>
                  </div>
                  <span className="font-bold text-zinc-100">{latestPing.contentDownloadMs}ms</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Response Headers */}
          {activeTab === 'headers' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400">
                HTTP Response Headers captured by background worker:
              </div>
              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800 divide-y divide-zinc-800/80">
                <div className="py-1.5 flex justify-between">
                  <span className="text-zinc-400">content-type:</span>
                  <span className="text-emerald-400">application/json; charset=utf-8</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-zinc-400">x-devpulse-worker-id:</span>
                  <span className="text-cyan-400">worker-pool-goroutine-09</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-zinc-400">x-cache:</span>
                  <span className="text-purple-400">{latestPing.cachedInRedis ? 'HIT (Redis 7.2)' : 'MISS'}</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-zinc-400">x-response-time:</span>
                  <span className="text-zinc-200">{latestPing.responseTimeMs}ms</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-zinc-400">server:</span>
                  <span className="text-zinc-200">DevPulse/Go-HTTP-Worker</span>
                </div>
                <div className="py-1.5 flex justify-between">
                  <span className="text-zinc-400">access-control-allow-origin:</span>
                  <span className="text-zinc-200">*</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Recent Telemetry Logs */}
          {activeTab === 'history' && (
            <div className="space-y-2">
              <div className="text-xs text-zinc-400 mb-2">
                Last {endpoint.recentPings.length} consecutive probe records in Redis/PostgreSQL:
              </div>
              <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/60">
                {endpoint.recentPings.slice().reverse().map((ping, idx) => (
                  <div key={ping.id || idx} className="flex items-center justify-between p-2.5 hover:bg-zinc-900 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        ping.statusCode === 200 ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                      }`}>
                        {ping.statusCode}
                      </span>
                      <span className="text-zinc-400">
                        {new Date(ping.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${
                        ping.responseTimeMs < 80 ? 'text-emerald-400' : ping.responseTimeMs < 200 ? 'text-sky-400' : 'text-amber-400'
                      }`}>
                        {ping.responseTimeMs}ms
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {ping.cachedInRedis ? 'Redis cached' : 'Origin DB'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: cURL Snippet */}
          {activeTab === 'curl' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Reproduce in local terminal:</span>
                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  {copiedCurl ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCurl ? 'Copied to clipboard' : 'Copy cURL'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 overflow-x-auto text-[11px] leading-relaxed">
                {curlCommand}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/60 px-6 py-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Target SLA: &lt; {endpoint.latencyThresholdMs}ms | Timeout: {endpoint.timeoutMs}ms</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
