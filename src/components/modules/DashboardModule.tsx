import React from "react";
import { 
  Activity, 
  FileSignature, 
  Share2, 
  ReceiptText, 
  Users, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Send,
  Calendar,
  AlertCircle,
  HeartPulse,
  Sliders,
  Video
} from "lucide-react";
import { ModuleId } from "../../types";
import { WhatsAppIntegrationWidget } from "../dashboard/WhatsAppIntegrationWidget";

interface DashboardProps {
  onNavigate: (module: ModuleId) => void;
}

export const DashboardModule: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 rounded-2xl text-white shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-teal-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Multi-Tenant Clinical Node Online</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Dr. Sarah Chen, MD — Practice Dashboard
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Metro Medical Center (Cardiology & General Practice). 3 electronic prescriptions queued, 2 incoming specialist referrals, and practice WhatsApp bot active.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigate("telemedicine")}
              className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm ring-1 ring-emerald-400/40"
            >
              <Video className="w-4 h-4" />
              <span>Telemedicine (Live)</span>
            </button>
            <button
              onClick={() => onNavigate("triage")}
              className="px-4 py-2 text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sliders className="w-4 h-4" />
              <span>Clinical Triage</span>
            </button>
            <button
              onClick={() => onNavigate("prescriptions")}
              className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileSignature className="w-4 h-4" />
              <span>Draft Prescription</span>
            </button>
            <button
              onClick={() => onNavigate("referrals")}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>New Referral</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Core Module Highlights (Placeholders & Launchers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Module 1: E-Prescription Card */}
        <div 
          onClick={() => onNavigate("prescriptions")}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-500/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-lg bg-teal-50 text-teal-700 group-hover:scale-105 transition-transform">
                <FileSignature className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                3 Active
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 mt-3 group-hover:text-teal-700 transition-colors">
              E-Prescription Engine
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Formulary dosage templates, cryptographic ECDSA signatures, tamper-proof QR validation, and WhatsApp delivery.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700">
            <span>Open Prescriptions</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 2: Referral Card */}
        <div 
          onClick={() => onNavigate("referrals")}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-500/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-lg bg-blue-50 text-blue-700 group-hover:scale-105 transition-transform">
                <Share2 className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                2 Pending
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 mt-3 group-hover:text-blue-700 transition-colors">
              Inter-Doctor Referrals
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Encrypted patient medical records, diagnostic imaging attachments, specialist directory search, and return clinical reports.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-700">
            <span>Review Referral Queue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Module 3: Invoice Card */}
        <div 
          onClick={() => onNavigate("invoices")}
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-teal-500/60 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-lg bg-indigo-50 text-indigo-700 group-hover:scale-105 transition-transform">
                <ReceiptText className="w-5 h-5" />
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                AI Enabled
              </span>
            </div>
            <h3 className="font-bold text-base text-slate-900 mt-3 group-hover:text-indigo-700 transition-colors">
              Quotations & Invoicing
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Natural language quotation synthesis (Gemini 3.8 Flash), CPT/ICD-10 tariff structures, VAT rules, and payment tracking.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-700">
            <span>Manage Billing</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* WhatsApp Integration Widget */}
      <WhatsAppIntegrationWidget />

      {/* Today's Schedule & Practice Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Schedule (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-sm text-slate-900">Today&apos;s Appointment Schedule</h4>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-open-patient-portal"
                onClick={() => onNavigate("portal")}
                className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Patient Portal</span>
              </button>
              <span className="text-xs text-slate-500 font-medium">3 Remaining</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs mt-2">
            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">James Miller</span>
                <p className="text-slate-400 text-[11px]">Hypertension Review • WhatsApp Reminder Confirmed</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate("telemedicine")}
                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Video</span>
                </button>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 hidden sm:inline">
                  Confirmed via Bot
                </span>
                <span className="px-2 py-1 rounded bg-teal-50 text-teal-700 font-mono font-semibold">14:30 PM</span>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Elena Rostova</span>
                <p className="text-slate-400 text-[11px]">Cardiology Specialist Follow-up • ECG Review</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-semibold">
                  Pending T-2h Ping
                </span>
                <span className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-mono font-semibold">15:15 PM</span>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-900">Robert Taylor</span>
                <p className="text-slate-400 text-[11px]">Urgent Referral Consultation (Angina Evaluation)</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                  Inter-Doctor Sync
                </span>
                <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-mono font-semibold">16:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Node Security & Governance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">Tenant Security</h4>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                Active
              </span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">KMS Encryption:</span>
                <span className="font-semibold text-slate-900">AES-256 Envelope</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Meta WABA Webhook:</span>
                <span className="font-mono text-[11px] text-teal-700 font-bold">HMAC Verified</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Compliance Standard:</span>
                <span className="font-semibold text-slate-900">HIPAA & POPIA Ready</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500">Audit Trail:</span>
                <span className="text-emerald-700 font-semibold">Append-Only Immutability</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Node ID: <span className="font-mono text-slate-600">MMC-CARDIO-NODE-01</span>
          </div>
        </div>
      </div>
    </div>
  );
};
