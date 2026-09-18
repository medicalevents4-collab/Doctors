import React, { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardModule } from "./components/modules/DashboardModule";
import { PrescriptionModule } from "./components/modules/PrescriptionModule";
import { ReferralModule } from "./components/modules/ReferralModule";
import { InvoiceModule } from "./components/modules/InvoiceModule";
import { PatientsModule } from "./components/modules/PatientsModule";
import { PatientPortalModule } from "./components/modules/PatientPortalModule";
import { TriageModule } from "./components/modules/TriageModule";
import { TelemedicineModule } from "./components/modules/TelemedicineModule";
import { SettingsModule } from "./components/modules/SettingsModule";
import { ModuleId, DoctorProfile } from "./types";
import { I18nProvider } from "./i18n/I18nContext";

export default function App() {
  return (
    <I18nProvider>
      <MainAppContent />
    </I18nProvider>
  );
}

function MainAppContent() {
  const [currentModule, setCurrentModule] = useState<ModuleId>("dashboard");
  const [portalPatientId, setPortalPatientId] = useState<string>("pat-1");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const doctor: DoctorProfile = {
    name: "Dr. Sarah Chen",
    title: "MD, FCP(SA)",
    specialty: "Cardiology & Internal Medicine",
    licenseNumber: "HPCSA #MP098231",
    practiceNumber: "BHF #0142890",
    clinicName: "Metro Medical Center — West Wing",
    initials: "SC",
  };

  const renderModule = () => {
    switch (currentModule) {
      case "dashboard":
        return <DashboardModule onNavigate={(mod) => setCurrentModule(mod)} />;
      case "prescriptions":
        return <PrescriptionModule doctor={doctor} />;
      case "telemedicine":
        return (
          <TelemedicineModule
            doctor={doctor}
            onNavigate={(mod) => setCurrentModule(mod)}
          />
        );
      case "referrals":
        return <ReferralModule />;
      case "invoices":
        return <InvoiceModule />;
      case "patients":
        return (
          <PatientsModule
            onNavigate={(mod, patient) => {
              if (patient) {
                setPortalPatientId(patient.id);
              }
              setCurrentModule(mod);
            }}
          />
        );
      case "portal":
        return (
          <PatientPortalModule
            doctor={doctor}
            initialPatientId={portalPatientId}
            onNavigate={(mod) => setCurrentModule(mod as ModuleId)}
          />
        );
      case "triage":
        return (
          <TriageModule
            doctor={doctor}
            onNavigate={(mod) => setCurrentModule(mod)}
          />
        );
      case "settings":
        return <SettingsModule doctor={doctor} />;
      default:
        return <DashboardModule onNavigate={(mod) => setCurrentModule(mod)} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased">
      {/* Responsive Sidebar Navigation Shell */}
      <Sidebar
        currentModule={currentModule}
        onSelectModule={(mod) => setCurrentModule(mod)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        doctor={doctor}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Sticky Top Header */}
        <Header
          currentModule={currentModule}
          onOpenMobile={() => setMobileOpen(true)}
          onQuickAction={(mod) => setCurrentModule(mod)}
        />

        {/* Scrollable Viewport Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto w-full pb-12">
            {renderModule()}
          </div>
        </main>

        {/* Global Architecture Status Bar */}
        <footer className="h-8 border-t border-slate-200 bg-white px-4 md:px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-700">ACTIVITY Platform v2.4</span>
            <span className="hidden sm:inline text-slate-400">• Multi-Tenant Healthcare OS</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span className="hidden md:inline">HIPAA & POPIA Verified</span>
            <span>AES-256 Envelope KMS</span>
            <span className="text-teal-700 font-medium">Meta WhatsApp Cloud API</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
