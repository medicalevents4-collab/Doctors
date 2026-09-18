import React from "react";
import {
  Video,
  Clock,
  User,
  Activity,
  Calendar,
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { TelemedicineConsultation } from "../../types";

export const MOCK_TELEMEDICINE_QUEUE: TelemedicineConsultation[] = [
  {
    id: "tele-1",
    patientId: "pat-1",
    patientName: "James Miller",
    patientAge: 52,
    patientGender: "Male",
    patientMrn: "MED-890123",
    scheduledTime: "10:00 AM (Active Call)",
    status: "in-call",
    consultationType: "Cardiology Review",
    chiefComplaint: "Exertional chest tightness & home BP 138/86 mmHg review",
    chronicConditions: ["Essential Hypertension (I10.9)", "Hypercholesterolemia (E78.0)"],
    allergies: ["Penicillin (Severe anaphylaxis)"],
    vitals: {
      bloodPressure: "138/86 mmHg",
      heartRate: 74,
      spo2: 98,
      temperature: "36.7 °C",
      glucose: "5.4 mmol/L",
    },
  },
  {
    id: "tele-2",
    patientId: "pat-3",
    patientName: "David K. Ndlovu",
    patientAge: 64,
    patientGender: "Male",
    patientMrn: "MED-349012",
    scheduledTime: "10:30 AM (In Lobby)",
    status: "waiting",
    consultationType: "Renal Assessment",
    chiefComplaint: "Type 2 DM with CKD Stage 3b & routine renal dosing review",
    chronicConditions: ["Type 2 Diabetes Mellitus", "Chronic Kidney Disease Stage 3b"],
    allergies: ["Sulfa Drugs"],
    vitals: {
      bloodPressure: "142/88 mmHg",
      heartRate: 70,
      spo2: 97,
      temperature: "36.5 °C",
      glucose: "7.2 mmol/L",
    },
  },
  {
    id: "tele-3",
    patientId: "pat-2",
    patientName: "Elena Rostova",
    patientAge: 38,
    patientGender: "Female",
    patientMrn: "MED-102934",
    scheduledTime: "11:15 AM (Scheduled)",
    status: "scheduled",
    consultationType: "General Practice",
    chiefComplaint: "Acute allergic rhinosinusitis and prescription follow-up",
    chronicConditions: ["Allergic Rhinitis (J30.9)"],
    allergies: ["Aspirin/NSAIDs"],
    vitals: {
      bloodPressure: "118/74 mmHg",
      heartRate: 68,
      spo2: 99,
      temperature: "36.8 °C",
    },
  },
];

interface TelemedicineQueueProps {
  activeSessionId: string;
  onSelectSession: (session: TelemedicineConsultation) => void;
}

export const TelemedicineQueue: React.FC<TelemedicineQueueProps> = ({
  activeSessionId,
  onSelectSession,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl border border-teal-100">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Today's Virtual Telemedicine Appointments
            </h3>
            <p className="text-xs text-slate-500">
              Encrypted video consultation queue with verified patient identity
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
          3 Consultations Scheduled
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {MOCK_TELEMEDICINE_QUEUE.map((session) => {
          const isActive = session.id === activeSessionId;
          return (
            <button
              key={session.id}
              type="button"
              onClick={() => onSelectSession(session)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isActive
                  ? "bg-teal-50/80 border-teal-500 shadow-sm ring-2 ring-teal-500/20"
                  : "bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      session.status === "in-call"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : session.status === "waiting"
                        ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {session.status === "in-call" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    )}
                    {session.status === "in-call"
                      ? "Connected Live"
                      : session.status === "waiting"
                      ? "In Waiting Lobby"
                      : "Upcoming"}
                  </span>

                  <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {session.scheduledTime.split("(")[0].trim()}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-slate-900 text-sm">{session.patientName}</h4>
                  <span className="text-xs text-slate-500">
                    ({session.patientAge}y, {session.patientGender})
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-1 mb-2">
                  {session.chiefComplaint}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                <span className="text-teal-700 font-medium">{session.consultationType}</span>
                <span className="font-semibold text-teal-600 flex items-center gap-0.5">
                  {isActive ? "Viewing Session" : "Switch Patient"}
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
