import React, { useState, useEffect } from "react";
import { 
  ReceiptText, 
  Plus, 
  Sparkles, 
  Search, 
  Send, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  FileCheck, 
  ArrowRight, 
  Trash2, 
  X, 
  TrendingUp, 
  BarChart3, 
  PieChart as PieIcon, 
  Download, 
  Filter,
  Bell,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Phone,
  Mail,
  Check
} from "lucide-react";
import { InvoiceSummary, InvoiceItem, OverduePaymentNotification } from "../../types";
import { InvoiceRevenueDashboard } from "../invoice/InvoiceRevenueDashboard";
import { OverdueAlertBanner } from "../invoice/OverdueAlertBanner";
import { OverdueNotificationDrawer } from "../invoice/OverdueNotificationDrawer";
import { OverdueReminderModal } from "../invoice/OverdueReminderModal";

const INITIAL_INVOICES: InvoiceSummary[] = [
  {
    id: "inv-1",
    docNumber: "QUO-2026-1048",
    docType: "QUOTATION",
    patientName: "Robert Taylor",
    procedureDescription: "Minor Surgical Excision & Local Anesthesia Prep",
    subtotal: 595.00,
    taxAmount: 89.25,
    grandTotal: 684.25,
    currency: "USD",
    status: "SENT",
    dueDate: "24 Sep 2026",
    daysOverdue: 0,
    patientPhone: "+27 82 555 1048",
    patientEmail: "robert.taylor@gmail.com",
    medicalAidName: "Discovery Classic Smart",
  },
  {
    id: "inv-2",
    docNumber: "INV-2026-0912",
    docType: "TAX_INVOICE",
    patientName: "Elena Rostova",
    procedureDescription: "Specialist Cardiology Consultation & 12-Lead ECG",
    subtotal: 360.00,
    taxAmount: 54.00,
    grandTotal: 414.00,
    currency: "USD",
    status: "PAID",
    dueDate: "Paid 16 Sep",
    daysOverdue: 0,
    patientPhone: "+27 72 555 4921",
    patientEmail: "elena.rostova@consult.co.za",
    medicalAidName: "Momentum Custom Option",
  },
  {
    id: "inv-3",
    docNumber: "PRO-2026-0419",
    docType: "PRO_FORMA",
    patientName: "James Miller",
    procedureDescription: "Pre-operative Assessment & Diagnostic Blood Panel",
    subtotal: 240.00,
    taxAmount: 36.00,
    grandTotal: 276.00,
    currency: "USD",
    status: "DRAFT",
    dueDate: "30 Sep 2026",
    daysOverdue: 0,
    patientPhone: "+27 84 555 8920",
    patientEmail: "jmiller@millertech.co.za",
    medicalAidName: "Discovery Essential Saver",
  },
  {
    id: "inv-4",
    docNumber: "INV-2026-0744",
    docType: "TAX_INVOICE",
    patientName: "Lucas Graham",
    procedureDescription: "Transcatheter Valve Pre-Op Evaluation (TTE & Holter)",
    subtotal: 1086.96,
    taxAmount: 163.04,
    grandTotal: 1250.00,
    currency: "USD",
    status: "OVERDUE",
    dueDate: "10 Aug 2026",
    daysOverdue: 39,
    patientPhone: "+27 83 555 3190",
    patientEmail: "l.graham@apexholdings.co.za",
    medicalAidName: "Discovery Classic Comprehensive (Co-payment Unsettled)",
    lastReminderSent: "18 Aug 2026 (SMS)",
  },
  {
    id: "inv-5",
    docNumber: "INV-2026-0881",
    docType: "TAX_INVOICE",
    patientName: "David K. Ndlovu",
    procedureDescription: "Renal Function Assessment & Electrolyte Panel",
    subtotal: 713.04,
    taxAmount: 106.96,
    grandTotal: 820.00,
    currency: "USD",
    status: "OVERDUE",
    dueDate: "15 Jun 2026",
    daysOverdue: 95,
    patientPhone: "+27 71 555 8821",
    patientEmail: "david.ndlovu@gmail.com",
    medicalAidName: "Bonitas Standard (Patient Liable - Scheme Exhausted)",
    lastReminderSent: "28 Jul 2026 (Formal Letter)",
  },
  {
    id: "inv-6",
    docNumber: "INV-2026-0925",
    docType: "TAX_INVOICE",
    patientName: "Miriam Al-Mansoor",
    procedureDescription: "Specialist Consultation & Digital Dermoscopy",
    subtotal: 480.00,
    taxAmount: 72.00,
    grandTotal: 552.00,
    currency: "USD",
    status: "PAID",
    dueDate: "Paid 14 Sep",
    daysOverdue: 0,
    patientPhone: "+27 76 555 9012",
    patientEmail: "miriam.almansoor@gulfmed.org",
    medicalAidName: "Medihelp Prime One",
  },
];

