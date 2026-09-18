import React, { useState } from "react";
import {
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  GripVertical,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Plus,
  Flame,
  Search,
  Filter,
  MoveRight,
  Check,
  ChevronDown
} from "lucide-react";
import { ReferralSummary } from "../../types";

interface ReferralKanbanBoardProps {
  referrals: ReferralSummary[];
  onStatusChange: (referralId: string, newStatus: ReferralSummary["status"]) => void;
  onSelectReferral: (referral: ReferralSummary) => void;
  onOpenTriage: (referral: ReferralSummary) => void;
  onCreateNewReferral: () => void;
}

type StageType = "Pending" | "Accepted" | "Consulted" | "Completed";

interface ColumnDef {
  id: StageType;
  title: string;
  subtitle: string;
  badgeColor: string;
  headerBg: string;
  borderColor: string;
  accentDot: string;
}

const COLUMNS: ColumnDef[] = [
  {
    id: "Pending",
    title: "Pending",
    subtitle: "Awaiting Specialist Review",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    headerBg: "bg-amber-50/50",
    borderColor: "border-amber-200",
    accentDot: "bg-amber-500",
  },
  {
    id: "Accepted",
    title: "Accepted",
    subtitle: "Consultation Scheduled",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    headerBg: "bg-blue-50/50",
    borderColor: "border-blue-200",
    accentDot: "bg-blue-500",
  },
  {
    id: "Consulted",
    title: "Consulted",
    subtitle: "Clinical Encounter Concluded",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    headerBg: "bg-purple-50/50",
    borderColor: "border-purple-200",
    accentDot: "bg-purple-500",
  },
  {
    id: "Completed",
    title: "Completed",
    subtitle: "Return Clinical Report Dispatched",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    headerBg: "bg-emerald-50/50",
    borderColor: "border-emerald-200",
    accentDot: "bg-emerald-500",
  },
];

