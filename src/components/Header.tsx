import React from "react";
import { 
  Menu, 
  Bell, 
  Plus, 
  Sparkles, 
  FileSignature, 
  Share2, 
  ReceiptText 
} from "lucide-react";
import { ModuleId } from "../types";
import { GlobalPatientSearch } from "./search/GlobalPatientSearch";
import { useI18n } from "../i18n/I18nContext";
import { LanguageSelector } from "./common/LanguageSelector";

interface HeaderProps {
  currentModule: ModuleId;
  onOpenMobile: () => void;
  onQuickAction: (action: ModuleId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModule,
  onOpenMobile,
  onQuickAction,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const { t } = useI18n();

  const getModuleTitle = () => {
    switch (currentModule) {
      case "dashboard":
        return {
          title: t.header.clinicalOverviewTitle,
          subtitle: t.header.clinicalOverviewSubtitle,
        };
      case "prescriptions":
        return {
          title: t.header.rxTitle,
          subtitle: t.header.rxSubtitle,
        };
      case "telemedicine":
        return {
          title: t.header.telemedicineTitle,
          subtitle: t.header.telemedicineSubtitle,
        };
      case "referrals":
        return {
          title: t.header.referralTitle,
          subtitle: t.header.referralSubtitle,
        };
      case "invoices":
        return {
          title: t.header.invoiceTitle,
          subtitle: t.header.invoiceSubtitle,
        };
      case "patients":
        return {
          title: t.header.patientVaultTitle,
          subtitle: t.header.patientVaultSubtitle,
        };
      case "portal":
        return {
          title: t.header.portalTitle,
          subtitle: t.header.portalSubtitle,
        };
      case "triage":
        return {
          title: t.header.triageTitle,
          subtitle: t.header.triageSubtitle,
        };
      case "settings":
        return {
          title: t.header.settingsTitle,
          subtitle: t.header.settingsSubtitle,
        };
      default:
        return {
          title: t.header.clinicalOverviewTitle,
          subtitle: t.header.clinicalOverviewSubtitle,
        };
    }
  };

  const meta = getModuleTitle();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white border-b border-slate-200">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          id="btn-open-mobile-sidebar"
          onClick={onOpenMobile}
          className="p-2 -ml-1 text-slate-600 rounded-lg md:hidden hover:bg-slate-100 hover:text-slate-900 shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
            {meta.title}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 truncate">
            {meta.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Language Selector, Search, Quick Actions, Notifications */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Global Patient Search */}
        <GlobalPatientSearch onNavigateToModule={(mod) => onQuickAction(mod)} />

        {/* Internationalization Language Switcher (EN, AF, ZU) */}
        <LanguageSelector variant="header" />

        {/* System Heartbeat Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.header.tenantOnline}</span>
        </div>

        {/* Notifications */}
        <button
          id="btn-header-notifications"
          className="relative p-2 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title={t.header.notifications}
          aria-label={t.header.notifications}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600 ring-2 ring-white" />
        </button>

        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            id="btn-quick-actions-menu"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">{t.header.quickAction}</span>
          </button>

          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setDropdownOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  {t.common.actions}
                </div>
                <button
                  id="btn-quick-draft-rx"
                  onClick={() => {
                    onQuickAction("prescriptions");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5"
                >
                  <FileSignature className="w-4 h-4 text-teal-600" />
                  <span>{t.header.draftRx}</span>
                </button>
                <button
                  id="btn-quick-referral"
                  onClick={() => {
                    onQuickAction("referrals");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5"
                >
                  <Share2 className="w-4 h-4 text-blue-600" />
                  <span>{t.header.createReferral}</span>
                </button>
                <button
                  id="btn-quick-invoice"
                  onClick={() => {
                    onQuickAction("invoices");
                    setDropdownOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-700 flex items-center gap-2.5"
                >
                  <ReceiptText className="w-4 h-4 text-indigo-600" />
                  <span>{t.header.generateQuote}</span>
                  <Sparkles className="w-3 h-3 text-amber-500 ml-auto" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

