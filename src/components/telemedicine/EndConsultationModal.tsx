import React from "react";
import {
  CheckCircle2,
  FileText,
  FileSignature,
  Share2,
  X,
  PhoneOff,
  Clock,
  ShieldCheck,
  Download,
  Printer
} from "lucide-react";
import { TelemedicineConsultation } from "../../types";

interface EndConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmEnd: () => void;
  onOpenRxModal: () => void;
  consultation: TelemedicineConsultation;
  callDurationSeconds: number;
}

export const EndConsultationModal: React.FC<EndConsultationModalProps> = ({
  isOpen,
  onClose,
  onConfirmEnd,
  onOpenRxModal,
  consultation,
  callDurationSeconds,
}) => {
  if (!isOpen) return null;

  const mins = Math.floor(callDurationSeconds / 60);
  const secs = callDurationSeconds % 60;
  const durationStr = `${mins}m ${secs}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-950 text-rose-400 rounded-xl border border-rose-800/60">
              <PhoneOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">End Virtual Consultation?</h3>
              <p className="text-xs text-slate-400">Session summary and post-call compliance checklist</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">Patient Consultation</span>
              <span className="text-sm font-bold text-white">{consultation.patientName}</span>
              <span className="text-[11px] text-teal-400 block mt-0.5">
                {consultation.consultationType} • {consultation.patientMrn}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Duration</span>
              <span className="text-sm font-bold font-mono text-emerald-400 flex items-center gap-1 justify-end">
                <Clock className="w-3.5 h-3.5" />
                {durationStr}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Tariff Code: 0130</span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Post-Consultation Actions
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRxModal();
                }}
                className="p-3 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl text-left transition-colors flex items-start gap-2.5"
              >
                <FileSignature className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">Issue E-Prescription</span>
                  <span className="text-[11px] text-slate-400 block">Cryptographic script</span>
                </div>
              </button>

              <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl text-left flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold text-white block">SOAP Note Saved</span>
                  <span className="text-[11px] text-slate-400 block">Logged to Patient EHR</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Session recording, chat audit trail, and WebRTC logs archived under POPIA/HIPAA compliance policy.
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Return to Call
          </button>

          <button
            type="button"
            id="btn-confirm-end-call"
            onClick={onConfirmEnd}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-900/40 transition-all flex items-center gap-1.5"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>Complete & Close Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
