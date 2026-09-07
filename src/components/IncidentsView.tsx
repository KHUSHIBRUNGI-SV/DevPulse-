import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Clock, 
  ShieldAlert, 
  Plus, 
  ExternalLink,
  MessageSquare,
  Radio,
  Send,
  Check
} from 'lucide-react';
import { Incident, AlertRule } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  alertRules: AlertRule[];
  onAcknowledgeIncident: (id: string) => void;
  onResolveIncident: (id: string) => void;
  onToggleRule: (id: string) => void;
  onTestNotification: (channel: string) => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  alertRules,
  onAcknowledgeIncident,
  onResolveIncident,
  onToggleRule,
  onTestNotification
}) => {
  const [testSent, setTestSent] = useState<string | null>(null);

  const safeIncidents = incidents || [];
  const activeIncidents = safeIncidents.filter(inc => inc && inc.status !== 'resolved');
  const pastIncidents = safeIncidents.filter(inc => inc && inc.status === 'resolved');

  const handleTestChannel = (channel: string) => {
    onTestNotification(channel);
    setTestSent(channel);
    setTimeout(() => setTestSent(null), 2500);
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      
      {/* Active Incidents Banner */}
      {activeIncidents.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-xs">
            <AlertTriangle className="h-4 w-4 animate-bounce" />
            <span>Active Ongoing Incidents ({activeIncidents.length})</span>
          </div>

          {activeIncidents.map(inc => (
            <div 
              key={inc.id}
              className="rounded-xl border border-rose-700/80 bg-rose-950/30 p-4 shadow-lg shadow-rose-950/40"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 text-[10px] font-bold">
                      {inc.severity.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-100">{inc.title}</h3>
                  </div>
                  <p className="mt-1 text-xs text-rose-200/90 font-sans">
                    {inc.description}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-zinc-400">
                    <span>Target: <span className="text-zinc-200">{inc.endpointName}</span></span>
                    <span>Started: <span className="text-zinc-200">{new Date(inc.startedAt).toLocaleTimeString()}</span></span>
                    {inc.statusCode && <span>Status: <span className="text-rose-400 font-bold">{inc.statusCode}</span></span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onAcknowledgeIncident(inc.id)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                  <button
                    onClick={() => onResolveIncident(inc.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm transition-colors"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-300">No Active Incidents Detected</div>
              <div className="text-xs text-emerald-400/80">
                All microservice endpoints are within latency SLOs (&lt; 300ms) with 0 error spikes.
              </div>
            </div>
          </div>
          <span className="hidden sm:inline-block font-mono text-[11px] text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-800/60">
            HEALTHCHECK PASSING
          </span>
        </div>
      )}

      {/* Grid: Alert Trigger Rules & Notification Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Automated Alert Rules */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              <span>Go Worker Alert Rules</span>
            </h3>
            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
              Active Evaluation
            </span>
          </div>

          <div className="space-y-2.5">
            {alertRules.map(rule => (
              <div 
                key={rule.id}
                className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800/80"
              >
                <div>
                  <div className="text-xs font-semibold text-zinc-200">{rule.name}</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Channels: {rule.channels.join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-zinc-400">
                    Threshold: {rule.thresholdValue}
                  </span>
                  <button
                    onClick={() => onToggleRule(rule.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      rule.enabled ? 'bg-emerald-500' : 'bg-zinc-700'
                    }`}
                  >
                    <span 
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        rule.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} 
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Integrations */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
              <Bell className="h-4 w-4 text-sky-400" />
              <span>Outbound Notification Integrations</span>
            </h3>
            <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              DISPATCH READY
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Slack */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-300">
                  <MessageSquare className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">Slack Webhook</div>
                  <div className="text-[10px] text-zinc-400">#dev-api-alerts (Incoming Webhook)</div>
                </div>
              </div>
              <button
                onClick={() => handleTestChannel('slack')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
              >
                {testSent === 'slack' ? <Check className="h-3 w-3 text-emerald-400" /> : <Send className="h-3 w-3 text-sky-400" />}
                <span>{testSent === 'slack' ? 'Dispatched' : 'Test Ping'}</span>
              </button>
            </div>

            {/* PagerDuty */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-300">
                  <Radio className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">PagerDuty Events v2</div>
                  <div className="text-[10px] text-zinc-400">High-urgency on-call escalation</div>
                </div>
              </div>
              <button
                onClick={() => handleTestChannel('pagerduty')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
              >
                {testSent === 'pagerduty' ? <Check className="h-3 w-3 text-emerald-400" /> : <Send className="h-3 w-3 text-sky-400" />}
                <span>{testSent === 'pagerduty' ? 'Dispatched' : 'Test Ping'}</span>
              </button>
            </div>

            {/* Generic Webhook */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-300">
                  <ExternalLink className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-zinc-200">REST Webhook URL</div>
                  <div className="text-[10px] text-zinc-400">POST json payload with HMAC-SHA256 signature</div>
                </div>
              </div>
              <button
                onClick={() => handleTestChannel('webhook')}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors"
              >
                {testSent === 'webhook' ? <Check className="h-3 w-3 text-emerald-400" /> : <Send className="h-3 w-3 text-sky-400" />}
                <span>{testSent === 'webhook' ? 'Dispatched' : 'Test Ping'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Incident History Timeline */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-zinc-400" />
            <span>Resolved Incident History (Audit Log)</span>
          </h3>
          <span className="text-xs text-zinc-400 font-mono">
            {pastIncidents.length} historical events
          </span>
        </div>

        <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-950/60">
          {pastIncidents.map(inc => (
            <div key={inc.id} className="p-3.5 hover:bg-zinc-900/40 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-zinc-200">{inc.title}</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-zinc-800 text-zinc-400">
                    RESOLVED
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  {new Date(inc.startedAt).toLocaleString()} ({Math.round((inc.durationSeconds || 1200) / 60)}m outage)
                </div>
              </div>

              <p className="mt-1 text-xs text-zinc-400 font-sans pl-6">
                {inc.description}
              </p>

              {inc.rootCause && (
                <div className="mt-2 pl-6 text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <span className="text-zinc-500 font-semibold uppercase">Root Cause:</span>
                  <span className="text-zinc-300">{inc.rootCause}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
