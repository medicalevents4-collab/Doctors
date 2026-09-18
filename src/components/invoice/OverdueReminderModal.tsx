import React, { useState } from "react";
import {
  Send,
  X,
  MessageSquare,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Phone,
  FileText
} from "lucide-react";
import { OverduePaymentNotification } from "../../types";

interface OverdueReminderModalProps {
  notification: OverduePaymentNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onSendReminder: (notificationId: string, channel: "whatsapp" | "sms" | "email", customMessage: string) => void;
}

export const OverdueReminderModal: React.FC<OverdueReminderModalProps> = ({
  notification,
  isOpen,
  onClose,
  onSendReminder,
}) => {
  if (!isOpen || !notification) return null;

  const [channel, setChannel] = useState<"whatsapp" | "sms" | "email">("whatsapp");
  const [includeInterestNotice, setIncludeInterestNotice] = useState<boolean>(
    notification.urgency === "CRITICAL"
  );

  const defaultTemplate = `Dear ${notification.patientName},\n\nThis is a friendly reminder from Metro Medical Center regarding your outstanding invoice ${notification.docNumber} for ${notification.procedureDescription}.\n\n• Outstanding Balance: $${notification.amount.toFixed(2)} USD\n• Days Overdue: ${notification.daysOverdue} days (Due Date: ${notification.dueDate})\n\nPlease settle this account securely via our Patient Portal payment link: https://portal.metromedical.org/pay/${notification.docNumber}\n\nThank you for your prompt attention.\nMetro Medical Billing Office (Tel: +27 11 555 0192)`;

  const [messageText, setMessageText] = useState(defaultTemplate);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    onSendReminder(notification.id, channel, messageText);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950 text-amber-400 rounded-xl border border-amber-800/60">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Dispatch Overdue Payment Reminder
              </h3>
              <p className="text-xs text-slate-400">
                Automated notice for account {notification.docNumber} ({notification.daysOverdue}d overdue)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSend} className="p-5 space-y-4">
          {/* Patient & Overdue Summary Card */}
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Recipient</span>
              <span className="text-sm font-bold text-white">{notification.patientName}</span>
              <span className="text-[11px] text-slate-400 block">
                {notification.patientPhone} • {notification.patientEmail}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Overdue Amount</span>
              <span className="text-base font-bold font-mono text-amber-400">
                ${notification.amount.toFixed(2)}
              </span>
              <span className="text-[10px] text-rose-400 font-semibold block">
                {notification.daysOverdue} Days Late
              </span>
            </div>
          </div>

          {/* Delivery Channel Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Dispatch Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                  channel === "whatsapp"
                    ? "bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Bot</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                  channel === "sms"
                    ? "bg-teal-950/80 border-teal-500 text-teal-300 shadow-sm"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <Phone className="w-4 h-4 text-teal-400" />
                <span>Urgent SMS</span>
              </button>

              <button
                type="button"
                onClick={() => setChannel("email")}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 text-xs font-semibold ${
                  channel === "email"
                    ? "bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-sm"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>Official Email</span>
              </button>
            </div>
          </div>

          {/* Message Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Reminder Message Preview
              </label>
              <span className="text-[10px] text-slate-400">Variable-substituted</span>
            </div>
            <textarea
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500 leading-relaxed font-sans"
            />
          </div>

          {/* Compliance & Audit Footer */}
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              This notification will be logged to the HPCSA billing audit trail with cryptographic timestamp.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-send-reminder"
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Overdue Notice</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
