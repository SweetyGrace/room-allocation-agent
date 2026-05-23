
import { Control, FieldErrors, UseFormSetValue, UseFormWatch, UseFormGetValues, UseFormTrigger } from "react-hook-form";

export interface ProgramDetailsFormProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  watch: UseFormWatch<any>;
  errors: FieldErrors;
  getValues: UseFormGetValues<any>;
  trigger: UseFormTrigger<any>;
  programType: any;
  uploadedBanner: File | null;
  bannerImageUrl: string | null;
  showCustomVenue: boolean;
  onBannerUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onVenueChange: (value: string[]) => void;
  getCurrencySymbol: (currency: string) => string;
  currencyOptions: Array<{ value: string; label: string; symbol: string }>;
  venueOptions: string[];
  dateRange: [Date | null, Date | null];
  setDateRange: (range: [Date | null, Date | null]) => void;
  onDateChange: (startDate: Date | null, endDate: Date | null) => void;
  registrationDateRange: [Date | null, Date | null];
  setRegistrationDateRange: (range: [Date | null, Date | null]) => void;
  onRegistrationDateChange: (
    startDate: Date | null,
    endDate: Date | null,
  ) => void;
  programTypeNameFromSource?: string;
  isPublished?: boolean;
}

export type ImageData = {
  dataUrl: string | null;
  name: string | null;
};
