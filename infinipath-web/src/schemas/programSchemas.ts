import * as yup from 'yup';

export const subProgramSchema = yup.object().shape({
  title: yup.string().required("Sub-program title is required"),
  banner: yup.mixed().optional(),
  description: yup.string().min(10, "Description should be at least 10 characters"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup.date().required("End date is required"),
  modeOfProgram: yup.string().oneOf(['online', 'offline', 'hybrid'], "Please select a mode").required(),
  venueAddress: yup.array().of(yup.string()),
  customVenue: yup.string(),
  isTravelRequired: yup.string().oneOf(['yes', 'no']),
  isResidential: yup.string().oneOf(['yes', 'no']),
  isPaymentRequired: yup.string().oneOf(['yes', 'no']),
  currency: yup.string().when('isPaymentRequired', {
    is: 'yes',
    then: yup.string().required('Currency is required')
  }),
  programFee: yup.string().when('isPaymentRequired', {
  is: 'yes',
  then: yup.string().required('Program fee is required')
}),
});

export const programDetailsSchema = yup.object().shape({
  programName: yup.string().required("Program name is required"),
  programBanner: yup.mixed(),
  description: yup.string().min(10, "Description should be at least 10 characters"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup.date()
    .required("End date is required")
    .min(yup.ref('startDate'), "End date must be after start date"),
  modeOfProgram: yup.string().oneOf(['online', 'offline', 'hybrid'], "Please select a mode").required(),
  venueAddress: yup.array().of(yup.string()),
  customVenue: yup.string(),
  isTravelRequired: yup.string().oneOf(['yes', 'no']),
  isResidential: yup.string().oneOf(['yes', 'no']),
  isPaymentRequired: yup.string().oneOf(['yes', 'no']),
  currency: yup.string().when('isPaymentRequired', {
    is: 'yes',
    then: yup.string().required('Currency is required')
  }),
  programFee: yup.string(),
  registrationStartDate: yup.date(),
  registrationStartTime: yup.string(),
  registrationEndDate: yup.date(),
  registrationEndTime: yup.string(),
  approvalRequired: yup.string().oneOf(['yes', 'no']).required(),
  hasSeatLimit: yup.string().oneOf(['yes', 'no']).required(),
  seatLimit: yup.string().when('hasSeatLimit', {
    is: 'yes',
    then: yup.string().required('Seat limit is required')
  }),
  hasWaitlist: yup.string().oneOf(['yes', 'no']).required(),
  waitlistTriggerCount: yup.string().when('hasWaitlist', {
    is: 'yes',
    then: yup.string().required('Waitlist trigger count is required')
  }),
  subPrograms: yup.array().of(subProgramSchema),
});

// Type definitions if needed
export type SubProgramType = yup.InferType<typeof subProgramSchema>;
export type ProgramDetailsType = yup.InferType<typeof programDetailsSchema>;
