import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Smartphone,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Calendar,
  Zap,
  Info
} from "lucide-react";

interface PendingMessage {
  id: string;
  recipientName: string;
  phone: string;
  type: "Appointment Reminder" | "E-Prescription Link" | "Referral Notification" | "Intake Confirmation";
  scheduledFor: string;
  status: "queued" | "sending" | "sent" | "failed";
  urgency: "Normal" | "High";
}

const INITIAL_PENDING_MESSAGES: PendingMessage[] = [
  {
    id: "wa-msg-101",
    recipientName: "James Miller",
    phone: "+27 82 451 9021",
    type: "Appointment Reminder",
    scheduledFor: "14:15 (T-15m)",
    status: "queued",
    urgency: "High",
  },
  {
    id: "wa-msg-102",
    recipientName: "Elena Rostova",
    phone: "+27 71 892 3341",
    type: "E-Prescription Link",
    scheduledFor: "15:00 (Post-Consult)",
    status: "queued",
    urgency: "Normal",
  },
  {
    id: "wa-msg-103",
    recipientName: "Robert Taylor",
    phone: "+27 83 234 5678",
    type: "Referral Notification",
    scheduledFor: "Immediate",
    status: "queued",
    urgency: "High",
  },
  {
    id: "wa-msg-104",
    recipientName: "Marcus Vance",
    phone: "+27 84 901 2345",
    type: "Appointment Reminder",
    scheduledFor: "16:00 (T-2h)",
    status: "queued",
    urgency: "Normal",
  },
];

