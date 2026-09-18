import React, { useState } from "react";
import {
  TriageFormTemplate,
  TriageFormField,
  TriageQuestionType,
  TriageUrgencyLevel,
  TriageQuestionOption,
  TriageVitalThreshold,
} from "../../types";
import {
  Save,
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Sliders,
  HelpCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Check,
  RotateCcw,
  Download,
  Info,
} from "lucide-react";

interface TriageFormEditorProps {
  template: TriageFormTemplate;
  onSave: (updatedTemplate: TriageFormTemplate) => void;
  onCancel: () => void;
  onPreview: (template: TriageFormTemplate) => void;
}

const FIELD_PRESET_LIBRARY: Partial<TriageFormField>[] = [
  {
    code: "HR_PULSE",
    label: "Resting Heart Rate (Pulse)",
    category: "vitals",
    type: "vital_number",
    vitalUnit: "bpm",
    helpText: "Monitored apical or radial pulse count per minute",
    required: true,
    vitalThresholds: [
      { id: "hr_t1", max: 40, score: 3, label: "Critical Bradycardia (< 40 bpm)", isRedFlag: true, overrideUrgency: "Emergency" },
      { id: "hr_t2", min: 41, max: 50, score: 1, label: "Mild Bradycardia (41-50 bpm)" },
      { id: "hr_t3", min: 51, max: 100, score: 0, label: "Normal Range (51-100 bpm)" },
      { id: "hr_t4", min: 101, max: 129, score: 2, label: "Tachycardia (101-129 bpm)" },
      { id: "hr_t5", min: 130, score: 3, label: "Severe Tachycardia (≥ 130 bpm)", isRedFlag: true },
    ],
  },
  {
    code: "SBP_PRESSURE",
    label: "Systolic Blood Pressure",
    category: "vitals",
    type: "vital_number",
    vitalUnit: "mmHg",
    helpText: "Non-invasive arterial systolic reading",
    required: true,
    vitalThresholds: [
      { id: "sbp_t1", max: 70, score: 3, label: "Hypotensive Shock (< 70 mmHg)", isRedFlag: true, overrideUrgency: "Emergency" },
      { id: "sbp_t2", min: 71, max: 90, score: 2, label: "Hypotension (71-90 mmHg)" },
      { id: "sbp_t3", min: 91, max: 180, score: 0, label: "Normotensive (91-180 mmHg)" },
      { id: "sbp_t4", min: 181, score: 2, label: "Severe Hypertension (≥ 181 mmHg)" },
    ],
  },
  {
    code: "SPO2_SAT",
    label: "Oxygen Saturation (SpO2)",
    category: "vitals",
    type: "vital_number",
    vitalUnit: "%",
    helpText: "Pulse oximetry on room air unless documented on O2",
    required: true,
    vitalThresholds: [
      { id: "spo2_t1", max: 88, score: 4, label: "Severe Hypoxemia (< 89%)", isRedFlag: true, overrideUrgency: "Emergency" },
      { id: "spo2_t2", min: 89, max: 93, score: 2, label: "Moderate Hypoxemia (89-93%)", overrideUrgency: "Urgent" },
      { id: "spo2_t3", min: 94, max: 100, score: 0, label: "Normal Saturation (≥ 94%)" },
    ],
  },
  {
    code: "CONSCIOUSNESS_AVPU",
    label: "AVPU Neurological Level",
    category: "exam",
    type: "single_choice",
    helpText: "Rapid consciousness assessment scale",
    required: true,
    options: [
      { id: "avpu_a", label: "Alert and responsive (A)", score: 0 },
      { id: "avpu_v", label: "Responds to Voice only (V)", score: 1 },
      { id: "avpu_p", label: "Responds to Pain only (P)", score: 2, isRedFlag: true },
      { id: "avpu_u", label: "Unresponsive (U)", score: 4, isRedFlag: true, overrideUrgency: "Emergency" },
    ],
  },
  {
    code: "PAIN_SCALE",
    label: "Subjective Pain Severity Score (0-10)",
    category: "symptoms",
    type: "single_choice",
    helpText: "Visual Analog / Numeric Rating Scale (NRS)",
    required: true,
    options: [
      { id: "pain_none", label: "0 - No pain", score: 0 },
      { id: "pain_mild", label: "1 to 3 - Mild discomfort", score: 1 },
      { id: "pain_mod", label: "4 to 6 - Moderate pain interfering with tasks", score: 2 },
      { id: "pain_severe", label: "7 to 8 - Severe acute pain", score: 3 },
      { id: "pain_unbearable", label: "9 to 10 - Unbearable / Agonizing pain", score: 4, isRedFlag: true },
    ],
  },
  {
    code: "AIRWAY_PATENCY",
    label: "Airway Compromise / Stridor",
    category: "red_flags",
    type: "boolean_flag",
    helpText: "Inspiratory stridor, audible gargling, or inability to swallow saliva",
    required: true,
    defaultScore: 5,
  },
];

