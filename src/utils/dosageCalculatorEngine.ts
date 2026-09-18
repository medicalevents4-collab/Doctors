import { DosageCalculatorInput, DosageRecommendation, RenalCategory } from "../types";

export interface DrugDosingRule {
  genericName: string;
  brandNames: string[];
  therapeuticClass: string;
  standardDose: string;
  standardFrequency: string;
  standardDuration: string;
  route: string;
  isRenallyEliminated: boolean;
  clearancePathway: string;
  defaultIndications: string[];
  calculate: (input: DosageCalculatorInput, crCl: number, age: number, weight: number) => {
    recommendedDose: string;
    suggestedFrequency: string;
    suggestedDuration: string;
    calculatedDirections: string;
    isRenalAdjustmentRequired: boolean;
    adjustmentPercentage?: number;
    adjustmentSummary: string;
    rationale: string;
    monitoring: string[];
    alerts: string[];
    contraindicated: boolean;
    alternativeOptions?: string[];
  };
}

/**
 * Calculates Cockcroft-Gault Creatinine Clearance (mL/min)
 * CrCl = [ (140 - age) * weight(kg) ] / (72 * sCr(mg/dL)) * (0.85 if female)
 * If sCr in umol/L: sCr(mg/dL) = sCr(umol/L) / 88.42
 */
export function calculateCockcroftGault(params: {
  age: number;
  weightKg: number;
  gender: "Male" | "Female" | "Other";
  serumCreatinineUmolL?: number;
  serumCreatinineMgDl?: number;
}): { crCl: number; explanation: string; kdigoStage: string; renalCategory: RenalCategory } {
  const age = Math.max(1, params.age);
  const weight = Math.max(1, params.weightKg);
  const isFemale = params.gender === "Female";

  let sCrMgDl = 1.0; // default healthy baseline 1.0 mg/dL (88.4 umol/L)
  if (params.serumCreatinineMgDl && params.serumCreatinineMgDl > 0) {
    sCrMgDl = params.serumCreatinineMgDl;
  } else if (params.serumCreatinineUmolL && params.serumCreatinineUmolL > 0) {
    sCrMgDl = params.serumCreatinineUmolL / 88.42;
  }

  const genderFactor = isFemale ? 0.85 : 1.0;
  const rawCrCl = ((140 - age) * weight * genderFactor) / (72 * sCrMgDl);
  const crCl = Math.max(5, Math.round(rawCrCl * 10) / 10);

  let kdigoStage = "G1 (Normal or High, ≥ 90 mL/min)";
  let renalCategory: RenalCategory = "Normal";

  if (crCl >= 90) {
    kdigoStage = "G1 (Normal, CrCl ≥ 90 mL/min)";
    renalCategory = "Normal";
  } else if (crCl >= 60) {
    kdigoStage = "G2 (Mild Reduction, CrCl 60-89 mL/min)";
    renalCategory = "Mild";
  } else if (crCl >= 45) {
    kdigoStage = "G3a (Mild-to-Moderate Reduction, CrCl 45-59 mL/min)";
    renalCategory = "Moderate";
  } else if (crCl >= 30) {
    kdigoStage = "G3b (Moderate-to-Severe Reduction, CrCl 30-44 mL/min)";
    renalCategory = "Moderate";
  } else if (crCl >= 15) {
    kdigoStage = "G4 (Severe Reduction, CrCl 15-29 mL/min)";
    renalCategory = "Severe";
  } else {
    kdigoStage = "G5 (Kidney Failure / End-Stage, CrCl < 15 mL/min)";
    renalCategory = "ESRD";
  }

  const explanation = `Cockcroft-Gault CrCl = [(140 - ${age}) × ${weight} kg × ${isFemale ? "0.85 (female)" : "1.00 (male)"}] ÷ (72 × ${sCrMgDl.toFixed(2)} mg/dL) = ${crCl} mL/min`;

  return { crCl, explanation, kdigoStage, renalCategory };
}

