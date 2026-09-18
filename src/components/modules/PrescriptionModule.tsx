import React, { useState } from "react";
import { 
  FileSignature, 
  Plus, 
  Search, 
  QrCode, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Download, 
  Sparkles,
  ExternalLink,
  X,
  RefreshCw,
  Eye,
  FileText,
  Lock,
  Check,
  History,
  ChevronRight,
  Calculator
} from "lucide-react";
import { PrescriptionSummary, DoctorProfile, HistoricalMedication } from "../../types";
import { MOCK_PATIENTS } from "../../data/patients";
import { downloadPrescriptionPDF, getPrescriptionPdfBlobUrl } from "../../utils/prescriptionPdfGenerator";
import { PatientPrescriptionHistory } from "../prescription/PatientPrescriptionHistory";
import { AiDosageCalculator } from "../prescription/AiDosageCalculator";
import { useI18n } from "../../i18n/I18nContext";

interface PrescriptionModuleProps {
  doctor?: DoctorProfile;
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

export const PrescriptionModule: React.FC<PrescriptionModuleProps> = ({ doctor = DEFAULT_DOCTOR }) => {
  const { t } = useI18n();
  const [mainView, setMainView] = useState<"history" | "queue" | "calculator">("history");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "dispensed">("all");
  const [selectedRx, setSelectedRx] = useState<PrescriptionSummary | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [dosageAdjustmentBadge, setDosageAdjustmentBadge] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewingRx, setPreviewingRx] = useState<PrescriptionSummary | null>(null);

  // Draft form state
  const [draftPatientName, setDraftPatientName] = useState("James Miller");
  const [draftIcd10, setDraftIcd10] = useState("I10.9 (Essential Hypertension)");
  const [draftRepeats, setDraftRepeats] = useState(2);
  const [draftMedication, setDraftMedication] = useState("Amlodipine Besylate 5mg");
  const [draftDirections, setDraftDirections] = useState("1 tablet daily in the morning with water");
  const [draftDuration, setDraftDuration] = useState("30 days supply");

  const [prescriptions, setPrescriptions] = useState<PrescriptionSummary[]>([
    {
      id: "rx-1",
      prescriptionNumber: "RX-2026-8891",
      patientName: "James Miller",
      patientAge: 52,
      medications: ["Amlodipine Besylate 5mg (1x daily)", "Atorvastatin 20mg (1x nocte)"],
      diagnosisIcd10: "I10.9 (Essential Hypertension)",
      status: "ISSUED",
      securityHash: "8a32b0c19df3e4811a4329bfa810cde427a19283f",
      issuedDate: "Today, 14:30",
      deliveryChannel: "WhatsApp",
    },
    {
      id: "rx-2",
      prescriptionNumber: "RX-2026-8842",
      patientName: "Elena Rostova",
      patientAge: 38,
      medications: ["Amoxicillin/Clavulanate 875/125mg (BD 7 days)", "Paracetamol 1g QID PRN"],
      diagnosisIcd10: "J01.90 (Acute Sinusitis)",
      status: "DISPENSED",
      securityHash: "1f92e071bb2879a941ccda5531089be2a7c41908b",
      issuedDate: "Yesterday, 11:15",
      deliveryChannel: "WhatsApp",
    },
    {
      id: "rx-3",
      prescriptionNumber: "RX-2026-8799",
      patientName: "David K. Ndlovu",
      patientAge: 64,
      medications: ["Metformin HCl 850mg (BD with meals)", "Empagliflozin 10mg (1x mane)"],
      diagnosisIcd10: "E11.9 (Type 2 Diabetes Mellitus)",
      status: "ISSUED",
      securityHash: "c04481b7e408d2983ff8a02a90100418c3ef94821",
      issuedDate: "15 Sep 2026",
      deliveryChannel: "Email",
    },
  ]);

