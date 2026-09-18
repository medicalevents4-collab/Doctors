import React, { useState } from "react";
import {
  Bell,
  X,
  AlertTriangle,
  Clock,
  Send,
  CheckCircle2,
  Phone,
  Mail,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Filter,
  Download,
  Sparkles,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Eye,
  Check
} from "lucide-react";
import { OverduePaymentNotification } from "../../types";

interface OverdueNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: OverduePaymentNotification[];
  onOpenReminderModal: (notification: OverduePaymentNotification) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  onSnoozeNotification: (notificationId: string) => void;
  onInspectInvoice: (docNumber: string) => void;
  onSimulateNewOverdue: () => void;
  onSendBulkReminders: () => void;
}

export const OverdueNotificationDrawer: React.FC<OverdueNotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onOpenReminderModal,
  onMarkAsPaid,
  onSnoozeNotification,
  onInspectInvoice,
  onSimulateNewOverdue,
  onSendBulkReminders,
}) => {
  const [filterUrgency, setFilterUrgency] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  if (!isOpen) return null;

  const activeCount = notifications.filter(
    (n) => n.status === "PENDING_ACTION" || n.status === "REMINDER_SENT"
  ).length;

  const totalOutstanding = notifications
    .filter((n) => n.status === "PENDING_ACTION" || n.status === "REMINDER_SENT")
    .reduce((sum, n) => sum + n.amount, 0);

  const filteredNotifications = notifications.filter((n) => {
    if (filterUrgency === "CRITICAL" && n.urgency !== "CRITICAL") return false;
    if (filterUrgency === "HIGH" && n.urgency !== "HIGH") return false;
    if (filterUrgency === "MODERATE" && n.urgency !== "MODERATE") return false;
    if (filterUrgency === "RESOLVED" && n.status !== "RESOLVED") return false;
    if (filterUrgency === "ACTIVE" && n.status === "RESOLVED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.patientName.toLowerCase().includes(q) ||
        n.docNumber.toLowerCase().includes(q) ||
        n.procedureDescription.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const handleExportCsv = () => {
    const headers = "Document,Patient,Phone,Email,Amount,DueDate,DaysOverdue,Urgency,Status\n";
    const rows = notifications
      .map(
        (n) =>
          `"${n.docNumber}","${n.patientName}","${n.patientPhone}","${n.patientEmail}","${n.amount}","${n.dueDate}","${n.daysOverdue}","${n.urgency}","${n.status}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Overdue_Accounts_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 bg-rose-950 text-rose-400 rounded-xl border border-rose-800/60">
              <Bell className="w-5 h-5" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Overdue Payments Monitor</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-900/60 text-rose-300 border border-rose-700/60 font-mono">
                  &gt;30 Days
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Real-Time Engine Active
                </span>
                <span>•</span>
                <span>Scanned 2 min ago</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Summary KPI Bar */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-950/60 border-b border-slate-800/80 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Overdue Outstanding</span>
            <span className="text-sm sm:text-base font-bold text-amber-400 font-mono">
              ${totalOutstanding.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">{activeCount} accounts</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Critical Risk (&gt;90d)</span>
            <span className="text-sm sm:text-base font-bold text-rose-400 font-mono">
              {notifications.filter((n) => n.urgency === "CRITICAL" && n.status !== "RESOLVED").length} Accounts
            </span>
            <span className="text-[10px] text-rose-400/80 block mt-0.5">Legal liaison step</span>
          </div>

          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] block">Settled Today</span>
            <span className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
              {notifications.filter((n) => n.status === "RESOLVED").length} Paid
            </span>
            <span className="text-[10px] text-emerald-400/80 block mt-0.5">Cleared to ledger</span>
          </div>
        </div>

        {/* Quick Simulation & Bulk Actions Toolbar */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="btn-simulate-new-overdue"
              onClick={onSimulateNewOverdue}
              className="px-2.5 py-1.5 bg-teal-950 hover:bg-teal-900 text-teal-300 border border-teal-700/60 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1"
              title="Inject a newly overdue account to test real-time notification alerts"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Simulate Overdue (&gt;30d)</span>
            </button>

            <button
              type="button"
              id="btn-bulk-reminders-drawer"
              onClick={onSendBulkReminders}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-semibold text-[11px] transition-colors flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5 text-teal-400" />
              <span>Bulk Remind</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-2 py-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 text-[11px] font-medium flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            { id: "ALL", label: `All (${notifications.length})` },
            { id: "ACTIVE", label: `Active (${activeCount})` },
            { id: "CRITICAL", label: "Critical (>90d)" },
            { id: "HIGH", label: "High (61-90d)" },
            { id: "MODERATE", label: "Grace (31-60d)" },
            { id: "RESOLVED", label: "Resolved" },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterUrgency(f.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filterUrgency === f.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/60" />
              <p className="text-sm font-semibold text-slate-300">No overdue accounts in this view</p>
              <p className="text-xs text-slate-500 mt-1">All patient payments are within compliant terms.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isCritical = notif.urgency === "CRITICAL";
              const isHigh = notif.urgency === "HIGH";
              const isResolved = notif.status === "RESOLVED";

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved
                      ? "bg-slate-950/40 border-slate-800 opacity-70"
                      : isCritical
                      ? "bg-slate-900/90 border-rose-600/70 shadow-lg shadow-rose-950/20"
                      : isHigh
                      ? "bg-slate-900/90 border-orange-600/60 shadow-md"
                      : "bg-slate-900/90 border-amber-600/50"
                  }`}
                >
                  {/* Top Row: Urgency Badge, Days Overdue, Amount */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isResolved
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                            : isCritical
                            ? "bg-rose-950 text-rose-300 border border-rose-700/80"
                            : isHigh
                            ? "bg-orange-950 text-orange-300 border border-orange-700/80"
                            : "bg-amber-950 text-amber-300 border border-amber-700/80"
                        }`}
                      >
                        {!isResolved && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCritical ? "bg-rose-400 animate-ping" : "bg-amber-400"
                            }`}
                          ></span>
                        )}
                        {isResolved
                          ? "Resolved / Paid"
                          : `${notif.daysOverdue} Days Overdue (${notif.urgency})`}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-300">
                        {notif.docNumber}
                      </span>
                    </div>

                    <span className="text-base font-bold font-mono text-white">
                      ${notif.amount.toFixed(2)}
                    </span>
                  </div>

                  {/* Middle: Patient Demographics & Procedure */}
                  <div className="space-y-1 mb-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{notif.patientName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Due: {notif.dueDate}
                      </span>
                    </div>

                    <p className="text-slate-300 text-xs line-clamp-2">
                      {notif.procedureDescription}
                    </p>

                    {notif.medicalAidName && (
                      <div className="text-[11px] text-teal-400 flex items-center gap-1">
                        <span className="text-slate-400">Medical Scheme:</span>
                        <span>{notif.medicalAidName}</span>
                      </div>
                    )}
                  </div>

                  {/* Audit Trail Snippet if any */}
                  {notif.auditLog.length > 0 && (
                    <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-400 mb-3 space-y-0.5">
                      <span className="font-semibold text-slate-300 block">Latest Action:</span>
                      <div className="flex items-center justify-between">
                        <span>{notif.auditLog[notif.auditLog.length - 1].action}</span>
                        <span className="font-mono text-[10px]">
                          {notif.auditLog[notif.auditLog.length - 1].timestamp}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => onInspectInvoice(notif.docNumber)}
                      className="text-xs text-slate-400 hover:text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <span>Inspect</span>
                    </button>

                    <div className="flex items-center gap-1.5 ml-auto">
                      {!isResolved ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onSnoozeNotification(notif.id)}
                            className="px-2.5 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            Snooze 7d
                          </button>

                          <button
                            type="button"
                            onClick={() => onMarkAsPaid(notif.invoiceId)}
                            className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all"
                            title="Record payment collected in full"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Paid</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenReminderModal(notif)}
                            className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Remind</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Payment Reconciled</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>POPIA & HPCSA Debt Recovery Compliant</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-xs transition-colors"
          >
            Close Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
