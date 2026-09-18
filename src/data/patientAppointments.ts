import { PatientAppointment } from "../types";

export const MOCK_APPOINTMENTS: PatientAppointment[] = [
  // James Miller (pat-1)
  {
    id: "apt-101",
    patientId: "pat-1",
    patientName: "James Miller",
    date: "Tomorrow, 18 Sep 2026",
    time: "14:30 PM",
    clinician: "Dr. Sarah Chen",
    clinicianTitle: "MD, FCP(SA)",
    specialty: "Cardiology & Internal Medicine",
    facility: "Metro Medical Center — West Wing",
    roomOrSuite: "Consultation Suite 304",
    appointmentType: "Review",
    status: "Confirmed",
    reasonForVisit: "Hypertension Control & 24h Ambulatory Blood Pressure Monitor Review",
    preparationNotes: [
      "Bring your 14-day home blood pressure log book or smartphone readings.",
      "Bring current medication boxes (Amlodipine 5mg & Atorvastatin 20mg).",
      "Fasting is not required for this visit.",
      "Check in at Reception Desk B upon arrival."
    ],
    reminderStatus: "WhatsApp Confirmed",
    isVirtual: false,
  },
  {
    id: "apt-102",
    patientId: "pat-1",
    patientName: "James Miller",
    date: "Thursday, 15 Oct 2026",
    time: "09:15 AM",
    clinician: "Dr. Elena Vasquez",
    clinicianTitle: "RD (SA), Clinical Nutritionist",
    specialty: "Clinical Nutrition & Dietetics",
    facility: "Gardens Health Pavilion",
    roomOrSuite: "Nutritional Therapy Suite 4",
    appointmentType: "Follow-up",
    status: "Scheduled",
    reasonForVisit: "DASH Diet & Cardiovascular Sodium Reduction Follow-Up",
    preparationNotes: [
      "Complete the 3-day food and fluid intake diary prior to arrival.",
      "Wear comfortable clothing for bio-impedance composition assessment."
    ],
    reminderStatus: "Delivered",
    isVirtual: false,
  },
  {
    id: "apt-103",
    patientId: "pat-1",
    patientName: "James Miller",
    date: "Wednesday, 18 Nov 2026",
    time: "11:00 AM",
    clinician: "Dr. Sarah Chen",
    clinicianTitle: "MD, FCP(SA)",
    specialty: "Cardiology & Internal Medicine",
    facility: "Metro Medical Center — West Wing",
    roomOrSuite: "Telehealth Room 2",
    appointmentType: "Consultation",
    status: "Scheduled",
    reasonForVisit: "Routine 6-Month Chronic Medication Refill & Remote Vitals Check",
    preparationNotes: [
      "Log into the virtual room 5 minutes before scheduled start time.",
      "Have your arm blood pressure cuff nearby for on-camera measurement."
    ],
    reminderStatus: "Delivered",
    isVirtual: true,
  },

  // Elena Rostova (pat-2)
  {
    id: "apt-201",
    patientId: "pat-2",
    patientName: "Elena Rostova",
    date: "Today, 17 Sep 2026",
    time: "15:15 PM",
    clinician: "Dr. Sarah Chen",
    clinicianTitle: "MD, FCP(SA)",
    specialty: "Cardiology & Internal Medicine",
    facility: "Metro Medical Center — West Wing",
    roomOrSuite: "Consultation Suite 304",
    appointmentType: "Follow-up",
    status: "Confirmed",
    reasonForVisit: "Cardiology Specialist Follow-up & Resting ECG Review",
    preparationNotes: [
      "Avoid caffeine or nicotine for 2 hours before the appointment.",
      "Wear a two-piece outfit for easy access to chest for 12-lead ECG electrodes."
    ],
    reminderStatus: "WhatsApp Confirmed",
    isVirtual: false,
  },
  {
    id: "apt-202",
    patientId: "pat-2",
    patientName: "Elena Rostova",
    date: "Tuesday, 29 Sep 2026",
    time: "10:00 AM",
    clinician: "Dr. Alan Mercer",
    clinicianTitle: "MD, FRCP",
    specialty: "Neurology & Stroke Medicine",
    facility: "Kingsbury Clinic",
    roomOrSuite: "Neurosciences Suite 402",
    appointmentType: "Consultation",
    status: "Scheduled",
    reasonForVisit: "Neurological Post-Thrombectomy Functional Assessment",
    preparationNotes: [
      "Bring recent brain MRI and angiography reports on USB disc.",
      "A family member or caregiver is encouraged to accompany."
    ],
    reminderStatus: "Delivered",
    isVirtual: false,
  },

  // Robert Taylor (pat-3)
  {
    id: "apt-301",
    patientId: "pat-3",
    patientName: "Robert Taylor",
    date: "Today, 17 Sep 2026",
    time: "16:00 PM",
    clinician: "Dr. Marcus Vance",
    clinicianTitle: "MD, FACC",
    specialty: "Cardiology & Interventional",
    facility: "Metro Medical Center — West Wing",
    roomOrSuite: "Cath Lab / Suite 102",
    appointmentType: "Consultation",
    status: "Confirmed",
    reasonForVisit: "Urgent Inter-Doctor Referral (Angina Pectoris & Coronary CTA Review)",
    preparationNotes: [
      "Strict fasting from 12:00 PM noon onwards.",
      "Do not consume coffee, tea, chocolate, or energy drinks today.",
      "Bring all recent cardiac lab results and referral letter from Dr. Sarah Chen."
    ],
    reminderStatus: "WhatsApp Confirmed",
    isVirtual: false,
  },
  {
    id: "apt-302",
    patientId: "pat-3",
    patientName: "Robert Taylor",
    date: "Friday, 25 Sep 2026",
    time: "08:30 AM",
    clinician: "Dr. Marcus Vance",
    clinicianTitle: "MD, FACC",
    specialty: "Cardiology & Interventional",
    facility: "Metro Medical Center — West Wing",
    roomOrSuite: "Cardiac Day Ward",
    appointmentType: "Procedure",
    status: "Scheduled",
    reasonForVisit: "Elective Diagnostic Coronary Angiography (Radial Access)",
    preparationNotes: [
      "Strict nil by mouth from midnight prior.",
      "Arrange an adult driver for discharge transport in the afternoon.",
      "Hold metformin for 48 hours prior as instructed."
    ],
    reminderStatus: "Delivered",
    isVirtual: false,
  },

  // Lucas Graham (pat-4)
  {
    id: "apt-401",
    patientId: "pat-4",
    patientName: "Lucas Graham",
    date: "Monday, 21 Sep 2026",
    time: "11:00 AM",
    clinician: "Dr. Priya Patel",
    clinicianTitle: "MD, FCS(SA) Cardio",
    specialty: "Cardiothoracic Surgery",
    facility: "St. Jude Specialist Hospital",
    roomOrSuite: "Surgical Outpatients Clinic B",
    appointmentType: "Consultation",
    status: "Confirmed",
    reasonForVisit: "Transcatheter Aortic Valve Implantation (TAVI) Multidisciplinary Pre-Admission",
    preparationNotes: [
      "Bring complete echocardiography CD and CT TAVI protocol scan.",
      "Dental clearance documentation must be handed to surgical registrar."
    ],
    reminderStatus: "WhatsApp Confirmed",
    isVirtual: false,
  },

  // Miriam Al-Mansoor (pat-5)
  {
    id: "apt-501",
    patientId: "pat-5",
    patientName: "Miriam Al-Mansoor",
    date: "Wednesday, 23 Sep 2026",
    time: "10:30 AM",
    clinician: "Dr. Elena Vasquez",
    clinicianTitle: "MD, MMed (Surg)",
    specialty: "Surgical Oncology & Dermatosurgery",
    facility: "Life Vincent Pallotti Hospital",
    roomOrSuite: "Oncology Pavilion Suite 12",
    appointmentType: "Follow-up",
    status: "Scheduled",
    reasonForVisit: "Surgical Wound Inspection & Formal Histopathology Biopsy Results",
    preparationNotes: [
      "Keep dressing dry and in place until doctor examination.",
      "Bring any questions regarding surgical margin clearance."
    ],
    reminderStatus: "Delivered",
    isVirtual: false,
  },

  // David K. Ndlovu (pat-6)
  {
    id: "apt-601",
    patientId: "pat-6",
    patientName: "David K. Ndlovu",
    date: "Wednesday, 30 Sep 2026",
    time: "11:30 AM",
    clinician: "Dr. Thabo Mokoena",
    clinicianTitle: "MD, FCP(SA) Nephro",
    specialty: "Nephrology & Renal Medicine",
    facility: "Netcare Christiaan Barnard Memorial Hospital",
    roomOrSuite: "Renal Care Suite 801",
    appointmentType: "Review",
    status: "Confirmed",
    reasonForVisit: "eGFR Monitoring & 24h Urine Proteinuria Follow-Up",
    preparationNotes: [
      "Submit 24-hour urine collection container to PathCare lab 24 hours before visit.",
      "Bring all current medications including ACE inhibitors / ARBs."
    ],
    reminderStatus: "WhatsApp Confirmed",
    isVirtual: false,
  },
];
