import React, { useState } from "react";
import { CompletedPatientTriageAssessment, TriageUrgencyLevel } from "../../types";
import {
  Clock,
  User,
  AlertTriangle,
  FileText,
  Search,
  CheckCircle2,
  ChevronRight,
  Printer,
  X,
  Activity,
  Send,
} from "lucide-react";

interface TriageHistoryQueueProps {
  assessments: CompletedPatientTriageAssessment[];
  onReferSpecialist?: (assessment: CompletedPatientTriageAssessment) => void;
}

export const TriageHistoryQueue: React.FC<TriageHistoryQueueProps> = ({
  assessments,
  onReferSpecialist,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [selectedAssessment, setSelectedAssessment] = useState<CompletedPatientTriageAssessment | null>(null);

  const filtered = assessments.filter((item) => {
    const matchesQuery =
      item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chiefComplaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.templateTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assessedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUrgency = urgencyFilter === "all" || item.result.assignedUrgency === urgencyFilter;

    return matchesQuery && matchesUrgency;
  });

  const getUrgencyPill = (urgency: TriageUrgencyLevel) => {
    switch (urgency) {
      case "Emergency":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "Urgent":
        return "bg-orange-100 text-orange-800 border-orange-300 font-bold";
      case "Priority":
        return "bg-amber-100 text-amber-800 border-amber-300 font-bold";
      case "Routine":
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search triaged patient or complaint..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-900"
            />
          </div>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">All Urgencies</option>
            <option value="Emergency">Emergency (Red)</option>
            <option value="Urgent">Urgent (Orange)</option>
            <option value="Priority">Priority (Yellow)</option>
            <option value="Routine">Routine (Green)</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {assessments.length} triage logs
        </span>
      </div>

      {/* Assessment Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Patient / Demographics</th>
                <th className="py-3 px-4">Chief Complaint & Protocol</th>
                <th className="py-3 px-4">Assigned Urgency</th>
                <th className="py-3 px-4">Score / Red Flags</th>
                <th className="py-3 px-4">Disposition</th>
                <th className="py-3 px-4">Assessed By & Time</th>
                <th className="py-3 px-4 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((record) => {
                const urgencyStyle = getUrgencyPill(record.result.assignedUrgency);

                return (
                  <tr
                    key={record.id}
                    onClick={() => setSelectedAssessment(record)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{record.patientName}</div>
                      <div className="text-[11px] text-slate-400">
                        {record.patientAge}y, {record.patientGender}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-slate-800 truncate" title={record.chiefComplaint}>
                        {record.chiefComplaint}
                      </div>
                      <div className="text-[10px] text-teal-600 font-semibold truncate">
                        {record.templateTitle}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] ${urgencyStyle}`}>
                        {record.result.isEmergencyOverride && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        <span>{record.result.assignedUrgency}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">
                        {record.result.totalScore} pts
                      </div>
                      {record.result.triggeredRedFlags.length > 0 ? (
                        <div className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          <span>{record.result.triggeredRedFlags.length} Red-Flags</span>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400 font-medium">Standard Score</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                        {record.disposition}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{record.assessedBy}</div>
                      <div className="text-[10px] text-slate-400">{record.assessedAt}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAssessment(record);
                        }}
                        className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        title="View detailed triage breakdown"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / DRAWER */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase">
                  Triage Audit Record #{selectedAssessment.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedAssessment.patientName} — {selectedAssessment.patientAge}y, {selectedAssessment.patientGender}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssessment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Assessment Urgency Banner */}
            <div className="p-4 rounded-xl border flex items-center justify-between gap-4 bg-slate-50 border-slate-200">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Assigned Urgency Category
                </span>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-xl text-xs font-black uppercase ${getUrgencyPill(
                    selectedAssessment.result.assignedUrgency
                  )}`}
                >
                  {selectedAssessment.result.assignedUrgency}
                </span>
                <span className="text-xs font-mono ml-2 text-slate-500 font-semibold">
                  ({selectedAssessment.result.triageCategoryCode})
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Score</span>
                <span className="text-2xl font-black text-slate-900">
                  {selectedAssessment.result.totalScore} pts
                </span>
              </div>
            </div>

            {/* Red Flags Alert in Modal */}
            {selectedAssessment.result.triggeredRedFlags.length > 0 && (
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 space-y-1.5">
                <span className="text-xs font-bold flex items-center gap-1.5 text-rose-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Immediate Red-Flag Clinical Discriminators Triggered</span>
                </span>
                <ul className="text-xs list-disc pl-5 space-y-1 text-rose-900 font-medium">
                  {selectedAssessment.result.triggeredRedFlags.map((rf, idx) => (
                    <li key={idx}>
                      <strong>{rf.fieldLabel}:</strong> {rf.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Chief Complaint & Clinical Notes */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-slate-700 block">Chief Complaint:</span>
                <p className="text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {selectedAssessment.chiefComplaint}
                </p>
              </div>

              {selectedAssessment.clinicalNotes && (
                <div>
                  <span className="font-bold text-slate-700 block">Clinician Assessment Notes:</span>
                  <p className="text-slate-800 mt-0.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedAssessment.clinicalNotes}
                  </p>
                </div>
              )}
            </div>

            {/* Questionnaire Itemized Breakdown */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Itemized Questionnaire Findings & Scoring Audit
              </span>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2 text-xs">
                {selectedAssessment.result.fieldContributions.map((fc, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                    <span className="font-medium text-slate-800">{fc.fieldLabel}</span>
                    <span className="font-mono font-bold text-teal-700">{fc.detail}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Protocol Actions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                Recommended Clinical Directives
              </span>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-xs space-y-1.5">
                {selectedAssessment.result.recommendedActions.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer metadata & buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
              <div className="text-slate-400">
                Logged by: <strong className="text-slate-600">{selectedAssessment.assessedBy}</strong> at{" "}
                {selectedAssessment.assessedAt}
              </div>

              <div className="flex items-center gap-2">
                {onReferSpecialist && (
                  <button
                    type="button"
                    onClick={() => {
                      onReferSpecialist(selectedAssessment);
                      setSelectedAssessment(null);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Refer Specialist</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
