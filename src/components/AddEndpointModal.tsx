import React, { useState } from 'react';
import { X, Plus, Zap, Globe, Clock, ShieldCheck, Tag } from 'lucide-react';
import { MonitoredEndpoint, HttpMethod } from '../types';

interface AddEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEndpoint: (newEndpoint: Omit<MonitoredEndpoint, 'id' | 'status' | 'currentLatencyMs' | 'p50LatencyMs' | 'p95LatencyMs' | 'p99LatencyMs' | 'uptimePercentage' | 'errorRatePercentage' | 'totalChecks' | 'lastCheckedAt' | 'uptimeBars' | 'recentPings'>) => void;
}

export const AddEndpointModal: React.FC<AddEndpointModalProps> = ({
  isOpen,
  onClose,
  onAddEndpoint
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [category, setCategory] = useState<'auth' | 'payments' | 'core' | 'catalog' | 'notifications' | 'external'>('core');
  const [intervalSeconds, setIntervalSeconds] = useState(10);
  const [timeoutMs, setTimeoutMs] = useState(5000);
  const [expectedStatusCode, setExpectedStatusCode] = useState(200);
  const [latencyThresholdMs, setLatencyThresholdMs] = useState(250);
  const [tagsInput, setTagsInput] = useState('production, api');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    onAddEndpoint({
      name,
      url,
      method,
      category,
      intervalSeconds,
      timeoutMs,
      expectedStatusCode,
      latencyThresholdMs,
      tags: tags.length ? tags : ['custom-api']
    });

    onClose();
  };

  const handleQuickFill = (preset: 'github' | 'httpbin' | 'dummy') => {
    if (preset === 'github') {
      setName('GitHub Public API (Real Probe)');
      setUrl('https://api.github.com/zen');
      setMethod('GET');
      setCategory('external');
      setTagsInput('real-probe, github, public');
    } else if (preset === 'httpbin') {
      setName('HTTPBin Status 200 Probe');
      setUrl('https://httpbin.org/status/200');
      setMethod('GET');
      setCategory('core');
      setTagsInput('test, probe, benchmark');
    } else if (preset === 'dummy') {
      setName('DummyJSON Products Catalog API');
      setUrl('https://dummyjson.com/products/1');
      setMethod('GET');
      setCategory('catalog');
      setTagsInput('public-json, e-commerce');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-950 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-100">Register New API Endpoint</h2>
              <p className="text-xs text-zinc-400">Add to Go background worker polling schedule</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="bg-zinc-900/40 border-b border-zinc-800/80 px-6 py-2.5 flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-400">Quick Presets:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('github')}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            GitHub Zen
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('dummy')}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            DummyJSON
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('httpbin')}
            className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            HTTPBin
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          
          {/* Service Name */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Service / Endpoint Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Stripe Webhook Listener or Auth Service"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* URL & Method */}
          <div className="grid grid-cols-4 gap-2">
            <div className="col-span-1">
              <label className="block text-zinc-300 font-semibold mb-1">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="col-span-3">
              <label className="block text-zinc-300 font-semibold mb-1">
                Target URL / Route *
              </label>
              <input
                type="text"
                required
                placeholder="https://api.yourdomain.com/v1/health"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Polling Interval */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="core">Core API</option>
                <option value="auth">Auth & Security</option>
                <option value="payments">Payment Gateway</option>
                <option value="catalog">Catalog & Search</option>
                <option value="notifications">Notifications</option>
                <option value="external">External 3rd Party</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Polling Interval
              </label>
              <select
                value={intervalSeconds}
                onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value={3}>Every 3 seconds (High frequency)</option>
                <option value={5}>Every 5 seconds</option>
                <option value={10}>Every 10 seconds (Standard)</option>
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 60 seconds</option>
              </select>
            </div>
          </div>

          {/* Expected Status & Latency Warning Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Expected HTTP Status
              </label>
              <input
                type="number"
                value={expectedStatusCode}
                onChange={(e) => setExpectedStatusCode(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Latency SLA Threshold (ms)
              </label>
              <input
                type="number"
                value={latencyThresholdMs}
                onChange={(e) => setLatencyThresholdMs(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1">
              Metadata Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="production, v2, internal"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-white" />
              <span>Start Monitoring</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
