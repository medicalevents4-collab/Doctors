import React, { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Send,
  Building2,
  Stethoscope,
  Activity,
  Layers,
  ChevronRight,
  PieChart as PieChartIcon,
  BarChart3
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Monthly Billing Trends
interface MonthlyTrendData {
  month: string;
  billed: number;
  collected: number;
  outstanding: number;
  claimsCount: number;
}

const MONTHLY_BILLING_DATA: MonthlyTrendData[] = [
  { month: "Apr 2026", billed: 42500, collected: 39800, outstanding: 2700, claimsCount: 78 },
  { month: "May 2026", billed: 48200, collected: 44100, outstanding: 4100, claimsCount: 86 },
  { month: "Jun 2026", billed: 53900, collected: 49500, outstanding: 4400, claimsCount: 94 },
  { month: "Jul 2026", billed: 61400, collected: 57200, outstanding: 4200, claimsCount: 112 },
  { month: "Aug 2026", billed: 58700, collected: 53600, outstanding: 5100, claimsCount: 104 },
  { month: "Sep 2026", billed: 67850, collected: 59400, outstanding: 8450, claimsCount: 128 },
];

// Outstanding Payments by Aging Bucket
interface OutstandingBucket {
  name: string;
  amount: number;
  invoicesCount: number;
  color: string;
  description: string;
  riskLevel: "Low" | "Medium" | "High" | "Critical";
}

const OUTSTANDING_BUCKETS: OutstandingBucket[] = [
  {
    name: "0-30 Days (Current)",
    amount: 18450,
    invoicesCount: 29,
    color: "#10b981", // emerald
    description: "Submitted to Medical Aid / Within standard payment cycle",
    riskLevel: "Low",
  },
  {
    name: "31-60 Days (Grace)",
    amount: 6200,
    invoicesCount: 11,
    color: "#f59e0b", // amber
    description: "Patient co-payment due; automated reminder sent",
    riskLevel: "Medium",
  },
  {
    name: "61-90 Days (Late)",
    amount: 2800,
    invoicesCount: 5,
    color: "#f97316", // orange
    description: "Overdue accounts; second follow-up initiated",
    riskLevel: "High",
  },
  {
    name: "90+ Days (Critical)",
    amount: 1500,
    invoicesCount: 2,
    color: "#ef4444", // rose
    description: "Requires direct clinical liaison or payment arrangement",
    riskLevel: "Critical",
  },
];

// Top-Performing Medical Service Items
interface ServiceItemPerformance {
  code: string;
  description: string;
  category: "Consultation" | "Diagnostic" | "Procedure" | "Laboratory";
  volume: number;
  revenue: number;
  avgPrice: number;
  marginRate: number;
}

const TOP_SERVICE_ITEMS: ServiceItemPerformance[] = [
  {
    code: "CPT-93306",
    description: "Transthoracic Echocardiogram (TTE)",
    category: "Diagnostic",
    volume: 56,
    revenue: 24800,
    avgPrice: 442.85,
    marginRate: 84,
  },
  {
    code: "CPT-99214",
    description: "Specialist Consultation (Tier 4)",
    category: "Consultation",
    volume: 89,
    revenue: 19600,
    avgPrice: 220.22,
    marginRate: 92,
  },
  {
    code: "CPT-93000",
    description: "12-Lead Diagnostic Resting ECG",
    category: "Diagnostic",
    volume: 190,
    revenue: 14250,
    avgPrice: 75.0,
    marginRate: 88,
  },
  {
    code: "CPT-11402",
    description: "Minor Surgical Lesion Excision",
    category: "Procedure",
    volume: 34,
    revenue: 12900,
    avgPrice: 379.41,
    marginRate: 76,
  },
  {
    code: "CPT-93015",
    description: "Cardiovascular Stress Test",
    category: "Diagnostic",
    volume: 28,
    revenue: 9800,
    avgPrice: 350.0,
    marginRate: 81,
  },
  {
    code: "CPT-80053",
    description: "Comprehensive Metabolic Panel",
    category: "Laboratory",
    volume: 130,
    revenue: 6500,
    avgPrice: 50.0,
    marginRate: 65,
  },
];

// High Priority Outstanding Invoice List for follow-up
interface OutstandingInvoice {
  id: string;
  docNumber: string;
  patient: string;
  service: string;
  amount: number;
  daysOverdue: number;
  status: "31-60 Days" | "61-90 Days" | "90+ Days";
  phone: string;
}

const RECENT_OUTSTANDING_INVOICES: OutstandingInvoice[] = [
  {
    id: "inv-out-1",
    docNumber: "INV-2026-0819",
    patient: "Robert Taylor",
    service: "Minor Surgical Excision & Local Anesthesia",
    amount: 684.25,
    daysOverdue: 42,
    status: "31-60 Days",
    phone: "+27 82 555 1048",
  },
  {
    id: "inv-out-2",
    docNumber: "INV-2026-0744",
    patient: "Lucas Graham",
    service: "Transcatheter Valve Pre-Op Evaluation",
    amount: 1250.0,
    daysOverdue: 68,
    status: "61-90 Days",
    phone: "+27 83 555 3190",
  },
  {
    id: "inv-out-3",
    docNumber: "INV-2026-0612",
    patient: "David K. Ndlovu",
    service: "Renal Clearance & Electrolyte Panel",
    amount: 820.0,
    daysOverdue: 94,
    status: "90+ Days",
    phone: "+27 71 555 8821",
  },
];

export const InvoiceRevenueDashboard: React.FC<{
  onOpenInvoiceModal?: (docNumber: string) => void;
  onOpenOverdueDrawer?: () => void;
}> = ({ onOpenInvoiceModal, onOpenOverdueDrawer }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"6m" | "ytd" | "q3">("6m");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("All Specialties");
  const [reminderSentId, setReminderSentId] = useState<string | null>(null);

  // Total Calculations
  const totalBilled = MONTHLY_BILLING_DATA.reduce((sum, item) => sum + item.billed, 0);
  const totalCollected = MONTHLY_BILLING_DATA.reduce((sum, item) => sum + item.collected, 0);
  const totalOutstanding = OUTSTANDING_BUCKETS.reduce((sum, item) => sum + item.amount, 0);
  const collectionRate = ((totalCollected / totalBilled) * 100).toFixed(1);
  const totalClaims = MONTHLY_BILLING_DATA.reduce((sum, item) => sum + item.claimsCount, 0);

  const handleSendReminder = (inv: OutstandingInvoice) => {
    setReminderSentId(inv.id);
    setTimeout(() => {
      setReminderSentId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter & Period Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
            <TrendingUp className="w-5 h-5" />
          </span>
          <div>
            <h3 className="font-bold text-sm text-slate-900">Practice Revenue & Billing Analytics</h3>
            <p className="text-xs text-slate-500">
              Interactive billing trend analysis, collections aging, and tariff code performance.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedTimeframe("6m")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedTimeframe === "6m" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Last 6 Months
            </button>
            <button
              onClick={() => setSelectedTimeframe("q3")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedTimeframe === "q3" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Q3 2026
            </button>
            <button
              onClick={() => setSelectedTimeframe("ytd")}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                selectedTimeframe === "ytd" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Year-to-Date
            </button>
          </div>

          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="p-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="All Specialties">All Specialties</option>
            <option value="Cardiology">Cardiology & Diagnostics</option>
            <option value="Minor Surgery">Minor Surgery</option>
            <option value="Internal Medicine">Internal Medicine</option>
          </select>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Billed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gross Billed Revenue</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-slate-900 font-mono">
              ${totalBilled.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h4>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +15.6%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {totalClaims} tariff encounters billed across period
          </p>
        </div>

        {/* Collected Revenue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Collected Cash & Remittances</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-slate-900 font-mono">
              ${totalCollected.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h4>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +14.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {collectionRate}% Overall Collection Efficiency Rate
          </p>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Outstanding Receivables</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-slate-900 font-mono">
              ${totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </h4>
            <span className="text-[11px] font-bold text-amber-600 flex items-center">
              Avg DSO: 21.8d
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            47 open invoices (64% current &lt;30 days)
          </p>
        </div>

        {/* Average Claim Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Average Invoice Yield</span>
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-slate-900 font-mono">
              ${(totalBilled / totalClaims).toFixed(2)}
            </h4>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +6.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Average revenue generated per clinical session
          </p>
        </div>
      </div>

      {/* Row 1: Monthly Billing Trends Chart (Area Chart) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <h4 className="font-bold text-sm text-slate-900">Monthly Billing Trends & Cash Flow</h4>
            </div>
            <p className="text-xs text-slate-500">
              Comparison between gross billed tariff fees and settled medical aid / cash payments.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-slate-600 font-medium">Billed Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Collected Cash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="text-slate-600 font-medium">Outstanding</span>
            </div>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MONTHLY_BILLING_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "0.75rem",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: unknown) => [
                  `$${Number(value || 0).toLocaleString("en-US")}`,
                  "",
                ]}
              />
              <Area
                type="monotone"
                dataKey="billed"
                name="Billed Revenue"
                stroke="#0d9488"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorBilled)"
              />
              <Area
                type="monotone"
                dataKey="collected"
                name="Collected Remittances"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorCollected)"
              />
              <Bar dataKey="outstanding" name="Outstanding Balance" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Two Columns: Left (Outstanding Payments & Aging) | Right (Top-Performing Service Items) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Outstanding Payments Aging Breakdown */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-sm text-slate-900">Outstanding Payments Aging</h4>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ${totalOutstanding.toLocaleString()} Total
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-2">
              Risk distribution of unpaid claims by aging bucket.
            </p>

            {/* Donut Chart */}
            <div className="h-56 w-full my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={OUTSTANDING_BUCKETS}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="amount"
                  >
                    {OUTSTANDING_BUCKETS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => [
                      `$${Number(value || 0).toLocaleString()}`,
                      "Outstanding",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Aging Buckets Table */}
            <div className="space-y-2">
              {OUTSTANDING_BUCKETS.map((bucket) => {
                const pct = ((bucket.amount / totalOutstanding) * 100).toFixed(0);
                return (
                  <div
                    key={bucket.name}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: bucket.color }}
                      />
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{bucket.name}</span>
                        <span className="text-[10px] text-slate-400">{bucket.invoicesCount} invoices • {bucket.riskLevel} Risk</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-slate-900 block">
                        ${bucket.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{pct}% of total</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Follow-up Section for Overdue accounts */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800">
                Priority Outstanding Accounts (&gt;30 Days)
              </span>
              {onOpenOverdueDrawer && (
                <button
                  type="button"
                  onClick={onOpenOverdueDrawer}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  <span>Real-Time Alerts</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {RECENT_OUTSTANDING_INVOICES.map((inv) => (
                <div
                  key={inv.id}
                  className="p-2 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 truncate">{inv.patient}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          inv.status === "90+ Days"
                            ? "bg-rose-100 text-rose-800"
                            : inv.status === "61-90 Days"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {inv.daysOverdue}d Overdue
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                      {inv.docNumber} • ${inv.amount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleSendReminder(inv)}
                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 ${
                      reminderSentId === inv.id
                        ? "bg-emerald-600 text-white"
                        : "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
                    }`}
                  >
                    {reminderSentId === inv.id ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Sent!</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        <span>WhatsApp Nudge</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Top-Performing Medical Service Items */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">Top-Performing Service Items & Tariffs</h4>
              </div>
              <p className="text-xs text-slate-500">
                Revenue generation and procedural volume ranked by billing yield.
              </p>
            </div>
            <span className="text-xs text-slate-400 font-mono">CPT & Medical Tariff Standard</span>
          </div>

          {/* Horizontal Bar Chart of Service Items Revenue */}
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={TOP_SERVICE_ITEMS}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#64748b"
                  fontSize={11}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  type="category"
                  dataKey="code"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                />
                <Tooltip
                  formatter={(val: unknown) => [`$${Number(val || 0).toLocaleString()}`, "Revenue"]}
                  labelFormatter={(label) => {
                    const item = TOP_SERVICE_ITEMS.find((s) => s.code === label);
                    return item ? `${item.code} — ${item.description}` : label;
                  }}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="revenue" fill="#0d9488" radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Itemized Service Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Tariff Code</th>
                  <th className="py-2.5 px-3">Service Description</th>
                  <th className="py-2.5 px-3 text-center">Volume</th>
                  <th className="py-2.5 px-3 text-right">Avg Unit</th>
                  <th className="py-2.5 px-3 text-right">Gross Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TOP_SERVICE_ITEMS.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2 px-3 font-mono font-bold text-teal-700">{item.code}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-900">{item.description}</div>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-medium">{item.volume}x</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">${item.avgPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      ${item.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
