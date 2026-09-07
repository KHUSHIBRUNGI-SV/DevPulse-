import React from 'react';
import { 
  Flame, 
  Zap, 
  ShieldAlert, 
  AlertOctagon, 
  RotateCcw, 
  Activity, 
  Gauge, 
  Radio, 
  Bug,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface ChaosBarProps {
  onTriggerOutage: (endpointId: string) => void;
  onTriggerLatencySpike: (endpointId: string) => void;
  onRestoreAll: () => void;
  hasActiveChaos: boolean;
}

export const ChaosBar: React.FC<ChaosBarProps> = ({
  onTriggerOutage,
  onTriggerLatencySpike,
  onRestoreAll,
  hasActiveChaos
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-500/20 bg-gradient-to-r from-[#0d090a] via-[#120e14] to-[#0d0a11] p-5 sm:p-6 shadow-xl backdrop-blur-xl">
      
      {/* Subtle glowing warning accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 opacity-70" />

      {/* Subtle corner stress glow */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-rose-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        
        {/* Left: Resilience Lab Header & Stress Indicators */}
        <div className="flex items-start sm:items-center gap-4">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 via-rose-500/20 to-amber-500/10 border border-orange-500/30 text-orange-400 shadow-lg shadow-orange-950/40">
            <Flame className="h-6 w-6 text-orange-400 animate-pulse" />
            {hasActiveChaos && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-white font-mono tracking-tight">
                DevPulse Chaos & Fault Injection Studio
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-950/60 px-2.5 py-0.5 text-[10px] font-mono font-bold text-orange-300 border border-orange-800/60">
                <Gauge className="h-3 w-3 text-orange-400" />
                Resilience Lab
              </span>
              {hasActiveChaos ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-950/80 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-700 animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Active Fault Injected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/50 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-900/60">
                  <ShieldCheck className="h-3 w-3" />
                  Cluster Nominal
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl">
              Simulate failures, test resilience, and ensure your systems are production-ready.
            </p>
          </div>
        </div>

        {/* Right: Chaos Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono">
          
          {/* Button 1: Simulate Outage */}
          <button
            id="chaos-btn-payment-outage"
            onClick={() => onTriggerOutage('ep-payments')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-rose-950/60 border border-rose-900/60 hover:border-rose-500 text-rose-300 hover:text-white text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-md shadow-slate-950"
          >
            <AlertOctagon className="h-4 w-4 text-rose-400" />
            <span>Simulate Outage</span>
          </button>

          {/* Button 2: Inject Latency */}
          <button
            id="chaos-btn-auth-latency"
            onClick={() => onTriggerLatencySpike('ep-auth')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-amber-950/60 border border-amber-900/60 hover:border-amber-500 text-amber-300 hover:text-white text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-md shadow-slate-950"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Inject Latency</span>
          </button>

          {/* Button 3: Push Queue */}
          <button
            id="chaos-btn-rate-limit"
            onClick={() => onTriggerOutage('ep-notifications')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/90 hover:bg-orange-950/60 border border-orange-900/60 hover:border-orange-500 text-orange-300 hover:text-white text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-md shadow-slate-950"
          >
            <ShieldAlert className="h-4 w-4 text-orange-400" />
            <span>Push Queue</span>
          </button>

          {/* Button 4: Auto-Heal */}
          <button
            id="chaos-btn-restore"
            onClick={onRestoreAll}
            disabled={!hasActiveChaos}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              hasActiveChaos
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 cursor-pointer animate-pulse hover:scale-105 shadow-emerald-500/20'
                : 'bg-slate-900/60 border border-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <RotateCcw className={`h-4 w-4 ${hasActiveChaos ? 'animate-spin' : ''}`} />
            <span>Auto-Heal</span>
          </button>
        </div>

      </div>

      {/* Simulated System Stress Mini Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-500">Synthetic Stress Load:</span>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${hasActiveChaos ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
            <span className={hasActiveChaos ? 'text-rose-400 font-bold' : 'text-slate-300'}>
              {hasActiveChaos ? 'FAULTS ACTIVE (503/Degraded)' : 'Resilience Target Passed: 0 Cascades'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span>Circuit Breaker: <strong className="text-slate-300">Trips on 3 fails</strong></span>
          <span>Recovery Window: <strong className="text-cyan-400">Instant (Auto-Heal)</strong></span>
        </div>
      </div>
    </div>
  );
};