export const ReferralKanbanBoard: React.FC<ReferralKanbanBoardProps> = ({
  referrals,
  onStatusChange,
  onSelectReferral,
  onOpenTriage,
  onCreateNewReferral,
}) => {
  const [draggedReferralId, setDraggedReferralId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<StageType | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [quickNotification, setQuickNotification] = useState<string | null>(null);

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggedReferralId(id);
  };

  const handleDragEnd = () => {
    setDraggedReferralId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: StageType) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverColumn !== stageId) {
      setDragOverColumn(stageId);
    }
  };

  const handleDragLeave = (stageId: StageType) => {
    if (dragOverColumn === stageId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: StageType) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggedReferralId;
    if (!id) return;

    const ref = referrals.find((r) => r.id === id);
    if (ref && ref.status !== targetStage) {
      onStatusChange(id, targetStage);
      showNotification(`Moved "${ref.patientName}" to ${targetStage}`);
    }

    setDraggedReferralId(null);
    setDragOverColumn(null);
  };

  const showNotification = (msg: string) => {
    setQuickNotification(msg);
    setTimeout(() => {
      setQuickNotification(null);
    }, 3000);
  };

  // Stage step advancement helper
  const getNextStage = (current: StageType): StageType | null => {
    if (current === "Pending") return "Accepted";
    if (current === "Accepted") return "Consulted";
    if (current === "Consulted") return "Completed";
    return null;
  };

  // Filtered referrals
  const filteredReferrals = referrals.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.specialistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.clinicalSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.specialty.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesUrgency =
      urgencyFilter === "All" || r.urgency === urgencyFilter;

    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {quickNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{quickNotification}</span>
        </div>
      )}

      {/* Kanban Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 pl-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Urgency:</span>
          </span>
          {["All", "Emergency", "Urgent", "Routine"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setUrgencyFilter(lvl)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                urgencyFilter === lvl
                  ? lvl === "Emergency"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : lvl === "Urgent"
                    ? "bg-amber-600 text-white shadow-2xs"
                    : "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search in board..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={onCreateNewReferral}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shadow-2xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Referral</span>
          </button>
        </div>
      </div>

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colReferrals = filteredReferrals.filter(
            (r) => r.status === col.id
          );
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-xl border transition-all duration-150 flex flex-col min-h-[500px] ${
                isOver
                  ? "border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md"
                  : "border-slate-200 bg-slate-50/50"
              }`}
            >
              {/* Column Header */}
              <div
                className={`p-3.5 rounded-t-xl border-b border-slate-200 flex items-center justify-between ${col.headerBg}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.accentDot}`} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-xs text-slate-900">
                        {col.title}
                      </h4>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${col.badgeColor}`}
                      >
                        {colReferrals.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {col.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column Cards Container */}
              <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto">
                {colReferrals.length === 0 ? (
                  <div
                    className={`h-36 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-colors ${
                      isOver
                        ? "border-blue-400 bg-blue-50/80 text-blue-700"
                        : "border-slate-200 text-slate-400"
                    }`}
                  >
                    <p className="text-[11px] font-medium">
                      {isOver ? "Release to drop referral here" : "No referrals in this stage"}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Drag cards here to update status
                    </span>
                  </div>
                ) : (
                  colReferrals.map((ref) => {
                    const isBeingDragged = draggedReferralId === ref.id;
                    const nextStage = getNextStage(ref.status);

                    return (
                      <div
                        key={ref.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, ref.id)}
                        onDragEnd={handleDragEnd}
                        className={`group bg-white rounded-xl border p-3.5 transition-all shadow-2xs hover:shadow-xs cursor-grab active:cursor-grabbing select-none ${
                          isBeingDragged
                            ? "opacity-40 border-blue-400 scale-98 ring-2 ring-blue-400/30"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {/* Top: Grip Handle, Patient & Urgency Badge */}
                        <div className="flex items-start justify-between gap-1.5 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-slate-300 group-hover:text-slate-400 transition-colors">
                              <GripVertical className="w-3.5 h-3.5" />
                            </span>
                            <div className="truncate">
                              <h5 className="font-bold text-xs text-slate-900 truncate">
                                {ref.patientName}
                              </h5>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {ref.createdAt}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shrink-0 flex items-center gap-1 ${
                              ref.urgency === "Emergency"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : ref.urgency === "Urgent"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {ref.urgency === "Emergency" && (
                              <Flame className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                            )}
                            <span>{ref.urgency}</span>
                          </span>
                        </div>

                        {/* Specialist & Specialty */}
                        <div className="my-2 space-y-1 text-[11px]">
                          <div>
                            <span className="text-slate-400 text-[10px] block">
                              Target Specialist
                            </span>
                            <p className="font-semibold text-slate-800 truncate">
                              {ref.specialistName}
                            </p>
                          </div>
                        </div>

                        {/* Clinical Summary Snippet */}
                        <p className="text-[11px] text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100 line-clamp-2 leading-relaxed">
                          {ref.clinicalSummary}
                        </p>

                        {/* Diagnostic Attachments Pill */}
                        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            <span>{ref.attachmentCount} Encrypted Diagnostics</span>
                          </div>

                          {/* Quick AI Triage Trigger */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenTriage(ref);
                            }}
                            className="p-1 rounded text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition-colors"
                            title="Audit with AI Triage Assistant"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="flex items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => onSelectReferral(ref)}
                            className="text-[10px] font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                          >
                            View Details
                          </button>

                          {/* Quick Advance Button */}
                          {nextStage && (
                            <button
                              onClick={() => {
                                onStatusChange(ref.id, nextStage);
                                showNotification(
                                  `Advanced "${ref.patientName}" to ${nextStage}`
                                );
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded text-[10px] font-bold transition-colors flex items-center gap-1"
                              title={`Advance to ${nextStage}`}
                            >
                              <span>{nextStage}</span>
                              <MoveRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
