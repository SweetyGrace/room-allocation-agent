// Form values interface for Add Program Page
export interface AddProgramFormValues {
  programName: string;
  programCode: string;
  description?: string;
  banner?: string | null;
  bannerImageUrl?: string | null;
  bannerAnimationUrl?: string | null;
  modeOfProgram: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  startTime?: Date | string | null;
  endTime?: Date | string | null;
  registrationStartDate?: Date | string | null;
  registrationStartTime?: Date | string | null;
  registrationEndDate?: Date | string | null;
  registrationEndTime?: Date | string | null;
  isResendential?: string;
  venueAddress?: string[];
  totalBedCount?: number;
  hasSeatLimit?: string;
  seatLimit?: number;
  hasWaitlist?: string;
  waitlistTriggerCount?: number;
  approvalRequired?: string;
  currency: string;
  isPaymentRequired?: string;
  programFee?: string;
  hdbFee?: string;
  msdFee?: string;
  childMinAge?: number;
  elderMaxAge?: number;
  helpLineNumber?: string;
  emailSenderName?: string;
  emailSenderAddress?: string;
  emailBccName?: string;
  emailBccAddress?: string;
  venueNameInEmail?: string;
  tdsLimit?: number;
  tdsApplicableTo?: string;
  cgstLimit?: number;
  sgstLimit?: number;
  igstLimit?: number;
  nameInInvoice: string;
  address: string;
  pan?: string;
  gstin?: string;
  cin?: string;
  subPrograms?: SubProgramFormValues[];
  [key: string]: any;
}

// Sub-program form values
export interface SubProgramFormValues {
  title?: string;
  description?: string;
  programStartDate?: Date | string | null;
  programEndDate?: Date | string | null;
  programStartTime?: Date | string | null;
  programEndTime?: Date | string | null;
  modeOfProgram?: string;
  venueAddress?: string[];
  hasSeatLimit?: string;
  seatLimit?: number;
  hasWaitlist?: string;
  waitlistTriggerCount?: number;
  checkInStartDate?: Date | string | null;
  checkInEndDate?: Date | string | null;
  checkOutStartDate?: Date | string | null;
  checkOutEndDate?: Date | string | null;
  [key: string]: any;
}

// Program Type Data structure
export interface ProgramTypeData {
  name?: string;
  description?: string;
  modeOfOperation?: string;
  requiresPayment?: boolean;
  basePrice?: number;
  meta?: {
    price?: Array<{ HDB?: number; MSD?: number }>;
  };
  gstPercentage?: number;
  maxCapacity?: number;
  waitlistApplicable?: boolean;
  waitlistTriggerCount?: number;
  requiresApproval?: boolean;
  defaultStartTime?: string;
  defaultEndTime?: string;
  startsAt?: string;
  endsAt?: string;
  requiresResidence?: boolean;
  venue?: string;
  bannerImageUrl?: string;
  helplineNumber?: string;
  emailSenderName?: string;
  emailSenderAddress?: string;
  emailBccName?: string;
  emailBccAddress?: string;
  venueNameInEmails?: string;
  tdsPercent?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  tdsApplicability?: string;
  invoiceSenderName?: string;
  invoiceSenderPan?: string;
  gstNumber?: string;
  invoiceSenderCin?: string;
  invoiceSenderAddress?: string;
  registrationStartsAt?: string;
  registrationEndsAt?: string;
  childMinAge?: number;
  elderMaxAge?: number;
  hasMultipleSessions?: boolean;
  groupedPrograms?: any;
}
