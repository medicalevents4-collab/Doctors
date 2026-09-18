import React, { useState, useMemo } from "react";
import {
  Pill,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  User,
  X,
  Plus,
  ArrowUpDown,
  History,
  AlertCircle,
  FileSpreadsheet,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { HistoricalMedication, DoctorProfile, PrescriptionSummary } from "../../types";
import { HISTORICAL_MEDICATIONS } from "../../data/prescriptionHistory";
import { MOCK_PATIENTS } from "../../data/patients";
import { downloadPrescriptionPDF } from "../../utils/prescriptionPdfGenerator";
import { useI18n } from "../../i18n/I18nContext";

const DEFAULT_DOCTOR: DoctorProfile = {
  name: "Dr. Sarah Chen",
  title: "MD, FCP(SA)",
  specialty: "Cardiology & Internal Medicine",
  licenseNumber: "HPCSA #MP098231",
  practiceNumber: "BHF #0142890",
  clinicName: "Metro Medical Center — West Wing",
  initials: "SC",
};

interface PatientPrescriptionHistoryProps {
  doctor?: DoctorProfile;
  selectedPatientName?: string;
  onSelectForRenewal?: (med: HistoricalMedication) => void;
  onNavigateToPatient?: (patientId: string) => void;
}

export const PatientPrescriptionHistory: React.FC<PatientPrescriptionHistoryProps> = ({
  doctor = DEFAULT_DOCTOR,
  selectedPatientName: initialPatientFilter,
  onSelectForRenewal,
  onNavigateToPatient,
}) => {
  const { t } = useI18n();
  // Filters & Search
  const [selectedPatient, setSelectedPatient] = useState<string>(initialPatientFilter || "ALL");
  const [refillFilter, setRefillFilter] = useState<string>("ALL");
  const [expiryFilter, setExpiryFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<"expirationDate" | "prescribedDate" | "medicationName" | "refillsRemaining">("expirationDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Selected item for modal details
  const [inspectingMed, setInspectingMed] = useState<HistoricalMedication | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Local state for mutations like adding refills or updating
  const [medicationsList, setMedicationsList] = useState<HistoricalMedication[]>(HISTORICAL_MEDICATIONS);

  // Reference date: Sep 17, 2026
  const CURRENT_DATE = useMemo(() => new Date("2026-09-17T16:45:00"), []);

  // Calculate days remaining until expiration
  const getExpirationDetails = (expirationDateStr: string) => {
    // parse date format e.g. "14 Jan 2027", "12 Aug 2026"
    const expDate = new Date(expirationDateStr);
    const diffMs = expDate.getTime() - CURRENT_DATE.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    const isExpired = diffDays < 0;
    const isExpiringSoon = !isExpired && diffDays <= 30;

    return {
      diffDays,
      isExpired,
      isExpiringSoon,
      expDate,
    };
  };

  // Filtered & Sorted list
  const filteredList = useMemo(() => {
    return medicationsList
      .filter((med) => {
        // Patient filter
        if (selectedPatient !== "ALL" && med.patientName !== selectedPatient) {
          return false;
        }

        // Status filter
        if (statusFilter !== "ALL" && med.status !== statusFilter) {
          return false;
        }

        // Refill Filter
        if (refillFilter === "AVAILABLE" && med.refillsRemaining <= 0) return false;
        if (refillFilter === "LOW" && (med.refillsRemaining !== 1 || med.totalRefillsAuthorized === 0)) return false;
        if (refillFilter === "DEPLETED" && (med.refillsRemaining > 0 || med.totalRefillsAuthorized === 0)) return false;
        if (refillFilter === "NO_REFILLS" && med.totalRefillsAuthorized !== 0) return false;

        // Expiration Filter
        const { isExpired, isExpiringSoon } = getExpirationDetails(med.expirationDate);
        if (expiryFilter === "ACTIVE" && isExpired) return false;
        if (expiryFilter === "EXPIRING_SOON" && !isExpiringSoon) return false;
        if (expiryFilter === "EXPIRED" && !isExpired) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = med.medicationName.toLowerCase().includes(q);
          const matchGeneric = med.genericName.toLowerCase().includes(q);
          const matchBrand = med.brandName?.toLowerCase().includes(q);
          const matchRx = med.rxNumber.toLowerCase().includes(q);
          const matchPatient = med.patientName.toLowerCase().includes(q);
          const matchIndication = med.indication.toLowerCase().includes(q);
          const matchIcd = med.icd10Code.toLowerCase().includes(q);
          if (!matchName && !matchGeneric && !matchBrand && !matchRx && !matchPatient && !matchIndication && !matchIcd) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = "";
        let valB: string | number = "";

        if (sortField === "expirationDate") {
          valA = new Date(a.expirationDate).getTime();
          valB = new Date(b.expirationDate).getTime();
        } else if (sortField === "prescribedDate") {
          valA = new Date(a.prescribedDate).getTime();
          valB = new Date(b.prescribedDate).getTime();
        } else if (sortField === "refillsRemaining") {
          valA = a.refillsRemaining;
          valB = b.refillsRemaining;
        } else {
          valA = a.medicationName.toLowerCase();
          valB = b.medicationName.toLowerCase();
        }

        if (sortOrder === "asc") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
  }, [medicationsList, selectedPatient, statusFilter, refillFilter, expiryFilter, searchQuery, sortField, sortOrder]);

  // High-level statistics
  const stats = useMemo(() => {
    const list = selectedPatient === "ALL" 
      ? medicationsList 
      : medicationsList.filter((m) => m.patientName === selectedPatient);

    const total = list.length;
    const active = list.filter((m) => m.status === "ACTIVE").length;
    const lowOrDepletedRefills = list.filter(
      (m) => m.status === "ACTIVE" && (m.refillsRemaining <= 1 || m.refillStatus === "DEPLETED")
    ).length;
    const expiredOrNear = list.filter((m) => {
      const { isExpired, isExpiringSoon } = getExpirationDetails(m.expirationDate);
      return isExpired || isExpiringSoon;
    }).length;

    return { total, active, lowOrDepletedRefills, expiredOrNear };
  }, [medicationsList, selectedPatient]);

  // Trigger Refill Authorization
  const handleAuthorizeRefill = (med: HistoricalMedication) => {
    setMedicationsList((prev) =>
      prev.map((item) => {
        if (item.id === med.id) {
          const updatedRepeats = item.refillsRemaining + 1;
          const updatedTotal = Math.max(item.totalRefillsAuthorized, updatedRepeats);
          return {
            ...item,
            refillsRemaining: updatedRepeats,
            totalRefillsAuthorized: updatedTotal,
            refillStatus: updatedRepeats > 1 ? "REFILLS_AVAILABLE" : "LOW_REFILLS",
            status: "ACTIVE",
          };
        }
        return item;
      })
    );

    setToastMessage(`Refill authorized for ${med.medicationName}. Repeats updated to ${med.refillsRemaining + 1}.`);
    setTimeout(() => setToastMessage(null), 4000);
    if (inspectingMed?.id === med.id) {
      setInspectingMed({
        ...med,
        refillsRemaining: med.refillsRemaining + 1,
        status: "ACTIVE",
      });
    }
  };

  // Trigger PDF Generation for historical prescription
  const handleDownloadHistoricalPDF = async (med: HistoricalMedication) => {
    try {
      setDownloadingId(med.id);
      const patientMatch = MOCK_PATIENTS.find((p) => p.name === med.patientName);
      
      const rxSummary: PrescriptionSummary = {
        id: med.id,
        prescriptionNumber: med.rxNumber,
        patientName: med.patientName,
        patientAge: patientMatch?.age || 50,
        medications: [`${med.medicationName} (${med.frequency})`],
        diagnosisIcd10: `${med.icd10Code} (${med.indication})`,
        status: med.status === "ACTIVE" ? "ISSUED" : "DISPENSED",
        securityHash: med.securityHash,
        issuedDate: med.prescribedDate,
        deliveryChannel: "WhatsApp",
      };

      await downloadPrescriptionPDF({
        rx: rxSummary,
        doctor: doctor,
        patient: patientMatch,
        repeatsAllowed: med.refillsRemaining,
      });

      setToastMessage(`Prescription PDF downloaded: Prescription_${med.rxNumber}.pdf`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error("PDF generation failed:", err);
      setToastMessage("Error generating prescription PDF. Please retry.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setDownloadingId(null);
    }
  };

  // Export history to CSV
  const handleExportCSV = () => {
    const headers = [
      "RX Number",
      "Patient Name",
      "MRN",
      "Medication Name",
      "Generic Name",
      "Dosage",
      "Frequency",
      "Indication",
      "ICD-10",
      "Prescribed Date",
      "Expiration Date",
      "Refills Remaining",
      "Total Refills Authorized",
      "Status",
      "Prescribing Clinician"
    ];

    const rows = filteredList.map((m) => [
      `"${m.rxNumber}"`,
      `"${m.patientName}"`,
      `"${m.patientMrn}"`,
      `"${m.medicationName}"`,
      `"${m.genericName}"`,
      `"${m.dosage}"`,
      `"${m.frequency}"`,
      `"${m.indication}"`,
      `"${m.icd10Code}"`,
      `"${m.prescribedDate}"`,
      `"${m.expirationDate}"`,
      m.refillsRemaining,
      m.totalRefillsAuthorized,
      `"${m.status}"`,
      `"${m.prescribedBy}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Patient_Prescription_History_${selectedPatient.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage("Prescription history export downloaded as CSV.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white text-[11px]">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Historical Prescriptions</span>
            <History className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {selectedPatient === "ALL" ? "Across all active practice cohorts" : `Registered for ${selectedPatient}`}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Active Continuous Regimens</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{stats.active}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Current valid prescriptions</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Refills Depleted / Low</span>
            <RefreshCw className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-1">{stats.lowOrDepletedRefills}</div>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">≤ 1 refill left (Renewal recommended)</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Expired / Expiring Soon</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700 mt-1">{stats.expiredOrNear}</div>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Past expiry or within 30-day window</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Comprehensive Filter Controls Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-teal-600" />
              <div>
                <h3 className="font-bold text-sm text-slate-900">Patient Prescription History & Medication Log</h3>
                <p className="text-[11px] text-slate-500">
                  Tabular longitudinal record with live refill monitoring and regulatory expiration verification.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1.5"
                title="Export this tabular log to CSV for audit or pharmacy review"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                <span>Export CSV</span>
              </button>

              <button
                id="btn-sort-toggle"
                onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1"
                title="Toggle sort direction"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{sortOrder === "asc" ? "Earliest First" : "Latest First"}</span>
              </button>
            </div>
          </div>

          {/* Filtering controls row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1 text-xs">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-history-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.rx.searchPlaceholder}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Patient Filter */}
            <div>
              <select
                id="select-patient-filter"
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
              >
                <option value="ALL">All Patients (All Records)</option>
                <option value="James Miller">James Miller (MED-890123)</option>
                <option value="Elena Rostova">Elena Rostova (MED-441920)</option>
                <option value="Robert Taylor">Robert Taylor (MED-770319)</option>
                <option value="David K. Ndlovu">David K. Ndlovu (MED-620914)</option>
                <option value="Amina Patel">Amina Patel (MED-951102)</option>
              </select>
            </div>

            {/* Refill Filter */}
            <div>
              <select
                id="select-refill-filter"
                value={refillFilter}
                onChange={(e) => setRefillFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ALL">Refill Status: All</option>
                <option value="AVAILABLE">Refills Available (2+)</option>
                <option value="LOW">Low Refills (1 Left)</option>
                <option value="DEPLETED">Depleted (0 Refills)</option>
                <option value="NO_REFILLS">No Refills (Acute Course)</option>
              </select>
            </div>

            {/* Expiration Filter */}
            <div>
              <select
                id="select-expiry-filter"
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
                className="w-full py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ALL">Expiration: All</option>
                <option value="ACTIVE">Valid & Active</option>
                <option value="EXPIRING_SOON">Expiring Soon (≤ 30 Days)</option>
                <option value="EXPIRED">Expired Past Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabular List of Historical Medications */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider select-none">
              <tr>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    setSortField("medicationName");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{t.rx.medicationLabel}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">{t.common.patient} / Indication</th>
                <th className="py-3 px-4">Dosage & Sig</th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    setSortField("refillsRemaining");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>{t.portal.refillsRemaining}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    setSortField("prescribedDate");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Prescribed</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  className="py-3 px-4 cursor-pointer hover:bg-slate-100"
                  onClick={() => {
                    setSortField("expirationDate");
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Expiration Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">{t.common.status}</th>
                <th className="py-3 px-4 text-right">{t.common.actions}</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Pill className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No historical medications found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Try clearing or adjusting search queries and filter dropdowns.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPatient("ALL");
                        setRefillFilter("ALL");
                        setExpiryFilter("ALL");
                        setStatusFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="mt-3 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredList.map((med) => {
                  const { diffDays, isExpired, isExpiringSoon } = getExpirationDetails(med.expirationDate);

                  // Determine refill status badge styling
                  let refillBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  let refillLabel = `${med.refillsRemaining} of ${med.totalRefillsAuthorized} Remaining`;
                  if (med.totalRefillsAuthorized === 0) {
                    refillBadgeClass = "bg-slate-100 text-slate-600 border-slate-200";
                    refillLabel = "No Refills (Acute Course)";
                  } else if (med.refillsRemaining === 0) {
                    refillBadgeClass = "bg-rose-50 text-rose-700 border-rose-200";
                    refillLabel = "0 Refills (Depleted)";
                  } else if (med.refillsRemaining === 1) {
                    refillBadgeClass = "bg-amber-50 text-amber-700 border-amber-200";
                    refillLabel = "1 Refill Left (Low)";
                  }

                  return (
                    <tr key={med.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Medication Name & Brand */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 mt-0.5 border border-teal-100 shrink-0">
                            <Pill className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span>{med.medicationName}</span>
                              {med.brandName && (
                                <span className="text-[10px] font-semibold text-slate-500 px-1.5 py-0.2 bg-slate-100 rounded border border-slate-200">
                                  {med.brandName}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              Rx #{med.rxNumber} • {med.route}
                            </div>
                            <div className="text-[10px] text-slate-400 italic">
                              Generic: {med.genericName}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Patient & Indication */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{med.patientName}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          MRN: {med.patientMrn}
                        </div>
                        <div className="text-[11px] text-teal-800 font-medium mt-0.5 flex items-center gap-1">
                          <span className="px-1.5 py-0.2 rounded bg-teal-50 border border-teal-100 font-mono text-[10px]">
                            {med.icd10Code}
                          </span>
                          <span className="truncate max-w-[140px]" title={med.indication}>
                            {med.indication}
                          </span>
                        </div>
                      </td>

                      {/* Dosage & Sig */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-medium text-slate-800">{med.dosage}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2" title={med.frequency}>
                          {med.frequency}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Supply: {med.daysSupply} days
                        </div>
                      </td>

                      {/* Refill Status Column */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${refillBadgeClass}`}>
                            {med.refillsRemaining === 0 && med.totalRefillsAuthorized > 0 ? (
                              <AlertCircle className="w-2.5 h-2.5 text-rose-500" />
                            ) : med.refillsRemaining === 1 ? (
                              <Clock className="w-2.5 h-2.5 text-amber-500" />
                            ) : med.totalRefillsAuthorized === 0 ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            ) : (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                            )}
                            <span>{refillLabel}</span>
                          </span>

                          {med.totalRefillsAuthorized > 0 && (
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                              <div
                                className={`h-full rounded-full ${
                                  med.refillsRemaining === 0
                                    ? "bg-rose-400"
                                    : med.refillsRemaining === 1
                                    ? "bg-amber-400"
                                    : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${(med.refillsRemaining / med.totalRefillsAuthorized) * 100}%`,
                                }}
                              />
                            </div>
                          )}

                          {med.lastDispensedDate && (
                            <div className="text-[10px] text-slate-400">
                              Last fill: {med.lastDispensedDate}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Prescribed Date */}
                      <td className="py-3 px-4 font-mono text-slate-700">
                        <div>{med.prescribedDate}</div>
                        <div className="text-[10px] text-slate-400 font-sans truncate max-w-[120px]" title={med.prescribedBy}>
                          {med.prescribedBy.split("(")[0]}
                        </div>
                      </td>

                      {/* Expiration Date Column */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-semibold text-slate-800">{med.expirationDate}</div>
                        {isExpired ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                            <span>Expired ({Math.abs(diffDays)}d ago)</span>
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            <span>Expiring in {diffDays}d</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Valid ({diffDays}d)</span>
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            med.status === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : med.status === "COMPLETED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : med.status === "DISPENSED"
                              ? "bg-slate-100 text-slate-700 border-slate-200"
                              : med.status === "EXPIRED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {med.status}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Inspect Details */}
                          <button
                            id={`btn-inspect-med-${med.id}`}
                            onClick={() => setInspectingMed(med)}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-200"
                            title="Inspect full medication dossier & dispensation log"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Download PDF */}
                          <button
                            id={`btn-download-rx-${med.id}`}
                            onClick={() => handleDownloadHistoricalPDF(med)}
                            disabled={downloadingId === med.id}
                            className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-transparent hover:border-teal-200 disabled:opacity-50"
                            title="Download cryptographically verified prescription PDF"
                          >
                            {downloadingId === med.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Re-prescribe / Renew */}
                          <button
                            id={`btn-renew-med-${med.id}`}
                            onClick={() => {
                              if (onSelectForRenewal) {
                                onSelectForRenewal(med);
                              } else {
                                handleAuthorizeRefill(med);
                              }
                            }}
                            className="px-2 py-1 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                            title="Formulate new e-prescription or renew repeat authorization"
                          >
                            <RefreshCw className="w-3 h-3 text-teal-600" />
                            <span>Renew</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Notation */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>
              All historical medication records sealed under South Africa Pharmacy Council (SAPC) and HPCSA regulatory standards.
            </span>
          </div>
          <div>
            Showing <strong className="text-slate-800">{filteredList.length}</strong> of {medicationsList.length} records
          </div>
        </div>
      </div>

      {/* Medication Dossier & Dispensation Modal */}
      {inspectingMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {inspectingMed.medicationName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Rx #{inspectingMed.rxNumber} • {inspectingMed.patientName} (MRN: {inspectingMed.patientMrn})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingMed(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* Status and Expiry Banner */}
              <div className="p-3.5 rounded-xl border flex items-center justify-between bg-slate-50 border-slate-200">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    inspectingMed.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Status: {inspectingMed.status}</div>
                    <div className="text-[11px] text-slate-500">
                      Expiration Date: <strong>{inspectingMed.expirationDate}</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                    {inspectingMed.refillsRemaining} / {inspectingMed.totalRefillsAuthorized} Refills
                  </span>
                </div>
              </div>

              {/* Clinical Profile Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Generic Substance</span>
                  <span className="font-semibold text-slate-800">{inspectingMed.genericName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Brand Name</span>
                  <span className="font-semibold text-slate-800">{inspectingMed.brandName || "Generic Formulation"}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Prescribed Indication</span>
                  <span className="font-semibold text-slate-800">{inspectingMed.indication}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">ICD-10 Code</span>
                  <span className="font-mono font-semibold text-teal-700">{inspectingMed.icd10Code}</span>
                </div>
              </div>

              {/* Instructions & Sig */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Prescribed Sig (Directions for Patient)</label>
                <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium">
                  {inspectingMed.frequency}
                  <div className="text-[11px] text-slate-500 mt-1 italic">
                    Instructions: {inspectingMed.instructions}
                  </div>
                </div>
              </div>

              {/* Dispensation History */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-700">Dispensing & Pharmacy Records</label>
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prescribing Clinician:</span>
                    <strong className="text-slate-800">{inspectingMed.prescribedBy}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prescribed On:</span>
                    <span className="font-mono text-slate-700">{inspectingMed.prescribedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Last Dispensed:</span>
                    <span className="font-mono text-slate-700">{inspectingMed.lastDispensedDate || "Not recorded"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dispensed At:</span>
                    <span className="font-semibold text-teal-800">{inspectingMed.dispensedPharmacy || "Hospital Dispensary"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Days Supply / Units:</span>
                    <span className="text-slate-700">{inspectingMed.daysSupply} days</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Hash */}
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                  ECDSA SHA-256 Prescription Hash
                </span>
                <div className="p-2 bg-slate-900 text-teal-300 font-mono text-[10px] rounded-lg break-all select-all">
                  {inspectingMed.securityHash}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                onClick={() => handleAuthorizeRefill(inspectingMed)}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-teal-600" />
                <span>Authorize +1 Refill</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setInspectingMed(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadHistoricalPDF(inspectingMed)}
                  disabled={downloadingId === inspectingMed.id}
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {downloadingId === inspectingMed.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
