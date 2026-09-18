export type ModuleId = 
  | "dashboard"
  | "prescriptions"
  | "telemedicine"
  | "labs"
  | "referrals"
  | "invoices"
  | "patients"
  | "portal"
  | "settings"
  | "triage";

export interface PatientAppointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  clinician: string;
  clinicianTitle?: string;
  specialty: string;
  facility: string;
  roomOrSuite: string;
  appointmentType: "Consultation" | "Follow-up" | "Diagnostic" | "Procedure" | "Review";
  status: "Confirmed" | "Scheduled" | "Completed" | "Cancelled";
  reasonForVisit: string;
  preparationNotes: string[];
  reminderStatus: "WhatsApp Confirmed" | "Pending SMS" | "Delivered";
  isVirtual?: boolean;
}

export interface NavItem {
  id: ModuleId;
  label: string;
  badge?: string | number;
  badgeColor?: string;
}

export interface DoctorProfile {
  name: string;
  title: string;
  specialty: string;
  licenseNumber: string;
  practiceNumber: string;
  clinicName: string;
  initials: string;
}

export interface PrescriptionSummary {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  patientAge: number;
  medications: string[];
  diagnosisIcd10: string;
  status: "ISSUED" | "DISPENSED" | "EXPIRED";
  securityHash: string;
  issuedDate: string;
  deliveryChannel: "WhatsApp" | "Email" | "SMS";
}

export interface DiagnosticAttachment {
  id: string;
  name: string;
  type: "ECG" | "LabReport" | "Imaging" | "Biomarkers" | "Pathology" | "Vitals" | "Report";
  date: string;
  summary: string;
  findings: string;
  fileSize?: string;
  isAbnormal?: boolean;
}

export interface TriageResult {
  suggestedSpecialty: string;
  secondarySpecialty?: string;
  suggestedUrgency: "Routine" | "Urgent" | "Emergency";
  urgencyRationale: string;
  clinicalReasoning: string[];
  keyDiagnosticFindings: string[];
  redFlags: string[];
  preConsultActions: string[];
  matchedSpecialistType: string;
  confidenceScore: number;
  triageCategoryCode: string;
  source?: "gemini" | "clinical-rules";
}

export interface ReferralSummary {
  id: string;
  patientName: string;
  referringDoctor: string;
  specialistName: string;
  specialty: string;
  urgency: "Routine" | "Urgent" | "Emergency";
  status: "Pending" | "Accepted" | "Consulted" | "Completed";
  clinicalSummary: string;
  attachmentCount: number;
  createdAt: string;
  attachments?: DiagnosticAttachment[];
  triageResult?: TriageResult;
}