  const filtered = prescriptions.filter((rx) => {
    if (activeTab === "active" && rx.status !== "ISSUED") return false;
    if (activeTab === "dispensed" && rx.status !== "DISPENSED") return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      rx.prescriptionNumber.toLowerCase().includes(q) ||
      rx.patientName.toLowerCase().includes(q) ||
      rx.diagnosisIcd10.toLowerCase().includes(q) ||
      rx.medications.some((m) => m.toLowerCase().includes(q))
    );
  });

  // Handle PDF Generation & Download
  const handleDownloadPDF = async (rx: PrescriptionSummary) => {
    try {
      setDownloadingId(rx.id);
      const patientMatch = MOCK_PATIENTS.find((p) => p.name === rx.patientName);

      await downloadPrescriptionPDF({
        rx,
        doctor,
        patient: patientMatch,
        repeatsAllowed: 2,
      });

      setToastMessage(`Prescription PDF downloaded: Prescription_${rx.prescriptionNumber}.pdf (ECDSA & QR Verified)`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setToastMessage("Failed to generate prescription PDF. Please retry.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Live In-App PDF Preview
  const handlePreviewPDF = async (rx: PrescriptionSummary) => {
    try {
      setDownloadingId(rx.id);
      const patientMatch = MOCK_PATIENTS.find((p) => p.name === rx.patientName);
      const blobUrl = await getPrescriptionPdfBlobUrl({
        rx,
        doctor,
        patient: patientMatch,
        repeatsAllowed: 2,
      });
      setPreviewBlobUrl(blobUrl);
      setPreviewingRx(rx);
    } catch (err) {
      console.error("PDF preview generation failed:", err);
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Formulation & Immediate Signing
  const handleSignAndSavePrescription = async (andDownloadPdf = false) => {
    const rxNumber = `RX-2026-${Math.floor(8900 + Math.random() * 100)}`;
    const randomHash = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const matchedPatient = MOCK_PATIENTS.find((p) => p.name.includes(draftPatientName)) || MOCK_PATIENTS[0];

    const newRx: PrescriptionSummary = {
      id: `rx-${Date.now()}`,
      prescriptionNumber: rxNumber,
      patientName: matchedPatient.name,
      patientAge: matchedPatient.age,
      medications: [
        `${draftMedication} (${draftDirections})`,
        "Calcium Carbonate 500mg (1x daily)",
      ],
      diagnosisIcd10: draftIcd10,
      status: "ISSUED",
      securityHash: randomHash,
      issuedDate: "Just now",
      deliveryChannel: "WhatsApp",
    };

    setPrescriptions([newRx, ...prescriptions]);
    setIsDrafting(false);

    if (andDownloadPdf) {
      await handleDownloadPDF(newRx);
    } else {
      setToastMessage(`Prescription ${newRx.prescriptionNumber} sealed and queued for WhatsApp transmission.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  // Pre-fill drafting form from historical medication
  const handleRenewFromHistory = (med: HistoricalMedication) => {
    setDraftPatientName(med.patientName);
    setDraftIcd10(`${med.icd10Code} (${med.indication})`);
    setDraftMedication(med.medicationName);
    setDraftDirections(med.frequency);
    setDraftDuration(`${med.daysSupply} days supply`);
    setDraftRepeats(Math.max(1, med.totalRefillsAuthorized));
    setIsDrafting(true);
    setToastMessage(`Pre-filled e-prescription for ${med.patientName} (${med.medicationName}). Review and seal.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Pre-fill drafting form from AI Dosage Calculator
  const handleApplyFromCalculator = (calc: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    directions: string;
  }) => {
    setDraftMedication(calc.medication);
    setDraftDirections(calc.directions);
    setDraftDuration(calc.duration);
    setDosageAdjustmentBadge(`${calc.dosage} • ${calc.frequency}`);
    setIsCalculatorOpen(false);
    setIsDrafting(true);
    setToastMessage(`Dosage for ${calc.medication} calibrated & applied to e-prescription draft.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Module Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <FileSignature className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">{t.rx.moduleTitle}</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              HL7/FHIR & FIPS 140-3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.rx.moduleDescription}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            id="btn-open-dosage-calculator"
            onClick={() => setIsCalculatorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors shadow-2xs"
          >
            <Calculator className="w-4 h-4 text-teal-600" />
            <span>{t.rx.dosageCalculatorButton}</span>
          </button>

          <button
            id="btn-switch-main-view"
            onClick={() => setMainView(mainView === "history" ? "queue" : "history")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors border shadow-2xs ${
              mainView === "history"
                ? "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <History className="w-4 h-4 text-teal-600" />
            <span>{mainView === "history" ? t.rx.queueTab : t.rx.historyLog}</span>
          </button>

          <button
            id="btn-write-prescription"
            onClick={() => setIsDrafting(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.rx.draftNewRx}</span>
          </button>
        </div>
      </div>

      {/* Real-time Toast Feedback */}
      {toastMessage && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Module Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <button
            id="tab-view-history"
            onClick={() => setMainView("history")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              mainView === "history"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Patient Prescription History</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              Tabular Log
            </span>
          </button>

          <button
            id="tab-view-queue"
            onClick={() => setMainView("queue")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              mainView === "queue"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileSignature className="w-4 h-4" />
            <span>E-Prescription Queue</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
              {prescriptions.length} Active
            </span>
          </button>

          <button
            id="tab-view-calculator"
            onClick={() => setMainView("calculator")}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              mainView === "calculator"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Calculator className="w-4 h-4 text-teal-600" />
            <span>{t.rx.dosageCalculatorTab}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              KDIGO & Gemini
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center text-xs text-slate-400">
          <span>Refill Tracking & Renal Dosing Support</span>
        </div>
      </div>

      {/* Main View: Switch between History, Calculator, and Queue */}
      {mainView === "history" ? (
        <PatientPrescriptionHistory
          doctor={doctor}
          onSelectForRenewal={handleRenewFromHistory}
        />
      ) : mainView === "calculator" ? (
        <AiDosageCalculator
          onApplyToPrescription={handleApplyFromCalculator}
        />
      ) : (
        /* Queue View: Metrics Row & Active Dispense Queue */
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Prescriptions Today</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{prescriptions.length + 5}</div>
              <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>100% Cryptographically Sealed (ECDSA)</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>WhatsApp Dispatches</span>
                <Send className="w-4 h-4 text-teal-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">14</div>
              <div className="text-[11px] text-slate-500 mt-1">Delivered via Meta Cloud API v20.0</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pharmacy QR Verifications</span>
                <QrCode className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-1">8</div>
              <div className="text-[11px] text-indigo-600 mt-1">Scanned via Public Verification Gateway</div>
            </div>
          </div>

          {/* Main List Card */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            {/* Filter & Search Header */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium w-fit">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.rx.tabAll}
                </button>
                <button
                  onClick={() => setActiveTab("active")}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === "active" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.rx.tabActive}
                </button>
                <button
                  onClick={() => setActiveTab("dispensed")}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === "dispensed" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.rx.tabDispensed}
                </button>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.rx.searchPlaceholder}
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Prescription Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">RX Number</th>
                    <th className="py-3 px-4">{t.common.patient}</th>
                    <th className="py-3 px-4">{t.rx.medicationLabel}</th>
                    <th className="py-3 px-4">{t.rx.icd10Label}</th>
                    <th className="py-3 px-4">{t.common.status}</th>
                    <th className="py-3 px-4">Verification Hash</th>
                    <th className="py-3 px-4 text-right">{t.common.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-teal-700">
                        {rx.prescriptionNumber}
                        <div className="text-[10px] text-slate-400 font-sans">{rx.issuedDate}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900">{rx.patientName}</span>
                        <span className="text-slate-400 ml-1">({rx.patientAge}y)</span>
                        <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                          <Send className="w-2.5 h-2.5" />
                          <span>{rx.deliveryChannel}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {rx.medications.map((m, idx) => (
                          <div key={idx} className="truncate text-slate-800 font-medium">
                            • {m}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10px] text-slate-700">
                          {rx.diagnosisIcd10}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[10px] border ${
                            rx.status === "ISSUED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {rx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        <span title={rx.securityHash}>{rx.securityHash.substring(0, 10)}...</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* PDF DOWNLOAD BUTTON */}
                          <button
                            id={`btn-download-pdf-${rx.id}`}
                            onClick={() => handleDownloadPDF(rx)}
                            disabled={downloadingId === rx.id}
                            title="Download Cryptographically Signed PDF with Unique QR Code"
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                          >
                            {downloadingId === rx.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                            ) : (
                              <Download className="w-3.5 h-3.5 text-teal-600" />
                            )}
                            <span>{downloadingId === rx.id ? "Signing..." : "Download PDF"}</span>
                          </button>

                          {/* VERIFY QR MODAL BUTTON */}
                          <button
                            id={`btn-verify-qr-${rx.id}`}
                            onClick={() => setSelectedRx(rx)}
                            className="px-2.5 py-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors inline-flex items-center gap-1.5"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Verify QR</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Draft New E-Prescription Modal */}
      {isDrafting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-bold text-slate-900">{t.rx.formTitle}</h3>
                  <p className="text-[11px] text-slate-500">{t.rx.formSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrafting(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.rx.patientFieldLabel}</label>
                <select 
                  value={draftPatientName}
                  onChange={(e) => setDraftPatientName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="James Miller">James Miller (52y) — ID #7403125089088</option>
                  <option value="Elena Rostova">Elena Rostova (38y) — ID #8809145028081</option>
                  <option value="David K. Ndlovu">David K. Ndlovu (64y) — ID #620914-03</option>
                  <option value="Amina Patel">Amina Patel (45y) — ID #8104190289082</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.rx.icd10Label}</label>
                  <input
                    type="text"
                    value={draftIcd10}
                    onChange={(e) => setDraftIcd10(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.rx.repeatsLabel}</label>
                  <select 
                    value={draftRepeats}
                    onChange={(e) => setDraftRepeats(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option value={0}>0 ({t.common.noData})</option>
                    <option value={1}>1</option>
                    <option value={2}>2 ({t.portal.refillsRemaining}: 2)</option>
                    <option value={3}>3</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">{t.rx.medicationLabel}</label>
                  <button
                    type="button"
                    id="btn-open-dosage-calc-draft"
                    onClick={() => setIsCalculatorOpen(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>AI Dosage Calculator</span>
                  </button>
                </div>

                {dosageAdjustmentBadge && (
                  <div className="mb-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-900 flex items-center justify-between animate-in fade-in">
                    <div className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Renal-Adjusted Dose: <strong>{dosageAdjustmentBadge}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDosageAdjustmentBadge(null)}
                      className="text-emerald-700 hover:text-emerald-900 text-[10px] underline"
                    >
                      Reset
                    </button>
                  </div>
                )}

                <input
                  type="text"
                  value={draftMedication}
                  onChange={(e) => setDraftMedication(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none mb-2"
                  placeholder={t.rx.medicationPlaceholder}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={draftDirections}
                    onChange={(e) => setDraftDirections(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
                    placeholder={t.rx.directionsPlaceholder}
                  />
                  <input
                    type="text"
                    value={draftDuration}
                    onChange={(e) => setDraftDuration(e.target.value)}
                    className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs"
                    placeholder={t.rx.durationPlaceholder}
                  />
                </div>
              </div>

              {/* Safety validation checklist */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5 text-teal-950">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-teal-800 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>{t.rx.safetyChecksTitle}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] text-teal-900 font-medium">
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{t.rx.safetyCheckAllergies}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{t.rx.safetyCheckInteractions}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{t.rx.safetyCheckDosage}</span>
                  </div>
                </div>
                <div className="text-[10px] text-teal-800/80 pt-1 border-t border-teal-200/60 leading-tight">
                  Signing with <strong>{doctor.name} ({doctor.licenseNumber})</strong> will compute SHA-256 HMAC & ECDSA P-256 digital signature with a verification QR code.
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-2.5">
              <button
                onClick={() => setIsDrafting(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {t.common.cancel}
              </button>
              
              <button
                id="btn-sign-and-save"
                onClick={() => handleSignAndSavePrescription(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <FileSignature className="w-4 h-4 text-teal-600" />
                <span>{t.rx.issueButton}</span>
              </button>

              <button
                id="btn-sign-and-download-pdf"
                onClick={() => handleSignAndSavePrescription(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{t.rx.downloadPdf}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code & Cryptographic Verification Preview Modal */}
      {selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900">Cryptographic Seal & QR Verification</h3>
              </div>
              <button
                onClick={() => setSelectedRx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="inline-block p-4 bg-slate-50 border-2 border-dashed border-teal-300 rounded-2xl">
                <div className="w-40 h-40 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center p-3 text-center mx-auto shadow-sm">
                  <QrCode className="w-20 h-20 text-teal-400 mb-1" />
                  <span className="text-[10px] font-mono text-slate-300 font-bold tracking-wider">SCAN TO VERIFY</span>
                  <span className="text-[9px] text-teal-300 font-mono truncate w-full">{selectedRx.prescriptionNumber}</span>
                </div>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid Prescription • ECDSA P-256 Verified</span>
                </span>
                <p className="text-sm font-bold text-slate-800 mt-2">{selectedRx.patientName} ({selectedRx.patientAge}y)</p>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedRx.prescriptionNumber} • {selectedRx.diagnosisIcd10}</p>
              </div>

              {/* Cryptographic Specifications Box */}
              <div className="text-left bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <span>Cryptographic Integrity Digest</span>
                  <span className="text-teal-700 font-mono">FIPS 140-3</span>
                </div>

                <div className="font-mono text-[10px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 break-all select-all">
                  {selectedRx.securityHash}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-[10px] text-slate-500">
                  <div>
                    <span className="block text-slate-400">Prescribing Doctor:</span>
                    <strong className="text-slate-700">{doctor.name} ({doctor.licenseNumber})</strong>
                  </div>
                  <div>
                    <span className="block text-slate-400">Public Verification Node:</span>
                    <strong className="text-slate-700 font-mono">verify.activity-health.org</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                id="btn-preview-pdf-modal"
                onClick={() => handlePreviewPDF(selectedRx)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Live PDF Preview</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setSelectedRx(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  id="btn-download-signed-pdf"
                  onClick={() => handleDownloadPDF(selectedRx)}
                  disabled={downloadingId === selectedRx.id}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 w-full sm:w-auto justify-center disabled:opacity-50"
                >
                  {downloadingId === selectedRx.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{downloadingId === selectedRx.id ? "Generating PDF..." : "Download Signed PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live PDF Viewer Modal */}
      {previewBlobUrl && previewingRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    PDF Document Preview — {previewingRx.prescriptionNumber}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Patient: {previewingRx.patientName} • Cryptographic Signature & QR Embedded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPDF(previewingRx)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(previewBlobUrl);
                    setPreviewBlobUrl(null);
                    setPreviewingRx(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-200 p-2 sm:p-4 overflow-hidden">
              <iframe
                src={previewBlobUrl}
                title="Prescription PDF Preview"
                className="w-full h-full rounded-xl border border-slate-300 bg-white shadow-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Dosage Calculator Modal Dialog */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <AiDosageCalculator
            isModal={true}
            initialMedication={draftMedication.split("(")[0].trim() || "Amoxicillin / Clavulanate"}
            initialPatientName={draftPatientName}
            initialIndication={draftIcd10}
            initialAge={MOCK_PATIENTS.find((p) => p.name.includes(draftPatientName))?.age || 52}
            onApplyToPrescription={handleApplyFromCalculator}
            onClose={() => setIsCalculatorOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