export const TriageFormEditor: React.FC<TriageFormEditorProps> = ({
  template,
  onSave,
  onCancel,
  onPreview,
}) => {
  const [formData, setFormData] = useState<TriageFormTemplate>({
    ...template,
    fields: template.fields.map((f) => ({ ...f })),
    thresholds: { ...template.thresholds },
  });

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    formData.fields[0]?.id || null
  );
  const [activeSettingsTab, setActiveSettingsTab] = useState<"fields" | "scoring" | "meta">("fields");
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Field manipulation helpers
  const handleAddField = (type: TriageQuestionType = "single_choice") => {
    const newFieldId = `field_${Date.now()}`;
    const newField: TriageFormField = {
      id: newFieldId,
      code: `CODE_${formData.fields.length + 1}`,
      label: "New Clinical Assessment Question",
      type,
      required: false,
      category: "symptoms",
      helpText: "",
      options:
        type === "single_choice" || type === "multiple_choice"
          ? [
              { id: `opt_1_${Date.now()}`, label: "Normal / Low Risk finding", score: 0 },
              { id: `opt_2_${Date.now()}`, label: "Moderate Risk / Priority finding", score: 2 },
              { id: `opt_3_${Date.now()}`, label: "Severe / Emergency finding", score: 4, isRedFlag: true },
            ]
          : undefined,
      vitalUnit: type === "vital_number" ? "units" : undefined,
      vitalThresholds:
        type === "vital_number"
          ? [
              { id: `vt_1_${Date.now()}`, min: 0, max: 50, score: 2, label: "Low Range" },
              { id: `vt_2_${Date.now()}`, min: 51, max: 100, score: 0, label: "Normal Range" },
              { id: `vt_3_${Date.now()}`, min: 101, score: 3, label: "Critical High Range", isRedFlag: true },
            ]
          : undefined,
    };

    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedFieldId(newFieldId);
  };

  const handleApplyPreset = (preset: Partial<TriageFormField>) => {
    const newFieldId = `preset_${Date.now()}`;
    const newField: TriageFormField = {
      id: newFieldId,
      code: preset.code || `PRESET_${Date.now()}`,
      label: preset.label || "Preset Question",
      helpText: preset.helpText || "",
      type: preset.type || "single_choice",
      required: preset.required ?? true,
      category: preset.category || "vitals",
      vitalUnit: preset.vitalUnit,
      vitalThresholds: preset.vitalThresholds ? JSON.parse(JSON.stringify(preset.vitalThresholds)) : undefined,
      options: preset.options ? JSON.parse(JSON.stringify(preset.options)) : undefined,
      defaultScore: preset.defaultScore,
    };

    setFormData((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }));
    setSelectedFieldId(newFieldId);
  };

  const handleDuplicateField = (fieldId: string) => {
    const fieldIndex = formData.fields.findIndex((f) => f.id === fieldId);
    if (fieldIndex === -1) return;

    const source = formData.fields[fieldIndex];
    const duplicated: TriageFormField = {
      ...JSON.parse(JSON.stringify(source)),
      id: `field_${Date.now()}`,
      code: `${source.code}_COPY`,
      label: `${source.label} (Copy)`,
    };

    const newFields = [...formData.fields];
    newFields.splice(fieldIndex + 1, 0, duplicated);
    setFormData((prev) => ({ ...prev, fields: newFields }));
    setSelectedFieldId(duplicated.id);
  };

  const handleDeleteField = (fieldId: string) => {
    if (formData.fields.length <= 1) {
      alert("A triage protocol must have at least one clinical question.");
      return;
    }
    const newFields = formData.fields.filter((f) => f.id !== fieldId);
    setFormData((prev) => ({ ...prev, fields: newFields }));
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(newFields[0]?.id || null);
    }
  };

  const handleMoveField = (fieldId: string, direction: "up" | "down") => {
    const index = formData.fields.findIndex((f) => f.id === fieldId);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === formData.fields.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newFields = [...formData.fields];
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    setFormData((prev) => ({ ...prev, fields: newFields }));
  };

  const handleUpdateCurrentField = (updates: Partial<TriageFormField>) => {
    if (!selectedFieldId) return;
    setFormData((prev) => ({
      ...prev,
      fields: prev.fields.map((f) => (f.id === selectedFieldId ? { ...f, ...updates } : f)),
    }));
  };

  // Option management for single/multiple choice
  const handleAddOption = () => {
    if (!selectedFieldId) return;
    const field = formData.fields.find((f) => f.id === selectedFieldId);
    if (!field) return;

    const newOption: TriageQuestionOption = {
      id: `opt_${Date.now()}`,
      label: `Option ${(field.options?.length || 0) + 1}`,
      score: 1,
      isRedFlag: false,
    };

    handleUpdateCurrentField({
      options: [...(field.options || []), newOption],
    });
  };

  const handleUpdateOption = (optId: string, updates: Partial<TriageQuestionOption>) => {
    if (!selectedFieldId) return;
    const field = formData.fields.find((f) => f.id === selectedFieldId);
    if (!field || !field.options) return;

    const updatedOptions = field.options.map((o) =>
      o.id === optId ? { ...o, ...updates } : o
    );
    handleUpdateCurrentField({ options: updatedOptions });
  };

  const handleDeleteOption = (optId: string) => {
    if (!selectedFieldId) return;
    const field = formData.fields.find((f) => f.id === selectedFieldId);
    if (!field || !field.options) return;

    if (field.options.length <= 1) {
      alert("Choice fields must have at least one response option.");
      return;
    }

    const updatedOptions = field.options.filter((o) => o.id !== optId);
    handleUpdateCurrentField({ options: updatedOptions });
  };

  // Vital thresholds management
  const handleAddThreshold = () => {
    if (!selectedFieldId) return;
    const field = formData.fields.find((f) => f.id === selectedFieldId);
    if (!field) return;

    const newThreshold: TriageVitalThreshold = {
      id: `thresh_${Date.now()}`,
      min: 0,
      max: 100,
      score: 1,
      label: "Custom range label",
      isRedFlag: false,
    };

    handleUpdateCurrentField({
      vitalThresholds: [...(field.vitalThresholds || []), newThreshold],
    });
  };

  const handleUpdateThreshold = (threshId: string, updates: Partial<TriageVitalThreshold>) => {
    if (!selectedFieldId) return;
    const field = formData.fields.find((f) => f.id === selectedFieldId);
    if (!field || !field.vitalThresholds) return;

    const updatedThresholds = field.vitalThresholds.map((t) =>
      t.id === threshId ? { ...t, ...updates } : t
    );
    handleUpdateCurrentField({ vitalThresholds: updatedThresholds });
  };

  const handleDeleteThreshold = (threshId: string) => {
    if (!selectedFieldId) return;
    const field = formData.fields.find((f) => f.id === selectedFieldId);
    if (!field || !field.vitalThresholds) return;

    const updatedThresholds = field.vitalThresholds.filter((t) => t.id !== threshId);
    handleUpdateCurrentField({ vitalThresholds: updatedThresholds });
  };

  const handleSaveInternal = () => {
    const updated: TriageFormTemplate = {
      ...formData,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    onSave(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const selectedField = formData.fields.find((f) => f.id === selectedFieldId);

  // Calculate theoretical maximum points
  const maxPoints = formData.fields.reduce((acc, f) => {
    if (f.type === "single_choice" && f.options) {
      return acc + Math.max(0, ...f.options.map((o) => o.score));
    }
    if (f.type === "multiple_choice" && f.options) {
      return acc + f.options.reduce((s, o) => s + Math.max(0, o.score), 0);
    }
    if (f.type === "vital_number" && f.vitalThresholds) {
      return acc + Math.max(0, ...f.vitalThresholds.map((t) => t.score));
    }
    if (f.type === "boolean_flag") {
      return acc + (f.defaultScore ?? 3);
    }
    return acc;
  }, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[750px]">
      {/* Top Action Header */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                Protocol Builder
              </span>
              <span className="text-xs text-slate-400">• v{formData.version}</span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">{formData.title}</h2>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {saveSuccessNotice && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5 animate-fade-in">
              <Check className="w-3.5 h-3.5" /> Protocol Saved!
            </span>
          )}

          <button
            onClick={() => onPreview(formData)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Test questionnaire in interactive assessment simulator"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Test Run Assessment</span>
          </button>

          <button
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSaveInternal}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Protocol</span>
          </button>
        </div>
      </div>

      {/* Subnav Tabs: Fields vs Scoring Rubric vs Metadata */}
      <div className="flex border-b border-slate-200 bg-white px-6 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSettingsTab("fields")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeSettingsTab === "fields"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Questionnaire Fields ({formData.fields.length})</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab("scoring")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeSettingsTab === "scoring"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Triage Urgency Score Thresholds</span>
        </button>

        <button
          onClick={() => setActiveSettingsTab("meta")}
          className={`py-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeSettingsTab === "meta"
              ? "border-teal-600 text-teal-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Protocol Details & Specialty</span>
        </button>
      </div>

      {/* TAB CONTENT 1: QUESTIONNAIRE FIELDS EDITOR */}
      {activeSettingsTab === "fields" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[600px]">
          {/* Left Column: List of fields + Add Field Bar */}
          <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/50 flex flex-col p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assessment Fields
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Max Score: ~{maxPoints} pts
              </span>
            </div>

            {/* Field Type Quick Add Buttons */}
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Add Custom Field
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleAddField("single_choice")}
                  className="px-2.5 py-1.5 text-left rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors text-[11px] font-medium flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3 text-teal-600" />
                  <span>Single Choice</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField("multiple_choice")}
                  className="px-2.5 py-1.5 text-left rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors text-[11px] font-medium flex items-center gap-1.5"
                >
                  <Plus className="w-3 h-3 text-teal-600" />
                  <span>Multi Choice</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField("vital_number")}
                  className="px-2.5 py-1.5 text-left rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 transition-colors text-[11px] font-medium flex items-center gap-1.5"
                >
                  <Activity className="w-3 h-3 text-teal-600" />
                  <span>Vital / Number</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddField("boolean_flag")}
                  className="px-2.5 py-1.5 text-left rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-slate-200 transition-colors text-[11px] font-medium flex items-center gap-1.5"
                >
                  <AlertTriangle className="w-3 h-3 text-rose-600" />
                  <span>Red-Flag Toggle</span>
                </button>
              </div>
            </div>

            {/* Presets Quick Picker Accordion */}
            <div className="bg-slate-100/80 p-2.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Quick Clinical Presets
                </span>
                <span className="text-[10px] text-teal-600 font-semibold">1-Click Insert</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {FIELD_PRESET_LIBRARY.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="w-full text-left px-2 py-1 rounded bg-white hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-[11px] text-slate-700 font-medium flex items-center justify-between transition-colors"
                  >
                    <span className="truncate">{preset.label}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                      {preset.type?.replace("_", " ")}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {formData.fields.map((field, idx) => {
                const isSelected = field.id === selectedFieldId;
                return (
                  <div
                    key={field.id}
                    onClick={() => setSelectedFieldId(field.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white border-teal-500 shadow-sm ring-2 ring-teal-500/10"
                        : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{field.label}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-mono px-1 rounded bg-slate-100 text-slate-600 uppercase">
                              {field.code}
                            </span>
                            <span className="text-[10px] text-slate-400 capitalize">
                              {field.type.replace("_", " ")}
                            </span>
                            {field.required && (
                              <span className="text-[9px] text-rose-500 font-bold">*Req</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Reorder and duplicate controls */}
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleMoveField(field.id, "up")}
                          disabled={idx === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveField(field.id, "down")}
                          disabled={idx === formData.fields.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateField(field.id)}
                          className="p-1 text-slate-400 hover:text-teal-600"
                          title="Duplicate field"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteField(field.id)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Delete field"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Field Detailed Editor */}
          <div className="lg:col-span-8 p-6 overflow-y-auto space-y-6">
            {selectedField ? (
              <div className="space-y-6 max-w-3xl">
                {/* Field Header & Basic Details */}
                <div className="pb-4 border-b border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-teal-600 font-bold uppercase">
                        Configuring Field: {selectedField.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {selectedField.label || "Untitled Field"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedField.required}
                          onChange={(e) => handleUpdateCurrentField({ required: e.target.checked })}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>Mandatory Question</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Question / Clinical Prompt
                      </label>
                      <input
                        type="text"
                        value={selectedField.label}
                        onChange={(e) => handleUpdateCurrentField({ label: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                        placeholder="e.g. Chest pain character, Systolic Blood Pressure"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Clinical Identifier Code
                      </label>
                      <input
                        type="text"
                        value={selectedField.code}
                        onChange={(e) => handleUpdateCurrentField({ code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 uppercase"
                        placeholder="e.g. SBP_01, TROPONIN_HS"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Response Type
                      </label>
                      <select
                        value={selectedField.type}
                        onChange={(e) => {
                          const newType = e.target.value as TriageQuestionType;
                          handleUpdateCurrentField({
                            type: newType,
                            options:
                              (newType === "single_choice" || newType === "multiple_choice") && !selectedField.options
                                ? [
                                    { id: `opt_1_${Date.now()}`, label: "Low Urgency finding", score: 0 },
                                    { id: `opt_2_${Date.now()}`, label: "High Urgency finding", score: 3, isRedFlag: true },
                                  ]
                                : selectedField.options,
                            vitalThresholds:
                              newType === "vital_number" && !selectedField.vitalThresholds
                                ? [
                                    { id: `vt_1_${Date.now()}`, max: 60, score: 2, label: "Below Normal" },
                                    { id: `vt_2_${Date.now()}`, min: 61, max: 100, score: 0, label: "Normal" },
                                    { id: `vt_3_${Date.now()}`, min: 101, score: 3, label: "Critical High", isRedFlag: true },
                                  ]
                                : selectedField.vitalThresholds,
                          });
                        }}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                      >
                        <option value="single_choice">Single Choice (Radio / Dropdown)</option>
                        <option value="multiple_choice">Multiple Choice (Checkboxes)</option>
                        <option value="vital_number">Numeric Vital Sign (with threshold scoring)</option>
                        <option value="boolean_flag">Boolean Red-Flag Discriminator (Yes / No)</option>
                        <option value="text">Clinical Notes / Free Text</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Clinical Category
                      </label>
                      <select
                        value={selectedField.category}
                        onChange={(e) =>
                          handleUpdateCurrentField({
                            category: e.target.value as "vitals" | "symptoms" | "history" | "red_flags" | "exam",
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900 capitalize"
                      >
                        <option value="vitals">Vital Signs (Hemodynamics)</option>
                        <option value="symptoms">Symptoms & Chief Complaints</option>
                        <option value="exam">Physical Examination Findings</option>
                        <option value="history">Medical History & Risk Factors</option>
                        <option value="red_flags">Critical Red-Flag Discriminators</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Instructions / Clinical Reference Guidance
                      </label>
                      <input
                        type="text"
                        value={selectedField.helpText || ""}
                        onChange={(e) => handleUpdateCurrentField({ helpText: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                        placeholder="e.g. Measured in quiet room after 5 min rest. Record highest value."
                      />
                    </div>
                  </div>
                </div>

                {/* DYNAMIC SCORING RUBRIC CONFIGURATION */}
                {/* 1. Choice Options with Urgency Points & Red Flags */}
                {(selectedField.type === "single_choice" || selectedField.type === "multiple_choice") && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Response Options & Urgency Points Mapping
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Assign weight scores to each response and designate critical red-flag triggers.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Option</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {selectedField.options?.map((opt, oIdx) => (
                        <div
                          key={opt.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-6">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Option Label #{oIdx + 1}
                              </label>
                              <input
                                type="text"
                                value={opt.label}
                                onChange={(e) => handleUpdateOption(opt.id, { label: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Points (0-10)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="15"
                                value={opt.score}
                                onChange={(e) =>
                                  handleUpdateOption(opt.id, { score: parseInt(e.target.value) || 0 })
                                }
                                className="w-full px-2.5 py-1.5 text-xs font-bold text-center bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Urgency Override
                              </label>
                              <select
                                value={opt.overrideUrgency || ""}
                                onChange={(e) =>
                                  handleUpdateOption(opt.id, {
                                    overrideUrgency: (e.target.value as TriageUrgencyLevel) || undefined,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                              >
                                <option value="">No Override</option>
                                <option value="Routine">Routine</option>
                                <option value="Priority">Priority</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Emergency">Emergency</option>
                              </select>
                            </div>

                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleDeleteOption(opt.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                                title="Remove option"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 pt-1 border-t border-slate-200/60 text-xs">
                            <label className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={opt.isRedFlag || false}
                                onChange={(e) =>
                                  handleUpdateOption(opt.id, {
                                    isRedFlag: e.target.checked,
                                    overrideUrgency: e.target.checked ? "Emergency" : opt.overrideUrgency,
                                  })
                                }
                                className="rounded text-rose-600 focus:ring-rose-500"
                              />
                              <span className="text-rose-700 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Critical Red-Flag Trigger
                              </span>
                            </label>
                            <span className="text-[11px] text-slate-400">
                              (Elevates patient immediately to Emergency priority)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Numeric Vital Thresholds with Urgency Points */}
                {selectedField.type === "vital_number" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Vital Sign Numerical Thresholds & Urgency Scores
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Define range cutoffs (Min to Max). When entered patient vital falls into a range, the points are mapped.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddThreshold}
                        className="px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Range</span>
                      </button>
                    </div>

                    <div className="w-48">
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        Measurement Unit
                      </label>
                      <input
                        type="text"
                        value={selectedField.vitalUnit || ""}
                        onChange={(e) => handleUpdateCurrentField({ vitalUnit: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                        placeholder="e.g. bpm, mmHg, %, °C, mmol/L"
                      />
                    </div>

                    <div className="space-y-2">
                      {selectedField.vitalThresholds?.map((thresh, tIdx) => (
                        <div
                          key={thresh.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-4">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Classification Label
                              </label>
                              <input
                                type="text"
                                value={thresh.label}
                                onChange={(e) => handleUpdateThreshold(thresh.id, { label: e.target.value })}
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
                                placeholder="e.g. Moderate Hypotension"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Min ({selectedField.vitalUnit || "val"})
                              </label>
                              <input
                                type="number"
                                value={thresh.min ?? ""}
                                onChange={(e) =>
                                  handleUpdateThreshold(thresh.id, {
                                    min: e.target.value === "" ? undefined : parseFloat(e.target.value),
                                  })
                                }
                                placeholder="None (≤ Max)"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Max ({selectedField.vitalUnit || "val"})
                              </label>
                              <input
                                type="number"
                                value={thresh.max ?? ""}
                                onChange={(e) =>
                                  handleUpdateThreshold(thresh.id, {
                                    max: e.target.value === "" ? undefined : parseFloat(e.target.value),
                                  })
                                }
                                placeholder="None (≥ Min)"
                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
                              />
                            </div>

                            <div className="sm:col-span-1">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Score
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="15"
                                value={thresh.score}
                                onChange={(e) =>
                                  handleUpdateThreshold(thresh.id, {
                                    score: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs font-bold text-center bg-white border border-slate-200 rounded-lg text-slate-900"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                                Override
                              </label>
                              <select
                                value={thresh.overrideUrgency || ""}
                                onChange={(e) =>
                                  handleUpdateThreshold(thresh.id, {
                                    overrideUrgency: (e.target.value as TriageUrgencyLevel) || undefined,
                                  })
                                }
                                className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800"
                              >
                                <option value="">None</option>
                                <option value="Priority">Priority</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Emergency">Emergency</option>
                              </select>
                            </div>

                            <div className="sm:col-span-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleDeleteThreshold(thresh.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white"
                                title="Remove range"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 text-xs">
                            <label className="flex items-center gap-1.5 text-slate-700 font-semibold cursor-pointer">
                              <input
                                type="checkbox"
                                checked={thresh.isRedFlag || false}
                                onChange={(e) =>
                                  handleUpdateThreshold(thresh.id, {
                                    isRedFlag: e.target.checked,
                                    overrideUrgency: e.target.checked ? "Emergency" : thresh.overrideUrgency,
                                  })
                                }
                                className="rounded text-rose-600 focus:ring-rose-500"
                              />
                              <span className="text-rose-700 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Mark as Critical Red-Flag Threshold
                              </span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Boolean Red-Flag Settings */}
                {selectedField.type === "boolean_flag" && (
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 space-y-3">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Immediate Red-Flag Clinical Discriminator</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      When checked during patient assessment, this field immediately escalates the patient to
                      <strong> Emergency Status (Red / Resuscitation)</strong> regardless of other scores.
                    </p>
                    <div className="w-48">
                      <label className="block text-[10px] font-semibold text-rose-900 mb-0.5">
                        Urgency Points Weight
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={selectedField.defaultScore ?? 4}
                        onChange={(e) =>
                          handleUpdateCurrentField({ defaultScore: parseInt(e.target.value) || 4 })
                        }
                        className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-rose-300 rounded-lg text-rose-900"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                <p className="text-sm font-semibold">Select a field from the left column to configure its mapping</p>
                <p className="text-xs mt-1">Or click "Add Custom Field" to create a new question</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: TRIAGE URGENCY SCORE THRESHOLDS */}
      {activeSettingsTab === "scoring" && (
        <div className="p-6 max-w-3xl space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-sm font-bold text-slate-900">Urgency Tier Score Calibration</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure the numerical point score boundaries that translate questionnaire responses into
              standard emergency triage tiers (South African Triage Scale / Emergency Severity Index).
            </p>
          </div>

          <div className="space-y-4">
            {/* Green Tier: Routine */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Routine / Non-Urgent (Green)
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Mild symptoms, stable vitals. Standard ambulatory queue (Target wait: up to 180-240 mins).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-600 font-medium">Max Score:</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={formData.thresholds.routineMax}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        routineMax: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-16 px-2.5 py-1.5 text-xs font-bold text-center bg-white border border-emerald-300 rounded-lg text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <span className="text-xs text-slate-500 font-mono">pts (0 to {formData.thresholds.routineMax})</span>
              </div>
            </div>

            {/* Yellow Tier: Priority */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-amber-500 mt-1 shrink-0"></span>
                <div>
                  <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Priority / Moderate (Yellow)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Moderate distress, potentially deteriorating condition (Target wait: within 60 mins).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-600 font-medium">Max Score:</span>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.thresholds.priorityMax}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        priorityMax: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-16 px-2.5 py-1.5 text-xs font-bold text-center bg-white border border-amber-300 rounded-lg text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="text-xs text-slate-500 font-mono">
                  pts ({formData.thresholds.routineMax + 1} to {formData.thresholds.priorityMax})
                </span>
              </div>
            </div>

            {/* Orange Tier: Urgent */}
            <div className="p-4 rounded-xl border border-orange-200 bg-orange-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-orange-500 mt-1 shrink-0"></span>
                <div>
                  <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider">
                    Urgent / High Priority (Orange)
                  </h4>
                  <p className="text-xs text-orange-800 mt-0.5">
                    Severe pain, significant physiologic disturbance (Target wait: within 10-15 mins).
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-600 font-medium">Max Score:</span>
                <input
                  type="number"
                  min="2"
                  max="40"
                  value={formData.thresholds.urgentMax}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      thresholds: {
                        ...prev.thresholds,
                        urgentMax: parseInt(e.target.value) || 0,
                      },
                    }))
                  }
                  className="w-16 px-2.5 py-1.5 text-xs font-bold text-center bg-white border border-orange-300 rounded-lg text-orange-950 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
                <span className="text-xs text-slate-500 font-mono">
                  pts ({formData.thresholds.priorityMax + 1} to {formData.thresholds.urgentMax})
                </span>
              </div>
            </div>

            {/* Red Tier: Emergency */}
            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="w-4 h-4 rounded-full bg-rose-600 mt-1 shrink-0 animate-pulse"></span>
                <div>
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                    Resuscitation / Emergency (Red)
                  </h4>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Score &gt; {formData.thresholds.urgentMax} OR any triggered Critical Red-Flag discriminator (Immediate attention, 0 min wait).
                  </p>
                </div>
              </div>
              <div className="text-xs font-mono font-bold text-rose-700 bg-white px-3 py-1.5 rounded-lg border border-rose-200 shadow-2xs">
                Score &gt; {formData.thresholds.urgentMax} or Red-Flag
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p>
              <strong>Safety Override Guarantee:</strong> If any single clinical question triggers a designated
              "Critical Red Flag" (e.g. unresponsiveness, acute ST-elevation, unprovoked stridor), the patient is
              automatically classified as <strong>Emergency (Red)</strong> regardless of the numerical total.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PROTOCOL DETAILS & METADATA */}
      {activeSettingsTab === "meta" && (
        <div className="p-6 max-w-2xl space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Protocol Information & Specialty Alignment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign administrative details, target clinical demographics, and clinical audit citations.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Protocol Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department / Service Unit
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900"
                  placeholder="e.g. Cardiology, Emergency, Pediatrics"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Demographic
                </label>
                <select
                  value={formData.targetDemographic}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      targetDemographic: e.target.value as "Adult" | "Pediatric" | "Geriatric" | "All",
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900"
                >
                  <option value="Adult">Adult (≥ 16 years)</option>
                  <option value="Pediatric">Pediatric (&lt; 16 years)</option>
                  <option value="Geriatric">Geriatric (≥ 65 years)</option>
                  <option value="All">All Demographics</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Author / Supervising Clinician
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Protocol Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Clinical Citation / Guideline Reference
              </label>
              <input
                type="text"
                value={formData.clinicalProtocolReference || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, clinicalProtocolReference: e.target.value }))
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900"
                placeholder="e.g. SATS v2024 / NICE NG143 / ESC NSTE-ACS Guidelines"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Active Protocol (Available for Patient Triage Intake)</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
