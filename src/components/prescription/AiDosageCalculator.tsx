import React, { useState, useEffect } from "react";
import {
  Calculator,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Activity,
  ShieldAlert,
  Info,
  ArrowRight,
  RefreshCw,
  X,
  Stethoscope,
  Pill,
  ChevronDown,
  Check,
  Percent,
  Sliders,
  AlertOctagon,
  Copy
} from "lucide-react";
import { DosageCalculatorInput, DosageRecommendation, RenalCategory } from "../../types";
import { CLINICAL_DRUG_FORMULARY, calculateDosageRecommendation, calculateCockcroftGault } from "../../utils/dosageCalculatorEngine";
import { MOCK_PATIENTS } from "../../data/patients";

interface AiDosageCalculatorProps {
  initialMedication?: string;
  initialIndication?: string;
  initialPatientName?: string;
  initialAge?: number;
  initialWeight?: number;
  initialGender?: "Male" | "Female" | "Other";
  onApplyToPrescription?: (calc: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    directions: string;
  }) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AiDosageCalculator: React.FC<AiDosageCalculatorProps> = ({
  initialMedication = "Amoxicillin / Clavulanate",
  initialIndication = "Community-Acquired Pneumonia",
  initialPatientName = "James Miller",
  initialAge = 52,
  initialWeight = 78,
  initialGender = "Male",
  onApplyToPrescription,
  onClose,
  isModal = false,
}) => {
  // Input states
  const [selectedPatientName, setSelectedPatientName] = useState(initialPatientName);
  const [medicationName, setMedicationName] = useState(initialMedication);
  const [indication, setIndication] = useState(initialIndication);
  const [age, setAge] = useState<number>(initialAge);
  const [weight, setWeight] = useState<number>(initialWeight);
  const [gender, setGender] = useState<"Male" | "Female" | "Other">(initialGender);

  // Renal function parameters
  const [serumCreatinineUnit, setSerumCreatinineUnit] = useState<"umol/L" | "mg/dL">("umol/L");
  const [serumCreatinine, setSerumCreatinine] = useState<number>(145); // e.g. 145 umol/L (~1.64 mg/dL)
  const [eGfr, setEGfr] = useState<number>(42);
  const [isDialysis, setIsDialysis] = useState<boolean>(false);
  const [renalPreset, setRenalPreset] = useState<RenalCategory>("Moderate");
  const [advancedRenalOpen, setAdvancedRenalOpen] = useState<boolean>(false);

  // Calculation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<DosageRecommendation | null>(null);
  const [copiedSig, setCopiedSig] = useState<boolean>(false);

  // Auto-fill from patient selection
  const handleSelectPatient = (patientName: string) => {
    setSelectedPatientName(patientName);
    const found = MOCK_PATIENTS.find((p) => p.name === patientName);
    if (found) {
      setAge(found.age);
      setGender(found.gender === "Female" ? "Female" : "Male");
      if (found.name === "David K. Ndlovu") {
        setWeight(72);
        setSerumCreatinine(185);
        setEGfr(34);
        setRenalPreset("Moderate");
      } else if (found.name === "James Miller") {
        setWeight(82);
        setSerumCreatinine(130);
        setEGfr(52);
        setRenalPreset("Moderate");
      } else if (found.name === "Elena Rostova") {
        setWeight(62);
        setSerumCreatinine(75);
        setEGfr(94);
        setRenalPreset("Normal");
      } else {
        setWeight(68);
        setSerumCreatinine(95);
        setEGfr(72);
        setRenalPreset("Mild");
      }
    }
  };

  // Quick preset button click
  const applyRenalPreset = (category: RenalCategory) => {
    setRenalPreset(category);
    if (category === "Normal") {
      setSerumCreatinine(gender === "Female" ? 70 : 85);
      setEGfr(95);
      setIsDialysis(false);
    } else if (category === "Mild") {
      setSerumCreatinine(gender === "Female" ? 95 : 115);
      setEGfr(70);
      setIsDialysis(false);
    } else if (category === "Moderate") {
      setSerumCreatinine(gender === "Female" ? 140 : 160);
      setEGfr(38);
      setIsDialysis(false);
    } else if (category === "Severe") {
      setSerumCreatinine(gender === "Female" ? 220 : 260);
      setEGfr(22);
      setIsDialysis(false);
    } else if (category === "ESRD" || category === "Hemodialysis") {
      setSerumCreatinine(gender === "Female" ? 450 : 520);
      setEGfr(10);
      setIsDialysis(category === "Hemodialysis");
    }
  };

  // Perform dosage calculation
  const handleCalculateDosage = async () => {
    setIsLoading(true);
    const input: DosageCalculatorInput = {
      patientName: selectedPatientName,
      patientAge: Number(age) || 50,
      patientWeight: Number(weight) || 70,
      patientGender: gender,
      medicationName: medicationName.trim(),
      indication: indication.trim(),
      serumCreatinine: Number(serumCreatinine),
      serumCreatinineUnit,
      eGfr: Number(eGfr),
      renalCategory: renalPreset,
      isDialysis,
    };

    try {
      const res = await fetch("/api/dosage/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data: DosageRecommendation = await res.json();
        setRecommendation(data);
      } else {
        // Fallback to client-side pharmacokinetic engine
        const fallback = calculateDosageRecommendation(input);
        setRecommendation(fallback);
      }
    } catch (err) {
      console.warn("API request failed, using client-side fallback:", err);
      const fallback = calculateDosageRecommendation(input);
      setRecommendation(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial calculation when mounted
  useEffect(() => {
    handleCalculateDosage();
  }, []);

  const handleCopyDirections = () => {
    if (recommendation?.calculatedDirections) {
      navigator.clipboard.writeText(recommendation.calculatedDirections);
      setCopiedSig(true);
      setTimeout(() => setCopiedSig(false), 2000);
    }
  };

  const handleApply = () => {
    if (onApplyToPrescription && recommendation) {
      onApplyToPrescription({
        medication: `${recommendation.medicationName} ${recommendation.recommendedDose}`,
        dosage: recommendation.recommendedDose,
        frequency: recommendation.suggestedFrequency,
        duration: recommendation.suggestedDuration,
        directions: recommendation.calculatedDirections,
      });
    }
  };

  // Computed Live Cockcroft-Gault CrCl for display
  const liveCrCl = calculateCockcroftGault({
    age: Number(age) || 50,
    weightKg: Number(weight) || 70,
    gender,
    serumCreatinineUmolL: serumCreatinineUnit === "umol/L" ? Number(serumCreatinine) : undefined,
    serumCreatinineMgDl: serumCreatinineUnit === "mg/dL" ? Number(serumCreatinine) : undefined,
  });

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${
        isModal ? "w-full max-w-4xl max-h-[90vh]" : "w-full"
      }`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-600/30 rounded-xl border border-teal-400/20 backdrop-blur-xs">
            <Calculator className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">AI Dosage & Renal Adjustment Calculator</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-400/20 text-teal-200 border border-teal-400/30">
                Gemini 3.8 Flash • KDIGO
              </span>
            </div>
            <p className="text-xs text-teal-100/70 mt-0.5">
              Evidence-based pharmacokinetic dosing, frequency, and duration calibrated to renal clearance & patient demographics
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
        {/* Top Control Grid: Medication + Patient & Renal inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Drug & Patient Demographics (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  Target Medication & Indication
                </span>
              </div>

              {/* Medication Selector / Search */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Medication Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={medicationName}
                    onChange={(e) => setMedicationName(e.target.value)}
                    placeholder="e.g. Amoxicillin / Clavulanate, Ciprofloxacin, Metformin"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                  />
                </div>

                {/* Quick Medication Formulary Pills */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {CLINICAL_DRUG_FORMULARY.slice(0, 6).map((drug) => (
                    <button
                      key={drug.genericName}
                      onClick={() => {
                        setMedicationName(drug.genericName);
                        if (drug.defaultIndications[0]) setIndication(drug.defaultIndications[0]);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition-colors ${
                        medicationName.toLowerCase().includes(drug.genericName.toLowerCase().split(" ")[0])
                          ? "bg-teal-600 text-white border-teal-600 font-bold"
                          : "bg-white text-slate-600 border-slate-200 hover:border-teal-300 hover:text-teal-700"
                      }`}
                    >
                      {drug.genericName.split("/")[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clinical Indication */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Clinical Indication</label>
                <input
                  type="text"
                  value={indication}
                  onChange={(e) => setIndication(e.target.value)}
                  placeholder="e.g. Pyelonephritis, Pneumonia, DVT Prophylaxis"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                />
              </div>

              {/* Patient Selection Dropdown */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Patient Profile</span>
                  <span className="text-[10px] text-teal-600 font-normal">Auto-fills age, weight & creatinine</span>
                </label>
                <select
                  value={selectedPatientName}
                  onChange={(e) => handleSelectPatient(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="James Miller">James Miller (52y, 82kg — Chronic Hypertension)</option>
                  <option value="David K. Ndlovu">David K. Ndlovu (64y, 72kg — Type 2 Diabetes, CKD G3b)</option>
                  <option value="Elena Rostova">Elena Rostova (38y, 62kg — Acute Sinusitis)</option>
                  <option value="Amina Patel">Amina Patel (45y, 68kg — Mild Renal Impairment)</option>
                  <option value="Custom Patient">Custom Demographic Input</option>
                </select>
              </div>

              {/* Age, Weight, Gender Inputs */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                    Age (years)
                    {age < 18 ? (
                      <span className="ml-1 text-[9px] text-amber-600 font-bold">Peds</span>
                    ) : age >= 65 ? (
                      <span className="ml-1 text-[9px] text-indigo-600 font-bold">Elderly</span>
                    ) : null}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={110}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min={5}
                    max={250}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-1">Biological Sex</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                    className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none"
                  >
                    <option value="Male">Male (×1.0)</option>
                    <option value="Female">Female (×0.85)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Renal Function Profile & Cockcroft-Gault Calculator (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-teal-600" />
                  Renal Function & Clearance Profile
                </span>
                <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  CrCl: {liveCrCl.crCl} mL/min
                </span>
              </div>

              {/* Renal Stage Category Presets */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                  Select Renal Category or KDIGO Stage
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyRenalPreset("Normal")}
                    className={`p-2 rounded-lg text-left text-[11px] border transition-all ${
                      renalPreset === "Normal"
                        ? "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50"
                    }`}
                  >
                    <div className="font-semibold text-[10px]">Normal (G1)</div>
                    <div className="text-[9px] opacity-80">≥ 90 mL/min</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyRenalPreset("Mild")}
                    className={`p-2 rounded-lg text-left text-[11px] border transition-all ${
                      renalPreset === "Mild"
                        ? "bg-teal-600 text-white border-teal-600 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-teal-50"
                    }`}
                  >
                    <div className="font-semibold text-[10px]">Mild (G2)</div>
                    <div className="text-[9px] opacity-80">60-89 mL/min</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyRenalPreset("Moderate")}
                    className={`p-2 rounded-lg text-left text-[11px] border transition-all ${
                      renalPreset === "Moderate"
                        ? "bg-amber-600 text-white border-amber-600 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-amber-50"
                    }`}
                  >
                    <div className="font-semibold text-[10px]">Moderate (G3)</div>
                    <div className="text-[9px] opacity-80">30-59 mL/min</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyRenalPreset("Severe")}
                    className={`p-2 rounded-lg text-left text-[11px] border transition-all ${
                      renalPreset === "Severe"
                        ? "bg-orange-600 text-white border-orange-600 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-orange-50"
                    }`}
                  >
                    <div className="font-semibold text-[10px]">Severe (G4)</div>
                    <div className="text-[9px] opacity-80">15-29 mL/min</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyRenalPreset("Hemodialysis")}
                    className={`p-2 rounded-lg text-left text-[11px] border transition-all col-span-2 sm:col-span-1 ${
                      renalPreset === "Hemodialysis" || renalPreset === "ESRD"
                        ? "bg-rose-700 text-white border-rose-700 font-bold shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50"
                    }`}
                  >
                    <div className="font-semibold text-[10px]">Dialysis / G5</div>
                    <div className="text-[9px] opacity-80">&lt; 15 mL/min</div>
                  </button>
                </div>
              </div>

              {/* Lab Values: Serum Creatinine & eGFR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">Serum Creatinine</label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setSerumCreatinineUnit("umol/L")}
                        className={`px-1.5 py-0.5 rounded ${
                          serumCreatinineUnit === "umol/L" ? "bg-teal-600 text-white font-bold" : "text-slate-500"
                        }`}
                      >
                        μmol/L
                      </button>
                      <span>|</span>
                      <button
                        type="button"
                        onClick={() => setSerumCreatinineUnit("mg/dL")}
                        className={`px-1.5 py-0.5 rounded ${
                          serumCreatinineUnit === "mg/dL" ? "bg-teal-600 text-white font-bold" : "text-slate-500"
                        }`}
                      >
                        mg/dL
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    step={serumCreatinineUnit === "mg/dL" ? "0.1" : "1"}
                    value={serumCreatinine}
                    onChange={(e) => setSerumCreatinine(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Normal reference: 60-110 μmol/L (0.7-1.2 mg/dL)
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    eGFR (CKD-EPI mL/min/1.73m²)
                  </label>
                  <input
                    type="number"
                    value={eGfr}
                    onChange={(e) => setEGfr(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 font-mono font-medium focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDialysis}
                        onChange={(e) => setIsDialysis(e.target.checked)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
                      />
                      <span>Active Hemodialysis Patient</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Formula Rationale Callout */}
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-[11px] text-slate-600 font-mono flex items-center justify-between">
                <span className="truncate">{liveCrCl.explanation}</span>
                <span className="ml-2 shrink-0 px-2 py-0.5 bg-slate-100 rounded text-[10px] font-sans font-bold text-slate-700">
                  {liveCrCl.kdigoStage.split("(")[0].trim()}
                </span>
              </div>
            </div>

            {/* Calculate Action Button */}
            <div className="flex justify-end">
              <button
                type="button"
                id="btn-calculate-dosage-action"
                onClick={handleCalculateDosage}
                disabled={isLoading}
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Pharmacokinetics & Renal Clearance...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-teal-200" />
                    <span>Calculate AI Dosage & Sig</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Display Section */}
        {recommendation && (
          <div className="space-y-4 pt-2 border-t border-slate-200 animate-in fade-in duration-200">
            {/* Recommendation Highlight Card */}
            <div
              className={`p-5 rounded-2xl border ${
                recommendation.contraindicated
                  ? "bg-rose-50/80 border-rose-300 text-rose-950"
                  : recommendation.isRenalAdjustmentRequired
                  ? "bg-amber-50/70 border-amber-300 text-amber-950"
                  : "bg-emerald-50/70 border-emerald-300 text-emerald-950"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Recommendation for {recommendation.medicationName}
                    </span>
                    {recommendation.contraindicated ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-200 text-rose-900 border border-rose-300 flex items-center gap-1">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        CONTRAINDICATED IN THIS RENAL STAGE
                      </span>
                    ) : recommendation.isRenalAdjustmentRequired ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Percent className="w-3.5 h-3.5" />
                        Renal Adjustment Applied {recommendation.adjustmentPercentage ? `(${recommendation.adjustmentPercentage}%)` : ""}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-200 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Standard Unadjusted Dosage
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/80 border border-slate-200 text-slate-700">
                      CrCl: {recommendation.calculatedCrCl} mL/min ({recommendation.kdigoStage})
                    </span>
                  </div>

                  {/* Big Headline Recommendation */}
                  <div className="mt-3">
                    <div className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                      {recommendation.recommendedDose}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-600" />
                        Frequency: <strong>{recommendation.suggestedFrequency}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        Duration: <strong>{recommendation.suggestedDuration}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Standard vs Adjusted Metric comparison */}
                <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-xs space-y-1 sm:min-w-[200px]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Baseline Comparison</div>
                  <div className="flex justify-between items-center text-slate-600 text-[11px]">
                    <span>Standard Dose:</span>
                    <strong className="text-slate-800">{recommendation.standardDose || "Standard labeled"}</strong>
                  </div>
                  <div className="flex justify-between items-center text-teal-800 text-[11px] pt-1 border-t border-slate-100">
                    <span>Adjusted Dose:</span>
                    <strong className="font-bold">{recommendation.recommendedDose}</strong>
                  </div>
                </div>
              </div>

              {/* Adjustment Summary */}
              <div className="mt-3.5 p-3 bg-white/90 rounded-xl border border-slate-200/70 text-xs text-slate-800 space-y-2">
                <div className="flex items-start gap-2 font-medium">
                  <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <span>{recommendation.adjustmentSummary}</span>
                </div>

                {/* Sig / Directions box */}
                <div className="p-2.5 bg-slate-900 text-teal-200 rounded-lg font-mono text-xs flex items-center justify-between gap-3 shadow-inner">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-sans">
                      Prescription Label Sig (Directions):
                    </span>
                    <span className="text-white font-sans text-xs font-semibold">{recommendation.calculatedDirections}</span>
                  </div>
                  <button
                    onClick={handleCopyDirections}
                    title="Copy Sig to clipboard"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md shrink-0 transition-colors"
                  >
                    {copiedSig ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Alternative Options if Contraindicated */}
              {recommendation.contraindicated && recommendation.alternativeOptions && (
                <div className="mt-3 p-3 bg-rose-100/90 border border-rose-300 rounded-xl text-xs space-y-1">
                  <div className="font-bold text-rose-900 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-700" />
                    Recommended Safer Clinical Alternatives (No Renal Elimination):
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {recommendation.alternativeOptions.map((alt, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-white text-rose-900 font-semibold rounded-md border border-rose-300 text-xs"
                      >
                        {alt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Deep Clinical Insights: Pharmacokinetics & Safety Monitoring */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pharmacokinetic Rationale */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Pharmacokinetic Clearance Mechanism
                </div>
                <p className="text-slate-700 leading-relaxed">{recommendation.pharmacokineticRationale}</p>
                {recommendation.pediatricOrGeriatricNote && (
                  <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 text-[11px] font-medium">
                    {recommendation.pediatricOrGeriatricNote}
                  </div>
                )}
              </div>

              {/* Safety Alerts & Monitoring Guidelines */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Therapeutic Monitoring & Safety Alerts
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Required Surveillance:</div>
                  <ul className="space-y-1 text-slate-700 text-[11px]">
                    {recommendation.monitoringGuidelines.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {recommendation.safetyAlerts.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 space-y-1">
                    <div className="text-[10px] uppercase font-bold text-rose-600">Key Safety Warnings:</div>
                    <ul className="space-y-1 text-rose-900 text-[11px]">
                      {recommendation.safetyAlerts.map((warn, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{warn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar: Transfer into Prescription */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 text-center sm:text-left">
                {onApplyToPrescription
                  ? "Clicking 'Apply to Prescription' will automatically pre-fill the medication, dosage, frequency, and directions onto your active draft."
                  : "Clinical decision support generated according to validated pharmacopeial references."}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {isModal && onClose && (
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                )}

                {onApplyToPrescription && (
                  <button
                    type="button"
                    id="btn-apply-calculated-dose"
                    onClick={handleApply}
                    className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Apply to Prescription Draft</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
