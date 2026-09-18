import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  LineChart,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  Calendar,
  Clock,
  Pill,
  Share2,
  FileText,
  FlaskConical,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Stethoscope,
  TrendingDown,
  User,
  ShieldCheck,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  Printer
} from "lucide-react";
import { Patient, ModuleId, PatientConsultation, PatientPrescriptionRecord, PatientReferralRecord, PatientLabRecord } from "../../types";
import { MOCK_PATIENTS } from "../../data/patients";

export type TimelineCategory = "ALL" | "ENCOUNTER" | "PRESCRIPTION" | "REFERRAL" | "LAB";

export interface TimelineEventItem {
  id: string;
  dateStr: string;
  timestamp: number;
  category: "ENCOUNTER" | "PRESCRIPTION" | "REFERRAL" | "LAB";
  title: string;
  subtitle: string;
  status: string;
  statusType: "success" | "warning" | "info" | "neutral";
  trackLane: number; // 25: Encounter, 50: Prescription, 75: Referral, 95: Lab
  trackLaneName: string;
  progressScore: number; // 0-100 completion / adherence / urgency index
  clinicianOrSpecialist?: string;
  facilityOrLab?: string;
  details: string;
  icd10?: string;
  vitals?: {
    bp: string;
    systolic: number;
    diastolic: number;
    hr: number;
  };
  rxData?: {
    dosage: string;
    frequency: string;
    repeats: number;
    rxNumber: string;
  };
  referralData?: {
    urgency: string;
    facility: string;
    specialist: string;
  };
  raw: PatientConsultation | PatientPrescriptionRecord | PatientReferralRecord | PatientLabRecord;
}

interface PatientMedicalTimelineProps {
  patient?: Patient;
  onSelectPatient?: (patient: Patient) => void;
  onNavigateToModule?: (module: ModuleId, patientContext?: Patient) => void;
  className?: string;
  compact?: boolean;
}

function parseDateToTimestamp(dateStr: string): number {
  if (dateStr.startsWith("Today")) {
    return new Date("2026-09-17T14:30:00").getTime();
  }
  if (dateStr.startsWith("Yesterday")) {
    return new Date("2026-09-16T11:15:00").getTime();
  }
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;
  return 0;
}

function parseBP(bpString?: string): { systolic: number; diastolic: number } {
  if (!bpString) return { systolic: 120, diastolic: 80 };
  const parts = bpString.split("/").map((p) => parseInt(p.replace(/\D/g, ""), 10));
  return {
    systolic: parts[0] || 120,
    diastolic: parts[1] || 80,
  };
}