// Preset Clinical Formulary with Verified Renal Kinetic Guidelines
export const CLINICAL_DRUG_FORMULARY: DrugDosingRule[] = [
  {
    genericName: "Amoxicillin / Clavulanate",
    brandNames: ["Augmentin", "Curam", "Clamentin"],
    therapeuticClass: "Aminopenicillin + Beta-lactamase Inhibitor",
    standardDose: "875/125 mg PO",
    standardFrequency: "Every 12 hours (BD)",
    standardDuration: "7 to 10 days",
    route: "Oral",
    isRenallyEliminated: true,
    clearancePathway: "Renal glomerular filtration and active tubular secretion (50-70% excreted unchanged)",
    defaultIndications: ["Community-Acquired Pneumonia", "Acute Bacterial Sinusitis", "Complicated UTI", "Bite Wound / Soft Tissue"],
    calculate: (input, crCl, age, weight) => {
      if (age < 12) {
        // Pediatric weight-based dosing (45 mg/kg/day divided q12h)
        const totalMg = Math.round(weight * 45);
        const singleDose = Math.round(totalMg / 2);
        return {
          recommendedDose: `${singleDose} mg (amoxicillin component) PO`,
          suggestedFrequency: crCl < 30 ? "Every 12 to 24 hours" : "Every 12 hours",
          suggestedDuration: "7 to 10 days",
          calculatedDirections: `Give ${singleDose}mg orally twice daily with meals for 7 to 10 days (based on ${weight}kg pediatric weight).`,
          isRenalAdjustmentRequired: crCl < 30,
          adjustmentPercentage: crCl < 30 ? -33 : undefined,
          adjustmentSummary: crCl < 30 ? "Dose reduced and interval adjusted for pediatric renal clearance." : "Weight-adjusted pediatric dose (45 mg/kg/day).",
          rationale: "Pediatric dosing calibrated by body weight (45 mg/kg/day amoxicillin).",
          monitoring: ["Diarrhea/GI tolerance", "Hydration status"],
          alerts: ["Contains clavulanic acid; avoid extra clavulanate if using multiple suspensions."],
          contraindicated: false,
        };
      }

      if (crCl >= 50) {
        return {
          recommendedDose: "875/125 mg PO",
          suggestedFrequency: "Every 12 hours (BD)",
          suggestedDuration: "7 to 10 days",
          calculatedDirections: "Take 1 tablet (875/125mg) orally every 12 hours with meals for 7 to 10 days.",
          isRenalAdjustmentRequired: false,
          adjustmentSummary: "Standard adult dosing. Preserved creatinine clearance (CrCl ≥ 50 mL/min).",
          rationale: "Adequate renal clearance ensures proper elimination without active drug accumulation.",
          monitoring: ["Resolution of fever and infection symptoms", "Gastrointestinal tolerance"],
          alerts: ["Counsel patient to take at start of meal to minimize GI upset."],
          contraindicated: false,
        };
      } else if (crCl >= 30) {
        return {
          recommendedDose: "500/125 mg PO",
          suggestedFrequency: "Every 12 hours (BD)",
          suggestedDuration: "7 to 10 days",
          calculatedDirections: "Take 1 tablet (500/125mg) orally every 12 hours with food for 7 to 10 days.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -43,
          adjustmentSummary: "Dose reduced from 875mg to 500mg q12h for Moderate Renal Impairment (CrCl 30-49 mL/min). Avoid 875mg formulation.",
          rationale: "Amoxicillin half-life is extended from 1 hour to 3-4 hours; 875mg dose risks accumulation.",
          monitoring: ["Serum creatinine / BUN", "GI symptoms (nausea, loose stools)"],
          alerts: ["Do not prescribe 875/125mg tablets in patients with CrCl < 30-50 mL/min."],
          contraindicated: false,
        };
      } else if (crCl >= 10) {
        return {
          recommendedDose: "500/125 mg PO",
          suggestedFrequency: "Every 12 hours (BD)",
          suggestedDuration: "7 to 10 days",
          calculatedDirections: "Take 1 tablet (500/125mg) orally every 12 hours with food for 7 days. Monitor renal markers.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -50,
          adjustmentSummary: "Severe Renal Impairment (CrCl 10-29 mL/min): 500/125mg every 12 hours. Never use 875mg formulation.",
          rationale: "Significantly decreased tubular clearance delays excretion. Extended interval maintains therapeutic AUC without peak toxicity.",
          monitoring: ["Electrolytes", "Renal function panel at day 4-5", "Signs of neurotoxicity"],
          alerts: ["Risk of neurotoxicity (encephalopathy, myoclonus) if high penicillins accumulate."],
          contraindicated: false,
        };
      } else {
        // CrCl < 10 or Dialysis
        return {
          recommendedDose: "500/125 mg PO",
          suggestedFrequency: "Every 24 hours (Once daily)",
          suggestedDuration: "7 days",
          calculatedDirections: "Take 1 tablet (500/125mg) orally every 24 hours. If hemodialysis, take dose immediately after dialysis session.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -70,
          adjustmentSummary: "End-Stage Renal Disease (CrCl < 10 mL/min): Interval lengthened to once every 24 hours. Post-hemodialysis dosing.",
          rationale: "Half-life extends to 7-10 hours in end-stage renal failure. Both amoxicillin and clavulanic acid are removed by hemodialysis.",
          monitoring: ["Clinical response", "Post-dialysis supplemental requirements"],
          alerts: ["Dialyzable drug: administer dose strictly following hemodialysis."],
          contraindicated: false,
        };
      }
    },
  },
  {
    genericName: "Ciprofloxacin",
    brandNames: ["Cipro", "Cifran", "Ciprobay"],
    therapeuticClass: "Fluoroquinolone Antibiotic",
    standardDose: "500 mg PO",
    standardFrequency: "Every 12 hours (BD)",
    standardDuration: "7 days (Pyelonephritis) or 3-5 days (Cystitis)",
    route: "Oral / IV",
    isRenallyEliminated: true,
    clearancePathway: "Dual clearance: 40-50% excreted unchanged in urine by filtration & secretion; 20-35% biliary/fecal",
    defaultIndications: ["Complicated UTI / Acute Pyelonephritis", "Infectious Diarrhea", "Prostatitis", "Intra-abdominal Infection"],
    calculate: (input, crCl, age, weight) => {
      if (age < 18) {
        return {
          recommendedDose: `${Math.min(500, Math.round(weight * 10))} mg PO`,
          suggestedFrequency: "Every 12 hours",
          suggestedDuration: "7 to 10 days",
          calculatedDirections: `Administer ${Math.min(500, Math.round(weight * 10))}mg orally every 12 hours for 7 days.`,
          isRenalAdjustmentRequired: crCl < 50,
          adjustmentSummary: "Pediatric fluoroquinolone use restricted to specific indications (e.g. Pseudomonas or cystic fibrosis).",
          rationale: "Relative contraindication in pediatrics due to cartilage arthropathy; reserved for resistant pathogens.",
          monitoring: ["Arthralgia", "Tendon pain", "Hydration"],
          alerts: ["Black Box Warning: Tendinitis and tendon rupture risk."],
          contraindicated: false,
        };
      }

      if (crCl >= 50) {
        return {
          recommendedDose: "500 mg PO",
          suggestedFrequency: "Every 12 hours (BD)",
          suggestedDuration: "7 days",
          calculatedDirections: "Take 500mg orally every 12 hours with a full glass of water for 7 days. Maintain high hydration.",
          isRenalAdjustmentRequired: false,
          adjustmentSummary: "Standard adult dosage. CrCl ≥ 50 mL/min preserves normal fluoroquinolone excretion.",
          rationale: "Hepatic and renal elimination pathways fully intact.",
          monitoring: ["Resolution of urinary/systemic symptoms", "QT interval if on antiarrhythmics"],
          alerts: ["Avoid co-administration with dairy, antacids, or iron within 2 hours."],
          contraindicated: false,
        };
      } else if (crCl >= 30) {
        return {
          recommendedDose: "250 to 500 mg PO",
          suggestedFrequency: "Every 12 hours (BD)",
          suggestedDuration: "7 days",
          calculatedDirections: "Take 250mg orally every 12 hours (or 500mg q12h if severe deep tissue infection) for 7 days.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -50,
          adjustmentSummary: "Moderate Renal Impairment (CrCl 30-49 mL/min): Reduce dose to 250-500mg q12h depending on infection severity.",
          rationale: "Renal clearance is reduced by ~45%; drug accumulation increases central nervous system excitability.",
          monitoring: ["CNS symptoms (confusion, tremor, dizziness)", "Hydration to prevent crystalluria"],
          alerts: ["Elderly patients have higher risk of neurotoxicity and confusion."],
          contraindicated: false,
        };
      } else {
        // CrCl < 30 or ESRD
        return {
          recommendedDose: "250 to 500 mg PO",
          suggestedFrequency: "Every 18 to 24 hours (Extended Interval)",
          suggestedDuration: "7 days",
          calculatedDirections: "Take 250mg orally every 24 hours (or 500mg q24h for severe systemic infection) for 7 days.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -50,
          adjustmentSummary: "Severe Renal Impairment (CrCl < 30 mL/min): Dose reduced by 50% and interval extended to every 18-24 hours.",
          rationale: "Elimination half-life doubles from 4 hours to 8-9 hours in severe renal insufficiency.",
          monitoring: ["ECG for QTc prolongation", "Neurotoxicity / seizure threshold", "Tendon pain"],
          alerts: ["High risk of CNS toxicity (hallucinations, seizures) in advanced renal failure."],
          contraindicated: false,
        };
      }
    },
  },
  {
    genericName: "Metformin",
    brandNames: ["Glucophage", "Formet", "Bigsens"],
    therapeuticClass: "Biguanide Antidiabetic",
    standardDose: "850 mg to 1000 mg PO",
    standardFrequency: "Twice daily (BD) with meals",
    standardDuration: "Chronic (30 days supply with 2 refills)",
    route: "Oral",
    isRenallyEliminated: true,
    clearancePathway: "Exclusively eliminated by kidneys via active tubular secretion (90% cleared within 24h unchanged)",
    defaultIndications: ["Type 2 Diabetes Mellitus", "Insulin Resistance", "PCOS"],
    calculate: (input, crCl, age, weight) => {
      if (crCl >= 60) {
        return {
          recommendedDose: "850 mg to 1000 mg PO",
          suggestedFrequency: "Twice daily (BD) with meals",
          suggestedDuration: "30 days supply (refillable)",
          calculatedDirections: "Take 1 tablet (850mg) orally twice daily with morning and evening meals.",
          isRenalAdjustmentRequired: false,
          adjustmentSummary: "Normal renal clearance (CrCl/eGFR ≥ 60 mL/min). Maximum dose 2000-2550 mg/day permitted.",
          rationale: "Intact renal tubular secretion rapidly eliminates metformin, preventing lactate accumulation.",
          monitoring: ["eGFR annually", "HbA1c quarterly", "Vitamin B12 levels"],
          alerts: ["Hold temporarily 48h prior to and after iodinated IV radiocontrast procedures."],
          contraindicated: false,
        };
      } else if (crCl >= 45) {
        return {
          recommendedDose: "500 mg to 850 mg PO",
          suggestedFrequency: "Twice daily (Max 1500 mg/day)",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 500mg orally twice daily with meals (maximum total daily dose 1000-1500 mg).",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -33,
          adjustmentSummary: "Mild-to-Moderate CKD (CrCl/eGFR 45-59 mL/min): Cap total daily dose at 1000-1500 mg. Check eGFR every 3-6 months.",
          rationale: "Modest renal impairment decreases elimination rate. Capping at 1500mg maintains safety margin.",
          monitoring: ["eGFR and Serum Creatinine every 3 to 6 months", "Serum bicarbonate / electrolytes"],
          alerts: ["Advise patient to withhold medication immediately if experiencing dehydration, vomiting, or acute fever."],
          contraindicated: false,
        };
      } else if (crCl >= 30) {
        return {
          recommendedDose: "500 mg PO",
          suggestedFrequency: "Once daily (Max 500-1000 mg/day)",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 500mg orally once daily with dinner. Do NOT exceed 1000mg/day. Regular renal surveillance mandatory.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -50,
          adjustmentSummary: "Moderate-to-Severe CKD (CrCl/eGFR 30-44 mL/min): Dose reduced by 50% (max 500-1000mg/day). Do NOT initiate new therapy at this stage.",
          rationale: "Significant risk of drug accumulation. FDA/KDIGO guidelines state: if already on metformin, cut dose by 50%; do not initiate de novo.",
          monitoring: ["eGFR every 3 months", "Arterial/venous blood gas if acute illness develops", "Lactate"],
          alerts: ["High risk: Stop drug immediately if patient becomes acutely ill or dehydrated."],
          contraindicated: false,
          alternativeOptions: ["DPP-4 inhibitor (Linagliptin - no renal adjustment)", "GLP-1 RA", "Insulin"],
        };
      } else {
        // CrCl < 30 or Dialysis
        return {
          recommendedDose: "DISCONTINUE / CONTRAINDICATED (0 mg)",
          suggestedFrequency: "CONTRAINDICATED",
          suggestedDuration: "N/A - Switch to renal-safe antidiabetic agent",
          calculatedDirections: "CONTRAINDICATED: Do not prescribe metformin when CrCl or eGFR < 30 mL/min. Switch patient to Linagliptin or Insulin.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -100,
          adjustmentSummary: "STRICT CONTRAINDICATION: CrCl < 30 mL/min. Severe risk of Metformin-Associated Lactic Acidosis (MALA, mortality up to 50%).",
          rationale: "Metformin clearance is purely renal. Severe impairment leads to massive systemic accumulation and inhibition of hepatic gluconeogenesis/lactate clearance.",
          monitoring: ["Emergency serum lactate if recent ingestion", "Bicarbonate / Anion gap", "Blood glucose monitoring on alternative agent"],
          alerts: ["CRITICAL ALERT: Metformin is strictly contraindicated in Stage 4-5 CKD and dialysis patients."],
          contraindicated: true,
          alternativeOptions: ["Linagliptin 5mg PO daily (no renal adjustment required)", "Gliclazide MR (low dose)", "Basal Insulin"],
        };
      }
    },
  },
  {
    genericName: "Enoxaparin",
    brandNames: ["Clexane", "Lovenox"],
    therapeuticClass: "Low Molecular Weight Heparin (LMWH) Anticoagulant",
    standardDose: "1 mg/kg SC (Treatment) or 40 mg SC (Prophylaxis)",
    standardFrequency: "Every 12 hours (Treatment) or Every 24 hours (Prophylaxis)",
    standardDuration: "5 to 10 days (or until INR therapeutic on Warfarin / DOAC)",
    route: "Subcutaneous (SC)",
    isRenallyEliminated: true,
    clearancePathway: "Renal excretion of active fragments (80% of anti-Xa activity cleared renally)",
    defaultIndications: ["Deep Vein Thrombosis (DVT) Treatment", "Pulmonary Embolism (PE)", "Non-ST Elevation ACS / NSTEMI", "VTE Prophylaxis"],
    calculate: (input, crCl, age, weight) => {
      const isProphylaxis = input.indication?.toLowerCase().includes("proph") || input.indication?.toLowerCase().includes("prevent");
      
      if (crCl >= 30) {
        if (isProphylaxis) {
          return {
            recommendedDose: "40 mg SC",
            suggestedFrequency: "Once daily (Every 24 hours)",
            suggestedDuration: "7 to 10 days (or hospital stay duration)",
            calculatedDirections: "Inject 40mg subcutaneously once daily into anterolateral abdominal wall.",
            isRenalAdjustmentRequired: false,
            adjustmentSummary: "Standard VTE prophylaxis dosing. CrCl ≥ 30 mL/min maintains safe anti-Xa clearance.",
            rationale: "Normal elimination rate avoids cumulative systemic anticoagulation.",
            monitoring: ["Platelet count (rule out HIT on day 4-7)", "Signs of occult bleeding", "Hemoglobin / Hematocrit"],
            alerts: ["Avoid intramuscular injections while on anticoagulant."],
            contraindicated: false,
          };
        } else {
          // Therapeutic anticoagulation
          const doseMg = Math.round(weight * 1);
          return {
            recommendedDose: `${doseMg} mg SC (1 mg/kg)`,
            suggestedFrequency: "Every 12 hours (BD)",
            suggestedDuration: "5 to 7 days",
            calculatedDirections: `Inject ${doseMg}mg (1 mg/kg based on ${weight}kg weight) subcutaneously every 12 hours for 5 to 7 days.`,
            isRenalAdjustmentRequired: false,
            adjustmentSummary: `Standard therapeutic weight-based dose (1 mg/kg q12h for ${weight}kg patient). CrCl ≥ 30 mL/min.`,
            rationale: "Weight-adjusted dosing provides predictable therapeutic anti-Xa levels without routine monitoring.",
            monitoring: ["Baseline CBC (platelets, hematocrit)", "Stool for occult blood", "Serum creatinine"],
            alerts: ["Observe for retroperitoneal, GI, or intracranial hemorrhage."],
            contraindicated: false,
          };
        }
      } else {
        // Severe renal impairment (CrCl < 30 mL/min)
        if (isProphylaxis) {
          return {
            recommendedDose: "20 mg SC",
            suggestedFrequency: "Once daily (Every 24 hours)",
            suggestedDuration: "7 to 10 days",
            calculatedDirections: "Inject 20mg subcutaneously once daily. Dose reduced by 50% for severe renal impairment.",
            isRenalAdjustmentRequired: true,
            adjustmentPercentage: -50,
            adjustmentSummary: "Severe Renal Impairment (CrCl < 30 mL/min): Prophylaxis dose reduced from 40mg to 20mg once daily.",
            rationale: "Anti-Xa clearance is prolonged by 30-45%. 20mg maintains target prophylactic anti-Xa levels without drug accumulation.",
            monitoring: ["Platelets", "Hemoglobin", "Anti-Xa activity level if available (target 0.2-0.4 IU/mL)"],
            alerts: ["Significantly higher risk of major bleeding in severe renal impairment."],
            contraindicated: false,
          };
        } else {
          // Therapeutic treatment
          const doseMg = Math.round(weight * 1);
          return {
            recommendedDose: `${doseMg} mg SC (1 mg/kg)`,
            suggestedFrequency: "Every 24 hours (ONCE daily instead of BD)",
            suggestedDuration: "5 to 7 days",
            calculatedDirections: `Inject ${doseMg}mg (1 mg/kg) subcutaneously ONCE every 24 hours (frequency reduced from q12h to q24h). Order peak anti-Xa level.`,
            isRenalAdjustmentRequired: true,
            adjustmentPercentage: -50,
            adjustmentSummary: "Severe Renal Impairment (CrCl < 30 mL/min): Frequency modified from 1 mg/kg q12h to 1 mg/kg q24h (50% overall daily reduction).",
            rationale: "Prolonged elimination half-life causes cumulative supra-therapeutic anti-Xa levels if given twice daily. Unfractionated heparin (UFH) preferred if CrCl < 15.",
            monitoring: ["Peak Anti-Xa level 4 hours post-dose (target 0.5-1.0 IU/mL)", "Daily hematocrit & platelet count"],
            alerts: ["If CrCl < 15 mL/min, IV Unfractionated Heparin (UFH) with aPTT monitoring is clinically preferred over LMWH."],
            contraindicated: false,
            alternativeOptions: ["Unfractionated Heparin (IV infusion adjusted by aPTT)", "Fondaparinux (check CrCl)", "Warfarin bridge"],
          };
        }
      }
    },
  },
  {
    genericName: "Levofloxacin",
    brandNames: ["Tavanic", "Levaquin"],
    therapeuticClass: "Respiratory Fluoroquinolone",
    standardDose: "500 mg PO/IV",
    standardFrequency: "Every 24 hours (Once daily)",
    standardDuration: "5 to 7 days",
    route: "Oral / IV",
    isRenallyEliminated: true,
    clearancePathway: "Primarily renal clearance (> 85% excreted unchanged in urine)",
    defaultIndications: ["Community-Acquired Pneumonia", "Exacerbation of COPD", "Pyelonephritis", "Complicated Sinusitis"],
    calculate: (input, crCl, age, weight) => {
      if (crCl >= 50) {
        return {
          recommendedDose: "500 mg PO",
          suggestedFrequency: "Every 24 hours",
          suggestedDuration: "5 to 7 days",
          calculatedDirections: "Take 500mg orally once daily with plenty of water for 5 to 7 days.",
          isRenalAdjustmentRequired: false,
          adjustmentSummary: "Standard adult dosage. CrCl ≥ 50 mL/min ensures optimal urinary & lung tissue penetration.",
          rationale: "Standard pharmacokinetic exposure (AUC/MIC) achieved with once daily 500mg dose.",
          monitoring: ["Clinical signs of pneumonia resolution", "Hydration", "QT interval if on macrolides/antiarrhythmics"],
          alerts: ["Discontinue immediately if patient develops tendon pain, swelling, or peripheral neuropathy."],
          contraindicated: false,
        };
      } else if (crCl >= 20) {
        return {
          recommendedDose: "Initial 500 mg, then 250 mg PO",
          suggestedFrequency: "Every 24 hours",
          suggestedDuration: "7 days",
          calculatedDirections: "Take initial loading dose of 500mg on Day 1, followed by 250mg orally every 24 hours for remaining 6 days.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -50,
          adjustmentSummary: "Moderate Renal Impairment (CrCl 20-49 mL/min): Loading dose 500mg Day 1, then maintenance 250mg every 24 hours.",
          rationale: "Levofloxacin clearance directly correlates with creatinine clearance. Maintenance dose halved to avoid accumulation while loading dose ensures prompt therapeutic onset.",
          monitoring: ["Serum creatinine", "CNS status", "ECG QTc interval"],
          alerts: ["Geriatric patients with renal impairment have higher risk of delirium and neurotoxicity."],
          contraindicated: false,
        };
      } else {
        // CrCl < 20 or Dialysis
        return {
          recommendedDose: "Initial 500 mg, then 250 mg PO",
          suggestedFrequency: "Every 48 hours (Extended interval)",
          suggestedDuration: "7 to 10 days",
          calculatedDirections: "Take loading dose 500mg on Day 1, then 250mg orally once every 48 hours. If hemodialysis, give dose after dialysis.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -75,
          adjustmentSummary: "Severe Renal Impairment (CrCl < 20 mL/min): Loading dose 500mg, then 250mg every 48 hours.",
          rationale: "Half-life extends from 7 hours to over 27 hours. 48-hour dosing interval prevents severe accumulation and neurotoxicity.",
          monitoring: ["Neurological assessment (seizures, hallucinations)", "Electrolytes", "Renal trajectory"],
          alerts: ["Dialysis removes < 10% of drug; no additional supplemental dose needed after standard hemodialysis."],
          contraindicated: false,
        };
      }
    },
  },
  {
    genericName: "Gabapentin",
    brandNames: ["Neurontin", "Gabagamma"],
    therapeuticClass: "GABA Analog / Anticonvulsant / Neuropathic Pain Agent",
    standardDose: "300 mg to 600 mg PO",
    standardFrequency: "Three times daily (TDS / q8h)",
    standardDuration: "Chronic / 30 days initial trial",
    route: "Oral",
    isRenallyEliminated: true,
    clearancePathway: "Eliminated solely by renal excretion (100% unchanged in urine, not metabolized by liver)",
    defaultIndications: ["Diabetic Peripheral Neuropathy", "Post-Herpetic Neuralgia", "Radiculopathy", "Focal Seizures"],
    calculate: (input, crCl, age, weight) => {
      if (crCl >= 60) {
        return {
          recommendedDose: "300 mg PO",
          suggestedFrequency: "Three times daily (q8h, total 900 mg/day)",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 300mg orally three times daily with water. Titrate upwards by 300mg every 3-5 days as tolerated.",
          isRenalAdjustmentRequired: false,
          adjustmentSummary: "Standard titration regimen. CrCl ≥ 60 mL/min allows normal q8h dosing.",
          rationale: "Linear elimination kinetics dependent on glomerular filtration.",
          monitoring: ["Pain severity scale", "Sedation and ataxia"],
          alerts: ["Taper gradually over at least 1 week when discontinuing."],
          contraindicated: false,
        };
      } else if (crCl >= 30) {
        return {
          recommendedDose: "200 mg to 300 mg PO",
          suggestedFrequency: "Twice daily (BD / q12h, max 600 mg/day)",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 300mg orally twice daily (morning and evening). Do not exceed 600mg to 700mg total daily dose.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -33,
          adjustmentSummary: "Moderate Renal Impairment (CrCl 30-59 mL/min): Interval extended from TDS to Twice Daily (BD). Max 700 mg/day.",
          rationale: "Reduced renal excretion prolongs elimination half-life from 6 hours to 12-15 hours.",
          monitoring: ["Excessive somnolence", "Peripheral edema", "Fall risk in elderly"],
          alerts: ["Dose reductions are critical to avoid myoclonus and severe sedation."],
          contraindicated: false,
        };
      } else if (crCl >= 15) {
        return {
          recommendedDose: "100 mg to 300 mg PO",
          suggestedFrequency: "Once daily (at bedtime, max 300 mg/day)",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 100mg to 300mg orally ONCE daily at bedtime. Titrate slowly.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -66,
          adjustmentSummary: "Severe Renal Impairment (CrCl 15-29 mL/min): Dose reduced to 100-300mg ONCE daily at night.",
          rationale: "Half-life extends to over 24-30 hours. Single daily bedtime dose maintains therapeutic analgesia while minimizing daytime sedation.",
          monitoring: ["Cognitive function", "Myoclonic jerks (sign of neurotoxicity)", "Gait stability"],
          alerts: ["High risk of drug-induced encephalopathy if standard dosing is given."],
          contraindicated: false,
        };
      } else {
        // CrCl < 15 or Dialysis
        return {
          recommendedDose: "100 mg PO",
          suggestedFrequency: "Once every 24 to 48 hours (or 100-200mg after each dialysis)",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 100mg orally every other day (or 100mg-200mg given post-hemodialysis session).",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -85,
          adjustmentSummary: "End-Stage Renal Disease (CrCl < 15 mL/min): 100mg every 24-48 hours. Post-dialysis supplemental dose recommended.",
          rationale: "Elimination half-life exceeds 50 hours in anuric patients. Hemodialysis efficiently clears gabapentin (35% removed during 4h session).",
          monitoring: ["Oversedation", "Respiratory depression (especially if co-prescribed opioids)"],
          alerts: ["FDA Black Box Warning: Risk of severe respiratory depression with CNS depressants."],
          contraindicated: false,
        };
      }
    },
  },
  {
    genericName: "Vancomycin",
    brandNames: ["Vancocin"],
    therapeuticClass: "Glycopeptide Antibacterial",
    standardDose: "15 to 20 mg/kg IV",
    standardFrequency: "Every 8 to 12 hours",
    standardDuration: "7 to 14 days",
    route: "Intravenous Infusion",
    isRenallyEliminated: true,
    clearancePathway: "Almost entirely eliminated by glomerular filtration (80-90% unchanged in urine within 24h)",
    defaultIndications: ["MRSA Bacteremia", "Severe Hospital-Acquired Sepsis", "Infective Endocarditis", "Osteomyelitis"],
    calculate: (input, crCl, age, weight) => {
      const singleLoadingDose = Math.round(weight * 20); // 20 mg/kg loading dose
      const standardMaintenanceDose = Math.round(weight * 15); // 15 mg/kg maintenance dose

      if (crCl >= 90) {
        return {
          recommendedDose: `${standardMaintenanceDose} mg IV (15 mg/kg)`,
          suggestedFrequency: "Every 8 to 12 hours",
          suggestedDuration: "10 to 14 days",
          calculatedDirections: `Administer loading dose ${singleLoadingDose}mg IV once, then maintenance ${standardMaintenanceDose}mg IV infused over 90-120 minutes every 8-12 hours.`,
          isRenalAdjustmentRequired: false,
          adjustmentSummary: `Standard weight-based dosing (${weight}kg patient). Loading dose 20 mg/kg, maintenance 15 mg/kg q8-12h.`,
          rationale: "Augmented or normal renal clearance maintains rapid drug elimination. AUC/MIC target 400-600.",
          monitoring: ["Trough concentration prior to 4th dose (target 15-20 mcg/mL)", "Serum creatinine twice weekly"],
          alerts: ["Infuse at maximum rate of 10 mg/min to prevent Red Man Syndrome (histaminoid reaction)."],
          contraindicated: false,
        };
      } else if (crCl >= 50) {
        return {
          recommendedDose: `${standardMaintenanceDose} mg IV (15 mg/kg)`,
          suggestedFrequency: "Every 12 to 24 hours",
          suggestedDuration: "10 to 14 days",
          calculatedDirections: `Give ${standardMaintenanceDose}mg IV every 12 to 24 hours. Check serum trough level before 3rd dose.`,
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -25,
          adjustmentSummary: "Mild-to-Moderate Renal Impairment (CrCl 50-89 mL/min): Interval lengthened to q12h-q24h based on therapeutic drug monitoring.",
          rationale: "Reduced glomerular clearance extends terminal half-life from 6 hours to 10-14 hours.",
          monitoring: ["Trough level before 3rd dose (target 15-20 mcg/mL for severe MRSA)", "Daily serum creatinine"],
          alerts: ["Concomitant use with piperacillin/tazobactam or aminoglycosides dramatically elevates acute kidney injury risk."],
          contraindicated: false,
        };
      } else if (crCl >= 20) {
        return {
          recommendedDose: `${standardMaintenanceDose} mg IV (15 mg/kg)`,
          suggestedFrequency: "Every 24 to 48 hours",
          suggestedDuration: "10 to 14 days",
          calculatedDirections: `Administer initial ${singleLoadingDose}mg IV load, then ${standardMaintenanceDose}mg every 24 to 48 hours. Dose guided by trough levels.`,
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -50,
          adjustmentSummary: "Moderate-to-Severe Renal Impairment (CrCl 20-49 mL/min): Extended interval to q24-48h. Mandatory trough monitoring.",
          rationale: "Half-life extends to 24-40 hours. Subsequent doses should only be administered when serum concentration drops below 15-20 mcg/mL.",
          monitoring: ["Trough levels every 48 hours", "Daily urine output and creatinine"],
          alerts: ["High risk of synergistic nephrotoxicity. Maintain adequate crystalloid hydration."],
          contraindicated: false,
        };
      } else {
        // CrCl < 20 or Dialysis
        return {
          recommendedDose: `${singleLoadingDose} mg IV (Loading dose only)`,
          suggestedFrequency: "Dose-by-Level (Random levels checked every 48-72h)",
          suggestedDuration: "Guided by clinical response and serial levels",
          calculatedDirections: `Administer initial loading dose ${singleLoadingDose}mg IV. Re-dose ONLY when serum vancomycin concentration drops below 15 mcg/mL.`,
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -75,
          adjustmentSummary: "Kidney Failure / Dialysis (CrCl < 20 mL/min): Single loading dose, then re-dose purely based on serum trough levels (Dose-by-level).",
          rationale: "Half-life prolonged up to 7-10 days in anuria. High-flux hemodialysis removes 30% of vancomycin; post-dialysis booster doses often required.",
          monitoring: ["Pre-dialysis vancomycin level before each hemodialysis session", "Audiometry if prolonged course"],
          alerts: ["Never schedule fixed maintenance intervals without verified serum concentration levels."],
          contraindicated: false,
        };
      }
    },
  },
  {
    genericName: "Allopurinol",
    brandNames: ["Zyloprim", "Puricos"],
    therapeuticClass: "Xanthine Oxidase Inhibitor",
    standardDose: "100 mg to 300 mg PO",
    standardFrequency: "Once daily (OD)",
    standardDuration: "Chronic maintenance",
    route: "Oral",
    isRenallyEliminated: true,
    clearancePathway: "Metabolized to active oxypurinol, which is excreted 100% renally by glomerular filtration",
    defaultIndications: ["Chronic Gout / Hyperuricemia Prophylaxis", "Tumor Lysis Syndrome Prophylaxis"],
    calculate: (input, crCl, age, weight) => {
      if (crCl >= 60) {
        return {
          recommendedDose: "100 mg to 300 mg PO",
          suggestedFrequency: "Once daily with food",
          suggestedDuration: "30 days supply with refills",
          calculatedDirections: "Start 100mg orally once daily after food; titrate by 100mg every 2-4 weeks towards target serum urate < 0.36 mmol/L.",
          isRenalAdjustmentRequired: false,
          adjustmentSummary: "Standard initial dosing. Preserved renal clearance of active metabolite oxypurinol.",
          rationale: "Gradual titration prevents acute gout flare precipitation.",
          monitoring: ["Serum urate level at 4 weeks", "Liver function tests", "Full blood count"],
          alerts: ["Discontinue immediately if skin rash or itch develops (risk of severe Stevens-Johnson / DRESS syndrome)."],
          contraindicated: false,
        };
      } else if (crCl >= 30) {
        return {
          recommendedDose: "50 mg to 100 mg PO",
          suggestedFrequency: "Once daily (Max 100 mg/day initially)",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 50mg to 100mg orally once daily with meals. Titrate very cautiously in 50mg increments.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -50,
          adjustmentSummary: "Moderate CKD (CrCl 30-59 mL/min): Start at 50-100mg daily. Oxypurinol clearance is impaired.",
          rationale: "Active metabolite oxypurinol half-life increases from 24 hours to over 50 hours, dramatically raising hypersensitivity syndrome risk.",
          monitoring: ["Skin exam for maculopapular rash", "Renal and liver function", "Urate"],
          alerts: ["Severe allopurinol hypersensitivity syndrome (AHS) strongly correlates with unadjusted doses in renal failure."],
          contraindicated: false,
        };
      } else if (crCl >= 15) {
        return {
          recommendedDose: "50 mg PO daily OR 100 mg PO",
          suggestedFrequency: "Every 48 hours (Every other day)",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 50mg daily OR 100mg orally every 48 hours after meals. Cautious monitoring required.",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -66,
          adjustmentSummary: "Severe CKD (CrCl 15-29 mL/min): 50mg daily or 100mg every other day. Slow titration.",
          rationale: "Oxypurinol accumulation triggers immune-mediated vasculitis and hepatic/renal failure in susceptible patients.",
          monitoring: ["Complete blood count (eosinophilia is early warning sign)", "LFTs", "Renal panel"],
          alerts: ["HLA-B*5801 screening recommended prior to initiation in high-risk ethnic populations."],
          contraindicated: false,
        };
      } else {
        // CrCl < 15 or Dialysis
        return {
          recommendedDose: "50 mg to 100 mg PO",
          suggestedFrequency: "Twice or three times weekly post-dialysis",
          suggestedDuration: "30 days supply",
          calculatedDirections: "Take 50mg to 100mg orally immediately following each hemodialysis session (approx 3 times per week).",
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -80,
          adjustmentSummary: "End-Stage Renal Disease (CrCl < 15 mL/min): 50-100mg post-hemodialysis. Febuxostat may be safer alternative.",
          rationale: "Oxypurinol is dialyzed during session; post-dialysis administration prevents interdialytic toxicity.",
          monitoring: ["Eosinophil count", "Rash / mucous membrane erythema", "Urate"],
          alerts: ["High risk of allopurinol toxicity. Consider Febuxostat 40mg (principally hepatic clearance) as alternative."],
          contraindicated: false,
          alternativeOptions: ["Febuxostat 40mg PO daily (primarily hepatic metabolism, safe in severe renal impairment)"],
        };
      }
    },
  },
  {
    genericName: "Gentamicin",
    brandNames: ["Garamycin", "Genticyn"],
    therapeuticClass: "Aminoglycoside Antibiotic",
    standardDose: "5 to 7 mg/kg IV (Extended-interval once daily)",
    standardFrequency: "Every 24 hours",
    standardDuration: "3 to 5 days (Short course)",
    route: "Intravenous Infusion",
    isRenallyEliminated: true,
    clearancePathway: "Pure glomerular filtration (90-98% excreted unchanged in urine)",
    defaultIndications: ["Urosepsis", "Gram-negative Bacteremia / Septic Shock", "Pyelonephritis with Sepsis"],
    calculate: (input, crCl, age, weight) => {
      const doseMg = Math.round(weight * 5); // 5 mg/kg once daily

      if (crCl >= 60) {
        return {
          recommendedDose: `${doseMg} mg IV (5 mg/kg)`,
          suggestedFrequency: "Every 24 hours",
          suggestedDuration: "3 to 5 days",
          calculatedDirections: `Infuse ${doseMg}mg (5 mg/kg for ${weight}kg) IV in 100 mL Normal Saline over 60 minutes once every 24 hours. Check trough level.`,
          isRenalAdjustmentRequired: false,
          adjustmentSummary: `Standard extended-interval once-daily aminoglycoside dosing (${doseMg}mg for ${weight}kg patient). CrCl ≥ 60 mL/min.`,
          rationale: "Concentration-dependent bacterial killing with post-antibiotic effect. High peak achieves bactericidal action; low trough (< 1 mcg/mL) prevents nephrotoxicity.",
          monitoring: ["Trough level 18-24 hours post-dose (target < 1.0 mcg/mL)", "Daily serum creatinine and urine output"],
          alerts: ["Limit duration to ≤ 3-5 days. Aminoglycosides cause proximal tubular necrosis and irreversible ototoxicity."],
          contraindicated: false,
        };
      } else if (crCl >= 40) {
        return {
          recommendedDose: `${doseMg} mg IV (5 mg/kg)`,
          suggestedFrequency: "Every 36 hours (Extended interval)",
          suggestedDuration: "3 days max",
          calculatedDirections: `Administer ${doseMg}mg IV infused over 60 minutes once every 36 hours. Measure serum level at 8-12 hours on Hartford nomogram.`,
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -33,
          adjustmentSummary: "Moderate Renal Impairment (CrCl 40-59 mL/min): Interval lengthened to every 36 hours. Hartford nomogram monitoring.",
          rationale: "Clearance directly reflects filtration rate. Extending interval permits drug clearance below the nephrotoxicity threshold of 1 mcg/mL.",
          monitoring: ["Serum level using Hartford nomogram", "Serum creatinine daily", "Vestibular / auditory symptoms"],
          alerts: ["Avoid co-prescription with furosemide, vancomycin, or NSAIDs."],
          contraindicated: false,
        };
      } else if (crCl >= 20) {
        return {
          recommendedDose: `${doseMg} mg IV (5 mg/kg)`,
          suggestedFrequency: "Every 48 hours (Extended interval)",
          suggestedDuration: "2 to 3 doses max",
          calculatedDirections: `Administer ${doseMg}mg IV once every 48 hours. DO NOT administer second dose until serum trough is verified < 1.0 mcg/mL.`,
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -50,
          adjustmentSummary: "Severe Impairment (CrCl 20-39 mL/min): Every 48 hours. Mandatory trough verification < 1.0 mcg/mL before re-dosing.",
          rationale: "Half-life extends to 8-15 hours. Extended 48h interval is necessary to allow renal clearance of toxic peak concentrations.",
          monitoring: ["Trough level prior to every single dose", "Daily urine volume", "Audiometry if multiple doses"],
          alerts: ["High nephrotoxicity risk. Consider switching to third-generation cephalosporin or carbapenem."],
          contraindicated: false,
          alternativeOptions: ["Ceftriaxone 2g IV daily (hepatic & renal dual elimination, no renal adjustment required)", "Meropenem (adjusted)"],
        };
      } else {
        // CrCl < 20 or Dialysis
        return {
          recommendedDose: `${Math.round(weight * 2)} mg IV (Loading dose 2 mg/kg only)`,
          suggestedFrequency: "Single dose, then dose strictly guided by serum levels",
          suggestedDuration: "Single dose (re-evaluate alternative)",
          calculatedDirections: `Give single 2 mg/kg loading dose (${Math.round(weight * 2)}mg IV). Re-dose ONLY when level is < 1.0 mcg/mL. Switch to non-nephrotoxic alternative immediately.`,
          isRenalAdjustmentRequired: true,
          adjustmentPercentage: -75,
          adjustmentSummary: "End-Stage Renal Disease (CrCl < 20 mL/min): Relative contraindication. Single load only; non-nephrotoxic agent strongly advised.",
          rationale: "Aminoglycosides accumulate aggressively in renal cortical tissue causing prolonged tubular necrosis.",
          monitoring: ["Daily levels", "Strict fluid balance", "Alternative culture sensitivities"],
          alerts: ["High nephrotoxicity risk in established renal failure. Strong clinical preference for non-aminoglycoside therapy."],
          contraindicated: true,
          alternativeOptions: ["Ceftriaxone 2g IV daily", "Cefotaxime", "Aztreonam"],
        };
      }
    },
  },
  {
    genericName: "Amlodipine",
    brandNames: ["Norvasc", "Amloc"],
    therapeuticClass: "Dihydropyridine Calcium Channel Blocker",
    standardDose: "5 mg to 10 mg PO",
    standardFrequency: "Once daily (OD)",
    standardDuration: "30 days supply with 2 refills",
    route: "Oral",
    isRenallyEliminated: false,
    clearancePathway: "Extensively metabolized by hepatic CYP3A4 to inactive metabolites (< 10% parent drug in urine)",
    defaultIndications: ["Essential Hypertension", "Chronic Stable Angina", "Vasospastic Angina"],
    calculate: (input, crCl, age, weight) => {
      const isElderly = age >= 65;
      const recommended = isElderly ? "2.5 mg to 5 mg PO" : "5 mg PO";
      return {
        recommendedDose: recommended,
        suggestedFrequency: "Once daily in the morning",
        suggestedDuration: "30 days supply (refillable)",
        calculatedDirections: `Take ${isElderly ? "2.5mg to 5mg" : "5mg"} orally once daily with or without food.`,
        isRenalAdjustmentRequired: false,
        adjustmentSummary: "No renal dose adjustment required (CrCl independent). Primarily cleared by hepatic CYP3A4 metabolism.",
        rationale: "Amlodipine plasma concentrations are not correlated with renal impairment. Renal disease does not alter pharmacokinetic elimination profile.",
        monitoring: ["Blood pressure response", "Peripheral dependent pedal edema", "Heart rate"],
        alerts: ["In elderly patients (age ≥ 65), consider initial 2.5mg daily to minimize orthostatic hypotension."],
        contraindicated: false,
      };
    },
  },
];

