import React from "react";
import { DoctorProfile } from "../../types";
import { PatientPortal } from "../portal/PatientPortal";

interface PatientPortalModuleProps {
  doctor?: DoctorProfile;
  initialPatientId?: string;
  onNavigate?: (moduleId: string) => void;
}

export const PatientPortalModule: React.FC<PatientPortalModuleProps> = ({
  doctor,
  initialPatientId = "pat-1",
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      <PatientPortal
        initialPatientId={initialPatientId}
        doctor={doctor}
        onNavigateToModule={onNavigate}
      />
    </div>
  );
};
