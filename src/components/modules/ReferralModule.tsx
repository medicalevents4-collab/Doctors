import React, { useState } from "react";
import { 
  Share2, 
  Plus, 
  Search, 
  Clock, 
  CheckCircle2, 
  FileText, 
  Lock, 
  ArrowRight, 
  UserCheck, 
  Building2, 
  AlertCircle,
  FileCheck,
  X,
  Sparkles,
  HeartPulse,
  Brain,
  Activity,
  Flame,
  AlertTriangle,
  Check,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Columns3,
  List
} from "lucide-react";
import { ReferralSummary, DiagnosticAttachment, TriageResult } from "../../types";
import { TriageAssistantModal } from "../referral/TriageAssistantModal";
import { ReferralKanbanBoard } from "../referral/ReferralKanbanBoard";
import { DIAGNOSTIC_CASE_PRESETS } from "../../data/diagnosticPresets";

export const ReferralModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "kanban" | "triage" | "directory">("incoming");
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectedReferral, setSelectedReferral] = useState<ReferralSummary | null>(null);
  const [isCreatingReferral, setIsCreatingReferral] = useState(false);

  // Triage Assistant Modal State
  const [isTriageModalOpen, setIsTriageModalOpen] = useState(false);
  const [triageModalPatient, setTriageModalPatient] = useState("Robert Taylor");
  const [triageModalAttachments, setTriageModalAttachments] = useState<DiagnosticAttachment[] | undefined>(undefined);
  const [triageModalHistory, setTriageModalHistory] = useState<string | undefined>(undefined);

  // Modal Package Triage Audit State
  const [packageTriageLoading, setPackageTriageLoading] = useState(false);
  const [packageTriageResult, setPackageTriageResult] = useState<TriageResult | null>(null);

  // Create Referral Form State
  const [createPatientName, setCreatePatientName] = useState("Robert Taylor (56y)");
  const [createSpecialist, setCreateSpecialist] = useState("Dr. Marcus Vance (Cardiology)");
  const [createSpecialty, setCreateSpecialty] = useState("Cardiology");
  const [createUrgency, setCreateUrgency] = useState<"Routine" | "Urgent" | "Emergency">("Urgent");
  const [createSummary, setCreateSummary] = useState(
    "Patient presenting with accelerating exertional retrosternal angina and non-specific ST depressions. Diagnostic 12-lead ECG and Troponin panel attached."
  );
  const [createAttachments, setCreateAttachments] = useState<DiagnosticAttachment[]>(
    DIAGNOSTIC_CASE_PRESETS[0].attachments
  );
  const [inlineTriageLoading, setInlineTriageLoading] = useState(false);
  const [inlineTriageResult, setInlineTriageResult] = useState<TriageResult | null>(null);

  const [referralsList, setReferralsList] = useState<ReferralSummary[]>([
    {
      id: "ref-1",
      patientName: "Robert Taylor",
      referringDoctor: "Dr. Sarah Chen (General Practice)",
      specialistName: "Dr. Marcus Vance (Cardiology)",
      specialty: "Cardiology",
      urgency: "Urgent",
      status: "Pending",
      clinicalSummary: "56yo male with recurrent exertional angina and family history of premature CAD. Resting ECG shows non-specific ST depressions in V4-V6 and troponin dynamic rise.",
      attachmentCount: 3,
      createdAt: "Today, 09:15",
      attachments: DIAGNOSTIC_CASE_PRESETS[0].attachments,
    },
    {
      id: "ref-4",
      patientName: "David K. Ndlovu",
      referringDoctor: "Dr. Sarah Chen (Internal Medicine)",
      specialistName: "Dr. Thabo Mokoena (Nephrology)",
      specialty: "Nephrology",
      urgency: "Urgent",
      status: "Pending",
      clinicalSummary: "Rapidly worsening peripheral edema, serum creatinine doubled to 3.65 mg/dL, eGFR drop to 17. Nephrotic-range proteinuria evaluation requested.",
      attachmentCount: 3,
      createdAt: "Today, 11:45",
      attachments: DIAGNOSTIC_CASE_PRESETS[3].attachments,
    },
    {
      id: "ref-2",
      patientName: "Miriam Al-Mansoor",
      referringDoctor: "Dr. Thabo Mokoena (Internal Medicine)",
      specialistName: "Dr. Marcus Vance (Cardiology)",
      specialty: "Cardiology",
      urgency: "Routine",
      status: "Accepted",
      clinicalSummary: "Evaluation for pre-operative cardiac clearance prior to elective orthopedic arthroplasty. Baseline ECG and metabolic profile within normal limits.",
      attachmentCount: 2,
      createdAt: "Yesterday, 16:40",
      attachments: DIAGNOSTIC_CASE_PRESETS[5].attachments,
    },
    {
      id: "ref-3",
      patientName: "Lucas Graham",
      referringDoctor: "Dr. Marcus Vance (Cardiology)",
      specialistName: "Dr. Priya Patel (Cardiothoracic Surgery)",
      specialty: "Cardiothoracic Surgery",
      urgency: "Emergency",
      status: "Consulted",
      clinicalSummary: "Severe symptomatic aortic stenosis with peak gradient of 68 mmHg and syncopal episodes. Transcatheter aortic valve implantation (TAVI) evaluation requested.",
      attachmentCount: 3,
      createdAt: "14 Sep 2026",
      attachments: DIAGNOSTIC_CASE_PRESETS[2].attachments,
    },
    {
      id: "ref-5",
      patientName: "Elena Rostova",
      referringDoctor: "Dr. Sarah Chen (Emergency)",
      specialistName: "Dr. Alan Mercer (Neurology)",
      specialty: "Neurology & Stroke Unit",
      urgency: "Emergency",
      status: "Consulted",
      clinicalSummary: "Acute ischemic stroke with left MCA M1 cutoff. Mechanical thrombectomy evaluation performed; currently in neuro-intensive monitoring.",
      attachmentCount: 3,
      createdAt: "13 Sep 2026",
      attachments: DIAGNOSTIC_CASE_PRESETS[1].attachments,
    },
    {
      id: "ref-6",
      patientName: "James Miller",
      referringDoctor: "Dr. Sarah Chen (Cardiology & Internal Medicine)",
      specialistName: "Dr. Marcus Vance (Cardiology)",
      specialty: "Cardiology",
      urgency: "Routine",
      status: "Completed",
      clinicalSummary: "Exercise stress test completed with mild horizontal ST depression. Commenced anti-anginal medical therapy; discharge and return report sent to primary GP.",
      attachmentCount: 2,
      createdAt: "10 Sep 2026",
      attachments: DIAGNOSTIC_CASE_PRESETS[5].attachments,
    },
  ]);

  const specialistsDirectory = [
    {
      name: "Dr. Marcus Vance",
      specialty: "Cardiology & Interventional",
      hospital: "Metro Medical Center — West Wing",
      location: "Cape Town / Online",
      nextAvailable: "Tomorrow, 10:00 AM",
      rating: "4.9 (124 reviews)",
    },
    {
      name: "Dr. Priya Patel",
      specialty: "Cardiothoracic Surgery",
      hospital: "St. Jude Specialist Hospital",
      location: "Johannesburg",
      nextAvailable: "Friday, 14:00 PM",
      rating: "5.0 (88 reviews)",
    },
    {
      name: "Dr. Alan Mercer",
      specialty: "Neurology & Stroke Medicine",
      hospital: "Kingsbury Clinic Suite 402",
      location: "Cape Town",
      nextAvailable: "Monday, 09:30 AM",
      rating: "4.8 (95 reviews)",
    },
    {
      name: "Dr. Thabo Mokoena",
      specialty: "Nephrology & Internal Medicine",
      hospital: "Netcare Christiaan Barnard",
      location: "Cape Town",
      nextAvailable: "Wednesday, 11:30 AM",
      rating: "4.9 (110 reviews)",
    },
    {
      name: "Dr. Elena Vasquez",
      specialty: "Surgical Oncology & Dermatosurgery",
      hospital: "Life Vincent Pallotti Hospital",
      location: "Cape Town",
      nextAvailable: "Thursday, 09:00 AM",
      rating: "4.9 (76 reviews)",
    },
  ];

  // Drag-and-drop or status change handler
  const handleStatusChange = (referralId: string, newStatus: ReferralSummary["status"]) => {
    setReferralsList((prev) =>
      prev.map((ref) => (ref.id === referralId ? { ...ref, status: newStatus } : ref))
    );
  };

  // Run Quick Inline Triage inside Create Referral
  const handleRunInlineTriage = async () => {
    setInlineTriageLoading(true);
    try {
      const response = await fetch("/api/referral/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: createPatientName,
          clinicalHistory: "Referral intake",
          symptoms: createSummary,
          attachedDiagnostics: createAttachments,
        }),
      });
      if (response.ok) {
        const result: TriageResult = await response.json();
        setInlineTriageResult(result);
      }
    } catch (err) {
      console.error("Inline triage error:", err);
    } finally {
      setInlineTriageLoading(false);
    }
  };

  const handleApplyInlineTriage = () => {
    if (!inlineTriageResult) return;
    setCreateUrgency(inlineTriageResult.suggestedUrgency);
    setCreateSpecialty(inlineTriageResult.suggestedSpecialty);

    const matched = specialistsDirectory.find((s) =>
      s.specialty.toLowerCase().includes(inlineTriageResult.suggestedSpecialty.toLowerCase().split(" ")[0])
    );
    if (matched) {
      setCreateSpecialist(`${matched.name} (${matched.specialty.split("&")[0].trim()})`);
    }

    setCreateSummary(
      `${createSummary}\n\n[AI Triage Assessment (${inlineTriageResult.triageCategoryCode})]: Urgency: ${inlineTriageResult.suggestedUrgency}. Suggested Specialty: ${inlineTriageResult.suggestedSpecialty}. Rationale: ${inlineTriageResult.urgencyRationale}`
    );
  };

  // Run Triage Audit on Encrypted Referral Detail Modal
  const handleAuditPackage = async (ref: ReferralSummary) => {
    setPackageTriageLoading(true);
    try {
      const response = await fetch("/api/referral/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName: ref.patientName,
          clinicalHistory: `Referred by ${ref.referringDoctor}`,
          symptoms: ref.clinicalSummary,
          attachedDiagnostics: ref.attachments || DIAGNOSTIC_CASE_PRESETS[0].attachments,
        }),
      });
      if (response.ok) {
        const result: TriageResult = await response.json();
        setPackageTriageResult(result);
      }
    } catch (err) {
      console.error("Package audit error:", err);
    } finally {
      setPackageTriageLoading(false);
    }
  };

  // Open Triage Assistant for a specific referral
  const handleOpenTriageForReferral = (ref: ReferralSummary) => {
    setTriageModalPatient(ref.patientName);
    setTriageModalAttachments(ref.attachments || DIAGNOSTIC_CASE_PRESETS[0].attachments);
    setTriageModalHistory(ref.clinicalSummary);
    setIsTriageModalOpen(true);
  };

  // Apply recommendation from full modal
  const handleApplyFromModal = (rec: {
    specialty: string;
    urgency: "Emergency" | "Urgent" | "Routine";
    summary: string;
    targetSpecialistName?: string;
    patientName?: string;
    attachments?: DiagnosticAttachment[];
    triageResult?: TriageResult;
  }) => {
    if (rec.patientName) setCreatePatientName(rec.patientName);
    setCreateSpecialty(rec.specialty);
    setCreateUrgency(rec.urgency);
    if (rec.targetSpecialistName) setCreateSpecialist(rec.targetSpecialistName);
    setCreateSummary(rec.summary);
    if (rec.attachments) setCreateAttachments(rec.attachments);
    setIsCreatingReferral(true);
  };

  // Create & Dispatch referral
  const handleDispatchReferral = () => {
    const newRef: ReferralSummary = {
      id: `ref-${Date.now()}`,
      patientName: createPatientName.replace(/\s*\(.*\)/, ""),
      referringDoctor: "Dr. Sarah Chen (Cardiology & Internal Medicine)",
      specialistName: createSpecialist,
      specialty: createSpecialty,
      urgency: createUrgency,
      status: "Pending",
      clinicalSummary: createSummary,
      attachmentCount: createAttachments.length,
      createdAt: "Just now",
      attachments: createAttachments,
      triageResult: inlineTriageResult || undefined,
    };

    setReferralsList([newRef, ...referralsList]);
    setIsCreatingReferral(false);
    setInlineTriageResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-700">
              <Share2 className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Inter-Doctor Referral Network</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              FHIR R4 Protocol
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>AI Triage Enabled</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Secure cross-doctor referrals with end-to-end encrypted medical histories, interactive drag-and-drop Kanban tracking, and Gemini-powered clinical triage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* AI Triage Assistant Trigger Button */}
          <button
            id="btn-open-triage-assistant"
            onClick={() => {
              setTriageModalPatient("Robert Taylor");
              setTriageModalAttachments(DIAGNOSTIC_CASE_PRESETS[0].attachments);
              setTriageModalHistory("56yo male with recurrent exertional angina and family history of CAD.");
              setIsTriageModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors shadow-2xs"
            title="Launch AI Triage Assistant to analyze diagnostics"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Triage Assistant</span>
          </button>

          <button
            id="btn-create-specialist-referral"
            onClick={() => setIsCreatingReferral(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Specialist Referral</span>
          </button>
        </div>
      </div>

      {/* Tabs & View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium w-fit">
          <button
            onClick={() => {
              setActiveTab("incoming");
              setViewMode("list");
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "incoming" && viewMode === "list"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Incoming Referrals ({referralsList.filter((r) => r.status !== "Completed").length})
          </button>

          <button
            onClick={() => {
              setActiveTab("outgoing");
              setViewMode("list");
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "outgoing" && viewMode === "list"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Outgoing Referrals (1)
          </button>

          {/* Dedicated Kanban Board Tab */}
          <button
            id="tab-kanban-board"
            onClick={() => {
              setActiveTab("kanban");
              setViewMode("kanban");
            }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "kanban" || viewMode === "kanban"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-blue-700 hover:text-blue-900 bg-blue-50/70"
            }`}
          >
            <Columns3 className="w-3.5 h-3.5" />
            <span>Kanban Pipeline ({referralsList.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("triage");
              setViewMode("list");
            }}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "triage"
                ? "bg-indigo-600 text-white shadow-xs font-semibold"
                : "text-indigo-700 hover:text-indigo-900 bg-indigo-50/70"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Triage Workbench</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("directory");
              setViewMode("list");
            }}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "directory" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Specialist Directory ({specialistsDirectory.length})
          </button>
        </div>

        {/* View Toggle (List vs Kanban) & Search */}
        <div className="flex items-center gap-2">
          {activeTab !== "triage" && activeTab !== "directory" && (
            <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
              <button
                id="btn-view-list"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list" ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table / List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                id="btn-view-kanban"
                onClick={() => setViewMode("kanban")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "kanban" ? "bg-white text-blue-600 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"
                }`}
                title="Kanban Board View"
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search doctor, specialty, patient..."
              className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Main Tab / Mode Content */}
      {viewMode === "kanban" || activeTab === "kanban" ? (
        /* Interactive Drag-and-Drop Kanban Board */
        <div className="animate-in fade-in duration-150">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Columns3 className="w-4 h-4 text-blue-600" />
                <span>Referral Lifecycle Pipeline</span>
              </span>
              <span className="text-[11px] text-slate-400">
                • Drag cards between stages or click next stage to advance status
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Total Referrals Tracked: {referralsList.length}
            </span>
          </div>

          <ReferralKanbanBoard
            referrals={referralsList}
            onStatusChange={handleStatusChange}
            onSelectReferral={(ref) => {
              setSelectedReferral(ref);
              setPackageTriageResult(null);
            }}
            onOpenTriage={handleOpenTriageForReferral}
            onCreateNewReferral={() => setIsCreatingReferral(true)}
          />
        </div>
      ) : activeTab === "triage" ? (
        /* Dedicated Embedded AI Triage Workbench Tab */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">AI Diagnostic Triage Workbench</h3>
                  <p className="text-xs text-slate-500">
                    Test how the AI assistant analyzes 12-lead ECGs, high-sensitivity cardiac biomarkers, and neuroimaging to assign Emergency Severity Index (ESI) levels and receiving specialties.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setTriageModalPatient("Robert Taylor");
                setTriageModalAttachments(DIAGNOSTIC_CASE_PRESETS[0].attachments);
                setIsTriageModalOpen(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Launch Full Triage Modal</span>
            </button>
          </div>

          {/* Benchmark Scenarios Showcase */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Standard Clinical Benchmark Scenarios
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DIAGNOSTIC_CASE_PRESETS.slice(0, 3).map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          preset.expectedUrgency === "Emergency"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : preset.expectedUrgency === "Urgent"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-100 text-slate-700 border-slate-200"
                        }`}
                      >
                        {preset.expectedUrgency}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {preset.attachments.length} Attached Files
                      </span>
                    </div>
                    <h5 className="font-bold text-sm text-slate-900">{preset.title}</h5>
                    <p className="text-xs text-slate-600 line-clamp-2">{preset.symptoms}</p>
                    <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                      <span className="block text-slate-400 text-[10px]">Target Specialty:</span>
                      <strong className="text-indigo-900 font-semibold">{preset.expectedSpecialty}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTriageModalPatient(preset.patientName);
                      setTriageModalAttachments(preset.attachments);
                      setTriageModalHistory(preset.clinicalHistory);
                      setIsTriageModalOpen(true);
                    }}
                    className="mt-4 w-full py-2 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Run AI Triage on this Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab !== "directory" ? (
        /* Referral List View */
        <div className="grid grid-cols-1 gap-4">
          {referralsList.map((ref) => (
            <div
              key={ref.id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 transition-all shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-slate-900">{ref.patientName}</span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      ref.urgency === "Emergency"
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : ref.urgency === "Urgent"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {ref.urgency}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{ref.createdAt}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      ref.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : ref.status === "Consulted"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : ref.status === "Accepted"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    Stage: {ref.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Referring Clinician</span>
                  <span className="font-semibold text-slate-800">{ref.referringDoctor}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Consulting Specialist</span>
                  <span className="font-semibold text-slate-800">{ref.specialistName}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                <strong className="text-slate-700 font-medium">Clinical Summary: </strong>
                {ref.clinicalSummary}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>{ref.attachmentCount} Encrypted Diagnostic Attachments (ECG, Labs)</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* AI Triage Audit Button on Each Referral */}
                  <button
                    id={`btn-triage-audit-${ref.id}`}
                    onClick={() => handleOpenTriageForReferral(ref)}
                    className="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    title="Audit referral urgency and target specialty with AI Triage"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Triage Audit</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedReferral(ref);
                      setPackageTriageResult(null);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    View Clinical Records
                  </button>
                  {ref.status === "Pending" && (
                    <button
                      onClick={() => handleStatusChange(ref.id, "Accepted")}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Accept & Invite Patient</span>
                    </button>
                  )}
                  {ref.status === "Accepted" && (
                    <button
                      onClick={() => handleStatusChange(ref.id, "Consulted")}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Consulted</span>
                    </button>
                  )}
                  {ref.status === "Consulted" && (
                    <button
                      onClick={() => handleStatusChange(ref.id, "Completed")}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Dispatch Return Report</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Specialist Directory View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {specialistsDirectory.map((spec, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="p-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                    {spec.name.replace("Dr. ", "").substring(0, 2)}
                  </span>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                    Verified
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-2">{spec.name}</h3>
                <p className="text-xs text-blue-600 font-medium">{spec.specialty}</p>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{spec.hospital}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Next Slot: {spec.nextAvailable}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">{spec.rating}</span>
                <button
                  onClick={() => {
                    setCreateSpecialist(`${spec.name} (${spec.specialty.split("&")[0].trim()})`);
                    setCreateSpecialty(spec.specialty.split("&")[0].trim());
                    setIsCreatingReferral(true);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Refer Patient
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Referral Detail Modal with Integrated AI Triage Inspection */}
      {selectedReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Encrypted Referral Package</h3>
              </div>
              <button
                onClick={() => setSelectedReferral(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">{selectedReferral.patientName}</span>
                  <span className="text-[11px] text-blue-700">Urgency: {selectedReferral.urgency} • Referred by {selectedReferral.referringDoctor}</span>
                </div>
                <button
                  onClick={() => handleAuditPackage(selectedReferral)}
                  disabled={packageTriageLoading}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors shrink-0 disabled:opacity-50"
                >
                  {packageTriageLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  )}
                  <span>{packageTriageLoading ? "Auditing..." : "AI Triage Audit"}</span>
                </button>
              </div>

              {/* Stage Progress Tracker inside Modal */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Referral Lifecycle Stage
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["Pending", "Accepted", "Consulted", "Completed"] as const).map((st) => {
                    const isCurrent = selectedReferral.status === st;
                    return (
                      <button
                        key={st}
                        onClick={() => {
                          handleStatusChange(selectedReferral.id, st);
                          setSelectedReferral({ ...selectedReferral, status: st });
                        }}
                        className={`p-2 rounded-lg text-center font-bold text-[11px] transition-all border ${
                          isCurrent
                            ? st === "Completed"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : st === "Consulted"
                              ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                              : st === "Accepted"
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-amber-600 text-white border-amber-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Triage Audit Result Box if evaluated */}
              {packageTriageResult && (
                <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>AI Triage Analysis Result ({packageTriageResult.triageCategoryCode})</span>
                    </span>
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-white border border-indigo-200 text-indigo-900">
                      {packageTriageResult.confidenceScore}% Confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500 block">AI Recommended Urgency:</span>
                      <strong className={`font-bold ${packageTriageResult.suggestedUrgency === "Emergency" ? "text-rose-700" : "text-amber-700"}`}>
                        {packageTriageResult.suggestedUrgency}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">AI Recommended Specialty:</span>
                      <strong className="text-indigo-900 font-bold">{packageTriageResult.suggestedSpecialty}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-700 bg-white p-2 rounded border border-indigo-100 leading-relaxed">
                    {packageTriageResult.urgencyRationale}
                  </p>
                </div>
              )}

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Clinical Evaluation & Summary</span>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-700">
                  {selectedReferral.clinicalSummary}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-1">Decrypted Diagnostic Attachments</span>
                <div className="space-y-2">
                  {(selectedReferral.attachments || DIAGNOSTIC_CASE_PRESETS[0].attachments).map((att) => (
                    <div key={att.id} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-800">{att.name}</p>
                          <p className="text-[10px] text-slate-400">{att.type} • {att.fileSize || "1.4 MB"} • {att.findings.slice(0, 45)}...</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Opening diagnostic attachment ${att.name} via decrypted KMS tunnel.`)}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold shrink-0"
                      >
                        View Findings
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedReferral(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
              >
                Close Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Referral Modal with Integrated AI Triage Assistant */}
      {isCreatingReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Initiate Specialist Referral</h3>
              </div>
              <button onClick={() => setIsCreatingReferral(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient</label>
                <select
                  value={createPatientName}
                  onChange={(e) => {
                    setCreatePatientName(e.target.value);
                    if (e.target.value.includes("Robert")) {
                      setCreateAttachments(DIAGNOSTIC_CASE_PRESETS[0].attachments);
                      setCreateSummary("Crushing retrosternal chest pressure radiating to left jaw, diaphoresis, onset 45 min ago.");
                    } else if (e.target.value.includes("Elena")) {
                      setCreateAttachments(DIAGNOSTIC_CASE_PRESETS[1].attachments);
                      setCreateSummary("Sudden onset right-sided hemiplegia and global aphasia 75 min ago.");
                    } else if (e.target.value.includes("Lucas")) {
                      setCreateAttachments(DIAGNOSTIC_CASE_PRESETS[2].attachments);
                      setCreateSummary("Severe symptomatic aortic stenosis with peak gradient of 68 mmHg and exertional syncope.");
                    }
                    setInlineTriageResult(null);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="Robert Taylor (56y)">Robert Taylor (56y, Male) — Acute Cardiac Presentation</option>
                  <option value="Elena Rostova (62y)">Elena Rostova (62y, Female) — Acute Neurological Deficit</option>
                  <option value="Lucas Graham (73y)">Lucas Graham (73y, Male) — Severe Aortic Stenosis</option>
                  <option value="David K. Ndlovu (64y)">David K. Ndlovu (64y, Male) — Rapid Renal Decline</option>
                  <option value="Miriam Al-Mansoor (44y)">Miriam Al-Mansoor (44y, Female) — Suspicious Lesion</option>
                  <option value="James Miller (52y)">James Miller (52y, Male) — Chronic Stable Angina</option>
                </select>
              </div>

              {/* AI Triage Assistant Diagnostic Box inside Form */}
              <div className="p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-950 text-xs">AI Triage Assistant for Attached Diagnostics</span>
                  </div>
                  <button
                    onClick={() => {
                      setTriageModalPatient(createPatientName);
                      setTriageModalAttachments(createAttachments);
                      setTriageModalHistory(createSummary);
                      setIsTriageModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Open Full Assistant
                  </button>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-700 block">Attached Diagnostic Files ({createAttachments.length}):</span>
                  <div className="flex flex-wrap gap-1.5">
                    {createAttachments.map((att) => (
                      <span
                        key={att.id}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 ${
                          att.isAbnormal
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : "bg-white text-slate-700 border border-slate-200"
                        }`}
                      >
                        <span>{att.name}</span>
                        {att.isAbnormal && <span className="text-[8px] font-bold text-rose-600">• ABNORMAL</span>}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between gap-2">
                  <button
                    id="btn-inline-triage-run"
                    type="button"
                    onClick={handleRunInlineTriage}
                    disabled={inlineTriageLoading}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
                  >
                    {inlineTriageLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>{inlineTriageLoading ? "Stratifying Diagnostic Risk..." : "Analyze Diagnostics with AI Triage"}</span>
                  </button>
                  <span className="text-[10px] text-slate-400 font-mono">Gemini 3.8 Flash Protocol</span>
                </div>

                {/* Inline Recommendation Preview */}
                {inlineTriageResult && (
                  <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            inlineTriageResult.suggestedUrgency === "Emergency"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : inlineTriageResult.suggestedUrgency === "Urgent"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          Suggested: {inlineTriageResult.suggestedUrgency}
                        </span>
                        <span className="font-bold text-slate-900 text-xs">
                          {inlineTriageResult.suggestedSpecialty}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyInlineTriage}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply to Fields</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {inlineTriageResult.urgencyRationale}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Specialist</label>
                  <select
                    value={createSpecialist}
                    onChange={(e) => setCreateSpecialist(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    <option value="Dr. Marcus Vance (Cardiology)">Dr. Marcus Vance (Cardiology & Interventional)</option>
                    <option value="Dr. Priya Patel (Cardiothoracic)">Dr. Priya Patel (Cardiothoracic Surgery)</option>
                    <option value="Dr. Alan Mercer (Neurology)">Dr. Alan Mercer (Neurology & Stroke Unit)</option>
                    <option value="Dr. Thabo Mokoena (Nephrology)">Dr. Thabo Mokoena (Nephrology & Renal)</option>
                    <option value="Dr. Elena Vasquez (Surgical Oncology)">Dr. Elena Vasquez (Surgical Oncology)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Urgency</label>
                  <select
                    value={createUrgency}
                    onChange={(e) => setCreateUrgency(e.target.value as "Routine" | "Urgent" | "Emergency")}
                    className={`w-full p-2.5 border rounded-lg font-bold ${
                      createUrgency === "Emergency"
                        ? "bg-rose-50 border-rose-300 text-rose-800"
                        : createUrgency === "Urgent"
                        ? "bg-amber-50 border-amber-300 text-amber-800"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    <option value="Routine">Routine (Within 14 days)</option>
                    <option value="Urgent">Urgent (Within 48 hours)</option>
                    <option value="Emergency">Emergency (Immediate Transfer &lt; 2-4h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Summary & Presentation</label>
                <textarea
                  rows={3}
                  value={createSummary}
                  onChange={(e) => setCreateSummary(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed font-sans"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-[11px] flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Attachments and diagnostic findings are encrypted with an ephemeral DEK before transit. Only the specialist&apos;s verified private key can decrypt the files.</span>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setIsCreatingReferral(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatchReferral}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
              >
                Dispatch Referral
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global AI Triage Assistant Modal */}
      <TriageAssistantModal
        isOpen={isTriageModalOpen}
        onClose={() => setIsTriageModalOpen(false)}
        initialPatientName={triageModalPatient}
        initialAttachments={triageModalAttachments}
        initialHistory={triageModalHistory}
        onApplyRecommendation={handleApplyFromModal}
      />
    </div>
  );
};
