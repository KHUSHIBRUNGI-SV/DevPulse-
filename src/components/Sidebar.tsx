import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Activity, 
  AlertOctagon, 
  Cpu, 
  Terminal, 
  Settings, 
  ShieldCheck, 
  AlertTriangle, 
  XCircle,
  Radio,
  User,
  ChevronRight,
  ExternalLink,
  Flame,
  Sparkles
} from 'lucide-react';
import { EndpointStatus } from '../types';

export type SidebarTab = 'dashboard' | 'endpoints' | 'analytics' | 'incidents' | 'architecture' | 'prober' | 'settings';

interface SidebarProps {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  systemStatus: EndpointStatus;
  activeAlertCount: number;
  totalEndpoints: number;
  operationalEndpoints: number;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  activeAlertCount,
  totalEndpoints,
  operationalEndpoints,
  isMobileOpen = false,
  setIsMobileOpen
}) => {
  const navItems: { id: SidebarTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'endpoints', label: 'Endpoints', icon: Layers, badge: `${operationalEndpoints}/${totalEndpoints}`, badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60' },
    { id: 'analytics', label: 'Performance', icon: Activity },
    { 
      id: 'incidents', 
      label: 'Incidents', 
      icon: AlertOctagon, 
      badge: activeAlertCount > 0 ? activeAlertCount : undefined, 
      badgeColor: 'bg-rose-950/90 text-rose-300 border-rose-800 animate-pulse' 
    },
    { id: 'architecture', label: 'Artifacts', icon: Cpu },
    { id: 'prober', label: 'Logs & Trace', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: SidebarTab) => {
    setActiveTab(tab);
    if (setIsMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 flex flex-col justify-between border-r border-slate-800/80 bg-[#070a14]/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-4 border-b border-slate-800/70">
          <div 
            onClick={() => handleSelect('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-400 shadow-md shadow-cyan-950/50 group-hover:scale-105 group-hover:border-cyan-400 transition-all">
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

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white font-mono group-hover:text-cyan-400 transition-colors">
                  DevPulse
                </span>
                <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800/60">
                  v2.4
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-sans truncate">
                Telemetry & Observability
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 font-mono text-xs">
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Views
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`relative w-full flex items-center justify-between rounded-xl px-3 py-2.5 font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/70 via-blue-950/40 to-transparent text-white border border-cyan-800/60 shadow-md shadow-cyan-950/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 border border-transparent hover:border-slate-800'
                }`}
              >
                {/* Active Cyan Accent Bar on Left */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-cyan-400 to-blue-500 shadow-sm shadow-cyan-400" />
                )}

                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' 
                      : 'bg-slate-900 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {item.label}
                  </span>
                </div>

                {item.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Engine Telemetry
          </div>

          <div className="px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800/60 text-[11px] space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
                Go Pool Routines
              </span>
              <span className="text-cyan-300 font-bold">12 active</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Redis Latency</span>
              <span className="text-purple-300 font-bold">1.4ms</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Evaluation Tick</span>
              <span className="text-emerald-400 font-bold">5s Poller</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: Overall System Status & User Profile */}
        <div className="p-3 border-t border-slate-800/70 space-y-3 bg-[#060911]">
          {/* Overall System Health Visual Card */}
          <div 
            onClick={() => handleSelect('incidents')}
            className={`rounded-xl p-3 border transition-all cursor-pointer ${
              systemStatus === 'down'
                ? 'bg-rose-950/40 border-rose-800/80 hover:border-rose-600 shadow-sm shadow-rose-950'
                : systemStatus === 'degraded'
                ? 'bg-amber-950/40 border-amber-800/80 hover:border-amber-600 shadow-sm shadow-amber-950'
                : 'bg-emerald-950/30 border-emerald-900/60 hover:border-emerald-700 shadow-sm shadow-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    systemStatus === 'down' ? 'bg-rose-400' : systemStatus === 'degraded' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    systemStatus === 'down' ? 'bg-rose-500' : systemStatus === 'degraded' ? 'bg-amber-500' : 'bg-emerald-400'
                  }`} />
                </span>
                <span className="font-bold text-slate-200">
                  {systemStatus === 'down' ? 'System Outage' : systemStatus === 'degraded' ? 'Degraded SLA' : 'Systems Healthy'}
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-400">99.96%</span>
            </div>
            <div className="text-[10px] font-sans text-slate-400 flex items-center justify-between">
              <span>{operationalEndpoints}/{totalEndpoints} services operational</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </div>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white font-mono font-bold text-xs shadow-sm">
                SR
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-[#060911]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-200 font-mono truncate">SRE Platform</div>
                <div className="text-[10px] text-slate-400 font-sans truncate">khushi@devpulse.io</div>
              </div>
            </div>
            <button
              onClick={() => handleSelect('settings')}
              title="Settings"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
