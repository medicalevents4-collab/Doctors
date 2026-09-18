import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  User, 
  Phone, 
  Calendar, 
  Activity, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight,
  ArrowUpDown,
  CornerDownLeft
} from "lucide-react";
import { Patient, ModuleId } from "../../types";
import { MOCK_PATIENTS } from "../../data/patients";
import { PatientQuickPreviewModal } from "../patient/PatientQuickPreviewModal";

interface GlobalPatientSearchProps {
  onNavigateToModule?: (module: ModuleId, patient?: Patient) => void;
}

export const GlobalPatientSearch: React.FC<GlobalPatientSearchProps> = ({
  onNavigateToModule,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut (⌘K or Ctrl+K or '/')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setIsMobileSearchOpen(true);
        setTimeout(() => {
          inputRef.current?.focus();
          mobileInputRef.current?.focus();
        }, 50);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        setIsMobileSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter patients based on query
  const filteredPatients = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return MOCK_PATIENTS; // Show all / recent when empty
    }

    return MOCK_PATIENTS.filter((patient) => {
      const matchName = patient.name.toLowerCase().includes(q);
      const matchMrn = patient.mrn.toLowerCase().includes(q);
      const matchNationalId = patient.nationalId.toLowerCase().includes(q);
      const matchPhone = patient.phone.toLowerCase().replace(/\s+/g, "").includes(q.replace(/\s+/g, ""));
      const matchScheme = patient.medicalAid.scheme.toLowerCase().includes(q) || patient.medicalAid.membershipNumber.toLowerCase().includes(q);
      const matchChronic = patient.chronicConditions.some((c) => c.toLowerCase().includes(q));
      const matchDiagnosis = patient.recentConsultations.some((c) => 
        c.diagnosis.toLowerCase().includes(q) || c.icd10Code.toLowerCase().includes(q)
      );

      return matchName || matchMrn || matchNationalId || matchPhone || matchScheme || matchChronic || matchDiagnosis;
    });
  }, [query]);

  // Handle keyboard navigation in dropdown
  const handleKeyDownInInput = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      setIsOpen(true);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % Math.max(1, filteredPatients.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + filteredPatients.length) % Math.max(1, filteredPatients.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredPatients[highlightedIndex]) {
        handleSelectPatient(filteredPatients[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setIsMobileSearchOpen(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsPreviewOpen(true);
    setIsOpen(false);
    setIsMobileSearchOpen(false);
  };

  return (
    <>
      {/* Desktop Search Bar */}
      <div ref={containerRef} className="relative hidden md:block w-72 lg:w-80">
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          
          <input
            ref={inputRef}
            type="text"
            id="global-patient-search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setHighlightedIndex(0);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDownInInput}
            placeholder="Search patient, ID, MRN, ICD-10..."
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs"
            role="combobox"
            aria-expanded={isOpen}
            aria-autocomplete="list"
          />

          <div className="absolute right-2 flex items-center gap-1">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="p-0.5 text-slate-400 hover:text-slate-600 rounded"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-200/70 rounded border border-slate-300/60 pointer-events-none">
                <span>⌘</span>K
              </kbd>
            )}
          </div>
        </div>

        {/* Dropdown Results Box */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
            {/* Dropdown Header */}
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span className="font-semibold text-slate-700">
                {query ? `Search Results (${filteredPatients.length})` : "Recent Patient Records"}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-400">
                <ArrowUpDown className="w-3 h-3" /> Navigate <CornerDownLeft className="w-2.5 h-2.5 ml-1" /> Select
              </span>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 py-1">
              {filteredPatients.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800">No matching patient found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    No records matched &quot;{query}&quot;. Verify the name, National ID, or MRN.
                  </p>
                </div>
              ) : (
                filteredPatients.map((patient, index) => {
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <button
                      key={patient.id}
                      type="button"
                      onClick={() => handleSelectPatient(patient)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full px-3.5 py-2.5 text-left transition-colors flex items-center justify-between gap-3 ${
                        isHighlighted ? "bg-teal-50/70" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0 border border-teal-200">
                          {patient.name.split(" ").map((n) => n[0]).join("")}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {patient.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              {patient.mrn}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 truncate">
                            <span>{patient.age}y • {patient.gender}</span>
                            <span>•</span>
                            <span className="text-slate-600 truncate">{patient.chronicConditions[0] || "General Patient"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-medium text-slate-400 block">
                          {patient.lastEncounterDate}
                        </span>
                        <span className="text-[10px] text-teal-600 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                          <span>Preview</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick Helper Footer */}
            <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Instant encrypted clinical lookup</span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToModule?.("patients");
                }}
                className="text-teal-700 font-semibold hover:underline"
              >
                Open Health Vault →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Button */}
      <button
        id="btn-mobile-search-toggle"
        onClick={() => {
          setIsMobileSearchOpen(true);
          setTimeout(() => mobileInputRef.current?.focus(), 100);
        }}
        className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        title="Search patients"
        aria-label="Search patients"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Mobile Search Overlay Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex flex-col justify-start">
          <div className="bg-white border-b border-slate-200 p-3 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search patient name, ID, phone..."
                  className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:bg-white"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white p-2 divide-y divide-slate-100">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                className="w-full p-3 text-left hover:bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {patient.mrn}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {patient.age}y • {patient.gender} • {patient.chronicConditions[0] || "General"}
                  </div>
                  <div className="text-[11px] text-teal-600 font-medium mt-1">
                    Phone: {patient.phone}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Patient Quick Preview Modal */}
      <PatientQuickPreviewModal
        patient={selectedPatient}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onNavigateToModule={onNavigateToModule}
      />
    </>
  );
};
