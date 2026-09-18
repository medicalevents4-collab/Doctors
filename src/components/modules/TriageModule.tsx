import React, { useState } from "react";
import {
  TriageFormTemplate,
  CompletedPatientTriageAssessment,
  DoctorProfile,
  ModuleId,
} from "../../types";
import { DEFAULT_TRIAGE_TEMPLATES, MOCK_TRIAGE_ASSESSMENTS } from "../../data/triageTemplates";
import { TriageProtocolDirectory } from "../triage/TriageProtocolDirectory";
import { TriageFormEditor } from "../triage/TriageFormEditor";
import { TriageAssessmentRunner } from "../triage/TriageAssessmentRunner";
import { TriageHistoryQueue } from "../triage/TriageHistoryQueue";
import {
  Sliders,
  Play,
  Layers,
  History,
  AlertTriangle,
  HeartPulse,
  Activity,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Share2,
} from "lucide-react";

interface TriageModuleProps {
  doctor?: DoctorProfile;
  onNavigate?: (module: ModuleId) => void;
}

export const TriageModule: React.FC<TriageModuleProps> = ({
  doctor,
  onNavigate,
}) => {
  const [templates, setTemplates] = useState<TriageFormTemplate[]>(DEFAULT_TRIAGE_TEMPLATES);
  const [completedAssessments, setCompletedAssessments] = useState<CompletedPatientTriageAssessment[]>(
    MOCK_TRIAGE_ASSESSMENTS
  );

  // Active view tabs: "directory" | "builder" | "runner" | "history"
  const [activeTab, setActiveTab] = useState<"directory" | "builder" | "runner" | "history">("directory");

  // Selection states
  const [activeTemplateForRun, setActiveTemplateForRun] = useState<TriageFormTemplate>(
    DEFAULT_TRIAGE_TEMPLATES[0]
  );
  const [activeTemplateForEdit, setActiveTemplateForEdit] = useState<TriageFormTemplate>(
    DEFAULT_TRIAGE_TEMPLATES[0]
  );

  // Top summary metrics
  const totalAssessments = completedAssessments.length;
  const emergencyCount = completedAssessments.filter((a) => a.result.assignedUrgency === "Emergency").length;
  const urgentCount = completedAssessments.filter((a) => a.result.assignedUrgency === "Urgent").length;
  const redFlagTriggersCount = completedAssessments.reduce(
    (acc, a) => acc + a.result.triggeredRedFlags.length,
    0
  );

  // Handlers for Protocol Directory actions
  const handleLaunchRun = (template: TriageFormTemplate) => {
    setActiveTemplateForRun(template);
    setActiveTab("runner");
  };

  const handleLaunchEdit = (template: TriageFormTemplate) => {
    setActiveTemplateForEdit(template);
    setActiveTab("builder");
  };

  const handleCreateNewTemplate = () => {
    const newTemplate: TriageFormTemplate = {
      id: `tpl_custom_${Date.now()}`,
      title: "New Clinical Triage Questionnaire",
      description: "Custom questionnaire created by clinician for structured triage stratification.",
      department: "General Clinical Care",
      targetDemographic: "Adult",
      version: "1.0",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      author: doctor?.name || "Dr. Sarah Chen, MD",
      isActive: true,
      clinicalProtocolReference: "Hospital Clinical Governance Standard Protocol",
      thresholds: {
        routineMax: 2,
        priorityMax: 5,
        urgentMax: 8,
      },
      fields: [
        {
          id: `fld_1_${Date.now()}`,
          code: "VITAL_PULSE",
          label: "Resting Heart Rate",
          type: "vital_number",
          vitalUnit: "bpm",
          required: true,
          category: "vitals",
          helpText: "Counted pulse per minute at rest",
          vitalThresholds: [
            { id: "vt_1", max: 45, score: 3, label: "Severe Bradycardia (< 45 bpm)", isRedFlag: true, overrideUrgency: "Emergency" },
            { id: "vt_2", min: 46, max: 100, score: 0, label: "Normal Sinus (46-100 bpm)" },
            { id: "vt_3", min: 101, score: 2, label: "Tachycardia (≥ 101 bpm)" },
          ],
        },
        {
          id: `fld_2_${Date.now()}`,
          code: "PRIMARY_SYMPTOM",
          label: "Primary Clinical Presentation",
          type: "single_choice",
          required: true,
          category: "symptoms",
          options: [
            { id: "sym_mild", label: "Mild localized discomfort, patient calm", score: 0 },
            { id: "sym_mod", label: "Moderate pain interfering with normal activity", score: 2 },
            { id: "sym_severe", label: "Severe distress or acute physiologic disturbance", score: 4, isRedFlag: true },
          ],
        },
        {
          id: `fld_3_${Date.now()}`,
          code: "RED_FLAG_CHECK",
          label: "Severe Acute Life-Threat / Airway / Consciousness Compromise",
          type: "boolean_flag",
          required: false,
          category: "red_flags",
          defaultScore: 5,
        },
      ],
    };

    setTemplates((prev) => [newTemplate, ...prev]);
    setActiveTemplateForEdit(newTemplate);
    setActiveTab("builder");
  };

  const handleDuplicateTemplate = (template: TriageFormTemplate) => {
    const cloned: TriageFormTemplate = {
      ...JSON.parse(JSON.stringify(template)),
      id: `tpl_clone_${Date.now()}`,
      title: `${template.title} (Custom Copy)`,
      author: doctor?.name || "Dr. Sarah Chen, MD",
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setTemplates((prev) => [cloned, ...prev]);
    setActiveTemplateForEdit(cloned);
    setActiveTab("builder");
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (templates.length <= 1) {
      alert("Cannot delete the only remaining clinical protocol template.");
      return;
    }
    if (confirm("Are you sure you want to delete this triage questionnaire template?")) {
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      if (activeTemplateForEdit.id === templateId) {
        setActiveTemplateForEdit(templates[0]);
      }
      if (activeTemplateForRun.id === templateId) {
        setActiveTemplateForRun(templates[0]);
      }
    }
  };

  const handleSaveEditedTemplate = (updated: TriageFormTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    setActiveTemplateForEdit(updated);
    setActiveTemplateForRun(updated);
  };

  const handleSaveCompletedAssessment = (assessment: CompletedPatientTriageAssessment) => {
    setCompletedAssessments((prev) => [assessment, ...prev]);
    setActiveTab("history");
  };

  const handleReferSpecialist = (assessment: CompletedPatientTriageAssessment) => {
    // If navigation to referrals module is supported:
    if (onNavigate) {
      onNavigate("referrals");
    } else {
      alert(`Specialist referral drafted with triage urgency: ${assessment.result.assignedUrgency} (${assessment.result.totalScore} pts). Navigating to Referral Network.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Clinical Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Questionnaires
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{templates.length}</span>
              <span className="text-xs text-teal-600 font-semibold">Protocols</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Triaged Today
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900">{totalAssessments}</span>
              <span className="text-xs text-slate-500 font-medium">Evaluations</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Emergency Resus (Red)
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-rose-600">{emergencyCount}</span>
              <span className="text-xs text-rose-500 font-medium">Critical</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Red-Flag Triggers
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-amber-600">{redFlagTriggersCount}</span>
              <span className="text-xs text-amber-600 font-medium">Discriminators</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Module Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("directory")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "directory"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Questionnaires & Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("runner")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "runner"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Run Patient Assessment</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("builder")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "builder"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Clinical Form Builder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-teal-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <History className="w-4 h-4" />
            <span>Triage Logs & Audit ({completedAssessments.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-1">
          {activeTab !== "builder" && (
            <button
              type="button"
              onClick={handleCreateNewTemplate}
              className="px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Questionnaire</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: QUESTIONNAIRE DIRECTORY */}
      {activeTab === "directory" && (
        <TriageProtocolDirectory
          templates={templates}
          onSelectTemplateToRun={handleLaunchRun}
          onSelectTemplateToEdit={handleLaunchEdit}
          onCreateNewTemplate={handleCreateNewTemplate}
          onDuplicateTemplate={handleDuplicateTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />
      )}

      {/* VIEW 2: INTERACTIVE ASSESSMENT RUNNER */}
      {activeTab === "runner" && (
        <TriageAssessmentRunner
          template={activeTemplateForRun}
          doctorName={doctor?.name || "Dr. Sarah Chen, MD"}
          onSaveAssessment={handleSaveCompletedAssessment}
          onReferSpecialist={handleReferSpecialist}
          onBackToDirectory={() => setActiveTab("directory")}
        />
      )}

      {/* VIEW 3: CLINICAL FORM BUILDER */}
      {activeTab === "builder" && (
        <TriageFormEditor
          template={activeTemplateForEdit}
          onSave={handleSaveEditedTemplate}
          onCancel={() => setActiveTab("directory")}
          onPreview={(tpl) => {
            setActiveTemplateForRun(tpl);
            setActiveTab("runner");
          }}
        />
      )}

      {/* VIEW 4: TRIAGE HISTORY & AUDIT QUEUE */}
      {activeTab === "history" && (
        <TriageHistoryQueue
          assessments={completedAssessments}
          onReferSpecialist={handleReferSpecialist}
        />
      )}
    </div>
  );
};
