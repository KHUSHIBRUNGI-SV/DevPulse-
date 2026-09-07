export type EndpointStatus = 'operational' | 'degraded' | 'down' | 'paused';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface PingMetric {
  id: string;
  endpointId: string;
  timestamp: number;
  statusCode: number;
  responseTimeMs: number;
  dnsTimeMs: number;
  tcpTimeMs: number;
  tlsTimeMs: number;
  ttfbMs: number;
  contentDownloadMs: number;
  isSuccess: boolean;
  cachedInRedis: boolean;
  errorMessage?: string;
  responseSizeBytes: number;
}

export interface MonitoredEndpoint {
  id: string;
  name: string;
  url: string;
  method: HttpMethod;
  category: 'auth' | 'payments' | 'core' | 'catalog' | 'notifications' | 'external';
  intervalSeconds: number; // e.g. 5, 10, 30, 60
  timeoutMs: number;
  expectedStatusCode: number;
  latencyThresholdMs: number; // Warning if p95 exceeds this
  status: EndpointStatus;
  currentLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  uptimePercentage: number;
  errorRatePercentage: number;
  totalChecks: number;
  lastCheckedAt: number;
  uptimeBars: ('up' | 'degraded' | 'down')[]; // 30 or 45 segments for recent history
  recentPings: PingMetric[];
  headers?: Record<string, string>;
  tags: string[];
  inChaos?: 'outage' | 'latency' | null;
}

export interface Incident {
  id: string;
  endpointId: string;
  endpointName: string;
  endpointUrl: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'investigating' | 'resolved';
  title: string;
  description: string;
  startedAt: number;
  resolvedAt?: number;
  durationSeconds?: number;
  statusCode?: number;
  rootCause?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: 'status_code_not_200' | 'latency_above_threshold' | 'consecutive_failures' | 'ssl_expiring';
  thresholdValue: number;
  targetEndpoints: 'all' | string[];
  channels: ('slack' | 'pagerduty' | 'email' | 'webhook')[];
  enabled: boolean;
}

export interface WorkerPoolStats {
  activeWorkers: number;
  maxWorkers: number;
  queueDepth: number;
  maxQueueCapacity: number;
  totalJobsProcessed: number;
  jobsPerMinute: number;
  goroutinesCount: number;
  memoryAllocatedMb: number;
  cpuUtilizationPercent: number;
  circuitBreakerTripped: number;
}

export interface RedisStats {
  connected: boolean;
  hitCount: number;
  missCount: number;
  hitRatio: number;
  keysCount: number;
  memoryUsedMb: number;
  avgCacheLatencyMs: number;
  opsPerSecond: number;
}

export interface ProberResult {
  url: string;
  method: HttpMethod;
  statusCode: number;
  statusText: string;
  totalTimeMs: number;
  timingBreakdown: {
    dnsLookupMs: number;
    tcpConnectionMs: number;
    tlsHandshakeMs: number;
    ttfbMs: number;
    contentTransferMs: number;
  };
  headers: Record<string, string>;
  responseBodyPreview: string;
  responseSizeBytes: number;
  timestamp: number;
  isSuccess: boolean;
}
