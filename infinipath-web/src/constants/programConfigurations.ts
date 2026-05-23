export interface TimeConfig {
  startTime?: string;
  endTime?: string;
  duration?: string;
  checkIn?: boolean;
  checkOut?: boolean;
}

export interface ProgramConfig {
  modeOfOperation: 'Offline' | 'Online' | 'Hybrid';
  onlineProgramType: 'Webinar' | 'Meeting' | 'NA';
  hasPrograms: boolean;
  hasResidence: boolean;
  sessions: 'Single' | 'Multiple Sessions';
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';
  timing: {
    startTime?: string;
    endTime?: string;
    checkIn?: boolean;
    checkOut?: boolean;
    duration?: string;
  };
  isPaymentRequired: boolean;
  isTravelRequired: boolean;
  isAttendanceRequired: boolean;
  allowMinors: boolean;
  allowProxyRegistration: boolean;
}

export const programConfigurations: { [key: string]: ProgramConfig } = {
  'HDB': {
    modeOfOperation: 'Offline',
    onlineProgramType: 'NA',
    hasPrograms: true,
    hasResidence: true,
    sessions: 'Multiple Sessions',
    frequency: 'Yearly',
    timing: {
      checkIn: true,
      checkOut: true
    },
    isPaymentRequired: true,
    isTravelRequired: true,
    isAttendanceRequired: true,
    allowMinors: false,
    allowProxyRegistration: false
  },
  'TAT - Online': {
    modeOfOperation: 'Online',
    onlineProgramType: 'Meeting',
    hasPrograms: true,
    hasResidence: false,
    sessions: 'Multiple Sessions',
    frequency: 'Yearly',
    timing: {
      startTime: '7:00 PM',
      endTime: '9:00 PM',
      duration: '2hrs'
    },
    isPaymentRequired: true,
    isTravelRequired: false,
    isAttendanceRequired: true,
    allowMinors: false,
    allowProxyRegistration: false
  },
  'infinipath': {
    programType: 'infinipath',
    modeOfOperation: 'Hybrid',
    onlineProgramType: 'Webinar',
    hasPrograms: false,
    hasResidence: false,
    sessions: 'Multiple Sessions',
    frequency: 'Weekly',
    timing: {
      startTime: '10:00 AM',
      endTime: '11:15 AM',
      duration: '1hr 15 mins'
    },
    isPaymentRequired: false,
    isTravelRequired: false,
    isAttendanceRequired: true,
    allowMinors: false,
    allowProxyRegistration: false
  },
  'MY Z-AXIS': {
    programType: 'MY Z-AXIS',
    modeOfOperation: 'Hybrid',
    onlineProgramType: 'Meeting',
    hasPrograms: false,
    hasResidence: true,
    sessions: 'Multiple Sessions',
    frequency: 'Weekly',
    timing: {
      startTime: '2:00 PM',
      endTime: '5:00 PM',
      duration: '3 hr'
    },
    isPaymentRequired: true,
    isTravelRequired: true,
    isAttendanceRequired: true,
    allowMinors: false,
    allowProxyRegistration: false
  }
  // ... add other programs similarly
};

// Helper function to get form sections based on program config
export const getFormSectionsForProgram = (programName: string): string[] => {
  const config = programConfigurations[programName];
  if (!config) return ['basicDetails'];

  const sections = ['basicDetails'];
  
  if (config.isTravelRequired) {
    sections.push('travelDetails');
  }
  
  if (config.isPaymentRequired) {
    sections.push('paymentDetails');
  }

  return sections;
};

// Helper function to filter questions based on program config
export const filterQuestionsByProgramConfig = (
  questions: any[],
  programType: string,
  sectionType: string
): any[] => {
  const config = programConfigurations[programType];
  if (!config) return questions;

  return questions.filter(question => {
    // Filter out travel questions if travel not required
    if (sectionType === 'travelDetails' && !config.isTravelRequired) {
      return false;
    }

    // Filter out residence questions if no residence
    if (question.id.includes('residence') && !config.hasResidence) {
      return false;
    }

    // Filter out program-specific questions if no programs
    if (question.id.includes('program') && !config.hasPrograms) {
      return false;
    }

    return true;
  });
};