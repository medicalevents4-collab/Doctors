import React from "react";
import { ShieldCheck, Lock, Building2, Key, Database, CheckCircle2, Globe } from "lucide-react";
import { DoctorProfile } from "../../types";
import { useI18n } from "../../i18n/I18nContext";
import { LanguageSelector } from "../common/LanguageSelector";

interface SettingsModuleProps {
  doctor: DoctorProfile;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({ doctor }) => {
  const { t, currentLanguageInfo } = useI18n();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900">{t.settings.title}</h2>
        </div>
        <p className="text-xs text-slate-500">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Internationalization (i18n) Configuration Card */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
            <Globe className="w-5 h-5 text-teal-600" />
            <span>{t.settings.languageCardTitle}</span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1.5">
            <span>{currentLanguageInfo.flag}</span>
            <span>{currentLanguageInfo.nativeName}</span>
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {t.settings.languageCardDescription}
        </p>

        {/* Interactive Language Selector Cards */}
        <div className="pt-1">
          <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
            {t.settings.supportedLanguagesSubtitle}
          </label>
          <LanguageSelector variant="cards" />
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
            Multilingual Clinical Support Note
          </div>
          <p className="text-[11px] leading-relaxed text-slate-500">
            Switching language dynamically localizes all doctor e-prescription draft forms, directions & sig presets, patient portal health summaries, appointment instructions, and clinical status badges. Preferences are retained across browser sessions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Practice Credentials */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Practice Identity</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Clinic / Healthcare Entity</span>
            <span className="font-semibold text-slate-800">{doctor.clinicName}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Doctor in Charge</span>
            <span className="font-semibold text-slate-800">{doctor.name} ({doctor.title})</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Statutory Medical License</span>
            <span className="font-mono font-semibold text-teal-700">{doctor.licenseNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Practice Number (BHF)</span>
            <span className="font-mono font-semibold text-slate-800">{doctor.practiceNumber}</span>
          </div>
        </div>

        {/* Cryptographic Key Management */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            <Key className="w-4 h-4 text-slate-500" />
            <span>KMS Envelope Encryption</span>
          </div>

          <div>
            <span className="text-slate-400 block text-[11px]">Tenant Master Key (KEK) ARN</span>
            <span className="font-mono text-[10px] text-slate-700 break-all bg-slate-50 p-1.5 rounded border border-slate-200 block mt-0.5">
              arn:aws:kms:af-south-1:992014819:key/7b9410-activity-tenant-01
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Algorithm & Key Spec</span>
            <span className="font-mono font-semibold text-slate-800">AES-256-GCM + ECDSA P-256 (FIPS 140-3)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">PostgreSQL Isolation</span>
            <span className="font-semibold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Row-Level Security (RLS) Active</span>
            </span>
          </div>
        </div>
      </div>

      {/* Compliance Standards Status */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h3 className="font-bold text-sm text-slate-900 mb-3">{t.settings.complianceTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span>HIPAA</span>
              <span className="text-emerald-700 text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Enforced</span>
            </div>
            <p className="text-[11px] text-slate-500">45 CFR § 164 PHI security rules, BAA agreements, and immutable audit logs active.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span>POPIA</span>
              <span className="text-emerald-700 text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Enforced</span>
            </div>
            <p className="text-[11px] text-slate-500">South African data residency, Special Personal Information consent logs, Condition 7 safeguards.</p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
              <span>HL7® FHIR® R4</span>
              <span className="text-emerald-700 text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded">Standardized</span>
            </div>
            <p className="text-[11px] text-slate-500">Interoperable clinical bundle format for inter-doctor referral transfer and prescription records.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
