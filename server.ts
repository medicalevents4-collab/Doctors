import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { calculateDosageRecommendation, calculateCockcroftGault } from "./src/utils/dosageCalculatorEngine";

dotenv.config();

// Clinical Rule-Based Triage Fallback Engine
function runHeuristicTriage(data: {
  patientName?: string;
  patientAge?: number;
  clinicalHistory?: string;
  symptoms?: string;
  attachedDiagnostics?: Array<{ name: string; type: string; findings: string; isAbnormal?: boolean }>;
}) {
  const combinedText = [
    data.clinicalHistory || "",
    data.symptoms || "",
    ...(data.attachedDiagnostics || []).map((d) => `${d.name} (${d.type}): ${d.findings}`),
  ].join(" ").toLowerCase();

  // Emergency indicators
  const isCardioEmergency = 
    combinedText.includes("st elevation") || 
    combinedText.includes("stemi") || 
    combinedText.includes("troponin") && (combinedText.includes("elevated") || combinedText.includes("420") || combinedText.includes("high")) ||
    combinedText.includes("ventricular tachycardia") ||
    combinedText.includes("aortic dissection") ||
    combinedText.includes("third-degree av block");

  const isNeuroEmergency =
    combinedText.includes("acute stroke") ||
    combinedText.includes("mca occlusion") ||
    combinedText.includes("diffusion restriction") ||
    combinedText.includes("intracranial hemorrhage") ||
    combinedText.includes("sudden onset hemiparesis") ||
    combinedText.includes("cauda equina");

  const isSurgeryEmergency =
    combinedText.includes("perforated") ||
    combinedText.includes("acute abdomen") ||
    combinedText.includes("peritonitis") ||
    combinedText.includes("massive pulmonary embolism") ||
    combinedText.includes("ischemic bowel");

  // Urgent indicators
  const isCardioUrgent =
    combinedText.includes("angina") ||
    combinedText.includes("st depression") ||
    combinedText.includes("aortic stenosis") ||
    combinedText.includes("ef 30") ||
    combinedText.includes("atrial fibrillation") ||
    combinedText.includes("cad");

  const isNeuroUrgent =
    combinedText.includes("transient ischemic") ||
    combinedText.includes("tia") ||
    combinedText.includes("intractable seizure") ||
    combinedText.includes("progressive neuropathy");

  const isNephroUrgent =
    combinedText.includes("creatinine") && (combinedText.includes("spike") || combinedText.includes("rapid") || combinedText.includes("3.") || combinedText.includes("4.")) ||
    combinedText.includes("egfr") && (combinedText.includes("< 30") || combinedText.includes("drop") || combinedText.includes("28")) ||
    combinedText.includes("hyperkalemia") ||
    combinedText.includes("nephrotic");

  const isOncoUrgent =
    combinedText.includes("biopsy") ||
    combinedText.includes("malignancy") ||
    combinedText.includes("carcinoma") ||
    combinedText.includes("melanoma") ||
    combinedText.includes("lesion") && combinedText.includes("irregular");

  if (isCardioEmergency) {
    return {
      suggestedSpecialty: "Cardiology & Interventional",
      secondarySpecialty: "Emergency Medicine / Cardiac Cath Lab",
      suggestedUrgency: "Emergency",
      urgencyRationale: "Diagnostic findings demonstrate acute myocardial ischemia / injury with significant risk of hemodynamic collapse or malignant arrhythmia requiring immediate catheterization.",
      clinicalReasoning: [
        "Biomarker / ECG findings confirm acute coronary pathology requiring immediate intervention.",
        "Diagnostic findings indicate critical threshold crossing for ischemic risk.",
        "Delay beyond 90-120 minutes dramatically increases myocardial necrosis and mortality."
      ],
      keyDiagnosticFindings: (data.attachedDiagnostics || [])
        .filter((d) => d.isAbnormal || d.findings.toLowerCase().includes("elevat") || d.findings.toLowerCase().includes("st"))
        .map((d) => `${d.name}: ${d.findings}`)
        .slice(0, 3),
      redFlags: ["Recurrent refractory chest pain", "Hemodynamic instability (hypotension)", "New pulmonary edema / crackles", "Sustained ventricular ectopy"],
      preConsultActions: ["Initiate continuous 12-lead telemetry", "Administer dual antiplatelet therapy & heparin if indicated", "Establish dual wide-bore IV access", "Activate Stat Cardiac Cath Team"],
      matchedSpecialistType: "Interventional Cardiologist",
      confidenceScore: 97,
      triageCategoryCode: "ESI-1 (Immediate Life Threat)",
      source: "clinical-rules"
    };
  }

  if (isNeuroEmergency) {
    return {
      suggestedSpecialty: "Neurology & Stroke Unit",
      secondarySpecialty: "Interventional Neuroradiology",
      suggestedUrgency: "Emergency",
      urgencyRationale: "Neuroimaging or clinical evidence indicates acute focal neurological deficit with salvageable penumbra within mechanical thrombectomy or thrombolytic window.",
      clinicalReasoning: [
        "Focal neurological ischemia / acute intracranial abnormality identified on diagnostic records.",
        "Time-critical neurovascular intervention required to preserve functional cerebral tissue."
      ],
      keyDiagnosticFindings: (data.attachedDiagnostics || []).map((d) => `${d.name}: ${d.findings}`).slice(0, 3),
      redFlags: ["Rapid GCS decline", "Loss of airway protective reflexes", "Blood pressure spike > 185/110 mmHg", "Seizure activity"],
      preConsultActions: ["Stat Non-contrast Brain CT / MRI Angiogram", "Maintain NPO status", "Avoid acute over-lowering of MAP", "Establish Stroke Code Protocol"],
      matchedSpecialistType: "Vascular Neurologist",
      confidenceScore: 96,
      triageCategoryCode: "ESI-1 (Emergent Stroke)",
      source: "clinical-rules"
    };
  }

  if (isSurgeryEmergency) {
    return {
      suggestedSpecialty: "General Surgery / Acute Care",
      secondarySpecialty: "Trauma & Critical Care",
      suggestedUrgency: "Emergency",
      urgencyRationale: "Diagnostic markers indicate acute surgical crisis with potential peritoneal contamination or visceral compromise.",
      clinicalReasoning: [
        "Diagnostic imaging confirms acute surgical pathology.",
        "Immediate surgical consultation required for operative exploration."
      ],
      keyDiagnosticFindings: (data.attachedDiagnostics || []).map((d) => `${d.name}: ${d.findings}`).slice(0, 3),
      redFlags: ["Hypotension / Septic shock", "Rigid involuntary abdominal guarding", "Marked leukocytosis with bandemia"],
      preConsultActions: ["Keep strictly NPO", "Initiate broad-spectrum IV antimicrobials if indicated", "Crystalloid fluid resuscitation"],
      matchedSpecialistType: "Acute Care General Surgeon",
      confidenceScore: 94,
      triageCategoryCode: "ESI-2 (Emergent Surgical)",
      source: "clinical-rules"
    };
  }

  if (isCardioUrgent) {
    return {
      suggestedSpecialty: "Cardiology",
      secondarySpecialty: "Cardiothoracic Surgery",
      suggestedUrgency: "Urgent",
      urgencyRationale: "Patient presents with significant cardiovascular structural or ischemic pathology that is currently hemodynamically compensated but poses high near-term risk of deterioration.",
      clinicalReasoning: [
        "Objective diagnostic records show ischemic changes or hemodynamic gradient requiring prompt evaluation.",
        "Early specialist risk stratification prevents adverse cardiac events and determines revascularization necessity."
      ],
      keyDiagnosticFindings: (data.attachedDiagnostics || []).map((d) => `${d.name}: ${d.findings}`).slice(0, 3),
      redFlags: ["Accelerating angina frequency or threshold reduction", "Presyncope on exertion", "New orthopnea"],
      preConsultActions: ["Maintain beta-blocker / anti-anginal therapy", "Serial 12-lead ECG if symptoms recur", "Transmit echocardiogram report directly to receiving clinic"],
      matchedSpecialistType: "Consultant Cardiologist",
      confidenceScore: 92,
      triageCategoryCode: "ESI-3 (Urgent Specialist Review)",
      source: "clinical-rules"
    };
  }

  if (isNephroUrgent) {
    return {
      suggestedSpecialty: "Nephrology",
      secondarySpecialty: "Internal Medicine",
      suggestedUrgency: "Urgent",
      urgencyRationale: "Diagnostic laboratory panels confirm accelerated decline in renal filtration or nephrotic-range proteinuria necessitating rapid etiology determination and renal protection.",
      clinicalReasoning: [
        "eGFR trajectory and serum creatinine indicate subacute renal impairment.",
        "Early nephrology intervention essential to avert permanent nephron loss or dialysis initiation."
      ],
      keyDiagnosticFindings: (data.attachedDiagnostics || []).map((d) => `${d.name}: ${d.findings}`).slice(0, 3),
      redFlags: ["Oliguria / anuria (< 500 mL/24h)", "Refractory hyperkalemia (> 5.5 mmol/L)", "Severe metabolic acidosis"],
      preConsultActions: ["Discontinue all nephrotoxic agents (NSAIDs, aminoglycosides)", "Hold ACEi/ARB if acute hemodynamic decline", "Order renal ultrasound with Doppler"],
      matchedSpecialistType: "Consultant Nephrologist",
      confidenceScore: 91,
      triageCategoryCode: "ESI-3 (Urgent Renal Evaluation)",
      source: "clinical-rules"
    };
  }

  if (isOncoUrgent) {
    return {
      suggestedSpecialty: "Surgical Oncology",
      secondarySpecialty: "Dermatology / Pathology",
      suggestedUrgency: "Urgent",
      urgencyRationale: "Diagnostic histology or imaging demonstrates architectural atypia or high clinical suspicion of malignant neoplasm requiring rapid staging and multidisciplinary resection.",
      clinicalReasoning: [
        "Pathology / diagnostic imaging identifies suspicious structural lesion.",
        "National cancer pathway standards recommend specialist consultation within 14 calendar days."
      ],
      keyDiagnosticFindings: (data.attachedDiagnostics || []).map((d) => `${d.name}: ${d.findings}`).slice(0, 3),
      redFlags: ["Rapid lesion growth or ulceration", "Regional lymphadenopathy", "B-symptoms (unexplained weight loss, night sweats)"],
      preConsultActions: ["Forward original histology slides or digital dermoscopy", "Order baseline cross-sectional CT staging"],
      matchedSpecialistType: "Surgical Oncologist",
      confidenceScore: 93,
      triageCategoryCode: "ESI-3 (Urgent Oncologic Staging)",
      source: "clinical-rules"
    };
  }

  // Default routine/specialist evaluation
  return {
    suggestedSpecialty: "Internal Medicine",
    secondarySpecialty: "General Practice Follow-Up",
    suggestedUrgency: "Routine",
    urgencyRationale: "Diagnostic profile and clinical findings indicate stable disease without red flags for acute physiological decompensation.",
    clinicalReasoning: [
      "Diagnostic markers are within manageable outpatient parameters.",
      "Specialist consultation is appropriate for elective optimization, chronic management, or second opinion."
    ],
    keyDiagnosticFindings: (data.attachedDiagnostics || []).map((d) => `${d.name}: ${d.findings}`).slice(0, 3),
    redFlags: ["Sudden change in baseline symptom severity", "Onset of new systemic symptoms"],
    preConsultActions: ["Compile longitudinal medication adherence log", "Repeat baseline metabolic panel prior to consultation"],
    matchedSpecialistType: "Specialist Physician",
    confidenceScore: 88,
    triageCategoryCode: "ESI-4 (Routine Outpatient)",
    source: "clinical-rules"
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI-Powered Referral Triage Assistant Endpoint
  app.post("/api/referral/triage", async (req, res) => {
    try {
      const {
        patientName,
        patientAge,
        patientGender,
        clinicalHistory,
        symptoms,
        attachedDiagnostics = [],
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        console.log("No valid GEMINI_API_KEY found. Using heuristic clinical triage engine.");
        const fallbackResult = runHeuristicTriage({
          patientName,
          patientAge,
          clinicalHistory,
          symptoms,
          attachedDiagnostics,
        });
        return res.json(fallbackResult);
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const diagnosticText = attachedDiagnostics
        .map(
          (d: { name: string; type: string; summary?: string; findings?: string; isAbnormal?: boolean }, idx: number) =>
            `[Attachment ${idx + 1}] Type: ${d.type} | Name: ${d.name} | Abnormal: ${d.isAbnormal ? "YES" : "NO"}\nSummary: ${d.summary || ""}\nDetailed Findings: ${d.findings || ""}`
        )
        .join("\n\n");

      const prompt = `You are a Senior Clinical Triage Officer at an academic medical center.
Analyze the following patient presentation and attached diagnostic records to determine:
1. The most appropriate medical or surgical specialty and secondary subspecialty for the receiving consultant.
2. The exact clinical urgency level ('Emergency', 'Urgent', or 'Routine') based on Emergency Severity Index (ESI) and established international referral guidelines.
3. Specific clinical reasoning citing the diagnostic data, red flags to watch for, and recommended pre-consultation stabilizing actions.

Patient: ${patientName || "Unknown"} (Age: ${patientAge || "N/A"}, Gender: ${patientGender || "N/A"})
Clinical History / Reason for Referral: ${clinicalHistory || "None provided"}
Current Symptoms / Presentation: ${symptoms || "None provided"}

Attached Diagnostic Data:
${diagnosticText || "No diagnostic files attached."}

Strict Guidelines:
- Emergency: Immediate life, limb, or organ threat requiring action within 2-4 hours (e.g., STEMI, acute stroke, aortic dissection, cauda equina, peritonitis).
- Urgent: High risk of decompensation or irreversible harm if not evaluated within 24-48 hours (e.g., unstable angina, severe aortic stenosis, rapidly deteriorating renal function, suspected aggressive malignancy).
- Routine: Stable, elective, or chronic condition appropriate for outpatient scheduling within 1-2 weeks.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an expert clinical triage physician assistant specializing in cross-disciplinary specialist referrals, diagnostic interpretation, and emergency severity categorization. Always output valid JSON strictly conforming to the requested schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedSpecialty: {
                type: Type.STRING,
                description: "The primary receiving medical/surgical specialty (e.g. Cardiology, Neurology, Nephrology, Cardiothoracic Surgery).",
              },
              secondarySpecialty: {
                type: Type.STRING,
                description: "Optional secondary subspecialty or multidisciplinary team involved.",
              },
              suggestedUrgency: {
                type: Type.STRING,
                description: "Must be exactly one of: 'Emergency', 'Urgent', or 'Routine'.",
              },
              urgencyRationale: {
                type: Type.STRING,
                description: "One or two concise sentences explaining why this urgency level is warranted based on the diagnostic data.",
              },
              clinicalReasoning: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key bullet points justifying the triage recommendation with direct reference to the diagnostic findings.",
              },
              keyDiagnosticFindings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "The critical abnormal or pertinent diagnostic indicators identified.",
              },
              redFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Clinical warning signs or decompensation risks to monitor for.",
              },
              preConsultActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Recommended immediate clinical actions or labs the referring doctor should order prior to or upon specialist transfer.",
              },
              matchedSpecialistType: {
                type: Type.STRING,
                description: "The ideal specialist designation (e.g., Interventional Cardiologist, Stroke Neurologist).",
              },
              confidenceScore: {
                type: Type.NUMBER,
                description: "Confidence percentage of this triage assessment (e.g. 95).",
              },
              triageCategoryCode: {
                type: Type.STRING,
                description: "Formal clinical code such as ESI-1, ESI-2, ESI-3, or MTS category.",
              },
            },
            required: [
              "suggestedSpecialty",
              "suggestedUrgency",
              "urgencyRationale",
              "clinicalReasoning",
              "keyDiagnosticFindings",
              "redFlags",
              "preConsultActions",
              "matchedSpecialistType",
              "confidenceScore",
              "triageCategoryCode",
            ],
          },
        },
      });

      const rawText = response.text?.trim() || "";
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn("Gemini JSON parse failed, extracting via regex:", parseErr);
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse JSON from model output");
        }
      }

      // Ensure urgency is strictly formatted
      if (!["Emergency", "Urgent", "Routine"].includes(parsed.suggestedUrgency)) {
        if (parsed.suggestedUrgency?.toLowerCase().includes("emerg")) {
          parsed.suggestedUrgency = "Emergency";
        } else if (parsed.suggestedUrgency?.toLowerCase().includes("urg")) {
          parsed.suggestedUrgency = "Urgent";
        } else {
          parsed.suggestedUrgency = "Routine";
        }
      }

      parsed.source = "gemini";
      return res.json(parsed);
    } catch (error) {
      console.error("Gemini triage error:", error);
      // Fallback seamlessly to rule-based engine on any error
      const fallback = runHeuristicTriage(req.body);
      return res.json(fallback);
    }
  });

  // AI-Powered Dosage & Renal Adjustment Calculator Endpoint
  app.post("/api/dosage/calculate", async (req, res) => {
    try {
      const {
        medicationName,
        indication,
        patientAge = 50,
        patientWeight = 70,
        patientGender = "Male",
        serumCreatinine,
        serumCreatinineUnit = "umol/L",
        eGfr,
        crCl,
        renalCategory,
        isDialysis = false,
        clinicalNotes,
      } = req.body;

      // Base pharmacokinetic clearance assessment
      const renalCalc = calculateCockcroftGault({
        age: Number(patientAge) || 50,
        weightKg: Number(patientWeight) || 70,
        gender: patientGender,
        serumCreatinineUmolL: serumCreatinineUnit === "mg/dL" ? undefined : Number(serumCreatinine),
        serumCreatinineMgDl: serumCreatinineUnit === "mg/dL" ? Number(serumCreatinine) : undefined,
      });

      const effectiveCrCl = Number(crCl) || Number(eGfr) || renalCalc.crCl;

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        console.log("No valid GEMINI_API_KEY found. Using heuristic clinical dosage engine.");
        const fallbackResult = calculateDosageRecommendation({
          ...req.body,
          crCl: effectiveCrCl,
        });
        return res.json(fallbackResult);
      }

      // Initialize Gemini Client
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const prompt = `You are a Board-Certified Clinical Pharmacologist and Renal Pharmacokinetics Consultant.
Evaluate the following patient parameters and calculate the exact recommended dosage, administration frequency, and duration for the specified medication:

Medication: ${medicationName || "Unspecified"}
Clinical Indication: ${indication || "General therapeutic indication"}
Patient Age: ${patientAge} years (${patientAge < 18 ? "Pediatric" : patientAge >= 65 ? "Geriatric" : "Adult"})
Patient Weight: ${patientWeight} kg
Patient Gender: ${patientGender}

Renal Clearance Profile:
- Cockcroft-Gault CrCl (Estimated): ${effectiveCrCl} mL/min
- Serum Creatinine: ${serumCreatinine ? `${serumCreatinine} ${serumCreatinineUnit}` : "Normal baseline assumed"}
- KDIGO Renal Staging: ${renalCalc.kdigoStage}
- Category: ${renalCategory || renalCalc.renalCategory}
- Dialysis / RRT: ${isDialysis ? "Yes (Hemodialysis dependent)" : "No"}
- Clinical Notes: ${clinicalNotes || "None"}

Please calculate:
1. Standard adult dose vs Recommended dose adjusted for this patient's age, weight, and renal clearance.
2. Suggested frequency (e.g. 'Every 12 hours', 'Every 24 hours', 'Every 48 hours', 'Post-hemodialysis') with clear interval rationale.
3. Suggested duration (e.g. '7 days', '10 days', '30 days supply with refills') based on clinical guidelines for this indication.
4. Calculated directions/sig string suitable for direct insertion onto an official e-prescription.
5. Renal adjustment summary and percentage dose modification (if applicable).
6. Pharmacokinetic rationale citing clearance pathway (glomerular filtration, tubular secretion, half-life prolongation).
7. Therapeutic drug monitoring (TDM) guidelines (troughs, creatinine monitoring) and safety alerts.
8. Whether the medication is contraindicated at this level of renal function, and safer alternative drug options if applicable.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are an expert clinical pharmacologist and nephrology dosing specialist. Always return precise, evidence-based medication dosing according to KDIGO, Sanford Guide, and FDA/EMA prescribing information. Output strictly valid JSON conforming to the schema.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              medicationName: { type: Type.STRING },
              indication: { type: Type.STRING },
              standardDose: { type: Type.STRING, description: "Standard unadjusted adult dose" },
              recommendedDose: { type: Type.STRING, description: "Adjusted dose for this patient" },
              suggestedFrequency: { type: Type.STRING, description: "Administration frequency (e.g., Every 24 hours)" },
              suggestedDuration: { type: Type.STRING, description: "Course duration (e.g., 7 days or 30 days supply)" },
              calculatedDirections: { type: Type.STRING, description: "Complete clinical instruction line for prescription" },
              isRenalAdjustmentRequired: { type: Type.BOOLEAN },
              adjustmentPercentage: { type: Type.NUMBER, description: "Percentage dose change, e.g. -50 for half dose, 0 if none" },
              adjustmentSummary: { type: Type.STRING, description: "Concise summary of renal modification" },
              kdigoStage: { type: Type.STRING, description: "KDIGO stage (e.g., G3b Moderate-to-Severe Reduction)" },
              calculatedCrCl: { type: Type.NUMBER, description: "Creatinine clearance in mL/min" },
              ageCategory: { type: Type.STRING, description: "Pediatric, Adult, or Geriatric" },
              pediatricOrGeriatricNote: { type: Type.STRING, description: "Specific age-related advisory note if applicable" },
              pharmacokineticRationale: { type: Type.STRING, description: "Explanation of drug clearance and half-life kinetics" },
              monitoringGuidelines: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key monitoring parameters (e.g., trough levels, eGFR, electrolytes)",
              },
              safetyAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Warnings, black box alerts, toxicity symptoms to monitor",
              },
              contraindicated: { type: Type.BOOLEAN, description: "True if drug is contraindicated in this renal stage" },
              alternativeOptions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Alternative safer medications if contraindicated or suboptimal",
              },
            },
            required: [
              "medicationName",
              "recommendedDose",
              "suggestedFrequency",
              "suggestedDuration",
              "calculatedDirections",
              "isRenalAdjustmentRequired",
              "adjustmentSummary",
              "pharmacokineticRationale",
              "monitoringGuidelines",
              "safetyAlerts",
              "contraindicated",
            ],
          },
        },
      });

      const rawText = response.text?.trim() || "";
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn("Gemini JSON parse failed, extracting via regex:", parseErr);
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        } else {
          throw new Error("Could not parse JSON from model output");
        }
      }

      parsed.calculatedCrCl = parsed.calculatedCrCl || effectiveCrCl;
      parsed.kdigoStage = parsed.kdigoStage || renalCalc.kdigoStage;
      parsed.crClFormulaExplanation = renalCalc.explanation;
      parsed.source = "gemini";

      return res.json(parsed);
    } catch (error) {
      console.error("Gemini dosage calculator error:", error);
      const fallback = calculateDosageRecommendation(req.body);
      return res.json(fallback);
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
