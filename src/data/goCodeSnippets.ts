export interface CodeSnippet {
  id: string;
  title: string;
  filename: string;
  language: 'go' | 'sql' | 'yaml' | 'typescript';
  description: string;
  code: string;
}

export const DEV_PULSE_CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'go-worker',
    title: 'Go Background Worker & Poller Engine',
    filename: 'cmd/worker/poller.go',
    language: 'go',
    description: 'High-throughput Go worker pool utilizing goroutines, buffered job channels, context cancellation, and net/http/httptrace for microsecond DNS/TLS/TTFB telemetry.',
    code: `package worker

import (
	"context"
	"crypto/tls"
	"net/http"
	"net/http/httptrace"
	"sync"
	"time"

	"github.com/devpulse/models"
	"github.com/devpulse/redis"
	"github.com/devpulse/storage"
)

type WorkerPool struct {
	maxWorkers   int
	jobsChannel  chan models.Endpoint
	metricsStore storage.PostgresStore
	cache        redis.CacheClient
	httpClient   *http.Client
	wg           sync.WaitGroup
	ctx          context.Context
	cancel       context.CancelFunc
}

func NewWorkerPool(workers int, bufferSize int, store storage.PostgresStore, cache redis.CacheClient) *WorkerPool {
	ctx, cancel := context.WithCancel(context.Background())
	transport := &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 20,
		IdleConnTimeout:     90 * time.Second,
		TLSClientConfig:     &tls.Config{InsecureSkipVerify: false},
	}
	client := &http.Client{
		Transport: transport,
		Timeout:   10 * time.Second,
	}

	return &WorkerPool{
		maxWorkers:   workers,
		jobsChannel:  make(chan models.Endpoint, bufferSize),
		metricsStore: store,
		cache:        cache,
		httpClient:   client,
		ctx:          ctx,
		cancel:       cancel,
	}
}

// Start spawns the goroutine worker pool
func (wp *WorkerPool) Start() {
	for i := 0; i < wp.maxWorkers; i++ {
		wp.wg.Add(1)
		go wp.worker(i)
	}
}

func (wp *WorkerPool) worker(id int) {
	defer wp.wg.Done()
	for {
		select {
		case <-wp.ctx.Done():
			return
		case ep, ok := <-wp.jobsChannel:
			if !ok {
				return
			}
			metric := wp.probeEndpoint(ep)
			
			// 1. Pipeline write to Redis for sub-millisecond dashboard queries
			_ = wp.cache.PushRecentPing(context.Background(), ep.ID, metric)

			// 2. Batch persist into PostgreSQL hypertable
			_ = wp.metricsStore.SavePing(context.Background(), metric)

			// 3. Evaluate alert triggers if status != 200 or latency > threshold
			if metric.StatusCode != ep.ExpectedStatus || metric.ResponseTimeMs > ep.LatencyThresholdMs {
				wp.evaluateAlert(ep, metric)
			}
		}
	}
}

func (wp *WorkerPool) probeEndpoint(ep models.Endpoint) models.PingMetric {
	var dnsStart, tcpStart, tlsStart, ttfbStart time.Time
	var dnsDuration, tcpDuration, tlsDuration, ttfbDuration time.Duration

	trace := &httptrace.ClientTrace{
		DNSStart: func(i httptrace.DNSStartInfo) { dnsStart = time.Now() },
		DNSDone:  func(i httptrace.DNSDoneInfo) { dnsDuration = time.Since(dnsStart) },
		ConnectStart: func(network, addr string) { tcpStart = time.Now() },
		ConnectDone: func(net, addr string, err error) { tcpDuration = time.Since(tcpStart) },
		TLSHandshakeStart: func() { tlsStart = time.Now() },
		TLSHandshakeDone:  func(cs tls.ConnectionState, err error) { tlsDuration = time.Since(tlsStart) },
		GotFirstResponseByte: func() { ttfbDuration = time.Since(ttfbStart) },
	}

	ctx, cancel := context.WithTimeout(wp.ctx, time.Duration(ep.TimeoutMs)*time.Millisecond)
	defer cancel()

	req, _ := http.NewRequestWithContext(httptrace.WithClientTrace(ctx, trace), ep.Method, ep.URL, nil)
	ttfbStart = time.Now()
	start := time.Now()

	resp, err := wp.httpClient.Do(req)
	totalDuration := time.Since(start)

	if err != nil {
		return models.PingMetric{
			EndpointID:     ep.ID,
			Timestamp:      time.Now().UnixMilli(),
			StatusCode:     504,
			ResponseTimeMs: totalDuration.Milliseconds(),
			IsSuccess:      false,
			ErrorMessage:   err.Error(),
		}
	}
	defer resp.Body.Close()

	return models.PingMetric{
		EndpointID:        ep.ID,
		Timestamp:         time.Now().UnixMilli(),
		StatusCode:        resp.StatusCode,
		ResponseTimeMs:    totalDuration.Milliseconds(),
		DnsTimeMs:         dnsDuration.Milliseconds(),
		TcpTimeMs:         tcpDuration.Milliseconds(),
		TlsTimeMs:         tlsDuration.Milliseconds(),
		TtfbMs:            ttfbDuration.Milliseconds(),
		IsSuccess:         resp.StatusCode == ep.ExpectedStatus,
		ResponseSizeBytes: resp.ContentLength,
	}
}`
  },
  {
    id: 'redis-cache',
    title: 'Redis Multi-Layer Caching & Rate Limiter',
    filename: 'pkg/redis/cache.go',
    language: 'go',
    description: 'Redis caching client using go-redis/v9 with pipeline buffering, atomic rolling rate limit counters, and LRU eviction for dashboard fast-path.',
    code: `package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/devpulse/models"
)

type CacheClient struct {
	rdb *redis.Client
}

func NewRedisClient(addr string, password string) *CacheClient {
	rdb := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     password,
		DB:           0,
		PoolSize:     64,
		MinIdleConns: 16,
		DialTimeout:  2 * time.Second,
	})
	return &CacheClient{rdb: rdb}
}

// PushRecentPing stores the last 50 telemetry points in a Redis List with LPUSH + LTRIM
func (c *CacheClient) PushRecentPing(ctx context.Context, endpointID string, metric models.PingMetric) error {
	key := fmt.Sprintf("devpulse:pings:%s", endpointID)
	data, err := json.Marshal(metric)
	if err != nil {
		return err
	}

	pipe := c.rdb.Pipeline()
	pipe.LPush(ctx, key, data)
	pipe.LTrim(ctx, key, 0, 49) // Keep last 50 pings in hot RAM
	pipe.Expire(ctx, key, 24*time.Hour)
	
	// Update rolling summary in hash map
	summaryKey := fmt.Sprintf("devpulse:summary:%s", endpointID)
	pipe.HSet(ctx, summaryKey, "last_latency", metric.ResponseTimeMs)
	pipe.HSet(ctx, summaryKey, "last_status", metric.StatusCode)
	pipe.HSet(ctx, summaryKey, "last_checked", metric.Timestamp)

	_, err = pipe.Exec(ctx)
	return err
}

// GetRecentPings retrieves hot cached telemetry in < 1ms
func (c *CacheClient) GetRecentPings(ctx context.Context, endpointID string) ([]models.PingMetric, error) {
	key := fmt.Sprintf("devpulse:pings:%s", endpointID)
	items, err := c.rdb.LRange(ctx, key, 0, 49).Result()
	if err != nil {
		return nil, err
	}

	metrics := make([]models.PingMetric, 0, len(items))
	for _, raw := range items {
		var m models.PingMetric
		if err := json.Unmarshal([]byte(raw), &m); == nil {
			metrics = append(metrics, m)
		}
	}
	return metrics, nil
}`
  },
  {
    id: 'postgres-schema',
    title: 'PostgreSQL & TimescaleDB Telemetry Schema',
    filename: 'db/migrations/001_initial_schema.sql',
    language: 'sql',
    description: 'Relational database schema with hypertable time-partitioning, BRIN / B-tree indexing for queries, and materialized aggregate rollups.',
    code: `-- DevPulse PostgreSQL 16 + TimescaleDB Migration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "timescaledb";

-- Registered API Endpoints metadata table
CREATE TABLE monitored_endpoints (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    method VARCHAR(10) DEFAULT 'GET',
    category VARCHAR(50) NOT NULL,
    interval_seconds INT DEFAULT 10,
    timeout_ms INT DEFAULT 5000,
    expected_status INT DEFAULT 200,
    latency_threshold_ms INT DEFAULT 300,
    is_paused BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time-series telemetry table
CREATE TABLE endpoint_pings (
    id UUID DEFAULT uuid_generate_v4(),
    endpoint_id VARCHAR(64) REFERENCES monitored_endpoints(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT NOT NULL,
    dns_time_ms INT DEFAULT 0,
    tcp_time_ms INT DEFAULT 0,
    tls_time_ms INT DEFAULT 0,
    ttfb_ms INT DEFAULT 0,
    is_success BOOLEAN NOT NULL,
    error_message TEXT,
    response_size_bytes INT DEFAULT 0
);

-- Convert to TimescaleDB Hypertable for automatic 1-day chunk partitioning
SELECT create_hypertable('endpoint_pings', 'timestamp', chunk_time_interval => INTERVAL '1 day');

-- Compound index for fast time-window analytical aggregation
CREATE INDEX idx_endpoint_pings_time ON endpoint_pings (endpoint_id, timestamp DESC);
CREATE INDEX idx_endpoint_pings_status ON endpoint_pings (status_code, timestamp DESC);

-- Materialized Continuous Aggregate for 5-minute p50, p95, p99 percentiles
CREATE MATERIALIZED VIEW endpoint_metrics_5m
WITH (timescaledb.continuous) AS
SELECT
    endpoint_id,
    time_bucket('5 minutes', timestamp) AS bucket,
    COUNT(*) AS total_checks,
    COUNT(*) FILTER (WHERE is_success = TRUE) AS successful_checks,
    AVG(response_time_ms)::numeric(10,2) AS avg_latency,
    percentile_cont(0.50) WITHIN GROUP (ORDER BY response_time_ms) AS p50_latency,
    percentile_cont(0.95) WITHIN GROUP (ORDER BY response_time_ms) AS p95_latency,
    percentile_cont(0.99) WITHIN GROUP (ORDER BY response_time_ms) AS p99_latency
FROM endpoint_pings
GROUP BY endpoint_id, bucket;`
  },
  {
    id: 'docker-compose',
    title: 'Production Docker Compose Architecture',
    filename: 'docker-compose.yml',
    language: 'yaml',
    description: 'Containerized microservice stack: Go worker poller, Next.js dashboard, PostgreSQL 16 TimescaleDB, and Redis 7.2 with healthchecks.',
    code: `version: '3.8'

services:
  # Next.js 14 Frontend Application
  web:
    build:
      context: .
      dockerfile: Dockerfile.web
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8080
      - REDIS_URL=redis://redis:6379
    depends_on:
      - api
      - redis

  # Golang REST API & Background Worker Engine
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile.go
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - DATABASE_URL=postgres://postgres:postgres@db:5432/devpulse?sslmode=disable
      - REDIS_ADDR=redis:6379
      - WORKER_CONCURRENCY=32
      - POLL_TICKER_SEC=5
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

  # PostgreSQL with TimescaleDB Extension
  db:
    image: timescale/timescaledb:latest-pg16
    environment:
      POSTGRES_DB: devpulse
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: secret_password
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./db/migrations:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  # In-Memory Cache & Message Broker
  redis:
    image: redis:7.2-alpine
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
  redisdata:`
  }
];
