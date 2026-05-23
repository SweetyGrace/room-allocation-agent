import { SubProgram, CurrencyOption } from "../types/program";
import { getCall } from "../services/apiService";
import { endPoints, PORTAL } from "../constants/urlConstants";

export const venueOptions = [
  "Leonia Holistic Destination, Bommarasipet, Shamirpet Mandal, Medchal-Malkajgiri District, Hyderabad - 500078.",
];

export const currencyOptions: CurrencyOption[] = [
  { value: "INR", label: "INR (₹)", symbol: "₹" },
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (€)", symbol: "€" },
  { value: "GBP", label: "GBP (£)", symbol: "£" },
  { value: "SGD", label: "SGD (S$)", symbol: "S$" },
];

export const getCurrencySymbol = (currency: string) => {
  return currencyOptions.find((c) => c.value === currency)?.symbol || "₹";
};

export const getInitialSubPrograms = (): SubProgram[] => [
  {
    id: "1",
    title: "HDB 1",
    description: "",
    modeOfProgram: "online",
    venueAddress: [],
    customVenue: "",
    isPaymentRequired: "yes",
    currency: "INR",
    programFee: "",
    showCustomVenue: false,
  },
  {
    id: "2",
    title: "HDB 2",
    description: "",
    modeOfProgram: "online",
    venueAddress: [],
    customVenue: "",
    isPaymentRequired: "yes",
    currency: "INR",
    programFee: "",
    showCustomVenue: false,
  },
  {
    id: "3",
    title: "HDB 3",
    description: "",
    modeOfProgram: "online",
    venueAddress: [],
    customVenue: "",
    isPaymentRequired: "yes",
    currency: "INR",
    programFee: "",
    showCustomVenue: false,
  },
  {
    id: "4",
    title: "MSD 1",
    description: "",
    modeOfProgram: "online",
    venueAddress: [],
    customVenue: "",
    isPaymentRequired: "yes",
    currency: "INR",
    programFee: "",
    showCustomVenue: false,
  },
  {
    id: "5",
    title: "MSD 2",
    description: "",
    modeOfProgram: "online",
    venueAddress: [],
    customVenue: "",
    isPaymentRequired: "yes",
    currency: "INR",
    programFee: "",
    showCustomVenue: false,
  },
];

export const prefillSubProgramFields = (
  subProgram: SubProgram,
  programDescription: string,
  uploadedBanner: File | null,
  modeOfProgram: "online" | "offline" | "hybrid",
  selectedCurrency: string,
  isPaymentRequired: "yes" | "no",
): SubProgram => {
  return {
    ...subProgram,
    description: subProgram.description || programDescription || "",
    banner: subProgram.banner || uploadedBanner,
    modeOfProgram: subProgram.modeOfProgram || modeOfProgram || "online",
    currency: subProgram.currency || selectedCurrency || "INR",
    isPaymentRequired:
      subProgram.isPaymentRequired || isPaymentRequired || "yes",
  };
};

export const calculateAge = (dob: string): number => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Fetches program templates for a given program type
 * @param programTypeId - The ID of the program type
 * @returns Promise with templates array or empty array on error
 */
export const fetchProgramTemplates = async (programTypeId: string) => {
  try {
    const response = await getCall(
      endPoints.programTemplates(programTypeId),
      undefined,
      PORTAL
    );
    return response?.data?.data || [];
  } catch (error) {
    console.error("Error fetching program templates:", error);
    return [];
  }
};

/**
 * Fetches workflow ID for a given program type key
 * @param programTypeKey - The key of the program type (e.g., "PT_HDBMSD")
 * @returns Promise with workflowId or null on error
 */
export const fetchWorkflowId = async (programTypeKey: string): Promise<number | null> => {
  try {
    const response = await getCall(
      endPoints.workflowByProgramType(programTypeKey),
      undefined,
      PORTAL
    );
    return response?.data?.data?.workflowId || null;
  } catch (error) {
    console.error("Error fetching workflow ID:", error);
    return null;
  }
};