import React from "react";
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Send,
  X,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { OverduePaymentNotification } from "../../types";

interface OverdueAlertBannerProps {
  notifications: OverduePaymentNotification[];
  onOpenNotificationCenter: () => void;
  onSendBulkReminders: () => void;
  onDismiss: () => void;
}

export const OverdueAlertBanner: React.FC<OverdueAlertBannerProps> = ({
  notifications,
  onOpenNotificationCenter,
  onSendBulkReminders,
  onDismiss,
}) => {
  const pendingNotifications = notifications.filter(
    (n) => n.status === "PENDING_ACTION" || n.status === "REMINDER_SENT"
  );

  if (pendingNotifications.length === 0) return null;

  const totalOverdueAmount = pendingNotifications.reduce((acc, n) => acc + n.amount, 0);
  const criticalCount = pendingNotifications.filter((n) => n.urgency === "CRITICAL").length;
  const highCount = pendingNotifications.filter((n) => n.urgency === "HIGH").length;
  const moderateCount = pendingNotifications.filter((n) => n.urgency === "MODERATE").length;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-amber-950 border border-rose-800/60 p-4 sm:p-5 text-white shadow-lg animate-in fade-in select-none">
      {/* Subtle pulse background aura */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Alert Icon & Message */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-600/90 text-white rounded-xl shadow-md shrink-0 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                Billing Compliance Alert: &gt;30 Days Overdue
              </span>
              <span className="text-xs text-slate-400">
                • Real-Time Ledger Monitor Active
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
              {pendingNotifications.length} Patient Accounts Have Payments Overdue by &gt;30 Days
            </h3>

            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Total outstanding balance:{" "}
              <strong className="text-amber-300 font-mono font-bold">
                ${totalOverdueAmount.toFixed(2)} USD
              </strong>
              . Prompt follow-up is recommended under HPCSA & Medical Scheme co-payment guidelines.
            </p>

            {/* Urgency breakdown chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5 text-[11px]">
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-rose-900/60 text-rose-200 border border-rose-700/60 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  {criticalCount} Critical (&gt;90d)
                </span>
              )}
              {highCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-orange-900/60 text-orange-200 border border-orange-700/60 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                  {highCount} High (61-90d)
                </span>
              )}
              {moderateCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-900/60 text-amber-200 border border-amber-700/60 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  {moderateCount} Grace (31-60d)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            type="button"
            id="btn-open-overdue-center-banner"
            onClick={onOpenNotificationCenter}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-950/50 flex items-center gap-1.5"
          >
            <span>Review Overdue Accounts ({pendingNotifications.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="btn-bulk-reminders-banner"
            onClick={onSendBulkReminders}
            className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Bulk Remind</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            title="Dismiss Alert Bar"
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
