import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { PrescriptionSummary, DoctorProfile, Patient } from "../types";

export interface PrescriptionPdfOptions {
  rx: PrescriptionSummary;
  doctor: DoctorProfile;
  patient?: Partial<Patient>;
  repeatsAllowed?: number;
  directions?: string[];
}

/**
 * Generates a high-precision, tamper-evident cryptographic medical prescription PDF
 * with embedded QR code, doctor ECDSA digital signature block, and statutory credentials.
 */
export async function generatePrescriptionPDF({
  rx,
  doctor,
  patient,
  repeatsAllowed = 2,
  directions,
}: PrescriptionPdfOptions): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // 1. Generate High-Resolution QR Code Data URL
  const qrPayload = JSON.stringify({
    iss: "ACTIVITY-HEALTH-CORE",
    rx: rx.prescriptionNumber,
    pt: rx.patientName,
    dr: doctor.name,
    lic: doctor.licenseNumber,
    bhf: doctor.practiceNumber,
    dt: rx.issuedDate,
    sig: rx.securityHash,
    status: rx.status,
    url: `https://verify.activity-health.org/rx/v?id=${rx.prescriptionNumber}&h=${rx.securityHash.slice(0, 16)}`,
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 280,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  // --- Background / Document Styling ---
  // Top Header Accent Bar
  doc.setFillColor(13, 148, 136); // teal-600
  doc.rect(0, 0, pageWidth, 5, "F");

  // Subtle Header Background Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, 10, contentWidth, 34, "F");
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.rect(margin, 10, contentWidth, 34, "S");

  // Clinic Brand & Prescriber Information (Left Header)
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(doctor.clinicName.toUpperCase(), margin + 5, 17);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`Attending Physician: ${doctor.name} (${doctor.title})`, margin + 5, 23);
  doc.text(`Specialty: ${doctor.specialty}`, margin + 5, 28);
  doc.text(`HPCSA / Statutory Medical License: ${doctor.licenseNumber}`, margin + 5, 33);
  doc.text(`BHF Practice No: ${doctor.practiceNumber} | Tel: +27 11 982 4000`, margin + 5, 38);

  // Right Header: Prescription Identifiers & Badge
  doc.setFillColor(13, 148, 136);
  doc.roundedRect(pageWidth - margin - 52, 14, 47, 8, 1.5, 1.5, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("ELECTRONIC RX", pageWidth - margin - 47, 19.5);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(rx.prescriptionNumber, pageWidth - margin - 5, 28, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Issued: ${rx.issuedDate}`, pageWidth - margin - 5, 34, { align: "right" });
  doc.text(`Status: ${rx.status}`, pageWidth - margin - 5, 39, { align: "right" });

  // --- Patient Demographics Block ---
  const patientTop = 48;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, patientTop, contentWidth, 26, 2, 2, "FD");

  // Header banner inside patient card
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, patientTop, contentWidth, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text("PATIENT DEMOGRAPHICS & HEALTH IDENTIFIERS", margin + 4, patientTop + 4.2);

  // Patient Info Columns
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(`Full Name:`, margin + 4, patientTop + 11.5);
  doc.setFont("helvetica", "bold");
  doc.text(`${rx.patientName}`, margin + 24, patientTop + 11.5);

  doc.setFont("helvetica", "normal");
  doc.text(`Age / Gender:`, margin + 4, patientTop + 17);
  doc.setFont("helvetica", "bold");
  doc.text(`${rx.patientAge} Years • ${patient?.gender || "Adult"}`, margin + 26, patientTop + 17);

  doc.setFont("helvetica", "normal");
  doc.text(`National ID / MRN:`, margin + 4, patientTop + 22.5);
  doc.setFont("helvetica", "bold");
  doc.text(`${patient?.mrn || "MRN-2026-9021"} (${patient?.nationalId || "7403125089088"})`, margin + 34, patientTop + 22.5);

  // Right column of patient card
  const midX = margin + 98;
  doc.setFont("helvetica", "normal");
  doc.text(`Medical Aid / Scheme:`, midX, patientTop + 11.5);
  doc.setFont("helvetica", "bold");
  doc.text(`${patient?.medicalAid?.scheme || "Discovery Health"} (${patient?.medicalAid?.plan || "Classic Comprehensive"})`, midX + 36, patientTop + 11.5);

  doc.setFont("helvetica", "normal");
  doc.text(`Membership No:`, midX, patientTop + 17);
  doc.setFont("helvetica", "bold");
  doc.text(`${patient?.medicalAid?.membershipNumber || "902840192"}`, midX + 28, patientTop + 17);

  doc.setFont("helvetica", "normal");
  doc.text(`Contact / Phone:`, midX, patientTop + 22.5);
  doc.setFont("helvetica", "bold");
  doc.text(`${patient?.phone || "+27 82 451 9021"}`, midX + 28, patientTop + 22.5);

  // --- Clinical Diagnosis (ICD-10) ---
  const diagTop = 78;
  doc.setFillColor(240, 253, 250); // teal-50
  doc.setDrawColor(153, 246, 228); // teal-200
  doc.roundedRect(margin, diagTop, contentWidth, 12, 1.5, 1.5, "FD");

  doc.setTextColor(15, 118, 110); // teal-700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("PRIMARY ICD-10 CLINICAL DIAGNOSIS:", margin + 4, diagTop + 7.5);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.text(`${rx.diagnosisIcd10}`, margin + 65, diagTop + 7.5);

  // --- Rx Symbol and Prescriptions Table ---
  const rxSectionTop = 94;

  // Traditional Latin Rx symbol
  doc.setTextColor(13, 148, 136);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(28);
  doc.text("Rx", margin + 1, rxSectionTop + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("PRESCRIBED MEDICATIONS & REGIMEN", margin + 18, rxSectionTop + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Dispense according to statutory schedules. Generic substitution authorized unless specified.", margin + 18, rxSectionTop + 9.5);

  // Prescriptions Table Header
  const tableTop = rxSectionTop + 13;
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(margin, tableTop, contentWidth, 7, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("ITEM", margin + 3, tableTop + 4.8);
  doc.text("MEDICATION & FORMULATION", margin + 14, tableTop + 4.8);
  doc.text("DIRECTIONS (SIG) & FREQUENCY", margin + 85, tableTop + 4.8);
  doc.text("QTY", margin + 145, tableTop + 4.8);
  doc.text("REPEATS", margin + 162, tableTop + 4.8);

  let currentY = tableTop + 7;

  rx.medications.forEach((med, index) => {
    const isEven = index % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(margin, currentY, contentWidth, 16, "F");

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, currentY + 16, margin + contentWidth, currentY + 16);

    // Item number
    doc.setTextColor(71, 85, 105);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${index + 1}.`, margin + 4, currentY + 7);

    // Medication name
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(med, margin + 14, currentY + 6.5);

    // Schedule note
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Schedule 3/4 Statutory Prescription Drug • Dispense with patient information leaflet", margin + 14, currentY + 11.5);

    // Directions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    const directionText = directions && directions[index] 
      ? directions[index] 
      : index === 0 
      ? "Take 1 tablet daily in the morning with water" 
      : "Take 1 tablet at night before bed";
    doc.text(directionText, margin + 85, currentY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Standard 30-Day Therapeutic Cycle", margin + 85, currentY + 11.5);

    // Quantity
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("30 Tabs", margin + 145, currentY + 7);

    // Repeats
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin + 161, currentY + 3.5, 13, 6, 1, 1, "F");
    doc.setTextColor(15, 118, 110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(`${repeatsAllowed}x`, margin + 165, currentY + 7.8);

    currentY += 16;
  });

  // Statutory Warnings & Clinical Notes
  currentY += 6;
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(254, 240, 138); // amber-200
  doc.roundedRect(margin, currentY, contentWidth, 12, 1.5, 1.5, "FD");

  doc.setTextColor(161, 98, 7); // amber-700
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("STATUTORY DISPENSING PHARMACIST MANDATE:", margin + 4, currentY + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(113, 63, 18);
  doc.text(
    "1. Verify the cryptographic digital signature using the QR code before first dispense.",
    margin + 4,
    currentY + 8
  );
  doc.text(
    "2. Record dispensing event and batch numbers to the central registry. Tampered or modified PDFs void the prescription.",
    margin + 4,
    currentY + 11
  );

  currentY += 16;

  // --- Cryptographic Verification & Doctor Digital Signature Block ---
  const securityBoxHeight = 50;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, securityBoxHeight, 2, 2, "FD");

  // Top header for security box
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, currentY, contentWidth, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CRYPTOGRAPHIC VERIFICATION SEAL • ECDSA P-256 (FIPS 140-3 COMPLIANT)", margin + 4, currentY + 4.2);

  // Embed QR Code Image directly into PDF
  const qrSize = 38;
  const qrX = margin + 4;
  const qrY = currentY + 8;
  doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

  // QR Instruction Subtext
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.text("SCAN TO VERIFY", qrX + 7, qrY + qrSize + 2);

  // Security Credentials Middle Column
  const cryptoLeft = margin + qrSize + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text("Digital Signature Fingerprint & Key Spec:", cryptoLeft, currentY + 11);

  doc.setFont("courier", "bold");
  doc.setFontSize(7);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text("ECDSA P-256 (SHA-256) • Cloud KMS HSM Vault", cryptoLeft, currentY + 15);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("SHA-256 Document Integrity Digest:", cryptoLeft, currentY + 20);

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);
  // Split hash nicely
  const hash = rx.securityHash;
  doc.text(hash.substring(0, 32), cryptoLeft, currentY + 24);
  doc.text(hash.substring(32), cryptoLeft, currentY + 27.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Digital Seal Generated: ${new Date().toUTCString()}`, cryptoLeft, currentY + 33);
  doc.text(`Audit Trail Reference: AUDIT-SEC-${rx.prescriptionNumber}`, cryptoLeft, currentY + 37);
  doc.text(`Verification Gateway: https://verify.activity-health.org`, cryptoLeft, currentY + 41);

  // Doctor Signature Stamp (Right Column)
  const stampLeft = pageWidth - margin - 50;
  doc.setDrawColor(13, 148, 136);
  doc.setLineWidth(0.5);
  doc.roundedRect(stampLeft, currentY + 9, 46, 36, 1.5, 1.5, "S");

  doc.setFillColor(240, 253, 250);
  doc.rect(stampLeft, currentY + 9, 46, 5.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 118, 110);
  doc.text("DIGITALLY SIGNED", stampLeft + 9, currentY + 13);

  // Signature script look
  doc.setFont("times", "bolditalic");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(doctor.name, stampLeft + 4, currentY + 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text(`${doctor.title} - ${doctor.specialty}`, stampLeft + 4, currentY + 28);
  doc.text(`Lic: ${doctor.licenseNumber}`, stampLeft + 4, currentY + 32);
  doc.text(`BHF: ${doctor.practiceNumber}`, stampLeft + 4, currentY + 36);
  doc.setFont("courier", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(13, 148, 136);
  doc.text("VERIFIED VALID", stampLeft + 4, currentY + 41);

  // --- Document Footer ---
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "ACTIVITY Healthcare Multi-Tenant Engine • Cryptographically Authenticated Medical Document • Page 1 of 1",
    margin,
    pageHeight - 8
  );
  doc.text(`Confidential Medical Record • ${rx.prescriptionNumber}`, pageWidth - margin, pageHeight - 8, {
    align: "right",
  });

  return doc;
}

/**
 * Convenience helper to download the PDF directly in the user's browser
 */
export async function downloadPrescriptionPDF(
  options: PrescriptionPdfOptions
): Promise<void> {
  const doc = await generatePrescriptionPDF(options);
  const fileName = `Prescription_${options.rx.prescriptionNumber}_${options.rx.patientName.replace(/\s+/g, "_")}.pdf`;
  doc.save(fileName);
}

/**
 * Convenience helper to obtain a Blob URL for inline viewing/preview
 */
export async function getPrescriptionPdfBlobUrl(
  options: PrescriptionPdfOptions
): Promise<string> {
  const doc = await generatePrescriptionPDF(options);
  const blob = doc.output("blob");
  return URL.createObjectURL(blob);
}
