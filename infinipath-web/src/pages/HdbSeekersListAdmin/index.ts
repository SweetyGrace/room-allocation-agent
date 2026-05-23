export interface SeekerData {
  id: string;
  seekerId: string;
  programId: number;
  seekerName: string;
  location: string;
  profileUrl?: string;
  noOfHdbs: string | number;
  status: string;
  ratingByRm: number;
  rmReview: string;
  travelPlanStatus: string;
  paymentStatus: string;
  gender: string;
  contactNumber: string;
  email: string;
  Age: string | number;
  Dob: string;
  allocatedProgram: string;
  gstNumber?: string;
  paymentMode?: string;
}

export interface KpisDefault {
  seats: Record<string, number>;
  payments: Record<string, number>;
  invoices: Record<string, number>;
  travelAndLogistics: {
    all: number;
    travel: Record<string, number>;
    logistics: Record<string, number>;
  };
}

export interface Kpis {
  mahatria: Record<string, unknown>;
  default: KpisDefault;
}

export interface OverallData {
  data: any[];
  pagination: {
    totalPages: number;
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    numberOfRecords: number;
  };
  kpis: Kpis;
}
 export function calculateAge(dob: string | Date): string {
  if (!dob) return "-";
  const birthDate = typeof dob === "string" ? new Date(dob) : dob;
  if (isNaN(birthDate.getTime())) return "-";
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
}
