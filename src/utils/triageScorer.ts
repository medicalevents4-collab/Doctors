import {
  TriageFormTemplate,
  TriageFormResponseMap,
  CalculatedTriageScore,
  TriageUrgencyLevel,
} from "../types";

/**
 * Calculates the clinical urgency score and triage level from a form response
 * and a configured questionnaire template.
 */
export function calculateTriageScore(
  template: TriageFormTemplate,
  responses: TriageFormResponseMap
): CalculatedTriageScore {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const triggeredRedFlags: { fieldId: string; fieldLabel: string; reason: string }[] = [];
  const fieldContributions: { fieldId: string; fieldLabel: string; score: number; detail: string }[] = [];
  let directOverrideUrgency: TriageUrgencyLevel | null = null;
  let isEmergencyOverride = false;

  for (const field of template.fields) {
    const rawVal = responses[field.id];

    // Calculate maximum possible score for this field
    if (field.type === "single_choice" && field.options) {
      const maxOpt = Math.max(0, ...field.options.map((o) => o.score));
      maxPossibleScore += maxOpt;
    } else if (field.type === "multiple_choice" && field.options) {
      const sumOpts = field.options.reduce((sum, o) => sum + Math.max(0, o.score), 0);
      maxPossibleScore += sumOpts;
    } else if (field.type === "vital_number" && field.vitalThresholds) {
      const maxThresh = Math.max(0, ...field.vitalThresholds.map((t) => t.score));
      maxPossibleScore += maxThresh;
    } else if (field.type === "boolean_flag") {
      maxPossibleScore += field.defaultScore ?? 3;
    }

    if (rawVal === undefined || rawVal === null || rawVal === "") {
      continue;
    }

    // Process Single Choice
    if (field.type === "single_choice" && field.options) {
      const selectedOption = field.options.find((opt) => opt.id === rawVal || opt.label === rawVal);
      if (selectedOption) {
        const pts = selectedOption.score || 0;
        totalScore += pts;
        fieldContributions.push({
          fieldId: field.id,
          fieldLabel: field.label,
          score: pts,
          detail: `${selectedOption.label} (+${pts} pts)`,
        });

        if (selectedOption.isRedFlag) {
          triggeredRedFlags.push({
            fieldId: field.id,
            fieldLabel: field.label,
            reason: `Red-Flag Selection: ${selectedOption.label}`,
          });
        }

        if (selectedOption.overrideUrgency) {
          if (selectedOption.overrideUrgency === "Emergency") {
            directOverrideUrgency = "Emergency";
            isEmergencyOverride = true;
          } else if (selectedOption.overrideUrgency === "Urgent" && directOverrideUrgency !== "Emergency") {
            directOverrideUrgency = "Urgent";
          }
        }
      }
    }

    // Process Multiple Choice
    else if (field.type === "multiple_choice" && field.options) {
      const selectedIds = Array.isArray(rawVal) ? (rawVal as string[]) : [String(rawVal)];
      let fieldPoints = 0;
      const details: string[] = [];

      for (const optId of selectedIds) {
        const opt = field.options.find((o) => o.id === optId || o.label === optId);
        if (opt) {
          fieldPoints += opt.score;
          details.push(`${opt.label} (+${opt.score})`);

          if (opt.isRedFlag) {
            triggeredRedFlags.push({
              fieldId: field.id,
              fieldLabel: field.label,
              reason: `Critical Red-Flag: ${opt.label}`,
            });
          }

          if (opt.overrideUrgency === "Emergency") {
            directOverrideUrgency = "Emergency";
            isEmergencyOverride = true;
          }
        }
      }

      if (fieldPoints > 0 || details.length > 0) {
        totalScore += fieldPoints;
        fieldContributions.push({
          fieldId: field.id,
          fieldLabel: field.label,
          score: fieldPoints,
          detail: details.join(", "),
        });
      }
    }

    // Process Vital Number
    else if (field.type === "vital_number" && field.vitalThresholds) {
      const numVal = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal));
      if (!isNaN(numVal)) {
        // Find matching threshold
        const matched = field.vitalThresholds.find((thresh) => {
          const aboveMin = thresh.min === undefined || numVal >= thresh.min;
          const belowMax = thresh.max === undefined || numVal <= thresh.max;
          return aboveMin && belowMax;
        });

        if (matched) {
          totalScore += matched.score;
          fieldContributions.push({
            fieldId: field.id,
            fieldLabel: field.label,
            score: matched.score,
            detail: `${numVal} ${field.vitalUnit || ""} [${matched.label}] (+${matched.score} pts)`,
          });

          if (matched.isRedFlag) {
            triggeredRedFlags.push({
              fieldId: field.id,
              fieldLabel: field.label,
              reason: `Abnormal Vital Alert: ${numVal} ${field.vitalUnit || ""} (${matched.label})`,
            });
          }

          if (matched.overrideUrgency === "Emergency") {
            directOverrideUrgency = "Emergency";
            isEmergencyOverride = true;
          }
        }
      }
    }

    // Process Boolean Red-Flag
    else if (field.type === "boolean_flag") {
      const isChecked = rawVal === true || rawVal === "true";
      if (isChecked) {
        const pts = field.defaultScore ?? 4;
        totalScore += pts;
        fieldContributions.push({
          fieldId: field.id,
          fieldLabel: field.label,
          score: pts,
          detail: `Confirmed Red-Flag Flag (+${pts} pts)`,
        });

        triggeredRedFlags.push({
          fieldId: field.id,
          fieldLabel: field.label,
          reason: `Positive Red-Flag Discriminator: ${field.label}`,
        });

        // Any affirmative boolean red flag triggers Emergency escalation
        directOverrideUrgency = "Emergency";
        isEmergencyOverride = true;
      }
    }
  }

  // Determine Urgency Tier
  let assignedUrgency: TriageUrgencyLevel = "Routine";
  const { routineMax, priorityMax, urgentMax } = template.thresholds;

  if (isEmergencyOverride || triggeredRedFlags.length > 0) {
    assignedUrgency = "Emergency";
  } else if (directOverrideUrgency === "Urgent") {
    assignedUrgency = "Urgent";
  } else if (totalScore > urgentMax) {
    assignedUrgency = "Emergency";
  } else if (totalScore > priorityMax) {
    assignedUrgency = "Urgent";
  } else if (totalScore > routineMax) {
    assignedUrgency = "Priority";
  } else {
    assignedUrgency = "Routine";
  }

  // Target max wait times and color codes according to ESI / SATS clinical guidelines
  let targetMaxWaitMinutes = 120;
  let urgencyColor = "emerald";
  let triageCategoryCode = "ESI-5 / Routine";
  const recommendedActions: string[] = [];

  switch (assignedUrgency) {
    case "Emergency":
      targetMaxWaitMinutes = 0; // Immediate
      urgencyColor = "rose";
      triageCategoryCode = "ESI-1 / Resuscitation (RED)";
      recommendedActions.push("Immediate transfer to Resuscitation Bay / High Care");
      recommendedActions.push("Continuous cardiac monitoring, SpO2 & high-flow supplemental O2");
      recommendedActions.push("Establish wide-bore IV access (16-18G) and notify Attending Physician");
      if (triggeredRedFlags.length > 0) {
        recommendedActions.push(`Critical Discriminators: ${triggeredRedFlags.map((r) => r.reason).join("; ")}`);
      }
      break;

    case "Urgent":
      targetMaxWaitMinutes = 15;
      urgencyColor = "orange";
      triageCategoryCode = "ESI-2 / Very Urgent (ORANGE)";
      recommendedActions.push("Place in Acute Examination Cubicle within 15 minutes");
      recommendedActions.push("Stat baseline ECG / point-of-care capillary glucose / biomarker draw");
      recommendedActions.push("Nurse assessment with vital signs re-checked every 15-30 minutes");
      break;

    case "Priority":
      targetMaxWaitMinutes = 60;
      urgencyColor = "amber";
      triageCategoryCode = "ESI-3 / Urgent (YELLOW)";
      recommendedActions.push("Subacute Observation Bay (Target review within 60 minutes)");
      recommendedActions.push("Initiate protocolized oral rehydration or first-line oral analgesia");
      recommendedActions.push("Repeat vitals within 60 minutes or upon clinical deterioration");
      break;

    case "Routine":
    default:
      targetMaxWaitMinutes = 180;
      urgencyColor = "emerald";
      triageCategoryCode = "ESI-4/5 / Non-Urgent (GREEN)";
      recommendedActions.push("Standard Outpatient / Ambulatory Waiting Area");
      recommendedActions.push("Advise patient to report any acute worsening of symptoms immediately");
      recommendedActions.push("Target physician review within standard queue (120-180 minutes)");
      break;
  }

  return {
    totalScore,
    assignedUrgency,
    urgencyColor,
    triageCategoryCode,
    maxPossibleScore: Math.max(maxPossibleScore, totalScore),
    triggeredRedFlags,
    fieldContributions,
    recommendedActions,
    suggestedDepartment: template.department,
    targetMaxWaitMinutes,
    isEmergencyOverride,
  };
}
