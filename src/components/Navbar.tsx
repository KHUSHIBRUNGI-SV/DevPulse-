import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Bell, 
  Volume2, 
  VolumeX, 
  Plus, 
  RefreshCw, 
  Pause, 
  Play, 
  Menu,
  X,
  Radio,
  Sliders,
  Sparkles,
  Command,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ChevronDown
} from 'lucide-react';
import { EndpointStatus, Incident } from '../types';
import { SidebarTab } from './Sidebar';

interface NavbarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  systemStatus: EndpointStatus;
  activeAlertCount: number;
  incidents?: Incident[];
  isPollingActive: boolean;
  setIsPollingActive: (val: boolean | ((prev: boolean) => boolean)) => void;
  pollingIntervalSeconds: number;
  setPollingIntervalSeconds: (sec: number) => void;
  audioAlertsEnabled: boolean;
  setAudioAlertsEnabled: (val: boolean | ((prev: boolean) => boolean)) => void;
  onOpenAddModal: () => void;
  onRefreshAll: () => void;
  isRefreshing: boolean;
  activeEndpointCount: number;
  onOpenCommandPalette?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  activeAlertCount,
  incidents = [],
  isPollingActive,
  setIsPollingActive,
  pollingIntervalSeconds,
  setPollingIntervalSeconds,
  audioAlertsEnabled,
  setAudioAlertsEnabled,
  onOpenAddModal,
  onRefreshAll,
  isRefreshing,
  activeEndpointCount,
  onOpenCommandPalette,
  onToggleMobileMenu
}) => {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const activeIncidents = (incidents || []).filter(i => i && i.status !== 'resolved');

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-[#070a14]/90 backdrop-blur-xl transition-colors">
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          
          {/* Left: Mobile Toggle & Brand / Breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Mobile menu hamburger */}
            <button
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Brand Logo & Name */}
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-950/40 group-hover:scale-105 transition-all">
                <Activity className="h-5 w-5 text-cyan-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    systemStatus === 'down' ? 'bg-rose-400' : systemStatus === 'degraded' ? 'bg-amber-400' : 'bg-cyan-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    systemStatus === 'down' ? 'bg-rose-500' : systemStatus === 'degraded' ? 'bg-amber-500' : 'bg-cyan-400'
                  }`} />
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono group-hover:text-cyan-400 transition-colors">
                  DevPulse
                </span>
                <span className="hidden sm:inline-flex items-center rounded-md bg-cyan-950/80 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800/60">
                  v2.4
                </span>
              </div>
            </div>

            {/* Breadcrumb indicator */}
            <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs font-mono text-slate-400">
              <span>prod-cluster-us-east</span>
              <span>/</span>
              <span className="text-cyan-400 capitalize">{activeTab}</span>
            </div>
          </div>

          {/* Center: Global Search Bar with Ctrl+K shortcut */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <button
              onClick={onOpenCommandPalette}
              className="w-full flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 hover:bg-slate-900 px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 transition-all group cursor-pointer shadow-inner"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="font-mono text-slate-400 group-hover:text-slate-300 text-[11px] sm:text-xs">
                  Search endpoints, incidents, or jump...
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1 font-mono text-[10px] text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                <span>Ctrl</span>
                <span>+</span>
                <span>K</span>
              </div>
            </button>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Live Monitoring Indicator with Interval Controls */}
            <div className="hidden md:flex items-center rounded-xl border border-slate-800 bg-slate-900/70 p-1 text-xs font-mono">
              <button
                id="btn-toggle-polling"
                onClick={() => setIsPollingActive(prev => !prev)}
                title={isPollingActive ? 'Pause background worker polling' : 'Resume live background polling'}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  isPollingActive 
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-xs' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isPollingActive ? (
                  <>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                    </span>
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3 text-amber-400" />
                    <span>Paused</span>
                  </>
                )}
              </button>

              <select
                id="select-polling-interval"
                value={pollingIntervalSeconds}
                onChange={(e) => setPollingIntervalSeconds(Number(e.target.value))}
                className="bg-transparent text-slate-300 text-[11px] px-2 py-0.5 focus:outline-none border-l border-slate-800 cursor-pointer font-mono"
                title="Synthetic polling interval"
              >
                <option value={3} className="bg-slate-900 text-slate-200">3s tick</option>
                <option value={5} className="bg-slate-900 text-slate-200">5s tick</option>
                <option value={10} className="bg-slate-900 text-slate-200">10s tick</option>
                <option value={30} className="bg-slate-900 text-slate-200">30s tick</option>
              </select>

              <button
                id="btn-manual-poll-refresh"
                onClick={onRefreshAll}
                disabled={isRefreshing}
                title="Execute immediate probe sweep on all endpoints"
                className="ml-1 p-1 text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
              </button>
            </div>

            {/* Notification / Incident Alert Bell */}
            <div className="relative">
              <button
                id="btn-notification-bell"
                onClick={() => setShowNotificationDropdown(prev => !prev)}
                title="View Incidents and Alerts"
                className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                  activeAlertCount > 0
                    ? 'border-rose-700/80 bg-rose-950/40 text-rose-300 hover:bg-rose-950/70'
                    : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Bell className="h-4 w-4" />
                {activeAlertCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white font-mono animate-pulse shadow-sm">
                    {activeAlertCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotificationDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-mono text-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2">
                    <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-cyan-400" />
                      Incident Feed
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {activeAlertCount} Active
                    </span>
                  </div>

                  {activeIncidents.length === 0 ? (
                    <div className="py-4 text-center text-slate-400 text-xs">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                      No active alerts. All systems operational.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto">
                      {activeIncidents.map(inc => (
                        <div 
                          key={inc.id}
                          onClick={() => { setActiveTab('incidents'); setShowNotificationDropdown(false); }}
                          className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 hover:border-rose-700 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-rose-300">
                            <span className="truncate max-w-[170px]">{inc.title}</span>
                            <span className="uppercase text-[9px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200">
                              {inc.severity}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 truncate">{inc.endpointName}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t border-slate-800/80 pt-2 mt-2 flex justify-between items-center text-[10px]">
                    <button
                      onClick={() => { setActiveTab('incidents'); setShowNotificationDropdown(false); }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      View All in Incident Center →
                    </button>
                    <button
                      onClick={() => setShowNotificationDropdown(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Audio Alert Toggle */}
            <button
              id="btn-audio-alerts-toggle"
              onClick={() => setAudioAlertsEnabled(prev => !prev)}
              title={audioAlertsEnabled ? 'Sound alerts on (click to mute)' : 'Sound alerts muted (click to enable)'}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                audioAlertsEnabled
                  ? 'border-slate-800 bg-slate-900/70 text-cyan-400 hover:text-cyan-300'
                  : 'border-slate-800 bg-slate-900/70 text-slate-500 hover:text-slate-400'
              }`}
            >
              {audioAlertsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            {/* Primary Add Endpoint Button */}
            <button
              id="btn-open-add-endpoint"
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-mono font-bold text-xs tracking-tight shadow-md shadow-cyan-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Endpoint</span>
            </button>

            {/* User Profile Avatar */}
            <div 
              onClick={() => setActiveTab('settings')}
              title="SRE User Profile & Platform Settings"
              className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800 cursor-pointer group"
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 text-white font-mono font-bold text-xs shadow-sm group-hover:ring-2 group-hover:ring-cyan-500/50 transition-all">
                SR
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#070a14]" />
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
