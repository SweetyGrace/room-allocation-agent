import * as yup from 'yup';

export const programBasicsSchema = yup.object().shape({
  programName: yup
    .string()
    .required('Program name is required')
    .trim()
    .min(3, 'Program name must be at least 3 characters'),
  
  modeOfOperation: yup
    .string()
    .required('Mode of operation is required')
    .oneOf(['online', 'offline', 'hybrid'], 'Invalid mode of operation'),
  
  isPaymentRequired: yup.boolean(),
  
  paymentConfig: yup.object().when('isPaymentRequired', {
    is: true,
    then: (schema) => schema.shape({
      basePrice: yup
        .string()
        .when([], {
          is: () => true,
          then: (schema) => schema.test('base-price-required', 'Price is required', function(value) {
            const selectedProgramType = this.options.context?.selectedProgramType;
            if (selectedProgramType?.name === 'HDB/MSD') {
              return true; // Not required for HDB/MSD
            }
            return !!value; // Required for other program types
          })
        }),
      
      combinedPrice1: yup
        .string()
        .when([], {
          is: () => true,
          then: (schema) => schema.test('combined-price1-required', 'First price is required', function(value) {
            const selectedProgramType = this.options.context?.selectedProgramType;
            if (selectedProgramType?.name === 'HDB/MSD') {
              return !!value; // Required for HDB/MSD
            }
            return true; // Not required for other program types
          })
        }),
      
      combinedPrice2: yup
        .string()
        .when([], {
          is: () => true,
          then: (schema) => schema.test('combined-price2-required', 'Second price is required', function(value) {
            const selectedProgramType = this.options.context?.selectedProgramType;
            if (selectedProgramType?.name === 'HDB/MSD') {
              return !!value; // Required for HDB/MSD
            }
            return true; // Not required for other program types
          })
        }),
      
      gstPercentage: yup
        .number()
        .min(0, 'GST percentage must be 0 or greater')
        .max(100, 'GST percentage cannot exceed 100'),
      
      currency: yup.string().required('Currency is required')
    }),
    otherwise: (schema) => schema.notRequired()
  }),
  
  registrationSettings: yup.object().shape({
    startDate: yup
      .string()
      .required('Registration start date is required'),
    
    startTime: yup
      .string()
      .required('Registration start time is required'),
    
    endDate: yup
      .string()
      .required('Registration end date is required')
      .test('is-after-start', 'End date must be after start date', function(value) {
        const { startDate } = this.parent;
        if (!startDate || !value) return true;
        return new Date(value) >= new Date(startDate);
      }),
    
    endTime: yup
      .string()
      .required('Registration end time is required'),
    
    requiresApproval: yup.boolean(),
    hasSeatsLimit: yup.boolean(),
    hasWaitlist: yup.boolean(),
    
    maxSeats: yup
      .string()
      .when('hasSeatsLimit', {
        is: true,
        then: (schema) => schema.required('Maximum seats is required'),
        otherwise: (schema) => schema.notRequired()
      }),
    
    waitlistTriggerCount: yup
      .string()
      .when('hasWaitlist', {
        is: true,
        then: (schema) => schema.required('Waitlist trigger count is required'),
        otherwise: (schema) => schema.notRequired()
      }),
    
    venue: yup
      .string()
      .when([], {
        is: () => true,
        then: (schema) => schema.test('venue-required', 'Venue is required for offline programs', function(value) {
          const modeOfOperation = this.options.context?.modeOfOperation;
          if (modeOfOperation === 'offline') {
            return !!value?.trim(); // Required and not empty for offline programs
          }
          return true; // Not required for other modes
        })
      })
  })
});

export const sessionScheduleSchema = yup.object().shape({
  sessionsSchedule: yup.array().of(
    yup.object().shape({
      checkinTime: yup
        .string()
        .when([], {
          is: () => true,
          then: (schema) => schema.test('checkin-time-required', 'Check-in time is required', function(value) {
            const modeOfOperation = this.options.context?.modeOfOperation;
            if (modeOfOperation === 'offline') {
              return !!value; // Required for offline
            }
            return true; // Not required for online/hybrid
          })
        }),
      
      checkoutTime: yup
        .string()
        .when([], {
          is: () => true,
          then: (schema) => schema.test('checkout-time-required', 'Check-out time is required', function(value) {
            const modeOfOperation = this.options.context?.modeOfOperation;
            if (modeOfOperation === 'offline') {
              return !!value; // Required for offline
            }
            return true; // Not required for online/hybrid
          })
        })
    })
  )
});