const INITIAL_OVERDUE_NOTIFICATIONS: OverduePaymentNotification[] = [
  {
    id: "notif-1",
    invoiceId: "inv-4",
    docNumber: "INV-2026-0744",
    patientName: "Lucas Graham",
    patientPhone: "+27 83 555 3190",
    patientEmail: "l.graham@apexholdings.co.za",
    medicalAidName: "Discovery Classic Comprehensive (Co-pay unpaid)",
    amount: 1250.00,
    dueDate: "10 Aug 2026",
    daysOverdue: 39,
    urgency: "MODERATE",
    procedureDescription: "Transcatheter Valve Pre-Op Evaluation (TTE & Holter)",
    timestamp: "39 days overdue",
    isRead: false,
    status: "PENDING_ACTION",
    auditLog: [
      {
        action: "Overdue alert threshold (>30d) triggered by billing watcher",
        timestamp: "10 Sep 2026, 08:00 AM",
        performedBy: "Automated Ledger Monitor",
      },
    ],
  },
  {
    id: "notif-2",
    invoiceId: "inv-5",
    docNumber: "INV-2026-0881",
    patientName: "David K. Ndlovu",
    patientPhone: "+27 71 555 8821",
    patientEmail: "david.ndlovu@gmail.com",
    medicalAidName: "Bonitas Standard (Patient Liable)",
    amount: 820.00,
    dueDate: "15 Jun 2026",
    daysOverdue: 95,
    urgency: "CRITICAL",
    procedureDescription: "Renal Function Assessment & Electrolyte Panel",
    timestamp: "95 days overdue",
    isRead: false,
    status: "PENDING_ACTION",
    auditLog: [
      {
        action: "Escalated to Critical (>90d) - Practice Manager review recommended",
        timestamp: "13 Sep 2026, 09:30 AM",
        performedBy: "Automated Ledger Monitor",
      },
      {
        action: "Pre-legal compliance notification staged",
        timestamp: "16 Sep 2026, 11:15 AM",
        performedBy: "Billing Officer",
      },
    ],
  },
];