export const PatientMedicalTimeline: React.FC<PatientMedicalTimelineProps> = ({
  patient: initialPatient,
  onSelectPatient,
  onNavigateToModule,
  className = "",
  compact = false,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    initialPatient ? initialPatient.id : MOCK_PATIENTS[0].id
  );
  const [categoryFilter, setCategoryFilter] = useState<TimelineCategory>("ALL");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc"); // 'desc': latest on top, 'asc': chronological (earliest on top)
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"lanes" | "progress">("lanes");
  const [showVitalsCorrelator, setShowVitalsCorrelator] = useState<boolean>(true);

  // Active Patient
  const currentPatient = useMemo(() => {
    if (initialPatient && initialPatient.id === selectedPatientId) {
      return initialPatient;
    }
    return MOCK_PATIENTS.find((p) => p.id === selectedPatientId) || MOCK_PATIENTS[0];
  }, [initialPatient, selectedPatientId]);

  // Aggregate all historical events chronologically
  const allEvents = useMemo<TimelineEventItem[]>(() => {
    const events: TimelineEventItem[] = [];

    // 1. Consultations / Encounters
    currentPatient.recentConsultations.forEach((con) => {
      const bp = parseBP(con.vitals?.bloodPressure);
      events.push({
        id: con.id,
        dateStr: con.date,
        timestamp: parseDateToTimestamp(con.date),
        category: "ENCOUNTER",
        title: con.diagnosis,
        subtitle: `Attending: ${con.clinician} (${con.specialty})`,
        status: "Completed",
        statusType: "success",
        trackLane: 25,
        trackLaneName: "Encounter",
        progressScore: 100,
        clinicianOrSpecialist: con.clinician,
        details: con.clinicalNotes,
        icd10: con.icd10Code,
        vitals: {
          bp: con.vitals?.bloodPressure || "120/80 mmHg",
          systolic: bp.systolic,
          diastolic: bp.diastolic,
          hr: con.vitals?.heartRate || 72,
        },
        raw: con,
      });
    });

    // 2. Prescriptions
    currentPatient.activePrescriptions.forEach((rx) => {
      const isDispensed = rx.status === "DISPENSED";
      const isExpired = rx.status === "EXPIRED";
      events.push({
        id: rx.id,
        dateStr: rx.issuedDate,
        timestamp: parseDateToTimestamp(rx.issuedDate),
        category: "PRESCRIPTION",
        title: rx.medication,
        subtitle: `${rx.dosage} • ${rx.frequency}`,
        status: rx.status,
        statusType: isExpired ? "neutral" : isDispensed ? "info" : "success",
        trackLane: 50,
        trackLaneName: "Prescription",
        progressScore: isExpired ? 30 : isDispensed ? 100 : 85,
        details: `Duration: ${rx.duration}. Repeats Remaining: ${rx.repeatsRemaining}. Security Hash: ${rx.securityHash.slice(0, 14)}...`,
        rxData: {
          dosage: rx.dosage,
          frequency: rx.frequency,
          repeats: rx.repeatsRemaining,
          rxNumber: rx.rxNumber,
        },
        raw: rx,
      });
    });

    // 3. Referrals
    currentPatient.recentReferrals.forEach((ref) => {
      const isPending = ref.status === "Pending";
      const isCompleted = ref.status === "Completed";
      events.push({
        id: ref.id,
        dateStr: ref.referralDate,
        timestamp: parseDateToTimestamp(ref.referralDate),
        category: "REFERRAL",
        title: `${ref.specialty} Referral`,
        subtitle: `${ref.specialistName} • ${ref.facility}`,
        status: `${ref.urgency} (${ref.status})`,
        statusType: isPending ? "warning" : isCompleted ? "success" : "info",
        trackLane: 75,
        trackLaneName: "Referral",
        progressScore: isPending ? 45 : isCompleted ? 100 : 75,
        clinicianOrSpecialist: ref.specialistName,
        facilityOrLab: ref.facility,
        details: ref.clinicalReason,
        referralData: {
          urgency: ref.urgency,
          facility: ref.facility,
          specialist: ref.specialistName,
        },
        raw: ref,
      });
    });

    // 4. Labs / Diagnostics
    currentPatient.recentLabs.forEach((lab) => {
      const isAbnormal = lab.status === "Abnormal";
      events.push({
        id: lab.id,
        dateStr: lab.date,
        timestamp: parseDateToTimestamp(lab.date),
        category: "LAB",
        title: lab.testName,
        subtitle: `${lab.laboratory} • ${lab.status}`,
        status: lab.status,
        statusType: isAbnormal ? "warning" : "success",
        trackLane: 95,
        trackLaneName: "Diagnostic Lab",
        progressScore: isAbnormal ? 90 : 100,
        facilityOrLab: lab.laboratory,
        details: `${lab.keyFinding} ${lab.referenceRange ? `(Ref: ${lab.referenceRange})` : ""}`,
        raw: lab,
      });
    });

    // Sort by timestamp
    return events.sort((a, b) => {
      return sortOrder === "desc" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
    });
  }, [currentPatient, sortOrder]);

  // Filtered dataset
  const filteredEvents = useMemo(() => {
    if (categoryFilter === "ALL") return allEvents;
    return allEvents.filter((ev) => ev.category === categoryFilter);
  }, [allEvents, categoryFilter]);

  // Set default active event if none selected
  React.useEffect(() => {
    if (filteredEvents.length > 0 && !activeEventId) {
      setActiveEventId(filteredEvents[0].id);
    }
  }, [filteredEvents, activeEventId]);

  const activeEvent = useMemo(() => {
    return filteredEvents.find((e) => e.id === activeEventId) || filteredEvents[0] || null;
  }, [filteredEvents, activeEventId]);

  // Longitudinal Vitals Trend Data across consultations
  const vitalsTrendData = useMemo(() => {
    return currentPatient.recentConsultations
      .map((c) => {
        const bp = parseBP(c.vitals?.bloodPressure);
        return {
          date: c.date,
          timestamp: parseDateToTimestamp(c.date),
          systolic: bp.systolic,
          diastolic: bp.diastolic,
          heartRate: c.vitals?.heartRate || 72,
          diagnosis: c.diagnosis,
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp); // Chronological for trend line
  }, [currentPatient]);

  // Recharts vertical chart data
  const chartData = useMemo(() => {
    return filteredEvents.map((ev, index) => ({
      index,
      id: ev.id,
      dateLabel: ev.dateStr,
      displayTitle: ev.title.length > 28 ? ev.title.slice(0, 26) + "…" : ev.title,
      category: ev.category,
      trackValue: viewMode === "lanes" ? ev.trackLane : ev.progressScore,
      progressScore: ev.progressScore,
      status: ev.status,
      eventItem: ev,
    }));
  }, [filteredEvents, viewMode]);

  // Helper colors for events
  const getEventColor = (category: string) => {
    switch (category) {
      case "ENCOUNTER":
        return "#0d9488"; // teal-600
      case "PRESCRIPTION":
        return "#0284c7"; // sky-600
      case "REFERRAL":
        return "#7c3aed"; // violet-600
      case "LAB":
        return "#d97706"; // amber-600
      default:
        return "#64748b"; // slate-500
    }
  };

  const getEventBadge = (category: string) => {
    switch (category) {
      case "ENCOUNTER":
        return {
          label: "Consultation",
          bg: "bg-teal-50 text-teal-700 border-teal-200",
          icon: Stethoscope,
        };
      case "PRESCRIPTION":
        return {
          label: "Prescription",
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          icon: Pill,
        };
      case "REFERRAL":
        return {
          label: "Referral",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Share2,
        };
      case "LAB":
        return {
          label: "Diagnostic Lab",
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          icon: FlaskConical,
        };
      default:
        return {
          label: "Event",
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          icon: Activity,
        };
    }
  };

  return (
    <div
      id="patient-medical-timeline-root"
      className={`bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Clinical Header & Patient Selector */}
      <div className="bg-slate-900 px-5 py-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 font-bold text-base flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Patient Medical Timeline
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                Longitudinal EHR Map
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Recharts Vertical Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Chronological mapping of clinical encounters, prescription regimens, specialist referrals, and lab diagnostics.
            </p>
          </div>
        </div>

        {/* Patient Selection Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label htmlFor="timeline-patient-select" className="text-xs text-slate-300 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Active Patient:</span>
          </label>
          <select
            id="timeline-patient-select"
            value={selectedPatientId}
            onChange={(e) => {
              const newId = e.target.value;
              setSelectedPatientId(newId);
              const found = MOCK_PATIENTS.find((p) => p.id === newId);
              if (found && onSelectPatient) {
                onSelectPatient(found);
              }
            }}
            className="bg-slate-800 text-white border border-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500/40 cursor-pointer font-medium"
          >
            {MOCK_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.mrn}) — {p.chronicConditions[0] || "General"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Demographic Summary Strip */}
      <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-bold text-slate-900 text-sm">{currentPatient.name}</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 text-[11px]">
            {currentPatient.mrn}
          </span>
          <span>•</span>
          <span>{currentPatient.age} yrs • {currentPatient.gender}</span>
          <span>•</span>
          <span>Blood: <strong className="text-slate-900">{currentPatient.bloodType}</strong></span>
          <span>•</span>
          <span className="text-teal-700 font-medium">Scheme: {currentPatient.medicalAid.scheme}</span>
        </div>

        <div className="flex items-center gap-2">
          {currentPatient.allergies.length > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-[11px] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Allergy: {currentPatient.allergies[0].split("(")[0]}</span>
            </span>
          )}
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Audit Synchronized</span>
          </span>
        </div>
      </div>

      {/* Interactive Controls & Filters Bar */}
      <div className="px-5 py-3 border-b border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Track Filter:</span>
          </span>

          <button
            onClick={() => setCategoryFilter("ALL")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              categoryFilter === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <span>All ({allEvents.length})</span>
          </button>

          <button
            onClick={() => setCategoryFilter("ENCOUNTER")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              categoryFilter === "ENCOUNTER"
                ? "bg-teal-700 text-white shadow-xs"
                : "bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100"
            }`}
          >
            <Stethoscope className="w-3 h-3" />
            <span>Encounters ({currentPatient.recentConsultations.length})</span>
          </button>

          <button
            onClick={() => setCategoryFilter("PRESCRIPTION")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              categoryFilter === "PRESCRIPTION"
                ? "bg-sky-700 text-white shadow-xs"
                : "bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100"
            }`}
          >
            <Pill className="w-3 h-3" />
            <span>Rx ({currentPatient.activePrescriptions.length})</span>
          </button>

          <button
            onClick={() => setCategoryFilter("REFERRAL")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              categoryFilter === "REFERRAL"
                ? "bg-purple-700 text-white shadow-xs"
                : "bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100"
            }`}
          >
            <Share2 className="w-3 h-3" />
            <span>Referrals ({currentPatient.recentReferrals.length})</span>
          </button>

          <button
            onClick={() => setCategoryFilter("LAB")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              categoryFilter === "LAB"
                ? "bg-amber-700 text-white shadow-xs"
                : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
            }`}
          >
            <FlaskConical className="w-3 h-3" />
            <span>Diagnostics ({currentPatient.recentLabs.length})</span>
          </button>
        </div>

        {/* View Mode & Chronological Order Toggles */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {/* View Mode */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode("lanes")}
              title="Category Multi-Lane View"
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                viewMode === "lanes"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="w-3 h-3 inline mr-1" />
              Lanes
            </button>
            <button
              onClick={() => setViewMode("progress")}
              title="Care Status & Completion Index"
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all ${
                viewMode === "progress"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Activity className="w-3 h-3 inline mr-1" />
              Status Index
            </button>
          </div>

          {/* Chronological Direction Toggle */}
          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5 border border-slate-200"
            title="Toggle chronological sorting"
          >
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <span>{sortOrder === "desc" ? "Latest First" : "Earliest First"}</span>
          </button>

          {/* Collapsible Vitals Trend Toggle */}
          <button
            onClick={() => setShowVitalsCorrelator((prev) => !prev)}
            className={`px-2.5 py-1 font-semibold rounded-lg transition-colors flex items-center gap-1.5 border ${
              showVitalsCorrelator
                ? "bg-teal-50 text-teal-800 border-teal-300"
                : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
            }`}
            title="Toggle Vitals Correlation Trend Line"
          >
            <Heart className="w-3 h-3 text-teal-600" />
            <span className="hidden lg:inline">Vitals Trend</span>
          </button>
        </div>
      </div>

      {/* Main Timeline Visualization Body: Recharts + Detail Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 flex-1">
        {/* Left / Center (8 cols): Recharts Vertical Timeline */}
        <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/40">
          <div>
            {/* Chart Legend & Track Indicators */}
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Lanes:</span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
                  <span>Encounter (25%)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block" />
                  <span>Rx Regimen (50%)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                  <span>Referral (75%)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                  <span>Labs (95%)</span>
                </span>
              </div>

              <span className="text-[11px] text-slate-400 font-mono">
                Showing {filteredEvents.length} chronological milestones
              </span>
            </div>

            {/* The Recharts Vertical Chart Canvas */}
            <div className="w-full bg-white rounded-xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
              <div style={{ width: "100%", height: Math.max(380, filteredEvents.length * 52) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    layout="vertical"
                    data={chartData}
                    margin={{ top: 15, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
                    
                    {/* Horizontal Axis: Multi-Lane Tracks or Progress % */}
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      ticks={viewMode === "lanes" ? [25, 50, 75, 95] : [0, 25, 50, 75, 100]}
                      tickFormatter={(val) => {
                        if (viewMode === "lanes") {
                          if (val === 25) return "Encounters";
                          if (val === 50) return "Prescriptions";
                          if (val === 75) return "Referrals";
                          if (val === 95) return "Diagnostics";
                          return "";
                        }
                        return `${val}%`;
                      }}
                      tick={{ fill: "#64748b", fontSize: 11, fontWeight: 500 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />

                    {/* Vertical Axis: Chronological Date Milestones */}
                    <YAxis
                      dataKey="dateLabel"
                      type="category"
                      width={100}
                      tick={{ fill: "#334155", fontSize: 11, fontWeight: 600 }}
                      axisLine={{ stroke: "#cbd5e1" }}
                    />

                    {/* Lane Reference Dividers in Lanes Mode */}
                    {viewMode === "lanes" && (
                      <>
                        <ReferenceLine x={25} stroke="#0d9488" strokeOpacity={0.25} strokeDasharray="2 2" />
                        <ReferenceLine x={50} stroke="#0284c7" strokeOpacity={0.25} strokeDasharray="2 2" />
                        <ReferenceLine x={75} stroke="#7c3aed" strokeOpacity={0.25} strokeDasharray="2 2" />
                        <ReferenceLine x={95} stroke="#d97706" strokeOpacity={0.25} strokeDasharray="2 2" />
                      </>
                    )}

                    {/* Interactive Custom Tooltip */}
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload.eventItem as TimelineEventItem;
                          const badge = getEventBadge(data.category);
                          const IconComp = badge.icon;

                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs animate-in fade-in duration-150">
                              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${badge.bg}`}>
                                  <IconComp className="w-3 h-3" />
                                  <span>{badge.label}</span>
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">{data.dateStr}</span>
                              </div>

                              <div className="font-bold text-sm text-white">{data.title}</div>
                              <div className="text-slate-300 text-[11px] mt-0.5">{data.subtitle}</div>

                              <div className="mt-2.5 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                                <p className="line-clamp-2">{data.details}</p>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[10px] text-teal-400 font-medium">
                                <span>Status: {data.status}</span>
                                <span>Click milestone to inspect details →</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* Timeline Event Progress / Track Bars */}
                    <Bar
                      dataKey="trackValue"
                      barSize={14}
                      radius={[0, 6, 6, 0]}
                      onClick={(data: any) => {
                        const item = data?.payload?.eventItem || data?.eventItem;
                        if (item && item.id) {
                          setActiveEventId(item.id);
                        } else if (data?.id) {
                          setActiveEventId(data.id);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {chartData.map((entry) => {
                        const isSelected = activeEventId === entry.id;
                        return (
                          <Cell
                            key={`cell-${entry.id}`}
                            fill={getEventColor(entry.category)}
                            opacity={isSelected ? 1 : 0.75}
                            stroke={isSelected ? "#0f172a" : "none"}
                            strokeWidth={isSelected ? 2 : 0}
                          />
                        );
                      })}
                    </Bar>

                    {/* Connecting Trajectory / Milestone Line */}
                    <Line
                      type="monotone"
                      dataKey="trackValue"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={(dotProps) => {
                        const { cx, cy, payload } = dotProps;
                        if (cx === undefined || cy === undefined) return <circle key={`empty-${dotProps.index}`} />;
                        const isSelected = activeEventId === payload.id;
                        const color = getEventColor(payload.category);

                        return (
                          <g
                            key={`dot-${payload.id}`}
                            onClick={() => setActiveEventId(payload.id)}
                            style={{ cursor: "pointer" }}
                          >
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isSelected ? 8 : 5}
                              fill={color}
                              stroke="#ffffff"
                              strokeWidth={isSelected ? 3 : 2}
                              className="transition-all duration-200"
                            />
                            {isSelected && (
                              <circle
                                cx={cx}
                                cy={cy}
                                r={12}
                                fill="none"
                                stroke={color}
                                strokeWidth={1.5}
                                strokeDasharray="2 2"
                              />
                            )}
                          </g>
                        );
                      }}
                      activeDot={{ r: 9, stroke: "#ffffff", strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Secondary Co-Plot: Longitudinal Vitals Correlator across Timeline */}
          {showVitalsCorrelator && vitalsTrendData.length > 1 && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <h4 className="text-xs font-bold text-slate-800">
                    Correlated Hemodynamic Trajectory (Blood Pressure & Heart Rate)
                  </h4>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>Systolic BP</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-600" />
                    <span>Diastolic BP</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Heart Rate (bpm)</span>
                  </span>
                </div>
              </div>

              <div className="w-full h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={vitalsTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} />
                    <YAxis domain={[50, 170]} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-2 rounded-lg text-xs shadow-md border border-slate-800">
                              <span className="font-bold text-teal-400 block">{label}</span>
                              <div className="mt-1 space-y-0.5 text-[11px]">
                                <div>BP: <strong className="text-white">{payload[0]?.value}/{payload[1]?.value} mmHg</strong></div>
                                <div>HR: <strong className="text-white">{payload[2]?.value} bpm</strong></div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} name="Systolic BP" />
                    <Line type="monotone" dataKey="diastolic" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} name="Diastolic BP" />
                    <Line type="monotone" dataKey="heartRate" stroke="#6366f1" strokeWidth={1.5} strokeDasharray="3 3" dot={{ r: 2 }} name="Heart Rate" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 border-t border-slate-200/60 pt-1.5">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Clinical response: Systolic reduced from {vitalsTrendData[0].systolic} mmHg to {vitalsTrendData[vitalsTrendData.length - 1].systolic} mmHg under Amlodipine regimen.</span>
                </span>
                <span className="text-slate-400">Target: &lt; 130/80 mmHg</span>
              </div>
            </div>
          )}
        </div>

        {/* Right (4 cols): Dedicated Event Dossier & Fast Actions */}
        <div className="lg:col-span-4 p-5 bg-white flex flex-col justify-between space-y-5">
          {activeEvent ? (
            <div className="space-y-4">
              {/* Event Header Card */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  {(() => {
                    const badge = getEventBadge(activeEvent.category);
                    const IconComp = badge.icon;
                    return (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${badge.bg}`}>
                        <IconComp className="w-3.5 h-3.5" />
                        <span>{badge.label}</span>
                      </span>
                    );
                  })()}

                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {activeEvent.dateStr}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeEvent.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeEvent.subtitle}
                </p>
              </div>

              {/* Status Ribbon */}
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Milestone Status:</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {activeEvent.status}
                </span>
              </div>

              {/* Specific Metadata Fields depending on category */}
              {activeEvent.category === "ENCOUNTER" && (
                <div className="space-y-3 text-xs">
                  {activeEvent.icd10 && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50/60 border border-teal-100">
                      <span className="text-teal-800 font-medium">ICD-10 Diagnostic Code:</span>
                      <span className="font-mono font-bold text-teal-900">{activeEvent.icd10}</span>
                    </div>
                  )}

                  {activeEvent.vitals && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Encounter Triage Vitals
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] block">Blood Pressure</span>
                          <span className="font-bold text-slate-800">{activeEvent.vitals.bp}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] block">Heart Rate</span>
                          <span className="font-bold text-slate-800">{activeEvent.vitals.hr} bpm</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Objective Clinical SOAP Notes
                    </span>
                    <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-xs max-h-48 overflow-y-auto">
                      {activeEvent.details}
                    </p>
                  </div>
                </div>
              )}

              {activeEvent.category === "PRESCRIPTION" && (
                <div className="space-y-3 text-xs">
                  {activeEvent.rxData && (
                    <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-200/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono font-semibold text-sky-800">
                          {activeEvent.rxData.rxNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-200 text-sky-900">
                          {activeEvent.rxData.repeats} Repeats Remaining
                        </span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500 block text-[10px]">Dosage & Regimen</span>
                        <span className="font-bold text-slate-800">{activeEvent.rxData.dosage} — {activeEvent.rxData.frequency}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Dispensing & Formulary Validation
                    </span>
                    <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-xs">
                      {activeEvent.details}
                    </p>
                  </div>
                </div>
              )}

              {activeEvent.category === "REFERRAL" && (
                <div className="space-y-3 text-xs">
                  {activeEvent.referralData && (
                    <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1.5">
                      <span className="text-[10px] text-purple-800 font-bold uppercase block">
                        Inter-Doctor Network Transfer
                      </span>
                      <div className="font-bold text-slate-900">{activeEvent.referralData.specialist}</div>
                      <div className="text-slate-600 text-xs">{activeEvent.referralData.facility}</div>
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                      Clinical Indication & Referral Notes
                    </span>
                    <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed text-xs">
                      {activeEvent.details}
                    </p>
                  </div>
                </div>
              )}

              {activeEvent.category === "LAB" && (
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                    <span className="text-[10px] text-amber-800 font-bold uppercase block">
                      Laboratory Key Finding
                    </span>
                    <div className="font-mono font-bold text-slate-900">{activeEvent.details}</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              <Info className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>Select any milestone on the timeline to inspect clinical records.</span>
            </div>
          )}

          {/* Action Ribbon in Dossier */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Patient Longitudinal Actions
            </span>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigateToModule?.("prescriptions", currentPatient)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Pill className="w-3.5 h-3.5 text-teal-600" />
                <span>Renew RX</span>
              </button>

              <button
                onClick={() => onNavigateToModule?.("referrals", currentPatient)}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5 text-purple-600" />
                <span>New Referral</span>
              </button>
            </div>

            <button
              onClick={() => onNavigateToModule?.("patients", currentPatient)}
              className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Full Health Vault Dossier</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Care Summary */}
      <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Longitudinal Care Continuity mapped via Recharts vertical Cartesian engine. All entries cryptographically hashed.</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