/**
 * Main heuristic dosage calculation function
 * Used both in server fallback and client-side calculations
 */
export function calculateDosageRecommendation(input: DosageCalculatorInput): DosageRecommendation {
  const age = Math.max(1, input.patientAge || 45);
  const weight = Math.max(10, input.patientWeight || 70);
  const gender = input.patientGender || "Male";

  // Calculate or resolve CrCl and KDIGO stage
  const { crCl, explanation, kdigoStage } = calculateCockcroftGault({
    age,
    weightKg: weight,
    gender,
    serumCreatinineUmolL: input.serumCreatinineUnit === "mg/dL" ? undefined : input.serumCreatinine,
    serumCreatinineMgDl: input.serumCreatinineUnit === "mg/dL" ? input.serumCreatinine : undefined,
  });

  const effectiveCrCl = input.crCl && input.crCl > 0 ? input.crCl : input.eGfr && input.eGfr > 0 ? input.eGfr : crCl;

  // Search matching drug from formulary
  const query = (input.medicationName || "").toLowerCase().trim();
  const matchedDrug = CLINICAL_DRUG_FORMULARY.find((drug) => {
    if (drug.genericName.toLowerCase().includes(query) || query.includes(drug.genericName.toLowerCase())) return true;
    return drug.brandNames.some((b) => b.toLowerCase().includes(query) || query.includes(b.toLowerCase()));
  });

  const ageCategory = age < 18 ? "Pediatric" : age >= 65 ? "Geriatric" : "Adult";
  const pediatricOrGeriatricNote =
    age < 18
      ? `Pediatric patient (${age}y, ${weight}kg): Dosing must account for developmental glomerular maturation and body surface area.`
      : age >= 65
      ? `Geriatric patient (${age}y, ${weight}kg): Age-related decline in nephron mass reduces physiologic reserve; monitor closely for dehydration and drug accumulation.`
      : undefined;

  if (matchedDrug) {
    const outcome = matchedDrug.calculate(input, effectiveCrCl, age, weight);
    return {
      medicationName: matchedDrug.genericName,
      indication: input.indication || matchedDrug.defaultIndications[0] || "Clinical Indication",
      standardDose: matchedDrug.standardDose,
      recommendedDose: outcome.recommendedDose,
      suggestedFrequency: outcome.suggestedFrequency,
      suggestedDuration: outcome.suggestedDuration,
      calculatedDirections: outcome.calculatedDirections,
      isRenalAdjustmentRequired: outcome.isRenalAdjustmentRequired,
      adjustmentPercentage: outcome.adjustmentPercentage,
      adjustmentSummary: outcome.adjustmentSummary,
      kdigoStage,
      calculatedCrCl: effectiveCrCl,
      crClFormulaExplanation: explanation,
      ageCategory,
      pediatricOrGeriatricNote,
      pharmacokineticRationale: outcome.rationale,
      monitoringGuidelines: outcome.monitoring,
      safetyAlerts: outcome.alerts,
      contraindicated: outcome.contraindicated,
      alternativeOptions: outcome.alternativeOptions,
      source: "clinical-rules",
    };
  }

  // Generic clinical rule fallback for unspecified medications
  const isRenalImpaired = effectiveCrCl < 50;
  const isSevere = effectiveCrCl < 30;

  return {
    medicationName: input.medicationName || "Prescribed Medication",
    indication: input.indication || "General Medical Indication",
    standardDose: "Standard Adult Dose",
    recommendedDose: isSevere ? "Reduce dose by 50% or prolong dosing interval" : isRenalImpaired ? "Reduce dose by 25-30%" : "Standard labeled dose",
    suggestedFrequency: isSevere ? "Every 24 to 48 hours (Prolonged Interval)" : isRenalImpaired ? "Every 12 to 24 hours" : "Standard labeled frequency",
    suggestedDuration: "7 to 10 days (re-evaluate renal panel)",
    calculatedDirections: isSevere
      ? `Take adjusted dose orally once every 24 to 48 hours. Dosage modified for severe renal impairment (CrCl ${effectiveCrCl} mL/min).`
      : `Take orally as prescribed with water. Monitor renal tolerance.`,
    isRenalAdjustmentRequired: isRenalImpaired,
    adjustmentPercentage: isSevere ? -50 : isRenalImpaired ? -30 : undefined,
    adjustmentSummary: isSevere
      ? `Severe Renal Impairment (CrCl ${effectiveCrCl} mL/min, ${kdigoStage}): 50% dose reduction or extended dosing interval recommended.`
      : isRenalImpaired
      ? `Moderate Renal Impairment (CrCl ${effectiveCrCl} mL/min, ${kdigoStage}): Cautious downward titration and hydration recommended.`
      : `Preserved Renal Function (CrCl ${effectiveCrCl} mL/min): Standard dosing parameters appropriate.`,
    kdigoStage,
    calculatedCrCl: effectiveCrCl,
    crClFormulaExplanation: explanation,
    ageCategory,
    pediatricOrGeriatricNote,
    pharmacokineticRationale: `Renal elimination clearance depends on estimated glomerular filtration rate (${effectiveCrCl} mL/min) and tubular secretion capacity.`,
    monitoringGuidelines: [
      "Serum creatinine and BUN prior to and during therapy",
      "Fluid balance and daily urine output",
      "Clinical signs of drug accumulation and toxicity",
    ],
    safetyAlerts: [
      effectiveCrCl < 30
        ? "Warning: CrCl < 30 mL/min significantly increases risk of accumulation for renally-excreted compounds."
        : "Verify liver and kidney panel if patient is on concomitant nephrotoxic drugs.",
    ],
    contraindicated: false,
    source: "clinical-rules",
  };
}
