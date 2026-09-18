import React from "react";
import { 
  Activity, 
  FileSignature, 
  Share2, 
  ReceiptText, 
  Users, 
  Settings, 
  HeartPulse,
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Building2, 
  LogOut,
  X,
  Sliders,
  Video
} from "lucide-react";
import { ModuleId, DoctorProfile } from "../types";
import { useI18n } from "../i18n/I18nContext";

interface SidebarProps {
  currentModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  doctor: DoctorProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentModule,
  onSelectModule,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  doctor,
}) => {
  const { t } = useI18n();

  const navItems = [
    {
      id: "dashboard" as ModuleId,
      label: t.nav.dashboard,
      icon: Activity,
      badge: undefined,
    },
    {
      id: "prescriptions" as ModuleId,
      label: t.nav.prescriptions,
      icon: FileSignature,
      badge: `3 ${t.nav.newBadge}`,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      id: "telemedicine" as ModuleId,
      label: t.nav.telemedicine,
      icon: Video,
      badge: "HD Live",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
    },
    {
      id: "referrals" as ModuleId,
      label: t.nav.referrals,
      icon: Share2,
      badge: `2 ${t.nav.pendingBadge}`,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    },
    {
      id: "invoices" as ModuleId,
      label: t.nav.invoices,
      icon: ReceiptText,
      badge: "AI",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
    },
    {
      id: "patients" as ModuleId,
      label: t.nav.patients,
      icon: Users,
      badge: undefined,
    },
    {
      id: "portal" as ModuleId,
      label: t.nav.portal,
      icon: HeartPulse,
      badge: "Portal",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
    },
    {
      id: "triage" as ModuleId,
      label: t.nav.triage,
      icon: Sliders,
      badge: "SATS",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    },
    {
      id: "settings" as ModuleId,
      label: t.nav.settings,
      icon: Settings,
      badge: undefined,
    },
  ];

  const handleSelect = (id: ModuleId) => {
    onSelectModule(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-200 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-teal-600 text-white font-bold shadow-sm shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight text-white">ACTIVITY</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 border border-teal-700/50">
                  Medical
                </span>
              </div>
              <span className="text-xs text-slate-400 truncate">Multi-Tenant Clinical OS</span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          id="btn-close-mobile-sidebar"
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop collapse toggle */}
        <button
          id="btn-toggle-sidebar-collapse"
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Tenant / Practice Badge */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mt-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2.5">
          <Building2 className="w-4 h-4 text-teal-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-200 truncate">{doctor.clinicName}</p>
            <p className="text-[11px] text-slate-400 truncate">Practice #{doctor.practiceNumber}</p>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className={`px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase ${collapsed ? "text-center" : ""}`}>
          {collapsed ? "•••" : "Clinical Modules"}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentModule === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => handleSelect(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-teal-600 text-white shadow-sm shadow-teal-950/40"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/70"
              }`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor} ml-2 shrink-0`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Security & Compliance Status */}
      {!collapsed && (
        <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="text-[11px] text-slate-300">
            <span className="font-semibold text-emerald-400">HIPAA & POPIA</span> Secured
            <div className="text-slate-400 text-[10px]">AES-256 Envelope KMS</div>
          </div>
        </div>
      )}

      {/* Clinician Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 border border-teal-500/30">
            {doctor.initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{doctor.name}</p>
              <p className="text-[11px] text-slate-400 truncate">{doctor.specialty}</p>
              <p className="text-[10px] text-teal-400/90 font-mono truncate">{doctor.licenseNumber}</p>
            </div>
          )}
          {!collapsed && (
            <button
              id="btn-sidebar-logout"
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
              title="Sign Out / Switch Practice"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block transition-all duration-200 border-r border-slate-800 shrink-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer panel */}
          <div className="relative flex flex-col w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
