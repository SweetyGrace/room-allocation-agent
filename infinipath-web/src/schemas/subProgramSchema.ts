import * as yup from 'yup';

export const subProgramSchema = yup.object().shape({
  title: yup.string().required("Session name is required"),
  description: yup.string(),
  modeOfProgram: yup.string()
    .oneOf(['online', 'offline', 'hybrid'])
    .required("Mode of program is required"),
  startDate: yup.date()
    .required("Start date is required")
    .nullable(),
 endDate: yup.date().required("End date is required"),
  venueAddress: yup.array().when('modeOfProgram', {
    is: (mode) => mode === 'offline' || mode === 'hybrid',
    then: yup.array().min(1, "At least one venue is required")
  }),
  seatLimit: yup.string().when('hasSeatLimit', {
    is: 'yes',
    then: yup.string().required("Seat limit is required")
  }),
  waitlistTriggerCount: yup.string().when('hasWaitlist', {
    is: 'yes',
    then: yup.string().required("Waitlist trigger count is required")
  }),
  programFee: yup.string().when('isPaymentRequired', {
    is: 'yes',
    then: yup.string().required("Program fee is required")
  }),
  currency: yup.string().when('isPaymentRequired', {
    is: 'yes',
    then: yup.string().required("Currency is required")
  })
});