export interface InvoiceItem {
  id: string;
  code: string;
  description: string;
  category: "Consultation" | "Procedure" | "Facility" | "Consumables" | "Anesthesia" | "Medication" | "Diagnostics";
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface InvoiceSummary {
  id: string;
  docNumber: string;
  docType: "QUOTATION" | "PRO_FORMA" | "TAX_INVOICE";
  patientName: string;
  procedureDescription: string;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  status: "DRAFT" | "SENT" | "PAID" | "OVERDUE";
  dueDate: string;
  daysOverdue?: number;
  patientPhone?: string;
  patientEmail?: string;
  medicalAidName?: string;
  lastReminderSent?: string;
}

export interface OverduePaymentNotification {
  id: string;
  invoiceId: string;
  docNumber: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  medicalAidName?: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  urgency: "MODERATE" | "HIGH" | "CRITICAL"; // 31-60d = MODERATE (amber), 61-90d = HIGH (orange), >90d = CRITICAL (rose)
  procedureDescription: string;
  timestamp: string;
  isRead: boolean;
  status: "PENDING_ACTION" | "REMINDER_SENT" | "RESOLVED" | "SNOOZED";
  auditLog: Array<{
    action: string;
    timestamp: string;
    performedBy: string;
    details?: string;
  }>;
}

export interface InOfficeMedicationStock {
  id: string;
  name: string;
  genericName: string;
  category: "Cardiovascular" | "Antibiotics" | "Endocrine / Diabetes" | "Analgesics" | "Respiratory" | "Emergency";
  form: "Tablets" | "Capsules" | "Ampoules" | "Vials" | "Suspension" | "Inhaler";
  currentStock: number;
  minThreshold: number;
  unit: string;
  batchNumber: string;
  expiryDate: string;
  storageLocation: string;
  restockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  supplier: string;
  lastRestocked: string;
}

export interface PatientVitals {
  bloodPressure: string;
  heartRate: number;
  temperature: string;
  oxygenSaturation: number;
  bmi: number;
  recordedAt: string;
  bloodGlucose?: string;
}

export interface PatientConsultation {
  id: string;
  date: string;
  clinician: string;
  specialty: string;
  chiefComplaint: string;
  diagnosis: string;
  icd10Code: string;
  clinicalNotes: string;
  vitals: PatientVitals;
}

export interface PatientPrescriptionRecord {
  id: string;
  rxNumber: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  repeatsRemaining: number;
  issuedDate: string;
  expirationDate?: string;
  status: "ACTIVE" | "DISPENSED" | "EXPIRED";
  securityHash: string;
}

export interface HistoricalMedication {
  id: string;
  rxNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  medicationName: string;
  genericName: string;
  brandName?: string;
  dosage: string;
  frequency: string;
  route: string;
  indication: string;
  icd10Code: string;
  prescribedDate: string;
  expirationDate: string;
  prescribedBy: string;
  practiceNumber: string;
  totalRefillsAuthorized: number;
  refillsRemaining: number;
  refillStatus: "REFILLS_AVAILABLE" | "LOW_REFILLS" | "DEPLETED" | "NO_REFILLS_ALLOWED";
  status: "ACTIVE" | "COMPLETED" | "DISPENSED" | "EXPIRED" | "DISCONTINUED";
  daysSupply: number;
  lastDispensedDate?: string;
  dispensedPharmacy?: string;
  securityHash: string;
  instructions: string;
}

export interface PatientReferralRecord {
  id: string;
  specialistName: string;
  specialty: string;
  facility: string;
  urgency: "Routine" | "Urgent" | "Emergency";
  status: "Pending" | "Accepted" | "Consulted" | "Completed";
  referralDate: string;
  clinicalReason: string;
}

export interface PatientLabRecord {
  id: string;
  testName: string;
  date: string;
  laboratory: string;
  status: "Normal" | "Abnormal" | "Pending Review";
  keyFinding: string;
  referenceRange?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number e.g. MED-890123
  nationalId: string;
  name: string;
  dateOfBirth: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodType: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalAid: {
    scheme: string;
    plan: string;
    membershipNumber: string;
    dependentCode: string;
    status: "Active" | "Pending" | "Lapsed";
  };
  chronicConditions: string[];
  allergies: string[];
  latestVitals: PatientVitals;
  recentConsultations: PatientConsultation[];
  activePrescriptions: PatientPrescriptionRecord[];
  recentReferrals: PatientReferralRecord[];
  recentLabs: PatientLabRecord[];
  lastEncounterDate: string;
}

export type LabOrderStatus = "Requested" | "In Progress" | "Result Available";
export type LabOrderPriority = "Routine" | "Urgent" | "STAT";

export type LabCategory = 
  | "Hematology"
  | "Biochemistry"
  | "Cardiology"
  | "Endocrinology"
  | "Renal"
  | "Immunology"
  | "Microbiology"
  | "Urinalysis"
  | "Pathology";

export interface LabAnalyteResult {
  name: string;
  value: number | string;
  unit: string;
  referenceRange: string;
  referenceLow?: number;
  referenceHigh?: number;
  flag: "Normal" | "High" | "Low" | "Critical High" | "Critical Low";
  deltaNote?: string;
}

export interface LabReport {
  id: string;
  accessionNumber: string;
  collectionTime: string;
  receivedTime: string;
  reportedTime: string;
  pathologist: string;
  pathologistTitle?: string;
  laboratoryName: string;
  laboratoryBranch: string;
  accreditationNumber: string;
  overallInterpretation: string;
  clinicalImpression?: string;
  isAbnormal: boolean;
  criticalAlert?: boolean;
  criticalMessage?: string;
  analytes: LabAnalyteResult[];
  securityHash: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  patientAge: number;
  patientGender: "Male" | "Female" | "Other";
  testName: string;
  testCode: string;
  category: LabCategory;
  status: LabOrderStatus;
  priority: LabOrderPriority;
  indication: string;
  icd10Code: string;
  orderedDate: string;
  orderedTimestamp: number;
  sampleCollectedDate?: string;
  laboratory: string;
  orderingDoctor: string;
  fastingRequired: boolean;
  specimenType: string;
  tubeColor?: string;
  barcode: string;
  clinicalNotes?: string;
  turnaroundEstimate?: string;
  report?: LabReport;
}

export interface DiagnosticCatalogItem {
  id: string;
  name: string;
  code: string;
  category: LabCategory;
  specimenType: string;
  tubeColor: string;
  fastingRequired: boolean;
  commonIcd10: string;
  defaultIndication: string;
  turnaroundHours: number;
  analyteNames: string[];
}

// ---------------------------------------------------------------------------
// Dynamic Clinical Form Builder & Triage Scoring Engine Types
// ---------------------------------------------------------------------------

export type TriageQuestionType =
  | "single_choice"
  | "multiple_choice"
  | "vital_number"
  | "boolean_flag"
  | "text";

export type TriageUrgencyLevel = "Routine" | "Priority" | "Urgent" | "Emergency";

export interface TriageQuestionOption {
  id: string;
  label: string;
  description?: string;
  score: number; // Urgency weighting / score points
  isRedFlag?: boolean; // Critical red flag trigger
  overrideUrgency?: TriageUrgencyLevel; // Direct urgency level override
}

export interface TriageVitalThreshold {
  id: string;
  min?: number;
  max?: number;
  score: number;
  label: string; // e.g. "Severe Tachycardia (>130 bpm)"
  isRedFlag?: boolean;
  overrideUrgency?: TriageUrgencyLevel;
}

export interface TriageFormField {
  id: string;
  code: string;
  label: string;
  helpText?: string;
  type: TriageQuestionType;
  required: boolean;
  category: "vitals" | "symptoms" | "history" | "red_flags" | "exam";
  options?: TriageQuestionOption[];
  vitalUnit?: string;
  vitalThresholds?: TriageVitalThreshold[];
  defaultScore?: number;
}

export interface TriageUrgencyThresholds {
  routineMax: number;   // e.g. 0-3: Routine (Green, max wait 120-240 min)
  priorityMax: number;  // e.g. 4-8: Priority (Yellow, max wait 60 min)
  urgentMax: number;    // e.g. 9-14: Urgent (Orange, max wait 15-30 min)
  // 15+ or any red flag triggers Emergency (Red, immediate <10 min)
}

export interface TriageFormTemplate {
  id: string;
  title: string;
  description: string;
  department: string;
  targetDemographic: "Adult" | "Pediatric" | "Geriatric" | "All";
  version: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  isActive: boolean;
  clinicalProtocolReference?: string;
  thresholds: TriageUrgencyThresholds;
  fields: TriageFormField[];
}

export type TriageFormResponseMap = Record<string, string | string[] | number | boolean>;

export interface CalculatedTriageScore {
  totalScore: number;
  assignedUrgency: TriageUrgencyLevel;
  urgencyColor: string; // e.g., emerald, amber, orange, rose
  triageCategoryCode: string; // e.g., "ESI-1", "SATS-RED", "ESI-3"
  maxPossibleScore: number;
  triggeredRedFlags: { fieldId: string; fieldLabel: string; reason: string }[];
  fieldContributions: { fieldId: string; fieldLabel: string; score: number; detail: string }[];
  recommendedActions: string[];
  suggestedDepartment: string;
  targetMaxWaitMinutes: number;
  isEmergencyOverride: boolean;
}

export interface CompletedPatientTriageAssessment {
  id: string;
  templateId: string;
  templateTitle: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  assessedBy: string;
  assessedAt: string;
  responses: TriageFormResponseMap;
  result: CalculatedTriageScore;
  chiefComplaint: string;
  clinicalNotes?: string;
  disposition: "Waiting Room" | "Observation Bay" | "Resuscitation" | "Specialist Referral" | "Discharged";
}

export type RenalCategory = "Normal" | "Mild" | "Moderate" | "Severe" | "ESRD" | "Hemodialysis";

export interface DosageCalculatorInput {
  patientName?: string;
  patientAge: number;
  patientWeight: number; // in kg
  patientGender?: "Male" | "Female" | "Other";
  medicationName: string;
  indication?: string;
  serumCreatinine?: number; // μmol/L or mg/dL
  serumCreatinineUnit?: "umol/L" | "mg/dL";
  eGfr?: number; // mL/min/1.73m²
  crCl?: number; // Cockcroft-Gault mL/min
  renalCategory?: RenalCategory;
  isDialysis?: boolean;
  clinicalNotes?: string;
}

export interface DosageRecommendation {
  medicationName: string;
  indication: string;
  standardDose: string;
  recommendedDose: string;
  suggestedFrequency: string;
  suggestedDuration: string;
  calculatedDirections: string;
  isRenalAdjustmentRequired: boolean;
  adjustmentPercentage?: number; // e.g. -50
  adjustmentSummary: string;
  kdigoStage: string;
  calculatedCrCl: number;
  crClFormulaExplanation?: string;
  ageCategory: "Pediatric" | "Adult" | "Geriatric";
  pediatricOrGeriatricNote?: string;
  pharmacokineticRationale: string;
  monitoringGuidelines: string[];
  safetyAlerts: string[];
  contraindicated: boolean;
  alternativeOptions?: string[];
  source?: "gemini" | "clinical-rules";
}

export interface TelemedicineConsultation {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: "Male" | "Female" | "Other";
  patientMrn: string;
  scheduledTime: string;
  status: "in-call" | "waiting" | "completed" | "scheduled";
  consultationType: "Follow-up" | "Cardiology Review" | "General Practice" | "Renal Assessment" | "Post-Op Check";
  chiefComplaint: string;
  chronicConditions: string[];
  allergies: string[];
  vitals: {
    bloodPressure: string;
    heartRate: number;
    spo2: number;
    temperature: string;
    glucose?: string;
  };
}

export interface TelemedicineChatMessage {
  id: string;
  sender: "doctor" | "patient" | "system";
  senderName: string;
  timestamp: string;
  text: string;
  attachment?: {
    type: "document" | "vital" | "prescription" | "image";
    title: string;
    subtitle?: string;
  };
}

export interface ScreenSharePreset {
  id: string;
  title: string;
  category: "radiology" | "ecg" | "labs" | "records";
  description: string;
  badge: string;
}

