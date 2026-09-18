import React, { useState, useMemo } from "react";
import {
  TriageFormTemplate,
  TriageFormResponseMap,
  CompletedPatientTriageAssessment,
  TriageUrgencyLevel,
} from "../../types";
import { MOCK_PATIENTS } from "../../data/patients";
import { calculateTriageScore } from "../../utils/triageScorer";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartPulse,
  User,
  Activity,
  FileCheck,
  Send,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Printer,
  ChevronDown,
  Info,
} from "lucide-react";

interface TriageAssessmentRunnerProps {
  template: TriageFormTemplate;
  doctorName?: string;
  onSaveAssessment: (assessment: CompletedPatientTriageAssessment) => void;
  onReferSpecialist?: (assessment: CompletedPatientTriageAssessment) => void;
  onBackToDirectory?: () => void;
  initialPatientId?: string;
}

export const TriageAssessmentRunner: React.FC<TriageAssessmentRunnerProps> = ({
  template,
  doctorName = "Dr. Sarah Chen, MD",
  onSaveAssessment,
  onReferSpecialist,
  onBackToDirectory,
  initialPatientId = "pat-1",
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [chiefComplaint, setChiefComplaint] = useState<string>("");
  const [clinicalNotes, setClinicalNotes] = useState<string>("");
  const [disposition, setDisposition] = useState<
    "Waiting Room" | "Observation Bay" | "Resuscitation" | "Specialist Referral" | "Discharged"
  >("Observation Bay");

  const [responses, setResponses] = useState<TriageFormResponseMap>({});
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(false);

  const activePatient = useMemo(() => {
    return MOCK_PATIENTS.find((p) => p.id === selectedPatientId) || MOCK_PATIENTS[0];
  }, [selectedPatientId]);

  // Compute live triage score continuously
  const liveScore = useMemo(() => {
    return calculateTriageScore(template, responses);
  }, [template, responses]);

  // Auto-set disposition suggestion when urgency changes
  React.useEffect(() => {
    if (liveScore.assignedUrgency === "Emergency") {
      setDisposition("Resuscitation");
    } else if (liveScore.assignedUrgency === "Urgent") {
      setDisposition("Observation Bay");
    } else if (liveScore.assignedUrgency === "Priority") {
      setDisposition("Observation Bay");
    } else {
      setDisposition("Waiting Room");
    }
  }, [liveScore.assignedUrgency]);

  // Pre-fill initial vitals if patient has them and template has matching codes
  const handlePrepopulatePatientVitals = () => {
    if (!activePatient.latestVitals) return;
    const nextResponses: TriageFormResponseMap = { ...responses };

    for (const field of template.fields) {
      if (field.code.includes("HR") || field.code.includes("PULSE")) {
        nextResponses[field.id] = activePatient.latestVitals.heartRate;
      }
      if (field.code.includes("SBP") || field.code.includes("PRESSURE")) {
        const bpMatch = activePatient.latestVitals.bloodPressure.match(/^(\d+)/);
        if (bpMatch) {
          nextResponses[field.id] = parseInt(bpMatch[1]);
        }
      }
      if (field.code.includes("SPO2") || field.code.includes("SAT")) {
        nextResponses[field.id] = activePatient.latestVitals.oxygenSaturation;
      }
      if (field.code.includes("TEMP")) {
        const tempMatch = activePatient.latestVitals.temperature.match(/([\d.]+)/);
        if (tempMatch) {
          nextResponses[field.id] = parseFloat(tempMatch[1]);
        }
      }
    }
    setResponses(nextResponses);
  };

  const handleResponseChange = (fieldId: string, val: any) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleMultiChoiceToggle = (fieldId: string, optId: string) => {
    setResponses((prev) => {
      const currentList: string[] = Array.isArray(prev[fieldId]) ? (prev[fieldId] as string[]) : [];
      const exists = currentList.includes(optId);
      const nextList = exists
        ? currentList.filter((id) => id !== optId)
        : [...currentList, optId];
      return {
        ...prev,
        [fieldId]: nextList,
      };
    });
  };

  const handleResetForm = () => {
    if (confirm("Reset all questionnaire answers and start fresh?")) {
      setResponses({});
      setChiefComplaint("");
      setClinicalNotes("");
    }
  };

  const handleSimulateEmergency = () => {
    const simResponses: TriageFormResponseMap = {};
    for (const field of template.fields) {
      if (field.type === "single_choice" && field.options) {
        const redOpt = field.options.find((o) => o.isRedFlag || o.score >= 3);
        if (redOpt) simResponses[field.id] = redOpt.id;
      } else if (field.type === "vital_number" && field.vitalThresholds) {
        const redThresh = field.vitalThresholds.find((t) => t.isRedFlag || t.score >= 3);
        if (redThresh) {
          simResponses[field.id] = redThresh.min !== undefined ? redThresh.min : (redThresh.max ?? 50);
        }
      } else if (field.type === "boolean_flag") {
        simResponses[field.id] = true;
      }
    }
    setResponses(simResponses);
    setChiefComplaint("Acute severe clinical decompensation (Emergency Simulation)");
  };

  const handleSave = () => {
    const assessmentRecord: CompletedPatientTriageAssessment = {
      id: `trg-eval-${Date.now()}`,
      templateId: template.id,
      templateTitle: template.title,
      patientId: activePatient.id,
      patientName: activePatient.name,
      patientAge: activePatient.age,
      patientGender: activePatient.gender,
      assessedBy: doctorName,
      assessedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
      responses,
      result: liveScore,
      chiefComplaint: chiefComplaint || "Acute symptoms requiring clinical triage assessment",
      clinicalNotes,
      disposition,
    };

    onSaveAssessment(assessmentRecord);
    setSavedSuccessMessage(true);
    setTimeout(() => setSavedSuccessMessage(false), 3000);
  };

  const getUrgencyBadge = (urgency: TriageUrgencyLevel) => {
    switch (urgency) {
      case "Emergency":
        return {
          bg: "bg-rose-600 text-white shadow-rose-200 animate-pulse",
          border: "border-rose-500",
          cardBg: "bg-rose-50 border-rose-300 text-rose-950",
          label: "EMERGENCY / RESUSCITATION (RED)",
          wait: "Immediate (< 10 mins)",
        };
      case "Urgent":
        return {
          bg: "bg-orange-500 text-white shadow-orange-200",
          border: "border-orange-400",
          cardBg: "bg-orange-50 border-orange-300 text-orange-950",
          label: "VERY URGENT (ORANGE)",
          wait: "Target < 15 mins",
        };
      case "Priority":
        return {
          bg: "bg-amber-500 text-white shadow-amber-200",
          border: "border-amber-400",
          cardBg: "bg-amber-50 border-amber-300 text-amber-950",
          label: "PRIORITY / URGENT (YELLOW)",
          wait: "Target < 60 mins",
        };
      case "Routine":
      default:
        return {
          bg: "bg-emerald-600 text-white shadow-emerald-200",
          border: "border-emerald-400",
          cardBg: "bg-emerald-50 border-emerald-300 text-emerald-950",
          label: "ROUTINE / NON-URGENT (GREEN)",
          wait: "Ambulatory (120-240 mins)",
        };
    }
  };

  const urgencyMeta = getUrgencyBadge(liveScore.assignedUrgency);

  return (
    <div className="space-y-6">
      {/* Top Banner: Protocol Title & Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase">
              {template.department}
            </span>
            <span className="text-xs text-slate-400">• v{template.version}</span>
            <span className="text-xs text-slate-400">• {template.clinicalProtocolReference}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">{template.title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{template.description}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSimulateEmergency}
            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5"
            title="Populate answers with emergency red flags to test escalation"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Simulate Red-Flag Emergency</span>
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
            title="Reset answers"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {onBackToDirectory && (
            <button
              type="button"
              onClick={onBackToDirectory}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Assessment Form (Left 7 cols) & Live Urgency Scoring Card (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Patient Context & Dynamic Questionnaire */}
        <div className="lg:col-span-7 space-y-6">
          {/* Patient Selection & Chief Complaint */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Patient Demographics & Triage Intake
                </h3>
              </div>
              <button
                type="button"
                onClick={handlePrepopulatePatientVitals}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                title="Populate recorded clinic vitals into the matching form fields"
              >
                <Sparkles className="w-3 h-3 text-teal-500" />
                <span>Auto-fill Patient Vitals</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Patient Record
                </label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-medium"
                >
                  {MOCK_PATIENTS.map((pat) => (
                    <option key={pat.id} value={pat.id}>
                      {pat.name} ({pat.age}y, {pat.gender}) — MRN: {pat.mrn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical Aid / Scheme
                </label>
                <div className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium truncate">
                  {activePatient.medicalAid.scheme} ({activePatient.medicalAid.plan})
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Presenting Chief Complaint / Triage Reason
                </label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="e.g. Acute substernal chest pressure, shortness of breath, sudden weakness..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Questionnaire Fields Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Clinical Assessment Protocol</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                {template.fields.length} standardized questions
              </span>
            </div>

            <div className="space-y-6">
              {template.fields.map((field, idx) => {
                const currentVal = responses[field.id];

                return (
                  <div
                    key={field.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{field.label}</span>
                          {field.required && (
                            <span className="text-[10px] font-bold text-rose-500">*Required</span>
                          )}
                        </div>
                        {field.helpText && (
                          <p className="text-[11px] text-slate-500 mt-1 pl-7">{field.helpText}</p>
                        )}
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 shrink-0 uppercase">
                        {field.code}
                      </span>
                    </div>

                    <div className="pl-7 pt-1">
                      {/* 1. SINGLE CHOICE */}
                      {field.type === "single_choice" && field.options && (
                        <div className="space-y-2">
                          {field.options.map((opt) => {
                            const isChecked = currentVal === opt.id || currentVal === opt.label;
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? opt.isRedFlag
                                      ? "bg-rose-50 border-rose-400 ring-2 ring-rose-500/10"
                                      : "bg-teal-50 border-teal-400 ring-2 ring-teal-500/10"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`field_${field.id}`}
                                  value={opt.id}
                                  checked={isChecked}
                                  onChange={() => handleResponseChange(field.id, opt.id)}
                                  className="mt-0.5 text-teal-600 focus:ring-teal-500"
                                />
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2 text-xs">
                                  <span
                                    className={`font-medium ${
                                      opt.isRedFlag ? "text-rose-950 font-bold" : "text-slate-800"
                                    }`}
                                  >
                                    {opt.label}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {opt.isRedFlag && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" /> RED-FLAG
                                      </span>
                                    )}
                                    <span className="text-[11px] font-mono font-bold text-slate-500">
                                      +{opt.score} pts
                                    </span>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. MULTIPLE CHOICE */}
                      {field.type === "multiple_choice" && field.options && (
                        <div className="space-y-2">
                          {field.options.map((opt) => {
                            const list: string[] = Array.isArray(currentVal) ? (currentVal as string[]) : [];
                            const isChecked = list.includes(opt.id);
                            return (
                              <label
                                key={opt.id}
                                className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? opt.isRedFlag
                                      ? "bg-rose-50 border-rose-400 ring-2 ring-rose-500/10"
                                      : "bg-teal-50 border-teal-400 ring-2 ring-teal-500/10"
                                    : "bg-white border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleMultiChoiceToggle(field.id, opt.id)}
                                  className="mt-0.5 rounded text-teal-600 focus:ring-teal-500"
                                />
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2 text-xs">
                                  <span
                                    className={`font-medium ${
                                      opt.isRedFlag ? "text-rose-950 font-bold" : "text-slate-800"
                                    }`}
                                  >
                                    {opt.label}
                                  </span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    {opt.isRedFlag && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                        <AlertTriangle className="w-2.5 h-2.5" /> RED-FLAG
                                      </span>
                                    )}
                                    <span className="text-[11px] font-mono font-bold text-slate-500">
                                      +{opt.score} pts
                                    </span>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {/* 3. VITAL NUMBER ENTRY WITH REALTIME THRESHOLD FEEDBACK */}
                      {field.type === "vital_number" && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-48">
                              <input
                                type="number"
                                step="any"
                                value={typeof currentVal === "number" ? currentVal : typeof currentVal === "string" ? currentVal : ""}
                                onChange={(e) =>
                                  handleResponseChange(
                                    field.id,
                                    e.target.value === "" ? "" : parseFloat(e.target.value)
                                  )
                                }
                                placeholder="Enter value..."
                                className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 pr-12"
                              />
                              <span className="absolute right-3 top-2.5 text-[11px] font-mono text-slate-400">
                                {field.vitalUnit || "units"}
                              </span>
                            </div>

                            {/* Active matched threshold indicator */}
                            {currentVal !== undefined && currentVal !== "" && typeof currentVal !== "boolean" && (
                              <div className="flex items-center gap-2">
                                {(() => {
                                  const num = typeof currentVal === "number" ? currentVal : typeof currentVal === "string" ? parseFloat(currentVal) : NaN;
                                  if (isNaN(num)) return null;
                                  const matched = field.vitalThresholds?.find((t) => {
                                    const a = t.min === undefined || num >= t.min;
                                    const b = t.max === undefined || num <= t.max;
                                    return a && b;
                                  });
                                  if (!matched) {
                                    return <span className="text-xs text-slate-400">No match</span>;
                                  }
                                  return (
                                    <span
                                      className={`text-xs px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1.5 ${
                                        matched.isRedFlag
                                          ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                                          : matched.score > 1
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      }`}
                                    >
                                      {matched.isRedFlag && <AlertTriangle className="w-3 h-3" />}
                                      <span>{matched.label}</span>
                                      <span className="font-mono text-[10px]">
                                        (+{matched.score} pts)
                                      </span>
                                    </span>
                                  );
                                })()}
                              </div>
                            )}
                          </div>

                          {/* Thresholds Reference Guide Pill Row */}
                          {field.vitalThresholds && (
                            <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                              {field.vitalThresholds.map((th) => (
                                <span
                                  key={th.id}
                                  className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600"
                                >
                                  {th.min !== undefined && th.max !== undefined
                                    ? `${th.min}-${th.max}`
                                    : th.max !== undefined
                                    ? `≤${th.max}`
                                    : `≥${th.min}`}{" "}
                                  {field.vitalUnit}:{" "}
                                  <strong>
                                    {th.label} (+{th.score})
                                  </strong>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* 4. BOOLEAN RED-FLAG */}
                      {field.type === "boolean_flag" && (
                        <label
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            currentVal === true
                              ? "bg-rose-50 border-rose-400 ring-2 ring-rose-500/10"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={currentVal === true}
                            onChange={(e) => handleResponseChange(field.id, e.target.checked)}
                            className="rounded text-rose-600 focus:ring-rose-500"
                          />
                          <div className="flex-1 flex items-center justify-between text-xs">
                            <span className="font-bold text-rose-950 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Positive / Triggered Red-Flag Condition</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">
                              Instant Emergency Escalation
                            </span>
                          </div>
                        </label>
                      )}

                      {/* 5. TEXT / CLINICAL OBSERVATIONS */}
                      {field.type === "text" && (
                        <textarea
                          rows={2}
                          value={typeof currentVal === "string" ? currentVal : ""}
                          onChange={(e) => handleResponseChange(field.id, e.target.value)}
                          placeholder="Document clinical observations or physical findings..."
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clinician's Notes & Disposition */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Triage Clinician Assessment Notes
                </label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Additional context, nurse handoff, diagnostic tests ordered stat..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Recommended Initial Disposition
                </label>
                <select
                  value={disposition}
                  onChange={(e) =>
                    setDisposition(
                      e.target.value as
                        | "Waiting Room"
                        | "Observation Bay"
                        | "Resuscitation"
                        | "Specialist Referral"
                        | "Discharged"
                    )
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 font-semibold"
                >
                  <option value="Resuscitation">Resuscitation Bay / High Care (Immediate)</option>
                  <option value="Observation Bay">Acute Observation Bed / Cubicle</option>
                  <option value="Waiting Room">Ambulatory Waiting Area (Queue)</option>
                  <option value="Specialist Referral">Direct Specialist Referral / Admission</option>
                  <option value="Discharged">Direct Home Discharge / Self-Care Advice</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Triage Urgency Scoring Engine Widget */}
        <div className="lg:col-span-5 space-y-6 sticky top-4">
          {/* Main Urgency Badge Card */}
          <div className={`p-6 rounded-2xl border ${urgencyMeta.cardBg} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Live Stratification Result
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 shadow-2xs">
                {liveScore.triageCategoryCode}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 rounded-xl font-black text-xs tracking-wide uppercase ${urgencyMeta.bg}`}>
                  {liveScore.assignedUrgency}
                </span>
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Max Wait: {urgencyMeta.wait}</span>
                </span>
              </div>
            </div>

            {/* Numerical Score Meter */}
            <div className="bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-600">Total Urgency Points:</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{liveScore.totalScore}</span>
                  <span className="text-xs text-slate-400 font-mono">/ ~{liveScore.maxPossibleScore} max</span>
                </div>
              </div>

              {/* Visual Score Progression Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-500 ${
                    liveScore.assignedUrgency === "Emergency"
                      ? "bg-rose-600"
                      : liveScore.assignedUrgency === "Urgent"
                      ? "bg-orange-500"
                      : liveScore.assignedUrgency === "Priority"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((liveScore.totalScore / (liveScore.maxPossibleScore || 20)) * 100)
                    )}%`,
                  }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                <span>Routine (0-{template.thresholds.routineMax})</span>
                <span>Priority ({template.thresholds.routineMax + 1}-{template.thresholds.priorityMax})</span>
                <span>Urgent ({template.thresholds.priorityMax + 1}-{template.thresholds.urgentMax})</span>
                <span className="text-rose-600 font-bold">&gt;{template.thresholds.urgentMax} (Red)</span>
              </div>
            </div>

            {/* Critical Red-Flag Callout Banner if triggered */}
            {liveScore.triggeredRedFlags.length > 0 && (
              <div className="p-3.5 bg-rose-100/90 rounded-xl border border-rose-300 text-rose-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>CRITICAL RED-FLAG OVERRIDE DETECTED</span>
                </div>
                <ul className="text-xs space-y-1 pl-5 list-disc text-rose-900 font-medium">
                  {liveScore.triggeredRedFlags.map((rf, idx) => (
                    <li key={idx}>{rf.reason}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Itemized Points Contribution Log */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Score Itemization ({liveScore.fieldContributions.length} findings)
              </span>
              <div className="bg-white/80 rounded-xl border border-slate-200/80 p-3 max-h-48 overflow-y-auto space-y-1.5 text-xs">
                {liveScore.fieldContributions.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px]">
                    No point-accumulating answers selected yet. Defaulting to baseline.
                  </p>
                ) : (
                  liveScore.fieldContributions.map((fc, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-100 pb-1">
                      <span className="text-slate-700 font-medium truncate pr-2">
                        {fc.fieldLabel}
                      </span>
                      <span className="font-mono font-bold text-teal-700 shrink-0">
                        {fc.detail}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recommended Protocol Actions */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Recommended Clinical Directives
              </span>
              <div className="bg-white/80 rounded-xl border border-slate-200/80 p-3 text-xs space-y-1.5">
                {liveScore.recommendedActions.map((action, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 mt-0.5 shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-200/80 space-y-2">
              {savedSuccessMessage && (
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold text-center border border-emerald-300">
                  Assessment successfully saved to patient chart!
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Save Triage Assessment to Patient Record</span>
              </button>

              {onReferSpecialist && (
                <button
                  type="button"
                  onClick={() => {
                    const assessmentRecord: CompletedPatientTriageAssessment = {
                      id: `trg-eval-${Date.now()}`,
                      templateId: template.id,
                      templateTitle: template.title,
                      patientId: activePatient.id,
                      patientName: activePatient.name,
                      patientAge: activePatient.age,
                      patientGender: activePatient.gender,
                      assessedBy: doctorName,
                      assessedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
                      responses,
                      result: liveScore,
                      chiefComplaint: chiefComplaint || "Acute symptoms requiring clinical triage assessment",
                      clinicalNotes,
                      disposition,
                    };
                    onReferSpecialist(assessmentRecord);
                  }}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4 text-indigo-200" />
                  <span>Create Specialist Referral with Triage Data</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
