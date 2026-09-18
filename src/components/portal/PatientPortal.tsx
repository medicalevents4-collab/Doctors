import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  FileText,
  Heart,
  Pill,
  ShieldCheck,
  User,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  QrCode,
  Sparkles,
  Building2,
  Stethoscope,
  Activity,
  FileCheck,
  Printer,
  RefreshCw,
  Search,
  Eye,
  Send,
  X,
  Share2,
  Check,
  Lock,
  ArrowRight,
  Info
} from "lucide-react";
import { Patient, PrescriptionSummary, DoctorProfile, PatientConsultation, PatientPrescriptionRecord, PatientAppointment } from "../../types";
import { MOCK_PATIENTS } from "../../data/patients";
import { MOCK_APPOINTMENTS } from "../../data/patientAppointments";
import { downloadPrescriptionPDF, getPrescriptionPdfBlobUrl } from "../../utils/prescriptionPdfGenerator";
import { useI18n } from "../../i18n/I18nContext";
import { LanguageSelector } from "../common/LanguageSelector";

interface PatientPortalProps {
  initialPatientId?: string;
  doctor?: DoctorProfile;
  onNavigateToModule?: (moduleId: string) => void;
}

const DEFAULT_DOCTOR: DoctorProfile = {
  name: "Dr. Sarah Chen",
  title: "MD, FCP(SA)",
  specialty: "Cardiology & Internal Medicine",
  licenseNumber: "HPCSA #MP098231",
  practiceNumber: "BHF #0142890",
  clinicName: "Metro Medical Center — West Wing",
  initials: "SC",
};

