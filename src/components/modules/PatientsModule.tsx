import React, { useState } from "react";
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  Calendar, 
  Eye, 
  AlertTriangle,
  FileText,
  Activity,
  ChevronRight,
  Pill,
  Clock,
  List,
  HeartPulse
} from "lucide-react";
import { Patient, ModuleId } from "../../types";
import { MOCK_PATIENTS } from "../../data/patients";
import { PatientQuickPreviewModal } from "../patient/PatientQuickPreviewModal";
import { PatientMedicalTimeline } from "../patient/PatientMedicalTimeline";

interface PatientsModuleProps {
  onNavigate?: (module: ModuleId, patient?: Patient) => void;
}

export const PatientsModule: React.FC<PatientsModuleProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "timeline">("table");

  const filteredPatients = MOCK_PATIENTS.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.mrn.toLowerCase().includes(q) ||
      p.nationalId.toLowerCase().includes(q) ||
      p.phone.includes(q) ||
      p.medicalAid.scheme.toLowerCase().includes(q) ||
      p.chronicConditions.some((c) => c.toLowerCase().includes(q))
    );
  });

  const handleOpenPreview = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPreviewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900">Patient Health Vault</h2>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
              AES-256 Envelope Encrypted
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compliant patient demographics, encrypted identity credentials, and linked clinical encounters.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* View Switcher: Table vs Medical Timeline */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Directory</span>
            </button>
            <button
              onClick={() => {
                if (!selectedPatient && filteredPatients.length > 0) {
                  setSelectedPatient(filteredPatients[0]);
                }
                setViewMode("timeline");
              }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === "timeline"
                  ? "bg-white text-teal-700 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              <span>Medical Timeline</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-teal-100 text-teal-800">
                Recharts
              </span>
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name, MRN, or ID..."
              className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 w-full sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* Conditional View: Timeline vs Table */}
      {viewMode === "timeline" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <span className="font-semibold text-slate-700">Displaying Longitudinal Care Timeline for:</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                {selectedPatient ? selectedPatient.name : filteredPatients[0]?.name}
              </span>
            </div>
            <button
              onClick={() => setViewMode("table")}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>Back to Directory Table</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <PatientMedicalTimeline
            patient={selectedPatient || filteredPatients[0]}
            onSelectPatient={(p) => setSelectedPatient(p)}
            onNavigateToModule={onNavigate}
          />
        </div>
      ) : (
        /* Patients Table */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Patient Name & MRN</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Medical Aid & Scheme</th>
                  <th className="py-3 px-4">Clinical Profile & Vitals</th>
                  <th className="py-3 px-4">Last Encounter</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No matching patient records found in Health Vault.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr 
                      key={p.id} 
                      className="hover:bg-teal-50/40 transition-colors cursor-pointer"
                      onClick={() => handleOpenPreview(p)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200">
                            {p.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-900 block">{p.name}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                              <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-700">{p.mrn}</span>
                              <span>•</span>
                              <span>{p.age}y • {p.gender}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{p.phone}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{p.email}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-800 block">{p.medicalAid.scheme}</span>
                        <div className="text-[10px] text-teal-700 font-mono flex items-center gap-1 mt-0.5">
                          <span>{p.medicalAid.membershipNumber}</span>
                          <span className="text-slate-400">({p.medicalAid.plan})</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                            {p.chronicConditions[0] || "General Health"}
                          </span>
                          {p.allergies.length > 0 && (
                            <span className="text-[10px] text-rose-700 font-medium flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{p.allergies[0].split("(")[0]}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {p.lastEncounterDate}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => {
                              setSelectedPatient(p);
                              setViewMode("timeline");
                            }}
                            title="Open Recharts Medical Timeline"
                            className="px-2.5 py-1 text-xs font-semibold text-teal-800 bg-teal-100/80 border border-teal-300 rounded-lg hover:bg-teal-200 flex items-center gap-1 transition-colors"
                          >
                            <Clock className="w-3 h-3 text-teal-700" />
                            <span>Timeline</span>
                          </button>

                          <button 
                            onClick={() => handleOpenPreview(p)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-lg hover:bg-slate-200 flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Quick Preview</span>
                          </button>

                          <button 
                            onClick={() => onNavigate?.("portal", p)}
                            title="Open Read-Only Patient Portal"
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
                          >
                            <HeartPulse className="w-3 h-3 text-blue-600" />
                            <span>Portal</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Quick Preview Modal */}
      <PatientQuickPreviewModal
        patient={selectedPatient}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onNavigateToModule={onNavigate}
      />
    </div>
  );
};
