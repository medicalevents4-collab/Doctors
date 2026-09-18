import React, { useState } from "react";
import { TriageFormTemplate } from "../../types";
import {
  FileText,
  Plus,
  Play,
  Edit3,
  Copy,
  Trash2,
  Search,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
} from "lucide-react";

interface TriageProtocolDirectoryProps {
  templates: TriageFormTemplate[];
  onSelectTemplateToRun: (template: TriageFormTemplate) => void;
  onSelectTemplateToEdit: (template: TriageFormTemplate) => void;
  onCreateNewTemplate: () => void;
  onDuplicateTemplate: (template: TriageFormTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
}

export const TriageProtocolDirectory: React.FC<TriageProtocolDirectoryProps> = ({
  templates,
  onSelectTemplateToRun,
  onSelectTemplateToEdit,
  onCreateNewTemplate,
  onDuplicateTemplate,
  onDeleteTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [demographicFilter, setDemographicFilter] = useState("all");

  const departments = Array.from(new Set(templates.map((t) => t.department)));

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.clinicalProtocolReference?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = departmentFilter === "all" || tpl.department === departmentFilter;
    const matchesDemo =
      demographicFilter === "all" ||
      tpl.targetDemographic === demographicFilter ||
      tpl.targetDemographic === "All";

    return matchesSearch && matchesDept && matchesDemo;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter & Creation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questionnaires..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
            />
          </div>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Demographic Filter */}
          <select
            value={demographicFilter}
            onChange={(e) => setDemographicFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">All Demographics</option>
            <option value="Adult">Adult</option>
            <option value="Pediatric">Pediatric</option>
            <option value="Geriatric">Geriatric</option>
          </select>
        </div>

        {/* Create Protocol Button */}
        <button
          type="button"
          onClick={onCreateNewTemplate}
          className="w-full md:w-auto px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Clinical Questionnaire</span>
        </button>
      </div>

      {/* Protocols Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tpl) => {
          const redFlagFieldCount = tpl.fields.filter(
            (f) =>
              f.type === "boolean_flag" ||
              f.options?.some((o) => o.isRedFlag) ||
              f.vitalThresholds?.some((v) => v.isRedFlag)
          ).length;

          return (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-teal-300 hover:shadow-sm transition-all group"
            >
              <div className="space-y-3">
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase">
                    {tpl.department}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {tpl.targetDemographic}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">v{tpl.version}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                {/* Question and discriminator counts */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Questions</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Layers className="w-3 h-3 text-teal-600" />
                      {tpl.fields.length} Assessment Fields
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Red-Flags</span>
                    <span className="text-xs font-bold text-rose-700 flex items-center gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      {redFlagFieldCount} Trigger Rules
                    </span>
                  </div>
                </div>

                {/* Urgency Thresholds Pill */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span className="text-emerald-700 font-bold">Routine: ≤{tpl.thresholds.routineMax}</span>
                    <span className="text-amber-700 font-bold">Priority: ≤{tpl.thresholds.priorityMax}</span>
                    <span className="text-orange-700 font-bold">Urgent: ≤{tpl.thresholds.urgentMax}</span>
                    <span className="text-rose-700 font-bold">Emerg: &gt;{tpl.thresholds.urgentMax}</span>
                  </div>
                </div>

                {tpl.clinicalProtocolReference && (
                  <p className="text-[10px] text-slate-400 truncate italic">
                    Ref: {tpl.clinicalProtocolReference}
                  </p>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTemplateToRun(tpl)}
                  className="flex-1 py-2 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                  title="Launch patient questionnaire assessment"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Triage</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTemplateToEdit(tpl)}
                  className="p-2 text-slate-600 hover:text-teal-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                  title="Edit protocol questions and score mappings"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDuplicateTemplate(tpl)}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Clone as new template"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteTemplate(tpl.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Delete template"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