export const WhatsAppIntegrationWidget: React.FC = () => {
  // Connection State
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "refreshing" | "degraded">("connected");
  const [latencyMs, setLatencyMs] = useState(34);
  const [lastSyncedTime, setLastSyncedTime] = useState("Just now");

  // Automated Appointment Reminders Switch
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Pending Messages State
  const [pendingQueue, setPendingQueue] = useState<PendingMessage[]>(INITIAL_PENDING_MESSAGES);
  const [showQueueDetails, setShowQueueDetails] = useState(false);
  const [isFlushingQueue, setIsFlushingQueue] = useState(false);

  // Test Ping Modal / State
  const [testNumber, setTestNumber] = useState("+27 82 451 9021");
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSentFeedback, setTestSentFeedback] = useState<string | null>(null);

  // Handle Refreshing Connection Status
  const handleRefreshConnection = () => {
    setConnectionStatus("refreshing");
    setTimeout(() => {
      setConnectionStatus("connected");
      setLatencyMs(Math.floor(28 + Math.random() * 15));
      const now = new Date();
      setLastSyncedTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`);
    }, 700);
  };

  // Toggle Automated Appointment Reminders
  const handleToggleReminders = () => {
    const nextState = !remindersEnabled;
    setRemindersEnabled(nextState);
    const msg = nextState 
      ? "Automated appointment reminders ENABLED (T-24h and T-2h intervals active)" 
      : "Automated appointment reminders PAUSED (manual doctor dispatch only)";
    setReminderToast(msg);
    setTimeout(() => setReminderToast(null), 3500);
  };

  // Dispatch individual message
  const handleSendSingleMessage = (msgId: string) => {
    setPendingQueue((prev) =>
      prev.map((msg) => (msg.id === msgId ? { ...msg, status: "sending" } : msg))
    );

    setTimeout(() => {
      setPendingQueue((prev) => prev.filter((msg) => msg.id !== msgId));
    }, 600);
  };

  // Flush all pending messages
  const handleFlushAll = () => {
    if (pendingQueue.length === 0) return;
    setIsFlushingQueue(true);

    setPendingQueue((prev) => prev.map((m) => ({ ...m, status: "sending" })));

    setTimeout(() => {
      setPendingQueue([]);
      setIsFlushingQueue(false);
      setReminderToast("All pending WhatsApp outbound messages dispatched to Meta Cloud API");
      setTimeout(() => setReminderToast(null), 3500);
    }, 1000);
  };

  // Send a test WhatsApp ping
  const handleSendTestPing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testNumber) return;
    setIsSendingTest(true);
    setTestSentFeedback(null);

    setTimeout(() => {
      setIsSendingTest(false);
      setTestSentFeedback(`Template 'appointment_reminder_v2' successfully sent to ${testNumber} (Message ID: wamid.HBgLM...81)`);
      setTimeout(() => setTestSentFeedback(null), 4000);
    }, 850);
  };

  return (
    <div 
      id="whatsapp-integration-widget" 
      className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all"
    >
      {/* Widget Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-900/5 via-slate-50/50 to-emerald-900/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                WhatsApp Business Integration
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Cloud API v20.0
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Two-way clinic communications, HSM templates & automated dispatch pipeline.
            </p>
          </div>
        </div>

        {/* Real-time Connection Status Pill & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div 
            id="wa-connection-status-pill"
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
              connectionStatus === "connected"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : connectionStatus === "refreshing"
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === "connected"
                  ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                  : connectionStatus === "refreshing"
                  ? "bg-amber-500 animate-spin"
                  : "bg-rose-500"
              }`}
            />
            <span>
              {connectionStatus === "connected"
                ? `Live • ${latencyMs}ms`
                : connectionStatus === "refreshing"
                ? "Pinging Meta Webhook..."
                : "Degraded"}
            </span>
          </div>

          <button
            id="btn-refresh-wa-connection"
            onClick={handleRefreshConnection}
            disabled={connectionStatus === "refreshing"}
            title="Ping Meta Graph API"
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${connectionStatus === "refreshing" ? "animate-spin text-teal-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Toast Notification for Setting Toggles or Flush */}
      {reminderToast && (
        <div className="px-5 py-2.5 bg-slate-900 text-white text-xs flex items-center justify-between transition-all animate-fadeIn">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{reminderToast}</span>
          </div>
          <button 
            onClick={() => setReminderToast(null)} 
            className="text-slate-400 hover:text-white text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Body Content */}
      <div className="p-4 sm:p-5 space-y-5">
        {/* Row 1: Connection Metrix & Appointment Reminder Toggle Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Automated Appointment Reminders Control Box */}
          <div 
            id="wa-automated-reminders-toggle-card"
            className={`p-4 rounded-xl border transition-all ${
              remindersEnabled 
                ? "bg-teal-50/40 border-teal-200" 
                : "bg-slate-50/60 border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-lg mt-0.5 ${remindersEnabled ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">
                      Automated Appointment Reminders
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      remindersEnabled ? "bg-teal-100 text-teal-800" : "bg-slate-200 text-slate-600"
                    }`}>
                      {remindersEnabled ? "ACTIVE" : "PAUSED"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Auto-sends interactive reminders <strong>24h</strong> & <strong>2h</strong> prior to consultation with one-tap [Confirm] and [Reschedule] action buttons.
                  </p>
                </div>
              </div>

              {/* Accessible Switch Toggle */}
              <button
                id="toggle-automated-reminders"
                type="button"
                role="switch"
                aria-checked={remindersEnabled}
                onClick={handleToggleReminders}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  remindersEnabled ? "bg-teal-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    remindersEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Interval Badges */}
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2 text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="font-semibold text-slate-700">Triggers:</span>
                  <span>T-24h & T-2h</span>
                </span>
                <span>•</span>
                <span>Confirmation Rate: <strong>94.2%</strong></span>
              </div>
              <span className={`font-semibold ${remindersEnabled ? "text-teal-700" : "text-slate-400"}`}>
                {remindersEnabled ? "Queue Syncing" : "Paused by Doctor"}
              </span>
            </div>
          </div>

          {/* Connection Details & Health Telemetry */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  <span>Meta Verified Gateway</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Sync: {lastSyncedTime}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block font-medium">Registered Sender</span>
                  <span className="font-semibold text-slate-900 block font-mono mt-0.5 truncate">
                    +27 11 982 4000
                  </span>
                  <span className="text-[10px] text-teal-600 font-medium">Metro Cardiology Node</span>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                  <span className="text-[10px] text-slate-400 block font-medium">24h Message Quota</span>
                  <span className="font-semibold text-slate-900 block font-mono mt-0.5">
                    1,280 / 10,000
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">Tier 2 Enterprise (High)</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span>Webhook Signature: <strong className="font-mono text-slate-700">SHA-256 HMAC</strong></span>
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <CheckCheck className="w-3 h-3" />
                <span>Zero Delivery Dropped</span>
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Pending Outbound Queue Breakdown & Action Strip */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    Outbound Dispatch Queue
                  </h4>
                  <span 
                    id="wa-pending-count-badge"
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      pendingQueue.length > 0
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {pendingQueue.length} Pending
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pre-rendered templates queued for automated transmission.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-toggle-queue-details"
                onClick={() => setShowQueueDetails(!showQueueDetails)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1"
              >
                <span>{showQueueDetails ? "Compact View" : "Review All"}</span>
                {showQueueDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {pendingQueue.length > 0 && (
                <button
                  id="btn-flush-wa-queue"
                  onClick={handleFlushAll}
                  disabled={isFlushingQueue}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isFlushingQueue ? "Transmitting..." : "Dispatch All Now"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Pending Queue List */}
          {pendingQueue.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5 opacity-80" />
              <p className="font-semibold text-slate-700">Outbound Queue is Clear</p>
              <p className="text-[11px] text-slate-400 mt-0.5">All patient appointment notifications, prescription links, and referral alerts are delivered.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {(showQueueDetails ? pendingQueue : pendingQueue.slice(0, 2)).map((item) => (
                <div 
                  key={item.id} 
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      item.type === "Appointment Reminder"
                        ? "bg-sky-50 text-sky-700"
                        : item.type === "E-Prescription Link"
                        ? "bg-teal-50 text-teal-700"
                        : "bg-indigo-50 text-indigo-700"
                    }`}>
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{item.recipientName}</span>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          {item.phone}
                        </span>
                        {item.urgency === "High" && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                            High Priority
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{item.type}</span>
                        <span>•</span>
                        <span>Scheduled: {item.scheduledFor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleSendSingleMessage(item.id)}
                      disabled={item.status === "sending"}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{item.status === "sending" ? "Sending..." : "Send Now"}</span>
                    </button>
                  </div>
                </div>
              ))}

              {!showQueueDetails && pendingQueue.length > 2 && (
                <div 
                  onClick={() => setShowQueueDetails(true)}
                  className="p-2.5 text-center text-xs font-semibold text-teal-700 bg-teal-50/40 hover:bg-teal-50 cursor-pointer transition-colors"
                >
                  <span>+ {pendingQueue.length - 2} more queued messages (Click to view full queue)</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Quick Test Ping Dispatcher */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0" />
            <div className="text-xs">
              <span className="font-semibold text-slate-800">Direct Doctor Test Dispatch:</span>
              <span className="text-slate-500 ml-1">Send an instant test HSM reminder template to verify handset delivery.</span>
            </div>
          </div>

          <form onSubmit={handleSendTestPing} className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="text"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              placeholder="e.g. +27 82 000 0000"
              className="px-2.5 py-1.5 text-xs font-mono border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-full sm:w-40"
            />
            <button
              id="btn-send-test-whatsapp"
              type="submit"
              disabled={isSendingTest || !testNumber}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1 shrink-0 disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>{isSendingTest ? "Pinging..." : "Test Ping"}</span>
            </button>
          </form>
        </div>

        {testSentFeedback && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testSentFeedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};
