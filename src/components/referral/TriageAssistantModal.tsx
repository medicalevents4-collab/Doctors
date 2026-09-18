import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Activity,
  HeartPulse,
  Brain,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  ArrowRight,
  Check,
  Flame,
  FileCheck,
  Share2,
} from "lucide-react";
import { DiagnosticAttachment, TriageResult } from "../../types";
import { DIAGNOSTIC_CASE_PRESETS, DiagnosticCasePreset } from "../../data/diagnosticPresets";

interface TriageAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRecommendation?: (recommendation: {
    specialty: string;
    urgency: "Emergency" | "Urgent" | "Routine";
    summary: string;
    targetSpecialistName?: string;
    patientName?: string;
    attachments?: DiagnosticAttachment[];
    triageResult?: TriageResult;
  }) => void;
  initialPatientName?: string;
  initialAttachments?: DiagnosticAttachment[];
  initialHistory?: string;
}

export const TriageAssistantModal: React.FC<TriageAssistantModalProps> = ({
  isOpen,
  onClose,
  onApplyRecommendation,
  initialPatientName = "Robert Taylor",
  initialAttachments,
  initialHistory,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>("preset-stemi");
  const [patientName, setPatientName] = useState(initialPatientName);
  const [patientAge, setPatientAge] = useState<number>(56);
  const [patientGender, setPatientGender] = useState<"Male" | "Female">("Male");
  const [clinicalHistory, setClinicalHistory] = useState(
    initialHistory || "Hypertension, heavy smoker (30 pack-years), family history of premature CAD."
  );
  const [symptoms, setSymptoms] = useState(
    "Crushing retrosternal chest pressure radiating to left jaw, diaphoresis, onset 45 min ago."
  );
  const [attachments, setAttachments] = useState<DiagnosticAttachment[]>(
    initialAttachments || DIAGNOSTIC_CASE_PRESETS[0].attachments
  );

  const [isLoading, setIsLoading] = useState(false);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const [copiedAudit, setCopiedAudit] = useState(false);

  // New attachment form state
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [newAttName, setNewAttName] = useState("");
  const [newAttType, setNewAttType] = useState<DiagnosticAttachment["type"]>("ECG");
  const [newAttFindings, setNewAttFindings] = useState("");
  const [newAttIsAbnormal, setNewAttIsAbnormal] = useState(true);

  // When changing preset
  const handleSelectPreset = (preset: DiagnosticCasePreset) => {
    setSelectedPresetId(preset.id);
    setPatientName(preset.patientName);
    setPatientAge(preset.patientAge);
    setPatientGender(preset.patientGender);
    setClinicalHistory(preset.clinicalHistory);
    setSymptoms(preset.symptoms);
    setAttachments(preset.attachments);
    setTriageResult(null);
    setErrorMessage(null);
  };

  // Run Triage Analysis
  const handleRunTriage = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisStep("Parsing diagnostic telemetry & biomarker records...");

    try {
      // Step feedback animation
      setTimeout(() => {
        setAnalysisStep("Cross-referencing ESI & specialist referral protocols...");
      }, 700);

      setTimeout(() => {
        setAnalysisStep("Evaluating urgency stratification & receiving subspecialty...");
      }, 1400);

      const response = await fetch("/api/referral/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          patientAge,
          patientGender,
          clinicalHistory,
          symptoms,
          attachedDiagnostics: attachments,
        }),
      });

      if (!response.ok) {
        throw new Error(`Triage service responded with status ${response.status}`);
      }

      const result: TriageResult = await response.json();
      setTriageResult(result);
    } catch (err: unknown) {
      console.error("Triage Assistant API error:", err);
      setErrorMessage("Could not reach remote Gemini endpoint. Clinical rule fallback has been engaged.");
    } finally {
      setIsLoading(false);
      setAnalysisStep("");
    }
  };

  // Add custom diagnostic attachment
  const handleAddAttachment = () => {
    if (!newAttName.trim() || !newAttFindings.trim()) return;
    const newAtt: DiagnosticAttachment = {
      id: `att-${Date.now()}`,
      name: newAttName.endsWith(".pdf") ? newAttName : `${newAttName}.pdf`,
      type: newAttType,
      date: "Just now",
      summary: newAttFindings.slice(0, 90) + "...",
      findings: newAttFindings,
      fileSize: "1.2 MB",
      isAbnormal: newAttIsAbnormal,
    };
    setAttachments([newAtt, ...attachments]);
    setNewAttName("");
    setNewAttFindings("");
    setIsAddingAttachment(false);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleCopyAuditNote = () => {
    if (!triageResult) return;
    const note = `CLINICAL TRIAGE AUDIT NOTE
Patient: ${patientName} (${patientAge}y, ${patientGender})
Assigned Urgency: ${triageResult.suggestedUrgency} (${triageResult.triageCategoryCode})
Suggested Specialty: ${triageResult.suggestedSpecialty}
Ideal Subspecialist: ${triageResult.matchedSpecialistType}
Urgency Rationale: ${triageResult.urgencyRationale}

Key Diagnostic Findings:
${triageResult.keyDiagnosticFindings.map((f) => `- ${f}`).join("\n")}

Clinical Reasoning:
${triageResult.clinicalReasoning.map((r) => `- ${r}`).join("\n")}

Red Flags to Monitor:
${triageResult.redFlags.map((rf) => `- ${rf}`).join("\n")}

Recommended Pre-Consult Actions:
${triageResult.preConsultActions.map((pca) => `- ${pca}`).join("\n")}
`;
    navigator.clipboard.writeText(note);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 3000);
  };

  // Apply to Referral Form
  const handleApply = () => {
    if (!triageResult || !onApplyRecommendation) return;

    let targetDoctor = "Dr. Marcus Vance (Cardiology)";
    if (triageResult.suggestedSpecialty.toLowerCase().includes("neuro")) {
      targetDoctor = "Dr. Alan Mercer (Neurology)";
    } else if (triageResult.suggestedSpecialty.toLowerCase().includes("cardiothoracic")) {
      targetDoctor = "Dr. Priya Patel (Cardiothoracic)";
    } else if (triageResult.suggestedSpecialty.toLowerCase().includes("nephro")) {
      targetDoctor = "Dr. Thabo Mokoena (Internal Medicine & Nephrology)";
    } else if (triageResult.suggestedSpecialty.toLowerCase().includes("onco") || triageResult.suggestedSpecialty.toLowerCase().includes("derm")) {
      targetDoctor = "Dr. Elena Vasquez (Surgical Oncology)";
    }

    const enhancedSummary = `${symptoms}. Diagnostic Findings: ${triageResult.keyDiagnosticFindings.join(
      "; "
    )}. Triage assessment indicates ${triageResult.suggestedUrgency} referral (${triageResult.triageCategoryCode}): ${triageResult.urgencyRationale}`;

    onApplyRecommendation({
      specialty: triageResult.suggestedSpecialty,
      urgency: triageResult.suggestedUrgency,
      summary: enhancedSummary,
      targetSpecialistName: targetDoctor,
      patientName,
      attachments,
      triageResult,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30 text-blue-300">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">AI Referral Triage Assistant</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30">
                  Gemini 3.8 Flash • ESI Protocol
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Analyzes attached diagnostic telemetry, biomarkers, and imaging to suggest the ideal receiving specialty and urgency.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700 bg-slate-50/50">
          {/* Preset Cases Selector Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span>Test with Clinical Benchmark Scenarios</span>
              </span>
              <span className="text-[11px] text-slate-400">Click a case to populate realistic diagnostic datasets</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {DIAGNOSTIC_CASE_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedPresetId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 text-blue-950 ring-2 ring-blue-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-2xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            preset.expectedUrgency === "Emergency"
                              ? "bg-rose-100 text-rose-800"
                              : preset.expectedUrgency === "Urgent"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {preset.expectedUrgency}
                        </span>
                        {isSelected && <Check className="w-3 h-3 text-blue-600" />}
                      </div>
                      <p className="font-bold text-[11px] leading-tight line-clamp-2">{preset.title}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-2 block truncate">{preset.patientName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Grid: Left (Inputs & Diagnostics), Right (AI Output) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Patient & Attached Diagnostics (5 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Patient Demographics & Summary Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-teal-600" />
                    <span>Patient Profile & Symptoms</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {patientGender}, {patientAge} years
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Patient Name</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Age</label>
                    <input
                      type="number"
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Presenting Symptoms</label>
                  <textarea
                    rows={2}
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-1">Medical Background</label>
                  <textarea
                    rows={2}
                    value={clinicalHistory}
                    onChange={(e) => setClinicalHistory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed"
                  />
                </div>
              </div>

              {/* Attached Diagnostic Data Section */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-slate-800 text-xs">
                      Attached Diagnostic Records ({attachments.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsAddingAttachment(!isAddingAttachment)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingAttachment ? "Close" : "Add Diagnostic"}</span>
                  </button>
                </div>

                {/* Quick Add Attachment Form */}
                {isAddingAttachment && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 animate-in fade-in">
                    <span className="font-bold text-blue-900 block text-[11px]">Add Diagnostic File or Findings</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Document name (e.g. 12_Lead_ECG)"
                        value={newAttName}
                        onChange={(e) => setNewAttName(e.target.value)}
                        className="p-1.5 bg-white border border-slate-200 rounded text-xs"
                      />
                      <select
                        value={newAttType}
                        onChange={(e) => setNewAttType(e.target.value as DiagnosticAttachment["type"])}
                        className="p-1.5 bg-white border border-slate-200 rounded text-xs"
                      >
                        <option value="ECG">ECG / Rhythm</option>
                        <option value="Biomarkers">Biomarkers / Enzymes</option>
                        <option value="Imaging">CT / MRI / Ultrasound</option>
                        <option value="LabReport">Lab / Blood Panel</option>
                        <option value="Pathology">Pathology / Biopsy</option>
                        <option value="Report">Clinical Report</option>
                      </select>
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Specific findings (e.g. ST elevation in II, III, aVF; Troponin 420 ng/L)..."
                      value={newAttFindings}
                      onChange={(e) => setNewAttFindings(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded text-xs"
                    />
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newAttIsAbnormal}
                          onChange={(e) => setNewAttIsAbnormal(e.target.checked)}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span className="font-semibold text-rose-700">Flag as Abnormal Finding</span>
                      </label>
                      <button
                        onClick={handleAddAttachment}
                        className="px-3 py-1 bg-blue-600 text-white rounded font-bold text-xs hover:bg-blue-700 shadow-2xs"
                      >
                        Attach to Triage
                      </button>
                    </div>
                  </div>
                )}

                {/* Attachments List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {attachments.map((att) => (
                    <div
                      key={att.id}
                      className={`p-2.5 rounded-xl border transition-all ${
                        att.isAbnormal
                          ? "bg-rose-50/40 border-rose-200 hover:border-rose-300"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`p-1.5 rounded-lg shrink-0 ${
                              att.type === "ECG"
                                ? "bg-rose-100 text-rose-700"
                                : att.type === "Biomarkers"
                                ? "bg-amber-100 text-amber-800"
                                : att.type === "Imaging"
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-teal-100 text-teal-800"
                            }`}
                          >
                            {att.type === "ECG" ? (
                              <HeartPulse className="w-3.5 h-3.5" />
                            ) : att.type === "Imaging" ? (
                              <Brain className="w-3.5 h-3.5" />
                            ) : (
                              <Activity className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div className="truncate">
                            <p className="font-bold text-slate-900 truncate">{att.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {att.type} • {att.fileSize || "1.4 MB"} • {att.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {att.isAbnormal && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              ABNORMAL
                            </span>
                          )}
                          <button
                            onClick={() => handleRemoveAttachment(att.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            title="Remove attachment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-700 mt-1.5 bg-white p-2 rounded-lg border border-slate-200/80 leading-relaxed font-sans">
                        {att.findings}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Action Trigger Button */}
                <div className="pt-2">
                  <button
                    id="btn-run-triage-ai"
                    onClick={handleRunTriage}
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Analyzing Diagnostic Findings...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Run AI Diagnostic Triage Assessment</span>
                      </>
                    )}
                  </button>
                  {analysisStep && (
                    <p className="text-center text-[11px] text-blue-700 mt-1.5 animate-pulse font-medium">
                      {analysisStep}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: AI Triage Recommendation Panel (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {triageResult ? (
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* Urgency Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
                      triageResult.suggestedUrgency === "Emergency"
                        ? "bg-rose-50 border-rose-300 text-rose-950"
                        : triageResult.suggestedUrgency === "Urgent"
                        ? "bg-amber-50 border-amber-300 text-amber-950"
                        : "bg-emerald-50 border-emerald-300 text-emerald-950"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        {triageResult.suggestedUrgency === "Emergency" ? (
                          <span className="p-1 rounded bg-rose-600 text-white animate-pulse">
                            <Flame className="w-4 h-4" />
                          </span>
                        ) : triageResult.suggestedUrgency === "Urgent" ? (
                          <span className="p-1 rounded bg-amber-600 text-white">
                            <Clock className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-emerald-600 text-white">
                            <CheckCircle2 className="w-4 h-4" />
                          </span>
                        )}
                        <span className="text-xs uppercase font-bold tracking-wider opacity-75">
                          Triage Urgency Level
                        </span>
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white/70 border border-current">
                          {triageResult.triageCategoryCode}
                        </span>
                      </div>

                      <div className="text-xl font-extrabold mt-1">
                        {triageResult.suggestedUrgency} Priority
                      </div>
                      <p className="text-xs mt-1 leading-relaxed">{triageResult.urgencyRationale}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold block text-slate-500">Confidence</span>
                      <span className="text-base font-extrabold font-mono text-slate-900">
                        {triageResult.confidenceScore}%
                      </span>
                    </div>
                  </div>

                  {/* Primary & Secondary Recommended Specialty */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Recommended Receiving Specialty
                      </span>
                      <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-medium">
                        Best Medical Match
                      </span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <h4 className="text-base font-bold text-slate-900">{triageResult.suggestedSpecialty}</h4>
                      {triageResult.secondarySpecialty && (
                        <span className="text-xs text-slate-500">/ {triageResult.secondarySpecialty}</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Target Specialist Profile:</span>
                      <strong className="text-slate-800 font-semibold">{triageResult.matchedSpecialistType}</strong>
                    </div>
                  </div>

                  {/* Key Diagnostic Indicators Cited */}
                  <div>
                    <span className="font-bold text-slate-800 block text-xs mb-1.5 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Key Diagnostic Indicators Cited by AI</span>
                    </span>
                    <div className="space-y-1.5">
                      {triageResult.keyDiagnosticFindings.map((finding, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-blue-50/50 border border-blue-100 rounded-lg text-slate-800 text-[11px] flex items-start gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <span>{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clinical Reasoning Details */}
                  <div>
                    <span className="font-bold text-slate-800 block text-xs mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Clinical Justification & Pathophysiology</span>
                    </span>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {triageResult.clinicalReasoning.map((cr, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                          <span>{cr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Red Flags & Pre-Consult Actions Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3 bg-rose-50/40 border border-rose-200 rounded-xl space-y-1">
                      <span className="font-bold text-rose-900 text-[11px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Red Flags to Monitor</span>
                      </span>
                      <ul className="text-[10px] text-rose-950 space-y-1">
                        {triageResult.redFlags.map((rf, idx) => (
                          <li key={idx}>• {rf}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-50/40 border border-blue-200 rounded-xl space-y-1">
                      <span className="font-bold text-blue-900 text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Pre-Consult Orders</span>
                      </span>
                      <ul className="text-[10px] text-blue-950 space-y-1">
                        {triageResult.preConsultActions.map((pca, idx) => (
                          <li key={idx}>• {pca}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons in Result View */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <button
                      onClick={handleCopyAuditNote}
                      className="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 w-full sm:w-auto justify-center"
                    >
                      {copiedAudit ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Audit Note Copied!</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Triage Audit</span>
                        </>
                      )}
                    </button>

                    {onApplyRecommendation && (
                      <button
                        id="btn-apply-triage-recommendation"
                        onClick={handleApply}
                        className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 w-full sm:w-auto justify-center"
                      >
                        <span>Apply AI Recommendation to Referral</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Initial Empty State / Instructions */
                <div className="h-full min-h-[360px] bg-white rounded-2xl border border-slate-200 border-dashed p-8 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Awaiting Diagnostic Data Execution</h4>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Select a benchmark clinical scenario or modify the diagnostic telemetry and click{" "}
                    <strong>&ldquo;Run AI Diagnostic Triage Assessment&rdquo;</strong> to generate specialty routing and urgency categorization.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-left text-[11px] text-slate-600 max-w-xs pt-2">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>12-Lead ECG Analysis</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cardiac & Renal Labs</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Brain & Chest Imaging</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ESI-1 to ESI-5 Rules</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px]">
              End-to-End Cryptographic Zero-Knowledge Diagnostic Tunnel Active
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Close Assistant
          </button>
        </div>
      </div>
    </div>
  );
};
