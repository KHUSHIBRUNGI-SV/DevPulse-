import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  MonitoredEndpoint, 
  Incident, 
  AlertRule, 
  WorkerPoolStats, 
  RedisStats, 
  EndpointStatus,
  PingMetric 
} from './types';
import { 
  INITIAL_ENDPOINTS, 
  INITIAL_INCIDENTS, 
  INITIAL_ALERT_RULES, 
  INITIAL_WORKER_STATS, 
  INITIAL_REDIS_STATS 
} from './data/mockEndpoints';
import { playAlertSound, playSuccessSound } from './utils/audio';

import { Navbar } from './components/Navbar';
import { DevPulseHero } from './components/DevPulseHero';
import { MetricsOverview } from './components/MetricsOverview';
import { ChaosBar } from './components/ChaosBar';
import { EndpointList } from './components/EndpointList';
import { EndpointDetailModal } from './components/EndpointDetailModal';
import { AddEndpointModal } from './components/AddEndpointModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { AnalyticsView } from './components/AnalyticsView';
import { IncidentsView } from './components/IncidentsView';
import { GoArchitectureView } from './components/GoArchitectureView';
import { ManualProberView } from './components/ManualProberView';

export default function App() {
  // Navigation & View Tabs
  const [activeTab, setActiveTab] = useState<'endpoints' | 'analytics' | 'incidents' | 'architecture' | 'prober'>('endpoints');

  // Core Platform State
  const [endpoints, setEndpoints] = useState<MonitoredEndpoint[]>(INITIAL_ENDPOINTS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(INITIAL_ALERT_RULES);
  const [workerStats, setWorkerStats] = useState<WorkerPoolStats>(INITIAL_WORKER_STATS);
  const [redisStats, setRedisStats] = useState<RedisStats>(INITIAL_REDIS_STATS);

  // Polling & Background Worker Controls
  const [isPollingActive, setIsPollingActive] = useState<boolean>(true);
  const [pollingIntervalSeconds, setPollingIntervalSeconds] = useState<number>(5);
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [probingEndpointId, setProbingEndpointId] = useState<string | null>(null);

  // Modals
  const [selectedEndpointForModal, setSelectedEndpointForModal] = useState<MonitoredEndpoint | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'error' | 'success' } | null>(null);

  const showToast = (text: string, type: 'info' | 'error' | 'success' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 3500);
  };

  // Determine global system status
  const systemStatus: EndpointStatus = useMemo(() => {
    if (endpoints.some(e => e.status === 'down')) return 'down';
    if (endpoints.some(e => e.status === 'degraded')) return 'degraded';
    return 'operational';
  }, [endpoints]);

  const activeAlertCount = useMemo(() => {
    return incidents.filter(i => i.status !== 'resolved').length;
  }, [incidents]);

  const hasActiveChaos = useMemo(() => {
    return endpoints.some(e => Boolean(e.inChaos));
  }, [endpoints]);

  // Execute Worker Polling Step
  const runWorkerPollCycle = useCallback(() => {
    setEndpoints(prevEndpoints => {
      let anyNewDown = false;

      const updated = prevEndpoints.map(ep => {
        if (ep.status === 'paused') return ep;

        let statusCode = ep.expectedStatusCode;
        let latency = ep.currentLatencyMs;
        let isSuccess = true;
        let status: EndpointStatus = 'operational';
        let isCached = ep.category === 'core' || ep.category === 'auth';

        if (ep.inChaos === 'outage') {
          statusCode = 503;
          latency = ep.timeoutMs + 450;
          isSuccess = false;
          status = 'down';
          anyNewDown = true;
        } else if (ep.inChaos === 'latency') {
          statusCode = 200;
          latency = 850 + Math.round(Math.random() * 120);
          isSuccess = true;
          status = 'degraded';
        } else {
          // Normal jitter
          const variance = (Math.random() - 0.5) * 6;
          latency = Math.max(12, Math.round(ep.p50LatencyMs + variance));
          if (latency > ep.latencyThresholdMs) {
            status = 'degraded';
          }
        }

        const newPing: PingMetric = {
          id: `p-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          endpointId: ep.id,
          timestamp: Date.now(),
          statusCode,
          responseTimeMs: latency,
          dnsTimeMs: Math.max(1, Math.round(latency * 0.08)),
          tcpTimeMs: Math.max(2, Math.round(latency * 0.15)),
          tlsTimeMs: Math.max(3, Math.round(latency * 0.2)),
          ttfbMs: Math.max(4, Math.round(latency * 0.5)),
          contentDownloadMs: 2,
          isSuccess,
          cachedInRedis: isCached && !ep.inChaos,
          responseSizeBytes: isSuccess ? 1024 : 140
        };

        const newRecentPings = [...ep.recentPings.slice(-14), newPing];
        const newUptimeBars = [...ep.uptimeBars.slice(1), status === 'operational' ? 'up' : status === 'degraded' ? 'degraded' : 'down'] as ('up' | 'degraded' | 'down')[];

        return {
          ...ep,
          status,
          currentLatencyMs: latency,
          uptimeBars: newUptimeBars,
          recentPings: newRecentPings,
          totalChecks: ep.totalChecks + 1,
          lastCheckedAt: Date.now()
        };
      });

      if (anyNewDown) {
        playAlertSound(audioAlertsEnabled);
      }

      return updated;
    });

    // Update worker and Redis metrics
    setWorkerStats(prev => ({
      ...prev,
      totalJobsProcessed: prev.totalJobsProcessed + endpoints.length,
      jobsPerMinute: Math.round(2800 + (Math.random() - 0.5) * 150),
      queueDepth: Math.max(1, Math.round(Math.random() * 8)),
      cpuUtilizationPercent: Number((4.5 + Math.random() * 1.8).toFixed(1))
    }));

    setRedisStats(prev => ({
      ...prev,
      hitCount: prev.hitCount + 8,
      opsPerSecond: Math.round(1800 + Math.random() * 200)
    }));
  }, [endpoints.length, audioAlertsEnabled]);

  // Background worker interval loop
  useEffect(() => {
    if (!isPollingActive) return;

    const interval = setInterval(() => {
      runWorkerPollCycle();
    }, pollingIntervalSeconds * 1000);

    return () => clearInterval(interval);
  }, [isPollingActive, pollingIntervalSeconds, runWorkerPollCycle]);

  // Instant Single Probe Action
  const handleProbeNow = async (endpointId: string) => {
    setProbingEndpointId(endpointId);
    showToast('Executing Go worker probe on endpoint...', 'info');

    // Artificial probe roundtrip
    await new Promise(res => setTimeout(res, 450));

    setEndpoints(prev => prev.map(ep => {
      if (ep.id !== endpointId) return ep;
      const isChaos = ep.inChaos === 'outage';
      const statusCode = isChaos ? 503 : ep.expectedStatusCode;
      const latency = isChaos ? 5200 : Math.max(15, Math.round(ep.p50LatencyMs + (Math.random() - 0.5) * 8));
      const status: EndpointStatus = isChaos ? 'down' : 'operational';

      const ping: PingMetric = {
        id: `p-${Date.now()}`,
        endpointId: ep.id,
        timestamp: Date.now(),
        statusCode,
        responseTimeMs: latency,
        dnsTimeMs: 2,
        tcpTimeMs: 8,
        tlsTimeMs: 12,
        ttfbMs: Math.max(5, latency - 25),
        contentDownloadMs: 3,
        isSuccess: !isChaos,
        cachedInRedis: !isChaos,
        responseSizeBytes: isChaos ? 120 : 1024
      };

      return {
        ...ep,
        status,
        currentLatencyMs: latency,
        recentPings: [...ep.recentPings.slice(-14), ping],
        uptimeBars: [...ep.uptimeBars.slice(1), status === 'operational' ? 'up' : 'down'] as any,
        totalChecks: ep.totalChecks + 1,
        lastCheckedAt: Date.now()
      };
    }));

    setProbingEndpointId(null);
    playSuccessSound(audioAlertsEnabled);
    showToast('Endpoint probe completed successfully!', 'success');
  };

  // Refresh All / Instant Probe Sweep
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    showToast('Triggered immediate sweep across all registered endpoints', 'info');
    await new Promise(res => setTimeout(res, 500));
    runWorkerPollCycle();
    setIsRefreshing(false);
  };

  // Pause / Resume Endpoint
  const handleTogglePause = (endpointId: string) => {
    setEndpoints(prev => prev.map(ep => {
      if (ep.id !== endpointId) return ep;
      const nextStatus: EndpointStatus = ep.status === 'paused' ? 'operational' : 'paused';
      return { ...ep, status: nextStatus };
    }));
  };

  // Chaos Outage Simulator
  const handleTriggerOutage = (endpointId: string) => {
    setEndpoints(prev => prev.map(ep => {
      if (ep.id !== endpointId) return ep;
      const isCurrentlyOutage = ep.inChaos === 'outage';
      return {
        ...ep,
        inChaos: isCurrentlyOutage ? null : 'outage',
        status: isCurrentlyOutage ? 'operational' : 'down',
        currentLatencyMs: isCurrentlyOutage ? ep.p50LatencyMs : 5000
      };
    }));

    const ep = endpoints.find(e => e.id === endpointId);
    if (ep && ep.inChaos !== 'outage') {
      playAlertSound(audioAlertsEnabled);
      showToast(`CRITICAL ALERT: Outage simulated on ${ep.name}!`, 'error');

      // Add active incident
      const newInc: Incident = {
        id: `inc-${Date.now()}`,
        endpointId: ep.id,
        endpointName: ep.name,
        endpointUrl: ep.url,
        severity: 'critical',
        status: 'active',
        title: `HTTP 503 Outage: ${ep.name} Unresponsive`,
        description: 'Go background worker registered consecutive gateway timeouts. Synthetic chaos injected.',
        startedAt: Date.now(),
        statusCode: 503,
        rootCause: 'Simulated infrastructure circuit-breaker trip.'
      };
      setIncidents(prev => [newInc, ...prev]);
    }
  };

  // Chaos Latency Spike Simulator
  const handleTriggerLatencySpike = (endpointId: string) => {
    setEndpoints(prev => prev.map(ep => {
      if (ep.id !== endpointId) return ep;
      const isCurrentlySpike = ep.inChaos === 'latency';
      return {
        ...ep,
        inChaos: isCurrentlySpike ? null : 'latency',
        status: isCurrentlySpike ? 'operational' : 'degraded',
        currentLatencyMs: isCurrentlySpike ? ep.p50LatencyMs : 850
      };
    }));

    const ep = endpoints.find(e => e.id === endpointId);
    if (ep && ep.inChaos !== 'latency') {
      playAlertSound(audioAlertsEnabled);
      showToast(`Warning: High latency injected into ${ep.name} (850ms)`, 'error');

      const newInc: Incident = {
        id: `inc-${Date.now()}`,
        endpointId: ep.id,
        endpointName: ep.name,
        endpointUrl: ep.url,
        severity: 'warning',
        status: 'active',
        title: `P95 SLA Breach: ${ep.name} (850ms)`,
        description: 'Response time exceeded 350ms SLA warning threshold. Downstream database query bottleneck simulated.',
        startedAt: Date.now(),
        statusCode: 200,
        rootCause: 'Simulated slow database query / thread starvation.'
      };
      setIncidents(prev => [newInc, ...prev]);
    }
  };

  // Auto-Heal & Restore All Endpoints
  const handleRestoreAll = () => {
    setEndpoints(prev => prev.map(ep => ({
      ...ep,
      inChaos: null,
      status: 'operational',
      currentLatencyMs: ep.p50LatencyMs
    })));

    setIncidents(prev => prev.map(inc => {
      if (inc.status === 'resolved') return inc;
      return {
        ...inc,
        status: 'resolved',
        resolvedAt: Date.now(),
        durationSeconds: Math.round((Date.now() - inc.startedAt) / 1000)
      };
    }));

    playSuccessSound(audioAlertsEnabled);
    showToast('Auto-Heal complete! All microservices recovered to 200 OK.', 'success');
  };

  // Incident Actions
  const handleAcknowledgeIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'investigating' } : inc));
    showToast('Incident acknowledged by on-call engineer', 'info');
  };

  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id !== id) return inc;
      return {
        ...inc,
        status: 'resolved',
        resolvedAt: Date.now(),
        durationSeconds: Math.round((Date.now() - inc.startedAt) / 1000)
      };
    }));
    showToast('Incident marked as resolved', 'success');
  };

  const handleToggleRule = (id: string) => {
    setAlertRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    showToast('Alert rule status toggled', 'info');
  };

  const handleTestNotification = (channel: string) => {
    showToast(`Test payload dispatched to ${channel.toUpperCase()} webhook!`, 'success');
  };

  // Delete Endpoint
  const handleDeleteEndpoint = (id: string) => {
    setEndpoints(prev => prev.filter(e => e.id !== id));
    showToast('Endpoint removed from background polling schedule', 'info');
  };

  // Add New Endpoint
  const handleAddEndpoint = (newEpData: Omit<MonitoredEndpoint, 'id' | 'status' | 'currentLatencyMs' | 'p50LatencyMs' | 'p95LatencyMs' | 'p99LatencyMs' | 'uptimePercentage' | 'errorRatePercentage' | 'totalChecks' | 'lastCheckedAt' | 'uptimeBars' | 'recentPings'>) => {
    const newEndpoint: MonitoredEndpoint = {
      ...newEpData,
      id: `ep-${Date.now()}`,
      status: 'operational',
      currentLatencyMs: 45,
      p50LatencyMs: 42,
      p95LatencyMs: 85,
      p99LatencyMs: 140,
      uptimePercentage: 100.0,
      errorRatePercentage: 0.0,
      totalChecks: 1,
      lastCheckedAt: Date.now(),
      uptimeBars: Array(45).fill('up'),
      recentPings: [
        {
          id: `p-${Date.now()}`,
          endpointId: `ep-${Date.now()}`,
          timestamp: Date.now(),
          statusCode: newEpData.expectedStatusCode,
          responseTimeMs: 45,
          dnsTimeMs: 2,
          tcpTimeMs: 6,
          tlsTimeMs: 10,
          ttfbMs: 24,
          contentDownloadMs: 3,
          isSuccess: true,
          cachedInRedis: true,
          responseSizeBytes: 820
        }
      ]
    };

    setEndpoints(prev => [newEndpoint, ...prev]);
    showToast(`Registered "${newEndpoint.name}" for Go worker polling!`, 'success');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-mono shadow-2xl backdrop-blur-md ${
            toastMessage.type === 'error'
              ? 'bg-rose-950/90 border-rose-700 text-rose-200'
              : toastMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-700 text-emerald-200'
              : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
          }`}>
            <span className="h-2 w-2 rounded-full bg-current animate-ping" />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'dashboard' || tab === 'settings') {
            setActiveTab('endpoints');
          } else {
            setActiveTab(tab as any);
          }
        }}
        systemStatus={systemStatus}
        activeAlertCount={activeAlertCount}
        incidents={incidents}
        isPollingActive={isPollingActive}
        setIsPollingActive={setIsPollingActive}
        pollingIntervalSeconds={pollingIntervalSeconds}
        setPollingIntervalSeconds={setPollingIntervalSeconds}
        audioAlertsEnabled={audioAlertsEnabled}
        setAudioAlertsEnabled={setAudioAlertsEnabled}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRefreshAll={handleRefreshAll}
        isRefreshing={isRefreshing}
        activeEndpointCount={endpoints.length}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspace Body with generous spacing and layout breathing room */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        
        {/* Prominent High-Impact DevPulse Hero on primary dashboard view */}
        {activeTab === 'endpoints' && (
          <DevPulseHero
            systemStatus={systemStatus}
            endpoints={endpoints}
            redisStats={redisStats}
            workerStats={workerStats}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onRefreshAll={handleRefreshAll}
            isRefreshing={isRefreshing}
            onNavigateToProber={() => setActiveTab('prober')}
            onTriggerChaosSample={() => handleTriggerOutage('ep-payments')}
            hasActiveChaos={hasActiveChaos}
          />
        )}

        {/* Executive Real-Time Telemetry Cards with spacious bento boxes */}
        <MetricsOverview
          endpoints={endpoints}
          workerStats={workerStats}
          redisStats={redisStats}
        />

        {/* Resilience & Chaos Engineering Studio Bar */}
        <ChaosBar
          onTriggerOutage={handleTriggerOutage}
          onTriggerLatencySpike={handleTriggerLatencySpike}
          onRestoreAll={handleRestoreAll}
          hasActiveChaos={hasActiveChaos}
        />

        {/* View Tab 1: Monitored Endpoints */}
        {activeTab === 'endpoints' && (
          <EndpointList
            endpoints={endpoints}
            onProbeNow={handleProbeNow}
            onTogglePause={handleTogglePause}
            onToggleChaos={handleTriggerOutage}
            onOpenDetails={(ep) => setSelectedEndpointForModal(ep)}
            onDelete={handleDeleteEndpoint}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            probingEndpointId={probingEndpointId}
          />
        )}

        {/* View Tab 2: Performance Analytics & Recharts */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            endpoints={endpoints}
            redisStats={redisStats}
          />
        )}

        {/* View Tab 3: Incidents & Alerts */}
        {activeTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            alertRules={alertRules}
            onAcknowledgeIncident={handleAcknowledgeIncident}
            onResolveIncident={handleResolveIncident}
            onToggleRule={handleToggleRule}
            onTestNotification={handleTestNotification}
          />
        )}

        {/* View Tab 4: Go Background Worker & System Architecture */}
        {activeTab === 'architecture' && (
          <GoArchitectureView
            workerStats={workerStats}
            redisStats={redisStats}
          />
        )}

        {/* View Tab 5: Live API Prober (cURL Tester) */}
        {activeTab === 'prober' && (
          <ManualProberView
            onAddAsEndpoint={handleAddEndpoint}
          />
        )}

      </main>

      {/* Modals */}
      <EndpointDetailModal
        endpoint={selectedEndpointForModal}
        onClose={() => setSelectedEndpointForModal(null)}
        onProbeNow={handleProbeNow}
        isProbing={probingEndpointId === selectedEndpointForModal?.id}
      />

      <AddEndpointModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEndpoint={handleAddEndpoint}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        endpoints={endpoints}
        incidents={incidents}
        onSelectEndpoint={(ep) => {
          setSelectedEndpointForModal(ep);
          setIsCommandPaletteOpen(false);
        }}
        onSelectTab={(tab) => {
          if (tab === 'dashboard' || tab === 'settings') {
            setActiveTab('endpoints');
          } else {
            setActiveTab(tab as any);
          }
          setIsCommandPaletteOpen(false);
        }}
        onOpenAddModal={() => {
          setIsAddModalOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onTriggerChaos={(id) => {
          handleTriggerOutage(id);
          setIsCommandPaletteOpen(false);
        }}
      />

      {/* Subtle Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs font-mono text-zinc-400">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">DevPulse Platform</span>
            <span>•</span>
            <span>Golang Background Worker</span>
            <span>•</span>
            <span>Redis Hot Cache</span>
            <span>•</span>
            <span>TimescaleDB</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400">
            <a 
              href="https://github.com/yourhandle/devpulse" 
              target="_blank" 
              rel="noreferrer"
              className="hover:text-emerald-400 transition-colors"
            >
              github.com/yourhandle/devpulse
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
