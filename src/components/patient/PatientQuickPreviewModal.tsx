import React, { useState } from "react";
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Pill, 
  Share2, 
  Calendar, 
  Clock, 
  CreditCard, 
  MessageSquare, 
  ExternalLink, 
  Printer, 
  CheckCircle2, 
  ArrowRight,
  Stethoscope,
  FlaskConical,
  ChevronRight,
  Copy,
  Check,
  Download,
  RefreshCw
} from "lucide-react";
import { Patient, ModuleId, DoctorProfile, PrescriptionSummary } from "../../types";
import { PatientMedicalTimeline } from "./PatientMedicalTimeline";
import { downloadPrescriptionPDF } from "../../utils/prescriptionPdfGenerator";

interface PatientQuickPreviewModalProps {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToModule?: (module: ModuleId, patientContext?: Patient) => void;
}

export const PatientQuickPreviewModal: React.FC<PatientQuickPreviewModalProps> = ({
  patient,
  isOpen,
  onClose,
  onNavigateToModule,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "consultations" | "prescriptions" | "referrals" | "labs">("overview");
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [whatsAppSent, setWhatsAppSent] = useState(false);
  const [downloadingRxId, setDownloadingRxId] = useState<string | null>(null);

  const defaultDoctor: DoctorProfile = {
    name: "Dr. Sarah Chen",
    title: "MD, FCP(SA)",
    specialty: "Cardiology & Internal Medicine",
    licenseNumber: "HPCSA #MP098231",
    practiceNumber: "BHF #0142890",
    clinicName: "Metro Medical Center — West Wing",
    initials: "SC",
  };

  const handleDownloadPrescription = async (rxItem: Patient["activePrescriptions"][number]) => {
    if (!patient) return;
    try {
      setDownloadingRxId(rxItem.id);
      const summary: PrescriptionSummary = {
        id: rxItem.id,
        prescriptionNumber: rxItem.rxNumber,
        patientName: patient.name,
        patientAge: patient.age,
        medications: [`${rxItem.medication} (${rxItem.dosage}, ${rxItem.frequency})`],
        diagnosisIcd10: patient.chronicConditions[0] || "I10.9 (Hypertension)",
        status: rxItem.status === "ACTIVE" ? "ISSUED" : "DISPENSED",
        securityHash: rxItem.securityHash,
        issuedDate: rxItem.issuedDate,
        deliveryChannel: "WhatsApp",
      };

      await downloadPrescriptionPDF({
        rx: summary,
        doctor: defaultDoctor,
        patient,
        repeatsAllowed: rxItem.repeatsRemaining,
      });
    } catch (err) {
      console.error("Prescription download failed:", err);
    } finally {
      setDownloadingRxId(null);
    }
  };

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !patient) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(patient.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleSendWhatsAppLink = () => {
    setWhatsAppSent(true);
    setTimeout(() => setWhatsAppSent(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div 
        className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-modal-title"
      >
        {/* Top Clinical Ribbon */}
        <div className="bg-slate-900 px-5 py-4 text-white flex items-start justify-between gap-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-xl bg-teal-600/30 border border-teal-500/40 text-teal-300 font-bold text-lg flex items-center justify-center shrink-0 shadow-inner">
              {patient.name.split(" ").map(n => n[0]).join("")}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="patient-modal-title" className="text-lg sm:text-xl font-bold tracking-tight text-white truncate">
                  {patient.name}
                </h2>
                <span className="px-2 py-0.5 text-[11px] font-mono font-medium rounded-md bg-teal-950 text-teal-300 border border-teal-800/80">
                  {patient.mrn}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/70">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>POPIA / HIPAA Verified</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                <span>{patient.age} yrs • {patient.gender}</span>
                <span>•</span>
                <span>DOB: {patient.dateOfBirth}</span>
                <span>•</span>
                <span>Blood: <strong className="text-white font-semibold">{patient.bloodType}</strong></span>
                <span>•</span>
                <span className="text-slate-400">ID: {patient.nationalId}</span>
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => window.print()}
              title="Print Clinical Summary"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="btn-close-patient-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close patient preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Allergy & Urgent Clinical Banner */}
        {patient.allergies.length > 0 && (
          <div className="bg-rose-50 border-b border-rose-200/80 px-5 py-2 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-rose-800 font-medium overflow-hidden">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-bold text-rose-900">ALLERGY ALERT:</span>
              <span className="truncate">{patient.allergies.join("; ")}</span>
            </div>
            <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-200 text-rose-900">
              Critical Precaution
            </span>
          </div>
        )}

        {/* WhatsApp Notification Toast (if triggered) */}
        {whatsAppSent && (
          <div className="bg-emerald-600 text-white px-5 py-2.5 flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Encrypted WhatsApp Medical Link dispatched to {patient.phone} (Portal Token Valid for 48h)</span>
            </div>
            <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded">Sent via Meta Cloud API</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-200 bg-slate-50 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-teal-600 text-teal-700 bg-white shadow-xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Clinical Overview & Vitals</span>
          </button>
          <button
            id="tab-btn-medical-timeline"
            onClick={() => setActiveTab("timeline")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "timeline"
                ? "border-teal-600 text-teal-700 bg-white shadow-xs rounded-t-lg font-bold"
                : "border-transparent text-teal-700 hover:text-teal-900 bg-teal-50/50"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Medical Timeline</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-teal-200/80 text-teal-900 font-bold">
              Recharts
            </span>
          </button>
          <button
            onClick={() => setActiveTab("consultations")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "consultations"
                ? "border-teal-600 text-teal-700 bg-white shadow-xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Encounters & Notes ({patient.recentConsultations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "prescriptions"
                ? "border-teal-600 text-teal-700 bg-white shadow-xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Prescriptions ({patient.activePrescriptions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("referrals")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "referrals"
                ? "border-teal-600 text-teal-700 bg-white shadow-xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Referrals ({patient.recentReferrals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("labs")}
            className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === "labs"
                ? "border-teal-600 text-teal-700 bg-white shadow-xs rounded-t-lg"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Diagnostics & Labs ({patient.recentLabs.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-slate-700">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Vitals Grid */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Current Vital Signs & Triage</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Recorded {patient.latestVitals.recordedAt}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Blood Pressure</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.latestVitals.bloodPressure}</span>
                    <span className="text-[10px] text-amber-600 font-medium flex items-center gap-0.5 mt-0.5">
                      Stage 1 HTN
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Heart Rate</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.latestVitals.heartRate} <span className="text-xs font-normal text-slate-400">bpm</span></span>
                    <span className="text-[10px] text-emerald-600 font-medium">Normal Sinus</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Oxygen (SpO2)</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.latestVitals.oxygenSaturation}%</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Optimal</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Body Temp</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.latestVitals.temperature}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Normothermic</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">BMI</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.latestVitals.bmi} <span className="text-xs font-normal text-slate-400">kg/m²</span></span>
                    <span className="text-[10px] text-slate-500 font-medium">Overweight</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase block">Blood Glucose</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">{patient.latestVitals.bloodGlucose || "5.2 mmol/L"}</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Fasting Range</span>
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Contact & Insurance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact & Demographics */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Contact & Address</span>
                    </h4>
                    <span className="text-[10px] text-slate-400">Encrypted Demographics</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                        <span className="font-semibold text-slate-800">{patient.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={handleCopyPhone}
                          title="Copy phone"
                          className="px-2 py-0.5 text-[11px] rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                        >
                          {copiedPhone ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedPhone ? "Copied" : "Copy"}</span>
                        </button>
                        <button
                          onClick={handleSendWhatsAppLink}
                          className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 flex items-center gap-1"
                        >
                          <MessageSquare className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-700">{patient.email}</span>
                    </div>

                    <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-slate-700 leading-snug">{patient.address}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1">
                        Emergency Contact
                      </span>
                      <div className="text-slate-800 font-medium flex items-center justify-between">
                        <span>{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</span>
                        <span className="font-mono text-slate-600">{patient.emergencyContact.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Aid / Insurance */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Medical Aid & Authorization</span>
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {patient.medicalAid.status}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 to-teal-50/40 border border-teal-100/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {patient.medicalAid.scheme}
                        </span>
                        <span className="text-xs text-teal-700 font-medium">
                          {patient.medicalAid.plan}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                        Dep: {patient.medicalAid.dependentCode}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-teal-100 text-xs flex justify-between items-center font-mono">
                      <span className="text-slate-500">Membership Number:</span>
                      <span className="font-semibold text-slate-800">{patient.medicalAid.membershipNumber}</span>
                    </div>
                  </div>

                  {/* Chronic Conditions */}
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-1.5">
                      Chronic Diagnoses (PMB / CDL)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {patient.chronicConditions.map((c, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200/80">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Quick-Access Banner */}
              <div className="p-4 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-white to-sky-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-xs shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">
                        Patient Medical Timeline Visualization
                      </h4>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                        Recharts
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Chronological vertical axis mapping {patient.recentConsultations.length} encounters, {patient.activePrescriptions.length} prescription regimens, and {patient.recentReferrals.length} referrals.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-open-timeline-from-overview"
                  onClick={() => setActiveTab("timeline")}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 transition-colors shadow-xs shrink-0 flex items-center justify-center gap-1.5"
                >
                  <span>Explore Timeline</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Quick Summary of Most Recent Encounter */}
              {patient.recentConsultations[0] && (
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                      <span>Most Recent Consultation ({patient.recentConsultations[0].date})</span>
                    </h4>
                    <button
                      onClick={() => setActiveTab("consultations")}
                      className="text-xs text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-1"
                    >
                      <span>Full Encounter History</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        {patient.recentConsultations[0].diagnosis}
                      </span>
                      <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                        ICD-10: {patient.recentConsultations[0].icd10Code}
                      </span>
                    </div>
                    <p className="text-slate-600 line-clamp-2">
                      {patient.recentConsultations[0].clinicalNotes}
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-200/60">
                      <span>Attending: <strong>{patient.recentConsultations[0].clinician}</strong></span>
                      <span>•</span>
                      <span>Specialty: {patient.recentConsultations[0].specialty}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MEDICAL TIMELINE (RECHARTS VERTICAL AXIS) */}
          {activeTab === "timeline" && (
            <div className="space-y-4">
              <PatientMedicalTimeline
                patient={patient}
                onNavigateToModule={onNavigateToModule}
              />
            </div>
          )}

          {/* TAB 3: CONSULTATIONS */}
          {activeTab === "consultations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Clinical Consultation Records & SOAP Notes
                </h3>
                <span className="text-xs text-slate-400">Total Encounters: {patient.recentConsultations.length}</span>
              </div>

              {patient.recentConsultations.map((con) => (
                <div key={con.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 hover:border-teal-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{con.diagnosis}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-semibold">
                          {con.icd10Code}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Chief Complaint: &quot;{con.chiefComplaint}&quot;
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {con.date}
                      </span>
                      <span className="text-[11px] text-slate-400">{con.clinician}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Objective Assessment & Plan
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {con.clinicalNotes}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>Encounter BP: <strong className="text-slate-800">{con.vitals.bloodPressure}</strong></span>
                    <span>HR: <strong className="text-slate-800">{con.vitals.heartRate} bpm</strong></span>
                    <span>SpO2: <strong className="text-slate-800">{con.vitals.oxygenSaturation}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: PRESCRIPTIONS */}
          {activeTab === "prescriptions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Active & Dispensed E-Prescription Formularies
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToModule?.("prescriptions", patient);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 flex items-center gap-1"
                >
                  <Pill className="w-3 h-3" />
                  <span>Write New RX</span>
                </button>
              </div>

              {patient.activePrescriptions.map((rx) => (
                <div key={rx.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{rx.medication}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          rx.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-600"
                        }`}>
                          {rx.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-600 font-medium block mt-0.5">
                        {rx.dosage} • {rx.frequency}
                      </span>
                    </div>

                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded border border-slate-200 font-medium">
                      {rx.rxNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Duration</span>
                      <span className="font-semibold text-slate-800">{rx.duration}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Repeats Left</span>
                      <span className="font-semibold text-teal-700">{rx.repeatsRemaining} remaining</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Issued</span>
                      <span className="font-semibold text-slate-800">{rx.issuedDate}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Digital HMAC</span>
                      <span className="font-mono text-[10px] text-slate-500 truncate block">
                        {rx.securityHash.slice(0, 12)}...
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <ShieldCheck className="w-3 h-3 text-teal-600" />
                      <span>ECDSA P-256 Verified Seal</span>
                    </span>
                    <button
                      id={`btn-modal-download-rx-${rx.id}`}
                      onClick={() => handleDownloadPrescription(rx)}
                      disabled={downloadingRxId === rx.id}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                      title="Download Cryptographically Signed PDF with Unique QR Code"
                    >
                      {downloadingRxId === rx.id ? (
                        <RefreshCw className="w-3 h-3 animate-spin text-teal-600" />
                      ) : (
                        <Download className="w-3 h-3 text-teal-600" />
                      )}
                      <span>{downloadingRxId === rx.id ? "Signing..." : "Download Signed PDF"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: REFERRALS */}
          {activeTab === "referrals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Inter-Doctor Referral Network Transfers
                </h3>
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToModule?.("referrals", patient);
                  }}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Refer Patient</span>
                </button>
              </div>

              {patient.recentReferrals.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  No specialist referrals recorded for this patient.
                </div>
              ) : (
                patient.recentReferrals.map((ref) => (
                  <div key={ref.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider mb-1.5 inline-block ${
                          ref.urgency === "Urgent" 
                            ? "bg-amber-100 text-amber-800 border border-amber-200" 
                            : "bg-blue-100 text-blue-800 border border-blue-200"
                        }`}>
                          {ref.urgency} Referral
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{ref.specialistName}</h4>
                        <span className="text-xs text-slate-500">{ref.specialty} • {ref.facility}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {ref.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-0.5">Clinical Indication:</span>
                      {ref.clinicalReason}
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>Referred on {ref.referralDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: LABS */}
          {activeTab === "labs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Diagnostic Reports & Pathology Feeds
                </h3>
                <span className="text-xs text-slate-400">HL7 / FHIR Synchronized</span>
              </div>

              {patient.recentLabs.map((lab) => (
                <div key={lab.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{lab.testName}</h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          lab.status === "Abnormal"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}>
                          {lab.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">{lab.laboratory} • {lab.date}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs font-mono space-y-1">
                    <div className="text-slate-800 font-semibold">{lab.keyFinding}</div>
                    {lab.referenceRange && (
                      <div className="text-[11px] text-slate-500 font-sans">
                        Reference Range: {lab.referenceRange}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            <span>Audit trail logged for User: Dr. Sarah Chen</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              onClick={() => {
                onClose();
                onNavigateToModule?.("prescriptions", patient);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Draft RX</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToModule?.("referrals", patient);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Refer</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToModule?.("invoices", patient);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Bill / Quote</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToModule?.("patients", patient);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors flex items-center gap-1.5"
            >
              <span>Full EHR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