export const InvoiceModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "all" | "overdue" | "quotation" | "tax_invoice">("dashboard");
  const [invoices, setInvoices] = useState<InvoiceSummary[]>(INITIAL_INVOICES);
  const [notifications, setNotifications] = useState<OverduePaymentNotification[]>(INITIAL_OVERDUE_NOTIFICATIONS);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);
  const [isOverdueDrawerOpen, setIsOverdueDrawerOpen] = useState<boolean>(false);
  const [selectedNotifForReminder, setSelectedNotifForReminder] = useState<OverduePaymentNotification | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  // In-App Toast System
  const [toast, setToast] = useState<{
    id: string;
    title: string;
    message: string;
    type: "alert" | "success" | "info";
  } | null>(null);

  const showToast = (title: string, message: string, type: "alert" | "success" | "info" = "info") => {
    const id = `toast-${Date.now()}`;
    setToast({ id, title, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4500);
  };

  // AI Prompt State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<{
    number: string;
    type: "QUOTATION" | "PRO_FORMA" | "TAX_INVOICE";
    patient: string;
    taxRate: number;
    items: InvoiceItem[];
  } | null>(null);

  // Active Overdue Count
  const activeOverdueNotifications = notifications.filter(
    (n) => n.status === "PENDING_ACTION" || n.status === "REMINDER_SENT"
  );
  const activeOverdueCount = activeOverdueNotifications.length;

  // Real-Time Polling Simulation Effect: runs periodic integrity scans
  useEffect(() => {
    const interval = setInterval(() => {
      // Background ping keeps the ledger sync active
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Handler: Simulate New Overdue Payment (>30 days) to demonstrate real-time alerts
  const handleSimulateNewOverdue = () => {
    const newInvId = `inv-sim-${Date.now()}`;
    const newDocNum = `INV-2026-0618`;
    const patientName = "Sarah Jenkins";
    const amount = 640.00;
    const daysOverdue = 32;

    // Add to invoices
    const newInvoice: InvoiceSummary = {
      id: newInvId,
      docNumber: newDocNum,
      docType: "TAX_INVOICE",
      patientName,
      procedureDescription: "Holter Cardiac Monitoring (48-Hour Continuous)",
      subtotal: 556.52,
      taxAmount: 83.48,
      grandTotal: amount,
      currency: "USD",
      status: "OVERDUE",
      dueDate: "17 Aug 2026",
      daysOverdue,
      patientPhone: "+27 82 555 7712",
      patientEmail: "sarah.jenkins@outlook.com",
      medicalAidName: "Discovery Classic Priority",
    };

    // Add to notifications
    const newNotif: OverduePaymentNotification = {
      id: `notif-${Date.now()}`,
      invoiceId: newInvId,
      docNumber: newDocNum,
      patientName,
      patientPhone: "+27 82 555 7712",
      patientEmail: "sarah.jenkins@outlook.com",
      medicalAidName: "Discovery Classic Priority",
      amount,
      dueDate: "17 Aug 2026",
      daysOverdue,
      urgency: "MODERATE",
      procedureDescription: "Holter Cardiac Monitoring (48-Hour Continuous)",
      timestamp: "Just now",
      isRead: false,
      status: "PENDING_ACTION",
      auditLog: [
        {
          action: "Real-time ledger audit identified account >30 days overdue",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          performedBy: "Real-Time Ledger Monitor",
        },
      ],
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    setNotifications((prev) => [newNotif, ...prev]);
    setIsBannerDismissed(false);

    showToast(
      "Real-Time Billing Alert: >30d Overdue Account Detected",
      `Invoice ${newDocNum} for ${patientName} ($${amount.toFixed(2)}) has reached 32 days overdue. Immediate action recommended.`,
      "alert"
    );
  };

  // Handler: Send individual reminder
  const handleSendReminder = (notificationId: string, channel: "whatsapp" | "sms" | "email", customMessage: string) => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId) {
          return {
            ...n,
            status: "REMINDER_SENT",
            auditLog: [
              ...n.auditLog,
              {
                action: `Automated ${channel.toUpperCase()} payment reminder dispatched to ${n.patientPhone || n.patientEmail}`,
                timestamp: timestampStr,
                performedBy: "Administrator",
                details: customMessage.slice(0, 80) + "...",
              },
            ],
          };
        }
        return n;
      })
    );

    const targetNotif = notifications.find((n) => n.id === notificationId);
    showToast(
      "Overdue Notice Dispatched",
      `Payment reminder for ${targetNotif?.docNumber || "invoice"} sent via ${channel.toUpperCase()} to ${targetNotif?.patientName}.`,
      "success"
    );
  };

  // Handler: Bulk send reminders to all pending accounts
  const handleSendBulkReminders = () => {
    const timestampStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setNotifications((prev) =>
      prev.map((n) => {
        if (n.status === "PENDING_ACTION") {
          return {
            ...n,
            status: "REMINDER_SENT",
            auditLog: [
              ...n.auditLog,
              {
                action: `Bulk automated WhatsApp payment reminder dispatched`,
                timestamp: timestampStr,
                performedBy: "Administrator",
              },
            ],
          };
        }
        return n;
      })
    );

    showToast(
      "Bulk Reminders Dispatched",
      `Automated payment notices sent to all ${activeOverdueCount} accounts with overdue balances >30 days.`,
      "success"
    );
  };

  // Handler: Mark invoice as paid
  const handleMarkAsPaid = (invoiceId: string) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invoiceId) {
          return { ...inv, status: "PAID", dueDate: "Paid Today" };
        }
        return inv;
      })
    );

    setNotifications((prev) =>
      prev.map((n) => {
        if (n.invoiceId === invoiceId) {
          return {
            ...n,
            status: "RESOLVED",
            auditLog: [
              ...n.auditLog,
              {
                action: "Payment reconciled and settled in full",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                performedBy: "Administrator",
              },
            ],
          };
        }
        return n;
      })
    );

    const inv = invoices.find((i) => i.id === invoiceId);
    showToast(
      "Payment Recorded as Settled",
      `Account ${inv?.docNumber || invoiceId} for ${inv?.patientName} has been reconciled to zero balance.`,
      "success"
    );
  };

  // Handler: Snooze notification
  const handleSnoozeNotification = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId) {
          return {
            ...n,
            status: "SNOOZED",
            auditLog: [
              ...n.auditLog,
              {
                action: "Alert snoozed for 7 days",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                performedBy: "Administrator",
              },
            ],
          };
        }
        return n;
      })
    );

    showToast("Alert Snoozed", "Account alert paused for 7 days.", "info");
  };

  // Handler: Inspect invoice
  const handleInspectInvoice = (docNumber: string) => {
    const found = invoices.find((inv) => inv.docNumber === docNumber);
    if (found) {
      setActiveInvoice({
        number: found.docNumber,
        type: found.docType,
        patient: found.patientName,
        taxRate: 15,
        items: [
          {
            id: "it-1",
            code: "CPT-99214",
            description: found.procedureDescription,
            category: "Procedure",
            quantity: 1,
            unit_price: found.subtotal,
            line_total: found.subtotal,
          },
        ],
      });
      setIsOverdueDrawerOpen(false);
    }
  };

  const handleRunAiPrompt = (presetText?: string) => {
    const query = presetText || aiPrompt;
    if (!query.trim()) return;

    setIsGenerating(true);
    setTimeout(() => {
      const lower = query.toLowerCase();
      const taxRate = lower.includes("15%") || lower.includes("vat") ? 15 : 0;

      const newItems: InvoiceItem[] = [
        {
          id: "item-1",
          code: "CPT-99214",
          description: lower.includes("premium")
            ? "Specialist Medical Consultation - Premium Tier 4"
            : "Specialist Medical Consultation & Diagnostic Evaluation",
          category: "Consultation",
          quantity: 1,
          unit_price: 220.0,
          line_total: 220.0,
        },
      ];

      if (lower.includes("surgical") || lower.includes("procedure") || lower.includes("minor")) {
        newItems.push({
          id: "item-2",
          code: "CPT-11402",
          description: "Excision of benign skin lesion / minor surgical intervention",
          category: "Procedure",
          quantity: 1,
          unit_price: 375.0,
          line_total: 375.0,
        });
      } else if (
        lower.includes("cardio") ||
        lower.includes("heart") ||
        lower.includes("ecg") ||
        lower.includes("echo")
      ) {
        newItems.push(
          {
            id: "item-2",
            code: "CPT-93000",
            description: "12-Lead Electrocardiogram (ECG) with interpretation",
            category: "Diagnostics",
            quantity: 1,
            unit_price: 140.0,
            line_total: 140.0,
          },
          {
            id: "item-3",
            code: "CPT-93306",
            description: "Transthoracic Echocardiography (TTE) complete examination",
            category: "Diagnostics",
            quantity: 1,
            unit_price: 520.0,
            line_total: 520.0,
          }
        );
      }

      setActiveInvoice({
        number: `QUO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        type: "QUOTATION",
        patient: "Robert Taylor",
        taxRate,
        items: newItems,
      });

      setIsGenerating(false);
      setAiPrompt("");
      showToast("Quotation Synthesized", "Drafted itemized medical quote with tariff codes.", "success");
    }, 600);
  };

  const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
    const subtotal = items.reduce((acc, it) => acc + it.line_total, 0);
    const taxAmount = Number(((subtotal * taxRate) / 100).toFixed(2));
    const grandTotal = Number((subtotal + taxAmount).toFixed(2));
    return { subtotal, taxAmount, grandTotal };
  };

  const totals = activeInvoice ? calculateTotals(activeInvoice.items, activeInvoice.taxRate) : null;

  return (
    <div className="space-y-6">
      {/* Floating In-App Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-md animate-in slide-in-from-top-3 duration-200">
          <div
            className={`p-4 rounded-2xl border shadow-2xl flex items-start gap-3 select-none ${
              toast.type === "alert"
                ? "bg-rose-950 border-rose-700 text-rose-100 shadow-rose-950/50"
                : toast.type === "success"
                ? "bg-slate-900 border-emerald-500 text-white shadow-emerald-950/40"
                : "bg-slate-900 border-teal-500 text-white shadow-teal-950/40"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "alert" ? (
                <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
              ) : toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Bell className="w-5 h-5 text-teal-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="font-bold text-xs uppercase tracking-wider">{toast.title}</h5>
              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <ReceiptText className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Administrative Suite & Invoicing</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>AI BillingAssist Ready</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time overdue payment alerts (&gt;30d), Recharts revenue analytics, CPT/ICD-10 tariff structures, and automated pro-forma conversion.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Overdue Payment Alert Bell & Live Indicator */}
          <button
            type="button"
            id="btn-admin-overdue-bell"
            onClick={() => setIsOverdueDrawerOpen(true)}
            className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all shadow-xs ${
              activeOverdueCount > 0
                ? "bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100 ring-2 ring-rose-500/20"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title="Real-Time Overdue Payment Alerts (>30 Days)"
          >
            <div className="relative">
              <Bell className={`w-4 h-4 ${activeOverdueCount > 0 ? "text-rose-600" : "text-slate-500"}`} />
              {activeOverdueCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                </span>
              )}
            </div>

            <span className="font-mono">
              {activeOverdueCount > 0 ? `${activeOverdueCount} Overdue (>30d)` : "0 Overdue"}
            </span>
          </button>

          <button
            id="btn-nav-revenue-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-colors shadow-2xs ${
              activeTab === "dashboard"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Revenue Dashboard</span>
          </button>

          <button
            onClick={() => handleRunAiPrompt("Draft quotation for minor surgical procedure with anesthesia prep and 15% VAT")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Draft Quotation</span>
          </button>
        </div>
      </div>

      {/* Persistent Overdue Payments Alert Banner (Top Warning when >30d items exist) */}
      {!isBannerDismissed && activeOverdueCount > 0 && (
        <OverdueAlertBanner
          notifications={notifications}
          onOpenNotificationCenter={() => setIsOverdueDrawerOpen(true)}
          onSendBulkReminders={handleSendBulkReminders}
          onDismiss={() => setIsBannerDismissed(true)}
        />
      )}

      {/* Tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium w-fit">
          <button
            id="tab-invoice-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "dashboard"
                ? "bg-white text-teal-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Revenue Dashboard</span>
          </button>

          <button
            id="tab-invoice-all"
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "all" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            All Invoices ({invoices.length})
          </button>

          <button
            id="tab-invoice-overdue"
            onClick={() => setActiveTab("overdue")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              activeTab === "overdue"
                ? "bg-white text-rose-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Overdue &gt;30d</span>
            {activeOverdueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                {activeOverdueCount}
              </span>
            )}
          </button>

          <button
            id="tab-invoice-quotations"
            onClick={() => setActiveTab("quotation")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "quotation" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Quotations
          </button>

          <button
            id="tab-invoice-tax"
            onClick={() => setActiveTab("tax_invoice")}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === "tax_invoice" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tax Invoices
          </button>
        </div>

        {activeTab !== "dashboard" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-simulate-overdue-tab"
              onClick={handleSimulateNewOverdue}
              className="text-[11px] px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg font-semibold flex items-center gap-1 transition-colors"
              title="Test real-time alert engine by injecting a newly overdue payment"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Simulate Overdue Alert</span>
            </button>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search document # or patient..."
                className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 w-full sm:w-56"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Content */}
      {activeTab === "dashboard" ? (
        /* Invoice Revenue Dashboard using Recharts */
        <InvoiceRevenueDashboard
          onOpenOverdueDrawer={() => setIsOverdueDrawerOpen(true)}
          onOpenInvoiceModal={(docNumber) => {
            const found = invoices.find((inv) => inv.docNumber === docNumber);
            if (found) {
              setActiveInvoice({
                number: found.docNumber,
                type: found.docType,
                patient: found.patientName,
                taxRate: 15,
                items: [
                  {
                    id: "it-1",
                    code: "CPT-99214",
                    description: found.procedureDescription,
                    category: "Procedure",
                    quantity: 1,
                    unit_price: found.subtotal,
                    line_total: found.subtotal,
                  },
                ],
              });
            }
          }}
        />
      ) : (
        /* Invoices Document Table View */
        <div className="space-y-6">
          {/* AI Billing Assistant Interactive Prompt Bar */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-sm border border-slate-700">
            <div className="flex items-center gap-2 text-xs font-semibold text-teal-300 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI-Assisted Tariff & Template Generator (Gemini 3.8 Flash)</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRunAiPrompt()}
                placeholder='e.g., "Draft a quotation for minor surgical procedure including anesthesia prep with 15% VAT"'
                className="flex-1 px-4 py-2.5 text-xs bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-400"
              />
              <button
                onClick={() => handleRunAiPrompt()}
                disabled={isGenerating}
                className="px-4 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center justify-center gap-2 shrink-0"
              >
                {isGenerating ? <Clock className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{isGenerating ? "Synthesizing..." : "Generate Quote"}</span>
              </button>
            </div>

            {/* Quick prompt suggestions */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 border-t border-slate-700/60 text-[11px] text-slate-300">
              <span className="text-slate-400">Try Prompt:</span>
              <button
                onClick={() => handleRunAiPrompt("Draft quotation for minor surgical procedure with anesthesia prep and 15% VAT")}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-teal-300 transition-colors"
              >
                &ldquo;Minor surgical procedure + anesthesia prep (15% VAT)&rdquo;
              </button>
              <button
                onClick={() => handleRunAiPrompt("Cardiology workup with echocardiogram and 12-lead ECG")}
                className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-teal-300 transition-colors"
              >
                &ldquo;Cardiology workup (Echo + ECG)&rdquo;
              </button>
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Document #</th>
                    <th className="py-3 px-4">Patient</th>
                    <th className="py-3 px-4">Procedure Description</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Aging / Due Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices
                    .filter((inv) => {
                      if (activeTab === "overdue") return (inv.daysOverdue || 0) > 30 && inv.status !== "PAID";
                      if (activeTab === "quotation") return inv.docType === "QUOTATION";
                      if (activeTab === "tax_invoice") return inv.docType === "TAX_INVOICE";
                      return true;
                    })
                    .map((inv) => {
                      const isOverdue30 = (inv.daysOverdue || 0) > 30 && inv.status !== "PAID";
                      const isCritical = (inv.daysOverdue || 0) >= 90;

                      return (
                        <tr
                          key={inv.id}
                          className={`transition-colors ${
                            isOverdue30
                              ? isCritical
                                ? "bg-rose-50/40 hover:bg-rose-50/70"
                                : "bg-amber-50/40 hover:bg-amber-50/70"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{inv.docNumber}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                inv.docType === "TAX_INVOICE"
                                  ? "bg-teal-100 text-teal-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {inv.docType}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <div>
                              <span>{inv.patientName}</span>
                              {inv.medicalAidName && (
                                <span className="block text-[10px] text-slate-400 font-normal truncate max-w-[180px]">
                                  {inv.medicalAidName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                            {inv.procedureDescription}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            ${inv.grandTotal.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 w-fit ${
                                inv.status === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : isOverdue30
                                  ? isCritical
                                    ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                                    : "bg-amber-100 text-amber-800 border-amber-300"
                                  : inv.status === "SENT"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}
                            >
                              {isOverdue30 && <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>}
                              {inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isOverdue30 ? (
                              <div>
                                <span className="font-bold text-rose-700 font-mono text-[11px] block">
                                  {inv.daysOverdue} Days Overdue
                                </span>
                                <span className="text-[10px] text-slate-400">Due: {inv.dueDate}</span>
                              </div>
                            ) : (
                              <span className="text-slate-500">{inv.dueDate}</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isOverdue30 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleMarkAsPaid(inv.id)}
                                    className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                                    title="Mark as paid / co-pay collected"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Paid</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      const notif = notifications.find((n) => n.invoiceId === inv.id);
                                      if (notif) {
                                        setSelectedNotifForReminder(notif);
                                        setIsReminderModalOpen(true);
                                      }
                                    }}
                                    className="px-2 py-1 text-[11px] font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Remind</span>
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => {
                                  setActiveInvoice({
                                    number: inv.docNumber,
                                    type: inv.docType,
                                    patient: inv.patientName,
                                    taxRate: 15,
                                    items: [
                                      {
                                        id: "it-1",
                                        code: "CPT-99214",
                                        description: inv.procedureDescription,
                                        category: "Procedure",
                                        quantity: 1,
                                        unit_price: inv.subtotal,
                                        line_total: inv.subtotal,
                                      },
                                    ],
                                  });
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                              >
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Real-Time Overdue Notification Center Drawer */}
      <OverdueNotificationDrawer
        isOpen={isOverdueDrawerOpen}
        onClose={() => setIsOverdueDrawerOpen(false)}
        notifications={notifications}
        onOpenReminderModal={(notif) => {
          setSelectedNotifForReminder(notif);
          setIsReminderModalOpen(true);
        }}
        onMarkAsPaid={handleMarkAsPaid}
        onSnoozeNotification={handleSnoozeNotification}
        onInspectInvoice={handleInspectInvoice}
        onSimulateNewOverdue={handleSimulateNewOverdue}
        onSendBulkReminders={handleSendBulkReminders}
      />

      {/* Automated Reminder Dispatch Modal */}
      <OverdueReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedNotifForReminder(null);
        }}
        notification={selectedNotifForReminder}
        onSendReminder={handleSendReminder}
      />

      {/* Interactive Quotation/Invoice Editor Drawer/Modal */}
      {activeInvoice && totals && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <ReceiptText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900">{activeInvoice.number} — {activeInvoice.type}</h3>
              </div>
              <button
                onClick={() => setActiveInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="font-semibold text-slate-900 block">{activeInvoice.patient}</span>
                  <span className="text-[11px] text-slate-500">Practice: Metro Medical Center (Cardiology)</span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-lg font-mono text-[11px] bg-teal-100 text-teal-800 font-bold">
                    {activeInvoice.type}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">Tax Rate: {activeInvoice.taxRate}% VAT</span>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="font-semibold text-slate-700 mb-2">Itemized Medical Tariff Codes</div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-[11px] font-semibold text-slate-600 uppercase">
                      <tr>
                        <th className="py-2 px-3">Code</th>
                        <th className="py-2 px-3">Description</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeInvoice.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-teal-700 font-semibold">{item.code}</td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">{item.description}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-mono">${item.unit_price.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">${item.line_total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT / Tax ({activeInvoice.taxRate}%):</span>
                  <span className="font-mono font-semibold">${totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Grand Total:</span>
                  <span className="font-mono text-teal-700">${totals.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  setActiveInvoice({
                    ...activeInvoice,
                    type: "TAX_INVOICE",
                    number: activeInvoice.number.replace("QUO", "INV")
                  });
                  showToast("Converted to Tax Invoice", "Quotation upgraded to formal Tax Invoice.", "success");
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <FileCheck className="w-4 h-4 text-teal-600" />
                <span>Convert to Tax Invoice</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    showToast(
                      "Dispatched via WhatsApp & Email",
                      `Invoice ${activeInvoice.number} sent with secure patient payment gateway link.`,
                      "success"
                    );
                    setActiveInvoice(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via WhatsApp / Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
