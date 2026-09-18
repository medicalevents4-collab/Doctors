import React, { useState } from "react";
import {
  FileText,
  Activity,
  Heart,
  FileCheck,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Eye,
  Sliders,
  Share2,
  StopCircle,
  Sparkles,
  Download,
  AlertCircle
} from "lucide-react";
import { ScreenSharePreset } from "../../types";

export const SCREEN_SHARE_PRESETS: ScreenSharePreset[] = [
  {
    id: "radiology",
    title: "Chest Radiograph & CT Coronal View",
    category: "radiology",
    description: "High-resolution PA chest radiograph demonstrating clear lung fields, normal cardiothoracic ratio (0.46), and unremarkable mediastinum.",
    badge: "Imaging • PACS DICOM",
  },
  {
    id: "ecg",
    title: "12-Lead Electrocardiogram (ECG)",
    category: "ecg",
    description: "Lead II rhythm strip: Normal sinus rhythm at 74 bpm, normal PR interval (160ms), no ST-elevation or T-wave inversion.",
    badge: "Telemetry • Lead II",
  },
  {
    id: "labs",
    title: "Blood Chemistry & Renal Kinetics",
    category: "labs",
    description: "Serum Creatinine: 92 µmol/L, eGFR (CKD-EPI): 88 mL/min/1.73m², Fasting Glucose: 5.4 mmol/L, Total Cholesterol: 5.2 mmol/L.",
    badge: "Pathology • NHLS/Lancet",
  },
  {
    id: "ehr",
    title: "Longitudinal Patient EHR Summary",
    category: "records",
    description: "Active chronic care problem list, medication compliance record, and 12-month blood pressure trajectory.",
    badge: "Clinical Records • Encrypted",
  },
];

interface ScreenShareStageProps {
  activePresetId: string;
  onSelectPreset: (id: string) => void;
  onStopSharing: () => void;
  patientName: string;
}

