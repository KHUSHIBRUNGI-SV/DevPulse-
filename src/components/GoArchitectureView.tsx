import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Server, 
  Layers, 
  Copy, 
  Check, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  Code2,
  Box
} from 'lucide-react';
import { WorkerPoolStats, RedisStats } from '../types';
import { DEV_PULSE_CODE_SNIPPETS } from '../data/goCodeSnippets';

interface GoArchitectureViewProps {
  workerStats: WorkerPoolStats;
  redisStats: RedisStats;
}

export const GoArchitectureView: React.FC<GoArchitectureViewProps> = ({
  workerStats,
  redisStats
}) => {
  const [activeSnippetId, setActiveSnippetId] = useState<string>('go-worker');
  const [copied, setCopied] = useState(false);

  const currentSnippet = DEV_PULSE_CODE_SNIPPETS.find(s => s.id === activeSnippetId) || DEV_PULSE_CODE_SNIPPETS[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Top Architecture Blueprint Banner */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold">
                Go
              </div>
              <h2 className="text-sm font-bold text-zinc-100">
                DevPulse Distributed System Architecture
              </h2>
            </div>
            <p className="mt-1 text-xs text-zinc-400 font-sans">
              High-throughput asynchronous Go poller background service persisting to TimescaleDB with Redis caching.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px]">
              Go 1.22 Runtime
            </span>
            <span className="px-2 py-1 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[11px]">
              Redis 7.2 Cache
            </span>
            <span className="px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[11px]">
              PostgreSQL 16
            </span>
          </div>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          
          {/* Node 1: Next.js Frontend */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 relative overflow-hidden group hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between text-zinc-400 mb-2">
              <span className="text-[11px] font-semibold text-zinc-200">1. Next.js Dashboard</span>
              <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">:3000</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              TypeScript & Tailwind client with real-time SSE stream, latency percentile charts, and alert management.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400">
              <Zap className="h-3 w-3" />
              <span>React 19 Hydrated</span>
            </div>
          </div>

          {/* Node 2: Go Worker Pool */}
          <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/20 p-3.5 relative overflow-hidden group hover:border-cyan-700 transition-colors">
            <div className="flex items-center justify-between text-cyan-400 mb-2">
              <span className="text-[11px] font-semibold text-cyan-200">2. Go Poller Worker</span>
              <span className="text-[10px] bg-cyan-900/60 px-1.5 py-0.5 rounded text-cyan-300">:8080</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Goroutines pool polling target APIs with <code className="text-cyan-300">httptrace</code> for sub-millisecond DNS/TLS/TTFB.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-cyan-300">
              <Cpu className="h-3 w-3" />
              <span>{workerStats.activeWorkers} concurrent routines</span>
            </div>
          </div>

          {/* Node 3: Redis Cache */}
          <div className="rounded-xl border border-purple-800/60 bg-purple-950/20 p-3.5 relative overflow-hidden group hover:border-purple-700 transition-colors">
            <div className="flex items-center justify-between text-purple-400 mb-2">
              <span className="text-[11px] font-semibold text-purple-200">3. Redis In-Memory</span>
              <span className="text-[10px] bg-purple-900/60 px-1.5 py-0.5 rounded text-purple-300">:6379</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              Hot RAM cache storing last 50 pings with LPUSH/LTRIM and rolling latency hash maps.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-purple-300">
              <Database className="h-3 w-3" />
              <span>{redisStats.hitRatio}% Hit Ratio ({redisStats.avgCacheLatencyMs}ms)</span>
            </div>
          </div>

          {/* Node 4: PostgreSQL TimescaleDB */}
          <div className="rounded-xl border border-blue-800/60 bg-blue-950/20 p-3.5 relative overflow-hidden group hover:border-blue-700 transition-colors">
            <div className="flex items-center justify-between text-blue-400 mb-2">
              <span className="text-[11px] font-semibold text-blue-200">4. PostgreSQL 16</span>
              <span className="text-[10px] bg-blue-900/60 px-1.5 py-0.5 rounded text-blue-300">:5432</span>
            </div>
            <p className="text-[11px] text-zinc-400 font-sans">
              TimescaleDB hypertable storing historical pings with 5-minute continuous rollups and BRIN indexes.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[10px] text-blue-300">
              <ShieldCheck className="h-3 w-3" />
              <span>ACID partitioned storage</span>
            </div>
          </div>

        </div>
      </div>

      {/* Live Go Worker Pool Telemetry Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Spawned Goroutines</div>
          <div className="text-xl font-bold text-cyan-400 mt-1 flex items-baseline gap-1">
            <span>{workerStats.goroutinesCount}</span>
            <span className="text-xs text-zinc-400 font-normal">routines</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Worker pool capacity: {workerStats.maxWorkers}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Channel Queue Depth</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
            <span>{workerStats.queueDepth}</span>
            <span className="text-xs text-zinc-400 font-normal">/ {workerStats.maxQueueCapacity}</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Buffered channel backpressure: 2%
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Go Heap Memory</div>
          <div className="text-xl font-bold text-zinc-100 mt-1 flex items-baseline gap-1">
            <span>{workerStats.memoryAllocatedMb}</span>
            <span className="text-xs text-zinc-400 font-normal">MB</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Garbage Collector pacer: normal
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Circuit Breakers</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-baseline gap-1">
            <span>0</span>
            <span className="text-xs text-zinc-400 font-normal">tripped</span>
          </div>
          <div className="text-[10px] text-zinc-400 mt-1">
            Status: All Closed (Healthy)
          </div>
        </div>
      </div>

      {/* Interactive Source Code Explorer */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-xl">
        
        {/* Code Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 gap-2">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {DEV_PULSE_CODE_SNIPPETS.map(snippet => (
              <button
                key={snippet.id}
                onClick={() => setActiveSnippetId(snippet.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-xs ${
                  activeSnippetId === snippet.id
                    ? 'bg-zinc-800 text-emerald-400 font-semibold border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>{snippet.filename}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors shrink-0"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Source'}</span>
          </button>
        </div>

        {/* Code Description Bar */}
        <div className="px-5 py-2.5 bg-zinc-900/40 border-b border-zinc-800/60 text-[11px] text-zinc-400 font-sans flex items-center justify-between">
          <span>{currentSnippet.description}</span>
          <span className="text-[10px] font-mono uppercase text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
            {currentSnippet.language}
          </span>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-x-auto max-h-[500px]">
          <pre className="text-[11px] leading-relaxed font-mono text-zinc-200">
            <code>{currentSnippet.code}</code>
          </pre>
        </div>

      </div>

    </div>
  );
};