export const PatientPortal: React.FC<PatientPortalProps> = ({
  initialPatientId = "pat-1",
  doctor = DEFAULT_DOCTOR,
  onNavigateToModule,
}) => {
  const { t } = useI18n();
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "prescriptions" | "summaries" | "labs">("overview");
  const [searchFilter, setSearchFilter] = useState<string>("");

  // Prescription Download & Preview State
  const [downloadingRxId, setDownloadingRxId] = useState<string | null>(null);
  const [previewingRx, setPreviewingRx] = useState<PrescriptionSummary | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Directions Modal State
  const [selectedAppointmentForDirections, setSelectedAppointmentForDirections] = useState<PatientAppointment | null>(null);

  // Selected Clinical Summary Modal
  const [selectedConsultation, setSelectedConsultation] = useState<PatientConsultation | null>(null);

  // Active Patient Object
  const currentPatient: Patient =
    MOCK_PATIENTS.find((p) => p.id === selectedPatientId) || MOCK_PATIENTS[0];

  // Appointments for Current Patient
  const patientAppointments = MOCK_APPOINTMENTS.filter(
    (apt) => apt.patientId === currentPatient.id || apt.patientName.toLowerCase() === currentPatient.name.toLowerCase()
  );

  const upcomingAppointments = patientAppointments.filter(
    (apt) => apt.status === "Confirmed" || apt.status === "Scheduled"
  );

  // Show Toast helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Convert patient prescription record to PrescriptionSummary format for PDF generator
  const getPrescriptionSummary = (rxRecord: PatientPrescriptionRecord): PrescriptionSummary => {
    return {
      id: rxRecord.id,
      prescriptionNumber: rxRecord.rxNumber,
      patientName: currentPatient.name,
      patientAge: currentPatient.age,
      medications: [`${rxRecord.medication} (${rxRecord.dosage}) — ${rxRecord.frequency}`],
      diagnosisIcd10: currentPatient.chronicConditions[0] || "General Clinical Care",
      status: rxRecord.status === "ACTIVE" ? "ISSUED" : rxRecord.status === "DISPENSED" ? "DISPENSED" : "EXPIRED",
      securityHash: rxRecord.securityHash,
      issuedDate: rxRecord.issuedDate,
      deliveryChannel: "WhatsApp",
    };
  };

  // Handle PDF Download
  const handleDownloadPrescription = async (rxRecord: PatientPrescriptionRecord) => {
    setDownloadingRxId(rxRecord.id);
    try {
      const rxSummary = getPrescriptionSummary(rxRecord);
      await downloadPrescriptionPDF({
        rx: rxSummary,
        doctor,
        patient: currentPatient,
        repeatsAllowed: rxRecord.repeatsRemaining,
        directions: [rxRecord.frequency, rxRecord.duration],
      });
      triggerToast(`Downloaded official prescription: ${rxRecord.rxNumber}`);
    } catch (err) {
      console.error("Prescription download error:", err);
      triggerToast("Error downloading prescription. Please retry.");
    } finally {
      setDownloadingRxId(null);
    }
  };

  // Handle Prescription Document View / Preview
  const handlePreviewPrescription = async (rxRecord: PatientPrescriptionRecord) => {
    const rxSummary = getPrescriptionSummary(rxRecord);
    setPreviewingRx(rxSummary);
    setPreviewLoading(true);
    try {
      const url = await getPrescriptionPdfBlobUrl({
        rx: rxSummary,
        doctor,
        patient: currentPatient,
        repeatsAllowed: rxRecord.repeatsRemaining,
        directions: [rxRecord.frequency, rxRecord.duration],
      });
      setPreviewBlobUrl(url);
    } catch (err) {
      console.error("Preview error:", err);
      triggerToast("Could not render document preview.");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Download .ics Calendar File for an Appointment
  const handleDownloadCalendar = (apt: PatientAppointment) => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ACTIVITY Health//Patient Portal//EN",
      "BEGIN:VEVENT",
      `SUMMARY:Medical Appointment with ${apt.clinician} (${apt.specialty})`,
      `DESCRIPTION:${apt.reasonForVisit}\\nLocation: ${apt.facility}, ${apt.roomOrSuite}\\nPreparation: ${apt.preparationNotes.join("; ")}`,
      `LOCATION:${apt.facility}, ${apt.roomOrSuite}`,
      `DTSTART:20260918T123000Z`,
      `DTEND:20260918T133000Z`,
      `STATUS:CONFIRMED`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Appointment_${apt.clinician.replace(/\s+/g, "_")}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerToast(`Added appointment with ${apt.clinician} to calendar`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Read-Only Portal Banner & Patient Switcher */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Heart className="w-5 h-5" />
              </span>
              <h2 className="text-lg font-bold text-slate-900">{t.header.portalTitle}</h2>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-teal-100 text-teal-800 border border-teal-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>{t.portal.portalBadge}</span>
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-mono text-slate-500 bg-slate-100 rounded-full">
                MRN: {currentPatient.mrn}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {t.portal.portalSubtitle}
            </p>
          </div>

          {/* Patient Persona Switcher & Portal Language Selector */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 pl-2">Logged in as:</span>
            <select
              id="select-patient-persona"
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                triggerToast(`Switched view to patient: ${MOCK_PATIENTS.find(p => p.id === e.target.value)?.name}`);
              }}
              className="p-1.5 text-xs font-bold bg-white text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
            >
              {MOCK_PATIENTS.map((pat) => (
                <option key={pat.id} value={pat.id}>
                  {pat.name} ({pat.age}y, {pat.gender}) — {pat.chronicConditions[0]?.split("(")[0] || "General"}
                </option>
              ))}
            </select>

            {/* Portal Direct Language Switcher */}
            <div className="pl-1 border-l border-slate-200">
              <LanguageSelector variant="header" />
            </div>
          </div>
        </div>

        {/* Patient Identity & Medical Aid Snapshot Bar */}
        <div className="p-4 bg-gradient-to-r from-slate-50 via-teal-50/30 to-blue-50/20 rounded-xl border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t.common.patient}</span>
            <span className="font-bold text-slate-900 text-sm">{currentPatient.name}</span>
            <span className="text-[10px] text-slate-500 block">{currentPatient.age} yrs • {currentPatient.gender}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t.portal.dateOfBirth}</span>
            <span className="font-semibold text-slate-800">{currentPatient.dateOfBirth}</span>
            <span className="text-[10px] text-slate-500 block">Blood Group: <strong className="text-teal-700">{currentPatient.bloodType}</strong></span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t.portal.medicalScheme}</span>
            <span className="font-semibold text-slate-800">{currentPatient.medicalAid.scheme}</span>
            <span className="text-[10px] text-slate-500 block">{currentPatient.medicalAid.plan} • {currentPatient.medicalAid.membershipNumber}</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t.portal.emergencyContact}</span>
            <span className="font-semibold text-slate-800">{currentPatient.emergencyContact.name}</span>
            <span className="text-[10px] text-slate-500 block">{currentPatient.emergencyContact.relationship} ({currentPatient.emergencyContact.phone})</span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t.portal.allergies}</span>
            {currentPatient.allergies.length > 0 ? (
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 text-[10px] inline-block mt-0.5">
                {currentPatient.allergies[0].split("(")[0]}
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">No known drug allergies</span>
            )}
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">{t.portal.vitalsRecorded}</span>
            <span className="font-mono font-bold text-slate-800">{currentPatient.latestVitals.bloodPressure}</span>
            <span className="text-[10px] text-slate-500 block">HR: {currentPatient.latestVitals.heartRate} bpm • SpO2: {currentPatient.latestVitals.oxygenSaturation}%</span>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px]">
              <strong>Emergency Guidance:</strong> {t.portal.emergencyGuidance}
            </span>
          </div>
          <span className="text-[10px] font-mono text-amber-700 shrink-0 bg-white px-2 py-0.5 rounded border border-amber-200">
            Emergency 10177
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold w-fit">
          <button
            id="portal-tab-overview"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span>{t.portal.tabOverview}</span>
          </button>

          <button
            id="portal-tab-appointments"
            onClick={() => setActiveTab("appointments")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "appointments"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.portal.tabAppointments} ({upcomingAppointments.length})</span>
          </button>

          <button
            id="portal-tab-prescriptions"
            onClick={() => setActiveTab("prescriptions")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "prescriptions"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t.portal.tabPrescriptions} ({currentPatient.activePrescriptions.length})</span>
          </button>

          <button
            id="portal-tab-summaries"
            onClick={() => setActiveTab("summaries")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "summaries"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>{t.portal.tabSummaries} ({currentPatient.recentConsultations.length})</span>
          </button>

          <button
            id="portal-tab-labs"
            onClick={() => setActiveTab("labs")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "labs"
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>{t.portal.tabLabs} ({currentPatient.recentLabs.length})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={t.portal.searchPlaceholder}
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-full sm:w-60"
          />
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Hero Row: Next Appointment & Most Recent Doctor Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Next Appointment Card (5 cols) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900">{t.portal.nextAppointment}</h3>
                  </div>
                  {upcomingAppointments.length > 0 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      <span>{upcomingAppointments[0].status}</span>
                    </span>
                  )}
                </div>

                {upcomingAppointments.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 font-mono">
                          {upcomingAppointments[0].date}
                        </span>
                        <span className="text-xs font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                          {upcomingAppointments[0].time}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 mt-2">
                        {upcomingAppointments[0].clinician}
                      </h4>
                      <p className="text-xs text-blue-800 font-medium">
                        {upcomingAppointments[0].specialty}
                      </p>
                    </div>

                    <div className="text-xs space-y-1.5 text-slate-600">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {upcomingAppointments[0].facility}, {upcomingAppointments[0].roomOrSuite}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>{t.portal.appointmentType}: </strong>{upcomingAppointments[0].reasonForVisit}
                        </span>
                      </div>
                    </div>

                    {/* Prep reminder */}
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                      <span className="font-semibold text-slate-700 block">{t.portal.preparationGuidelines}:</span>
                      <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                        {upcomingAppointments[0].preparationNotes.slice(0, 2).map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    {t.common.noData}
                  </div>
                )}
              </div>

              {upcomingAppointments.length > 0 && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadCalendar(upcomingAppointments[0])}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t.portal.addToCalendar}</span>
                  </button>

                  <button
                    onClick={() => setSelectedAppointmentForDirections(upcomingAppointments[0])}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{t.portal.getDirections}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Latest Doctor Consultation Summary (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-sm text-slate-900">{t.portal.recentConsultationsTitle}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {currentPatient.recentConsultations[0]?.date || "Recent"}
                  </span>
                </div>

                {currentPatient.recentConsultations.length > 0 ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {currentPatient.recentConsultations[0].clinician}
                        </span>
                        <span className="text-[11px] text-indigo-600 font-semibold">
                          {currentPatient.recentConsultations[0].specialty}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 text-xs">
                        ICD-10: {currentPatient.recentConsultations[0].icd10Code}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Doctor Assessment &amp; Diagnosis
                      </span>
                      <p className="font-bold text-slate-800">
                        {currentPatient.recentConsultations[0].diagnosis}
                      </p>
                      <p className="text-slate-600 leading-relaxed text-xs">
                        {currentPatient.recentConsultations[0].clinicalNotes}
                      </p>
                    </div>

                    {/* Vitals snapshot taken during visit */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                        <span className="font-mono font-bold text-slate-900">
                          {currentPatient.recentConsultations[0].vitals.bloodPressure}
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Pulse Rate</span>
                        <span className="font-mono font-bold text-slate-900">
                          {currentPatient.recentConsultations[0].vitals.heartRate} bpm
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Blood Oxygen</span>
                        <span className="font-mono font-bold text-slate-900">
                          {currentPatient.recentConsultations[0].vitals.oxygenSaturation}%
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                        <span className="text-[10px] text-slate-400 block">Body Mass Index</span>
                        <span className="font-mono font-bold text-slate-900">
                          {currentPatient.recentConsultations[0].vitals.bmi}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    No doctor summaries recorded.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {currentPatient.recentConsultations.length} total clinical encounters on file
                </span>
                <button
                  onClick={() => setActiveTab("summaries")}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>View Full Encounter History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Prescriptions Quick View Strip */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">{t.portal.activeMedicationsTitle}</h3>
              </div>
              <button
                onClick={() => setActiveTab("prescriptions")}
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>{t.portal.tabPrescriptions}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPatient.activePrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {rx.rxNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          rx.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : rx.status === "DISPENSED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {rx.status === "ACTIVE" ? "Active • Ready for Dispensing" : rx.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 mt-2">{rx.medication}</h4>
                    <p className="text-xs text-slate-600 font-medium">{rx.dosage} • {rx.frequency}</p>
                    <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>{t.portal.refillsRemaining}: <strong className="text-slate-800">{rx.repeatsRemaining}</strong></span>
                      <span className="font-mono text-[10px] text-slate-400">Issued: {rx.issuedDate}</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadPrescription(rx)}
                      disabled={downloadingRxId === rx.id}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                    >
                      {downloadingRxId === rx.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>{downloadingRxId === rx.id ? "Generating PDF..." : t.portal.downloadOfficialRx}</span>
                    </button>

                    <button
                      onClick={() => handlePreviewPrescription(rx)}
                      className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="View PDF Preview & QR Code"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{t.common.view}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPCOMING APPOINTMENTS */}
      {activeTab === "appointments" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Your Scheduled &amp; Upcoming Consultations</h3>
                <p className="text-xs text-slate-500">
                  Confirmed hospital appointments, follow-ups, and arrival preparation instructions.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                {upcomingAppointments.length} Active Booking{upcomingAppointments.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-blue-300 transition-all shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                    <div className="flex items-center gap-3">
                      <span className="p-2.5 rounded-xl bg-blue-100 text-blue-800 font-bold text-xs flex flex-col items-center justify-center min-w-14">
                        <Clock className="w-4 h-4 mb-0.5" />
                        <span>{apt.time}</span>
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-900">{apt.clinician}</h4>
                          <span className="text-xs text-slate-500">{apt.clinicianTitle}</span>
                        </div>
                        <p className="text-xs text-blue-700 font-semibold">{apt.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{apt.status}</span>
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {apt.reminderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Date &amp; Facility Location
                      </span>
                      <p className="font-bold text-slate-800 text-sm mt-0.5">{apt.date}</p>
                      <div className="flex items-center gap-1.5 text-slate-600 mt-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{apt.facility} • {apt.roomOrSuite}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Purpose of Encounter
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">{apt.reasonForVisit}</p>
                      <span className="text-[11px] text-slate-500 block mt-1">
                        Type: <strong className="text-slate-700 font-semibold">{apt.appointmentType}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Preparation Guidelines */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      <span>Doctor&apos;s Arrival &amp; Preparation Instructions</span>
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
                      {apt.preparationNotes.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDownloadCalendar(apt)}
                        className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Add to Device Calendar (.ics)</span>
                      </button>

                      <button
                        onClick={() => setSelectedAppointmentForDirections(apt)}
                        className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>Directions &amp; Parking</span>
                      </button>
                    </div>

                    <button
                      onClick={() => triggerToast("Reception notified: Check-in confirmed via WhatsApp.")}
                      className="px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Confirm Attendance via WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MY PRESCRIPTIONS */}
      {activeTab === "prescriptions" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Official Prescriptions &amp; Digital Dispense Slips</h3>
                <p className="text-xs text-slate-500">
                  Cryptographically signed prescription documents. Download official PDF with QR code for pharmacy dispensing.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                  {currentPatient.activePrescriptions.length} Records on File
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {currentPatient.activePrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-mono font-bold text-xs border border-emerald-200">
                        {rx.rxNumber}
                      </span>
                      <div>
                        <h4 className="font-bold text-base text-slate-900">{rx.medication}</h4>
                        <p className="text-xs text-slate-500">Dosage Form: {rx.dosage}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          rx.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : rx.status === "DISPENSED"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {rx.status === "ACTIVE" ? "Active & Ready for Dispensing" : rx.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                        Frequency &amp; Directions
                      </span>
                      <span className="font-semibold text-slate-800 block mt-0.5">{rx.frequency}</span>
                      <span className="text-[11px] text-slate-500">Supply: {rx.duration}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                        Refills / Repeats Allowed
                      </span>
                      <span className="font-bold text-emerald-700 block mt-0.5 text-sm">
                        {rx.repeatsRemaining} Repeats Remaining
                      </span>
                      <span className="text-[10px] text-slate-400">Authorised by {doctor.name}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                        Cryptographic Seal
                      </span>
                      <span className="font-mono text-[10px] text-slate-600 block mt-0.5 truncate" title={rx.securityHash}>
                        SHA-256: {rx.securityHash.slice(0, 16)}...
                      </span>
                      <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Tamper-evident verification active</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      {/* Primary Download Button */}
                      <button
                        id={`btn-download-rx-${rx.id}`}
                        onClick={() => handleDownloadPrescription(rx)}
                        disabled={downloadingRxId === rx.id}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
                      >
                        {downloadingRxId === rx.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        <span>{downloadingRxId === rx.id ? "Generating PDF..." : "Download Official PDF"}</span>
                      </button>

                      {/* View & Verify Document Button */}
                      <button
                        id={`btn-view-rx-${rx.id}`}
                        onClick={() => handlePreviewPrescription(rx)}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>View Document &amp; QR</span>
                      </button>
                    </div>

                    <button
                      onClick={() => triggerToast(`Sent prescription ${rx.rxNumber} to your registered WhatsApp (+27 82 555 1092)`)}
                      className="px-3.5 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-teal-600" />
                      <span>Send to Pharmacy via WhatsApp</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCTOR SUMMARIES */}
      {activeTab === "summaries" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Medical Summaries Assigned by Your Doctors</h3>
                <p className="text-xs text-slate-500">
                  Comprehensive notes, diagnoses, care plans, and clinical guidelines authored by your attending physicians.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                {currentPatient.recentConsultations.length} Consultation Records
              </span>
            </div>

            <div className="space-y-4">
              {currentPatient.recentConsultations.map((con) => (
                <div
                  key={con.id}
                  className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs">
                        <Stethoscope className="w-4 h-4" />
                      </span>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{con.clinician}</h4>
                        <p className="text-xs text-indigo-700 font-semibold">{con.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
                        {con.date}
                      </span>
                      <span className="px-2 py-0.5 rounded font-bold text-xs bg-indigo-50 text-indigo-800 border border-indigo-200">
                        ICD-10: {con.icd10Code}
                      </span>
                    </div>
                  </div>

                  {/* Chief complaint & Diagnosis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Reason for Consultation
                      </span>
                      <p className="font-semibold text-slate-800 mt-0.5">{con.chiefComplaint}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Formal Clinical Diagnosis
                      </span>
                      <p className="font-bold text-slate-900 mt-0.5">{con.diagnosis}</p>
                    </div>
                  </div>

                  {/* Doctor's Clinical Notes */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">
                      Doctor&apos;s Clinical Assessment &amp; Instructions
                    </span>
                    <div className="p-3.5 bg-indigo-50/30 rounded-xl border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                      {con.clinicalNotes}
                    </div>
                  </div>

                  {/* Recorded Vitals at this visit */}
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1.5">
                      Encounter Vitals
                    </span>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono font-medium">
                        BP: <strong>{con.vitals.bloodPressure}</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono font-medium">
                        Pulse: <strong>{con.vitals.heartRate} bpm</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono font-medium">
                        SpO2: <strong>{con.vitals.oxygenSaturation}%</strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono font-medium">
                        BMI: <strong>{con.vitals.bmi}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => setSelectedConsultation(con)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
                    >
                      <span>View Full Encounter Record</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LAB & DIAGNOSTIC REPORTS */}
      {activeTab === "labs" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Doctor-Released Laboratory &amp; Diagnostic Reports</h3>
                <p className="text-xs text-slate-500">
                  Diagnostic lab results, blood panels, and imaging findings reviewed and authorized for patient release.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded border border-purple-200">
                {currentPatient.recentLabs.length} Authorized Results
              </span>
            </div>

            <div className="space-y-3">
              {currentPatient.recentLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{lab.testName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          lab.status === "Normal"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {lab.status}
                      </span>
                    </div>
                    <p className="text-slate-600">{lab.keyFinding}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Lab: {lab.laboratory}</span>
                      <span>•</span>
                      <span>Date: {lab.date}</span>
                      {lab.referenceRange && (
                        <>
                          <span>•</span>
                          <span>Reference: {lab.referenceRange}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      onClick={() => triggerToast(`Lab report for ${lab.testName} downloaded.`)}
                      className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Report</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRESCRIPTION DOCUMENT PREVIEW & QR CODE MODAL */}
      {previewingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cryptographic E-Prescription Document
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {previewingRx.prescriptionNumber} • {currentPatient.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setPreviewingRx(null);
                  if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
                  setPreviewBlobUrl(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {previewLoading ? (
                <div className="py-16 text-center space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                  <p className="text-slate-500">Generating cryptographic document preview...</p>
                </div>
              ) : previewBlobUrl ? (
                <div className="space-y-4">
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs h-96">
                    <iframe
                      src={previewBlobUrl}
                      title="Prescription Document Preview"
                      className="w-full h-full"
                    />
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Tamper-Proof Verification Verified</span>
                    </div>
                    <p className="text-[11px] text-emerald-800">
                      The embedded QR code allows registered South African pharmacies to instantly verify Dr. Sarah Chen&apos;s digital signature and dispense status on the national registry.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                SHA-256: {previewingRx.securityHash.slice(0, 18)}...
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPreviewingRx(null);
                    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
                    setPreviewBlobUrl(null);
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    const foundRx = currentPatient.activePrescriptions.find(
                      (r) => r.rxNumber === previewingRx.prescriptionNumber
                    );
                    if (foundRx) {
                      await handleDownloadPrescription(foundRx);
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DIRECTIONS & CLINIC LOCATION MODAL */}
      {selectedAppointmentForDirections && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Facility Directions &amp; Arrival</h3>
              </div>
              <button
                onClick={() => setSelectedAppointmentForDirections(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 text-sm block">
                  {selectedAppointmentForDirections.facility}
                </span>
                <span className="text-blue-800 block">
                  Room / Suite: <strong>{selectedAppointmentForDirections.roomOrSuite}</strong>
                </span>
                <span className="text-[11px] text-blue-600 font-mono block">
                  Consulting: {selectedAppointmentForDirections.clinician} ({selectedAppointmentForDirections.specialty})
                </span>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Arrival &amp; Parking Logistics
                </h4>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-slate-600 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span><strong>Parking:</strong> Underground parking is accessible via West Wing Entrance Gate 2. Validation is provided at reception.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span><strong>Check-in:</strong> Proceed to Reception Desk B on the 3rd floor. Have your Medical Aid card or digital QR pass ready.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <span><strong>Wheelchair Access:</strong> Ramp access and elevator banks available at Main Concourse.</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAppointmentForDirections(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED CONSULTATION RECORD MODAL */}
      {selectedConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Clinical Consultation Record • {selectedConsultation.date}
                </h3>
              </div>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="flex justify-between items-center bg-indigo-50/60 p-3 rounded-xl border border-indigo-100">
                <div>
                  <span className="font-bold text-indigo-950 block">{selectedConsultation.clinician}</span>
                  <span className="text-[11px] text-indigo-700">{selectedConsultation.specialty}</span>
                </div>
                <span className="font-bold text-xs bg-white px-2.5 py-1 rounded border border-indigo-200 text-indigo-900">
                  {selectedConsultation.icd10Code}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Diagnosis</span>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900">
                  {selectedConsultation.diagnosis}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Doctor&apos;s Full Clinical Notes</span>
                <p className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                  {selectedConsultation.clinicalNotes}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Recorded Vital Signs</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">BP</span>
                    <span className="font-mono font-bold text-slate-800">{selectedConsultation.vitals.bloodPressure}</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Heart Rate</span>
                    <span className="font-mono font-bold text-slate-800">{selectedConsultation.vitals.heartRate} bpm</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">Oxygen</span>
                    <span className="font-mono font-bold text-slate-800">{selectedConsultation.vitals.oxygenSaturation}%</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] text-slate-400 block">BMI</span>
                    <span className="font-mono font-bold text-slate-800">{selectedConsultation.vitals.bmi}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Localized Portal Disclaimer Footer */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
        <p>{t.portal.portalDisclaimer}</p>
      </div>
    </div>
  );
};