export const ScreenShareStage: React.FC<ScreenShareStageProps> = ({
  activePresetId,
  onSelectPreset,
  onStopSharing,
  patientName,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [invertContrast, setInvertContrast] = useState<boolean>(false);

  const currentPreset =
    SCREEN_SHARE_PRESETS.find((p) => p.id === activePresetId) || SCREEN_SHARE_PRESETS[0];

  return (
    <div className="relative w-full h-full bg-slate-950 flex flex-col overflow-hidden select-none">
      {/* Top Screen Share Status Banner */}
      <div className="bg-amber-950/90 border-b border-amber-600/50 px-4 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-semibold text-amber-200">
            Broadcasting Screen to Patient ({patientName}):
          </span>
          <span className="text-xs font-bold text-amber-100 bg-amber-900/60 px-2 py-0.5 rounded-md border border-amber-700/60">
            {currentPreset.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Preset Selector Dropdown / Pills */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-900/90 rounded-lg p-1 border border-slate-800">
            {SCREEN_SHARE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`px-2 py-1 text-[11px] font-medium rounded-md transition-all ${
                  activePresetId === preset.id
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {preset.category.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            id="btn-stop-screen-share-banner"
            onClick={onStopSharing}
            className="flex items-center gap-1.5 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>Stop Sharing</span>
          </button>
        </div>
      </div>

      {/* Main Screen Share Canvas Content */}
      <div className="flex-1 relative overflow-auto flex items-center justify-center p-4 bg-slate-950">
        {activePresetId === "radiology" && (
          <div
            className={`max-w-3xl w-full bg-black rounded-xl p-4 border border-slate-800 shadow-2xl transition-all ${
              invertContrast ? "invert filter" : ""
            }`}
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2 mb-3">
              <div className="font-mono">
                <span className="text-teal-400 font-bold">DICOM STUDY:</span> CXR PA VIEW (14x17in)
              </div>
              <div className="font-mono">CTR: 0.46 • VOL: 5.8L • EXPOSURE: 110kVp</div>
            </div>

            {/* Simulated X-Ray Canvas */}
            <div className="relative aspect-4/3 w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800/80">
              {/* Radiographic gradient silhouettes */}
              <div className="absolute inset-0 bg-radial from-slate-800 via-slate-950 to-black opacity-90"></div>

              {/* Rib cage and pulmonary field simulated svg */}
              <svg className="w-full h-full p-4" viewBox="0 0 600 450" fill="none">
                {/* Spine vertebral column */}
                <rect x="290" y="40" width="20" height="360" rx="4" fill="#334155" opacity="0.6" />
                {/* Clavicles */}
                <path d="M 120 70 Q 290 90 300 95 Q 310 90 480 70" stroke="#64748b" strokeWidth="8" opacity="0.7" strokeLinecap="round" />
                {/* Rib arcs left and right */}
                <path d="M 300 120 C 200 110 100 150 140 220" stroke="#475569" strokeWidth="6" opacity="0.5" fill="none" />
                <path d="M 300 120 C 400 110 500 150 460 220" stroke="#475569" strokeWidth="6" opacity="0.5" fill="none" />
                <path d="M 300 160 C 180 150 90 200 130 270" stroke="#475569" strokeWidth="6" opacity="0.5" fill="none" />
                <path d="M 300 160 C 420 150 510 200 470 270" stroke="#475569" strokeWidth="6" opacity="0.5" fill="none" />
                <path d="M 300 210 C 170 200 100 250 140 320" stroke="#475569" strokeWidth="6" opacity="0.4" fill="none" />
                <path d="M 300 210 C 430 200 500 250 460 320" stroke="#475569" strokeWidth="6" opacity="0.4" fill="none" />

                {/* Cardiac Silhouette (Heart shadow) */}
                <path
                  d="M 285 180 Q 250 240 230 310 Q 270 345 350 340 Q 380 320 375 250 Q 360 190 285 180 Z"
                  fill="#1e293b"
                  opacity="0.85"
                  stroke="#475569"
                  strokeWidth="2"
                />

                {/* Diaphragmatic domes */}
                <path d="M 110 350 Q 200 320 280 340" stroke="#64748b" strokeWidth="5" fill="none" opacity="0.7" />
                <path d="M 320 340 Q 400 330 490 360" stroke="#64748b" strokeWidth="5" fill="none" opacity="0.7" />

                {/* Aortic knob */}
                <circle cx="280" cy="165" r="16" fill="#334155" opacity="0.6" />

                {/* Annotations */}
                {showAnnotations && (
                  <>
                    <g className="animate-pulse">
                      <circle cx="240" cy="305" r="8" stroke="#38bdf8" strokeWidth="2" fill="#0284c7" fillOpacity="0.3" />
                      <line x1="240" y1="305" x2="160" y2="280" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
                      <rect x="70" y="265" width="90" height="24" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                      <text x="75" y="281" fill="#38bdf8" fontSize="10" fontWeight="bold">Apex (Normal)</text>
                    </g>
                    <g>
                      <circle cx="450" cy="345" r="8" stroke="#10b981" strokeWidth="2" fill="#059669" fillOpacity="0.3" />
                      <line x1="450" y1="345" x2="490" y2="310" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
                      <rect x="475" y="295" width="105" height="24" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="1" />
                      <text x="480" y="311" fill="#10b981" fontSize="10" fontWeight="bold">CP Angle Clear</text>
                    </g>
                  </>
                )}
              </svg>

              {/* Technical DICOM overlay markers */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1.5 rounded border border-slate-700 text-[10px] font-mono text-slate-300">
                <div>PT: {patientName.toUpperCase()}</div>
                <div>ACC: CXR-8921-ZA</div>
                <div>POSITION: ERECT POSTEROANTERIOR</div>
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1.5 rounded border border-slate-700 text-[10px] font-mono text-emerald-400">
                STATUS: REPORT SIGNED • NO CONSOLIDATION
              </div>
            </div>
          </div>
        )}

        {activePresetId === "ecg" && (
          <div
            className="max-w-3xl w-full bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-2xl"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
          >
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="text-white font-bold text-sm">12-LEAD TELEMETRY RHYTHM STRIP</span>
                <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[11px] border border-emerald-800">
                  Normal Sinus Rhythm (74 bpm)
                </span>
              </div>
              <div className="font-mono text-xs text-slate-300">
                SPEED: 25 mm/s • VOLTAGE: 10 mm/mV • FILTER: 0.05-150Hz
              </div>
            </div>

            {/* ECG Grid & Waveform */}
            <div className="relative h-64 w-full bg-[#0a1912] rounded-lg overflow-hidden border border-emerald-900/60 p-2">
              {/* Millimeter grid pattern */}
              <div
                className="absolute inset-0 opacity-25 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #059669 1px, transparent 1px), linear-gradient(to bottom, #059669 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>

              {/* Animated ECG Waveform */}
              <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                {/* Baseline path with 4 P-QRS-T complexes */}
                <path
                  d="
                    M 0 100 L 40 100 
                    Q 50 88 60 100 L 80 100 
                    L 85 110 L 95 20 L 105 130 L 115 100 
                    L 140 100 Q 160 75 180 100 L 240 100
                    
                    Q 250 88 260 100 L 280 100 
                    L 285 110 L 295 20 L 305 130 L 315 100 
                    L 340 100 Q 360 75 380 100 L 440 100
                    
                    Q 450 88 460 100 L 480 100 
                    L 485 110 L 495 20 L 505 130 L 515 100 
                    L 540 100 Q 560 75 580 100 L 640 100

                    Q 650 88 660 100 L 680 100 
                    L 685 110 L 695 20 L 705 130 L 715 100 
                    L 740 100 Q 760 75 780 100 L 800 100
                  "
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Real-time telemetry indicators */}
              <div className="absolute top-2 left-2 flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded text-xs text-emerald-400 font-mono border border-emerald-900/50">
                <span>LEAD II (Continuous)</span>
                <span>PR: 160ms</span>
                <span>QRS: 88ms</span>
                <span>QTc: 420ms</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Axis & Rhythm</span>
                <span className="text-white font-semibold">Normal Axis (+45°), Sinus</span>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[11px]">ST Segment</span>
                <span className="text-emerald-400 font-semibold">Isoelectric (No STEMI/NSTEMI)</span>
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[11px]">Cardiologist Confirmation</span>
                <span className="text-teal-300 font-semibold">Verified by Dr. Sarah Chen</span>
              </div>
            </div>
          </div>
        )}

        {activePresetId === "labs" && (
          <div
            className="max-w-3xl w-full bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-2xl text-slate-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  COMPREHENSIVE METABOLIC & RENAL PANEL (PATHOLOGY)
                </h3>
                <p className="text-xs text-slate-400">Specimen Collected: Fasting Serum • Certified Pathology Laboratory</p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-700/60 rounded-md text-xs font-semibold">
                Validated
              </span>
            </div>

            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2">Analyte / Biomarker</th>
                  <th className="py-2">Patient Value</th>
                  <th className="py-2">Reference Range</th>
                  <th className="py-2">Clinical Interpretation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr>
                  <td className="py-2.5 font-medium text-white">Serum Creatinine</td>
                  <td className="py-2.5 font-bold text-emerald-400">92 µmol/L</td>
                  <td className="py-2.5 text-slate-400">62 - 106 µmol/L</td>
                  <td className="py-2.5 text-slate-300">Within optimal limits</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">eGFR (CKD-EPI Formula)</td>
                  <td className="py-2.5 font-bold text-emerald-400">88 mL/min/1.73m²</td>
                  <td className="py-2.5 text-slate-400">&gt; 60 mL/min/1.73m²</td>
                  <td className="py-2.5 text-slate-300">KDIGO Stage G2 (Mildly Preserved)</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Serum Potassium (K+)</td>
                  <td className="py-2.5 font-bold text-emerald-400">4.3 mmol/L</td>
                  <td className="py-2.5 text-slate-400">3.5 - 5.1 mmol/L</td>
                  <td className="py-2.5 text-slate-300">Normokalemic</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Fasting Blood Glucose</td>
                  <td className="py-2.5 font-bold text-amber-400">5.8 mmol/L</td>
                  <td className="py-2.5 text-slate-400">3.9 - 5.5 mmol/L</td>
                  <td className="py-2.5 text-amber-300">Mildly impaired fasting glucose</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-medium text-white">Total Cholesterol</td>
                  <td className="py-2.5 font-bold text-amber-400">5.2 mmol/L</td>
                  <td className="py-2.5 text-slate-400">&lt; 5.0 mmol/L</td>
                  <td className="py-2.5 text-amber-300">Borderline hypercholesterolemia</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activePresetId === "ehr" && (
          <div
            className="max-w-3xl w-full bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-2xl text-slate-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center center" }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  ELECTRONIC HEALTH RECORD — PROBLEM LIST & COMPLIANCE
                </h3>
                <p className="text-xs text-slate-400">Patient: {patientName} • MRN: MED-890123 • Clinic: Metro Medical</p>
              </div>
              <span className="px-2.5 py-1 bg-teal-950 text-teal-300 border border-teal-700/60 rounded-md text-xs font-semibold">
                POPIA Tier-4 Encrypted
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-semibold block mb-1">Active Chronic Problems:</span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-slate-900 text-slate-200 rounded border border-slate-700">
                    Essential Hypertension (I10.9) - Diagnosed 2021
                  </span>
                  <span className="px-2 py-1 bg-slate-900 text-slate-200 rounded border border-slate-700">
                    Dyslipidemia (E78.0) - Controlled
                  </span>
                </div>
              </div>

              <div className="p-3 bg-rose-950/40 rounded-lg border border-rose-800/60">
                <span className="text-rose-300 font-semibold flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  Critical Allergies & Adverse Drug Reactions:
                </span>
                <span className="text-rose-200">
                  Penicillin (Severe anaphylactoid reaction with bronchospasm) — STRICT CONTRAINDICATION.
                </span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700">
                <span className="text-slate-400 font-semibold block mb-1">Current Medication Compliance:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>• Amlodipine 5mg Daily (100% adherence)</div>
                  <div>• Atorvastatin 20mg Nocté (95% adherence)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls Toolbar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-xl z-20">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
          title="Zoom Out"
          className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono text-slate-300 w-12 text-center">{zoomLevel}%</span>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(200, z + 15))}
          title="Zoom In"
          className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-slate-700 mx-1"></div>

        {activePresetId === "radiology" && (
          <>
            <button
              type="button"
              onClick={() => setShowAnnotations(!showAnnotations)}
              title="Toggle Annotations"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                showAnnotations ? "text-teal-400 bg-slate-800" : "text-slate-400 hover:text-white"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[11px]">Markers</span>
            </button>
            <button
              type="button"
              onClick={() => setInvertContrast(!invertContrast)}
              title="Invert Bone Contrast"
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                invertContrast ? "text-amber-400 bg-slate-800" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="text-[11px]">Invert</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
